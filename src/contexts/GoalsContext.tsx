import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

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
  type: 'work' | 'personal' | 'health' | 'learning';
  completed: boolean;
  goalId: string;
  amount?: number; // НОВОЕ ПОЛЕ: сумма
  currency?: string; // НОВОЕ ПОЛЕ: валюта
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
  getEventsByGoal: (goalId: string) => CalendarEvent[];
  getRegularEventsByGoal: (goalId: string) => CalendarEvent[];
  getEventsByDate: (date: string) => CalendarEvent[];
  getCompletionDays: (goalId: string) => number;
  calculateGoalProgress: (goalId: string) => number;
}

const GoalsContext = createContext<GoalsContextType | undefined>(undefined);

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
    return saved ? JSON.parse(saved) : [];
  });

  // Сохраняем в localStorage при изменении
  useEffect(() => {
    localStorage.setItem('goals', JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem('calendarEvents', JSON.stringify(events));
  }, [events]);

  // Функция для подсчета дней выполнения
  const getCompletionDays = useCallback((goalId: string): number => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return 0;

    const startDate = new Date(goal.startDate);
    const endDate = new Date(goal.deadline);
    
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);

    return events.filter(event => {
      if (event.goalId !== goalId || event.title !== 'День выполнения') {
        return false;
      }
      
      const eventDate = new Date(event.date);
      eventDate.setHours(0, 0, 0, 0);
      
      return eventDate >= startDate && eventDate <= endDate;
    }).length;
  }, [events, goals]);

  // Функция для расчета прогресса цели на основе дней выполнения
  const calculateGoalProgress = useCallback((goalId: string, currentGoals: Goal[]): number => {
    const goal = currentGoals.find(g => g.id === goalId);
    if (!goal) return 0;

    const startDate = new Date(goal.startDate);
    const endDate = new Date(goal.deadline);
    
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);
    
    // Количество дней ВСЕГО в периоде цели
    const totalDays = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    ) + 1;
    
    if (totalDays <= 0 || isNaN(totalDays)) return 0;
    
    // Получаем дни выполнения
    const completionDays = getCompletionDays(goalId);
    
    // Рассчитываем прогресс
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

  // Обновляем прогресс ТОЛЬКО при изменении событий
  useEffect(() => {
    updateAllGoalsProgress();
  }, [events]); // Только events, не добавляем updateAllGoalsProgress в зависимости

  // Обновляем прогресс при изменении дат целей
  useEffect(() => {
    updateAllGoalsProgress();
  }, [goals.map(g => `${g.startDate}-${g.deadline}`).join('|')]);

  // Цели
  const addGoal = (goalData: Omit<Goal, 'id' | 'progress' | 'completed' | 'isExpanded'>) => {
    const newGoal: Goal = {
      ...goalData,
      id: Date.now().toString(),
      progress: 0,
      completed: false,
      isExpanded: false,
    };
    setGoals(prev => [...prev, newGoal]);
  };

  const updateGoal = (id: string, updates: Partial<Goal>) => {
    setGoals(prev => prev.map(goal => 
      goal.id === id ? { ...goal, ...updates } : goal
    ));
  };

  const deleteGoal = (id: string) => {
    setGoals(prev => prev.filter(goal => goal.id !== id));
    setEvents(prev => prev.filter(event => event.goalId !== id));
  };

  const toggleGoalComplete = (id: string) => {
    setGoals(prev => prev.map(goal => 
      goal.id === id ? { ...goal, completed: !goal.completed } : goal
    ));
  };

  // События
  const addEvent = (eventData: Omit<CalendarEvent, 'id'>) => {
    const newEvent: CalendarEvent = {
      ...eventData,
      id: Date.now().toString(),
    };
    setEvents(prev => [...prev, newEvent]);
  };

  const updateEvent = (id: string, updates: Partial<CalendarEvent>) => {
    setEvents(prev => prev.map(event => 
      event.id === id ? { ...event, ...updates } : event
    ));
  };

  const deleteEvent = (eventId: string) => {
    setEvents(prev => prev.filter(event => event.id !== eventId));
  };

  const toggleEventComplete = (eventId: string) => {
    setEvents(prev => prev.map(event => {
      if (event.id === eventId) {
        return { ...event, completed: !event.completed };
      }
      return event;
    }));
  };

  // Вспомогательные функции
  const getEventsByGoal = (goalId: string) => {
    return events.filter(event => event.goalId === goalId);
  };

  const getRegularEventsByGoal = (goalId: string) => {
    return events.filter(event => 
      event.goalId === goalId && event.title !== 'День выполнения'
    );
  };

  const getEventsByDate = (date: string) => {
    return events.filter(event => event.date === date);
  };

  const value = {
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
    getEventsByGoal,
    getRegularEventsByGoal,
    getEventsByDate,
    getCompletionDays,
    calculateGoalProgress: (goalId: string) => calculateGoalProgress(goalId, goals),
  };

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