import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Switch, TextField } from '@mui/material';
import { enableTwoFactor, disableTwoFactor, verifyTwoFactor, getTwoFactorStatus } from '../api';

interface TwoFactorSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TwoFactorSettingsModal: React.FC<TwoFactorSettingsModalProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchTwoFactorStatus();
    }
  }, [isOpen]);

  const fetchTwoFactorStatus = async () => {
    try {
      const status = await getTwoFactorStatus();
      setTwoFactorEnabled(status.enabled);
    } catch (error) {
      console.error('Error fetching 2FA status:', error);
      setError(t('errorFetching2FAStatus'));
    }
  };

  const handleToggle2FA = async () => {
    try {
      if (twoFactorEnabled) {
        await disableTwoFactor();
        setTwoFactorEnabled(false);
        setQrCodeUrl('');
        setSuccess(t('2FADisabled'));
      } else {
        const response = await enableTwoFactor();
        setQrCodeUrl(response.qrCodeUrl);
        setTwoFactorEnabled(true);
        setSuccess(t('2FAEnabled'));
      }
      setError('');
    } catch (error) {
      console.error('Error toggling 2FA:', error);
      setError(t('errorToggling2FA'));
      setSuccess('');
    }
  };

  const handleVerify = async () => {
    try {
      await verifyTwoFactor(verificationCode);
      setError('');
      setSuccess(t('2FAVerified'));
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Error verifying 2FA:', error);
      setError(t('errorVerifying2FA'));
      setSuccess('');
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t('twoFactorSettings')}</DialogTitle>
      <DialogContent>
        <div className="flex items-center justify-between mb-4">
          <span>{t('enable2FA')}</span>
          <Switch
            checked={twoFactorEnabled}
            onChange={handleToggle2FA}
            color="primary"
          />
        </div>
        {twoFactorEnabled && qrCodeUrl && (
          <div className="mb-4">
            <p className="mb-2">{t('scanQRCode')}</p>
            <img src={qrCodeUrl} alt="QR Code" className="mx-auto" />
            <TextField
              fullWidth
              label={t('verificationCode')}
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              margin="normal"
            />
          </div>
        )}
        {error && <p className="text-red-500 mb-2">{error}</p>}
        {success && <p className="text-green-500 mb-2">{success}</p>}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          {t('close')}
        </Button>
        {twoFactorEnabled && qrCodeUrl && (
          <Button onClick={handleVerify} color="primary">
            {t('verify')}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default TwoFactorSettingsModal;
