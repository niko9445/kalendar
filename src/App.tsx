import React from 'react';
import './App.css';
import Calendar from './components/Calendar';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4">
          <h1 className="text-3xl font-bold text-gray-900">
            Календарное приложение
          </h1>
          <p className="mt-2 text-gray-600">
            Создано с React, TypeScript и Tailwind CSS
          </p>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto py-6 px-4">
        <div className="bg-white rounded-lg shadow p-6">
          <Calendar />
        </div>
        
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Добро пожаловать!</h2>
            <p className="text-gray-600">
              Это React приложение с TypeScript и Tailwind CSS.
            </p>
            <button className="mt-4 btn btn-primary">
              Начать работу
            </button>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Технологии</h2>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                React 19 с TypeScript
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Tailwind CSS для стилей
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                date-fns для работы с датами
              </li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;