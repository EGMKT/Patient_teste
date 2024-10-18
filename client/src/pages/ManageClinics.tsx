import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, TextField, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { getClinics, createClinic, updateClinic, deleteClinic } from '../api';

interface Clinic {
  id: number;
  name: string;
  address: string;
}

const ManageClinics: React.FC = () => {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [open, setOpen] = useState(false);
  const [currentClinic, setCurrentClinic] = useState<Clinic | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    fetchClinics();
  }, []);

  const fetchClinics = async () => {
    try {
      const fetchedClinics = await getClinics();
      setClinics(fetchedClinics);
    } catch (error) {
      console.error('Error fetching clinics:', error);
    }
  };

  const handleOpen = (clinic: Clinic | null = null) => {
    setCurrentClinic(clinic);
    setOpen(true);
  };

  const handleClose = () => {
    setCurrentClinic(null);
    setOpen(false);
  };

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const clinicData = {
      name: formData.get('name') as string,
      address: formData.get('address') as string,
    };

    try {
      if (currentClinic) {
        await updateClinic(currentClinic.id, clinicData);
      } else {
        await createClinic(clinicData);
      }
      fetchClinics();
      handleClose();
    } catch (error) {
      console.error('Error saving clinic:', error);
    }
  };

  const handleDelete = async (clinicId: number) => {
    try {
      await deleteClinic(clinicId);
      fetchClinics();
    } catch (error) {
      console.error('Error deleting clinic:', error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{t('manageClinics')}</h1>
      <Button variant="contained" color="primary" onClick={() => handleOpen()} className="mb-4">
        {t('addClinic')}
      </Button>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t('id')}</TableCell>
              <TableCell>{t('name')}</TableCell>
              <TableCell>{t('address')}</TableCell>
              <TableCell>{t('actions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {clinics.map((clinic) => (
              <TableRow key={clinic.id}>
                <TableCell>{clinic.id}</TableCell>
                <TableCell>{clinic.name}</TableCell>
                <TableCell>{clinic.address}</TableCell>
                <TableCell>
                  <Button variant="contained" color="primary" onClick={() => handleOpen(clinic)} className="mr-2">
                    {t('edit')}
                  </Button>
                  <Button variant="contained" color="secondary" onClick={() => handleDelete(clinic.id)}>
                    {t('delete')}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{currentClinic ? t('editClinic') : t('addClinic')}</DialogTitle>
        <form onSubmit={handleSave}>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              name="name"
              label={t('name')}
              type="text"
              fullWidth
              defaultValue={currentClinic?.name || ''}
            />
            <TextField
              margin="dense"
              name="address"
              label={t('address')}
              type="text"
              fullWidth
              defaultValue={currentClinic?.address || ''}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>{t('cancel')}</Button>
            <Button type="submit">{t('save')}</Button>
          </DialogActions>
        </form>
      </Dialog>
    </div>
  );
};

export default ManageClinics;