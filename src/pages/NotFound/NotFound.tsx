import React from 'react';
import { useTranslation } from '../../i18n/hooks';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => {
  const { t, common } = useTranslation();

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-text-primary dark:text-dark-text-primary mb-4">404</h1>
        <p className="text-text-secondary dark:text-dark-text-secondary mb-6">
          {t('notFound.message')}
        </p>
        <Link 
          to="/goals" 
          className="px-6 py-3 bg-primary dark:bg-dark-primary text-white rounded-lg hover:bg-primary-dark dark:hover:bg-dark-primary-dark transition-colors"
        >
          {t('notFound.goHome')}
        </Link>
      </div>
    </div>
  );
};

export default NotFound;