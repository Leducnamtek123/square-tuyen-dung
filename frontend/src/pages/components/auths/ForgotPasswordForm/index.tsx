import React from 'react';

import { useForm } from 'react-hook-form';

import { yupResolver } from '@hookform/resolvers/yup';

import * as yup from 'yup';

import { Box, Button, Stack } from "@mui/material";

import { useTranslation } from 'react-i18next';

import TextFieldCustom from '../../../../components/controls/TextFieldCustom';

interface ForgotPasswordFormData {
  email: string;
}

interface ForgotPasswordFormProps {
  handleRequestResetPassword: (data: ForgotPasswordFormData) => void;
}



const ForgotPasswordForm = ({ handleRequestResetPassword }: ForgotPasswordFormProps) => {

  const { t } = useTranslation('auth');

  const schema = yup.object().shape({

    email: yup

      .string()

      .required(t('validation.requiredEmail'))

      .email(t('validation.invalidEmail')),

  });

  const { control, handleSubmit } = useForm<ForgotPasswordFormData>({

    defaultValues: {

      email: '',

    },

    resolver: yupResolver(schema),

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

      <Button fullWidth variant="contained" sx={{ mt: 3, mb: 2 }} type="submit">

        {t('forgotPassword.send')}

      </Button>

    </Box>

  );

};

export default ForgotPasswordForm;
