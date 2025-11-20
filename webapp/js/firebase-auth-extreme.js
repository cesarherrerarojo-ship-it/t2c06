/**
 * Firebase Auth Extreme - Sistema extremo de autenticación
 * Último recurso con técnicas avanzadas de bypass
 */

class FirebaseAuthExtreme {
    constructor(apiKey, projectId) {
        this.apiKey = apiKey;
        this.projectId = projectId;
        this.currentUser = null;
        this.authStateListeners = [];
        
        // Técnicas extremas de bypass
        this.extremeMethods = {
            // Método 1: Service Worker intercept
            serviceWorker: this._tryServiceWorkerAuth.bind(this),
            
            // Método 2: PostMessage entre iframes
            postMessage: this._tryPostMessageAuth.bind(this),
            
            // Método 3: Almacenamiento local con eventos
            localStorage: this._tryLocalStorageAuth.bind(this),
            
            // Método 4: IndexedDB para datos
            indexedDB: this._tryIndexedDBAuth.bind(this),
            
            // Método 5: Broadcast Channel API
            broadcast: this._tryBroadcastAuth.bind(this),
            
            // Método 6: Server-Sent Events
            sse: this._trySSEAuth.bind(this),
            
            // Método 7: Fetch con redirect manual
            redirect: this._tryRedirectAuth.bind(this),
            
            // Método 8: XHR con configuración extrema
            xhr: this._tryXHRAuth.bind(this)
        };
    }

    async signInWithEmailAndPassword(email, password) {
        console.log('🚀 Iniciando autenticación EXTREMA...');
        
        const methods = Object.keys(this.extremeMethods);
        
        for (let i = 0; i < methods.length; i++) {
            const methodName = methods[i];
            console.log(`🔄 Intentando método extremo ${i + 1}/${methods.length}: ${methodName}`);
            
            try {
                const result = await this.extremeMethods[methodName](email, password);
                if (result && result.success) {
                    console.log(`✅ Autenticación extrema exitosa con: ${methodName}`);
                    return result;
                }
            } catch (error) {
                console.warn(`⚠️ Método extremo ${methodName} falló:`, error.message);
                continue;
            }
        }
        
        throw new Error('Todos los métodos extremos fallaron');
    }

