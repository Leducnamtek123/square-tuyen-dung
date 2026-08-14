'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Card,
  Typography,
  Button,
  CircularProgress,
  Stack,
} from '@mui/material';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useAppSelector } from '@/redux/hooks';
import { localizeRoutePath } from '@/configs/routeLocalization';
import authService from '@/services/authService';

interface CandidateCompletenessBannerCardProps {
  completenessPercent?: number;
}

const CandidateCompletenessBannerCard = ({
  completenessPercent: overridePercent,
}: CandidateCompletenessBannerCardProps) => {
  const { i18n } = useTranslation('common');
  const { currentUser } = useAppSelector((state) => state.user);

  // Fetch real profile completeness score directly from Backend Django API (auth/onboarding/status/)
  const { data: onboardingStatus } = useQuery({
    queryKey: ['onboardingStatus'],
    queryFn: () => authService.getOnboardingStatus(),
    staleTime: 30_000,
  });

  // Compute percentage from Backend API with real-time user fallback
  const completenessPercent = React.useMemo(() => {
    if (typeof overridePercent === 'number' && overridePercent > 0) {
      return overridePercent;
    }
    if (typeof onboardingStatus?.profileCompleteness === 'number') {
      return onboardingStatus.profileCompleteness;
    }

    // Client-side computation from real user attributes while API resolves
    let score = 0;
    if (currentUser?.fullName) score += 20;
    if (currentUser?.email) score += 20;
    const phone = (currentUser as unknown as { phone?: string })?.phone || (currentUser as unknown as { phoneNumber?: string })?.phoneNumber;
    if (phone) score += 20;
    if (currentUser?.avatarUrl) score += 20;
    const isVerified = (currentUser as unknown as { isVerified?: boolean })?.isVerified || onboardingStatus?.isOnboarded;
    if (isVerified) score += 20;

    return Math.min(score, 100);
  }, [currentUser, onboardingStatus?.profileCompleteness, onboardingStatus?.isOnboarded, overridePercent]);

  const profilePath = localizeRoutePath('/profile', i18n.language);

  const benefits = [
    'Tăng khả năng được nhà tuyển dụng tìm thấy',
    'Nhận gợi ý việc làm phù hợp hơn',
    'Nâng cao cơ hội được mời phỏng vấn',
  ];

  return (
    <Card
      elevation={0}
      sx={{
        p: 2.5,
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        backgroundColor: '#ffffff',
        boxShadow: '0 4px 20px -2px rgba(0,0,0,0.03)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        height: '100%',
      }}
    >
      <Box
        sx={{
          width: 52,
          height: 52,
          borderRadius: '50%',
          backgroundColor: '#eff6ff',
          color: '#2563eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 1.5,
        }}
      >
        <VerifiedUserOutlinedIcon sx={{ fontSize: 30 }} />
      </Box>

      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0f172a', mb: 2, lineHeight: 1.3 }}>
        Hoàn thiện hồ sơ để nhận nhiều cơ hội phù hợp hơn
      </Typography>

      {/* Dynamic Progress Ring */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
        <Box sx={{ position: 'relative', display: 'inline-flex' }}>
          <CircularProgress
            variant="determinate"
            value={100}
            size={56}
            thickness={4.5}
            sx={{ color: '#e2e8f0' }}
          />
          <CircularProgress
            variant="determinate"
            value={completenessPercent}
            size={56}
            thickness={4.5}
            sx={{
              color: completenessPercent === 100 ? '#16a34a' : '#2563eb',
              position: 'absolute',
              left: 0,
            }}
          />
          <Box
            sx={{
              top: 0,
              left: 0,
              bottom: 0,
              right: 0,
              position: 'absolute',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography variant="caption" sx={{ fontWeight: 700, color: '#0f172a' }}>
              {completenessPercent}%
            </Typography>
          </Box>
        </Box>
        <Typography variant="caption" sx={{ color: '#64748b', textAlign: 'left', fontWeight: 500 }}>
          {completenessPercent === 100 ? 'Hồ sơ đã hoàn thiện 100%' : 'Hồ sơ của bạn đã hoàn thiện'}
        </Typography>
      </Box>

      {/* Button redirects directly to candidate profile page (/profile) */}
      <Button
        component={Link}
        href={profilePath}
        variant="contained"
        endIcon={<ArrowForwardIcon />}
        fullWidth
        sx={{
          borderRadius: '10px',
          backgroundColor: completenessPercent === 100 ? '#16a34a' : '#2563eb',
          fontWeight: 700,
          py: 1,
          textTransform: 'none',
          boxShadow: 'none',
          mb: 2.5,
          '&:hover': {
            backgroundColor: completenessPercent === 100 ? '#15803d' : '#1d4ed8',
            boxShadow: 'none',
          },
        }}
      >
        {completenessPercent === 100 ? 'Xem hồ sơ ngay' : 'Hoàn thiện ngay'}
      </Button>

      {/* Benefits List */}
      <Stack spacing={1} sx={{ textAlign: 'left', width: '100%' }}>
        {benefits.map((text) => (
          <Box key={text} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CheckCircleOutlineIcon sx={{ fontSize: 16, color: '#2563eb', flexShrink: 0 }} />
            <Typography variant="caption" sx={{ color: '#475569', fontSize: '0.775rem', fontWeight: 500 }}>
              {text}
            </Typography>
          </Box>
        ))}
      </Stack>
    </Card>
  );
};

export default CandidateCompletenessBannerCard;
