# 🚀 Guía Rápida: Configuración del Sistema Dual de Pagos

## ⚡ Opción 1: Script Automático (Recomendado)

```bash
cd /home/user/t2c06
./setup-payments.sh
```

El script te guiará paso a paso. Solo necesitas:
1. Tus Stripe API keys (test mode)
2. Tu PayPal Client ID (sandbox)
3. Tu PayPal Plan ID (crear primero)

---

## 📝 Opción 2: Configuración Manual

### PASO 1: Instalar Firebase CLI

```bash
npm install -g firebase-tools
firebase login
```

---

### PASO 2: Obtener Stripe Keys

1. **Crear cuenta:** https://dashboard.stripe.com/register
2. **Ir a API Keys:** https://dashboard.stripe.com/test/apikeys
3. **Copiar:**
   - Publishable key: `pk_test_...`
   - Secret key: `sk_test_...`

**Configurar en Firebase:**
```bash
firebase functions:config:set stripe.secret_key="sk_test_XXXXXXX"
```

**Actualizar frontend:**
```bash
# webapp/suscripcion.html (línea ~295)
const stripe = Stripe('pk_test_XXXXXXX');

# webapp/seguro.html (línea ~342)
const stripe = Stripe('pk_test_XXXXXXX');
```

---

### PASO 3: Obtener PayPal Client ID

1. **Crear cuenta:** https://www.paypal.com/bizsignup/
2. **Developer Dashboard:** https://developer.paypal.com/dashboard/applications/sandbox
3. **Create App** → Copiar Client ID

**Actualizar frontend:**
```bash
# webapp/suscripcion.html (línea ~15)
<script src="https://www.paypal.com/sdk/js?client-id=TU_CLIENT_ID&vault=true&intent=subscription"></script>

# webapp/seguro.html (línea ~15)
<script src="https://www.paypal.com/sdk/js?client-id=TU_CLIENT_ID&currency=EUR"></script>
```

---

### PASO 4: Crear PayPal Subscription Plan

1. **Login sandbox:** https://www.sandbox.paypal.com/
2. **Products & Services → Subscriptions → Create Plan**
3. **Configurar:**
   ```
   Plan Name: TuCitaSegura - Membresía Premium
   Price: €29.99 EUR
   Billing Cycle: Monthly (Every 1 month)
   ```
4. **Copiar Plan ID:** Empieza con `P-`

**Actualizar frontend:**
```bash
# webapp/suscripcion.html (línea ~322)
'plan_id': 'P-XXXXXXXXXXXXXXX'
```

---

### PASO 5: Deploy Cloud Functions

```bash
cd /home/user/t2c06/functions
npm install
cd ..
firebase deploy --only functions
```

**Espera a que termine (~2-3 minutos)**

Verás output similar a:
```
✔  functions[createStripeCheckoutSession] Successful create operation.
✔  functions[stripeWebhook] Successful update operation.
✔  functions[paypalWebhook] Successful update operation.
```

---

### PASO 6: Deploy Hosting

```bash
firebase deploy --only hosting
```

**URL de producción:** https://tuscitasseguras-2d1a6.web.app

---

### PASO 7: Configurar Webhooks

#### Stripe Webhooks

1. **Dashboard:** https://dashboard.stripe.com/test/webhooks
2. **Add endpoint**
3. **Endpoint URL:**
   ```
   https://us-central1-tuscitasseguras-2d1a6.cloudfunctions.net/stripeWebhook
   ```
4. **Select events:**
   - ✅ `checkout.session.completed`
   - ✅ `customer.subscription.created`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
   - ✅ `invoice.payment_succeeded`
   - ✅ `invoice.payment_failed`

5. **Add endpoint**
6. **Copiar Signing Secret:** `whsec_...`

**Configurar en Firebase:**
```bash
firebase functions:config:set stripe.webhook_secret="whsec_XXXXXXX"
firebase deploy --only functions  # Re-deploy
```

#### PayPal Webhooks

1. **Dashboard:** https://developer.paypal.com/dashboard/applications/sandbox
2. **Tu app → Webhooks → Add Webhook**
3. **Webhook URL:**
   ```
   https://us-central1-tuscitasseguras-2d1a6.cloudfunctions.net/paypalWebhook
   ```
4. **Event types:**
   - ✅ `BILLING.SUBSCRIPTION.ACTIVATED`
   - ✅ `BILLING.SUBSCRIPTION.CANCELLED`
   - ✅ `BILLING.SUBSCRIPTION.EXPIRED`
   - ✅ `PAYMENT.SALE.COMPLETED`
   - ✅ `PAYMENT.SALE.DENIED`
   - ✅ `PAYMENT.SALE.REFUNDED`

