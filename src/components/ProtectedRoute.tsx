import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../i18n/hooks';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const { t } = useTranslation();
  const location = useLocation();

  // Список публичных страниц, доступных без авторизации
  const publicPaths = ['/login', '/reset-password', '/confirm'];
  const isPublicPath = publicPaths.includes(location.pathname);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background dark:bg-dark-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 dark:border-dark-primary mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            {t('protectedRoute.checkingAuth')}
          </p>
        </div>
      </div>
    );
  }

  // Правило 1: Если на публичной странице И авторизован → перенаправляем на goals
  // ИСКЛЮЧЕНИЕ: reset-password и confirm разрешаем даже при авторизации
  if (isAuthenticated && location.pathname === '/login') {
    return <Navigate to="/goals" replace />;
  }

  // Правило 2: Если не авторизован И на защищенной странице → перенаправляем на login
  if (!isAuthenticated && !isPublicPath) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;