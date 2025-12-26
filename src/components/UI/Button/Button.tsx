import React from 'react';
import { cn } from '../../../utils/cn';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Тип кнопки */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  /** Размер кнопки */
  size?: 'sm' | 'md' | 'lg';
  /** Растянуть на всю ширину */
  fullWidth?: boolean;
  /** Состояние загрузки */
  loading?: boolean;
  /** Иконка слева */
  startIcon?: React.ReactNode;
  /** Иконка справа */
  endIcon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  startIcon,
  endIcon,
  className,
  disabled,
  ...props
}) => {
  // Базовые классы
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed active:translate-y-px';
  
  // Классы для вариантов (с поддержкой темной темы)
  const variantClasses = {
    primary: 'bg-primary-500 dark:bg-dark-primary text-white hover:bg-primary-600 dark:hover:bg-dark-primary-dark active:bg-primary-700 dark:active:bg-dark-primary-darker',
    secondary: 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 active:bg-gray-300 dark:active:bg-gray-600',
    outline: 'bg-transparent border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 active:bg-gray-100 dark:active:bg-gray-800',
    ghost: 'bg-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 active:bg-gray-200 dark:active:bg-gray-700',
  };
  
  // Классы для размеров
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-5 py-3 text-base',
    lg: 'px-7 py-4 text-lg',
  };
  
  // Объединяем все классы
  const buttonClasses = cn(
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    fullWidth && 'w-full',
    loading && 'opacity-70 cursor-wait',
    className
  );
  
  return (
    <button
      className={buttonClasses}
      disabled={disabled || loading}
      {...props}
    >
      {/* Индикатор загрузки */}
      {loading && (
        <svg 
          className={cn(
            "animate-spin -ml-1 mr-2",
            size === 'sm' ? "h-4 w-4" : "h-5 w-5"
          )} 
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24"
        >
          <circle 
            className="opacity-25" 
            cx="12" 
            cy="12" 
            r="10" 
            stroke="currentColor" 
            strokeWidth="4"
          />
          <path 
            className="opacity-75" 
            fill="currentColor" 
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      
      {/* Иконка слева */}
      {!loading && startIcon && (
        <span className="mr-2">{startIcon}</span>
      )}
      
      {/* Текст кнопки */}
      <span>{children}</span>
      
      {/* Иконка справа */}
      {endIcon && (
        <span className="ml-2">{endIcon}</span>
      )}
    </button>
  );
};

export default Button;