import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Avatar, Box, Divider, List, Toolbar, useTheme } from "@mui/material";
import { IMAGES, ROUTES } from '@/configs/constants';
import AdminMenu from './AdminMenu';
import EmployerMenu from './EmployerMenu';

const DrawerContent = ({ isAdmin }: { isAdmin?: boolean }) => {
  const { t } = useTranslation(['admin', 'employer']);
  const location = useLocation();
  const theme = useTheme();

  const [expandedItems, setExpandedItems] = useState({
    candidates: true,
    interviews: true,
    account: true,
    system: true,
    categories: true,
    profiles: true,
    recruitment: true,
    content: true,
  });

  const handleExpand = (section: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [section]: !prev[section as keyof typeof prev]
    }));
  };

  return (
    <div>
      <Toolbar sx={{ px: 2, py: 1.5 }}>
        <Box
          component={Link}
          to={`/${isAdmin ? ROUTES.ADMIN.DASHBOARD : ROUTES.EMPLOYER.DASHBOARD}`}
          sx={{
            width: '100%',
            display: 'flex',
            justifyContent: 'center'
          }}
        >
          <Avatar
            src={IMAGES.getTextLogo(theme.palette.mode === 'light' ? 'dark' : 'light')}
            sx={{ height: 48, width: 'auto' }}
            variant="rounded"
            alt="LOGO"
          />
        </Box>
      </Toolbar>
      <Divider sx={{ borderColor: 'grey.500' }} />
      <Box sx={{ px: 1.5, py: 1.5 }}>
        <List component="nav" disablePadding>
          {isAdmin ? (
            <AdminMenu t={t} location={location} expandedItems={expandedItems} handleExpand={handleExpand} />
          ) : (
            <EmployerMenu t={t} location={location} expandedItems={expandedItems} handleExpand={handleExpand} />
          )}
          <Divider sx={{ my: 2, borderColor: 'grey.300' }} />
        </List>
      </Box>
    </div>
  );
};

export default DrawerContent;
