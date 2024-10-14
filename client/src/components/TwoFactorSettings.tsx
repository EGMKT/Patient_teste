import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { enableTwoFactor, disableTwoFactor, verifyTwoFactor } from '../api';

const TwoFactorSettings: React.FC = () => {
  const { t } = useTranslation();
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [secret, setSecret] = useState('');
  const [token, setToken] = useState('');

  const handleEnableTwoFactor = async () => {
    try {
      const response = await enableTwoFactor();
      setSecret(response.secret);
      setTwoFactorEnabled(true);
    } catch (error) {
      console.error('Error enabling 2FA:', error);
    }
  };

  const handleDisableTwoFactor = async () => {
    try {
      await disableTwoFactor();
      setTwoFactorEnabled(false);
      setSecret('');
    } catch (error) {
      console.error('Error disabling 2FA:', error);
    }
  };

  const handleVerifyTwoFactor = async () => {
    try {
      await verifyTwoFactor(token, 'browser', false);
      // Redirecionar para a página principal ou exibir mensagem de sucesso
    } catch (error) {
      console.error('Error verifying 2FA:', error);
    }
  };

  return (
    <div>
      <h2>{t('twoFactorSettings')}</h2>
      {!twoFactorEnabled ? (
        <button onClick={handleEnableTwoFactor}>{t('enable2FA')}</button>
      ) : (
        <>
          <p>{t('scanQRCode')}</p>
          <img src={`https://chart.googleapis.com/chart?chs=200x200&chld=M|0&cht=qr&chl=otpauth://totp/PatientFunnel:${encodeURIComponent(secret)}?secret=${secret}&issuer=PatientFunnel`} alt="QR Code" />
          <input
            type="text"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder={t('enter2FAToken')}
          />
          <button onClick={handleVerifyTwoFactor}>{t('verify2FA')}</button>
          <button onClick={handleDisableTwoFactor}>{t('disable2FA')}</button>
        </>
      )}
    </div>
  );
};

export default TwoFactorSettings;
