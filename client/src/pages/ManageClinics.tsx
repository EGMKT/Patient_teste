import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Table, TableHead, TableBody, TableRow, TableCell, 
  Paper, TableContainer, Button, TextField, Dialog, 
  DialogTitle, DialogContent, DialogActions, TableSortLabel,
  CircularProgress, Alert, FormControl, InputLabel, Select,
  MenuItem, Typography, DialogContentText, Checkbox, Tabs, Tab, Box,
  IconButton
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { 
  getClinics, createClinic, updateClinic, deleteClinic, verifyPassword, bulkUpdateClinics 
} from '../api';
import ConfirmActionDialog from '../components/ConfirmActionDialog';
import axios from 'axios';
import ConsultationManagement from '../components/ConsultationManagement';
import { Clinic, ClinicDialogProps, Doctor } from '../types';
import PatientsManagement from '../components/PatientsManagement';

const ManageClinics: React.FC = () => {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [currentClinic, setCurrentClinic] = useState<Clinic | null>(null);
  const [orderBy, setOrderBy] = useState<keyof Clinic>('nome');
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [confirmActionDialogOpen, setConfirmActionDialogOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<{
    type: 'delete' | 'bulk';
    clinicId?: number;
    action?: 'activate' | 'deactivate';
    clinicIds?: number[];
  } | null>(null);
  const [skipPasswordUntil, setSkipPasswordUntil] = useState<number | null>(
    Number(localStorage.getItem('skipPasswordUntil')) || null
  );
  const [confirmDeleteDialogOpen, setConfirmDeleteDialogOpen] = useState(false);
  const [selectedClinicId, setSelectedClinicId] = useState<number | null>(null);
  const [selectedClinics, setSelectedClinics] = useState<number[]>([]);
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'consultations' | 'doctors' | 'patients'>('info');
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [medicos, setMedicos] = useState<Doctor[]>([]);
  const { t } = useTranslation();

  useEffect(() => {
    fetchClinics();
  }, []);

  useEffect(() => {
    if (selectedClinic) {
      fetchMedicosByClinica(selectedClinic.id);
    }
  }, [selectedClinic]);

  const fetchClinics = async () => {
    try {
      setLoading(true);
      const response = await getClinics();
      setClinics(response);
    } catch (error) {
      console.error('Erro ao buscar clínicas:', error);
      setError(t('manageClinics.error'));
    } finally {
      setLoading(false);
    }
  };

  const fetchMedicosByClinica = async (clinicaId: number) => {
    try {
      const response = await axios.get(`/clinicas/${clinicaId}/medicos/`);
      setMedicos(response.data);
    } catch (error) {
      console.error('Erro ao buscar médicos:', error);
    }
  };

  const handleCreateClinic = async (clinicData: Omit<Clinic, 'id' | 'created_at'>) => {
    try {
      await createClinic(clinicData);
      fetchClinics();
      setOpenDialog(false);
    } catch (error) {
      console.error('Erro ao criar clínica:', error);
    }
  };

  const handleUpdateClinic = async (id: number, clinicData: Partial<Clinic>) => {
    try {
      await updateClinic(id, clinicData);
      fetchClinics();
      setOpenDialog(false);
    } catch (error) {
      console.error('Erro ao atualizar clínica:', error);
    }
  };

  const shouldAskPassword = () => {
    if (!skipPasswordUntil) return true;
    return new Date().getTime() > skipPasswordUntil;
  };

  const handleDeleteClick = (id: number) => {
    setSelectedClinicId(id);
    setConfirmDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedClinicId) return;

    if (shouldAskPassword()) {
      setPendingAction({ type: 'delete', clinicId: selectedClinicId });
      setConfirmActionDialogOpen(true);
    } else {
      try {
        await deleteClinic(selectedClinicId);
        fetchClinics();
      } catch (error) {
        console.error('Erro ao excluir clínica:', error);
        // Adicione tratamento de erro apropriado aqui
      }
    }
    setConfirmDeleteDialogOpen(false);
  };

  const handleConfirmAction = async (password: string, dontAskToday: boolean) => {
    try {
      if (!pendingAction) return;

      const verified = await verifyPassword(password);
      if (!verified) {
        setError(t('manageClinics.invalidPassword'));
        return;
      }

      if (dontAskToday) {
        const until = new Date().setHours(23, 59, 59, 999);
        setSkipPasswordUntil(until);
        localStorage.setItem('skipPasswordUntil', until.toString());
      }

      if (pendingAction.type === 'delete' && pendingAction.clinicId) {
        await deleteClinic(pendingAction.clinicId);
      } else if (pendingAction.type === 'bulk' && pendingAction.action && pendingAction.clinicIds) {
        await bulkUpdateClinics(pendingAction.clinicIds, pendingAction.action);
      }

      await fetchClinics();
      setConfirmActionDialogOpen(false);
      setPendingAction(null);
      setSelectedClinics([]);
      setError(null);
    } catch (error) {
      console.error('Erro ao executar ação:', error);
      setError(error instanceof Error ? error.message : 'Erro ao executar ação');
    }
  };

  const filteredClinics = clinics.filter((clinic) =>
    Object.values(clinic).some((value) =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const handleRequestSort = (property: keyof Clinic) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const sortedClinics = React.useMemo(() => {
    return [...filteredClinics].sort((a, b) => {
      const aValue = String(a[orderBy] || '');
      const bValue = String(b[orderBy] || '');
      
      return order === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    });
  }, [filteredClinics, orderBy, order]);

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelectedClinics(sortedClinics.map(clinic => clinic.id));
    } else {
      setSelectedClinics([]);
    }
  };

  const handleSelectClinic = (clinicId: number) => {
    setSelectedClinics(prev => 
      prev.includes(clinicId) 
        ? prev.filter(id => id !== clinicId)
        : [...prev, clinicId]
    );
  };

  const handleBulkAction = async (action: 'activate' | 'deactivate') => {
    if (selectedClinics.length === 0) return;

    try {
      if (shouldAskPassword()) {
        setPendingAction({ 
          type: 'bulk',
          action: action,
          clinicIds: selectedClinics 
        });
        setConfirmActionDialogOpen(true);
      } else {
        console.log('Enviando requisição bulk update:', {
          clinicIds: selectedClinics,
          action: action
        });
        await bulkUpdateClinics(selectedClinics, action);
        await fetchClinics();
        setSelectedClinics([]);
        setError(null);
      }
    } catch (error) {
      console.error('Erro detalhado na ação em massa:', error);
      if (axios.isAxiosError(error)) {
        setError(`Erro: ${error.response?.status} - ${error.response?.data?.error || error.message}`);
      } else {
        setError(t('manageClinics.bulkActionError'));
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <CircularProgress />
        <Typography className="ml-2">{t('manageClinics.loading')}</Typography>
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
      <div className="container mx-auto p-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">{t('manageClinics.title')}</h1>
            <Button 
              onClick={() => { setCurrentClinic(null); setOpenDialog(true); }}
              variant="contained" 
              color="primary"
            >
              {t('manageClinics.createClinic')}
            </Button>
          </div>

          <TextField
            label={t('manageClinics.search')}
            variant="outlined"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            fullWidth
            margin="normal"
            className="mb-4"
          />

          <div className="mb-4 flex gap-2">
            <Button
              variant="contained"
              color="primary"
              disabled={selectedClinics.length === 0}
              onClick={() => handleBulkAction('activate')}
            >
              {t('manageClinics.activateSelected')}
            </Button>
            <Button
              variant="contained"
              color="secondary"
              disabled={selectedClinics.length === 0}
              onClick={() => handleBulkAction('deactivate')}
            >
              {t('manageClinics.deactivateSelected')}
            </Button>
          </div>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      indeterminate={selectedClinics.length > 0 && selectedClinics.length < sortedClinics.length}
                      checked={selectedClinics.length === sortedClinics.length}
                      onChange={handleSelectAll}
                    />
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === 'nome'}
                      direction={orderBy === 'nome' ? order : 'asc'}
                      onClick={() => handleRequestSort('nome')}
                    >
                      {t('manageClinics.name')}
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>{t('manageClinics.createdAt')}</TableCell>
                  <TableCell>{t('manageClinics.status')}</TableCell>
                  <TableCell>{t('manageClinics.actions')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedClinics.map((clinic) => (
                  <TableRow 
                    key={clinic.id}
                    selected={selectedClinics.includes(clinic.id)}
                    sx={{ 
                      opacity: clinic.ativa ? 1 : 0.6,
                      backgroundColor: clinic.ativa ? 'inherit' : 'rgba(0, 0, 0, 0.04)'
                    }}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedClinics.includes(clinic.id)}
                        onChange={() => handleSelectClinic(clinic.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        onClick={() => setSelectedClinic(clinic)}
                        className="text-left hover:underline"
                        sx={{ textTransform: 'none' }}
                      >
                        {clinic.nome}
                      </Button>
                    </TableCell>
                    <TableCell>
                      {new Date(clinic.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {t(`manageClinics.activeStatus.${clinic.ativa}`)}
                    </TableCell>
                    <TableCell>
                      <Button onClick={() => { setCurrentClinic(clinic); setOpenDialog(true); }}>
                        {t('manageClinics.edit')}
                      </Button>
                      <Button onClick={() => handleDeleteClick(clinic.id)}>
                        {t('manageClinics.delete')}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <ClinicDialog
            open={openDialog}
            onClose={() => setOpenDialog(false)}
            clinic={currentClinic}
            onSave={(clinicData: Omit<Clinic, 'id' | 'created_at'> | Partial<Clinic>) => 
              currentClinic 
                ? handleUpdateClinic(currentClinic.id, clinicData as Partial<Clinic>)
                : handleCreateClinic(clinicData as Omit<Clinic, 'id' | 'created_at'>)
            }
          />

          <ConfirmActionDialog
            open={confirmActionDialogOpen}
            onClose={() => setConfirmActionDialogOpen(false)}
            onConfirm={handleConfirmAction}
            title={t('manageClinics.confirmDelete')}
            message={t('manageClinics.deleteConfirmMessage')}
          />

          <Dialog
            open={confirmDeleteDialogOpen}
            onClose={() => setConfirmDeleteDialogOpen(false)}
          >
            <DialogTitle>{t('manageClinics.confirmDeleteTitle')}</DialogTitle>
            <DialogContent>
              <DialogContentText>
                {t('manageClinics.confirmDeleteMessage')}
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setConfirmDeleteDialogOpen(false)}>
                {t('common.cancel')}
              </Button>
              <Button onClick={handleConfirmDelete} color="primary">
                {t('common.confirm')}
              </Button>
            </DialogActions>
          </Dialog>

          {selectedClinic && (
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
              <Tabs 
                value={activeTab} 
                onChange={(_, newValue) => setActiveTab(newValue)}
              >
                <Tab label={t('manageClinics.tabs.info')} value="info" />
                <Tab label={t('manageClinics.tabs.doctors')} value="doctors" />
                <Tab label={t('manageClinics.tabs.patients')} value="patients" />
                <Tab label={t('manageClinics.tabs.consultations')} value="consultations" />
              </Tabs>
            </Box>
          )}

          {selectedClinic && activeTab === 'info' && (
            <ClinicDialog
              open={true}
              onClose={() => setSelectedClinic(null)}
              clinic={selectedClinic}
              onSave={(clinicData: Partial<Clinic>) => {
                if (selectedClinic) {
                  handleUpdateClinic(selectedClinic.id, clinicData);
                }
              }}
            />
          )}

          {selectedClinic && activeTab === 'consultations' && (
            <ConsultationManagement clinicId={selectedClinic.id} />
          )}

          {selectedClinic && activeTab === 'patients' && (
            <PatientsManagement clinicId={selectedClinic.id} />
          )}

          <Dialog 
            open={Boolean(selectedClinic)}
            onClose={() => setSelectedClinic(null)}
            maxWidth="lg"
            fullWidth
          >
            {selectedClinic && (
              <>
                <DialogTitle>
                  <div className="flex justify-between items-center">
                    <Typography variant="h6">{selectedClinic.nome}</Typography>
                    <IconButton onClick={() => setSelectedClinic(null)}>
                      <CloseIcon />
                    </IconButton>
                  </div>
                </DialogTitle>
                <DialogContent>
                  <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                    <Tabs 
                      value={activeTab} 
                      onChange={(_, newValue) => setActiveTab(newValue)}
                    >
                      <Tab label={t('manageClinics.tabs.info')} value="info" />
                      <Tab label={t('manageClinics.tabs.doctors')} value="doctors" />
                      <Tab label={t('manageClinics.tabs.patients')} value="patients" />
                      <Tab label={t('manageClinics.tabs.consultations')} value="consultations" />
                    </Tabs>
                  </Box>

                  {activeTab === 'info' && (
                    <div className="space-y-4">
                      <Typography variant="subtitle1">
                        <strong>{t('manageClinics.createdAt')}:</strong>{' '}
                        {new Date(selectedClinic.created_at).toLocaleDateString()}
                      </Typography>
                      <Typography variant="subtitle1">
                        <strong>{t('manageClinics.status')}:</strong>{' '}
                        {t(`manageClinics.activeStatus.${selectedClinic.ativa}`)}
                      </Typography>
                      {selectedClinic.pipedrive_api_token && (
                        <Typography variant="subtitle1">
                          <strong>{t('manageClinics.pipedriveToken')}:</strong>{' '}
                          {selectedClinic.pipedrive_api_token}
                        </Typography>
                      )}
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => {
                          setCurrentClinic(selectedClinic);
                          setOpenDialog(true);
                        }}
                      >
                        {t('manageClinics.edit')}
                      </Button>
                    </div>
                  )}

                  {activeTab === 'doctors' && (
                    <TableContainer component={Paper}>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>{t('manageClinics.doctorName')}</TableCell>
                            <TableCell>{t('manageClinics.specialty')}</TableCell>
                            <TableCell>{t('manageClinics.totalConsultations')}</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {medicos.map((medico) => (
                            <TableRow key={medico.id}>
                              <TableCell>
                                {`${medico.usuario.first_name} ${medico.usuario.last_name}`}
                              </TableCell>
                              <TableCell>{medico.especialidade}</TableCell>
                              <TableCell>{medico.total_consultas}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}

                  {activeTab === 'patients' && (
                    <PatientsManagement clinicId={selectedClinic.id} />
                  )}

                  {activeTab === 'consultations' && (
                    <ConsultationManagement clinicId={selectedClinic.id} />
                  )}
                </DialogContent>
              </>
            )}
          </Dialog>
        </div>
      </div>
    </div>
  );
};

const ClinicDialog: React.FC<ClinicDialogProps> = ({ open, onClose, clinic, onSave }) => {
  const [nome, setNome] = useState(clinic?.nome || '');
  const [ativa, setAtiva] = useState<boolean>(clinic?.ativa ?? true);
  const [pipedrive_api_token, setPipedriveApiToken] = useState(clinic?.pipedrive_api_token || '');
  const { t } = useTranslation();

  useEffect(() => {
    if (clinic) {
      setNome(clinic.nome);
      setAtiva(clinic.ativa);
      setPipedriveApiToken(clinic.pipedrive_api_token || '');
    } else {
      setNome('');
      setAtiva(true);
      setPipedriveApiToken('');
    }
  }, [clinic]);

  const handleSave = () => {
    if (!nome.trim()) {
      alert(t('manageClinics.form.nameRequired'));
      return;
    }

    onSave({
      nome,
      ativa,
      pipedrive_api_token,
      logo: null
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {clinic ? t('manageClinics.editClinic') : t('manageClinics.createNewClinic')}
      </DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label={t('manageClinics.form.nameLabel')}
          type="text"
          fullWidth
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />
        <FormControl fullWidth margin="dense">
          <InputLabel>{t('manageClinics.form.activateLabel')}</InputLabel>
          <Select
            value={ativa}
            onChange={(e) => setAtiva(e.target.value === 'true')}
          >
            <MenuItem value="true">{t('manageClinics.yes')}</MenuItem>
            <MenuItem value="false">{t('manageClinics.no')}</MenuItem>
          </Select>
        </FormControl>
        <TextField
          margin="dense"
          label={t('manageClinics.form.pipedriveLabel')}
          type="text"
          fullWidth
          value={pipedrive_api_token}
          onChange={(e) => setPipedriveApiToken(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('manageClinics.cancel')}</Button>
        <Button onClick={handleSave} color="primary">
          {t('manageClinics.save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ManageClinics;

