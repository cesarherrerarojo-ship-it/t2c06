// Alternative Firebase Authentication Configuration
// This file provides a fallback authentication method that bypasses potential Cloud Function routing issues

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { 
  getAuth, 
  signInWithEmailAndPassword,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  FacebookAuthProvider,
  connectAuthEmulator
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// Firebase configuration with explicit auth domain
const firebaseConfig = {
  apiKey: "AIzaSyAgFcoHwoBpo80rlEHL2hHVZ2DqtjWXh2s",
  authDomain: "tuscitasseguras-2d1a6.firebaseapp.com",
  projectId: "tuscitasseguras-2d1a6",
  storageBucket: "tuscitasseguras-2d1a6.firebasestorage.app",
  messagingSenderId: "924208562587",
  appId: "1:924208562587:web:5291359426fe390b36213e"
};

// Initialize Firebase with explicit configuration
const app = initializeApp(firebaseConfig);

// Get auth instance with explicit configuration
const auth = getAuth(app);

// FORCE DIRECT AUTHENTICATION - Bypass any Cloud Function routing
// This ensures authentication goes directly to Firebase Auth service
auth.config = {
  ...auth.config,
  apiHost: 'identitytoolkit.googleapis.com',
  apiScheme: 'https',
  tokenApiHost: 'securetoken.googleapis.com'
};

// Development mode - use emulator if available
const USE_EMULATOR = false; // Set to true if you want to test with local emulator

if (USE_EMULATOR && (location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
  try {
    connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
    console.log('🔧 Using Firebase Auth Emulator on localhost:9099');
  } catch (error) {
    console.log('⚠️  Could not connect to Auth Emulator:', error.message);
  }
}

// Alternative authentication functions that bypass potential issues
export async function safeSignInWithEmailAndPassword(email, password) {
  try {
    console.log('🔐 Attempting direct Firebase authentication...');
    
    // Force direct connection to Firebase Auth
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    console.log('✅ Direct authentication successful');
    return userCredential;
    
  } catch (error) {
    console.error('❌ Direct authentication failed:', error);
    
    // If we get a Cloud Function error, try alternative approaches
    if (error.message && error.message.includes('Cloud Function')) {
      console.log('🔄 Trying alternative authentication method...');
      
      try {
        // Try redirect-based authentication
        const provider = new GoogleAuthProvider();
        await signInWithRedirect(auth, provider);
        
        // Get redirect result (this will handle the authentication)
        const result = await getRedirectResult(auth);
        return result;
        
      } catch (redirectError) {
        console.error('❌ Redirect authentication also failed:', redirectError);
        throw error; // Throw original error
      }
    }
    
    throw error;
  }
}

// Debug function to check authentication configuration
export function debugAuthConfiguration() {
  console.log('🔍 Debugging Firebase Auth Configuration...');
  console.log('📍 Current hostname:', location.hostname);
  console.log('📍 Auth domain:', auth.config?.authDomain);
  console.log('📍 API host:', auth.config?.apiHost);
  console.log('📍 Token API host:', auth.config?.tokenApiHost);
  console.log('📍 App Check status:', window._appCheckInstance ? 'Active' : 'Disabled');
  
  // Test basic connectivity
  return fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${firebaseConfig.apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: ['test@example.com'] })
  })
  .then(response => {
    console.log('✅ Firebase Auth API is reachable');
    return true;
  })
  .catch(error => {
    console.error('❌ Cannot reach Firebase Auth API:', error);
    return false;
  });
}

// Export the configured auth instance and alternative functions
export { auth, app };
export default {
  auth,
  app,
  safeSignInWithEmailAndPassword,
  debugAuthConfiguration
};