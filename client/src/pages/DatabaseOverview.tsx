import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getDatabaseOverview } from '../api';

interface DatabaseData {
  clinicas: any[];
  usuarios: any[];
  medicos: any[];
  pacientes: any[];
  servicos: any[];
  consultas: any[];
}

const DatabaseOverview: React.FC = () => {
  const [data, setData] = useState<DatabaseData | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getDatabaseOverview();
        setData(response);
      } catch (error) {
        console.error('Erro ao buscar visão geral do banco de dados:', error);
      }
    };
    fetchData();
  }, []);

  if (!data) {
    return <div>{t('loading')}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{t('databaseOverview')}</h1>
      {Object.entries(data).map(([key, value]) => (
        <div key={key} className="mb-8">
          <h2 className="text-xl font-semibold mb-2">{t(key)}</h2>
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {Object.keys(value[0] || {}).map((header) => (
                  <th key={header} className="border p-2">{t(header)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {value.map((item: any, index: number) => (
                <tr key={index}>
                  {Object.values(item).map((cell: any, cellIndex: number) => (
                    <td key={cellIndex} className="border p-2">{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
};

export default DatabaseOverview;