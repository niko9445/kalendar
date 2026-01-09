// src/pages/Calendar/components/AddGeneralEventModal.tsx

import React, { useState, useEffect } from 'react';
import { cn } from '../../../utils/cn';
import { useTranslation } from '../../../i18n/hooks';

interface AddGeneralEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (eventData: any) => void;
  onUpdate?: (eventData: any) => void;
  selectedDate: string | null;
  editingEvent?: any | null;
}

const AddGeneralEventModal: React.FC<AddGeneralEventModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onUpdate,
  selectedDate,
  editingEvent = null,
}) => {
  const { t } = useTranslation();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('bg-blue-500');
  const [eventType, setEventType] = useState('personal');
  const [amount, setAmount] = useState<number | undefined>(undefined);
  const [currency, setCurrency] = useState('BYN');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isFinanceEvent = eventType === 'finance';

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
  
  const EVENT_TYPE_OPTIONS = [
    { value: 'personal', label: t('categories.personal') },
    { value: 'work', label: t('categories.work') },
    { value: 'health', label: t('categories.health') },
    { value: 'learning', label: t('categories.learning') },
    { value: 'finance', label: t('categories.finance') },
  ];

  useEffect(() => {
    if (isOpen) {
      if (editingEvent) {
        setTitle(editingEvent.title || '');
        setDescription(editingEvent.description || '');
        setColor(editingEvent.color || 'bg-blue-500');
        setEventType(editingEvent.event_type || 'personal');
        setAmount(editingEvent.amount);
        setCurrency(editingEvent.currency || 'BYN');
      } else {
        setTitle('');
        setDescription('');
        setColor('bg-blue-500');
        setEventType('personal');
        setAmount(undefined);
        setCurrency('BYN');
      }
      setIsSubmitting(false);
    }
  }, [editingEvent, isOpen]);
  
    const brightenColor = (hex: string, percent: number): string => {
        let color = hex.replace('#', '');
        if (color.length === 3) color = color.split('').map(c => c + c).join('');
        const f = parseInt(color, 16), t = percent < 0 ? 0 : 255, p = percent < 0 ? percent * -1 : percent;
        const R = f >> 16, G = (f >> 8) & 0x00FF, B = f & 0x0000FF;
        return "#" + (0x1000000 + (Math.round((t - R) * p) + R) * 0x10000 + (Math.round((t - G) * p) + G) * 0x100 + (Math.round((t - B) * p) + B)).toString(16).slice(1);
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    
    if (!isFinanceEvent && !title.trim()) {
      alert(t('eventModal.errors.titleRequired'));
      setIsSubmitting(false);
      return;
    }
    if (isFinanceEvent && (!amount || amount === 0)) {
        alert(t('eventModal.errors.amountRequired'));
        setIsSubmitting(false);
        return;
    }

    const eventData: any = {
      title: title.trim(),
      description: description.trim(),
      date: editingEvent?.date || selectedDate,
      color,
      event_type: eventType,
      completed: editingEvent?.completed || false,
      amount: isFinanceEvent ? amount : null,
      currency: isFinanceEvent ? currency : undefined,
    };
    
    try {
      if (editingEvent && onUpdate) {
        await Promise.resolve(onUpdate({ ...eventData, id: editingEvent.id }));
      } else {
        await Promise.resolve(onSave(eventData));
      }
    } finally {
      setIsSubmitting(false);
      onClose();
    }
  };

  if (!isOpen) return null;

  const formattedDate = (editingEvent?.date || selectedDate)
    ? new Date(editingEvent?.date || selectedDate!).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })
    : '';

  const modalTitle = editingEvent
    ? t('eventModal.editTitle') || 'Редактировать событие'
    : t('calendar.addEvent');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 dark:bg-black/60" onClick={onClose} />
      
      <div className="relative bg-white dark:bg-dark-surface rounded-xl shadow-xl w-full max-w-md">
        <div className="px-4 py-3 border-b border-border dark:border-dark-border">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-text-primary dark:text-dark-text-primary">{modalTitle}</h2>
              <p className="text-xs text-text-secondary dark:text-dark-text-secondary mt-0.5">{formattedDate}</p>
            </div>
            <button onClick={onClose} className="p-1 text-text-secondary dark:text-dark-text-secondary hover:text-text-primary dark:hover:text-dark-text-primary hover:bg-surface dark:hover:bg-dark-surface rounded-md transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          <div className="space-y-3">
            <div>
                <label className="block text-sm font-medium text-text-primary dark:text-dark-text-primary mb-1">
                    {t('calendar.eventTypeLabel')}
                </label>
                {/* 
                  УПРОЩЕННЫЕ КЛАССЫ! 
                  Плагин @tailwindcss/forms применит к этому select нужные стили.
                */}
                <select
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value)}
                    className="w-full border-border dark:border-dark-border dark:bg-dark-surface rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                >
                    {EVENT_TYPE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
            </div>

            {isFinanceEvent ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-text-primary dark:text-dark-text-primary mb-1">{t('eventModal.finance.amountInput')} *</label>
                  <div className="flex gap-2">
                    {/* К input плагин тоже применит стили */}
                    <input type="number" value={amount || ''} onChange={(e) => setAmount(e.target.value === '' ? undefined : parseFloat(e.target.value))} placeholder={t('eventModal.finance.amountPlaceholder')} step="0.01" className="block w-full flex-1 border-border dark:border-dark-border dark:bg-dark-surface rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm" autoFocus />
                    <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="block w-auto border-border dark:border-dark-border dark:bg-dark-surface rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm">
                      {CURRENCY_OPTIONS.map((option) => (<option key={option.value} value={option.value}>{option.label}</option>))}
                    </select>
                  </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-text-primary dark:text-dark-text-primary mb-1">{t('eventModal.finance.titleInputOptional')}</label>
                    <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="block w-full border-border dark:border-dark-border dark:bg-dark-surface rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm" placeholder={t('eventModal.finance.titlePlaceholder')} />
                </div>
              </>
            ) : (
              <div>
                <label className="block text-sm font-medium text-text-primary dark:text-dark-text-primary mb-1">{t('eventModal.regular.titleInput')} *</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="block w-full border-border dark:border-dark-border dark:bg-dark-surface rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm" placeholder={t('eventModal.regular.titlePlaceholder')} autoFocus />
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-text-primary dark:text-dark-text-primary">{t('eventModal.colorLabel')}</label>
              <div className="flex gap-1.5 items-center">
                {COLOR_OPTIONS.map((option) => {
                  const isActive = color === option.value;
                  const activeHex = brightenColor(option.hex, isActive ? 20 : 0);
                  return (
                    <button type="button" key={option.value} onClick={() => setColor(option.value)} className={cn("relative w-6 h-6 rounded-full flex items-center justify-center transition-all duration-150 active:scale-95", isActive ? "scale-110" : "hover:scale-105")} style={{ backgroundColor: activeHex }} title={option.label}>
                      {isActive && (<svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>)}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-4 pt-4 border-t border-border dark:border-dark-border">
            <button type="button" onClick={onClose} disabled={isSubmitting} className="flex-1 py-2.5 border rounded-lg text-sm font-medium transition-colors disabled:opacity-50 border-border dark:border-dark-border text-text-secondary dark:text-dark-text-secondary hover:border-gray-300 dark:hover:border-gray-600">{t('common.cancel')}</button>
            <button type="submit" disabled={isSubmitting} className="flex-1 py-2.5 bg-blue-600 text-white font-medium rounded-lg text-sm transition-colors disabled:opacity-50 hover:bg-blue-700 relative">
              {isSubmitting ? (<div className="flex items-center justify-center"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />{t('common.saving')}</div>) : (editingEvent ? t('common.save') : t('eventModal.addButton'))}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddGeneralEventModal;
