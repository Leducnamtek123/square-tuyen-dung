import * as React from 'react';
import Link from 'next/link';
import { Avatar, Box, Card, Container, Typography, Grid2 as Grid, styled } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import BackdropLoading from '../../../components/Common/Loading/BackdropLoading';
import JobSeekerSignUpForm from '../../components/auths/JobSeekerSignUpForm';
import { ROUTES } from '../../../configs/constants';
import type { TFunction } from 'i18next';
import type { AuthProvider, RoleName } from '../../../types/auth';
import type { CodeResponse } from '@react-oauth/google';

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
        <StyledCard
          sx={{
            p: { xs: 2, sm: 4, md: 5 },
            width: '100%',
            borderRadius: { xs: 0, sm: '16px' },
            boxShadow: { xs: 'none', sm: '0 8px 32px rgba(0, 0, 0, 0.1)' },
          }}
        >
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

            <Typography component="h1" variant="h4" align="center" sx={{ fontWeight: 600, color: 'primary.main', mb: 1 }}>
              {t('signup.heading')}
            </Typography>

            <Typography variant="subtitle1" align="center" sx={{ color: 'text.secondary', mb: 2 }}>
              {t('signup.jobSeekerSubtitle')}
            </Typography>
          </Box>

          <Box sx={{ mt: 2 }}>
            <JobSeekerSignUpForm
              onRegister={onRegister}
              onFacebookRegister={onFacebookRegister}
              onGoogleRegister={onGoogleRegister}
              serverErrors={serverErrors}
              checkCreds={checkCreds}
            />
          </Box>

          <Grid
            container
            sx={{
              mt: 4,
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
        </StyledCard>
      </Container>

      {isFullScreenLoading && <BackdropLoading />}
    </>
  );
};

export default JobSeekerSignUpView;
