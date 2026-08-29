import React from 'react';
import { Stack } from '@mui/material';
import TextFieldCustom from '../../../../components/Common/Controls/TextFieldCustom';
import PasswordTextFieldCustom from '../../../../components/Common/Controls/PasswordTextFieldCustom';
import type { Control } from 'react-hook-form';
import type { JobSeekerSignUpFormData } from './types';

type Props = {
  control: Control<JobSeekerSignUpFormData>;
  t: (key: string, options?: Record<string, unknown>) => string;
};

const inputSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    backgroundColor: '#F8FAFC',
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: '#F1F5F9',
    },
    '&.Mui-focused': {
      backgroundColor: '#FFFFFF',
    },
    '& input:-webkit-autofill': {
      WebkitBoxShadow: '0 0 0 1000px #F8FAFC inset !important',
      WebkitTextFillColor: '#0F172A !important',
      borderRadius: 'inherit',
    },
    '&.Mui-focused input:-webkit-autofill': {
      WebkitBoxShadow: '0 0 0 1000px #FFFFFF inset !important',
    },
  },
};

const JobSeekerSignUpFormFields = ({ control, t }: Props) => (
  <Stack spacing={2.5} sx={{ mb: 3 }}>
    <TextFieldCustom
      name="fullName"
      control={control}
      title={t('form.fullName')}
      placeholder={t('form.fullNamePlaceholder')}
      showRequired={true}
      sx={inputSx}
    />
    <TextFieldCustom
      name="email"
      control={control}
      title={t('form.email')}
      placeholder={t('form.emailPlaceholder')}
      showRequired={true}
      sx={inputSx}
    />
    <PasswordTextFieldCustom
      name="password"
      control={control}
      title={t('form.password')}
      placeholder={t('form.passwordPlaceholder')}
      showRequired={true}
      sx={inputSx}
    />
    <PasswordTextFieldCustom
      name="confirmPassword"
      control={control}
      title={t('form.confirmPassword')}
      placeholder={t('form.confirmPasswordPlaceholder')}
      showRequired={true}
      sx={inputSx}
    />
  </Stack>
);

export default JobSeekerSignUpFormFields;
