#!/bin/bash
# Sistema Dual de Pagos - Script de Configuración
# TuCitaSegura - tuscitasseguras-2d1a6

set -e  # Exit on error

echo "=================================="
echo "🚀 TuCitaSegura - Dual Payment Setup"
echo "=================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo -e "${RED}❌ Firebase CLI no está instalado${NC}"
    echo ""
    echo "Instalando Firebase CLI..."
    npm install -g firebase-tools
    echo -e "${GREEN}✅ Firebase CLI instalado${NC}"
else
    echo -e "${GREEN}✅ Firebase CLI ya está instalado${NC}"
fi

echo ""
echo "=================================="
echo "📝 PASO 1: LOGIN A FIREBASE"
echo "=================================="
echo ""
firebase login

echo ""
echo "=================================="
echo "🔑 PASO 2: CONFIGURAR STRIPE"
echo "=================================="
echo ""
echo "Necesitas obtener tus Stripe API keys:"
echo "1. Ve a: https://dashboard.stripe.com/test/apikeys"
echo "2. Copia las keys (usa TEST MODE por ahora)"
echo ""

read -p "Stripe Publishable Key (pk_test_...): " STRIPE_PK
read -p "Stripe Secret Key (sk_test_...): " STRIPE_SK

if [ -z "$STRIPE_PK" ] || [ -z "$STRIPE_SK" ]; then
    echo -e "${RED}❌ Error: Stripe keys requeridas${NC}"
    exit 1
fi

# Configure Stripe in Firebase Functions
firebase functions:config:set stripe.secret_key="$STRIPE_SK"
echo -e "${GREEN}✅ Stripe secret key configurada${NC}"

# Update frontend files
echo "Actualizando suscripcion.html..."
sed -i "s/YOUR_STRIPE_PUBLISHABLE_KEY/$STRIPE_PK/g" webapp/suscripcion.html

echo "Actualizando seguro.html..."
sed -i "s/YOUR_STRIPE_PUBLISHABLE_KEY/$STRIPE_PK/g" webapp/seguro.html

echo -e "${GREEN}✅ Stripe configurado en frontend${NC}"

echo ""
echo "=================================="
echo "🔑 PASO 3: CONFIGURAR PAYPAL"
echo "=================================="
echo ""
echo "Necesitas obtener tus PayPal API keys:"
echo "1. Ve a: https://developer.paypal.com/dashboard/applications/sandbox"
echo "2. Crea una app o usa una existente"
echo "3. Copia Client ID (usa SANDBOX por ahora)"
echo ""

read -p "PayPal Client ID (sandbox): " PAYPAL_CLIENT_ID

if [ -z "$PAYPAL_CLIENT_ID" ]; then
    echo -e "${RED}❌ Error: PayPal Client ID requerido${NC}"
    exit 1
fi

# Update frontend files
echo "Actualizando suscripcion.html..."
sed -i "s/YOUR_PAYPAL_CLIENT_ID/$PAYPAL_CLIENT_ID/g" webapp/suscripcion.html

echo "Actualizando seguro.html..."
sed -i "s/YOUR_PAYPAL_CLIENT_ID/$PAYPAL_CLIENT_ID/g" webapp/seguro.html

echo -e "${GREEN}✅ PayPal configurado en frontend${NC}"

echo ""
echo "=================================="
echo "📦 PASO 4: CREAR PAYPAL SUBSCRIPTION PLAN"
echo "=================================="
echo ""
echo "Necesitas crear un plan de suscripción en PayPal:"
echo "1. Ve a: https://www.sandbox.paypal.com/ (login)"
echo "2. Products & Services → Subscriptions → Create Plan"
echo "3. Plan details:"
echo "   - Name: TuCitaSegura - Membresía Premium"
echo "   - Price: €29.99 EUR"
echo "   - Billing cycle: Monthly"
echo "4. Copia el Plan ID (empieza con P-...)"
echo ""

