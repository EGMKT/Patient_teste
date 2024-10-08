import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const ErrorPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { errorMessage } = location.state as { errorMessage: string } || {};

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold mb-4 text-center text-red-600">Erro no Envio do Áudio</h1>
      <p className="text-xl mb-8 text-center">{errorMessage || 'Ocorreu um erro inesperado.'}</p>
      <p className="text-lg mb-8 text-center">
        A gravação foi salva localmente e o erro já foi reportado aos administradores.
      </p>
      <button
        onClick={() => navigate('/')}
        className="px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
      >
        Voltar para o Início
      </button>
    </div>
  );
};

export default ErrorPage;
