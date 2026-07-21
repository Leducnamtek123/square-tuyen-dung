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
  const { activeWorkspace } = useAppSelector((state) => state.user);
  const { push } = useRouter();
  const { t, i18n } = useTranslation('common');

  const isEmployer = React.useMemo(() => {
    return activeWorkspace?.type === "company";
  }, [activeWorkspace]);

  const handleRedirect = () => {
    push(localizeRoutePath(isEmployer ? `/${ROUTES.EMPLOYER.DASHBOARD}` : '/', i18n.language));
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Box>
          <MuiImageCustom
            width={120}
            src={IMAGES.getTextLogo('dark')}
            sx={{ mr: 1, mb: 1 }}
          />
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LanguageSwitcher />
          <Chip
            icon={!isEmployer ? <HomeIcon /> : <GridViewIcon />}
            label={!isEmployer ? t('sidebarHeader.backToHome') : t('sidebarHeader.backToAdmin')}
            onClick={handleRedirect}
          />
        </Box>
      </Stack>
      <Divider />
    </Box>
  );
};

export default SidebarHeader;
