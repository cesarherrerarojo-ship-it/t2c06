/**
 * Firebase Auth Ultra - Sistema ultra-resistente de autenticación
 * Este módulo utiliza múltiples proxies y métodos alternativos para garantizar autenticación
 */

class FirebaseAuthUltra {
    constructor(apiKey, projectId) {
        this.apiKey = apiKey;
        this.projectId = projectId;
        this.currentUser = null;
        this.authStateListeners = [];
        
        // Múltiples proxies para máxima resiliencia
        this.proxyEndpoints = [
            'https://cors-anywhere.herokuapp.com',
            'https://api.allorigins.win/raw',
            'https://corsproxy.io/?',
            'https://cors-proxy.htmldriven.com/?',
            'https://proxy.cors.sh/'
        ];
        
        // Endpoints de Firebase Auth
        this.firebaseEndpoints = {
            signIn: 'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword',
            signUp: 'https://identitytoolkit.googleapis.com/v1/accounts:signUp',
            lookup: 'https://identitytoolkit.googleapis.com/v1/accounts:lookup',
            token: 'https://securetoken.googleapis.com/v1/token'
        };
        
        this.attemptCount = 0;
        this.maxAttempts = 10;
    }

    async signInWithEmailAndPassword(email, password) {
        console.log('🚀 Iniciando autenticación ultra-resistente...');
        this.attemptCount = 0;
        
        // Array de métodos a intentar
        const methods = [
            () => this._tryDirectConnection(email, password),
            () => this._tryProxyRotation(email, password),
            () => this._tryJSONPMethod(email, password),
            () => this._tryFormSubmission(email, password),
            () => this._tryImageBeacon(email, password),
            () => this._tryWebSocketConnection(email, password)
        ];

        for (let i = 0; i < methods.length; i++) {
            try {
                console.log(`🔄 Intentando método ${i + 1}/${methods.length}...`);
                const result = await methods[i]();
                if (result.success) {
                    console.log(`✅ Autenticación exitosa con método ${i + 1}`);
                    return result;
                }
            } catch (error) {
                console.warn(`⚠️ Método ${i + 1} falló:`, error.message);
                continue;
            }
        }

        throw new Error('Todos los métodos de autenticación fallaron');
    }

    async _tryDirectConnection(email, password) {
        console.log('🧪 Método 1: Conexión directa con múltiples configuraciones...');
        
        const configs = [
            {
                mode: 'cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, returnSecureToken: true })
            },
            {
                mode: 'no-cors',
                headers: { 'Content-Type': 'text/plain' },
                body: JSON.stringify({ email, password, returnSecureToken: true })
            },
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({ email, password, returnSecureToken: 'true' }).toString()
            }
        ];

        for (const config of configs) {
            try {
                const response = await fetch(
                    `${this.firebaseEndpoints.signIn}?key=${this.apiKey}`,
                    config
                );

                if (response.ok) {
                    const data = await response.json();
                    return this._handleSuccess(data, 'direct');
                }
            } catch (error) {
                continue;
            }
        }
        
