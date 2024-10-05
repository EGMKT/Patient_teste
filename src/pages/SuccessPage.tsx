import React from 'react';
import { useNavigate } from 'react-router-dom';

const SuccessPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div>
      <h1>Audio Sent Successfully</h1>
      <p>Your audio has been sent to the webhook.</p>
      <button onClick={() => navigate('/')}>Start New Consultation</button>
    </div>
  );
};

export default SuccessPage;
