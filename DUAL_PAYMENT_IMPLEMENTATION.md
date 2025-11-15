# ✅ Sistema Dual de Pagos - Implementación Completa

## 🎉 Estado: IMPLEMENTADO

**Fecha:** 2025-11-15
**Sistema:** PayPal + Stripe integración dual
**Estado:** Frontend + Backend completos, pendiente deploy y configuración

---

## 📋 Resumen de Implementación

### ✅ Completado

1. **Frontend (webapp/)**
   - ✅ suscripcion.html - UI dual con PayPal y Stripe
   - ✅ seguro.html - UI dual con PayPal y Stripe
   - ✅ Tracking de payment provider en Firestore
   - ✅ Imports de Firebase Functions
   - ✅ Handling de success/cancel URLs

2. **Backend (functions/)**
   - ✅ updateUserMembership - Agrega campo paymentProvider
   - ✅ updateUserInsurance - Agrega campo insuranceProvider
   - ✅ createStripeCheckoutSession - Callable function
   - ✅ paypalWebhook - Webhook handler
   - ✅ stripeWebhook - Webhook handler (ya existía)

3. **Documentación**
   - ✅ DUAL_PAYMENT_ARCHITECTURE.md - Arquitectura completa
   - ✅ DUAL_PAYMENT_IMPLEMENTATION.md - Este documento

---

## 🚀 Pasos de Deployment

### 1. Configurar Stripe

#### 1.1. Crear Cuenta Stripe
1. Ve a: https://dashboard.stripe.com/register
2. Completa registro
3. Activa cuenta (verificación de identidad)

#### 1.2. Obtener API Keys
```bash
# Dashboard → Developers → API Keys

# TEST MODE (para desarrollo)
Publishable key: pk_test_...
Secret key: sk_test_...

# LIVE MODE (para producción)
Publishable key: pk_live_...
Secret key: sk_live_...
```

#### 1.3. Actualizar Frontend
```javascript
// webapp/suscripcion.html y webapp/seguro.html
// Línea ~295 en ambos archivos

const stripe = Stripe('pk_test_...'); // TEST MODE
// const stripe = Stripe('pk_live_...'); // LIVE MODE para producción
```

#### 1.4. Configurar Secret Key en Firebase Functions
```bash
firebase functions:config:set stripe.secret_key="sk_test_..."

# Para producción:
# firebase functions:config:set stripe.secret_key="sk_live_..."
```

---

### 2. Configurar PayPal

#### 2.1. Crear Cuenta PayPal Business
1. Ve a: https://www.paypal.com/bizsignup/
2. Completa registro de cuenta Business
3. Verifica cuenta

#### 2.2. Crear App en PayPal Developer
1. Ve a: https://developer.paypal.com/dashboard/applications/
2. Click "Create App"
3. Name: "TuCitaSegura"
4. Type: "Merchant"

#### 2.3. Crear Subscription Plan (Membership)
1. PayPal Dashboard → Products → Subscriptions
2. Create Plan:
   ```
   Plan Name: TuCitaSegura - Membresía Premium
   Price: €29.99 EUR
   Billing Cycle: Monthly
   ```
3. Copy Plan ID: `P-XXXXXXXXXX`

#### 2.4. Actualizar Frontend
```javascript
// webapp/suscripcion.html
// Línea ~15

// SANDBOX (test):
<script src="https://www.paypal.com/sdk/js?client-id=YOUR_SANDBOX_CLIENT_ID&vault=true&intent=subscription"></script>

// LIVE (producción):
<script src="https://www.paypal.com/sdk/js?client-id=YOUR_LIVE_CLIENT_ID&vault=true&intent=subscription"></script>

// Línea ~321 - Plan ID
'plan_id': 'P-XXXXXXXXXX', // Reemplazar con tu Plan ID real
```

```javascript
// webapp/seguro.html
// Línea ~15

// SANDBOX (test):
<script src="https://www.paypal.com/sdk/js?client-id=YOUR_SANDBOX_CLIENT_ID&currency=EUR"></script>

// LIVE (producción):
<script src="https://www.paypal.com/sdk/js?client-id=YOUR_LIVE_CLIENT_ID&currency=EUR"></script>
```

#### 2.5. Configurar API Keys en Firebase Functions
```bash
firebase functions:config:set \
  paypal.client_id="YOUR_CLIENT_ID" \
  paypal.client_secret="YOUR_CLIENT_SECRET" \
  paypal.mode="sandbox"  # o "live" para producción
```

