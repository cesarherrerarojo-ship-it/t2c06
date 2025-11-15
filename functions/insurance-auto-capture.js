// ============================================================================
// SCHEDULED FUNCTION: Auto-capturar seguros antes de expirar (29 días)
// ============================================================================
// Ejecuta diariamente a las 02:00 AM (hora del servidor)
// Busca autorizaciones que expiran en 1-2 días y las captura automáticamente
// ============================================================================

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const axios = require('axios');

// Si admin ya está inicializado en index.js, comentar esta línea
// admin.initializeApp();

/**
 * Obtener Access Token de PayPal
 */
async function getPayPalAccessToken() {
  const clientId = functions.config().paypal?.client_id || process.env.PAYPAL_CLIENT_ID;
  const secret = functions.config().paypal?.secret || process.env.PAYPAL_SECRET;
  const mode = functions.config().paypal?.mode || process.env.PAYPAL_MODE || 'sandbox';

  const baseURL = mode === 'live'
    ? 'https://api.paypal.com'
    : 'https://api.sandbox.paypal.com';

  const auth = Buffer.from(`${clientId}:${secret}`).toString('base64');

  const response = await axios.post(
    `${baseURL}/v1/oauth2/token`,
    'grant_type=client_credentials',
    {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }
  );

  return response.data.access_token;
}

/**
 * Capturar autorización de PayPal
 */
