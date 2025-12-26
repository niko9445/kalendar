import React, { forwardRef } from 'react';
import { cn } from '../../../utils/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Метка поля */
  label?: string;
  /** Сообщение об ошибке */
  error?: string;
  /** Вспомогательный текст */
  helperText?: string;
  /** Иконка слева */
  startIcon?: React.ReactNode;
  /** Иконка справа */
  endIcon?: React.ReactNode;
  /** Обязательное поле */
  required?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      startIcon,
      endIcon,
      required = false,
      className,
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    // Генерируем уникальный ID если не предоставлен
    const inputId = id || `input-${Math.random().toString(36).substring(2, 9)}`;
    
    return (
      <div className="flex flex-col gap-2 w-full">
        {/* Метка поля */}
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1"
          >
            {label}
            {required && (
              <span className="text-red-500 dark:text-dark-error" aria-hidden="true">*</span>
            )}
          </label>
        )}
        
        {/* Контейнер для input и иконок */}
        <div className="relative">
          {/* Иконка слева */}
          {startIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500">
              {startIcon}
            </div>
          )}
          
          {/* Поле ввода */}
          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            className={cn(
              'w-full px-4 py-3 border rounded-md',
              'focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-dark-primary focus:ring-opacity-50',
              'placeholder:text-gray-400 dark:placeholder:text-gray-500',
              'transition-all duration-200',
              'disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-500 dark:disabled:text-gray-400 disabled:cursor-not-allowed',
              'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100',
              // Отступы для иконок
              startIcon ? 'pl-10' : '',
              endIcon ? 'pr-10' : '',
              // Стили для состояния ошибки
              error 
                ? 'border-red-500 dark:border-dark-error focus:border-red-500 dark:focus:border-dark-error focus:ring-red-200 dark:focus:ring-red-900/20' 
                : 'border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-dark-primary',
              className
            )}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
            {...props}
          />
          
          {/* Иконка справа */}
          {endIcon && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500">
              {endIcon}
            </div>
          )}
        </div>
        
        {/* Сообщение об ошибке */}
        {error && (
          <p 
            id={`${inputId}-error`}
            className="text-sm text-red-600 dark:text-dark-error flex items-center gap-1"
            role="alert"
          >
            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            {error}
          </p>
        )}
        
        {/* Вспомогательный текст */}
        {!error && helperText && (
          <p 
            id={`${inputId}-helper`}
            className="text-sm text-gray-500 dark:text-gray-400"
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;