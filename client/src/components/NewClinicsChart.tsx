import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useTranslation } from 'react-i18next';

interface NewClinicsChartProps {
  data: { month: string; count: number }[];
}

const NewClinicsChart: React.FC<NewClinicsChartProps> = ({ data }) => {
  const { t } = useTranslation();

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="count" stroke="#8884d8" name={t('newClinics')} />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default NewClinicsChart;