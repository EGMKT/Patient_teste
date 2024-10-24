import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FiGlobe, FiLogOut, FiSettings, FiMenu } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import TwoFactorSettingsModal from './TwoFactorSettingsModal';

interface HeaderProps {
  onLanguageChange: (lang: string) => void;
  currentLanguage: string;
  clinicName?: string;
}

const Header: React.FC<HeaderProps> = ({ onLanguageChange, currentLanguage, clinicName }) => {
  const { t } = useTranslation();
  const { logout, user } = useAuth();
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
  ];

  const superAdminMenuItems = [
    { title: 'Dashboard', link: '/SA' },
    { title: 'Database Overview', link: '/SA/database-overview' },
    { title: 'Manage Users', link: '/SA/manage-users' },
    { title: 'Manage Clinics', link: '/SA/manage-clinics' },
    { title: 'View Reports', link: '/SA/view-reports' },
  ];

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {user?.role === 'SA' ? (
          // Layout para SuperAdmin
          <>
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
              <LanguageMenu />
              <button
                onClick={() => setShowTwoFactorSettings(true)}
                className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
                aria-label={t('settings')}
              >
                <FiSettings className="text-gray-600" />
              </button>
              <LogoutButton />
            </div>
          </>
        ) : (
          <>
            <h1 className="text-xl font-bold">{clinicName}</h1>
            <div className="flex items-center space-x-2">
              <LanguageMenu />
              <LogoutButton />
            </div>
          </>
        )}
      </div>
      {showMenu && user?.role === 'SA' && (
        <nav className="bg-gray-100 py-2">
          <div className="container mx-auto px-4">
            <ul className="flex space-x-4">
              {superAdminMenuItems.map((item, index) => (
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
      {user?.role === 'SA' && (
        <TwoFactorSettingsModal
          isOpen={showTwoFactorSettings}
          onClose={() => setShowTwoFactorSettings(false)}
        />
      )}
    </header>
  );

  function LanguageMenu() {
    return (
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
    );
  }

  function LogoutButton() {
    return (
      <button
        onClick={handleLogout}
        className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
        aria-label={t('logout')}
      >
        <FiLogOut className="text-red-500" />
      </button>
    );
  }
};

export default Header;
