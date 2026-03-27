import * as React from 'react';

import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

import { Alert, AlertTitle, Avatar, Box, Button, Card, Container, Typography, styled } from "@mui/material";

import { Grid2 as Grid } from "@mui/material";

import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

import { useTranslation } from 'react-i18next';

import { TabTitle } from '../../../utils/generalFunction';

import {

  AUTH_CONFIG,

  AUTH_PROVIDER,

  ROLES_NAME,

  ROUTES,

} from '../../../configs/constants';

import toastMessages from '../../../utils/toastMessages';

import BackdropLoading from '../../../components/Common/Loading/BackdropLoading';

import { updateVerifyEmail } from '../../../redux/authSlice';

import { getUserInfo } from '../../../redux/userSlice';

import JobSeekerLoginForm from '../../components/auths/JobSeekerLoginForm';
import PhoneOTPLoginForm from '../../components/auths/PhoneOTPLoginForm';

import authService from '../../../services/authService';

import tokenService from '../../../services/tokenService';

import { useAppDispatch } from '../../../hooks/useAppStore';

import type { RoleName, AuthProvider } from '../../../types/auth';

import type { AxiosError } from 'axios';



const StyledCard = styled(Card)(({ theme }) => ({

  background: 'rgba(255, 255, 255, 0.9)',

  backdropFilter: 'blur(10px)',

  borderRadius: '16px',

  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',

  transition: 'all 0.3s ease',

}));

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

