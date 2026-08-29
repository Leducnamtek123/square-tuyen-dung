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
          {/* Left Column: Sign Up Form */}
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
              <Box>
                {/* Cross-Portal Switcher Link */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    mb: 2,
                  }}
                >
                  <Typography variant="caption" sx={{ color: '#64748B', fontSize: '13px' }}>
                    Bạn là Nhà tuyển dụng?{' '}
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
                    {t('signup.heading')}
                  </Typography>

                  <Typography
                    variant="body1"
                    sx={{
                      color: '#64748B',
                      fontSize: '14.5px',
                      lineHeight: 1.5,
                    }}
                  >
                    {t('signup.jobSeekerSubtitle')}
                  </Typography>
                </Box>

                <Box sx={{ mt: 1 }}>
                  <JobSeekerSignUpForm
                    onRegister={onRegister}
                    onFacebookRegister={onFacebookRegister}
                    onGoogleRegister={onGoogleRegister}
                    serverErrors={serverErrors}
                    checkCreds={checkCreds}
                  />
                </Box>
              </Box>

              <Box sx={{ mt: 'auto', pt: 3 }}>
                <Grid
                  container
                  sx={{
                    pt: 2.5,
                    borderTop: '1px solid #F1F5F9',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Grid>
                    <StyledLink href={`/${ROUTES.AUTH.LOGIN}`}>
                      {t('signup.haveAccount')} {t('signup.signIn')}
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
};

export default JobSeekerSignUpView;
