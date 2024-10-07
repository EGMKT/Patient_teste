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
          doctorId,
          patient,
          service,
          participants,
        }
      });
    } else {
      alert('Please fill in all fields');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Consultation Setup</h1>
      <div className="w-full max-w-md space-y-4">
        <input
          type="text"
          placeholder="Patient Name"
          value={patient}
          onChange={(e) => setPatient(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md"
        />
        <input
          type="text"
          placeholder="Service"
          value={service}
          onChange={(e) => setService(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md"
        />
        <div className="flex items-center">
          <label htmlFor="participants" className="mr-2">Participants:</label>
          <input
            id="participants"
            type="number"
            value={participants}
            onChange={(e) => setParticipants(parseInt(e.target.value))}
            min={1}
            className="w-20 p-2 border border-gray-300 rounded-md"
          />
        </div>
      </div>
      <button
        onClick={handleStartRecording}
        className="mt-8 px-6 py-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors"
      >
        Start Recording
      </button>
    </div>
  );
};

export default ConsultationSetup;