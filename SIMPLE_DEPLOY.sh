#!/bin/bash

# Deployment Simple - Solo Rules (No requiere autenticación)
# Este script deploya solo las reglas de Firestore y Storage

echo "=================================================="
echo "🚀 Deployment Simple - Solo Security Rules"
echo "=================================================="
echo ""

echo "⚠️  IMPORTANTE:"
echo "   Este método deploya solo las reglas de seguridad."
echo "   Las Cloud Functions requieren autenticación completa."
echo ""

# Verificar archivos
echo "📋 Verificando archivos de reglas..."
echo ""

if [ -f "firestore.rules" ]; then
    echo "✅ firestore.rules encontrado"
    echo "   Líneas: $(wc -l < firestore.rules)"
else
    echo "❌ firestore.rules NO encontrado"
    exit 1
fi

if [ -f "firebase-storage.rules" ]; then
    echo "✅ firebase-storage.rules encontrado"
    echo "   Líneas: $(wc -l < firebase-storage.rules)"
else
    echo "❌ firebase-storage.rules NO encontrado"
    exit 1
fi

echo ""
echo "=================================================="
echo "📊 Resumen de Reglas a Deployar"
echo "=================================================="
echo ""

echo "1️⃣  FIRESTORE RULES:"
echo "   - Custom claims validation (role, gender)"
echo "   - Protección por género"
echo "   - Chat ACL"
echo "   - Roles: admin, concierge, regular"
echo ""

echo "2️⃣  STORAGE RULES:"
echo "   - Profile photos: /profile_photos/{gender}/{userId}/"
echo "   - Chat attachments protegidos"
echo "   - Validación por autenticación"
echo ""

echo "=================================================="
echo "🔑 Opciones de Deployment"
echo "=================================================="
echo ""

echo "Selecciona una opción:"
echo ""
echo "1) Ver las reglas de Firestore (sin deployar)"
echo "2) Ver las reglas de Storage (sin deployar)"
echo "3) Copiar comando para deployment manual"
echo "4) Instrucciones para autenticación"
echo "5) Salir"
echo ""

read -p "Opción (1-5): " OPTION

case $OPTION in
  1)
    echo ""
    echo "📄 FIRESTORE RULES:"
    echo "=================================================="
    cat firestore.rules
    echo "=================================================="
    ;;
  2)
    echo ""
    echo "📄 STORAGE RULES:"
    echo "=================================================="
    cat firebase-storage.rules
    echo "=================================================="
    ;;
  3)
    echo ""
    echo "📋 COMANDOS PARA DEPLOYMENT MANUAL:"
    echo "=================================================="
    echo ""
    echo "1. Primero autentícate:"
    echo "   firebase login"
    echo ""
    echo "2. Luego deploya todo:"
    echo "   firebase deploy"
    echo ""
    echo "   O deploya solo las reglas:"
    echo "   firebase deploy --only firestore:rules,storage"
    echo ""
    echo "   O deploya solo Functions:"
    echo "   firebase deploy --only functions"
    echo ""
    echo "=================================================="
    ;;
  4)
    echo ""
    echo "🔑 INSTRUCCIONES PARA AUTENTICACIÓN:"
    echo "=================================================="
    echo ""
    echo "MÉTODO 1: Con acceso a navegador (Recomendado)"
    echo "----------------------------------------------"
    echo "1. Abre una terminal"
    echo "2. Ejecuta: firebase login"
    echo "3. Se abrirá tu navegador"
    echo "4. Inicia sesión con tu cuenta de Google"
    echo "5. Autoriza Firebase CLI"
    echo "6. Vuelve a la terminal"
    echo ""
    echo "MÉTODO 2: Sin navegador (CI/CD)"
    echo "--------------------------------"
    echo "1. Ve a Firebase Console:"
    echo "   https://console.firebase.google.com/project/tuscitasseguras-2d1a6/settings/serviceaccounts/adminsdk"
    echo ""
    echo "2. Click en 'Generate new private key'"
    echo "3. Descarga el archivo JSON"
    echo "4. Guárdalo como: serviceAccountKey.json"
    echo "5. Ejecuta:"
    echo "   export GOOGLE_APPLICATION_CREDENTIALS='./serviceAccountKey.json'"
    echo ""
    echo "MÉTODO 3: Desde Firebase Console (Manual)"
    echo "-------------------------------------------"
    echo "Puedes copiar y pegar las reglas directamente en:"
    echo "- Firestore: https://console.firebase.google.com/project/tuscitasseguras-2d1a6/firestore/rules"
    echo "- Storage: https://console.firebase.google.com/project/tuscitasseguras-2d1a6/storage/rules"
    echo ""
    echo "=================================================="
    ;;
  5)
    echo "👋 Saliendo..."
    exit 0
    ;;
  *)
    echo "❌ Opción inválida"
    exit 1
    ;;
esac
