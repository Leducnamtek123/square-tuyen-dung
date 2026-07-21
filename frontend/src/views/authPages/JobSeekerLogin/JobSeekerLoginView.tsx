import React from 'react';
import Link from 'next/link';
import { Alert, AlertTitle, Avatar, Box, Button, Card, Container, Typography, styled, Grid2 as Grid } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import BackdropLoading from '../../../components/Common/Loading/BackdropLoading';
import JobSeekerLoginForm from '../../components/auths/JobSeekerLoginForm';
import PhoneOTPLoginForm from '../../components/auths/PhoneOTPLoginForm';
import { ROUTES } from '../../../configs/constants';

const StyledCard = styled(Card)({
  background: 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(10px)',
  borderRadius: '16px',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  transition: 'all 0.3s ease',
});

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  margin: '16px',
  width: '56px',
  height: '56px',
  backgroundColor: theme.palette.secondary.main,
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
}));

const StyledLink = styled(Link)(({ theme }) => ({
  textDecoration: 'none',
  color: theme.palette.primary.main,
  fontWeight: 500,
  transition: 'all 0.2s ease',
  '&:hover': {
    color: theme.palette.primary.dark,
    textDecoration: 'underline',
  },
}));

type Props = {
  title: string;
  errorMessage: string | null;
  successMessage: string | null;
  loginMode: 'email' | 'phone';
  isFullScreenLoading: boolean;
  onSetLoginMode: (mode: 'email' | 'phone') => void;
  onLogin: (data: { email: string; password?: string }) => void;
  onGoogleLogin: (result: { code?: string }) => void;
  onFirebaseLogin: (idToken: string) => void;
  t: (key: string, options?: Record<string, unknown>) => string;
};

const JobSeekerLoginView = ({
  title,
  errorMessage,
  successMessage,
  loginMode,
  isFullScreenLoading,
  onSetLoginMode,
  onLogin,
  onGoogleLogin,
  onFirebaseLogin,
  t,
}: Props) => (
  <>
    <Container
      maxWidth="sm"
      sx={{
        marginTop: { xs: 0, sm: 2, md: 3 },
        p: { xs: 0, sm: 3 },
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <StyledCard
        sx={{
          p: { xs: 2, sm: 4, md: 5 },
          width: '100%',
          borderRadius: { xs: 0, sm: '16px' },
          boxShadow: { xs: 'none', sm: '0 8px 32px rgba(0, 0, 0, 0.1)' },
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
          <StyledAvatar>
            <LockOutlinedIcon sx={{ fontSize: 28 }} />
          </StyledAvatar>
          <Typography component="h1" variant="h4" align="center" sx={{ fontWeight: 600, color: 'primary.main', mb: 1 }}>
            {title}
          </Typography>
          <Typography variant="subtitle1" align="center" sx={{ color: 'text.secondary', mb: 2 }}>
            {t('login.welcomeBack')}
          </Typography>
        </Box>

        {errorMessage && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: '8px' }}>
            <AlertTitle>{t('login.errorTitle')}</AlertTitle>
            {errorMessage}
          </Alert>
        )}

        {successMessage && (
          <Alert severity="success" sx={{ mb: 3, borderRadius: '8px' }}>
            <AlertTitle>{t('login.successTitle')}</AlertTitle>
            {successMessage}
          </Alert>
        )}

        <Box sx={{ mt: 2 }}>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
            <Box
              sx={{
                display: 'flex',
                gap: '4px',
                p: '4px',
                width: '100%',
                maxWidth: 320,
                backgroundColor: 'rgba(63, 81, 181, 0.12)',
                borderRadius: '14px',
              }}
            >
              <Button
                onClick={() => onSetLoginMode('email')}
                disableElevation
                sx={{
                  flex: 1,
                  textTransform: 'none',
                  borderRadius: '12px',
                  fontWeight: 600,
                  py: 0.75,
                  color: loginMode === 'email' ? 'common.white' : 'text.secondary',
                  backgroundColor: loginMode === 'email' ? 'primary.main' : 'transparent',
                  boxShadow: loginMode === 'email' ? '0 6px 14px rgba(63, 81, 181, 0.28)' : 'none',
                  '&:hover': {
                    backgroundColor: loginMode === 'email' ? 'primary.dark' : 'rgba(0,0,0,0.04)',
                  },
                }}
              >
                {t('common:labels.email')}
              </Button>
              <Button
                onClick={() => onSetLoginMode('phone')}
                disableElevation
                sx={{
                  flex: 1,
                  textTransform: 'none',
                  borderRadius: '12px',
                  fontWeight: 600,
                  py: 0.75,
                  color: loginMode === 'phone' ? 'common.white' : 'text.secondary',
                  backgroundColor: loginMode === 'phone' ? 'primary.main' : 'transparent',
                  boxShadow: loginMode === 'phone' ? '0 6px 14px rgba(63, 81, 181, 0.28)' : 'none',
                  '&:hover': {
                    backgroundColor: loginMode === 'phone' ? 'primary.dark' : 'rgba(0,0,0,0.04)',
                  },
                }}
              >
                {t('login.phone')}
              </Button>
            </Box>
          </Box>

          {loginMode === 'email' ? (
            <JobSeekerLoginForm onLogin={onLogin} onGoogleLogin={onGoogleLogin} />
          ) : (
            <PhoneOTPLoginForm onLogin={onFirebaseLogin} isLoading={isFullScreenLoading} />
          )}
        </Box>

        <Grid container spacing={2} sx={{ mt: 4, justifyContent: 'space-between', alignItems: 'center' }}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <StyledLink href={`/${ROUTES.AUTH.FORGOT_PASSWORD}`}>{t('login.forgotPassword')}</StyledLink>
          </Grid>
          <Grid sx={{ textAlign: { xs: 'left', sm: 'right' } }} size={{ xs: 12, sm: 6 }}>
            <StyledLink href={`/${ROUTES.AUTH.REGISTER}`}>
              {t('login.noAccount')} {t('login.signUp')}
            </StyledLink>
          </Grid>
        </Grid>
      </StyledCard>
    </Container>

    {isFullScreenLoading && <BackdropLoading />}
  </>
);

export default JobSeekerLoginView;