5. **Save**

---

### PASO 8: Testing en Sandbox

#### Test Stripe

1. **Ir a:** https://tuscitasseguras-2d1a6.web.app/webapp/suscripcion.html
2. **Registrarse/Login**
3. **Click en "Pago Seguro con Stripe"**
4. **Usar tarjeta test:**
   ```
   Número: 4242 4242 4242 4242
   Expiry: 12/34 (cualquier fecha futura)
   CVC: 123 (cualquier 3 dígitos)
   ZIP: 12345 (cualquier 5 dígitos)
   ```
5. **Complete Payment**
6. **Verificar:**
   - Redirect a success page ✅
   - Firestore actualizado:
     ```javascript
     users/{uid}:
       hasActiveSubscription: true
       paymentProvider: "stripe"
       subscriptionId: "sub_XXXXX"
     ```
   - Custom claims actualizados (re-login)

#### Test PayPal

1. **Crear cuenta sandbox buyer:**
   - https://developer.paypal.com/dashboard/accounts
   - Create Account → Personal (Buyer)
   - Email: `sb-xxxxx@personal.example.com`
   - Password: (auto-generado)

2. **Test payment:**
   - Click botón PayPal
   - Login con cuenta sandbox buyer
   - Complete payment
   - Verificar Firestore actualizado

---

## 🐛 Troubleshooting

### Error: "firebase: command not found"

```bash
npm install -g firebase-tools
```

### Error: "stripe is not defined"

Verifica que el script de Stripe esté cargando:
```html
<script src="https://js.stripe.com/v3/"></script>
```

### Error: "createStripeCheckoutSession is not a function"

```bash
# Re-deploy functions
firebase deploy --only functions
```

### PayPal button no aparece

1. Verifica Client ID en el SDK script
2. Abre DevTools Console → mira errores de PayPal
3. Verifica que Plan ID existe

### Webhooks no funcionan

1. **Ver logs:**
   ```bash
   firebase functions:log --only stripeWebhook
   firebase functions:log --only paypalWebhook
   ```

2. **Test webhook manualmente:**
   - Stripe CLI: `stripe trigger checkout.session.completed`
   - PayPal: Usar webhook simulator en developer dashboard

---

## ✅ Checklist de Configuración

- [ ] Firebase CLI instalado
- [ ] Logged in a Firebase
- [ ] Stripe test keys obtenidas
- [ ] Stripe secret key configurada en Functions
- [ ] Stripe publishable key en frontend
- [ ] PayPal sandbox Client ID obtenido
- [ ] PayPal Client ID en frontend
- [ ] PayPal Subscription Plan creado
- [ ] PayPal Plan ID en frontend
- [ ] Cloud Functions deployed
- [ ] Hosting deployed
- [ ] Stripe webhook configurado
- [ ] PayPal webhook configurado
- [ ] Test Stripe exitoso
- [ ] Test PayPal exitoso
- [ ] Firestore actualizado correctamente
- [ ] Custom claims funcionando

---

## 🚀 Para Producción (Antes del 1 Enero)

### 1. Cambiar a LIVE Mode

**Stripe:**
```bash
# Obtener LIVE keys: https://dashboard.stripe.com/apikeys
firebase functions:config:set stripe.secret_key="sk_live_XXXXX"

# Actualizar frontend
const stripe = Stripe('pk_live_XXXXX');
```

**PayPal:**
```bash
# Obtener LIVE Client ID: https://developer.paypal.com/dashboard/applications/live
# Actualizar frontend
<script src="https://www.paypal.com/sdk/js?client-id=LIVE_CLIENT_ID&vault=true"></script>

# Crear Plan en LIVE mode
# Actualizar Plan ID en suscripcion.html
```

### 2. Re-Deploy

```bash
firebase deploy --only functions,hosting
```

### 3. Actualizar Webhooks

- Stripe: Agregar endpoint en **LIVE** mode
- PayPal: Agregar webhook en **LIVE** app

### 4. Test Real

Hacer un pago real de €1 para verificar todo funciona.

---

## 📞 Soporte

Si tienes problemas:
1. Ver logs: `firebase functions:log`
2. Revisar DUAL_PAYMENT_IMPLEMENTATION.md
3. Contactar soporte de Stripe/PayPal

---

**Última actualización:** 2025-11-15
**Tiempo estimado:** 30-45 minutos
