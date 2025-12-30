import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { useAuth } from './AuthContext'
import { goalsApi, GoalWithCategory } from '../lib/db/goals'
import { eventsApi, CalendarEventWithGoal } from '../lib/db/events'
import { 
  Goal, 
  GoalInsert, 
  GoalUpdate, 
  CalendarEvent, 
  CalendarEventInsert, 
  CalendarEventUpdate,
  GoalCategory 
} from '../types/database.types'

// Типы для контекста
export interface GoalContextType {
  // Данные
  goals: Goal[]
  events: CalendarEvent[]
  categories: GoalCategory[]
  goalsWithCategories: GoalWithCategory[]
  
  // Состояние
  loading: boolean
  error: string | null
  
  // Операции с целями
  addGoal: (goalData: Omit<GoalInsert, 'user_id' | 'progress' | 'completed' | 'is_expanded'>) => Promise<Goal>
  updateGoal: (id: string, updates: GoalUpdate) => Promise<Goal>
  deleteGoal: (id: string) => Promise<void>
  toggleGoalComplete: (id: string) => Promise<void>
  
  // Операции с событиями
  addEvent: (eventData: Omit<CalendarEventInsert, 'user_id'>) => Promise<CalendarEvent>
  updateEvent: (id: string, updates: CalendarEventUpdate) => Promise<CalendarEvent>
  deleteEvent: (id: string) => Promise<void>
  toggleEventComplete: (id: string) => Promise<void>
  toggleCompletionDay: (goalId: string, date: string, title: string) => Promise<'created' | 'deleted'>
  
  // Вспомогательные методы
  getEventsByGoal: (goalId: string) => CalendarEvent[]
  getEventsByDate: (date: string) => CalendarEvent[]
  getRegularEventsByGoal: (goalId: string) => CalendarEvent[]
  getCompletionDays: (goalId: string) => number
  calculateGoalProgress: (goalId: string) => number
  findCompletionDay: (goalId: string, date: string) => CalendarEvent | undefined
  isCompletionDayEvent: (event: CalendarEvent) => boolean
  
  // Обновление данных
  refreshGoals: () => Promise<void>
  refreshEvents: () => Promise<void>
  refreshAll: () => Promise<void>
}

// Создаем контекст
const GoalsContext = createContext<GoalContextType | undefined>(undefined)

// Провайдер
interface GoalsProviderProps {
  children: ReactNode
}

