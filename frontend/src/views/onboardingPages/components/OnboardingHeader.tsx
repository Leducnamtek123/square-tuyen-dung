'use client';

import React from 'react';
import { Box, Container, Stack, Link as MuiLink, Tooltip } from '@mui/material';
import Link from 'next/link';
import LanguageSwitcher from '@/layouts/components/commons/LanguageSwitcher';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { useTranslation } from 'react-i18next';
import { IMAGES } from '@/configs/images';

import LogoutIcon from '@mui/icons-material/Logout';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import CircularProgress from '@mui/material/CircularProgress';
import Button from '@mui/material/Button';

interface OnboardingHeaderProps {
  appName?: string;
  onSkip?: () => void;
  isSkipping?: boolean;
  showSkip?: boolean;
}

export default function OnboardingHeader({
  appName = 'InfoHR',
  onSkip,
  isSkipping = false,
  showSkip = false,
}: OnboardingHeaderProps) {
  const { t } = useTranslation('common');

  return (
    <Box
      component="header"
      sx={{
        width: '100%',
        py: 2,
        px: { xs: 2, md: 4 },
        backgroundColor: 'rgba(255, 255, 255, 0.75)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(226, 232, 240, 0.6)',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}
    >
      <Container maxWidth="lg">
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          {/* Official InfoHR Brand Logo */}
          <Box
            component={Link}
            href="/"
            sx={{
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
            }}
          >
            <Box
              component="img"
              src={IMAGES.getTextLogo('light')}
              alt="InfoHR Logo"
              sx={{
                height: { xs: 30, md: 36 },
                width: 'auto',
                display: 'block',
                objectFit: 'contain',
                objectPosition: 'left center',
              }}
            />
          </Box>

          {/* Right Actions: Skip, Help & Language Switcher */}
          <Stack direction="row" alignItems="center" spacing={{ xs: 1, sm: 2 }}>
            {showSkip && onSkip && (
              <Button
                size="small"
                onClick={onSkip}
                disabled={isSkipping}
                startIcon={isSkipping ? <CircularProgress size={14} color="inherit" /> : <ExitToAppIcon fontSize="small" />}
                sx={{
                  color: '#64748B',
                  fontWeight: 600,
                  fontSize: '0.8125rem',
                  textTransform: 'none',
                  borderRadius: 2,
                  px: 1.5,
                  py: 0.5,
                  '&:hover': {
                    color: '#0F172A',
                    backgroundColor: 'rgba(15, 23, 42, 0.04)',
                  },
                }}
              >
                {t('common.skipForNow', 'Thiết lập sau')}
              </Button>
            )}

            <Tooltip title={t('footer.support', 'Hỗ trợ')} arrow>
              <MuiLink
                component={Link}
                href="/contact"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  color: '#64748B',
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  px: 1.5,
                  py: 0.75,
                  borderRadius: 2,
                  transition: 'all 0.15s ease',
                  '&:hover': {
                    color: '#2563EB',
                    backgroundColor: 'rgba(37, 99, 235, 0.06)',
                  },
                }}
              >
                <HelpOutlineIcon fontSize="small" />
                <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                  {t('footer.support', 'Trợ giúp')}
                </Box>
              </MuiLink>
            </Tooltip>

            <Box sx={{ transform: 'scale(0.95)' }}>
              <LanguageSwitcher />
            </Box>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
