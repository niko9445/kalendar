import React, { useState, FormEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [mounted, setMounted] = useState<boolean>(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Заполните все поля');
      return;
    }
    
    setLoading(true);
    
    const result = await login(email, password);
    
    if (result.success) {
      navigate('/goals');
    } else {
      setError(result.message || 'Ошибка при входе');
    }
    
    setLoading(false);
  };

  const handleDemoLogin = (demoType: 'admin' | 'user' | 'test') => {
    switch (demoType) {
      case 'admin':
        setEmail('admin@example.com');
        setPassword('admin123');
        break;
      case 'user':
        setEmail('user@example.com');
        setPassword('user123');
        break;
      case 'test':
        setEmail('test@test.com');
        setPassword('test123');
        break;
    }
    setError('');
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4 overflow-hidden overscroll-none">
      {/* CSS стили для иконок */}
      <style>{`
        .icon-email::before {
          content: "";
          display: block;
          width: 20px;
          height: 20px;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%239CA3AF' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'/%3E%3C/svg%3E");
          background-size: contain;
          background-repeat: no-repeat;
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          z-index: 10;
          pointer-events: none;
        }
        
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
        .dark .icon-email::before {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'/%3E%3C/svg%3E");
        }
        
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
      `}</style>
      
      <div className="w-full max-w-xs">
        {/* Заголовок и подзаголовок приложения */}
        <div className="text-center mb-10">
          <div className="relative mb-8">
            <div className="relative z-20">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">
                GoalManager
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Управляй своими целями
              </p>
              
              {/* Декоративная линия */}
              <div className="mt-4 w-20 h-0.5 bg-gradient-to-r from-blue-500 to-blue-300 mx-auto rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Форма */}
        <form onSubmit={handleSubmit} className={`space-y-4 transition-all duration-700 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          {/* Email поле */}
          <div className="relative">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg 
                       focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500
                       dark:bg-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-500
                       transition-all duration-300 hover:border-blue-400"
              placeholder="Email"
              required
            />
            <div className="icon-email"></div>
          </div>

          {/* Пароль поле */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg 
                       focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500
                       dark:bg-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-500
                       transition-all duration-300 hover:border-blue-400"
              placeholder="Пароль"
              required
            />
            <div className="icon-password"></div>
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="eye-button absolute inset-y-0 right-0 pr-3 flex items-center transition-colors duration-300"
              style={{ transform: 'translateY(-50%)', top: '50%' }}
              aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
            >
              <span className={showPassword ? "icon-eye-off" : "icon-eye"}></span>
            </button>
          </div>

          {/* Регистрация и Забыли пароль? - на одной строке */}
          <div className="flex justify-between items-center">
            <button
              type="button"
              className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-300"
              onClick={() => alert('Регистрация временно недоступна')}
            >
              Регистрация
            </button>
            
            <button
              type="button"
              className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-300"
            >
              Забыли пароль?
            </button>
          </div>

          {/* Сообщение об ошибке */}
          {error && (
            <div className="p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Кнопка Войти */}
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
                  Вход...
                </>
              ) : 'Войти'}
            </span>
          </button>
        </form>

        {/* Демо аккаунты */}
        <div className={`mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 transition-all duration-700 delay-400 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center mb-3">Демо аккаунты:</p>
          
          <div className="grid grid-cols-3 gap-2">
            {['Админ', 'Пользователь', 'Тестовый'].map((label, index) => (
              <button
                key={label}
                type="button"
                onClick={() => handleDemoLogin(['admin', 'user', 'test'][index] as any)}
                className="px-2 py-2 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 
                         rounded-lg text-xs hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20
                         transition-all duration-300 transform hover:scale-[1.05] active:scale-95
                         hover:text-blue-600 dark:hover:text-blue-400"
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;