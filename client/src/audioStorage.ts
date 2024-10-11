import { openDB } from 'idb';
import { enviarAudio } from './api';

const dbPromise = openDB('AudioDB', 1, {
  upgrade(db) {
    db.createObjectStore('audios', { keyPath: 'id', autoIncrement: true });
  },
});

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
