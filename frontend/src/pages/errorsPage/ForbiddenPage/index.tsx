import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Stack } from "@mui/material";
import { useTranslation } from 'react-i18next';
import HomeIcon from '@mui/icons-material/Home';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

const ForbiddenPage = () => {
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
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(220, 38, 38, 0.08) 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 3,
          animation: 'shake 4s ease-in-out infinite',
          '@keyframes shake': {
            '0%, 100%': { transform: 'rotate(0deg)' },
            '10%': { transform: 'rotate(-5deg)' },
            '20%': { transform: 'rotate(5deg)' },
            '30%': { transform: 'rotate(0deg)' },
          },
        }}
      >
        <LockOutlinedIcon sx={{ fontSize: 56, color: 'warning.main' }} />
      </Box>

      <Typography
        variant="h1"
        sx={{
          fontWeight: 800,
          fontSize: { xs: '4rem', md: '6rem' },
          background: 'linear-gradient(135deg, #f59e0b 0%, #dc2626 100%)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          lineHeight: 1,
          mb: 1,
        }}
      >
        {t('forbiddenCode')}
      </Typography>

      <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, color: 'text.primary' }}>
        {t('forbiddenTitle')}
      </Typography>

      <Typography
        variant="body1"
        sx={{ color: 'text.secondary', maxWidth: 420, mb: 4 }}
      >
        {t('forbiddenBody')}
      </Typography>

      <Stack direction="row" spacing={2}>
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

export default ForbiddenPage;
