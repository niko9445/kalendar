// src/pages/Goals/components/FullCalendarView.tsx

import React, { useState } from 'react';
import { cn } from '../../../utils/cn';
import { useTranslation } from '../../../i18n/hooks';

// Упростим интерфейс, так как события мы здесь не создаем
interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  color: string;
  goalId: string;
}

interface FullCalendarViewProps {
  events: CalendarEvent[];
}

const FullCalendarView: React.FC<FullCalendarViewProps> = ({ events }) => {
  const { t } = useTranslation();
  const [currentDate, setCurrentDate] = useState(new Date());

  // Функции для работы с датами (остаются без изменений)
  const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  const getMonthName = (date: Date) => date.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });
  const getDayName = (dayIndex: number) => {
    const days = [t('calendar.dayNames.sun'), t('calendar.dayNames.mon'), t('calendar.dayNames.tue'), t('calendar.dayNames.wed'), t('calendar.dayNames.thu'), t('calendar.dayNames.fri'), t('calendar.dayNames.sat')];
    return days[dayIndex];
  };

  // Генерация календаря
  const generateCalendar = () => {
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
      const dayEvents = events.filter(event => event.date === dateStr);
      const isToday = dateStr === new Date().toISOString().split('T')[0];
      
      days.push({
        date: i,
        dateStr,
        events: dayEvents,
        isToday,
      });
    }
    return days;
  };

  const handlePrevMonth = () => setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  const handleToday = () => setCurrentDate(new Date());

  const calendarDays = generateCalendar();

  return (
    <div className="bg-white dark:bg-dark-surface border border-border dark:border-dark-border rounded-lg p-4">
      {/* Заголовок */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-medium text-text-primary dark:text-dark-text-primary">
            {t('calendar.fullCalendar.title')}
          </h3>
          <p className="text-sm text-text-secondary dark:text-dark-text-secondary">
            {getMonthName(currentDate)} • {t('calendar.eventsCount', { count: events.length })}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button onClick={handlePrevMonth} className="p-2 rounded-md transition-colors text-text-secondary dark:text-dark-text-secondary hover:bg-surface dark:hover:bg-dark-surface" aria-label={t('calendar.prevMonth')}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
          </button>
          <button onClick={handleToday} className="px-4 py-2 text-sm font-medium rounded-md transition-colors bg-primary dark:bg-dark-primary text-white hover:bg-primary-dark dark:hover:bg-dark-primary-dark">{t('calendar.today')}</button>
          <button onClick={handleNextMonth} className="p-2 rounded-md transition-colors text-text-secondary dark:text-dark-text-secondary hover:bg-surface dark:hover:bg-dark-surface" aria-label={t('calendar.nextMonth')}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
          </button>
        </div>
      </div>
      {/* Дни недели */}
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
            // Обертка вместо <button>, так как клик не нужен
            <div
              key={day.dateStr}
              className={cn(
                "h-12 flex flex-col items-center justify-center rounded-md",
                day.isToday && "bg-primary/10 dark:bg-dark-primary/20"
              )}
            >
              <div className={cn("text-sm font-medium", day.isToday ? "text-primary dark:text-dark-primary font-bold" : "text-text-primary dark:text-dark-text-primary")}>
                {day.date}
              </div>
              <div className="flex mt-0.5 space-x-0.5">
                {day.events.slice(0, 3).map((event, idx) => (
                  <div key={idx} className={cn("w-1.5 h-1.5 rounded-full", event.color)} title={event.title} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
      {/* Модальное окно и список событий выбранного дня удалены, так как они здесь не нужны */}
    </div>
  );
};

export default FullCalendarView;
