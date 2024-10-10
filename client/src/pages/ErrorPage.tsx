import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const ErrorPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { errorMessage } = location.state as { errorMessage: string } || {};

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold mb-4 text-center text-red-600">{t('errorSendingAudio')}</h1>
      <p className="text-xl mb-8 text-center">{errorMessage || t('unexpectedError')}</p>
      <p className="text-lg mb-8 text-center">
        {t('recordingSavedLocally')}
      </p>
      <button
        onClick={() => navigate('/')}
        className="px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
      >
        {t('backToHome')}
      </button>
    </div>
  );
};

export default ErrorPage;
