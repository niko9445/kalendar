import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

export interface Goal {
  id: string;
  title: string;
  description: string;
  category: string;
  progress: number;
  startDate: string;
  deadline: string;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
  isExpanded?: boolean;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  color: string;
  type: 'work' | 'personal' | 'health' | 'learning' | 'completion';
  completed: boolean;
  goalId: string;
  amount?: number;
  currency?: string;
  isCompletionDay?: boolean;
  completionDayId?: string;
}

interface GoalsContextType {
  goals: Goal[];
  events: CalendarEvent[];
  addGoal: (goal: Omit<Goal, 'id' | 'progress' | 'completed' | 'isExpanded'>) => void;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  toggleGoalComplete: (id: string) => void;
  addEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  updateEvent: (id: string, updates: Partial<CalendarEvent>) => void;
  deleteEvent: (eventId: string) => void;
  toggleEventComplete: (eventId: string) => void;
  toggleCompletionDay: (goalId: string, date: string, completionDayTitle: string) => void;
  getEventsByGoal: (goalId: string) => CalendarEvent[];
  getRegularEventsByGoal: (goalId: string) => CalendarEvent[];
  getEventsByDate: (date: string) => CalendarEvent[];
  getCompletionDays: (goalId: string) => number;
  calculateGoalProgress: (goalId: string) => number;
  isCompletionDayEvent: (event: CalendarEvent) => boolean;
  findCompletionDay: (goalId: string, date: string) => CalendarEvent | undefined;
}

const GoalsContext = createContext<GoalsContextType | undefined>(undefined);

const COMPLETION_DAY_TITLES = {
  ru: 'День выполнения',
  en: 'Completion Day'
} as const;

const generateCompletionDayId = (goalId: string, date: string): string => {
  return `completion-${goalId}-${date}`;
};

