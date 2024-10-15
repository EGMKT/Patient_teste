import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import WaveSurfer from 'wavesurfer.js';
import { enviarAudio } from '../api';
import { saveAudioLocally } from '../audioStorage';
import useTranslation from '../hooks/useTranslation';

const AudioRecording: React.FC = () => {
  const { t } = useTranslation();
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
  const location = useLocation();
  const navigate = useNavigate();
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

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
      });
    }

    return () => {
      if (wavesurferRef.current) {
        wavesurferRef.current.destroy();
      }
    };
  }, [t]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setAudioBlob(blob);
        if (wavesurferRef.current) {
          wavesurferRef.current.loadBlob(blob);
        }
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Erro ao iniciar gravação:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
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
          const metadata = location.state;
          await enviarAudio(base64Audio.split(',')[1], metadata);
          navigate('/success');
        };
      } catch (error) {
        console.error('Erro ao enviar áudio:', error);
        await saveAudioLocally(audioBlob, location.state);
        navigate('/error');
      } finally {
        setIsProcessing(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold mb-8">{translations.audioRecording}</h1>
      <div ref={waveformRef} className="w-full max-w-2xl mb-8"></div>
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
