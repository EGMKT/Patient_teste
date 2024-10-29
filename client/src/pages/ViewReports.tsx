// ... imports anteriores
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getReports, getAdminDashboard } from '../api';
import { 
  Card, CardContent, Typography, Grid, 
  Table, TableBody, TableCell, TableHead, TableRow,
  Paper, CircularProgress, Alert, Box
} from '@mui/material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import NewClinicsChart from '../components/NewClinicsChart';

interface ReportData {
  totalPatientsAttended: number;
  patientsPerDoctor: { [key: string]: number };
  newPatientsAttended: number;
  returningPatientsAttended: number;
  patientRetentionRate: number;
  averageConsultationTime: number;
  overallPatientSatisfaction: number;
  doctorQualityIndex: { [key: string]: number };
  patientDemographics: {
    ageGroups: { [key: string]: number };
    genderDistribution: { [key: string]: number };
    occupations: { [key: string]: number };
    locations: { [key: string]: number };
  };
}

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

const ViewReports: React.FC = () => {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [reportsResponse, dashboardResponse] = await Promise.all([
        getReports(),
        getAdminDashboard()
      ]);
      setReportData(reportsResponse);
      setDashboardData(dashboardResponse);
    } catch (error: any) {
      console.error('Erro ao buscar dados:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        setError(t('errorFetchingData'));
      }
    } finally {
      setLoading(false);
    }
  };

  const formatValue = (value: number | undefined, format: 'percentage' | 'decimal' = 'decimal'): string => {
    if (value === undefined) return '-';
    return format === 'percentage' 
      ? `${(value * 100).toFixed(1)}%`
      : value.toFixed(1);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <CircularProgress />
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

  if (!reportData || !dashboardData) return null;

  return (
    <div className="container mx-auto p-4">
      <Typography variant="h4" component="h1" className="mb-8">
        {t('reports.title')}
      </Typography>
      
      {/* Primeira linha de cards - Dashboard Geral */}
      <Grid container spacing={3} className="mb-8">
        <DashboardCard
          title={t('dashboard.totalClinics')}
          value={dashboardData.total_clinicas}
        />
        <DashboardCard
          title={t('dashboard.totalDoctors')}
          value={dashboardData.total_medicos}
        />
        <DashboardCard
          title={t('dashboard.totalPatients')}
          value={dashboardData.total_pacientes}
        />
        <DashboardCard
          title={t('dashboard.totalConsultations')}
          value={dashboardData.total_consultas}
        />
      </Grid>

      {/* Segunda linha de cards - Métricas Detalhadas */}
      <Grid container spacing={3} className="mb-8">
        <MetricCard
          title={t('reports.totalPatientsAttended')}
          value={reportData.totalPatientsAttended || 0}
        />
        <MetricCard
          title={t('reports.patientRetentionRate')}
          value={formatValue(reportData.patientRetentionRate, 'percentage')}
        />
        <MetricCard
          title={t('reports.averageConsultationTime')}
          value={formatDuration(reportData.averageConsultationTime || 0)}
        />
        <MetricCard
          title={t('reports.overallPatientSatisfaction')}
          value={`${formatValue(reportData.overallPatientSatisfaction)}/5`}
        />
      </Grid>

      {/* Gráfico de Novas Clínicas */}
      <Box className="mb-8">
        <Typography variant="h5" component="h2" className="mb-4">
          {t('reports.newClinicsOverTime')}
        </Typography>
        <NewClinicsChart data={dashboardData.new_clinics_data} />
      </Box>

      {/* Gráficos Demográficos */}
      <Grid container spacing={3} className="mb-8">
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" className="mb-4">
                {t('ageDistribution')}
              </Typography>
              <PieChart width={400} height={300}>
                <Pie
                  data={Object.entries(reportData.patientDemographics.ageGroups).map(([key, value]) => ({
                    name: key,
                    value
                  }))}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {Object.entries(reportData.patientDemographics.ageGroups).map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" className="mb-4">
                {t('genderDistribution')}
              </Typography>
              <PieChart width={400} height={300}>
                <Pie
                  data={Object.entries(reportData.patientDemographics.genderDistribution).map(([key, value]) => ({
                    name: key,
                    value
                  }))}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {Object.entries(reportData.patientDemographics.genderDistribution).map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </CardContent>
          </Card>
        </Grid>

        {/* Gráfico de Ocupações */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" className="mb-4">
                {t('occupationDistribution')}
              </Typography>
              <BarChart width={400} height={300} data={Object.entries(reportData.patientDemographics.occupations).map(([key, value]) => ({
                name: key,
                value
              }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </CardContent>
          </Card>
        </Grid>

        {/* Adicione mais gráficos para gênero, ocupação e localização */}
      </Grid>

      {/* Tabela de Médicos */}
      <Paper className="mb-8">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t('doctor')}</TableCell>
              <TableCell align="right">{t('patientsAttended')}</TableCell>
              <TableCell align="right">{t('satisfactionRate')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.entries(reportData.patientsPerDoctor).map(([doctor, count]) => (
              <TableRow key={doctor}>
                <TableCell>{doctor}</TableCell>
                <TableCell align="right">{count}</TableCell>
                <TableCell align="right">
                  {reportData.doctorQualityIndex[doctor]?.toFixed(1) || '-'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </div>
  );
};

// Componentes auxiliares
const DashboardCard: React.FC<{ title: string; value: number }> = ({ title, value }) => (
  <Grid item xs={12} sm={6} md={3}>
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
  </Grid>
);

const MetricCard: React.FC<{ title: string; value: string | number }> = ({ title, value }) => (
  <Grid item xs={12} sm={6} md={3}>
    <Card>
      <CardContent>
        <Typography variant="h6">{title}</Typography>
        <Typography variant="h4">{value}</Typography>
      </CardContent>
    </Card>
  </Grid>
);

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}min`;
};

export default ViewReports;
