// src/pages/ConfirmEmail/ConfirmEmail.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

const ConfirmEmail: React.FC = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const confirmEmail = async () => {
      setStatus('loading');
      try {
        const { data, error } = await supabase.auth.getUser();

        if (error) throw error;

        if (data.user?.email_confirmed_at) {
          setStatus('success');
          setMessage('Ваш email успешно подтверждён!');

          setTimeout(() => {
            navigate('/goals');
          }, 3000);
        } else {
          setStatus('error');
          setMessage('Ссылка недействительна или уже использована.');
        }
      } catch (err: any) {
        console.error('Email confirmation error:', err);
        setStatus('error');
        setMessage(err.message || 'Произошла ошибка при подтверждении email.');
      }
    };

    confirmEmail();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Подтверждение Email
          </h1>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg text-center">
          {status === 'loading' && (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Подтверждение email...</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-6 h-6 text-green-600 dark:text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Успешно!</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{message}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Перенаправление на главную страницу...</p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-6 h-6 text-red-600 dark:text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Ошибка</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{message}</p>
              <button
                onClick={() => navigate('/login')}
                className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-300"
              >
                Вернуться к входу
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConfirmEmail;
