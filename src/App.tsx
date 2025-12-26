import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { GoalsProvider } from './contexts/GoalsContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginForm from './components/LoginForm/LoginForm';
import Goals from './pages/Goals/Goals';
import Calendar from './pages/Calendar/Calendar';
import Settings from './pages/Settings/Settings';

const App: React.FC = () => {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <GoalsProvider>
            <div className="min-h-screen bg-background dark:bg-dark-background text-text-primary dark:text-dark-text-primary font-sans transition-colors duration-200">
              <Routes>
                {/* Перенаправление с корня на логин */}
                <Route path="/" element={<Navigate to="/login" replace />} />
                
                {/* Страница логина */}
                <Route path="/login" element={<LoginForm />} />
                
                {/* Защищенные маршруты */}
                <Route
                  path="/goals"
                  element={
                    <ProtectedRoute>
                      <Goals />
                    </ProtectedRoute>
                  }
                />
                
                {/* Календарь */}
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
                
                {/* Перенаправление на цели как главную страницу */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Navigate to="/goals" replace />
                    </ProtectedRoute>
                  }
                />
                
                {/* Страница 404 */}
                <Route path="*" element={
                  <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                      <h1 className="text-4xl font-bold text-text-primary dark:text-dark-text-primary mb-4">404</h1>
                      <p className="text-text-secondary dark:text-dark-text-secondary mb-6">Страница не найдена</p>
                      <a 
                        href="/goals" 
                        className="px-6 py-3 bg-primary dark:bg-dark-primary text-white rounded-lg hover:bg-primary-dark dark:hover:bg-dark-primary-dark transition-colors"
                      >
                        На главную
                      </a>
                    </div>
                  </div>
                } />
              </Routes>
            </div>
          </GoalsProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
};

export default App;