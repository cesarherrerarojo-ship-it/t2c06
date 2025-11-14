/**
 * Language Selector Component for TuCitaSegura
 * Provides UI for changing language preferences
 */

import { LANGUAGES, getCurrentLanguage, setLanguage, getSupportedLanguages, saveLanguageToFirestore } from './i18n.js';
import { showToast } from './utils.js';

/**
 * Create language selector HTML
 * @param {Object} options - Configuration options
 * @returns {string} HTML string
 */
export function createLanguageSelector(options = {}) {
  const {
    id = 'languageSelector',
    showFlags = true,
    showNativeName = true,
    className = ''
  } = options;

  const currentLang = getCurrentLanguage();
  const languages = getSupportedLanguages();
  const currentLanguageInfo = languages.find(lang => lang.code === currentLang);

  return `
    <div class="language-selector ${className}" id="${id}">
      <button id="${id}Button" class="language-selector-button glass rounded-lg px-4 py-2 flex items-center gap-2 hover:shadow-lg transition">
        ${showFlags ? `<span class="text-2xl">${currentLanguageInfo.flag}</span>` : ''}
        <span class="font-semibold">${showNativeName ? currentLanguageInfo.nativeName : currentLanguageInfo.name}</span>
        <i class="fas fa-chevron-down text-sm"></i>
      </button>

      <div id="${id}Dropdown" class="language-dropdown glass rounded-lg shadow-2xl hidden absolute mt-2 z-50 min-w-[200px]">
        ${languages.map(lang => `
          <button
            class="language-option w-full px-4 py-3 flex items-center gap-3 hover:bg-white/20 transition ${lang.code === currentLang ? 'bg-white/10' : ''}"
            data-lang="${lang.code}"
          >
            ${showFlags ? `<span class="text-2xl">${lang.flag}</span>` : ''}
            <div class="flex-1 text-left">
              <div class="font-semibold">${lang.nativeName}</div>
              ${showNativeName && lang.nativeName !== lang.name ? `<div class="text-xs text-gray-600">${lang.name}</div>` : ''}
            </div>
            ${lang.code === currentLang ? '<i class="fas fa-check text-green-600"></i>' : ''}
          </button>
        `).join('')}
      </div>
    </div>
  `;
}

/**
 * Initialize language selector
 * @param {string} selector - CSS selector for the language selector container
 * @param {Object} db - Firestore instance (optional)
 * @param {string} userId - User ID (optional, for saving preference)
 * @param {Function} onLanguageChange - Callback when language changes
 */
export function initLanguageSelector(selector, db = null, userId = null, onLanguageChange = null) {
  const container = document.querySelector(selector);
  if (!container) {
    console.error(`Language selector container not found: ${selector}`);
    return;
  }

  // Get selector ID from container or use default
  const selectorId = container.id || 'languageSelector';
  const button = container.querySelector(`#${selectorId}Button`);
  const dropdown = container.querySelector(`#${selectorId}Dropdown`);

  if (!button || !dropdown) {
    console.error('Language selector button or dropdown not found');
    return;
  }

  // Toggle dropdown
  button.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdown.classList.toggle('hidden');
  });

  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!container.contains(e.target)) {
      dropdown.classList.add('hidden');
    }
  });

  // Handle language selection
  const languageOptions = dropdown.querySelectorAll('.language-option');
  languageOptions.forEach(option => {
    option.addEventListener('click', async (e) => {
      e.stopPropagation();

      const langCode = option.getAttribute('data-lang');
      if (!langCode) return;

      // Set language
      await setLanguage(langCode);

      // Save to Firestore if available
      if (db && userId) {
        const saved = await saveLanguageToFirestore(db, userId, langCode);
        if (saved) {
          const langInfo = Object.values(LANGUAGES).find(l => l.code === langCode);
          showToast(`Idioma cambiado a ${langInfo.nativeName}`, 'success');
        }
      }

      // Reload page to apply translations
      window.location.reload();

      // Call callback if provided
      if (onLanguageChange && typeof onLanguageChange === 'function') {
        onLanguageChange(langCode);
      }

      dropdown.classList.add('hidden');
    });
  });
}

