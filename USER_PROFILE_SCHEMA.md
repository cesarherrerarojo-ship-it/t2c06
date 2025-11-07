# 👤 User Profile Schema - TuCitaSegura

Complete documentation of the user profile data structure and fields.

## 📋 Firestore Collection: `users`

### Document ID
The document ID is the user's Firebase Authentication UID.

### Complete User Schema

```javascript
{
  // ========================================
  // BASIC INFORMATION (Set during registration)
  // ========================================

  email: string,                    // User's email (from Firebase Auth)
  alias: string,                    // Username/alias (set once during registration, cannot be changed)

  // ========================================
  // PERSONAL INFORMATION
  // ========================================

  birthDate: string,                // Format: "YYYY-MM-DD" (must be 18+ years old)
  gender: string,                   // "masculino" | "femenino" (only these two options)
  city: string,                     // User's city/location
  bio: string,                      // About me / bio (max 500 characters)
  photoURL: string,                 // Profile photo URL (from Firebase Storage)

  // Location for distance calculation
  location: {
    lat: number,                    // Latitude
    lng: number                     // Longitude
  },

  // ========================================
  // RELATIONSHIP STATUS & PREFERENCES
  // ========================================

  relationshipStatus: string,       // "soltero" | "divorciado" | "viudo" | "separado" | "complicado"

  lookingFor: string,               // What the user is looking for:
                                    // "relacion_seria" - Long-term relationship
                                    // "relacion_casual" - Casual dating
                                    // "amistad" - Friendship
                                    // "conocer_gente" - Meet new people
                                    // "sin_compromiso" - No strings attached
                                    // "abierto" - Open to possibilities

  ageRangeMin: number,              // Minimum age preference (default: 18)
  ageRangeMax: number,              // Maximum age preference (default: 99)

  // ========================================
  // ACCOUNT STATUS & VERIFICATION
  // ========================================

  emailVerified: boolean,           // Email verification status
  isOnline: boolean,                // Current online status
  reputation: string,               // "BRONCE" | "PLATA" | "ORO" | "PLATINO"

  // For women only
  availability: string,             // "verde" | "amarillo" | "rojo" (availability indicator)

  // ========================================
  // PAYMENT STATUS (Men only currently)
  // ========================================

  // Subscription (€30 + IVA / month)
  hasActiveSubscription: boolean,   // Active premium membership
  subscriptionId: string,           // PayPal/Stripe subscription ID
  subscriptionStartDate: Timestamp, // When subscription started
  subscriptionEndDate: Timestamp,   // When subscription expires
  subscriptionStatus: string,       // "active" | "canceled" | "expired"

  // Anti-Ghosting Insurance (€120 one-time)
  hasAntiGhostingInsurance: boolean, // Has paid insurance
  insurancePaymentId: string,       // Payment transaction ID
  insurancePurchaseDate: Timestamp, // When insurance was purchased
  insuranceAmount: number,          // 120 (euros)

  // ========================================
  // PRIVACY & MODERATION
  // ========================================

  blockedUsers: [string],           // Array of user IDs that this user has blocked
  hiddenConversations: [string],    // Array of conversation IDs hidden by user

  // ========================================
  // TIMESTAMPS
  // ========================================

  createdAt: Timestamp,             // Account creation date
  updatedAt: Timestamp,             // Last profile update
  lastSeenAt: Timestamp             // Last time user was active
}
```

---

## 📝 Field Descriptions

### Basic Information

| Field | Type | Required | Editable | Notes |
|-------|------|----------|----------|-------|
| `email` | string | ✅ Yes | ❌ No | From Firebase Auth |
| `alias` | string | ✅ Yes | ❌ No | Set during registration, cannot be changed |

### Personal Information

| Field | Type | Required | Editable | Notes |
|-------|------|----------|----------|-------|
| `birthDate` | string | ✅ Yes | ✅ Yes | Format: YYYY-MM-DD, must be 18+ |
| `gender` | string | ✅ Yes | ✅ Yes | Only "masculino" or "femenino" |
| `city` | string | ✅ Yes | ✅ Yes | User's city |
| `bio` | string | ❌ No | ✅ Yes | Max 500 characters |
| `photoURL` | string | ❌ No | ✅ Yes | Uploaded to Firebase Storage |
| `location` | object | ❌ No | ✅ Yes | For distance calculations |

