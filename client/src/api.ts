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
    localStorage.setItem('token', response.data.access);
    
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
  try {
    const response = await api.get('dashboard/data/');
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar dados do dashboard:', error);
    throw error;
  }
};

export const getDashboardGeral = async () => {
  const response = await api.get('dashboard/geral/');
  return response.data;
};

export const getDashboardClinica = async () => {
  const response = await api.get('dashboard/clinica/');
  return response.data;
};

export const verifyPin = async (email: string, pin: string) => {
  try {
    const response = await api.post('/users/verify_pin/', { email, pin });
    return response.data.valid;
  } catch (error) {
    console.error('Erro ao verificar PIN:', error);
    return false;
  }
};

export const getPipedrivePatients = async () => {
  try {
    const response = await api.get('pipedrive/patients/');
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar pacientes do Pipedrive:', error);
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
  const response = await api.get('/api/database-overview/');
  return response.data;
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
    const response = await api.get('/clinics/');
    return response.data;
  } catch (error) {
    console.error('Erro ao obter clínicas:', error);
    throw error;
  }
};

export const createClinic = async (clinicData: Omit<Clinic, 'id' | 'createdAt'>) => {
  try {
    const response = await api.post('/clinics/', clinicData);
    return response.data;
  } catch (error) {
    console.error('Erro ao criar clínica:', error);
    throw error;
  }
};

export const updateClinic = async (id: number, clinicData: Partial<Clinic>) => {
  try {
    const response = await api.put(`/clinics/${id}/`, clinicData);
    return response.data;
  } catch (error) {
    console.error('Erro ao atualizar clínica:', error);
    throw error;
  }
};

export const deleteClinic = async (id: number) => {
  try {
    await api.delete(`/clinics/${id}/`);
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
    const response = await api.get('dashboard/new-clinics/');
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar dados de novas clínicas:', error);
    throw error;
  }
};

export const getTwoFactorStatus = async () => {
  const response = await api.get('/two-factor/status');
  return response.data;
};

export const enableTwoFactor = async () => {
  const response = await api.post('/two-factor/enable');
  return response.data;
};

export const disableTwoFactor = async () => {
  const response = await api.post('/two-factor/disable');
  return response.data;
};

export const verifyTwoFactor = async (code: string) => {
  const response = await api.post('/two-factor/verify', { code });
  return response.data;
};

export const getClinicRegistrations = async () => {
  try {
    const response = await api.get('/clinic-registrations/');
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar registros de clínicas:', error);
    throw error;
  }
};

export const updateClinicRegistrationStatus = async (id: number, status: 'approved' | 'rejected') => {
  try {
    const response = await api.put(`/clinic-registrations/${id}/`, { status });
    return response.data;
  } catch (error) {
    console.error('Erro ao atualizar status do registro de clínica:', error);
    throw error;
  }
};

export const getSuperAdmins = async () => {
  try {
    const response = await api.get('/super-admins/');
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar super admins:', error);
    throw error;
  }
};

export const createSuperAdmin = async (superAdminData: Omit<SuperAdmin, 'id'>) => {
  try {
    const response = await api.post('/super-admins/', superAdminData);
    return response.data;
  } catch (error) {
    console.error('Erro ao criar super admin:', error);
    throw error;
  }
};

export const updateSuperAdmin = async (id: number, superAdminData: Partial<SuperAdmin>) => {
  try {
    const response = await api.put(`/super-admins/${id}/`, superAdminData);
    return response.data;
  } catch (error) {
    console.error('Erro ao atualizar super admin:', error);
    throw error;
  }
};

export const deleteSuperAdmin = async (id: number) => {
  try {
    await api.delete(`/super-admins/${id}/`);
  } catch (error) {
    console.error('Erro ao deletar super admin:', error);
    throw error;
  }
};

export interface SuperAdmin {
  id: number;
  username: string;
  email: string;
}

export default api;

export const createUser = async (userData: Omit<User, 'id'>) => {
  try {
    const response = await api.post('/users/', userData);
    return response.data;
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    throw error;
  }
};

export const updateUser = async (id: number, userData: Partial<User>) => {
  try {
    const response = await api.put(`/users/${id}/`, userData);
    return response.data;
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    throw error;
  }
};

export interface Clinic {
  id: number;
  name: string;
  email: string;
  password: string;
  address: string;
  phone: string;
  status: 'active' | 'inactive';
  createdAt: Date;
}

export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
}

