import { useI18n } from './context';

export const useTranslation = () => {
  const { t, language, setLanguage } = useI18n();
  
  return {
    t,
    language,
    setLanguage,
    
    // Быстрый доступ к основным секциям
    common: (key: string, params?: Record<string, string | number>) => 
      t(`common.${key}`, params),
    auth: (key: string, params?: Record<string, string | number>) => 
      t(`auth.${key}`, params),
    nav: (key: string, params?: Record<string, string | number>) => 
      t(`navigation.${key}`, params),
    settings: (key: string, params?: Record<string, string | number>) => 
      t(`settings.${key}`, params),
    calendar: (key: string, params?: Record<string, string | number>) => 
      t(`calendar.${key}`, params),
    goals: (key: string, params?: Record<string, string | number>) => 
      t(`goals.${key}`, params),
    addGoalModal: (key: string, params?: Record<string, string | number>) => 
      t(`addGoalModal.${key}`, params),
    categories: (key: string, params?: Record<string, string | number>) => 
      t(`categories.${key}`, params),
    priorities: (key: string, params?: Record<string, string | number>) => 
      t(`priorities.${key}`, params),
    colors: (key: string, params?: Record<string, string | number>) => 
      t(`colors.${key}`, params),
    eventModal: (key: string, params?: Record<string, string | number>) => 
      t(`eventModal.${key}`, params),
    errors: (key: string, params?: Record<string, string | number>) => 
      t(`errors.${key}`, params),
  };
};

// Простой хук для форматирования дат (если нужен)
export const useLocalization = () => {
  const { language } = useI18n();
  
  const formatDate = (date: Date | string, options?: Intl.DateTimeFormatOptions) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    const defaultOptions: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    };
    
    return dateObj.toLocaleDateString(language === 'ru' ? 'ru-RU' : 'en-US', {
      ...defaultOptions,
      ...options,
    });
  };
  
  return {
    formatDate,
    locale: language === 'ru' ? 'ru-RU' : 'en-US',
  };
};