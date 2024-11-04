// src/components/ConsultationManagement.tsx
import React, { useState, useEffect } from 'react';
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, 
  TableRow, Paper, Button, Dialog, TextField, IconButton,
  TablePagination, Chip, Tooltip, CircularProgress
} from '@mui/material';
import { Delete, Visibility, History } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { getConsultasByClinica, deleteConsulta } from '../api';
import { Consulta, ConsultationManagementProps } from '../types';
import ConfirmActionDialog from './ConfirmActionDialog';
import ConsultationDetailsComponent from '../pages/ConsultationDetails';

const ConsultationManagement: React.FC<ConsultationManagementProps> = ({ clinicId }) => {
  const [consultations, setConsultations] = useState<Consulta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<{open: boolean; consultaId: number | null}>({
    open: false,
    consultaId: null
  });
  const [selectedConsultation, setSelectedConsultation] = useState<Consulta | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    fetchConsultations();
  }, [clinicId]);

  const fetchConsultations = async () => {
    try {
      setLoading(true);
      const data = await getConsultasByClinica(clinicId);
      setConsultations(data);
      setError(null);
    } catch (error) {
      console.error('Erro ao buscar consultas:', error);
      setError(t('common.errors.fetchError'));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (consultaId: number) => {
    setConfirmDelete({ open: true, consultaId });
  };

  const handleConfirmDelete = async () => {
    if (!confirmDelete.consultaId) return;
    
    try {
      await deleteConsulta(confirmDelete.consultaId);
      await fetchConsultations();
      setConfirmDelete({ open: false, consultaId: null });
    } catch (error) {
      console.error('Erro ao excluir consulta:', error);
      setError(t('common.errors.deleteError'));
    }
  };

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

  const filteredConsultations = consultations.filter(consultation => 
    (consultation.paciente?.nome || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (consultation.medico?.usuario?.nome || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center p-4">
        <CircularProgress />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 p-4">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <TextField
        fullWidth
        label={t('common.search')}
        variant="outlined"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-4"
      />

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t('consultation.date')}</TableCell>
              <TableCell>{t('consultation.doctor')}</TableCell>
              <TableCell>{t('consultation.patient')}</TableCell>
              <TableCell>{t('consultation.service')}</TableCell>
              <TableCell>{t('consultation.duration')}</TableCell>
              <TableCell>{t('consultation.status')}</TableCell>
              <TableCell>{t('common.actions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredConsultations
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((consultation) => (
                <TableRow key={consultation.id}>
                  <TableCell>
                    {new Date(consultation.data).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {consultation.medico?.usuario?.nome 
                      ? `${consultation.medico.usuario.nome} - ${consultation.medico.especialidade}`
                      : t('common.notAvailable')}
                  </TableCell>
                  <TableCell>
                    {consultation.paciente?.nome || t('common.notAvailable')}
                  </TableCell>
                  <TableCell>
                    {consultation.servico?.nome || t('common.notAvailable')}
                  </TableCell>
                  <TableCell>
                    {`${Math.floor(consultation.duracao / 60)}:${String(consultation.duracao % 60).padStart(2, '0')}`}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={t(`consultation.status.${consultation.status || 'unknown'}`)}
                      color={getStatusColor(consultation.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Tooltip title={t('common.actions.view')}>
                      <IconButton 
                        onClick={() => setSelectedConsultation(consultation)}
                        size="small"
                      >
                        <Visibility />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={t('common.actions.delete')}>
                      <IconButton 
                        onClick={() => handleDeleteClick(consultation.id)}
                        size="small"
                        color="error"
                      >
                        <Delete />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={filteredConsultations.length}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(parseInt(event.target.value, 10));
            setPage(0);
          }}
          labelRowsPerPage={t('common.rowsPerPage')}
        />
      </TableContainer>

      <ConfirmActionDialog
        open={confirmDelete.open}
        onClose={() => setConfirmDelete({ open: false, consultaId: null })}
        onConfirm={handleConfirmDelete}
        title={t('consultation.confirmDelete.title')}
        message={t('consultation.confirmDelete.message')}
      />

      {selectedConsultation && (
        <Dialog
          open={Boolean(selectedConsultation)}
          onClose={() => setSelectedConsultation(null)}
          maxWidth="md"
          fullWidth
        >
          <ConsultationDetailsComponent
            consultationId={selectedConsultation.id.toString()}
            onClose={() => setSelectedConsultation(null)}
          />
        </Dialog>
      )}
    </div>
  );
};

export default ConsultationManagement;