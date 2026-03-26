import React, { useState, useEffect } from 'react';
import { Box, Button, Stack, styled, TextField, Typography, Alert } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { setupRecaptcha, signInWithPhone, verifyCode } from '../../../../services/firebaseService';
import PhoneIcon from '@mui/icons-material/Phone';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import type { ConfirmationResult } from 'firebase/auth';

const StyledButton = styled(Button)(({ theme }) => ({
  padding: '12px 16px',
  borderRadius: '8px',
  fontSize: '14px',
  fontWeight: 600,
  textTransform: 'none',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: 'translateY(-1px)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
  },
}));

interface PhoneOTPLoginFormProps {
  onLogin: (idToken: string) => void;
  isLoading?: boolean;
}

const PhoneOTPLoginForm = ({ onLogin, isLoading }: PhoneOTPLoginFormProps) => {
  const { t } = useTranslation('auth');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleSendOTP = async () => {
    try {
      setError(null);
      const appVerifier = setupRecaptcha('recaptcha-container');
      const result = await signInWithPhone(phoneNumber, appVerifier);
      setConfirmationResult(result);
      setResendTimer(60);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to send OTP');
    }
  };

  const handleVerifyOTP = async () => {
    if (!confirmationResult) return;
    try {
      setError(null);
      const idToken = await verifyCode(confirmationResult, otpCode);
      onLogin(idToken);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Invalid OTP code');
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: '8px' }}>
          {error}
        </Alert>
      )}

      {!confirmationResult ? (
        <Stack spacing={2}>
          <Typography variant="body2" color="text.secondary">
            {t('login.phoneIntro', 'Nhập số điện thoại của bạn để nhận mã xác thực.')}
          </Typography>
          <TextField
            fullWidth
            label={t('form.phoneNumber', 'Số điện thoại')}
            placeholder="+84..."
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            disabled={isLoading}
            variant="outlined"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '10px',
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
              },
            }}
          />
          <StyledButton
            fullWidth
            variant="contained"
            onClick={handleSendOTP}
            disabled={!phoneNumber || isLoading}
            startIcon={<PhoneIcon />}
          >
            {t('actions.sendOTP', 'Gửi mã OTP')}
          </StyledButton>
          <Box id="recaptcha-container" sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}></Box>
        </Stack>
      ) : (
        <Stack spacing={2}>
          <Typography variant="body2" color="text.secondary">
            {t('login.otpIntro', 'Nhập mã 6 chữ số đã được gửi đến điện thoại của bạn.')}
          </Typography>
          <TextField
            fullWidth
            label={t('form.otpCode', 'Mã OTP')}
            placeholder="123456"
            value={otpCode}
            onChange={(e) => setOtpCode(e.target.value)}
            disabled={isLoading}
            variant="outlined"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '10px',
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
              },
            }}
          />
          <StyledButton
            fullWidth
            variant="contained"
            onClick={handleVerifyOTP}
            disabled={otpCode.length < 6 || isLoading}
            startIcon={<VerifiedUserIcon />}
          >
            {t('actions.verifyOTP', 'Xác thực & Đăng nhập')}
          </StyledButton>
          <Button
            fullWidth
            variant="text"
            onClick={() => setConfirmationResult(null)}
            disabled={isLoading}
            size="small"
          >
            {t('actions.changePhone', 'Thay đổi số điện thoại')}
          </Button>
          {resendTimer > 0 ? (
            <Typography variant="caption" align="center" display="block">
              {t('login.resendIn', 'Gửi lại sau')} {resendTimer}s
            </Typography>
          ) : (
            <Button
              fullWidth
              variant="text"
              onClick={handleSendOTP}
              disabled={isLoading}
              size="small"
            >
              {t('actions.resendOTP', 'Gửi lại mã')}
            </Button>
          )}
        </Stack>
      )}
    </Box>
  );
};

export default PhoneOTPLoginForm;
