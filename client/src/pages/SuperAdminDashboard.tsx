import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getAdminDashboard, getNewClinicsData } from '../api';
import { Card, CardContent, Typography, Grid, Button, IconButton } from '@mui/material';
import { DataUsage, People, LocalHospital, EventNote, ExitToApp, Translate, Menu as MenuIcon } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import SuperAdminSidebar from '../components/SuperAdminSidebar';
import NewClinicsChart from '../components/NewClinicsChart';

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
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [newClinicsData, setNewClinicsData] = useState([]);

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

  useEffect(() => {
    const fetchNewClinicsData = async () => {
      try {
        const data = await getNewClinicsData();
        setNewClinicsData(data);
      } catch (error) {
        console.error('Erro ao buscar dados de novas clínicas:', error);
      }
    };
    fetchNewClinicsData();
  }, []);

  const dashboardItems = [
    { title: 'databaseOverview', icon: <DataUsage />, link: '/super-admin/database-overview' },
    { title: 'manageUsers', icon: <People />, link: '/super-admin/manage-users' },
    { title: 'manageClinics', icon: <LocalHospital />, link: '/super-admin/manage-clinics' },
    { title: 'viewReports', icon: <EventNote />, link: '/super-admin/view-reports' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'pt' ? 'en' : 'pt');
  };

  if (isLoading) {
    return <div>{t('loading')}</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <Typography variant="h4" component="h1">
          {t('superAdminDashboard')}
        </Typography>
        <div>
          <IconButton onClick={() => setSidebarOpen(true)} className="mr-2">
            <MenuIcon />
          </IconButton>
          <Button
            startIcon={<Translate />}
            onClick={toggleLanguage}
            variant="contained"
            color="primary"
            className="mr-2"
          >
            {t('changeLanguage')}
          </Button>
          <Button
            startIcon={<ExitToApp />}
            onClick={handleLogout}
            variant="contained"
            color="secondary"
          >
            {t('logout')}
          </Button>
        </div>
      </div>
      {dashboardData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <DashboardCard title={t('totalClinics')} value={dashboardData.totalClinics} />
          <DashboardCard title={t('totalDoctors')} value={dashboardData.totalDoctors} />
          <DashboardCard title={t('totalPatients')} value={dashboardData.totalPatients} />
          <DashboardCard title={t('totalConsultations')} value={dashboardData.totalConsultations} />
        </div>
      )}
      <Typography variant="h5" component="h2" className="mt-8 mb-4">
        {t('newClinicsOverTime')}
      </Typography>
      <NewClinicsChart data={newClinicsData} />
      <SuperAdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
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
