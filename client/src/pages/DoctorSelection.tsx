import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import useTranslation from '../hooks/useTranslation';
import { useAuth } from '../contexts/AuthContext';
import { getMedicos, verifyPin, getClinicaInfo } from '../api';

interface Doctor {
  id: number;
  nome: string;
  especialidade: string;
  cargo: string;
}

const DoctorSelection: React.FC = () => {
  const { t } = useTranslation();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<number | null>(null);
  const [pin, setPin] = useState('');
  const [clinicaInfo, setClinicaInfo] = useState({ nome: '', logo: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();
  const [translations, setTranslations] = useState({
    loading: 'Carregando...',
    selectDoctor: 'Selecione o Médico',
    enterPin: 'Digite o PIN',
    submit: 'Enviar',
    adminDoctor: 'Médico Admin',
    errorFetchingData: 'Erro ao buscar dados',
    invalidPin: 'PIN inválido',
    errorVerifyingPin: 'Erro ao verificar PIN',
    pleaseSelectDoctor: 'Por favor, selecione um médico',
  });

  useEffect(() => {
    const loadTranslations = async () => {
      const translatedTexts = {
        loading: await t('loading', 'Carregando...'),
        selectDoctor: await t('selectDoctor', 'Selecione o Médico'),
        enterPin: await t('enterPin', 'Digite o PIN'),
        submit: await t('submit', 'Enviar'),
        adminDoctor: await t('adminDoctor', 'Médico Admin'),
        errorFetchingData: await t('errorFetchingData', 'Erro ao buscar dados'),
        invalidPin: await t('invalidPin', 'PIN inválido'),
        errorVerifyingPin: await t('errorVerifyingPin', 'Erro ao verificar PIN'),
        pleaseSelectDoctor: await t('pleaseSelectDoctor', 'Por favor, selecione um médico'),
      };
      setTranslations(translatedTexts);
    };

    loadTranslations();
  }, [t]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [fetchedDoctors, info] = await Promise.all([getMedicos(), getClinicaInfo()]);
        setDoctors(fetchedDoctors);
        setClinicaInfo(info);
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
        setError(translations.errorFetchingData);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [translations.errorFetchingData]);

  const handleDoctorSelect = (doctorId: number) => {
    setSelectedDoctor(doctorId);
    setPin('');
  };

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDoctor) {
      try {
        console.log('Enviando PIN para verificação:', { doctorId: selectedDoctor, pin });
        const isValid = await verifyPin(selectedDoctor, pin);
        console.log('Resultado da verificação do PIN:', isValid);
        if (isValid) {
          const selectedDoctorData = doctors.find(d => d.id === selectedDoctor);
          if (selectedDoctorData?.cargo === 'admin') {
            navigate('/dashboard/clinica');
          } else {
            navigate('/consultation-setup', { state: { doctorId: selectedDoctor } });
          }
        } else {
          setError(await t('invalidPin', 'PIN inválido'));
        }
      } catch (error) {
        console.error('Erro ao verificar PIN:', error);
        setError(await t('errorVerifyingPin', 'Erro ao verificar PIN'));
      }
    } else {
      setError(await t('pleaseSelectDoctor', 'Por favor, selecione um médico'));
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">{translations.loading}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="absolute top-4 left-4 flex items-center">
        {clinicaInfo.logo && <img src={clinicaInfo.logo} alt="Logo da Clínica" className="h-12 mr-2" />}
        <span className="text-xl font-semibold">{clinicaInfo.nome}</span>
      </div>
      <h1 className="text-3xl font-bold mb-8 text-center">{translations.selectDoctor}</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full max-w-4xl mb-8 justify-items-center">
        {doctors.map((doctor) => (
          <button
            key={doctor.id}
            onClick={() => handleDoctorSelect(doctor.id)}
            className={`p-6 rounded-lg shadow-md transition-all w-full max-w-xs ${
              selectedDoctor === doctor.id
                ? 'bg-blue-500 text-white'
                : 'bg-white hover:bg-blue-100'
            }`}
          >
            <h2 className="text-xl font-semibold mb-2">{doctor.nome}</h2>
            <p className="text-sm">{doctor.especialidade}</p>
            {doctor.cargo === 'admin' && <p className="text-xs mt-1">{translations.adminDoctor}</p>}
          </button>
        ))}
      </div>
      <form onSubmit={handlePinSubmit} className="w-full max-w-md">
        <input
          type="text"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          placeholder={translations.enterPin}
          className="p-3 rounded-lg shadow-md transition-all w-full mb-4"
        />
        <button
          type="submit"
          className="w-full px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
        >
          {translations.submit}
        </button>
      </form>
    </div>
  );
};

export default DoctorSelection;
