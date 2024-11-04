// src/components/ConsultationManagement.tsx
import React, { useState, useEffect } from 'react';
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, 
  TableRow, Paper, Button, Dialog 
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { getConsultasByClinica, deleteConsulta } from '../api';
import { Consulta, ConsultationManagementProps } from '../types';

const ConsultationManagement: React.FC<ConsultationManagementProps> = ({ clinicId }) => {
  const [consultations, setConsultations] = useState<Consulta[]>([]);
  const { t } = useTranslation();

  useEffect(() => {
    fetchConsultations();
  }, [clinicId]);

  const fetchConsultations = async () => {
    const data = await getConsultasByClinica(clinicId);
    setConsultations(data);
  };

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Data</TableCell>
            <TableCell>Médico</TableCell>
            <TableCell>Paciente</TableCell>
            <TableCell>Serviço</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Ações</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {consultations.map((consultation) => (
            <TableRow key={consultation.id}>
              <TableCell>{new Date(consultation.data).toLocaleString()}</TableCell>
              <TableCell>{consultation.medico.usuario.nome}</TableCell>
              <TableCell>{consultation.paciente.nome}</TableCell>
              <TableCell>{consultation.servico.nome}</TableCell>
              <TableCell>
                {consultation.ai_processed ? 'Processado' : 'Pendente'}
              </TableCell>
              <TableCell>
                <Button 
                  onClick={() => window.open(`/consultation/${consultation.id}`)}
                >
                  Ver Detalhes
                </Button>
                <Button 
                  color="error"
                  onClick={() => deleteConsulta(consultation.id)}
                >
                  Excluir
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ConsultationManagement;