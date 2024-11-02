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
import api from '../api';

interface Service {
  id: number;
  nome: string;
  preco: number | null;
  moeda: 'BRL' | 'USD';
  descricao: string;
  duracao_padrao: string;
  ativo: boolean;
}

interface Doctor {
  id: number;
  usuario: {
    first_name: string;
    last_name: string;
  };
}

const ManageServices: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentService, setCurrentService] = useState<Service | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    fetchServices();
    fetchDoctors();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await api.get('/servicos/');
      setServices(response.data);
    } catch (error) {
      console.error('Erro ao buscar serviços:', error);
      setError(t('manageServices.error'));
    }
  };

  const fetchDoctors = async () => {
    try {
      const response = await api.get('/medicos/');
      setDoctors(response.data);
    } catch (error) {
      console.error('Erro ao buscar médicos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateService = async (serviceData: Omit<Service, 'id'>) => {
    try {
      await api.post('/servicos/', serviceData);
      fetchServices();
      setOpenDialog(false);
    } catch (error) {
      console.error('Erro ao criar serviço:', error);
      setError(t('manageServices.createError'));
    }
  };

  const handleUpdateService = async (id: number, serviceData: Partial<Service>) => {
    try {
      await api.put(`/servicos/${id}/`, serviceData);
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
        await api.delete(`/servicos/${id}/`);
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

  const formatPrice = (price: number | null) => {
    if (!price) return '-';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
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
              <TableCell>{t('manageServices.price')}</TableCell>
              <TableCell>{t('manageServices.duration')}</TableCell>
              <TableCell>{t('manageServices.status')}</TableCell>
              <TableCell>{t('common.actions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {services.map((service) => (
              <TableRow key={service.id}>
                <TableCell>{service.nome}</TableCell>
                <TableCell>{formatPrice(service.preco)}</TableCell>
                <TableCell>{formatDuration(service.duracao_padrao)}</TableCell>
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
                  <Button
                    onClick={() => {
                      setCurrentService(service);
                      setOpenDialog(true);
                    }}
                  >
                    {t('common.edit')}
                  </Button>
                  <Button
                    color="error"
                    onClick={() => handleDeleteService(service.id)}
                  >
                    {t('common.delete')}
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
  const [preco, setPreco] = useState(service?.preco?.toString() || '');
  const [moeda, setMoeda] = useState<'BRL' | 'USD'>(service?.moeda || 'BRL');
  const [descricao, setDescricao] = useState(service?.descricao || '');
  const [duracaoPadrao, setDuracaoPadrao] = useState(service?.duracao_padrao || '01:00');
  const [ativo, setAtivo] = useState(service?.ativo ?? true);
  const { t } = useTranslation();

  useEffect(() => {
    if (service) {
      setNome(service.nome);
      setPreco(service.preco?.toString() || '');
      setMoeda(service.moeda);
      setDescricao(service.descricao);
      setDuracaoPadrao(service.duracao_padrao);
      setAtivo(service.ativo);
    } else {
      setNome('');
      setPreco('');
      setMoeda('BRL');
      setDescricao('');
      setDuracaoPadrao('01:00');
      setAtivo(true);
    }
  }, [service]);

  const handleSubmit = () => {
    const serviceData = {
      nome,
      preco: parseFloat(preco),
      moeda,
      descricao,
      duracao_padrao: duracaoPadrao,
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
        />
        <div className="flex gap-4">
          <TextField
            margin="dense"
            label={t('manageServices.price')}
            type="number"
            fullWidth
            value={preco}
            onChange={(e) => setPreco(e.target.value)}
          />
          <FormControl margin="dense" style={{ minWidth: 120 }}>
            <InputLabel>{t('manageServices.currency')}</InputLabel>
            <Select
              value={moeda}
              onChange={(e) => setMoeda(e.target.value as 'BRL' | 'USD')}
            >
              <MenuItem value="BRL">BRL</MenuItem>
              <MenuItem value="USD">USD</MenuItem>
            </Select>
          </FormControl>
        </div>
        <TextField
          margin="dense"
          label={t('manageServices.description')}
          fullWidth
          multiline
          rows={4}
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
        />
        <TextField
          margin="dense"
          label={t('manageServices.duration')}
          type="time"
          fullWidth
          value={duracaoPadrao}
          onChange={(e) => setDuracaoPadrao(e.target.value)}
          InputLabelProps={{
            shrink: true,
          }}
          inputProps={{
            step: 300, // 5 min
          }}
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
        <Button onClick={handleSubmit} color="primary">
          {t('common.save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ManageServices;