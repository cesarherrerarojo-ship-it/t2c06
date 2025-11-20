// diagnostic.js - Comprehensive Firebase diagnostic tool for TuCitaSegura
// This script helps identify and fix Firebase connection issues

export async function runFirebaseDiagnostic() {
    console.log('🔧 Iniciando diagnóstico completo de Firebase...');
    
    const results = {
        timestamp: new Date().toISOString(),
        environment: {
            hostname: location.hostname,
            protocol: location.protocol,
            port: location.port,
            userAgent: navigator.userAgent,
            online: navigator.onLine
        },
        tests: [],
        recommendations: []
    };

    function addTest(name, status, details = '', error = null) {
        results.tests.push({
            name,
            status,
            details,
            error: error ? error.message : null,
            timestamp: new Date().toISOString()
        });
        
        const icon = status === 'success' ? '✅' : status === 'warning' ? '⚠️' : '❌';
        console.log(`${icon} ${name}: ${status}${details ? ` - ${details}` : ''}`);
        if (error) {
            console.error('   Error:', error);
        }
    }

    function addRecommendation(priority, message) {
        results.recommendations.push({ priority, message, timestamp: new Date().toISOString() });
        console.log(`💡 ${priority.toUpperCase()}: ${message}`);
    }

    // Test 1: Network connectivity
    try {
        addTest('Conectividad de red', 
                navigator.onLine ? 'success' : 'error',
                navigator.onLine ? 'Conexión disponible' : 'Sin conexión a internet');
        
        if (!navigator.onLine) {
            addRecommendation('critical', 'Verifica tu conexión a internet');
        }
    } catch (error) {
        addTest('Conectividad de red', 'error', '', error);
    }

    // Test 2: Protocol and domain analysis
    try {
        const isLocalhost = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
        const isFileProtocol = location.protocol === 'file:';
        const isHTTPS = location.protocol === 'https:';
        
        let status = 'success';
        let details = `Dominio: ${location.hostname}, Protocolo: ${location.protocol}`;
        
        if (isFileProtocol) {
            status = 'warning';
            details += ' (⚠️ Protocolo file:// puede causar problemas con Firebase)';
            addRecommendation('high', 'Usa un servidor web local (http://localhost:8080) en lugar de abrir archivos directamente');
        }
        
        if (!isHTTPS && !isLocalhost && !isFileProtocol) {
            status = 'warning';
            details += ' (⚠️ Firebase requiere HTTPS en producción)';
            addRecommendation('medium', 'Considera usar HTTPS para mejor seguridad');
        }
        
        addTest('Análisis de protocolo y dominio', status, details);
        
    } catch (error) {
        addTest('Análisis de protocolo y dominio', 'error', '', error);
    }

    // Test 3: Firebase configuration validation
    try {
        const requiredKeys = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
        const firebaseConfig = {
            apiKey: "AIzaSyAgFcoHwoBpo80rlEHL2hHVZ2DqtjWXh2s",
            authDomain: "tuscitasseguras-2d1a6.firebaseapp.com",
            projectId: "tuscitasseguras-2d1a6",
            storageBucket: "tuscitasseguras-2d1a6.firebasestorage.app",
            messagingSenderId: "924208562587",
            appId: "1:924208562587:web:5291359426fe390b36213e"
        };
        
        const missingKeys = requiredKeys.filter(key => !firebaseConfig[key] || firebaseConfig[key].includes('YOUR_'));
        
        if (missingKeys.length === 0) {
            addTest('Configuración Firebase', 'success', 'Todas las claves requeridas están presentes');
        } else {
            addTest('Configuración Firebase', 'error', `Claves faltantes: ${missingKeys.join(', ')}`);
            addRecommendation('critical', `Configura las siguientes claves en firebase-config.js: ${missingKeys.join(', ')}`);
        }
        
    } catch (error) {
        addTest('Configuración Firebase', 'error', '', error);
    }

    // Test 4: Firebase SDK loading
    try {
        const modules = [
            'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js',
            'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js',
            'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js'
        ];
        
        for (const moduleUrl of modules) {
            try {
                await import(moduleUrl);
                addTest(`Carga de SDK: ${moduleUrl.split('/').pop()}`, 'success', 'Módulo cargado correctamente');
            } catch (error) {
                addTest(`Carga de SDK: ${moduleUrl.split('/').pop()}`, 'error', '', error);
                addRecommendation('high', `Verifica la conexión a los servidores de Firebase: ${moduleUrl}`);
            }
        }
        
    } catch (error) {
        addTest('Carga de SDK Firebase', 'error', '', error);
    }

    // Test 5: App Check configuration
    try {
        const isDevelopment = location.hostname === 'localhost' || 
                             location.hostname === '127.0.0.1' || 
                             location.protocol === 'file:';
        
        if (isDevelopment) {
            addTest('App Check (Desarrollo)', 'success', 'App Check desactivado en modo desarrollo');
        } else {
            addTest('App Check (Producción)', 'warning', 'Verifica la configuración de App Check en producción');
            addRecommendation('medium', 'Asegúrate de que App Check esté correctamente configurado en producción');
        }
        
    } catch (error) {
        addTest('App Check', 'error', '', error);
    }

    // Test 6: Browser security features
    try {
        const features = {
            'CORS': typeof XMLHttpRequest !== 'undefined',
            'Fetch API': typeof fetch !== 'undefined',
            'LocalStorage': typeof localStorage !== 'undefined',
            'SessionStorage': typeof sessionStorage !== 'undefined',
            'Cookies': navigator.cookieEnabled
        };
        
        const disabledFeatures = Object.entries(features)
            .filter(([_, enabled]) => !enabled)
            .map(([feature, _]) => feature);
        
        if (disabledFeatures.length === 0) {
            addTest('Características del navegador', 'success', 'Todas las características necesarias están habilitadas');
        } else {
            addTest('Características del navegador', 'warning', `Características deshabilitadas: ${disabledFeatures.join(', ')}`);
            addRecommendation('medium', `Verifica que las siguientes características estén habilitadas: ${disabledFeatures.join(', ')}`);
        }
        
    } catch (error) {
        addTest('Características del navegador', 'error', '', error);
    }

    // Summary
    console.log('\n📊 RESUMEN DEL DIAGNÓSTICO:');
    console.log(`   Total de pruebas: ${results.tests.length}`);
    console.log(`   Exitosas: ${results.tests.filter(t => t.status === 'success').length}`);
    console.log(`   Advertencias: ${results.tests.filter(t => t.status === 'warning').length}`);
    console.log(`   Errores: ${results.tests.filter(t => t.status === 'error').length}`);
    
    if (results.recommendations.length > 0) {
        console.log('\n🔧 RECOMENDACIONES:');
        results.recommendations.forEach(rec => {
            console.log(`   ${rec.priority.toUpperCase()}: ${rec.message}`);
        });
    }
    
    console.log('\n✅ Diagnóstico completado');
    
    return results;
}

// Auto-run diagnostic when imported
if (typeof window !== 'undefined') {
    console.log('🚀 Diagnostic script loaded. Run runFirebaseDiagnostic() to start.');
}

export default { runFirebaseDiagnostic };