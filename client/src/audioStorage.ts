import { openDB } from 'idb';
import { enviarAudio } from './api';
import axios from 'axios';
import { ConsultationMetadata } from './types';

const dbPromise = openDB('AudioDB', 1, {
  upgrade(db) {
    db.createObjectStore('audios', { keyPath: 'id', autoIncrement: true });
  },
});

const AUDIO_STORAGE_KEY = 'patientfunnel_audio_storage';

interface StoredAudio {
  id: string;
  blob: Blob;
  metadata: any;
}

export const salvarAudioLocal = async (audioBlob: Blob, metadata: any) => {
  const db = await dbPromise;
  await db.add('audios', { audio: audioBlob, metadata, timestamp: Date.now() });
};

export const getAudiosNaoEnviados = async () => {
  const db = await dbPromise;
  return db.getAll('audios');
};

export const sincronizarAudios = async () => {
  const db = await dbPromise;
  const audios = await db.getAll('audios');
  for (const audio of audios) {
    try {
      await enviarAudio(audio.audio, audio.metadata.consultaId);
      await db.delete('audios', audio.id);
    } catch (error) {
      console.error('Erro ao enviar áudio:', error);
    }
  }
};

export const verificarConexaoEEnviar = () => {
  if (navigator.onLine) {
    sincronizarAudios();
  }
};

window.addEventListener('online', verificarConexaoEEnviar);
export const saveAudioLocally = async (audioBlob: Blob, metadata: ConsultationMetadata) => {
  const storedAudios: StoredAudio[] = JSON.parse(localStorage.getItem(AUDIO_STORAGE_KEY) || '[]');
  const newAudio: StoredAudio = {
    id: Date.now().toString(),
    blob: audioBlob,
    metadata,
  };
  storedAudios.push(newAudio);
  localStorage.setItem(AUDIO_STORAGE_KEY, JSON.stringify(storedAudios));
};

export const getStoredAudios = (): StoredAudio[] => {
  return JSON.parse(localStorage.getItem(AUDIO_STORAGE_KEY) || '[]');
};

export const syncAudios = async () => {
  const storedAudios = getStoredAudios();
  for (const audio of storedAudios) {
    try {
      const formData = new FormData();
      formData.append('audio', audio.blob, 'audio.wav');
      formData.append('metadata', JSON.stringify(audio.metadata));
      await axios.post('/api/upload-audio/', formData);
      // Remove synced audio from local storage
      const updatedAudios = storedAudios.filter(a => a.id !== audio.id);
      localStorage.setItem(AUDIO_STORAGE_KEY, JSON.stringify(updatedAudios));
    } catch (error) {
      console.error('Error syncing audio:', error);
    }
  }
};