### Relationship Status & Preferences

| Field | Type | Required | Editable | Notes |
|-------|------|----------|----------|-------|
| `relationshipStatus` | string | ✅ Yes | ✅ Yes | Current relationship status |
| `lookingFor` | string | ✅ Yes | ✅ Yes | What user seeks on platform |
| `ageRangeMin` | number | ❌ No | ✅ Yes | Min 18, default 18 |
| `ageRangeMax` | number | ❌ No | ✅ Yes | Max 99, default 99 |

### Account Status

| Field | Type | Required | Editable | Notes |
|-------|------|----------|----------|-------|
| `emailVerified` | boolean | ✅ Yes | ❌ No | From Firebase Auth |
| `isOnline` | boolean | ❌ No | 🔄 Auto | Updated automatically |
| `reputation` | string | ❌ No | 🔄 System | Updated by system based on behavior |
| `availability` | string | ❌ No | ✅ Yes | Women only |

### Payment Status

| Field | Type | Required | Editable | Notes |
|-------|------|----------|----------|-------|
| `hasActiveSubscription` | boolean | ❌ No | 🔄 Auto | Men only (currently) |
| `subscriptionId` | string | ❌ No | 🔄 Auto | PayPal/Stripe ID |
| `subscriptionStartDate` | Timestamp | ❌ No | 🔄 Auto | Start date |
| `subscriptionEndDate` | Timestamp | ❌ No | 🔄 Auto | Expiration date |
| `subscriptionStatus` | string | ❌ No | 🔄 Auto | Subscription state |
| `hasAntiGhostingInsurance` | boolean | ❌ No | 🔄 Auto | Men only (currently) |
| `insurancePaymentId` | string | ❌ No | 🔄 Auto | Transaction ID |
| `insurancePurchaseDate` | Timestamp | ❌ No | 🔄 Auto | Purchase date |
| `insuranceAmount` | number | ❌ No | 🔄 Auto | Always 120 |

---

## 🎯 Business Rules

### Gender

- **Only two genders allowed**: `masculino` and `femenino`
- Set during registration
- Cannot be changed after registration (for now)

### Age Verification

- Users must be **18 years or older**
- Age is calculated from `birthDate`
- Validation happens on:
  - Registration
  - Profile update
  - Before any interaction

### Username (Alias)

- Set **once during registration** (in modal)
- **Cannot be changed** after registration
- Shown as read-only in profile page
- Used throughout the app instead of email

### Profile Photo

- Stored in Firebase Storage at `profile_photos/{userId}`
- Maximum size: **5MB**
- Accepted formats: `image/*` (jpg, png, gif, webp, etc.)
- Falls back to initial letter if no photo

### Relationship Status Options

```javascript
const relationshipStatuses = {
  soltero: "Soltero/a",
  divorciado: "Divorciado/a",
  viudo: "Viudo/a",
  separado: "Separado/a",
  complicado: "Es complicado"
};
```

### Looking For Options

```javascript
const lookingForOptions = {
  relacion_seria: "Relación Seria / A Largo Plazo",
  relacion_casual: "Relación Casual / Esporádica",
  amistad: "Amistad",
  conocer_gente: "Conocer Gente Nueva",
  sin_compromiso: "Citas sin Compromiso",
  abierto: "Abierto a Posibilidades"
};
```

---

## 🔒 Privacy & Security

### Blocked Users

- Array of user IDs that this user has blocked
- Blocked users:
  - Cannot see the user in searches
  - Cannot send messages
  - Cannot see the user's profile
  - Existing conversations are hidden

### Hidden Conversations

- Array of conversation IDs hidden by the user
- Hidden conversations:
  - Don't appear in conversations list
  - Can be unhidden (not deleted)
  - Messages are preserved

---

## 📊 Reputation System

Users earn reputation based on their behavior:

| Reputation | Requirements |
|------------|-------------|
| **BRONCE** | Default for new users |
| **PLATA** | 5+ completed dates, no reports |
| **ORO** | 15+ completed dates, high rating |
| **PLATINO** | 30+ completed dates, excellent rating, verified |

Reputation affects:
- Visibility in search results
- Trust indicator for other users
- Potential future premium features

---

## 💰 Payment Requirements (Current: Men Only)

### Membership (€30 + IVA / month)

