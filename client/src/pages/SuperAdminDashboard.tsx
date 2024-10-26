import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getAdminDashboard } from '../api';
import { Card, CardContent, Typography, Grid, CircularProgress } from '@mui/material';
import NewClinicsChart from '../components/NewClinicsChart';

interface DashboardData {
  total_clinicas: number;
  total_medicos: number;
  total_pacientes: number;
  total_consultas: number;
  new_clinics_data: {
    month: string;
    count: number;
  }[];
}

const SuperAdminDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const data = await getAdminDashboard();
        setDashboardData(data);
      } catch (err) {
        console.error('Erro ao buscar dados:', err);
        setError(t('errorFetchingData'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [t]);

  if (isLoading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="container mx-auto px-4 py-8 flex-grow">
        <Typography variant="h4" component="h1" className="mb-8">
          {t('superAdminDashboard')}
        </Typography>
        {dashboardData && (
          <>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <DashboardCard title={t('totalClinics')} value={dashboardData.total_clinicas} />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <DashboardCard title={t('totalDoctors')} value={dashboardData.total_medicos} />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <DashboardCard title={t('totalPatients')} value={dashboardData.total_pacientes} />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <DashboardCard title={t('totalConsultations')} value={dashboardData.total_consultas} />
              </Grid>
            </Grid>
            <Typography variant="h5" component="h2" className="mt-8 mb-4">
              {t('newClinicsOverTime')}
            </Typography>
            <NewClinicsChart data={dashboardData.new_clinics_data} />
          </>
        )}
      </div>
    </div>
  );
};

interface DashboardCardProps {
  title: string;
  value: number;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, value }) => (
  <Card>
    <CardContent>
      <Typography color="textSecondary" gutterBottom>
        {title}
      </Typography>
      <Typography variant="h5" component="h2">
        {value}
      </Typography>
    </CardContent>
  </Card>
);

export default SuperAdminDashboard;