export const GoalsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [goals, setGoals] = useState<Goal[]>(() => {
    const saved = localStorage.getItem('goals');
    return saved ? JSON.parse(saved) : [
      {
        id: '1',
        title: 'Изучить React Native',
        description: 'Пройти полный курс по разработке мобильных приложений',
        category: 'Обучение',
        progress: 0,
        startDate: '2024-02-01',
        deadline: '2024-02-28',
        priority: 'high',
        completed: false,
        isExpanded: false,
      },
    ];
  });

  const [events, setEvents] = useState<CalendarEvent[]>(() => {
    const saved = localStorage.getItem('calendarEvents');
    const parsedEvents: CalendarEvent[] = saved ? JSON.parse(saved) : [];
    
    const migratedEvents = parsedEvents.map(event => {
      const isCompletionDay = event.title === COMPLETION_DAY_TITLES.ru || 
                              event.title === COMPLETION_DAY_TITLES.en ||
                              event.type === 'completion';
      
      if (isCompletionDay) {
        const completionDayId = generateCompletionDayId(event.goalId, event.date);
        
        return {
          ...event,
          type: 'completion' as const,
          color: '#3b82f6',
          completed: true,
          isCompletionDay: true,
          completionDayId,
        };
      }
      return event;
    });
    
    return migratedEvents;
  });

  const goalsDatesRef = useRef<string>('');

  // Сначала объявляем базовые функции, которые используются в других функциях
  const addEvent = useCallback((eventData: Omit<CalendarEvent, 'id'>) => {
    const newEvent: CalendarEvent = {
      ...eventData,
      id: Date.now().toString(),
    };
    setEvents(prev => [...prev, newEvent]);
  }, []);

  const deleteEvent = useCallback((eventId: string) => {
    setEvents(prev => prev.filter(event => event.id !== eventId));
  }, []);

  // Сохраняем в localStorage
  useEffect(() => {
    localStorage.setItem('goals', JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem('calendarEvents', JSON.stringify(events));
  }, [events]);

  // Функция для проверки, является ли событие днем выполнения
  const isCompletionDayEvent = useCallback((event: CalendarEvent): boolean => {
    return event.type === 'completion' || 
           event.isCompletionDay === true ||
           event.title === COMPLETION_DAY_TITLES.ru || 
           event.title === COMPLETION_DAY_TITLES.en;
  }, []);

  // Функция для поиска дня выполнения
  const findCompletionDay = useCallback((goalId: string, date: string): CalendarEvent | undefined => {
    const completionDayId = generateCompletionDayId(goalId, date);
    
    return events.find(event => 
      (event.completionDayId === completionDayId) ||
      (event.goalId === goalId && 
       event.date === date && 
       isCompletionDayEvent(event))
    );
  }, [events, isCompletionDayEvent]);

  // Функция для переключения дня выполнения (теперь она может использовать deleteEvent и addEvent)
  const toggleCompletionDay = useCallback((goalId: string, date: string, completionDayTitle: string) => {
    const existingEvent = findCompletionDay(goalId, date);
    
    if (existingEvent) {
      deleteEvent(existingEvent.id);
    } else {
      const completionDayId = generateCompletionDayId(goalId, date);
      
      const newEvent: Omit<CalendarEvent, 'id'> = {
        title: completionDayTitle,
        description: '',
        date,
        color: '#3b82f6',
        type: 'completion',
        completed: true,
        goalId,
        isCompletionDay: true,
        completionDayId,
      };
      
      addEvent(newEvent);
    }
  }, [findCompletionDay, deleteEvent, addEvent]);

  // Функция для подсчета дней выполнения
  const getCompletionDays = useCallback((goalId: string): number => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return 0;

    const startDate = new Date(goal.startDate);
    const endDate = new Date(goal.deadline);
    
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);

    const uniqueDates = new Set<string>();
    
    events.forEach(event => {
      if (event.goalId === goalId && isCompletionDayEvent(event)) {
        const eventDate = new Date(event.date);
        eventDate.setHours(0, 0, 0, 0);
        
        if (eventDate >= startDate && eventDate <= endDate) {
          uniqueDates.add(event.date);
        }
      }
    });

    return uniqueDates.size;
  }, [events, goals, isCompletionDayEvent]);

  // Функция для расчета прогресса цели
  const calculateGoalProgress = useCallback((goalId: string, currentGoals: Goal[]): number => {
    const goal = currentGoals.find(g => g.id === goalId);
    if (!goal) return 0;

    const startDate = new Date(goal.startDate);
    const endDate = new Date(goal.deadline);
    
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);
    
    const totalDays = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    ) + 1;
    
    if (totalDays <= 0 || isNaN(totalDays)) return 0;
    
    const completionDays = getCompletionDays(goalId);
    const progress = Math.round((completionDays / totalDays) * 100);
    
    return Math.max(0, Math.min(progress, 100));
  }, [getCompletionDays]);

  // Функция для обновления прогресса ВСЕХ целей
  const updateAllGoalsProgress = useCallback(() => {
    console.log('Updating progress for all goals...');
    
    setGoals(prev => {
      const updatedGoals = prev.map(goal => {
        const newProgress = calculateGoalProgress(goal.id, prev);
        console.log(`Goal ${goal.id}: ${newProgress}%`);
        return { ...goal, progress: newProgress };
      });
      return updatedGoals;
    });
  }, [calculateGoalProgress]);

  // Обновляем прогресс при изменении событий
  useEffect(() => {
    updateAllGoalsProgress();
  }, [events]);

  // Обновляем прогресс при изменении дат целей
  useEffect(() => {
    const currentGoalsDates = goals.map(g => `${g.startDate}-${g.deadline}`).join('|');
    
    if (goalsDatesRef.current !== currentGoalsDates) {
      goalsDatesRef.current = currentGoalsDates;
      updateAllGoalsProgress();
    }
  }, [goals, updateAllGoalsProgress]);

  // Остальные функции целей
  const addGoal = useCallback((goalData: Omit<Goal, 'id' | 'progress' | 'completed' | 'isExpanded'>) => {
    const newGoal: Goal = {
      ...goalData,
      id: Date.now().toString(),
      progress: 0,
      completed: false,
      isExpanded: false,
    };
    setGoals(prev => [...prev, newGoal]);
  }, []);

  const updateGoal = useCallback((id: string, updates: Partial<Goal>) => {
    setGoals(prev => prev.map(goal => 
      goal.id === id ? { ...goal, ...updates } : goal
    ));
  }, []);

  const deleteGoal = useCallback((id: string) => {
    setGoals(prev => prev.filter(goal => goal.id !== id));
    setEvents(prev => prev.filter(event => event.goalId !== id));
  }, []);

  const toggleGoalComplete = useCallback((id: string) => {
    setGoals(prev => prev.map(goal => 
      goal.id === id ? { ...goal, completed: !goal.completed } : goal
    ));
  }, []);

  const updateEvent = useCallback((id: string, updates: Partial<CalendarEvent>) => {
    setEvents(prev => prev.map(event => 
      event.id === id ? { ...event, ...updates } : event
    ));
  }, []);

  const toggleEventComplete = useCallback((eventId: string) => {
    setEvents(prev => prev.map(event => {
      if (event.id === eventId) {
        return { ...event, completed: !event.completed };
      }
      return event;
    }));
  }, []);

  // Вспомогательные функции
  const getEventsByGoal = useCallback((goalId: string) => {
    return events.filter(event => event.goalId === goalId);
  }, [events]);

  const getRegularEventsByGoal = useCallback((goalId: string) => {
    return events.filter(event => 
      event.goalId === goalId && !isCompletionDayEvent(event)
    );
  }, [events, isCompletionDayEvent]);

  const getEventsByDate = useCallback((date: string) => {
    return events.filter(event => event.date === date);
  }, [events]);

  const value = React.useMemo(() => ({
    goals,
    events,
    addGoal,
    updateGoal,
    deleteGoal,
    toggleGoalComplete,
    addEvent,
    updateEvent,
    deleteEvent,
    toggleEventComplete,
    toggleCompletionDay,
    getEventsByGoal,
    getRegularEventsByGoal,
    getEventsByDate,
    getCompletionDays,
    calculateGoalProgress: (goalId: string) => calculateGoalProgress(goalId, goals),
    isCompletionDayEvent,
    findCompletionDay,
  }), [
    goals,
    events,
    addGoal,
    updateGoal,
    deleteGoal,
    toggleGoalComplete,
    addEvent,
    updateEvent,
    deleteEvent,
    toggleEventComplete,
    toggleCompletionDay,
    getEventsByGoal,
    getRegularEventsByGoal,
    getEventsByDate,
    getCompletionDays,
    calculateGoalProgress,
    isCompletionDayEvent,
    findCompletionDay,
  ]);

  return (
    <GoalsContext.Provider value={value}>
      {children}
    </GoalsContext.Provider>
  );
};

export const useGoals = () => {
  const context = useContext(GoalsContext);
  if (context === undefined) {
    throw new Error('useGoals must be used within a GoalsProvider');
  }
  return context;
};