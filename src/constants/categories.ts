// constants/categories.ts - Упрощенная версия
export const CATEGORY_KEYS = {
  FINANCE: 'finance',
  LEARNING: 'learning',
  WORK: 'work',
  HEALTH: 'health',
  PERSONAL: 'personal',
  PROJECT: 'project',
  SPORT: 'sport',
  HOBBY: 'hobby',
} as const;

export function getCategoryKey(translatedCategory: string, t: (key: string) => string): string {
  // Простое преобразование: если видим "Финансы" или "Finance" - возвращаем "finance"
  const categoryMap: Record<string, string> = {
    [t('categories.finance')]: CATEGORY_KEYS.FINANCE,
    'Finance': CATEGORY_KEYS.FINANCE,
    'Финансы': CATEGORY_KEYS.FINANCE,
    
    [t('categories.learning')]: CATEGORY_KEYS.LEARNING,
    'Learning': CATEGORY_KEYS.LEARNING,
    'Обучение': CATEGORY_KEYS.LEARNING,
    
    [t('categories.work')]: CATEGORY_KEYS.WORK,
    'Work': CATEGORY_KEYS.WORK,
    'Работа': CATEGORY_KEYS.WORK,
    
    [t('categories.health')]: CATEGORY_KEYS.HEALTH,
    'Health': CATEGORY_KEYS.HEALTH,
    'Здоровье': CATEGORY_KEYS.HEALTH,
    
    [t('categories.personal')]: CATEGORY_KEYS.PERSONAL,
    'Personal': CATEGORY_KEYS.PERSONAL,
    'Личное': CATEGORY_KEYS.PERSONAL,
    
    [t('categories.project')]: CATEGORY_KEYS.PROJECT,
    'Project': CATEGORY_KEYS.PROJECT,
    'Проект': CATEGORY_KEYS.PROJECT,
    
    [t('categories.sport')]: CATEGORY_KEYS.SPORT,
    'Sport': CATEGORY_KEYS.SPORT,
    'Спорт': CATEGORY_KEYS.SPORT,
    
    [t('categories.hobby')]: CATEGORY_KEYS.HOBBY,
    'Hobby': CATEGORY_KEYS.HOBBY,
    'Хобби': CATEGORY_KEYS.HOBBY,
  };
  
  return categoryMap[translatedCategory] || CATEGORY_KEYS.PERSONAL;
}