read -p "PayPal Plan ID (P-...): " PAYPAL_PLAN_ID

if [ -z "$PAYPAL_PLAN_ID" ]; then
    echo -e "${YELLOW}⚠️  Warning: PayPal Plan ID no configurado - tendrás que hacerlo manualmente${NC}"
else
    # Update subscription plan ID
    echo "Actualizando suscripcion.html..."
    sed -i "s/YOUR_SUBSCRIPTION_PLAN_ID/$PAYPAL_PLAN_ID/g" webapp/suscripcion.html
    echo -e "${GREEN}✅ PayPal Plan ID configurado${NC}"
fi

echo ""
echo "=================================="
echo "🚀 PASO 5: DEPLOY CLOUD FUNCTIONS"
echo "=================================="
echo ""
echo "Instalando dependencias..."
cd functions
npm install
cd ..

echo "Deploying Cloud Functions..."
firebase deploy --only functions

echo -e "${GREEN}✅ Cloud Functions deployed${NC}"

echo ""
echo "=================================="
echo "🌐 PASO 6: DEPLOY HOSTING"
echo "=================================="
echo ""
firebase deploy --only hosting

echo -e "${GREEN}✅ Hosting deployed${NC}"

echo ""
echo "=================================="
echo "🔗 PASO 7: CONFIGURAR WEBHOOKS"
echo "=================================="
echo ""
echo "Obtén la URL de tus Cloud Functions:"
firebase functions:list | grep -E "(stripeWebhook|paypalWebhook)"

echo ""
echo "Configura los webhooks:"
echo ""
echo "STRIPE:"
echo "1. Ve a: https://dashboard.stripe.com/test/webhooks"
echo "2. Add endpoint"
echo "3. URL: https://us-central1-tuscitasseguras-2d1a6.cloudfunctions.net/stripeWebhook"
echo "4. Events:"
echo "   - checkout.session.completed"
echo "   - customer.subscription.created"
echo "   - customer.subscription.updated"
echo "   - customer.subscription.deleted"
echo "   - invoice.payment_succeeded"
echo ""
echo "PAYPAL:"
echo "1. Ve a: https://developer.paypal.com/dashboard/applications/sandbox"
echo "2. Tu app → Webhooks → Add Webhook"
echo "3. URL: https://us-central1-tuscitasseguras-2d1a6.cloudfunctions.net/paypalWebhook"
echo "4. Events:"
echo "   - BILLING.SUBSCRIPTION.ACTIVATED"
echo "   - BILLING.SUBSCRIPTION.CANCELLED"
echo "   - PAYMENT.SALE.COMPLETED"
echo ""

read -p "Presiona ENTER cuando hayas configurado los webhooks..."

echo ""
echo "=================================="
echo "✅ CONFIGURACIÓN COMPLETA"
echo "=================================="
echo ""
echo "URLs de tu aplicación:"
echo "  Production: https://tuscitasseguras-2d1a6.web.app"
echo "  Membership: https://tuscitasseguras-2d1a6.web.app/webapp/suscripcion.html"
echo "  Insurance:  https://tuscitasseguras-2d1a6.web.app/webapp/seguro.html"
echo ""
echo "Próximos pasos:"
echo "1. Prueba pagos en modo SANDBOX"
echo "2. Usa tarjeta Stripe test: 4242 4242 4242 4242"
echo "3. Usa cuenta PayPal sandbox (crear en developer.paypal.com)"
echo "4. Verifica que Firestore se actualiza correctamente"
echo ""
echo "Para producción:"
echo "1. Cambia a Stripe LIVE keys"
echo "2. Cambia a PayPal LIVE client ID"
echo "3. Crea PayPal Plan en modo LIVE"
echo "4. Actualiza webhooks con URLs de producción"
echo "5. Re-deploy: firebase deploy"
echo ""
echo -e "${GREEN}🎉 Sistema Dual de Pagos configurado!${NC}"
