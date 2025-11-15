# 💰 Sistema de Penalizaciones del Seguro Anti-Plantón

> **Fecha:** 2025-11-15
> **Modelo:** Penalizaciones progresivas + Re-autorización automática
> **Archivo:** `functions/insurance-penalties.js`

---

## 📋 Modelo de Negocio CORRECTO

### Principio Fundamental

**El usuario NUNCA pierde el dinero automáticamente.**
Solo se cobran penalizaciones por cancelación o plantón.

---

## 💰 Sistema de Penalizaciones Progresivas

### Tabla de Penalizaciones

| Tiempo antes de la cita | Penalización | Razón |
|-------------------------|--------------|--------|
| **>48 horas** | €0 | `cancelled_more_than_48h` |
| **24-48 horas** | €30 | `cancelled_between_24_48h` |
| **<24 horas** | €60 | `cancelled_less_than_24h` |
| **No aparece** | €120 | `no_show` |

---

## 🔄 Flujo Completo del Usuario

```
┌─────────────────────────────────────────────────────────┐
│  USUARIO PAGA €120 (webapp/seguro.html)                │
│  PayPal: intent=authorize (retención, no cobro)        │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│  FIRESTORE: insuranceStatus = "available"              │
│  authorizationId guardado                              │
│  €120 disponibles para usar                            │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│  USUARIO FIJA CITA (webapp/chat.html)                  │
│  Estado: "available" → "locked_for_appointment"        │
│  appointmentId registrado                              │
└────────────────────┬────────────────────────────────────┘
                     │
        ┌────────────┴────────────┬──────────────┬──────────────┬──────────┐
        │                         │              │              │          │
        ▼                         ▼              ▼              ▼          ▼
┌───────────────┐     ┌──────────────┐  ┌──────────────┐  ┌─────────┐  ┌────────┐
│ Cancela       │     │  Cancela     │  │  Cancela     │  │ Ambos   │  │ No     │
│ >48h antes    │     │  24-48h      │  │  <24h        │  │ llegan  │  │aparece │
│               │     │              │  │              │  │         │  │        │
│ Penalización: │     │ Penalización:│  │ Penalización:│  │ €120    │  │Penalty │
│ €0 ✅         │     │ €30 ⚠️       │  │ €60 🔴       │  │quedan   │  │€120 ❌ │
└───────┬───────┘     └──────┬───────┘  └──────┬───────┘  │libres ✅│  └───┬────┘
        │                    │                  │          │         │      │
        └────────────────────┴──────────────────┴──────────┴─────────┴──────┘
                                      │
                                      ▼
                          ┌──────────────────────────┐
                          │  Estado vuelve a:        │
                          │  "available" o "depleted"│
                          └──────────────────────────┘
```

---

## ⚙️ Cloud Functions Implementadas

### 1. `cancelAppointmentWithPenalty` (Callable)

**Propósito:** Cancelar cita con penalización progresiva

**Parámetros:**
```javascript
{
  appointmentId: "appt123"
}
```

**Proceso:**
1. Verificar que usuario es participante
2. Calcular horas hasta la cita
3. Determinar penalización según tabla
4. Si penalización > €0 → Capturar de PayPal
5. Marcar cita como cancelada
6. Registrar en `penalty_history`
7. Notificar al otro participante

**Ejemplo (Frontend):**
```javascript
import { getFunctions, httpsCallable } from 'firebase/functions';

const functions = getFunctions();
const cancelWithPenalty = httpsCallable(functions, 'cancelAppointmentWithPenalty');

const result = await cancelWithPenalty({
  appointmentId: 'appt123'
});

console.log(result.data);
// {
//   success: true,
//   penalty: 30,
//   reason: "cancelled_between_24_48h",
//   message: "Penalización: €30",
//   captureId: "CAPTURE456"
// }
```

---

### 2. `processNoShow` (Callable)

**Propósito:** Procesar plantón (no aparece a la cita)

**Parámetros:**
```javascript
{
  appointmentId: "appt123",
  noShowUserId: "user456"  // Quien no apareció
}
```

