import React from 'react';
import Link from 'next/link';
import { Alert, AlertTitle, Box, Button, Card, Container, Typography, styled, Grid2 as Grid } from '@mui/material';
import BackdropLoading from '@/components/Common/Loading/BackdropLoading';
import JobSeekerLoginForm from '@/views/components/auths/JobSeekerLoginForm';
import PhoneOTPLoginForm from '@/views/components/auths/PhoneOTPLoginForm';
import AuthShowcasePanel from '@/views/components/auths/AuthShowcasePanel';
import { ROUTES } from '@/configs/constants';
import SecurityIcon from '@mui/icons-material/Security';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import PhoneIphoneOutlinedIcon from '@mui/icons-material/PhoneIphoneOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const UnifiedAuthCard = styled(Card)(({ theme }) => ({
  background: '#FFFFFF',
  borderRadius: '28px',
  boxShadow: '0 25px 60px -15px rgba(15, 23, 42, 0.12), 0 0 1px 1px rgba(15, 23, 42, 0.05)',
  border: '1px solid #E2E8F0',
  transition: 'all 0.3s ease',
  width: '100%',
  maxWidth: '1080px',
  margin: '0 auto',
  overflow: 'hidden',
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
        py: { xs: 2, sm: 4, md: 5 },
        px: { xs: 1, sm: 2, md: 3 },
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 'calc(100vh - 120px)',
      }}
    >
      <UnifiedAuthCard>
        <Grid
          container
          spacing={0}
          alignItems="stretch"
          sx={{
            width: '100%',
          }}
        >
          {/* Left Column: Login Form */}
          <Grid
            size={{ xs: 12, md: 6 }}
            sx={{
              p: { xs: 3, sm: 4, md: 4.5 },
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              backgroundColor: '#FFFFFF',
            }}
          >
            {/* Card Top / Content */}
            <Box>
              {/* Role and Switcher header */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  mb: 2,
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    color: '#2563EB',
                    fontWeight: 700,
                    fontSize: '13px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    backgroundColor: '#EFF6FF',
                    px: 1.5,
                    py: 0.5,
                    borderRadius: '8px',
                  }}
                >
                  Người tìm việc
                </Typography>

                <Typography variant="caption" sx={{ color: '#64748B', fontSize: '13px' }}>
                  Bạn là NTD?{' '}
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

              <Box sx={{ mb: 2.5 }}>
                <Typography
                  component="h1"
                  variant="h4"
                  sx={{
                    fontWeight: 800,
                    fontSize: { xs: '22px', sm: '26px', md: '28px' },
                    color: '#0F172A',
                    letterSpacing: '-0.02em',
                    mb: 0.75,
                  }}
                >
                  Đăng nhập hoặc Đăng ký
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: '#64748B',
                    fontSize: '14px',
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
                    mb: 2.5,
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
                    mb: 2.5,
                    borderRadius: '12px',
                    fontSize: '13.5px',
                  }}
                >
                  <AlertTitle sx={{ fontWeight: 600 }}>{t('login.successTitle')}</AlertTitle>
                  {successMessage}
                </Alert>
              )}

              {/* Email / Phone Mode Switcher */}
              <Box sx={{ mb: 2.5, display: 'flex', justifyContent: 'center' }}>
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
                      py: 0.85,
                      color: loginMode === 'email' ? '#2563EB' : '#64748B',
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
                      py: 0.85,
                      color: loginMode === 'phone' ? '#2563EB' : '#64748B',
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

              <Box sx={{ mt: 0.5 }}>
                {loginMode === 'email' ? (
                  <JobSeekerLoginForm onLogin={onLogin} onGoogleLogin={onGoogleLogin} />
                ) : (
                  <PhoneOTPLoginForm onLogin={onFirebaseLogin} isLoading={isFullScreenLoading} />
                )}
              </Box>
            </Box>

            {/* Card Bottom / Legal Disclaimer & Links */}
            <Box sx={{ mt: 'auto', pt: 2.5 }}>
              <Typography
                variant="caption"
                sx={{
                  display: 'block',
                  textAlign: 'center',
                  color: '#64748B',
                  fontSize: '12.5px',
                  lineHeight: 1.55,
                  mb: 2,
                }}
              >
                Bằng việc đăng nhập, tôi đồng ý chia sẻ thông tin cá nhân của mình với nhà tuyển dụng theo các{' '}
                <StyledLink href="/terms-of-service" sx={{ fontSize: '12.5px', color: '#2563EB' }}>
                  Điều khoản sử dụng
                </StyledLink>{' '}
                và{' '}
                <StyledLink href="/privacy-policy" sx={{ fontSize: '12.5px', color: '#2563EB' }}>
                  Chính sách bảo mật
                </StyledLink>{' '}
                của InfoHR.
              </Typography>

              <Grid
                container
                spacing={2}
                sx={{
                  pt: 2,
                  borderTop: '1px solid #F1F5F9',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Grid size={{ xs: 12, sm: 6 }}>
                  <StyledLink href={`/${ROUTES.AUTH.FORGOT_PASSWORD}`} sx={{ color: '#64748B', '&:hover': { color: '#2563EB' } }}>
                    {t('login.forgotPassword')}
                  </StyledLink>
                </Grid>
                <Grid sx={{ textAlign: { xs: 'left', sm: 'right' } }} size={{ xs: 12, sm: 6 }}>
                  <StyledLink href={`/${ROUTES.AUTH.REGISTER}`} sx={{ color: '#2563EB', fontWeight: 600 }}>
                    {t('login.noAccount')} {t('login.signUp')}
                  </StyledLink>
                </Grid>
              </Grid>

              {/* Security Trust Indicator */}
              <Box
                sx={{
                  mt: 2,
                  pt: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 0.75,
                  color: '#94A3B8',
                  fontSize: '12px',
                }}
              >
                <SecurityIcon sx={{ fontSize: 15, color: '#10B981' }} />
                <span>Bảo mật thông tin cá nhân theo tiêu chuẩn an toàn</span>
              </Box>
            </Box>
          </Grid>

          {/* Right Column: Candidate Showcase Panel */}
          <Grid
            size={{ xs: 12, md: 6 }}
            sx={{
              display: { xs: 'none', md: 'flex' },
              position: 'relative',
            }}
          >
            <AuthShowcasePanel variant="candidate" />
          </Grid>
        </Grid>
      </UnifiedAuthCard>
    </Container>

    {isFullScreenLoading && <BackdropLoading />}
  </>
);

export default JobSeekerLoginView;
