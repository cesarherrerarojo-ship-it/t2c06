// Firebase App Check Configuration
// Importar ANTES de firebase-config.js en todos los archivos HTML

import { initializeAppCheck, ReCaptchaV3Provider } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app-check.js";
import app from './firebase-config.js';

// ============================================================================
// CONFIGURACIÓN DE APP CHECK CON RECAPTCHA V3
// ============================================================================

// IMPORTANTE: Reemplaza con tu site key REAL de reCAPTCHA v3
// Obtener desde: https://console.cloud.google.com/security/recaptcha
const RECAPTCHA_V3_SITE_KEY = '6LfdTvQrAAAAACkGjvbbFIkqHMsTHwRYYZS_CGq2'; // TODO: Verificar si esta es tu key real

// ============================================================================
// 1. MODO DEBUG PARA DESARROLLO LOCAL
// ============================================================================
const isDevelopment = location.hostname === "localhost" ||
                     location.hostname === "127.0.0.1" ||
                     location.hostname.includes("192.168.");

if (isDevelopment) {
  // Activar debug mode para obtener debug token
  self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;

  console.log('🔧 App Check Debug Mode ACTIVADO');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('⚠️  IMPORTANTE: Copia el debug token que aparecerá abajo');
  console.log('📝 Pasos:');
  console.log('   1. Copia el token de la consola (aparece automáticamente)');
  console.log('   2. Ve a Firebase Console → App Check → Apps → Debug tokens');
  console.log('   3. Haz clic en "Add debug token"');
  console.log('   4. Pega el token y guarda');
  console.log('   5. Recarga esta página');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

// ============================================================================
// 2. INICIALIZAR APP CHECK
// ============================================================================
let appCheck = null;

try {
  // Validar site key
  if (!RECAPTCHA_V3_SITE_KEY || RECAPTCHA_V3_SITE_KEY === 'YOUR_RECAPTCHA_V3_SITE_KEY') {
    throw new Error('reCAPTCHA site key no configurada');
  }

  // Inicializar App Check con reCAPTCHA v3
  appCheck = initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider(RECAPTCHA_V3_SITE_KEY),
    isTokenAutoRefreshEnabled: true // Auto-refresh tokens antes de expirar
  });

  // Hacer appCheck disponible globalmente (útil para debugging)
  window._appCheckInstance = appCheck;

  console.log('✅ App Check inicializado correctamente');
  console.log(`📍 Modo: ${isDevelopment ? 'DESARROLLO (debug tokens)' : 'PRODUCCIÓN (reCAPTCHA v3)'}`);

  // En desarrollo, mostrar cuando se obtiene el debug token
  if (isDevelopment) {
    console.log('⏳ Esperando debug token...');
  }

} catch (error) {
  console.error('❌ Error inicializando App Check:', error.message);

  if (error.message.includes('site key')) {
    console.warn('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.warn('📝 Para obtener reCAPTCHA v3 site key:');
    console.warn('   1. https://console.cloud.google.com/security/recaptcha');
    console.warn('   2. Selecciona proyecto: tuscitasseguras-2d1a6');
    console.warn('   3. Haz clic en "+ CREATE KEY"');
    console.warn('   4. Configuración:');
    console.warn('      - Display name: TuCitaSegura Web');
    console.warn('      - Key type: Challenge (v3)');
    console.warn('      - Domains: localhost, 127.0.0.1, tu-dominio.com');
    console.warn('   5. Copia la "Site Key" (6Lxxx...)');
    console.warn('   6. Reemplaza RECAPTCHA_V3_SITE_KEY en este archivo');
    console.warn('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  }

  console.warn('🔧 La app continuará sin App Check');
  console.warn('⚠️  Esto puede causar errores 401 si Enforcement está activado');
  console.warn('💡 Desactiva Enforcement en Firebase Console → App Check');
}

// ============================================================================
// 3. FUNCIÓN HELPER PARA OBTENER TOKEN MANUALMENTE (DEBUGGING)
// ============================================================================
window.getAppCheckToken = async function() {
  if (!appCheck) {
    console.error('App Check no está inicializado');
    return null;
  }

  try {
    const { getToken } = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-app-check.js");
    const tokenResult = await getToken(appCheck, /* forceRefresh */ false);

    console.log('✅ App Check Token obtenido:');
    console.log('   Token:', tokenResult.token.substring(0, 50) + '...');
    console.log('   Expira en:', new Date(Date.now() + 3600000)); // ~1 hora

    return tokenResult;
  } catch (error) {
    console.error('❌ Error obteniendo token:', error);
    return null;
  }
};

// ============================================================================
// 4. AUTO-VERIFICAR QUE APP CHECK FUNCIONA (DESARROLLO)
// ============================================================================
if (isDevelopment) {
  // Esperar un momento para que App Check se inicialice
  setTimeout(async () => {
    console.log('🧪 Verificando App Check...');
    const tokenResult = await window.getAppCheckToken();

    if (tokenResult) {
      console.log('✅ App Check funcionando correctamente');
    } else {
      console.warn('⚠️  App Check no pudo obtener token');
      console.warn('   Posibles causas:');
      console.warn('   - Debug token no añadido en Firebase Console');
      console.warn('   - Site key incorrecta');
      console.warn('   - Enforcement activado sin debug token');
    }
  }, 2000);
}

// Export para usar en otros módulos si es necesario
export { appCheck };
