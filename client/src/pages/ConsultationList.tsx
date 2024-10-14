import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getConsultas } from '../api';

interface Consulta {
  id: number;
  paciente: string;
  data: string;
  duracao: number;
  enviado: boolean;
}

const ConsultationList: React.FC = () => {
  const { t } = useTranslation();
  const [consultas, setConsultas] = useState<Consulta[]>([]);

  useEffect(() => {
    const fetchConsultas = async () => {
      try {
        const data = await getConsultas();
        setConsultas(data);
      } catch (error) {
        console.error('Erro ao buscar consultas:', error);
      }
    };
    fetchConsultas();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{t('consultasList')}</h1>
      <ul>
        {consultas.map((consulta) => (
          <li key={consulta.id} className="mb-2 p-2 border rounded">
            <p>{t('patient')}: {consulta.paciente}</p>
            <p>{t('date')}: {new Date(consulta.data).toLocaleString()}</p>
            <p>{t('duration')}: {consulta.duracao} {t('seconds')}</p>
            <p>{t('status')}: {consulta.enviado ? t('sent') : t('pending')}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ConsultationList;