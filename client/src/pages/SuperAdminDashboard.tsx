import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getAdminDashboard, syncAllClinics, syncAllPatients, syncAllServices } from '../api';
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
import { DashboardData, SuperAdminDashboardProps } from '../types';
import SyncButton from '../components/SyncButton';

const SuperAdminDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const { t } = useTranslation();

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const data = await getAdminDashboard();
      setDashboardData(data);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      setError(t('dashboard.error'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleSync = async () => {
    try {
      setSyncing(true);
      await Promise.all([
        syncAllClinics(),
        syncAllPatients(),
        syncAllServices()
      ]);
      await fetchDashboardData();
    } catch (error) {
      console.error('Erro na sincronização:', error);
      setError(t('common.errors.syncError'));
    } finally {
      setSyncing(false);
    }
  };

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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">{t('dashboard.title')}</h1>
          <div className="flex items-center gap-4">
            <SyncButton onSync={handleSync} loading={syncing} />
          </div>
        </div>
        
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

const DashboardCard: React.FC<SuperAdminDashboardProps> = ({ title, value }) => (
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
