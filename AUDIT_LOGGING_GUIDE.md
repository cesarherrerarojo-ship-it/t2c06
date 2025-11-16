# Audit Logging System - TuCitaSegura

> **Created:** 2025-11-16
> **Status:** Production Ready
> **Version:** 1.0

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Event Categories](#event-categories)
4. [Implementation](#implementation)
5. [Frontend Integration](#frontend-integration)
6. [Backend (Cloud Functions)](#backend-cloud-functions)
7. [Security & Access Control](#security--access-control)
8. [Database Schema](#database-schema)
9. [Usage Examples](#usage-examples)
10. [Admin Dashboard](#admin-dashboard)
11. [Best Practices](#best-practices)
12. [Troubleshooting](#troubleshooting)

---

## Overview

### What is the Audit Logging System?

The **Audit Logging System** is a comprehensive event tracking mechanism for TuCitaSegura that records all important user actions, security events, business transactions, and administrative operations.

**Key Features:**
- ✅ **Automated logging** via Firestore triggers for critical events
- ✅ **Manual logging** via Cloud Functions for custom events
- ✅ **Frontend integration** with easy-to-use JavaScript utility
- ✅ **Security enforcement** via Firestore Rules
- ✅ **Admin analytics** with statistics and filtering
- ✅ **User privacy** - users can view their own audit logs
- ✅ **Immutable records** - logs cannot be modified or deleted

### Why Audit Logging?

1. **Security & Compliance** - Track suspicious activity and security events
2. **Debugging** - Understand user workflows and identify issues
3. **Analytics** - Gather insights on user behavior
4. **Accountability** - Know who did what and when
5. **Fraud Detection** - Identify patterns of abuse
6. **Customer Support** - Resolve disputes with event history

---

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Browser)                       │
│                                                             │
│  ┌────────────────────────────────────────────────┐       │
│  │  webapp/js/audit-logger.js                     │       │
│  │  - Singleton instance                           │       │
│  │  - Convenience methods (logLogin, logPayment)  │       │
│  │  - Calls Cloud Functions                       │       │
│  └────────────────────────────────────────────────┘       │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│               Cloud Functions (Backend)                     │
│                                                             │
│  1. createAuditLog (Callable)                               │
│     - Validates permissions                                 │
│     - Captures IP & User Agent                             │
│     - Creates immutable log entry                          │
│                                                             │
│  2. getUserAuditLogs (Callable)                             │
│     - Retrieves user's logs                                │
│     - Supports pagination & filtering                      │
│                                                             │
│  3. getAuditLogStats (Callable, Admin only)                 │
│     - Aggregates statistics                                │
│     - Analyzes patterns                                    │
│                                                             │
│  4. Firestore Triggers (Automated)                          │
│     - onUserCreatedAudit                                   │
│     - onUserUpdatedAudit                                   │
│     - onReportCreatedAudit                                 │
│     - onSOSCreatedAudit                                    │
│     - onSubscriptionCreatedAudit                           │
│     - onMatchCreatedAudit                                  │
│     - onAppointmentCreatedAudit                            │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                  Firestore Database                         │
│                                                             │
│  Collection: audit_logs                                     │
│  ├── {logId}                                               │
│  │   ├── userId: string                                    │
│  │   ├── category: string (auth/user_action/security...)   │
│  │   ├── action: string (login/profile_updated...)         │
│  │   ├── metadata: object (event-specific data)           │
│  │   ├── ipAddress: string (optional)                      │
│  │   ├── userAgent: string (optional)                      │
│  │   ├── timestamp: Timestamp                              │
│  │   └── createdAt: Timestamp                              │
│  └── ...                                                   │
└─────────────────────────────────────────────────────────────┘
```

---

## Event Categories

The system tracks **7 main categories** of events:

### 1. Authentication (`auth`)

Events related to user authentication and account security.

**Actions:**
- `login` - User successfully logged in
- `logout` - User logged out
- `user_registered` - New user account created
- `email_verified` - Email verification completed
- `password_changed` - Password was changed
- `password_reset_requested` - User requested password reset
- `failed_login` - Failed login attempt (security)

**Example Metadata:**
```javascript
{
  method: 'email',
  timestamp: '2025-11-16T10:30:00.000Z'
}
```

### 2. User Actions (`user_action`)

Events related to user profile management and settings.

**Actions:**
- `profile_updated` - User updated their profile
- `photo_uploaded` - User uploaded a new photo
- `photo_deleted` - User deleted a photo
- `theme_changed` - User changed app theme
- `location_updated` - User updated their location
- `bio_updated` - User updated their bio

**Example Metadata:**
```javascript
{
  changedFields: ['alias', 'bio', 'theme'],
  timestamp: '2025-11-16T10:30:00.000Z'
}
```

### 3. Security (`security`)

Events related to security, safety, and abuse prevention.

**Actions:**
- `user_blocked` - User blocked another user
- `user_unblocked` - User unblocked another user
- `user_reported` - User reported another user
- `sos_activated` - SOS emergency alert activated
- `sos_deactivated` - SOS alert deactivated
- `failed_login` - Failed login attempt
- `suspicious_activity` - Suspicious behavior detected

**Example Metadata:**
```javascript
{
  blockedUserId: 'abc123',
  reason: 'harassment',
  timestamp: '2025-11-16T10:30:00.000Z'
}
```

### 4. Business (`business`)

Events related to core business operations (matches, chats, dates).

**Actions:**
- `match_requested` - User sent a match request
- `match_accepted` - User accepted a match
- `match_rejected` - User rejected a match
- `message_sent` - User sent a message
- `date_proposed` - User proposed a date
- `appointment_created` - Date appointment created
- `appointment_confirmed` - Date confirmed
- `appointment_canceled` - Date canceled
- `appointment_completed` - Date completed
- `qr_validated` - QR code validated at date
- `vip_event_created` - VIP event created (concierge)
- `vip_application_submitted` - User applied to VIP event

**Example Metadata:**
```javascript
{
  matchId: 'match123',
  receiverId: 'user456',
  status: 'pending',
  timestamp: '2025-11-16T10:30:00.000Z'
}
```

### 5. Payment (`payment`)

Events related to payments and subscriptions.

**Actions:**
- `subscription_created` - New subscription created
- `subscription_renewed` - Subscription renewed
- `subscription_canceled` - Subscription canceled
- `insurance_purchased` - Anti-ghosting insurance purchased
- `insurance_captured` - Insurance captured (user ghosted)
- `payment_failed` - Payment failed

**Example Metadata:**
```javascript
{
  subscriptionId: 'sub_abc123',
  plan: 'monthly',
  amount: 29.99,
  currency: 'EUR',
  timestamp: '2025-11-16T10:30:00.000Z'
}
```

### 6. Admin (`admin`)

Events performed by administrators (requires admin role).

**Actions:**
- `user_banned` - Admin banned a user
- `user_unbanned` - Admin unbanned a user
- `role_changed` - Admin changed user's role
- `report_reviewed` - Admin reviewed a user report
- `manual_override` - Admin performed manual override
- `concierge_approved` - Admin approved concierge application
- `concierge_rejected` - Admin rejected concierge application

**Example Metadata:**
```javascript
{
  targetUserId: 'user789',
  reason: 'spam',
  duration: '7d',
  timestamp: '2025-11-16T10:30:00.000Z'
}
```

### 7. System (`system`)

Events generated by the system (errors, rate limiting, anomalies).

**Actions:**
- `error_occurred` - System error
- `rate_limit_exceeded` - User exceeded rate limit
- `anomaly_detected` - Unusual pattern detected

**Example Metadata:**
```javascript
{
  errorType: '500',
  errorMessage: 'Internal server error',
  endpoint: '/api/createMatch',
  timestamp: '2025-11-16T10:30:00.000Z'
}
```

---

## Implementation

### File Structure

```
t2c06/
├── webapp/
│   └── js/
│       └── audit-logger.js              # Frontend utility (NEW)
│
├── functions/
│   └── index.js                         # Cloud Functions (UPDATED)
│       ├── createAuditLog()             # Callable function
│       ├── getUserAuditLogs()           # Callable function
│       ├── getAuditLogStats()           # Callable function
│       ├── onUserCreatedAudit()         # Firestore trigger
│       ├── onUserUpdatedAudit()         # Firestore trigger
│       ├── onReportCreatedAudit()       # Firestore trigger
│       ├── onSOSCreatedAudit()          # Firestore trigger
│       ├── onSubscriptionCreatedAudit() # Firestore trigger
│       ├── onMatchCreatedAudit()        # Firestore trigger
│       └── onAppointmentCreatedAudit()  # Firestore trigger
│
├── firestore.rules                      # Security rules (UPDATED)
│   └── audit_logs collection rules
│
├── firestore.indexes.json               # Database indexes (UPDATED)
│   └── audit_logs indexes
│
└── AUDIT_LOGGING_GUIDE.md              # This file
```

---

## Frontend Integration

### Basic Usage

```javascript
// 1. Import audit logger
import auditLogger from './js/audit-logger.js';

// 2. Log an event
await auditLogger.logLogin('email');

// 3. Log profile update
await auditLogger.logProfileUpdate(['alias', 'bio']);

// 4. Log custom event
await auditLogger.log('user_action', 'theme_changed', {
  oldTheme: 'purple',
  newTheme: 'blue'
});
```

### Convenience Methods

The audit logger provides convenience methods for common events:

```javascript
// Authentication
await auditLogger.logLogin('email', { device: 'mobile' });
await auditLogger.logLogout();

// Profile
await auditLogger.logProfileUpdate(['alias', 'bio', 'photoURL']);
await auditLogger.logPhotoUpload(3, 'https://...photo.jpg');

// Security
await auditLogger.logUserBlock('user123', 'harassment');
await auditLogger.logUserReport('user456', 'spam', 'behavior');
await auditLogger.logSOSActivation({ lat: 40.4, lng: -3.7 }, 'unsafe', 'appt123');

// Business
await auditLogger.logMatchRequest('user789', 'match123');
await auditLogger.logMatchAccepted('user101', 'match123');
await auditLogger.logMessageSent('conv123', 'text');
await auditLogger.logAppointmentCreated('appt456', '2025-12-01', '19:00', 'Café Central');

// Payment
await auditLogger.logSubscriptionCreated('sub_123', 'monthly', 29.99);
await auditLogger.logInsurancePurchase('pay_456', 120);

// Admin (requires admin role)
await auditLogger.logUserBan('user123', 'spam', '7d');
await auditLogger.logRoleChange('user456', 'regular', 'concierge', 'approved');

// VIP Events
await auditLogger.logVIPEventCreated('event123', 'Wine Tasting', '2025-12-15', 20);
```

### Retrieving Logs

```javascript
// Get current user's logs (last 50)
const result = await auditLogger.getLogs();
console.log(result.logs); // Array of log objects

// Filter by category
const securityLogs = await auditLogger.getLogs({
  category: 'security',
  limit: 20
});

// Admin: Get another user's logs
const userLogs = await auditLogger.getLogs({
  userId: 'user123',
  limit: 100
});

// Get statistics (admin only)
const stats = await auditLogger.getStats({
  startDate: '2025-11-01',
  endDate: '2025-11-30',
  category: 'payment'
});
```

### Error Handling

Audit logging is **non-blocking** - it should never break user workflows.

```javascript
// ✅ GOOD: Catch errors silently
auditLogger.logProfileUpdate(changes).catch(err => {
  console.warn('Audit log failed:', err);
  // Continue with user flow
});

// ✅ GOOD: Async/await with try-catch
try {
  await updateProfile();
  await auditLogger.logProfileUpdate(changes);
} catch (error) {
  if (error.code === 'unauthenticated') {
    // Handle auth error
  }
  // Continue regardless
}

// ❌ BAD: Don't throw audit errors to users
try {
  await updateProfile();
  await auditLogger.logProfileUpdate(changes); // Don't await if not critical
} catch (error) {
  throw error; // User sees error even if profile saved successfully
}
```

---

## Backend (Cloud Functions)

### Callable Functions

#### 1. `createAuditLog`

Creates a new audit log entry.

**Parameters:**
```javascript
{
  category: string,      // Required: auth, user_action, security, business, payment, admin, system
  action: string,        // Required: specific action (e.g., 'login', 'profile_updated')
  metadata: object,      // Optional: additional event data
  targetUserId: string   // Optional: for admin actions on behalf of another user
}
```

**Returns:**
```javascript
{
  success: boolean,
  logId: string,
  timestamp: number
}
```

**Example:**
```javascript
const result = await createAuditLog({
  category: 'auth',
  action: 'login',
  metadata: { method: 'email', device: 'mobile' }
});
```

#### 2. `getUserAuditLogs`

Retrieves audit logs for a user.

**Parameters:**
```javascript
{
  userId: string,      // Optional: defaults to current user (admin can specify)
  category: string,    // Optional: filter by category
  limit: number,       // Optional: max results (1-100, default 50)
  startAfter: string   // Optional: last document ID for pagination
}
```

**Returns:**
```javascript
{
  success: boolean,
  logs: Array<object>,
  count: number,
  hasMore: boolean
}
```

#### 3. `getAuditLogStats` (Admin Only)

Retrieves aggregated statistics.

**Parameters:**
```javascript
{
  startDate: string,   // Optional: ISO date string
  endDate: string,     // Optional: ISO date string
  category: string     // Optional: filter by category
}
```

**Returns:**
```javascript
{
  success: boolean,
  stats: {
    total: number,
    byCategory: { auth: 120, user_action: 450, ... },
    byAction: { login: 80, profile_updated: 200, ... },
    byUser: { user123: 50, user456: 30, ... },
    byHour: { 0: 5, 1: 2, ... 23: 15 }
  },
  period: { startDate, endDate }
}
```

### Firestore Triggers

These functions automatically create audit logs when Firestore documents are created/updated:

- **`onUserCreatedAudit`** - Logs when a new user registers
- **`onUserUpdatedAudit`** - Logs when critical user fields change
- **`onReportCreatedAudit`** - Logs when a user files a report
- **`onSOSCreatedAudit`** - Logs when SOS alert is activated
- **`onSubscriptionCreatedAudit`** - Logs when subscription is created
- **`onMatchCreatedAudit`** - Logs when match is requested
- **`onMatchAcceptedAudit`** - Logs when match is accepted
- **`onAppointmentCreatedAudit`** - Logs when appointment is created

---

## Security & Access Control

### Firestore Rules

```javascript
// audit_logs collection
match /audit_logs/{logId} {
  // Read:
  // - Admins can see all logs
  // - Users can see their own logs (except admin/system logs)
  allow read: if isAdmin() ||
                 (isAuthed() &&
                  resource.data.userId == uid() &&
                  resource.data.category in ['auth', 'user_action', 'business', 'payment']);

  // Create:
  // - Only Cloud Functions (using Admin SDK) or admins
  allow create: if isAdmin();

  // Update/Delete:
  // - NEVER allowed (immutable)
  allow update, delete: if false;
}
```

### Permission Matrix

| Action | Regular User | Admin | Cloud Function |
|--------|-------------|-------|----------------|
| Create own logs | ❌ (via CF) | ✅ | ✅ (Admin SDK) |
| Create logs for others | ❌ | ✅ | ✅ |
| Read own logs (auth, user_action, business, payment) | ✅ | ✅ | ✅ |
| Read own logs (admin, system) | ❌ | ✅ | ✅ |
| Read other users' logs | ❌ | ✅ | ✅ |
| Update logs | ❌ | ❌ | ❌ |
| Delete logs | ❌ | ❌ | ❌ |

### Data Privacy

- **IP Addresses & User Agents** are captured for security events
- **Users can view their own non-sensitive logs** (auth, user_action, business, payment)
- **Admin/system logs are hidden** from regular users
- **Admins can view all logs** for investigation purposes
- **Logs are immutable** - cannot be modified or deleted

---

## Database Schema

### Collection: `audit_logs`

**Document Structure:**
```javascript
{
  // Required fields
  userId: string,              // User who performed the action (or 'system')
  category: string,            // Event category (auth, user_action, security, business, payment, admin, system)
  action: string,              // Specific action (login, profile_updated, etc.)
  timestamp: Timestamp,        // Server timestamp (indexed)
  createdAt: Timestamp,        // Server timestamp (indexed)

  // Optional fields
  metadata: object,            // Event-specific data (flexible)
  ipAddress: string,           // User's IP address (for security events)
  userAgent: string,           // User's browser/device info
  targetUserId: string,        // For admin actions on behalf of another user

  // Metadata examples by category:
  // - auth: { method: 'email', device: 'mobile' }
  // - user_action: { changedFields: ['alias', 'bio'] }
  // - security: { blockedUserId: 'abc123', reason: 'harassment' }
  // - business: { matchId: 'match123', receiverId: 'user456' }
  // - payment: { subscriptionId: 'sub_123', amount: 29.99 }
  // - admin: { targetUserId: 'user789', reason: 'spam', duration: '7d' }
}
```

### Firestore Indexes

```json
[
  {
    "collection": "audit_logs",
    "fields": [
      { "fieldPath": "userId", "order": "ASCENDING" },
      { "fieldPath": "timestamp", "order": "DESCENDING" }
    ]
  },
  {
    "collection": "audit_logs",
    "fields": [
      { "fieldPath": "userId", "order": "ASCENDING" },
      { "fieldPath": "category", "order": "ASCENDING" },
      { "fieldPath": "timestamp", "order": "DESCENDING" }
    ]
  },
  {
    "collection": "audit_logs",
    "fields": [
      { "fieldPath": "category", "order": "ASCENDING" },
      { "fieldPath": "timestamp", "order": "DESCENDING" }
    ]
  },
  {
    "collection": "audit_logs",
    "fields": [
      { "fieldPath": "action", "order": "ASCENDING" },
      { "fieldPath": "timestamp", "order": "DESCENDING" }
    ]
  }
]
```

---

## Usage Examples

### Example 1: Login Tracking

```javascript
// In index.html (login page)
import auditLogger from './js/audit-logger.js';

async function handleLogin(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);

    // Log successful login
    await auditLogger.logLogin('email', {
      timestamp: new Date().toISOString()
    });

    window.location.href = '/webapp/buscar-usuarios.html';
  } catch (error) {
    // Log failed login (security event)
    await auditLogger.logSecurity('failed_login', {
      email: email,
      errorCode: error.code,
      timestamp: new Date().toISOString()
    });

    showToast('Login failed', 'error');
  }
}
```

### Example 2: Payment Tracking

```javascript
// In suscripcion.html (subscription page)
import auditLogger from './js/audit-logger.js';

async function handleSubscriptionSuccess(subscriptionId) {
  // Update user document
  await updateDoc(userRef, {
    hasActiveSubscription: true,
    subscriptionId: subscriptionId
  });

  // Log payment event
  await auditLogger.logSubscriptionCreated(
    subscriptionId,
    'monthly',
    29.99
  );

  showToast('Subscription activated!', 'success');
}
```

### Example 3: Admin Action Tracking

```javascript
// In admin dashboard
import auditLogger from './js/audit-logger.js';

async function banUser(userId, reason, duration) {
  // Ban the user
  await updateDoc(doc(db, 'users', userId), {
    isBanned: true,
    banReason: reason,
    banUntil: new Date(Date.now() + parseDuration(duration))
  });

  // Log admin action
  await auditLogger.logUserBan(userId, reason, duration);

  showToast(`User ${userId} banned`, 'success');
}
```

### Example 4: Security Event Tracking

```javascript
// In SOS button handler
import auditLogger from './js/audit-logger.js';

async function activateSOS(appointmentId) {
  const location = await getCurrentLocation();

  // Create SOS alert
  const sosRef = await addDoc(collection(db, 'sos_alerts'), {
    userId: currentUser.uid,
    appointmentId: appointmentId,
    location: location,
    status: 'active',
    createdAt: serverTimestamp()
  });

  // Log security event (automatic via trigger, but can also log manually)
  await auditLogger.logSOSActivation(
    location,
    'emergency',
    appointmentId
  );

  showToast('SOS activated! Help is on the way.', 'warning');
}
```

---

## Admin Dashboard

### Viewing Audit Logs

Admins can view and filter audit logs from the admin dashboard (to be created):

**Features:**
- View all audit logs across all users
- Filter by category, action, user, date range
- Search for specific events
- Export logs to CSV
- View statistics and trends
- Identify suspicious patterns

**Implementation (to be added):**
```javascript
// In webapp/admin/audit-logs.html

async function loadAuditLogs(filters = {}) {
  const result = await auditLogger.getLogs({
    userId: filters.userId,
    category: filters.category,
    limit: 100
  });

  displayLogsTable(result.logs);
}

async function getAuditStats() {
  const stats = await auditLogger.getStats({
    startDate: '2025-11-01',
    endDate: '2025-11-30'
  });

  displayStatsCharts(stats);
}
```

---

## Best Practices

### 1. When to Log

✅ **DO log:**
- Authentication events (login, logout, password changes)
- Critical user actions (profile updates, photo uploads)
- Security events (blocks, reports, SOS)
- Business transactions (matches, messages, dates)
- Payment events (subscriptions, purchases, failures)
- Admin actions (bans, role changes, overrides)

❌ **DON'T log:**
- Page views (use analytics instead)
- Non-critical UI interactions
- Redundant events (already tracked by triggers)
- Sensitive data in metadata (passwords, credit cards)

### 2. Error Handling

```javascript
// ✅ GOOD: Non-blocking
auditLogger.logAction().catch(console.warn);

// ✅ GOOD: Fire and forget
auditLogger.logAction(); // Don't await

// ❌ BAD: Blocking user flow
try {
  await saveProfile();
  await auditLogger.logProfileUpdate(); // Blocks if fails
  showSuccess();
} catch (error) {
  showError(error); // User sees audit log error
}
```

### 3. Metadata Design

```javascript
// ✅ GOOD: Structured metadata
await auditLogger.log('business', 'match_requested', {
  matchId: 'match123',
  receiverId: 'user456',
  timestamp: new Date().toISOString()
});

// ❌ BAD: Unstructured metadata
await auditLogger.log('business', 'match', {
  data: { id: 'match123', to: 'user456' } // Not searchable
});

// ❌ BAD: Sensitive data in metadata
await auditLogger.log('payment', 'subscription_created', {
  creditCard: '1234-5678-9012-3456' // NEVER log PII/PCI data
});
```

### 4. Performance

- **Use Firestore triggers** for automated logging (no frontend latency)
- **Don't await** audit logs if not critical (fire and forget)
- **Batch logs** if creating multiple in sequence
- **Use indexes** for efficient queries

---

## Troubleshooting

### Issue: Audit logs not appearing

**Possible causes:**
1. **Cloud Functions not deployed**
   ```bash
   firebase deploy --only functions
   ```

2. **Firestore Rules blocking creation**
   - Check that `allow create: if isAdmin()` is present
   - Ensure Cloud Functions use Admin SDK (bypasses rules)

3. **Frontend not importing audit logger**
   ```javascript
   import auditLogger from './js/audit-logger.js';
   ```

### Issue: Permission denied when calling `createAuditLog`

**Solution:**
- Ensure user is authenticated
- Check that category is valid
- Verify user is not trying to create admin/system logs (requires admin role)

### Issue: Cannot read audit logs

**Solution:**
- Users can only read their own logs (except admin/system categories)
- Admins can read all logs
- Check Firestore Rules for `allow read` conditions

### Issue: Slow audit log queries

**Solution:**
- Deploy Firestore indexes:
  ```bash
  firebase deploy --only firestore:indexes
  ```
- Use filters to narrow results
- Implement pagination for large result sets

---

## Summary

The **Audit Logging System** provides comprehensive event tracking for TuCitaSegura:

✅ **7 event categories** covering all critical actions
✅ **Automated triggers** for Firestore document changes
✅ **Frontend utility** with convenience methods
✅ **Security enforcement** via Firestore Rules
✅ **Immutable logs** for compliance and accountability
✅ **Admin analytics** with statistics and filtering
✅ **User privacy** with selective access control

**Next Steps:**
1. Deploy Firestore Rules: `firebase deploy --only firestore:rules`
2. Deploy Cloud Functions: `firebase deploy --only functions`
3. Deploy Firestore Indexes: `firebase deploy --only firestore:indexes`
4. Integrate `auditLogger` into key pages
5. Create admin dashboard for viewing logs
6. Test end-to-end with real events

---

**For questions or issues, refer to:**
- `firestore.rules` (lines 366-385)
- `functions/index.js` (lines 1352-1855)
- `webapp/js/audit-logger.js`
- `CLAUDE.md` (project guide)

**End of Audit Logging Guide**
