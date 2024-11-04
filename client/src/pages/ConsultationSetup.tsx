import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getPipedrivePatients, getMedicoServicos } from '../api';
import { TextField, Button, Select, MenuItem, FormControl, InputLabel, Autocomplete, Typography } from '@mui/material';
import * as Yup from 'yup';
import { useAuth } from '../contexts/AuthContext';
import { Patient, ConsultationSetupService } from '../types';
import SyncButton from '../components/SyncButton';

interface FormErrors {
  patient?: string;
  service?: string;
  participants?: string;
}

const ConsultationSetup: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [service, setService] = useState<number>(0);
  const [participants, setParticipants] = useState<number>(1);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [clinicName, setClinicName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState('pt');
  const [services, setServices] = useState<ConsultationSetupService[]>([]);
  const [selectedService, setSelectedService] = useState<ConsultationSetupService | null>(null);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [syncing, setSyncing] = useState(false);

  const validationSchema = Yup.object().shape({
    patient: Yup.string().required('Nome do paciente é obrigatório'),
    service: Yup.string().required('Serviço é obrigatório'),
    participants: Yup.number().min(2, 'Mínimo de 2 participantes').max(5, 'Máximo de 5 participantes'),
  });

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Primeiro tenta buscar pacientes locais
      const patientsResponse = await getPipedrivePatients();
      if (patientsResponse) {
        setPatients(patientsResponse);
      }

      // Busca serviços
      const servicesResponse = await getMedicoServicos();
      if (servicesResponse) {
        setServices(servicesResponse);
      }

    } catch (error: any) {
      console.error('Erro ao buscar dados:', error);
      const errorMessage = error.response?.data?.error || 
        'Erro ao carregar dados. Verifique sua conexão e tente novamente.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
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
          patientId: selectedPatient.id,
          serviceId: service,
          serviceName: selectedService.nome,
          participants: participants,
          language: language,
          startTime: currentDate,
          patientName: selectedPatient.nome
        } 
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
    }
  };

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  const renderPatientOption = (option: Patient) => {
    if (!option) return '';
    return option.nome || 'Paciente sem nome';
  };

  const validateForm = () => {
    const errors: FormErrors = {};
    if (!selectedPatient) {
      errors.patient = t('consultation.setup.errors.patientRequired');
    }
    if (!selectedService) {
      errors.service = t('consultation.setup.errors.serviceRequired');
    }
    if (!participants || participants < 1) {
      errors.participants = t('consultation.setup.errors.participantsRequired');
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSync = async () => {
    try {
      setSyncing(true);
      await Promise.all([
        getPipedrivePatients(),
        getMedicoServicos()
      ]);
      await fetchData();
    } catch (error) {
      console.error('Erro na sincronização:', error);
      setError(t('common.errors.syncError'));
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-grow flex flex-col items-center justify-center p-4">
        <div className="flex items-center justify-between w-full max-w-md mb-8">
          <h1 className="text-3xl font-bold">{t('consultation.setup.title')}</h1>
          <SyncButton onSync={handleSync} loading={syncing} />
        </div>
        {isLoading ? (
          <div>{t('consultation.setup.loading')}</div>
        ) : error ? (
          <div className="text-red-500">{t('consultation.setup.error')}</div>
        ) : (
          <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
            <Autocomplete
              value={selectedPatient}
              onChange={(_, newValue: Patient | null) => setSelectedPatient(newValue)}
              options={patients}
              getOptionLabel={renderPatientOption}
              renderOption={(props, option: Patient) => (
                <li {...props}>
                  <div>
                    <Typography variant="body1">{option.nome}</Typography>
                    <Typography variant="caption" color="textSecondary">
                      {option.email}
                    </Typography>
                  </div>
                </li>
              )}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={t('consultation.setup.patientName')}
                  variant="outlined"
                  error={!!formErrors.patient}
                  helperText={formErrors.patient}
                />
              )}
            />
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
