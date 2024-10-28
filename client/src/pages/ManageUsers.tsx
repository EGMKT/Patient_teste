import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Table, TableHead, TableBody, TableRow, TableCell, Paper, TableContainer, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { getUsers, createUser, updateUser, deleteUser } from '../api';

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
}

const ManageUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await getUsers();
      setUsers(response.users); // Ajuste aqui para acessar 'users' da resposta
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
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
    try {
      await updateUser(id, userData);
      fetchUsers();
      setOpenDialog(false);
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
    }
  };

  const handleDeleteUser = async (id: number) => {
    try {
      await deleteUser(id);
      fetchUsers();
    } catch (error) {
      console.error('Erro ao deletar usuário:', error);
    }
  };

  const filteredUsers = users.filter((user) =>
    Object.values(user).some((value) =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="flex flex-col min-h-screen">
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">{t('manageUsers')}</h1>
        <Button onClick={() => { setCurrentUser(null); setOpenDialog(true); }} variant="contained" color="primary" className="mb-4">
          {t('createUser')}
        </Button>
        <TextField
          label={t('search')}
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          fullWidth
          margin="normal"
        />
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t('name')}</TableCell>
                <TableCell>{t('email')}</TableCell>
                <TableCell>{t('role')}</TableCell>
                <TableCell>{t('actions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
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
        <UserDialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          user={currentUser}
          onSave={(userData) => currentUser ? handleUpdateUser(currentUser.id, userData) : handleCreateUser(userData)}
        />
      </div>
    </div>
  );
};

interface UserDialogProps {
  open: boolean;
  onClose: () => void;
  user: User | null;
  onSave: (userData: Omit<User, 'id'>) => void;
}

const UserDialog: React.FC<UserDialogProps> = ({ open, onClose, user, onSave }) => {
  const [name, setName] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [role, setRole] = useState(user?.role || '');
  const { t } = useTranslation();

  useEffect(() => {
    if (user) {
      setName(user.username);
      setEmail(user.email);
      setRole(user.role);
    } else {
      setName('');
      setEmail('');
      setRole('');
    }
  }, [user]);

  const handleSave = () => {
    onSave({ username: name, email, role });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{user ? t('editUser') : t('createUser')}</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label={t('name')}
          type="text"
          fullWidth
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <TextField
          margin="dense"
          label={t('email')}
          type="email"
          fullWidth
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          margin="dense"
          label={t('role')}
          type="text"
          fullWidth
          value={role}
          onChange={(e) => setRole(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('cancel')}</Button>
        <Button onClick={handleSave}>{t('save')}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ManageUsers;
