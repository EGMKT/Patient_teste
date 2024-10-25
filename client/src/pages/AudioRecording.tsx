import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import WaveSurfer from 'wavesurfer.js';
import { enviarAudio } from '../api';
import { saveAudioLocally } from '../audioStorage';
import useTranslation from '../hooks/useTranslation';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';

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

  useEffect(() => {
    const loadTranslations = async () => {
      const audioRecording = await t('audioRecording', 'Audio Recording');
      const startRecording = await t('startRecording', 'Start Recording');
      const stopRecording = await t('stopRecording', 'Stop Recording');
      const processingAudio = await t('processingAudio', 'Processing Audio');
      const sendAudio = await t('sendAudio', 'Send Audio');

      setTranslations({
        audioRecording,
        startRecording,
        stopRecording,
        processingAudio,
        sendAudio,
      });
    };

    loadTranslations();

    if (waveformRef.current) {
      wavesurferRef.current = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: 'violet',
        progressColor: 'purple',
        cursorWidth: 1,
        cursorColor: 'lightblue',
        barWidth: 2,
        barRadius: 3,
        height: 100,
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

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      sourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
      sourceRef.current.connect(analyserRef.current);

      analyserRef.current.fftSize = 2048;
      const bufferLength = analyserRef.current.frequencyBinCount;
      dataArrayRef.current = new Uint8Array(bufferLength);

      mediaRecorderRef.current = new MediaRecorder(stream);
      startTimeRef.current = new Date().toISOString();

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          if (wavesurferRef.current) {
            wavesurferRef.current.loadBlob(e.data);
          }
        }
      };

      mediaRecorderRef.current.start(100);
      setIsRecording(true);
      setRecordingTime(0);
      timerIntervalRef.current = setInterval(() => {
        setRecordingTime((prevTime) => prevTime + 1);
        updateWaveform();
      }, 100);
    } catch (error) {
      console.error('Erro ao iniciar gravação:', error);
    }
  };

  const updateWaveform = () => {
    if (analyserRef.current && dataArrayRef.current && wavesurferRef.current) {
      analyserRef.current.getByteTimeDomainData(dataArrayRef.current);
      const normalizedData = Array.from(dataArrayRef.current).map(value => (value / 128) - 1);
      
      // Atualizamos diretamente os dados do waveform
      const backend = wavesurferRef.current.backend as WaveSurferBackend;
      if (backend && typeof backend.setBuffer === 'function') {
        backend.setBuffer(new Float32Array(normalizedData));
        wavesurferRef.current.drawBuffer();
      } else {
        console.warn('setBuffer method not available on WaveSurfer backend');
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
          if (wavesurferRef.current) {
            wavesurferRef.current.loadBlob(e.data);
          }
        }
      };
    }
  };

  const handleSubmit = async () => {
    if (audioBlob) {
      setIsProcessing(true);
      try {
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = reader.result as string;
          const metadata = {
            ...location.state,
            startTime: startTimeRef.current
          };
          await enviarAudio(base64Audio.split(',')[1], metadata);
          navigate('/success');
        };
      } catch (error) {
        console.error('Erro ao enviar áudio:', error);
        await saveAudioLocally(audioBlob, {
          ...location.state,
          startTime: startTimeRef.current
        });
        navigate('/error');
      } finally {
        setIsProcessing(false);
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
      <Header 
        onLanguageChange={handleLanguageChange}
        currentLanguage={i18n.language}
        clinicName={clinicName}
      />
      <div className="absolute top-4 left-0 right-0 flex justify-center items-center">
        <span className="text-xl font-semibold">{clinicName}</span>
      </div>
      <h1 className="text-3xl font-bold mb-8">{translations.audioRecording}</h1>
      <div ref={waveformRef} className="w-full max-w-2xl mb-8"></div>
      <div className="mb-4 text-xl font-semibold">{formatTime(recordingTime)}</div>
      {!isRecording && !audioBlob && (
        <button
          onClick={startRecording}
          className="px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
        >
          {translations.startRecording}
        </button>
      )}
      {isRecording && (
        <button
          onClick={stopRecording}
          className="px-6 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
        >
          {translations.stopRecording}
        </button>
      )}
      {isProcessing && (
        <p className="text-lg font-semibold text-blue-500">{translations.processingAudio}</p>
      )}
      {audioBlob && !isProcessing && (
        <button
          onClick={handleSubmit}
          className="px-6 py-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors"
        >
          {translations.sendAudio}
        </button>
      )}
    </div>
  );
};

export default AudioRecording;
