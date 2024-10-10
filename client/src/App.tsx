import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Header from './components/Header';
import Login from './pages/Login';
import DoctorSelection from './pages/DoctorSelection';
import ConsultationSetup from './pages/ConsultationSetup';
import AudioRecording from './pages/AudioRecording';
import ErrorPage from './pages/ErrorPage';
import SuccessPage from './pages/SuccessPage';
import { AuthProvider } from './contexts/AuthContext';

const App: React.FC = () => {
  const { i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language);

  useEffect(() => {
    i18n.on('languageChanged', (lang) => setCurrentLanguage(lang));
    return () => {
      i18n.off('languageChanged');
    };
  }, [i18n]);

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  return (
    <AuthProvider>
      <Router>
        <div className="App min-h-screen bg-gray-100">
          <Header onLanguageChange={changeLanguage} currentLanguage={currentLanguage} />
          <div className="pt-16 px-4">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/doctor-selection" element={<DoctorSelection />} />
              <Route path="/consultation-setup" element={<ConsultationSetup />} />
              <Route path="/audio-recording" element={<AudioRecording />} />
              <Route path="/error" element={<ErrorPage />} />
              <Route path="/success" element={<SuccessPage />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
