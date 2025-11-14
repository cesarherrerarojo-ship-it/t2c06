/**
 * Internationalization (i18n) System for TuCitaSegura
 * Supports multiple languages with automatic detection and persistence
 */

// Available languages
export const LANGUAGES = {
  ES: {
    code: 'es',
    name: 'Español',
    nativeName: 'Español',
    flag: '🇪🇸',
    rtl: false
  },
  EN: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇬🇧',
    rtl: false
  },
  PT: {
    code: 'pt',
    name: 'Portuguese',
    nativeName: 'Português',
    flag: '🇵🇹',
    rtl: false
  },
  FR: {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    flag: '🇫🇷',
    rtl: false
  },
  DE: {
    code: 'de',
    name: 'German',
    nativeName: 'Deutsch',
    flag: '🇩🇪',
    rtl: false
  },
  IT: {
    code: 'it',
    name: 'Italian',
    nativeName: 'Italiano',
    flag: '🇮🇹',
    rtl: false
  }
};

// Default language
const DEFAULT_LANGUAGE = 'es';

// Current language
let currentLanguage = DEFAULT_LANGUAGE;

// Translations cache
let translations = {};

/**
 * Initialize i18n system
 * @param {Object} userData - User data from Firestore (optional)
 * @returns {Promise<string>} Current language code
 */
export async function initI18n(userData = null) {
  // Priority: User preference > localStorage > Browser language > Default
  let langCode = DEFAULT_LANGUAGE;

  // 1. Check user preference from Firestore
  if (userData && userData.language) {
    langCode = userData.language;
  }
  // 2. Check localStorage
  else {
    const savedLang = localStorage.getItem('userLanguage');
    if (savedLang && isLanguageSupported(savedLang)) {
      langCode = savedLang;
    }
    // 3. Detect browser language
    else {
      langCode = detectBrowserLanguage();
    }
  }

  // Load translations
  await setLanguage(langCode);

  return currentLanguage;
}

/**
 * Detect browser language
 * @returns {string} Language code
 */
function detectBrowserLanguage() {
  const browserLang = navigator.language || navigator.userLanguage;

  // Extract language code (e.g., 'en-US' -> 'en')
  const langCode = browserLang.split('-')[0].toLowerCase();

  // Check if supported
  if (isLanguageSupported(langCode)) {
    return langCode;
  }

  return DEFAULT_LANGUAGE;
}

/**
 * Check if language is supported
 * @param {string} langCode - Language code
 * @returns {boolean} Whether language is supported
 */
function isLanguageSupported(langCode) {
  return Object.values(LANGUAGES).some(lang => lang.code === langCode);
}

/**
 * Set current language
 * @param {string} langCode - Language code
 * @returns {Promise<void>}
 */
export async function setLanguage(langCode) {
  if (!isLanguageSupported(langCode)) {
    console.warn(`Language '${langCode}' not supported, falling back to '${DEFAULT_LANGUAGE}'`);
    langCode = DEFAULT_LANGUAGE;
  }

  currentLanguage = langCode;

  // Load translations
  await loadTranslations(langCode);

  // Save to localStorage
  localStorage.setItem('userLanguage', langCode);

  // Update HTML lang attribute
  document.documentElement.lang = langCode;

  // Update RTL if needed
  const language = Object.values(LANGUAGES).find(lang => lang.code === langCode);
  if (language && language.rtl) {
    document.documentElement.dir = 'rtl';
  } else {
    document.documentElement.dir = 'ltr';
  }

  // Dispatch language change event
  window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: langCode } }));
}

/**
 * Load translations for a language
 * @param {string} langCode - Language code
 * @returns {Promise<void>}
 */
async function loadTranslations(langCode) {
  try {
    // Dynamic import of translation file
    const module = await import(`./translations/${langCode}.js`);
    translations = module.default || module.translations;
  } catch (error) {
    console.error(`Failed to load translations for '${langCode}':`, error);

    // Fallback to default language
    if (langCode !== DEFAULT_LANGUAGE) {
      try {
        const fallbackModule = await import(`./translations/${DEFAULT_LANGUAGE}.js`);
        translations = fallbackModule.default || fallbackModule.translations;
      } catch (fallbackError) {
        console.error('Failed to load fallback translations:', fallbackError);
        translations = {};
      }
    }
  }
}

/**
 * Get translation for a key
 * @param {string} key - Translation key (supports dot notation: 'auth.login.title')
 * @param {Object} params - Parameters to replace in translation
 * @returns {string} Translated text
 */
export function t(key, params = {}) {
  // Navigate through nested object using dot notation
  const keys = key.split('.');
  let value = translations;

  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      console.warn(`Translation key not found: '${key}' in language '${currentLanguage}'`);
      return key; // Return key if translation not found
    }
  }

  // Replace parameters
  if (typeof value === 'string') {
    return replaceParams(value, params);
  }

  console.warn(`Translation value is not a string for key: '${key}'`);
  return key;
}

/**
 * Replace parameters in translation string
 * @param {string} text - Translation text
 * @param {Object} params - Parameters to replace
 * @returns {string} Text with replaced parameters
 */
