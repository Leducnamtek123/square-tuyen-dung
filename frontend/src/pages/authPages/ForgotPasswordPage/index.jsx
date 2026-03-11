/*
MyJob Recruitment System - Part of MyJob Platform

Author: Bui Khanh Huy
Email: khuy220@gmail.com
Copyright (c) 2023 Bui Khanh Huy

License: MIT License
See the LICENSE file in the project root for full license information.
*/

import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, AlertTitle, Box, Card, Container, Typography } from "@mui/material";

import { useTranslation } from 'react-i18next';

import { TabTitle } from '../../../utils/generalFunction';
import toastMessages from '../../../utils/toastMessages';
import ForgotPasswordForm from '../../components/auths/ForgotPasswordForm';
import authService from '../../../services/authService';

const ForgotPasswordPage = () => {
  const { t } = useTranslation('auth');
  TabTitle(t('forgotPassword.pageTitle'));
  const navigate = useNavigate();

  const [successMessage, setSuccessMessage] = React.useState(null);
  const [errorMessage, setErrorMessage] = React.useState(null);

  const handleRequestResetPassword = async (data) => {
    try {
      await authService.resetPassword(data.email);
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
