import React, { useState, useEffect } from 'react';
import { cn } from '../../../utils/cn';

interface AddGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (goal: any) => void;
}

const AddGoalModal: React.FC<AddGoalModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave 
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    startDate: '',
    deadline: '',
    priority: 'medium',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const categories = [
    'Обучение',
    'Работа',
    'Здоровье',
    'Финансы',
    'Личное',
    'Проект',
    'Спорт',
    'Хобби',
  ];

  const priorities = [
    { value: 'low', label: 'Низкий' },
    { value: 'medium', label: 'Средний' },
    { value: 'high', label: 'Высокий' },
  ];

  // Блокируем скролл фона при открытии модалки
  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY;
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
    }

    return () => {
      const scrollY = document.body.style.top;
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      window.scrollTo(0, parseInt(scrollY || '0') * -1);
    };
  }, [isOpen]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Введите название цели';
    } else if (formData.title.length < 3) {
      newErrors.title = 'Минимум 3 символа';
    }

    if (!formData.category) {
      newErrors.category = 'Выберите категорию';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Укажите дату начала';
    }

    if (!formData.deadline) {
      newErrors.deadline = 'Укажите срок выполнения';
    } else if (formData.startDate && formData.deadline) {
      const startDate = new Date(formData.startDate);
      const deadlineDate = new Date(formData.deadline);
      
      if (deadlineDate < startDate) {
        newErrors.deadline = 'Дата окончания не может быть раньше начала';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      const newGoal = {
        id: Date.now().toString(),
        ...formData,
        progress: 0,
        completed: false,
        isExpanded: false,
      };
      
      onSave(newGoal);
      resetForm();
      onClose();
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: '',
      startDate: '',
      deadline: '',
      priority: 'medium',
    });
    setErrors({});
  };

  if (!isOpen) return null;

  // Получаем максимальную дату (1 год вперед)
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() + 1);
  const maxDateString = maxDate.toISOString().split('T')[0];

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/40 dark:bg-black/60 z-[60]"
        onClick={onClose}
      />
      
      {/* Модальное окно */}
      <div 
        className="fixed inset-0 z-[70] flex items-start justify-center pt-16 px-4 pb-20"
        style={{ 
          pointerEvents: 'none'
        }}
      >
        {/* Основной контейнер модалки */}
        <div 
          className="relative w-full max-w-md bg-white dark:bg-dark-surface rounded-xl shadow-xl 
                   flex flex-col pointer-events-auto overflow-hidden"
          style={{
            maxHeight: 'calc(100vh - 100px)',
            minHeight: '200px',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Заголовок */}
          <div className="flex-shrink-0 bg-white dark:bg-dark-surface border-b border-border dark:border-dark-border px-4 py-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-text-primary dark:text-dark-text-primary">
                  Новая цель
                </h2>
                <p className="text-xs text-text-secondary dark:text-dark-text-secondary mt-0.5">
                  Создайте цель для отслеживания
                </p>
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

          {/* Прокручиваемая область формы */}
          <div 
            className="flex-1 overflow-y-auto px-4 py-3"
            style={{
              WebkitOverflowScrolling: 'touch',
              maxHeight: 'calc(100vh - 200px)',
            }}
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Название цели */}
              <div>
                <label className="block text-sm font-medium text-text-primary dark:text-dark-text-primary mb-1">
                  Название цели *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  className={cn(
                    "w-full px-3 py-2 border rounded-md text-text-primary dark:text-dark-text-primary text-sm",
                    "focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-500",
                    "min-h-[40px] dark:bg-dark-surface",
                    errors.title 
                      ? "border-error dark:border-dark-error" 
                      : "border-border dark:border-dark-border"
                  )}
                  placeholder="Например: Изучить английский"
                  autoFocus
                />
                {errors.title && (
                  <p className="mt-1 text-xs text-error dark:text-dark-error">{errors.title}</p>
                )}
              </div>

              {/* Описание */}
              <div>
                <label className="block text-sm font-medium text-text-primary dark:text-dark-text-primary mb-1">
                  Описание (необязательно)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  className="w-full px-3 py-2 border border-border dark:border-dark-border rounded-md text-text-primary dark:text-dark-text-primary text-sm
                           focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-500
                           min-h-[80px] resize-none dark:bg-dark-surface"
                  placeholder="Добавьте детали..."
                />
              </div>

              {/* Категория */}
              <div>
                <label className="block text-sm font-medium text-text-primary dark:text-dark-text-primary mb-1">
                  Категория *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleChange('category', e.target.value)}
                  className={cn(
                    "w-full px-3 py-2 border rounded-md text-text-primary dark:text-dark-text-primary text-sm",
                    "focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-500",
                    "min-h-[40px] dark:bg-dark-surface",
                    errors.category 
                      ? "border-error dark:border-dark-error" 
                      : "border-border dark:border-dark-border"
                  )}
                >
                  <option value="">Выберите</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="mt-1 text-xs text-error dark:text-dark-error">{errors.category}</p>
                )}
              </div>

              {/* Приоритет */}
              <div>
                <label className="block text-sm font-medium text-text-primary dark:text-dark-text-primary mb-1">
                  Приоритет
                </label>
                <div className="flex gap-2">
                  {priorities.map((priority) => (
                    <button
                      key={priority.value}
                      type="button"
                      onClick={() => handleChange('priority', priority.value)}
                      className={cn(
                        "flex-1 px-3 py-2 text-sm font-medium rounded-md border transition-colors",
                        "min-h-[40px]",
                        formData.priority === priority.value
                          ? "border-blue-500 dark:border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                          : "border-border dark:border-dark-border text-text-secondary dark:text-dark-text-secondary hover:border-border-light dark:hover:border-dark-border-light"
                      )}
                    >
                      {priority.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Даты начала и окончания */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-text-primary dark:text-dark-text-primary mb-1">
                    Начало *
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => handleChange('startDate', e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      max={maxDateString}
                      className={cn(
                        "w-full px-3 py-2 border rounded-md text-text-primary dark:text-dark-text-primary text-sm",
                        "focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-500",
                        "appearance-none min-h-[40px] dark:bg-dark-surface",
                        errors.startDate 
                          ? "border-error dark:border-dark-error" 
                          : "border-border dark:border-dark-border"
                      )}
                    />
                    {errors.startDate && (
                      <p className="mt-1 text-xs text-error dark:text-dark-error">{errors.startDate}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary dark:text-dark-text-primary mb-1">
                    Окончание *
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={formData.deadline}
                      onChange={(e) => handleChange('deadline', e.target.value)}
                      min={formData.startDate || new Date().toISOString().split('T')[0]}
                      max={maxDateString}
                      className={cn(
                        "w-full px-3 py-2 border rounded-md text-text-primary dark:text-dark-text-primary text-sm",
                        "focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-500",
                        "appearance-none min-h-[40px] dark:bg-dark-surface",
                        errors.deadline 
                          ? "border-error dark:border-dark-error" 
                          : "border-border dark:border-dark-border"
                      )}
                    />
                    {errors.deadline && (
                      <p className="mt-1 text-xs text-error dark:text-dark-error">{errors.deadline}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Отступ для кнопок */}
              <div className="h-4" />
            </form>
          </div>

          {/* Фиксированные кнопки */}
          <div className="flex-shrink-0 bg-white dark:bg-dark-surface border-t border-border dark:border-dark-border px-4 py-3">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 border border-border dark:border-dark-border text-text-secondary dark:text-dark-text-secondary 
                         font-medium rounded-lg hover:border-border-light dark:hover:border-dark-border-light transition-colors text-sm"
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="flex-1 py-2.5 bg-blue-600 dark:bg-blue-600 text-white font-medium 
                         rounded-lg hover:bg-blue-700 dark:hover:bg-blue-700 transition-colors text-sm"
              >
                Создать
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddGoalModal;