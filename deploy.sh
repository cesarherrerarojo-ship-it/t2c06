#!/bin/bash

# ============================================================================
# SCRIPT DE DESPLIEGUE COMPLETO - TuCitaSegura
# ============================================================================
# Este script automatiza el despliegue completo de la aplicación a Firebase
# Autor: TuCitaSegura Team
# Fecha: 2025-11-14
# ============================================================================

set -e  # Exit on error

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Banner
echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║        🔥 TuCitaSegura - Despliegue a Firebase 🔥         ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Verificar que Firebase CLI está instalado
if ! command -v firebase &> /dev/null; then
    echo -e "${RED}❌ Firebase CLI no está instalado${NC}"
    echo ""
    echo "Instalar con:"
    echo "  npm install -g firebase-tools"
    echo ""
    exit 1
fi

echo -e "${GREEN}✅ Firebase CLI encontrado${NC}"
firebase --version
echo ""

# Verificar que estamos en el directorio correcto
if [ ! -f "firebase.json" ]; then
    echo -e "${RED}❌ No se encontró firebase.json${NC}"
    echo "Ejecuta este script desde la raíz del proyecto"
    exit 1
fi

echo -e "${GREEN}✅ Directorio correcto${NC}"
echo ""

# Verificar login
echo -e "${BLUE}🔑 Verificando autenticación...${NC}"
if ! firebase projects:list &> /dev/null; then
    echo -e "${YELLOW}⚠️  No estás autenticado en Firebase${NC}"
    echo ""
    echo "Ejecutando login..."
    firebase login
fi

echo -e "${GREEN}✅ Autenticado en Firebase${NC}"
echo ""

# Mostrar proyecto actual
PROJECT=$(firebase use)
echo -e "${BLUE}📦 Proyecto: ${NC}${PROJECT}"
echo ""

# Preguntar qué desplegar
echo "¿Qué deseas desplegar?"
echo ""
echo "1) Todo (rules + functions + hosting)"
echo "2) Solo Firestore Rules"
echo "3) Solo Storage Rules"
echo "4) Solo Cloud Functions"
echo "5) Solo Hosting"
echo "6) Rules completas (firestore + storage)"
echo "7) Backend completo (rules + functions)"
echo "8) Cancelar"
echo ""
read -p "Selecciona una opción [1-8]: " option

case $option in
    1)
        echo -e "${BLUE}🚀 Desplegando TODO...${NC}"
        echo ""

        # Firestore Rules
        echo -e "${YELLOW}📋 Desplegando Firestore Rules...${NC}"
        firebase deploy --only firestore:rules
        echo -e "${GREEN}✅ Firestore Rules desplegadas${NC}"
        echo ""

        # Storage Rules
        echo -e "${YELLOW}📦 Desplegando Storage Rules...${NC}"
        firebase deploy --only storage
        echo -e "${GREEN}✅ Storage Rules desplegadas${NC}"
        echo ""

        # Cloud Functions
        echo -e "${YELLOW}⚡ Desplegando Cloud Functions...${NC}"
        cd functions
        npm install
        cd ..
        firebase deploy --only functions
        echo -e "${GREEN}✅ Cloud Functions desplegadas${NC}"
        echo ""

        # Hosting
        echo -e "${YELLOW}🌐 Desplegando Hosting...${NC}"
        firebase deploy --only hosting
        echo -e "${GREEN}✅ Hosting desplegado${NC}"
        ;;

    2)
        echo -e "${BLUE}📋 Desplegando Firestore Rules...${NC}"
        firebase deploy --only firestore:rules
        echo -e "${GREEN}✅ Firestore Rules desplegadas${NC}"
        ;;

    3)
        echo -e "${BLUE}📦 Desplegando Storage Rules...${NC}"
        firebase deploy --only storage
        echo -e "${GREEN}✅ Storage Rules desplegadas${NC}"
        ;;

    4)
        echo -e "${BLUE}⚡ Desplegando Cloud Functions...${NC}"
        cd functions
        npm install
        cd ..
        firebase deploy --only functions
        echo -e "${GREEN}✅ Cloud Functions desplegadas${NC}"
        ;;

    5)
        echo -e "${BLUE}🌐 Desplegando Hosting...${NC}"
        firebase deploy --only hosting
        echo -e "${GREEN}✅ Hosting desplegado${NC}"
        ;;

    6)
        echo -e "${BLUE}📋 Desplegando Rules completas...${NC}"
        firebase deploy --only firestore:rules,storage
        echo -e "${GREEN}✅ Rules desplegadas${NC}"
        ;;

    7)
        echo -e "${BLUE}🔧 Desplegando Backend completo...${NC}"

        # Rules
        firebase deploy --only firestore:rules,storage
        echo -e "${GREEN}✅ Rules desplegadas${NC}"
        echo ""

        # Functions
        cd functions
        npm install
        cd ..
        firebase deploy --only functions
        echo -e "${GREEN}✅ Functions desplegadas${NC}"
        ;;

    8)
        echo -e "${YELLOW}❌ Despliegue cancelado${NC}"
        exit 0
        ;;

    *)
        echo -e "${RED}❌ Opción inválida${NC}"
        exit 1
        ;;
esac

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║              ✅ DESPLIEGUE COMPLETADO ✅                   ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Mostrar URLs
echo -e "${BLUE}🌐 URLs de tu aplicación:${NC}"
echo ""
firebase hosting:sites:list 2>/dev/null || true
echo ""

echo -e "${YELLOW}💡 Próximos pasos:${NC}"
echo "  1. Verifica que todo funciona en: https://tuscitasseguras-2d1a6.web.app"
echo "  2. Revisa los logs: firebase functions:log"
echo "  3. Monitorea errores en Firebase Console"
echo ""

echo -e "${GREEN}✨ ¡Listo! Tu aplicación está desplegada${NC}"
echo ""
