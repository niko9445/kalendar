import React, { useState } from 'react';
import { cn } from '../../../utils/cn';
import GoalEventModal from './GoalEventModal';

interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  color: string;
  type: 'work' | 'personal' | 'health' | 'learning';
  completed: boolean;
  goalId: string;
}

interface FullCalendarViewProps {
  events: CalendarEvent[];
  onEventSave: (event: Omit<CalendarEvent, 'id'>) => void;
  onEventDelete: (eventId: string) => void;
  onEventToggleComplete: (eventId: string) => void;
}

const FullCalendarView: React.FC<FullCalendarViewProps> = ({
  events,
  onEventSave,
  onEventDelete,
  onEventToggleComplete,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);

  // Функции для работы с датами
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

  const getMonthName = (date: Date) => {
    return date.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });
  };

  const getDayName = (dayIndex: number) => {
    const days = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
    return days[dayIndex];
  };

  // Генерация календаря
  const generateCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const days = [];
    
    // Пустые ячейки перед первым днем
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    
    // Дни месяца
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const dayEvents = events.filter(event => event.date === dateStr);
      const isToday = dateStr === new Date().toISOString().split('T')[0];
      const isSelected = selectedDate === dateStr;
      
      days.push({
        date: i,
        dateStr,
        events: dayEvents,
        isToday,
        isSelected,
      });
    }
    
    return days;
  };

  const handleDateClick = (dateStr: string) => {
    setSelectedDate(dateStr);
    setShowEventModal(true);
  };

  const handlePrevMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleEventSave = (eventData: {
    title: string;
    description: string;
    date: string;
    color: string;
    type: 'work' | 'personal' | 'health' | 'learning';
    completed: boolean;
    }) => {
    // Создаем полное событие с дефолтным goalId (или можно передавать из пропсов)
    const fullEvent: Omit<CalendarEvent, 'id'> = {
        ...eventData,
        goalId: 'default-goal-id' // ИЛИ передавайте реальный goalId через пропсы
    };
    onEventSave(fullEvent);
    };

  const calendarDays = generateCalendar();
  const selectedDateEvents = selectedDate 
    ? events.filter(event => event.date === selectedDate)
    : [];

  return (
    <div className="bg-white dark:bg-dark-surface border border-border dark:border-dark-border rounded-lg p-4">
      {/* Заголовок общего календаря */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-medium text-text-primary dark:text-dark-text-primary">
            Общий календарь
          </h3>
          <p className="text-sm text-text-secondary dark:text-dark-text-secondary">
            {getMonthName(currentDate)} • {events.length} событий
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={handlePrevMonth}
            className="p-2 text-text-secondary dark:text-dark-text-secondary hover:text-text-primary dark:hover:text-dark-text-primary hover:bg-surface dark:hover:bg-dark-surface rounded-md transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
          
          <button
            onClick={handleToday}
            className="px-4 py-2 bg-primary dark:bg-dark-primary text-white text-sm font-medium rounded-md hover:bg-primary-dark dark:hover:bg-dark-primary-dark transition-colors"
          >
            Сегодня
          </button>
          
          <button
            onClick={handleNextMonth}
            className="p-2 text-text-secondary dark:text-dark-text-secondary hover:text-text-primary dark:hover:text-dark-text-primary hover:bg-surface dark:hover:bg-dark-surface rounded-md transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </div>
      </div>

      {/* Заголовки дней недели */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {[...Array(7)].map((_, index) => (
          <div key={index} className="text-center">
            <div className="text-xs font-medium text-text-secondary dark:text-dark-text-secondary py-2">
              {getDayName(index)}
            </div>
          </div>
        ))}
      </div>

      {/* Календарь */}
      <div className="grid grid-cols-7 gap-1 mb-6">
        {calendarDays.map((day, index) => {
          if (!day) {
            return <div key={`empty-${index}`} className="h-12" />;
          }

          return (
            <button
              key={day.dateStr}
              onClick={() => handleDateClick(day.dateStr)}
              className={cn(
                "h-12 flex flex-col items-center justify-center rounded-md",
                "transition-colors duration-150",
                day.isToday 
                  ? "bg-primary dark:bg-dark-primary text-white" 
                  : "hover:bg-surface dark:hover:bg-dark-surface",
                day.isSelected && "ring-2 ring-primary dark:ring-dark-primary",
                day.events.length > 0 && "border border-border dark:border-dark-border"
              )}
            >
              <div className={cn(
                "text-sm font-medium",
                day.isToday 
                  ? "text-white" 
                  : "text-text-primary dark:text-dark-text-primary"
              )}>
                {day.date}
              </div>

              {/* Точки для событий */}
              <div className="flex mt-0.5 space-x-0.5">
                {day.events.slice(0, 3).map((event, idx) => (
                  <div
                    key={idx}
                    className={cn("w-1.5 h-1.5 rounded-full", event.color)}
                    title={event.title}
                  />
                ))}
              </div>
            </button>
          );
        })}
      </div>

      {/* События выбранного дня */}
      {selectedDate && (
        <div className="mt-6 pt-6 border-t border-border dark:border-dark-border">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h4 className="font-medium text-text-primary dark:text-dark-text-primary">
                {new Date(selectedDate).toLocaleDateString('ru-RU', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </h4>
              <p className="text-sm text-text-secondary dark:text-dark-text-secondary">
                {selectedDateEvents.length} событий
              </p>
            </div>
            <button
              onClick={() => setShowEventModal(true)}
              className="px-3 py-1.5 text-sm bg-primary dark:bg-dark-primary text-white rounded-md hover:bg-primary-dark dark:hover:bg-dark-primary-dark transition-colors"
            >
              + Добавить
            </button>
          </div>

          {selectedDateEvents.length === 0 ? (
            <div className="text-center py-6 border border-border dark:border-dark-border rounded-md">
              <p className="text-text-secondary dark:text-dark-text-secondary">Нет событий на этот день</p>
            </div>
          ) : (
            <div className="space-y-3">
              {selectedDateEvents.map((event) => (
                <div
                  key={event.id}
                  className="p-3 border border-border dark:border-dark-border rounded-md hover:border-border-light dark:hover:border-dark-border-light transition-colors bg-white dark:bg-dark-surface"
                >
                  <div className="flex items-start">
                    <div className={cn("w-3 h-3 rounded-full mt-1 mr-3", event.color)} />
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h5 className={cn(
                            "font-medium",
                            event.completed 
                              ? "text-text-secondary dark:text-dark-text-secondary line-through" 
                              : "text-text-primary dark:text-dark-text-primary"
                          )}>
                            {event.title}
                          </h5>
                          {event.description && (
                            <p className="text-sm text-text-secondary dark:text-dark-text-secondary mt-1">
                              {event.description}
                            </p>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => onEventToggleComplete(event.id)}
                            className={cn(
                              "p-1.5 rounded-md transition-colors",
                              event.completed 
                                ? "text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20" 
                                : "text-text-secondary dark:text-dark-text-secondary hover:bg-surface dark:hover:bg-dark-surface"
                            )}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          </button>
                          <button
                            onClick={() => onEventDelete(event.id)}
                            className="p-1.5 text-error dark:text-dark-error hover:text-error-dark dark:hover:text-dark-error-dark hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Модальное окно */}
      <GoalEventModal
        isOpen={showEventModal}
        onClose={() => {
          setShowEventModal(false);
          setSelectedDate(null);
        }}
        onSave={handleEventSave}
        selectedDate={selectedDate}
        goalTitle={''}
      />
    </div>
  );
};

export default FullCalendarView;