import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

// Типы
interface User {
  email: string;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  loading: boolean;
}

// Создаем контекст
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Провайдер
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // При загрузке приложения проверяем, есть ли сохраненная сессия
  useEffect(() => {
    const checkAuth = () => {
      try {
        const savedUser = localStorage.getItem('user');
        const savedExpiry = localStorage.getItem('auth_expiry');
        
        if (savedUser && savedExpiry) {
          const expiryDate = new Date(savedExpiry);
          const now = new Date();
          
          // Если токен не истек
          if (expiryDate > now) {
            setUser(JSON.parse(savedUser));
          } else {
            // Токен истек, очищаем
            localStorage.removeItem('user');
            localStorage.removeItem('auth_expiry');
          }
        }
      } catch (error) {
        console.error('Ошибка при восстановлении сессии:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Временные учетные данные
  const VALID_CREDENTIALS = [
    { email: 'admin@example.com', password: 'admin123', name: 'Администратор' },
    { email: 'user@example.com', password: 'user123', name: 'Пользователь' },
    { email: 'test@test.com', password: 'test123', name: 'Тестовый пользователь' },
  ];

  // Функция входа
  const login = async (email: string, password: string) => {
    setLoading(true);
    
    try {
      // Имитация задержки сети
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Поиск пользователя с такими учетными данными
      const foundUser = VALID_CREDENTIALS.find(
        cred => cred.email === email && cred.password === password
      );
      
      if (foundUser) {
        const userData = { email: foundUser.email, name: foundUser.name };
        
        // Сохраняем в state
        setUser(userData);
        
        // Сохраняем в localStorage (на 24 часа)
        localStorage.setItem('user', JSON.stringify(userData));
        const expiryDate = new Date();
        expiryDate.setHours(expiryDate.getHours() + 24);
        localStorage.setItem('auth_expiry', expiryDate.toISOString());
        
        return { success: true };
      } else {
        return { 
          success: false, 
          message: 'Неверный email или пароль' 
        };
      }
    } catch (error) {
      console.error('Ошибка при входе:', error);
      return { 
        success: false, 
        message: 'Произошла ошибка при входе' 
      };
    } finally {
      setLoading(false);
    }
  };

  // Функция выхода
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('auth_expiry');
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Хук для использования контекста
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};