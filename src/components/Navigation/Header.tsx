import React from 'react';

interface HeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
}

const Header: React.FC<HeaderProps> = ({ 
  title, 
  subtitle,
  showBackButton = false,
  onBack,
  rightAction
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-dark-surface/95 backdrop-blur-sm border-b border-border dark:border-dark-border">
      <div className="px-4 py-3 safe-area-top">
        <div className="flex items-center justify-between">
          {/* Левая часть: Кнопка назад и заголовок */}
          <div className="flex items-center gap-3">
            {showBackButton && (
              <button
                onClick={onBack}
                className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-surface dark:hover:bg-dark-surface active:bg-border dark:active:bg-dark-border transition-colors -ml-2"
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                <svg 
                  className="w-5 h-5 text-text-primary dark:text-dark-text-primary" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
              </button>
            )}
            
            <div>
              <h1 className="text-lg font-semibold text-text-primary dark:text-dark-text-primary leading-tight">
                {title}
              </h1>
              {subtitle && (
                <p className="text-xs text-text-secondary dark:text-dark-text-secondary mt-0.5 leading-none">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {/* Правая часть: Кастомное действие */}
          {rightAction && (
            <div className="flex items-center">
              {rightAction}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;