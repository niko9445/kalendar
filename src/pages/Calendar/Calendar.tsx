import React, { useState, useMemo } from 'react';
import Header from '../../components/Navigation/Header';
import BottomNav from '../../components/Navigation/BottomNav';
import { useGoals, CalendarEvent } from '../../contexts/GoalsContext';
import { cn } from '../../utils/cn';

const Calendar: React.FC = () => {
  const { events, deleteEvent, toggleEventComplete } = useGoals();
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const MiniCalendar = () => {
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
      const dayEvents = events.filter(event => event.date === dateStr);
      const isToday = dateStr === todayStr;
      
      days.push({
        day: i,
        dateStr,
        hasEvents: dayEvents.length > 0,
        isToday
      });
    }

    return (
      <div className="bg-white dark:bg-dark-surface rounded-xl p-4 mb-4 border border-border dark:border-dark-border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold text-text-primary dark:text-dark-text-primary">
              {currentMonth.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}
            </h3>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface dark:hover:bg-dark-surface transition-colors"
            >
              <svg className="w-4 h-4 text-text-secondary dark:text-dark-text-secondary" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
            <button
              onClick={() => setCurrentMonth(new Date())}
              className="px-3 py-1.5 text-sm bg-surface dark:bg-dark-surface text-text-primary dark:text-dark-text-primary rounded-lg hover:bg-border dark:hover:bg-dark-border transition-colors"
            >
              Сегодня
            </button>
            <button
              onClick={() => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface dark:hover:bg-dark-surface transition-colors"
            >
              <svg className="w-4 h-4 text-text-secondary dark:text-dark-text-secondary" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(day => (
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

            return (
              <div
                key={day.dateStr}
                className={cn(
                  "h-10 flex items-center justify-center rounded-lg relative",
                  "transition-colors duration-150",
                  day.isToday 
                    ? "bg-primary/10 dark:bg-dark-primary/20 border border-primary/20 dark:border-dark-primary/30" 
                    : "hover:bg-surface/50 dark:hover:bg-dark-surface/50"
                )}
              >
                <div className={cn(
                  "text-sm font-medium",
                  day.isToday 
                    ? "text-primary dark:text-dark-primary" 
                    : "text-text-primary dark:text-dark-text-primary",
                  day.hasEvents && "font-semibold"
                )}>
                  {day.day}
                </div>

                {day.hasEvents && (
                  <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex gap-0.5">
                    {events
                      .filter(e => e.date === day.dateStr)
                      .slice(0, 3)
                      .map((event, idx) => (
                        <div
                          key={idx}
                          className="w-1 h-1 rounded-full"
                          style={{ 
                            backgroundColor: COLOR_MAP[event.color] || '#3b82f6' 
                          }}
                        />
                      ))
                    }
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const sortedEvents = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return [...events].sort((a, b) => {
      const isTodayA = a.date === today;
      const isTodayB = b.date === today;
      if (isTodayA && !isTodayB) return -1;
      if (!isTodayA && isTodayB) return 1;
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
  }, [events]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date().toDateString();
    if (date.toDateString() === today) return 'Сегодня';
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short'
    });
  };

  // Фиксим баг с чекбоксом - предотвращаем всплытие события
  const handleToggleComplete = (eventId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleEventComplete(eventId);
  };

  return (
    <div className="min-h-screen bg-background dark:bg-dark-background pb-20">
      <Header 
        title="Календарь"
        subtitle={`${events.length} событий`}
      />

      <main className="p-3">
        <MiniCalendar />

        <div className="bg-white dark:bg-dark-surface rounded-xl border border-border dark:border-dark-border">
          <div className="px-3 py-3 border-b border-border dark:border-dark-border">
            <span className="text-sm font-medium text-text-primary dark:text-dark-text-primary">
              События ({events.length})
            </span>
          </div>

          <div className="max-h-[60vh] overflow-y-auto">
            {sortedEvents.length > 0 ? (
              <div className="divide-y divide-border/50 dark:divide-dark-border/50">
                {sortedEvents.map(event => {
                  const isFinanceEvent = event.amount !== undefined;
                  
                  let displayText = event.title;
                  
                  if (isFinanceEvent && event.amount !== undefined) {
                    const formattedAmount = event.amount.toLocaleString('ru-RU', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    });
                    
                    const sign = event.amount >= 0 ? '+' : '';
                    const amountText = `${sign}${formattedAmount} ${event.currency || 'RUB'}`;
                    
                    displayText = event.title && event.title !== 'Транзакция' 
                      ? `${event.title} - ${amountText}`
                      : amountText;
                  }

                  const textColorClass = cn(
                    event.completed 
                      ? "text-text-secondary dark:text-dark-text-secondary line-through" 
                      : "text-text-primary dark:text-dark-text-primary",
                    isFinanceEvent && event.amount !== undefined && event.amount >= 0 && "!text-green-600 dark:!text-green-400",
                    isFinanceEvent && event.amount !== undefined && event.amount < 0 && "!text-red-600 dark:!text-red-400"
                  );

                  return (
                    <div 
                      key={event.id} 
                      className="px-3 py-2.5 hover:bg-surface/50 dark:hover:bg-dark-surface/50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        {/* ИСПРАВЛЕННЫЙ ЧЕКБОКС */}
                        <button
                          onClick={(e) => handleToggleComplete(event.id, e)}
                          onMouseDown={(e) => e.preventDefault()}
                          className={cn(
                            "w-4 h-4 border rounded flex-shrink-0 flex items-center justify-center",
                            "transition-colors duration-200 active:scale-95",
                            "outline-none focus:outline-none",
                            event.completed 
                              ? "bg-primary dark:bg-dark-primary border-primary dark:border-dark-primary" 
                              : "border-border dark:border-dark-border hover:border-primary dark:hover:border-dark-primary"
                          )}
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

                        {/* Цветная точка */}
                        <div 
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: COLOR_MAP[event.color] || '#3b82f6' }}
                        />

                        {/* Дата */}
                        <span className="text-xs text-text-secondary dark:text-dark-text-secondary min-w-[60px]">
                          {formatDate(event.date)}
                        </span>

                        {/* Название */}
                        <span className={cn("text-sm flex-1 truncate", textColorClass)}>
                          {displayText}
                        </span>

                        {/* КРЕСТИК УДАЛЕНИЯ (ВСЕГДА ВИДИМЫЙ) */}
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            deleteEvent(event.id);
                          }}
                          onMouseDown={(e) => e.preventDefault()}
                          className="p-1 text-text-tertiary dark:text-dark-text-tertiary hover:text-error dark:hover:text-dark-error active:scale-95 transition-colors"
                          title="Удалить событие"
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
              <div className="px-3 py-8 text-center">
                <p className="text-text-secondary dark:text-dark-text-secondary text-sm">Нет событий</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <BottomNav />
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
};

export default Calendar;