import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Switch, Typography } from '@mui/material';
import { enableTwoFactor, disableTwoFactor, getDoctorSettings } from '../api';

interface UserSettingsModalProps {
  open: boolean;
  onClose: () => void;
}

const UserSettingsModal: React.FC<UserSettingsModalProps> = ({ open, onClose }) => {
  const { t } = useTranslation();
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settings = await getDoctorSettings();
        setTwoFactorEnabled(settings.twoFactorEnabled);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching doctor settings:', error);
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleTwoFactorToggle = async () => {
    try {
      if (twoFactorEnabled) {
        await disableTwoFactor();
      } else {
        await enableTwoFactor();
      }
      setTwoFactorEnabled(!twoFactorEnabled);
    } catch (error) {
      console.error('Error toggling two-factor authentication:', error);
    }
  };

  if (isLoading) {
    return null;
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{t('userSettings')}</DialogTitle>
      <DialogContent>
        <div className="flex items-center justify-between mt-4">
          <Typography>{t('twoFactorAuthentication')}</Typography>
          <Switch
            checked={twoFactorEnabled}
            onChange={handleTwoFactorToggle}
            color="primary"
          />
        </div>
        <Typography variant="body2" className="mt-2">
          {twoFactorEnabled
            ? t('twoFactorEnabled')
            : t('twoFactorDisabled')}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          {t('close')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserSettingsModal;