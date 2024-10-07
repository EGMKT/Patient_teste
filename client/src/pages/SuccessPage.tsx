import React from 'react';
import { useNavigate } from 'react-router-dom';

const SuccessPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold mb-4 text-center">Audio Sent Successfully</h1>
      <p className="text-xl mb-8 text-center">Your audio has been sent to the webhook.</p>
      <button
        onClick={() => navigate('/')}
        className="px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
      >
        Start New Consultation
      </button>
    </div>
  );
};

export default SuccessPage;