export const GoalsProvider: React.FC<GoalsProviderProps> = ({ children }) => {
  const { user } = useAuth()
  const [goals, setGoals] = useState<Goal[]>([])
  const [goalsWithCategories, setGoalsWithCategories] = useState<GoalWithCategory[]>([])
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [categories, setCategories] = useState<GoalCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Загрузка всех данных
  const loadAllData = useCallback(async () => {
    if (!user) {
      setGoals([])
      setGoalsWithCategories([])
      setEvents([])
      setCategories([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Параллельная загрузка данных
      const [categoriesData, goalsData, eventsData] = await Promise.all([
        goalsApi.getCategories(),
        goalsApi.getGoals(user.id),
        eventsApi.getEventsInRange(
          user.id,
          new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1).toISOString().split('T')[0],
          new Date(new Date().getFullYear(), new Date().getMonth() + 2, 0).toISOString().split('T')[0]
        )
      ])

      setCategories(categoriesData)
      setGoalsWithCategories(goalsData)
      setGoals(goalsData.map(goal => ({
        id: goal.id,
        user_id: goal.user_id,
        title: goal.title,
        description: goal.description,
        category_id: goal.category_id,
        custom_category: goal.custom_category,
        progress: goal.progress,
        start_date: goal.start_date,
        deadline: goal.deadline,
        priority: goal.priority,
        completed: goal.completed,
        is_expanded: goal.is_expanded,
        created_at: goal.created_at,
        updated_at: goal.updated_at
      })))
      setEvents(eventsData)
    } catch (err: any) {
      console.error('Ошибка при загрузке данных:', err)
      setError(err.message || 'Ошибка при загрузке данных')
    } finally {
      setLoading(false)
    }
  }, [user])

  // Загрузка данных при изменении пользователя
  useEffect(() => {
    loadAllData()
  }, [loadAllData])

  // Добавление цели
  const addGoal = useCallback(async (goalData: Omit<GoalInsert, 'user_id' | 'progress' | 'completed' | 'is_expanded'>): Promise<Goal> => {
    if (!user) throw new Error('Пользователь не авторизован')

    try {
      const newGoal = await goalsApi.createGoal({
        ...goalData,
        user_id: user.id,
        progress: 0,
        completed: false,
        is_expanded: false,
      })

      await loadAllData() // Перезагружаем данные
      return newGoal
    } catch (err: any) {
      console.error('Ошибка при добавлении цели:', err)
      throw err
    }
  }, [user, loadAllData])

  // Обновление цели
  const updateGoal = useCallback(async (id: string, updates: GoalUpdate): Promise<Goal> => {
    try {
      const updatedGoal = await goalsApi.updateGoal(id, updates)
      
      // Обновляем локальное состояние
      setGoals(prev => prev.map(goal => 
        goal.id === id ? updatedGoal : goal
      ))
      setGoalsWithCategories(prev => prev.map(goal => 
        goal.id === id ? { ...goal, ...updatedGoal } : goal
      ))

      return updatedGoal
    } catch (err: any) {
      console.error('Ошибка при обновлении цели:', err)
      throw err
    }
  }, [])

  // Удаление цели
  const deleteGoal = useCallback(async (id: string): Promise<void> => {
    try {
      await goalsApi.deleteGoal(id)
      
      // Обновляем локальное состояние
      setGoals(prev => prev.filter(goal => goal.id !== id))
      setGoalsWithCategories(prev => prev.filter(goal => goal.id !== id))
      setEvents(prev => prev.filter(event => event.goal_id !== id))
    } catch (err: any) {
      console.error('Ошибка при удалении цели:', err)
      throw err
    }
  }, [])

  // Переключение статуса выполнения цели
  const toggleGoalComplete = useCallback(async (id: string): Promise<void> => {
    const goal = goals.find(g => g.id === id)
    if (!goal) return

    await updateGoal(id, { completed: !goal.completed })
  }, [goals, updateGoal])

  // Добавление события
  const addEvent = useCallback(async (eventData: Omit<CalendarEventInsert, 'user_id'>): Promise<CalendarEvent> => {
    if (!user) throw new Error('Пользователь не авторизован')

    try {
      const newEvent = await eventsApi.createEvent({
        ...eventData,
        user_id: user.id,
      })

      // Добавляем в локальное состояние
      setEvents(prev => [...prev, newEvent])
      return newEvent
    } catch (err: any) {
      console.error('Ошибка при добавлении события:', err)
      throw err
    }
  }, [user])

  // Обновление события
  const updateEvent = useCallback(async (id: string, updates: CalendarEventUpdate): Promise<CalendarEvent> => {
    try {
      const updatedEvent = await eventsApi.updateEvent(id, updates)
      
      // Обновляем локальное состояние
      setEvents(prev => prev.map(event => 
        event.id === id ? updatedEvent : event
      ))

      return updatedEvent
    } catch (err: any) {
      console.error('Ошибка при обновлении события:', err)
      throw err
    }
  }, [])

  // Удаление события
  const deleteEvent = useCallback(async (id: string): Promise<void> => {
    try {
      await eventsApi.deleteEvent(id)
      
      // Обновляем локальное состояние
      setEvents(prev => prev.filter(event => event.id !== id))
    } catch (err: any) {
      console.error('Ошибка при удалении события:', err)
      throw err
    }
  }, [])

  // Переключение статуса выполнения события
  const toggleEventComplete = useCallback(async (id: string): Promise<void> => {
    const event = events.find(e => e.id === id)
    if (!event) return

    await updateEvent(id, { completed: !event.completed })
  }, [events, updateEvent])

  // Переключение дня выполнения
  const toggleCompletionDay = useCallback(async (goalId: string, date: string, title: string): Promise<'created' | 'deleted'> => {
    if (!user) throw new Error('Пользователь не авторизован')

    try {
      const result = await eventsApi.toggleCompletionDay(goalId, date, user.id, title)
      
      // Перезагружаем данные для обновления прогресса
      await loadAllData()
      return result
    } catch (err: any) {
      console.error('Ошибка при переключении дня выполнения:', err)
      throw err
    }
  }, [user, loadAllData])

  // Вспомогательные методы
  const getEventsByGoal = useCallback((goalId: string): CalendarEvent[] => {
    return events.filter(event => event.goal_id === goalId)
  }, [events])

  const getEventsByDate = useCallback((date: string): CalendarEvent[] => {
    return events.filter(event => event.date === date)
  }, [events])

  const getRegularEventsByGoal = useCallback((goalId: string): CalendarEvent[] => {
    return events.filter(event => 
      event.goal_id === goalId && event.event_type !== 'completion'
    )
  }, [events])

  const getCompletionDays = useCallback((goalId: string): number => {
    const goal = goals.find(g => g.id === goalId)
    if (!goal) return 0

    const startDate = new Date(goal.start_date)
    const endDate = new Date(goal.deadline)
    
    // Считаем уникальные дни выполнения в рамках цели
    const completionDays = events
      .filter(event => 
        event.goal_id === goalId && 
        event.event_type === 'completion' &&
        new Date(event.date) >= startDate &&
        new Date(event.date) <= endDate
      )
      .map(event => event.date)
    
    const uniqueDates = new Set<string>();
      completionDays.forEach(date => uniqueDates.add(date));
      return uniqueDates.size;
  }, [goals, events])

  const calculateGoalProgress = useCallback((goalId: string): number => {
    const goal = goals.find(g => g.id === goalId)
    if (!goal) return 0

    const startDate = new Date(goal.start_date)
    const endDate = new Date(goal.deadline)
    
    const totalDays = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    ) + 1
    
    if (totalDays <= 0) return 0
    
    const completionDays = getCompletionDays(goalId)
    const progress = Math.round((completionDays / totalDays) * 100)
    
    return Math.max(0, Math.min(progress, 100))
  }, [goals, getCompletionDays])

  const findCompletionDay = useCallback((goalId: string, date: string): CalendarEvent | undefined => {
    return events.find(event => 
      event.goal_id === goalId && 
      event.date === date && 
      event.event_type === 'completion'
    )
  }, [events])

  const isCompletionDayEvent = useCallback((event: CalendarEvent): boolean => {
    return event.event_type === 'completion'
  }, [])

  // Методы обновления данных
  const refreshGoals = useCallback(async () => {
    if (!user) return
    try {
      const goalsData = await goalsApi.getGoals(user.id)
      setGoalsWithCategories(goalsData)
      setGoals(goalsData.map(goal => ({
        id: goal.id,
        user_id: goal.user_id,
        title: goal.title,
        description: goal.description,
        category_id: goal.category_id,
        custom_category: goal.custom_category,
        progress: goal.progress,
        start_date: goal.start_date,
        deadline: goal.deadline,
        priority: goal.priority,
        completed: goal.completed,
        is_expanded: goal.is_expanded,
        created_at: goal.created_at,
        updated_at: goal.updated_at
      })))
    } catch (err: any) {
      console.error('Ошибка при обновлении целей:', err)
      throw err
    }
  }, [user])

  const refreshEvents = useCallback(async () => {
    if (!user) return
    try {
      const eventsData = await eventsApi.getEventsInRange(
        user.id,
        new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1).toISOString().split('T')[0],
        new Date(new Date().getFullYear(), new Date().getMonth() + 2, 0).toISOString().split('T')[0]
      )
      setEvents(eventsData)
    } catch (err: any) {
      console.error('Ошибка при обновлении событий:', err)
      throw err
    }
  }, [user])

  const refreshAll = useCallback(async () => {
    await loadAllData()
  }, [loadAllData])

  // Значение контекста
  const value: GoalContextType = {
    // Данные
    goals,
    events,
    categories,
    goalsWithCategories,
    
    // Состояние
    loading,
    error,
    
    // Операции с целями
    addGoal,
    updateGoal,
    deleteGoal,
    toggleGoalComplete,
    
    // Операции с событиями
    addEvent,
    updateEvent,
    deleteEvent,
    toggleEventComplete,
    toggleCompletionDay,
    
    // Вспомогательные методы
    getEventsByGoal,
    getEventsByDate,
    getRegularEventsByGoal,
    getCompletionDays,
    calculateGoalProgress,
    findCompletionDay,
    isCompletionDayEvent,
    
    // Обновление данных
    refreshGoals,
    refreshEvents,
    refreshAll,
  }

  return (
    <GoalsContext.Provider value={value}>
      {children}
    </GoalsContext.Provider>
  )
}

// Хук для использования контекста
export const useGoals = () => {
  const context = useContext(GoalsContext)
  if (context === undefined) {
    throw new Error('useGoals must be used within a GoalsProvider')
  }
  return context
}