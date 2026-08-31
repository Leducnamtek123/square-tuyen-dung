'use client';
import * as React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Box,
  Button,
  Card,
  Container,
  Typography,
  Stack,
  Chip,
  IconButton,
  Tooltip,
  Divider,
  Collapse,
  Alert,
  CircularProgress,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { useTranslation } from 'react-i18next';

// Icons
import MarkEmailReadOutlinedIcon from '@mui/icons-material/MarkEmailReadOutlined';
import OpenInNewOutlinedIcon from '@mui/icons-material/OpenInNewOutlined';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined';
import ForwardToInboxOutlinedIcon from '@mui/icons-material/ForwardToInboxOutlined';
import ExpandMoreOutlinedIcon from '@mui/icons-material/ExpandMoreOutlined';
import ExpandLessOutlinedIcon from '@mui/icons-material/ExpandLessOutlined';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import KeyOutlinedIcon from '@mui/icons-material/KeyOutlined';

import { TabTitle } from '@/utils/generalFunction';
import BackdropLoading from '@/components/Common/Loading/BackdropLoading';
import authService from '@/services/authService';
import toastMessages from '@/utils/toastMessages';
import { useAppSelector } from '@/hooks/useAppStore';
import { getSafeRedirectPath, getSafeExternalOpenUrl } from '@/utils/safeExternalUrl';

const OTP_LENGTH = 6;
const RESEND_EMAIL_COOLDOWN_SECONDS = 60;

/**
 * Returns a direct link to the user's webmail provider if known.
 */
function getWebmailProviderInfo(email: string) {
  const normalized = email.trim().toLowerCase();
  if (normalized.endsWith('@gmail.com') || normalized.endsWith('@googlemail.com')) {
    return {
      name: 'Gmail',
      url: 'https://mail.google.com/mail/u/0/#search/from%3AInfoHR+or+x%C3%A1c+th%E1%BB%B1c',
      color: '#EA4335',
      bgColor: '#FEF2F2',
      borderColor: '#FECACA',
    };
  }
  if (
    normalized.endsWith('@outlook.com') ||
    normalized.endsWith('@hotmail.com') ||
    normalized.endsWith('@live.com') ||
    normalized.endsWith('@msn.com')
  ) {
    return {
      name: 'Outlook',
      url: 'https://outlook.live.com/mail/0/',
      color: '#0078D4',
      bgColor: '#EFF6FF',
      borderColor: '#BFDBFE',
    };
  }
  if (normalized.endsWith('@yahoo.com') || normalized.endsWith('@yahoo.com.vn')) {
    return {
      name: 'Yahoo Mail',
      url: 'https://mail.yahoo.com',
      color: '#6001D2',
      bgColor: '#F5F3FF',
      borderColor: '#DDD6FE',
    };
  }
  if (normalized.endsWith('@icloud.com')) {
    return {
      name: 'iCloud Mail',
      url: 'https://www.icloud.com/mail',
      color: '#0284C7',
      bgColor: '#F0F9FF',
      borderColor: '#BAE6FD',
    };
  }
  return {
    name: 'Hộp thư điện tử',
    url: `mailto:${email}`,
    color: '#2563EB',
    bgColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  };
}

