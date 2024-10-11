import axios from 'axios';

const API_URL = 'http://localhost:8000/api/';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const login = async (username: string, password: string) => {
  const response = await api.post('token/', { username, password });
  localStorage.setItem('token', response.data.access);
  return response.data;
};

export const getMedicos = async () => {
  const response = await api.get('medicos/');
  return response.data;
};

export const getPacientes = async () => {
  const response = await api.get('pacientes/');
  return response.data;
};

export const getServicos = async () => {
  const response = await api.get('servicos/');
  return response.data;
};

export const criarConsulta = async (consultaData: any) => {
  const response = await api.post('consultas/', consultaData);
  return response.data;
};

export const enviarAudio = async (audioBlob: Blob, consultaId: number) => {
  const formData = new FormData();
  formData.append('audio', audioBlob, 'audio.wav');
  const response = await api.post(`consultas/${consultaId}/audio/`, formData);
  return response.data;
};
