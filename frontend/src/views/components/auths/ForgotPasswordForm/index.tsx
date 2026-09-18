'use client';
import React from 'react';

import { useForm } from 'react-hook-form';

import { typedYupResolver } from '@/utils/formHelpers';

import * as yup from 'yup';

import { Box, Button, Stack } from "@mui/material";

import { useTranslation } from 'react-i18next';

import TextFieldCustom from '@/components/Common/Controls/TextFieldCustom';

interface ForgotPasswordFormData {
  email: string;
}

interface ForgotPasswordFormProps {
  handleRequestResetPassword: (data: ForgotPasswordFormData) => void;
}
type ForgotPasswordT = ReturnType<typeof useTranslation>['t'];

export const createForgotPasswordSchema = (t: ForgotPasswordT) =>
  yup.object().shape({
    email: yup
      .string()
      .required(t('validation.requiredEmail'))
      .email(t('validation.invalidEmail'))
      .max(100, t('validation.maxEmail')),
  });



const ForgotPasswordForm = ({ handleRequestResetPassword }: ForgotPasswordFormProps) => {

  const { t } = useTranslation('auth');

  const schema = React.useMemo(() => createForgotPasswordSchema(t), [t]);

  const { control, handleSubmit } = useForm<ForgotPasswordFormData>({

    defaultValues: {

      email: '',

    },

    resolver: typedYupResolver(schema),

  });

  return (

    <Box component="form" onSubmit={handleSubmit(handleRequestResetPassword)}>

      <Stack spacing={1.5} sx={{ mb: 2 }}>

        <TextFieldCustom

          name="email"

          control={control}

          title={t('form.email')}

          showRequired={true}

          placeholder={t('form.emailPlaceholder')}

        />

      </Stack>

      <Button
        fullWidth
        variant="contained"
        type="submit"
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
        {t('forgotPassword.send')}
      </Button>

    </Box>

  );

};

export default ForgotPasswordForm;
