import React from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Grid2 as Grid } from "@mui/material";
import TextFieldCustom from '../../../../components/Common/Controls/TextFieldCustom';
import { useAppSelector } from '../../../../redux/hooks';
import type { Resolver as ReactHookFormResolver } from 'react-hook-form';
import type { RootState } from '../../../../redux/store';

interface AccountFormData {
  fullName: string;
  email?: string;
  password?: string;
}

interface AccountFormProps {
  handleUpdate: (data: AccountFormData) => void;
  serverErrors: Record<string, string[]> | null;
}

const AccountForm = ({ handleUpdate, serverErrors }: AccountFormProps) => {

  const { t } = useTranslation('auth');

  const { currentUser } = useAppSelector((state: RootState) => state.user);

  const schema = yup.object().shape({

    fullName: yup

      .string()

      .required(t('validation.requiredFullName'))

      .max(100, t('validation.maxFullName')),

  });

  const { control, reset, setError, handleSubmit } = useForm<AccountFormData>({

    resolver: yupResolver(schema) as ReactHookFormResolver<AccountFormData>,

  });

  React.useEffect(() => {

    reset((formValues) => ({

      ...formValues,

      fullName: currentUser?.fullName || '',

      email: currentUser?.email,

      password: '*****************',

    }));

  }, [currentUser, reset]);

  // show server errors

  React.useEffect(() => {

    if (serverErrors !== null) {

      for (const err in serverErrors) {

        setError(err as keyof AccountFormData, {

          type: 'manual',

          message: serverErrors[err]?.join(' '),

        });

      }

    } else {
      // Clear all errors if serverErrors is null
      reset(undefined, { keepValues: true });
    }

  }, [serverErrors, setError, reset]);

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
