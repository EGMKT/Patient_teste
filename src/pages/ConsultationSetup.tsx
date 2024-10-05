import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const ConsultationSetup: React.FC = () => {
  const [patient, setPatient] = useState('');
  const [service, setService] = useState('');
  const [participants, setParticipants] = useState<number>(1);
  const navigate = useNavigate();
  const location = useLocation();
  const doctorId = (location.state as { doctorId: number })?.doctorId;

  const handleStartRecording = () => {
    if (patient && service) {
      navigate('/record', {
        state: {
          doctorId: location.state.doctorId,
          patient,
          service,
        }
      });
    } else {
      alert('Please fill in all fields');
    }
  };

  return (
    <div>
      <h1>Consultation Setup</h1>
      <input
        type="text"
        placeholder="Patient Name"
        value={patient}
        onChange={(e) => setPatient(e.target.value)}
      />
      <input
        type="text"
        placeholder="Service"
        value={service}
        onChange={(e) => setService(e.target.value)}
      />
      <input
        type="number"
        placeholder="Number of Participants"
        value={participants}
        onChange={(e) => setParticipants(parseInt(e.target.value))}
        min={1}
      />
      <button onClick={handleStartRecording}>Start Recording</button>
    </div>
  );
};

export default ConsultationSetup;