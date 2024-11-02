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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  Alert,
} from '@mui/material';
import api, { getServices, createService, updateService, deleteService, Service } from '../api';


const ManageServices: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentService, setCurrentService] = useState<Service | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await getServices();
      setServices(response);
    } catch (error) {
      console.error('Erro ao buscar serviços:', error);
      setError(t('manageServices.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateService = async (serviceData: Omit<Service, 'id'>) => {
    try {
      await createService(serviceData);
      fetchServices();
      setOpenDialog(false);
    } catch (error) {
      console.error('Erro ao criar serviço:', error);
      setError(t('manageServices.createError'));
    }
  };

  const handleUpdateService = async (id: number, serviceData: Partial<Service>) => {
    try {
      await updateService(id, serviceData);
      fetchServices();
      setOpenDialog(false);
    } catch (error) {
      console.error('Erro ao atualizar serviço:', error);
      setError(t('manageServices.updateError'));
    }
  };

  const handleDeleteService = async (id: number) => {
    if (window.confirm(t('manageServices.confirmDelete'))) {
      try {
        await deleteService(id);
        fetchServices();
      } catch (error) {
        console.error('Erro ao excluir serviço:', error);
        setError(t('manageServices.deleteError'));
      }
    }
  };

  const formatDuration = (duration: string) => {
    const [hours, minutes] = duration.split(':');
    return `${hours}h${minutes}min`;
  };

  if (loading) {
    return <div className="flex justify-center p-4">{t('common.loading')}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <Typography variant="h4">{t('manageServices.title')}</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            setCurrentService(null);
            setOpenDialog(true);
          }}
        >
          {t('manageServices.createService')}
        </Button>
      </div>

      {error && (
        <Alert severity="error" onClose={() => setError(null)} className="mb-4">
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t('manageServices.name')}</TableCell>
              <TableCell>{t('manageServices.description')}</TableCell>
              <TableCell>{t('manageServices.statusLabel')}</TableCell>
              <TableCell>{t('manageServices.actions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {services.map((service) => (
              <TableRow key={service.id}>
                <TableCell>{service.nome}</TableCell>
                <TableCell>{service.descricao}</TableCell>
                <TableCell>
                  <Switch
                    checked={service.ativo}
                    onChange={async () => {
                      await handleUpdateService(service.id, {
                        ...service,
                        ativo: !service.ativo
                      });
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Button onClick={() => {
                    setCurrentService(service);
                    setOpenDialog(true);
                  }}>
                    {t('manageServices.edit')}
                  </Button>
                  <Button
                    color="error"
                    onClick={() => handleDeleteService(service.id)}
                  >
                    {t('manageServices.delete')}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <ServiceDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        service={currentService}
        onSave={(serviceData) =>
          currentService
            ? handleUpdateService(currentService.id, serviceData)
            : handleCreateService(serviceData)
        }
      />
    </div>
  );
};

interface ServiceDialogProps {
  open: boolean;
  onClose: () => void;
  service: Service | null;
  onSave: (serviceData: any) => void;
}

const ServiceDialog: React.FC<ServiceDialogProps> = ({
  open,
  onClose,
  service,
  onSave,
}) => {
  const [nome, setNome] = useState(service?.nome || '');
  const [descricao, setDescricao] = useState(service?.descricao || '');
  const [ativo, setAtivo] = useState(service?.ativo ?? true);
  const { t } = useTranslation();

  useEffect(() => {
    if (service) {
      setNome(service.nome);
      setDescricao(service.descricao || '');
      setAtivo(service.ativo);
    } else {
      setNome('');
      setDescricao('');
      setAtivo(true);
    }
  }, [service]);

  const handleSubmit = () => {
    const serviceData = {
      nome,
      descricao,
      ativo,
    };

    onSave(serviceData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {service ? t('manageServices.editService') : t('manageServices.createService')}
      </DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label={t('manageServices.name')}
          fullWidth
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
        />
        <TextField
          margin="dense"
          label={t('manageServices.description')}
          fullWidth
          multiline
          rows={4}
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
        />
        <FormControl fullWidth margin="dense">
          <Typography component="div">
            <Switch
              checked={ativo}
              onChange={(e) => setAtivo(e.target.checked)}
            />
            {t('manageServices.active')}
          </Typography>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('common.cancel')}</Button>
        <Button onClick={handleSubmit} color="primary" disabled={!nome}>
          {t('common.save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ManageServices;