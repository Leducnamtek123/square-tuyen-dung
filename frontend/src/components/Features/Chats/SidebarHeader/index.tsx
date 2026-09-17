'use client';
import React from 'react';
import { useAppSelector } from '@/redux/hooks';
import { useRouter } from 'next/navigation';
import { Box, Chip, Divider, Stack } from "@mui/material";
import GridViewIcon from '@mui/icons-material/GridView';
import HomeIcon from '@mui/icons-material/Home';
import { IMAGES, ROUTES } from '@/configs/constants';
import MuiImageCustom from '@/components/Common/MuiImageCustom';
import LanguageSwitcher from '@/layouts/components/commons/LanguageSwitcher';
import { useTranslation } from 'react-i18next';
import { localizeRoutePath } from '@/configs/routeLocalization';

interface SidebarHeaderProps {
  // Add specific props if needed
}

const SidebarHeader = (_props: SidebarHeaderProps) => {
  const { currentUser, activeWorkspace } = useAppSelector((state) => state.user);
  const { push } = useRouter();
  const { t, i18n } = useTranslation('common');

  const isEmployer = React.useMemo(() => {
    return activeWorkspace?.type === "company";
  }, [activeWorkspace]);

  const handleRedirect = () => {
    if (isEmployer) {
      if (currentUser?.isOnboarded === false) {
        push('/onboarding/employer');
        return;
      }
      push(localizeRoutePath(`/${ROUTES.EMPLOYER.DASHBOARD}`, i18n.language));
      return;
    }
    push(localizeRoutePath('/', i18n.language));
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{
          pb: 1.75,
          minHeight: 40,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <MuiImageCustom
            width={116}
            src={IMAGES.getTextLogo('dark')}
            sx={{ display: 'block' }}
          />
        </Box>
        <Stack direction="row" alignItems="center" spacing={1}>
          <LanguageSwitcher size="small" />
          <Chip
            icon={!isEmployer ? <HomeIcon sx={{ fontSize: '18px !important' }} /> : <GridViewIcon sx={{ fontSize: '18px !important' }} />}
            label={!isEmployer ? t('sidebarHeader.backToHome') : t('sidebarHeader.backToAdmin')}
            onClick={handleRedirect}
            clickable
            sx={{
              height: 36,
              borderRadius: '10px',
              fontWeight: 600,
              fontSize: '0.8125rem',
              bgcolor: '#f8fafc',
              color: '#334155',
              border: '1px solid #e2e8f0',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              '& .MuiChip-label': {
                px: 1.25,
              },
              '&:hover': {
                bgcolor: '#f1f5f9',
                color: '#0f172a',
                borderColor: '#cbd5e1',
              },
              '&:focus-visible': {
                outline: '2px solid #2563eb',
                outlineOffset: '2px',
              },
              '&:active': {
                transform: 'scale(0.98)',
              },
            }}
          />
        </Stack>
      </Stack>
      <Divider sx={{ borderColor: '#e2e8f0' }} />
    </Box>
  );
};

export default SidebarHeader;
