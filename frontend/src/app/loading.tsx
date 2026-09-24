'use client';

import { Box, CircularProgress, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

export default function Loading() {
  const { t } = useTranslation('common');

  return (
    <Box
      role="status"
      aria-live="polite"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '120px',
        width: '100%',
        py: 4,
        gap: 1.5,
      }}
    >
      <CircularProgress size={32} thickness={4} sx={{ color: '#2563eb' }} />
      <Typography
        component="span"
        sx={{
          position: 'absolute',
          width: 1,
          height: 1,
          padding: 0,
          margin: -1,
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          border: 0,
        }}
      >
        {t('loading')}
      </Typography>
    </Box>
  );
}

