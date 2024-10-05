import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import DoctorSelection from './pages/DoctorSelection';
import ConsultationSetup from './pages/ConsultationSetup';
import AudioRecording from './pages/AudioRecording';
import SuccessPage from './pages/SuccessPage';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<DoctorSelection />} />
        <Route path="/setup" element={<ConsultationSetup />} />
        <Route path="/record" element={<AudioRecording />} />
        <Route path="/success" element={<SuccessPage />} />
      </Routes>
    </Router>
  );
};

export default App;
