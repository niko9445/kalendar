import React, { forwardRef } from 'react';
import { cn } from '../../../utils/cn';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  /** Метка чекбокса */
  label?: string;
  /** Позиция метки */
  labelPosition?: 'left' | 'right';
  /** Сообщение об ошибке */
  error?: string;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      label,
      labelPosition = 'right',
      error,
      className,
      id,
      disabled,
      checked,
      ...props
    },
    ref
  ) => {
    const checkboxId = id || `checkbox-${Math.random().toString(36).substring(2, 9)}`;
    
    return (
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-3">
          {/* Если метка слева */}
          {label && labelPosition === 'left' && (
            <label
              htmlFor={checkboxId}
              className={cn(
                "text-sm text-gray-700 dark:text-gray-300 select-none",
                disabled && "text-gray-400 dark:text-gray-500 cursor-not-allowed"
              )}
            >
              {label}
            </label>
          )}
          
          {/* Контейнер для кастомного чекбокса */}
          <div className="relative">
            {/* Нативный чекбокс (скрытый) */}
            <input
              ref={ref}
              type="checkbox"
              id={checkboxId}
              disabled={disabled}
              checked={checked}
              className="sr-only peer"
              {...props}
            />
            
            {/* Кастомный чекбокс */}
            <div className={cn(
              "w-5 h-5 border-2 rounded-md transition-all duration-200",
              "flex items-center justify-center",
              "peer-checked:bg-primary-500 dark:peer-checked:bg-dark-primary peer-checked:border-primary-500 dark:peer-checked:border-dark-primary",
              "peer-focus:ring-2 peer-focus:ring-primary dark:peer-focus:ring-dark-primary peer-focus:ring-opacity-50",
              error 
                ? "border-red-500 dark:border-dark-error" 
                : "border-gray-300 dark:border-gray-600",
              disabled && "bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 cursor-not-allowed"
            )}>
              {/* Галочка */}
              <svg 
                className={cn(
                  "w-3 h-3 text-white transition-opacity duration-200",
                  checked ? "opacity-100" : "opacity-0"
                )}
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={3} 
                  d="M5 13l4 4L19 7" 
                />
              </svg>
            </div>
          </div>
          
          {/* Если метка справа */}
          {label && labelPosition === 'right' && (
            <label
              htmlFor={checkboxId}
              className={cn(
                "text-sm text-gray-700 dark:text-gray-300 select-none",
                disabled && "text-gray-400 dark:text-gray-500 cursor-not-allowed"
              )}
            >
              {label}
            </label>
          )}
        </div>
        
        {/* Сообщение об ошибке */}
        {error && (
          <p className="text-sm text-red-600 dark:text-dark-error">{error}</p>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export default Checkbox;