# 💳 Arquitectura Dual de Pagos - PayPal + Stripe

## 🎯 Objetivo

Ofrecer ambas opciones de pago (PayPal Y Stripe) para maximizar conversión y reducir fricción.

---

## 📊 Ventajas de Sistema Dual

### ✅ Para Usuarios
- **Flexibilidad:** Elige su método preferido
- **Confianza:** PayPal muy conocido en España
- **Conveniencia:** Stripe para pago con tarjeta directo
- **Conversión +25%:** Menos abandonos de pago

### ✅ Para Negocio
- **Mayor conversión:** Reduce fricción de pago
- **Redundancia:** Si uno falla, el otro funciona
- **Competitivo:** Mayoría de plataformas solo tienen 1
- **Analytics:** Comparar cuál convierte mejor

### ⚠️ Desventajas
- **Complejidad:** 2 integraciones que mantener
- **Webhooks duplicados:** Más monitoreo
- **Testing doble:** Probar ambos flujos
- **Costos:** 2 procesadores toman fees

---

## 🏗️ Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND                                  │
│                                                              │
│  suscripcion.html / seguro.html                             │
│  ┌───────────────┐         ┌───────────────┐              │
│  │  PayPal SDK   │         │  Stripe.js    │              │
│  │  (Buttons)    │         │  (Elements)   │              │
│  └───────┬───────┘         └───────┬───────┘              │
│          │                         │                        │
└──────────┼─────────────────────────┼────────────────────────┘
           │                         │
           ▼                         ▼
┌──────────────────┐       ┌──────────────────┐
│   PayPal API     │       │   Stripe API     │
│   (External)     │       │   (External)     │
└──────────┬───────┘       └──────────┬───────┘
           │                         │
           │ Webhook                 │ Webhook
           ▼                         ▼
┌─────────────────────────────────────────────────────────────┐
│              CLOUD FUNCTIONS (Backend)                       │
│                                                              │
│  ┌───────────────────┐   ┌───────────────────┐            │
│  │ paypalWebhook     │   │ stripeWebhook     │            │
│  │ (Verify + Update) │   │ (Verify + Update) │            │
│  └────────┬──────────┘   └────────┬──────────┘            │
│           │                       │                         │
│           └───────────┬───────────┘                         │
│                       ▼                                     │
│            updateUserMembership()                           │
│            updateUserInsurance()                            │
│            updateCustomClaims()                             │
└─────────────────────────┬───────────────────────────────────┘
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    FIRESTORE                                 │
│                                                              │
│  users/{uid}:                                               │
│    - hasActiveSubscription: boolean                         │
│    - hasAntiGhostingInsurance: boolean                      │
│    - paymentMethod: "paypal" | "stripe"  ← NUEVO           │
│    - subscriptionId: string                                 │
│    - insurancePaymentId: string                             │
│                                                              │
│  subscriptions/{id}:                                        │
│    - userId                                                 │
│    - provider: "paypal" | "stripe"  ← NUEVO                │
│    - status                                                 │
│    - amount                                                 │
│                                                              │
│  insurance_payments/{id}:                                   │
│    - userId                                                 │
│    - provider: "paypal" | "stripe"  ← NUEVO                │
│    - amount                                                 │
└─────────────────────────────────────────────────────────────┘
```

---

## 💰 Comparación PayPal vs Stripe

| Aspecto | PayPal | Stripe |
|---------|--------|--------|
| **Fees** | 2.9% + €0.35 | 1.5% + €0.25 |
| **Popularidad España** | ⭐⭐⭐⭐⭐ Muy alto | ⭐⭐⭐⭐ Alto |
| **UX** | Redirect a PayPal | Inline en página |
| **Confianza** | ⭐⭐⭐⭐⭐ Muy alta | ⭐⭐⭐⭐ Alta |
| **Setup** | Más simple | Más complejo |
| **Webhooks** | Más simples | Más robustos |
| **Subscriptions** | ✅ Nativo | ✅ Nativo |
| **One-time** | ✅ Sí | ✅ Sí |

**Recomendación:** Ofrecer AMBOS - usuarios eligen su preferido

---

## 🔧 Implementación

### 1. Frontend - suscripcion.html

```html
<!-- Dual Payment Options -->
<div class="grid md:grid-cols-2 gap-6 mb-8">

  <!-- PayPal Option -->
  <div class="glass p-6 rounded-xl">
    <div class="text-center mb-4">
      <i class="fab fa-paypal text-4xl text-blue-400"></i>
      <h3 class="text-xl font-bold mt-2">Pagar con PayPal</h3>
      <p class="text-slate-300 text-sm">Rápido y seguro</p>
    </div>
    <div id="paypal-button-container"></div>
  </div>

  <!-- Stripe Option -->
  <div class="glass p-6 rounded-xl">
    <div class="text-center mb-4">
      <i class="far fa-credit-card text-4xl text-green-400"></i>
      <h3 class="text-xl font-bold mt-2">Pagar con Tarjeta</h3>
      <p class="text-slate-300 text-sm">Visa, Mastercard, Amex</p>
    </div>
    <button id="stripe-checkout-button" class="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3 px-6 rounded-xl transition transform hover:scale-105">
      <i class="fas fa-lock mr-2"></i>
      Pago Seguro
    </button>
  </div>

