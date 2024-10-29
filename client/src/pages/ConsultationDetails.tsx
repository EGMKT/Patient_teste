import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface ConsultationDetails {
  id: string;
  summary: string;
  transcription_url?: string;
  summary_url?: string;
  quality_index: number;
  satisfaction_score: number;
  key_topics: string[];
  marketing_opportunities: string[];
}

const ConsultationDetails: React.FC<{ consultationId: string }> = ({ consultationId }) => {
  const [details, setDetails] = useState<ConsultationDetails | null>(null);
  const { user } = useAuth();
  
  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const response = await fetch(`/api/consultations/${consultationId}/`);
        const data = await response.json();
        setDetails(data);
      } catch (error) {
        console.error('Erro ao buscar detalhes:', error);
      }
    };
    
    fetchDetails();
  }, [consultationId]);

  if (!details) return <div>Carregando...</div>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Detalhes da Consulta</h2>
      
      {/* Arquivos */}
      <div className="mb-4">
        {details.transcription_url && (
          <a 
            href={details.transcription_url}
            className="text-blue-500 hover:underline block mb-2"
            target="_blank"
            rel="noopener noreferrer"
          >
            Ver Transcrição Completa
          </a>
        )}
        {details.summary_url && (
          <a 
            href={details.summary_url}
            className="text-blue-500 hover:underline block"
            target="_blank"
            rel="noopener noreferrer"
          >
            Ver Resumo
          </a>
        )}
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="p-4 bg-gray-100 rounded">
          <h3 className="font-bold">Índice de Qualidade</h3>
          <p>{details.quality_index.toFixed(1)}/10</p>
        </div>
        <div className="p-4 bg-gray-100 rounded">
          <h3 className="font-bold">Satisfação</h3>
          <p>{details.satisfaction_score.toFixed(1)}/10</p>
        </div>
      </div>

      {/* Tópicos Principais */}
      <div className="mb-4">
        <h3 className="font-bold mb-2">Tópicos Principais</h3>
        <ul className="list-disc pl-5">
          {details.key_topics.map((topic, index) => (
            <li key={index}>{topic}</li>
          ))}
        </ul>
      </div>

      {/* Oportunidades de Marketing (apenas para AM e SA) */}
      {(user?.role === 'SA' || user?.role === 'AM') && (
        <div>
          <h3 className="font-bold mb-2">Oportunidades de Marketing</h3>
          <ul className="list-disc pl-5">
            {details.marketing_opportunities.map((opp, index) => (
              <li key={index}>{opp}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ConsultationDetails;