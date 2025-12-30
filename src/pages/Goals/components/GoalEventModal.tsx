import React, { useState, useEffect } from 'react';
import { cn } from '../../../utils/cn';
import { useTranslation } from '../../../i18n/hooks';

interface GoalEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (eventData: {
    title: string;
    description: string;
    date: string;
    color: string;
    type: 'work' | 'personal' | 'health' | 'learning';
    completed: boolean;
    amount?: number;
    currency?: string;
  }) => void;
  selectedDate: string | null;
  goalTitle: string;
  goalCategory?: string;
}

const GoalEventModal: React.FC<GoalEventModalProps> = ({
  isOpen,
  onClose,
  onSave,
  selectedDate,
  goalTitle,
  goalCategory = '',
}) => {
  const { t } = useTranslation();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('bg-blue-500');
  const [amount, setAmount] = useState<number | undefined>(undefined);
  const [currency, setCurrency] = useState('RUB');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const COLOR_OPTIONS = [
    { value: 'bg-blue-500', label: t('colors.blue'), hex: '#3b82f6' },
    { value: 'bg-green-500', label: t('colors.green'), hex: '#10b981' },
    { value: 'bg-yellow-500', label: t('colors.yellow'), hex: '#f59e0b' },
    { value: 'bg-red-500', label: t('colors.red'), hex: '#ef4444' },
    { value: 'bg-purple-500', label: t('colors.purple'), hex: '#8b5cf6' },
    { value: 'bg-pink-500', label: t('colors.pink'), hex: '#ec4899' },
  ];

  // Функция для осветления цвета (добавить в начало компонента, после useState)
  const brightenColor = (hex: string, percent: number): string => {
    // Убираем # если есть
    let color = hex.replace('#', '');
    
    // Если сокращенный формат (3 символа), расширяем до 6
    if (color.length === 3) {
      color = color.split('').map(c => c + c).join('');
    }
    
    // Конвертируем в RGB
    const r = parseInt(color.substr(0, 2), 16);
    const g = parseInt(color.substr(2, 2), 16);
    const b = parseInt(color.substr(4, 2), 16);
    
    // Осветляем каждый канал
    const brighten = (channel: number) => {
      return Math.min(255, Math.round(channel + (255 - channel) * (percent / 100)));
    };
    
    const newR = brighten(r);
    const newG = brighten(g);
    const newB = brighten(b);
    
    // Конвертируем обратно в HEX
    const toHex = (n: number) => {
      const hex = n.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };
    
    return `#${toHex(newR)}${toHex(newG)}${toHex(newB)}`;
  };
  

  const CURRENCY_OPTIONS = [
    { value: 'RUB', label: 'RUB' },
    { value: 'USD', label: 'USD' },
    { value: 'BYN', label: 'BYN' },
  ];

  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setDescription('');
      setColor('bg-blue-500');
      setAmount(undefined);
      setCurrency('RUB');
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    const isFinanceCategory = goalCategory === t('categories.finance');
    
    if (!isFinanceCategory && !title.trim()) {
      alert(t('eventModal.errors.titleRequired'));
      setIsSubmitting(false);
      return;
    }

    if (isFinanceCategory && (!amount || amount <= 0)) {
      alert(t('eventModal.errors.amountRequired'));
      setIsSubmitting(false);
      return;
    }

    const eventData: any = {
      title: isFinanceCategory ? (title.trim() || t('calendar.transaction')) : title.trim(),
      description: description.trim(),
      date: selectedDate || new Date().toISOString().split('T')[0],
      color,
      type: 'work',
      completed: false,
    };

    if (isFinanceCategory) {
      eventData.amount = amount;
      eventData.currency = currency;
    }

    try {
      await Promise.resolve(onSave(eventData));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const isFinanceCategory = goalCategory === t('categories.finance');
  const formattedDate = selectedDate 
    ? new Date(selectedDate).toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long'
      })
    : '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/50 dark:bg-black/70"
        onClick={onClose}
      />
      
      <div className="relative bg-white dark:bg-dark-surface rounded-2xl shadow-xl w-full max-w-md mx-auto">
        {/* Шапка */}
        <div className="px-6 py-4 border-b border-border dark:border-dark-border">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-text-primary dark:text-dark-text-primary">
                {isFinanceCategory 
                  ? t('eventModal.finance.title') 
                  : t('eventModal.regular.title')}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-sm text-text-secondary dark:text-dark-text-secondary">
                  {formattedDate}
                </p>
                <span className="text-text-secondary/50 dark:text-dark-text-secondary/50">•</span>
                <p className="text-sm text-text-secondary dark:text-dark-text-secondary truncate max-w-[120px]">
                  {goalTitle}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-text-secondary dark:text-dark-text-secondary hover:text-text-primary dark:hover:text-dark-text-primary hover:bg-surface dark:hover:bg-dark-surface rounded-lg transition-colors active:scale-95"
              aria-label={t('common.close')}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Форма */}
        <form onSubmit={handleSubmit} className="px-6 py-4">
          <div className="space-y-4">
            {/* Название события */}
            {!isFinanceCategory && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-text-primary dark:text-dark-text-primary">
                  {t('eventModal.regular.titleInput')} *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={t('eventModal.regular.titlePlaceholder')}
                  className="w-full px-4 py-3 border border-border dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary focus:border-transparent transition-colors text-text-primary dark:text-dark-text-primary dark:bg-dark-surface"
                  autoFocus
                />
              </div>
            )}

            {/* Поля для финансового события */}
            {isFinanceCategory && (
              <>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-text-primary dark:text-dark-text-primary">
                    {t('eventModal.finance.amountInput')} *
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="number"
                      value={amount || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        setAmount(value === '' ? undefined : parseFloat(value));
                      }}
                      placeholder={t('eventModal.finance.amountPlaceholder')}
                      step="0.01"
                      min="0"
                      className="flex-1 px-4 py-3 border border-border dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary focus:border-transparent transition-colors text-text-primary dark:text-dark-text-primary dark:bg-dark-surface"
                      autoFocus
                    />
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="px-3 py-3 border border-border dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary focus:border-transparent transition-colors bg-white dark:bg-dark-surface dark:text-dark-text-primary min-w-[80px]"
                    >
                      {CURRENCY_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-text-primary dark:text-dark-text-primary">
                    {t('eventModal.finance.titleInputOptional')}
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={t('eventModal.finance.titlePlaceholder')}
                    className="w-full px-4 py-3 border border-border dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary focus:border-transparent transition-colors text-text-primary dark:text-dark-text-primary dark:bg-dark-surface"
                  />
                </div>
              </>
            )}

            {/* Цвет события - В ОДНУ СТРОКУ */}
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-text-primary dark:text-dark-text-primary">
                {t('eventModal.colorLabel')}
              </label>
              <div className="flex gap-1.5 items-center">
                {COLOR_OPTIONS.map((option) => {
                  const isActive = color === option.value;
                  const activeHex = isActive ? brightenColor(option.hex, 20) : option.hex;
                  
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setColor(option.value)}
                      className={cn(
                        "relative w-6 h-6 rounded-full flex items-center justify-center",
                        "transition-all duration-150 active:scale-95",
                        isActive ? "scale-110" : "hover:scale-105"
                      )}
                      style={{ backgroundColor: activeHex }}
                      title={option.label}
                    >
                      {isActive && (
                        <svg 
                          className="w-3 h-3 text-white" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth={3} 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Кнопки действий - КОМПАКТНЫЕ */}
          <div className="flex gap-3 pt-4 mt-6 border-t border-border dark:border-dark-border">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-text-secondary dark:text-dark-text-secondary hover:text-text-primary dark:hover:text-dark-text-primary hover:bg-surface dark:hover:bg-dark-surface rounded-lg transition-colors duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={cn(
                "flex-1 px-4 py-2.5 text-sm font-medium text-white rounded-lg transition-all duration-200",
                "bg-primary dark:bg-dark-primary hover:bg-primary-dark dark:hover:bg-dark-primary-dark",
                "active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed",
                "relative"
              )}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  {t('common.saving')}
                </div>
              ) : (
                t('eventModal.addButton')
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GoalEventModal;