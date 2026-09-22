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
import AssignmentIndRoundedIcon from '@mui/icons-material/AssignmentIndRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

export interface OnboardingRequiredDialogProps {
  open: boolean;
  onClose: () => void;
  role?: 'candidate' | 'employer';
  returnUrl?: string;
}

export const OnboardingRequiredDialog: React.FC<OnboardingRequiredDialogProps> = ({
  open,
  onClose,
  role = 'candidate',
  returnUrl,
}) => {
  const { t } = useTranslation('public');
  const router = useRouter();

  const handleGoToOnboarding = () => {
    onClose();
    const targetPath = role === 'employer' ? '/onboarding/employer' : '/onboarding/candidate';
    const redirectParam = returnUrl ? `?redirect=${encodeURIComponent(returnUrl)}` : '';
    router.push(`${targetPath}${redirectParam}`);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: '24px',
            p: 0,
            overflow: 'hidden',
            position: 'relative',
            border: '1px solid rgba(226, 232, 240, 0.8)',
            boxShadow: '0 24px 60px -12px rgba(15, 23, 42, 0.22)',
            bgcolor: '#ffffff',
          },
        },
      }}
    >
      {/* Floating close button */}
      <IconButton
        onClick={onClose}
        size="small"
        aria-label="Close dialog"
        sx={{
          position: 'absolute',
          top: 16,
          right: 16,
          bgcolor: 'rgba(241, 245, 249, 0.8)',
          color: '#64748b',
          zIndex: 10,
          '&:hover': {
            bgcolor: '#e2e8f0',
            color: '#0f172a',
          },
        }}
      >
        <CloseRoundedIcon sx={{ fontSize: 18 }} />
      </IconButton>

      <DialogContent sx={{ p: { xs: 3, sm: 4 }, textAlign: 'center' }}>
        {/* Visual Icon Badge */}
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: '20px',
            background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 50%, #1D4ED8 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 2.5,
            boxShadow: '0 10px 25px -5px rgba(37, 99, 235, 0.35)',
            color: '#ffffff',
          }}
        >
          <AssignmentIndRoundedIcon sx={{ fontSize: 32 }} />
        </Box>

        {/* Title */}
        <Typography
          variant="h6"
          sx={{
            fontWeight: 800,
            fontSize: { xs: '1.2rem', sm: '1.35rem' },
            color: '#0F172A',
            letterSpacing: '-0.02em',
            mb: 1.2,
          }}
        >
          {role === 'employer'
            ? t('onboardingRequired.employerTitle', 'Cần hoàn tất hồ sơ doanh nghiệp')
            : t('onboardingRequired.candidateTitle', 'Cần hoàn tất hồ sơ để ứng tuyển')}
        </Typography>

        {/* Description */}
        <Typography
          variant="body2"
          sx={{
            color: '#64748B',
            fontSize: '0.925rem',
            lineHeight: 1.6,
            mb: 3.5,
            px: { xs: 1, sm: 2 },
          }}
        >
          {role === 'employer'
            ? t(
                'onboardingRequired.employerMsg',
                'Vui lòng hoàn thiện hồ sơ doanh nghiệp trước khi thực hiện các nghiệp vụ tuyển dụng.'
              )
            : t(
                'onboardingRequired.candidateMsg',
                'Bạn cần hoàn thiện thông tin hồ sơ cơ bản (chức danh, kỹ năng, số điện thoại) để nhà tuyển dụng có thể đánh giá và liên hệ phỏng vấn.'
              )}
        </Typography>

        {/* Action Buttons */}
        <Stack spacing={1.5}>
          <Button
            fullWidth
            variant="contained"
            size="large"
            onClick={handleGoToOnboarding}
            endIcon={<ArrowForwardRoundedIcon sx={{ fontSize: 18 }} />}
            sx={{
              py: 1.35,
              borderRadius: '14px',
              fontWeight: 700,
              fontSize: '0.95rem',
              textTransform: 'none',
              bgcolor: '#2563EB',
              boxShadow: '0 8px 20px -4px rgba(37, 99, 235, 0.35)',
              '&:hover': {
                bgcolor: '#1D4ED8',
                boxShadow: '0 12px 24px -4px rgba(37, 99, 235, 0.45)',
              },
            }}
          >
            {t('onboardingRequired.cta', 'Hoàn tất hồ sơ ngay')}
          </Button>

          <Button
            fullWidth
            variant="text"
            size="large"
            onClick={onClose}
            sx={{
              py: 1.1,
              borderRadius: '14px',
              fontWeight: 600,
              fontSize: '0.9rem',
              textTransform: 'none',
              color: '#64748B',
              '&:hover': {
                bgcolor: '#F1F5F9',
                color: '#334155',
              },
            }}
          >
            {t('common.close', 'Để sau')}
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingRequiredDialog;
