'use client';
import * as React from 'react';

import { useRouter } from 'next/navigation';

import { Alert, AlertTitle, Box, Card, Container, Typography, styled } from '@mui/material';
import { Grid2 as Grid } from '@mui/material';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { TabTitle } from '@/utils/generalFunction';
import { AUTH_CONFIG, AUTH_PROVIDER, ROLES_NAME, ROUTES } from '@/configs/constants';
import { localizeRoutePath } from '@/configs/routeLocalization';
import toastMessages from '@/utils/toastMessages';
import BackdropLoading from '@/components/Common/Loading/BackdropLoading';
import { updateVerifyEmail } from '@/redux/authSlice';
import { getUserInfo, setActiveWorkspace } from '@/redux/userSlice';
import EmployerLoginForm, { EmployerLoginFormData } from '@/views/components/auths/EmployerLoginForm';
import AuthShowcasePanel from '@/views/components/auths/AuthShowcasePanel';
import authService from '@/services/authService';
import tokenService from '@/services/tokenService';
import { useAppDispatch } from '@/hooks/useAppStore';
import type { RoleName, AuthProvider } from '@/types/auth';
import type { User, Workspace } from '@/types/models';
import type { AxiosError } from 'axios';
import type { CodeResponse } from '@react-oauth/google';
import SecurityIcon from '@mui/icons-material/Security';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const SOCIAL_AUTH_COOLDOWN_MS = 2500;

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

const getCompanyPortalPath = (language: string) => {
  return localizeRoutePath(`/${ROUTES.EMPLOYER.DASHBOARD}`, language);
};

const getSafeRedirectPath = (fallback: string) => {
  if (typeof window === 'undefined') return fallback;
  const params = new URLSearchParams(window.location.search);
  const redirect = params.get('redirect');
  if (redirect && redirect.startsWith('/') && !redirect.startsWith('//') && !redirect.includes('\\')) {
    return redirect;
  }
  return fallback;
};

const getCompanyWorkspace = (user?: User | null) =>
  ((user?.workspaces || []) as Workspace[]).find((workspace) => workspace.type === 'company');

type ApiErrorPayload = {
  errors?: Record<string, string[]>;
  error?: {
    message?: string;
    details?: Record<string, string[]>;
  };
};

