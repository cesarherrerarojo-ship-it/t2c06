// Firebase Configuration
const FIREBASE_API_KEY = "AIzaSyAgFcoHwoBpo80rlEHL2hHVZ2DqtjWXh2s";
const FIREBASE_AUTH_DOMAIN = "tu-cita-segura.firebaseapp.com";
const FIREBASE_PROJECT_ID = "tu-cita-segura";
const FIREBASE_STORAGE_BUCKET = "tu-cita-segura.appspot.com";
const FIREBASE_MESSAGING_SENDER_ID = "123456789";
const FIREBASE_APP_ID = "1:123456789:web:abcdef123456";

// Export for ES6 modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        FIREBASE_API_KEY,
        FIREBASE_AUTH_DOMAIN,
        FIREBASE_PROJECT_ID,
        FIREBASE_STORAGE_BUCKET,
        FIREBASE_MESSAGING_SENDER_ID,
        FIREBASE_APP_ID
    };
}
