import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getAudiosNaoEnviados, sincronizarAudios } from '../audioStorage';
import { getPipedrivePatients } from '../api';
import Sidebar from '../components/Sidebar';
import { TextField, Button, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import * as Yup from 'yup';

interface Patient {
  id: string;
  name: string;
}

const ConsultationSetup: React.FC = () => {
  const { t } = useTranslation();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [service, setService] = useState('');
  const [participants, setParticipants] = useState(2);
  const navigate = useNavigate();
  const [audiosNaoEnviados, setAudiosNaoEnviados] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const services = [
    t('generalConsultation'),
    t('routineExam'),
    t('followUp'),
    t('specializedEvaluation'),
    t('minorProcedure')
  ];

  const validationSchema = Yup.object().shape({
    patient: Yup.string().required('Nome do paciente é obrigatório'),
    service: Yup.string().required('Serviço é obrigatório'),
    participants: Yup.number().min(2, 'Mínimo de 2 participantes').max(5, 'Máximo de 5 participantes'),
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [patientsData, audiosData] = await Promise.all([
          getPipedrivePatients(),
          getAudiosNaoEnviados()
        ]);

        console.log('Dados recebidos:', patientsData);
        if (patientsData && patientsData.data) {
          setPatients(patientsData.data.map((patient: any) => ({
            id: patient.id.toString(),
            name: patient.name
          })));
        } else {
          console.error('Formato de dados inesperado:', patientsData);
          setPatients([]);
        }

        setAudiosNaoEnviados(audiosData);
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
        setPatients([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []); // Dependência vazia para garantir que seja executado apenas uma vez

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const values = {
      patient: selectedPatient,
      service: service,
      participants: participants,
    };

    try {
      await validationSchema.validate(values);
      const currentDate = new Date().toISOString();
    } catch (error) {
      console.error('Erro na validação ou criação da consulta:', error);
    }
  };

  const handleSincronizar = async () => {
    await sincronizarAudios();
    const audios = await getAudiosNaoEnviados();
    setAudiosNaoEnviados(audios);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold mb-8 text-center">{t('consultationSetup')}</h1>
      {isLoading ? (
        <div>Carregando...</div>
      ) : (
        <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
          <FormControl fullWidth>
            <InputLabel id="patient-select-label">{t('selectPatient')}</InputLabel>
            <Select
              labelId="patient-select-label"
              value={selectedPatient}
              onChange={(e) => setSelectedPatient(e.target.value as string)}
              required
            >
              {patients.map((patient: Patient) => (
                <MenuItem key={patient.id} value={patient.id}>{patient.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel id="service-select-label">{t('selectService')}</InputLabel>
            <Select
              labelId="service-select-label"
              value={service}
              onChange={(e) => setService(e.target.value as string)}
              required
            >
              {services.map((s, index) => (
                <MenuItem key={index} value={s}>{s}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <div>
            <p className="mb-2">{t('participants')}:</p>
            <div className="flex justify-between">
              {[2, 3, 4, 5].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setParticipants(num)}
                  className={`px-4 py-2 rounded-full ${
                    participants === num ? 'bg-blue-500 text-white' : 'bg-gray-200'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
          >
            {t('startRecording')}
          </Button>
        </form>
      )}
      <Sidebar audios={audiosNaoEnviados} onSincronizar={handleSincronizar} />
    </div>
  );
};

export default ConsultationSetup;
