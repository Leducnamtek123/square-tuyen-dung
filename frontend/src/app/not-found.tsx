'use client';

import { Box, Typography, Button } from '@mui/material';
import { useRouter } from 'next/navigation';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import { useTranslation } from 'react-i18next';

export default function NotFound() {
  const { push } = useRouter();
  const { t } = useTranslation('common');

  return (
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
      <SearchOffIcon sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
      <Typography variant="h2" fontWeight={700} gutterBottom>
        404
      </Typography>
      <Typography variant="h5" color="text.secondary" gutterBottom>
        {t('notFound.title')}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 480 }}>
        {t('notFound.message')}
      </Typography>
      <Button
        variant="contained"
        size="large"
        onClick={() => push('/')}
        sx={{ textTransform: 'none', borderRadius: 2 }}
      >
        {t('notFound.backHome')}
      </Button>
    </Box>
  );
}
