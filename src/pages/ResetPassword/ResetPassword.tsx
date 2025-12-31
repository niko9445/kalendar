import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from '../../i18n/hooks';

const ResetPassword: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [mounted, setMounted] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    setMounted(true);
    
    // Проверяем параметр passwordChanged из URL, если пользователь перенаправлен после reset
    if (searchParams.get('passwordChanged')) {
      setSuccessMessage('Пароль успешно изменён! Теперь можно войти с новым паролем.');
      localStorage.setItem('just_changed_password', 'true');
    }
  }, [searchParams]);

  const validatePassword = (pwd: string) => pwd.length >= 6;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!password || !confirmPassword) {
      setError('Заполните все поля');
      return;
    }

    if (!validatePassword(password)) {
      setError('Пароль должен быть не менее 6 символов');
      return;
    }

    if (password !== confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    setLoading(true);

    try {
      const { error: supaError } = await supabase.auth.updateUser({ password });

      if (supaError) {
        setError(supaError.message);
      } else {
        setSuccessMessage('Пароль успешно изменён! Перенаправление на вход...');
        localStorage.setItem('just_changed_password', 'true');

        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (err: any) {
      setError('Произошла ошибка. Попробуйте ещё раз.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4 overflow-hidden overscroll-none">
      {/* CSS стили для иконок */}
      <style>{`
        .icon-password::before {
          content: "";
          display: block;
          width: 20px;
          height: 20px;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%239CA3AF' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z'/%3E%3C/svg%3E");
          background-size: contain;
          background-repeat: no-repeat;
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          z-index: 10;
          pointer-events: none;
        }
        
        .icon-eye::before {
          content: "";
          display: block;
          width: 20px;
          height: 20px;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%239CA3AF' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'/%3E%3Cpath d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'/%3E%3C/svg%3E");
          background-size: contain;
          background-repeat: no-repeat;
        }
        
        .icon-eye-off::before {
          content: "";
          display: block;
          width: 20px;
          height: 20px;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%239CA3AF' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.59 6.59m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21'/%3E%3C/svg%3E");
          background-size: contain;
          background-repeat: no-repeat;
        }
        
        /* Темная тема */
        .dark .icon-password::before {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z'/%3E%3C/svg%3E");
        }
        
        .dark .icon-eye::before {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'/%3E%3Cpath d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'/%3E%3C/svg%3E");
        }
        
        .dark .icon-eye-off::before {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.59 6.59m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21'/%3E%3C/svg%3E");
        }
        
        /* Спиннер для кнопки загрузки */
        .spinner {
          display: inline-block;
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: white;
          animation: spin 1s ease-in-out infinite;
        }
        
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
        
        /* Ховер-эффект для иконки глаза */
        .eye-button:hover .icon-eye::before,
        .eye-button:hover .icon-eye-off::before {
          opacity: 0.7;
        }
        
        /* Анимация для сообщений */
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .message-animation {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>

      <div className="w-full max-w-xs">
        {/* Заголовок и подзаголовок приложения */}
        <div className="text-center mb-8">
          <div className="relative mb-6">
            <div className="relative z-20">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">
                Смена пароля
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Введите новый пароль для вашего аккаунта
              </p>

              {/* Декоративная линия */}
              <div className="mt-4 w-20 h-0.5 bg-gradient-to-r from-blue-500 to-blue-300 mx-auto rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Форма */}
        <div className={`transition-all duration-700 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          {/* Сообщение об ошибке */}
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg mb-4 message-animation">
              <p className="text-sm text-red-600 dark:text-red-400 text-center">{error}</p>
            </div>
          )}

          {/* Стильное сообщение об успехе (без иконок) */}
          {successMessage && (
            <div className="p-4 mb-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-lg message-animation">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 mb-3 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-800/30 dark:to-emerald-800/30 rounded-full flex items-center justify-center">
                  <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"></div>
                </div>
                <p className="text-sm text-green-700 dark:text-green-300 font-medium text-center mb-1">
                  Успешно!
                </p>
                <p className="text-xs text-green-600 dark:text-green-400 text-center">
                  {successMessage}
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg 
                         focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500
                         dark:bg-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-500
                         transition-all duration-300 hover:border-blue-400"
                placeholder="Новый пароль"
                required
                disabled={loading}
              />
              <div className="icon-password"></div>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="eye-button absolute inset-y-0 right-0 pr-3 flex items-center transition-colors duration-300"
                style={{ transform: 'translateY(-50%)', top: '50%' }}
                aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
                disabled={loading}
              >
                <span className={showPassword ? "icon-eye-off" : "icon-eye"}></span>
              </button>
            </div>

            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg 
                         focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500
                         dark:bg-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-500
                         transition-all duration-300 hover:border-blue-400"
                placeholder="Подтвердите пароль"
                required
                disabled={loading}
              />
              <div className="icon-password"></div>
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="eye-button absolute inset-y-0 right-0 pr-3 flex items-center transition-colors duration-300"
                style={{ transform: 'translateY(-50%)', top: '50%' }}
                aria-label={showConfirmPassword ? 'Скрыть пароль' : 'Показать пароль'}
                disabled={loading}
              >
                <span className={showConfirmPassword ? "icon-eye-off" : "icon-eye"}></span>
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium 
                       rounded-lg disabled:opacity-50 disabled:cursor-not-allowed 
                       transition-all duration-300 transform hover:scale-[1.02] active:scale-95
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-md
                       hover:shadow-lg relative overflow-hidden group"
            >
              <span className="relative z-10 flex items-center justify-center">
                {loading ? (
                  <>
                    <div className="spinner mr-2"></div>
                    Смена...
                  </>
                ) : 'Сменить пароль'}
              </span>
            </button>

            {/* Кнопка "Вернуться к входу" */}
            <div className="pt-2 text-center">
              <button
                type="button"
                className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-300 mx-auto"
                onClick={() => navigate('/login')}
                disabled={loading}
              >
                Вернуться к входу
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;