import React from 'react';
import { IconButton, Tooltip, CircularProgress } from '@mui/material';
import { Sync } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

interface SyncButtonProps {
  onSync: () => Promise<void>;
  loading?: boolean;
  className?: string;
}

const SyncButton: React.FC<SyncButtonProps> = ({ onSync, loading = false, className = '' }) => {
  const { t } = useTranslation();

  return (
    <Tooltip title={t('common.sync')}>
      <IconButton 
        onClick={onSync} 
        disabled={loading}
        className={className}
      >
        {loading ? <CircularProgress size={24} /> : <Sync />}
      </IconButton>
    </Tooltip>
  );
};

export default SyncButton;