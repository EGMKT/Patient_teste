import axios, { AxiosError } from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  console.log('API interceptor: token =', token);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const login = async (email: string, password: string) => {
  try {
    const response = await api.post('token/', { email, password });
    console.log('API login response:', response.data);
    localStorage.setItem('token', response.data.access);
    
    // Decodificar o token JWT para obter as informações do usuário
    const decodedToken = JSON.parse(atob(response.data.access.split('.')[1]));
    const user = {
      id: decodedToken.user_id,
      email: decodedToken.email,
      role: decodedToken.role,
      username: decodedToken.username || '',
      clinica: decodedToken.clinica || null
    };
    
    return { access: response.data.access, user };
  } catch (error) {
    console.error('API login error:', error);
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.detail || 'Login failed');
    }
    throw new Error('Network error');
  }
};

export const checkTrustedDevice = async (deviceId: string) => {
  const response = await api.post('trusted-device/', { device_id: deviceId });
  return response.data;
};

export const verifyTwoFactor = async (token: string, deviceId: string, rememberDevice: boolean) => {
  const response = await api.post('two-factor/', { 
    action: 'verify', 
    token, 
    device_id: deviceId, 
    remember_device: rememberDevice 
  });
  return response.data;
};

export const enableTwoFactor = async () => {
  const response = await api.post('two-factor/', { action: 'enable' });
  return response.data;
};

export const disableTwoFactor = async () => {
  const response = await api.post('two-factor/', { action: 'disable' });
  return response.data;
};

export const getMedicos = async () => {
  try {
    console.log('Iniciando requisição para buscar médicos');
    const response = await api.get('/medicos/');
    console.log('Resposta recebida:', response.data);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar médicos:', error);
    if (axios.isAxiosError(error) && error.response) {
      console.error('Resposta do servidor:', error.response.data);
    }
    throw error;
  }
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

export const enviarAudio = async (audioBase64: string, metadata: any) => {
  const webhookUrl = 'https://n8n.patientfunnel.solutions/webhook-test/teste-patientFunnel';
  const response = await axios.post(webhookUrl, { audio: audioBase64, metadata });
  return response.data;
};

export const getAdminDashboard = async () => {
  const response = await api.get('admin/dashboard/');
  return response.data;
};

export const getDashboardGeral = async () => {
  const response = await api.get('dashboard/geral/');
  return response.data;
};

export const getDashboardClinica = async () => {
  const response = await api.get('dashboard/clinica/');
  return response.data;
};

export const verifyPin = async (doctorId: number, pin: string) => {
  try {
    const response = await api.post('/verify-pin/', { medico_id: doctorId, pin });
    console.log('Resposta da verificação do PIN:', response.data);
    return response.data.valid;
  } catch (error) {
    console.error('Erro ao verificar PIN:', error);
    throw error;
  }
};

export const getPipedrivePatients = async () => {
  try {
    console.log('Chamando API:', `${API_URL}pipedrive/patients/`);
    const response = await api.get('pipedrive/patients/');
    console.log('Resposta do Pipedrive:', response.data);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar pacientes do Pipedrive:', error);
    if (axios.isAxiosError(error)) {
      if (error.response) {
        console.error('Dados do erro:', error.response.data);
        console.error('Status do erro:', error.response.status);
        console.error('Headers do erro:', error.response.headers);
      } else if (error.request) {
        console.error('Erro na requisição:', error.request);
      } else {
        console.error('Erro:', error.message);
      }
    } else {
      console.error('Erro não-Axios:', error);
    }
    throw error;
  }
};

export const getConsultas = async () => {
  const response = await api.get('consultas/');
  return response.data;
};

export const getAudiosNaoEnviados = async () => {
  const response = await api.get('consultas/nao-enviadas/');
  return response.data;
};

// Adicione funções para outras chamadas de API (getClinicas, etc.)

export const getDatabaseOverview = async () => {
  try {
    const response = await axios.get('/api/database-overview/');
    return response.data;
  } catch (error) {
    console.error('Erro ao obter visão geral do banco de dados:', error);
    throw error;
  }
};

export const getClinicaInfo = async () => {
  const response = await api.get('clinica-info/');
  return response.data;
};

export const getUsers = async () => {
  try {
    const response = await axios.get('/api/users/');
    return response.data;
  } catch (error) {
    console.error('Erro ao obter usuários:', error);
    throw error;
  }
};

export const deleteUser = async (userId: number) => {
  try {
    await axios.delete(`/api/users/${userId}/`);
  } catch (error) {
    console.error('Erro ao deletar usuário:', error);
    throw error;
  }
};

export const getClinics = async () => {
  try {
    const response = await axios.get('/api/clinics/');
    return response.data;
  } catch (error) {
    console.error('Erro ao obter clínicas:', error);
    throw error;
  }
};

export const createClinic = async (clinicData: { name: string; address: string }) => {
  try {
    const response = await axios.post('/api/clinics/', clinicData);
    return response.data;
  } catch (error) {
    console.error('Erro ao criar clínica:', error);
    throw error;
  }
};

export const updateClinic = async (clinicId: number, clinicData: { name: string; address: string }) => {
  try {
    const response = await axios.put(`/api/clinics/${clinicId}/`, clinicData);
    return response.data;
  } catch (error) {
    console.error('Erro ao atualizar clínica:', error);
    throw error;
  }
};

export const deleteClinic = async (clinicId: number) => {
  try {
    await axios.delete(`/api/clinics/${clinicId}/`);
  } catch (error) {
    console.error('Erro ao deletar clínica:', error);
    throw error;
  }
};

export const getDoctorSettings = async () => {
  const response = await api.get('/doctor-settings/');
  return response.data;
};

export const getReports = async () => {
  try {
    const response = await axios.get('/api/reports/');
    return response.data;
  } catch (error) {
    console.error('Erro ao obter relatórios:', error);
    throw error;
  }
};

export const getNewClinicsData = async () => {
  try {
    const response = await axios.get('/api/new-clinics-data/');
    return response.data;
  } catch (error) {
    console.error('Erro ao obter dados de novas clínicas:', error);
    throw error;
  }
};