---

### 3. Configurar Webhooks

#### 3.1. Stripe Webhooks

**Endpoint URL:**
```
https://YOUR_REGION-YOUR_PROJECT_ID.cloudfunctions.net/stripeWebhook
```

**Pasos:**
1. Stripe Dashboard → Developers → Webhooks
2. Add endpoint
3. URL: (ver arriba)
4. Select events:
   - ✅ checkout.session.completed
   - ✅ customer.subscription.created
   - ✅ customer.subscription.updated
   - ✅ customer.subscription.deleted
   - ✅ invoice.payment_succeeded
   - ✅ invoice.payment_failed

5. Copy **Webhook Signing Secret**: `whsec_...`

6. Configurar en Firebase Functions:
```bash
firebase functions:config:set stripe.webhook_secret="whsec_..."
```

#### 3.2. PayPal Webhooks

**Endpoint URL:**
```
https://YOUR_REGION-YOUR_PROJECT_ID.cloudfunctions.net/paypalWebhook
```

**Pasos:**
1. PayPal Developer Dashboard → Apps → Tu App → Webhooks
2. Add Webhook
3. URL: (ver arriba)
4. Event types:
   - ✅ BILLING.SUBSCRIPTION.ACTIVATED
   - ✅ BILLING.SUBSCRIPTION.CANCELLED
   - ✅ BILLING.SUBSCRIPTION.EXPIRED
   - ✅ PAYMENT.SALE.COMPLETED
   - ✅ PAYMENT.SALE.DENIED
   - ✅ PAYMENT.SALE.REFUNDED

5. Save

---

### 4. Deploy Cloud Functions

```bash
cd /home/user/t2c06/functions

# 1. Install dependencies
npm install

# 2. Verify config
firebase functions:config:get

# Should show:
# {
#   "stripe": {
#     "secret_key": "sk_test_...",
#     "webhook_secret": "whsec_..."
#   },
#   "paypal": {
#     "client_id": "...",
#     "client_secret": "...",
#     "mode": "sandbox"
#   }
# }

# 3. Deploy
firebase deploy --only functions

# 4. Verify deployment
firebase functions:log --only createStripeCheckoutSession

# 5. Test callable function
# In browser console:
const functions = getFunctions();
const createSession = httpsCallable(functions, 'createStripeCheckoutSession');
const result = await createSession({
  productType: 'membership',
  successUrl: window.location.origin + '/webapp/suscripcion.html?success=true',
  cancelUrl: window.location.origin + '/webapp/suscripcion.html?canceled=true'
});
console.log(result.data); // Should show sessionId
```

---

### 5. Deploy Frontend

```bash
cd /home/user/t2c06

# Deploy hosting
firebase deploy --only hosting

# Verify
# Visit: https://YOUR_PROJECT_ID.web.app/webapp/suscripcion.html
```

---

## 🧪 Testing

### Test en Sandbox (ANTES de producción)

#### 5.1. Test Stripe (Modo Test)

**Test Cards:**
```
Success: 4242 4242 4242 4242
Decline: 4000 0000 0000 0002
3D Secure: 4000 0025 0000 3155

Expiry: Any future date (e.g., 12/34)
CVC: Any 3 digits (e.g., 123)
ZIP: Any 5 digits (e.g., 12345)
```

**Test Flow:**
1. Go to: http://localhost:8000/webapp/suscripcion.html
2. Click "Pago Seguro con Stripe"
3. Use test card 4242 4242 4242 4242
4. Complete payment
5. Verify redirected to success page
6. Check Firestore:
```javascript
const userDoc = await getDoc(doc(db, 'users', userId));
console.log(userDoc.data().hasActiveSubscription); // Should be true
console.log(userDoc.data().paymentProvider); // Should be 'stripe'
```

7. Check Stripe Dashboard → Payments (should show test payment)

#### 5.2. Test PayPal (Modo Sandbox)

**Test Account:**
1. PayPal Sandbox → Accounts
2. Create buyer account or use existing:
   - Email: sb-xxxxx@personal.example.com
   - Password: (auto-generated)

**Test Flow:**
1. Go to: http://localhost:8000/webapp/suscripcion.html
2. Click PayPal button
3. Login with sandbox buyer account
4. Complete payment
5. Verify redirected to success page
6. Check Firestore:
```javascript
const userDoc = await getDoc(doc(db, 'users', userId));
console.log(userDoc.data().hasActiveSubscription); // Should be true
console.log(userDoc.data().paymentProvider); // Should be 'paypal'
```

