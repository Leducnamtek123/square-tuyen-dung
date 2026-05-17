import React from 'react';
import { Alert, Box, Button, Stack, styled, TextField, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { setupRecaptcha, signInWithPhone, verifyCode } from '../../../../services/firebaseService';
import PhoneIcon from '@mui/icons-material/Phone';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import type { ConfirmationResult } from 'firebase/auth';
import type { CountryCode } from 'libphonenumber-js';
import CountryPhoneInput from './CountryPhoneInput';
import { DEFAULT_PHONE_COUNTRY, toE164PhoneNumber } from './phoneNumberUtils';

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

type PhoneOTPLoginFormState = {
  countryCode: CountryCode;
  phoneNumber: string;
  otpCode: string;
  confirmationResult: ConfirmationResult | null;
  error: string | null;
  resendTimer: number;
};

type PhoneOTPLoginFormAction =
  | { type: 'set-country-code'; value: CountryCode }
  | { type: 'set-phone-number'; value: string }
  | { type: 'set-otp-code'; value: string }
  | { type: 'set-confirmation-result'; value: ConfirmationResult | null }
  | { type: 'set-error'; value: string | null }
  | { type: 'set-resend-timer'; value: number }
  | { type: 'tick-resend-timer' };

const initialState: PhoneOTPLoginFormState = {
  countryCode: DEFAULT_PHONE_COUNTRY,
  phoneNumber: '',
  otpCode: '',
  confirmationResult: null,
  error: null,
  resendTimer: 0,
};

const reducer = (
  state: PhoneOTPLoginFormState,
  action: PhoneOTPLoginFormAction
): PhoneOTPLoginFormState => {
  switch (action.type) {
    case 'set-country-code':
      return { ...state, countryCode: action.value };
    case 'set-phone-number':
      return { ...state, phoneNumber: action.value };
    case 'set-otp-code':
      return { ...state, otpCode: action.value };
    case 'set-confirmation-result':
      return { ...state, confirmationResult: action.value };
    case 'set-error':
      return { ...state, error: action.value };
    case 'set-resend-timer':
      return { ...state, resendTimer: action.value };
    case 'tick-resend-timer':
      return { ...state, resendTimer: Math.max(0, state.resendTimer - 1) };
    default:
      return state;
  }
};

interface PhoneOTPLoginFormProps {
  onLogin: (idToken: string) => void;
  isLoading?: boolean;
}

const PhoneOTPLoginForm = ({ onLogin, isLoading }: PhoneOTPLoginFormProps) => {
  const { t } = useTranslation('auth');
  const [state, dispatch] = React.useReducer(reducer, initialState);
  const normalizedPhoneNumber = React.useMemo(
    () => toE164PhoneNumber(state.phoneNumber, state.countryCode),
    [state.countryCode, state.phoneNumber]
  );

  React.useEffect(() => {
    if (state.resendTimer <= 0) {
      return;
    }

    const interval = setInterval(() => {
      dispatch({ type: 'tick-resend-timer' });
    }, 1000);

    return () => clearInterval(interval);
  }, [state.resendTimer]);

  const handleSendOTP = async () => {
    if (!normalizedPhoneNumber) {
      dispatch({
        type: 'set-error',
        value: t('login.phoneInvalid', { defaultValue: 'Số điện thoại không hợp lệ.' }),
      });
      return;
    }

    try {
      dispatch({ type: 'set-error', value: null });
      const appVerifier = setupRecaptcha('recaptcha-container');
      const result = await signInWithPhone(normalizedPhoneNumber, appVerifier);
      dispatch({ type: 'set-confirmation-result', value: result });
      dispatch({ type: 'set-resend-timer', value: 60 });
    } catch (err: unknown) {
      console.error(err);
      dispatch({ type: 'set-error', value: (err as Error).message || t('login.phoneSendFailed') });
    }
  };

  const handleVerifyOTP = async () => {
    if (!state.confirmationResult) return;
    try {
      dispatch({ type: 'set-error', value: null });
      const idToken = await verifyCode(state.confirmationResult, state.otpCode);
      onLogin(idToken);
    } catch (err: unknown) {
      console.error(err);
      dispatch({ type: 'set-error', value: (err as Error).message || t('login.invalidOtpCode') });
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      {state.error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: '8px' }}>
          {state.error}
        </Alert>
      )}

      {!state.confirmationResult ? (
        <Stack spacing={2}>
          <Typography variant="body2" color="text.secondary">
            {t('login.phoneIntro')}
          </Typography>
          <CountryPhoneInput
            countryCode={state.countryCode}
            label={t('form.phoneNumber')}
            value={state.phoneNumber}
            disabled={isLoading}
            onCountryCodeChange={(countryCode) => dispatch({ type: 'set-country-code', value: countryCode })}
            onValueChange={(value) => dispatch({ type: 'set-phone-number', value })}
          />
          <StyledButton
            fullWidth
            variant="contained"
            onClick={handleSendOTP}
            disabled={!normalizedPhoneNumber || isLoading}
            startIcon={<PhoneIcon />}
          >
            {t('actions.sendOTP')}
          </StyledButton>
          <Box id="recaptcha-container" sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}></Box>
        </Stack>
      ) : (
        <Stack spacing={2}>
          <Typography variant="body2" color="text.secondary">
            {t('login.otpIntro')}
          </Typography>
          <TextField
            fullWidth
            label={t('form.otpCode')}
            placeholder="123456"
            value={state.otpCode}
            onChange={(e) => dispatch({ type: 'set-otp-code', value: e.target.value })}
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
            disabled={state.otpCode.length < 6 || isLoading}
            startIcon={<VerifiedUserIcon />}
          >
            {t('actions.verifyOTP', 'Xác thực & Đăng nhập')}
          </StyledButton>
          <Button
            fullWidth
            variant="text"
            onClick={() => dispatch({ type: 'set-confirmation-result', value: null })}
            disabled={isLoading}
            size="small"
          >
            {t('actions.changePhone', 'Thay đổi số điện thoại')}
          </Button>
          {state.resendTimer > 0 ? (
            <Typography variant="caption" align="center" display="block">
              {t('login.resendIn', 'Gửi lại sau')} {state.resendTimer}s
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
