/*

MyJob Recruitment System - Part of MyJob Platform

Author: Bui Khanh Huy
Email: khuy220@gmail.com
Copyright (c) 2023 Bui Khanh Huy

License: MIT License
See the LICENSE file in the project root for full license information.
*/

import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Box, Button, Stack } from "@mui/material";

import { useTranslation } from 'react-i18next';

import PasswordTextFieldCustom from '../../../../components/controls/PasswordTextFieldCustom';

const ResetPasswordForm = ({ handleResetPassword, serverErrors = {} }) => {
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

  const { control, setError, handleSubmit } = useForm({
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    },
    resolver: yupResolver(schema),
  });

  React.useEffect(() => {
    for (let err in serverErrors) {
      setError(err, { type: 400, message: serverErrors[err]?.join(' ') });
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
        sx={{ mt: 3, mb: 2 }}
        onClick={handleSubmit(handleResetPassword)}
      >
        {t('resetPassword.submit')}
      </Button>
    </Box>
  );
};

export default ResetPasswordForm;
