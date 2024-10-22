import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  const [pin, setPin] = useState(['', '', '', '', '', '']);
  const [clinicaInfo, setClinicaInfo] = useState({ nome: '', logo: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();
  const pinInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [fetchedDoctors, info] = await Promise.all([getMedicos(), getClinicaInfo()]);
        setDoctors(fetchedDoctors);
        setClinicaInfo(info);
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
        setError('Erro ao buscar dados');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDoctorSelect = (doctorId: number) => {
    setSelectedDoctor(doctorId);
    setPin(['', '', '', '', '', '']);
  };

  const handlePinChange = (index: number, value: string) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newPin = [...pin];
      newPin[index] = value;
      setPin(newPin);
      if (value && index < 5) {
        pinInputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handlePinKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      pinInputRefs.current[index - 1]?.focus();
    }
  };

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const pinString = pin.join('');
    if (selectedDoctor && pinString.length === 6) {
      try {
        console.log('Enviando PIN para verificação:', { doctorId: selectedDoctor, pin: pinString });
        const isValid = await verifyPin(selectedDoctor, pinString);
        console.log('Resultado da verificação do PIN:', isValid);
        if (isValid) {
          const selectedDoctorData = doctors.find(d => d.id === selectedDoctor);
          if (selectedDoctorData?.cargo === 'admin') {
            navigate('/dashboard/clinica');
          } else {
            navigate('/consultation-setup', { state: { doctorId: selectedDoctor } });
          }
        } else {
          setError('PIN inválido');
        }
      } catch (error) {
        console.error('Erro ao verificar PIN:', error);
        setError('Erro ao verificar PIN');
      }
    } else {
      setError('Por favor, insira o PIN completo');
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Carregando...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="absolute top-4 left-0 right-0 flex justify-center items-center">
        {clinicaInfo.logo && <img src={clinicaInfo.logo} alt="Logo da Clínica" className="h-12 mr-2" />}
        <span className="text-xl font-semibold">{clinicaInfo.nome}</span>
      </div>
      <h1 className="text-3xl font-bold mb-8 text-center">Selecione o Médico</h1>
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
            {doctor.cargo === 'admin' && <p className="text-xs mt-1">Médico Admin</p>}
          </button>
        ))}
      </div>
      <form onSubmit={handlePinSubmit} className="w-full max-w-md">
        <div className="mb-4 text-center">Digite o PIN de 6 dígitos</div>
        <div className="flex justify-center mb-4">
          {pin.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (pinInputRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              pattern="\d*"
              maxLength={1}
              value={digit}
              onChange={(e) => handlePinChange(index, e.target.value)}
              onKeyDown={(e) => handlePinKeyDown(index, e)}
              className="w-12 h-12 mx-1 text-center text-2xl border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
            />
          ))}
        </div>
        <button
          type="submit"
          className="w-full px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Verificar
        </button>
      </form>
    </div>
  );
};

export default DoctorSelection;
