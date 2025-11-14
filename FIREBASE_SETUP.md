# Firebase Setup & Configuration Guide

> **Last Updated:** 2025-11-14
> **Project:** TuCitaSegura
> **Firebase Project ID:** tuscitasseguras-2d1a6

---

## Table of Contents

1. [Overview](#overview)
2. [Firebase Project Configuration](#firebase-project-configuration)
3. [Authentication Setup](#authentication-setup)
4. [Firestore Database Setup](#firestore-database-setup)
5. [Storage Setup](#storage-setup)
6. [App Check Setup](#app-check-setup)
7. [Cloud Functions Setup](#cloud-functions-setup)
8. [Testing Authentication Flow](#testing-authentication-flow)
9. [Common Issues & Troubleshooting](#common-issues--troubleshooting)
10. [Security Best Practices](#security-best-practices)

---

## Overview

TuCitaSegura uses Firebase as its primary backend infrastructure:

- **Firebase Authentication**: Email/password authentication with email verification
- **Cloud Firestore**: NoSQL database for user data, conversations, dates, etc.
- **Firebase Storage**: Photo and file storage
- **Cloud Functions**: Backend logic (custom claims, webhooks)
- **Firebase App Check**: Bot protection with reCAPTCHA Enterprise
- **Firebase Cloud Messaging**: Push notifications (optional)

**Current Firebase SDK Version:** 10.12.2

---

## Firebase Project Configuration

### 1. Firebase Console Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: **tuscitasseguras-2d1a6**
3. Verify project settings in **Project Settings** > **General**

### 2. Web App Configuration

Your Firebase configuration is located in `/webapp/js/firebase-config.js`:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyAgFcoHwoBpo80rlEHL2hHVZ2DqtjWXh2s",
  authDomain: "tuscitasseguras-2d1a6.firebaseapp.com",
  projectId: "tuscitasseguras-2d1a6",
  storageBucket: "tuscitasseguras-2d1a6.firebasestorage.app",
  messagingSenderId: "924208562587",
  appId: "1:924208562587:web:5291359426fe390b36213e"
};
```

**⚠️ Important:** These credentials are **PUBLIC** and safe to expose in frontend code. Security is enforced by:
- Firestore Security Rules
- Firebase Storage Rules
- App Check
- Authentication requirements

### 3. SDK Version Consistency

**All HTML files must use Firebase SDK version 10.12.2:**

```javascript
// ✅ CORRECT
import { signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import { doc, getDoc } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

// ❌ WRONG - Old version (will cause compatibility issues)
import { signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
```

**Files recently fixed:**
- ✅ `/webapp/login.html` - Updated to 10.12.2
- ✅ `/webapp/register.html` - Updated to 10.12.2
- ✅ `/webapp/example-notification-integration.html` - Updated to 10.12.2

---

## Authentication Setup

### 1. Enable Authentication Methods

**In Firebase Console:**

1. Go to **Authentication** > **Sign-in method**
2. Enable **Email/Password** provider
3. Disable **Email link (passwordless sign-in)** (we use password-based)

### 2. Email Verification Settings

**Configure email templates:**

1. Go to **Authentication** > **Templates**
2. Customize **Email address verification** template:
   - **From name:** TuCitaSegura
   - **Reply-to email:** noreply@tuscitasseguras-2d1a6.firebaseapp.com
   - **Subject:** Verifica tu correo - TuCitaSegura
   - **Body:** Customize with brand colors and messaging

### 3. Authentication Flow

**Registration (`/webapp/register.html`):**

```javascript
// 1. Create user with email/password
const userCredential = await createUserWithEmailAndPassword(auth, email, password);
const user = userCredential.user;

// 2. Send email verification
await sendEmailVerification(user);

// 3. Create Firestore user document
await setDoc(doc(db, 'users', user.uid), {
  uid: user.uid,
  email: email,
  alias: alias,
  gender: gender,
  birthDate: birthDate,
  userRole: 'regular',
  // ... other fields
  emailVerified: false,
  createdAt: serverTimestamp()
});

// 4. Sign out (user must verify email first)
await auth.signOut();

// 5. Redirect to login
window.location.href = '/webapp/login.html';
```

**Login (`/webapp/login.html`):**

```javascript
// 1. Set persistence (remember me checkbox)
const persistence = rememberMe ? browserLocalPersistence : browserSessionPersistence;
await setPersistence(auth, persistence);

// 2. Sign in
const userCredential = await signInWithEmailAndPassword(auth, email, password);
const user = userCredential.user;

// 3. Check email verification
if (!user.emailVerified) {
  showToast('Por favor verifica tu correo electrónico', 'warning');
  await auth.signOut();
  return;
}

// 4. Load user profile from Firestore
const userDoc = await getDoc(doc(db, 'users', user.uid));
if (!userDoc.exists()) {
  showToast('Error: Perfil no encontrado', 'error');
  await auth.signOut();
  return;
}

// 5. Redirect to app
window.location.href = '/webapp/buscar-usuarios.html';
```

### 4. Session Persistence Options

**browserLocalPersistence (Default when "Remember Me" checked):**
- Session persists across browser restarts
- Data stored in localStorage
- Suitable for personal devices

**browserSessionPersistence (When "Remember Me" NOT checked):**
- Session cleared when browser tab closes
- Data stored in sessionStorage
- Suitable for shared devices

---

## Firestore Database Setup

### 1. Create Database

1. Go to **Firestore Database** > **Create database**
2. Choose **Production mode** (rules are already configured)
3. Select location: **europe-west1** (closest to Spain)

### 2. Deploy Security Rules

**⚠️ CRITICAL:** Firestore Rules enforce ALL business logic. Deploy before production use.

```bash
# Deploy rules
firebase deploy --only firestore:rules

# Verify deployment
firebase firestore:rules get
```

**Key security rules:**
- Only authenticated users can read/write
- Users can only access their own data
- Admin-only operations protected by custom claims
- Payment validations (TODO: currently frontend-only)

### 3. Create Required Indexes

Deploy composite indexes defined in `firestore.indexes.json`:

```bash
firebase deploy --only firestore:indexes
```

### 4. Initial Collections

**Created automatically by app:**
- `users` - User profiles
- `conversations` - Chat conversations
- `conversations/{id}/messages` - Chat messages
- `matches` - Match requests
- `appointments` - Scheduled dates
- `vip_events` - VIP events (concierge feature)
- `blocked_users` - Blocked user relationships
- `reports` - User reports
- `insurance_payments` - Anti-ghosting insurance records
- `referrals` - Referral system data
- `badges` - Badge definitions
- `users/{uid}/earned_badges` - User achievements

---

## Storage Setup

### 1. Create Storage Bucket

1. Go to **Storage** > **Get started**
2. Choose **Production mode**
3. Select location: **europe-west1**

### 2. Deploy Storage Rules

```bash
firebase deploy --only storage
```

### 3. Storage Structure

```
gs://tuscitasseguras-2d1a6.firebasestorage.app/
├── profile_photos/
│   ├── masculino/
│   │   └── {userId}/
│   │       └── {filename}  (max 5MB, images only)
│   └── femenino/
│       └── {userId}/
│           └── {filename}
├── event_photos/
│   └── {eventId}/
│       └── {filename}  (max 10MB, images only)
├── sos_evidence/
│   └── {userId}/
│       └── {filename}  (max 50MB, images/videos)
└── verification_docs/
    └── {userId}/
        └── {filename}  (max 10MB, images/PDFs)
```

---

## App Check Setup

### 1. Enable App Check (Optional for Development)

App Check protects Firebase resources from abuse. It's **recommended but optional** for development.

**To enable:**

1. Go to **App Check** in Firebase Console
2. Register your web app
3. Add reCAPTCHA Enterprise site key to `/webapp/js/firebase-appcheck.js`

**Current configuration:**

```javascript
// /webapp/js/firebase-appcheck.js
const RECAPTCHA_ENTERPRISE_SITE_KEY = '6LfdTvQrAAAAACkGjvbbFIkqHMsTHwRYYZS_CGq2';

const appCheck = initializeAppCheck(app, {
  provider: new ReCaptchaEnterpriseProvider(RECAPTCHA_ENTERPRISE_SITE_KEY),
  isTokenAutoRefreshEnabled: true
});
```

### 2. Debug Tokens for Development

When testing locally, add debug tokens to bypass App Check:

1. Open browser console
2. Run: `self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;`
3. Copy the debug token from console
4. Add it in Firebase Console > **App Check** > **Apps** > **Manage debug tokens**

**Alternative: Disable App Check for Testing**

Comment out the App Check import temporarily:

```javascript
// webapp/login.html
import { auth, db } from './js/firebase-config.js';
// import './js/firebase-appcheck.js';  // Disabled for testing
```

---

## Cloud Functions Setup

### 1. Install Firebase CLI

```bash
npm install -g firebase-tools
firebase login
```

### 2. Deploy Functions

```bash
cd functions
npm install
firebase deploy --only functions
```

### 3. Key Functions

**onUserDocCreate:**
- Triggered when user document created
- Sets custom claims (role, gender)
- Ensures authorization works in Firestore Rules

**onUserDocUpdate:**
- Triggered when user document updated
- Syncs role/gender changes to custom claims

**syncChatACL:**
- Manages Storage ACLs for chat attachments
- Triggered on conversation create/update

**updateUserClaims (Callable):**
- Admin-only function to manually update claims

**getUserClaims (Callable):**
- View custom claims (own or admin-viewable)

### 4. Verify Function Deployment

```bash
# View deployed functions
firebase functions:list

# View logs
firebase functions:log

# Test a callable function
firebase functions:shell
```

### 5. Migrate Existing Users

If users already exist in Firestore without custom claims:

```bash
cd functions/scripts
node update-existing-users.js
```

This script updates all existing users with proper custom claims.

---

## Testing Authentication Flow

### 1. Registration Test

**Steps:**

1. Open `http://localhost:8000/webapp/register.html`
2. Fill registration form:
   - **Alias:** TestUser
   - **Email:** test@example.com
   - **Password:** Test123!
   - **Gender:** Select one
   - **Birth Date:** 1990-01-01
   - Check "Accept terms"
3. Click "Crear Cuenta"
4. Verify success toast: "¡Cuenta creada exitosamente!"
5. Check email inbox for verification email
6. Click verification link in email

**Expected Results:**

✅ User created in Firebase Authentication
✅ User document created in Firestore `users` collection
✅ Email verification sent
✅ Custom claims set (role: 'regular', gender: selected)
✅ Redirected to login page after 3 seconds

**Check in Firebase Console:**

1. **Authentication** > **Users** - New user listed
2. **Firestore Database** > **users** > {uid} - Document exists
3. Open browser console - No errors

### 2. Email Verification Test

**Steps:**

1. Open email inbox (check spam folder)
2. Look for "Verifica tu correo - TuCitaSegura"
3. Click verification link
4. Should redirect to Firebase action page
5. See "Your email has been verified" message

**Verify in Firebase Console:**

- **Authentication** > **Users** > test@example.com
- Email should show verified checkmark ✓

### 3. Login Test (Before Verification)

**Steps:**

1. Try logging in before verifying email
2. Enter email and password
3. Click "Iniciar Sesión"

**Expected Result:**

⚠️ Warning toast: "Por favor verifica tu correo electrónico"
⚠️ User signed out automatically

### 4. Login Test (After Verification)

**Steps:**

1. After verifying email, go to login page
2. Enter verified email and password
3. Check "Recordarme" (optional)
4. Click "Iniciar Sesión"

**Expected Results:**

✅ Success toast: "¡Bienvenido de vuelta!"
✅ Redirected to `/webapp/buscar-usuarios.html`
✅ User session persists (if "Recordarme" checked)

**Check in Browser Console:**

```javascript
// Current user
firebase.auth().currentUser
// Should show user object with email, uid, etc.

// Custom claims (after Cloud Function runs)
firebase.auth().currentUser.getIdTokenResult().then(result => {
  console.log(result.claims);
  // Should show: { role: 'regular', gender: 'masculino' or 'femenino' }
});
```

### 5. Forgot Password Test

**Steps:**

1. On login page, enter email
2. Click "¿Olvidaste tu contraseña?"
3. Check email inbox

**Expected Results:**

✅ Success toast: "Correo de recuperación enviado"
✅ Email received with password reset link
✅ Click link → Redirected to Firebase password reset page
✅ Enter new password → Password updated
✅ Can login with new password

### 6. Session Persistence Test

**Test browserLocalPersistence (Remember Me = ON):**

1. Login with "Recordarme" checked
2. Close browser completely
3. Reopen browser and go to app
4. **Expected:** Still logged in

**Test browserSessionPersistence (Remember Me = OFF):**

1. Login without "Recordarme"
2. Close browser tab
3. Open new tab and go to app
4. **Expected:** Logged out, redirected to login

### 7. Profile Completion Test

**After successful login:**

1. Should redirect to `/webapp/buscar-usuarios.html`
2. Check if profile is complete (photoURL, bio, location)
3. If incomplete, show prompt to complete profile
4. Navigate to `/webapp/perfil.html`

---

## Common Issues & Troubleshooting

### Issue 1: Firebase Version Mismatch

**Symptom:**
- "firebase is not defined"
- Authentication fails silently
- Console errors about undefined properties

**Cause:**
Different Firebase versions between `firebase-config.js` (10.12.2) and HTML imports (10.7.1)

**Fix:**
Update all Firebase imports to version 10.12.2:

```bash
# Search for old version
grep -r "firebasejs/10.7" webapp/

# Fix found in:
# - webapp/login.html (FIXED ✅)
# - webapp/register.html (FIXED ✅)
# - webapp/example-notification-integration.html (FIXED ✅)
```

### Issue 2: App Check 400 Bad Request

**Symptom:**
- "400 Bad Request" on Firestore operations
- Console error: "App Check token refresh failed"

**Cause:**
- App Check enabled but not configured
- reCAPTCHA Enterprise key invalid
- No debug token for localhost

**Fix:**
See `APPCHECK_400_ERROR_FIX.md` for detailed solution.

**Quick fix for development:**

```javascript
// Temporarily disable App Check
// webapp/login.html
import { auth, db } from './js/firebase-config.js';
// import './js/firebase-appcheck.js';  // Comment out
```

### Issue 3: Email Verification Not Sending

**Symptom:**
- User created but no verification email received

**Possible Causes:**

1. **Email in spam folder** - Check spam/junk
2. **Email template not configured** - Check Firebase Console > Authentication > Templates
3. **SendGrid/SMTP not configured** - Default Firebase email service is limited
4. **Domain not verified** - For production, verify custom domain

**Fix:**

```javascript
// Resend verification email
import { sendEmailVerification } from 'firebase/auth';

const user = auth.currentUser;
if (user && !user.emailVerified) {
  await sendEmailVerification(user);
  console.log('Verification email sent');
}
```

### Issue 4: Custom Claims Not Set

**Symptom:**
- Firestore Rules fail with "token.role is undefined"
- User can't access features requiring role check

**Cause:**
- Cloud Functions not deployed
- Function failed to execute
- User created before functions deployed

**Fix:**

```bash
# 1. Deploy functions
firebase deploy --only functions

# 2. Check logs
firebase functions:log --only onUserDocCreate

# 3. Manually update claims for existing users
cd functions/scripts
node update-existing-users.js
```

**Verify claims:**

```javascript
// In browser console
const user = firebase.auth().currentUser;
user.getIdTokenResult().then(result => {
  console.log('Custom claims:', result.claims);
  // Should show: { role: 'regular', gender: 'masculino' or 'femenino' }
});
```

### Issue 5: CORS Errors

**Symptom:**
- "Access-Control-Allow-Origin" error
- Network errors when loading local files

**Cause:**
Opening HTML files directly with `file://` protocol

**Fix:**
Use a local server:

```bash
# Option 1: Python
python -m http.server 8000

# Option 2: Node.js
npx http-server -p 8000

# Option 3: VS Code Live Server extension
# Right-click index.html > Open with Live Server
```

Then access: `http://localhost:8000`

### Issue 6: User Can't Login After Registration

**Symptom:**
- Login fails with "auth/invalid-credential"
- User exists in Firebase Console

**Possible Causes:**

1. **Email not verified** - Check if emailVerified = true
2. **Typo in password** - Passwords are case-sensitive
3. **Account disabled** - Check Firebase Console > Authentication > Users

**Debug:**

```javascript
// In login.html, add more logging
try {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  console.log('Login successful:', userCredential.user);
} catch (error) {
  console.error('Login error:', error.code, error.message);
  // Check specific error codes
}
```

### Issue 7: Firestore Permission Denied

**Symptom:**
- "Missing or insufficient permissions" error
- Can't read/write Firestore documents

**Cause:**
- Firestore Rules not deployed
- Rules blocking legitimate access
- User not authenticated

**Fix:**

```bash
# 1. Deploy rules
firebase deploy --only firestore:rules

# 2. Test in Rules Playground
# Firebase Console > Firestore Database > Rules > Rules Playground

# 3. Check authentication
const user = firebase.auth().currentUser;
console.log('Authenticated:', user ? 'Yes' : 'No');
console.log('UID:', user?.uid);
```

### Issue 8: Theme Not Applying After Login

**Symptom:**
- Page loads but no color theme applied
- Default purple gradient instead of user's theme

**Cause:**
- `theme.js` not imported
- `loadTheme()` not called with user data

**Fix:**

```javascript
// Ensure theme.js is imported
import { loadTheme } from './js/theme.js';

// Load user data and apply theme
const userDoc = await getDoc(doc(db, 'users', user.uid));
const userData = userDoc.data();
loadTheme(userData);  // Apply user's saved theme
```

---

## Security Best Practices

### 1. Never Hardcode Secrets in Frontend

**❌ WRONG:**

```javascript
// DON'T do this
const ADMIN_SECRET_KEY = 'super-secret-123';
const STRIPE_SECRET_KEY = 'sk_live_xxxxx';
```

**✅ CORRECT:**

```javascript
// Use environment variables in backend
// Cloud Functions: functions/.env
STRIPE_SECRET_KEY=sk_live_xxxxx

// Access in Cloud Function
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
```

### 2. Enforce Business Rules in Firestore Rules

**❌ WRONG (Frontend-only validation):**

```javascript
// login.html
if (!user.hasActiveSubscription) {
  alert('You need a membership');
  return;  // ⚠️ Can be bypassed in DevTools
}
```

**✅ CORRECT (Backend enforcement):**

```javascript
// firestore.rules
match /conversations/{conversationId}/messages/{messageId} {
  allow create: if isAuthed() && (
    isFemale() ||
    (isMale() && hasActiveMembership())  // ✅ Enforced server-side
  );
}
```

### 3. Validate Input on Both Sides

**Frontend (UX):**

```javascript
// Client-side validation for immediate feedback
if (password.length < 6) {
  showToast('Password too short', 'error');
  return;
}
```

**Backend (Security):**

```javascript
// Firestore Rules - Enforce minimum length
match /users/{userId} {
  allow create: if request.resource.data.alias.size() >= 3
                && request.resource.data.alias.size() <= 30;
}
```

### 4. Use Custom Claims for Authorization

**Set claims in Cloud Functions:**

```javascript
// functions/index.js
exports.onUserDocCreate = functions.firestore
  .document('users/{userId}')
  .onCreate(async (snap, ctx) => {
    const data = snap.data();
    await admin.auth().setCustomClaims(ctx.params.userId, {
      role: data.userRole || 'regular',
      gender: data.gender
    });
  });
```

**Use in Firestore Rules:**

```javascript
match /admin_logs/{logId} {
  allow read: if request.auth.token.role == 'admin';
}
```

### 5. Rate Limit Sensitive Operations

**Use Firebase App Check:**

```javascript
// Protects against:
// - Automated bots
// - DDoS attacks
// - API abuse
```

**Implement rate limiting in Cloud Functions:**

```javascript
// Use libraries like 'firebase-functions-rate-limiter'
const { RateLimiterMemory } = require('rate-limiter-flexible');

const rateLimiter = new RateLimiterMemory({
  points: 5, // 5 requests
  duration: 60, // per 60 seconds
});
```

### 6. Sanitize User Input

**Prevent XSS attacks:**

```javascript
// Use DOMPurify library
import DOMPurify from 'dompurify';

const userBio = DOMPurify.sanitize(input.value);
document.getElementById('bio').innerHTML = userBio;
```

**Prevent injection attacks:**

```javascript
// Never use eval() or Function() with user input
// ❌ eval(userInput)
// ✅ JSON.parse(userInput)
```

### 7. Secure Storage Access

**Path-based security:**

```javascript
// firebase-storage.rules
match /profile_photos/{gender}/{userId}/{filename} {
  allow read: if request.auth != null
              && (request.auth.uid == userId || oppositeGender(gender));
  allow write: if request.auth.uid == userId
               && request.resource.size < 5 * 1024 * 1024  // 5MB
               && request.resource.contentType.matches('image/.*');
}
```

### 8. Monitor and Log Security Events

**Track auth events:**

```javascript
// Log failed login attempts
auth.onAuthStateChanged((user) => {
  if (!user) {
    console.log('User logged out or login failed');
    // Send to analytics
  }
});
```

**Audit admin actions:**

```javascript
// functions/index.js
exports.logAdminAction = functions.firestore
  .document('users/{userId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();

    // If role changed, log it
    if (before.userRole !== after.userRole) {
      await admin.firestore().collection('admin_logs').add({
        action: 'role_change',
        userId: context.params.userId,
        from: before.userRole,
        to: after.userRole,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });
    }
  });
```

---

## Next Steps

After completing this setup:

1. ✅ Test full registration flow
2. ✅ Test login with email verification
3. ✅ Test password reset
4. ✅ Verify custom claims are set
5. ✅ Test Firestore read/write operations
6. ✅ Test file uploads to Storage
7. ✅ Deploy to production

**Production Checklist:**

- [ ] Deploy Firestore Rules
- [ ] Deploy Storage Rules
- [ ] Deploy Cloud Functions
- [ ] Enable App Check
- [ ] Configure custom email domain
- [ ] Set up monitoring and alerts
- [ ] Configure backup and recovery
- [ ] Test disaster recovery plan

---

## Additional Resources

**Internal Documentation:**
- `BUSINESS_RULES.md` - Complete business logic
- `FIRESTORE_SECURITY_RULES.md` - Security rules guide
- `APPCHECK_400_ERROR_FIX.md` - App Check troubleshooting
- `TROUBLESHOOTING.md` - Common issues
- `CLAUDE.md` - Full development guide

**External Resources:**
- [Firebase Authentication Docs](https://firebase.google.com/docs/auth)
- [Firestore Rules Guide](https://firebase.google.com/docs/firestore/security/get-started)
- [Cloud Functions Docs](https://firebase.google.com/docs/functions)
- [Firebase App Check](https://firebase.google.com/docs/app-check)

---

**End of Firebase Setup Guide**

*For questions or issues, check the troubleshooting section or consult the Firebase documentation.*
