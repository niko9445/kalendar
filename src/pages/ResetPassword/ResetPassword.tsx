import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

const ResetPassword: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [hasToken, setHasToken] = useState(false);
  const [tokenChecked, setTokenChecked] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkForToken = async () => {
      try {
        console.log('🔄 Проверяем URL:', window.location.href);
        
        // Проверяем есть ли токен восстановления в URL
        const hash = window.location.hash;
        console.log('Hash from URL:', hash);
        
        if (hash.includes('access_token') && hash.includes('type=recovery')) {
          console.log('✅ Найден токен восстановления в URL');
          
          // Извлекаем токен из URL
          const params = new URLSearchParams(hash.substring(1));
          const accessToken = params.get('access_token');
          const refreshToken = params.get('refresh_token');
          
          console.log('Access token present:', !!accessToken);
          console.log('Refresh token present:', !!refreshToken);
          
          if (accessToken) {
            // Устанавливаем сессию вручную из токена
            const { data, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken || ''
            });
            
            if (error) {
              console.error('❌ Ошибка установки сессии:', error);
              setError('Ссылка для восстановления пароля недействительна или устарела');
              setTimeout(() => navigate('/login'), 3000);
            } else if (data.session) {
              console.log('✅ Сессия установлена:', data.session.user?.email);
              setHasToken(true);
            }
          } else {
            setError('Не найден токен в ссылке');
          }
        } else {
          console.log('❌ Нет токена восстановления в URL');
          setError('Для смены пароля перейдите по ссылке из письма');
          setTimeout(() => navigate('/login'), 3000);
        }
      } catch (error) {
        console.error('❌ Ошибка при проверке токена:', error);
        setError('Ошибка при проверке ссылки');
      } finally {
        setTokenChecked(true);
      }
    };

    checkForToken();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    console.log('🔄 Начинаем смену пароля...');

    // Валидация
    if (!password || !confirmPassword) {
      setError('Заполните все поля');
      return;
    }
    if (password !== confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }
    if (password.length < 6) {
      setError('Пароль должен содержать минимум 6 символов');
      return;
    }

    setLoading(true);

    try {
      console.log('⏳ Меняем пароль...');
      
      const { data, error } = await supabase.auth.updateUser({
        password: password
      });

      console.log('Результат updateUser:', { data, error });

      if (error) {
        console.error('❌ Ошибка смены пароля:', error);
        throw error;
      }

      console.log('✅ Пароль успешно изменен!');
      
      // Успех
      setSuccess(true);
      setLoading(false);
      
      console.log('🔐 Выходим из системы...');
      
      // Выходим из системы
      await supabase.auth.signOut();
      
      console.log('✅ Вышли из системы, ждем 2 секунды...');
      
      // Полный перезапуск страницы
      setTimeout(() => {
        console.log('🔄 Перенаправляем на /login...');
        // Очищаем hash из URL
        window.location.hash = '';
        // Полный переход на страницу логина
        window.location.href = '/login';
      }, 2000);
      
    } catch (error: any) {
      console.error('❌ Общая ошибка:', error);
      setError(error.message || 'Ошибка при смене пароля');
      setLoading(false);
    }
  };

  // CSS для спиннера
  const spinnerStyles = `
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
      to { transform: rotate(360deg); }
    }
  `;

  // Показываем загрузку при проверке токена
  if (!tokenChecked) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
        <style>{spinnerStyles}</style>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Проверка ссылки...</p>
        </div>
      </div>
    );
  }

  // Если нет токена
  if (!hasToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Ошибка</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {error || 'Неверная или устаревшая ссылка для восстановления пароля'}
          </p>
          <button
            onClick={() => navigate('/login')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-300"
          >
            Вернуться к входу
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <style>{spinnerStyles}</style>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Новый пароль
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Введите новый пароль для вашего аккаунта
          </p>
        </div>

        {success ? (
          <div className="bg-white dark:bg-dark-surface rounded-xl p-6 shadow-lg text-center">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Пароль успешно изменен!
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Вы будете перенаправлены на страницу входа...
            </p>
            <div className="animate-pulse text-sm text-blue-600 dark:text-blue-400">
              Перенаправление...
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="bg-white dark:bg-dark-surface rounded-xl p-6 shadow-lg">
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg mb-4">
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Новый пароль
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                             dark:bg-gray-800 dark:text-white"
                    placeholder="Минимум 6 символов"
                    required
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Подтвердите пароль
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                             dark:bg-gray-800 dark:text-white"
                    placeholder="Введите пароль еще раз"
                    required
                    disabled={loading}
                  />
                </div>
              </div>
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
                    Изменение пароля...
                  </>
                ) : 'Изменить пароль'}
              </span>
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  supabase.auth.signOut().then(() => {
                    window.location.href = '/login';
                  });
                }}
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 disabled:opacity-50"
                disabled={loading}
              >
                Вернуться к входу
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;