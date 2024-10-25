import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Header from './components/Header';
import SuperAdminHeader from './components/SuperAdminHeader';
import Login from './pages/Login';
import ConsultationSetup from './pages/ConsultationSetup';
import AudioRecording from './pages/AudioRecording';
import ErrorPage from './pages/ErrorPage';
import SuccessPage from './pages/SuccessPage';
import ConsultationList from './pages/ConsultationList';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import SuperAdminAudios from './pages/SuperAdminAudios';
import DatabaseOverview from './pages/DatabaseOverview';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import ManageUsers from './pages/ManageUsers';
import ManageClinics from './pages/ManageClinics';
import ViewReports from './pages/ViewReports';
import NotFound from './pages/NotFound';
import ManageClinicRegistrations from './pages/ManageClinicRegistrations';

const AppRoutes: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { i18n } = useTranslation();

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/error" element={<ErrorPage />} />
      <Route path="/success" element={<SuccessPage />} />

      {isAuthenticated ? (
        user?.role === 'SA' ? (
          <>
            <Route
              path="/SA/*"
              element={
                <>
                  <SuperAdminHeader
                    onLanguageChange={changeLanguage}
                    currentLanguage={i18n.language}
                  />
                  <Routes>
                    <Route path="/" element={<SuperAdminDashboard />} />
                    <Route path="/database-overview" element={<DatabaseOverview />} />
                    <Route path="/manage-users" element={<ManageUsers />} />
                    <Route path="/manage-clinics" element={<ManageClinics />} />
                    <Route path="/manage-registrations" element={<ManageClinicRegistrations />} />
                    <Route path="/view-reports" element={<ViewReports />} />
                  </Routes>
                </>
              }
            />
            <Route path="*" element={<Navigate to="/SA" replace />} />
          </>
        ) : (
          <>
            <Route
              path="/*"
              element={
                <>
                  <Routes>
                    <Route path="/consultation-setup" element={<ConsultationSetup />} />
                    <Route path="/audio-recording" element={<AudioRecording />} />
                    <Route path="/consultations" element={<ConsultationList />} />
                    <Route path="*" element={<Navigate to="/consultation-setup" replace />} />
                  </Routes>
                </>
              }
            />
          </>
        )
      ) : (
        <Route path="*" element={<Navigate to="/login" replace />} />
      )}
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
};

export default App;
