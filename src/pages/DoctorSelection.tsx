import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const mockDoctors = [
  { id: 1, name: 'Dr. Smith' },
  { id: 2, name: 'Dr. Johnson' },
  { id: 3, name: 'Dr. Williams' },
];

const DoctorSelection: React.FC = () => {
  const [selectedDoctor, setSelectedDoctor] = useState<number | null>(null);
  const navigate = useNavigate();

  const handleDoctorSelect = (doctorId: number) => {
    setSelectedDoctor(doctorId); // Corrigido
  };

  const handleNext = () => {
    if (selectedDoctor) {
      navigate('/setup', { state: { doctorId: selectedDoctor } });
    } else {
      alert('Please select a doctor');
    }
  };

  return (
    <div>
      <h1>Select a Doctor</h1>
      <ul>
        {mockDoctors.map((doctor) => (
          <li key={doctor.id}>
            <button
              onClick={() => handleDoctorSelect(doctor.id)}
              style={{ fontWeight: selectedDoctor === doctor.id ? 'bold' : 'normal' }}
            >
              {doctor.name}
            </button>
          </li>
        ))}
      </ul>
      <button onClick={handleNext}>Next</button>
    </div>
  );
};

export default DoctorSelection;