const EmployerLogin = () => {
  const { t, i18n } = useTranslation('auth');
  TabTitle(t('login.employerTitle'));

  const dispatch = useAppDispatch();
  const { push } = useRouter();

  const [isFullScreenLoading, setIsFullScreenLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
  const forgotPasswordHref = localizeRoutePath(`/${ROUTES.EMPLOYER_AUTH.FORGOT_PASSWORD}`, i18n.language);
  const registerHref = localizeRoutePath(`/${ROUTES.EMPLOYER_AUTH.REGISTER}`, i18n.language);
  const candidateLoginHref = localizeRoutePath(`/${ROUTES.AUTH.LOGIN}`, i18n.language);
  const socialAuthInFlightRef = React.useRef(false);
  const lastSocialAuthAttemptAtRef = React.useRef(0);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const successMessageKey = params.get('successMessageKey');
    const successMsg = params.get('successMessage');
    const errorMsg = params.get('errorMessage');

    if (successMessageKey === 'passwordResetSuccess') {
      setSuccessMessage(t('messages.passwordResetSuccess'));
    } else if (successMsg !== null) {
      setSuccessMessage(successMsg);
    }

    setErrorMessage(errorMsg);
  }, [t]);

  const extractErrorMessage = (res: { data?: ApiErrorPayload } | undefined): string | null => {
    if (!res?.data) return null;

    const v2Details = res.data.error?.details;
    const v2ErrorMsg = v2Details?.errorMessage;

    const v1Errors = res.data.errors;
    const v1ErrorMsg = v1Errors?.errorMessage;

    if (Array.isArray(v2ErrorMsg) && v2ErrorMsg.length > 0) {
      return v2ErrorMsg.join(' ');
    }
    if (Array.isArray(v1ErrorMsg) && v1ErrorMsg.length > 0) {
      return v1ErrorMsg.join(' ');
    }
    if (typeof res.data.error?.message === 'string' && res.data.error.message) {
      return res.data.error.message;
    }
    return null;
  };

  const handleLogin = (data: EmployerLoginFormData) => {
    const getAccessToken = async (email: string, password: string, roleName: RoleName) => {
      setIsFullScreenLoading(true);

      try {
        const resData = await authService.getToken(email, password, roleName);
        const { accessToken, refreshToken, backend } = resData;

        const isSaveTokenToCookie = tokenService.saveAccessTokenAndRefreshTokenToCookie(
          accessToken,
          refreshToken,
          backend
        );

        if (isSaveTokenToCookie) {
          dispatch(getUserInfo())
            .unwrap()
            .then((user) => {
              const companyWorkspace = getCompanyWorkspace(user);
              if (companyWorkspace) {
                dispatch(setActiveWorkspace(companyWorkspace));
              }
              if (user?.isOnboarded === false) {
                push('/onboarding/employer');
              } else {
                push(getSafeRedirectPath(getCompanyPortalPath(i18n.language)));
              }
            })
            .catch(() => {
              toastMessages.error(t('messages.loginError'));
            });
        } else {
          toastMessages.error(t('messages.loginError'));
        }
      } catch (error) {
        const axiosError = error as AxiosError<ApiErrorPayload>;
        const res = axiosError?.response;

        if (res?.status === 400) {
          const errMsg = extractErrorMessage(res);
          if (errMsg) {
            setErrorMessage(errMsg);
          } else {
            toastMessages.error(t('messages.tryAgain'));
          }
        }
      } finally {
        setIsFullScreenLoading(false);
      }
    };

    const checkCreds = async (email: string, password: string, roleName: RoleName) => {
      setIsFullScreenLoading(true);

      try {
        const resData = await authService.checkCreds(email, roleName);
        const { exists, email: resEmail, emailVerified } = resData;

        if (exists === true && emailVerified === false) {
          dispatch(
            updateVerifyEmail({
              isAllowVerifyEmail: true,
              email: email,
              roleName: roleName,
            })
          );

          push(`/${ROUTES.AUTH.EMAIL_VERIFICATION}`);
          return;
        }

        if (exists === false) {
          setErrorMessage(t('messages.noEmployerAccount'));
          return;
        }

        getAccessToken(resEmail, password, roleName);
      } catch (error) {
        toastMessages.error(t('messages.loginError'));
      } finally {
        setIsFullScreenLoading(false);
      }
    };

    checkCreds(data.email || '', data.password || '', ROLES_NAME.EMPLOYER as RoleName);
  };

  const handleSocialLogin = async (clientId: string, provider: AuthProvider, token: string) => {
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

      const isSaveTokenToCookie = tokenService.saveAccessTokenAndRefreshTokenToCookie(
        accessToken,
        refreshToken,
        backend
      );

      if (isSaveTokenToCookie) {
        dispatch(getUserInfo())
          .unwrap()
          .then((user) => {
            const companyWorkspace = getCompanyWorkspace(user);
            if (companyWorkspace) {
              dispatch(setActiveWorkspace(companyWorkspace));
            }
            if (user?.isOnboarded === false) {
              push('/onboarding/employer');
            } else {
              push(getSafeRedirectPath(getCompanyPortalPath(i18n.language)));
            }
          })
          .catch(() => {
            toastMessages.error(t('messages.loginError'));
          });
      } else {
        toastMessages.error(t('messages.loginError'));
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiErrorPayload>;
      const res = axiosError?.response;

      if (res?.status === 400) {
        const errMsg = extractErrorMessage(res);
        if (errMsg) {
          setErrorMessage(errMsg);
        } else {
          toastMessages.error(t('messages.tryAgain'));
        }
      }
    } finally {
      setIsFullScreenLoading(false);
      socialAuthInFlightRef.current = false;
    }
  };

  const handleGoogleLogin = (result: Omit<CodeResponse, "error" | "error_description" | "error_uri">) => {
    const code = result?.code;

    if (code) {
      void handleSocialLogin(
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
              {/* Card Top / Header */}
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
                    Nhà tuyển dụng
                  </Typography>

                  <Typography variant="caption" sx={{ color: '#64748B', fontSize: '13px' }}>
                    Bạn là Người tìm việc?{' '}
                    <StyledLink
                      href={candidateLoginHref}
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 0.25,
                        fontWeight: 600,
                        color: '#2563EB',
                      }}
                    >
                      <span>Tìm việc ngay</span>
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
                    {t('login.heading')}
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

                <Box sx={{ mt: 0.5 }}>
                  <EmployerLoginForm onLogin={handleLogin} onGoogleLogin={handleGoogleLogin} />
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
                  Bằng việc đăng nhập, quý doanh nghiệp đồng ý tuân thủ các{' '}
                  <StyledLink href="/employer/terms-of-service" sx={{ fontSize: '12.5px', color: '#2563EB' }}>
                    Điều khoản dịch vụ
                  </StyledLink>{' '}
                  và{' '}
                  <StyledLink href="/employer/privacy-policy" sx={{ fontSize: '12.5px', color: '#2563EB' }}>
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
                    <StyledLink href={forgotPasswordHref} sx={{ color: '#64748B', '&:hover': { color: '#2563EB' } }}>
                      {t('login.forgotPassword')}
                    </StyledLink>
                  </Grid>

                  <Grid
                    sx={{
                      textAlign: { xs: 'left', sm: 'right' },
                    }}
                    size={{ xs: 12, sm: 6 }}
                  >
                    <StyledLink href={registerHref} sx={{ color: '#2563EB', fontWeight: 600 }}>
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
                  <span>Bảo mật thông tin doanh nghiệp theo tiêu chuẩn SSL 256-bit</span>
                </Box>
              </Box>
            </Grid>

            {/* Right Column: Showcase Panel (Desktop only) */}
            <Grid
              size={{ xs: 12, md: 6 }}
              sx={{
                display: { xs: 'none', md: 'flex' },
                position: 'relative',
              }}
            >
              <AuthShowcasePanel variant="employer" />
            </Grid>
          </Grid>
        </UnifiedAuthCard>
      </Container>

      {isFullScreenLoading && <BackdropLoading />}
    </>
  );
};

export default EmployerLogin;