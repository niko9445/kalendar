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
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();

  // Проверяем параметр passwordChanged из URL, если пользователь перенаправлен после reset
  useEffect(() => {
    if (searchParams.get('passwordChanged')) {
      setSuccessMessage('✅ Пароль успешно изменён! Теперь можно войти с новым паролем.');
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
        setSuccessMessage('✅ Пароль успешно изменён! Перенаправление на вход...');
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
    <div className="min-h-screen flex items-center justify-center p-4 bg-background dark:bg-dark-background transition-colors duration-200">
      <div className="w-full max-w-xs bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 text-center">
          Сменить пароль
        </h2>

        {error && (
          <div className="p-2 mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {successMessage && (
          <div className="p-2 mb-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded">
            <p className="text-sm text-green-600 dark:text-green-400">{successMessage}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Новый пароль"
              className="w-full pl-3 pr-10 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg
                         focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500
                         dark:bg-gray-700 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              disabled={loading}
            >
              <span className={showPassword ? 'icon-eye-off' : 'icon-eye'}></span>
            </button>
          </div>

          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Подтвердите пароль"
              className="w-full pl-3 pr-10 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg
                         focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500
                         dark:bg-gray-700 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium
                       rounded-lg disabled:opacity-50 disabled:cursor-not-allowed
                       transition-all duration-300"
          >
            {loading ? 'Смена...' : 'Сменить пароль'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
