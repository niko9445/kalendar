import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { GoalsProvider } from './contexts/GoalsContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { I18nProvider } from './i18n/context';
import ProtectedRoute from './components/ProtectedRoute';
import LoginForm from './components/LoginForm/LoginForm';
import Goals from './pages/Goals/Goals';
import Calendar from './pages/Calendar/Calendar';
import Settings from './pages/Settings/Settings';
import NotFound from './pages/NotFound/NotFound'; // ИМПОРТ КОМПОНЕНТА 404

const App: React.FC = () => {
  return (
    <Router>
      <ThemeProvider>
        <I18nProvider>
          <AuthProvider>
            <GoalsProvider>
              <div className="min-h-screen bg-background dark:bg-dark-background text-text-primary dark:text-dark-text-primary font-sans transition-colors duration-200">
                <Routes>
                  <Route path="/" element={<Navigate to="/login" replace />} />
                  <Route path="/login" element={<LoginForm />} />
                  
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
                  
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <Navigate to="/goals" replace />
                      </ProtectedRoute>
                    }
                  />
                  
                  {/* Используем компонент NotFound вместо инлайнового JSX */}
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