'use client';
import * as React from 'react';

import { useRouter } from 'next/navigation';

import { useTranslation } from 'react-i18next';

import { TabTitle } from '../../../utils/generalFunction';

import { PLATFORM, ROLES_NAME, ROUTES, AUTH_CONFIG, AUTH_PROVIDER } from '../../../configs/constants';

import errorHandling from '../../../utils/errorHandling';

import { updateVerifyEmail } from '../../../redux/authSlice';

import { getUserInfo } from '../../../redux/userSlice';

import authService from '../../../services/authService';

import JobSeekerSignUpForm from '../../components/auths/JobSeekerSignUpForm';

import { useAppDispatch } from '../../../hooks/useAppStore';

import type { RoleName, AuthProvider } from '../../../types/auth';

import type { AxiosError } from 'axios';

import tokenService from '../../../services/tokenService';

import { JobSeekerSignUpFormData } from '../../components/auths/JobSeekerSignUpForm';
import type { JobSeekerRegisterData } from '../../../types/auth';
import type { CodeResponse } from '@react-oauth/google';
import JobSeekerSignUpView from './JobSeekerSignUpView';

type RegisterErrorPayload = {
  errors?: {
    email?: string[];
    errorMessage?: string[];
  };
};



const JobSeekerSignUp = () => {

  const { t } = useTranslation('auth');

  TabTitle(t('signup.jobSeekerTitle'));

  const dispatch = useAppDispatch();

  const { push } = useRouter();

  const [isFullScreenLoading, setIsFullScreenLoading] = React.useState(false);

  const [serverErrors, setServerErrors] = React.useState<Record<string, string[]>>({});

  const handleRegister = (data: JobSeekerSignUpFormData) => {

    const register = async (payload: JobSeekerRegisterData, roleName: RoleName) => {

      setIsFullScreenLoading(true);

      try {

        await authService.jobSeekerRegister(payload);

        dispatch(

          updateVerifyEmail({

            isAllowVerifyEmail: true,

            email: payload?.email as string,

            roleName: roleName,

          })

        );

        push(`/${ROUTES.AUTH.EMAIL_VERIFICATION}`);

      } catch (error) {

        const axiosError = error as AxiosError<RegisterErrorPayload>;
        const res = axiosError?.response;
        const errors = res?.data?.errors;
        const hasEmailExists = !!errors?.email;
        if (res?.status === 400 && hasEmailExists) {
          try {
            const resData = await authService.checkCreds(data?.email, ROLES_NAME.JOB_SEEKER as RoleName);
            if (resData?.exists === true && resData?.emailVerified === false) {
              dispatch(
                updateVerifyEmail({
                  isAllowVerifyEmail: true,
                  email: data?.email,
                  roleName: ROLES_NAME.JOB_SEEKER as RoleName,
                })
              );
              push(`/${ROUTES.AUTH.EMAIL_VERIFICATION}`);
              return;
            }
          } catch {
            // fall through to default error handling
          }
        }

        errorHandling(axiosError, (errs) => setServerErrors(errs as Record<string, string[]>));

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
    const redirectUri = (typeof window !== 'undefined' ? window.location.origin : '');

    setIsFullScreenLoading(true);

    try {

      const resData = (await authService.convertToken(

        clientId,

        clientSecrect,

        provider,

        token,
        redirectUri,
        ROLES_NAME.JOB_SEEKER as RoleName

      ));

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

            push('/');

          })

          .catch(() => {

            errorHandling(new Error('Login error'));

          });

      }

    } catch (error) {

      errorHandling(error);

    } finally {

      setIsFullScreenLoading(false);

    }

  };

  const handleFacebookRegister = (result: { data?: { accessToken?: string } }) => {
    const accessToken = result?.data?.accessToken;

    if (accessToken) {

      handleSocialRegister(

        AUTH_CONFIG.CLIENT_ID || '',

        AUTH_CONFIG.CLIENT_SECRET || '',

        AUTH_PROVIDER.FACEBOOK as AuthProvider,

        accessToken

      );

    }

  };

  const handleGoogleRegister = (result: Omit<CodeResponse, "error" | "error_description" | "error_uri">) => {
    const code = result?.code;

    if (code) {

      handleSocialRegister(

        AUTH_CONFIG.CLIENT_ID || '',

        AUTH_CONFIG.CLIENT_SECRET || '',

        AUTH_PROVIDER.GOOGLE as AuthProvider,

        code

      );

    }

  };

  const checkCreds = async (email: string, roleName: RoleName) => {

    try {

      const resData = await authService.checkCreds(email, roleName);

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

  return (
    <JobSeekerSignUpView
      t={t}
      serverErrors={serverErrors}
      isFullScreenLoading={isFullScreenLoading}
      onRegister={handleRegister}
      onFacebookRegister={handleFacebookRegister}
      onGoogleRegister={handleGoogleRegister}
      checkCreds={checkCreds}
    />
  );

};

export default JobSeekerSignUp;

