import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { i18nConfig, Language } from './config';

// Тип для переводов
type Translations = Record<string, any>;

// Тип контекста
interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  translations: Translations | null;
}

// Создаем контекст
const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    // Пробуем получить из localStorage
    const saved = localStorage.getItem(i18nConfig.storageKey) as Language;
    if (saved && i18nConfig.supportedLanguages.includes(saved)) {
      return saved;
    }
    // Определяем язык браузера
    return i18nConfig.detectBrowserLanguage();
  });

  const [translations, setTranslations] = useState<Translations | null>(null);

  // Загружаем переводы
  useEffect(() => {
    const loadTranslations = async () => {
      try {
        const response = await import(`./locales/${language}.json`);
        setTranslations(response.default);
      } catch (error) {
        console.error('Failed to load translations:', error);
        // Загружаем язык по умолчанию
        const fallback = await import(`./locales/${i18nConfig.fallbackLanguage}.json`);
        setTranslations(fallback.default);
      }
    };

    loadTranslations();
  }, [language]);

  // Функция перевода с поддержкой параметров
  const t = (key: string, params?: Record<string, string | number>): string => {
    if (!translations) return key;

    const keys = key.split('.');
    let value: any = translations;

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        console.warn(`Translation key not found: ${key}`);
        return key;
      }
    }

    if (typeof value !== 'string') return key;

    // Заменяем параметры {{param}}
    if (params) {
      return value.replace(/\{\{(\w+)\}\}/g, (match: string, param: string) => {
        return params[param]?.toString() || match;
      });
    }

    return value;
  };

  // Функция смены языка
  const changeLanguage = (lang: Language) => {
    if (i18nConfig.supportedLanguages.includes(lang)) {
      setLanguage(lang);
      localStorage.setItem(i18nConfig.storageKey, lang);
      document.documentElement.lang = lang; // Для accessibility
      document.documentElement.dir = 'ltr'; // Все наши языки LTR
    }
  };

  const contextValue: I18nContextType = {
    language,
    setLanguage: changeLanguage,
    t,
    translations,
  };

  return (
    <I18nContext.Provider value={contextValue}>
      {children}
    </I18nContext.Provider>
  );
};

// Хук для использования контекста
export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return context;
};