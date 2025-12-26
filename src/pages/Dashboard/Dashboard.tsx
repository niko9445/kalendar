import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 pb-20">
      {/* Шапка */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-blue-600 dark:to-indigo-700 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">K</span>
                </div>
              </div>
              <div className="ml-4">
                <h1 className="text-xl font-semibold text-gray-800 dark:text-white">
                  Мобильное приложение
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Главная панель
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-800 dark:text-white">
                  {user?.name || user?.email}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  В сети
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-600 dark:from-red-600 dark:to-pink-700 text-white rounded-lg hover:from-red-600 hover:to-pink-700 dark:hover:from-red-700 dark:hover:to-pink-800 focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-all duration-200"
              >
                Выйти
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Основное содержимое */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Карточка 1: Приветствие */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-lg flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                  Добро пожаловать!
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Рады видеть вас снова
                </p>
              </div>
            </div>
            <p className="text-gray-700 dark:text-gray-300">
              Вы успешно вошли в систему временной авторизации. 
              Здесь будет главная страница вашего мобильного приложения.
            </p>
          </div>

          {/* Карточка 2: Информация о пользователе */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Ваш профиль
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Email:</span>
                <span className="font-medium text-gray-800 dark:text-white">
                  {user?.email}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Имя:</span>
                <span className="font-medium text-gray-800 dark:text-white">
                  {user?.name || 'Не указано'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Статус:</span>
                <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 text-xs font-medium rounded-full">
                  Активен
                </span>
              </div>
            </div>
          </div>

          {/* Карточка 3: Демо функции */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Демо функции
            </h3>
            <div className="space-y-3">
              <button className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-blue-600 dark:to-indigo-700 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 dark:hover:from-blue-700 dark:hover:to-indigo-800 transition-all duration-200">
                Функция 1
              </button>
              <button className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-600 dark:from-purple-600 dark:to-pink-700 text-white rounded-lg hover:from-purple-600 hover:to-pink-700 dark:hover:from-purple-700 dark:hover:to-pink-800 transition-all duration-200">
                Функция 2
              </button>
              <button className="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-teal-600 dark:from-green-600 dark:to-teal-700 text-white rounded-lg hover:from-green-600 hover:to-teal-700 dark:hover:from-green-700 dark:hover:to-teal-800 transition-all duration-200">
                Функция 3
              </button>
            </div>
          </div>

          {/* Карточка 4: Информация о системе */}
          <div className="md:col-span-2 lg:col-span-3 bg-gradient-to-r from-gray-800 to-gray-900 dark:from-gray-900 dark:to-gray-950 rounded-xl shadow-sm p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold mb-2">
                  Временная система авторизации
                </h3>
                <p className="text-gray-300 dark:text-gray-400">
                  Эта система использует localStorage для хранения сессии. 
                  После реализации бэкенда данные будут храниться в базе данных.
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold mb-1">3</div>
                <div className="text-gray-400 dark:text-gray-500">тестовых аккаунта</div>
              </div>
            </div>
            
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white bg-opacity-10 dark:bg-gray-800/50 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <span className="font-medium">Админ</span>
                </div>
                <p className="text-sm text-gray-300 dark:text-gray-400">
                  admin@example.com / admin123
                </p>
              </div>
              
              <div className="bg-white bg-opacity-10 dark:bg-gray-800/50 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9.197h-15" />
                    </svg>
                  </div>
                  <span className="font-medium">Пользователь</span>
                </div>
                <p className="text-sm text-gray-300 dark:text-gray-400">
                  user@example.com / user123
                </p>
              </div>
              
              <div className="bg-white bg-opacity-10 dark:bg-gray-800/50 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="font-medium">Тестовый</span>
                </div>
                <p className="text-sm text-gray-300 dark:text-gray-400">
                  test@test.com / test123
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Подвал */}
      <footer className="mt-12 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                © {new Date().getFullYear()} Мобильное приложение. Временная система авторизации.
              </p>
            </div>
            <div className="flex space-x-4">
              <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
                Документация
              </button>
              <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
                Поддержка
              </button>
              <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
                О проекте
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;