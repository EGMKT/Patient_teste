import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Table, TableHead, TableBody, TableRow, TableCell, Paper, TableContainer, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, TableSortLabel } from '@mui/material';
import { getClinics, createClinic, updateClinic, deleteClinic, Clinic } from '../api';
import Header from '../components/Header';

const ManageClinics: React.FC = () => {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [currentClinic, setCurrentClinic] = useState<Clinic | null>(null);
  const { t, i18n } = useTranslation();
  const [orderBy, setOrderBy] = useState<keyof Clinic>('name');
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

  const handleCreateClinic = async (clinicData: Omit<Clinic, 'id' | 'createdAt'>) => {
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

  const sortedClinics = filteredClinics.sort((a, b) => {
    if (a[orderBy] < b[orderBy]) return order === 'asc' ? -1 : 1;
    if (a[orderBy] > b[orderBy]) return order === 'asc' ? 1 : -1;
    return 0;
  });

  return (
    <div className="flex flex-col min-h-screen">
      <Header 
        onLanguageChange={(lang) => i18n.changeLanguage(lang)} 
        currentLanguage={i18n.language}
      />
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
                    active={orderBy === 'name'}
                    direction={orderBy === 'name' ? order : 'asc'}
                    onClick={() => handleRequestSort('name')}
                  >
                    {t('name')}
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'email'}
                    direction={orderBy === 'email' ? order : 'asc'}
                    onClick={() => handleRequestSort('email')}
                  >
                    {t('email')}
                  </TableSortLabel>
                </TableCell>
                <TableCell>{t('address')}</TableCell>
                <TableCell>{t('phone')}</TableCell>
                <TableCell>{t('status')}</TableCell>
                <TableCell>{t('actions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedClinics.map((clinic) => (
                <TableRow key={clinic.id}>
                  <TableCell>{clinic.name}</TableCell>
                  <TableCell>{clinic.email}</TableCell>
                  <TableCell>{clinic.address}</TableCell>
                  <TableCell>{clinic.phone}</TableCell>
                  <TableCell>{t(clinic.status)}</TableCell>
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
  onSave: (clinicData: Omit<Clinic, 'id' | 'createdAt'>) => void;
}

const ClinicDialog: React.FC<ClinicDialogProps> = ({ open, onClose, clinic, onSave }) => {
  const [name, setName] = useState(clinic?.name || '');
  const [email, setEmail] = useState(clinic?.email || '');
  const [password, setPassword] = useState('');
  const [address, setAddress] = useState(clinic?.address || '');
  const [phone, setPhone] = useState(clinic?.phone || '');
  const [status, setStatus] = useState<'active' | 'inactive'>(clinic?.status || 'active');
  const { t } = useTranslation();

  useEffect(() => {
    if (clinic) {
      setName(clinic.name);
      setEmail(clinic.email);
      setAddress(clinic.address);
      setPhone(clinic.phone);
      setStatus(clinic.status);
    } else {
      setName('');
      setEmail('');
      setAddress('');
      setPhone('');
      setStatus('active');
    }
  }, [clinic]);

  const handleSave = () => {
    const clinicData: Omit<Clinic, 'id' | 'createdAt'> = {
      name,
      email,
      password,
      address,
      phone,
      status
    };

    if (password) {
      clinicData.password = password;
    }

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
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <TextField
          margin="dense"
          label={t('email')}
          type="email"
          fullWidth
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          margin="dense"
          label={t('address')}
          type="text"
          fullWidth
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
        <TextField
          margin="dense"
          label={t('phone')}
          type="text"
          fullWidth
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <TextField
          margin="dense"
          label={t('status')}
          select
          fullWidth
          value={status}
          onChange={(e) => setStatus(e.target.value as 'active' | 'inactive')}
        >
          <option value="active">{t('active')}</option>
          <option value="inactive">{t('inactive')}</option>
        </TextField>
        {!clinic && (
          <TextField
            margin="dense"
            label={t('password')}
            type="password"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('cancel')}</Button>
        <Button onClick={handleSave}>{t('save')}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ManageClinics;
