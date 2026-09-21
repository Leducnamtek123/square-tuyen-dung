'use client';
import * as React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Box, Card, Container, Typography, styled, Alert, Button } from '@mui/material';
import { Grid2 as Grid } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { TabTitle } from '@/utils/generalFunction';
import { PLATFORM, ROLES_NAME, ROUTES, AUTH_CONFIG, AUTH_PROVIDER } from '@/configs/constants';
import { localizeRoutePath } from '@/configs/routeLocalization';
import errorHandling from '@/utils/errorHandling';
import BackdropLoading from '@/components/Common/Loading/BackdropLoading';
import { updateVerifyEmail } from '@/redux/authSlice';
import { getUserInfo } from '@/redux/userSlice';
import authService from '@/services/authService';
import tokenService from '@/services/tokenService';
import EmployerSignUpForm, { EmployerSignUpFormData } from '@/views/components/auths/EmployerSignUpForm';
import { useAppDispatch } from '@/hooks/useAppStore';
import type { RoleName, AuthProvider } from '@/types/auth';
import type { AxiosError } from 'axios';
import type { EmployerRegisterData } from '@/types/auth';
import type { CodeResponse } from '@react-oauth/google';
import SecurityIcon from '@mui/icons-material/Security';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import EmployerSignUpShowcase from '@/views/components/auths/EmployerSignUpShowcase';

const SOCIAL_AUTH_COOLDOWN_MS = 2500;

