import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { GoalsProvider } from './contexts/GoalsContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { I18nProvider } from './i18n/context';
import ProtectedRoute from './components/ProtectedRoute';
import LoginForm from './components/LoginForm/LoginForm';
import Goals from './pages/Goals/Goals';
import Calendar from './pages/Calendar/Calendar';
import Settings from './pages/Settings/Settings';
import NotFound from './pages/NotFound/NotFound';
import ResetPassword from './pages/ResetPassword/ResetPassword';
import ConfirmEmail from './pages/ConfirmEmail/ConfirmEmail';
import { supabase } from './lib/supabase';

// Компонент для обработки событий аутентификации
const AuthHandler: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Обработка событий аутентификации Supabase
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth event:', event);
        console.log('Session user:', session?.user?.email);
        
        switch (event) {
          case 'SIGNED_IN':
            console.log('✅ Пользователь вошел:', session?.user?.email);
            // Автоматический редирект на цели после входа
            if (window.location.pathname === '/login' || window.location.pathname === '/') {
              navigate('/goals');
            }
            break;
          case 'SIGNED_OUT':
            console.log('🚪 Пользователь вышел');
            navigate('/login');
            break;
          case 'USER_UPDATED':
            console.log('📝 Пользователь обновлен:', session?.user?.email);
            break;
          case 'TOKEN_REFRESHED':
            console.log('🔄 Токен обновлен');
            break;
          case 'PASSWORD_RECOVERY':
            console.log('🔑 Восстановление пароля инициировано');
            // Перенаправляем на страницу сброса пароля
            navigate('/reset-password');
            break;
          case 'INITIAL_SESSION':
            console.log('🚀 Начальная сессия загружена');
            break;
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  return null;
};

const App: React.FC = () => {
  return (
    <Router>
      <ThemeProvider>
        <I18nProvider>
          <AuthProvider>
            <GoalsProvider>
              <AuthHandler />
              <div className="min-h-screen bg-background dark:bg-dark-background text-text-primary dark:text-dark-text-primary font-sans transition-colors duration-200">
                <Routes>
                  <Route path="/" element={<Navigate to="/login" replace />} />
                  <Route path="/login" element={<LoginForm />} />
                  
                  {/* Страница подтверждения email */}
                  <Route path="/confirm" element={<ConfirmEmail />} />
                  
                  {/* Страница сброса пароля */}
                  <Route path="/reset-password" element={<ResetPassword />} />
                  
                  {/* Защищенные маршруты */}
                  <Route
                    path="/goals"
                    element={
                      <ProtectedRoute>
                        <Goals />
                      </ProtectedRoute>
                    }
                  />
                  
                  <Route
                    path="/calendar"
                    element={
                      <ProtectedRoute>
                        <Calendar />
                      </ProtectedRoute>
                    }
                  />
                  
                  <Route
                    path="/settings"
                    element={
                      <ProtectedRoute>
                        <Settings />
                      </ProtectedRoute>
                    }
                  />
                  
                  {/* Резервный маршрут на цели */}
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <Navigate to="/goals" replace />
                      </ProtectedRoute>
                    }
                  />
                  
                  {/* Страница 404 */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>
            </GoalsProvider>
          </AuthProvider>
        </I18nProvider>
      </ThemeProvider>
    </Router>
  );
};

export default App;