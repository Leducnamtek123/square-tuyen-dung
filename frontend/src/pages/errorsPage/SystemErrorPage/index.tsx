import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Stack } from "@mui/material";
import { useTranslation } from 'react-i18next';
import HomeIcon from '@mui/icons-material/Home';
import RefreshIcon from '@mui/icons-material/Refresh';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

const SystemErrorPage = () => {
  const { t } = useTranslation('errors');
  const navigate = useNavigate();

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
          background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.1) 0%, rgba(239, 68, 68, 0.08) 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 3,
          animation: 'pulse 2s ease-in-out infinite',
          '@keyframes pulse': {
            '0%, 100%': { transform: 'scale(1)', opacity: 1 },
            '50%': { transform: 'scale(1.05)', opacity: 0.85 },
          },
        }}
      >
        <ErrorOutlineIcon sx={{ fontSize: 56, color: 'error.main' }} />
      </Box>

      <Typography
        variant="h1"
        sx={{
          fontWeight: 800,
          fontSize: { xs: '4rem', md: '6rem' },
          background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          lineHeight: 1,
          mb: 1,
        }}
      >
        {t('systemErrorCode')}
      </Typography>

      <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, color: 'text.primary' }}>
        {t('systemErrorTitle')}
      </Typography>

      <Typography
        variant="body1"
        sx={{ color: 'text.secondary', maxWidth: 420, mb: 4 }}
      >
        {t('systemErrorBody')}
      </Typography>

      <Stack direction="row" spacing={2}>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={() => window.location.reload()}
          sx={{
            borderRadius: '12px',
            px: 3,
            py: 1.2,
            textTransform: 'none',
            fontWeight: 600,
            transition: 'all 0.2s ease',
            '&:hover': { transform: 'translateY(-1px)' },
          }}
        >
          {t('tryAgain')}
        </Button>
        <Button
          variant="contained"
          startIcon={<HomeIcon />}
          onClick={() => navigate('/')}
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

export default SystemErrorPage;