const UnifiedAuthCard = styled(Card)(({ theme }) => ({
  background: '#FFFFFF',
  borderRadius: 0,
  boxShadow: 'none',
  border: 'none',
  [theme.breakpoints.up('sm')]: {
    borderRadius: '24px',
    boxShadow: '0 20px 60px -15px rgba(15, 23, 42, 0.1), 0 0 0 1px rgba(226, 232, 240, 0.8)',
  },
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

const EmployerSignUp = () => {
  const { t, i18n } = useTranslation('auth');

  TabTitle(t('signup.employerTitle'));

  const dispatch = useAppDispatch();
  const { push } = useRouter();

  const [isFullScreenLoading, setIsFullScreenLoading] = React.useState(false);
  const [serverErrors, setServerErrors] = React.useState<Record<string, string[]>>({});
  const [existingAccount, setExistingAccount] = React.useState<{ email: string; role: 'JOB_SEEKER' | 'EMPLOYER' } | null>(null);
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
          const emailStr = (data?.email as string) || '';
          try {
            const resData = await authService.checkCreds(emailStr, ROLES_NAME.EMPLOYER as RoleName) as { exists?: boolean; emailVerified?: boolean; otherRole?: string; other_role?: string };
            const detectedOtherRole = resData?.otherRole || (resData as any)?.other_role;
            if (detectedOtherRole === ROLES_NAME.JOB_SEEKER) {
              setExistingAccount({
                email: emailStr,
                role: 'JOB_SEEKER',
              });
              setServerErrors({
                email: [t('signup.existingAccountJobSeekerBody', { email: emailStr })]
              });
              return;
            }
            if (resData?.exists === true) {
              setExistingAccount({
                email: emailStr,
                role: 'EMPLOYER',
              });
              setServerErrors({
                email: [t('signup.existingAccountEmployerBody', { email: emailStr })]
              });
              return;
            }
          } catch {
            // fall through to default fallback
          }

          setExistingAccount({
            email: emailStr,
            role: 'EMPLOYER',
          });
          setServerErrors({
            email: [t('signup.existingAccountEmployerBody', { email: emailStr })]
          });
          return;
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
      const resData = await authService.checkCreds(email, roleName) as { exists: boolean, emailVerified: boolean; otherRole?: string; other_role?: string };
      const { exists } = resData;
      const otherRole = resData?.otherRole || (resData as any)?.other_role;

      if (otherRole === ROLES_NAME.JOB_SEEKER) {
        setExistingAccount({ email, role: 'JOB_SEEKER' });
        setServerErrors({
          email: [t('signup.existingAccountJobSeekerBody', { email })]
        });
        return false;
      }

      if (exists === true) {
        setExistingAccount({ email, role: 'EMPLOYER' });
        setServerErrors({
          email: [t('signup.existingAccountEmployerBody', { email })]
        });
        return false;
      }

      setExistingAccount(null);
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
          .then((user: any) => {
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
      <Box
        sx={{
          minHeight: 'calc(100vh - 80px)',
          background: 'radial-gradient(ellipse at top left, #EFF6FF 0%, #F8FAFC 50%, #FFFFFF 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: { xs: 2, sm: 3, md: 4 },
          px: { xs: 1, sm: 2 },
        }}
      >
        <Container
          maxWidth="lg"
          sx={{
            p: '0 !important',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
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
              {/* Left Column: Registration Form */}
              <Grid
                size={{ xs: 12, md: 6 }}
                sx={{
                  p: { xs: 2.5, sm: 3.5, md: 4 },
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
                      flexWrap: 'wrap',
                      gap: 1.5,
                      mb: 2,
                    }}
                  >
                  <Box
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      backgroundColor: '#EFF6FF',
                      border: '1px solid #DBEAFE',
                      px: 1.5,
                      py: 0.6,
                      borderRadius: '8px',
                    }}
                  >
                    <Typography
                      component="span"
                      sx={{
                        color: '#2563EB',
                        fontWeight: 700,
                        fontSize: '12px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        whiteSpace: 'nowrap',
                        lineHeight: 1,
                      }}
                    >
                      Nhà tuyển dụng
                    </Typography>
                  </Box>

                  <Typography
                    variant="caption"
                    sx={{
                      color: '#64748B',
                      fontSize: '13px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 0.5,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <span>Bạn là Người tìm việc?</span>
                    <StyledLink
                      href={candidateRegisterHref}
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 0.35,
                        fontWeight: 700,
                        color: '#2563EB',
                        textDecoration: 'none',
                        '&:hover': {
                          textDecoration: 'underline',
                        },
                      }}
                    >
                      <span>Đăng ký tìm việc</span>
                      <ArrowForwardIcon sx={{ fontSize: 14 }} />
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
                    {t('signup.employerTitle', { defaultValue: 'Đăng ký tài khoản Tuyển dụng' })}
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={{
                      color: '#64748B',
                      fontSize: '14px',
                      lineHeight: 1.5,
                    }}
                  >
                    {t('signup.employerSubtitle')}
                  </Typography>
                </Box>

                {existingAccount && (
                  <Alert
                    severity="info"
                    icon={<InfoOutlinedIcon sx={{ color: '#2563EB', mt: 0.25 }} />}
                    sx={{
                      mb: 2.5,
                      borderRadius: '16px',
                      border: '1px solid #BFDBFE',
                      backgroundColor: '#EFF6FF',
                      '& .MuiAlert-message': { width: '100%' },
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1E3A8A', mb: 0.5, fontSize: '14px' }}>
                      {t('signup.existingAccountTitle')}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#1E40AF', fontSize: '13px', lineHeight: 1.5, mb: 1.5 }}>
                      {existingAccount.role === 'JOB_SEEKER'
                        ? t('signup.existingAccountJobSeekerBody', { email: existingAccount.email })
                        : t('signup.existingAccountEmployerBody', { email: existingAccount.email })}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                      <Button
                        component={Link}
                        href={
                          existingAccount.role === 'JOB_SEEKER'
                            ? `/${ROUTES.AUTH.LOGIN}?email=${encodeURIComponent(existingAccount.email)}`
                            : `/${ROUTES.EMPLOYER_AUTH.LOGIN}?email=${encodeURIComponent(existingAccount.email)}`
                        }
                        variant="contained"
                        size="small"
                        endIcon={<ArrowForwardIcon sx={{ fontSize: 15 }} />}
                        sx={{
                          textTransform: 'none',
                          fontWeight: 700,
                          fontSize: '13px',
                          py: 0.75,
                          px: 1.75,
                          borderRadius: '10px',
                          background: 'linear-gradient(135deg, #1E40AF 0%, #2563EB 100%)',
                          boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #1D4ED8 0%, #1E40AF 100%)',
                          },
                        }}
                      >
                        {existingAccount.role === 'JOB_SEEKER'
                          ? t('signup.loginCandidatePortal')
                          : t('signup.loginNow')}
                      </Button>

                      {existingAccount.role === 'EMPLOYER' && (
                        <StyledLink
                          href={`/${ROUTES.EMPLOYER_AUTH.FORGOT_PASSWORD}?email=${encodeURIComponent(existingAccount.email)}`}
                          sx={{ fontSize: '13px', fontWeight: 600, color: '#2563EB' }}
                        >
                          {t('signup.forgotPasswordLink')}
                        </StyledLink>
                      )}
                    </Box>
                  </Alert>
                )}

                <Box sx={{ mt: 0.5 }}>
                  <EmployerSignUpForm
                    onSignUp={handleRegister}
                    serverErrors={serverErrors}
                    checkCreds={checkCreds}
                  />
                </Box>
              </Box>

              {/* Card Bottom / Legal Disclaimer & Links */}
              <Box sx={{ mt: 'auto', pt: 2 }}>
                <Typography
                  variant="caption"
                  sx={{
                    display: 'block',
                    textAlign: 'center',
                    color: '#64748B',
                    fontSize: '11.5px',
                    lineHeight: 1.5,
                    mb: 1.5,
                  }}
                >
                  Bằng việc đăng ký tài khoản, quý doanh nghiệp đồng ý tuân thủ các{' '}
                  <StyledLink href="/employer/terms-of-service" sx={{ fontSize: '11.5px', color: '#2563EB' }}>
                    Điều khoản dịch vụ
                  </StyledLink>{' '}
                  và{' '}
                  <StyledLink href="/employer/privacy-policy" sx={{ fontSize: '11.5px', color: '#2563EB' }}>
                    Chính sách bảo mật
                  </StyledLink>{' '}
                  của InfoHR.
                </Typography>

                <Grid
                  container
                  sx={{
                    pt: 1.5,
                    borderTop: '1px solid #F1F5F9',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Grid>
                    <Typography variant="body2" sx={{ color: '#64748B', fontSize: '13.5px' }}>
                      {t('signup.haveAccount')}{' '}
                      <StyledLink href={loginHref} sx={{ color: '#2563EB', fontWeight: 600 }}>
                        {t('signup.signIn')}
                      </StyledLink>
                    </Typography>
                  </Grid>
                </Grid>

                {/* Security Trust Indicator (Mobile only, on desktop it's in the showcase panel) */}
                <Box
                  sx={{
                    display: { xs: 'flex', md: 'none' },
                    mt: 1.5,
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 0.75,
                    color: '#64748B',
                    fontSize: '11.5px',
                  }}
                >
                  <SecurityIcon sx={{ fontSize: 14, color: '#10B981' }} />
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
              <EmployerSignUpShowcase />
            </Grid>
          </Grid>
        </UnifiedAuthCard>
      </Container>
    </Box>

      {isFullScreenLoading && <BackdropLoading />}
    </>
  );
};

export default EmployerSignUp;
