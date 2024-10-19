import React from 'react';
import { useTranslation } from 'react-i18next';
import { Typography, Button, Container } from '@mui/material';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Container maxWidth="sm" className="text-center mt-16">
      <Typography variant="h1" component="h1" gutterBottom>
        404
      </Typography>
      <Typography variant="h4" component="h2" gutterBottom>
        {t('pageNotFound')}
      </Typography>
      <Typography variant="body1" paragraph>
        {t('pageNotFoundMessage')}
      </Typography>
      <Button
        component={Link}
        to="/"
        variant="contained"
        color="primary"
        size="large"
      >
        {t('backToHome')}
      </Button>
    </Container>
  );
};

export default NotFound;