function replaceParams(text, params) {
  let result = text;

  Object.keys(params).forEach(key => {
    const regex = new RegExp(`{${key}}`, 'g');
    result = result.replace(regex, params[key]);
  });

  return result;
}

/**
 * Get current language code
 * @returns {string} Current language code
 */
export function getCurrentLanguage() {
  return currentLanguage;
}

/**
 * Get current language info
 * @returns {Object} Language info
 */
export function getCurrentLanguageInfo() {
  return Object.values(LANGUAGES).find(lang => lang.code === currentLanguage);
}

/**
 * Get all supported languages
 * @returns {Array} Array of language objects
 */
export function getSupportedLanguages() {
  return Object.values(LANGUAGES);
}

/**
 * Save language preference to Firestore
 * @param {Object} db - Firestore instance
 * @param {string} userId - User ID
 * @param {string} langCode - Language code
 * @returns {Promise<boolean>} Success status
 */
export async function saveLanguageToFirestore(db, userId, langCode) {
  const { doc, updateDoc } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js');

  try {
    await updateDoc(doc(db, 'users', userId), {
      language: langCode,
      updatedAt: new Date()
    });

    localStorage.setItem('userLanguage', langCode);
    return true;
  } catch (error) {
    console.error('Error saving language preference:', error);
    return false;
  }
}

/**
 * Translate all elements with data-i18n attribute
 * Usage: <span data-i18n="auth.login.title"></span>
 */
export function translatePage() {
  const elements = document.querySelectorAll('[data-i18n]');

  elements.forEach(element => {
    const key = element.getAttribute('data-i18n');
    const params = element.getAttribute('data-i18n-params');

    let translationParams = {};
    if (params) {
      try {
        translationParams = JSON.parse(params);
      } catch (error) {
        console.error('Invalid data-i18n-params JSON:', params);
      }
    }

    element.textContent = t(key, translationParams);
  });
}

/**
 * Translate placeholder attributes
 * Usage: <input data-i18n-placeholder="auth.login.emailPlaceholder">
 */
export function translatePlaceholders() {
  const elements = document.querySelectorAll('[data-i18n-placeholder]');

  elements.forEach(element => {
    const key = element.getAttribute('data-i18n-placeholder');
    element.placeholder = t(key);
  });
}

/**
 * Translate all elements on page
 */
export function translateAll() {
  translatePage();
  translatePlaceholders();
}

/**
 * Format date according to locale
 * @param {Date|string} date - Date to format
 * @param {Object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date
 */
export function formatDate(date, options = {}) {
  const dateObj = date instanceof Date ? date : new Date(date);

  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };

  return new Intl.DateTimeFormat(currentLanguage, { ...defaultOptions, ...options }).format(dateObj);
}

/**
 * Format time according to locale
 * @param {Date|string} date - Date to format
 * @param {Object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted time
 */
export function formatTime(date, options = {}) {
  const dateObj = date instanceof Date ? date : new Date(date);

  const defaultOptions = {
    hour: '2-digit',
    minute: '2-digit'
  };

  return new Intl.DateTimeFormat(currentLanguage, { ...defaultOptions, ...options }).format(dateObj);
}

/**
 * Format number according to locale
 * @param {number} number - Number to format
 * @param {Object} options - Intl.NumberFormat options
 * @returns {string} Formatted number
 */
export function formatNumber(number, options = {}) {
  return new Intl.NumberFormat(currentLanguage, options).format(number);
}

/**
 * Format currency according to locale
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (default: EUR)
 * @returns {string} Formatted currency
 */
export function formatCurrency(amount, currency = 'EUR') {
  return new Intl.NumberFormat(currentLanguage, {
    style: 'currency',
    currency: currency
  }).format(amount);
}

/**
 * Get relative time string (e.g., "2 hours ago")
 * @param {Date|string} date - Date to format
 * @returns {string} Relative time string
 */
export function getRelativeTime(date) {
  const dateObj = date instanceof Date ? date : new Date(date);
  const now = new Date();
  const diffMs = now - dateObj;
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) {
    return t('common.time.justNow');
  } else if (diffMins < 60) {
    return t('common.time.minutesAgo', { count: diffMins });
  } else if (diffHours < 24) {
    return t('common.time.hoursAgo', { count: diffHours });
  } else if (diffDays < 7) {
    return t('common.time.daysAgo', { count: diffDays });
  } else {
    return formatDate(dateObj, { month: 'short', day: 'numeric' });
  }
}

/**
 * Listen for language changes
 * @param {Function} callback - Callback function
 */
export function onLanguageChange(callback) {
  window.addEventListener('languageChanged', (event) => {
    callback(event.detail.language);
  });
}

// Auto-initialize on page load (from localStorage for instant feedback)
if (typeof window !== 'undefined') {
  const savedLang = localStorage.getItem('userLanguage');
  if (savedLang && isLanguageSupported(savedLang)) {
    currentLanguage = savedLang;
    document.documentElement.lang = savedLang;
  }
}