7. Check PayPal Sandbox Dashboard → Transactions

#### 5.3. Test Webhooks

**Stripe:**
```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local
stripe listen --forward-to localhost:5001/YOUR_PROJECT_ID/us-central1/stripeWebhook

# Trigger test webhook
stripe trigger checkout.session.completed
```

**PayPal:**
- Use PayPal Sandbox webhook simulator
- Or trigger real test payment and verify webhook received

#### 5.4. Test Custom Claims Update

```javascript
// After payment, user must re-login or force token refresh
await auth.currentUser.getIdToken(true); // Force refresh

// Then check token
const tokenResult = await auth.currentUser.getIdTokenResult();
console.log(tokenResult.claims.hasActiveSubscription); // Should be true
```

---

## 📊 Firestore Schema Final

```javascript
// users collection
{
  uid: string,
  email: string,

  // Membresía
  hasActiveSubscription: boolean,
  subscriptionId: string,
  subscriptionStatus: "active" | "canceled" | "expired",
  subscriptionStartDate: Timestamp,
  subscriptionEndDate: Timestamp,
  paymentProvider: "paypal" | "stripe",  // ← NUEVO

  // Seguro
  hasAntiGhostingInsurance: boolean,
  insurancePaymentId: string,
  insurancePurchaseDate: Timestamp,
  insuranceAmount: number,
  insuranceProvider: "paypal" | "stripe",  // ← NUEVO

  // Custom Claims (synced via Cloud Functions)
  // - hasActiveSubscription (boolean)
  // - hasAntiGhostingInsurance (boolean)

  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

---

## 🔍 Debugging

### Ver Logs de Cloud Functions

```bash
# Todos los logs
firebase functions:log

# Solo una función
firebase functions:log --only stripeWebhook

# Tiempo real
firebase functions:log --follow
```

### Ver Firestore Data

```bash
# Firebase Console → Firestore Database
https://console.firebase.google.com/project/YOUR_PROJECT_ID/firestore

# Buscar usuario específico
users/{userId}

# Verificar campos:
- paymentProvider: "stripe" o "paypal"
- hasActiveSubscription: true/false
```

### Ver Stripe Dashboard

```
https://dashboard.stripe.com/test/payments
```

### Ver PayPal Dashboard

```
https://www.sandbox.paypal.com/ (sandbox)
https://www.paypal.com/businessmanage/ (live)
```

---

## ⚠️ Troubleshooting

### Error: "stripe is not defined"

**Causa:** Stripe SDK no cargado

**Solución:**
```html
<!-- Verificar que este script esté en el <head> -->
<script src="https://js.stripe.com/v3/"></script>
```

### Error: "createStripeCheckoutSession is not a function"

**Causa:** Cloud Function no deployed

**Solución:**
```bash
firebase deploy --only functions:createStripeCheckoutSession
```

### Error: "Invalid API key"

**Causa:** Stripe secret key no configurada

**Solución:**
```bash
firebase functions:config:set stripe.secret_key="sk_test_..."
firebase deploy --only functions
```

### Error: PayPal "INVALID_REQUEST"

**Causa:** Plan ID incorrecto

**Solución:**
1. Verificar Plan ID en PayPal Dashboard
2. Actualizar en suscripcion.html línea ~321

### Custom Claims no se actualizan

**Causa:** Usuario no refrescó token

**Solución:**
```javascript
// En frontend, después de pago exitoso
await auth.currentUser.getIdToken(true); // Force refresh
location.reload(); // Recargar página
```

---

## 💰 Costos Estimados

### Stripe Fees
- **Tarjetas EU:** 1.5% + €0.25 por transacción
- **Subscripciones:** Mismo fee, cobrado mensualmente

**Ejemplo:**
- Membership €29.99: Fee = €0.70 → Neto = €29.29
- Insurance €120: Fee = €2.05 → Neto = €117.95

### PayPal Fees
- **Estándar:** 2.9% + €0.35 por transacción
- **Subscripciones:** Mismo fee, cobrado mensualmente

**Ejemplo:**
- Membership €29.99: Fee = €1.22 → Neto = €28.77
- Insurance €120: Fee = €3.83 → Neto = €116.17

**Conclusión:** Stripe es más económico (1.5% vs 2.9%)

### Firebase Costs
- **Cloud Functions:** ~$0.40 por millón de invocaciones
- **Firestore:** Gratis hasta 50k reads/20k writes por día
- **Hosting:** Gratis hasta 10GB/mes

**Estimado para 100 pagos/mes:**
- Stripe/PayPal fees: ~€100-150
- Firebase: ~$5
- **Total:** ~€105-155/mes en fees

---

## 📈 Métricas a Monitorear

### KPIs de Conversión
```javascript
// firestore.rules - Crear collection analytics
match /payment_analytics/{id} {
  allow create: if isAdmin();
  allow read: if isAdmin();
}

