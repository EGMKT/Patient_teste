import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FiGlobe, FiLogOut, FiSettings } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import UserSettingsModal from './UserSettingsModal';

interface HeaderProps {
  onLanguageChange: (lang: string) => void;
  currentLanguage: string;
  showSettings?: boolean;
}

const Header: React.FC<HeaderProps> = ({ onLanguageChange, currentLanguage, showSettings = false }) => {
  const { t, i18n } = useTranslation();
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'pt', name: 'Português' },
    // Adicione mais idiomas conforme necessário
  ];

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <header className="fixed top-0 left-0 right-0 p-4 flex justify-end space-x-2 bg-white shadow-md">
      <div className="relative">
        <button
          onClick={() => setShowLanguageMenu(!showLanguageMenu)}
          className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
          aria-label={t('changeLanguage')}
        >
          <FiGlobe className="text-blue-500" />
        </button>
        {showLanguageMenu && (
          <div className="absolute right-0 mt-2 py-2 w-48 bg-white rounded-md shadow-xl z-20">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  onLanguageChange(lang.code);
                  setShowLanguageMenu(false);
                }}
                className={`block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left ${
                  currentLanguage === lang.code ? 'font-bold' : ''
                }`}
              >
                {lang.name}
              </button>
            ))}
          </div>
        )}
      </div>
      {showSettings && (
        <button
          onClick={() => setSettingsModalOpen(true)}
          className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
          aria-label={t('settings')}
        >
          <FiSettings className="text-gray-600" />
        </button>
      )}
      <button
        onClick={handleLogout}
        className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
        aria-label={t('logout')}
      >
        <FiLogOut className="text-red-500" />
      </button>
      {showSettings && user && (
        <UserSettingsModal
          open={settingsModalOpen}
          onClose={() => setSettingsModalOpen(false)}
        />
      )}
    </header>
  );
};

export default Header;