    async _tryServiceWorkerAuth(email, password) {
        console.log('🔧 Método extremo 1: Service Worker intercept...');
        
        return new Promise((resolve) => {
            if (!('serviceWorker' in navigator)) {
                resolve({ success: false });
                return;
            }
            
            // Crear service worker temporal
            const swCode = `
                self.addEventListener('fetch', event => {
                    if (event.request.url.includes('identitytoolkit.googleapis.com')) {
                        event.respondWith(
                            fetch(event.request).then(response => {
                                return response;
                            }).catch(() => {
                                return new Response('{"error": {"message": "Service Worker fallback"}}', {
                                    status: 200,
                                    headers: {'Content-Type': 'application/json'}
                                });
                            })
                        );
                    }
                });
            `;
            
            const blob = new Blob([swCode], { type: 'application/javascript' });
            const swUrl = URL.createObjectURL(blob);
            
            navigator.serviceWorker.register(swUrl).then(() => {
                // Intentar autenticación con service worker activo
                fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${this.apiKey}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password, returnSecureToken: true })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.idToken) {
                        navigator.serviceWorker.getRegistrations().then(registrations => {
                            registrations.forEach(registration => registration.unregister());
                        });
                        URL.revokeObjectURL(swUrl);
                        resolve(this._handleSuccess(data, 'service-worker'));
                    } else {
                        resolve({ success: false });
                    }
                })
                .catch(() => {
                    navigator.serviceWorker.getRegistrations().then(registrations => {
                        registrations.forEach(registration => registration.unregister());
                    });
                    URL.revokeObjectURL(swUrl);
                    resolve({ success: false });
                });
            })
            .catch(() => {
                URL.revokeObjectURL(swUrl);
                resolve({ success: false });
            });
            
            // Timeout
            setTimeout(() => {
                navigator.serviceWorker.getRegistrations().then(registrations => {
                    registrations.forEach(registration => registration.unregister());
                });
                URL.revokeObjectURL(swUrl);
                resolve({ success: false });
            }, 10000);
        });
    }

    async _tryPostMessageAuth(email, password) {
        console.log('🔧 Método extremo 2: PostMessage entre iframes...');
        
        return new Promise((resolve) => {
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            iframe.src = 'about:blank';
            
            iframe.onload = () => {
                try {
                    // Crear contenido del iframe
                    const iframeContent = `
                        <script>
                            window.addEventListener('message', function(e) {
                                if (e.data.type === 'auth-request') {
                                    fetch('https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${this.apiKey}', {
                                        method: 'POST',
                                        headers: {'Content-Type': 'application/json'},
                                        body: JSON.stringify(e.data.credentials)
                                    })
                                    .then(response => response.json())
                                    .then(data => {
                                        parent.postMessage({type: 'auth-response', data: data}, '*');
                                    })
                                    .catch(error => {
                                        parent.postMessage({type: 'auth-response', error: error.message}, '*');
                                    });
                                }
                            });
                        <\/script>
                    `;
                    
                    iframe.contentDocument.open();
                    iframe.contentDocument.write(iframeContent);
                    iframe.contentDocument.close();
                    
                    // Enviar solicitud al iframe
                    iframe.contentWindow.postMessage({
                        type: 'auth-request',
                        credentials: { email, password, returnSecureToken: true }
                    }, '*');
                    
                    // Escuchar respuesta
                    const messageHandler = (event) => {
                        if (event.data.type === 'auth-response') {
                            window.removeEventListener('message', messageHandler);
                            document.body.removeChild(iframe);
                            
                            if (event.data.data && event.data.data.idToken) {
                                resolve(this._handleSuccess(event.data.data, 'postmessage'));
                            } else {
                                resolve({ success: false });
                            }
                        }
                    };
                    
                    window.addEventListener('message', messageHandler);
                    
                    // Timeout
                    setTimeout(() => {
                        window.removeEventListener('message', messageHandler);
                        document.body.removeChild(iframe);
                        resolve({ success: false });
                    }, 8000);
                    
                } catch (error) {
                    document.body.removeChild(iframe);
                    resolve({ success: false });
                }
            };
            
            iframe.onerror = () => {
                document.body.removeChild(iframe);
                resolve({ success: false });
            };
            
            document.body.appendChild(iframe);
        });
    }

    async _tryLocalStorageAuth(email, password) {
        console.log('🔧 Método extremo 3: LocalStorage con eventos...');
        
        return new Promise((resolve) => {
            try {
                // Crear canal de comunicación mediante localStorage
                const channelId = 'auth_channel_' + Date.now();
                
                // Escuchar cambios en localStorage
                const storageHandler = (e) => {
                    if (e.key === channelId + '_response') {
                        window.removeEventListener('storage', storageHandler);
                        localStorage.removeItem(channelId + '_response');
                        
                        try {
                            const response = JSON.parse(e.newValue);
                            if (response.idToken) {
                                resolve(this._handleSuccess(response, 'localstorage'));
                            } else {
                                resolve({ success: false });
                            }
                        } catch (error) {
                            resolve({ success: false });
                        }
                    }
                };
                
                window.addEventListener('storage', storageHandler);
                
                // Enviar solicitud a través de localStorage
                const requestData = {
                    email: email,
                    password: password,
                    returnSecureToken: true,
                    apiKey: this.apiKey,
                    timestamp: Date.now()
                };
                
                localStorage.setItem(channelId + '_request', JSON.stringify(requestData));
                
                // En otra pestaña o contexto, procesaríamos esto
                // Por ahora, intentamos procesarlo aquí mismo
                setTimeout(() => {
                    // Simular procesamiento
                    fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${this.apiKey}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(requestData)
                    })
                    .then(response => response.json())
                    .then(data => {
                        localStorage.setItem(channelId + '_response', JSON.stringify(data));
                    })
                    .catch(() => {
                        localStorage.setItem(channelId + '_response', JSON.stringify({ error: 'Failed' }));
                    });
                }, 100);
                
                // Timeout
                setTimeout(() => {
                    window.removeEventListener('storage', storageHandler);
                    localStorage.removeItem(channelId + '_request');
                    localStorage.removeItem(channelId + '_response');
                    resolve({ success: false });
                }, 8000);
                
            } catch (error) {
                resolve({ success: false });
            }
        });
    }

    async _tryIndexedDBAuth(email, password) {
        console.log('🔧 Método extremo 4: IndexedDB para datos...');
        
        return new Promise((resolve) => {
            if (!window.indexedDB) {
                resolve({ success: false });
                return;
            }
            
            try {
                const request = indexedDB.open('ExtremeAuthDB', 1);
                
                request.onerror = () => {
                    resolve({ success: false });
                };
                
                request.onsuccess = (event) => {
                    const db = event.target.result;
                    
                    // Crear object store si no existe
                    if (!db.objectStoreNames.contains('auth')) {
                        db.createObjectStore('auth', { keyPath: 'id' });
                    }
                    
                    // Intentar autenticación
                    const transaction = db.transaction(['auth'], 'readwrite');
                    const store = transaction.objectStore('auth');
                    
                    // Guardar solicitud
                    const authRequest = {
                        id: 'current_auth',
                        email: email,
                        password: password,
                        apiKey: this.apiKey,
                        timestamp: Date.now()
                    };
                    
                    store.put(authRequest);
                    
                    // Intentar fetch desde IndexedDB context
                    fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${this.apiKey}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email, password, returnSecureToken: true })
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.idToken) {
                            db.close();
                            resolve(this._handleSuccess(data, 'indexeddb'));
                        } else {
                            db.close();
                            resolve({ success: false });
                        }
                    })
                    .catch(() => {
                        db.close();
                        resolve({ success: false });
                    });
                };
                
                request.onupgradeneeded = (event) => {
                    const db = event.target.result;
                    if (!db.objectStoreNames.contains('auth')) {
                        db.createObjectStore('auth', { keyPath: 'id' });
                    }
                };
                
                // Timeout
                setTimeout(() => {
                    resolve({ success: false });
                }, 8000);
                
            } catch (error) {
                resolve({ success: false });
            }
        });
    }

    async _tryBroadcastAuth(email, password) {
        console.log('🔧 Método extremo 5: Broadcast Channel API...');
        
        return new Promise((resolve) => {
            try {
                const channel = new BroadcastChannel('extreme_auth_channel');
                
                channel.onmessage = (event) => {
                    if (event.data.type === 'auth_response') {
                        channel.close();
                        
                        if (event.data.data && event.data.data.idToken) {
                            resolve(this._handleSuccess(event.data.data, 'broadcast'));
                        } else {
                            resolve({ success: false });
                        }
                    }
                };
                
                // Enviar solicitud
                channel.postMessage({
                    type: 'auth_request',
                    email: email,
                    password: password,
                    apiKey: this.apiKey
                });
                
                // También intentamos nosotros mismos
                fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${this.apiKey}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password, returnSecureToken: true })
                })
                .then(response => response.json())
                .then(data => {
                    channel.postMessage({ type: 'auth_response', data: data });
                })
                .catch(() => {
                    channel.postMessage({ type: 'auth_response', error: 'Failed' });
                });
                
                // Timeout
                setTimeout(() => {
                    channel.close();
                    resolve({ success: false });
                }, 8000);
                
            } catch (error) {
                resolve({ success: false });
            }
        });
    }

    async _trySSEAuth(email, password) {
        console.log('🔧 Método extremo 6: Server-Sent Events...');
        
        return new Promise((resolve) => {
            try {
                // Crear evento SSE simulado
                const eventSource = new EventSource('data:text/plain,init');
                
                eventSource.onmessage = (event) => {
                    try {
                        const data = JSON.parse(event.data);
                        if (data.idToken) {
                            eventSource.close();
                            resolve(this._handleSuccess(data, 'sse'));
                        }
                    } catch (error) {
                        // Ignorar errores de parsing
                    }
                };
                
                eventSource.onerror = () => {
                    eventSource.close();
                    
                    // Fallback a fetch normal
                    fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${this.apiKey}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email, password, returnSecureToken: true })
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.idToken) {
                            resolve(this._handleSuccess(data, 'sse'));
                        } else {
                            resolve({ success: false });
                        }
                    })
                    .catch(() => {
                        resolve({ success: false });
                    });
                };
                
                // Timeout
                setTimeout(() => {
                    eventSource.close();
                    resolve({ success: false });
                }, 8000);
                
            } catch (error) {
                resolve({ success: false });
            }
        });
    }

    async _tryRedirectAuth(email, password) {
        console.log('🔧 Método extremo 7: Fetch con redirect manual...');
        
        try {
            // Intentar con redirect manual
            const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${this.apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, returnSecureToken: true }),
                redirect: 'manual',
                mode: 'no-cors'
            });
            
            // Si hay redirect, seguirlo
            if (response.type === 'opaqueredirect') {
                // Intentar obtener location del header
                const location = response.headers.get('location');
                if (location) {
                    const followResponse = await fetch(location, { mode: 'no-cors' });
                    // Procesar respuesta
                    return { success: false }; // Simplificado por ahora
                }
            }
            
            return { success: false };
        } catch (error) {
            return { success: false };
        }
    }

    async _tryXHRAuth(email, password) {
        console.log('🔧 Método extremo 8: XHR con configuración extrema...');
        
        return new Promise((resolve) => {
            try {
                const xhr = new XMLHttpRequest();
                
                // Configuración extrema
                xhr.open('POST', `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${this.apiKey}`, true);
                xhr.setRequestHeader('Content-Type', 'application/json');
                xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
                xhr.setRequestHeader('Cache-Control', 'no-cache');
                xhr.setRequestHeader('Pragma', 'no-cache');
                
                // Manejar diferentes estados
                xhr.onreadystatechange = function() {
                    if (xhr.readyState === 4) {
                        try {
                            const response = JSON.parse(xhr.responseText);
                            if (response.idToken) {
                                resolve(this._handleSuccess(response, 'xhr'));
                            } else {
                                resolve({ success: false });
                            }
                        } catch (error) {
                            resolve({ success: false });
                        }
                    }
                }.bind(this);
                
                xhr.onerror = () => {
                    resolve({ success: false });
                };
                
                xhr.ontimeout = () => {
                    resolve({ success: false });
                };
                
                xhr.timeout = 10000;
                
                // Enviar solicitud
                xhr.send(JSON.stringify({ email, password, returnSecureToken: true }));
                
            } catch (error) {
                resolve({ success: false });
            }
        });
    }

    _handleSuccess(data, method) {
        console.log(`✅ Autenticación extrema exitosa con: ${method}`);
        this.currentUser = data;
        this._notifyAuthStateChanged();
        
        return {
            success: true,
            user: data,
            method: method
        };
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

// Inicializar el sistema extremo (se inicializará después de cargar el config)
let authExtreme = null;

// Función auxiliar para login extremo
async function loginExtreme(email, password) {
    try {
        if (!authExtreme) {
            throw new Error('Sistema extremo no inicializado. Asegúrate de cargar firebase-config.js primero.');
        }
        console.log('🚀 Iniciando login EXTREMO...');
        const result = await authExtreme.signInWithEmailAndPassword(email, password);
        
        if (result.success) {
            console.log('✅ Login extremo exitoso!');
            console.log(`📡 Método extremo usado: ${result.method}`);
            
            // Guardar sesión
            localStorage.setItem('authUser', JSON.stringify(result.user));
            
            return {
                success: true,
                user: result.user,
                method: result.method
            };
        }
        
    } catch (error) {
        console.error('❌ Login extremo falló:', error);
        return {
            success: false,
            error: error.message
        };
    }
}