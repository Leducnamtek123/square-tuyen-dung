'use client';
import * as React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Box, Card, Container, Typography, styled } from '@mui/material';
import { Grid2 as Grid } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { TabTitle } from '../../../utils/generalFunction';
import { PLATFORM, ROLES_NAME, ROUTES, AUTH_CONFIG, AUTH_PROVIDER } from '../../../configs/constants';
import { localizeRoutePath } from '../../../configs/routeLocalization';
import errorHandling from '../../../utils/errorHandling';
import BackdropLoading from '../../../components/Common/Loading/BackdropLoading';
import { updateVerifyEmail } from '../../../redux/authSlice';
import { getUserInfo } from '../../../redux/userSlice';
import authService from '../../../services/authService';
import tokenService from '../../../services/tokenService';
import EmployerSignUpForm, { EmployerSignUpFormData } from '../../components/auths/EmployerSignUpForm';
import AuthShowcasePanel from '../../components/auths/AuthShowcasePanel';
import { useAppDispatch } from '../../../hooks/useAppStore';
import type { RoleName, AuthProvider } from '../../../types/auth';
import type { AxiosError } from 'axios';
import type { EmployerRegisterData } from '../../../types/auth';
import type { CodeResponse } from '@react-oauth/google';
import SecurityIcon from '@mui/icons-material/Security';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const SOCIAL_AUTH_COOLDOWN_MS = 2500;

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

