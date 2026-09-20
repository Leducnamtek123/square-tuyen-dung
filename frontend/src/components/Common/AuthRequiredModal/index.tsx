'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  Button,
  Stack,
  IconButton,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import { useRouter, usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { ROUTES } from '@/configs/constants';
import { localizeRoutePath } from '@/configs/routeLocalization';

export interface AuthRequiredModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  actionType?: 'save_job' | 'apply_job' | 'follow_company' | 'report' | 'general';
  targetRole?: 'job_seeker' | 'employer';
}

export const AuthRequiredModal: React.FC<AuthRequiredModalProps> = ({
  open,
  onClose,
  title,
  message,
  actionType = 'general',
  targetRole = 'job_seeker',
}) => {
  const { t, i18n } = useTranslation('public');
  const router = useRouter();
  const pathname = usePathname();

  const ensureLeadingSlash = (path: string) => (path.startsWith('/') ? path : `/${path}`);
  const isEmployerTarget = targetRole === 'employer';
  const defaultLoginRoute = ensureLeadingSlash(
    isEmployerTarget
      ? `/${ROUTES.EMPLOYER_AUTH.LOGIN}`
      : localizeRoutePath(`/${ROUTES.AUTH.LOGIN}`, i18n.language)
  );
  const defaultRegisterRoute = ensureLeadingSlash(
    isEmployerTarget
      ? `/${ROUTES.EMPLOYER_AUTH.REGISTER}`
      : localizeRoutePath(`/${ROUTES.AUTH.REGISTER}`, i18n.language)
  );

  const displayTitle = title || t('authRequired.title');
  const displayMessage =
    message ||
    (actionType === 'save_job'
      ? t('authRequired.saveJobMsg')
      : actionType === 'apply_job'
      ? t('authRequired.applyJobMsg')
      : actionType === 'follow_company'
      ? t('authRequired.followCompanyMsg')
      : t('authRequired.defaultMsg'));

  const handleLoginClick = () => {
    onClose();
    const returnUrl = typeof window !== 'undefined' ? `${window.location.pathname}${window.location.search}` : pathname || '/';
    router.push(`${defaultLoginRoute}?redirect=${encodeURIComponent(returnUrl)}`);
  };

  const handleRegisterClick = () => {
    onClose();
    router.push(defaultRegisterRoute);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '24px',
          p: 0,
          overflow: 'hidden',
          position: 'relative',
          border: '1px solid rgba(226, 232, 240, 0.8)',
          boxShadow: '0 24px 60px -12px rgba(15, 23, 42, 0.22)',
          bgcolor: '#ffffff',
        },
      }}
    >
      {/* Floating frosted glass close button */}
      <IconButton
        onClick={onClose}
        size="small"
        aria-label="Close dialog"
        sx={{
          position: 'absolute',
          top: 14,
          right: 14,
          zIndex: 10,
          color: '#475569',
          bgcolor: 'rgba(255, 255, 255, 0.75)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255, 255, 255, 0.8)',
          boxShadow: '0 2px 8px rgba(15, 23, 42, 0.08)',
          transition: 'all 0.2s ease',
          '&:hover': {
            color: '#0f172a',
            bgcolor: 'rgba(255, 255, 255, 0.95)',
            transform: 'scale(1.08)',
          },
        }}
      >
        <CloseRoundedIcon fontSize="small" />
      </IconButton>

      {/* Top illustration banner with subtle gradient blend */}
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          height: { xs: 180, sm: 200 },
          bgcolor: '#f0f7ff',
          overflow: 'hidden',
        }}
      >
        <Box
          component="img"
          src="/images/auth/auth_login_prompt.jpg"
          alt="InfoHR Authentication"
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
            transition: 'transform 0.4s ease',
            '&:hover': {
              transform: 'scale(1.03)',
            },
          }}
        />
        {/* Soft gradient bottom blend */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, rgba(255, 255, 255, 0) 65%, #ffffff 100%)',
            pointerEvents: 'none',
          }}
        />
      </Box>

      {/* Dialog Body Content */}
      <DialogContent sx={{ p: { xs: 2.5, sm: 3 }, pt: { xs: 1, sm: 1 }, textAlign: 'center' }}>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 800,
            color: '#0f172a',
            fontSize: { xs: '1.25rem', sm: '1.35rem' },
            letterSpacing: '-0.02em',
            mb: 1,
          }}
        >
          {displayTitle}
        </Typography>

        <Typography
          variant="body2"
          sx={{
            color: '#64748b',
            lineHeight: 1.6,
            fontSize: '0.875rem',
            mb: 3,
            maxWidth: 340,
            mx: 'auto',
            textWrap: 'balance',
          }}
        >
          {displayMessage}
        </Typography>

        <Stack spacing={1.5}>
          {/* Primary Login Button */}
          <Button
            variant="contained"
            fullWidth
            onClick={handleLoginClick}
            sx={{
              position: 'relative',
              height: 46,
              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              color: '#ffffff',
              borderRadius: '12px',
              fontWeight: 700,
              textTransform: 'none',
              fontSize: '0.95rem',
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.28)',
              transition: 'all 0.2s ease',
              '&:hover': {
                background: 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)',
                boxShadow: '0 6px 20px rgba(37, 99, 235, 0.38)',
                transform: 'translateY(-1px)',
              },
            }}
          >
            {t('authRequired.loginBtn')}
            <ArrowForwardRoundedIcon sx={{ fontSize: 18, position: 'absolute', right: 16 }} />
          </Button>

          {/* Register Link Button */}
          <Button
            variant="text"
            fullWidth
            onClick={handleRegisterClick}
            sx={{
              height: 40,
              color: '#475569',
              borderRadius: '10px',
              fontWeight: 500,
              textTransform: 'none',
              fontSize: '0.875rem',
              transition: 'all 0.2s ease',
              '&:hover': {
                bgcolor: '#f8fafc',
                color: '#0f172a',
              },
            }}
          >
            {t('authRequired.registerPrompt')}{' '}
            <Box
              component="span"
              sx={{
                color: '#2563eb',
                fontWeight: 700,
                ml: 0.5,
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              {t('authRequired.registerBtn')}
            </Box>
          </Button>

          {/* Dismiss Button */}
          <Button
            variant="text"
            size="small"
            onClick={onClose}
            sx={{
              color: '#94a3b8',
              fontWeight: 500,
              textTransform: 'none',
              fontSize: '0.825rem',
              '&:hover': { color: '#64748b', bgcolor: 'transparent' },
            }}
          >
            {t('authRequired.closeBtn')}
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
};

export default AuthRequiredModal;
