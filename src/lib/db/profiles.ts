// src/lib/db/profiles.ts
import { supabase } from '../supabase';
import { Profile } from '../../types/database.types';

export const profilesApi = {
  // Получить профиль пользователя
  async getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Ошибка при получении профиля:', error);
      return null;
    }

    return data;
  },

  // Создать или обновить профиль
  async upsertProfile(profile: {
    id: string;
    email: string;
    name?: string | null;
    avatar_url?: string | null;
    timezone?: string;
    language?: string;
  }): Promise<Profile> {
    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        ...profile,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Ошибка при сохранении профиля:', error);
      throw error;
    }

    return data;
  },

  // Обновить имя пользователя
  async updateName(userId: string, name: string): Promise<Profile> {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        name,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Ошибка при обновлении имени:', error);
      throw error;
    }

    return data;
  },
};