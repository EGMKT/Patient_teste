import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Table, TableHead, TableBody, TableRow, TableCell, Paper, 
  TableContainer, Button, TextField, Dialog, DialogTitle, 
  DialogContent, DialogActions, Select, MenuItem, FormControl,
  InputLabel, CircularProgress, DialogContentText,
  Alert, Checkbox, Chip
} from '@mui/material';
import api, { getUsers, createUser, updateUser, deleteUser, User, getClinics, Clinic, verifyPassword, MedicoData, UpdateUserData, CreateUserData } from '../api';
import ConfirmActionDialog from '../components/ConfirmActionDialog';

// Adicione esta definição de tipo no início do arquivo
type UserRole = 'SA' | 'AC' | 'ME';

const ManageUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<{
    type: 'delete' | 'update';
    userId?: number;
    userData?: any;
  } | null>(null);
  const [confirmActionDialogOpen, setConfirmActionDialogOpen] = useState(false);
  const [skipPasswordUntil, setSkipPasswordUntil] = useState<number | null>(
    Number(localStorage.getItem('skipPasswordUntil')) || null
  );
  const [confirmDeleteDialogOpen, setConfirmDeleteDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    fetchUsers();
    fetchClinics();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await getUsers();
      console.log('Usuários recebidos:', response.users);
      setUsers(response.users || []);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      setError('Erro ao carregar usuários');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchClinics = async () => {
    try {
      const response = await getClinics();
      setClinics(response || []);
    } catch (error) {
      console.error('Erro ao buscar clínicas:', error);
      setClinics([]);
    }
  };

  const handleCreateUser = async (userData: Omit<User, 'id'>) => {
    try {
      await createUser(userData);
      fetchUsers();
      setOpenDialog(false);
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
    }
  };

  const handleUpdateUser = async (id: number, userData: UpdateUserData) => {
    try {
      console.log('Dados antes da atualização:', userData);
      
      if (userData.role === 'ME' && userData.medico) {
        const updatedMedico: MedicoData = {
          especialidade: userData.medico.especialidade,
          clinica_id: userData.medico.clinica?.id
        };
        userData.medico = updatedMedico;
      }
      
      console.log('Dados sendo enviados para atualização:', userData);
      await updateUser(id, userData);
      await fetchUsers();
      setOpenDialog(false);
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      setError(error instanceof Error ? error.message : 'Erro ao atualizar usuário');
    }
  };

  const shouldAskPassword = () => {
    if (!skipPasswordUntil) return true;
    return new Date().getTime() > skipPasswordUntil;
  };

  const handleDeleteClick = (id: number) => {
    setSelectedUserId(id);
    setConfirmDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedUserId || isDeleting) return;

    try {
      setIsDeleting(true);
      setError(null);
      
      if (shouldAskPassword()) {
        setPendingAction({ type: 'delete', userId: selectedUserId });
        setConfirmActionDialogOpen(true);
      } else {
        console.log(`Iniciando exclusão do usuário ${selectedUserId}`);
        await deleteUser(selectedUserId);
        console.log('Usuário excluído com sucesso');
        await fetchUsers();
        setConfirmDeleteDialogOpen(false);
      }
    } catch (error) {
      console.error('Erro na exclusão:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro ao excluir usuário';
      setError(errorMessage);
    } finally {
      setIsDeleting(false);
      setSelectedUserId(null);
    }
  };

  const handleConfirmAction = async (password: string, dontAskToday: boolean) => {
    if (!pendingAction || isDeleting) return;

    try {
      setIsDeleting(true);
      setError(null);
      
      const verified = await verifyPassword(password);
      if (!verified) {
        setError(t('manageUsers.invalidPassword'));
        return;
      }

      if (dontAskToday) {
        const until = new Date().setHours(23, 59, 59, 999);
        setSkipPasswordUntil(until);
        localStorage.setItem('skipPasswordUntil', until.toString());
      }

      if (pendingAction.type === 'delete' && pendingAction.userId) {
        await deleteUser(pendingAction.userId);
        await fetchUsers();
        setConfirmActionDialogOpen(false);
        setConfirmDeleteDialogOpen(false);
      }

      setPendingAction(null);
    } catch (error) {
      console.error('Erro na ação:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro ao executar ação';
      setError(errorMessage);
    } finally {
      setIsDeleting(false);
      setSelectedUserId(null);
    }
  };

  const filteredUsers = users.filter((user) => {
    if (!user) return false;
    return Object.values(user).some((value) => 
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <CircularProgress />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <div className="container mx-auto p-4">
        {error && (
          <Alert 
            severity="error" 
            onClose={() => setError(null)}
            className="mb-4"
          >
            {error}
          </Alert>
        )}
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">{t('manageUsers.title')}</h1>
            <Button 
              onClick={() => { setCurrentUser(null); setOpenDialog(true); }} 
              variant="contained" 
              color="primary"
            >
              {t('manageUsers.createUser')}
            </Button>
          </div>

          <TextField
            label={t('manageUsers.search')}
            variant="outlined"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            fullWidth
            margin="normal"
            className="mb-4"
          />

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{t('manageUsers.email')}</TableCell>
                  <TableCell>{t('manageUsers.firstName')}</TableCell>
                  <TableCell>{t('manageUsers.lastName')}</TableCell>
                  <TableCell>{t('manageUsers.role')}</TableCell>
                  <TableCell>{t('manageUsers.clinic')}</TableCell>
                  <TableCell>{t('manageUsers.specialty')}</TableCell>
                  <TableCell>{t('manageUsers.status')}</TableCell>
                  <TableCell>{t('manageUsers.actions')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow 
                    key={user.id}
                    sx={{ 
                      opacity: user.is_active ? 1 : 0.6,
                      backgroundColor: user.is_active ? 'inherit' : 'rgba(0, 0, 0, 0.04)'
                    }}
                  >
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.first_name}</TableCell>
                    <TableCell>{user.last_name}</TableCell>
                    <TableCell>{t(`manageUsers.roles.${user.role}`)}</TableCell>
                    <TableCell>{user.medico?.clinica?.nome || '-'}</TableCell>
                    <TableCell>{user.medico?.especialidade || '-'}</TableCell>
                    <TableCell>
                      <span 
                        className={`px-2 py-1 rounded-full text-sm ${
                          user.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {user.is_active ? 
                          t('manageUsers.status.active') : 
                          t('manageUsers.status.inactive')
                        }
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button onClick={() => { setCurrentUser(user); setOpenDialog(true); }}>
                        {t('manageUsers.edit')}
                      </Button>
                      <Button onClick={() => handleDeleteClick(user.id)}>
                        {t('manageUsers.delete')}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      </div>

      <Dialog
        open={confirmDeleteDialogOpen}
        onClose={() => !isDeleting && setConfirmDeleteDialogOpen(false)}
      >
        <DialogTitle>{t('manageUsers.confirmDeleteTitle')}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t('manageUsers.confirmDeleteMessage')}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setConfirmDeleteDialogOpen(false)}
            disabled={isDeleting}
          >
            {t('common.cancel')}
          </Button>
          <Button 
            onClick={handleConfirmDelete}
            color="primary"
            disabled={isDeleting}
          >
            {isDeleting ? t('common.deleting') : t('common.confirm')}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmActionDialog
        open={confirmActionDialogOpen}
        onClose={() => !isDeleting && setConfirmActionDialogOpen(false)}
        onConfirm={handleConfirmAction}
        title={t('manageUsers.enterPassword')}
        message={t('manageUsers.passwordRequired')}
        disabled={isDeleting}
      />

      <UserDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        user={currentUser}
        clinics={clinics}
        onSave={(userData) => 
          currentUser 
            ? handleUpdateUser(currentUser.id, userData) 
            : handleCreateUser(userData)
        }
      />
    </div>
  );
};

interface UserDialogProps {
  open: boolean;
  onClose: () => void;
  user: User | null;
  clinics: Clinic[];
  onSave: (userData: CreateUserData) => void;
}

interface Service {
  id: number;
  nome: string;
}

const UserDialog: React.FC<UserDialogProps> = ({ open, onClose, user, clinics, onSave }) => {
  const [email, setEmail] = useState(user?.email || '');
  const [firstName, setFirstName] = useState(user?.first_name || '');
  const [lastName, setLastName] = useState(user?.last_name || '');
  const [role, setRole] = useState<UserRole>(user?.role || 'ME');
  const [clinicId, setClinicId] = useState<number | null>(user?.medico?.clinica?.id || null);
  const [especialidade, setEspecialidade] = useState(user?.medico?.especialidade || '');
  const [password, setPassword] = useState('');
  const [services, setServices] = useState<Service[]>([]);
  const [selectedServices, setSelectedServices] = useState<number[]>([]);
  const { t } = useTranslation();

  useEffect(() => {
    // Carregar serviços disponíveis
    const fetchServices = async () => {
      try {
        const response = await api.get('/servicos/');
        setServices(response.data);
      } catch (error) {
        console.error('Erro ao carregar serviços:', error);
      }
    };

    fetchServices();
  }, []);

  useEffect(() => {
    if (user) {
      setEmail(user.email);
      setFirstName(user.first_name);
      setLastName(user.last_name);
      setRole(user.role);
      setClinicId(user.medico?.clinica?.id || null);
      setEspecialidade(user.medico?.especialidade || '');
      setPassword('');
      setSelectedServices(user.medico?.servicos || []);
    } else {
      setEmail('');
      setFirstName('');
      setLastName('');
      setRole('ME');
      setClinicId(null);
      setEspecialidade('');
      setPassword('');
      setSelectedServices([]);
    }
  }, [user]);

  const handleRoleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const newRole = event.target.value as UserRole;
    setRole(newRole);
    // Limpar dados do médico se mudar para um papel não-médico
    if (newRole !== 'ME') {
      setClinicId(null);
      setEspecialidade('');
    }
  };

  const handleSave = () => {
    const userData: CreateUserData = {
      email,
      first_name: firstName,
      last_name: lastName,
      role,
      is_active: true,
      password: password || undefined,
    };

    if (role === 'ME') {
      userData.medico = {
        especialidade,
        clinica_id: clinicId || undefined,
        servicos: selectedServices
      };
    }
    console.log('Dados sendo salvos:', userData);
    onSave(userData);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {user ? t('manageUsers.editUser') : t('manageUsers.createNewUser')}
      </DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label={t('manageUsers.email')}
          type="email"
          fullWidth
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {!user && (
          <TextField
            margin="dense"
            label={t('manageUsers.password')}
            type="password"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        )}
        <TextField
          margin="dense"
          label={t('manageUsers.firstName')}
          fullWidth
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />
        <TextField
          margin="dense"
          label={t('manageUsers.lastName')}
          fullWidth
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />
        <FormControl fullWidth margin="dense">
          <InputLabel>{t('manageUsers.role')}</InputLabel>
          <Select<UserRole>
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
          >
            <MenuItem value="SA">{t('manageUsers.roles.SA')}</MenuItem>
            <MenuItem value="AC">{t('manageUsers.roles.AC')}</MenuItem>
            <MenuItem value="ME">{t('manageUsers.roles.ME')}</MenuItem>
          </Select>
        </FormControl>
        
        {role === 'ME' && (
          <>
            <FormControl fullWidth margin="dense">
              <InputLabel>{t('manageUsers.clinic')}</InputLabel>
              <Select
                value={clinicId || ''}
                onChange={(e) => setClinicId(e.target.value ? Number(e.target.value) : null)}
              >
                <MenuItem value="">{t('manageUsers.selectClinic')}</MenuItem>
                {clinics.map((clinic) => (
                  <MenuItem key={clinic.id} value={clinic.id}>
                    {clinic.nome}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              margin="dense"
              label={t('manageUsers.specialty')}
              fullWidth
              value={especialidade}
              onChange={(e) => setEspecialidade(e.target.value)}
            />
            <FormControl fullWidth margin="dense">
              <InputLabel>{t('manageUsers.services')}</InputLabel>
              <Select
                multiple
                value={selectedServices}
                onChange={(e) => setSelectedServices(e.target.value as number[])}
                renderValue={(selected) => (
                  <div className="flex flex-wrap gap-1">
                    {selected.map((serviceId) => (
                      <Chip
                        key={serviceId}
                        label={services.find(s => s.id === serviceId)?.nome}
                        className="m-1"
                      />
                    ))}
                  </div>
                )}
              >
                {services.map((service) => (
                  <MenuItem key={service.id} value={service.id}>
                    <Checkbox checked={selectedServices.includes(service.id)} />
                    {service.nome}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('manageUsers.cancel')}</Button>
        <Button onClick={handleSave}>{t('manageUsers.save')}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ManageUsers;

