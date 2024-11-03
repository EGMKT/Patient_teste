// ... imports anteriores
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getReports, getAdminDashboard, getClinics, getMedicos, getDashboardClinica, Clinic, MedicoData, User } from '../api';
import { 
  Card, CardContent, Typography, Grid, MenuItem,
  Table, TableBody, TableCell, TableHead, TableRow, Select,
  Paper, CircularProgress, Alert, Box, FormControl, InputLabel
} from '@mui/material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer
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

interface Doctor {
  id: number;
  usuario: User;
  especialidade: string;
}

const formatValue = (value: number | undefined, format: 'percentage' | 'decimal' = 'decimal'): string => {
  if (value === undefined) return '-';
  return format === 'percentage' 
    ? `${(value * 100).toFixed(1)}%`
    : value.toFixed(1);
};

const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}min`;
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const ViewReports: React.FC = () => {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [viewLevel, setViewLevel] = useState<'global' | 'clinic' | 'doctor'>('global');
  const [selectedClinicId, setSelectedClinicId] = useState<number | null>(null);
  const [selectedDoctorId, setSelectedDoctorId] = useState<number | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [
        reportsResponse, 
        dashboardResponse, 
        clinicsResponse, 
        doctorsResponse
      ] = await Promise.all([
        getReports(),
        getAdminDashboard(),
        getClinics(),
        getMedicos()
      ]);
      setReportData(reportsResponse);
      setDashboardData(dashboardResponse);
      setClinics(clinicsResponse);
      setDoctors(doctorsResponse);
    } catch (error: any) {
      console.error('Erro ao buscar dados:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        setError(t('reports.errorFetchingData'));
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

  if (!reportData || !dashboardData) return null;

  return (
    <div className="flex h-screen">
      {/* Menu Lateral */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-4">
          <h2 className="text-lg font-bold mb-4">{t('reports.viewLevel')}</h2>
          <div className="space-y-2">
            <button
              className={`w-full p-2 text-left rounded ${
                viewLevel === 'global' ? 'bg-blue-50 text-blue-600' : ''
              }`}
              onClick={() => setViewLevel('global')}
            >
              {t('reports.globalView')}
            </button>
            <button
              className={`w-full p-2 text-left rounded ${
                viewLevel === 'clinic' ? 'bg-blue-50 text-blue-600' : ''
              }`}
              onClick={() => setViewLevel('clinic')}
            >
              {t('reports.clinicView')}
            </button>
            <button
              className={`w-full p-2 text-left rounded ${
                viewLevel === 'doctor' ? 'bg-blue-50 text-blue-600' : ''
              }`}
              onClick={() => setViewLevel('doctor')}
            >
              {t('reports.doctorView')}
            </button>
          </div>
        </div>

        {/* Filtros Contextuais */}
        {viewLevel === 'clinic' && clinics.length > 0 && (
          <div className="p-4 border-t">
            <FormControl fullWidth>
              <InputLabel>{t('reports.selectClinic')}</InputLabel>
              <Select
                value={selectedClinicId || ''}
                onChange={(e) => setSelectedClinicId(e.target.value as number)}
              >
                {clinics.map((clinic) => (
                  <MenuItem key={clinic.id} value={clinic.id}>
                    {clinic.nome}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
        )}

        {viewLevel === 'doctor' && doctors.length > 0 && (
          <div className="p-4 border-t">
            <FormControl fullWidth>
              <InputLabel>{t('reports.selectDoctor')}</InputLabel>
              <Select
                value={selectedDoctorId || ''}
                onChange={(e) => setSelectedDoctorId(e.target.value as number)}
              >
                {doctors.map((doctor) => (
                  <MenuItem key={doctor.id} value={doctor.id}>
                    {`${doctor.usuario.first_name} ${doctor.usuario.last_name}`}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
        )}
      </div>

      {/* Conteúdo Principal */}
      <div className="flex-1 overflow-auto p-6">
        {viewLevel === 'global' && <GlobalView data={reportData} />}
        {viewLevel === 'clinic' && <ClinicView clinicId={selectedClinicId} />}
        {viewLevel === 'doctor' && <DoctorView doctorId={selectedDoctorId} />}
      </div>
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

// Componentes de visualização específicos
const GlobalView: React.FC<{ data: ReportData }> = ({ data }) => {
  const { t } = useTranslation();

  // Dados para o gráfico de distribuição por idade
  const ageData = Object.entries(data.patientDemographics.ageGroups).map(([range, value]) => ({
    name: range,
    value
  }));

  return (
    <div className="space-y-6">
      {/* Métricas Principais */}
      <Grid container spacing={3}>
        <MetricCard 
          title={t('reports.metrics.totalPatients')} 
          value={data.totalPatientsAttended} 
        />
        <MetricCard 
          title={t('reports.metrics.retention')} 
          value={formatValue(data.patientRetentionRate, 'percentage')} 
        />
        <MetricCard 
          title={t('reports.metrics.avgConsultation')} 
          value={formatDuration(data.averageConsultationTime)} 
        />
        <MetricCard 
          title={t('reports.metrics.satisfaction')} 
          value={`${data.overallPatientSatisfaction.toFixed(1)}/5`} 
        />
      </Grid>

      {/* Gráficos */}
      <Grid container spacing={3}>
        {/* Distribuição por Idade */}
        <Grid item xs={12} md={6}>
          <Paper className="p-4">
            <Typography variant="h6" className="mb-4">
              {t('reports.distribution.age')}
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={ageData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  label
                >
                  {ageData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Desempenho dos Médicos */}
        <Grid item xs={12} md={6}>
          <Paper className="p-4">
            <Typography variant="h6" className="mb-4">
              {t('reports.performance.doctors')}
            </Typography>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{t('reports.doctor')}</TableCell>
                  <TableCell align="right">{t('reports.patientsAttended')}</TableCell>
                  <TableCell align="right">{t('reports.satisfactionRate')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.entries(data.patientsPerDoctor).map(([doctor, count]) => (
                  <TableRow key={doctor}>
                    <TableCell>{doctor}</TableCell>
                    <TableCell align="right">{count}</TableCell>
                    <TableCell align="right">
                      {data.doctorQualityIndex[doctor]?.toFixed(1) || '-'}/5
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
};

const ClinicView: React.FC<{ clinicId: number | null }> = ({ clinicId }) => {
  const { t } = useTranslation();
  const [clinicData, setClinicData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClinicData = async () => {
      if (!clinicId) return;
      try {
        const response = await getDashboardClinica(clinicId);
        setClinicData(response);
      } catch (error) {
        console.error('Erro ao buscar dados da clínica:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchClinicData();
  }, [clinicId]);

  if (!clinicId) return <div>{t('reports.selectClinicMessage')}</div>;
  if (loading) return <CircularProgress />;
  if (!clinicData) return null;

  return (
    <div className="space-y-6">
      {/* Métricas da Clínica */}
      <Grid container spacing={3}>
        <MetricCard 
          title={t('reports.clinic.totalPatients')} 
          value={clinicData.total_pacientes} 
        />
        <MetricCard 
          title={t('reports.clinic.monthlyPatients')} 
          value={clinicData.pacientes_mes} 
        />
        <MetricCard 
          title={t('reports.clinic.retention')} 
          value={formatValue(clinicData.indice_fidelizacao, 'percentage')} 
        />
        <MetricCard 
          title={t('reports.clinic.satisfaction')} 
          value={`${clinicData.media_satisfacao.toFixed(1)}/5`} 
        />
      </Grid>

      {/* Mais gráficos e tabelas específicos da clínica */}
    </div>
  );
};

const DoctorView: React.FC<{ doctorId: number | null }> = ({ doctorId }) => {
  // Implementação do dashboard específico do médico
  return <div>{/* ... */}</div>;
};

export default ViewReports;
