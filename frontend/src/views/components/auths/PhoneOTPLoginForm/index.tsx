import React from 'react';
import { Alert, Box, Button, Stack, styled, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { setupRecaptcha, signInWithPhone, verifyCode } from '../../../../services/firebaseService';
import PhoneIcon from '@mui/icons-material/Phone';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import type { ConfirmationResult, RecaptchaVerifier } from 'firebase/auth';
import type { CountryCode } from 'libphonenumber-js';
import CountryPhoneInput from './CountryPhoneInput';
import { DEFAULT_PHONE_COUNTRY, toE164PhoneNumber } from './phoneNumberUtils';

const RECAPTCHA_CONTAINER_ID = 'recaptcha-container';
const OTP_CODE_LENGTH = 6;
const OTP_INPUT_KEYS = Array.from({ length: OTP_CODE_LENGTH }, (_, index) => `otp-input-${index + 1}`);

const getFirebaseAuthErrorMessage = (
  error: unknown,
  t: ReturnType<typeof useTranslation<'auth'>>['t']
): string => {
  const firebaseError = error as { code?: string; message?: string };

  switch (firebaseError.code) {
    case 'auth/operation-not-allowed':
      return t('login.phoneProviderDisabled', {
        defaultValue:
          'Phone sign-in is not enabled for this Firebase project, or SMS is blocked by the Firebase SMS region policy.',
      });
    case 'auth/billing-not-enabled':
      return t('login.phoneBillingNotEnabled', {
        defaultValue:
          'Firebase requires Cloud Billing for real SMS phone sign-in. For testing, use a Firebase test phone number and fixed OTP code.',
      });
    case 'auth/too-many-requests':
      return t('login.phoneTooManyRequests', {
        defaultValue: 'Too many OTP requests. Please try again later.',
      });
    case 'auth/unauthorized-domain':
      return t('login.unauthorizedDomain', {
        defaultValue: 'This domain is not authorized for Firebase Authentication.',
      });
    default:
      return firebaseError.message || t('login.phoneSendFailed');
  }
};

type OtpCodeInputProps = {
  value: string;
  disabled?: boolean;
  label: string;
  onChange: (value: string) => void;
  onEnter: () => void;
};

const OtpCodeInput = ({ value, disabled, label, onChange, onEnter }: OtpCodeInputProps) => {
  const inputRefs = React.useRef<Array<HTMLInputElement | null>>([]);
  const digits = Array.from({ length: OTP_CODE_LENGTH }, (_, index) => value[index] || '');

  const focusInput = React.useCallback((index: number) => {
    requestAnimationFrame(() => inputRefs.current[index]?.focus());
  }, []);

  const applyValue = React.useCallback(
    (nextValue: string) => {
      onChange(nextValue.replace(/\D/g, '').slice(0, OTP_CODE_LENGTH));
    },
    [onChange]
  );

  const handleChange = (index: number, rawValue: string) => {
    const nextDigits = rawValue.replace(/\D/g, '');

    if (!nextDigits) {
      applyValue(value.slice(0, index) + value.slice(index + 1));
      return;
    }

    if (nextDigits.length > 1) {
      const slots = value.padEnd(OTP_CODE_LENGTH, ' ').slice(0, OTP_CODE_LENGTH).split('');
      nextDigits
        .slice(0, OTP_CODE_LENGTH - index)
        .split('')
        .forEach((digit, offset) => {
          slots[index + offset] = digit;
        });
      applyValue(slots.join(''));
      focusInput(Math.min(index + nextDigits.length, OTP_CODE_LENGTH - 1));
      return;
    }

    applyValue(value.slice(0, index) + nextDigits + value.slice(index + 1));
    if (index < OTP_CODE_LENGTH - 1) {
      focusInput(index + 1);
    }
  };

  const handleKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      if (value.length === OTP_CODE_LENGTH) {
        onEnter();
      }
      return;
    }

    if (event.key === 'ArrowLeft' && index > 0) {
      event.preventDefault();
      focusInput(index - 1);
      return;
    }

    if (event.key === 'ArrowRight' && index < OTP_CODE_LENGTH - 1) {
      event.preventDefault();
      focusInput(index + 1);
      return;
    }

    if (event.key === 'Backspace') {
      event.preventDefault();
      if (digits[index]) {
        applyValue(value.slice(0, index) + value.slice(index + 1));
      } else if (index > 0) {
        focusInput(index - 1);
      }
    }
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedCode = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_CODE_LENGTH);
    if (!pastedCode) {
      return;
    }

    event.preventDefault();
    applyValue(pastedCode);
    focusInput(Math.min(pastedCode.length, OTP_CODE_LENGTH - 1));
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, width: '100%' }}>
      {OTP_INPUT_KEYS.map((inputKey, index) => (
        <Box
          key={inputKey}
          component="input"
          ref={(element: HTMLInputElement | null) => {
            inputRefs.current[index] = element;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? 'one-time-code' : 'off'}
          aria-label={`${label} ${index + 1}`}
          value={digits[index]}
          disabled={disabled}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => handleChange(index, event.target.value)}
          onKeyDown={(event: React.KeyboardEvent<HTMLInputElement>) => handleKeyDown(index, event)}
          onPaste={handlePaste}
          sx={{
            width: { xs: 42, sm: 52 },
            height: 52,
            maxWidth: 'calc((100% - 40px) / 6)',
            border: '1px solid',
            borderColor: 'rgba(36, 74, 143, 0.28)',
            borderRadius: '10px',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            color: 'primary.main',
            fontSize: 22,
            fontWeight: 700,
            lineHeight: 1,
            outline: 'none',
            textAlign: 'center',
            transition: 'border-color 0.16s ease, box-shadow 0.16s ease, background-color 0.16s ease',
            '&:focus': {
              borderColor: 'primary.main',
              boxShadow: '0 0 0 3px rgba(36, 74, 143, 0.14)',
              backgroundColor: '#fff',
            },
            '&:disabled': {
              color: 'text.disabled',
              backgroundColor: 'action.disabledBackground',
            },
          }}
        />
      ))}
    </Box>
  );
};

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
  const recaptchaVerifierRef = React.useRef<RecaptchaVerifier | null>(null);
  const normalizedPhoneNumber = React.useMemo(
    () => toE164PhoneNumber(state.phoneNumber, state.countryCode),
    [state.countryCode, state.phoneNumber]
  );

  const resetRecaptcha = React.useCallback(() => {
    recaptchaVerifierRef.current?.clear();
    recaptchaVerifierRef.current = null;
  }, []);

  React.useEffect(() => resetRecaptcha, [resetRecaptcha]);

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
      resetRecaptcha();
      const appVerifier = setupRecaptcha(RECAPTCHA_CONTAINER_ID);
      recaptchaVerifierRef.current = appVerifier;
      const result = await signInWithPhone(normalizedPhoneNumber, appVerifier);
      dispatch({ type: 'set-confirmation-result', value: result });
      dispatch({ type: 'set-resend-timer', value: 60 });
    } catch (err: unknown) {
      console.error(err);
      resetRecaptcha();
      dispatch({ type: 'set-error', value: getFirebaseAuthErrorMessage(err, t) });
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
          <Box id={RECAPTCHA_CONTAINER_ID} sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}></Box>
        </Stack>
      ) : (
        <Stack spacing={2}>
          <Typography variant="body2" color="text.secondary">
            {t('login.otpIntro')}
          </Typography>
          <OtpCodeInput
            label={t('form.otpCode')}
            value={state.otpCode}
            disabled={isLoading}
            onChange={(value) => dispatch({ type: 'set-otp-code', value })}
            onEnter={handleVerifyOTP}
          />
          <StyledButton
            fullWidth
            variant="contained"
            onClick={handleVerifyOTP}
            disabled={state.otpCode.length !== OTP_CODE_LENGTH || isLoading}
            startIcon={<VerifiedUserIcon />}
          >
            {t('actions.verifyOTP', 'Xác thực & Đăng nhập')}
          </StyledButton>
          <Button
            fullWidth
            variant="text"
            onClick={() => {
              resetRecaptcha();
              dispatch({ type: 'set-confirmation-result', value: null });
              dispatch({ type: 'set-otp-code', value: '' });
            }}
            disabled={isLoading}
            size="small"
          >
            {t('actions.changePhone', 'Thay đổi số điện thoại')}
          </Button>
          {state.resendTimer > 0 ? (
            <Typography variant="caption" align="center" display="block">
              {t('login.resendIn', {
                seconds: state.resendTimer,
                defaultValue: `Gửi lại sau ${state.resendTimer}s`,
              })}
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
          <Box id={RECAPTCHA_CONTAINER_ID} sx={{ mt: 1, display: 'flex', justifyContent: 'center' }}></Box>
        </Stack>
      )}
    </Box>
  );
};

export default PhoneOTPLoginForm;
