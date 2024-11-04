// ... imports anteriores
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getReports, getAdminDashboard, getClinics, getMedicos, getDashboardClinica, getDashboardMedico, getMedicosByClinica } from '../api';
import { 
  Card, CardContent, Typography, Grid, MenuItem,
  Table, TableBody, TableCell, TableHead, TableRow, Select,
  Paper, CircularProgress, Alert, Box, FormControl, InputLabel, Autocomplete, TextField, Tooltip as MuiTooltip
} from '@mui/material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import { ReportData, DashboardData, User, Clinic, Doctor, AgeGroupData, DoctorDashboardData } from '../types';



const formatValue = (value: number | undefined, format: 'percentage' | 'decimal' = 'decimal'): string => {
  if (value === undefined) return '-';
  return format === 'percentage' 
    ? `${(value * 100).toFixed(1)}%`
    : value.toFixed(1);
};

const formatDuration = (minutes: number): string => {
  if (!minutes) return '0min';
  
  const hours = Math.floor(minutes / 60);
  const mins = Math.floor(minutes % 60);

  if (hours > 0) {
    return `${hours}h ${mins}min`;
  }
  return `${mins}min`;
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const ViewReports: React.FC = () => {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [viewLevel, setViewLevel] = useState<'global' | 'clinic' | 'doctor'>('global');
  const [selectedClinicId, setSelectedClinicId] = useState<number | null>(null);
  const [selectedDoctorId, setSelectedDoctorId] = useState<number | null>(null);
  const [clinicFilterForDoctors, setClinicFilterForDoctors] = useState<number | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (clinicFilterForDoctors) {
      getMedicosByClinica(clinicFilterForDoctors)
        .then(response => {
          console.log('Médicos da clínica:', response);
          setFilteredDoctors(response);
        })
        .catch(error => console.error('Erro ao buscar médicos da clínica:', error));
    } else {
      setFilteredDoctors(doctors);
    }
  }, [clinicFilterForDoctors, doctors]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [
        reportsResponse, 
        dashboardResponse, 
        clinicsResponse,
        medicosResponse
      ] = await Promise.all([
        getReports(),
        getAdminDashboard(),
        getClinics(),
        getMedicos()
      ]);

      console.log('Médicos recebidos:', medicosResponse);
      
      setReportData(reportsResponse);
      setDashboardData(dashboardResponse);
      setClinics(clinicsResponse);
      setDoctors(medicosResponse);
      setFilteredDoctors(medicosResponse);
      
    } catch (error: any) {
      console.error('Erro ao buscar dados:', error);
      setError(t('reports.errorFetchingData'));
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
            <Autocomplete
              value={clinics.find(clinic => clinic.id === selectedClinicId) || null}
              onChange={(_, newValue) => setSelectedClinicId(newValue?.id || null)}
              options={clinics}
              getOptionLabel={(option) => option.nome}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={t('reports.selectClinic')}
                  variant="outlined"
                />
              )}
            />
          </div>
        )}

        {viewLevel === 'doctor' && (
          <div className="p-4 border-t">
            {/* Filtro opcional de Clínica */}
            <Autocomplete
              value={clinics.find(clinic => clinic.id === clinicFilterForDoctors) || null}
              onChange={(_, newValue) => {
                setClinicFilterForDoctors(newValue?.id || null);
                setSelectedDoctorId(null); // Reseta o médico selecionado
              }}
              options={clinics}
              getOptionLabel={(option) => option.nome}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={t('reports.filterByClinic')}
                  variant="outlined"
                  className="mb-4"
                  placeholder={t('reports.optionalClinicFilter')}
                />
              )}
            />

            {/* Lista de Médicos */}
            <Autocomplete
              value={filteredDoctors.find(d => d.usuario.id === selectedDoctorId) || null}
              onChange={(_, newValue) => {
                console.log('Médico selecionado:', newValue);
                setSelectedDoctorId(newValue?.usuario.id || null);
              }}
              options={filteredDoctors}
              getOptionLabel={(option) => 
                `${option.usuario.first_name} ${option.usuario.last_name} - ${option.especialidade}`
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={t('reports.selectDoctor')}
                  variant="outlined"
                />
              )}
              renderOption={(props, option) => (
                <li {...props}>
                  <div>
                    <div>{`${option.usuario.first_name} ${option.usuario.last_name}`}</div>
                    <div className="text-sm text-gray-500">{option.especialidade}</div>
                  </div>
                </li>
              )}
            />
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

