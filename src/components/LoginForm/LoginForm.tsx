import React, { useState, FormEvent, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { useTranslation } from '../../i18n/hooks';

type AuthMode = 'login' | 'register' | 'forgot-password';

interface LoginFormProps {
  initialMode?: AuthMode;
  onModeChange?: (mode: AuthMode) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ initialMode = 'login', onModeChange }) => {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [mounted, setMounted] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const { session, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || '/goals';
  const { t } = useTranslation();

  useEffect(() => {
    const initialize = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        if (currentSession?.user && !location.search.includes('force=true')) {
          navigate(from, { replace: true });
          return;
        }
      } catch (e) {
        console.error('Ошибка инициализации LoginForm', e);
      } finally {
        setCheckingAuth(false);
        setMounted(true);
      }
    };

    initialize();
  }, [navigate, location.search, from]);

  const handleModeChange = (newMode: AuthMode) => {
    setMode(newMode);
    setError('');
    setSuccessMessage('');
    if (onModeChange) onModeChange(newMode);
  };

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePassword = (password: string) => password.length >= 6;

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!email || !password) return setError(t('login.errors.fillAllFields'));
    if (!validateEmail(email)) return setError(t('errors.invalidEmail'));

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      setSuccessMessage('✅ Вход выполнен успешно!');
      navigate(from, { replace: true });
    } catch (err: any) {
      console.error('Ошибка входа', err);
      setError(err.message || t('login.errors.loginFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!email || !password || !confirmPassword) return setError(t('login.errors.fillAllFields'));
    if (!validateEmail(email)) return setError(t('errors.invalidEmail'));
    if (!validatePassword(password)) return setError(t('login.errors.passwordMinLength'));
    if (password !== confirmPassword) return setError(t('login.errors.passwordsDontMatch'));

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } },
      });
      if (error) throw error;

      setSuccessMessage('Регистрация успешна! Проверьте почту для подтверждения.');
      setEmail(''); setPassword(''); setConfirmPassword(''); setName('');

      setTimeout(() => {
        handleModeChange('login');
        setSuccessMessage('Теперь вы можете войти в систему');
      }, 3000);
    } catch (err: any) {
      console.error('Ошибка регистрации', err);
      setError(err.message || t('login.errors.registrationFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!email) return setError(t('login.errors.fillAllFields'));
    if (!validateEmail(email)) return setError(t('errors.invalidEmail'));

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;

      setSuccessMessage('📧 Инструкции по восстановлению пароля отправлены на вашу почту.');
      setEmail('');

      setTimeout(() => navigate('/login', { replace: true }), 2000);
    } catch (err: any) {
      console.error('Ошибка восстановления пароля', err);
      setError(err.message || t('login.errors.resetFailed'));
    } finally {
      setLoading(false);
    }
  };

  const getFormTitle = () => {
    switch (mode) {
      case 'login': return t('auth.login');
      case 'register': return 'Регистрация';
      case 'forgot-password': return 'Восстановление пароля';
    }
  };

  if (checkingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-xs">
        <h2 className="text-lg font-semibold text-center mb-6">{getFormTitle()}</h2>

        {error && <div className="p-3 mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded animate-fade-in"><p className="text-sm text-red-600 dark:text-red-400">{error}</p></div>}
        {successMessage && <div className="p-3 mb-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded animate-fade-in"><p className="text-sm text-green-600 dark:text-green-400">{successMessage}</p></div>}

        {/* LOGIN */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" required className="w-full p-2 border rounded" />
            <div className="relative">
              <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Пароль" required className="w-full p-2 border rounded pr-10" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2 top-2 text-sm">{showPassword ? '🙈' : '👁️'}</button>
            </div>
            <div className="flex justify-between text-xs">
              <button type="button" onClick={() => handleModeChange('register')} className="text-blue-600">Регистрация</button>
              <button type="button" onClick={() => handleModeChange('forgot-password')} className="text-blue-600">Забыли пароль?</button>
            </div>
            <button type="submit" disabled={loading} className="w-full p-2 bg-blue-600 text-white rounded">{loading ? 'Вход...' : 'Войти'}</button>
          </form>
        )}

        {/* REGISTER */}
        {mode === 'register' && (
          <form onSubmit={handleRegister} className="space-y-4">
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Имя (необязательно)" className="w-full p-2 border rounded" />
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" required className="w-full p-2 border rounded" />
            <div className="relative">
              <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Пароль" required className="w-full p-2 border rounded pr-10" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2 top-2 text-sm">{showPassword ? '🙈' : '👁️'}</button>
            </div>
            <div className="relative">
              <input type={showConfirmPassword ? 'text' : 'password'} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Подтвердите пароль" required className="w-full p-2 border rounded pr-10" />
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-2 top-2 text-sm">{showConfirmPassword ? '🙈' : '👁️'}</button>
            </div>
            <button type="button" onClick={() => handleModeChange('login')} className="text-xs text-blue-600">Уже есть аккаунт? Войти</button>
            <button type="submit" disabled={loading} className="w-full p-2 bg-green-600 text-white rounded">{loading ? 'Регистрация...' : 'Зарегистрироваться'}</button>
          </form>
        )}

        {/* FORGOT PASSWORD */}
        {mode === 'forgot-password' && (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" required className="w-full p-2 border rounded" />
            <button type="button" onClick={() => handleModeChange('login')} className="text-xs text-blue-600">Вернуться к входу</button>
            <button type="submit" disabled={loading} className="w-full p-2 bg-blue-600 text-white rounded">{loading ? 'Отправка...' : 'Отправить инструкции'}</button>
          </form>
        )}
      </div>
    </div>
  );
};

export default LoginForm;
