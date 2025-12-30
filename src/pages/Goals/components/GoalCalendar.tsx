import React, { useState, useRef, useMemo, useCallback } from 'react';
import { cn } from '../../../utils/cn';
import { useTranslation } from '../../../i18n/hooks';
import GoalEventModal from './GoalEventModal';
import { Goal, CalendarEvent } from '../../../contexts/GoalsContext';
import { useGoals } from '../../../contexts/GoalsContext'; // ДОБАВЬТЕ ЭТОТ ИМПОРТ

interface GoalCalendarProps {
  goal: Goal;
  events: CalendarEvent[];
  onEventSave: (event: Omit<CalendarEvent, 'id'>) => void;
  onEventDelete: (eventId: string) => void;
  onEventToggleComplete: (eventId: string) => void;
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
  onDeleteGoal,
}) => {
  const { t, language } = useTranslation();
  const { toggleCompletionDay, isCompletionDayEvent } = useGoals(); // ДОБАВЬТЕ ЭТО
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  
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
      
      // Используем функцию из контекста
      const hasCompletionDay = dayEvents.some(isCompletionDayEvent);
      const hasRegularEvents = dayEvents.some(event => !isCompletionDayEvent(event));
      
      days.push({
        date: i,
        dateStr,
        events: dayEvents,
        isToday,
        isSelected,
        hasCompletionDay,
        hasRegularEvents,
      });
    }
    
    return days;
  }, [currentDate, events, goal.id, selectedDate, isCompletionDayEvent]);

  // Оптимизированный обработчик кликов
  const handleDateClick = useCallback((dateStr: string) => {
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
        setShowEventModal(true);
      }
      else if (clicks === 1) {
        setSelectedDate(dateStr);
      }
    }, 300);
  }, [goal.id, t, toggleCompletionDay]);

  const handlePrevMonth = useCallback(() => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    setSelectedDate(null);
    if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
  }, []);

  const handleNextMonth = useCallback(() => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    setSelectedDate(null);
    if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
  }, []);

  const handleToday = useCallback(() => {
    setCurrentDate(new Date());
    setSelectedDate(null);
    if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
  }, []);

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
            className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
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
            className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
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
                className={cn(
                  "h-10 w-full flex items-center justify-center rounded-md",
                  "transition-all duration-150",
                  "active:scale-95",
                  day.hasCompletionDay 
                    ? "bg-primary/10 dark:bg-dark-primary/20 border border-primary/20 dark:border-dark-primary/30" 
                    : "hover:bg-gray-100 dark:hover:bg-gray-800",
                  day.isSelected && "ring-2 ring-blue-500"
                )}
              >
                <div className={cn(
                  "text-sm font-medium",
                  day.hasCompletionDay 
                    ? "text-primary dark:text-dark-primary font-bold" 
                    : day.isToday
                    ? "text-primary dark:text-dark-primary font-bold" // Жирный primary цвет
                    : "text-gray-800 dark:text-gray-200",
                )}>
                  {day.date}
                </div>

                {/* Индикатор обычного события */}
                {day.hasRegularEvents && (
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
              .filter(event => event.date === selectedDate && event.goalId === goal.id && !isCompletionDayEvent(event))
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
                  
                  displayText = event.title && event.title !== t('calendar.transaction') 
                    ? `${event.title} - ${amountText}`
                    : amountText;
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
                      <span className={cn("text-xs truncate", textColorClass)}>
                        {displayText}
                      </span>
                    </div>
                    
                    {/* Кнопка удаления */}
                    <button
                      onClick={() => onEventDelete(event.id)}
                      className="p-1 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors ml-1 flex-shrink-0"
                      aria-label={t('common.delete')}
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
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
          if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
          clickCountRef.current = 0;
        }}
        onSave={(eventData) => {
          onEventSave({
            ...eventData,
            goalId: goal.id,
          });
          setShowEventModal(false);
          if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
          clickCountRef.current = 0;
        }}
        selectedDate={selectedDate}
        goalTitle={goal.title}
        goalCategory={goal.category}
      />
    </div>
  );
};

export default GoalCalendar;