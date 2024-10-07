import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const DoctorSelection: React.FC = () => {
  const { logout } = useAuth();

  return (
    <div>
      <h1>Seleção de Médico</h1>
      {/* Conteúdo da página de seleção de médico */}

      {/* Botão de logout */}
      <button onClick={logout} className="px-4 py-2 bg-red-500 text-white rounded-md">
        Logout
      </button>
    </div>
  );
};

export default DoctorSelection;
