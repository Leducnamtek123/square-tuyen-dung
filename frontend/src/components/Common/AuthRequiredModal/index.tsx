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
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
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
          borderRadius: 3.5,
          p: { xs: 2.5, sm: 3 },
          position: 'relative',
          boxShadow: '0 24px 48px -12px rgba(15, 23, 42, 0.18)',
        },
      }}
    >
      <IconButton
        onClick={onClose}
        size="small"
        aria-label="Close dialog"
        sx={{
          position: 'absolute',
          top: 12,
          right: 12,
          color: '#94a3b8',
          '&:hover': { color: '#334155', bgcolor: '#f1f5f9' },
        }}
      >
        <CloseRoundedIcon fontSize="small" />
      </IconButton>

      <DialogContent sx={{ p: 0, textAlign: 'center' }}>
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            bgcolor: 'rgba(37, 99, 235, 0.08)',
            color: '#2563eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 2,
          }}
        >
          <LockOutlinedIcon sx={{ fontSize: 28 }} />
        </Box>

        <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', mb: 1 }}>
          {displayTitle}
        </Typography>

        <Typography variant="body2" sx={{ color: '#64748b', lineHeight: 1.6, mb: 3 }}>
          {displayMessage}
        </Typography>

        <Stack spacing={1.5}>
          <Button
            variant="contained"
            fullWidth
            onClick={handleLoginClick}
            endIcon={<ArrowForwardRoundedIcon sx={{ fontSize: 18 }} />}
            sx={{
              bgcolor: '#2563eb',
              color: '#ffffff',
              py: 1.2,
              borderRadius: 2.5,
              fontWeight: 700,
              textTransform: 'none',
              fontSize: '0.95rem',
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.25)',
              '&:hover': {
                bgcolor: '#1d4ed8',
                boxShadow: '0 6px 18px rgba(37, 99, 235, 0.35)',
              },
            }}
          >
            {t('authRequired.loginBtn')}
          </Button>

          <Button
            variant="text"
            fullWidth
            onClick={handleRegisterClick}
            sx={{
              color: '#2563eb',
              py: 0.75,
              fontWeight: 600,
              textTransform: 'none',
              fontSize: '0.875rem',
              '&:hover': { bgcolor: 'rgba(37, 99, 235, 0.04)' },
            }}
          >
            {t('authRequired.registerPrompt')}{' '}
            <strong style={{ marginLeft: 4, textDecoration: 'underline' }}>
              {t('authRequired.registerBtn')}
            </strong>
          </Button>

          <Button
            variant="text"
            fullWidth
            onClick={onClose}
            sx={{
              color: '#94a3b8',
              py: 0.5,
              fontWeight: 500,
              textTransform: 'none',
              fontSize: '0.825rem',
              '&:hover': { color: '#64748b' },
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