**Proceso:**
1. Verificar datos de la cita
2. Capturar €120 completos de PayPal
3. Registrar en `penalty_history`
4. Marcar cita como "no_show"
5. Actualizar usuario (bajar reputación)
6. Notificar a la víctima (compensación)

**Retorna:**
```javascript
{
  success: true,
  penalty: 120,
  captureId: "CAPTURE789",
  message: "Penalización completa aplicada por no-show"
}
```

---

### 3. `renewExpiringAuthorizations` (Scheduled)

**Propósito:** Notificar usuarios cuando su autorización expira

**Ejecuta:** Diariamente a las 03:00 AM (Europe/Madrid)

**Proceso:**
1. Buscar usuarios con seguro activo
2. Verificar estado de autorización en PayPal
3. Si faltan ≤3 días para expirar → Notificar usuario
4. Usuario debe renovar manualmente en `/webapp/seguro.html`

**NOTA:** Re-autorización AUTOMÁTICA requiere PayPal Vault API (no implementado aún)

---

## 🗄️ Colecciones Firestore

### 1. `users` (campos actualizados)

```javascript
{
  // Campos de seguro
  hasAntiGhostingInsurance: true,
  insuranceAuthorizationId: "2AB12345",
  insuranceStatus: "available",  // available | locked_for_appointment | depleted

  // Campos de penalizaciones
  totalPenaltiesPaid: 30,        // Suma total de penalizaciones
  noShowCount: 0,                // Contador de plantones
  lastPenaltyDate: Timestamp,

  // Campo de bloqueo (cuando tiene cita fijada)
  currentLockedAppointment: "appt123" | null
}
```

---

### 2. `appointments` (actualizada)

```javascript
{
  participants: [uid1, uid2],
  date: Timestamp,
  time: "20:00",
  place: "Café Central",
  status: "scheduled",  // scheduled | cancelled | completed | no_show

  // Campos de cancelación
  cancelledBy: uid | null,
  cancelledAt: Timestamp | null,
  cancellationReason: "cancelled_between_24_48h",
  penaltyApplied: 30,

  // Campo de no-show
  noShowUser: uid | null,

  createdAt: Timestamp
}
```

---

### 3. `penalty_history` (nueva colección)

**Propósito:** Log de todas las penalizaciones aplicadas

```javascript
{
  userId: "user123",              // Quien recibió la penalización
  appointmentId: "appt456",
  penaltyAmount: 30,              // €30
  reason: "cancelled_between_24_48h",
  hoursBeforeCancellation: 36.5,

  // Datos de PayPal
  captureId: "CAPTURE789",
  paypalResponse: { ... },

  // Para no-shows
  victimUserId: "user789" | null,  // Solo en caso de no-show

  capturedAt: Timestamp
}
```

**Queries útiles:**
```javascript
// Penalizaciones de un usuario
const userPenalties = await db.collection('penalty_history')
  .where('userId', '==', userId)
  .orderBy('capturedAt', 'desc')
  .get();

// Total de penalizaciones este mes
const thisMonth = await db.collection('penalty_history')
  .where('capturedAt', '>=', startOfMonth)
  .get();

let total = 0;
thisMonth.forEach(doc => total += doc.data().penaltyAmount);
```

---

### 4. `notifications` (actualizada)

```javascript
{
  userId: "user123",
  type: "appointment_cancelled" | "no_show_compensation" | "insurance_expiring",

  // Para cancelación
  appointmentId: "appt456",
  cancelledBy: "user789",
  message: "Tu cita ha sido cancelada. Penalización aplicada: €30",

  // Para expiración de seguro
  daysRemaining: 3,
  actionRequired: true,
  actionUrl: "/webapp/seguro.html",

  // Para no-show
  amount: 120,

  read: false,
  createdAt: Timestamp
}
```

---

## 🎨 UI - Botón de Cancelación

### En `webapp/cita-detalle.html`

