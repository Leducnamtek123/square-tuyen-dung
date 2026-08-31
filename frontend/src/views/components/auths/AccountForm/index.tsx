'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Grid2 as Grid } from "@mui/material";
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import TextFieldCustom from '@/components/Common/Controls/TextFieldCustom';
import { useAppSelector } from '@/redux/hooks';
import type { Resolver as ReactHookFormResolver } from 'react-hook-form';
import type { RootState } from '@/redux/store';
import pc from '@/utils/muiColors';

interface AccountFormData {
  fullName: string;
  email?: string;
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
      email: currentUser?.email || '',
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
      reset(undefined, { keepValues: true });
    }
  }, [serverErrors, setError, reset]);

  const inputSx = {
    '& .MuiOutlinedInput-root': {
      minHeight: 44,
      borderRadius: 2,
      backgroundColor: 'background.paper',
      transition: 'background-color 0.2s ease, border-color 0.2s ease',
      '& fieldset': { borderColor: pc.divider(0.95) },
      '&:hover': { backgroundColor: pc.bgDefault(0.45) },
      '&:hover fieldset': { borderColor: pc.primary(0.35) },
      '&.Mui-focused fieldset': {
        borderColor: 'primary.main',
        borderWidth: 1,
      },
    },
    '& .MuiInputBase-input': {
      fontSize: '0.875rem',
      py: '10px',
    },
  };

  return (
    <form id="account-form" onSubmit={handleSubmit(handleUpdate)}>
      <Grid container spacing={2.5}>
        <Grid size={12}>
          <TextFieldCustom
            name="fullName"
            title={t('form.fullName')}
            showRequired={true}
            placeholder={t('form.fullNamePlaceholder')}
            control={control}
            icon={<PersonOutlineOutlinedIcon sx={{ fontSize: 18, color: '#64748b' }} />}
            sx={inputSx}
          />
        </Grid>

        <Grid size={12}>
          <TextFieldCustom
            name="email"
            title={t('form.email')}
            placeholder={t('form.emailPlaceholder')}
            control={control}
            disabled={true}
            icon={<EmailOutlinedIcon sx={{ fontSize: 18, color: '#94a3b8' }} />}
            helperText="Địa chỉ email đăng nhập được cố định bởi hệ thống bảo mật"
            sx={inputSx}
          />
        </Grid>
      </Grid>
    </form>
  );
};

export default AccountForm;