        return { success: false };
    }

    async _tryProxyRotation(email, password) {
        console.log('🧪 Método 2: Rotación de proxies...');
        
        for (const proxy of this.proxyEndpoints) {
            try {
                const proxyUrl = `${proxy}${this.firebaseEndpoints.signIn}?key=${this.apiKey}`;
                
                const response = await fetch(proxyUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest'
                    },
                    body: JSON.stringify({ email, password, returnSecureToken: true })
                });

                if (response.ok) {
                    const data = await response.json();
                    return this._handleSuccess(data, 'proxy');
                }
            } catch (error) {
                console.warn(`⚠️ Proxy ${proxy} falló`);
                continue;
            }
        }
        
        return { success: false };
    }

    async _tryJSONPMethod(email, password) {
        console.log('🧪 Método 3: JSONP alternativo...');
        
        return new Promise((resolve) => {
            const callbackName = `jsonp_callback_${Date.now()}`;
            const script = document.createElement('script');
            
            window[callbackName] = function(data) {
                document.body.removeChild(script);
                delete window[callbackName];
                
                if (data && data.idToken) {
                    resolve(this._handleSuccess(data, 'jsonp'));
                } else {
                    resolve({ success: false });
                }
            };
            
            script.onerror = () => {
                document.body.removeChild(script);
                delete window[callbackName];
                resolve({ success: false });
            };
            
            const params = new URLSearchParams({
                key: this.apiKey,
                email: email,
                password: password,
                returnSecureToken: 'true',
                callback: callbackName
            });
            
            script.src = `${this.firebaseEndpoints.signIn}?${params.toString()}`;
            document.body.appendChild(script);
            
            // Timeout after 10 seconds
            setTimeout(() => {
                if (document.body.contains(script)) {
                    document.body.removeChild(script);
                    delete window[callbackName];
                    resolve({ success: false });
                }
            }, 10000);
        });
    }

    async _tryFormSubmission(email, password) {
        console.log('🧪 Método 4: Envío de formulario oculto...');
        
        return new Promise((resolve) => {
            const form = document.createElement('form');
            form.method = 'POST';
            form.target = 'hidden_iframe';
            form.style.display = 'none';
            
            const iframe = document.createElement('iframe');
            iframe.name = 'hidden_iframe';
            iframe.style.display = 'none';
            
            // Add form fields
            const fields = {
                email: email,
                password: password,
                returnSecureToken: 'true',
                key: this.apiKey
            };
            
            Object.keys(fields).forEach(key => {
                const input = document.createElement('input');
                input.type = 'hidden';
                input.name = key;
                input.value = fields[key];
                form.appendChild(input);
            });
            
            document.body.appendChild(iframe);
            document.body.appendChild(form);
            
            let resolved = false;
            
            iframe.onload = () => {
                if (!resolved) {
                    resolved = true;
                    document.body.removeChild(form);
                    document.body.removeChild(iframe);
                    
                    try {
                        const response = iframe.contentWindow.document.body.textContent;
                        const data = JSON.parse(response);
                        if (data.idToken) {
                            resolve(this._handleSuccess(data, 'form'));
                        } else {
                            resolve({ success: false });
                        }
                    } catch (e) {
                        resolve({ success: false });
                    }
                }
            };
            
            iframe.onerror = () => {
                if (!resolved) {
                    resolved = true;
                    document.body.removeChild(form);
                    document.body.removeChild(iframe);
                    resolve({ success: false });
                }
            };
            
            form.action = this.firebaseEndpoints.signIn;
            form.submit();
            
            // Timeout after 15 seconds
            setTimeout(() => {
                if (!resolved) {
                    resolved = true;
                    document.body.removeChild(form);
                    document.body.removeChild(iframe);
                    resolve({ success: false });
                }
            }, 15000);
        });
    }

    async _tryImageBeacon(email, password) {
        console.log('🧪 Método 5: Beacon de imagen con datos...');
        
        return new Promise((resolve) => {
            const img = new Image();
            const params = new URLSearchParams({
                key: this.apiKey,
                email: email,
                password: password,
                returnSecureToken: 'true',
                timestamp: Date.now()
            });
            
            img.onload = () => {
                // This method can't get response data, but we try anyway
                resolve({ success: false });
            };
            
            img.onerror = () => {
                resolve({ success: false });
            };
            
            img.src = `${this.firebaseEndpoints.signIn}?${params.toString()}`;
            
            // Timeout after 5 seconds
            setTimeout(() => {
                resolve({ success: false });
            }, 5000);
        });
    }

    async _tryWebSocketConnection(email, password) {
        console.log('🧪 Método 6: WebSocket alternativo...');
        
        return new Promise((resolve) => {
            // This is a creative approach - try to use WebSocket to bypass restrictions
            // In practice, this would need a WebSocket proxy server
            
            try {
                // Try to establish a WebSocket connection to a proxy server
                const ws = new WebSocket('wss://echo.websocket.org/'); // Example echo server
                
                ws.onopen = () => {
                    // Send authentication request through WebSocket
                    const request = {
                        type: 'auth',
                        endpoint: this.firebaseEndpoints.signIn,
                        apiKey: this.apiKey,
                        data: { email, password, returnSecureToken: true }
                    };
                    
                    ws.send(JSON.stringify(request));
                };
                
                ws.onmessage = (event) => {
                    try {
                        const response = JSON.parse(event.data);
                        if (response.idToken) {
                            ws.close();
                            resolve(this._handleSuccess(response, 'websocket'));
                        } else {
                            ws.close();
                            resolve({ success: false });
                        }
                    } catch (e) {
                        ws.close();
                        resolve({ success: false });
                    }
                };
                
                ws.onerror = () => {
                    ws.close();
                    resolve({ success: false });
                };
                
                ws.onclose = () => {
                    resolve({ success: false });
                };
                
                // Timeout after 10 seconds
                setTimeout(() => {
                    if (ws.readyState === WebSocket.OPEN) {
                        ws.close();
                    }
                    resolve({ success: false });
                }, 10000);
                
            } catch (error) {
                resolve({ success: false });
            }
        });
    }

    _handleSuccess(data, method) {
        console.log(`✅ Autenticación exitosa con método: ${method}`);
        this.currentUser = data;
        this._notifyAuthStateChanged();
        
        return {
            success: true,
            user: data,
            method: method
        };
    }

    async testConnectivity() {
        console.log('🧪 Probando conectividad ultra-resistente...');
        
        const results = {
            direct: false,
            proxy: false,
            jsonp: false,
            form: false,
            beacon: false,
            websocket: false,
            errors: []
        };

        // Test direct connection
        try {
            const response = await fetch(`${this.firebaseEndpoints.lookup}?key=${this.apiKey}`, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'text/plain' },
                body: JSON.stringify({ idToken: 'test-token' })
            });
            results.direct = true;
        } catch (error) {
            results.errors.push(`Direct: ${error.message}`);
        }

        // Test proxy rotation
        for (const proxy of this.proxyEndpoints) {
            try {
                const proxyUrl = `${proxy}${this.firebaseEndpoints.lookup}?key=${this.apiKey}`;
                const response = await fetch(proxyUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ idToken: 'test-token' })
                });
                
                if (response.status !== 403 && response.status !== 429) {
                    results.proxy = true;
                    break;
                }
            } catch (error) {
                continue;
            }
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

// Inicializar el sistema ultra-resistente (se inicializará después de cargar el config)
let authUltra = null;

// Función auxiliar para login ultra-resistente
async function loginUltra(email, password) {
    try {
        if (!authUltra) {
            throw new Error('Sistema ultra-resistente no inicializado. Asegúrate de cargar firebase-config.js primero.');
        }
        console.log('🚀 Iniciando login ultra-resistente...');
        const result = await authUltra.signInWithEmailAndPassword(email, password);
        
        if (result.success) {
            console.log('✅ Login ultra-resistente exitoso!');
            console.log(`📡 Método usado: ${result.method}`);
            
            // Guardar sesión
            localStorage.setItem('authUser', JSON.stringify(result.user));
            
            return {
                success: true,
                user: result.user,
                method: result.method
            };
        }
        
    } catch (error) {
        console.error('❌ Login ultra-resistente falló:', error);
        return {
            success: false,
            error: error.message
        };
    }
}