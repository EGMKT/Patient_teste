import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  TableContainer,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Chip,
  FormControl,
  Select,
  MenuItem
} from '@mui/material';
import api from '../api';
import { Registration, RegistrationDialogProps } from '../types';

const ManageRegistrations: React.FC = () => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    try {
      const response = await api.get('/clinic-registrations/');
      setRegistrations(response.data);
    } catch (error) {
      console.error('Erro ao buscar registros:', error);
    }
  };

  const handleStatusChange = async (id: number, status: string, notes: string = '') => {
    try {
      await api.put(`/clinic-registrations/${id}/`, { status, notes });
      fetchRegistrations();
      setOpenDialog(false);
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Typography variant="h4" className="mb-4">
        {t('manageRegistrations.title')}
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t('manageRegistrations.clinicName')}</TableCell>
              <TableCell>{t('manageRegistrations.ownerName')}</TableCell>
              <TableCell>{t('manageRegistrations.email')}</TableCell>
              <TableCell>{t('manageRegistrations.statusLabel')}</TableCell>
              <TableCell>{t('manageRegistrations.createdAt')}</TableCell>
              <TableCell>{t('manageRegistrations.actions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {registrations.map((registration) => (
              <TableRow key={registration.id}>
                <TableCell>{registration.name}</TableCell>
                <TableCell>{registration.owner_name}</TableCell>
                <TableCell>{registration.email}</TableCell>
                <TableCell>
                  <Chip
                    label={t(`manageRegistrations.status.${registration.status}`)}
                    color={
                      registration.status === 'approved'
                        ? 'success'
                        : registration.status === 'rejected'
                        ? 'error'
                        : 'default'
                    }
                  />
                </TableCell>
                <TableCell>
                  {new Date(registration.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Button
                    onClick={() => {
                      setSelectedRegistration(registration);
                      setOpenDialog(true);
                    }}
                  >
                    {t('manageRegistrations.viewDetails')}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <RegistrationDialog
        open={openDialog}
        registration={selectedRegistration}
        onClose={() => setOpenDialog(false)}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
};

const RegistrationDialog: React.FC<RegistrationDialogProps> = ({
  open,
  registration,
  onClose,
  onStatusChange,
}) => {
  const [status, setStatus] = useState<string>('');
  const [notes, setNotes] = useState('');
  const { t } = useTranslation();

  useEffect(() => {
    if (registration) {
      setStatus(registration.status);
      setNotes(registration.notes || '');
    }
  }, [registration]);

  const handleSubmit = () => {
    if (registration) {
      onStatusChange(registration.id, status, notes);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{t('manageRegistrations.registrationDetails')}</DialogTitle>
      <DialogContent>
        {registration && (
          <div className="space-y-4">
            <div>
              <Typography variant="subtitle2">{t('manageRegistrations.clinicName')}</Typography>
              <Typography>{registration.name}</Typography>
            </div>
            <div>
              <Typography variant="subtitle2">{t('manageRegistrations.ownerName')}</Typography>
              <Typography>{registration.owner_name}</Typography>
            </div>
            <div>
              <Typography variant="subtitle2">{t('manageRegistrations.email')}</Typography>
              <Typography>{registration.email}</Typography>
            </div>
            <div>
              <Typography variant="subtitle2">{t('manageRegistrations.phone')}</Typography>
              <Typography>{registration.phone}</Typography>
            </div>
            <FormControl fullWidth margin="normal">
              <Typography variant="subtitle2">{t('manageRegistrations.statusLabel')}</Typography>
              <Select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <MenuItem value="pending">{t('manageRegistrations.status.pending')}</MenuItem>
                <MenuItem value="approved">{t('manageRegistrations.status.approved')}</MenuItem>
                <MenuItem value="rejected">{t('manageRegistrations.status.rejected')}</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              multiline
              rows={4}
              label={t('manageRegistrations.notes')}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              margin="normal"
            />
          </div>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('manageRegistrations.cancel')}</Button>
        <Button onClick={handleSubmit} color="primary">
          {t('manageRegistrations.save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ManageRegistrations;
