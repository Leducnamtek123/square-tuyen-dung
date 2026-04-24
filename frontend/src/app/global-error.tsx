'use client';

import { useEffect } from 'react';
import { Box, Button, Typography } from '@mui/material';
import i18n from '@/i18n';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global Error:', error);
  }, [error]);

  return (
    <html lang="vi">
      <body>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            textAlign: 'center',
            px: 3,
          }}
        >
          <Typography component="h1" sx={{ fontSize: '2rem', mb: 1, fontWeight: 700 }}>
            {i18n.t('common:errorBoundary.title')}
          </Typography>
          <Typography component="p" sx={{ color: 'text.secondary', maxWidth: 480, mb: 4 }}>
            {i18n.t('common:errorBoundary.message')}
          </Typography>
          <Button onClick={reset} variant="contained" sx={{ px: 4, py: 1.5, borderRadius: 2 }}>
            {i18n.t('common:errorBoundary.reload')}
          </Button>
        </Box>
      </body>
    </html>
  );
}