const EmployerSignUp = () => {
  const { t, i18n } = useTranslation('auth');

  TabTitle(t('signup.employerTitle'));

  const dispatch = useAppDispatch();
  const { push } = useRouter();

  const [isFullScreenLoading, setIsFullScreenLoading] = React.useState(false);
  const [serverErrors, setServerErrors] = React.useState<Record<string, string[]>>({});
  const socialAuthInFlightRef = React.useRef(false);
  const lastSocialAuthAttemptAtRef = React.useRef(0);
  const loginHref = localizeRoutePath(`/${ROUTES.EMPLOYER_AUTH.LOGIN}`, i18n.language);
  const candidateRegisterHref = localizeRoutePath(`/${ROUTES.AUTH.REGISTER}`, i18n.language);

  const handleRegister = (data: EmployerSignUpFormData) => {
    const register = async (data: EmployerRegisterData, roleName: RoleName) => {
      setIsFullScreenLoading(true);

      try {
        await authService.employerRegister(data);

        dispatch(
          updateVerifyEmail({
            isAllowVerifyEmail: true,
            email: (data?.email as string) || '',
            roleName: roleName,
          })
        );

        push(`/${ROUTES.AUTH.EMAIL_VERIFICATION}`);
      } catch (error) {
        const axiosError = error as AxiosError<{ errors?: Record<string, string[]> }>;
        const res = axiosError?.response;
        const errors = res?.data?.errors;
        const hasEmailExists = !!errors?.email;
        if (res?.status === 400 && hasEmailExists) {
          try {
            const resData = await authService.checkCreds((data?.email as string) || '', ROLES_NAME.EMPLOYER as RoleName) as { exists?: boolean; emailVerified?: boolean; };
            if (resData?.exists === true && resData?.emailVerified === false) {
              dispatch(
                updateVerifyEmail({
                  isAllowVerifyEmail: true,
                  email: (data?.email as string) || '',
                  roleName: ROLES_NAME.EMPLOYER as RoleName,
                })
              );
              push(`/${ROUTES.AUTH.EMAIL_VERIFICATION}`);
              return;
            }
          } catch {
            // fall through to default error handling
          }
        }

        errorHandling(error, (errs) => setServerErrors(errs as Record<string, string[]>));
      } finally {
        setIsFullScreenLoading(false);
      }
    };

    register(
      {
        ...data,
        platform: PLATFORM,
      },
      ROLES_NAME.EMPLOYER as RoleName
    );
  };

  const checkCreds = async (email: string, roleName: RoleName) => {
    try {
      const resData = await authService.checkCreds(email, roleName) as { exists: boolean, emailVerified: boolean };
      const { exists, emailVerified } = resData;

      if (exists === true && emailVerified === false) {
        dispatch(
          updateVerifyEmail({
            isAllowVerifyEmail: true,
            email: email,
            roleName: roleName,
          })
        );
        push(`/${ROUTES.AUTH.EMAIL_VERIFICATION}`);
        return false;
      }

      if (exists === true) {
        setServerErrors({
          email: ['Email already exists'],
        });
        return false;
      }

      return true;
    } catch (error) {
      errorHandling(error);
      return false;
    }
  };

  const handleSocialRegister = async (
    clientId: string,
    provider: AuthProvider,
    token: string,
  ) => {
    const now = Date.now();
    if (
      socialAuthInFlightRef.current ||
      now - lastSocialAuthAttemptAtRef.current < SOCIAL_AUTH_COOLDOWN_MS
    ) {
      return;
    }

    const redirectUri = (typeof window !== 'undefined' ? window.location.origin : '');
    lastSocialAuthAttemptAtRef.current = now;
    socialAuthInFlightRef.current = true;
    setIsFullScreenLoading(true);

    try {
      const resData = await authService.convertToken(
        clientId,
        provider,
        token,
        redirectUri,
        ROLES_NAME.EMPLOYER as RoleName
      );

      const { accessToken, refreshToken, backend } = resData;

      const isSaveTokenToCookie =
        tokenService.saveAccessTokenAndRefreshTokenToCookie(
          accessToken,
          refreshToken,
          backend
        );

      if (isSaveTokenToCookie) {
        dispatch(getUserInfo())
          .unwrap()
          .then((user) => {
            if (user?.isOnboarded === false) {
              push('/onboarding/employer');
            } else {
              push('/employer/dashboard');
            }
          })
          .catch(() => {
            errorHandling(new Error('Login error'));
          });
      }
    } catch (error) {
      errorHandling(error);
    } finally {
      setIsFullScreenLoading(false);
      socialAuthInFlightRef.current = false;
    }
  };

  const handleFacebookRegister = async (
    result: { data?: { accessToken?: string } }
  ) => {
    const accessToken = result?.data?.accessToken;

    if (accessToken) {
      await handleSocialRegister(
        AUTH_CONFIG.CLIENT_ID || '',
        AUTH_PROVIDER.FACEBOOK as AuthProvider,
        accessToken
      );
    }
  };

  const handleGoogleRegister = (result: Omit<CodeResponse, "error" | "error_description" | "error_uri">) => {
    const code = result?.code;

    if (code) {
      void handleSocialRegister(
        AUTH_CONFIG.CLIENT_ID || '',
        AUTH_PROVIDER.GOOGLE as AuthProvider,
        code
      );
    }
  };

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
            maxWidth: '1080px',
            margin: '0 auto',
          }}
        >
          {/* Left Column: Sign Up Form */}
          <Grid
            size={{ xs: 12, md: 6.5 }}
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
                    Bạn là Người tìm việc?{' '}
                    <StyledLink
                      href={candidateRegisterHref}
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 0.25,
                        fontWeight: 600,
                        color: '#2563EB',
                      }}
                    >
                      <span>Đăng ký tìm việc</span>
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
                    {t('signup.employerSubtitle')}
                  </Typography>
                </Box>

                <Box sx={{ mt: 1 }}>
                  <EmployerSignUpForm
                    onSignUp={handleRegister}
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
                    <StyledLink href={loginHref}>
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
                  <span>Bảo mật thông tin doanh nghiệp theo tiêu chuẩn SSL 256-bit</span>
                </Box>
              </Box>
            </StyledCard>
          </Grid>

          {/* Right Column: Showcase Panel (Desktop only) */}
          <Grid
            size={{ xs: 12, md: 5.5 }}
            sx={{
              display: { xs: 'none', md: 'flex' },
            }}
          >
            <AuthShowcasePanel variant="employer" />
          </Grid>
        </Grid>
      </Container>

      {isFullScreenLoading && <BackdropLoading />}
    </>
  );
};

export default EmployerSignUp;
