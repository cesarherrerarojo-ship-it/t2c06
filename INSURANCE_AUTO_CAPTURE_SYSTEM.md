# 💰 Sistema de Auto-Captura del Seguro Anti-Plantón

> **Fecha:** 2025-11-15
> **Modelo de Negocio:** Captura automática después de 29 días
> **Base Legal:** IVA 21% España
> **Archivo:** `functions/insurance-auto-capture.js`

---

## 📋 Índice

1. [Modelo de Negocio](#modelo-de-negocio)
2. [Funcionamiento Técnico](#funcionamiento-técnico)
3. [Desglose Fiscal (IVA 21%)](#desglose-fiscal-iva-21)
4. [Cloud Functions](#cloud-functions)
5. [Colecciones Firestore](#colecciones-firestore)
6. [Comunicación al Usuario](#comunicación-al-usuario)
7. [Testing](#testing)
8. [Despliegue](#despliegue)
9. [Consideraciones Legales](#consideraciones-legales)

---

## 💼 Modelo de Negocio

### Concepto

**El seguro anti-plantón NO es un depósito reembolsable.** Es un **pago único de €120** que:

1. ✅ **Se retiene (autoriza) al momento del pago**
2. ⏳ **Permanece retenido durante 29 días**
3. 🔴 **Se captura automáticamente al día 27-28** (antes de expirar)
4. 💰 **Los fondos pasan a ser ingresos de TuCitaSegura**
5. 📊 **Se registra con desglose fiscal completo (IVA 21%)**

### Casos de Uso

#### Caso 1: Usuario paga y usa la plataforma ✅
```
Día 0:  Usuario paga €120 → PayPal retiene
Día 1-26: Usuario usa la plataforma normalmente
Día 27: Sistema captura €120 automáticamente
        → Ingreso para TuCitaSegura
        → Base: €99.17 + IVA: €20.83 = €120.00
```

#### Caso 2: Usuario planta a alguien ANTES del día 27 ❌
```
Día 0:  Usuario paga €120 → PayPal retiene
Día 5:  Usuario planta a otro usuario
        → Sistema captura €120 INMEDIATAMENTE
        → Víctima recibe compensación
        → Se registra como "no_show"
```

#### Caso 3: Usuario cancela cuenta ANTES del día 27 ⏸️
```
Día 0:  Usuario paga €120 → PayPal retiene
Día 10: Usuario cancela cuenta
        → Sistema LIBERA los €120 (void)
        → Usuario recupera su dinero
        → Sin ingreso para la plataforma
```

---

## ⚙️ Funcionamiento Técnico

### Cloud Function Programada

**Nombre:** `autoCaptureExpiringInsurance`

**Ejecución:**
- **Frecuencia:** Diaria
- **Hora:** 02:00 AM (Europe/Madrid)
- **Cron:** `0 2 * * *`

**Flujo:**

```
┌─────────────────────────────────────────────────────────────┐
│  02:00 AM - Cloud Function se ejecuta automáticamente      │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  1. Buscar usuarios con seguro "authorized"                │
│     WHERE hasAntiGhostingInsurance = true                  │
│     WHERE insuranceStatus = 'authorized'                   │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  2. Para cada usuario:                                      │
│     - Obtener authorizationId                              │
│     - Consultar estado en PayPal API                       │
│     - Calcular días hasta expiración                       │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  3. ¿Faltan 1-2 días para expirar?                         │
│     SI → Continuar                                          │
│     NO → Saltar (revisar mañana)                           │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  4. CAPTURAR autorización (PayPal API)                     │
│     POST /v2/payments/authorizations/{id}/capture          │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  5. Calcular desglose fiscal (IVA 21%)                     │
│     Total: €120.00                                          │
│     Base:  €99.17                                           │
│     IVA:   €20.83                                           │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  6. Actualizar Firestore:                                  │
│     - users/{userId}                                        │
│     - insurance_captures (nueva entrada)                   │
│     - fiscal_records (nueva entrada)                       │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  7. Registrar logs y continuar con siguiente usuario       │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Desglose Fiscal (IVA 21%)

### Cálculo del IVA

**España:** Servicios digitales tienen IVA del 21%

**Fórmula:**
```javascript
Base Imponible = Total / 1.21
IVA = Total - Base Imponible

Ejemplo con €120:
Base = 120 / 1.21 = €99.17
IVA  = 120 - 99.17 = €20.83
```

### Estructura de Datos Fiscal

```javascript
{
  totalAmount: 120.00,      // Precio final pagado por el usuario
  baseAmount: 99.17,        // Base imponible (sin IVA)
  taxAmount: 20.83,         // IVA (21%)
  taxRate: 0.21,            // Tasa de IVA
  taxPercentage: "21%",     // Formato legible
  currency: "EUR"           // Moneda
}
```

### Registro Fiscal en Firestore

Cada captura se registra en `fiscal_records`:

```javascript
{
  type: "insurance_capture",
  userId: "user123",
  captureId: "CAPTURE-XXX",
  totalAmount: 120.00,
  baseAmount: 99.17,
  taxAmount: 20.83,
  taxRate: 0.21,
  taxType: "IVA",
  currency: "EUR",
  reason: "Seguro anti-plantón expirado",
  fiscalYear: 2025,
  fiscalQuarter: 4,           // Trimestre fiscal (1-4)
  createdAt: Timestamp
}
```

---

## ⚡ Cloud Functions

### 1. `autoCaptureExpiringInsurance` (Scheduled)

**Tipo:** Scheduled Function (Cron)

**Ejecución:** Diaria a las 02:00 AM

**Código:**
```javascript
exports.autoCaptureExpiringInsurance = functions
  .region('europe-west1')
  .pubsub
  .schedule('0 2 * * *')
  .timeZone('Europe/Madrid')
  .onRun(async (context) => {
    // Buscar autorizaciones próximas a expirar
    // Capturar automáticamente
    // Registrar fiscalmente
  });
```

**Logs:**
```bash
firebase functions:log --only autoCaptureExpiringInsurance
```

**Salida esperada:**
```
[autoCaptureExpiringInsurance] ===== INICIO =====
[autoCaptureExpiringInsurance] Usuarios con seguro autorizado: 15
[autoCaptureExpiringInsurance] Usuario user123:
  - Authorization ID: 2AB12345
  - Estado: CREATED
  - Días hasta expiración: 1
[autoCaptureExpiringInsurance] 🔥 CAPTURANDO autorización
[autoCaptureExpiringInsurance] ✅ Captura exitosa: CAPTURE456
[autoCaptureExpiringInsurance] Desglose fiscal: { totalAmount: 120, baseAmount: 99.17, taxAmount: 20.83 }
[autoCaptureExpiringInsurance] ===== RESUMEN =====
  Total usuarios procesados: 15
  ✅ Capturas exitosas: 3
  ⏭️  Saltados (no expiran aún): 10
  ❌ Errores: 2
```

---

### 2. `manualCaptureInsurance` (Callable - Admin)

**Tipo:** Callable Function (HTTPS)

**Acceso:** Solo administradores

**Uso:** Dashboard de admin para capturas manuales

**Ejemplo (Frontend):**
```javascript
import { getFunctions, httpsCallable } from 'firebase/functions';

const functions = getFunctions();
const manualCapture = httpsCallable(functions, 'manualCaptureInsurance');

// Capturar manualmente
const result = await manualCapture({
  userId: 'user123',
  reason: 'user_violation' // Razón de captura manual
});

console.log(result.data);
// {
//   success: true,
//   captureId: "CAPTURE789",
//   amount: 120,
//   taxBreakdown: { ... },
//   status: "COMPLETED"
// }
```

---

## 🗄️ Colecciones Firestore

### 1. `users` (actualización)

**Campos añadidos:**

```javascript
{
  // Campos existentes...
  hasAntiGhostingInsurance: true,
  insuranceAuthorizationId: "2AB12345",
  insuranceStatus: "captured",  // authorized → captured
  insuranceCaptureId: "CAPTURE456",
  insuranceCaptureDate: Timestamp,
  insuranceCaptureReason: "auto_expiration",  // Razón de captura
  insuranceCaptureTaxBreakdown: {
    totalAmount: 120.00,
    baseAmount: 99.17,
    taxAmount: 20.83,
    taxRate: 0.21,
    taxPercentage: "21%",
    currency: "EUR"
  }
}
```

---

### 2. `insurance_captures` (nueva colección)

**Propósito:** Registro de todas las capturas

```javascript
{
  userId: "user123",
  authorizationId: "2AB12345",
  captureId: "CAPTURE456",
  amount: 120.00,
  currency: "EUR",
  status: "COMPLETED",
  reason: "auto_expiration",  // auto_expiration | no_show | manual_admin | user_violation
  captureType: "automatic",   // automatic | manual
  daysBeforeExpiration: 1,    // Solo para auto_expiration
  capturedBy: "admin-uid",    // Solo para manual
  taxBreakdown: {
    totalAmount: 120.00,
    baseAmount: 99.17,
    taxAmount: 20.83,
    taxRate: 0.21,
    taxPercentage: "21%",
    currency: "EUR"
  },
  capturedAt: Timestamp,
  paypalResponse: { ... }     // Respuesta completa de PayPal
}
```

---

### 3. `fiscal_records` (nueva colección)

**Propósito:** Registro contable para declaraciones fiscales

```javascript
{
  type: "insurance_capture",  // Tipo de transacción
  userId: "user123",
  captureId: "CAPTURE456",
  totalAmount: 120.00,        // Total cobrado
  baseAmount: 99.17,          // Base imponible
  taxAmount: 20.83,           // IVA
  taxRate: 0.21,              // 21%
  taxType: "IVA",             // Tipo de impuesto
  currency: "EUR",
  reason: "Seguro anti-plantón expirado",
  fiscalYear: 2025,           // Año fiscal
  fiscalQuarter: 4,           // Trimestre (1-4)
  createdAt: Timestamp
}
```

**Queries útiles:**

```javascript
// Ingresos del trimestre actual
const Q4_2025 = db.collection('fiscal_records')
  .where('fiscalYear', '==', 2025)
  .where('fiscalQuarter', '==', 4)
  .get();

// Total IVA recaudado en 2025
const totalTax2025 = await db.collection('fiscal_records')
  .where('fiscalYear', '==', 2025)
  .get()
  .then(snapshot => {
    let total = 0;
    snapshot.forEach(doc => total += doc.data().taxAmount);
    return total;
  });
```

---

### 4. `insurance_capture_errors` (nueva colección)

**Propósito:** Log de errores para debugging

```javascript
{
  userId: "user123",
  authorizationId: "2AB12345",
  error: "Authorization already captured",
  errorDetails: { ... },
  timestamp: Timestamp
}
```

---

## 📢 Comunicación al Usuario

### Antes del Pago (UX CRÍTICO)

**En `/webapp/seguro.html` - Antes del botón PayPal:**

```html
<div class="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-6">
  <div class="flex">
    <i class="fas fa-exclamation-triangle text-yellow-500 mr-3 mt-1"></i>
    <div>
      <p class="font-bold text-gray-800">Información Importante</p>
      <ul class="text-sm text-gray-700 mt-2 space-y-1">
        <li>• El seguro anti-plantón es un <strong>pago único de €120</strong></li>
        <li>• Se retienen €120 de tu tarjeta al momento del pago</li>
        <li>• <strong>Después de 29 días, se cobrarán automáticamente</strong></li>
        <li>• Solo se cobra antes si plantas a alguien (compensación a la víctima)</li>
        <li>• Si cancelas tu cuenta antes de 29 días, recuperas los €120</li>
      </ul>
    </div>
  </div>
</div>
```

### Email de Confirmación

**Asunto:** ✅ Seguro Anti-Plantón Activado - TuCitaSegura

**Cuerpo:**
```
Hola {nombre},

Tu seguro anti-plantón ha sido activado exitosamente.

DETALLES DE TU SEGURO:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Monto retenido: €120.00
• Estado: Autorizado (retenido)
• Fecha de activación: {fecha}
• Fecha de cobro automático: {fecha + 29 días}

¿QUÉ SIGNIFICA ESTO?
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Los €120 están retenidos en tu tarjeta
✅ Puedes usar la plataforma normalmente
⏳ Después de 29 días, se cobrarán automáticamente
❌ Si plantas a alguien, se cobrarán inmediatamente (compensación)
🔄 Si cancelas tu cuenta antes de 29 días, recuperas los €120

DESGLOSE FISCAL:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Base imponible: €99.17
IVA (21%): €20.83
TOTAL: €120.00

¿Preguntas? Visita nuestro centro de ayuda.

Gracias por confiar en TuCitaSegura.
```

### Email Día 25 (Recordatorio)

**Asunto:** ⏰ Tu seguro anti-plantón se cobrará en 4 días

```
Hola {nombre},

Tu seguro anti-plantón expira en 4 días.

RECORDATORIO:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Fecha de cobro: {fecha + 29 días}
• Monto: €120.00 (Base: €99.17 + IVA: €20.83)
• Acción requerida: Ninguna

El cobro se realizará automáticamente el {fecha}.

Si deseas cancelar tu cuenta y recuperar los €120,
hazlo antes del {fecha + 29 días}.

Gracias,
TuCitaSegura
```

### Email de Captura (Día 27-28)

**Asunto:** ✅ Pago de Seguro Anti-Plantón Procesado

```
Hola {nombre},

Tu seguro anti-plantón ha sido procesado exitosamente.

DETALLES DEL PAGO:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Monto: €120.00
• Base imponible: €99.17
• IVA (21%): €20.83
• ID de transacción: {captureId}
• Fecha: {fecha}

Este pago corresponde al seguro anti-plantón activado
el {fechaActivacion}.

Puedes descargar tu factura desde tu cuenta.

Gracias por ser parte de TuCitaSegura.
```

---

## 🧪 Testing

### Test 1: Captura Automática (Sandbox)

**Prerequisito:** Tener autorización de al menos 27 días

**Problema:** En sandbox NO se puede simular 29 días fácilmente.

**Solución:** Modificar temporalmente el código para testing:

```javascript
// EN insurance-auto-capture.js (SOLO PARA TESTING)
// Línea ~115

// PRODUCCIÓN (captura día 27-28):
if (daysUntilExpiration > 2) {
  console.log('No capturando aún');
  continue;
}

// TESTING (captura inmediatamente):
if (daysUntilExpiration > 999) {  // Nunca se cumple = siempre captura
  console.log('No capturando aún');
  continue;
}
```

**Pasos:**

1. Crear autorización en sandbox
2. Modificar código para testing
3. Ejecutar función manualmente:
   ```bash
   firebase functions:shell
   > autoCaptureExpiringInsurance()
   ```
4. Verificar logs y Firestore
5. **REVERTIR código a producción**

---

### Test 2: Captura Manual (Admin)

```javascript
const manualCapture = httpsCallable(functions, 'manualCaptureInsurance');

const result = await manualCapture({
  userId: 'test-user-123',
  reason: 'testing'
});

console.log(result.data);
// Verificar:
// - Firestore actualizado
// - insurance_captures creado
// - fiscal_records creado
```

---

### Test 3: Verificar Desglose Fiscal

```javascript
// Verificar que el IVA se calcula correctamente
const taxBreakdown = {
  totalAmount: 120.00,
  baseAmount: 99.17,
  taxAmount: 20.83
};

// Verificación:
const calculated = taxBreakdown.baseAmount + taxBreakdown.taxAmount;
console.assert(
  Math.abs(calculated - taxBreakdown.totalAmount) < 0.01,
  'Tax breakdown is correct'
);
```

---

## 🚀 Despliegue

### 1. Instalar Dependencias

Ya están instaladas (se hizo en pasos anteriores).

### 2. Desplegar Funciones

```bash
firebase deploy --only functions

# O específicamente:
firebase deploy --only functions:autoCaptureExpiringInsurance
firebase deploy --only functions:manualCaptureInsurance
```

### 3. Verificar Despliegue

```bash
firebase functions:list

# Debe mostrar:
# - autoCaptureExpiringInsurance (scheduled)
# - manualCaptureInsurance (callable)
```

### 4. Ver Logs en Tiempo Real

```bash
# Scheduled function (se ejecuta a las 02:00 AM)
firebase functions:log --only autoCaptureExpiringInsurance --tail

# Manual capture
firebase functions:log --only manualCaptureInsurance --tail
```

### 5. Probar Scheduled Function Manualmente

**En Firebase Console:**
1. Functions → `autoCaptureExpiringInsurance`
2. Logs → Run
3. Ver ejecución en tiempo real

**Desde CLI:**
```bash
firebase functions:shell
> autoCaptureExpiringInsurance()
```

---

## ⚖️ Consideraciones Legales

### 1. Términos y Condiciones

**DEBE incluir:**

```
SEGURO ANTI-PLANTÓN - CONDICIONES

1. NATURALEZA DEL PAGO
   El seguro anti-plantón es un pago único de €120.00 (IVA incluido)
   que se retiene en tu tarjeta de crédito/débito.

2. RETENCIÓN Y COBRO
   - Al contratar el seguro, se RETIENEN €120 de tu tarjeta
   - Los fondos NO se cobran inmediatamente
   - Después de 29 días, se COBRAN automáticamente
   - Este pago NO es reembolsable una vez cobrado

3. COBRO ANTICIPADO
   Los €120 se cobrarán ANTES de 29 días si:
   - No asistes a una cita confirmada (plantón)
   - Violas las normas de la plataforma
   - En estos casos, la víctima recibe compensación

4. RECUPERACIÓN DE FONDOS
   Puedes recuperar los €120 si:
   - Cancelas tu cuenta ANTES de 29 días
   - No has cometido ningún plantón

5. DESGLOSE FISCAL
   Del total de €120.00:
   - Base imponible: €99.17
   - IVA (21%): €20.83

6. FACTURACIÓN
   Recibirás factura electrónica cuando se procese el cobro.

Al contratar el seguro, aceptas estas condiciones.
```

---

### 2. RGPD (Protección de Datos)

**Datos almacenados:**
- ID de autorización PayPal
- Montos y fechas de pago
- Registros fiscales

**Obligaciones:**
- Informar al usuario en Política de Privacidad
- Derecho de acceso a datos fiscales
- Conservar registros 4 años (obligación fiscal España)

---

### 3. Obligaciones Fiscales (España)

**IVA:**
- Declarar trimestralmente (Modelo 303)
- Declaración anual (Modelo 390)
- Facturación electrónica obligatoria (> €8M)

**Datos a conservar:**
```javascript
// De fiscal_records:
- Total facturado (totalAmount)
- Base imponible (baseAmount)
- IVA recaudado (taxAmount)
- Por trimestre fiscal
```

**Query para declaración trimestral:**
```javascript
const Q4_2025 = await db.collection('fiscal_records')
  .where('fiscalYear', '==', 2025)
  .where('fiscalQuarter', '==', 4)
  .get();

let totalBase = 0;
let totalIVA = 0;

Q4_2025.forEach(doc => {
  const data = doc.data();
  totalBase += data.baseAmount;
  totalIVA += data.taxAmount;
});

console.log('Modelo 303 - Trimestre 4/2025');
console.log('Base imponible:', totalBase.toFixed(2), '€');
console.log('IVA repercutido:', totalIVA.toFixed(2), '€');
```

---

## 📊 Dashboard de Admin (Recomendado)

### Métricas a Mostrar

```javascript
// Total capturado este mes
const thisMonth = await db.collection('insurance_captures')
  .where('capturedAt', '>=', startOfMonth)
  .get();

// Razones de captura
const reasons = {
  auto_expiration: 0,
  no_show: 0,
  manual_admin: 0
};

thisMonth.forEach(doc => {
  reasons[doc.data().reason]++;
});

// Ingresos fiscales
const fiscalSummary = await db.collection('fiscal_records')
  .where('fiscalYear', '==', new Date().getFullYear())
  .get();
```

---

## ✅ Checklist de Implementación

- [ ] Código desplegado (`insurance-auto-capture.js`)
- [ ] Functions importadas en `index.js`
- [ ] Scheduled function desplegada
- [ ] Manual capture function desplegada
- [ ] Colecciones Firestore creadas
- [ ] Firestore Rules actualizadas (proteger colecciones sensibles)
- [ ] UI actualizada con advertencia de cobro a 29 días
- [ ] Términos y Condiciones actualizados
- [ ] Email templates creados (confirmación, recordatorio, cobro)
- [ ] Dashboard de admin (opcional)
- [ ] Testing en sandbox completado
- [ ] Logs monitoreados

---

**Última actualización:** 2025-11-15
**Estado:** ✅ Implementado
**Próximo paso:** Desplegar y probar en sandbox
