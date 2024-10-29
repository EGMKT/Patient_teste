import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useTranslation } from 'react-i18next';

interface NewClinicsChartProps {
  data: { month: string; count: number }[];
}

const NewClinicsChart: React.FC<NewClinicsChartProps> = ({ data }) => {
  const { t, i18n } = useTranslation();

  const getMonthAbbreviation = (month: string): string => {
    try {
      const [year, monthStr] = month.split('-');
      const date = new Date(parseInt(year), parseInt(monthStr) - 1);
      return new Intl.DateTimeFormat(i18n.language, { month: 'short' }).format(date);
    } catch (error) {
      console.error('Erro ao formatar mês:', error);
      return month;
    }
  };

  const formattedData = data.map(item => ({
    ...item,
    monthAbbr: getMonthAbbreviation(item.month)
  })).sort((a, b) => {
    // Garante que os meses sejam exibidos em ordem cronológica
    const [yearA, monthA] = a.month.split('-');
    const [yearB, monthB] = b.month.split('-');
    const dateA = new Date(parseInt(yearA), parseInt(monthA) - 1);
    const dateB = new Date(parseInt(yearB), parseInt(monthB) - 1);
    return dateA.getTime() - dateB.getTime();
  });

  const maxCount = Math.max(...data.map(item => item.count));
  const yAxisMax = Math.ceil(maxCount * 1.2); // 20% a mais que o valor máximo

  useEffect(() => {
    // Força atualização do gráfico quando os dados mudam
    if (data) {
      console.log('Dados do gráfico:', data); // Debug
    }
  }, [data]);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={formattedData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="monthAbbr" />
        <YAxis 
          domain={[0, yAxisMax]} 
          allowDecimals={false}
          tickCount={6}
        />
        <Tooltip labelFormatter={(label) => t('month', { month: label })} />
        <Legend />
        <Bar dataKey="count" fill="#8884d8" name={t('newClinics')} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default NewClinicsChart;
