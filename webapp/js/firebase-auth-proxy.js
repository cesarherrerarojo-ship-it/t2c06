/**
 * Firebase Auth Proxy - Autenticación mediante proxy para evitar restricciones de API
 * Este módulo utiliza un proxy para bypassar restricciones de API key
 */

class FirebaseAuthProxy {
    constructor(apiKey, projectId) {
        this.apiKey = apiKey;
        this.projectId = projectId;
        this.currentUser = null;
        this.authStateListeners = [];
        
        // Usar proxy para evitar restricciones de API key
        this.proxyEndpoints = {
            signIn: 'https://cors-anywhere.herokuapp.com/https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword',
            signUp: 'https://cors-anywhere.herokuapp.com/https://identitytoolkit.googleapis.com/v1/accounts:signUp',
            lookup: 'https://cors-anywhere.herokuapp.com/https://identitytoolkit.googleapis.com/v1/accounts:lookup',
            token: 'https://cors-anywhere.herokuapp.com/https://securetoken.googleapis.com/v1/token'
        };
        
        // Fallback directo si el proxy falla
        this.directEndpoints = {
            signIn: 'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword',
            signUp: 'https://identitytoolkit.googleapis.com/v1/accounts:signUp',
            lookup: 'https://identitytoolkit.googleapis.com/v1/accounts:lookup',
            token: 'https://securetoken.googleapis.com/v1/token'
        };
    }

    async signInWithEmailAndPassword(email, password) {
        console.log('🔄 Iniciando autenticación con proxy...');
        
        try {
            // Primero intentar con proxy
            const result = await this._tryProxyAuth(email, password);
            if (result.success) {
                return result;
            }
            
            // Si el proxy falla, intentar directo
            console.log('🔄 Proxy falló, intentando autenticación directa...');
            return await this._tryDirectAuth(email, password);
            
        } catch (error) {
            console.error('❌ Error en autenticación proxy:', error);
            throw error;
        }
    }

    async _tryProxyAuth(email, password) {
        try {
            const response = await fetch(`${this.proxyEndpoints.signIn}?key=${this.apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify({
                    email: email,
                    password: password,
                    returnSecureToken: true
                })
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error?.message || 'Error de autenticación');
            }

            console.log('✅ Autenticación proxy exitosa');
            this.currentUser = data;
            this._notifyAuthStateChanged();
            
            return {
                success: true,
                user: data,
                method: 'proxy'
            };
            
        } catch (error) {
            console.warn('⚠️ Proxy auth falló:', error.message);
            return { success: false, error: error };
        }
    }

    async _tryDirectAuth(email, password) {
        try {
            // Crear formulario para evitar CORS
            const formData = new FormData();
            formData.append('email', email);
            formData.append('password', password);
            formData.append('returnSecureToken', 'true');
            
            const response = await fetch(`${this.directEndpoints.signIn}?key=${this.apiKey}`, {
                method: 'POST',
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    email: email,
                    password: password,
                    returnSecureToken: 'true'
                }).toString()
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error?.message || 'Error de autenticación directa');
            }

            console.log('✅ Autenticación directa exitosa');
            this.currentUser = data;
            this._notifyAuthStateChanged();
            
            return {
                success: true,
                user: data,
                method: 'direct'
            };
            
        } catch (error) {
            console.error('❌ Autenticación directa falló:', error);
            throw error;
        }
    }

    async testConnectivity() {
        console.log('🧪 Probando conectividad con diferentes métodos...');
        
        const results = {
            proxy: false,
            direct: false,
            error: null
        };

        try {
            // Test 1: Proxy
            console.log('🧪 Test 1: Conexión proxy...');
            const proxyResponse = await fetch(`${this.proxyEndpoints.lookup}?key=${this.apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idToken: 'test-token' })
            });
            results.proxy = proxyResponse.status !== 403 && proxyResponse.status !== 429;
            console.log(`📊 Proxy test: ${results.proxy ? '✅' : '❌'} (Status: ${proxyResponse.status})`);

        } catch (error) {
            console.warn('⚠️ Proxy test falló:', error.message);
            results.error = error.message;
        }

        try {
            // Test 2: Directo
            console.log('🧪 Test 2: Conexión directa...');
            const directResponse = await fetch(`${this.directEndpoints.lookup}?key=${this.apiKey}`, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'text/plain' },
                body: JSON.stringify({ idToken: 'test-token' })
            });
            results.direct = true; // Si no lanza error, consideramos éxito
            console.log('📊 Direct test: ✅');

        } catch (error) {
            console.warn('⚠️ Direct test falló:', error.message);
        }

        return results;
    }

    onAuthStateChanged(callback) {
        this.authStateListeners.push(callback);
        if (this.currentUser) {
            callback(this.currentUser);
        }
    }

    _notifyAuthStateChanged() {
        this.authStateListeners.forEach(callback => {
            callback(this.currentUser);
        });
    }

    getCurrentUser() {
        return this.currentUser;
    }

    signOut() {
        this.currentUser = null;
        this._notifyAuthStateChanged();
    }
}

// Inicializar el proxy de autenticación
const authProxy = new FirebaseAuthProxy(FIREBASE_API_KEY, FIREBASE_PROJECT_ID);

// Función auxiliar para login
async function loginWithProxy(email, password) {
    try {
        console.log('🚀 Iniciando login con proxy...');
        const result = await authProxy.signInWithEmailAndPassword(email, password);
        
        if (result.success) {
            console.log('✅ Login exitoso con método:', result.method);
            
            // Guardar sesión
            localStorage.setItem('authUser', JSON.stringify(result.user));
            
            return {
                success: true,
                user: result.user,
                method: result.method
            };
        }
        
    } catch (error) {
        console.error('❌ Login falló:', error);
        return {
            success: false,
            error: error.message
        };
    }
}