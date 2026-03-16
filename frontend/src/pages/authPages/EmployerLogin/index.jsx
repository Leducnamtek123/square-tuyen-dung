import * as React from 'react';

import { useDispatch } from 'react-redux';

import { Link, useNavigate, useSearchParams } from 'react-router-dom';

import { Alert, AlertTitle, Avatar, Box, Card, Container, Typography, styled } from "@mui/material";

import Grid from "@mui/material/Grid2";

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

import BackdropLoading from '../../../components/loading/BackdropLoading';

import { updateVerifyEmail } from '../../../redux/authSlice';

import { getUserInfo } from '../../../redux/userSlice';

import EmployerLoginForm from '../../components/auths/EmployerLoginForm';

import authService from '../../../services/authService';

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

const EmployerLogin = () => {

  const { t } = useTranslation('auth');

  TabTitle(t('login.employerTitle'));

  const dispatch = useDispatch();

  const nav = useNavigate();

  const [searchParams] = useSearchParams();

  const [isFullScreenLoading, setIsFullScreenLoading] = React.useState(false);

  const [errorMessage, setErrorMessage] = React.useState(null);

  const [successMessage, setSuccessMessage] = React.useState(null);

  React.useEffect(() => {

    const successMsg = searchParams.get('successMessage');

    const errorMsg = searchParams.get('errorMessage');

    if (successMsg !== null) {

      setSuccessMessage(successMsg);

    }

    setErrorMessage(errorMsg);

  }, [searchParams]);

  const handleLogin = (data) => {

    const getAccesToken = async (email, password, roleName) => {

      setIsFullScreenLoading(true);

      try {

        const resData = await authService.getToken(email, password, roleName);

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

              toastMessages.error(t('messages.loginError'));

            });

        } else {

          toastMessages.error(t('messages.loginError'));

        }

      } catch (error) {

        const res = error?.response;

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

    const checkCreds = async (email, password, roleName) => {

      setIsFullScreenLoading(true);

      try {

        const resData = await authService.checkCreds(email, roleName);

        const { exists, email: resEmail, email_verified } = resData;

        if (exists === true && email_verified === false) {

          dispatch(

            updateVerifyEmail({

              isAllowVerifyEmail: true,

              email: email,

              roleName: roleName,

            })

          );

          nav(`/${ROUTES.AUTH.EMAIL_VERIFICATION}`);

          return;

        } else if (exists === false) {

          setErrorMessage(t('messages.noEmployerAccount'));

          return;

        }

        getAccesToken(resEmail, password, roleName);

      } catch (error) {

        toastMessages.error(t('messages.loginError'));

      } finally {

        setIsFullScreenLoading(false);

      }

    };

    checkCreds(data.email, data.password, ROLES_NAME.EMPLOYER);

  };

  const handleSocialLogin = async (

    clientId,

    clientSecrect,

    provider,

    token

  ) => {

    setIsFullScreenLoading(true);

    try {

      const resData = await authService.convertToken(

        clientId,

        clientSecrect,

        provider,

        token

      );

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

            toastMessages.error(t('messages.loginError'));

          });

      } else {

        toastMessages.error(t('messages.loginError'));

      }

    } catch (error) {

      const res = error?.response;

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

              <StyledLink to={`/${ROUTES.AUTH.FORGOT_PASSWORD}`}>

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

              <StyledLink to={`/${ROUTES.AUTH.REGISTER}`}>

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

export default EmployerLogin;
