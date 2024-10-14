import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getAudiosNaoEnviados, sincronizarAudios } from '../audioStorage';
import { getPipedrivePatients, createPipedriveAppointment } from '../api';
import Sidebar from '../components/Sidebar';
import * as Yup from 'yup';

const ConsultationSetup: React.FC = () => {
  const { t } = useTranslation();
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [service, setService] = useState('');
  const [participants, setParticipants] = useState(2);
  const navigate = useNavigate();
  const [audiosNaoEnviados, setAudiosNaoEnviados] = useState<any[]>([]);

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
    const fetchPatients = async () => {
      const data = await getPipedrivePatients();
      setPatients(data.data || []);
    };
    fetchPatients();

    const carregarAudios = async () => {
      const audios = await getAudiosNaoEnviados();
      setAudiosNaoEnviados(audios);
    };
    carregarAudios();
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const values = {
      patient: selectedPatient,
      service: service,
      participants: participants,
    };

    try {
      await validationSchema.validate(values);
      await createPipedriveAppointment(selectedPatient, 'doctor_id', appointmentDate);
      navigate('/audio-recording', { 
        state: { 
          patient: selectedPatient, 
          service: service, 
          participants: participants 
        } 
      });
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
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
        <select
          value={selectedPatient}
          onChange={(e) => setSelectedPatient(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md"
          required
          name="patient"
        >
          <option value="">{t('selectPatient')}</option>
          {patients.map((patient: any) => (
            <option key={patient.id} value={patient.id}>{patient.name}</option>
          ))}
        </select>
        <select
          value={service}
          onChange={(e) => setService(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md"
          required
          name="service"
        >
          <option value="">{t('selectService')}</option>
          {services.map((s, index) => (
            <option key={index} value={s}>{s}</option>
          ))}
        </select>
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
        <input
          type="datetime-local"
          value={appointmentDate}
          onChange={(e) => setAppointmentDate(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md"
          required
        />
        <button
          type="submit"
          className="w-full px-6 py-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors"
        >
          {t('startRecording')}
        </button>
      </form>
      <Sidebar audios={audiosNaoEnviados} onSincronizar={handleSincronizar} />
    </div>
  );
};

export default ConsultationSetup;
