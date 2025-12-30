// src/lib/db/index.ts
import { supabase } from '../supabase';

export const deleteAllUserData = async (userId: string): Promise<void> => {
  try {
    console.log(`Удаление всех данных для пользователя: ${userId}`);
    
    // 1. Удаляем события календаря
    console.log('Удаляем события календаря...');
    const { error: eventsError } = await supabase
      .from('calendar_events')
      .delete()
      .eq('user_id', userId);

    if (eventsError) {
      console.error('Ошибка при удалении событий:', eventsError);
      throw new Error(`Ошибка удаления событий: ${eventsError.message}`);
    }

    // 2. Удаляем цели
    console.log('Удаляем цели...');
    const { error: goalsError } = await supabase
      .from('goals')
      .delete()
      .eq('user_id', userId);

    if (goalsError) {
      console.error('Ошибка при удалении целей:', goalsError);
      throw new Error(`Ошибка удаления целей: ${goalsError.message}`);
    }

    // 3. Сбрасываем настройки к дефолтным (не удаляем, а обновляем)
    console.log('Сбрасываем настройки...');
    const { error: settingsError } = await supabase
      .from('user_settings')
      .update({
        theme: 'auto',
        notifications_enabled: true,
        week_starts_on_monday: true,
        daily_reminder_time: '20:00',
        weekly_report: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (settingsError) {
      console.warn('Не удалось сбросить настройки:', settingsError.message);
      // Игнорируем ошибку, так как настроек может не быть
    }

    // 4. Очищаем дополнительные поля профиля (основной профиль сохраняем)
    console.log('Очищаем дополнительные поля профиля...');
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        name: null,
        avatar_url: null,
        timezone: 'UTC',
        language: 'ru',
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (profileError) {
      console.warn('Не удалось очистить профиль:', profileError.message);
      // Игнорируем ошибку, профиль может быть защищен политиками
    }

    console.log('✅ Все данные пользователя успешно удалены');
    
  } catch (error: any) {
    console.error('❌ Ошибка при удалении данных:', error);
    throw error;
  }
};