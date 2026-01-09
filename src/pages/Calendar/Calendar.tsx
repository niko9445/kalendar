import React, { useState, useMemo } from 'react';
import Header from '../../components/Navigation/Header';
import BottomNav from '../../components/Navigation/BottomNav';
import { useTranslation } from '../../i18n/hooks';
import { useGoals } from '../../contexts/GoalsContext';
import { cn } from '../../utils/cn';
import AddGeneralEventModal from './components/AddGeneralEventModal';

const Calendar: React.FC = () => {
  const { 
    getCalendarEvents, 
    getGeneralEvents,
    getAllEvents,
    deleteEvent, 
    deleteGeneralEvent,
    toggleEventComplete, 
    toggleGeneralEventComplete,
    addGeneralEvent,
    formatEventDate
  } = useGoals();
  
  const { t, calendar: calendarT, language } = useTranslation();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [newEventDate, setNewEventDate] = useState<string>('');

  // Получаем все типы событий
  const calendarEvents = getCalendarEvents();
  const generalEvents = getGeneralEvents();
  const allEvents = getAllEvents();

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  // Обработчик клика по дате в календаре
  const handleDateClick = (dateStr: string) => {
    if (selectedDate === dateStr) {
      setSelectedDate(null);
    } else {
      setSelectedDate(dateStr);
    }
  };

  // Обработчик открытия модалки добавления события
  const handleAddEventClick = () => {
    // 1. Проверяем, выбрана ли дата
    if (!selectedDate) {
      // 2. Если не выбрана, показываем уведомление и выходим
      alert(t('calendar.selectDatePrompt'));
      return;
    }
    
    // 3. Если дата выбрана, все работает как раньше
    setNewEventDate(selectedDate);
    setShowAddEventModal(true);
  };

  // Обработчик сохранения общего события
  const handleSaveGeneralEvent = async (eventData: {
    title: string;
    description: string;
    date: string;
    color: string;
    type: 'work' | 'personal' | 'health' | 'learning' | 'finance';
    completed: boolean;
    amount?: number;
    currency?: string;
  }) => {
    try {
      await addGeneralEvent({
        title: eventData.title,
        description: eventData.description,
        date: eventData.date,
        color: eventData.color,
        event_type: eventData.type === 'finance' ? 'finance' : 'general',
        completed: eventData.completed,
        amount: eventData.amount,
        currency: eventData.currency || 'RUB',
      });

      setShowAddEventModal(false);
    } catch (error) {
      console.error('Ошибка при добавлении общего события:', error);
      alert('Не удалось добавить событие. Попробуйте еще раз.');
    }
  };

  // Получаем события для выбранной даты (если есть) или все события
  const getFilteredEvents = useMemo(() => {
    if (selectedDate) {
      return allEvents.filter(event => event.date === selectedDate);
    }
    return allEvents;
  }, [allEvents, selectedDate]);

  const MiniCalendar: React.FC = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    const days = [];
    
    for (let i = 0; i < (firstDay === 0 ? 6 : firstDay - 1); i++) {
      days.push(null);
    }
    
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const dayEvents = allEvents.filter(event => event.date === dateStr);
      const isToday = dateStr === todayStr;
      const isSelected = selectedDate === dateStr;
      
      days.push({
        day: i,
        dateStr,
        hasEvents: dayEvents.length > 0,
        isToday,
        isSelected
      });
    }

    const dayNames = [
      t('calendar.dayNames.mon'),
      t('calendar.dayNames.tue'),
      t('calendar.dayNames.wed'),
      t('calendar.dayNames.thu'),
      t('calendar.dayNames.fri'),
      t('calendar.dayNames.sat'),
      t('calendar.dayNames.sun'),
    ];

    return (
      <div className="bg-white dark:bg-dark-surface rounded-xl p-4 mb-4 border border-border dark:border-dark-border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold text-text-primary dark:text-dark-text-primary">
              {currentMonth.toLocaleDateString(language === 'ru' ? 'ru-RU' : 'en-US', { 
                month: 'long', 
                year: 'numeric' 
              })}
            </h3>
            {/* Показываем выбранную дату, если она есть */}
            {selectedDate && (
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                {formatEventDate(selectedDate)}
                <button 
                  onClick={() => setSelectedDate(null)}
                  className="ml-2 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  title={t('calendar.clearSelection')}
                >
                  ×
                </button>
              </p>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
                setSelectedDate(null);
              }}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface dark:hover:bg-dark-surface transition-colors"
              aria-label={t('calendar.prevMonth')}
            >
              <svg className="w-4 h-4 text-text-secondary dark:text-dark-text-secondary" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
            <button
              onClick={() => {
                setCurrentMonth(new Date());
                setSelectedDate(null);
              }}
              className="px-3 py-1.5 text-sm bg-surface dark:bg-dark-surface text-text-primary dark:text-dark-text-primary rounded-lg hover:bg-border dark:hover:bg-dark-border transition-colors"
            >
              {t('calendar.today')}
            </button>
            <button
              onClick={() => {
                setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
                setSelectedDate(null);
              }}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface dark:hover:bg-dark-surface transition-colors"
              aria-label={t('calendar.nextMonth')}
            >
              <svg className="w-4 h-4 text-text-secondary dark:text-dark-text-secondary" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map(day => (
            <div key={day} className="text-center">
              <div className="text-xs font-medium text-text-secondary dark:text-dark-text-secondary py-1">
                {day}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => {
            if (!day) {
              return <div key={`empty-${index}`} className="h-10" />;
            }

            const dayEvents = allEvents.filter(e => e.date === day.dateStr);

            return (
              <button
                key={day.dateStr}
                onClick={() => handleDateClick(day.dateStr)}
                className={cn(
                  "h-10 w-full flex items-center justify-center rounded-lg relative",
                  "transition-all duration-200 active:scale-95",
                  day.isSelected
                    ? "bg-primary/10 dark:bg-dark-primary/20 border border-primary/20 dark:border-dark-primary/30"
                    : "hover:bg-surface/50 dark:hover:bg-dark-surface/50"
                )}
              >
                <div className={cn(
                  "text-sm font-medium",
                  day.isToday && !day.isSelected 
                    ? "text-primary dark:text-dark-primary font-semibold"
                    : day.isSelected
                    ? "text-primary dark:text-dark-primary"
                    : "text-text-primary dark:text-dark-text-primary"
                )}>
                  {day.day}
                </div>

                {day.hasEvents && !day.isSelected && (
                  <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex gap-0.5">
                    {dayEvents
                      .slice(0, 3)
                      .map((event, idx) => {
                        let dotColor = COLOR_MAP[event.color] || '#3b82f6';
                        const isGoalEvent = 'goal_id' in event;
                        
                        if (!isGoalEvent) {
                          dotColor = event.color === 'bg-gray-500' ? '#6b7280' : COLOR_MAP[event.color] || '#3b82f6';
                        }
                        
                        return (
                          <div
                            key={idx}
                            className="w-1 h-1 rounded-full"
                            style={{ backgroundColor: dotColor }}
                          />
                        );
                      })
                    }
                  </div>
                )}
                
                {day.isSelected && (
                  <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-primary dark:bg-dark-primary" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  // Сортировка событий: новые даты (будущие) → старые (прошлые)
  const sortedEvents = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    
    return [...getFilteredEvents].sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      const todayDate = new Date(today);
      
      if (a.date === today && b.date !== today) return -1;
      if (a.date !== today && b.date === today) return 1;
      
      if (a.date === today && b.date === today) {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      
      const isFutureA = dateA >= todayDate;
      const isFutureB = dateB >= todayDate;
      
      if (isFutureA && !isFutureB) return -1;
      if (!isFutureA && isFutureB) return 1;
      
      if (isFutureA && isFutureB) {
        return dateA.getTime() - dateB.getTime();
      }
      
      return dateB.getTime() - dateA.getTime();
    });
  }, [getFilteredEvents]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date().toDateString();
    if (date.toDateString() === today) return t('calendar.today');
    
    return date.toLocaleDateString(language === 'ru' ? 'ru-RU' : 'en-US', {
      day: 'numeric',
      month: 'short'
    });
  };

  // Обработчик переключения статуса выполнения события
  const handleToggleComplete = (event: any, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if ('goal_id' in event) {
      toggleEventComplete(event.id);
    } else {
      toggleGeneralEventComplete(event.id);
    }
  };

  // Обработчик удаления события
  const handleDeleteEvent = (event: any, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if ('goal_id' in event) {
      deleteEvent(event.id);
    } else {
      deleteGeneralEvent(event.id);
    }
  };

  // Текст для заголовка раздела событий
  const eventsSectionTitle = selectedDate
    ? `${t('calendar.eventsForDate')} ${formatEventDate(selectedDate)} (${getFilteredEvents.length})`
    : t('calendar.eventsLabel', { count: getFilteredEvents.length });

  return (
    <div className="min-h-screen bg-background dark:bg-dark-background pb-20">
      <Header 
        title={calendarT('title')}
        subtitle={selectedDate 
          ? t('calendar.viewingDateEvents')
          : t('calendar.viewingAllEvents')}
      />

      <main className="p-3">
        <MiniCalendar />

        <div className="bg-white dark:bg-dark-surface rounded-xl border border-border dark:border-dark-border flex flex-col h-[calc(100vh-250px)] min-h-[300px]">
          <div className="px-3 py-3 border-b border-border dark:border-dark-border flex-shrink-0">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-text-primary dark:text-dark-text-primary">
                {eventsSectionTitle}
              </span>
              <div className="flex items-center gap-2">
                {selectedDate && (
                  <button
                    onClick={() => setSelectedDate(null)}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                  >
                    {t('calendar.showAll')}
                  </button>
                )}
                <button
                  onClick={handleAddEventClick}
                  disabled={!selectedDate} // <-- Добавлено
                  className={cn(
                    "w-8 h-8 flex items-center justify-center rounded-md text-text-primary dark:text-dark-text-primary transition-colors",
                    "hover:text-primary dark:hover:text-dark-primary hover:bg-surface/50 dark:hover:bg-dark-surface/50",
                    !selectedDate && "opacity-50 cursor-not-allowed" // <-- Добавлено
                  )}
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                  title={t('calendar.addEvent')}
                  aria-label={t('calendar.addEvent')}
                >
                  <svg 
                    className="w-5 h-5" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth={2.5}
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {sortedEvents.length > 0 ? (
              <div className="divide-y divide-border/50 dark:divide-dark-border/50">
                {sortedEvents.map(event => {
                  const isGoalEvent = 'goal_id' in event;
                  const isFinanceEvent = event.amount !== undefined && event.amount !== null;
                  
                  let displayText = event.title;
                  
                  if (isFinanceEvent && event.amount !== undefined && event.amount !== null) {
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
                      ? "text-text-secondary dark:text-dark-text-secondary line-through" 
                      : "text-text-primary dark:text-dark-text-primary",
                    isFinanceEvent && event.amount !== undefined && event.amount !== null && event.amount >= 0 && "!text-green-600 dark:!text-green-400",
                    isFinanceEvent && event.amount !== undefined && event.amount !== null && event.amount < 0 && "!text-red-600 dark:!text-red-400"
                  );

                  let dotColor = COLOR_MAP[event.color] || '#3b82f6';
                  if (isGoalEvent) {
                    dotColor = COLOR_MAP[event.color] || '#3b82f6';
                  } else {
                    dotColor = event.color === 'bg-gray-500' ? '#6b7280' : COLOR_MAP[event.color] || '#3b82f6';
                  }

                  return (
                    <div 
                      key={event.id} 
                      className="px-3 py-2 hover:bg-surface/50 dark:hover:bg-dark-surface/50 transition-colors"
                    >
                      <div className="flex items-start gap-2">
                        <button
                          onClick={(e) => handleToggleComplete(event, e)}
                          onMouseDown={(e) => e.preventDefault()}
                          className={cn(
                            "w-4 h-4 border rounded flex-shrink-0 mt-0.5",
                            "transition-colors duration-200 active:scale-95",
                            "flex items-center justify-center",
                            "outline-none focus:outline-none",
                            event.completed 
                              ? "bg-primary dark:bg-dark-primary border-primary dark:border-dark-primary" 
                              : "border-border dark:border-dark-border hover:border-primary dark:hover:border-dark-primary"
                          )}
                          aria-label={event.completed 
                            ? t('calendar.markIncomplete') 
                            : t('calendar.markComplete')}
                        >
                          {event.completed && (
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

                        <div 
                          className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5"
                          style={{ backgroundColor: dotColor }}
                        />

                        <span className="text-xs text-text-secondary dark:text-dark-text-secondary min-w-[60px] flex-shrink-0 pt-0.5">
                          {formatDate(event.date)}
                        </span>

                        <div className="flex-1 min-w-0">
                          <span className={cn("text-sm block", textColorClass)} style={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            wordBreak: 'break-word',
                            lineHeight: '1.3'
                          }}>
                            {displayText}
                          </span>
                          
                          {isGoalEvent && event.goalTitle && (
                            <span className="text-xs text-text-tertiary dark:text-dark-text-tertiary block mt-0.5 leading-tight truncate">
                              {event.goalTitle}
                            </span>
                          )}
                          
                          {!isGoalEvent && (
                            <span className="text-xs text-blue-600 dark:text-blue-400 block mt-0.5 leading-tight">
                              {t('calendar.generalEvent')}
                            </span>
                          )}
                        </div>

                        <button
                          onClick={(e) => handleDeleteEvent(event, e)}
                          onMouseDown={(e) => e.preventDefault()}
                          className="p-1 text-text-tertiary dark:text-dark-text-tertiary hover:text-error dark:hover:text-dark-error active:scale-95 transition-colors flex-shrink-0 mt-0.5"
                          title={t('common.delete')}
                          aria-label={t('common.delete')}
                        >
                          <svg 
                            className="w-3.5 h-3.5" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth={2.5}
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="px-3 py-8 text-center h-full flex flex-col items-center justify-center">
                <p className="text-text-secondary dark:text-dark-text-secondary text-sm">
                  {selectedDate 
                    ? t('calendar.noEventsForDate')
                    : t('calendar.noEvents')}
                </p>
                <button
                  onClick={handleAddEventClick}
                  disabled={!selectedDate} // <-- Добавлено
                  className={cn(
                    "mt-3 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg transition-colors text-sm border border-blue-200 dark:border-blue-700/30",
                    "hover:bg-blue-200 dark:hover:bg-blue-800/40",
                    !selectedDate && "opacity-50 cursor-not-allowed" // <-- Добавлено
                  )}
                >
                  {t('calendar.addEvent')}
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      <BottomNav />

      <AddGeneralEventModal
        isOpen={showAddEventModal}
        onClose={() => setShowAddEventModal(false)}
        onSave={handleSaveGeneralEvent}
        selectedDate={newEventDate}
      />
    </div>
  );
};

const COLOR_MAP: { [key: string]: string } = {
  'bg-blue-500': '#3b82f6',
  'bg-green-500': '#10b981',
  'bg-yellow-500': '#f59e0b',
  'bg-red-500': '#ef4444',
  'bg-purple-500': '#8b5cf6',
  'bg-pink-500': '#ec4899',
  'bg-gray-500': '#6b7280',
  'bg-blue-100': '#dbeafe',
  'bg-indigo-500': '#6366f1',
  'bg-teal-500': '#14b8a6',
  'bg-orange-500': '#f97316',
  'bg-rose-500': '#f43f5e',
  'bg-cyan-500': '#06b6d4',
  'bg-emerald-500': '#10b981',
  'bg-violet-500': '#8b5cf6',
  'bg-fuchsia-500': '#d946ef',
  'bg-sky-500': '#0ea5e9',
  'bg-lime-500': '#84cc16',
  'bg-amber-500': '#f59e0b',
  'bg-stone-500': '#78716c',
  'bg-zinc-500': '#71717a',
  'bg-neutral-500': '#737373',
  'bg-slate-500': '#64748b',
};

export default Calendar;