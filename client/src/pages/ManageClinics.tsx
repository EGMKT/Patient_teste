import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Table, TableHead, TableBody, TableRow, TableCell, Paper, TableContainer, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, TableSortLabel } from '@mui/material';
import { getClinics, createClinic, updateClinic, deleteClinic, Clinic } from '../api';

const ManageClinics: React.FC = () => {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [currentClinic, setCurrentClinic] = useState<Clinic | null>(null);
  const { t } = useTranslation();
  const [orderBy, setOrderBy] = useState<keyof Clinic>('nome');
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    fetchClinics();
  }, []);

  const fetchClinics = async () => {
    try {
      const response = await getClinics();
      setClinics(response);
    } catch (error) {
      console.error('Erro ao buscar clínicas:', error);
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

  return (
    <div className="flex flex-col min-h-screen">
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">{t('manageClinics')}</h1>
        <Button onClick={() => { setCurrentClinic(null); setOpenDialog(true); }} variant="contained" color="primary" className="mb-4">
          {t('createClinic')}
        </Button>
        <TextField
          label={t('search')}
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          fullWidth
          margin="normal"
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
                    {t('name')}
                  </TableSortLabel>
                </TableCell>
                <TableCell>{t('createdAt')}</TableCell>
                <TableCell>{t('active')}</TableCell>
                <TableCell>{t('actions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedClinics.map((clinic) => (
                <TableRow key={clinic.id}>
                  <TableCell>{clinic.nome}</TableCell>
                  <TableCell>{new Date(clinic.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>{clinic.ativa ? t('yes') : t('no')}</TableCell>
                  <TableCell>
                    <Button onClick={() => { setCurrentClinic(clinic); setOpenDialog(true); }}>
                      {t('edit')}
                    </Button>
                    <Button onClick={() => handleDeleteClinic(clinic.id)}>
                      {t('delete')}
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
          onSave={(clinicData) => {
            if (currentClinic) {
              handleUpdateClinic(currentClinic.id, clinicData);
            } else {
              handleCreateClinic(clinicData);
            }
          }}
        />
      </div>
    </div>
  );
};

interface ClinicDialogProps {
  open: boolean;
  onClose: () => void;
  clinic: Clinic | null;
  onSave: (clinicData: Omit<Clinic, 'id' | 'created_at'>) => void;
}

const ClinicDialog: React.FC<ClinicDialogProps> = ({ open, onClose, clinic, onSave }) => {
  const [nome, setNome] = useState(clinic?.nome || '');
  const [ativa, setAtiva] = useState<boolean>(clinic?.ativa || true);
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
    const clinicData: Omit<Clinic, 'id' | 'created_at'> = {
      nome,
      ativa,
      pipedrive_api_token,
      logo: null // We're not handling logo upload in this example
    };

    onSave(clinicData);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{clinic ? t('editClinic') : t('createClinic')}</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label={t('name')}
          type="text"
          fullWidth
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />
        <TextField
          margin="dense"
          label={t('pipedriveApiToken')}
          type="text"
          fullWidth
          value={pipedrive_api_token}
          onChange={(e) => setPipedriveApiToken(e.target.value)}
        />
        <TextField
          margin="dense"
          label={t('active')}
          select
          fullWidth
          value={ativa ? 'true' : 'false'}
          onChange={(e) => setAtiva(e.target.value === 'true')}
        >
          <option value="true">{t('yes')}</option>
          <option value="false">{t('no')}</option>
        </TextField>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('cancel')}</Button>
        <Button onClick={handleSave}>{t('save')}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ManageClinics;
