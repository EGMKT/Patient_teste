import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getAdminDashboard } from '../api';

interface DashboardData {
  totalClinics: number;
  totalDoctors: number;
  totalPatients: number;
  totalConsultations: number;
}

const SuperAdminDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const data = await getAdminDashboard();
        setDashboardData(data);
      } catch (err) {
        setError(t('errorFetchingDashboardData'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [t]);

  if (isLoading) {
    return <div>{t('loading')}</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">{t('superAdminDashboard')}</h1>
      {dashboardData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <DashboardCard title={t('totalClinics')} value={dashboardData.totalClinics} />
          <DashboardCard title={t('totalDoctors')} value={dashboardData.totalDoctors} />
          <DashboardCard title={t('totalPatients')} value={dashboardData.totalPatients} />
          <DashboardCard title={t('totalConsultations')} value={dashboardData.totalConsultations} />
        </div>
      )}
    </div>
  );
};

interface DashboardCardProps {
  title: string;
  value: number;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, value }) => (
  <div className="bg-white shadow-md rounded-lg p-6">
    <h2 className="text-xl font-semibold mb-2">{title}</h2>
    <p className="text-3xl font-bold">{value}</p>
  </div>
);

export default SuperAdminDashboard;