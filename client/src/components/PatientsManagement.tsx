import React, { useState, useEffect } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, Button, TextField, IconButton,
  TablePagination, Chip, Tooltip, CircularProgress
} from '@mui/material';
import { Delete, Edit, Visibility } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { Patient } from '../types';
import api from '../api';

interface PatientsManagementProps {
  clinicId: number;
}

const PatientsManagement: React.FC<PatientsManagementProps> = ({ clinicId }) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const { t } = useTranslation();

  useEffect(() => {
    fetchPatients();
  }, [clinicId]);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/clinicas/${clinicId}/pacientes/`);
      setPatients(response.data);
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
                    <Tooltip title={t('common.actions.view')}>
                      <IconButton size="small">
                        <Visibility />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={t('common.actions.edit')}>
                      <IconButton size="small">
                        <Edit />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={t('common.actions.delete')}>
                      <IconButton size="small" color="error">
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
    </div>
  );
};

export default PatientsManagement;