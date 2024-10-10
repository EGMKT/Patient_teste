import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const mockDoctors = [
  { id: 1, name: 'Dr. Smith', specialty: 'Cardiologist' },
  { id: 2, name: 'Dr. Johnson', specialty: 'Neurologist' },
  { id: 3, name: 'Dr. Williams', specialty: 'Pediatrician' },
];

const DoctorSelection: React.FC = () => {
  const [selectedDoctor, setSelectedDoctor] = useState<number | null>(null);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleDoctorSelect = (doctorId: number) => {
    setSelectedDoctor(doctorId);
  };

  const handleNext = () => {
    if (selectedDoctor) {
      navigate('/consultation-setup', { state: { doctorId: selectedDoctor } });
    } else {
      alert(t('pleaseSelectDoctor'));
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold mb-8 text-center">{t('selectDoctor')}</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-4xl">
        {mockDoctors.map((doctor) => (
          <button
            key={doctor.id}
            onClick={() => handleDoctorSelect(doctor.id)}
            className={`p-4 rounded-lg shadow-md transition-all ${
              selectedDoctor === doctor.id
                ? 'bg-blue-500 text-white'
                : 'bg-white hover:bg-blue-100'
            }`}
          >
            <h2 className="text-xl font-semibold">{doctor.name}</h2>
            <p className="text-sm">{t(doctor.specialty.toLowerCase())}</p>
          </button>
        ))}
      </div>
      <button
        onClick={handleNext}
        className="mt-8 px-6 py-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors"
      >
        {t('next')}
      </button>
    </div>
  );
};

export default DoctorSelection;