**Required for:**
- Sending match requests
- Sending messages in chat
- Viewing certain profiles

**Not required for:**
- Creating account
- Completing profile
- Browsing (limited)

### Anti-Ghosting Insurance (€120 one-time)

**Required for:**
- Proposing dates
- Accepting date proposals
- Scheduling in-person meetings

**Not required for:**
- Chatting
- Sending match requests

### Future Changes

- Payment requirements will apply to **both genders**
- Current logic checks `gender === 'masculino'` for payment validation
- Will be updated to apply to all users

---

## 🔄 Profile Update Flow

1. User navigates to `/webapp/perfil.html`
2. Profile loads from Firestore
3. User edits fields:
   - ✅ Editable: birthDate, gender, city, bio, photo, relationshipStatus, lookingFor, ageRange
   - ❌ Read-only: alias (set during registration), email
4. User clicks "Guardar Cambios"
5. Validation:
   - All required fields filled
   - Age 18+
   - Valid gender selection
   - Valid relationship status
   - Valid looking for option
6. If photo selected:
   - Upload to Firebase Storage (`profile_photos/{userId}`)
   - Get download URL
   - Save URL to Firestore
7. Update Firestore with new data
8. Show success modal
9. Reload profile

---

## 🗑️ Account Deletion

**Warning:** Account deletion is permanent and irreversible.

**What gets deleted:**
- User document from Firestore
- All conversations
- All matches
- All reports (as reporter)
- Profile photo from Storage
- Firebase Auth account

**Confirmation required:**
- User must type "ELIMINAR" to confirm
- Double confirmation prompt

**Note:** Currently shows as "próximamente" (coming soon)

---

## 📸 Photo Storage

### Storage Structure

```
gs://YOUR_BUCKET/
└── profile_photos/
    ├── {userId1}
    ├── {userId2}
    └── {userId3}
```

### Photo Upload Process

1. User selects photo from device
2. Validation:
   - File type must be image
   - File size max 5MB
3. Preview shown immediately (local preview)
4. On "Guardar Cambios":
   - Upload to `profile_photos/{userId}`
   - Overwrites previous photo
   - Get download URL
   - Save URL to Firestore `photoURL` field

### Photo Display

- **If photoURL exists**: Show actual photo
- **If photoURL is empty**: Show colored circle with first letter of alias
- **Default color**: Purple gradient

---

## 🔍 Search & Filters

Users can be filtered by:
- Age (from birthDate)
- City
- Distance (from location)
- Reputation
- Verification status
- Online status
- Gender (automatic - shows opposite gender)

Additional filters based on preferences:
- Looking for (match with user's lookingFor)
- Age range (match with user's ageRange)

---

## ✅ Validation Rules

### Required Fields (cannot save without these):
- ✅ alias (set during registration)
- ✅ email (from Firebase Auth)
- ✅ birthDate (must be 18+)
- ✅ gender (masculino or femenino only)
- ✅ city
- ✅ relationshipStatus
- ✅ lookingFor

### Optional Fields:
- bio (max 500 characters)
- photoURL
- location
- ageRangeMin (default: 18)
- ageRangeMax (default: 99)
- availability (women only)

### Character Limits:
- alias: No limit (set during registration)
- bio: 500 characters
- city: No limit
- email: No limit (from Firebase)

---

## 🎨 UI/UX Notes

### Profile Photo Section
- Circular photo 150x150px
- Camera icon button to upload
- Purple gradient placeholder with initial
- 4px white border with transparency

### Form Sections
1. **Información Personal** (purple icon)
   - Alias (read-only)
   - Birth date
   - Gender
   - City
   - Bio

2. **Estado Sentimental y Preferencias** (pink icon)
   - Relationship status
   - Looking for
   - Age range (min/max)

3. **Zona Peligrosa** (red icon)
   - Delete account button

### Buttons
- **Guardar Cambios**: Purple to pink gradient
- **Cancelar**: Glass effect
- **Eliminar Cuenta**: Red, small, in danger zone

---

## 📱 Responsive Design

- Desktop: Max width 1024px container
- Tablet: Full width with padding
- Mobile: Stacked form fields
- Photo: Always centered

---

**Last Updated:** 2025-11-07
**Version:** 1.0.0
**Author:** TuCitaSegura Development Team
