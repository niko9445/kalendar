import { supabase } from '../supabase'
import { 
  CalendarEvent, 
  CalendarEventInsert, 
  CalendarEventUpdate,
  Goal 
} from '../../types/database.types'

// Расширенный тип события с информацией о цели
export type CalendarEventWithGoal = CalendarEvent & {
  goal: Pick<Goal, 'title' | 'category_id'>
}

export const eventsApi = {
  // Получить события по цели
  async getEventsByGoal(goalId: string): Promise<CalendarEvent[]> {
    const { data, error } = await supabase
      .from('calendar_events')
      .select('*')
      .eq('goal_id', goalId)
      .order('date', { ascending: true })

    if (error) {
      console.error('Ошибка при получении событий цели:', error)
      throw error
    }

    return data || []
  },

  // Получить события по дате
  async getEventsByDate(userId: string, date: string): Promise<CalendarEventWithGoal[]> {
    const { data, error } = await supabase
      .from('calendar_events')
      .select(`
        *,
        goal:goals(title, category_id)
      `)
      .eq('user_id', userId)
      .eq('date', date)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Ошибка при получении событий по дате:', error)
      throw error
    }

    return data || []
  },

  // Получить события в диапазоне дат
  async getEventsInRange(userId: string, startDate: string, endDate: string): Promise<CalendarEvent[]> {
    const { data, error } = await supabase
      .from('calendar_events')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true })

    if (error) {
      console.error('Ошибка при получении событий в диапазоне:', error)
      throw error
    }

    return data || []
  },

  // Создать событие
  async createEvent(eventData: CalendarEventInsert): Promise<CalendarEvent> {
    const { data, error } = await supabase
      .from('calendar_events')
      .insert(eventData)
      .select()
      .single()

    if (error) {
      console.error('Ошибка при создании события:', error)
      throw error
    }

    return data
  },

  // Обновить событие
  async updateEvent(id: string, updates: CalendarEventUpdate): Promise<CalendarEvent> {
    const { data, error } = await supabase
      .from('calendar_events')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Ошибка при обновлении события:', error)
      throw error
    }

    return data
  },

  // Удалить событие
  async deleteEvent(id: string): Promise<void> {
    const { error } = await supabase
      .from('calendar_events')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Ошибка при удалении события:', error)
      throw error
    }
  },

  // Переключить день выполнения
  async toggleCompletionDay(
    goalId: string, 
    date: string, 
    userId: string, 
    title: string
  ): Promise<'created' | 'deleted'> {
    // Проверяем, существует ли уже день выполнения
    const { data: existingEvent } = await supabase
      .from('calendar_events')
      .select('id')
      .eq('goal_id', goalId)
      .eq('date', date)
      .eq('event_type', 'completion')
      .maybeSingle()

    if (existingEvent) {
      // Удаляем день выполнения
      await this.deleteEvent(existingEvent.id)
      return 'deleted'
    } else {
      // Создаем день выполнения
      const completionDayId = `completion-${goalId}-${date}`
      
      const newEvent: CalendarEventInsert = {
        goal_id: goalId,
        user_id: userId,
        title,
        description: '',
        date,
        color: '#3b82f6',
        event_type: 'completion',
        completed: true,
        amount: null,
        currency: 'RUB',
        is_completion_day: true,
        completion_day_id: completionDayId,
      }

      await this.createEvent(newEvent)
      return 'created'
    }
  },

  // Получить дни выполнения цели
  async getCompletionDays(goalId: string, startDate: string, endDate: string): Promise<number> {
    const { data, error } = await supabase
      .from('calendar_events')
      .select('date')
      .eq('goal_id', goalId)
      .eq('event_type', 'completion')
      .gte('date', startDate)
      .lte('date', endDate)

    if (error) {
      console.error('Ошибка при получении дней выполнения:', error)
      throw error
    }

    // Уникальные даты
    const uniqueDates = new Set(data?.map(event => event.date) || [])
    return uniqueDates.size
  },

  // Получить количество выполненных событий по цели
  async getCompletedEventsCount(goalId: string): Promise<number> {
    const { count, error } = await supabase
      .from('calendar_events')
      .select('*', { count: 'exact', head: true })
      .eq('goal_id', goalId)
      .eq('completed', true)
      .neq('event_type', 'completion')

    if (error) {
      console.error('Ошибка при подсчете выполненных событий:', error)
      throw error
    }

    return count || 0
  },

  // Получить общее количество событий по цели
  async getTotalEventsCount(goalId: string): Promise<number> {
    const { count, error } = await supabase
      .from('calendar_events')
      .select('*', { count: 'exact', head: true })
      .eq('goal_id', goalId)
      .neq('event_type', 'completion')

    if (error) {
      console.error('Ошибка при подсчете событий:', error)
      throw error
    }

    return count || 0
  }
}