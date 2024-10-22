// src/components/SuperAdminHeader.tsx

import React from 'react';
import { Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';

const SuperAdminHeader: React.FC = () => {
  const { t } = useTranslation();

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" style={{ flexGrow: 1 }}>
          PatientFunnel - {t('superAdminDashboard')}
        </Typography>
        <Button color="inherit" component={Link} to="/SA">
          {t('dashboard')}
        </Button>
        <Button color="inherit" component={Link} to="/SA/manage-users">
          {t('manageUsers')}
        </Button>
        <Button color="inherit" component={Link} to="/SA/manage-clinics">
          {t('manageClinics')}
        </Button>
        <Button color="inherit" component={Link} to="/SA/manage-clinic-registrations">
          {t('manageClinicRegistrations')}
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default SuperAdminHeader;
