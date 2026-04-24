'use client';
import * as React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Alert, AlertTitle, Card, Container, Typography } from "@mui/material";
import { useTranslation } from 'react-i18next';
import { TabTitle } from '../../../utils/generalFunction';
import ResetPasswordForm from '../../components/auths/ResetPasswordForm';
import authService from '../../../services/authService';
import { ROUTES } from '../../../configs/constants';
import type { AxiosError } from 'axios';
import type { ResetPasswordFormData } from '../../components/auths/ResetPasswordForm';



const ResetPasswordPage = () => {

  const { t } = useTranslation('auth');

  TabTitle(t('resetPassword.pageTitle'));

  const { token } = useParams();

  const navigate = useRouter();

  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const handleResetPassword = async (data: ResetPasswordFormData) => {
    try {
      await authService.resetPassword({
        token,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
        platform: 'WEB'
      });
      navigate.push(`/${ROUTES.AUTH.LOGIN}?successMessage=Password updated successfully`);
    } catch (error) {
      setErrorMessage(t('messages.tryAgain') as string);
    }
  };

  return (

    <Container maxWidth="sm" sx={{ mt: 6 }}>

      <Card sx={{ p: 4 }}>

        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>

          {t('resetPassword.heading')}

        </Typography>

        <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3 }}>

          {t('resetPassword.pageTitle')}

        </Typography>

        {errorMessage && (

          <Alert severity="error" sx={{ mb: 3 }}>

            <AlertTitle>{t('login.errorTitle')}</AlertTitle>

            {errorMessage}

          </Alert>

        )}

        <ResetPasswordForm handleResetPassword={handleResetPassword} />

      </Card>

    </Container>

  );

};

export default ResetPasswordPage;
