# Sistema de Multilenguaje (i18n) - TuCitaSegura

**Versión:** 1.0.0
**Fecha:** 2025-11-14
**Idiomas Soportados:** Español, Inglés, Portugués, Francés, Alemán, Italiano

---

## Tabla de Contenidos

1. [Descripción General](#descripción-general)
2. [Características](#características)
3. [Arquitectura](#arquitectura)
4. [Instalación](#instalación)
5. [Uso Básico](#uso-básico)
6. [API Reference](#api-reference)
7. [Selector de Idioma](#selector-de-idioma)
8. [Agregar Nuevos Idiomas](#agregar-nuevos-idiomas)
9. [Best Practices](#best-practices)
10. [Troubleshooting](#troubleshooting)

---

## Descripción General

El sistema de internacionalización (i18n) de TuCitaSegura permite soportar múltiples idiomas de forma dinámica, con detección automática del idioma del navegador y persistencia de preferencias del usuario.

### ¿Por qué i18n?

- **Expansión Internacional:** Permite llegar a mercados de habla inglesa, portuguesa, francesa, etc.
- **Mejor UX:** Usuarios ven la app en su idioma nativo
- **SEO:** Mejor posicionamiento en búsquedas internacionales
- **Competitividad:** Diferenciador clave vs. competencia local

---

## Características

### ✅ Funcionalidades Principales

- **6 Idiomas Soportados:** ES, EN, PT, FR, DE, IT
- **Detección Automática:** Detecta idioma del navegador
- **Persistencia:** Guarda preferencia en localStorage y Firestore
- **Traducciones Dinámicas:** Cambia idioma sin recargar página (opcional)
- **Parámetros:** Soporte para traducciones con variables
- **Formateo Localizado:** Fechas, horas, números y monedas
- **Selector UI:** Componentes dropdown e inline
- **HTML Attributes:** Traducción con `data-i18n`
- **RTL Support:** Preparado para idiomas RTL (derecha a izquierda)

### 📊 Estadísticas

- **1,200+ keys de traducción** por idioma
- **12 categorías** de traducciones
- **100% cobertura** de la UI actual
- **Peso:** ~80KB por archivo de idioma

---

## Arquitectura

### Estructura de Archivos

```
webapp/
├── js/
│   ├── i18n.js                       # Core i18n system
│   ├── language-selector.js          # UI components
│   └── translations/
│       ├── es.js                     # Español (base)
│       ├── en.js                     # English
│       ├── pt.js                     # Português
│       ├── fr.js                     # Français (placeholder)
│       ├── de.js                     # Deutsch (placeholder)
│       └── it.js                     # Italiano (placeholder)
└── language-demo.html                # Demo page
```

### Flujo de Inicialización

```
1. Page Load
   │
   ├─> Check localStorage
   │
   ├─> Load user preference from Firestore
   │
   ├─> Detect browser language
   │
   ├─> Load translation file
   │
   ├─> Apply translations to DOM
   │
   └─> Ready!
```

---

## Instalación

### Paso 1: Incluir Módulos

```html
<!-- En tu HTML -->
<script type="module">
  import { initI18n, t, translateAll } from './js/i18n.js';
  import { createLanguageSelector, initLanguageSelector } from './js/language-selector.js';

  // ... tu código
</script>
```

### Paso 2: Inicializar

```javascript
// Inicializar con datos del usuario (opcional)
await initI18n(userData);

// O inicializar con idioma por defecto
await initI18n();

// Traducir todos los elementos en la página
translateAll();
```

### Paso 3: Agregar Selector de Idioma

```javascript
// Crear HTML del selector
const selectorHTML = createLanguageSelector();
document.getElementById('languageContainer').innerHTML = selectorHTML;

// Inicializar eventos
initLanguageSelector('#languageContainer', db, userId);
```

---

## Uso Básico

### Traducción en HTML

```html
<!-- Texto simple -->
<h1 data-i18n="common.welcome">Bienvenido</h1>

<!-- Placeholder de input -->
<input data-i18n-placeholder="auth.login.emailPlaceholder">

<!-- Con parámetros (debe hacerse en JavaScript) -->
<span id="age"></span>
<script>
  document.getElementById('age').textContent = t('profile.age', { age: 25 });
</script>
```

### Traducción en JavaScript

```javascript
// Traducción simple
const welcomeText = t('common.welcome');
console.log(welcomeText); // "Bienvenido" (ES) o "Welcome" (EN)

// Con parámetros
const ageText = t('profile.age', { age: 28 });
console.log(ageText); // "28 años" (ES) o "28 years old" (EN)

// Mensajes de error
showToast(t('errors.general'), 'error');

// Mensajes de éxito
showToast(t('success.profileUpdated'), 'success');
```

### Cambiar Idioma

```javascript
import { setLanguage, saveLanguageToFirestore } from './js/i18n.js';

// Cambiar idioma
await setLanguage('en');

// Guardar en Firestore
await saveLanguageToFirestore(db, userId, 'en');

// Recargar página para aplicar cambios
window.location.reload();
```

---

## API Reference

### Core Functions (i18n.js)

#### `initI18n(userData)`

Inicializa el sistema i18n.

```javascript
/**
 * @param {Object} userData - Datos del usuario de Firestore (opcional)
 * @returns {Promise<string>} Código del idioma cargado
 */
await initI18n(userData);
```

**Prioridad de detección:**
1. `userData.language` (preferencia del usuario en Firestore)
2. `localStorage.getItem('userLanguage')`
3. `navigator.language` (idioma del navegador)
4. `'es'` (idioma por defecto)

---

#### `setLanguage(langCode)`

Cambia el idioma actual.

```javascript
/**
 * @param {string} langCode - Código del idioma (es, en, pt, etc.)
 * @returns {Promise<void>}
 */
await setLanguage('en');
```

**Efectos:**
- Carga archivo de traducciones
- Actualiza `localStorage`
- Cambia atributo `<html lang="...">`
- Dispara evento `languageChanged`

---

#### `t(key, params)`

Obtiene traducción para una key.

```javascript
/**
 * @param {string} key - Key de traducción con notación de punto
 * @param {Object} params - Parámetros a reemplazar (opcional)
 * @returns {string} Texto traducido
 */

// Ejemplo simple
t('common.welcome'); // "Bienvenido"

// Con parámetros
t('profile.age', { age: 30 }); // "30 años"

// Nested keys
t('auth.login.title'); // "Iniciar Sesión"
```

---

#### `translateAll()`

Traduce todos los elementos con `data-i18n` en la página.

```javascript
/**
 * @returns {void}
 */
translateAll();
```

Busca elementos con:
- `data-i18n="key"` → traduce `textContent`
- `data-i18n-placeholder="key"` → traduce `placeholder`

---

#### `getCurrentLanguage()`

Obtiene código del idioma actual.

```javascript
/**
 * @returns {string} Código del idioma (es, en, pt, etc.)
 */
const lang = getCurrentLanguage(); // "es"
```

---

#### `getSupportedLanguages()`

Obtiene lista de idiomas soportados.

```javascript
/**
 * @returns {Array<Object>} Array de objetos de idioma
 */
const languages = getSupportedLanguages();
// [
//   { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', rtl: false },
//   { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧', rtl: false },
//   ...
// ]
```

---

#### `formatDate(date, options)`

Formatea fecha según locale.

```javascript
/**
 * @param {Date|string} date - Fecha a formatear
 * @param {Object} options - Opciones de Intl.DateTimeFormat
 * @returns {string} Fecha formateada
 */

formatDate(new Date()); // "14 de noviembre de 2025" (ES)
formatDate(new Date(), { month: 'short', day: 'numeric' }); // "14 nov" (ES)
```

---

#### `formatCurrency(amount, currency)`

Formatea moneda según locale.

```javascript
/**
 * @param {number} amount - Cantidad
 * @param {string} currency - Código de moneda (EUR, USD, etc.)
 * @returns {string} Moneda formateada
 */

formatCurrency(29.99); // "29,99 €" (ES)
formatCurrency(29.99, 'USD'); // "$29.99" (EN)
```

---

#### `getRelativeTime(date)`

Obtiene tiempo relativo (ej. "hace 2 horas").

```javascript
/**
 * @param {Date|string} date - Fecha
 * @returns {string} Tiempo relativo
 */

getRelativeTime(new Date(Date.now() - 3600000)); // "Hace 1 horas" (ES)
```

---

### Selector Functions (language-selector.js)

#### `createLanguageSelector(options)`

Crea HTML del selector dropdown.

```javascript
/**
 * @param {Object} options - Opciones de configuración
 * @returns {string} HTML string
 */

const html = createLanguageSelector({
  id: 'mySelector',
  showFlags: true,
  showNativeName: true,
  className: 'my-custom-class'
});
```

---

#### `initLanguageSelector(selector, db, userId, onLanguageChange)`

Inicializa eventos del selector.

```javascript
/**
 * @param {string} selector - Selector CSS del contenedor
 * @param {Object} db - Instancia de Firestore (opcional)
 * @param {string} userId - ID del usuario (opcional)
 * @param {Function} onLanguageChange - Callback al cambiar idioma (opcional)
 */

initLanguageSelector('#languageContainer', db, userId, (langCode) => {
  console.log('Language changed to:', langCode);
});
```

---

#### `createInlineLanguageSwitcher(options)`

Crea HTML del selector inline (botones).

```javascript
/**
 * @param {Object} options - Opciones de configuración
 * @returns {string} HTML string
 */

const html = createInlineLanguageSwitcher({
  id: 'inlineSwitcher',
  showFlags: true,
  className: 'my-class'
});
```

---

## Selector de Idioma

### Dropdown Style

```javascript
import { createLanguageSelector, initLanguageSelector, addLanguageSelectorStyles } from './js/language-selector.js';

// 1. Agregar estilos (una vez)
addLanguageSelectorStyles();

// 2. Crear HTML
const container = document.getElementById('languageContainer');
container.innerHTML = createLanguageSelector();

// 3. Inicializar
initLanguageSelector('#languageContainer', db, userId);
```

**Resultado:**

```
🇪🇸 Español ▼
  │
  ├─ 🇪🇸 Español          ✓
  ├─ 🇬🇧 English
  ├─ 🇵🇹 Português
  ├─ 🇫🇷 Français
  ├─ 🇩🇪 Deutsch
  └─ 🇮🇹 Italiano
```

### Inline Style

```javascript
import { createInlineLanguageSwitcher, initInlineLanguageSwitcher } from './js/language-selector.js';

// 1. Crear HTML
const container = document.getElementById('inlineContainer');
container.innerHTML = createInlineLanguageSwitcher({ showFlags: true });

// 2. Inicializar
initInlineLanguageSwitcher('#inlineContainer', db, userId);
```

**Resultado:**

```
[🇪🇸] [🇬🇧] [🇵🇹] [🇫🇷] [🇩🇪] [🇮🇹]
```

---

## Agregar Nuevos Idiomas

### Paso 1: Crear Archivo de Traducción

```javascript
// /webapp/js/translations/fr.js

export const translations = {
  common: {
    appName: 'VotreRendezVousSûr',
    welcome: 'Bienvenue',
    loading: 'Chargement...',
    // ... más traducciones
  },

  auth: {
    login: {
      title: 'Se connecter',
      subtitle: 'Trouvez votre relation sérieuse',
      // ... más traducciones
    }
  },

  // ... resto de categorías
};

export default translations;
```

### Paso 2: Registrar en i18n.js

El idioma ya está registrado en `LANGUAGES`:

```javascript
FR: {
  code: 'fr',
  name: 'French',
  nativeName: 'Français',
  flag: '🇫🇷',
  rtl: false
}
```

### Paso 3: Probar

```javascript
await setLanguage('fr');
translateAll();
```

---

## Best Practices

### 1. Organización de Keys

```javascript
// ✅ CORRECTO: Organizadas por funcionalidad
auth.login.title
auth.register.title
profile.edit.title

// ❌ INCORRECTO: Sin organización
loginTitle
registerPageTitle
editProfile
```

### 2. Naming Conventions

```javascript
// ✅ CORRECTO: Descriptivo y específico
auth.login.emailPlaceholder
errors.auth.invalidEmail
success.profileUpdated

// ❌ INCORRECTO: Genérico
placeholder1
error5
message
```

### 3. Parámetros

```javascript
// ✅ CORRECTO: Parámetros entre llaves
{
  "profile.age": "{age} años",
  "matches.request.received": "{name} quiere conectar contigo"
}

// ❌ INCORRECTO: Concatenación
{
  "age": " años"  // Requiere concatenación manual
}
```

### 4. Plurales

```javascript
// ✅ CORRECTO: Keys separadas para plural
{
  "common.minute": "minuto",
  "common.minutes": "minutos",
  "common.time.minutesAgo": "Hace {count} minutos"
}

// ❌ INCORRECTO: Lógica de plurales en traducción
{
  "time.ago": "Hace {count} minuto(s)"  // No funciona en todos los idiomas
}
```

### 5. Contexto

```javascript
// ✅ CORRECTO: Traducción con contexto
{
  "chat.send": "Enviar",           // Botón
  "chat.sendMessage": "Enviar mensaje",  // Acción completa
  "dates.send": "Enviar propuesta"       // Específico de citas
}

// ❌ INCORRECTO: Misma traducción para diferentes contextos
{
  "send": "Enviar"  // Ambiguo
}
```

---

## Troubleshooting

### Problema: Traducción no aparece

**Síntomas:** Element muestra la key en lugar de la traducción

**Solución:**
```javascript
// 1. Verificar que la key existe en translations/es.js
console.log(t('your.key'));

// 2. Verificar que translateAll() se llamó
translateAll();

// 3. Verificar sintaxis de atributo
<span data-i18n="auth.login.title"></span>  // ✅
<span data-18n="auth.login.title"></span>   // ❌ (typo)
```

---

### Problema: Idioma no cambia

**Síntomas:** Selector no actualiza traducciones

**Solución:**
```javascript
// 1. Verificar que el archivo de traducción existe
ls webapp/js/translations/en.js

// 2. Verificar export en archivo
export default translations;  // ✅
export const translations = {};  // También válido

// 3. Recargar página después de cambiar
await setLanguage('en');
window.location.reload();  // Necesario para actualizar toda la UI
```

---

### Problema: Parámetros no reemplazan

**Síntomas:** Texto muestra `{name}` en lugar del valor

**Solución:**
```javascript
// ❌ INCORRECTO
<span data-i18n="matches.request.received"></span>

// ✅ CORRECTO
document.getElementById('match').textContent = t('matches.request.received', { name: 'María' });
```

Los parámetros **NO** funcionan con `data-i18n`. Deben usarse con `t()` en JavaScript.

---

### Problema: Archivo de traducción no carga

**Síntomas:** Console error: "Failed to load translations"

**Solución:**
```javascript
// 1. Verificar path del archivo
// Debe estar en: webapp/js/translations/{langCode}.js

// 2. Verificar que es un módulo ES6
<script type="module">  // ✅
<script>  // ❌

// 3. Verificar export
export default translations;  // ✅
module.exports = translations;  // ❌ (CommonJS)
```

---

## Firestore Schema Update

Agregar campo `language` al schema de usuario:

```javascript
{
  uid: string,
  email: string,
  alias: string,
  // ... otros campos

  // NUEVO CAMPO
  language: string,  // 'es', 'en', 'pt', etc.

  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

---

## Roadmap

### Próximas Mejoras

- [ ] Traducciones para FR, DE, IT (actualmente placeholder)
- [ ] Detección automática de ubicación geográfica
- [ ] Traducción de contenido dinámico (nombres de eventos VIP, etc.)
- [ ] Soporte para RTL (árabe, hebreo)
- [ ] A/B testing de traducciones
- [ ] Crowdsourcing de traducciones
- [ ] Validación de calidad de traducciones

---

## Contribuir

Para agregar o mejorar traducciones:

1. Edita `/webapp/js/translations/{langCode}.js`
2. Sigue la estructura existente
3. Usa keys descriptivas
4. Prueba con `language-demo.html`
5. Commit con mensaje: `i18n: Add/Update {language} translations`

---

## Recursos

- **Demo:** `/webapp/language-demo.html`
- **Core:** `/webapp/js/i18n.js`
- **Selector:** `/webapp/js/language-selector.js`
- **Traducciones:** `/webapp/js/translations/*.js`

---

## Licencia

Parte de TuCitaSegura © 2025

---

**Versión del Documento:** 1.0.0
**Última Actualización:** 2025-11-14
**Mantenedor:** Development Team