</div>
```

**JavaScript:**
```javascript
// PayPal SDK
paypal.Buttons({
  createSubscription: function(data, actions) {
    return actions.subscription.create({
      'plan_id': 'PAYPAL_PLAN_ID'
    });
  },
  onApprove: async function(data, actions) {
    await updateFirestore(data.subscriptionID, 'paypal');
  }
}).render('#paypal-button-container');

// Stripe Checkout
document.getElementById('stripe-checkout-button').addEventListener('click', async () => {
  const response = await fetch('/createCheckoutSession', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: currentUser.uid,
      provider: 'stripe'
    })
  });
  const session = await response.json();
  const stripe = Stripe('YOUR_PUBLISHABLE_KEY');
  await stripe.redirectToCheckout({ sessionId: session.id });
});
```

---

### 2. Cloud Functions - Webhooks Duales

#### PayPal Webhook Handler
```javascript
// functions/index.js

exports.paypalWebhook = functions.https.onRequest(async (req, res) => {
  try {
    // 1. Verify webhook signature
    const isValid = verifyPayPalSignature(req);
    if (!isValid) {
      return res.status(401).send('Invalid signature');
    }

    const event = req.body;
    const eventType = event.event_type;

    // 2. Handle event types
    switch (eventType) {
      case 'BILLING.SUBSCRIPTION.ACTIVATED':
        await handlePayPalSubscriptionActivated(event);
        break;

      case 'BILLING.SUBSCRIPTION.CANCELLED':
        await handlePayPalSubscriptionCancelled(event);
        break;

      case 'PAYMENT.SALE.COMPLETED':
        await handlePayPalPaymentCompleted(event);
        break;

      default:
        console.log(`Unhandled PayPal event: ${eventType}`);
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('PayPal webhook error:', error);
    res.status(500).send('Error');
  }
});

async function handlePayPalSubscriptionActivated(event) {
  const subscriptionId = event.resource.id;
  const customId = event.resource.custom_id; // userId

  await updateUserMembership(customId, 'active', {
    subscriptionId: subscriptionId,
    provider: 'paypal',
    startDate: new Date(event.resource.start_time)
  });
}

async function handlePayPalPaymentCompleted(event) {
  const customId = event.resource.custom; // userId
  const amount = parseFloat(event.resource.amount.total);

  // Insurance payment (one-time €120)
  if (amount === 120) {
    await updateUserInsurance(customId, {
      paymentId: event.resource.id,
      provider: 'paypal',
      amount: amount,
      purchaseDate: new Date(event.create_time)
    });
  }
}
```

#### Stripe Webhook Handler (Ya existe)
```javascript
// Ya implementado en functions/index.js
exports.stripeWebhook = functions.https.onRequest(async (req, res) => {
  // Existing implementation
  // Just add provider: 'stripe' to updateData
});
```

---

### 3. Actualizar Helper Functions

```javascript
// functions/index.js

async function updateUserMembership(userId, status, subscriptionData = {}) {
  const db = admin.firestore();
  const userRef = db.collection('users').doc(userId);

  const updateData = {
    hasActiveSubscription: status === 'active',
    subscriptionStatus: status,
    paymentProvider: subscriptionData.provider || 'unknown', // ← NUEVO
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  };

  if (subscriptionData.subscriptionId) {
    updateData.subscriptionId = subscriptionData.subscriptionId;
  }
  if (subscriptionData.startDate) {
    updateData.subscriptionStartDate = subscriptionData.startDate;
  }
  if (subscriptionData.endDate) {
    updateData.subscriptionEndDate = subscriptionData.endDate;
  }

  await userRef.update(updateData);

  // Update custom claims
  const currentUser = await admin.auth().getUser(userId);
  const currentClaims = currentUser.customClaims || {};

  await admin.auth().setCustomClaims(userId, {
    ...currentClaims,
    hasActiveSubscription: status === 'active'
  });

  return updateData;
}

async function updateUserInsurance(userId, paymentData) {
  const db = admin.firestore();
  const userRef = db.collection('users').doc(userId);

  const updateData = {
    hasAntiGhostingInsurance: true,
    insurancePaymentId: paymentData.paymentId,
    insuranceProvider: paymentData.provider || 'unknown', // ← NUEVO
    insurancePurchaseDate: paymentData.purchaseDate || admin.firestore.FieldValue.serverTimestamp(),
    insuranceAmount: paymentData.amount || 120,
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  };

  await userRef.update(updateData);

  // Update custom claims
  const currentUser = await admin.auth().getUser(userId);
  const currentClaims = currentUser.customClaims || {};

  await admin.auth().setCustomClaims(userId, {
    ...currentClaims,
    hasAntiGhostingInsurance: true
  });

  return updateData;
}

async function logSubscription(userId, subscriptionData) {
  const db = admin.firestore();
  await db.collection('subscriptions').add({
    userId,
    provider: subscriptionData.provider, // ← NUEVO: 'paypal' | 'stripe'
    subscriptionId: subscriptionData.subscriptionId,
    status: subscriptionData.status,
    amount: subscriptionData.amount,
    startDate: subscriptionData.startDate,
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });
}
```

---

### 4. Firestore Schema Updates

```javascript
// users collection
{
  uid: string,
  email: string,

  // Membresía
  hasActiveSubscription: boolean,
  subscriptionStatus: "active" | "canceled" | "expired",
  subscriptionId: string,
  paymentProvider: "paypal" | "stripe",  // ← NUEVO
  subscriptionStartDate: Timestamp,
  subscriptionEndDate: Timestamp,

  // Seguro
  hasAntiGhostingInsurance: boolean,
  insurancePaymentId: string,
  insuranceProvider: "paypal" | "stripe",  // ← NUEVO
  insurancePurchaseDate: Timestamp,
  insuranceAmount: number,

  // Metadata
  createdAt: Timestamp,
  updatedAt: Timestamp
}

// subscriptions collection
{
  id: auto-generated,
  userId: string,
  provider: "paypal" | "stripe",  // ← NUEVO
  subscriptionId: string,
  status: "active" | "canceled" | "expired",
  amount: number,
  currency: "EUR",
  startDate: Timestamp,
  endDate: Timestamp,
  createdAt: Timestamp
}

// insurance_payments collection
{
  id: auto-generated,
  userId: string,
  provider: "paypal" | "stripe",  // ← NUEVO
  paymentId: string,
  amount: number,
  currency: "EUR",
  purchaseDate: Timestamp,
  status: "completed",
  createdAt: Timestamp
}
```

---

## 🔒 Configuración de Webhooks

### PayPal
1. **PayPal Developer Dashboard:** https://developer.paypal.com/dashboard
2. **Apps & Credentials** → Select app
3. **Webhooks** → Add Webhook
4. **URL:** `https://YOUR_PROJECT.cloudfunctions.net/paypalWebhook`
5. **Events to subscribe:**
   - `BILLING.SUBSCRIPTION.ACTIVATED`
   - `BILLING.SUBSCRIPTION.CANCELLED`
   - `BILLING.SUBSCRIPTION.EXPIRED`
   - `PAYMENT.SALE.COMPLETED`

### Stripe
1. **Stripe Dashboard:** https://dashboard.stripe.com/webhooks
2. **Add endpoint**
3. **URL:** `https://YOUR_PROJECT.cloudfunctions.net/stripeWebhook`
4. **Events to subscribe:**
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`

---

## 📊 Analytics & Tracking

### Métricas a Trackear

```javascript
// Firestore collection: payment_analytics
{
  date: Timestamp,
  provider: "paypal" | "stripe",
  product: "membership" | "insurance",
  amount: number,
  userId: string,
  status: "completed" | "failed",
  conversionSource: "webapp" | "mobile"
}
```

### Queries Útiles

```javascript
// ¿Qué proveedor convierte más?
db.collection('payment_analytics')
  .where('status', '==', 'completed')
  .where('product', '==', 'membership')
  .get()
  .then(snapshot => {
    const paypalCount = snapshot.docs.filter(d => d.data().provider === 'paypal').length;
    const stripeCount = snapshot.docs.filter(d => d.data().provider === 'stripe').length;
    console.log(`PayPal: ${paypalCount}, Stripe: ${stripeCount}`);
  });

// Revenue por proveedor
db.collection('payment_analytics')
  .where('status', '==', 'completed')
  .get()
  .then(snapshot => {
    const paypalRevenue = snapshot.docs
      .filter(d => d.data().provider === 'paypal')
      .reduce((sum, d) => sum + d.data().amount, 0);

    const stripeRevenue = snapshot.docs
      .filter(d => d.data().provider === 'stripe')
      .reduce((sum, d) => sum + d.data().amount, 0);

    console.log(`PayPal Revenue: €${paypalRevenue}`);
    console.log(`Stripe Revenue: €${stripeRevenue}`);
  });
```

---

## 🧪 Testing Strategy

### Sandbox Testing

#### PayPal Sandbox
```javascript
// Use sandbox client ID in development
const PAYPAL_CLIENT_ID = isDevelopment
  ? 'YOUR_SANDBOX_CLIENT_ID'
  : 'YOUR_PRODUCTION_CLIENT_ID';

// Load PayPal SDK
<script src="https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&vault=true&intent=subscription"></script>
```

**Test credentials:**
- Sandbox buyer: sb-buyer@business.example.com
- Password: (auto-generated in PayPal Developer Dashboard)

#### Stripe Test Mode
```javascript
// Use test keys in development
const STRIPE_PUBLISHABLE_KEY = isDevelopment
  ? 'pk_test_...'
  : 'pk_live_...';

// Test card numbers
// Success: 4242 4242 4242 4242
// Decline: 4000 0000 0000 0002
```

### Testing Checklist

**Membresía (€29.99/mes):**
- [ ] PayPal subscription created
- [ ] PayPal webhook received
- [ ] Firestore `hasActiveSubscription` = true
- [ ] Custom claims updated
- [ ] Stripe checkout created
- [ ] Stripe webhook received
- [ ] Firestore `hasActiveSubscription` = true
- [ ] Custom claims updated

**Seguro (€120 one-time):**
- [ ] PayPal payment completed
- [ ] PayPal webhook received
- [ ] Firestore `hasAntiGhostingInsurance` = true
- [ ] Custom claims updated
- [ ] Stripe payment completed
- [ ] Stripe webhook received
- [ ] Firestore `hasAntiGhostingInsurance` = true
- [ ] Custom claims updated

---

## 🚀 Deployment Checklist

### Pre-Deploy
- [ ] PayPal Business Account creado
- [ ] Stripe Account creado
- [ ] PayPal App configurada (client ID + secret)
- [ ] Stripe Keys obtenidas (publishable + secret)
- [ ] Cloud Functions actualizadas con webhooks
- [ ] Firestore schema actualizado
- [ ] Testing en sandbox completado

### Deploy
```bash
# 1. Set environment variables
firebase functions:config:set \
  paypal.client_id="YOUR_PAYPAL_CLIENT_ID" \
  paypal.client_secret="YOUR_PAYPAL_CLIENT_SECRET" \
  stripe.publishable_key="pk_live_..." \
  stripe.secret_key="sk_live_..."

# 2. Deploy functions
firebase deploy --only functions

# 3. Update frontend with production keys
# suscripcion.html: Update PayPal client ID
# seguro.html: Update PayPal client ID

# 4. Deploy hosting
firebase deploy --only hosting

# 5. Configure webhooks in PayPal + Stripe dashboards
```

### Post-Deploy
- [ ] Verificar webhooks funcionando (PayPal + Stripe dashboards)
- [ ] Test transaction real (pequeña cantidad)
- [ ] Monitor logs: `firebase functions:log`
- [ ] Verificar custom claims se actualizan
- [ ] Verificar Firestore se actualiza
- [ ] Setup monitoring (Sentry, Stripe Radar)

---

## 💡 Best Practices

### 1. Idempotency
```javascript
// Always use transaction IDs to prevent duplicates
async function handlePayment(transactionId, userId, data) {
  const db = admin.firestore();
  const paymentRef = db.collection('processed_payments').doc(transactionId);

  const payment = await paymentRef.get();
  if (payment.exists) {
    console.log(`Payment ${transactionId} already processed`);
    return;
  }

  // Process payment
  await updateUserMembership(userId, 'active', data);

  // Mark as processed
  await paymentRef.set({
    processedAt: admin.firestore.FieldValue.serverTimestamp(),
    userId,
    provider: data.provider
  });
}
```

### 2. Error Handling
```javascript
// Always handle webhook errors gracefully
exports.paypalWebhook = functions.https.onRequest(async (req, res) => {
  try {
    // Process webhook
    await handleWebhook(req.body);
    res.status(200).send('OK');
  } catch (error) {
    console.error('Webhook error:', error);

    // Log to Firestore for debugging
    await db.collection('webhook_errors').add({
      provider: 'paypal',
      error: error.message,
      payload: req.body,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });

    // Return 200 to prevent retries if it's a data error
    // Return 500 if it's a server error (PayPal will retry)
    res.status(200).send('Error logged');
  }
});
```

### 3. Logging
```javascript
// Log all payment events for audit
async function logPaymentEvent(event) {
  await db.collection('payment_events').add({
    provider: event.provider,
    eventType: event.type,
    userId: event.userId,
    amount: event.amount,
    status: event.status,
    metadata: event.metadata,
    timestamp: admin.firestore.FieldValue.serverTimestamp()
  });
}
```

---

## 📞 Support & Troubleshooting

### Common Issues

**Issue:** PayPal webhook not received
**Solution:**
1. Check webhook URL is correct
2. Verify webhook events are selected
3. Check PayPal Developer Dashboard → Webhooks → Activity

**Issue:** Stripe webhook signature invalid
**Solution:**
```javascript
const sig = req.headers['stripe-signature'];
const event = stripe.webhooks.constructEvent(
  req.rawBody,
  sig,
  process.env.STRIPE_WEBHOOK_SECRET
);
```

**Issue:** Custom claims not updating
**Solution:**
- User must re-login after claims update
- Or force token refresh:
```javascript
await auth.currentUser.getIdToken(true);
```

---

## 🎯 Métricas de Éxito

**Objetivos:**
- ✅ Conversión de pago: 60%+
- ✅ Uptime de webhooks: 99.9%+
- ✅ Payment failures: <2%
- ✅ Webhook processing time: <500ms

**KPIs:**
- Ratio PayPal vs Stripe usage
- Conversión por provider
- Revenue por provider
- Failed payments por provider
- Average time to payment completion

---

**Última actualización:** 2025-11-15
**Mantenedor:** TuCitaSegura Team
