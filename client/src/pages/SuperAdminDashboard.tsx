import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getAdminDashboard } from '../api';
import { 
  Card, 
  CardContent, 
  Typography, 
  Grid, 
  CircularProgress, 
  Box,
  Alert
} from '@mui/material';
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
  const { t } = useTranslation();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const data = await getAdminDashboard();
        setDashboardData(data);
      } catch (err) {
        console.error('Erro ao buscar dados:', err);
        setError(t('dashboard.error'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [t]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <CircularProgress />
        <Typography className="ml-2">{t('dashboard.loading')}</Typography>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <Alert severity="error">{error}</Alert>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="container mx-auto px-4 py-8 flex-grow">
        <Typography variant="h4" component="h1" className="mb-8">
          {t('dashboard.title')}
        </Typography>
        
        {dashboardData && (
          <>
            <Grid container spacing={3} className="mb-8">
              <DashboardCard 
                title={t('dashboard.overview.totalClinics')} 
                value={dashboardData.total_clinicas} 
              />
              <DashboardCard 
                title={t('dashboard.overview.totalDoctors')} 
                value={dashboardData.total_medicos} 
              />
              <DashboardCard 
                title={t('dashboard.overview.totalPatients')} 
                value={dashboardData.total_pacientes} 
              />
              <DashboardCard 
                title={t('dashboard.overview.totalConsultations')} 
                value={dashboardData.total_consultas} 
              />
            </Grid>

            <Box className="bg-white rounded-lg shadow-lg p-6">
              <Typography variant="h5" component="h2" className="mb-4">
                {t('dashboard.newClinics.title')}
              </Typography>
              <NewClinicsChart data={dashboardData.new_clinics_data} />
            </Box>
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
  <Grid item xs={12} sm={6} md={3}>
    <Card className="h-full">
      <CardContent>
        <Typography color="textSecondary" gutterBottom>
          {title}
        </Typography>
        <Typography variant="h5" component="h2">
          {value.toLocaleString()}
        </Typography>
      </CardContent>
    </Card>
  </Grid>
);

export default SuperAdminDashboard;
