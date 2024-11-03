import React from 'react';
import { useTranslation } from 'react-i18next';
import { Typography, Button, Container } from '@mui/material';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Container maxWidth="sm" className="text-center mt-16">
      <Typography variant="h1" component="h1" gutterBottom>
        {t('notFound.title')}
      </Typography>
      <Typography variant="h4" component="h2" gutterBottom>
        {t('notFound.pageNotFound')}
      </Typography>
      <Typography variant="body1" paragraph>
        {t('notFound.pageNotFoundMessage')}
      </Typography>
      <Button
        component={Link}
        to="/"
        variant="contained"
        color="primary"
        size="large"
      >
        {t('notFound.backToHome')}
      </Button>
    </Container>
  );
};

export default NotFound;