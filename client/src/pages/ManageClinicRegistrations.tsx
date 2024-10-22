import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Table, TableHead, TableBody, TableRow, TableCell, Paper, TableContainer, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Typography } from '@mui/material';
import { getClinicRegistrations, updateClinicRegistrationStatus } from '../api';

interface ClinicRegistration {
  id: number;
  clinicName: string;
  ownerName: string;
  email: string;
  phone: string;
  address: string;
  status: 'pending' | 'approved' | 'rejected';
}

const ManageClinicRegistrations: React.FC = () => {
  const [registrations, setRegistrations] = useState<ClinicRegistration[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [currentRegistration, setCurrentRegistration] = useState<ClinicRegistration | null>(null);
  const { t, i18n } = useTranslation();

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    try {
      const response = await getClinicRegistrations();
      setRegistrations(response);
    } catch (error) {
      console.error('Erro ao buscar registros de clínicas:', error);
    }
  };

  const handleUpdateStatus = async (id: number, status: 'approved' | 'rejected') => {
    try {
      await updateClinicRegistrationStatus(id, status);
      fetchRegistrations();
    } catch (error) {
      console.error('Erro ao atualizar status do registro:', error);
    }
  };

  const filteredRegistrations = registrations.filter((registration) =>
    Object.values(registration).some((value) =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="flex flex-col min-h-screen">
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">{t('manageClinicRegistrations')}</h1>
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
                <TableCell>{t('clinicName')}</TableCell>
                <TableCell>{t('ownerName')}</TableCell>
                <TableCell>{t('email')}</TableCell>
                <TableCell>{t('phone')}</TableCell>
                <TableCell>{t('status')}</TableCell>
                <TableCell>{t('actions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRegistrations.map((registration) => (
                <TableRow key={registration.id}>
                  <TableCell>{registration.clinicName}</TableCell>
                  <TableCell>{registration.ownerName}</TableCell>
                  <TableCell>{registration.email}</TableCell>
                  <TableCell>{registration.phone}</TableCell>
                  <TableCell>{t(registration.status)}</TableCell>
                  <TableCell>
                    <Button onClick={() => { setCurrentRegistration(registration); setOpenDialog(true); }}>
                      {t('viewDetails')}
                    </Button>
                    {registration.status === 'pending' && (
                      <>
                        <Button onClick={() => handleUpdateStatus(registration.id, 'approved')}>
                          {t('approve')}
                        </Button>
                        <Button onClick={() => handleUpdateStatus(registration.id, 'rejected')}>
                          {t('reject')}
                        </Button>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <RegistrationDialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          registration={currentRegistration}
        />
      </div>
    </div>
  );
};

interface RegistrationDialogProps {
  open: boolean;
  onClose: () => void;
  registration: ClinicRegistration | null;
}

const RegistrationDialog: React.FC<RegistrationDialogProps> = ({ open, onClose, registration }) => {
  const { t } = useTranslation();

  if (!registration) return null;

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{t('registrationDetails')}</DialogTitle>
      <DialogContent>
        <Typography><strong>{t('clinicName')}:</strong> {registration.clinicName}</Typography>
        <Typography><strong>{t('ownerName')}:</strong> {registration.ownerName}</Typography>
        <Typography><strong>{t('email')}:</strong> {registration.email}</Typography>
        <Typography><strong>{t('phone')}:</strong> {registration.phone}</Typography>
        <Typography><strong>{t('address')}:</strong> {registration.address}</Typography>
        <Typography><strong>{t('status')}:</strong> {t(registration.status)}</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('close')}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ManageClinicRegistrations;
