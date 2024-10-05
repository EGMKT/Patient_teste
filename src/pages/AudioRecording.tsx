import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const AudioRecording: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [amplitude, setAmplitude] = useState(0);
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
          setAmplitude(average / 255);
        }
      }, 1000);
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
    <div>
      <h1>Audio Recording</h1>
      <p>Duration: {duration} seconds</p>
      <div style={{ width: '100%', height: '20px', backgroundColor: '#ddd' }}>
        <div
          style={{
            width: `${amplitude * 100}%`,
            height: '100%',
            backgroundColor: 'blue',
          }}
        />
      </div>
      {!isRecording ? (
        <button onClick={startRecording}>Start Recording</button>
      ) : (
        <button onClick={stopRecording}>Stop Recording</button>
      )}
    </div>
  );
};

export default AudioRecording;