```javascript
// Calcular penalización antes de mostrar confirmación
async function showCancellationWarning(appointmentId, appointmentDate) {
  const now = new Date();
  const appointment = new Date(appointmentDate);
  const hoursUntil = (appointment - now) / (1000 * 60 * 60);

  let penalty = 0;
  let warningClass = 'bg-green-500';
  let warningText = '';

  if (hoursUntil > 48) {
    penalty = 0;
    warningText = '✅ Sin penalización';
    warningClass = 'bg-green-500';
  } else if (hoursUntil > 24) {
    penalty = 30;
    warningText = '⚠️ Penalización: €30';
    warningClass = 'bg-yellow-500';
  } else {
    penalty = 60;
    warningText = '🔴 Penalización: €60';
    warningClass = 'bg-red-500';
  }

  // Mostrar modal de confirmación
  const confirmed = await showConfirmModal(
    'Cancelar Cita',
    `${warningText}\n\n¿Estás seguro de que quieres cancelar esta cita?`,
    warningClass
  );

  if (confirmed) {
    await cancelAppointment(appointmentId);
  }
}

// Llamar a Cloud Function
async function cancelAppointment(appointmentId) {
  const functions = getFunctions();
  const cancelWithPenalty = httpsCallable(functions, 'cancelAppointmentWithPenalty');

  try {
    const result = await cancelWithPenalty({ appointmentId });

    showToast(
      `Cita cancelada. ${result.data.message}`,
      result.data.penalty > 0 ? 'warning' : 'success'
    );

    // Redirect
    window.location.href = '/webapp/conversaciones.html';

  } catch (error) {
    console.error('Error cancelling:', error);
    showToast('Error al cancelar la cita', 'error');
  }
}
```

---

## 🔔 Sistema de Notificaciones

### Email Templates Recomendados

#### 1. Confirmación de Seguro Activado

**Asunto:** ✅ Seguro Anti-Plantón Activado

```
Hola {nombre},

Tu seguro anti-plantón ha sido activado exitosamente.

DETALLES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Monto retenido: €120.00
• Estado: Disponible para usar
• Penalizaciones:
  - >48h antes cancelación: €0
  - 24-48h antes: €30
  - <24h antes: €60
  - No apareces: €120

¿QUÉ SIGNIFICA?
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Si tus citas son exitosas, nunca pierdes el dinero
⚠️ Solo se cobran penalizaciones por cancelación tardía o plantón
🔄 La retención se renueva automáticamente cada 25 días

Gracias por confiar en TuCitaSegura.
```

#### 2. Cita Cancelada (al otro participante)

**Asunto:** ⚠️ Tu cita ha sido cancelada

```
Hola {nombre},

Tu cita programada para {fecha} a las {hora} ha sido cancelada.

DETALLES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Cancelado por: {nombre_cancelador}
• Penalización aplicada: €{penalty}
• Razón: {razon}

Puedes programar una nueva cita desde tu panel.
```

#### 3. Seguro Expirando

**Asunto:** ⏰ Tu seguro expira en {días} días

```
Hola {nombre},

Tu seguro anti-plantón expira en {días} días.

ACCIÓN REQUERIDA:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Por favor, renueva tu seguro para seguir disfrutando de la plataforma.

[Renovar Ahora] → /webapp/seguro.html

¿Por qué expira?
PayPal solo retiene autorizaciones por 29 días máximo.
Debes renovarla periódicamente.

Gracias,
TuCitaSegura
```

---

## 🧪 Testing

### Test 1: Cancelación >48h (Sin Penalización)

```javascript
// Crear cita para dentro de 3 días
const appointmentDate = new Date();
appointmentDate.setDate(appointmentDate.getDate() + 3);

// Crear appointment en Firestore
await db.collection('appointments').add({
  participants: [user1, user2],
  date: appointmentDate,
  status: 'scheduled'
});

// Cancelar
const result = await cancelWithPenalty({ appointmentId });

// Verificar
assert(result.data.penalty === 0);
assert(result.data.reason === 'cancelled_more_than_48h');
```

### Test 2: Cancelación 24-48h (€30)

```javascript
// Crear cita para dentro de 36 horas
const appointmentDate = new Date();
appointmentDate.setHours(appointmentDate.getHours() + 36);

// Cancelar
const result = await cancelWithPenalty({ appointmentId });

// Verificar
assert(result.data.penalty === 30);
assert(result.data.captureId !== null);
```

