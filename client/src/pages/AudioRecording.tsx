import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const AudioRecording: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [amplitudes, setAmplitudes] = useState<number[]>([]);
  const navigate = useNavigate();
  const location = useLocation();
  const { doctorId, patient, service, participants } = location.state as {
    doctorId: number;
    patient: string;
    service: string;
    participants: number;
  };
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const audioContext = useRef<AudioContext | null>(null);
  const analyser = useRef<AnalyserNode | null>(null);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isRecording) {
      interval = setInterval(() => {
        setDuration((prev) => prev + 1);
        if (analyser.current) {
          const dataArray = new Uint8Array(analyser.current.frequencyBinCount);
          analyser.current.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
          setAmplitudes((prev) => [...prev.slice(-29), average / 255]);
        }
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContext.current = new AudioContext();
      analyser.current = audioContext.current.createAnalyser();
      const source = audioContext.current.createMediaStreamSource(stream);
      source.connect(analyser.current);

      mediaRecorder.current = new MediaRecorder(stream);
      mediaRecorder.current.ondataavailable = (event) => {
        audioChunks.current.push(event.data);
      };
      mediaRecorder.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current) {
      mediaRecorder.current.stop();
      mediaRecorder.current.onstop = async () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/wav' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = reader.result as string;
          const metadata = {
            doctorId,
            patient,
            service,
            participants,
            duration
          };

          try {
            await sendAudioToWebhook(base64Audio, metadata);
            navigate('/success');
          } catch (error) {
            console.error('Error sending audio to webhook:', error);
            alert('Failed to send audio. Please try again.');
          }
        };
      };
      setIsRecording(false);
    }
  };

  const sendAudioToWebhook = async (base64Audio: string, metadata: any) => {
    const webhookUrl = 'https://n8n.patientfunnel.solutions/webhook-test/teste-patientFunnel';
    await axios.post(webhookUrl, {
      audio: base64Audio,
      metadata
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Audio Recording</h1>
      <p className="text-xl mb-4">Duration: {duration} seconds</p>
      <div className="w-full max-w-md h-20 bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="h-full flex items-end">
          {amplitudes.map((amp, index) => (
            <div
              key={index}
              className="w-1 bg-blue-500 mx-px transition-all duration-100"
              style={{ height: `${amp * 100}%` }}
            />
          ))}
        </div>
      </div>
      {!isRecording ? (
        <button
          onClick={startRecording}
          className="px-6 py-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors"
        >
          Start Recording
        </button>
      ) : (
        <button
          onClick={stopRecording}
          className="px-6 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
        >
          Stop Recording
        </button>
      )}
    </div>
  );
};

export default AudioRecording;