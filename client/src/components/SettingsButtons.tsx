import React from 'react';
import { useTranslation } from 'react-i18next';
import { FiMoon, FiGlobe } from 'react-icons/fi';

interface SettingsButtonsProps {
  onThemeChange: () => void;
  onLanguageChange: () => void;
}

const SettingsButtons: React.FC<SettingsButtonsProps> = ({ onThemeChange, onLanguageChange }) => {
  const { t } = useTranslation();

  return (
    <div className="absolute top-4 right-4 flex space-x-2">
      <button onClick={onThemeChange} className="btn btn-secondary">
        <FiMoon className="inline-block mr-2" />
        {t('changeTheme')}
      </button>
      <button onClick={onLanguageChange} className="btn btn-secondary">
        <FiGlobe className="inline-block mr-2" />
        {t('changeLanguage')}
      </button>
    </div>
  );
};

export default SettingsButtons;
