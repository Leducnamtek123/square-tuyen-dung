import * as React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Avatar, Box, Card, Container, Typography, styled } from "@mui/material";
import { Grid2 as Grid } from "@mui/material";
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { useTranslation } from 'react-i18next';
import { TabTitle } from '../../../utils/generalFunction';
import { PLATFORM, ROLES_NAME, ROUTES } from '../../../configs/constants';
import errorHandling from '../../../utils/errorHandling';
import BackdropLoading from '../../../components/Common/Loading/BackdropLoading';
import { updateVerifyEmail } from '../../../redux/authSlice';
import authService from '../../../services/authService';
import EmployerSignUpForm, { EmployerSignUpFormData } from '../../components/auths/EmployerSignUpForm';
import { useAppDispatch } from '../../../hooks/useAppStore';
import type { RoleName } from '../../../types/auth';
import type { AxiosError } from 'axios';
import type { ApiError } from '../../../types/api';
import type { EmployerRegisterData } from '../../../types/auth';



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

const EmployerSignUp = () => {

  const { t } = useTranslation('auth');

  TabTitle(t('signup.employerTitle'));

  const dispatch = useAppDispatch();

  const nav = useRouter();

  const [isFullScreenLoading, setIsFullScreenLoading] = React.useState(false);

  const [serverErrors, setServerErrors] = React.useState<Record<string, string[]>>({});

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

        nav.push(`/${ROUTES.AUTH.EMAIL_VERIFICATION}`);

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
              nav.push(`/${ROUTES.AUTH.EMAIL_VERIFICATION}`);
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
        nav.push(`/${ROUTES.AUTH.EMAIL_VERIFICATION}`);
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

              {t('signup.employerSubtitle')}

            </Typography>

          </Box>

          <Box sx={{ mt: 2 }}>

            <EmployerSignUpForm

              onSignUp={handleRegister}

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

              <StyledLink href={`/${ROUTES.AUTH.LOGIN}`}>

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

export default EmployerSignUp;
