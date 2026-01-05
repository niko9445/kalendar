import React, { useState, useEffect } from 'react';
import { cn } from '../../../utils/cn';
import { useTranslation } from '../../../i18n/hooks';

interface GoalFormData {
  title: string;
  description: string;
  category: string;
  startDate: string;
  deadline: string;
  priority: 'high' | 'medium' | 'low';
}

interface AddGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (goal: GoalFormData) => void;
  onUpdate?: (goal: GoalFormData & { id: string }) => void; // Новая функция для обновления
  editingGoal?: { // Новый параметр для редактирования
    id: string;
    title: string;
    description: string;
    category: string;
    startDate: string;
    deadline: string;
    priority: 'high' | 'medium' | 'low';
  } | null;
}

const AddGoalModal: React.FC<AddGoalModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave,
  onUpdate,
  editingGoal = null
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<GoalFormData>({
    title: '',
    description: '',
    category: '',
    startDate: '',
    deadline: '',
    priority: 'medium',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const categories = [
    t('categories.learning'),
    t('categories.work'),
    t('categories.health'),
    t('categories.finance'),
    t('categories.personal'),
    t('categories.project'),
    t('categories.sport'),
    t('categories.hobby'),
  ];

  const priorities = [
    { value: 'low', label: t('priorities.low') },
    { value: 'medium', label: t('priorities.medium') },
    { value: 'high', label: t('priorities.high') },
  ];

  // Заполняем форму данными при редактировании
  useEffect(() => {
    if (editingGoal) {
      setFormData({
        title: editingGoal.title || '',
        description: editingGoal.description || '',
        category: editingGoal.category || '',
        startDate: editingGoal.startDate || '',
        deadline: editingGoal.deadline || '',
        priority: editingGoal.priority || 'medium',
      });
    } else {
      resetForm();
    }
  }, [editingGoal]);

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

  const handleChange = (field: keyof GoalFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = t('errors.goalTitleRequired');
    } else if (formData.title.length < 3) {
      newErrors.title = t('errors.minLength', { count: 3 });
    }

    if (!formData.category) {
      newErrors.category = t('errors.categoryRequired');
    }

    if (!formData.startDate) {
      newErrors.startDate = t('errors.startDateRequired');
    }

    if (!formData.deadline) {
      newErrors.deadline = t('errors.deadlineRequired');
    } else if (formData.startDate && formData.deadline) {
      const startDate = new Date(formData.startDate);
      const deadlineDate = new Date(formData.deadline);
      
      if (deadlineDate < startDate) {
        newErrors.deadline = t('errors.deadlineBeforeStart');
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      if (editingGoal && onUpdate) {
        // Если редактируем существующую цель
        onUpdate({
          id: editingGoal.id,
          ...formData
        });
      } else {
        // Если создаем новую цель
        onSave(formData);
      }
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

  // Получаем диапазон дат: 10 лет назад и 10 лет вперед
  const today = new Date();
  
  const minDate = new Date(today);
  minDate.setFullYear(minDate.getFullYear() - 10);
  const minDateString = minDate.toISOString().split('T')[0];
  
  const maxDate = new Date(today);
  maxDate.setFullYear(maxDate.getFullYear() + 10);
  const maxDateString = maxDate.toISOString().split('T')[0];

  // Определяем заголовок модалки в зависимости от режима
  const modalTitle = editingGoal ? t('addGoalModal.editTitle') || 'Редактировать цель' : t('addGoalModal.title');
  const submitButtonText = editingGoal ? t('common.save') : t('addGoalModal.createButton');

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
                    {modalTitle}
                  </h2>
                  <p className="text-xs text-text-secondary dark:text-dark-text-secondary mt-0.5">
                    {editingGoal 
                      ? t('addGoalModal.editSubtitle') || 'Измените параметры цели'
                      : t('addGoalModal.subtitle')}
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
                  {t('addGoalModal.goalTitle')} *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  className={cn(
                    "w-full px-3 py-2 border rounded-md text-text-primary dark:text-dark-text-primary text-sm placeholder:text-xs",
                    "focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-500",
                    "h-10 dark:bg-dark-surface",
                    errors.title 
                      ? "border-error dark:border-dark-error" 
                      : "border-border dark:border-dark-border"
                  )}
                  placeholder={t('addGoalModal.titlePlaceholder')}
                  autoFocus
                />
                {errors.title && (
                  <p className="mt-1 text-xs text-error dark:text-dark-error">{errors.title}</p>
                )}
              </div>

              {/* Описание */}
              <div>
                <label className="block text-sm font-medium text-text-primary dark:text-dark-text-primary mb-1">
                  {t('addGoalModal.description')}
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  className="w-full px-3 py-2 border border-border dark:border-dark-border rounded-md text-text-primary dark:text-dark-text-primary text-sm placeholder:text-xs
                           focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-500
                           min-h-[60px] resize-none dark:bg-dark-surface"
                  placeholder={t('addGoalModal.descriptionPlaceholder')}
                />
              </div>

              {/* Категория */}
              <div>
                <label className="block text-sm font-medium text-text-primary dark:text-dark-text-primary mb-1">
                  {t('addGoalModal.category')} *
                </label>
                <div className="relative">
                  <select
                    value={formData.category}
                    onChange={(e) => handleChange('category', e.target.value)}
                    className={cn(
                      "w-full px-3 py-2 pr-10 border rounded-md text-text-primary dark:text-dark-text-primary text-sm",
                      "focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-500",
                      "h-10 dark:bg-dark-surface",
                      "appearance-none bg-no-repeat bg-right",
                      "bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20fill%3D%22none%22%20stroke%3D%22%236B7280%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')]",
                      "dark:bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20fill%3D%22none%22%20stroke%3D%22%239CA3AF%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')]",
                      "bg-[position:right_0.5rem_center] bg-[length:16px_16px]",
                      errors.category 
                        ? "border-error dark:border-dark-error" 
                        : "border-border dark:border-dark-border"
                    )}
                    style={{
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 0.75rem center',
                      backgroundSize: '16px 12px',
                      paddingRight: '2.5rem',
                    }}
                  >
                    <option value="">{t('addGoalModal.selectCategory')}</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.category && (
                  <p className="mt-1 text-xs text-error dark:text-dark-text-error">{errors.category}</p>
                )}
              </div>

              {/* Приоритет */}
              <div>
                <label className="block text-sm font-medium text-text-primary dark:text-dark-text-primary mb-1">
                  {t('addGoalModal.priority')}
                </label>
                <div className="flex gap-2">
                  {priorities.map((priority) => (
                    <button
                      key={priority.value}
                      type="button"
                      onClick={() => handleChange('priority', priority.value)}
                      className={cn(
                        "flex-1 px-3 py-2 text-sm font-medium rounded-md border transition-colors",
                        "h-10",
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
                    {t('addGoalModal.startDate')} *
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => handleChange('startDate', e.target.value)}
                      min={minDateString}
                      max={maxDateString}
                      className={cn(
                        "w-full px-3 py-2 border rounded-md text-text-primary dark:text-dark-text-primary text-sm",
                        "focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-500",
                        "appearance-none h-10 dark:bg-dark-surface",
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
                    {t('addGoalModal.deadline')} *
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={formData.deadline}
                      onChange={(e) => handleChange('deadline', e.target.value)}
                      min={formData.startDate || minDateString}
                      max={maxDateString}
                      className={cn(
                        "w-full px-3 py-2 border rounded-md text-text-primary dark:text-dark-text-primary text-sm",
                        "focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-500",
                        "appearance-none h-10 dark:bg-dark-surface",
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
                {t('common.cancel')}
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="flex-1 py-2.5 bg-blue-600 dark:bg-blue-600 text-white font-medium 
                         rounded-lg hover:bg-blue-700 dark:hover:bg-blue-700 transition-colors text-sm"
              >
                {submitButtonText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddGoalModal;