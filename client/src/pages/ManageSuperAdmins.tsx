import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Table, TableHead, TableBody, TableRow, TableCell, Paper, TableContainer, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { getSuperAdmins, createSuperAdmin, updateSuperAdmin, deleteSuperAdmin } from '../api';

interface SuperAdmin {
  id: number;
  username: string;
  email: string;
}

const ManageSuperAdmins: React.FC = () => {
  const [superAdmins, setSuperAdmins] = useState<SuperAdmin[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [currentSuperAdmin, setCurrentSuperAdmin] = useState<SuperAdmin | null>(null);
  const { t, i18n } = useTranslation();

  useEffect(() => {
    fetchSuperAdmins();
  }, []);

  const fetchSuperAdmins = async () => {
    try {
      const response = await getSuperAdmins();
      setSuperAdmins(response);
    } catch (error) {
      console.error('Erro ao buscar super admins:', error);
    }
  };

  const handleCreateSuperAdmin = async (superAdminData: Omit<SuperAdmin, 'id'>) => {
    try {
      await createSuperAdmin(superAdminData);
      fetchSuperAdmins();
      setOpenDialog(false);
    } catch (error) {
      console.error('Erro ao criar super admin:', error);
    }
  };

  const handleUpdateSuperAdmin = async (id: number, superAdminData: Partial<SuperAdmin>) => {
    try {
      await updateSuperAdmin(id, superAdminData);
      fetchSuperAdmins();
      setOpenDialog(false);
    } catch (error) {
      console.error('Erro ao atualizar super admin:', error);
    }
  };

  const handleDeleteSuperAdmin = async (id: number) => {
    try {
      await deleteSuperAdmin(id);
      fetchSuperAdmins();
    } catch (error) {
      console.error('Erro ao deletar super admin:', error);
    }
  };

  const filteredSuperAdmins = superAdmins.filter((superAdmin) =>
    Object.values(superAdmin).some((value) =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="flex flex-col min-h-screen">
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">{t('manageSuperAdmins')}</h1>
        <Button onClick={() => { setCurrentSuperAdmin(null); setOpenDialog(true); }} variant="contained" color="primary" className="mb-4">
          {t('createSuperAdmin')}
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
                <TableCell>{t('username')}</TableCell>
                <TableCell>{t('email')}</TableCell>
                <TableCell>{t('actions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredSuperAdmins.map((superAdmin) => (
                <TableRow key={superAdmin.id}>
                  <TableCell>{superAdmin.username}</TableCell>
                  <TableCell>{superAdmin.email}</TableCell>
                  <TableCell>
                    <Button onClick={() => { setCurrentSuperAdmin(superAdmin); setOpenDialog(true); }}>
                      {t('edit')}
                    </Button>
                    <Button onClick={() => handleDeleteSuperAdmin(superAdmin.id)}>
                      {t('delete')}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <SuperAdminDialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          superAdmin={currentSuperAdmin}
          onSave={(superAdminData) => currentSuperAdmin ? handleUpdateSuperAdmin(currentSuperAdmin.id, superAdminData) : handleCreateSuperAdmin(superAdminData)}
        />
      </div>
    </div>
  );
};

interface SuperAdminDialogProps {
  open: boolean;
  onClose: () => void;
  superAdmin: SuperAdmin | null;
  onSave: (superAdminData: Omit<SuperAdmin, 'id'>) => void;
}

const SuperAdminDialog: React.FC<SuperAdminDialogProps> = ({ open, onClose, superAdmin, onSave }) => {
  const [username, setUsername] = useState(superAdmin?.username || '');
  const [email, setEmail] = useState(superAdmin?.email || '');
  const { t } = useTranslation();

  useEffect(() => {
    if (superAdmin) {
      setUsername(superAdmin.username);
      setEmail(superAdmin.email);
    } else {
      setUsername('');
      setEmail('');
    }
  }, [superAdmin]);

  const handleSave = () => {
    onSave({ username, email });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{superAdmin ? t('editSuperAdmin') : t('createSuperAdmin')}</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label={t('username')}
          type="text"
          fullWidth
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <TextField
          margin="dense"
          label={t('email')}
          type="email"
          fullWidth
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('cancel')}</Button>
        <Button onClick={handleSave}>{t('save')}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ManageSuperAdmins;