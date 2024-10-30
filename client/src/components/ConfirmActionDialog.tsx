import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControlLabel,
  Checkbox,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';

interface ConfirmActionDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (password: string, dontAskToday: boolean) => void;
  title: string;
  message: string;
  disabled?: boolean;
}

const ConfirmActionDialog: React.FC<ConfirmActionDialogProps> = ({
  open,
  onClose,
  onConfirm,
  title,
  message,
  disabled = false
}) => {
  const [password, setPassword] = useState('');
  const [dontAskToday, setDontAskToday] = useState(false);
  const [error, setError] = useState('');
  const { t } = useTranslation();

  const handleConfirmClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!password) {
      setError(t('common.passwordRequired'));
      return;
    }
    onConfirm(password, dontAskToday);
    setPassword('');
    setDontAskToday(false);
    setError('');
  };

  const handleClose = () => {
    setPassword('');
    setDontAskToday(false);
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Typography gutterBottom>{message}</Typography>
        <TextField
          autoFocus
          margin="dense"
          label={t('common.password')}
          type="password"
          fullWidth
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={!!error}
          helperText={error}
          autoComplete="new-password"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={dontAskToday}
              onChange={(e) => setDontAskToday(e.target.checked)}
            />
          }
          label={t('common.dontAskToday')}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={disabled}>
          {t('common.cancel')}
        </Button>
        <Button 
          onClick={handleConfirmClick} 
          color="primary"
          disabled={disabled}
        >
          {disabled ? t('common.processing') : t('common.confirm')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmActionDialog;