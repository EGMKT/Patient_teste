import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { useTranslation } from 'react-i18next';
import { NewClinicsChartProps } from '../types';

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
  const formattedData = data
    .map(item => ({
      ...item,
      monthAbbr: getMonthAbbreviation(item.month)
    }))
    .sort((a, b) => {
      const [yearA, monthA] = a.month.split('-');
      const [yearB, monthB] = b.month.split('-');
      const dateA = new Date(parseInt(yearA), parseInt(monthA) - 1);
      const dateB = new Date(parseInt(yearB), parseInt(monthB) - 1);
      return dateA.getTime() - dateB.getTime();
    });

  const maxCount = Math.max(...data.map(item => item.count));
  const yAxisMax = Math.ceil(maxCount * 1.2);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border border-gray-200 shadow-lg">
          <p>{t('dashboard.newClinics.tooltip', {
            month: label,
            count: payload[0].value
          })}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={formattedData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="monthAbbr" 
          label={{ 
            value: t('dashboard.newClinics.month'), 
            position: 'insideBottomRight',
            offset: -10 
          }}
        />
        <YAxis 
          domain={[0, yAxisMax]} 
          allowDecimals={false}
          label={{ 
            value: t('dashboard.newClinics.count'), 
            angle: -90, 
            position: 'insideLeft' 
          }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend verticalAlign="bottom" 
          height={36} // Altura específica para a legenda
          wrapperStyle={{ 
            paddingTop: '20px',
            bottom: 0
          }}/>
        <Bar 
          dataKey="count" 
          fill="#8884d8" 
          name={t('dashboard.newClinics.title')}
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default NewClinicsChart;

