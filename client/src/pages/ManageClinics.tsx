import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Table, TableHead, TableBody, TableRow, TableCell, 
  Paper, TableContainer, Button, TextField, Dialog, 
  DialogTitle, DialogContent, DialogActions, TableSortLabel,
  CircularProgress, Alert, FormControl, InputLabel, Select,
  MenuItem, Typography
} from '@mui/material';
import { getClinics, createClinic, updateClinic, deleteClinic, Clinic } from '../api';

interface ClinicDialogProps {
  open: boolean;
  onClose: () => void;
  clinic: Clinic | null;
  onSave: (clinicData: Omit<Clinic, 'id' | 'created_at'>) => void;
}

const ManageClinics: React.FC = () => {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [currentClinic, setCurrentClinic] = useState<Clinic | null>(null);
  const [orderBy, setOrderBy] = useState<keyof Clinic>('nome');
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const { t } = useTranslation();

  useEffect(() => {
    fetchClinics();
  }, []);

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

  const handleDeleteClinic = async (id: number) => {
    try {
      await deleteClinic(id);
      fetchClinics();
    } catch (error) {
      console.error('Erro ao deletar clínica:', error);
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

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
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
                  <TableCell>{t('manageClinics.active')}</TableCell>
                  <TableCell>{t('manageClinics.actions')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedClinics.map((clinic) => (
                  <TableRow key={clinic.id}>
                    <TableCell>{clinic.nome}</TableCell>
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
                      <Button onClick={() => handleDeleteClinic(clinic.id)}>
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
            onSave={(clinicData: Omit<Clinic, 'id' | 'created_at'>) => 
              currentClinic 
                ? handleUpdateClinic(currentClinic.id, clinicData)
                : handleCreateClinic(clinicData)
            }
          />
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
