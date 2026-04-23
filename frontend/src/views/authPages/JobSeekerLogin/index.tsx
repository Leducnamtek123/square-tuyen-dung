import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { TabTitle } from '../../../utils/generalFunction';
import {
  AUTH_CONFIG,
  AUTH_PROVIDER,
  ROLES_NAME,
  ROUTES,
} from '../../../configs/constants';
import toastMessages from '../../../utils/toastMessages';
import { updateVerifyEmail } from '../../../redux/authSlice';
import { getUserInfo } from '../../../redux/userSlice';
import authService from '../../../services/authService';
import tokenService from '../../../services/tokenService';
import { useAppDispatch } from '../../../hooks/useAppStore';
import type { RoleName, AuthProvider } from '../../../types/auth';
import type { AxiosError } from 'axios';
import JobSeekerLoginView from './JobSeekerLoginView';

type LoginErrorPayload = {
  errors?: {
    errorMessage?: string[];
    token?: string[];
  };
};

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

    if (successMsg !== null) setSuccessMessage(successMsg);
    setErrorMessage(errorMsg);
  }, [searchParams]);

  const navigateHome = async () => {
    await dispatch(getUserInfo()).unwrap();
    nav.push('/');
  };

  const handleLogin = (data: { email: string; password?: string }) => {
    const run = async () => {
      setIsFullScreenLoading(true);
      try {
        const resData = await authService.checkCreds(data.email, ROLES_NAME.JOB_SEEKER as RoleName);
        const { exists, email: resEmail, emailVerified } = resData;

        if (exists === true && emailVerified === false) {
          dispatch(
            updateVerifyEmail({
              isAllowVerifyEmail: true,
              email: data.email,
              roleName: ROLES_NAME.JOB_SEEKER as RoleName,
            }),
          );
          nav.push(`/${ROUTES.AUTH.EMAIL_VERIFICATION}`);
          return;
        }

        if (exists === false) {
          setErrorMessage(t('messages.noCandidateAccount'));
          return;
        }

        const tokenData = await authService.getToken(resEmail, data.password || '', ROLES_NAME.JOB_SEEKER as RoleName);
        const { accessToken, refreshToken, backend } = tokenData;
        const saved = tokenService.saveAccessTokenAndRefreshTokenToCookie(accessToken, refreshToken, backend);

        if (saved) {
          await navigateHome();
        } else {
          toastMessages.error(t('messages.loginError'));
        }
      } catch (error) {
        const axiosError = error as AxiosError<LoginErrorPayload>;
        const res = axiosError?.response;

        if (res?.status === 400) {
          const errors = res?.data?.errors;
          if (errors?.errorMessage) {
            setErrorMessage(errors.errorMessage.join(' '));
          } else {
            toastMessages.error(t('messages.tryAgain'));
          }
        }
      } finally {
        setIsFullScreenLoading(false);
      }
    };

    void run();
  };

  const handleSocialLogin = async (clientId: string, clientSecrect: string, provider: AuthProvider, token: string) => {
    const redirectUri = typeof window !== 'undefined' ? window.location.origin : '';
    setIsFullScreenLoading(true);

    try {
      const resData = await authService.convertToken(clientId, clientSecrect, provider, token, redirectUri);
      const { accessToken, refreshToken, backend } = resData;
      const saved = tokenService.saveAccessTokenAndRefreshTokenToCookie(accessToken, refreshToken, backend);
      if (saved) {
        await navigateHome();
      } else {
        toastMessages.error(t('messages.loginError'));
      }
    } catch (error) {
      const axiosError = error as AxiosError<LoginErrorPayload>;
      const res = axiosError?.response;
      if (res?.status === 400) {
        const errors = res?.data?.errors;
        if (errors?.errorMessage) {
          setErrorMessage(errors.errorMessage.join(' '));
        } else {
          toastMessages.error(t('messages.tryAgain'));
        }
      }
    } finally {
      setIsFullScreenLoading(false);
    }
  };

  const handleGoogleLogin = (result: { code?: string }) => {
    if (!result?.code) return;
    void handleSocialLogin(
      AUTH_CONFIG.CLIENT_ID || '',
      AUTH_CONFIG.CLIENT_SECRET || '',
      AUTH_PROVIDER.GOOGLE as AuthProvider,
      result.code,
    );
  };

  const handleFirebaseLogin = async (idToken: string) => {
    setIsFullScreenLoading(true);
    try {
      const resData = await authService.firebaseLogin(idToken, ROLES_NAME.JOB_SEEKER as RoleName);
      const { accessToken, refreshToken, backend } = resData;
      const saved = tokenService.saveAccessTokenAndRefreshTokenToCookie(accessToken, refreshToken, backend);
      if (saved) {
        await navigateHome();
      } else {
        toastMessages.error(t('messages.loginError'));
      }
    } catch (error) {
      const axiosError = error as AxiosError<LoginErrorPayload>;
      const res = axiosError?.response;
      if (res?.status === 400) {
        const errors = res?.data?.errors;
        if (errors?.errorMessage) {
          setErrorMessage(errors.errorMessage.join(' '));
        } else if (errors?.token) {
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
    <JobSeekerLoginView
      title={t('login.heading')}
      errorMessage={errorMessage}
      successMessage={successMessage}
      loginMode={loginMode}
      isFullScreenLoading={isFullScreenLoading}
      onSetLoginMode={setLoginMode}
      onLogin={handleLogin}
      onGoogleLogin={handleGoogleLogin}
      onFirebaseLogin={handleFirebaseLogin}
      t={t}
    />
  );
};

export default JobSeekerLogin;
