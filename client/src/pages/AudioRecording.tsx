import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import WaveSurfer from 'wavesurfer.js';
import { enviarAudio, criarConsulta } from '../api';
import useTranslation from '../hooks/useTranslation';
import { useAuth } from '../contexts/AuthContext';
import { ConsultationMetadata, AudioRecordingState, WaveSurferBackend} from '../types';

// Adicione esta declaração no topo do arquivo
declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext;
  }
}

// Adicionando uma declaração de tipo para o backend do WaveSurfer


const AudioRecording: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [translations, setTranslations] = useState({
    audioRecording: '',
    startRecording: '',
    stopRecording: '',
    processingAudio: '',
    sendAudio: '',
    pauseRecording: '',
    resumeRecording: '',
  });
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const startTimeRef = useRef<string>('');
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [clinicName, setClinicName] = useState('');
  const [isPaused, setIsPaused] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    const loadTranslations = async () => {
      setTranslations({
        audioRecording: t('audioRecording.title'),
        startRecording: t('audioRecording.recording.start'),
        stopRecording: t('audioRecording.recording.stop'),
        processingAudio: t('audioRecording.status.processing'),
        sendAudio: t('audioRecording.recording.send'),
        pauseRecording: t('audioRecording.recording.pause'),
        resumeRecording: t('audioRecording.recording.resume'),
      });
    };

    loadTranslations();

    if (waveformRef.current) {
      wavesurferRef.current = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: '#2176ff', // Cor mais visível
        progressColor: '#4a9eff',
        cursorWidth: 0,
        barWidth: 2,
        barGap: 3,
        height: 50,
        responsive: true,
        normalize: true,
        partialRender: true,
        fillParent: true,
        scrollParent: false,
        backend: 'WebAudio',
        plugins: [],
        minPxPerSec: 50,
        interact: false,
        hideScrollbar: true,
        backgroundColor: '#ffffff' // Fundo branco para contraste
      });
    }

    return () => {
      cleanupAudioResources();
      if (wavesurferRef.current) {
        wavesurferRef.current.destroy();
      }
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [t]);

  useEffect(() => {
    return () => {
      cleanupAudioResources();
    };
  }, []);

  const toggleRecording = async () => {
    if (!isRecording) {
      await startRecording();
    } else if (isPaused) {
      resumeRecording();
    } else {
      pauseRecording();
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });

      // Criar novo AudioContext apenas se não existir ou estiver fechado
      if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }

      analyserRef.current = audioContextRef.current.createAnalyser();
      sourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
      
      // Configurações do analyser para melhor visualização
      analyserRef.current.fftSize = 1024;
      analyserRef.current.smoothingTimeConstant = 0.8;
      
      sourceRef.current.connect(analyserRef.current);
      
      const bufferLength = analyserRef.current.frequencyBinCount;
      dataArrayRef.current = new Uint8Array(bufferLength);

      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      startTimeRef.current = new Date().toISOString();

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          setAudioBlob(e.data);
        }
      };

      mediaRecorderRef.current.start(100);
      setIsRecording(true);
      setRecordingTime(0);

      // Atualização mais frequente para visualização mais suave
      timerIntervalRef.current = setInterval(() => {
        setRecordingTime((prevTime) => prevTime + 1);
        updateWaveform();
      }, 50); // Reduzido para 50ms para animação mais suave

      streamRef.current = stream;
      setIsPaused(false);
    } catch (error) {
      console.error('Erro ao iniciar gravação:', error);
    }
  };

  const pauseRecording = () => {
    if (streamRef.current) {
      // Parar o timer
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      // Desativar o microfone
      streamRef.current.getTracks().forEach(track => {
        track.enabled = false;
      });
      setIsPaused(true);
    }
  };

  const resumeRecording = () => {
    if (streamRef.current) {
      // Reiniciar o timer
      timerIntervalRef.current = setInterval(() => {
        setRecordingTime(prevTime => prevTime + 1);
        updateWaveform();
      }, 50);
      // Reativar o microfone
      streamRef.current.getTracks().forEach(track => {
        track.enabled = true;
      });
      setIsPaused(false);
    }
  };

  const updateWaveform = () => {
    if (analyserRef.current && dataArrayRef.current && wavesurferRef.current) {
      analyserRef.current.getByteTimeDomainData(dataArrayRef.current);
      
      // Processamento mais suave dos dados com amplitude mais visível
      const smoothingFactor = 0.8;
      const processedData = new Float32Array(dataArrayRef.current.length);
      
      for (let i = 0; i < dataArrayRef.current.length; i++) {
        // Aumentando a amplitude para tornar a onda mais visível
        const value = ((dataArrayRef.current[i] / 128.0) - 1.0) * 2; // Multiplicando por 2 para aumentar amplitude
        processedData[i] = value * smoothingFactor;
      }

      // Atualiza o buffer do WaveSurfer
      if (wavesurferRef.current.backend && typeof wavesurferRef.current.backend.setBuffer === 'function') {
        wavesurferRef.current.backend.setBuffer(processedData);
        wavesurferRef.current.drawBuffer();
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      cleanupAudioResources();
    }
  };

  const cleanupAudioResources = () => {
    try {
      // Parar o timer
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }

      // Parar todas as tracks do stream primeiro
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => {
          track.stop();
        });
        streamRef.current = null;
      }

      // Desconectar o source do analyser
      if (sourceRef.current) {
        sourceRef.current.disconnect();
        sourceRef.current = null;
      }

      // Parar e desconectar o MediaRecorder
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current = null;
      }

      // Fechar o contexto de áudio apenas se estiver ativo
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(console.error);
        audioContextRef.current = null;
      }

    } catch (error) {
      console.error('Erro ao limpar recursos de áudio:', error);
    }
  };

  const handleSubmit = async () => {
    if (!audioBlob || !user || user.role !== 'ME') {
      console.error('Usuário inválido ou não é médico:', { user });
      navigate('/error', { 
        state: { 
          error: 'Acesso não autorizado',
          details: 'Apenas médicos podem gravar consultas'
        } 
      });
      return;
    }

    setIsProcessing(true);

    try {
      console.log('Enviando consulta com dados:', {
        medico_id: user.id,  // ID do usuário que é médico
        paciente_id: location.state?.patientId,
        servico_id: location.state?.serviceId,
        duracao: `${Math.floor(recordingTime / 60)}:${recordingTime % 60}`,
        data: startTimeRef.current
      });

      // Adicionar delay para visualização do processamento
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Parar a gravação se ainda estiver ativa
      if (isRecording) {
        stopRecording();
      }

      // Criar consulta
      const consultaData = {
        medico_id: user.id,
        paciente_id: location.state?.patientId,
        servico_id: location.state?.serviceId,
        duracao: `${Math.floor(recordingTime / 60)}:${recordingTime % 60}`,
        data: startTimeRef.current,
        satisfacao: 0,
        valor: 0
      };

      console.log('Enviando dados da consulta:', consultaData);
      const consultaResponse = await criarConsulta(consultaData);

      if (!consultaResponse?.consultation_id) {
        throw new Error('ID da consulta não retornado');
      }

      // Criar um Promise para o FileReader
      const readFileAsDataURL = (blob: Blob): Promise<string> => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      };

      // Ler o arquivo de forma assíncrona
      const base64Audio = await readFileAsDataURL(audioBlob);
      
      const audioMetadata: ConsultationMetadata = {
        startTime: startTimeRef.current,
        duration: recordingTime,
        size: audioBlob.size,
        consultation_id: consultaResponse.consultation_id,
        doctorId: consultaResponse.doctor.id,
        doctorName: consultaResponse.doctor.name,
        doctorSpecialty: consultaResponse.doctor.specialty,
        clinicId: consultaResponse.clinic.id || 0,
        clinicName: consultaResponse.clinic.name || '',
        patientId: location.state.patientId,
        patientName: location.state.patientName || '',
        serviceId: location.state.serviceId,
        serviceName: location.state.serviceName || '',
        participants: location.state.participants || 2,
        language: location.state.language || 'pt'
      };

      console.log('Enviando áudio com metadados:', { audioMetadata });
      await enviarAudio(base64Audio.split(',')[1], audioMetadata);
      navigate('/success');

    } catch (error) {
      console.error('Erro ao processar consulta:', error);
      navigate('/error', { 
        state: { 
          error: 'Erro ao processar consulta',
          details: error instanceof Error ? error.message : 'Erro desconhecido'
        } 
      });
    } finally {
      // Adicionar delay antes de remover o loading
      setTimeout(() => {
        setIsProcessing(false);
        cleanupAudioResources();
      }, 500);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="absolute top-4 left-0 right-0 flex justify-center items-center">
        <span className="text-xl font-semibold">{clinicName}</span>
      </div>
      <h1 className="text-3xl font-bold mb-8">{t('audioRecording.title')}</h1>
      
      {/* Container do waveform */}
      <div 
        ref={waveformRef} 
        className="w-full max-w-2xl mb-8 bg-gray-100 rounded-lg p-4 shadow-md"
        style={{ height: '100px' }}
      />
      
      {/* Timer */}
      <div className="mb-6 text-xl font-semibold">{formatTime(recordingTime)}</div>
      
      {/* Botões de controle */}
      <div className="flex gap-4 items-center justify-center">
        {!isRecording && !audioBlob && (
          <button
            onClick={toggleRecording}
            className="px-8 py-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors text-lg"
          >
            {t('audioRecording.recording.start')}
          </button>
        )}
        
        {isRecording && (
          <div className="flex gap-4">
            <button
              onClick={toggleRecording}
              className={`px-8 py-3 ${
                isPaused 
                  ? 'bg-green-500 hover:bg-green-600' 
                  : 'bg-yellow-500 hover:bg-yellow-600'
              } text-white rounded-full transition-colors text-lg`}
            >
              {isPaused ? t('audioRecording.recording.resume') : t('audioRecording.recording.pause')}
            </button>
            
            <button
              onClick={handleSubmit}
              className="px-8 py-3 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors text-lg"
              disabled={isPaused}
            >
              {t('audioRecording.recording.send')}
            </button>
          </div>
        )}
        
        {/* Loading overlay */}
        {isProcessing && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg flex items-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <p className="text-lg font-semibold text-gray-700">
                {t('audioRecording.status.processing')}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AudioRecording;
