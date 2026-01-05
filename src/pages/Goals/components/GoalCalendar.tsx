import React, { useState, useRef, useMemo, useCallback } from 'react';
import { cn } from '../../../utils/cn';
import { useTranslation } from '../../../i18n/hooks';
import GoalEventModal from './GoalEventModal';
import { useGoals } from '../../../contexts/GoalsContext';

interface GoalCalendarProps {
  goal: {
    id: string;
    title: string;
    category: string;
    categoryKey: string;
    startDate: string;
    deadline: string;
  };
  events: Array<{
    id: string;
    goalId: string;
    title: string;
    description: string;
    date: string;
    color: string;
    type: 'work' | 'personal' | 'health' | 'learning' | 'completion' | 'finance';
    completed: boolean;
    amount?: number;
    currency?: string;
    isCompletionDay?: boolean;
    completionDayId?: string;
  }>;
  onEventSave: (event: any) => void;
  onEventDelete: (eventId: string) => void;
  onEventToggleComplete: (eventId: string) => void;
  onEditEvent?: (eventId: string) => void; // Новая функция для редактирования события
  onDeleteGoal: () => void;
}

const getDaysInMonth = (date: Date) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  return new Date(year, month + 1, 0).getDate();
};

const getFirstDayOfMonth = (date: Date) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  return new Date(year, month, 1).getDay();
};

const getMonthName = (date: Date, language: string) => {
  return date.toLocaleDateString(language === 'ru' ? 'ru-RU' : 'en-US', { 
    month: 'long', 
    year: 'numeric' 
  });
};

