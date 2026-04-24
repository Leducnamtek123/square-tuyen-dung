'use client';

import { useEffect } from 'react';
import { Box, Typography, Button } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { useTranslation } from 'react-i18next';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useTranslation('common');

  useEffect(() => {
    console.error('App Error:', error);
  }, [error]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        textAlign: 'center',
        px: 3,
      }}
    >
      <ErrorOutlineIcon sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
      <Typography variant="h4" fontWeight={700} gutterBottom>
        {t('errorBoundary.title')}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 480 }}>
        {t('errorBoundary.message')}
      </Typography>
      <Button
        variant="contained"
        size="large"
        onClick={reset}
        sx={{ textTransform: 'none', borderRadius: 2 }}
      >
        {t('errorBoundary.retry')}
      </Button>
    </Box>
  );
}
