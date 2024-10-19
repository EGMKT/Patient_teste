import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Header from './components/Header';
import Login from './pages/Login';
import DoctorSelection from './pages/DoctorSelection';
import ConsultationSetup from './pages/ConsultationSetup';
import AudioRecording from './pages/AudioRecording';
import ErrorPage from './pages/ErrorPage';
import SuccessPage from './pages/SuccessPage';
import AdminDashboard from './pages/AdminDashboard';
import ConsultationList from './pages/ConsultationList';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import SuperAdminAudios from './pages/SuperAdminAudios';
import DatabaseOverview from './pages/DatabaseOverview';
import ProtectedRoute from './components/ProtectedRoute';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import ManageUsers from './pages/ManageUsers';
import ManageClinics from './pages/ManageClinics';
import NotFound from './pages/NotFound';

const AppRoutes: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { i18n } = useTranslation();

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  console.log('AppRoutes: isAuthenticated =', isAuthenticated, 'user =', user);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role === 'SA') {
    return (
      <Routes>
        <Route path="/super-admin/*" element={<SuperAdminDashboard />} />
        <Route path="*" element={<Navigate to="/super-admin" replace />} />
      </Routes>
    );
  }

  return (
    <>
      <Header onLanguageChange={changeLanguage} currentLanguage={i18n.language} />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/error" element={<ErrorPage />} />
        <Route path="/success" element={<SuccessPage />} />

        <Route 
          path="/doctor-selection" 
          element={
            <ProtectedRoute allowedRoles={['admin', 'doctor', 'ME']}>
              <DoctorSelection />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/consultation-setup" 
          element={
            <ProtectedRoute allowedRoles={['admin', 'doctor', 'ME']}>
              <ConsultationSetup />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/audio-recording" 
          element={
            <ProtectedRoute allowedRoles={['admin', 'doctor', 'ME']}>
              <AudioRecording />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/consultations" 
          element={
            <ProtectedRoute allowedRoles={['admin', 'doctor']}>
              <ConsultationList />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/admin/dashboard" 
          element={
            <ProtectedRoute allowedRoles={['SA']}>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/audios-nao-enviados" 
          element={
            <ProtectedRoute allowedRoles={['SA']}>
              <SuperAdminAudios />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/database-overview" 
          element={
            <ProtectedRoute allowedRoles={['SA']}>
              <DatabaseOverview />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/super-admin/dashboard" 
          element={
            <ProtectedRoute allowedRoles={['SA']}>
              <SuperAdminDashboard />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/manage-users"
          element={
            <ProtectedRoute allowedRoles={['SA']}>
              <ManageUsers />
            </ProtectedRoute>
          }
        />
        
        <Route 
          path="/manage-clinics"
          element={
            <ProtectedRoute allowedRoles={['SA']}>
              <ManageClinics />
            </ProtectedRoute>
          }
        />

        <Route 
          path="/" 
          element={
            isAuthenticated ? (
              <Navigate to={user?.role === 'SA' ? "/admin/dashboard" : "/doctor-selection"} replace />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="App min-h-screen bg-gray-100 flex flex-col">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/*" element={<AppRoutes />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