// Trackear en Cloud Functions después de pago exitoso
await db.collection('payment_analytics').add({
  userId,
  provider: 'stripe' | 'paypal',
  product: 'membership' | 'insurance',
  amount,
  currency: 'EUR',
  status: 'completed',
  timestamp: admin.firestore.FieldValue.serverTimestamp()
});
```

### Queries Útiles

**Conversión por provider:**
```javascript
// ¿Cuántos usuarios prefieren Stripe vs PayPal?
const stripeMemberships = await db.collection('users')
  .where('paymentProvider', '==', 'stripe')
  .where('hasActiveSubscription', '==', true)
  .count()
  .get();

const paypalMemberships = await db.collection('users')
  .where('paymentProvider', '==', 'paypal')
  .where('hasActiveSubscription', '==', true)
  .count()
  .get();

console.log(`Stripe: ${stripeMemberships.data().count}`);
console.log(`PayPal: ${paypalMemberships.data().count}`);
```

**Revenue por provider:**
```javascript
const analytics = await db.collection('payment_analytics')
  .where('status', '==', 'completed')
  .get();

let stripeRevenue = 0;
let paypalRevenue = 0;

analytics.forEach(doc => {
  const data = doc.data();
  if (data.provider === 'stripe') {
    stripeRevenue += data.amount;
  } else {
    paypalRevenue += data.amount;
  }
});

console.log(`Stripe Revenue: €${stripeRevenue}`);
console.log(`PayPal Revenue: €${paypalRevenue}`);
```

---

## ✅ Checklist de Producción

### Pre-Launch
- [ ] Stripe account verificada
- [ ] PayPal Business account verificada
- [ ] Stripe Live keys configuradas
- [ ] PayPal Live keys configuradas
- [ ] PayPal Subscription Plan created (Live)
- [ ] Webhooks configurados (ambos)
- [ ] Cloud Functions deployed
- [ ] Frontend deployed
- [ ] Testing en sandbox completado
- [ ] Custom claims funcionando

### Launch Day
- [ ] Switch a Live mode (Stripe + PayPal)
- [ ] Actualizar frontend con Live keys
- [ ] Deploy functions con Live config
- [ ] Deploy hosting
- [ ] Test real payment (pequeña cantidad)
- [ ] Verificar webhook received
- [ ] Verificar Firestore updated
- [ ] Verificar custom claims updated
- [ ] Monitor logs por 24h

### Post-Launch
- [ ] Setup monitoring (Sentry)
- [ ] Setup analytics dashboard
- [ ] Daily monitoring de pagos
- [ ] Weekly revenue reports
- [ ] Monitor failed payments
- [ ] User feedback collection

---

## 🎯 Next Steps

### Mejoras Futuras

1. **Email Notifications**
   - Enviar email confirmación de pago
   - Invoice PDF generado automáticamente

2. **Retry Logic para Failed Payments**
   - Reintento automático después de 24h
   - Notificación al usuario

3. **A/B Testing**
   - Test cuál provider convierte mejor
   - Test diferentes copy/diseño

4. **Analytics Dashboard**
   - Revenue por día/semana/mes
   - Conversión por provider
   - Failed payment rate

5. **Cupones/Descuentos**
   - Sistema de cupones
   - Ofertas especiales

6. **Refund Management**
   - UI para admins manejar refunds
   - Automático si usuario reporta problema

---

## 📞 Soporte

### Stripe Support
- Dashboard → Help
- Email: support@stripe.com
- Docs: https://stripe.com/docs

### PayPal Support
- Business Support: https://www.paypal.com/businesshelp
- Developer: https://developer.paypal.com/support/

### Firebase Support
- Console → Support
- Docs: https://firebase.google.com/docs

---

**Última actualización:** 2025-11-15
**Autor:** Claude AI
**Estado:** Implementación completa, pendiente deployment
