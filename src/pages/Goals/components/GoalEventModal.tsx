import React, { useState, useEffect } from 'react';
import { cn } from '../../../utils/cn';
import { useTranslation } from '../../../i18n/hooks';
import { CATEGORY_KEYS } from '../../../constants/categories';

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
  onUpdate?: (eventData: {
    id: string;
    title: string;
    description: string;
    date: string;
    color: string;
    type: 'work' | 'personal' | 'health' | 'learning';
    completed: boolean;
    amount?: number;
    currency?: string;
  }) => void; // Новая функция для обновления
  selectedDate: string | null;
  goalTitle: string;
  goalCategory?: string;
  editingEvent?: { // Новый параметр для редактирования
    id: string;
    title: string;
    description: string;
    date: string;
    color: string;
    type: 'work' | 'personal' | 'health' | 'learning' | 'finance';
    completed: boolean;
    amount?: number;
    currency?: string;
  } | null;
}

const GoalEventModal: React.FC<GoalEventModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onUpdate,
  selectedDate,
  goalTitle,
  goalCategory = '',
  editingEvent = null,
}) => {
  const { t } = useTranslation();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('bg-blue-500');
  const [amount, setAmount] = useState<number | undefined>(undefined);
  const [currency, setCurrency] = useState('BYN');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const COLOR_OPTIONS = [
    { value: 'bg-blue-500', label: t('colors.blue'), hex: '#3b82f6' },
    { value: 'bg-green-500', label: t('colors.green'), hex: '#10b981' },
    { value: 'bg-yellow-500', label: t('colors.yellow'), hex: '#f59e0b' },
    { value: 'bg-red-500', label: t('colors.red'), hex: '#ef4444' },
    { value: 'bg-purple-500', label: t('colors.purple'), hex: '#8b5cf6' },
    { value: 'bg-pink-500', label: t('colors.pink'), hex: '#ec4899' },
  ];

  const CURRENCY_OPTIONS = [
    { value: 'BYN', label: 'BYN' },
    { value: 'RUB', label: 'RUB' },
    { value: 'USD', label: 'USD' },
  ];

  // Заполняем форму данными при редактировании
  useEffect(() => {
    if (editingEvent) {
      setTitle(editingEvent.title || '');
      setDescription(editingEvent.description || '');
      setColor(editingEvent.color || 'bg-blue-500');
      setAmount(editingEvent.amount);
      setCurrency(editingEvent.currency || 'BYN');
    } else {
      setTitle('');
      setDescription('');
      setColor('bg-blue-500');
      setAmount(undefined);
      setCurrency('BYN');
    }
    setIsSubmitting(false);
  }, [editingEvent, isOpen]);

  // Функция для осветления цвета
  const brightenColor = (hex: string, percent: number): string => {
    let color = hex.replace('#', '');
    
    if (color.length === 3) {
      color = color.split('').map(c => c + c).join('');
    }
    
    const r = parseInt(color.substr(0, 2), 16);
    const g = parseInt(color.substr(2, 2), 16);
    const b = parseInt(color.substr(4, 2), 16);
    
    const brighten = (channel: number) => {
      return Math.min(255, Math.round(channel + (255 - channel) * (percent / 100)));
    };
    
    const newR = brighten(r);
    const newG = brighten(g);
    const newB = brighten(b);
    
    const toHex = (n: number) => {
      const hex = n.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };
    
    return `#${toHex(newR)}${toHex(newG)}${toHex(newB)}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    // ИСПРАВЛЕНО: используем ключ категории, а не перевод
    const isFinanceCategory = goalCategory === CATEGORY_KEYS.FINANCE;
    
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
      title: title.trim(),
      description: description.trim(),
      date: editingEvent?.date || selectedDate || new Date().toISOString().split('T')[0],
      color,
      type: 'work',
      completed: false,
    };

    if (isFinanceCategory) {
      eventData.amount = amount;
      eventData.currency = currency;
      // Для финансовых событий можно оставить title пустым
      if (!eventData.title) {
        eventData.title = '';
      }
    }

    try {
      if (editingEvent && onUpdate) {
        // Если редактируем существующее событие
        await Promise.resolve(onUpdate({
          id: editingEvent.id,
          ...eventData
        }));
      } else {
        // Если создаем новое событие
        await Promise.resolve(onSave(eventData));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  // ИСПРАВЛЕНО: используем ключ категории для логики отображения
  const isFinanceCategory = goalCategory === CATEGORY_KEYS.FINANCE;
  const formattedDate = (editingEvent?.date || selectedDate)
    ? new Date(editingEvent?.date || selectedDate!).toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long'
      })
    : '';

  // Определяем заголовок модалки
  const modalTitle = editingEvent 
    ? t('eventModal.editTitle') || 'Редактировать событие'
    : (isFinanceCategory 
        ? t('eventModal.finance.title') 
        : t('eventModal.regular.title'));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/40 dark:bg-black/60"
        onClick={onClose}
      />
      
      <div className="relative bg-white dark:bg-dark-surface rounded-xl shadow-xl w-full max-w-md">
        {/* Заголовок */}
        <div className="px-4 py-3 border-b border-border dark:border-dark-border">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-text-primary dark:text-dark-text-primary">
                {modalTitle}
              </h2>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-xs text-text-secondary dark:text-dark-text-secondary">
                  {formattedDate}
                </p>
                <span className="text-text-secondary/50 dark:text-dark-text-secondary/50">•</span>
                <p className="text-xs text-text-secondary dark:text-dark-text-secondary truncate max-w-[120px]">
                  {goalTitle}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 text-text-secondary dark:text-dark-text-secondary hover:text-text-primary dark:hover:text-dark-text-primary hover:bg-surface dark:hover:bg-dark-surface rounded-md transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Форма */}
        <form onSubmit={handleSubmit} className="p-4">
          <div className="space-y-3">
            {/* Название события */}
            {!isFinanceCategory && (
              <div>
                <label className="block text-sm font-medium text-text-primary dark:text-dark-text-primary mb-1">
                  {t('eventModal.regular.titleInput')} *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={cn(
                    "w-full px-3 py-2 border rounded-md text-text-primary dark:text-dark-text-primary text-sm placeholder:text-xs",
                    "focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-500",
                    "h-10 dark:bg-dark-surface"
                  )}
                  placeholder={t('eventModal.regular.titlePlaceholder')}
                  autoFocus
                />
              </div>
            )}

            {/* Поля для финансового события */}
            {isFinanceCategory && (
              <>
                <div>
                  <label className="block text-sm font-medium text-text-primary dark:text-dark-text-primary mb-1">
                    {t('eventModal.finance.amountInput')} *
                  </label>
                  <div className="flex gap-2">
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
                      className={cn(
                        "flex-1 px-3 py-2 border border-border dark:border-dark-border rounded-md",
                        "text-text-primary dark:text-dark-text-primary text-sm",
                        "focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-500",
                        "h-10 dark:bg-dark-surface"
                      )}
                      autoFocus
                    />
                    <div className="relative">
                      <select
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        className={cn(
                          "px-3 py-2 border rounded-md text-text-primary dark:text-dark-text-primary text-sm",
                          "focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-500",
                          "appearance-none h-10 dark:bg-dark-surface min-w-[80px]",
                          "bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20fill%3D%22none%22%20stroke%3D%22%236B7280%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')]",
                          "dark:bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20fill%3D%22none%22%20stroke%3D%22%239CA3AF%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C/svg%3E')]",
                          "bg-[position:right_0.5rem_center] bg-[length:16px_12px] bg-no-repeat",
                          "border-border dark:border-dark-border"
                        )}
                        style={{
                          paddingRight: '2.5rem',
                        }}
                      >
                        {CURRENCY_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary dark:text-dark-text-primary mb-1">
                    {t('eventModal.finance.titleInputOptional')}
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className={cn(
                      "w-full px-3 py-2 border border-border dark:border-dark-border rounded-md",
                      "text-text-primary dark:text-dark-text-primary text-sm placeholder:text-xs",
                      "focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-500",
                      "h-10 dark:bg-dark-surface"
                    )}
                    placeholder={t('eventModal.finance.titlePlaceholder')}
                  />
                </div>
              </>
            )}

            {/* Цвет события */}
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

          {/* Кнопки действий */}
          <div className="flex gap-3 mt-4 pt-4 border-t border-border dark:border-dark-border">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 py-2.5 border border-border dark:border-dark-border text-text-secondary dark:text-dark-text-secondary 
                       font-medium rounded-lg hover:border-border-light dark:hover:border-dark-border-light 
                       transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 py-2.5 bg-blue-600 dark:bg-blue-600 text-white font-medium 
                       rounded-lg hover:bg-blue-700 dark:hover:bg-blue-700 
                       transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed relative"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  {t('common.saving')}
                </div>
              ) : (
                (editingEvent ? t('common.save') : t('eventModal.addButton'))
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GoalEventModal;