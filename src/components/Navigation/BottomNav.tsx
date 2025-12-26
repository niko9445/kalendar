import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '../../utils/cn';

interface NavItem {
  id: string;
  label: string;
  icon: (isActive: boolean) => React.ReactNode;
  path: string;
}

const BottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const navItems: NavItem[] = [
    {
      id: 'goals',
      label: 'Цели',
      icon: (isActive) => (
        <svg 
          className="w-5 h-5" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth={isActive ? 2 : 1.5}
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
        </svg>
      ),
      path: '/goals',
    },
    {
      id: 'calendar',
      label: 'Календарь',
      icon: (isActive) => (
        <svg 
          className="w-5 h-5" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth={isActive ? 2 : 1.5}
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
        </svg>
      ),
      path: '/calendar',
    },
    {
      id: 'settings',
      label: 'Настройки',
      icon: (isActive) => (
        <svg 
          className="w-5 h-5" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth={isActive ? 2 : 1.5}
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
          <circle cx="12" cy="12" r="2.5" 
                  stroke="currentColor" 
                  strokeWidth={isActive ? 2 : 1.5}
                  fill="none" />
        </svg>
      ),
      path: '/settings',
    },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <>
      {/* Безопасный отступ для контента - с учетом safe area */}
      <div className="h-14" />
      
      {/* Навигация */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700"
           style={{ 
             paddingBottom: 'env(safe-area-inset-bottom, 0px)'
           }}>
        <div className="flex justify-around items-center h-12 px-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            
            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.path)}
                className={cn(
                  "flex flex-col items-center justify-center",
                  "relative w-16 py-1 transition-all duration-200",
                  "active:bg-transparent active:scale-95",
                  "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900",
                  "select-none"
                )}
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                {/* Иконка */}
                <div className={cn(
                  "relative flex items-center justify-center w-5 h-5 mb-0.5",
                  isActive 
                    ? "text-blue-600 dark:text-blue-400" 
                    : "text-gray-500 dark:text-gray-400"
                )}>
                  {item.icon(isActive)}
                </div>
                
                {/* Текст */}
                <span className={cn(
                  "text-xs transition-all duration-200 leading-tight",
                  isActive 
                    ? "text-blue-600 dark:text-blue-400 font-medium" 
                    : "text-gray-500 dark:text-gray-400"
                )}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};

export default BottomNav;