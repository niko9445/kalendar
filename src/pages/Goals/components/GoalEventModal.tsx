import React, { useState, useEffect } from 'react';
import { cn } from '../../../utils/cn';

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

const COLOR_OPTIONS = [
  { value: 'bg-blue-500', label: 'Синий', hex: '#3b82f6' },
  { value: 'bg-green-500', label: 'Зеленый', hex: '#10b981' },
  { value: 'bg-yellow-500', label: 'Желтый', hex: '#f59e0b' },
  { value: 'bg-red-500', label: 'Красный', hex: '#ef4444' },
  { value: 'bg-purple-500', label: 'Фиолетовый', hex: '#8b5cf6' },
  { value: 'bg-pink-500', label: 'Розовый', hex: '#ec4899' },
];

const CURRENCY_OPTIONS = [
  { value: 'RUB', label: 'RUB' },
  { value: 'USD', label: 'USD' },
  { value: 'BYN', label: 'BYN' },
];

const GoalEventModal: React.FC<GoalEventModalProps> = ({
  isOpen,
  onClose,
  onSave,
  selectedDate,
  goalTitle,
  goalCategory = '',
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('bg-blue-500');
  const [amount, setAmount] = useState<number | undefined>(undefined);
  const [currency, setCurrency] = useState('RUB');

  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setDescription('');
      setColor('bg-blue-500');
      setAmount(undefined);
      setCurrency('RUB');
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const isFinanceCategory = goalCategory === 'Финансы';
    
    if (!isFinanceCategory && !title.trim()) {
      alert('Пожалуйста, введите название события');
      return;
    }

    if (isFinanceCategory && (!amount || amount <= 0)) {
      alert('Пожалуйста, укажите сумму для финансового события');
      return;
    }

    const eventData: any = {
      title: isFinanceCategory ? (title.trim() || 'Транзакция') : title.trim(),
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

    onSave(eventData);
  };

  if (!isOpen) return null;

  const isFinanceCategory = goalCategory === 'Финансы';
  const formattedDate = selectedDate 
    ? new Date(selectedDate).toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long'
      })
    : '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-black/50 dark:bg-black/70"
        onClick={onClose}
      />
      
      <div className="relative bg-white dark:bg-dark-surface rounded-2xl shadow-xl w-full max-w-md mx-4">
        {/* Шапка */}
        <div className="px-6 py-5 border-b border-border dark:border-dark-border">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-text-primary dark:text-dark-text-primary">
                {isFinanceCategory ? 'Новая транзакция' : 'Новое событие'}
              </h3>
              <p className="text-sm text-text-secondary dark:text-dark-text-secondary mt-1">
                {formattedDate}
              </p>
              {goalTitle && (
                <p className="text-xs text-text-secondary dark:text-dark-text-secondary mt-0.5">
                  Цель: {goalTitle}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 text-text-secondary dark:text-dark-text-secondary hover:text-text-primary dark:hover:text-dark-text-primary hover:bg-surface dark:hover:bg-dark-surface rounded-full transition-colors active:scale-95"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Форма */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* Название события */}
            {!isFinanceCategory && (
              <div>
                <label className="block text-sm font-medium text-text-primary dark:text-dark-text-primary mb-3">
                  Название события *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Введите название события"
                  className="w-full px-4 py-3.5 border border-border dark:border-dark-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary focus:border-transparent transition-colors text-text-primary dark:text-dark-text-primary dark:bg-dark-surface"
                  autoFocus
                />
              </div>
            )}

            {/* Поле для суммы */}
            {isFinanceCategory && (
              <>
                <div>
                  <label className="block text-sm font-medium text-text-primary dark:text-dark-text-primary mb-3">
                    Сумма *
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="number"
                      value={amount || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        setAmount(value === '' ? undefined : parseFloat(value));
                      }}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      className="flex-1 px-4 py-3.5 border border-border dark:border-dark-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary focus:border-transparent transition-colors text-text-primary dark:text-dark-text-primary dark:bg-dark-surface"
                      autoFocus
                    />
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="px-4 py-3.5 border border-border dark:border-dark-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary focus:border-transparent transition-colors bg-white dark:bg-dark-surface dark:text-dark-text-primary min-w-[80px]"
                    >
                      {CURRENCY_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary dark:text-dark-text-primary mb-3">
                    Название (необязательно)
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Например: Зарплата, Продукты, Кафе"
                    className="w-full px-4 py-3.5 border border-border dark:border-dark-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary focus:border-transparent transition-colors text-text-primary dark:text-dark-text-primary dark:bg-dark-surface"
                  />
                </div>
              </>
            )}

            {/* Цвет события */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-text-primary dark:text-dark-text-primary">
                  Цвет события:
                </label>
                
                <div className="flex gap-1.5">
                  {COLOR_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setColor(option.value)}
                      className={cn(
                        "relative w-7 h-7 rounded-full border flex items-center justify-center",
                        "transition-all active:scale-95",
                        color === option.value
                          ? "border border-gray-300 dark:border-gray-600 hover:border-gray-400"
                          : "border border-gray-300 dark:border-gray-600 hover:border-gray-400"
                      )}
                      style={{ backgroundColor: option.hex }}
                      title={option.label}
                    >
                      {color === option.value && (
                        <svg 
                          className="w-2.5 h-2.5 text-white" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth={3} 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Кнопки действий */}
          <div className="grid grid-cols-2 gap-3 pt-8 mt-6 border-t border-border dark:border-dark-border">
            <button
              type="button"
              onClick={onClose}
              className="w-full px-5 py-3.5 text-sm font-medium text-text-secondary dark:text-dark-text-secondary hover:text-text-primary dark:hover:text-dark-text-primary hover:bg-surface dark:hover:bg-dark-surface rounded-xl transition-colors active:scale-95"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="w-full px-5 py-3.5 bg-primary dark:bg-dark-primary text-white text-sm font-medium rounded-xl hover:bg-primary-dark dark:hover:bg-dark-primary-dark transition-colors active:scale-95"
            >
              Добавить
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GoalEventModal;