const MetricCard: React.FC<{ 
  title: string; 
  value: string | number;
  tooltip?: string;
}> = ({ title, value, tooltip }) => (
  <Grid item xs={12} sm={6} md={3}>
    <MuiTooltip title={tooltip || ''}>
      <Card>
        <CardContent>
          <Typography variant="h6">{title}</Typography>
          <Typography variant="h4">{value}</Typography>
        </CardContent>
      </Card>
    </MuiTooltip>
  </Grid>
);

// Componentes de visualização específicos
const GlobalView: React.FC<{ data: ReportData }> = ({ data }) => {
  const { t } = useTranslation();

  // Formata a taxa de retenção como porcentagem
  const formattedRetentionRate = `${(data.patientRetentionRate * 100).toFixed(1)}%`;

  // Prepara dados para o gráfico de idade
  const ageData: AgeGroupData[] = Object.entries(data.patientDemographics.ageGroups).map(([range, count]) => ({
    name: range,
    value: count
  }));

  return (
    <div className="space-y-6">
      <Grid container spacing={3}>
        <MetricCard 
          title={t('reports.metrics.totalPatients')} 
          value={data.totalPatientsAttended} 
        />
        <MetricCard 
          title={t('reports.metrics.retention')} 
          value={formattedRetentionRate}
          tooltip={t('reports.metrics.retentionTooltip')}
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

      {/* Novo componente para detalhes de retenção */}
      <Paper className="p-4 mt-4">
        <Typography variant="h6" className="mb-4">
          {t('reports.retention.details')}
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle1">
              {t('reports.retention.newPatients')}
            </Typography>
            <Typography variant="h4">
              {data.newPatientsAttended}
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle1">
              {t('reports.retention.returningPatients')}
            </Typography>
            <Typography variant="h4">
              {data.returningPatientsAttended}
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle1">
              {t('reports.retention.rate')}
            </Typography>
            <Typography variant="h4">
              {formattedRetentionRate}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

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
                  {ageData.map((entry: AgeGroupData, index: number) => (
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
  const { t } = useTranslation();
  const [doctorData, setDoctorData] = useState<DoctorDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  // Função para formatar os meses
  const formatMonth = (month: string) => {
    const date = new Date(month);
    return date.toLocaleString('pt-BR', { month: 'short' }).replace('.', '');
  };

  // Função para encontrar o valor máximo para o eixo Y
  const getMaxYValue = (data: { count: number }[]) => {
    const max = Math.max(...data.map(item => item.count));
    return Math.ceil(max * 1.2); // 20% maior que o valor máximo
  };

  useEffect(() => {
    const fetchDoctorData = async () => {
      if (!doctorId) return;
      try {
        const response = await getDashboardMedico(doctorId);
        
        // Formata os dados para o gráfico
        const formattedData = response.consultas_por_mes.map(item => ({
          ...item,
          month: formatMonth(item.month),
        }));
        
        setDoctorData({
          ...response,
          consultas_por_mes: formattedData
        });
      } catch (error) {
        console.error('Erro ao buscar dados do médico:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctorData();
  }, [doctorId]);

  if (!doctorId) return <div>{t('reports.selectDoctorMessage')}</div>;
  if (loading) return <CircularProgress />;
  if (!doctorData) return null;

  return (
    <div className="space-y-6">
      <Grid container spacing={3}>
        <MetricCard 
          title={t('reports.doctor.totalPatients')} 
          value={doctorData.total_pacientes} 
        />
        <MetricCard 
          title={t('reports.doctor.monthlyPatients')} 
          value={doctorData.pacientes_mes} 
        />
        <MetricCard 
          title={t('reports.doctor.satisfaction')} 
          value={`${doctorData.media_satisfacao.toFixed(1)}/5`} 
        />
        <MetricCard 
          title={t('reports.doctor.avgConsultationTime')} 
          value={formatDuration(doctorData.tempo_medio_consulta)} 
        />
      </Grid>

      {/* Gráfico de consultas por mês */}
      <Paper className="p-4">
        <Typography variant="h6" className="mb-4">
          {t('reports.doctor.consultationsPerMonth')}
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={doctorData.consultas_por_mes}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="month"
              tickFormatter={(value) => value}
            />
            <YAxis 
              domain={[0, getMaxYValue(doctorData.consultas_por_mes)]}
              tickCount={5}
              allowDecimals={false}
            />
            <Tooltip 
              formatter={(value: number) => [value, 'Consultas']}
              labelFormatter={(label) => `${label}`}
            />
            <Bar 
              dataKey="count" 
              fill="#8884d8"
              name="Consultas"
            />
          </BarChart>
        </ResponsiveContainer>
      </Paper>
    </div>
  );
};

export default ViewReports;
