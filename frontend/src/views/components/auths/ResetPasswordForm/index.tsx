'use client';
import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Box, Button, Stack } from "@mui/material";
import { useTranslation } from 'react-i18next';
import PasswordTextFieldCustom from '@/components/Common/Controls/PasswordTextFieldCustom';
import type { Resolver as ReactHookFormResolver } from 'react-hook-form';

export interface ResetPasswordFormData {
  newPassword: string;
  confirmPassword: string;
}

interface ResetPasswordFormProps {
  handleResetPassword: (data: ResetPasswordFormData) => void;
  serverErrors?: Record<string, string[]>;
}

const EMPTY_SERVER_ERRORS: Record<string, string[]> = {};


const ResetPasswordForm = ({ handleResetPassword, serverErrors = EMPTY_SERVER_ERRORS }: ResetPasswordFormProps) => {

  const { t } = useTranslation('auth');

  const schema = yup.object().shape({

    newPassword: yup

      .string()

      .required(t('validation.requiredPassword'))

      .min(8, t('validation.passwordMin'))

      .max(128, t('validation.passwordMax'))

      .matches(

        /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/,

        t('validation.passwordRule')

      ),

    confirmPassword: yup

      .string()

      .required(t('validation.requiredConfirmPassword'))

      .oneOf([yup.ref('newPassword')], t('validation.confirmPasswordMatch')),

  });

  const { control, setError, handleSubmit } = useForm<ResetPasswordFormData>({
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    },
    resolver: yupResolver(schema) as ReactHookFormResolver<ResetPasswordFormData>,
  });

  React.useEffect(() => {
    for (const err in serverErrors) {
      setError(err as keyof ResetPasswordFormData, { type: 'manual', message: serverErrors[err]?.join(' ') });
    }
  }, [serverErrors, setError]);

  return (

    <Box>

      <Stack spacing={1.5} sx={{ mb: 2 }}>

        <PasswordTextFieldCustom

          name="newPassword"

          control={control}

          title={t('form.newPassword')}

          showRequired={true}

          placeholder={t('form.newPasswordPlaceholder')}

        />

        <PasswordTextFieldCustom

          name="confirmPassword"

          control={control}

          title={t('form.confirmPassword')}

          showRequired={true}

          placeholder={t('form.confirmPasswordPlaceholder')}

        />

      </Stack>

      <Button
        fullWidth
        variant="contained"
        type="submit"
        onClick={handleSubmit(handleResetPassword)}
        sx={{
          minHeight: '48px',
          mt: 3,
          mb: 1,
          borderRadius: '14px',
          fontSize: '15px',
          fontWeight: 700,
          textTransform: 'none',
          color: '#ffffff',
          background: 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 50%, #0284C7 100%)',
          boxShadow: '0 4px 14px rgba(37, 99, 235, 0.25)',
          transition: 'all 0.2s ease',
          '&:hover': {
            background: 'linear-gradient(135deg, #172554 0%, #1D4ED8 50%, #0369A1 100%)',
            transform: 'translateY(-1px)',
            boxShadow: '0 8px 20px rgba(37, 99, 235, 0.35)',
          },
          '&:active': {
            transform: 'scale(0.98)',
          },
        }}
      >
        {t('resetPassword.submit')}
      </Button>

    </Box>

  );

};

export default ResetPasswordForm;
