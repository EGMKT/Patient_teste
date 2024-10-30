import axios, { AxiosError } from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('Token sendo enviado:', token);
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

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
  try {
    const response = await api.get('clinica-info/');
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar informações da clínica:', error);
    throw error;
  }
};

export const getUsers = async () => {
  try {
    const response = await api.get('users/');
    return {
      users: Array.isArray(response.data) ? response.data : response.data.users || [],
      total_pages: response.data.total_pages,
      current_page: response.data.current_page
    };
  } catch (error) {
    console.error('Erro ao obter usuários:', error);
    throw error;
  }
};

export const deleteUser = async (userId: number): Promise<void> => {
  try {
    console.log(`Iniciando requisição para excluir usuário ${userId}`);
    
    const response = await api.delete(`users/${userId}/`);
    
    console.log('Resposta da exclusão:', response);
    
    if (response.status !== 204) {
      throw new Error('Erro ao excluir usuário');
    }
  } catch (error) {
    console.error('Erro completo:', error);
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.error || 'Erro ao excluir usuário';
      throw new Error(errorMessage);
    }
    throw error;
  }
};

export interface Clinic {
  id: number;
  nome: string;
  created_at: string;
  ativa: boolean;
  logo: string | null;
  pipedrive_api_token: string | null;
}

export const getClinics = async (): Promise<Clinic[]> => {
  try {
    const response = await api.get('/clinicas/');
    return response.data;
  } catch (error) {
    console.error('Erro ao obter clínicas:', error);
    throw error;
  }
};

export const createClinic = async (clinicData: Omit<Clinic, 'id' | 'created_at'>): Promise<Clinic> => {
  try {
    const response = await api.post('/clinicas/', clinicData);
    return response.data;
  } catch (error) {
    console.error('Erro ao criar clínica:', error);
    throw error;
  }
};

export const updateClinic = async (id: number, clinicData: Partial<Clinic>): Promise<Clinic> => {
  try {
    const response = await api.put(`/clinicas/${id}/`, clinicData);
    return response.data;
  } catch (error) {
    console.error('Erro ao atualizar clínica:', error);
    throw error;
  }
};

export const deleteClinic = async (id: number): Promise<void> => {
  try {
    const response = await api.delete(`/clinicas/${id}/`);
    if (response.status !== 204) {
      throw new Error('Erro ao excluir clínica');
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Erro ao deletar clínica:', error.response?.data);
      throw new Error(error.response?.data?.error || 'Erro ao excluir clínica');
    }
    throw error;
  }
};

export const getDoctorSettings = async () => {
  const response = await api.get('/doctor-settings/');
  return response.data;
};

export const getReports = async () => {
  try {
    console.log('Fazendo requisição para:', `${API_URL}/reports/`);
    const response = await api.get('reports/');
    console.log('Resposta:', response.data);
    return response.data;
  } catch (error) {
    console.error('Erro ao obter relatórios:', error);
    if (axios.isAxiosError(error)) {
      console.error('Detalhes do erro:', {
        status: error.response?.status,
        data: error.response?.data,
        headers: error.response?.headers
      });
    }
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

export const createUser = async (userData: Omit<User, 'id'> & { password?: string }) => {
  try {
    console.log('Dados sendo enviados:', userData);
    const response = await api.post('/users/', {
      email: userData.email,
      first_name: userData.first_name,
      last_name: userData.last_name,
      password: userData.password,
      role: userData.role,
      ...(userData.role === 'ME' && {
        medico: {
          especialidade: userData.medico?.especialidade,
          clinica: userData.medico?.clinica?.id
        }
      })
    });
    return response.data;
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    if (axios.isAxiosError(error) && error.response) {
      console.error('Resposta do servidor:', error.response.data);
    }
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

export type UserRole = 'SA' | 'AC' | 'ME';

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  is_active: boolean;
  password?: string;
  medico?: {
    especialidade: string;
    clinica?: {
      id: number;
      nome: string;
    };
  };
}

export const verifyPassword = async (password: string) => {
  try {
    const response = await api.post('/verify-password/', { password });
    return response.data.valid;
  } catch (error) {
    console.error('Erro ao verificar senha:', error);
    return false;
  }
};

export const toggleUserStatus = async (userId: number, isActive: boolean): Promise<void> => {
  try {
    const response = await api.patch(`/api/users/${userId}/`, {
      is_active: isActive
    });
    if (response.status !== 200) {
      throw new Error('Erro ao atualizar status do usuário');
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.error || 'Erro ao atualizar status do usuário';
      throw new Error(errorMessage);
    }
    throw new Error('Erro ao atualizar status do usuário');
  }
};
