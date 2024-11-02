// src/components/SuperAdminHeader.tsx

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FiGlobe, FiLogOut, FiSettings, FiMenu } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import TwoFactorSettingsModal from './TwoFactorSettingsModal';

interface SuperAdminHeaderProps {
  onLanguageChange: (lang: string) => void;
  currentLanguage: string;
}

const SuperAdminHeader: React.FC<SuperAdminHeaderProps> = ({ onLanguageChange, currentLanguage }) => {
  const { t } = useTranslation();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showTwoFactorSettings, setShowTwoFactorSettings] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'pt', name: 'Português' },
    { code: 'es', name: 'Español' },
  ];

  const menuItems = [
    { title: 'Dashboard', link: '/SA' },
    { title: 'Manage Users', link: '/SA/manage-users' },
    { title: 'Manage Clinics', link: '/SA/manage-clinics' },
    { title: 'Manage Services', link: '/SA/manage-services' },
    { title: 'Manage Registrations', link: '/SA/manage-registrations' },
    { title: 'View Reports', link: '/SA/view-reports' },
  ];

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors mr-4"
            aria-label={t('menu')}
          >
            <FiMenu className="text-gray-600" />
          </button>
          <h1 className="text-xl font-bold">PatientFunnel</h1>
        </div>
        <div className="flex items-center space-x-2">
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
          <button
            onClick={() => setShowTwoFactorSettings(true)}
            className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
            aria-label={t('settings')}
          >
            <FiSettings className="text-gray-600" />
          </button>
          <button
            onClick={handleLogout}
            className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
            aria-label={t('logout')}
          >
            <FiLogOut className="text-red-500" />
          </button>
        </div>
      </div>
      {showMenu && (
        <nav className="bg-gray-100 py-2">
          <div className="container mx-auto px-4">
            <ul className="flex space-x-4">
              {menuItems.map((item, index) => (
                <li key={index}>
                  <Link
                    to={item.link}
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                    onClick={() => setShowMenu(false)}
                  >
                    {t(item.title)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      )}
      <TwoFactorSettingsModal
        isOpen={showTwoFactorSettings}
        onClose={() => setShowTwoFactorSettings(false)}
      />
    </header>
  );
};

export default SuperAdminHeader;
