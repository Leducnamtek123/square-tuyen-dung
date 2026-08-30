import * as React from 'react';
import Link from 'next/link';
import { Box, Card, Container, Typography, Grid2 as Grid, styled } from '@mui/material';
import BackdropLoading from '../../../components/Common/Loading/BackdropLoading';
import JobSeekerSignUpForm from '../../components/auths/JobSeekerSignUpForm';
import AuthShowcasePanel from '../../components/auths/AuthShowcasePanel';
import { ROUTES } from '../../../configs/constants';
import type { TFunction } from 'i18next';
import type { RoleName } from '../../../types/auth';
import type { CodeResponse } from '@react-oauth/google';
import SecurityIcon from '@mui/icons-material/Security';
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

interface JobSeekerSignUpViewProps {
  t: TFunction;
  serverErrors: Record<string, string[]>;
  isFullScreenLoading: boolean;
  onRegister: (data: import('../../components/auths/JobSeekerSignUpForm').JobSeekerSignUpFormData) => void;
  onFacebookRegister: (result: { data?: { accessToken?: string } }) => void;
  onGoogleRegister: (result: Omit<CodeResponse, 'error' | 'error_description' | 'error_uri'>) => void;
  checkCreds: (email: string, roleName: RoleName) => Promise<boolean>;
}

const JobSeekerSignUpView = ({
  t,
  serverErrors,
  isFullScreenLoading,
  onRegister,
  onFacebookRegister,
  onGoogleRegister,
  checkCreds,
}: JobSeekerSignUpViewProps) => {
  return (
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
            {/* Left Column: Sign Up Form */}
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
                      href={`/${ROUTES.EMPLOYER_AUTH.REGISTER}`}
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 0.25,
                        fontWeight: 600,
                        color: '#2563EB',
                      }}
                    >
                      <span>Cổng Đăng ký NTD</span>
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
                    {t('signup.heading')}
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={{
                      color: '#64748B',
                      fontSize: '14px',
                      lineHeight: 1.5,
                    }}
                  >
                    {t('signup.jobSeekerSubtitle')}
                  </Typography>
                </Box>

                <Box sx={{ mt: 0.5 }}>
                  <JobSeekerSignUpForm
                    onRegister={onRegister}
                    onFacebookRegister={onFacebookRegister}
                    onGoogleRegister={onGoogleRegister}
                    serverErrors={serverErrors}
                    checkCreds={checkCreds}
                  />
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
                  Bằng việc đăng ký, tôi đồng ý với các{' '}
                  <StyledLink href="/terms-and-conditions" sx={{ fontSize: '12.5px', color: '#2563EB' }}>
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
                  sx={{
                    pt: 2,
                    borderTop: '1px solid #F1F5F9',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Grid>
                    <Typography variant="body2" sx={{ color: '#64748B', fontSize: '13.5px' }}>
                      {t('signup.haveAccount')}{' '}
                      <StyledLink href={`/${ROUTES.AUTH.LOGIN}`} sx={{ color: '#2563EB', fontWeight: 600 }}>
                        {t('signup.signIn')}
                      </StyledLink>
                    </Typography>
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
};

export default JobSeekerSignUpView;
