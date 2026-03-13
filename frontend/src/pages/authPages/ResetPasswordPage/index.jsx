import * as React from 'react';

import { useNavigate, useParams } from 'react-router-dom';

import { Alert, AlertTitle, Card, Container, Typography } from "@mui/material";

import { useTranslation } from 'react-i18next';

import { TabTitle } from '../../../utils/generalFunction';

import toastMessages from '../../../utils/toastMessages';

import ResetPasswordForm from '../../components/auths/ResetPasswordForm';

import authService from '../../../services/authService';

const ResetPasswordPage = () => {

  const { t } = useTranslation('auth');

  TabTitle(t('resetPassword.pageTitle'));

  const { token } = useParams();

  const navigate = useNavigate();

  const [errorMessage, setErrorMessage] = React.useState(null);

  const handleResetPassword = async (data) => {

    try {

      await authService.updatePassword(token, data.newPassword, data.confirmPassword);

      navigate('/dang-nhap?successMessage=Password updated successfully');

    } catch (error) {

      setErrorMessage(t('messages.tryAgain'));

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
