import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useTranslation } from 'react-i18next';

interface NewClinicsChartProps {
  data: { month: string; count: number }[];
}

const NewClinicsChart: React.FC<NewClinicsChartProps> = ({ data }) => {
  const { t, i18n } = useTranslation();

  const getMonthAbbreviation = (
    month: string
  ): string => {
    const date = new Date(month);
    return date.toLocaleString(i18n.language, { month: 'short' });
  };

  const formattedData = data.map(item => ({
    ...item,
    monthAbbr: getMonthAbbreviation(item.month)
  }));

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
