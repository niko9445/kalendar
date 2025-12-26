import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import Header from '../../components/Navigation/Header';
import BottomNav from '../../components/Navigation/BottomNav';
import { cn } from '../../utils/cn';

const Settings: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme, setTheme } = useTheme();
  const [language, setLanguage] = useState<'ru' | 'en'>('ru');
  const [notifications, setNotifications] = useState(true);

  const handleLogout = () => {
    if (window.confirm(language === 'ru' ? 'Вы уверены, что хотите выйти?' : 'Are you sure you want to logout?')) {
      logout();
    }
  };

  const handleDeleteAllData = () => {
    if (window.confirm(
      language === 'ru' 
        ? 'Это действие удалит ВСЕ ваши цели и события. Вы уверены?' 
        : 'This will delete ALL your goals and events. Are you sure?'
    )) {
      localStorage.clear();
      alert(language === 'ru' ? 'Все данные удалены' : 'All data deleted');
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-background dark:bg-dark-background pb-20 transition-colors duration-200">
      <Header 
        title={language === 'ru' ? "Настройки" : "Settings"}
        subtitle={language === 'ru' ? "Управление приложением" : "App management"}
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
                {user?.email || (language === 'ru' ? 'Пользователь' : 'User')}
              </p>
              <p className="text-xs text-text-secondary dark:text-dark-text-secondary">
                {user?.email?.split('@')[1] || (language === 'ru' ? 'Аккаунт' : 'Account')}
              </p>
            </div>
          </div>
        </div>

        {/* Внешний вид */}
        <div className="bg-white dark:bg-dark-surface rounded-xl transition-colors duration-200">
          <div className="px-4 py-3 border-b border-border dark:border-dark-border">
            <h3 className="text-sm font-medium text-text-primary dark:text-dark-text-primary">
              {language === 'ru' ? 'Внешний вид' : 'Appearance'}
            </h3>
          </div>
          
          <div className="divide-y divide-border/50 dark:divide-dark-border/50">
            {/* Тема - переключатель */}
            <div className="px-4 py-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-primary dark:text-dark-text-primary">
                    {language === 'ru' ? 'Тема' : 'Theme'}
                  </p>
                  <p className="text-xs text-text-secondary dark:text-dark-text-secondary mt-0.5">
                    {language === 'ru' ? 'Светлая/Темная' : 'Light/dark'}
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

            {/* Язык - компактный переключатель */}
            <div className="px-4 py-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-primary dark:text-dark-text-primary">
                    {language === 'ru' ? 'Язык' : 'Language'}
                  </p>
                  <p className="text-xs text-text-secondary dark:text-dark-text-secondary mt-0.5">
                    {language === 'ru' ? 'Русский/Английский' : 'Russian/English'}
                  </p>
                </div>
                <button
                  onClick={() => setLanguage(language === 'ru' ? 'en' : 'ru')}
                  className={cn(
                    "relative w-12 h-6 rounded-full transition-colors",
                    language === 'ru' ? "bg-primary dark:bg-dark-primary" : "bg-blue-500 dark:bg-blue-600"
                  )}
                >
                  {/* Флаги внутри переключателя */}
                  <span className={cn(
                    "absolute top-1 text-xs transition-opacity duration-300",
                    language === 'ru' ? "left-1 opacity-100" : "left-7 opacity-0"
                  )}>
                    🇷🇺
                  </span>
                  <span className={cn(
                    "absolute top-1 text-xs transition-opacity duration-300",
                    language === 'en' ? "left-7 opacity-100" : "left-1 opacity-0"
                  )}>
                    🇬🇧
                  </span>
                  
                  {/* Белый ползунок */}
                  <span
                    className={cn(
                      "absolute top-1 w-4 h-4 rounded-full bg-white transition-transform shadow-sm",
                      language === 'ru' ? "left-1" : "left-7"
                    )}
                  />
                </button>
              </div>
            </div>

            {/* Уведомления */}
            <div className="px-4 py-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-primary dark:text-dark-text-primary">
                    {language === 'ru' ? 'Уведомления' : 'Notifications'}
                  </p>
                  <p className="text-xs text-text-secondary dark:text-dark-text-secondary mt-0.5">
                    {language === 'ru' ? 'Push-уведомления' : 'Push notifications'}
                  </p>
                </div>
                <button
                  onClick={() => setNotifications(!notifications)}
                  className={cn(
                    "relative w-12 h-6 rounded-full transition-colors",
                    notifications ? "bg-primary dark:bg-dark-primary" : "bg-border dark:bg-gray-600"
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-1 w-4 h-4 rounded-full bg-white transition-transform shadow-sm",
                      notifications ? "left-7" : "left-1"
                    )}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Опасная зона */}
        <div className="bg-white dark:bg-dark-surface rounded-xl border border-error/20 dark:border-red-900/50 transition-colors duration-200">
          <div className="px-4 py-3 border-b border-border dark:border-dark-border">
            <h3 className="text-sm font-medium text-error dark:text-red-400">
              {language === 'ru' ? 'Опасная зона' : 'Danger Zone'}
            </h3>
          </div>
          
          <div className="divide-y divide-border/50 dark:divide-dark-border/50">
            {/* Удаление данных */}
            <button
              onClick={handleDeleteAllData}
              className="w-full px-4 py-3 text-left hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-error/10 dark:bg-red-900/30 flex items-center justify-center">
                  <svg className="w-4 h-4 text-error dark:text-red-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-error dark:text-red-400">
                    {language === 'ru' ? 'Удалить все данные' : 'Delete all data'}
                  </p>
                  <p className="text-xs text-error/70 dark:text-red-400/70 mt-0.5">
                    {language === 'ru' ? 'Цели, события, настройки' : 'Goals, events, settings'}
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
                  <svg className="w-4 h-4 text-error dark:text-red-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-error dark:text-red-400">
                    {language === 'ru' ? 'Выйти из аккаунта' : 'Logout'}
                  </p>
                  <p className="text-xs text-error/70 dark:text-red-400/70 mt-0.5">
                    {language === 'ru' ? 'Сессия будет завершена' : 'Session will be terminated'}
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