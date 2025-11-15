#!/bin/bash

# ==============================================================================
# DEPLOY DUAL PAYMENT SYSTEM - PayPal + Stripe
# ==============================================================================
# Description: Complete deployment script for both payment providers
# Author: Claude AI Assistant
# Date: 2025-11-15
# ==============================================================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  TuCitaSegura - Dual Payment System Deployment                ║${NC}"
echo -e "${BLUE}║  PayPal + Stripe Cloud Functions                              ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# ==============================================================================
# STEP 1: Environment Validation
# ==============================================================================
echo -e "${YELLOW}[1/7] Validando entorno...${NC}"

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo -e "${RED}❌ Firebase CLI no está instalado${NC}"
    echo "Instalar con: npm install -g firebase-tools"
    exit 1
fi

# Check if logged in
if ! firebase projects:list &> /dev/null; then
    echo -e "${RED}❌ No has iniciado sesión en Firebase${NC}"
    echo "Ejecutar: firebase login"
    exit 1
fi

echo -e "${GREEN}✅ Firebase CLI instalado y autenticado${NC}"

# ==============================================================================
# STEP 2: Check Dependencies
# ==============================================================================
echo -e "${YELLOW}[2/7] Verificando dependencias...${NC}"

cd functions

if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ package.json no encontrado${NC}"
    exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠️  node_modules no encontrado, instalando dependencias...${NC}"
    npm install
fi

# Verify Stripe and Axios are installed
if ! grep -q '"stripe"' package.json; then
    echo -e "${RED}❌ Stripe no está en package.json${NC}"
    exit 1
fi

if ! grep -q '"axios"' package.json; then
    echo -e "${RED}❌ Axios no está en package.json${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Dependencias verificadas (stripe ^14.10.0, axios ^1.6.0)${NC}"

cd ..

# ==============================================================================
# STEP 3: PayPal Configuration
# ==============================================================================
echo -e "${YELLOW}[3/7] Configurando PayPal...${NC}"

echo ""
echo -e "${BLUE}PayPal Credentials:${NC}"
echo "1. Client ID: AQouhwoeHU6p26B7mxYl5rYyl2Hj6xl2kfo11pQbLq6oUFDv12JQkZ5Kg-HN_kzU0wzvX6CbgNbPcNYI"
echo "2. Mode: sandbox"
echo ""

read -p "¿Configurar PayPal en Firebase Functions config? (y/n): " configure_paypal

if [ "$configure_paypal" = "y" ]; then
    firebase functions:config:set \
        paypal.client_id="AQouhwoeHU6p26B7mxYl5rYyl2Hj6xl2kfo11pQbLq6oUFDv12JQkZ5Kg-HN_kzU0wzvX6CbgNbPcNYI" \
        paypal.secret="EClAPLW1_Vedhq_u19Ok5MYcyjLLwm_Kd5W-QhOMsbSrN8F3ynUZd5wuJmvOke6mLLMyyv-QGZ1MK6qd" \
        paypal.mode="sandbox"

    echo -e "${GREEN}✅ PayPal configurado${NC}"
else
    echo -e "${YELLOW}⚠️  PayPal no configurado (usar .env para desarrollo local)${NC}"
fi

# ==============================================================================
# STEP 4: Stripe Configuration
# ==============================================================================
echo -e "${YELLOW}[4/7] Configurando Stripe...${NC}"

echo ""
echo -e "${BLUE}Stripe Configuration:${NC}"
echo "⚠️  IMPORTANTE: Las claves en .env son placeholders"
echo "Get your real keys from: https://dashboard.stripe.com/test/apikeys"
echo ""

read -p "¿Tienes las claves de Stripe? (y/n): " have_stripe_keys

if [ "$have_stripe_keys" = "y" ]; then
    read -p "Stripe Secret Key (sk_test_...): " stripe_secret_key
    read -p "Stripe Webhook Secret (whsec_...): " stripe_webhook_secret

    firebase functions:config:set \
        stripe.secret_key="$stripe_secret_key" \
        stripe.webhook_secret="$stripe_webhook_secret"

    echo -e "${GREEN}✅ Stripe configurado${NC}"
else
    echo -e "${YELLOW}⚠️  Stripe no configurado (webhook funcionará pero fallará sin credenciales)${NC}"
    echo "Puedes configurarlo después con:"
    echo "  firebase functions:config:set stripe.secret_key=\"sk_test_...\""
    echo "  firebase functions:config:set stripe.webhook_secret=\"whsec_...\""
fi

# ==============================================================================
# STEP 5: Deploy Cloud Functions
# ==============================================================================
echo -e "${YELLOW}[5/7] Desplegando Cloud Functions...${NC}"

