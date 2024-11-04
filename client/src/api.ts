import axios, { AxiosError } from 'axios';
import { 
  User, 
  Clinic, 
  Service, 
  ConsultationMetadata, 
  Consulta,
  CreateUserData,
  UpdateUserData,
  MedicoData,
  UserRole,
  SuperAdmin,
  Doctor, 
  ConsultaResponse,
  TendenciaPaciente,
  DoctorDashboardData
} from './types';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
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
    console.error('Erro na requisição:', error.response?.status, error.response?.data);
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const login = async (email: string, password: string) => {
  try {
    const response = await api.post('login/', { 
      email, 
      password 
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.data.access) {
      localStorage.setItem('token', response.data.access);
      
      // Configure o token para todas as requisições futuras
      api.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;
      
      return {
        access: response.data.access,
        user: response.data.user
      };
    }
    throw new Error('No access token received');
  } catch (error) {
    console.error('Login error:', error);
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || 'Login failed');
    }
    throw new Error('Network error');
  }
};

export const checkTrustedDevice = async (deviceId: string) => {
  const response = await api.post('trusted-device/', { device_id: deviceId });
  return response.data;
};


export const getMedicos = async (): Promise<Doctor[]> => {
  try {
    const response = await api.get('/medicos/');
    console.log('Resposta getMedicos:', response.data);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar médicos:', error);
    throw error;
  }
};

export const getPacientes = async () => {
  const response = await api.get('pacientes/');
  return response.data;
};



export const criarConsulta = async (consultaData: {
  medico_id: number;
  paciente_id: string;
  servico_id: number;
  duracao: string;
  data: string;
  satisfacao: number;
  valor: number;
}): Promise<ConsultaResponse> => {
  try {
    console.log('Dados sendo enviados para criar consulta:', consultaData);
    const response = await api.post('/consulta/gravar/', consultaData);
    console.log('Resposta da criação da consulta:', response.data);
    return response.data;
  } catch (error) {
    console.error('Erro ao criar consulta:', error);
    if (axios.isAxiosError(error)) {
      console.error('Detalhes do erro:', error.response?.data);
    }
    throw error;
  }
};

export const enviarAudio = async (audioBase64: string, metadata: ConsultationMetadata) => {
  const payload = {
    consultation: {
      audio: audioBase64,
      recorded_at: metadata.startTime,
      duration: metadata.duration,
      format: "audio/webm;codecs=opus",
      size: metadata.size,
    },
    patient: {
      id: metadata.patientId,
      source: "pipedrive",
    },
    doctor: {
      id: metadata.doctorId,
      specialty: metadata.doctorSpecialty,
    },
    service: {
      id: metadata.serviceId,
      name: metadata.serviceName,
    },
    clinic: {
      id: metadata.clinicId,
      name: metadata.clinicName,
    },
    session: {
      participants: metadata.participants,
      language: metadata.language,
      environment: {
        app_version: process.env.REACT_APP_VERSION,
        platform: "web",
        browser: navigator.userAgent,
      }
    }
  };

  const webhookUrl = 'https://n8n.patientfunnel.solutions/webhook-test/teste-patientFunnel';
  const response = await axios.post(webhookUrl, payload);
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

export const getDashboardClinica = async (clinicId: number) => {
  try {
    const response = await api.get(`dashboard/clinica/${clinicId}/`);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar dados da clínica:', error);
    throw error;
  }
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



export default api;

export const createUser = async (userData: CreateUserData) => {
  try {
    console.log('Dados sendo enviados:', userData);
    const response = await api.post('/users/', userData);
    return response.data;
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    if (axios.isAxiosError(error) && error.response) {
      console.error('Resposta do servidor:', error.response.data);
    }
    throw error;
  }
};

export const updateUser = async (id: number, userData: UpdateUserData) => {
  try {
    console.log('Dados sendo enviados para atualização:', userData);
    const response = await api.put(`/users/${id}/`, userData);
    return response.data;
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    if (axios.isAxiosError(error) && error.response) {
      console.error('Resposta do servidor:', error.response.data);
    }
    throw error;
  }
};

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

export const bulkUpdateClinics = async (clinicIds: number[], action: 'activate' | 'deactivate'): Promise<void> => {
  try {
    const response = await api.post('/clinicas/bulk_update/', {
      clinic_ids: clinicIds,
      action: action
    });
    return response.data;
  } catch (error) {
    console.error('Erro ao atualizar clínicas em massa:', error);
    throw error;
  }
};

export const getServices = async (): Promise<Service[]> => {
  try {
    const response = await api.get('/servicos/');
    return response.data;
  } catch (error) {
    console.error('Erro ao obter serviços:', error);
    throw error;
  }
};

export const createService = async (serviceData: Omit<Service, 'id'>): Promise<Service> => {
  try {
    const response = await api.post('/servicos/', {
      ...serviceData,
    });
    return response.data;
  } catch (error) {
    console.error('Erro ao criar serviço:', error);
    throw error;
  }
};

export const updateService = async (id: number, serviceData: Partial<Service>): Promise<Service> => {
  try {
    const response = await api.put(`/servicos/${id}/`, serviceData);
    return response.data;
  } catch (error) {
    console.error('Erro ao atualizar serviço:', error);
    throw error;
  }
};

export const deleteService = async (id: number): Promise<void> => {
  try {
    const response = await api.delete(`/servicos/${id}/`);
    if (response.status !== 204) {
      throw new Error('Erro ao excluir serviço');
    }
  } catch (error) {
    console.error('Erro ao deletar serviço:', error);
    throw error;
  }
};

export const getMedicoServicos = async () => {
  try {
    const response = await api.get('/servicos/medico_servicos/');
    console.log('Resposta dos serviços do médico:', response.data);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar serviços do médico:', error);
    throw error;
  }
};

export const getConsultasByClinica = async (clinicId: number): Promise<Consulta[]> => {
  try {
    const response = await api.get(`/clinicas/${clinicId}/consultas/`);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar consultas:', error);
    throw error;
  }
};

export const deleteConsulta = async (id: number): Promise<void> => {
  try {
    const response = await api.delete(`/consultas/${id}/`);
    if (response.status !== 204) {
      throw new Error('Erro ao excluir consulta');
    }
  } catch (error) {
    console.error('Erro ao deletar consulta:', error);
    throw error;
  }
};

export const getMedicosByClinica = async (clinicaId: number): Promise<Doctor[]> => {
  try {
    const response = await api.get(`/clinicas/${clinicaId}/medicos/`);
    console.log('Resposta getMedicosByClinica:', response.data);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar médicos da clínica:', error);
    throw error;
  }
};

export const getDashboardMedico = async (doctorId: number): Promise<DoctorDashboardData> => {
  try {
    const response = await api.get(`dashboard/medico/${doctorId}/`);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar dados do médico:', error);
    throw error;
  }
};

export const getConsultasByPaciente = async (pacienteId: string): Promise<Consulta[]> => {
  try {
    const response = await api.get(`/pacientes/${pacienteId}/consultas/`);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar consultas do paciente:', error);
    throw error;
  }
};
