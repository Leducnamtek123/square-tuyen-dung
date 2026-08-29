import React from 'react';
import Link from 'next/link';
import { Alert, AlertTitle, Box, Button, Card, Container, Typography, styled, Grid2 as Grid } from '@mui/material';
import BackdropLoading from '../../../components/Common/Loading/BackdropLoading';
import JobSeekerLoginForm from '../../components/auths/JobSeekerLoginForm';
import PhoneOTPLoginForm from '../../components/auths/PhoneOTPLoginForm';
import AuthShowcasePanel from '../../components/auths/AuthShowcasePanel';
import { ROUTES } from '../../../configs/constants';
import SecurityIcon from '@mui/icons-material/Security';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import PhoneIphoneOutlinedIcon from '@mui/icons-material/PhoneIphoneOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const StyledCard = styled(Card)(({ theme }) => ({
  background: '#FFFFFF',
  borderRadius: '24px',
  boxShadow: '0 20px 45px rgba(15, 23, 42, 0.08), 0 4px 16px rgba(15, 23, 42, 0.04)',
  border: '1px solid #F1F5F9',
  transition: 'all 0.3s ease',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
}));

const StyledLink = styled(Link)(({ theme }) => ({
  textDecoration: 'none',
  color: '#2563EB',
  fontWeight: 600,
  fontSize: '14px',
  transition: 'all 0.2s ease',
  '&:hover': {
    color: '#1D4ED8',
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
      maxWidth="lg"
      sx={{
        py: { xs: 2, sm: 4, md: 6 },
        px: { xs: 1, sm: 2, md: 3 },
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 'calc(100vh - 120px)',
      }}
    >
      <Grid
        container
        spacing={{ xs: 0, md: 4 }}
        alignItems="stretch"
        sx={{
          width: '100%',
          maxWidth: '1060px',
          margin: '0 auto',
        }}
      >
        {/* Left Column: Login Form */}
        <Grid
          size={{ xs: 12, md: 6 }}
          sx={{
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <StyledCard
            sx={{
              p: { xs: 3, sm: 4, md: 5 },
              width: '100%',
              borderRadius: { xs: '16px', sm: '24px' },
            }}
          >
            {/* Card Top / Content */}
            <Box>
              {/* Cross-Portal Switcher Link */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  mb: 2.5,
                }}
              >
                <Typography variant="caption" sx={{ color: '#64748B', fontSize: '13px' }}>
                  Bạn là Nhà tuyển dụng?{' '}
                  <StyledLink
                    href={`/${ROUTES.EMPLOYER_AUTH.LOGIN}`}
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 0.25,
                      fontWeight: 600,
                      color: '#2563EB',
                    }}
                  >
                    <span>Cổng Doanh nghiệp</span>
                    <ArrowForwardIcon sx={{ fontSize: 13 }} />
                  </StyledLink>
                </Typography>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography
                  component="h1"
                  variant="h4"
                  sx={{
                    fontWeight: 700,
                    fontSize: { xs: '24px', sm: '28px', md: '30px' },
                    color: '#0F172A',
                    letterSpacing: '-0.02em',
                    mb: 1,
                  }}
                >
                  {title}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: '#64748B',
                    fontSize: '14.5px',
                    lineHeight: 1.5,
                  }}
                >
                  {t('login.welcomeBack')}
                </Typography>
              </Box>

              {errorMessage && (
                <Alert
                  severity="error"
                  sx={{
                    mb: 3,
                    borderRadius: '12px',
                    fontSize: '13.5px',
                  }}
                >
                  <AlertTitle sx={{ fontWeight: 600 }}>{t('login.errorTitle')}</AlertTitle>
                  {errorMessage}
                </Alert>
              )}

              {successMessage && (
                <Alert
                  severity="success"
                  sx={{
                    mb: 3,
                    borderRadius: '12px',
                    fontSize: '13.5px',
                  }}
                >
                  <AlertTitle sx={{ fontWeight: 600 }}>{t('login.successTitle')}</AlertTitle>
                  {successMessage}
                </Alert>
              )}

              {/* Email / Phone Mode Switcher */}
              <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
                <Box
                  sx={{
                    display: 'flex',
                    gap: '4px',
                    p: '4px',
                    width: '100%',
                    backgroundColor: '#F1F5F9',
                    borderRadius: '14px',
                  }}
                >
                  <Button
                    onClick={() => onSetLoginMode('email')}
                    disableElevation
                    startIcon={<EmailOutlinedIcon sx={{ fontSize: 18 }} />}
                    sx={{
                      flex: 1,
                      textTransform: 'none',
                      borderRadius: '10px',
                      fontWeight: 600,
                      fontSize: '13.5px',
                      py: 1,
                      color: loginMode === 'email' ? '#1E40AF' : '#64748B',
                      backgroundColor: loginMode === 'email' ? '#FFFFFF' : 'transparent',
                      boxShadow: loginMode === 'email' ? '0 2px 8px rgba(15, 23, 42, 0.08)' : 'none',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        backgroundColor: loginMode === 'email' ? '#FFFFFF' : 'rgba(0,0,0,0.03)',
                      },
                    }}
                  >
                    {t('common:labels.email')}
                  </Button>
                  <Button
                    onClick={() => onSetLoginMode('phone')}
                    disableElevation
                    startIcon={<PhoneIphoneOutlinedIcon sx={{ fontSize: 18 }} />}
                    sx={{
                      flex: 1,
                      textTransform: 'none',
                      borderRadius: '10px',
                      fontWeight: 600,
                      fontSize: '13.5px',
                      py: 1,
                      color: loginMode === 'phone' ? '#1E40AF' : '#64748B',
                      backgroundColor: loginMode === 'phone' ? '#FFFFFF' : 'transparent',
                      boxShadow: loginMode === 'phone' ? '0 2px 8px rgba(15, 23, 42, 0.08)' : 'none',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        backgroundColor: loginMode === 'phone' ? '#FFFFFF' : 'rgba(0,0,0,0.03)',
                      },
                    }}
                  >
                    {t('login.phone')}
                  </Button>
                </Box>
              </Box>

              <Box sx={{ mt: 1 }}>
                {loginMode === 'email' ? (
                  <JobSeekerLoginForm onLogin={onLogin} onGoogleLogin={onGoogleLogin} />
                ) : (
                  <PhoneOTPLoginForm onLogin={onFirebaseLogin} isLoading={isFullScreenLoading} />
                )}
              </Box>
            </Box>

            {/* Card Bottom / Footer Links */}
            <Box sx={{ mt: 'auto', pt: 3 }}>
              <Grid
                container
                spacing={2}
                sx={{
                  pt: 2.5,
                  borderTop: '1px solid #F1F5F9',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Grid size={{ xs: 12, sm: 6 }}>
                  <StyledLink href={`/${ROUTES.AUTH.FORGOT_PASSWORD}`}>{t('login.forgotPassword')}</StyledLink>
                </Grid>
                <Grid sx={{ textAlign: { xs: 'left', sm: 'right' } }} size={{ xs: 12, sm: 6 }}>
                  <StyledLink href={`/${ROUTES.AUTH.REGISTER}`}>
                    {t('login.noAccount')} {t('login.signUp')}
                  </StyledLink>
                </Grid>
              </Grid>

              {/* Security Trust Indicator */}
              <Box
                sx={{
                  mt: 2.5,
                  pt: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 1,
                  color: '#94A3B8',
                  fontSize: '12px',
                }}
              >
                <SecurityIcon sx={{ fontSize: 16, color: '#10B981' }} />
                <span>Bảo mật thông tin cá nhân theo tiêu chuẩn an toàn</span>
              </Box>
            </Box>
          </StyledCard>
        </Grid>

        {/* Right Column: Candidate Showcase Panel */}
        <Grid
          size={{ xs: 12, md: 6 }}
          sx={{
            display: { xs: 'none', md: 'flex' },
          }}
        >
          <AuthShowcasePanel variant="candidate" />
        </Grid>
      </Grid>
    </Container>

    {isFullScreenLoading && <BackdropLoading />}
  </>
);

export default JobSeekerLoginView;
