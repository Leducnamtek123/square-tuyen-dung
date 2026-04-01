import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Alert, AlertTitle, Box, Card, Container, Typography } from "@mui/material";
import { useTranslation } from 'react-i18next';
import { TabTitle } from '../../../utils/generalFunction';
import ForgotPasswordForm from '../../components/auths/ForgotPasswordForm';
import authService from '../../../services/authService';
import type { AxiosError } from 'axios';



const ForgotPasswordPage = () => {

  const { t } = useTranslation('auth');

  TabTitle(t('forgotPassword.pageTitle'));

  const navigate = useRouter();

  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const handleRequestResetPassword = async (data: { email: string }) => {
    try {
      await authService.forgotPassword({ email: data.email, platform: 'WEB' });
      setSuccessMessage(t('forgotPassword.success', { email: data?.email }));
    } catch (error) {
      setErrorMessage(t('messages.tryAgain'));
    }
  };

  return (

    <Container maxWidth="sm" sx={{ mt: 6 }}>

      <Card sx={{ p: 4 }}>

        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>

          {t('forgotPassword.heading')}

        </Typography>

        <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3 }}>

          {t('forgotPassword.body')}

        </Typography>

        {successMessage && (

          <Alert severity="success" sx={{ mb: 3 }}>

            <AlertTitle>{t('login.successTitle')}</AlertTitle>

            {successMessage}

          </Alert>

        )}

        {errorMessage && (

          <Alert severity="error" sx={{ mb: 3 }}>

            <AlertTitle>{t('login.errorTitle')}</AlertTitle>

            {errorMessage}

          </Alert>

        )}

        <ForgotPasswordForm handleRequestResetPassword={handleRequestResetPassword} />

        <Typography variant="caption" sx={{ display: 'block', mt: 2, color: 'text.secondary' }}>

          {t('forgotPassword.noteSpam')}

        </Typography>

      </Card>

    </Container>

  );

};

export default ForgotPasswordPage;
