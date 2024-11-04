import React, { useState, useEffect } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, Button, TextField, IconButton,
  TablePagination, Chip, Tooltip, CircularProgress
} from '@mui/material';
import { Delete, Edit, Visibility } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { Patient } from '../types';
import api, { getPacientesByClinica } from '../api';
import ConfirmActionDialog from '../components/ConfirmActionDialog';

interface PatientsManagementProps {
  clinicId: number;
}

interface ApiResponse {
  data: any[];
}

const PatientsManagement: React.FC<PatientsManagementProps> = ({ clinicId }) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<{open: boolean; patientId: string | null}>({
    open: false,
    patientId: null
  });
  const { t } = useTranslation();

  useEffect(() => {
    fetchPatients();
  }, [clinicId]);

  const formatPatientData = (rawData: any[]): Patient[] => {
    return rawData.map(patient => ({
      id: patient.id,
      nome: patient.nome,
      email: Array.isArray(patient.email) 
        ? patient.email.find((e: any) => e.primary)?.value || ''
        : typeof patient.email === 'object' 
          ? patient.email.value || ''
          : patient.email || '',
      idade: patient.idade,
      genero: patient.genero,
      ocupacao: patient.ocupacao,
      localizacao: patient.localizacao,
      is_novo: patient.is_novo,
      data_cadastro: patient.data_cadastro,
      clinica: {
        id: clinicId,
        nome: patient.clinica?.nome || ''
      }
    }));
  };

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const response = await getPacientesByClinica(clinicId);
      const formattedData = formatPatientData(Array.isArray(response) ? response : []);
      setPatients(formattedData);
    } catch (error) {
      console.error('Erro ao buscar pacientes:', error);
      setError(t('patients.errors.fetchError'));
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter(patient =>
    patient.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteClick = (patientId: string) => {
    setConfirmDelete({ open: true, patientId });
  };

  const handleConfirmDelete = async () => {
    if (!confirmDelete.patientId) return;
    
    try {
      await api.delete(`/pacientes/${confirmDelete.patientId}/`);
      await fetchPatients(); // Recarrega a lista após excluir
      setConfirmDelete({ open: false, patientId: null });
    } catch (error) {
      console.error('Erro ao excluir paciente:', error);
      setError(t('common.errors.deleteError'));
    }
  };

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-4">
      <TextField
        fullWidth
        label={t('common.search')}
        variant="outlined"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t('patients.name')}</TableCell>
              <TableCell>{t('patients.email')}</TableCell>
              <TableCell>{t('patients.age')}</TableCell>
              <TableCell>{t('patients.gender')}</TableCell>
              <TableCell>{t('patients.occupation')}</TableCell>
              <TableCell>{t('patients.location')}</TableCell>
              <TableCell>{t('patients.status')}</TableCell>
              <TableCell>{t('common.actions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredPatients
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell>{patient.nome}</TableCell>
                  <TableCell>{patient.email}</TableCell>
                  <TableCell>{patient.idade}</TableCell>
                  <TableCell>{patient.genero}</TableCell>
                  <TableCell>{patient.ocupacao}</TableCell>
                  <TableCell>{patient.localizacao}</TableCell>
                  <TableCell>
                    <Chip
                      label={patient.is_novo ? t('patients.new') : t('patients.returning')}
                      color={patient.is_novo ? 'primary' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Tooltip title={t('common.actions.edit')}>
                      <IconButton size="small">
                        <Edit />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={t('common.actions.delete')}>
                      <IconButton 
                        onClick={() => handleDeleteClick(patient.id)}
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
          count={filteredPatients.length}
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

      {/* Dialog de confirmação */}
      <ConfirmActionDialog
        open={confirmDelete.open}
        onClose={() => setConfirmDelete({ open: false, patientId: null })}
        onConfirm={handleConfirmDelete}
        title={t('patients.confirmDelete.title')}
        message={t('patients.confirmDelete.message')}
      />
    </div>
  );
};

export default PatientsManagement;