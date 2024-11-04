import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FiGlobe, FiLogOut, FiSettings, FiMenu } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { getClinicaInfo } from '../api';
import TwoFactorSettingsModal from './TwoFactorSettingsModal';
import { HeaderProps } from '../types';



const Header: React.FC<HeaderProps> = ({
  onLanguageChange,
  currentLanguage,
  clinicName,
  showMenu,
  menuItems = []
}) => {
  const { t } = useTranslation();
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showTwoFactorSettings, setShowTwoFactorSettings] = useState(false);
  const [clinicInfo, setClinicInfo] = useState<{nome: string} | null>(null);

  useEffect(() => {
    const fetchClinicInfo = async () => {
      if (user) {
        try {
          console.log('Buscando informações da clínica...');
          const response = await getClinicaInfo();
          console.log('Resposta da clínica:', response);
          setClinicInfo(response);
        } catch (error) {
          console.error('Erro ao buscar informações da clínica:', error);
        }
      }
    };

    fetchClinicInfo();
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'pt', name: 'Português' },
    { code: 'es', name: 'Español' },
  ];

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between relative">
        <div className="flex items-center">
          {showMenu && (
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors mr-4"
              aria-label={t('menu')}
            >
              <FiMenu className="text-gray-600" />
            </button>
          )}
          <h1 className="text-xl font-bold">PatientFunnel</h1>
        </div>
        
        {/* Nome da clínica centralizado */}
        <div className="absolute left-1/2 transform -translate-x-1/2">
          <span className="text-xl font-semibold">{clinicInfo?.nome || ''}</span>
        </div>

        <div className="flex items-center space-x-2">
          <LanguageMenu />
          {user?.role === 'SA' && (
            <button
              onClick={() => setShowTwoFactorSettings(true)}
              className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
              aria-label={t('settings')}
            >
              <FiSettings className="text-gray-600" />
            </button>
          )}
          <LogoutButton />
        </div>
      </div>
      {isMenuOpen && showMenu && (
        <nav className="bg-gray-100 py-2">
          <div className="container mx-auto px-4">
            <ul className="flex space-x-4">
              {menuItems.map((item, index) => (
                <li key={index}>
                  <Link
                    to={item.link}
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
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

