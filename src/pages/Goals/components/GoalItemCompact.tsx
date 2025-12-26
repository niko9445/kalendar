import React from 'react';
import { cn } from '../../../utils/cn';
import GoalCalendar from './GoalCalendar';
import { Goal, CalendarEvent } from '../../../contexts/GoalsContext';

interface GoalItemCompactProps {
  goal: Goal;
  events: CalendarEvent[];
  isExpanded: boolean;
  onToggleExpand: () => void;
  onToggleComplete: () => void;
  onDeleteGoal: () => void;
  onEventSave: (event: Omit<CalendarEvent, 'id'>) => void;
  onEventDelete: (eventId: string) => void;
  onEventToggleComplete: (eventId: string) => void;
}

const GoalItemCompact: React.FC<GoalItemCompactProps> = ({
  goal,
  events,
  isExpanded,
  onToggleExpand,
  onToggleComplete,
  onDeleteGoal,
  onEventSave,
  onEventDelete,
  onEventToggleComplete,
}) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300';
      case 'medium': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300';
      case 'low': return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
      default: return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300';
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString().slice(-2);
    
    return `${day}.${month}.${year}`;
  };

  const regularEvents = events.filter(event => 
    event.goalId === goal.id && event.title !== 'День выполнения'
  );
  
  const completedEvents = regularEvents.filter(e => e.completed).length;
  const totalEvents = regularEvents.length;

  return (
    <div className={cn(
      "border border-border dark:border-dark-border rounded-lg overflow-hidden mb-2 transition-all duration-200 bg-white dark:bg-dark-surface",
      isExpanded ? "shadow-sm" : "hover:border-border-light dark:hover:border-dark-border-light"
    )}>
      {/* Заголовок цели - компактный */}
      <div 
        className="p-3 cursor-pointer"
        onClick={onToggleExpand}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start flex-1 min-w-0">
            {/* Чекбокс */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleComplete();
              }}
              className={cn(
                "w-5 h-5 border rounded flex-shrink-0 flex items-center justify-center mr-2 mt-0.5 transition-colors",
                goal.completed 
                  ? "bg-primary dark:bg-dark-primary border-primary dark:border-dark-primary" 
                  : "border-border dark:border-dark-border hover:border-primary dark:hover:border-dark-primary"
              )}
            >
              {goal.completed && (
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
            
            {/* Основная информация */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h3 className={cn(
                  "text-sm font-medium truncate",
                  goal.completed ? "text-text-secondary dark:text-dark-text-secondary line-through" : "text-text-primary dark:text-dark-text-primary"
                )}>
                  {goal.title}
                </h3>
                <span className={cn(
                  "px-2 py-0.5 rounded-full text-xs font-medium ml-2 flex-shrink-0",
                  getPriorityColor(goal.priority)
                )}>
                  {goal.priority === 'high' ? 'В' : goal.priority === 'medium' ? 'С' : 'Н'}
                </span>
              </div>
              
              {/* Описание (только если есть) */}
              {goal.description && (
                <p className="text-xs text-text-secondary dark:text-dark-text-secondary mb-2 line-clamp-1">
                  {goal.description}
                </p>
              )}
              
              {/* Прогресс бар и даты */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {/* Прогресс бар - мини */}
                  <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                    <div 
                      className="bg-primary dark:bg-dark-primary h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-text-secondary dark:text-dark-text-secondary">{goal.progress}%</span>
                </div>
                
                {/* Даты в формате 01.01.25 */}
                <div className="flex items-center text-xs text-text-secondary dark:text-dark-text-secondary">
                  <div className="flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="font-medium">{formatDate(goal.startDate)} - {formatDate(goal.deadline)}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Стрелка */}
            <svg 
              className={cn(
                "w-5 h-5 text-text-secondary dark:text-dark-text-secondary ml-2 flex-shrink-0 transition-transform duration-300 mt-0.5",
                isExpanded ? "rotate-180" : ""
              )}
              fill="none" 
              stroke="currentColor" 
              strokeWidth={2} 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </div>
        </div>
        
        {/* Категория и события */}
        <div className="flex items-center justify-between mt-2 text-xs">
          <span className="px-2 py-0.5 bg-surface dark:bg-dark-surface text-text-secondary dark:text-dark-text-secondary rounded">
            {goal.category}
          </span>
          <div className="flex items-center space-x-2">
            {totalEvents > 0 && (
              <div className="flex items-center">
                <svg className="w-3 h-3 mr-1 text-text-secondary dark:text-dark-text-secondary" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.801 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.801 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                </svg>
                <span className="text-text-secondary dark:text-dark-text-secondary">{completedEvents}/{totalEvents}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Раскрывающаяся часть с календарем */}
      {isExpanded && (
        <div className="animate-fade-in">
          <GoalCalendar
            goal={goal}
            events={events}
            onEventSave={onEventSave}
            onEventDelete={onEventDelete}
            onEventToggleComplete={onEventToggleComplete}
            onDeleteGoal={onDeleteGoal}
          />
        </div>
      )}
    </div>
  );
};

export default GoalItemCompact;