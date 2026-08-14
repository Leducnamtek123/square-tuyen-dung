'use client';

import React from 'react';
import { Box, Container, Stack, Link as MuiLink, Tooltip } from '@mui/material';
import Link from 'next/link';
import LanguageSwitcher from '@/layouts/components/commons/LanguageSwitcher';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { useTranslation } from 'react-i18next';
import { IMAGES } from '@/configs/images';

interface OnboardingHeaderProps {
  appName?: string;
}

export default function OnboardingHeader({ appName = 'InfoHR' }: OnboardingHeaderProps) {
  const { t } = useTranslation('common');

  return (
    <Box
      component="header"
      sx={{
        width: '100%',
        py: 2,
        px: { xs: 2, md: 4 },
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
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

          {/* Right Actions: Help & Language Switcher */}
          <Stack direction="row" alignItems="center" spacing={{ xs: 1, sm: 2 }}>
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
                    color: 'primary.main',
                    backgroundColor: 'rgba(239, 68, 68, 0.06)',
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
