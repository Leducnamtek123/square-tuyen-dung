'use client';
import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Box, Button, Card, Container, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { TabTitle } from '../../../utils/generalFunction';
import BackdropLoading from '../../../components/Common/Loading/BackdropLoading';
import authService from '../../../services/authService';
import toastMessages from '../../../utils/toastMessages';
import { useAppSelector } from '../../../hooks/useAppStore';
import { getSafeRedirectPath } from '../../../utils/safeExternalUrl';

const RESEND_EMAIL_COOLDOWN_MS = 2500;

const EmailVerificationRequiredPage = () => {
  const router = useRouter();
  const { t } = useTranslation('auth');

  TabTitle(t('verification.pageTitle'));

  const { email } = useAppSelector((state) => state.auth);

  const [isFullScreenLoading, setIsFullScreenLoading] = React.useState(false);
  const resendInFlightRef = React.useRef(false);
  const lastResendAttemptAtRef = React.useRef(0);
  const redirectTriggeredRef = React.useRef(false);

  const checkVerificationStatus = React.useCallback(
    async (showLoading = false) => {
      const normalizedEmail = String(email || '').trim();
      if (!normalizedEmail || redirectTriggeredRef.current) return;

      if (showLoading) setIsFullScreenLoading(true);

      try {
        const res: any = await authService.sendVerifyEmail(normalizedEmail);
        const isVerified = res?.data?.emailVerified || res?.emailVerified;
        if (isVerified && !redirectTriggeredRef.current) {
          redirectTriggeredRef.current = true;
          toastMessages.success(t('verification.activatedSuccess'));
          router.push(getSafeRedirectPath('/dang-nhap'));
        }
      } catch (error) {
        // Silent catch for auto-check
      } finally {
        if (showLoading) setIsFullScreenLoading(false);
      }
    },
    [email, router, t]
  );

  React.useEffect(() => {
    if (!email) return;

    // Check status on mount
    checkVerificationStatus(false);

    // Auto-check when switching back to this tab
    const handleFocus = () => {
      checkVerificationStatus(false);
    };
    window.addEventListener('focus', handleFocus);

    // Periodic auto-check every 4 seconds
    const intervalId = setInterval(() => {
      checkVerificationStatus(false);
    }, 4000);

    return () => {
      window.removeEventListener('focus', handleFocus);
      clearInterval(intervalId);
    };
  }, [email, checkVerificationStatus]);

  const handleResendEmail = async () => {
    const normalizedEmail = String(email || '').trim();
    const now = Date.now();

    if (
      !normalizedEmail ||
      resendInFlightRef.current ||
      now - lastResendAttemptAtRef.current < RESEND_EMAIL_COOLDOWN_MS
    ) {
      return;
    }

    lastResendAttemptAtRef.current = now;
    resendInFlightRef.current = true;
    setIsFullScreenLoading(true);

    try {
      const res: any = await authService.sendVerifyEmail(normalizedEmail);
      const isVerified = res?.data?.emailVerified || res?.emailVerified;

      if (isVerified) {
        redirectTriggeredRef.current = true;
        toastMessages.success(t('verification.activatedSuccess'));
        router.push(getSafeRedirectPath('/dang-nhap'));
        return;
      }

      toastMessages.success(t('login.successTitle'));
    } catch (error) {
      toastMessages.error(t('messages.tryAgain'));
    } finally {
      setIsFullScreenLoading(false);
      resendInFlightRef.current = false;
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

            <Button
              variant="outlined"
              onClick={handleResendEmail}
              disabled={isFullScreenLoading || !String(email || '').trim()}
            >
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
