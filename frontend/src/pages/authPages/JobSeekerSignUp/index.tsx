import * as React from 'react';

import { Link, useNavigate } from 'react-router-dom';

import { Avatar, Box, Card, Container, Typography, styled } from "@mui/material";

import Grid from "@mui/material/Grid2";

import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

import { useTranslation } from 'react-i18next';

import { TabTitle } from '../../../utils/generalFunction';

import { PLATFORM, ROLES_NAME, ROUTES, AUTH_CONFIG, AUTH_PROVIDER } from '../../../configs/constants';

import errorHandling from '../../../utils/errorHandling';

import BackdropLoading from '../../../components/loading/BackdropLoading';

import { updateVerifyEmail } from '../../../redux/authSlice';

import { getUserInfo } from '../../../redux/userSlice';

import authService from '../../../services/authService';

import JobSeekerSignUpForm from '../../components/auths/JobSeekerSignUpForm';

import { useAppDispatch } from '../../../hooks/useAppStore';

import type { RoleName, AuthProvider } from '../../../types/auth';

import type { AxiosError } from 'axios';

import tokenService from '../../../services/tokenService';



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

  backgroundColor: theme.palette.primary.main,

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

const JobSeekerSignUp = () => {

  const { t } = useTranslation('auth');

  TabTitle(t('signup.jobSeekerTitle'));

  const dispatch = useAppDispatch();

  const nav = useNavigate();

  const [isFullScreenLoading, setIsFullScreenLoading] = React.useState(false);

  const [serverErrors, setServerErrors] = React.useState<Record<string, string[]>>({});

  const handleRegister = (data: any) => {

    const register = async (data: any, roleName: RoleName) => {

      setIsFullScreenLoading(true);

      try {

        await authService.jobSeekerRegister(data);

        dispatch(

          updateVerifyEmail({

            isAllowVerifyEmail: true,

            email: data?.email,

            roleName: roleName,

          })

        );

        nav(`/${ROUTES.AUTH.EMAIL_VERIFICATION}`);

      } catch (error) {

        const axiosError = error as AxiosError<any>;
        const res = axiosError?.response;
        const errors = res?.data?.errors;
        const hasEmailExists = !!errors?.email;
        if (res?.status === 400 && hasEmailExists) {
          try {
            const resData = await authService.checkCreds(data?.email, ROLES_NAME.JOB_SEEKER as RoleName) as any;
            if (resData?.exists === true && resData?.email_verified === false) {
              dispatch(
                updateVerifyEmail({
                  isAllowVerifyEmail: true,
                  email: data?.email,
                  roleName: ROLES_NAME.JOB_SEEKER as RoleName,
                })
              );
              nav(`/${ROUTES.AUTH.EMAIL_VERIFICATION}`);
              return;
            }
          } catch {
            // fall through to default error handling
          }
        }

        errorHandling(axiosError, setServerErrors as (errors: Record<string, unknown>) => void);

      } finally {

        setIsFullScreenLoading(false);

      }

    };

    register({ ...data, platform: PLATFORM }, ROLES_NAME.JOB_SEEKER as RoleName);

  };

  const handleSocialRegister = async (

    clientId: string,

    clientSecrect: string,

    provider: AuthProvider,

    token: string

  ) => {
    const redirectUri = window.location.origin;

    setIsFullScreenLoading(true);

    try {

      const resData = await authService.convertToken(

        clientId,

        clientSecrect,

        provider,

        token,
        redirectUri

      ) as any;

      const {

        access_token: accessToken,

        refresh_token: refreshToken,

        backend,

      } = resData;

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

            nav('/');

          })

          .catch(() => {

            errorHandling({ response: null } as unknown as AxiosError<any>);

          });

      }

    } catch (error) {

      errorHandling(error as AxiosError<any>);

    } finally {

      setIsFullScreenLoading(false);

    }

  };

  const handleFacebookRegister = (result: any) => {

    const accessToken = result?.data?.accessToken;

    if (accessToken) {

      handleSocialRegister(

        AUTH_CONFIG.CLIENT_ID,

        AUTH_CONFIG.CLIENT_SECRET,

        AUTH_PROVIDER.FACEBOOK as AuthProvider,

        accessToken

      );

    }

  };

  const handleGoogleRegister = (result: any) => {

    const code = result?.code;

    if (code) {

      handleSocialRegister(

        AUTH_CONFIG.CLIENT_ID,

        AUTH_CONFIG.CLIENT_SECRET,

        AUTH_PROVIDER.GOOGLE as AuthProvider,

        code

      );

    }

  };

  const checkCreds = async (email: string, roleName: RoleName) => {

    try {

      const resData = await authService.checkCreds(email, roleName) as any;

      const { exists, email_verified } = resData;

      if (exists === true && email_verified === false) {
        dispatch(
          updateVerifyEmail({
            isAllowVerifyEmail: true,
            email: email,
            roleName: roleName,
          })
        );
        nav(`/${ROUTES.AUTH.EMAIL_VERIFICATION}`);
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

      errorHandling(error as AxiosError<any>);

      return false;

    }

  };

  return (

    <>

      <Container

        maxWidth="md"

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

              {t('signup.heading')}

            </Typography>

            <Typography

              variant="subtitle1"

              align="center"

              sx={{

                color: 'text.secondary',

                mb: 2

              }}

            >

              {t('signup.jobSeekerSubtitle')}

            </Typography>

          </Box>

          <Box sx={{ mt: 2 }}>

            <JobSeekerSignUpForm

              onRegister={handleRegister}

              onFacebookRegister={handleFacebookRegister}

              onGoogleRegister={handleGoogleRegister}

              serverErrors={serverErrors}

              checkCreds={checkCreds}

            />

          </Box>

          <Grid

            container

            sx={{

              mt: 4,

              justifyContent: 'center',

              alignItems: 'center'

            }}

          >

            <Grid>

              <StyledLink to={`/${ROUTES.AUTH.LOGIN}`}>

                {t('signup.haveAccount')} {t('signup.signIn')}

              </StyledLink>

            </Grid>

          </Grid>

        </StyledCard>

      </Container>

      {isFullScreenLoading && <BackdropLoading />}

    </>

  );

};

export default JobSeekerSignUp;
