import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface Audio {
  id: number;
  metadata: {
    paciente: string;
  };
  timestamp: number;
}

interface SidebarProps {
  audios: Audio[];
  onSincronizar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ audios, onSincronizar }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();

  return (
    <div className={`fixed right-0 top-0 h-full bg-white shadow-lg transition-all duration-300 ${isOpen ? 'w-64' : 'w-16'}`}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 bg-blue-500 text-white"
      >
        {isOpen ? t('fechar') : t('audiosNaoEnviados')}
      </button>
      {isOpen && (
        <div className="p-4">
          <h2 className="text-xl font-bold mb-4">{t('audiosNaoEnviados')}</h2>
          {audios.length > 0 ? (
            <ul>
              {audios.map((audio) => (
                <li key={audio.id} className="mb-2">
                  {audio.metadata.paciente} - {new Date(audio.timestamp).toLocaleString()}
                </li>
              ))}
            </ul>
          ) : (
            <p>{t('nenhumAudioPendente')}</p>
          )}
          <button 
            onClick={onSincronizar}
            className="mt-4 px-4 py-2 bg-green-500 text-white rounded"
          >
            {t('sincronizar')}
          </button>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
