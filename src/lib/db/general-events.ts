// src/lib/db/general-events.ts
import { supabase } from '../supabase';
import { 
  GeneralCalendarEvent, 
  GeneralCalendarEventInsert, 
  GeneralCalendarEventUpdate 
} from '../../types/database.types';

export const generalEventsApi = {
  // Получить все общие события пользователя
  async getEvents(userId: string): Promise<GeneralCalendarEvent[]> {
    const { data, error } = await supabase
      .from('general_calendar_events')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  // Получить события в диапазоне дат
  async getEventsInRange(userId: string, startDate: string, endDate: string): Promise<GeneralCalendarEvent[]> {
    const { data, error } = await supabase
      .from('general_calendar_events')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  // Создать новое общее событие
  async createEvent(event: GeneralCalendarEventInsert): Promise<GeneralCalendarEvent> {
    const { data, error } = await supabase
      .from('general_calendar_events')
      .insert(event)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Обновить общее событие
  async updateEvent(id: string, updates: GeneralCalendarEventUpdate): Promise<GeneralCalendarEvent> {
    const { data, error } = await supabase
      .from('general_calendar_events')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Удалить общее событие
  async deleteEvent(id: string): Promise<void> {
    const { error } = await supabase
      .from('general_calendar_events')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Переключить статус выполнения
  async toggleComplete(id: string): Promise<GeneralCalendarEvent> {
    // Сначала получим текущее состояние
    const { data: event } = await supabase
      .from('general_calendar_events')
      .select('completed')
      .eq('id', id)
      .single();

    if (!event) throw new Error('Event not found');

    // Обновим статус
    const { data, error } = await supabase
      .from('general_calendar_events')
      .update({
        completed: !event.completed,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};