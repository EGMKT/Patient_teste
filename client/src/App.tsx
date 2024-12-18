import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useTranslation, I18nextProvider } from 'react-i18next';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Header from './components/Header';
import SuperAdminHeader from './components/SuperAdminHeader';
import Login from './pages/Login';
import ConsultationSetup from './pages/ConsultationSetup';
import AudioRecording from './pages/AudioRecording';
import ErrorPage from './pages/ErrorPage';
import SuccessPage from './pages/SuccessPage';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import ManageUsers from './pages/ManageUsers';
import ManageClinics from './pages/ManageClinics';
import ViewReports from './pages/ViewReports';
import ManageServices from './pages/ManageServices';
import ManageRegistrations from './pages/ManageRegistrations';
import NotFound from './pages/NotFound';
import { getClinicaInfo } from './api';
import i18n from './i18n';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

const AppRoutes: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { i18n } = useTranslation();
  const location = useLocation();

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  const showHeader = isAuthenticated && location.pathname !== '/login';

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <>
        {showHeader && (
          user?.role === 'SA' ? (
            <SuperAdminHeader onLanguageChange={changeLanguage} currentLanguage={i18n.language} />
          ) : (
            <Header onLanguageChange={changeLanguage} currentLanguage={i18n.language} />
          )
        )}
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/error" element={<ErrorPage />} />
          <Route path="/success" element={<SuccessPage />} />

          {isAuthenticated ? (
            user?.role === 'SA' ? (
              <>
                <Route path="/SA/*" element={
                  <Routes>
                    <Route path="/" element={<SuperAdminDashboard />} />
                    <Route path="/manage-users" element={<ManageUsers />} />
                    <Route path="/manage-clinics" element={<ManageClinics />} />
                    <Route path="/manage-services" element={<ManageServices />} />
                    <Route path="/manage-registrations" element={<ManageRegistrations />} />
                    <Route path="/view-reports" element={<ViewReports />} />
                  </Routes>
                } />
                <Route path="*" element={<Navigate to="/SA" replace />} />
              </>
            ) : (
              <>
                <Route path="/*" element={
                  <Routes>
                    <Route path="/consultation-setup" element={<ConsultationSetup />} />
                    <Route path="/audio-recording" element={<AudioRecording />} />
                    <Route path="*" element={<Navigate to="/consultation-setup" replace />} />
                  </Routes>
                } />
              </>
            )
          ) : (
            <Route path="*" element={<Navigate to="/login" replace />} />
          )}
        </Routes>
      </>
    </LocalizationProvider>
  );
};

const App: React.FC = () => {
  return (
    <I18nextProvider i18n={i18n}>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </I18nextProvider>
  );
};

export default App;
