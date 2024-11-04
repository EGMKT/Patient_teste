import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getPipedrivePatients, getMedicoServicos } from '../api';
import { TextField, Button, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import * as Yup from 'yup';
import { useAuth } from '../contexts/AuthContext';
import { Patient, ConsultationSetupService } from '../types';

const ConsultationSetup: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [service, setService] = useState<number>(0);
  const [participants, setParticipants] = useState(2);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [clinicName, setClinicName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState('pt');
  const [services, setServices] = useState<ConsultationSetupService[]>([]);

  const validationSchema = Yup.object().shape({
    patient: Yup.string().required('Nome do paciente é obrigatório'),
    service: Yup.string().required('Serviço é obrigatório'),
    participants: Yup.number().min(2, 'Mínimo de 2 participantes').max(5, 'Máximo de 5 participantes'),
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [patientsData, servicesData] = await Promise.all([
          getPipedrivePatients(),
          getMedicoServicos()
        ]);

        if (patientsData && patientsData.data) {
          setPatients(patientsData.data.map((patient: any) => ({
            id: patient.id.toString(),
            name: patient.name
          })));
        }

        console.log('Serviços recebidos:', servicesData);
        setServices(servicesData);
      } catch (error: any) {
        console.error('Erro ao buscar dados:', error);
        const errorMessage = error.response?.data?.error || 'Erro ao carregar dados. Verifique sua conexão e tente novamente.';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    try {
      if (!selectedPatient || !service) {
        throw new Error('Selecione um paciente e um serviço');
      }

      const currentDate = new Date().toISOString();
      const selectedService = services.find(s => s.id === service);
      
      if (!selectedService) {
        throw new Error('Serviço não selecionado');
      }
      
      navigate('/audio-recording', { 
        state: { 
          patientId: selectedPatient,
          serviceId: service,
          serviceName: selectedService.nome,
          participants: participants,
          language: language,
          startTime: currentDate,
          patientName: patients.find(p => p.id === selectedPatient)?.nome
        } 
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
    }
  };

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-grow flex flex-col items-center justify-center p-4">
        <h1 className="text-3xl font-bold mb-8 text-center">{t('consultation.setup.title')}</h1>
        {isLoading ? (
          <div>{t('consultation.setup.loading')}</div>
        ) : error ? (
          <div className="text-red-500">{t('consultation.setup.error')}</div>
        ) : (
          <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
            <FormControl fullWidth>
              <InputLabel id="patient-select-label">{t('consultation.setup.patientName')}</InputLabel>
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
              <InputLabel id="service-select-label">{t('consultation.setup.selectService')}</InputLabel>
              <Select
                labelId="service-select-label"
                value={service}
                onChange={(e) => setService(e.target.value as number)}
                required
              >
                {services.map((s) => (
                  <MenuItem key={s.id} value={s.id}>{s.nome}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <div>
              <p className="mb-2">{t('consultation.setup.participants')}:</p>
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
            <div>
              <p className="mb-2">{t('consultation.setup.language')}:</p>
              <div className="flex justify-center gap-4">
                {[
                  { code: 'pt', label: 'Português' },
                  { code: 'en', label: 'English' }
                ].map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => setLanguage(lang.code)}
                    className={`px-4 py-2 rounded-full ${
                      language === lang.code ? 'bg-blue-500 text-white' : 'bg-gray-200'
                    }`}
                  >
                    {lang.label}
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
              {t('consultation.recording.start')}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ConsultationSetup;
