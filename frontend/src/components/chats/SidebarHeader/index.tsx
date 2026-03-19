import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Box, Chip, Divider, Stack } from "@mui/material";
import GridViewIcon from '@mui/icons-material/GridView';
import HomeIcon from '@mui/icons-material/Home';
import { IMAGES, ROUTES } from '../../../configs/constants';
import MuiImageCustom from '../../MuiImageCustom';
import LanguageSwitcher from '../../../layouts/components/commons/LanguageSwitcher';

interface SidebarHeaderProps {
  // Add specific props if needed
}

const SidebarHeader = (_props: SidebarHeaderProps) => {
  const { activeWorkspace } = useSelector((state: any) => state.user);
  const nav = useNavigate();

  const isEmployer = React.useMemo(() => {
    return activeWorkspace?.type === "company";
  }, [activeWorkspace]);

  const handleRedirect = () => {
    if (isEmployer) {
      nav(`/${ROUTES.EMPLOYER.DASHBOARD}`);
    } else {
      nav(`/${ROUTES.JOB_SEEKER.HOME}`);
    }
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
            label={!isEmployer ? 'Về trang chủ' : 'Về trang quản trị'}
            onClick={handleRedirect}
          />
        </Box>
      </Stack>
      <Divider />
    </Box>
  );
};

export default SidebarHeader;
