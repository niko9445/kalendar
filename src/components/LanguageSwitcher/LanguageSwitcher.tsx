import React from 'react';
import { useTranslation } from '../../i18n/hooks';

interface LanguageSwitcherProps {
  compact?: boolean;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ compact = false }) => {
  const { language, setLanguage } = useTranslation();

  // Простой переключатель без текста и флагов
  if (compact) {
    return (
      <button
        onClick={() => setLanguage(language === 'ru' ? 'en' : 'ru')}
        className="relative w-12 h-6 rounded-full bg-primary dark:bg-dark-primary transition-colors"
        aria-label={language === 'ru' ? 'Switch to English' : 'Переключить на русский'}
      >
        <span
          className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform shadow-sm ${
            language === 'ru' ? 'left-1' : 'left-7'
          }`}
        />
      </button>
    );
  }

  // Не компактный вариант тоже без текста
  return (
    <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
      <button
        onClick={() => setLanguage('ru')}
        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
          language === 'ru'
            ? 'bg-white dark:bg-gray-700 shadow-sm'
            : 'hover:bg-gray-200 dark:hover:bg-gray-700'
        }`}
        aria-label="Русский"
      >
        RU
      </button>
      <button
        onClick={() => setLanguage('en')}
        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
          language === 'en'
            ? 'bg-white dark:bg-gray-700 shadow-sm'
            : 'hover:bg-gray-200 dark:hover:bg-gray-700'
        }`}
        aria-label="English"
      >
        EN
      </button>
    </div>
  );
};

export default LanguageSwitcher;