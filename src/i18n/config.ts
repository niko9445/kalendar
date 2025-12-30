// Типы языков
export type Language = 'ru' | 'en';

// Конфигурация
export const i18nConfig = {
  defaultLanguage: 'ru' as Language,
  supportedLanguages: ['ru', 'en'] as Language[],
  fallbackLanguage: 'ru' as Language,
  
  // Сохранение в localStorage
  storageKey: 'app_language',
  
  // Определение языка браузера
  detectBrowserLanguage: (): Language => {
    const browserLang = navigator.language.split('-')[0];
    return browserLang === 'en' ? 'en' : 'ru';
  }
};