/**
 * Create inline language switcher (compact version)
 * @param {Object} options - Configuration options
 * @returns {string} HTML string
 */
export function createInlineLanguageSwitcher(options = {}) {
  const {
    id = 'inlineLanguageSwitcher',
    showFlags = true,
    className = ''
  } = options;

  const languages = getSupportedLanguages();
  const currentLang = getCurrentLanguage();

  return `
    <div class="inline-language-switcher ${className}" id="${id}">
      <div class="flex gap-2">
        ${languages.map(lang => `
          <button
            class="lang-switch-btn ${lang.code === currentLang ? 'active' : ''} px-3 py-1 rounded-lg transition ${lang.code === currentLang ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg' : 'glass hover:bg-white/20'}"
            data-lang="${lang.code}"
            title="${lang.nativeName}"
          >
            ${showFlags ? lang.flag : lang.code.toUpperCase()}
          </button>
        `).join('')}
      </div>
    </div>
  `;
}

/**
 * Initialize inline language switcher
 * @param {string} selector - CSS selector for the inline switcher
 * @param {Object} db - Firestore instance (optional)
 * @param {string} userId - User ID (optional)
 * @param {Function} onLanguageChange - Callback when language changes
 */
export function initInlineLanguageSwitcher(selector, db = null, userId = null, onLanguageChange = null) {
  const container = document.querySelector(selector);
  if (!container) {
    console.error(`Inline language switcher container not found: ${selector}`);
    return;
  }

  const buttons = container.querySelectorAll('.lang-switch-btn');

  buttons.forEach(button => {
    button.addEventListener('click', async () => {
      const langCode = button.getAttribute('data-lang');
      if (!langCode) return;

      // Set language
      await setLanguage(langCode);

      // Save to Firestore if available
      if (db && userId) {
        await saveLanguageToFirestore(db, userId, langCode);
      }

      // Update active state
      buttons.forEach(btn => {
        btn.classList.remove('active', 'bg-gradient-to-r', 'from-purple-600', 'to-pink-600', 'text-white', 'shadow-lg');
        btn.classList.add('glass');
      });

      button.classList.add('active', 'bg-gradient-to-r', 'from-purple-600', 'to-pink-600', 'text-white', 'shadow-lg');
      button.classList.remove('glass');

      // Reload page to apply translations
      window.location.reload();

      // Call callback if provided
      if (onLanguageChange && typeof onLanguageChange === 'function') {
        onLanguageChange(langCode);
      }
    });
  });
}

/**
 * Add CSS for language selector (call once in app)
 */
export function addLanguageSelectorStyles() {
  const styleId = 'language-selector-styles';

  // Check if styles already added
  if (document.getElementById(styleId)) {
    return;
  }

  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = `
    .language-selector {
      position: relative;
      display: inline-block;
    }

    .language-selector-button {
      cursor: pointer;
      user-select: none;
    }

    .language-dropdown {
      position: absolute;
      top: 100%;
      right: 0;
      max-height: 400px;
      overflow-y: auto;
    }

    .language-option {
      cursor: pointer;
      user-select: none;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .language-option:last-child {
      border-bottom: none;
    }

    .inline-language-switcher {
      display: inline-block;
    }

    .lang-switch-btn {
      cursor: pointer;
      user-select: none;
      font-weight: 600;
      font-size: 0.875rem;
      min-width: 50px;
      text-align: center;
    }

    .lang-switch-btn:hover:not(.active) {
      transform: translateY(-2px);
    }

    .lang-switch-btn.active {
      animation: pulse-glow 2s infinite;
    }

    @keyframes pulse-glow {
      0%, 100% {
        box-shadow: 0 0 20px rgba(102, 126, 234, 0.5);
      }
      50% {
        box-shadow: 0 0 40px rgba(102, 126, 234, 0.8);
      }
    }
  `;

  document.head.appendChild(style);
}
