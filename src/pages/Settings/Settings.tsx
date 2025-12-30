// src/pages/Settings/Settings.tsx
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useTranslation } from '../../i18n/hooks';
import Header from '../../components/Navigation/Header';
import BottomNav from '../../components/Navigation/BottomNav';
import LanguageSwitcher from '../../components/LanguageSwitcher/LanguageSwitcher';
import { cn } from '../../utils/cn';
import { deleteAllUserData } from '../../lib/db/index';

const Settings: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleLogout = () => {
    if (window.confirm(t('settings.logoutConfirm'))) {
      logout();
    }
  };

  const handleDeleteAllData = async () => {
    if (!user) {
      alert(t('settings.noUserError') || 'Пользователь не найден');
      return;
    }

    if (!window.confirm(t('settings.deleteAllConfirm'))) {
      return;
    }

    setIsDeleting(true);
    
    try {
      // Удаляем данные из Supabase
      await deleteAllUserData(user.id);
      
      // Очищаем localStorage
      localStorage.clear();
      
      // Показываем сообщение об успехе
      alert(t('settings.allDataDeleted') || 'Все данные удалены');
      
      // Обновляем страницу
      window.location.reload();
      
    } catch (error: any) {
      console.error('Ошибка при удалении данных:', error);
      alert(t('settings.deleteError') || 'Ошибка при удалении данных');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background dark:bg-dark-background pb-20 transition-colors duration-200">
      <Header 
        title={t('settings.title')}
        subtitle={t('settings.management')}
      />

      <main className="p-4 space-y-4">
        {/* Профиль пользователя */}
        <div className="bg-white dark:bg-dark-surface rounded-xl p-4 transition-colors duration-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 dark:bg-dark-primary/20 rounded-full flex items-center justify-center">
              <span className="text-primary dark:text-dark-primary font-semibold">
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-text-primary dark:text-dark-text-primary">
                {user?.email || t('settings.user')}
              </p>
              <p className="text-xs text-text-secondary dark:text-dark-text-secondary">
                {user?.email?.split('@')[1] || t('settings.account')}
              </p>
            </div>
          </div>
        </div>

        {/* Внешний вид */}
        <div className="bg-white dark:bg-dark-surface rounded-xl transition-colors duration-200">
          <div className="px-4 py-3 border-b border-border dark:border-dark-border">
            <h3 className="text-sm font-medium text-text-primary dark:text-dark-text-primary">
              {t('settings.appearance')}
            </h3>
          </div>
          
          <div className="divide-y divide-border/50 dark:divide-dark-border/50">
            {/* Тема */}
            <div className="px-4 py-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-primary dark:text-dark-text-primary">
                    {t('settings.theme')}
                  </p>
                  <p className="text-xs text-text-secondary dark:text-dark-text-secondary mt-0.5">
                    {t('settings.themeDescription')}
                  </p>
                </div>
                <button
                  onClick={toggleTheme}
                  className={cn(
                    "relative w-12 h-6 rounded-full transition-colors",
                    theme === 'dark' ? "bg-primary dark:bg-dark-primary" : "bg-border dark:bg-gray-600"
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-1 w-4 h-4 rounded-full bg-white transition-transform shadow-sm",
                      theme === 'dark' ? "left-7" : "left-1"
                    )}
                  />
                </button>
              </div>
            </div>

            {/* Язык */}
            <div className="px-4 py-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-primary dark:text-dark-text-primary">
                    {t('settings.language')}
                  </p>
                  <p className="text-xs text-text-secondary dark:text-dark-text-secondary mt-0.5">
                    {t('settings.languageDescription')}
                  </p>
                </div>
                <LanguageSwitcher compact />
              </div>
            </div>
          </div>
        </div>

        {/* Опасная зона */}
        <div className="bg-white dark:bg-dark-surface rounded-xl border border-error/20 dark:border-red-900/50 transition-colors duration-200">
          <div className="px-4 py-3 border-b border-border dark:border-dark-border">
            <h3 className="text-sm font-medium text-error dark:text-red-400">
              {t('settings.dangerZone')}
            </h3>
          </div>
          
          <div className="divide-y divide-border/50 dark:divide-dark-border/50">
            {/* Удаление данных */}
            <button
              onClick={handleDeleteAllData}
              disabled={isDeleting || !user}
              className={cn(
                "w-full px-4 py-3 text-left transition-colors duration-200",
                "hover:bg-red-50 dark:hover:bg-red-900/20",
                "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-8 h-8 rounded-full bg-error/10 dark:bg-red-900/30 flex items-center justify-center",
                  isDeleting ? "animate-pulse" : ""
                )}>
                  {isDeleting ? (
                    <svg 
                      className="w-4 h-4 text-error dark:text-red-400 animate-spin" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth="2" 
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
                      />
                    </svg>
                  ) : (
                    <svg 
                      className="w-4 h-4 text-error dark:text-red-400" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth={2} 
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" 
                      />
                    </svg>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-error dark:text-red-400">
                    {t('settings.deleteAllData')}
                  </p>
                  <p className="text-xs text-error/70 dark:text-red-400/70 mt-0.5">
                    {t('settings.deleteAllDescription')}
                    {isDeleting && (
                      <span className="block mt-1">Идет удаление...</span>
                    )}
                  </p>
                </div>
              </div>
            </button>

            {/* Выход */}
            <button
              onClick={handleLogout}
              className="w-full px-4 py-3 text-left hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-error/10 dark:bg-red-900/30 flex items-center justify-center">
                  <svg 
                    className="w-4 h-4 text-error dark:text-red-400" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth={2} 
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" 
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-error dark:text-red-400">
                    {t('settings.logout')}
                  </p>
                  <p className="text-xs text-error/70 dark:text-red-400/70 mt-0.5">
                    {t('settings.logoutDescription')}
                  </p>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Футер */}
        <div className="text-center">
          <p className="text-xs text-text-secondary dark:text-dark-text-secondary">
            RuNiko © 2025
          </p>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default Settings;