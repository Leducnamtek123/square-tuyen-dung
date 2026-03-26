import * as React from 'react';

import { Box, Button, Card, Container, Typography } from "@mui/material";

import { useTranslation } from 'react-i18next';

import { TabTitle } from '../../../utils/generalFunction';

import BackdropLoading from '../../../components/Common/Loading/BackdropLoading';

import authService from '../../../services/authService';

import toastMessages from '../../../utils/toastMessages';

import { useAppSelector } from '../../../hooks/useAppStore';

const EmailVerificationRequiredPage = () => {

  const { t } = useTranslation('auth');

  TabTitle(t('verification.pageTitle'));

  const { email } = useAppSelector((state) => state.auth);

  const [isFullScreenLoading, setIsFullScreenLoading] = React.useState(false);

  const handleResendEmail = async () => {

    setIsFullScreenLoading(true);

    try {

      await authService.sendVerifyEmail(email);

      toastMessages.success(t('login.successTitle'));

    } catch (error) {

      toastMessages.error(t('messages.tryAgain'));

    } finally {

      setIsFullScreenLoading(false);

    }

  };

  return (

    <>

      <Container maxWidth="sm" sx={{ mt: 6 }}>

        <Card sx={{ p: 4 }}>

          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>

            {t('verification.heading')}

          </Typography>

          <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3 }}>

            {t('verification.subheading')}

          </Typography>

          <Typography variant="body2" sx={{ mb: 1 }}>

            {t('verification.emailSentTo')}

          </Typography>

          <Typography variant="body1" sx={{ fontWeight: 600, mb: 2 }}>

            {email}

          </Typography>

          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>

            {t('verification.instruction')}

          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>

            <Typography variant="body2">{t('verification.noEmail')}</Typography>

            <Button variant="outlined" onClick={handleResendEmail}>

              {t('verification.resend')}

            </Button>

          </Box>

        </Card>

      </Container>

      {isFullScreenLoading && <BackdropLoading />}

    </>

  );

};

export default EmailVerificationRequiredPage;