const EmailVerificationRequiredPage = () => {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { t } = useTranslation('auth');

  TabTitle(t('verification.pageTitle', 'Xác thực Email | InfoHR'));

  const { email } = useAppSelector((state) => state.auth);

  // States
  const [otpDigits, setOtpDigits] = React.useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [isVerifyingOtp, setIsVerifyingOtp] = React.useState(false);
  const [isFullScreenLoading, setIsFullScreenLoading] = React.useState(false);
  const [isResending, setIsResending] = React.useState(false);
  const [countdown, setCountdown] = React.useState<number>(0);
  const [copied, setCopied] = React.useState(false);
  const [showTroubleshooting, setShowTroubleshooting] = React.useState(false);
  const [otpErrorMessage, setOtpErrorMessage] = React.useState<string>('');

  const otpInputRefs = React.useRef<Array<HTMLInputElement | null>>([]);
  const resendInFlightRef = React.useRef(false);
  const redirectTriggeredRef = React.useRef(false);
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);

  const displayEmail = email || 'email_cua_ban@domain.com';
  const webmailInfo = getWebmailProviderInfo(displayEmail);

  // Auto-focus first OTP input on mount
  React.useEffect(() => {
    const timer = setTimeout(() => {
      otpInputRefs.current[0]?.focus();
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  // Cooldown countdown timer
  React.useEffect(() => {
    if (countdown > 0) {
      timerRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [countdown]);

  // Periodic background check & tab focus check
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
          toastMessages.success(t('verification.activatedSuccess', 'Tài khoản của bạn đã được kích hoạt thành công!'));
          router.push(getSafeRedirectPath('/dang-nhap'));
        }
      } catch {
        // Silent catch for auto-check
      } finally {
        if (showLoading) setIsFullScreenLoading(false);
      }
    },
    [email, router, t]
  );

  React.useEffect(() => {
    if (!email) return;

    checkVerificationStatus(false);

    const handleFocus = () => {
      checkVerificationStatus(false);
    };
    window.addEventListener('focus', handleFocus);

    const intervalId = setInterval(() => {
      checkVerificationStatus(false);
    }, 4000);

    return () => {
      window.removeEventListener('focus', handleFocus);
      clearInterval(intervalId);
    };
  }, [email, checkVerificationStatus]);

  // ── OTP Handlers ──
  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '');
    if (!pastedData) return;

    const pastedDigits = pastedData.slice(0, OTP_LENGTH).split('');
    const newDigits = [...otpDigits];
    pastedDigits.forEach((char, idx) => {
      newDigits[idx] = char;
    });
    setOtpDigits(newDigits);
    setOtpErrorMessage('');

    const nextIndex = Math.min(pastedDigits.length, OTP_LENGTH - 1);
    otpInputRefs.current[nextIndex]?.focus();

    if (pastedDigits.length === OTP_LENGTH && newDigits.every((d) => d !== '')) {
      void handleVerifyOtp(newDigits.join(''));
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    const numeric = value.replace(/\D/g, '');
    setOtpErrorMessage('');

    // Fallback for mobile paste
    if (numeric.length > 1) {
      const pasted = numeric.slice(0, OTP_LENGTH).split('');
      const newDigits = [...otpDigits];
      pasted.forEach((char, idx) => {
        if (idx < OTP_LENGTH) newDigits[idx] = char;
      });
      setOtpDigits(newDigits);
      const nextIndex = Math.min(pasted.length, OTP_LENGTH - 1);
      otpInputRefs.current[nextIndex]?.focus();
      if (newDigits.every((d) => d !== '')) {
        void handleVerifyOtp(newDigits.join(''));
      }
      return;
    }

    const newDigits = [...otpDigits];
    newDigits[index] = numeric.slice(-1);
    setOtpDigits(newDigits);

    // Auto advance focus
    if (numeric && index < OTP_LENGTH - 1) {
      otpInputRefs.current[index + 1]?.focus();
    }

    // Auto verify when all 6 filled
    if (numeric && index === OTP_LENGTH - 1) {
      const fullCode = newDigits.join('');
      if (fullCode.length === OTP_LENGTH && !newDigits.includes('')) {
        void handleVerifyOtp(fullCode);
      }
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // Submit OTP Verification
  const handleVerifyOtp = async (codeToVerify?: string) => {
    const code = codeToVerify || otpDigits.join('');
    const normalizedEmail = String(email || '').trim();

    if (code.length < OTP_LENGTH) {
      setOtpErrorMessage(`Vui lòng nhập đủ ${OTP_LENGTH} chữ số của mã xác thực.`);
      return;
    }

    if (!normalizedEmail) {
      setOtpErrorMessage('Không tìm thấy thông tin email. Vui lòng thử đăng nhập lại.');
      return;
    }

    setOtpErrorMessage('');
    setIsVerifyingOtp(true);

    try {
      const res = await authService.verifyEmailOtp(normalizedEmail, code);

      if (res?.emailVerified || res?.success) {
        redirectTriggeredRef.current = true;
        toastMessages.success(t('verification.activatedSuccess', 'Tài khoản của bạn đã được kích hoạt thành công!'));
        router.push(getSafeRedirectPath('/dang-nhap?successMessage=X%C3%A1c%20th%E1%BB%B1c%20email%20th%C3%A0nh%20c%C3%B4ng.%20Vui%20l%C3%B2ng%20%C4%91%C4%83ng%20nh%E1%BA%ADp.'));
        return;
      }

      setOtpErrorMessage('Mã xác thực không hợp lệ hoặc đã hết hạn.');
    } catch (err: any) {
      const msg = err?.response?.data?.errors?.errorMessage?.[0] ||
        err?.response?.data?.errors?.message ||
        err?.message ||
        'Mã xác thực không chính xác hoặc đã hết hạn sau 15 phút.';
      setOtpErrorMessage(msg);
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleCopyEmail = () => {
    if (email) {
      navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toastMessages.success('Đã sao chép địa chỉ email vào bộ nhớ tạm');
    }
  };

  const handleResendEmail = async () => {
    const normalizedEmail = String(email || '').trim();

    if (!normalizedEmail || resendInFlightRef.current || countdown > 0) {
      return;
    }

    resendInFlightRef.current = true;
    setIsResending(true);
    setOtpDigits(Array(OTP_LENGTH).fill(''));
    setOtpErrorMessage('');

    try {
      const res: any = await authService.sendVerifyEmail(normalizedEmail);
      const isVerified = res?.data?.emailVerified || res?.emailVerified;

      if (isVerified) {
        redirectTriggeredRef.current = true;
        toastMessages.success(t('verification.activatedSuccess', 'Tài khoản đã được kích hoạt thành công!'));
        router.push(getSafeRedirectPath('/dang-nhap'));
        return;
      }

      setCountdown(RESEND_EMAIL_COOLDOWN_SECONDS);
      toastMessages.success('Đã gửi mã xác thực mới vào email của bạn (hiệu lực 15 phút).');
      otpInputRefs.current[0]?.focus();
    } catch {
      toastMessages.error(t('messages.tryAgain', 'Có lỗi xảy ra khi gửi lại email. Vui lòng thử lại sau.'));
    } finally {
      setIsResending(false);
      resendInFlightRef.current = false;
    }
  };

  return (
    <>
      <Box
        sx={{
          minHeight: 'calc(100vh - 140px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: { xs: 4, sm: 8 },
          px: 2,
          position: 'relative',
          background: 'radial-gradient(circle at 50% 10%, #EEF2FF 0%, #F8FAFC 60%, #F1F5F9 100%)',
          overflow: 'hidden',
        }}
      >
        {/* Ambient Glow Orbs */}
        <Box
          sx={{
            position: 'absolute',
            top: '-8%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: { xs: 340, sm: 580 },
            height: { xs: 340, sm: 580 },
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(67, 56, 202, 0.12) 0%, rgba(37, 99, 235, 0.05) 50%, transparent 70%)',
            filter: 'blur(45px)',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />

        <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
          <Card
            elevation={0}
            sx={{
              p: { xs: 3, sm: 4.5 },
              borderRadius: '24px',
              backgroundColor: 'rgba(255, 255, 255, 0.94)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(226, 232, 240, 0.9)',
              boxShadow: '0 20px 45px -12px rgba(15, 23, 42, 0.08), 0 0 1px 1px rgba(226, 232, 240, 0.6)',
              textAlign: 'center',
            }}
          >
            {/* Top Shield Chip */}
            <Chip
              icon={<ShieldOutlinedIcon sx={{ fontSize: '16px !important', color: '#4338CA' }} />}
              label="Bảo mật & Xác thực tài khoản"
              sx={{
                mb: 3,
                fontWeight: 700,
                fontSize: '0.8rem',
                color: '#3730A3',
                backgroundColor: '#EEF2FF',
                border: '1px solid #C7D2FE',
                py: 0.5,
                px: 0.5,
              }}
            />

            {/* Glowing Hero Mail Icon */}
            <Box
              sx={{
                position: 'relative',
                width: 84,
                height: 84,
                mx: 'auto',
                mb: 2.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {/* Animated Outer Pulse Ring */}
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: '50%',
                  backgroundColor: 'rgba(67, 56, 202, 0.12)',
                  animation: 'radarPulse 2.4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                  '@keyframes radarPulse': {
                    '0%': { transform: 'scale(0.95)', opacity: 0.8 },
                    '50%': { transform: 'scale(1.25)', opacity: 0.2 },
                    '100%': { transform: 'scale(0.95)', opacity: 0.8 },
                  },
                }}
              />
              {/* Inner Circle */}
              <Box
                sx={{
                  position: 'relative',
                  width: 72,
                  height: 72,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #4338CA 0%, #2563EB 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 10px 25px -5px rgba(67, 56, 202, 0.4)',
                }}
              >
                <MarkEmailReadOutlinedIcon sx={{ fontSize: 36, color: '#FFFFFF' }} />
              </Box>

              {/* Realtime Live Pulse Badge */}
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 2,
                  right: 2,
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  backgroundColor: '#10B981',
                  border: '2.5px solid #FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 6px rgba(16, 185, 129, 0.4)',
                }}
              />
            </Box>

            {/* Title & Subtitle */}
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                fontSize: { xs: '1.4rem', sm: '1.7rem' },
                color: '#0F172A',
                letterSpacing: '-0.025em',
                mb: 1,
              }}
            >
              Mã xác thực email của bạn
            </Typography>

            <Typography
              variant="body1"
              sx={{
                color: '#64748B',
                fontSize: { xs: '0.9rem', sm: '0.95rem' },
                lineHeight: 1.55,
                maxWidth: 440,
                mx: 'auto',
                mb: 2,
              }}
            >
              Chúng tôi đã gửi mã xác thực 6 chữ số đến địa chỉ:
            </Typography>

            {/* Email Address Capsule with Copy Action */}
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1,
                py: 1,
                px: { xs: 2, sm: 2.5 },
                mb: 3,
                borderRadius: '100px',
                backgroundColor: '#F1F5F9',
                border: '1px solid #E2E8F0',
                maxWidth: '100%',
              }}
            >
              <ForwardToInboxOutlinedIcon sx={{ fontSize: 17, color: '#4338CA', flexShrink: 0 }} />
              <Typography
                component="span"
                sx={{
                  fontWeight: 700,
                  fontSize: { xs: '0.875rem', sm: '0.95rem' },
                  color: '#0F172A',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {displayEmail}
              </Typography>
              <Tooltip title={copied ? 'Đã sao chép!' : 'Sao chép email'}>
                <IconButton
                  size="small"
                  onClick={handleCopyEmail}
                  sx={{
                    ml: 0.5,
                    p: 0.5,
                    color: copied ? '#10B981' : '#64748B',
                    '&:hover': { color: '#4338CA', backgroundColor: 'rgba(67, 56, 202, 0.08)' },
                  }}
                >
                  {copied ? (
                    <CheckCircleOutlineOutlinedIcon sx={{ fontSize: 16 }} />
                  ) : (
                    <ContentCopyOutlinedIcon sx={{ fontSize: 16 }} />
                  )}
                </IconButton>
              </Tooltip>
            </Box>

            {/* ── 6-Digit OTP Input Boxes ── */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#334155', mb: 1.5, fontSize: '0.875rem' }}>
                Nhập mã 6 chữ số nhận được trong email:
              </Typography>

              <Stack direction="row" spacing={{ xs: 1, sm: 1.25 }} justifyContent="center" sx={{ mb: 1.5 }}>
                {otpDigits.map((digit, idx) => (
                  <input
                    key={`otp-slot-${idx}`}
                    ref={(el) => {
                      otpInputRefs.current[idx] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={1}
                    value={digit}
                    disabled={isVerifyingOtp}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onPaste={handleOtpPaste}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    style={{
                      width: isMobile ? 42 : 50,
                      height: isMobile ? 48 : 56,
                      fontSize: isMobile ? '1.3rem' : '1.6rem',
                      fontWeight: 800,
                      textAlign: 'center',
                      borderRadius: '14px',
                      border: digit ? '2px solid #4338ca' : '1.5px solid #cbd5e1',
                      backgroundColor: digit ? '#f5f3ff' : '#ffffff',
                      color: '#0f172a',
                      outline: 'none',
                      transition: 'all 0.15s ease',
                      boxShadow: digit ? '0 4px 12px rgba(67, 56, 202, 0.15)' : '0 1px 3px rgba(0,0,0,0.04)',
                    }}
                  />
                ))}
              </Stack>

              {/* Error Message Alert */}
              {otpErrorMessage && (
                <Typography variant="caption" sx={{ color: '#ef4444', fontWeight: 600, display: 'block', mt: 1, fontSize: '0.825rem' }}>
                  {otpErrorMessage}
                </Typography>
              )}
            </Box>

            {/* Hostinger-style Expiry & Security Notice */}
            <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.85rem', mb: 2.5 }}>
              Vui lòng không chia sẻ mã này. <span style={{ color: '#334155', fontWeight: 600 }}>Lưu ý:</span> Mã sẽ hết hạn sau{' '}
              <strong style={{ color: '#ef4444' }}>15 phút</strong>.
            </Typography>

            {/* Action Button: Verify OTP */}
            <Button
              variant="contained"
              size="large"
              fullWidth
              disabled={isVerifyingOtp || otpDigits.some((d) => !d)}
              onClick={() => handleVerifyOtp()}
              startIcon={
                isVerifyingOtp ? (
                  <CircularProgress size={18} color="inherit" />
                ) : (
                  <KeyOutlinedIcon sx={{ fontSize: '18px !important' }} />
                )
              }
              sx={{
                py: 1.4,
                mb: 2.5,
                borderRadius: '14px',
                fontWeight: 700,
                fontSize: '1rem',
                textTransform: 'none',
                background: 'linear-gradient(135deg, #4338CA 0%, #2563EB 100%)',
                boxShadow: '0 8px 20px -4px rgba(67, 56, 202, 0.35)',
                transition: 'all 0.2s ease',
                '&:hover': {
                  background: 'linear-gradient(135deg, #3730A3 0%, #1D4ED8 100%)',
                  boxShadow: '0 12px 24px -4px rgba(67, 56, 202, 0.45)',
                  transform: 'translateY(-1px)',
                },
              }}
            >
              {isVerifyingOtp ? 'Đang xác thực mã...' : 'Xác thực & Kích hoạt tài khoản'}
            </Button>

            {/* 1-Click Open Webmail Shortcut */}
            <Box sx={{ mb: 3 }}>
              <Button
                component="a"
                href={getSafeExternalOpenUrl(webmailInfo.url)}
                target="_blank"
                rel="noopener noreferrer"
                variant="outlined"
                size="medium"
                fullWidth
                endIcon={<OpenInNewOutlinedIcon sx={{ fontSize: '16px !important' }} />}
                sx={{
                  py: 1.1,
                  borderRadius: '12px',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  textTransform: 'none',
                  borderColor: '#E2E8F0',
                  color: '#475569',
                  backgroundColor: '#F8FAFC',
                  '&:hover': {
                    borderColor: '#CBD5E1',
                    backgroundColor: '#F1F5F9',
                    color: '#0F172A',
                  },
                }}
              >
                Mở hộp thư {webmailInfo.name} để lấy mã
              </Button>
            </Box>

            {/* Live Auto-Check Ping Bar */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1.25,
                py: 0.9,
                px: 2,
                mb: 2.5,
                borderRadius: '12px',
                backgroundColor: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.2)',
              }}
            >
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: '#10B981',
                  boxShadow: '0 0 0 3px rgba(16, 185, 129, 0.2)',
                  animation: 'pulseDot 1.8s infinite',
                  '@keyframes pulseDot': {
                    '0%': { transform: 'scale(0.9)', opacity: 0.7 },
                    '50%': { transform: 'scale(1.2)', opacity: 1 },
                    '100%': { transform: 'scale(0.9)', opacity: 0.7 },
                  },
                }}
              />
              <Typography variant="caption" sx={{ color: '#047857', fontWeight: 600, fontSize: '0.785rem' }}>
                Tự động kích hoạt nếu bạn nhấn link xác thực trong email
              </Typography>
            </Box>

            {/* Resend & Back Actions */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent="center" sx={{ mb: 2 }}>
              <Button
                variant="text"
                onClick={handleResendEmail}
                disabled={isResending || countdown > 0 || !String(email || '').trim()}
                startIcon={
                  isResending ? (
                    <CircularProgress size={15} color="inherit" />
                  ) : (
                    <RefreshOutlinedIcon sx={{ fontSize: 17 }} />
                  )
                }
                sx={{
                  py: 1,
                  px: 2,
                  borderRadius: '10px',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  textTransform: 'none',
                  color: '#4338CA',
                  '&:hover': {
                    backgroundColor: '#EEF2FF',
                  },
                }}
              >
                {countdown > 0 ? `Gửi lại mã sau (${countdown}s)` : 'Chưa nhận được mã? Gửi lại'}
              </Button>

              <Button
                component={Link}
                href="/dang-nhap"
                variant="text"
                endIcon={<ArrowForwardOutlinedIcon sx={{ fontSize: 15 }} />}
                sx={{
                  py: 1,
                  px: 1.5,
                  borderRadius: '10px',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  textTransform: 'none',
                  color: '#64748B',
                  '&:hover': {
                    color: '#0F172A',
                    backgroundColor: '#F1F5F9',
                  },
                }}
              >
                Đăng nhập
              </Button>
            </Stack>

            {/* Troubleshooting Drawer Toggle */}
            <Box sx={{ pt: 1, borderTop: '1px solid #F1F5F9' }}>
              <Button
                size="small"
                onClick={() => setShowTroubleshooting((prev) => !prev)}
                endIcon={
                  showTroubleshooting ? (
                    <ExpandLessOutlinedIcon sx={{ fontSize: 15 }} />
                  ) : (
                    <ExpandMoreOutlinedIcon sx={{ fontSize: 15 }} />
                  )
                }
                startIcon={<HelpOutlineOutlinedIcon sx={{ fontSize: 15 }} />}
                sx={{
                  textTransform: 'none',
                  color: '#64748B',
                  fontWeight: 600,
                  fontSize: '0.785rem',
                  '&:hover': { color: '#4338CA', backgroundColor: 'transparent' },
                }}
              >
                {showTroubleshooting ? 'Thu gọn trợ giúp' : 'Mẹo khi không tìm thấy email?'}
              </Button>

              <Collapse in={showTroubleshooting}>
                <Alert
                  severity="info"
                  variant="outlined"
                  sx={{
                    mt: 2,
                    textAlign: 'left',
                    borderRadius: '14px',
                    borderColor: '#C7D2FE',
                    backgroundColor: '#F8FAFC',
                    fontSize: '0.8rem',
                    color: '#334155',
                    '& .MuiAlert-icon': { color: '#4338CA' },
                  }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5, color: '#1E293B', fontSize: '0.825rem' }}>
                    Một số mẹo kiểm tra nhanh:
                  </Typography>
                  <Box component="ul" sx={{ pl: 2, m: 0, '& li': { mb: 0.4 } }}>
                    <li>
                      Kiểm tra thư mục <strong>Thư rác (Spam / Junk)</strong> hoặc tab <strong>Quảng cáo (Promotions)</strong>.
                    </li>
                    <li>
                      Mã xác thực có hiệu lực trong <strong>15 phút</strong> kể từ khi gửi.
                    </li>
                    <li>
                      Nếu địa chỉ email bị sai, bạn có thể{' '}
                      <Link href="/dang-ky" style={{ color: '#4338CA', fontWeight: 600, textDecoration: 'underline' }}>
                        đăng ký lại tài khoản mới
                      </Link>
                      .
                    </li>
                  </Box>
                </Alert>
              </Collapse>
            </Box>
          </Card>
        </Container>
      </Box>

      {isFullScreenLoading && <BackdropLoading />}
    </>
  );
};

export default EmailVerificationRequiredPage;
