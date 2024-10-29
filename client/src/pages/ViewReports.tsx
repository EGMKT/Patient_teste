// ... imports anteriores
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getReports } from '../api';
import { 
  Card, CardContent, Typography, Grid, 
  Table, TableBody, TableCell, TableHead, TableRow,
  Paper, CircularProgress, Alert
} from '@mui/material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell
} from 'recharts';
import { useNavigate } from 'react-router-dom';

interface ReportData {
  totalPatientsAttended: number;
  patientsPerDoctor: { [key: string]: number };
  newPatientsAttended: number;
  returningPatientsAttended: number;
  patientRetentionRate: number;
  averageConsultationTime: number;
  totalProceduresPerformed: number;
  totalIncidentsReported: number;
  overallPatientSatisfaction: number;
  doctorQualityIndex: { [key: string]: number };
  patientDemographics: {
    ageGroups: { [key: string]: number };
    genderDistribution: { [key: string]: number };
    occupations: { [key: string]: number };
    locations: { [key: string]: number };
  };
}

const ViewReports: React.FC = () => {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getReports();
      setReportData(response);
    } catch (error: any) {
      console.error('Erro ao buscar relatórios:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        setError('Erro ao carregar relatórios. Tente novamente mais tarde.');
      }
    } finally {
      setLoading(false);
    }
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

  if (!reportData) return null;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{t('viewReports')}</h1>
      
      {/* Métricas Principais */}
      <Grid container spacing={3} className="mb-8">
        <MetricCard
          title={t('totalPatientsAttended')}
          value={reportData.totalPatientsAttended}
        />
        <MetricCard
          title={t('patientRetentionRate')}
          value={`${(reportData.patientRetentionRate * 100).toFixed(1)}%`}
        />
        <MetricCard
          title={t('averageConsultationTime')}
          value={formatDuration(reportData.averageConsultationTime)}
        />
        <MetricCard
          title={t('overallPatientSatisfaction')}
          value={`${reportData.overallPatientSatisfaction.toFixed(1)}/5`}
        />
      </Grid>

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
