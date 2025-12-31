/**
 * Утилита для полной очистки данных аутентификации Supabase
 * Используйте эту функцию при проблемах с сессиями, сбросом пароля и т.д.
 */

import { supabase } from '../lib/supabase';

/**
 * Полная агрессивная очистка всех данных аутентификации
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const hardAuthReset = async (): Promise<{success: boolean, message: string}> => {
  console.log('🔄 [authCleanup] Запуск полной очистки аутентификации...');
  
  try {
    // 1. Выходим из системы через Supabase
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) {
      console.log('⚠️ Ошибка при выходе из Supabase:', signOutError.message);
    }
    
    // 2. Агрессивная очистка localStorage
    const localStorageKeys = Object.keys(localStorage);
    let clearedLocalStorage = 0;
    
    localStorageKeys.forEach(key => {
      // Удаляем ВСЕ связанное с аутентификацией
      if (
        key.includes('supabase') || 
        key.includes('sb-') || 
        key.includes('auth') ||
        key.startsWith('supabase.') ||
        key.includes('supabase_auth') ||
        key.includes('-auth-') ||
        key.includes('.auth.') ||
        key.includes('sb_') ||
        /^sb-[a-z0-9]+-auth-token$/.test(key) ||
        key.includes('storage')
      ) {
        localStorage.removeItem(key);
        clearedLocalStorage++;
      }
    });
    console.log(`✅ Очищено ${clearedLocalStorage} записей в localStorage`);
    
    // 3. Полная очистка sessionStorage
    sessionStorage.clear();
    console.log('✅ sessionStorage полностью очищен');
    
    // 4. Очистка кук
    const cookies = document.cookie.split(';');
    let clearedCookies = 0;
    
    cookies.forEach(cookie => {
      const eqPos = cookie.indexOf('=');
      const cookieName = eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim();
      
      // Удаляем все куки Supabase
      if (
        cookieName.includes('sb-') || 
        cookieName.includes('supabase') ||
        cookieName.startsWith('sb_') ||
        cookieName.includes('auth')
      ) {
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
        clearedCookies++;
      }
    });
    console.log(`✅ Очищено ${clearedCookies} куки`);
    
    // 5. Очистка IndexedDB (если используется)
    if ('indexedDB' in window) {
      try {
        const databases = await window.indexedDB.databases();
        for (const db of databases) {
          if (db.name && (db.name.includes('supabase') || db.name.includes('sb-'))) {
            window.indexedDB.deleteDatabase(db.name);
            console.log(`🗑️ Удалена IndexedDB: ${db.name}`);
          }
        }
      } catch (idbError) {
        console.log('⚠️ Не удалось очистить IndexedDB:', idbError);
      }
    }
    
    // 6. Очистка кэша Service Worker
    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => {
            console.log(`🗑️ Удаляем кэш: ${cacheName}`);
            return caches.delete(cacheName);
          })
        );
        console.log('✅ Service Worker кэш очищен');
      } catch (cacheError) {
        console.log('⚠️ Не удалось очистить кэш:', cacheError);
      }
    }
    
    // 7. Принудительное обновление страницы через 100мс
    setTimeout(() => {
      console.log('🔄 Принудительное обновление страницы...');
      window.location.href = '/login?cleanup=success';
    }, 100);
    
    return {
      success: true,
      message: `Очистка завершена: ${clearedLocalStorage} localStorage, ${clearedCookies} куки`
    };
    
  } catch (error: any) {
    console.error('❌ [authCleanup] Критическая ошибка при очистке:', error);
    
    // Даже при ошибке - редиректим на логин
    setTimeout(() => {
      window.location.href = '/login?cleanup=error';
    }, 100);
    
    return {
      success: false,
      message: error.message || 'Неизвестная ошибка при очистке'
    };
  }
};

/**
 * Быстрая очистка (только выход и localStorage)
 */
export const quickAuthReset = async (): Promise<void> => {
  console.log('⚡ [authCleanup] Быстрая очистка...');
  
  try {
    await supabase.auth.signOut();
    
    // Быстрая очистка основных ключей
    const keysToRemove = [
      'supabase.auth.token',
      'supabase.auth.refresh_token',
      'sb-auth-token',
      'sb-auth-refresh-token'
    ];
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
    });
    
    // Удаляем по паттерну
    Object.keys(localStorage).forEach(key => {
      if (key.includes('sb-') || key.startsWith('supabase')) {
        localStorage.removeItem(key);
      }
    });
    
  } catch (error) {
    console.log('⚠️ Ошибка быстрой очистки:', error);
  }
};

/**
 * Проверка наличия активной сессии с очисткой если нужно
 */
export const checkAndCleanSession = async (): Promise<boolean> => {
  console.log('🔍 [authCleanup] Проверка сессии...');
  
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.user) {
      console.log(`⚠️ Обнаружена активная сессия: ${session.user.email}`);
      console.log('🔄 Выполняем очистку...');
      
      await quickAuthReset();
      return true; // Была сессия и очищена
    }
    
    console.log('✅ Активных сессий не обнаружено');
    return false; // Сессии не было
    
  } catch (error) {
    console.log('❌ Ошибка при проверке сессии:', error);
    return false;
  }
};