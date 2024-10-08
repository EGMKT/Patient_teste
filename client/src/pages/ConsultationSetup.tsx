import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ConsultationSetup: React.FC = () => {
  const [patient, setPatient] = useState('');
  const [service, setService] = useState('');
  const [participants, setParticipants] = useState(2);
  const navigate = useNavigate();

  // Lista de serviços fictícios
  const services = [
    'Consulta Geral',
    'Exame de Rotina',
    'Acompanhamento',
    'Avaliação Especializada',
    'Procedimento Menor'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/record', { state: { patient, service, participants } });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Configuração da Consulta</h1>
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
        <input
          type="text"
          placeholder="Nome do Paciente"
          value={patient}
          onChange={(e) => setPatient(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md"
          required
        />
        <select
          value={service}
          onChange={(e) => setService(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md"
          required
        >
          <option value="">Selecione o Serviço</option>
          {services.map((s, index) => (
            <option key={index} value={s}>{s}</option>
          ))}
        </select>
        <div>
          <p className="mb-2">Número de Participantes:</p>
          <div className="flex justify-between">
            {[2, 3, 4, 5].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setParticipants(num)}
                className={`px-4 py-2 rounded-full ${
                  participants === num ? 'bg-blue-500 text-white' : 'bg-gray-200'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>
        <button
          type="submit"
          className="w-full px-6 py-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors"
        >
          Iniciar Gravação
        </button>
      </form>
    </div>
  );
};

export default ConsultationSetup;