async function capturePayPalAuthorization(authorizationId, accessToken) {
  const mode = functions.config().paypal?.mode || process.env.PAYPAL_MODE || 'sandbox';
  const baseURL = mode === 'live'
    ? 'https://api.paypal.com'
    : 'https://api.sandbox.paypal.com';

  try {
    const response = await axios.post(
      `${baseURL}/v2/payments/authorizations/${authorizationId}/capture`,
      {
        // Capturar el monto completo
        // PayPal permite capturar hasta 115% del monto original
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error(`[capturePayPalAuthorization] Error capturing ${authorizationId}:`, error.response?.data || error.message);
    throw error;
  }
}

/**
 * Obtener estado de autorización
 */
async function getAuthorizationStatus(authorizationId, accessToken) {
  const mode = functions.config().paypal?.mode || process.env.PAYPAL_MODE || 'sandbox';
  const baseURL = mode === 'live'
    ? 'https://api.paypal.com'
    : 'https://api.sandbox.paypal.com';

  try {
    const response = await axios.get(
      `${baseURL}/v2/payments/authorizations/${authorizationId}`,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error(`[getAuthorizationStatus] Error getting status for ${authorizationId}:`, error.response?.data || error.message);
    return null;
  }
}

/**
 * Calcular impuestos españoles (IVA 21%)
 */
function calculateTaxBreakdown(amount) {
  const IVA_RATE = 0.21; // 21% IVA en España

  const baseAmount = amount / (1 + IVA_RATE);
  const taxAmount = amount - baseAmount;

  return {
    totalAmount: amount,
    baseAmount: parseFloat(baseAmount.toFixed(2)),
    taxAmount: parseFloat(taxAmount.toFixed(2)),
    taxRate: IVA_RATE,
    taxPercentage: '21%',
    currency: 'EUR'
  };
}

/**
 * SCHEDULED FUNCTION: Auto-capturar seguros antes de que expiren
 * Cron: Todos los días a las 02:00 AM
 * Timezone: Europe/Madrid
 */
exports.autoCaptureExpiringInsurance = functions
  .region('europe-west1') // Región europea
  .pubsub
  .schedule('0 2 * * *') // Cron: 2:00 AM diariamente
  .timeZone('Europe/Madrid')
  .onRun(async (context) => {
    console.log('[autoCaptureExpiringInsurance] ===== INICIO =====');
    console.log('[autoCaptureExpiringInsurance] Timestamp:', new Date().toISOString());

    const db = admin.firestore();

    try {
      // 1. Obtener access token de PayPal
      const accessToken = await getPayPalAccessToken();
      console.log('[autoCaptureExpiringInsurance] Access token obtenido');

      // 2. Buscar usuarios con seguro autorizado (no capturado, no liberado)
      const usersSnapshot = await db.collection('users')
        .where('hasAntiGhostingInsurance', '==', true)
        .where('insuranceStatus', '==', 'authorized')
        .get();

      console.log(`[autoCaptureExpiringInsurance] Usuarios con seguro autorizado: ${usersSnapshot.size}`);

      if (usersSnapshot.empty) {
        console.log('[autoCaptureExpiringInsurance] No hay seguros autorizados. Finalizando.');
        return null;
      }

      let capturedCount = 0;
      let errorCount = 0;
      let skippedCount = 0;

      // 3. Procesar cada usuario
      for (const userDoc of usersSnapshot.docs) {
        const userId = userDoc.id;
        const userData = userDoc.data();
        const authorizationId = userData.insuranceAuthorizationId;

        if (!authorizationId) {
          console.warn(`[autoCaptureExpiringInsurance] Usuario ${userId} sin authorizationId. Saltando.`);
          skippedCount++;
          continue;
        }

        try {
          // 4. Obtener estado de la autorización desde PayPal
          const authStatus = await getAuthorizationStatus(authorizationId, accessToken);

          if (!authStatus) {
            console.warn(`[autoCaptureExpiringInsurance] No se pudo obtener estado de ${authorizationId}. Saltando.`);
            skippedCount++;
            continue;
          }

          // 5. Verificar si está próxima a expirar
          const createTime = new Date(authStatus.create_time);
          const expirationTime = new Date(authStatus.expiration_time);
          const now = new Date();

          const daysUntilExpiration = Math.floor((expirationTime - now) / (1000 * 60 * 60 * 24));

          console.log(`[autoCaptureExpiringInsurance] Usuario ${userId}:`);
          console.log(`  - Authorization ID: ${authorizationId}`);
          console.log(`  - Estado: ${authStatus.status}`);
          console.log(`  - Creado: ${createTime.toISOString()}`);
          console.log(`  - Expira: ${expirationTime.toISOString()}`);
          console.log(`  - Días hasta expiración: ${daysUntilExpiration}`);

          // Solo capturar si faltan 1-2 días para expirar
          if (daysUntilExpiration > 2) {
            console.log(`[autoCaptureExpiringInsurance] Todavía quedan ${daysUntilExpiration} días. No capturando aún.`);
            skippedCount++;
            continue;
          }

          // 6. Verificar que el estado sea CREATED (puede capturarse)
          if (authStatus.status !== 'CREATED') {
            console.warn(`[autoCaptureExpiringInsurance] Estado no es CREATED (es ${authStatus.status}). Saltando.`);

            // Actualizar Firestore si ya está capturado/liberado
            if (authStatus.status === 'CAPTURED' || authStatus.status === 'VOIDED') {
              await db.collection('users').doc(userId).update({
                insuranceStatus: authStatus.status.toLowerCase(),
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
              });
            }

            skippedCount++;
            continue;
          }

          // 7. CAPTURAR la autorización (cobrar €120)
          console.log(`[autoCaptureExpiringInsurance] 🔥 CAPTURANDO autorización ${authorizationId} (expira en ${daysUntilExpiration} días)`);

          const captureResult = await capturePayPalAuthorization(authorizationId, accessToken);

          console.log(`[autoCaptureExpiringInsurance] ✅ Captura exitosa: ${captureResult.id}`);

          // 8. Calcular desglose de impuestos
          const amount = parseFloat(captureResult.amount.value);
          const taxBreakdown = calculateTaxBreakdown(amount);

          console.log(`[autoCaptureExpiringInsurance] Desglose fiscal:`, taxBreakdown);

          // 9. Actualizar Firestore
          await db.collection('users').doc(userId).update({
            insuranceStatus: 'captured',
            insuranceCaptureId: captureResult.id,
            insuranceCaptureDate: admin.firestore.FieldValue.serverTimestamp(),
            insuranceCaptureReason: 'auto_expiration',
            insuranceCaptureTaxBreakdown: taxBreakdown,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          });

          // 10. Registrar en colección de capturas
          await db.collection('insurance_captures').add({
            userId: userId,
            authorizationId: authorizationId,
            captureId: captureResult.id,
            amount: amount,
            currency: captureResult.amount.currency_code,
            status: captureResult.status,
            reason: 'auto_expiration',
            captureType: 'automatic',
            daysBeforeExpiration: daysUntilExpiration,
            taxBreakdown: taxBreakdown,
            capturedAt: admin.firestore.FieldValue.serverTimestamp(),
            paypalResponse: captureResult
          });

          // 11. Registrar en colección de ingresos fiscales
          await db.collection('fiscal_records').add({
            type: 'insurance_capture',
            userId: userId,
            captureId: captureResult.id,
            totalAmount: taxBreakdown.totalAmount,
            baseAmount: taxBreakdown.baseAmount,
            taxAmount: taxBreakdown.taxAmount,
            taxRate: taxBreakdown.taxRate,
            taxType: 'IVA',
            currency: 'EUR',
            reason: 'Seguro anti-plantón expirado',
            fiscalYear: new Date().getFullYear(),
            fiscalQuarter: Math.ceil((new Date().getMonth() + 1) / 3),
            createdAt: admin.firestore.FieldValue.serverTimestamp()
          });

          capturedCount++;

          // Delay para no saturar PayPal API
          await new Promise(resolve => setTimeout(resolve, 1000));

        } catch (error) {
          console.error(`[autoCaptureExpiringInsurance] ❌ Error procesando usuario ${userId}:`, error);

          // Registrar error en Firestore
          await db.collection('insurance_capture_errors').add({
            userId: userId,
            authorizationId: authorizationId,
            error: error.message,
            errorDetails: error.response?.data || null,
            timestamp: admin.firestore.FieldValue.serverTimestamp()
          });

          errorCount++;
        }
      }

      // 12. Resumen final
      console.log('[autoCaptureExpiringInsurance] ===== RESUMEN =====');
      console.log(`  Total usuarios procesados: ${usersSnapshot.size}`);
      console.log(`  ✅ Capturas exitosas: ${capturedCount}`);
      console.log(`  ⏭️  Saltados (no expiran aún): ${skippedCount}`);
      console.log(`  ❌ Errores: ${errorCount}`);
      console.log('[autoCaptureExpiringInsurance] ===== FIN =====');

      return {
        success: true,
        processed: usersSnapshot.size,
        captured: capturedCount,
        skipped: skippedCount,
        errors: errorCount
      };

    } catch (error) {
      console.error('[autoCaptureExpiringInsurance] ❌ Error fatal:', error);
      throw error;
    }
  });

/**
 * CALLABLE FUNCTION: Captura manual de seguro (admin o automática)
 * Permite capturar manualmente desde el dashboard de admin
 */
exports.manualCaptureInsurance = functions.https.onCall(async (data, context) => {
  // Verificar autenticación
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated');
  }

  // Verificar que sea admin
  const token = context.auth.token;
  if (token.role !== 'admin') {
    throw new functions.https.HttpsError('permission-denied', 'Admin access required');
  }

  const { userId, reason } = data;

  if (!userId) {
    throw new functions.https.HttpsError('invalid-argument', 'userId is required');
  }

  const db = admin.firestore();

  try {
    // Obtener datos del usuario
    const userDoc = await db.collection('users').doc(userId).get();

    if (!userDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'User not found');
    }

    const userData = userDoc.data();
    const authorizationId = userData.insuranceAuthorizationId;

    if (!authorizationId) {
      throw new functions.https.HttpsError('not-found', 'No authorization ID found');
    }

    if (userData.insuranceStatus !== 'authorized') {
      throw new functions.https.HttpsError('failed-precondition', `Insurance already ${userData.insuranceStatus}`);
    }

    // Capturar
    const accessToken = await getPayPalAccessToken();
    const captureResult = await capturePayPalAuthorization(authorizationId, accessToken);

    // Calcular impuestos
    const amount = parseFloat(captureResult.amount.value);
    const taxBreakdown = calculateTaxBreakdown(amount);

    // Actualizar Firestore
    await db.collection('users').doc(userId).update({
      insuranceStatus: 'captured',
      insuranceCaptureId: captureResult.id,
      insuranceCaptureDate: admin.firestore.FieldValue.serverTimestamp(),
      insuranceCaptureReason: reason || 'manual_admin',
      insuranceCaptureTaxBreakdown: taxBreakdown,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Registrar captura
    await db.collection('insurance_captures').add({
      userId: userId,
      authorizationId: authorizationId,
      captureId: captureResult.id,
      amount: amount,
      currency: captureResult.amount.currency_code,
      status: captureResult.status,
      reason: reason || 'manual_admin',
      captureType: 'manual',
      capturedBy: context.auth.uid,
      taxBreakdown: taxBreakdown,
      capturedAt: admin.firestore.FieldValue.serverTimestamp(),
      paypalResponse: captureResult
    });

    // Registrar fiscalmente
    await db.collection('fiscal_records').add({
      type: 'insurance_capture',
      userId: userId,
      captureId: captureResult.id,
      totalAmount: taxBreakdown.totalAmount,
      baseAmount: taxBreakdown.baseAmount,
      taxAmount: taxBreakdown.taxAmount,
      taxRate: taxBreakdown.taxRate,
      taxType: 'IVA',
      currency: 'EUR',
      reason: reason || 'Captura manual por administrador',
      fiscalYear: new Date().getFullYear(),
      fiscalQuarter: Math.ceil((new Date().getMonth() + 1) / 3),
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return {
      success: true,
      captureId: captureResult.id,
      amount: amount,
      taxBreakdown: taxBreakdown,
      status: captureResult.status
    };

  } catch (error) {
    console.error('[manualCaptureInsurance] Error:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

module.exports = {
  autoCaptureExpiringInsurance: exports.autoCaptureExpiringInsurance,
  manualCaptureInsurance: exports.manualCaptureInsurance
};
