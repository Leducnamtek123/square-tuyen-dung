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
import Grid from "@mui/material/Grid2";

import { useTranslation } from 'react-i18next';

import PasswordTextFieldCustom from '../../../../components/controls/PasswordTextFieldCustom';

const UpdatePasswordForm = ({ handleUpdatePassword, serverErrors = {} }) => {
  const { t } = useTranslation('auth');
  const schema = yup.object().shape({
    oldPassword: yup
      .string()
      .required(t('validation.requiredPassword'))
      .max(128, t('validation.passwordMax')),
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
      oldPassword: '',
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
    <form id="modal-form" onSubmit={handleSubmit(handleUpdatePassword)}>
      <Grid container spacing={2}>
        <Grid size={12}>
          <PasswordTextFieldCustom
            name="oldPassword"
            control={control}
            title={t('form.oldPassword')}
            showRequired={true}
            placeholder={t('form.oldPasswordPlaceholder')}
          />
        </Grid>
        <Grid size={12}>
          <PasswordTextFieldCustom
            name="newPassword"
            control={control}
            title={t('form.newPassword')}
            showRequired={true}
            placeholder={t('form.newPasswordPlaceholder')}
          />
        </Grid>
        <Grid size={12}>
          <PasswordTextFieldCustom
            name="confirmPassword"
            control={control}
            title={t('form.confirmPassword')}
            showRequired={true}
            placeholder={t('form.confirmPasswordPlaceholder')}
          />
        </Grid>
      </Grid>
    </form>
  );
};

export default UpdatePasswordForm;