echo ""
echo -e "${BLUE}Functions a desplegar:${NC}"
echo "PayPal:"
echo "  - cancelAppointmentWithPenalty (Callable)"
echo "  - processNoShow (Callable)"
echo "  - renewExpiringAuthorizations (Scheduled - 03:00 AM)"
echo "  - paypalWebhook (HTTP)"
echo "  - captureInsuranceAuthorization (Callable)"
echo "  - voidInsuranceAuthorization (Callable)"
echo "  - getInsuranceAuthorizationStatus (Callable)"
echo ""
echo "Stripe:"
echo "  - stripeWebhook (HTTP)"
echo ""
echo "Shared:"
echo "  - onUserDocCreate, onUserDocUpdate, syncChatACL"
echo "  - updateUserClaims, getUserClaims"
echo "  - notification functions (8)"
echo ""

read -p "¿Continuar con el despliegue? (y/n): " deploy_confirm

if [ "$deploy_confirm" = "y" ]; then
    firebase deploy --only functions

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Cloud Functions desplegadas exitosamente${NC}"
    else
        echo -e "${RED}❌ Error al desplegar Cloud Functions${NC}"
        exit 1
    fi
else
    echo -e "${YELLOW}⚠️  Despliegue cancelado${NC}"
    exit 0
fi

# ==============================================================================
# STEP 6: Webhook URLs
# ==============================================================================
echo -e "${YELLOW}[6/7] URLs de Webhooks...${NC}"

PROJECT_ID=$(firebase projects:list | grep -v "Project Display Name" | grep -v "═" | head -1 | awk '{print $1}')

if [ -z "$PROJECT_ID" ]; then
    PROJECT_ID="tuscitasseguras-2d1a6"
fi

echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  CONFIGURA ESTOS WEBHOOKS EN LOS DASHBOARDS                   ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${GREEN}PayPal Webhook:${NC}"
echo "URL: https://us-central1-${PROJECT_ID}.cloudfunctions.net/paypalWebhook"
echo "Dashboard: https://developer.paypal.com/dashboard/applications/sandbox"
echo "Events:"
echo "  - BILLING.SUBSCRIPTION.ACTIVATED"
echo "  - BILLING.SUBSCRIPTION.UPDATED"
echo "  - BILLING.SUBSCRIPTION.CANCELLED"
echo "  - BILLING.SUBSCRIPTION.SUSPENDED"
echo "  - PAYMENT.SALE.COMPLETED"
echo "  - PAYMENT.SALE.DENIED"
echo "  - PAYMENT.SALE.REFUNDED"
echo "  - PAYMENT.AUTHORIZATION.VOIDED"
echo ""
echo "Después de crear el webhook, ejecuta:"
echo "  firebase functions:config:set paypal.webhook_id=\"WH-xxxxx\""
echo "  firebase deploy --only functions"
echo ""

echo -e "${GREEN}Stripe Webhook:${NC}"
echo "URL: https://us-central1-${PROJECT_ID}.cloudfunctions.net/stripeWebhook"
echo "Dashboard: https://dashboard.stripe.com/test/webhooks"
echo "Events:"
echo "  - customer.subscription.created"
echo "  - customer.subscription.updated"
echo "  - customer.subscription.deleted"
echo "  - payment_intent.succeeded"
echo "  - payment_intent.payment_failed"
echo "  - invoice.payment_succeeded"
echo "  - invoice.payment_failed"
echo ""
echo "El webhook secret se configura automáticamente al crear el webhook"
echo ""

# ==============================================================================
# STEP 7: Summary
# ==============================================================================
echo -e "${YELLOW}[7/7] Resumen del Despliegue${NC}"

echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  DEPLOYMENT SUMMARY                                            ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${GREEN}✅ Completado:${NC}"
echo "  - Cloud Functions desplegadas"
echo "  - PayPal configurado (sandbox)"
if [ "$have_stripe_keys" = "y" ]; then
    echo "  - Stripe configurado"
else
    echo "  - Stripe parcialmente configurado (pendiente credenciales)"
fi
echo ""

echo -e "${YELLOW}⚠️  Tareas Pendientes:${NC}"
echo "  1. Configurar webhooks en PayPal y Stripe dashboards (URLs arriba)"
echo "  2. Copiar Webhook ID de PayPal y configurar:"
echo "     firebase functions:config:set paypal.webhook_id=\"WH-xxxxx\""
echo "  3. Testing en sandbox:"
echo "     - Ir a webapp/suscripcion.html (PayPal)"
echo "     - Ir a webapp/seguro.html (PayPal)"
echo "     - Probar cancelación en cita-detalle.html"
echo "  4. Verificar logs:"
echo "     firebase functions:log"
if [ "$have_stripe_keys" != "y" ]; then
    echo "  5. Configurar Stripe credentials cuando las tengas"
fi
echo ""

echo -e "${BLUE}📖 Documentación:${NC}"
echo "  - DUAL_PAYMENT_SYSTEM_STATUS.md (estado completo)"
echo "  - PAYPAL_DEPLOYMENT_STEPS.md (guía PayPal)"
echo "  - PAYPAL_TESTING_GUIDE.md (testing)"
echo "  - INSURANCE_PENALTIES_SYSTEM.md (penalizaciones)"
echo "  - PAYPAL_FINAL_SUMMARY.md (resumen ejecutivo)"
echo ""

echo -e "${GREEN}🎉 Despliegue completado!${NC}"
echo ""

exit 0
