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
  DialogContentText,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { ConfirmActionDialogProps } from '../types';

const ConfirmActionDialog: React.FC<ConfirmActionDialogProps> = ({
  open,
  onClose,
  onConfirm,
  title,
  message,
}) => {
  const [password, setPassword] = useState('');
  const [dontAskToday, setDontAskToday] = useState(false);
  const { t } = useTranslation();

  const handleConfirm = () => {
    onConfirm(password, dontAskToday);
    setPassword('');
    setDontAskToday(false);
  };

  const handleClose = () => {
    setPassword('');
    setDontAskToday(false);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{message}</DialogContentText>
        <TextField
          autoFocus
          margin="dense"
          label={t('common.password')}
          type="password"
          fullWidth
          value={password}
          onChange={(e) => setPassword(e.target.value)}
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
        <Button onClick={handleClose}>{t('common.cancel')}</Button>
        <Button onClick={handleConfirm} color="primary">
          {t('common.confirm')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmActionDialog;