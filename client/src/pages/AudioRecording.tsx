import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import WaveSurfer from 'wavesurfer.js';
import { enviarAudio } from '../api';
import { saveAudioLocally } from '../audioStorage';
import useTranslation from '../hooks/useTranslation';
import { useAuth } from '../contexts/AuthContext';

// Adicione esta declaração no topo do arquivo
declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext;
  }
}

// Adicionando uma declaração de tipo para o backend do WaveSurfer
interface WaveSurferBackend {
  setBuffer?: (buffer: Float32Array) => void;
}

const AudioRecording: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [translations, setTranslations] = useState({
    audioRecording: '',
    startRecording: '',
    stopRecording: '',
    processingAudio: '',
    sendAudio: '',
    pauseRecording: '', // Adicionando nova tradução
    resumeRecording: '', // Adicionando nova tradução
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
      const audioRecording = await t('audioRecording', 'Audio Recording');
      const startRecording = await t('startRecording', 'Start Recording');
      const stopRecording = await t('stopRecording', 'Stop Recording');
      const processingAudio = await t('processingAudio', 'Processing Audio');
      const sendAudio = await t('sendAudio', 'Send Audio');
      const pauseRecording = await t('pauseRecording', 'Pause Recording');
      const resumeRecording = await t('resumeRecording', 'Resume Recording');

      setTranslations({
        audioRecording,
        startRecording,
        stopRecording,
        processingAudio,
        sendAudio,
        pauseRecording,
        resumeRecording,
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
  }, [t, user]);

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

      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
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
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      if (sourceRef.current) {
        sourceRef.current.disconnect();
      }
      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          setAudioBlob(e.data);
        }
      };
    }
  };

  const handleSubmit = async () => {
    if (audioBlob) {
      setIsProcessing(true); // Ativar loading
      
      // Parar a gravação e desativar o microfone
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => {
          track.stop();
        });
        streamRef.current = null;
      }
      
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }

      try {
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        
        reader.onloadend = async () => {
          try {
            const base64Audio = reader.result as string;
            const metadata = {
              ...location.state,
              startTime: startTimeRef.current
            };
            await enviarAudio(base64Audio.split(',')[1], metadata);
            navigate('/success');
          } catch (error) {
            console.error('Erro ao enviar áudio:', error);
            await saveAudioLocally(audioBlob, {
              ...location.state,
              startTime: startTimeRef.current
            });
            navigate('/error', { 
              state: { 
                errorMessage: error instanceof Error ? error.message : 'Erro ao enviar áudio'
              } 
            });
          }
        };
      } catch (error) {
        console.error('Erro ao processar áudio:', error);
        navigate('/error', { 
          state: { 
            errorMessage: 'Erro ao processar o áudio'
          } 
        });
      }
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="absolute top-4 left-0 right-0 flex justify-center items-center">
        <span className="text-xl font-semibold">{clinicName}</span>
      </div>
      <h1 className="text-3xl font-bold mb-8">{translations.audioRecording}</h1>
      
      {/* Container do waveform com fundo mais escuro para contraste */}
      <div 
        ref={waveformRef} 
        className="w-full max-w-2xl mb-8 bg-gray-100 rounded-lg p-4 shadow-md"
        style={{ height: '100px' }}
      />
      
      {/* Timer */}
      <div className="mb-6 text-xl font-semibold">{formatTime(recordingTime)}</div>
      
      {/* Container dos botões */}
      <div className="flex gap-4 items-center justify-center">
        {!isRecording && !audioBlob && (
          <button
            onClick={toggleRecording}
            className="px-8 py-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors text-lg"
          >
            {translations.startRecording}
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
              {isPaused ? translations.resumeRecording : translations.pauseRecording}
            </button>
            
            <button
              onClick={handleSubmit}
              className="px-8 py-3 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors text-lg"
              disabled={isPaused}
            >
              {translations.sendAudio}
            </button>
          </div>
        )}
        
        {/* Loading overlay */}
        {isProcessing && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg flex items-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <p className="text-lg font-semibold text-gray-700">
                {translations.processingAudio}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AudioRecording;
