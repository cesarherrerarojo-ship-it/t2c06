// ============================================================================
// INSURANCE PENALTIES SYSTEM - TuCitaSegura
// ============================================================================
// Sistema de penalizaciones progresivas por cancelación de citas
// Y re-autorización automática cada 25 días
// ============================================================================

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const axios = require('axios');

/**
 * Tabla de Penalizaciones
 */
const PENALTIES = {
  MORE_THAN_48H: 0,      // >48h antes: Sin penalización
  BETWEEN_24_48H: 30,    // 24-48h: €30
  LESS_THAN_24H: 60,     // <24h: €60
  NO_SHOW: 120           // No aparece: €120 completo
};

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

  return {
    token: response.data.access_token,
    baseURL: baseURL
  };
}

/**
 * Capturar autorización de PayPal (parcial o total)
 */
async function capturePayPalAuthorization(authorizationId, amount, accessToken, baseURL) {
  try {
    const response = await axios.post(
      `${baseURL}/v2/payments/authorizations/${authorizationId}/capture`,
      {
        amount: {
          value: amount.toFixed(2),
          currency_code: 'EUR'
        }
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
    console.error(`[capturePayPalAuthorization] Error:`, error.response?.data || error.message);
    throw error;
  }
}

/**
 * Crear nueva autorización de PayPal (para renovación)
 */
async function createNewAuthorization(userId, accessToken, baseURL) {
  // NOTA: Esto requiere que el usuario haya guardado su método de pago
  // PayPal Vault API - requiere configuración adicional
  // Por ahora, retornamos null y manejamos expiración notificando al usuario

  console.log(`[createNewAuthorization] Re-autorización automática no disponible aún para usuario ${userId}`);
  console.log(`[createNewAuthorization] Se debe notificar al usuario para renovar manualmente`);

  return null;
}

/**
 * Calcular horas hasta la cita
 */
function calculateHoursUntil(appointmentDate) {
  const now = new Date();
  const appointment = appointmentDate.toDate ? appointmentDate.toDate() : new Date(appointmentDate);
  const diffMs = appointment - now;
  return diffMs / (1000 * 60 * 60); // Convertir a horas
}

/**
 * Determinar penalización según horas restantes
 */
function determinePenalty(hoursUntilAppointment) {
  if (hoursUntilAppointment > 48) {
    return {
      amount: PENALTIES.MORE_THAN_48H,
      reason: 'cancelled_more_than_48h',
      message: 'Sin penalización'
    };
  } else if (hoursUntilAppointment > 24) {
    return {
      amount: PENALTIES.BETWEEN_24_48H,
      reason: 'cancelled_between_24_48h',
      message: 'Penalización: €30'
    };
  } else {
    return {
      amount: PENALTIES.LESS_THAN_24H,
      reason: 'cancelled_less_than_24h',
      message: 'Penalización: €60'
    };
  }
}

// ============================================================================
// CALLABLE FUNCTION: Cancelar Cita con Penalización
// ============================================================================
exports.cancelAppointmentWithPenalty = functions.https.onCall(async (data, context) => {
  // 1. Verificar autenticación
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated');
  }

  const { appointmentId } = data;

  if (!appointmentId) {
    throw new functions.https.HttpsError('invalid-argument', 'appointmentId is required');
  }

  const db = admin.firestore();
  const userId = context.auth.uid;

  try {
    // 2. Obtener datos de la cita
    const appointmentRef = db.collection('appointments').doc(appointmentId);
    const appointmentDoc = await appointmentRef.get();

    if (!appointmentDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Appointment not found');
    }

    const appointmentData = appointmentDoc.data();

    // 3. Verificar que el usuario es participante
    if (!appointmentData.participants.includes(userId)) {
      throw new functions.https.HttpsError('permission-denied', 'Not a participant of this appointment');
    }

    // 4. Verificar que la cita no esté ya cancelada o completada
    if (appointmentData.status === 'cancelled') {
      throw new functions.https.HttpsError('failed-precondition', 'Appointment already cancelled');
    }

    if (appointmentData.status === 'completed') {
      throw new functions.https.HttpsError('failed-precondition', 'Cannot cancel completed appointment');
    }

    // 5. Calcular horas hasta la cita
    const hoursUntil = calculateHoursUntil(appointmentData.date);

    // 6. Determinar penalización
    const penalty = determinePenalty(hoursUntil);

    console.log(`[cancelAppointment] User ${userId} cancelling ${appointmentId}`);
    console.log(`[cancelAppointment] Hours until appointment: ${hoursUntil.toFixed(2)}`);
    console.log(`[cancelAppointment] Penalty: €${penalty.amount}`);

    // 7. Obtener datos del usuario
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data();

    // 8. Si hay penalización, capturar de PayPal
    let captureResult = null;

    if (penalty.amount > 0) {
      const authorizationId = userData.insuranceAuthorizationId;

      if (!authorizationId) {
        throw new functions.https.HttpsError('failed-precondition', 'No insurance authorization found');
      }

      // Obtener access token de PayPal
      const { token, baseURL } = await getPayPalAccessToken();

      // Capturar penalización
      captureResult = await capturePayPalAuthorization(
        authorizationId,
        penalty.amount,
        token,
        baseURL
      );

      console.log(`[cancelAppointment] Penalty captured: ${captureResult.id}`);

      // Registrar penalización en Firestore
      await db.collection('penalty_history').add({
        userId: userId,
        appointmentId: appointmentId,
        penaltyAmount: penalty.amount,
        reason: penalty.reason,
        hoursBeforeCancellation: hoursUntil,
        captureId: captureResult.id,
        capturedAt: admin.firestore.FieldValue.serverTimestamp(),
        paypalResponse: captureResult
      });

      // Actualizar usuario con penalización
      await db.collection('users').doc(userId).update({
        totalPenaltiesPaid: admin.firestore.FieldValue.increment(penalty.amount),
        lastPenaltyDate: admin.firestore.FieldValue.serverTimestamp()
      });
    }

    // 9. Marcar cita como cancelada
    await appointmentRef.update({
      status: 'cancelled',
      cancelledBy: userId,
      cancelledAt: admin.firestore.FieldValue.serverTimestamp(),
      cancellationReason: penalty.reason,
      penaltyApplied: penalty.amount
    });

    // 10. Notificar al otro participante
    const otherParticipantId = appointmentData.participants.find(id => id !== userId);

    await db.collection('notifications').add({
      userId: otherParticipantId,
      type: 'appointment_cancelled',
      appointmentId: appointmentId,
      cancelledBy: userId,
      message: `Tu cita ha sido cancelada. Penalización aplicada: €${penalty.amount}`,
      read: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return {
      success: true,
      penalty: penalty.amount,
      reason: penalty.reason,
      message: penalty.message,
      captureId: captureResult ? captureResult.id : null
    };

  } catch (error) {
    console.error('[cancelAppointment] Error:', error);

    // Registrar error
    await db.collection('penalty_errors').add({
      userId: userId,
      appointmentId: appointmentId,
      error: error.message,
      errorDetails: error.response?.data || null,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });

    throw new functions.https.HttpsError('internal', error.message);
  }
});

// ============================================================================
// TRIGGER: Marcar No-Show (Plantón)
// ============================================================================
exports.processNoShow = functions.https.onCall(async (data, context) => {
  // Verificar autenticación
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated');
  }

  const { appointmentId, noShowUserId } = data;

  if (!appointmentId || !noShowUserId) {
    throw new functions.https.HttpsError('invalid-argument', 'appointmentId and noShowUserId are required');
  }

  const db = admin.firestore();

  try {
    // 1. Obtener cita
    const appointmentDoc = await db.collection('appointments').doc(appointmentId).get();

    if (!appointmentDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Appointment not found');
    }

    const appointmentData = appointmentDoc.data();

    // 2. Verificar que noShowUserId es participante
    if (!appointmentData.participants.includes(noShowUserId)) {
      throw new functions.https.HttpsError('invalid-argument', 'Invalid noShowUserId');
    }

    // 3. Obtener datos del ghoster
    const ghosterDoc = await db.collection('users').doc(noShowUserId).get();
    const ghosterData = ghosterDoc.data();

    const authorizationId = ghosterData.insuranceAuthorizationId;

    if (!authorizationId) {
      throw new functions.https.HttpsError('failed-precondition', 'No insurance authorization found');
    }

    // 4. Capturar €120 completos
    const { token, baseURL } = await getPayPalAccessToken();

    const captureResult = await capturePayPalAuthorization(
      authorizationId,
      PENALTIES.NO_SHOW,
      token,
      baseURL
    );

    console.log(`[processNoShow] Full penalty captured: ${captureResult.id}`);

    // 5. Registrar en penalty_history
    await db.collection('penalty_history').add({
      userId: noShowUserId,
      appointmentId: appointmentId,
      penaltyAmount: PENALTIES.NO_SHOW,
      reason: 'no_show',
      victimUserId: appointmentData.participants.find(id => id !== noShowUserId),
      captureId: captureResult.id,
      capturedAt: admin.firestore.FieldValue.serverTimestamp(),
      paypalResponse: captureResult
    });

    // 6. Actualizar cita
    await db.collection('appointments').doc(appointmentId).update({
      status: 'no_show',
      noShowUser: noShowUserId,
      penaltyApplied: PENALTIES.NO_SHOW,
      processedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // 7. Actualizar usuario (bajar reputación)
    await db.collection('users').doc(noShowUserId).update({
      totalPenaltiesPaid: admin.firestore.FieldValue.increment(PENALTIES.NO_SHOW),
      noShowCount: admin.firestore.FieldValue.increment(1),
      lastPenaltyDate: admin.firestore.FieldValue.serverTimestamp(),
      insuranceStatus: 'depleted'  // Seguro agotado
    });

    // 8. Notificar a la víctima
    const victimId = appointmentData.participants.find(id => id !== noShowUserId);

    await db.collection('notifications').add({
      userId: victimId,
      type: 'no_show_compensation',
      appointmentId: appointmentId,
      amount: PENALTIES.NO_SHOW,
      message: 'Has recibido compensación de €120 por el plantón',
      read: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return {
      success: true,
      penalty: PENALTIES.NO_SHOW,
      captureId: captureResult.id,
      message: 'Penalización completa aplicada por no-show'
    };

  } catch (error) {
    console.error('[processNoShow] Error:', error);

    throw new functions.https.HttpsError('internal', error.message);
  }
});

// ============================================================================
// SCHEDULED FUNCTION: Renovar autorizaciones próximas a expirar
// ============================================================================
exports.renewExpiringAuthorizations = functions
  .region('europe-west1')
  .pubsub
  .schedule('0 3 * * *') // 03:00 AM diariamente
  .timeZone('Europe/Madrid')
  .onRun(async (context) => {
    console.log('[renewExpiringAuthorizations] ===== INICIO =====');

    const db = admin.firestore();

    try {
      // 1. Buscar usuarios con seguro activo
      const usersSnapshot = await db.collection('users')
        .where('hasAntiGhostingInsurance', '==', true)
        .where('insuranceStatus', 'in', ['authorized', 'available'])
        .get();

      console.log(`[renewExpiringAuthorizations] Usuarios con seguro: ${usersSnapshot.size}`);

      if (usersSnapshot.empty) {
        return null;
      }

      const { token, baseURL } = await getPayPalAccessToken();

      let renewed = 0;
      let notified = 0;
      let errors = 0;

      // 2. Verificar cada autorización
      for (const userDoc of usersSnapshot.docs) {
        const userId = userDoc.id;
        const userData = userDoc.data();
        const authorizationId = userData.insuranceAuthorizationId;

        if (!authorizationId) {
          continue;
        }

        try {
          // Obtener estado de autorización
          const authResponse = await axios.get(
            `${baseURL}/v2/payments/authorizations/${authorizationId}`,
            {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            }
          );

          const authData = authResponse.data;
          const expirationDate = new Date(authData.expiration_time);
          const now = new Date();
          const daysUntilExpiration = Math.floor((expirationDate - now) / (1000 * 60 * 60 * 24));

          console.log(`[renewExpiringAuthorizations] Usuario ${userId}: ${daysUntilExpiration} días hasta expiración`);

          // Si faltan 3 días o menos
          if (daysUntilExpiration <= 3) {
            // NOTA: Re-autorización automática requiere PayPal Vault API
            // Por ahora, notificamos al usuario para renovar manualmente

            await db.collection('notifications').add({
              userId: userId,
              type: 'insurance_expiring',
              daysRemaining: daysUntilExpiration,
              message: `Tu seguro anti-plantón expira en ${daysUntilExpiration} días. Por favor, renuévalo.`,
              actionRequired: true,
              actionUrl: '/webapp/seguro.html',
              read: false,
              createdAt: admin.firestore.FieldValue.serverTimestamp()
            });

            notified++;

            console.log(`[renewExpiringAuthorizations] Notificación enviada a ${userId}`);
          }

        } catch (error) {
          console.error(`[renewExpiringAuthorizations] Error con usuario ${userId}:`, error.message);
          errors++;
        }

        // Delay para no saturar API
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      console.log('[renewExpiringAuthorizations] ===== RESUMEN =====');
      console.log(`  Renovadas: ${renewed}`);
      console.log(`  Notificadas: ${notified}`);
      console.log(`  Errores: ${errors}`);

      return {
        success: true,
        renewed,
        notified,
        errors
      };

    } catch (error) {
      console.error('[renewExpiringAuthorizations] Error fatal:', error);
      throw error;
    }
  });

module.exports = {
  cancelAppointmentWithPenalty: exports.cancelAppointmentWithPenalty,
  processNoShow: exports.processNoShow,
  renewExpiringAuthorizations: exports.renewExpiringAuthorizations
};