const JobSeekerLogin = () => {

  const { t } = useTranslation('auth');

  TabTitle(t('login.jobSeekerTitle'));

  const dispatch = useAppDispatch();

  const nav = useRouter();

  const searchParams = useSearchParams();

  const [isFullScreenLoading, setIsFullScreenLoading] = React.useState(false);

  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
  const [loginMode, setLoginMode] = React.useState<'email' | 'phone'>('email');

  React.useEffect(() => {

    const successMsg = searchParams.get('successMessage');

    const errorMsg = searchParams.get('errorMessage');

    if (successMsg !== null) {

      setSuccessMessage(successMsg);

    }

    setErrorMessage(errorMsg);

  }, [searchParams]);

  const handleLogin = (data: any) => {

    const getAccessToken = async (email: string, password: string, roleName: RoleName) => {

      setIsFullScreenLoading(true);

      try {

        const resData = await authService.getToken(email, password, roleName);

        const { accessToken, refreshToken, backend } = resData as any;

        const isSaveTokenToCookie =

          tokenService.saveAccessTokenAndRefreshTokenToCookie(

            accessToken,

            refreshToken,

            backend

          );

        if (isSaveTokenToCookie) {

          dispatch(getUserInfo())

            .unwrap()

            .then(() => {

              nav.push('/');

            })

            .catch(() => {

              toastMessages.error(t('messages.loginError'));

            });

        } else {

          toastMessages.error(t('messages.loginError'));

        }

      } catch (error) {

        const axiosError = error as AxiosError<any>;
        const res = axiosError?.response;

        if (res?.status === 400) {

          const errors = res?.data?.errors;

          if (errors && 'errorMessage' in errors) {

            setErrorMessage(errors.errorMessage.join(' '));

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

        const resData = await authService.checkCreds(email, roleName) as any;

        const { exists, email: resEmail, emailVerified } = resData;

        if (exists === true && emailVerified === false) {

          dispatch(

            updateVerifyEmail({

              isAllowVerifyEmail: true,

              email: email,

              roleName: roleName,

            })

          );

          nav.push(`/${ROUTES.AUTH.EMAIL_VERIFICATION}`);

          return;

        } else if (exists === false) {

          setErrorMessage(t('messages.noCandidateAccount'));

          return;

        }

        getAccessToken(resEmail, password, roleName);

      } catch (error) {

        toastMessages.error(t('messages.loginError'));

      } finally {

        setIsFullScreenLoading(false);

      }

    };

    checkCreds(data.email, data.password, ROLES_NAME.JOB_SEEKER as RoleName);

  };

  const handleSocialLogin = async (

    clientId: string,

    clientSecrect: string,

    provider: AuthProvider,

    token: string

  ) => {
    const redirectUri = (typeof window !== 'undefined' ? window.location.origin : '');

    setIsFullScreenLoading(true);

    try {

      const resData = await authService.convertToken(

        clientId,

        clientSecrect,

        provider,

        token,
        redirectUri

      ) as any;

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

          .then(() => {

            nav.push('/');

          })

          .catch(() => {

            toastMessages.error(t('messages.loginError'));

          });

      } else {

        toastMessages.error(t('messages.loginError'));

      }

    } catch (error) {
      const axiosError = error as AxiosError<any>;
      const res = axiosError?.response;
      if (res?.status === 400) {
        const errors = res?.data?.errors;
        if (errors && 'errorMessage' in errors) {
          setErrorMessage(errors.errorMessage.join(' '));
        } else {
          toastMessages.error(t('messages.tryAgain'));
        }
      }
    } finally {

      setIsFullScreenLoading(false);

    }

  };

  // const handleFacebookLogin = (result) => {

  //   const accessToken = result?.data?.accessToken;

  //   if (accessToken) {

  //     handleSocialLogin(

  //       AUTH_CONFIG.FACEBOOK_CLIENT_ID,

  //       AUTH_CONFIG.FACEBOOK_CLIENT_SECRET,

  //       AUTH_PROVIDER.FACEBOOK,

  //       accessToken

  //     );

  //   }

  // };

  const handleGoogleLogin = (result: any) => {

    const code = result?.code;

    if (code) {

      handleSocialLogin(

        AUTH_CONFIG.CLIENT_ID || '',

        AUTH_CONFIG.CLIENT_SECRET || '',

        AUTH_PROVIDER.GOOGLE as AuthProvider,

        code

      );

    }

  };

  const handleFirebaseLogin = async (idToken: string) => {
    setIsFullScreenLoading(true);
    try {
      const resData = await authService.firebaseLogin(idToken, ROLES_NAME.JOB_SEEKER as RoleName);
      const { accessToken, refreshToken, backend } = resData as any;

      const isSaveTokenToCookie = tokenService.saveAccessTokenAndRefreshTokenToCookie(
        accessToken,
        refreshToken,
        backend
      );

      if (isSaveTokenToCookie) {
        dispatch(getUserInfo())
          .unwrap()
          .then(() => {
            nav.push('/');
          })
          .catch(() => {
            toastMessages.error(t('messages.loginError'));
          });
      } else {
        toastMessages.error(t('messages.loginError'));
      }
    } catch (error) {
      const axiosError = error as AxiosError<any>;
      const res = axiosError?.response;
      if (res?.status === 400) {
        const errors = res?.data?.errors;
        if (errors && 'errorMessage' in errors) {
          setErrorMessage(errors.errorMessage.join(' '));
        } else if (errors && 'token' in errors) {
           setErrorMessage(errors.token.join(' '));
        } else {
          toastMessages.error(t('messages.tryAgain'));
        }
      }
    } finally {
      setIsFullScreenLoading(false);
    }
  };

  return (

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

        <StyledCard sx={{

          p: { xs: 2, sm: 4, md: 5 },

          width: '100%',

          borderRadius: { xs: 0, sm: '16px' },

          boxShadow: { xs: 'none', sm: '0 8px 32px rgba(0, 0, 0, 0.1)' },

        }}>

          <Box

            sx={{

              display: 'flex',

              flexDirection: 'column',

              alignItems: 'center',

              mb: 4,

            }}

          >

            <StyledAvatar>

              <LockOutlinedIcon sx={{ fontSize: 28 }} />

            </StyledAvatar>

            <Typography

              component="h1"

              variant="h4"

              align="center"

              sx={{

                fontWeight: 600,

                color: 'primary.main',

                mb: 1

              }}

            >

              {t('login.heading')}

            </Typography>

            <Typography

              variant="subtitle1"

              align="center"

              sx={{

                color: 'text.secondary',

                mb: 2

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

                borderRadius: '8px',

              }}

            >

              <AlertTitle>{t('login.errorTitle')}</AlertTitle>

              {errorMessage}

            </Alert>

          )}

          {successMessage && (

            <Alert

              severity="success"

              sx={{

                mb: 3,

                borderRadius: '8px',

              }}

            >

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
                  onClick={() => setLoginMode('email')}
                  disableElevation
                  sx={{
                    flex: 1,
                    textTransform: 'none',
                    borderRadius: '12px',
                    fontWeight: 600,
                    py: 0.75,
                    color: loginMode === 'email' ? 'common.white' : 'text.secondary',
                    backgroundColor: loginMode === 'email' ? 'primary.main' : 'transparent',
                    boxShadow:
                      loginMode === 'email' ? '0 6px 14px rgba(63, 81, 181, 0.28)' : 'none',
                    '&:hover': {
                      backgroundColor: loginMode === 'email' ? 'primary.dark' : 'rgba(0,0,0,0.04)',
                    },
                  }}
                >
                  Email
                </Button>
                <Button
                  onClick={() => setLoginMode('phone')}
                  disableElevation
                  sx={{
                    flex: 1,
                    textTransform: 'none',
                    borderRadius: '12px',
                    fontWeight: 600,
                    py: 0.75,
                    color: loginMode === 'phone' ? 'common.white' : 'text.secondary',
                    backgroundColor: loginMode === 'phone' ? 'primary.main' : 'transparent',
                    boxShadow:
                      loginMode === 'phone' ? '0 6px 14px rgba(63, 81, 181, 0.28)' : 'none',
                    '&:hover': {
                      backgroundColor: loginMode === 'phone' ? 'primary.dark' : 'rgba(0,0,0,0.04)',
                    },
                  }}
                >
                  {t('login.phone', 'Số điện thoại')}
                </Button>
              </Box>
            </Box>

            {loginMode === 'email' ? (
              <JobSeekerLoginForm
                onLogin={handleLogin}
                // onFacebookLogin={handleFacebookLogin}
                onGoogleLogin={handleGoogleLogin}
              />
            ) : (
              <PhoneOTPLoginForm
                onLogin={handleFirebaseLogin}
                isLoading={isFullScreenLoading}
              />
            )}
          </Box>

          <Grid

            container

            spacing={2}

            sx={{

              mt: 4,

              justifyContent: 'space-between',

              alignItems: 'center'

            }}

          >

            <Grid

              size={{

                xs: 12,

                sm: 6

              }}>

              <StyledLink href={`/${ROUTES.AUTH.FORGOT_PASSWORD}`}>

                {t('login.forgotPassword')}

              </StyledLink>

            </Grid>

            <Grid

              sx={{

                textAlign: { xs: 'left', sm: 'right' }

              }}

              size={{

                xs: 12,

                sm: 6

              }}>

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

};

export default JobSeekerLogin;
