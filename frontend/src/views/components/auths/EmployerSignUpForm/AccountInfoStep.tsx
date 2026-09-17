import React from 'react';
import { Stack } from "@mui/material";
import TextFieldCustom from '@/components/Common/Controls/TextFieldCustom';
import PasswordTextFieldCustom from '@/components/Common/Controls/PasswordTextFieldCustom';

import type { Control } from 'react-hook-form';
import type { TFunction } from 'i18next';
import type { EmployerSignUpFormData } from './types';

interface AccountInfoStepProps {
  control: Control<EmployerSignUpFormData>;
  t: TFunction<string | string[], undefined>;
  show: boolean;
}

const inputStyle = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    backgroundColor: '#FFFFFF',
    border: '1px solid #E2E8F0',
    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
    '&:hover': {
      borderColor: '#94A3B8',
      backgroundColor: '#FFFFFF',
    },
    '&.Mui-focused': {
      borderColor: '#2563EB',
      backgroundColor: '#FFFFFF',
      boxShadow: '0 0 0 3px rgba(37, 99, 235, 0.12)',
    },
    '& input:-webkit-autofill, & input:-webkit-autofill:hover, & input:-webkit-autofill:focus, & input:-webkit-autofill:active': {
      WebkitBoxShadow: '0 0 0 1000px #FFFFFF inset !important',
      WebkitTextFillColor: '#0F172A !important',
      caretColor: '#0F172A',
      transition: 'background-color 5000s ease-in-out 0s',
      borderRadius: 'inherit',
    },
  },
};

const AccountInfoStep: React.FC<AccountInfoStepProps> = ({ control, t, show }) => {
  return (
    <Stack
      spacing={2.5}
      sx={{ mb: 2, display: show ? 'flex' : 'none' }}
    >
      <TextFieldCustom
        name="fullName"
        control={control}
        title={t('form.fullName')}
        placeholder={t('form.fullNamePlaceholder')}
        showRequired={true}
        sx={inputStyle}
      />
      <TextFieldCustom
        name="phone"
        control={control}
        title={t('form.phone')}
        placeholder={t('form.phonePlaceholder')}
        showRequired={true}
        sx={inputStyle}
      />
      <TextFieldCustom
        name="email"
        control={control}
        title={t('form.email')}
        placeholder={t('form.emailPlaceholder')}
        showRequired={true}
        sx={inputStyle}
      />
      <PasswordTextFieldCustom
        name="password"
        control={control}
        title={t('form.password')}
        placeholder={t('form.passwordPlaceholder')}
        showRequired={true}
        sx={inputStyle}
      />
      <PasswordTextFieldCustom
        name="confirmPassword"
        control={control}
        title={t('form.confirmPassword')}
        placeholder={t('form.confirmPasswordPlaceholder')}
        showRequired={true}
        sx={inputStyle}
      />
    </Stack>
  );
};

export default AccountInfoStep;
