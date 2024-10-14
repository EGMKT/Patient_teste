import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { getMedicos, verifyPin, getClinicaInfo } from '../api';

const DoctorSelection: React.FC = () => {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState<number | null>(null);
  const [pin, setPin] = useState('');
  const [clinicaInfo, setClinicaInfo] = useState({ nome: '', logo: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [fetchedDoctors, info] = await Promise.all([getMedicos(), getClinicaInfo()]);
        setDoctors(fetchedDoctors);
        setClinicaInfo(info);
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
        setError(t('errorFetchingData'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user, navigate, t]);

  const handleDoctorSelect = (doctorId: number) => {
    setSelectedDoctor(doctorId);
  };

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDoctor) {
      try {
        const isValid = await verifyPin(selectedDoctor, pin);
        if (isValid) {
          if (user?.role === 'AC') {
            navigate('/dashboard/clinica');
          } else {
            navigate('/consultation-setup', { state: { doctorId: selectedDoctor } });
          }
        } else {
          setError(t('invalidPin'));
        }
      } catch (error) {
        console.error('Erro ao verificar PIN:', error);
        setError(t('errorVerifyingPin'));
      }
    } else {
      setError(t('pleaseSelectDoctor'));
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">{t('loading')}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="absolute top-4 left-4 flex items-center">
        {clinicaInfo.logo && <img src={clinicaInfo.logo} alt="Logo da Clínica" className="h-12 mr-2" />}
        <span className="text-xl font-semibold">{clinicaInfo.nome}</span>
      </div>
      <h1 className="text-3xl font-bold mb-8 text-center">{t('selectDoctor')}</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full max-w-4xl mb-8">
        {doctors.map((doctor: any) => (
          <button
            key={doctor.id}
            onClick={() => handleDoctorSelect(doctor.id)}
            className={`p-6 rounded-lg shadow-md transition-all ${
              selectedDoctor === doctor.id
                ? 'bg-blue-500 text-white'
                : 'bg-white hover:bg-blue-100'
            }`}
          >
            <h2 className="text-xl font-semibold mb-2">{doctor.name}</h2>
            <p className="text-sm">{t(doctor.specialty.toLowerCase())}</p>
          </button>
        ))}
      </div>
      <form onSubmit={handlePinSubmit} className="w-full max-w-md">
        <input
          type="text"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          placeholder={t('enterPin')}
          className="p-3 rounded-lg shadow-md transition-all w-full mb-4"
        />
        <button
          type="submit"
          className="w-full px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
        >
          {t('submit')}
        </button>
      </form>
    </div>
  );
};

export default DoctorSelection;
