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

import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';

interface CandidateCompletenessBannerCardProps {
  completenessPercent?: number;
}

const CandidateCompletenessBannerCard = ({
  completenessPercent: overridePercent,
}: CandidateCompletenessBannerCardProps) => {
  const { i18n } = useTranslation('common');
  const { currentUser } = useAppSelector((state) => state.user);
  const [mobileExpanded, setMobileExpanded] = React.useState(false);

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
    <>
      {/* ── Mobile Compact View (< 900px) ── */}
      <Card
        elevation={0}
        sx={{
          display: { xs: 'block', md: 'none' },
          p: 1.5,
          borderRadius: '14px',
          border: '1px solid #e2e8f0',
          backgroundColor: '#ffffff',
          boxShadow: '0 2px 8px -2px rgba(0,0,0,0.04)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.25 }}>
          {/* Left: Mini Progress Ring + Text */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, minWidth: 0, flex: 1 }}>
            <Box sx={{ position: 'relative', display: 'inline-flex', flexShrink: 0 }}>
              <CircularProgress
                variant="determinate"
                value={100}
                size={38}
                thickness={4.5}
                sx={{ color: '#e2e8f0' }}
              />
              <CircularProgress
                variant="determinate"
                value={completenessPercent}
                size={38}
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
                <Typography variant="caption" sx={{ fontWeight: 800, fontSize: '0.7rem', color: '#0f172a' }}>
                  {completenessPercent}%
                </Typography>
              </Box>
            </Box>

            <Box sx={{ minWidth: 0 }}>
              <Typography
                variant="subtitle2"
                noWrap
                sx={{ fontWeight: 700, color: '#0f172a', fontSize: '0.85rem', lineHeight: 1.2 }}
              >
                Hoàn thiện hồ sơ
              </Typography>
              <Typography
                variant="caption"
                noWrap
                sx={{ color: '#64748b', fontSize: '0.725rem', display: 'block', mt: 0.25 }}
              >
                {completenessPercent === 100 ? 'Hồ sơ đã đạt 100%' : `Đạt ${completenessPercent}% cơ hội`}
              </Typography>
            </Box>
          </Box>

          {/* Right: CTA Button + Expand Toggle */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexShrink: 0 }}>
            <Button
              component={Link}
              href={profilePath}
              variant="contained"
              size="small"
              sx={{
                borderRadius: '8px',
                backgroundColor: completenessPercent === 100 ? '#16a34a' : '#2563eb',
                fontWeight: 700,
                fontSize: '0.775rem',
                minHeight: 36,
                px: 1.5,
                py: 0.5,
                textTransform: 'none',
                boxShadow: 'none',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
                '&:hover': {
                  backgroundColor: completenessPercent === 100 ? '#15803d' : '#1d4ed8',
                  boxShadow: 'none',
                },
                '&:focus-visible': {
                  outline: '2px solid #2563eb',
                  outlineOffset: '2px',
                },
              }}
            >
              {completenessPercent === 100 ? 'Xem hồ sơ' : 'Hoàn thiện'}
            </Button>

            <IconButton
              size="small"
              aria-label="Chi tiết hoàn thiện hồ sơ"
              aria-expanded={mobileExpanded}
              aria-controls="completeness-benefits-collapse"
              onClick={() => setMobileExpanded((prev) => !prev)}
              sx={{
                p: 0.5,
                minWidth: 36,
                minHeight: 36,
                color: '#64748b',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                '&:focus-visible': {
                  outline: '2px solid #2563eb',
                  outlineOffset: '2px',
                },
              }}
            >
              {mobileExpanded ? <KeyboardArrowUpIcon fontSize="small" /> : <KeyboardArrowDownIcon fontSize="small" />}
            </IconButton>
          </Box>
        </Box>

        {/* Collapsible details for mobile */}
        <Collapse id="completeness-benefits-collapse" in={mobileExpanded} timeout="auto" unmountOnExit>
          <Box sx={{ mt: 1.5, pt: 1.5, borderTop: '1px solid #f1f5f9' }}>
            <Stack spacing={0.75} sx={{ textAlign: 'left', width: '100%' }}>
              {benefits.map((text) => (
                <Box key={text} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircleOutlineIcon sx={{ fontSize: 15, color: '#2563eb', flexShrink: 0 }} />
                  <Typography variant="caption" sx={{ color: '#475569', fontSize: '0.75rem', fontWeight: 500 }}>
                    {text}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Box>
        </Collapse>
      </Card>

      {/* ── Desktop Full View (>= 900px) ── */}
      <Card
        elevation={0}
        sx={{
          display: { xs: 'none', md: 'flex' },
          p: 2.5,
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          backgroundColor: '#ffffff',
          boxShadow: '0 4px 20px -2px rgba(0,0,0,0.03)',
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
    </>
  );
};

export default CandidateCompletenessBannerCard;
