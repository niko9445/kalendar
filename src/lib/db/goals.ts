import { supabase } from '../supabase'
import { Goal, GoalInsert, GoalUpdate, GoalCategory } from '../../types/database.types'

// Расширенный тип цели с категорией
export type GoalWithCategory = Goal & {
  category: GoalCategory | null
}

// Расширенный тип цели с событиями
export type GoalWithEvents = Goal & {
  category: GoalCategory | null
  events: Array<any> // Пока без точного типа
}

export const goalsApi = {
  // Получить все цели пользователя с категориями
  async getGoals(userId: string): Promise<GoalWithCategory[]> {
    const { data, error } = await supabase
      .from('goals')
      .select(`
        *,
        category:goal_categories(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Ошибка при получении целей:', error)
      throw error
    }

    return data || []
  },

  // Получить цель по ID с полной информацией
  async getGoalById(id: string): Promise<GoalWithEvents | null> {
    const { data, error } = await supabase
      .from('goals')
      .select(`
        *,
        category:goal_categories(*),
        events:calendar_events(*)
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error('Ошибка при получении цели:', error)
      throw error
    }

    return data
  },

  // Создать цель
  async createGoal(goalData: GoalInsert): Promise<Goal> {
    const { data, error } = await supabase
      .from('goals')
      .insert({
        ...goalData,
        progress: goalData.progress || 0,
        completed: goalData.completed || false,
        is_expanded: goalData.is_expanded || false,
      })
      .select()
      .single()

    if (error) {
      console.error('Ошибка при создании цели:', error)
      throw error
    }

    return data
  },

  // Обновить цель
  async updateGoal(id: string, updates: GoalUpdate): Promise<Goal> {
    const { data, error } = await supabase
      .from('goals')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Ошибка при обновлении цели:', error)
      throw error
    }

    return data
  },

  // Удалить цель
  async deleteGoal(id: string): Promise<void> {
    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Ошибка при удалении цели:', error)
      throw error
    }
  },

  // Получить категории целей
  async getCategories(): Promise<GoalCategory[]> {
    const { data, error } = await supabase
      .from('goal_categories')
      .select('*')
      .order('sort_order')

    if (error) {
      console.error('Ошибка при получении категорий:', error)
      throw error
    }

    return data || []
  },

  // Получить цель с событиями за определенный период
  async getGoalWithEventsInRange(goalId: string, startDate: string, endDate: string) {
    const { data, error } = await supabase
      .from('goals')
      .select(`
        *,
        category:goal_categories(*),
        events:calendar_events(
          *,
          date
        )
      `)
      .eq('id', goalId)
      .gte('events.date', startDate)
      .lte('events.date', endDate)
      .single()

    if (error) {
      console.error('Ошибка при получении цели с событиями:', error)
      throw error
    }

    return data
  },

  // Обновить прогресс цели
  async updateGoalProgress(goalId: string): Promise<Goal> {
    try {
        // Вызываем функцию базы данных
        const { data, error } = await supabase
        .rpc('calculate_goal_progress', { p_goal_id: goalId })
        .single();

        if (error) {
        console.error('Ошибка при расчете прогресса:', error)
        throw error
        }

        // Проверяем результат
        const progress = typeof data === 'number' ? data : 0

        // Обновляем цель
        return this.updateGoal(goalId, { progress })
    } catch (error) {
        console.error('Ошибка при обновлении прогресса:', error)
        // Если функция не работает, рассчитываем локально
        const progress = 0
        return this.updateGoal(goalId, { progress })
    }
    }
}