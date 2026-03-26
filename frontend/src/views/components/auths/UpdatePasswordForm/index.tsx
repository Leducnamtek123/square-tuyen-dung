import React from 'react';

import { useForm } from 'react-hook-form';

import { yupResolver } from '@hookform/resolvers/yup';

import * as yup from 'yup';

import Grid from "@mui/material/Grid2";

import { useTranslation } from 'react-i18next';

import PasswordTextFieldCustom from '../../../../components/Common/Controls/PasswordTextFieldCustom';

interface UpdatePasswordFormData {
  oldPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

interface UpdatePasswordFormProps {
  handleUpdatePassword: (data: UpdatePasswordFormData) => void;
  serverErrors?: Record<string, string[]>;
}



const UpdatePasswordForm = ({ handleUpdatePassword, serverErrors = {} }: UpdatePasswordFormProps) => {

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

  const { control, setError, handleSubmit } = useForm<UpdatePasswordFormData>({
    defaultValues: {
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    resolver: yupResolver(schema) as any,
  });

  React.useEffect(() => {

    for (const err in serverErrors) {
      setError(err as any, { type: 'manual', message: serverErrors[err]?.join(' ') });
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
