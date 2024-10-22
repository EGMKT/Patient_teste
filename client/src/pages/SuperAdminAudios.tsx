import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getAudiosNaoEnviados } from '../api';

interface Audio {
  id: number;
  clinica: string;
  paciente: string;
  medico: string;
  data: string;
  duracao: number;
}

const SuperAdminAudios: React.FC = () => {
  const [audios, setAudios] = useState<Audio[]>([]);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchAudios = async () => {
      try {
        const data = await getAudiosNaoEnviados();
        setAudios(data);
      } catch (error) {
        console.error('Erro ao buscar áudios não enviados:', error);
      }
    };
    fetchAudios();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{t('audiosNaoEnviados')}</h1>
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="border p-2">{t('clinica')}</th>
            <th className="border p-2">{t('paciente')}</th>
            <th className="border p-2">{t('medico')}</th>
            <th className="border p-2">{t('data')}</th>
            <th className="border p-2">{t('duracao')}</th>
          </tr>
        </thead>
        <tbody>
          {audios.map((audio) => (
            <tr key={audio.id}>
              <td className="border p-2">{audio.clinica}</td>
              <td className="border p-2">{audio.paciente}</td>
              <td className="border p-2">{audio.medico}</td>
              <td className="border p-2">{new Date(audio.data).toLocaleString()}</td>
              <td className="border p-2">{audio.duracao} {t('segundos')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SuperAdminAudios;
