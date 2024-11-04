// types.ts

// Enums
export type UserRole = 'SA' | 'ME' | 'AM';

// User related interfaces
export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  is_active: boolean;
  password?: string;
  medico?: MedicoData;
  date_joined?: string;
}

export interface MedicoData {
  id?: number;
  especialidade: string;
  clinica_id?: number;
  clinica?: Clinic;
  servicos?: number[];
}

// Clinic related interfaces
export interface Clinic {
  id: number;
  nome: string;
  created_at: string;
  ativa: boolean;
  logo: string | null;
  pipedrive_api_token: string | null;
}

export interface ClinicRegistration {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  owner_name: string;
  owner_document: string;
  business_document: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  processed_at?: string;
  processed_by?: User;
  notes?: string;
}

// Service related interfaces
export interface Service {
  id: number;
  nome: string;
  descricao?: string;
  ativo: boolean;
}

// Patient related interfaces
export interface Patient {
  id: string;
  nome: string;
  clinica: Clinic;
  email: string;
  is_novo: boolean;
  idade: number;
  genero: string;
  ocupacao: string;
  localizacao: string;
  data_cadastro: string;
}

// Consultation related interfaces
export interface Consulta {
  id: number;
  data: string;
  medico: {
    usuario: {
      nome: string;
    };
    especialidade: string;
  };
  paciente: {
    nome: string;
  };
  servico: {
    nome: string;
  };
  duracao: number;
  audio_path?: string;
  incidente: boolean;
  satisfacao: number;
  comentario?: string;
  enviado: boolean;
  valor: number;
  summary?: string;
  satisfaction_score?: number;
  quality_index?: number;
  key_topics: string[];
  marketing_opportunities: string[];
  ai_processed: boolean;
}

export interface ConsultationMetadata {
  startTime: string;
  duration: number;
  size: number;
  consultation_id: number;
  doctorId: number;
  doctorName: string;
  doctorSpecialty: string;
  clinicId: number;
  clinicName: string;
  patientId: string;
  patientName: string;
  serviceId: number;
  serviceName: string;
  participants: number;
  language: string;
}

export interface ConsultationDetails {
  id: string;
  summary: string;
  transcription_url?: string;
  summary_url?: string;
  quality_index: number;
  satisfaction_score: number;
  key_topics: string[];
  marketing_opportunities: string[];
}

// Dashboard related interfaces
export interface DashboardData {
  total_clinicas: number;
  total_medicos: number;
  total_pacientes: number;
  total_consultas: number;
  new_clinics_data: {
    month: string;
    count: number;
  }[];
}

export interface ReportData {
  totalPatientsAttended: number;
  patientsPerDoctor: { [key: string]: number };
  newPatientsAttended: number;
  returningPatientsAttended: number;
  patientRetentionRate: number;
  averageConsultationTime: number;
  overallPatientSatisfaction: number;
  doctorQualityIndex: { [key: string]: number };
  patientDemographics: {
    ageGroups: { [key: string]: number };
    genderDistribution: { [key: string]: number };
    occupations: { [key: string]: number };
    locations: { [key: string]: number };
  };
}

// Form Data interfaces
export interface CreateUserData {
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  is_active: boolean;
  password?: string;
  medico?: MedicoData;
}

export interface UpdateUserData extends Partial<CreateUserData> {
  medico?: MedicoData;
}

export interface SuperAdmin {
  id: number;
  username: string;
  email: string;
}

// Component Props interfaces
export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

export interface ConsultationManagementProps {
  clinicId: number;
}

export interface ConfirmActionDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (password: string, dontAskToday: boolean) => void;
  title: string;
  message: string;
  disabled?: boolean;
}

export interface SuperAdminDashboardProps {
  title: string;
  value: number;
}

export interface HeaderProps {
  onLanguageChange: (lang: string) => void;
  currentLanguage: string;
  clinicName?: string;
  showMenu?: boolean;
  menuItems?: Array<{ title: string; link: string }>;
}

export interface TwoFactorSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface DocumentViewerProps {
  consultationId: string;
  fileType: 'transcription' | 'summary';
}

export interface NewClinicsChartProps {
  data: { month: string; count: number }[];
}

export interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

// Audio Recording interfaces
export interface AudioRecordingState {
  translations: {
    audioRecording: string;
    startRecording: string;
    stopRecording: string;
    processingAudio: string;
    sendAudio: string;
    pauseRecording: string;
    resumeRecording: string;
  };
}

// Consultation Setup interfaces
export interface Patient {
  id: string;
  name: string;
}

export interface ConsultationSetupService {
  id: number;
  nome: string;
  descricao?: string;
}

// ManageClinics interfaces
export interface ClinicDialogProps {
  open: boolean;
  onClose: () => void;
  clinic: Clinic | null;
  onSave: (clinicData: Omit<Clinic, 'id' | 'created_at'> | Partial<Clinic>) => void;
}

// ManageRegistrations interfaces
export interface Registration {
  id: number;
  name: string;
  email: string;
  phone: string;
  owner_name: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  notes: string;
}

export interface RegistrationDialogProps {
  open: boolean;
  registration: Registration | null;
  onClose: () => void;
  onStatusChange: (id: number, status: string, notes: string) => void;
}

// SuperAdminHeader interfaces
export interface SuperAdminHeaderProps {
  onLanguageChange: (lang: string) => void;
  currentLanguage: string;
}

// Audio interfaces
export interface StoredAudio {
  id: string;
  blob: Blob;
  metadata: any;
}

export interface AudioMetadata {
  consultaId: string;
  paciente: string;
  timestamp: number;
}

// Service Management interfaces
export interface ServiceDialogProps {
  open: boolean;
  onClose: () => void;
  service: Service | null;
  onSave: (serviceData: any) => void;
}

// Menu interfaces
export interface MenuItem {
  title: string;
  link: string;
  icon?: React.ReactNode;
}

// Chart interfaces
export interface ChartData {
  month: string;
  count: number;
  monthAbbr?: string;
}

// Table interfaces
export interface TableSortConfig {
  field: string;
  direction: 'asc' | 'desc';
}

// Filter interfaces
export interface FilterConfig {
  searchTerm: string;
  status?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

// Pagination interfaces
export interface PaginationConfig {
  page: number;
  perPage: number;
  total: number;
}

// Dialog interfaces
export interface DialogState {
  open: boolean;
  type: 'create' | 'edit' | 'delete' | 'view';
  data?: any;
}

// Error interfaces
export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}

// Success interfaces
export interface ApiSuccess {
  message: string;
  data?: any;
}

// Loading State interfaces
export interface LoadingState {
  isLoading: boolean;
  loadingMessage?: string;
}

// Form interfaces
export interface FormState {
  isDirty: boolean;
  isValid: boolean;
  errors: Record<string, string>;
}

export interface WaveSurferBackend {
  setBuffer?: (buffer: Float32Array) => void;
}

export interface Doctor {
   id: number;
  usuario: {
    first_name: string;
    last_name: string;
  };
  especialidade: string;
  total_consultas?: number;
}

export interface UserDialogProps {
  open: boolean;
  onClose: () => void;
  user: User | null;
  clinics: Clinic[];
  onSave: (userData: CreateUserData) => void;
}

export interface ConsultaResponse {
  consultation_id: number;
  doctor: {
    id: number;
    name: string;
    specialty: string;
  };
  clinic: {
    id: number;
    name: string;
  };
}