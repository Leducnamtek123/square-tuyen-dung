'use client';

import { Box, CircularProgress, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

export default function Loading() {
  const { t } = useTranslation('common');

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        gap: 2,
      }}
    >
      <CircularProgress size={48} />
      <Typography variant="body2" color="text.secondary">
        {t('loading')}
      </Typography>
    </Box>
  );
}