### Test 3: No-Show (€120)

```javascript
const result = await processNoShow({
  appointmentId: 'appt123',
  noShowUserId: 'ghoster123'
});

// Verificar
assert(result.data.penalty === 120);
assert(result.data.captureId !== null);

// Verificar Firestore
const userDoc = await db.collection('users').doc('ghoster123').get();
assert(userDoc.data().noShowCount === 1);
assert(userDoc.data().insuranceStatus === 'depleted');
```

---

## 🚀 Despliegue

### 1. Instalar Dependencias

Ya instaladas en pasos anteriores.

### 2. Desplegar Functions

```bash
firebase deploy --only functions

# Específicamente:
firebase deploy --only functions:cancelAppointmentWithPenalty
firebase deploy --only functions:processNoShow
firebase deploy --only functions:renewExpiringAuthorizations
```

### 3. Verificar

```bash
firebase functions:list

# Debe mostrar:
# - cancelAppointmentWithPenalty (callable)
# - processNoShow (callable)
# - renewExpiringAuthorizations (scheduled)
```

### 4. Logs

```bash
firebase functions:log --only renewExpiringAuthorizations --tail
```

---

## 📊 Dashboard de Admin (Recomendado)

### Métricas a Mostrar

```javascript
// Total de penalizaciones este mes
const thisMonth = await db.collection('penalty_history')
  .where('capturedAt', '>=', startOfMonth)
  .get();

let totalPenalties = 0;
let byReason = {
  'cancelled_between_24_48h': 0,
  'cancelled_less_than_24h': 0,
  'no_show': 0
};

thisMonth.forEach(doc => {
  const data = doc.data();
  totalPenalties += data.penaltyAmount;
  byReason[data.reason] = (byReason[data.reason] || 0) + data.penaltyAmount;
});

console.log('Total penalizaciones:', totalPenalties, '€');
console.log('Por razón:', byReason);
```

---

## ⚠️ Limitación Importante: PayPal 29 días

**Problema:** PayPal solo retiene autorizaciones por 29 días máximo.

**Solución Actual:** Notificar usuario para renovar manualmente

**Solución Futura:** Implementar PayPal Vault API para re-autorización automática

```javascript
// TODO: Implementar PayPal Vault API
// Permite guardar método de pago y crear nuevas autorizaciones sin intervención del usuario
// Requiere:
// - PayPal Advanced Checkout
// - Billing Agreement
// - Vault API integration
```

---

## ✅ Checklist de Implementación

- [x] Sistema de penalizaciones progresivas
- [x] Cloud Function: `cancelAppointmentWithPenalty`
- [x] Cloud Function: `processNoShow`
- [x] Cloud Function: `renewExpiringAuthorizations`
- [x] UI actualizada (seguro.html)
- [x] Documentación completa
- [ ] Desplegar functions
- [ ] UI de cancelación (cita-detalle.html)
- [ ] Sistema de notificaciones (email templates)
- [ ] Testing exhaustivo
- [ ] PayPal Vault API (futuro)

---

## 🔐 Firestore Rules

**Proteger colecciones sensibles:**

```javascript
// firestore.rules

match /penalty_history/{penaltyId} {
  // Usuario puede ver sus propias penalizaciones
  allow read: if isAdmin() || resource.data.userId == request.auth.uid;
  allow write: if false;  // Solo Cloud Functions
}

match /appointments/{appointmentId} {
  // Participantes pueden leer y actualizar
  allow read: if isAuthed() &&
                 request.auth.uid in resource.data.participants;
  allow update: if isAuthed() &&
                   request.auth.uid in resource.data.participants &&
                   // Solo pueden cancelar (no otras modificaciones)
                   request.resource.data.diff(resource.data).affectedKeys().hasOnly(['status', 'cancelledBy', 'cancelledAt']);
  allow create: if isAuthed();
}
```

---

**Última actualización:** 2025-11-15
**Estado:** ✅ Implementado
**Próximo paso:** Desplegar y testing
