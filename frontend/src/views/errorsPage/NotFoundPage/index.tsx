import React from 'react';
import { useRouter } from 'next/navigation';
import { Box, Typography, Button, Stack } from "@mui/material";
import { useTranslation } from 'react-i18next';
import HomeIcon from '@mui/icons-material/Home';
import SearchOffIcon from '@mui/icons-material/SearchOff';

const NotFoundPage = () => {
  const { t } = useTranslation('errors');
  const { push } = useRouter();

  return (
    <Box
      sx={{
        minHeight: '70vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        textAlign: 'center',
        px: 3,
      }}
    >
      <Box
        sx={{
          width: 120,
          height: 120,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(42, 169, 225, 0.1) 0%, rgba(26, 64, 125, 0.08) 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 3,
          animation: 'float 3s ease-in-out infinite',
          '@keyframes float': {
            '0%, 100%': { transform: 'translateY(0)' },
            '50%': { transform: 'translateY(-10px)' },
          },
        }}
      >
        <SearchOffIcon sx={{ fontSize: 56, color: 'primary.light' }} />
      </Box>

      <Typography
        variant="h1"
        sx={{
          fontWeight: 800,
          fontSize: { xs: '4rem', md: '6rem' },
          background: 'linear-gradient(135deg, #2aa9e1 0%, #1a407d 100%)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          lineHeight: 1,
          mb: 1,
        }}
      >
        {t('notFoundCode')}
      </Typography>

      <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, color: 'text.primary' }}>
        {t('notFoundTitle')}
      </Typography>

      <Typography
        variant="body1"
        sx={{ color: 'text.secondary', maxWidth: 420, mb: 4 }}
      >
        {t('notFoundBody')}
      </Typography>

      <Stack direction="row" spacing={2}>
        <Button
          variant="contained"
          startIcon={<HomeIcon />}
          onClick={() => push('/')}
          sx={{
            borderRadius: '12px',
            px: 3,
            py: 1.2,
            textTransform: 'none',
            fontWeight: 600,
            boxShadow: '0 4px 14px rgba(26, 64, 125, 0.25)',
            '&:hover': {
              transform: 'translateY(-1px)',
              boxShadow: '0 6px 20px rgba(26, 64, 125, 0.35)',
            },
            transition: 'all 0.2s ease',
          }}
        >
          {t('backHome')}
        </Button>
      </Stack>
    </Box>
  );
};

export default NotFoundPage;
