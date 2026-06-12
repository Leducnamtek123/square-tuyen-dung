'use client';
import React from 'react';
import { useForm } from 'react-hook-form';
import { typedYupResolver } from '../../../../utils/formHelpers';
import * as yup from 'yup';
import { Box } from '@mui/material';
import { useGoogleLogin } from '@react-oauth/google';
import { useTranslation } from 'react-i18next';
import type { RoleName } from '../../../../types/auth';
import type { CodeResponse } from '@react-oauth/google';
import JobSeekerSignUpFormFields from './JobSeekerSignUpFormFields';
import JobSeekerSignUpSocialButtons from './JobSeekerSignUpSocialButtons';

export interface JobSeekerSignUpFormData {
  fullName: string;
  email: string;
  password?: string;
  confirmPassword?: string;
}

type FacebookAuthResult = { data?: { accessToken?: string } };

interface JobSeekerSignUpFormProps {
  onRegister: (data: JobSeekerSignUpFormData) => void;
  onFacebookRegister: (result: FacebookAuthResult) => void;
  onGoogleRegister: (result: Omit<CodeResponse, 'error' | 'error_description' | 'error_uri'>) => void;
  serverErrors?: Record<string, string[]>;
  checkCreds?: (email: string, roleName: RoleName) => Promise<boolean>;
}

const EMPTY_SERVER_ERRORS: Record<string, string[]> = {};
type JobSeekerSignUpT = ReturnType<typeof useTranslation>['t'];

export const createJobSeekerSignUpSchema = (t: JobSeekerSignUpT) =>
  yup.object().shape({
    fullName: yup.string().required(t('validation.requiredFullName')).max(100, t('validation.maxFullName')),
    email: yup
      .string()
      .required(t('validation.requiredEmail'))
      .email(t('validation.invalidEmail'))
      .max(100, t('validation.maxEmail')),
    password: yup
      .string()
      .required(t('validation.requiredPassword'))
      .min(8, t('validation.passwordMin'))
      .max(128, t('validation.passwordMax'))
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/, t('validation.passwordRule')),
    confirmPassword: yup
      .string()
      .required(t('validation.requiredConfirmPassword'))
      .oneOf([yup.ref('password')], t('validation.confirmPasswordMatch')),
  });

const JobSeekerSignUpForm = ({
  onRegister,
  onFacebookRegister,
  onGoogleRegister,
  serverErrors = EMPTY_SERVER_ERRORS,
  checkCreds,
}: JobSeekerSignUpFormProps) => {
  const { t } = useTranslation('auth');

  const schema = React.useMemo(() => createJobSeekerSignUpSchema(t), [t]);

  const { control, setError, clearErrors, handleSubmit } = useForm<JobSeekerSignUpFormData>({
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    resolver: typedYupResolver(schema),
  });

  React.useEffect(() => {
    for (const err in serverErrors) {
      setError(err as keyof JobSeekerSignUpFormData, { type: 'manual', message: serverErrors[err]?.join(' ') });
    }
  }, [serverErrors, setError]);


  const googleRegister = useGoogleLogin({
    onSuccess: onGoogleRegister,
    flow: 'auth-code',
    ux_mode: 'popup',
    redirect_uri: typeof window !== 'undefined' ? window.location.origin : '',
  });

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onRegister)}

      sx={{
        width: '100%',
        '& .MuiTextField-root': {
          borderRadius: '10px',
        },
      }}
    >
      <JobSeekerSignUpFormFields control={control} t={t} />

      <JobSeekerSignUpSocialButtons
        onSubmitLabel={t('actions.signUp')}
        socialLabel={t('social.orSignUpWith')}
        googleLabel={t('auto.index_google_8b36', 'Google')}
        onGoogleClick={() => googleRegister()}
      />
    </Box>
  );
};

export default JobSeekerSignUpForm;
