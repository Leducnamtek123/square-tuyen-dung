'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Stack,
  Typography,
  Button,
  LinearProgress,
  IconButton,
  Tooltip,
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CloseIcon from '@mui/icons-material/Close';
import Link from 'next/link';

interface OnboardingProgressBannerProps {
  role: 'candidate' | 'employer';
  completeness?: number;
  onboardingUrl?: string;
}

export default function OnboardingProgressBanner({
  role,
  completeness = 35,
  onboardingUrl,
}: OnboardingProgressBannerProps) {
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    // Check session storage to see if dismissed for this session
    const sessionKey = `infohr_onboarding_banner_dismissed_${role}`;
    const isDismissed = sessionStorage.getItem(sessionKey);
    if (!isDismissed) {
      setDismissed(false);
    }
  }, [role]);

  if (dismissed || completeness >= 100) {
    return null;
  }

  const targetUrl = onboardingUrl || (role === 'employer' ? '/onboarding/employer' : '/onboarding/candidate');

  const title = role === 'employer'
    ? `Hồ sơ doanh nghiệp hoàn thiện ${completeness}%`
    : `Hồ sơ tìm việc hoàn thiện ${completeness}%`;

  const description = role === 'employer'
    ? 'Hoàn tất hồ sơ công ty để mở khóa đăng tin tuyển dụng và nhận huy hiệu xác thực.'
    : 'Bổ sung thông tin để mở khóa ứng tuyển 1-click và luyện phỏng vấn thử với AI Voice.';

  const handleDismiss = () => {
    sessionStorage.setItem(`infohr_onboarding_banner_dismissed_${role}`, 'true');
    setDismissed(true);
  };

  return (
    <Box
      sx={{
        width: '100%',
        backgroundColor: '#F0F9FF',
        borderBottom: '1px solid #BAE6FD',
        py: 1.25,
        px: { xs: 2, sm: 3 },
        position: 'relative',
        zIndex: 20,
      }}
    >
      <Container maxWidth="lg" sx={{ px: { xs: 0, sm: 2 } }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          justifyContent="space-between"
          spacing={1.5}
        >
          {/* Left: Icon & Text & Progress */}
          <Stack direction="row" alignItems="center" spacing={1.5} sx={{ flex: 1, minWidth: 0 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: 2,
                backgroundColor: '#0284C7',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <AutoAwesomeIcon fontSize="small" />
            </Box>

            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 700,
                    color: '#0369A1',
                    fontSize: '0.875rem',
                  }}
                >
                  {title}
                </Typography>
                <Box sx={{ width: 90, display: { xs: 'none', md: 'block' } }}>
                  <LinearProgress
                    variant="determinate"
                    value={completeness}
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: '#E0F2FE',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: '#0284C7',
                        borderRadius: 3,
                      },
                    }}
                  />
                </Box>
              </Stack>
              <Typography
                variant="caption"
                sx={{
                  color: '#075985',
                  fontSize: '0.75rem',
                  display: 'block',
                  whiteSpace: { sm: 'nowrap' },
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {description}
              </Typography>
            </Box>
          </Stack>

          {/* Right: CTA & Dismiss */}
          <Stack direction="row" alignItems="center" spacing={1} sx={{ alignSelf: { xs: 'flex-end', sm: 'center' } }}>
            <Button
              component={Link}
              href={targetUrl}
              variant="contained"
              size="small"
              endIcon={<ArrowForwardIcon fontSize="small" />}
              sx={{
                backgroundColor: '#0284C7',
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: '0.8125rem',
                textTransform: 'none',
                borderRadius: 2,
                px: 2,
                py: 0.6,
                boxShadow: 'none',
                '&:hover': {
                  backgroundColor: '#0369A1',
                  boxShadow: '0 2px 8px rgba(2, 132, 199, 0.25)',
                },
              }}
            >
              Hoàn tất ngay
            </Button>

            <Tooltip title="Thu gọn nhắc nhở" arrow>
              <IconButton
                size="small"
                onClick={handleDismiss}
                sx={{
                  color: '#0284C7',
                  '&:hover': {
                    backgroundColor: 'rgba(2, 132, 199, 0.08)',
                  },
                }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
