/*

MyJob Recruitment System - Part of MyJob Platform

Author: Bui Khanh Huy

Email: khuy220@gmail.com

Copyright (c) 2023 Bui Khanh Huy

License: MIT License

See the LICENSE file in the project root for full license information.
*/

import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import { useForm } from 'react-hook-form';

import { yupResolver } from '@hookform/resolvers/yup';

import * as yup from 'yup';

import Grid from "@mui/material/Grid2";

import TextFieldCustom from '../../../../components/controls/TextFieldCustom';

const AccountForm = ({ handleUpdate, serverErrors }) => {
  const { t } = useTranslation('auth');
  const { currentUser } = useSelector((state) => state.user);

  const schema = yup.object().shape({
    fullName: yup
      .string()
      .required(t('validation.requiredFullName'))
      .max(100, t('validation.maxFullName')),
  });

  const { control, reset, setError, handleSubmit } = useForm({

    resolver: yupResolver(schema),

  });

  React.useEffect(() => {

    reset((formValues) => ({

      ...formValues,

      fullName: currentUser?.fullName,

      email: currentUser?.email,

      password: '*****************',

    }));

  }, [currentUser, reset]);

  // show server errors

  React.useEffect(() => {

    if (serverErrors !== null)

      for (let err in serverErrors) {

        setError(err, {

          type: 400,

          message: serverErrors[err]?.join(' '),

        });

      }

    else {

      setError();

    }

  }, [serverErrors, setError]);

  return (
    <form id="account-form" onSubmit={handleSubmit(handleUpdate)}>
      <Grid container spacing={2}>

        <Grid size={12}>

          <TextFieldCustom
            name="fullName"
            title={t('form.fullName')}
            showRequired={true}
            placeholder={t('form.fullNamePlaceholder')}
            control={control}
          />

        </Grid>

        <Grid size={12}>

          <TextFieldCustom
            name="email"
            title={t('form.email')}
            showRequired={true}
            placeholder={t('form.emailPlaceholder')}
            control={control}
            disabled={true}
          />

        </Grid>

        <Grid size={12}>

          <TextFieldCustom
            name="password"
            title={t('form.password')}
            showRequired={true}
            placeholder={t('form.passwordPlaceholder')}
            control={control}
            disabled={true}
          />

        </Grid>

      </Grid>
    </form>
  );

};

export default AccountForm;

