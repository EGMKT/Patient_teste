import React, { useState, useEffect, useMemo } from 'react';
import { 
  Box, Typography, Grid, Paper, Chip, Divider, 
  IconButton, Button, Dialog, DialogTitle, 
  DialogContent, List, ListItem, ListItemText,
  CircularProgress, Alert, Tooltip, TextField,
  MenuItem, Select, FormControl, InputLabel,
  DialogActions
} from '@mui/material';
import { 
  AccessTime, CalendarToday, Person, LocalHospital,
  Assignment, Timeline, Close, EventRepeat,
  FileDownload, FilterList
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TextFieldProps } from '@mui/material';
import * as XLSX from 'xlsx';
import { useAuth } from '../contexts/AuthContext';
import { ConsultationDetails, Consulta } from '../types';
import { useTranslation } from 'react-i18next';
import { getConsultasByPaciente, criarConsulta } from '../api';
import dayjs from 'dayjs';
import api from '../api';

interface ConsultationDetailsProps {
  consultationId: string;
  onClose?: () => void;
}

// Adicione interface para filtros
interface HistoryFilters {
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
  status: string;
  service: string;
}

const ConsultationDetailsComponent: React.FC<ConsultationDetailsProps> = ({ 
  consultationId,
  onClose 
}) => {
  const [details, setDetails] = useState<ConsultationDetails | null>(null);
  const [patientHistory, setPatientHistory] = useState<Consulta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [historyFilters, setHistoryFilters] = useState<HistoryFilters>({
    dateRange: {
      start: null,
      end: null
    },
    status: 'all',
    service: 'all'
  });
  const [showFilters, setShowFilters] = useState(false);
  const { user } = useAuth();
  const { t } = useTranslation();

  useEffect(() => {
    fetchDetails();
  }, [consultationId]);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/consultas/${consultationId}/`);
      const data = response.data;
      setDetails(data);

      if (data.paciente?.id) {
        const history = await getConsultasByPaciente(data.paciente.id);
        setPatientHistory(history.filter(c => c.id !== parseInt(consultationId)));
      }
    } catch (error) {
      console.error('Erro ao buscar detalhes:', error);
      setError(t('consultation.errors.fetchError'));
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleReturn = async () => {
    if (!details) return;

    try {
      // Criar nova consulta com dados pré-preenchidos
      await criarConsulta({
        medico_id: details.medico.id,
        paciente_id: details.paciente.id,
        servico_id: details.servico.id,
        duracao: "01:00", // Duração padrão
        data: new Date().toISOString(), // Data atual como placeholder
        satisfacao: 0,
        valor: details.valor || 0
      });

      // Fechar modal e atualizar lista
      onClose?.();
    } catch (error) {
      console.error('Erro ao agendar retorno:', error);
      setError(t('consultation.errors.scheduleReturn'));
    }
  };

  // Função para filtrar o histórico
  const filteredHistory = useMemo(() => {
    return patientHistory.filter(consulta => {
      const consultaDate = new Date(consulta.data);
      const matchesDateRange = 
        (!historyFilters.dateRange.start || consultaDate >= historyFilters.dateRange.start) &&
        (!historyFilters.dateRange.end || consultaDate <= historyFilters.dateRange.end);
      
      const matchesStatus = 
        historyFilters.status === 'all' || 
        consulta.status === historyFilters.status;
      
      const matchesService = 
        historyFilters.service === 'all' || 
        consulta.servico.nome === historyFilters.service;

      return matchesDateRange && matchesStatus && matchesService;
    });
  }, [patientHistory, historyFilters]);

  // Função para exportar dados
  const handleExportData = () => {
    if (!details || !patientHistory.length) return;

    const exportData = filteredHistory.map(consulta => ({
      Data: new Date(consulta.data).toLocaleDateString(),
      Médico: consulta.medico.usuario.nome,
      Especialidade: consulta.medico.especialidade,
      Serviço: consulta.servico.nome,
      Duração: `${Math.floor(consulta.duracao / 60)}:${String(consulta.duracao % 60).padStart(2, '0')}`,
      Status: consulta.status,
      'Índice de Qualidade': consulta.quality_index?.toFixed(1) || '-',
      Satisfação: consulta.satisfaction_score?.toFixed(1) || '-'
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Histórico de Consultas');
    
    // Gerar nome do arquivo com data
    const fileName = `historico_${details.paciente.nome.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  // Componente de Filtros
  const FiltersDialog = () => (
    <Dialog open={showFilters} onClose={() => setShowFilters(false)}>
      <DialogTitle>{t('consultation.history.filters')}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <DatePicker
              label={t('consultation.history.startDate')}
              value={historyFilters.dateRange.start ? dayjs(historyFilters.dateRange.start) : null}
              onChange={(date) => setHistoryFilters(prev => ({
                ...prev,
                dateRange: { ...prev.dateRange, start: date ? date.toDate() : null }
              }))}
              slots={{
                textField: (params) => <TextField {...params} fullWidth />
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <DatePicker
              label={t('consultation.history.endDate')}
              value={historyFilters.dateRange.end}
              onChange={(date) => setHistoryFilters(prev => ({
                ...prev,
                dateRange: { ...prev.dateRange, end: date }
              }))}
              slots={{
                textField: (params: TextFieldProps) => <TextField {...params} fullWidth />
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>{t('consultation.history.status')}</InputLabel>
              <Select
                value={historyFilters.status}
                onChange={(e) => setHistoryFilters(prev => ({
                  ...prev,
                  status: e.target.value
                }))}
              >
                <MenuItem value="all">{t('common.all')}</MenuItem>
                <MenuItem value="pendente">{t('consultation.status.pendente')}</MenuItem>
                <MenuItem value="processando">{t('consultation.status.processando')}</MenuItem>
                <MenuItem value="concluído">{t('consultation.status.concluído')}</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>{t('consultation.history.service')}</InputLabel>
              <Select
                value={historyFilters.service}
                onChange={(e) => setHistoryFilters(prev => ({
                  ...prev,
                  service: e.target.value
                }))}
              >
                <MenuItem value="all">{t('common.all')}</MenuItem>
                {/* Criar lista única de serviços do histórico */}
                {Array.from(new Set(patientHistory.map(c => c.servico.nome)))
                  .map(service => (
                    <MenuItem key={service} value={service}>{service}</MenuItem>
                  ))
                }
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setShowFilters(false)}>{t('common.close')}</Button>
      </DialogActions>
    </Dialog>
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendente':
        return 'warning';
      case 'processando':
        return 'info';
      case 'concluído':
        return 'success';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={2}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!details) return null;

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" component="h2">
          {t('consultation.details.title')}
        </Typography>
        {onClose && (
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        )}
      </Box>

      <Grid container spacing={3}>
        {/* Informações Básicas */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              {t('consultation.details.basicInfo')}
            </Typography>
            <List>
              <ListItem>
                <CalendarToday sx={{ mr: 1 }} />
                <ListItemText 
                  primary={t('consultation.date')}
                  secondary={new Date(details.data).toLocaleString()}
                />
              </ListItem>
              <ListItem>
                <AccessTime sx={{ mr: 1 }} />
                <ListItemText 
                  primary={t('consultation.duration')}
                  secondary={`${Math.floor(details.duracao / 60)}:${String(details.duracao % 60).padStart(2, '0')}`}
                />
              </ListItem>
              <ListItem>
                <Person sx={{ mr: 1 }} />
                <ListItemText 
                  primary={t('consultation.patient')}
                  secondary={details.paciente.nome}
                />
              </ListItem>
              <ListItem>
                <LocalHospital sx={{ mr: 1 }} />
                <ListItemText 
                  primary={t('consultation.doctor')}
                  secondary={`${details.medico.usuario.nome} - ${details.medico.especialidade}`}
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>

        {/* Métricas e Status */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              {t('consultation.details.metrics')}
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Box textAlign="center" p={2}>
                  <Typography variant="subtitle2">
                    {t('consultation.qualityIndex')}
                  </Typography>
                  <Typography variant="h4">
                    {details.quality_index?.toFixed(1) || '-'}/10
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box textAlign="center" p={2}>
                  <Typography variant="subtitle2">
                    {t('consultation.satisfaction')}
                  </Typography>
                  <Typography variant="h4">
                    {details.satisfaction_score?.toFixed(1) || '-'}/10
                  </Typography>
                </Box>
              </Grid>
            </Grid>
            <Box mt={2}>
              <Chip 
                label={t(`consultation.status.${details.status}`)}
                color={getStatusColor(details.status)}
                sx={{ width: '100%' }}
              />
            </Box>
          </Paper>
        </Grid>

        {/* Tópicos Principais */}
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              {t('consultation.details.keyTopics')}
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={1}>
              {details.key_topics?.map((topic, index) => (
                <Chip key={index} label={topic} variant="outlined" />
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Oportunidades de Marketing (apenas para AM e SA) */}
        {(user?.role === 'SA' || user?.role === 'AM') && (
          <Grid item xs={12}>
            <Paper elevation={2} sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                {t('consultation.details.marketingOpportunities')}
              </Typography>
              <List>
                {details.marketing_opportunities?.map((opp, index) => (
                  <ListItem key={index}>
                    <ListItemText primary={opp} />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>
        )}

        {/* Ações */}
        <Grid item xs={12}>
          <Box display="flex" justifyContent="space-between" gap={2}>
            <Button
              variant="outlined"
              startIcon={<Timeline />}
              onClick={() => setShowHistory(true)}
            >
              {t('consultation.viewHistory')}
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<EventRepeat />}
              onClick={handleScheduleReturn}
            >
              {t('consultation.scheduleReturn')}
            </Button>
          </Box>
        </Grid>
      </Grid>

      {/* Modal de Histórico */}
      <Dialog
        open={showHistory}
        onClose={() => setShowHistory(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography>{t('consultation.patientHistory')}</Typography>
            <Box>
              <Tooltip title={t('common.filter')}>
                <IconButton onClick={() => setShowFilters(true)}>
                  <FilterList />
                </IconButton>
              </Tooltip>
              <Tooltip title={t('common.export')}>
                <IconButton onClick={handleExportData}>
                  <FileDownload />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent>
          <List>
            {filteredHistory.map((consulta) => (
              <ListItem key={consulta.id}>
                <ListItemText
                  primary={new Date(consulta.data).toLocaleDateString()}
                  secondary={`${consulta.medico.usuario.nome} - ${consulta.servico.nome}`}
                />
                <Chip 
                  label={t(`consultation.status.${consulta.status}`)}
                  size="small"
                  color={getStatusColor(consulta.status)}
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>
      </Dialog>

      <FiltersDialog />
    </Box>
  );
};

export default ConsultationDetailsComponent;