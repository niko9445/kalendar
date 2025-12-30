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
        
        switch (event) {
          case 'SIGNED_IN':
            console.log('✅ Пользователь вошел:', session?.user?.email);
            // НЕ перенаправляем автоматически - пусть ProtectedRoute решает
            break;
          case 'SIGNED_OUT':
            console.log('🚪 Пользователь вышел');
            break;
          case 'PASSWORD_RECOVERY':
            console.log('🔑 Восстановление пароля инициировано');
            // Оставляем пользователя на текущей странице /reset-password
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
                  
                  {/* Публичные страницы - БЕЗ ProtectedRoute */}
                  <Route path="/confirm" element={<ConfirmEmail />} />
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
                  
                  {/* Резервный маршрут */}
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