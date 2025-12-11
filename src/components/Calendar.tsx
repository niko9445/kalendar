import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addMonths, subMonths, isSameDay, isSameMonth } from 'date-fns';
import { ru } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

const Calendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Понедельник
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = [];
  let day = startDate;
  
  while (day <= endDate) {
    days.push(day);
    day = new Date(day.getTime() + 86400000); // +1 день
  }

  const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  return (
    <div className="max-w-4xl mx-auto">
      {/* Заголовок календаря */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <CalendarIcon className="w-8 h-8 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-800">
            {format(currentDate, 'LLLL yyyy', { locale: ru })}
          </h2>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={prevMonth}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Предыдущий месяц"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Сегодня
          </button>
          <button
            onClick={nextMonth}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Следующий месяц"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Дни недели */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((day, index) => (
          <div
            key={day}
            className={`text-center font-medium py-2 ${
              index >= 5 ? 'text-red-500' : 'text-gray-600'
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Ячейки календаря */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => {
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isToday = isSameDay(day, new Date());
          const isWeekend = index % 7 >= 5;

          return (
            <div
              key={day.toString()}
              className={`
                min-h-24 p-2 border rounded-lg transition-all duration-200
                ${isCurrentMonth ? 'bg-white' : 'bg-gray-50 text-gray-400'}
                ${isToday ? 'border-2 border-red-500 bg-red-50' : 'border-gray-200'}
                ${isWeekend && isCurrentMonth ? 'bg-gray-50' : ''}
                hover:bg-gray-50 hover:shadow-sm cursor-pointer
              `}
            >
              <div className="flex justify-between items-start mb-1">
                <span className={`
                  text-lg font-medium
                  ${isToday ? 'text-red-600' : isCurrentMonth ? 'text-gray-800' : 'text-gray-400'}
                  ${isWeekend && isCurrentMonth && !isToday ? 'text-red-500' : ''}
                `}>
                  {format(day, 'd')}
                </span>
                {isToday && (
                  <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">
                    сегодня
                  </span>
                )}
              </div>
              
              {/* Пример событий */}
              {isCurrentMonth && (
                <div className="space-y-1">
                  {day.getDate() === 15 && (
                    <div className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded truncate">
                      Встреча
                    </div>
                  )}
                  {day.getDate() === 20 && (
                    <div className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded truncate">
                      День рождения
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Calendar;