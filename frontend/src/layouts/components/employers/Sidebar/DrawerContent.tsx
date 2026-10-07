'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { Box, Divider, IconButton, List, Toolbar, Tooltip, useTheme } from "@mui/material";
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { IMAGES, ROUTES } from '@/configs/constants';
import { localizeRoutePath } from '@/configs/routeLocalization';
import Link from 'next/link';
import AdminMenu from './AdminMenu';
import EmployerMenu from './EmployerMenu';
import AiAssistantCard from './AiAssistantCard';
import { stripPortalPrefix } from '@/configs/portalRouting';

const shellHeaderHeight = 60;

interface DrawerContentProps {
  isAdmin?: boolean;
  liveInterviewCount?: number;
  isCollapsed?: boolean;
  toggleCollapse?: () => void;
}

const getInitialExpandedItems = (pathname: string | null, isAdmin?: boolean) => {
  const initial = {
    candidates: false,
    interviews: false,
    account: false,
    hrm: false,
    system: false,
    categories: false,
    profiles: false,
    recruitment: false,
    content: false,
  };

  if (!pathname) return initial;
  const p = stripPortalPrefix(pathname);

  if (isAdmin) {
    if (p.includes('/users') || p.includes('/settings') || p.includes('/audit-logs')) {
      initial.system = true;
    } else if (p.includes('/careers') || p.includes('/cities') || p.includes('/districts') || p.includes('/wards')) {
      initial.categories = true;
    } else if (p.includes('/banners') || p.includes('/banner-types') || p.includes('/feedbacks') || p.includes('/contact-messages') || p.includes('/articles') || p.includes('/chat')) {
      initial.content = true;
    } else if (p.includes('/companies') || p.includes('/company-verifications') || p.includes('/profiles') || p.includes('/resumes')) {
      initial.profiles = true;
    } else if (p.includes('/jobs') || p.includes('/trust-reports') || p.includes('/job-activity') || p.includes('/interviews') || p.includes('/voice-profiles') || p.includes('/interview-preview')) {
      initial.recruitment = true;
    }
  } else {
    if (p.includes('/applied-profiles') || p.includes('/saved-profiles') || p.includes('/candidates') || p.includes('/profiles') || p.includes('ung-vien')) {
      initial.candidates = true;
    } else if (p.includes('/interviews') || p.includes('/question-bank') || p.includes('/question-groups') || p.includes('phong-van')) {
      initial.interviews = true;
    } else if (p.includes('/company') || p.includes('/verification') || p.includes('/account') || p.includes('/settings') || p.includes('tai-khoan')) {
      initial.account = true;
    } else if (p.includes('/hrm') || p.includes('hrm')) {
      initial.hrm = true;
    }
  }

  return initial;
};

const DrawerContent = ({ isAdmin, liveInterviewCount = 0, isCollapsed = false, toggleCollapse }: DrawerContentProps) => {
  const { t, i18n } = useTranslation(['admin', 'employer']);
  const pathname = usePathname();
  const location = { pathname: pathname || '', search: '', state: null, key: '' };
  const theme = useTheme();
  const dashboardHref = localizeRoutePath(
    `/${isAdmin ? ROUTES.ADMIN.DASHBOARD : ROUTES.EMPLOYER.DASHBOARD}`,
    i18n.language
  );

  const [expandedItems, setExpandedItems] = useState(() => getInitialExpandedItems(pathname, isAdmin));

  useEffect(() => {
    const currentExpanded = getInitialExpandedItems(pathname, isAdmin);
    setExpandedItems(prev => {
      const next = { ...prev };
      Object.keys(currentExpanded).forEach((key) => {
        if (currentExpanded[key as keyof typeof currentExpanded]) {
          next[key as keyof typeof next] = true;
        }
      });
      return next;
    });
  }, [pathname, isAdmin]);

  const handleExpand = (section: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [section]: !prev[section as keyof typeof prev]
    }));
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', bgcolor: '#ffffff' }}>
      <Toolbar
        disableGutters
        sx={{
          px: isCollapsed ? 1 : 2,
          py: 1,
          minHeight: shellHeaderHeight,
          height: shellHeaderHeight,
          flexShrink: 0,
          borderBottom: '1px solid #f1f5f9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: isCollapsed ? 'center' : 'space-between',
        }}
      >
        {!isCollapsed && (
          <Box
            component={Link}
            href={dashboardHref}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textDecoration: 'none',
              overflow: 'hidden',
            }}
          >
            <Box
              component="img"
              src={IMAGES.getTextLogo(theme.palette.mode === 'light' ? 'dark' : 'light')}
              sx={{ height: { xs: 32, sm: 36 }, width: 'auto', maxWidth: 140, objectFit: 'contain' }}
              alt="InfoHR"
            />
          </Box>
        )}

        {toggleCollapse && (
          <Tooltip title={isCollapsed ? "Mở rộng menu" : "Thu gọn menu"} placement="right" arrow>
            <IconButton aria-label="Thao tác"
              size="small"
              onClick={toggleCollapse}
              sx={{
                color: '#64748b',
                bgcolor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                p: 0.5,
                '&:hover': {
                  bgcolor: '#f1f5f9',
                  color: '#0f172a',
                },
              }}
            >
              {isCollapsed ? <ChevronRightIcon fontSize="small" /> : <ChevronLeftIcon fontSize="small" />}
            </IconButton>
          </Tooltip>
        )}
      </Toolbar>

      <Box sx={{ px: isCollapsed ? 0.5 : 1, py: 1.5, flexGrow: 1, overflowY: 'auto', overflowX: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <List component="nav" disablePadding sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {isAdmin ? (
            <AdminMenu t={t} location={location} expandedItems={expandedItems} handleExpand={handleExpand} language={i18n.language} isCollapsed={isCollapsed} />
          ) : (
            <EmployerMenu t={t} location={location} expandedItems={expandedItems} handleExpand={handleExpand} language={i18n.language} liveInterviewCount={liveInterviewCount} isCollapsed={isCollapsed} />
          )}
        </List>

        {!isAdmin && (
          <AiAssistantCard isCollapsed={isCollapsed} language={i18n.language} />
        )}
      </Box>
    </Box>
  );
};

export default DrawerContent;
