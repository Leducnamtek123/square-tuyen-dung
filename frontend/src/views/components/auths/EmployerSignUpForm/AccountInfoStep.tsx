import React from 'react';
import { Stack } from "@mui/material";
import TextFieldCustom from '../../../../components/controls/TextFieldCustom';
import PasswordTextFieldCustom from '../../../../components/controls/PasswordTextFieldCustom';

interface AccountInfoStepProps {
  control: any;
  t: any;
  show: boolean;
}

const AccountInfoStep: React.FC<AccountInfoStepProps> = ({ control, t, show }) => {
  return (
    <Stack
      spacing={2.5}
      sx={{ mb: 2, display: show ? 'block' : 'none' }}
    >
      <TextFieldCustom
        name="fullName"
        control={control}
        title={t('form.fullName')}
        placeholder={t('form.fullNamePlaceholder')}
        showRequired={true}
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: '10px',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
          }
        }}
      />
      <TextFieldCustom
        name="email"
        control={control}
        title={t('form.email')}
        placeholder={t('form.emailPlaceholder')}
        showRequired={true}
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: '10px',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
          }
        }}
      />
      <PasswordTextFieldCustom
        name="password"
        control={control}
        title={t('form.password')}
        placeholder={t('form.passwordPlaceholder')}
        showRequired={true}
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: '10px',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
          }
        }}
      />
      <PasswordTextFieldCustom
        name="confirmPassword"
        control={control}
        title={t('form.confirmPassword')}
        placeholder={t('form.confirmPasswordPlaceholder')}
        showRequired={true}
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: '10px',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
          }
        }}
      />
    </Stack>
  );
};

export default AccountInfoStep;