const GoalCalendar: React.FC<GoalCalendarProps> = ({
  goal,
  events,
  onEventSave,
  onEventDelete,
  onEventToggleComplete,
  onEditEvent,
  onDeleteGoal,
}) => {
  const { t, language } = useTranslation();
  const { toggleCompletionDay, isCompletionDayEvent } = useGoals();
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [editingEventData, setEditingEventData] = useState<any>(null);
  
  const clickCountRef = useRef<number>(0);
  const lastClickDateRef = useRef<string>('');
  const clickTimerRef = useRef<NodeJS.Timeout | null>(null);

  const getDayName = useCallback((dayIndex: number) => {
    const days = [
      t('calendar.dayNames.sun'),
      t('calendar.dayNames.mon'),
      t('calendar.dayNames.tue'),
      t('calendar.dayNames.wed'),
      t('calendar.dayNames.thu'),
      t('calendar.dayNames.fri'),
      t('calendar.dayNames.sat'),
    ];
    return days[dayIndex];
  }, [t]);

  // Проверка, находится ли дата в пределах цели
  const isDateWithinGoalRange = useCallback((dateStr: string): boolean => {
    const goalStartDate = new Date(goal.startDate).toISOString().split('T')[0];
    const goalDeadline = new Date(goal.deadline).toISOString().split('T')[0];
    
    return dateStr >= goalStartDate && dateStr <= goalDeadline;
  }, [goal.startDate, goal.deadline]);

  // Ограничения навигации: 10 лет назад и 10 лет вперед от текущей даты
  const getMinAllowedDate = useCallback((): Date => {
    const minDate = new Date();
    minDate.setFullYear(minDate.getFullYear() - 10);
    minDate.setDate(1);
    return minDate;
  }, []);

  const getMaxAllowedDate = useCallback((): Date => {
    const maxDate = new Date();
    maxDate.setFullYear(maxDate.getFullYear() + 10);
    maxDate.setDate(1);
    return maxDate;
  }, []);

  // Проверка, можно ли переключиться на следующий месяц
  const canGoToNextMonth = useMemo(() => {
    const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    const maxAllowedDate = getMaxAllowedDate();
    
    return nextMonth <= maxAllowedDate;
  }, [currentDate, getMaxAllowedDate]);

  // Проверка, можно ли переключиться на предыдущий месяц
  const canGoToPrevMonth = useMemo(() => {
    const prevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    const minAllowedDate = getMinAllowedDate();
    
    return prevMonth >= minAllowedDate;
  }, [currentDate, getMinAllowedDate]);

  // Мемоизированная генерация календаря
  const calendarDays = useMemo(() => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const days = [];
    
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const dayEvents = events.filter(event => event.date === dateStr && event.goalId === goal.id);
      const isToday = dateStr === new Date().toISOString().split('T')[0];
      const isSelected = selectedDate === dateStr;
      
      const hasCompletionDay = dayEvents.some(event => event.type === 'completion');
      const hasRegularEvents = dayEvents.some(event => event.type !== 'completion');
      const isWithinGoalRange = isDateWithinGoalRange(dateStr);
      
      days.push({
        date: i,
        dateStr,
        events: dayEvents,
        isToday,
        isSelected,
        hasCompletionDay,
        hasRegularEvents,
        isWithinGoalRange,
      });
    }
    
    return days;
  }, [currentDate, events, goal.id, selectedDate, isDateWithinGoalRange]);

  // Оптимизированный обработчик кликов
  const handleDateClick = useCallback((dateStr: string) => {
    if (!isDateWithinGoalRange(dateStr)) {
      alert(t('calendar.dateOutOfRange', { 
        startDate: new Date(goal.startDate).toLocaleDateString(language === 'ru' ? 'ru-RU' : 'en-US'),
        endDate: new Date(goal.deadline).toLocaleDateString(language === 'ru' ? 'ru-RU' : 'en-US')
      }));
      return;
    }
    
    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current);
    }
    
    if (lastClickDateRef.current !== dateStr) {
      clickCountRef.current = 0;
      lastClickDateRef.current = dateStr;
    }
    
    clickCountRef.current++;
    
    clickTimerRef.current = setTimeout(() => {
      const clicks = clickCountRef.current;
      clickCountRef.current = 0;
      
      if (clicks === 2) {
        // Используем функцию toggleCompletionDay из контекста
        toggleCompletionDay(goal.id, dateStr, t('calendar.completionDay'));
        setSelectedDate(null);
      }
      else if (clicks >= 3) {
        setSelectedDate(dateStr);
        setEditingEventId(null);
        setEditingEventData(null);
        setShowEventModal(true);
      }
      else if (clicks === 1) {
        setSelectedDate(dateStr);
        setEditingEventId(null);
        setEditingEventData(null);
      }
    }, 300);
  }, [goal.id, t, toggleCompletionDay, isDateWithinGoalRange, language, goal.startDate, goal.deadline]);

  // Функция для редактирования события inline
  const handleEditEvent = useCallback((event: any) => {
    setEditingEventId(event.id);
    setEditingEventData(event);
    setShowEventModal(true);
  }, []);

  // Функция для обновления события
  const handleUpdateEvent = useCallback((eventData: any) => {
    if (editingEventId) {
      onEventSave({
        ...eventData,
        id: editingEventId, // Добавляем ID для обновления
        goalId: goal.id,
      });
      setEditingEventId(null);
      setEditingEventData(null);
    }
  }, [editingEventId, goal.id, onEventSave]);

  const handlePrevMonth = useCallback(() => {
    if (!canGoToPrevMonth) return;
    
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    setSelectedDate(null);
    setEditingEventId(null);
    setEditingEventData(null);
    if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
  }, [canGoToPrevMonth]);

  const handleNextMonth = useCallback(() => {
    if (!canGoToNextMonth) return;
    
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    setSelectedDate(null);
    setEditingEventId(null);
    setEditingEventData(null);
    if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
  }, [canGoToNextMonth]);

  const handleToday = useCallback(() => {
    const today = new Date();
    const minDate = getMinAllowedDate();
    const maxDate = getMaxAllowedDate();
    
    // Ограничиваем сегодняшнюю дату диапазоном 10 лет
    if (today < minDate) {
      setCurrentDate(minDate);
    } else if (today > maxDate) {
      setCurrentDate(maxDate);
    } else {
      setCurrentDate(today);
    }
    
    setSelectedDate(null);
    setEditingEventId(null);
    setEditingEventData(null);
    if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
  }, [getMinAllowedDate, getMaxAllowedDate]);

  const handleDeleteGoal = useCallback(() => {
    if (window.confirm(t('calendar.deleteGoalConfirm', { title: goal.title }))) {
      onDeleteGoal();
    }
  }, [goal.title, onDeleteGoal, t]);

  React.useEffect(() => {
    return () => {
      if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
    };
  }, []);

  return (
    <div className="px-4 py-3">
      {/* Заголовок календаря */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h4 className="text-sm font-medium text-gray-800 dark:text-gray-100">
            {t('calendar.goalCalendar.title')}
          </h4>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {getMonthName(currentDate, language)}
          </p>
        </div>
        
        <div className="flex items-center space-x-1">
          <button
            onClick={handlePrevMonth}
            disabled={!canGoToPrevMonth}
            className={cn(
              "p-1.5 rounded-md transition-colors",
              canGoToPrevMonth 
                ? "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                : "text-gray-300 dark:text-gray-600 cursor-not-allowed"
            )}
            aria-label={t('calendar.prevMonth')}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
          
          <button
            onClick={handleToday}
            className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs font-medium rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            {t('calendar.today')}
          </button>
          
          <button
            onClick={handleNextMonth}
            disabled={!canGoToNextMonth}
            className={cn(
              "p-1.5 rounded-md transition-colors",
              canGoToNextMonth 
                ? "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                : "text-gray-300 dark:text-gray-600 cursor-not-allowed"
            )}
            aria-label={t('calendar.nextMonth')}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </div>
      </div>

      {/* Заголовки дней недели */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {[...Array(7)].map((_, index) => (
          <div key={index} className="text-center">
            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 py-1">
              {getDayName(index)}
            </div>
          </div>
        ))}
      </div>

      {/* Календарь */}
      <div className="grid grid-cols-7 gap-1 mb-4">
        {calendarDays.map((day, index) => {
          if (!day) {
            return <div key={`empty-${index}`} className="h-10" />;
          }

          return (
            <div
              key={day.dateStr}
              className="relative"
            >
              <button
                onClick={() => handleDateClick(day.dateStr)}
                disabled={!day.isWithinGoalRange}
                className={cn(
                  "h-10 w-full flex items-center justify-center rounded-md",
                  "transition-all duration-150",
                  !day.isWithinGoalRange 
                    ? "opacity-40 cursor-not-allowed" 
                    : "active:scale-95",
                  day.hasCompletionDay 
                    ? "bg-primary/10 dark:bg-dark-primary/20 border border-primary/20 dark:border-dark-primary/30" 
                    : "hover:bg-gray-100 dark:hover:bg-gray-800",
                  day.isSelected && "ring-2 ring-blue-500",
                  !day.isWithinGoalRange && "bg-gray-100 dark:bg-gray-800"
                )}
              >
                <div className={cn(
                  "text-sm font-medium",
                  !day.isWithinGoalRange 
                    ? "text-gray-400 dark:text-gray-500" 
                    : day.hasCompletionDay 
                    ? "text-primary dark:text-dark-primary font-bold" 
                    : day.isToday
                    ? "text-primary dark:text-dark-primary font-bold"
                    : "text-gray-800 dark:text-gray-200",
                )}>
                  {day.date}
                </div>

                {/* Индикатор обычного события */}
                {day.hasRegularEvents && day.isWithinGoalRange && (
                  <div className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-blue-500 dark:bg-blue-400" />
                )}
              </button>
              
              {/* Индикатор дня выполнения */}
              {day.hasCompletionDay && (
                <div className="absolute top-0 right-0 w-2 h-2 bg-primary dark:bg-dark-primary rounded-full transform translate-x-1/4 -translate-y-1/4" />
              )}
            </div>
          );
        })}
      </div>

      {/* Список событий выбранной даты */}
      {selectedDate && events.filter(event => event.date === selectedDate && event.goalId === goal.id).length > 0 && (
        <div className="mb-4">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 flex items-center">
            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {new Date(selectedDate).toLocaleDateString(language === 'ru' ? 'ru-RU' : 'en-US', {
              day: 'numeric',
              month: 'long'
            })}
          </div>
          <div className="space-y-1">
            {events
              .filter(event => event.date === selectedDate && event.goalId === goal.id && event.type !== 'completion')
              .map((event) => {
                const isFinanceEvent = event.amount !== undefined;
                
                let displayText = event.title;
                
                if (isFinanceEvent && event.amount !== undefined) {
                  const formattedAmount = event.amount.toLocaleString('ru-RU', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  });
                  
                  const sign = event.amount >= 0 ? '+' : '';
                  const amountText = `${sign}${formattedAmount} ${event.currency || t('calendar.defaultCurrency')}`;
                  
                  if (event.title && event.title.trim()) {
                    displayText = `${event.title} - ${amountText}`;
                  } else {
                    displayText = amountText;
                  }
                }

                const textColorClass = cn(
                  event.completed 
                    ? "text-gray-500 dark:text-gray-400 line-through" 
                    : "text-gray-800 dark:text-gray-200",
                  isFinanceEvent && event.amount !== undefined && event.amount >= 0 && "!text-green-600 dark:!text-green-400",
                  isFinanceEvent && event.amount !== undefined && event.amount < 0 && "!text-red-600 dark:!text-red-400"
                );

                return (
                  <div
                    key={event.id}
                    className="p-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-gray-300 dark:hover:border-gray-600 transition-colors flex items-center justify-between bg-white dark:bg-gray-800"
                  >
                    <div className="flex items-center flex-1 min-w-0">
                      {/* Чекбокс выполнения */}
                      <button
                        onClick={() => onEventToggleComplete(event.id)}
                        className={cn(
                          "w-4 h-4 border rounded flex-shrink-0 flex items-center justify-center mr-2",
                          "transition-colors duration-200",
                          event.completed 
                            ? "bg-blue-500 border-blue-500" 
                            : "border-gray-300 dark:border-gray-600 hover:border-blue-500"
                        )}
                      >
                        {event.completed && (
                          <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                      
                      {/* Отображение текста */}
                      <div className={cn("text-xs min-w-0", textColorClass)} style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        wordBreak: 'break-word'
                      }}>
                        {displayText}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {/* Кнопка редактирования события - появляется только при клике на дату */}
                      {selectedDate && (
                        <button
                          onClick={() => handleEditEvent(event)}
                          className="p-1 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 
                                  hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors group"
                          aria-label={t('common.edit')}
                          title={t('common.edit')}
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                      )}
                      
                      {/* Кнопка удаления */}
                      <button
                        onClick={() => onEventDelete(event.id)}
                        className="p-1 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                        aria-label={t('common.delete')}
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Подсказка */}
      <div className="text-center text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700 mb-3">
        <p>
          {t('calendar.hint')}
        </p>
      </div>

      {/* Кнопка удаления цели */}
      <div className="mt-2">
        <button
          onClick={handleDeleteGoal}
          className="w-full py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 border border-red-300 dark:border-red-800 rounded-md transition-colors flex items-center justify-center"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
          </svg>
          {t('calendar.deleteGoalButton')}
        </button>
      </div>

      {/* Модальное окно */}
      <GoalEventModal
        isOpen={showEventModal}
        onClose={() => {
          setShowEventModal(false);
          setEditingEventId(null);
          setEditingEventData(null);
          if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
          clickCountRef.current = 0;
        }}
        onSave={onEventSave}
        onUpdate={handleUpdateEvent}
        selectedDate={selectedDate}
        goalTitle={goal.title}
        goalCategory={goal.categoryKey}
        editingEvent={editingEventData}
      />
    </div>
  );
};

export default GoalCalendar;