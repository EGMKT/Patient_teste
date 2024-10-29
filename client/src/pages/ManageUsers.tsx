import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Table, TableHead, TableBody, TableRow, TableCell, Paper, 
  TableContainer, Button, TextField, Dialog, DialogTitle, 
  DialogContent, DialogActions, Select, MenuItem, FormControl,
  InputLabel, CircularProgress, Dialog as ConfirmDialog,
  DialogTitle as ConfirmDialogTitle,
  DialogContent as ConfirmDialogContent,
  DialogContentText,
} from '@mui/material';
import { getUsers, createUser, updateUser, deleteUser, User, getClinics, Clinic } from '../api';

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
    type: 'update' | 'delete';
    userId?: number;
    userData?: any;
  } | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    fetchUsers();
    fetchClinics();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await getUsers();
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

  const handleUpdateUser = async (id: number, userData: Partial<User>) => {
    setPendingAction({ type: 'update', userId: id, userData });
    setConfirmDialogOpen(true);
  };

  const handleDeleteUser = async (id: number) => {
    setPendingAction({ type: 'delete', userId: id });
    setConfirmDialogOpen(true);
  };

  const handleConfirmAction = async () => {
    try {
      if (!pendingAction) return;

      if (pendingAction.type === 'update' && pendingAction.userId && pendingAction.userData) {
        await updateUser(pendingAction.userId, pendingAction.userData);
      } else if (pendingAction.type === 'delete' && pendingAction.userId) {
        await deleteUser(pendingAction.userId);
      }

      await fetchUsers();
      setConfirmDialogOpen(false);
      setPendingAction(null);
      setOpenDialog(false);
    } catch (error) {
      console.error('Erro ao executar ação:', error);
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
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">{t('manageUsers')}</h1>
            <Button 
              onClick={() => { setCurrentUser(null); setOpenDialog(true); }} 
              variant="contained" 
              color="primary"
            >
              {t('createUser')}
            </Button>
          </div>

          <TextField
            label={t('search')}
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
                  <TableCell>{t('email')}</TableCell>
                  <TableCell>{t('firstName')}</TableCell>
                  <TableCell>{t('lastName')}</TableCell>
                  <TableCell>{t('role')}</TableCell>
                  <TableCell>{t('clinic')}</TableCell>
                  <TableCell>{t('specialty')}</TableCell>
                  <TableCell>{t('actions')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.first_name}</TableCell>
                    <TableCell>{user.last_name}</TableCell>
                    <TableCell>{t(user.role)}</TableCell>
                    <TableCell>{user.medico?.clinica?.nome || '-'}</TableCell>
                    <TableCell>{user.medico?.especialidade || '-'}</TableCell>
                    <TableCell>
                      <Button onClick={() => { setCurrentUser(user); setOpenDialog(true); }}>
                        {t('edit')}
                      </Button>
                      <Button onClick={() => handleDeleteUser(user.id)}>
                        {t('delete')}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDialogOpen}
        onClose={() => {
          setConfirmDialogOpen(false);
          setPendingAction(null);
        }}
      >
        <ConfirmDialogTitle>
          {pendingAction?.type === 'delete' ? t('confirmDelete') : t('confirmUpdate')}
        </ConfirmDialogTitle>
        <ConfirmDialogContent>
          <DialogContentText>
            {pendingAction?.type === 'delete' 
              ? t('deleteUserConfirmation') 
              : t('updateUserConfirmation')}
          </DialogContentText>
        </ConfirmDialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setConfirmDialogOpen(false);
              setPendingAction(null);
            }}
          >
            {t('cancel')}
          </Button>
          <Button onClick={handleConfirmAction} color="primary">
            {t('confirm')}
          </Button>
        </DialogActions>
      </ConfirmDialog>

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
  onSave: (userData: Omit<User, 'id'>) => void;
}

const UserDialog: React.FC<UserDialogProps> = ({ open, onClose, user, clinics, onSave }) => {
  const [email, setEmail] = useState(user?.email || '');
  const [firstName, setFirstName] = useState(user?.first_name || '');
  const [lastName, setLastName] = useState(user?.last_name || '');
  const [role, setRole] = useState<UserRole>(user?.role || 'ME');
  const [clinicId, setClinicId] = useState<number | null>(user?.medico?.clinica?.id || null);
  const [especialidade, setEspecialidade] = useState(user?.medico?.especialidade || '');
  const [password, setPassword] = useState('');
  const { t } = useTranslation();

  useEffect(() => {
    if (user) {
      setEmail(user.email);
      setFirstName(user.first_name);
      setLastName(user.last_name);
      setRole(user.role);
      setClinicId(user.medico?.clinica?.id || null);
      setEspecialidade(user.medico?.especialidade || '');
      setPassword('');
    } else {
      setEmail('');
      setFirstName('');
      setLastName('');
      setRole('ME');
      setClinicId(null);
      setEspecialidade('');
      setPassword('');
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
    const userData: any = {
      email,
      first_name: firstName,
      last_name: lastName,
      role,
      password: password || undefined,
    };

    if (role === 'ME') {
      userData.medico = {
        clinica_id: clinicId, // Ajuste para usar clinica_id
        especialidade,
      };
    }

    onSave(userData);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{user ? t('editUser') : t('createUser')}</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label={t('email')}
          type="email"
          fullWidth
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {!user && (
          <TextField
            margin="dense"
            label={t('password')}
            type="password"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        )}
        <TextField
          margin="dense"
          label={t('firstName')}
          fullWidth
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />
        <TextField
          margin="dense"
          label={t('lastName')}
          fullWidth
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />
        <FormControl fullWidth margin="dense">
          <InputLabel>{t('role')}</InputLabel>
          <Select<UserRole>
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
          >
            <MenuItem value="SA">{t('superAdmin')}</MenuItem>
            <MenuItem value="AC">{t('clinicAdmin')}</MenuItem>
            <MenuItem value="ME">{t('doctor')}</MenuItem>
          </Select>
        </FormControl>
        
        {role === 'ME' && (
          <>
            <FormControl fullWidth margin="dense">
              <InputLabel>{t('clinic')}</InputLabel>
              <Select
                value={clinicId || ''}
                onChange={(e) => setClinicId(e.target.value ? Number(e.target.value) : null)}
              >
                <MenuItem value="">{t('selectClinic')}</MenuItem>
                {clinics.map((clinic) => (
                  <MenuItem key={clinic.id} value={clinic.id}>
                    {clinic.nome}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              margin="dense"
              label={t('specialty')}
              fullWidth
              value={especialidade}
              onChange={(e) => setEspecialidade(e.target.value)}
            />
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('cancel')}</Button>
        <Button onClick={handleSave}>{t('save')}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ManageUsers;
