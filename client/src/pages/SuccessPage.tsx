import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const SuccessPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [satisfaction, setSatisfaction] = useState<number>(0);
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold mb-4 text-center">{t('audioSentSuccessfully')}</h1>
      <p className="text-xl mb-8 text-center">{t('audioSentToWebhook')}</p>
      {!submitted && (
        <div className="mb-8">
          <h2 className="text-xl mb-4">{t('rateSatisfaction')}</h2>
          <div className="flex gap-4">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                onClick={() => {
                  setSatisfaction(rating);
                  setSubmitted(true);
                  // Aqui você pode adicionar uma chamada à API para salvar a satisfação
                }}
                className={`w-12 h-12 rounded-full flex items-center justify-center
                  ${satisfaction === rating ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              >
                {rating}
              </button>
            ))}
          </div>
        </div>
      )}
      <button
        onClick={() => navigate('/')}
        className="px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
      >
        {t('startNewConsultation')}
      </button>
    </div>
  );
};

export default SuccessPage;
