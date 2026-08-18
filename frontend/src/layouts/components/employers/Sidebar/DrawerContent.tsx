'use client';

import React, { useState } from 'react';
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

  if (isAdmin) {
    if (pathname.includes('/admin/users') || pathname.includes('/admin/settings') || pathname.includes('/admin/audit-logs')) {
      initial.system = true;
    } else if (pathname.includes('/admin/careers') || pathname.includes('/admin/cities') || pathname.includes('/admin/districts') || pathname.includes('/admin/wards')) {
      initial.categories = true;
    } else if (pathname.includes('/admin/banners') || pathname.includes('/admin/banner-types') || pathname.includes('/admin/feedbacks') || pathname.includes('/admin/contact-messages') || pathname.includes('/admin/articles') || pathname.includes('/admin/chat')) {
      initial.content = true;
    } else if (pathname.includes('/admin/companies') || pathname.includes('/admin/company-verifications') || pathname.includes('/admin/profiles') || pathname.includes('/admin/resumes')) {
      initial.profiles = true;
    } else if (pathname.includes('/admin/jobs') || pathname.includes('/admin/questions') || pathname.includes('/admin/question-groups') || pathname.includes('/admin/trust-reports') || pathname.includes('/admin/job-activity') || pathname.includes('/admin/interviews') || pathname.includes('/admin/voice-profiles') || pathname.includes('/admin/job-notifications') || pathname.includes('/admin/interview-preview')) {
      initial.recruitment = true;
    }
  } else {
    if (pathname.includes('/employer/applied-profiles') || pathname.includes('/employer/saved-profiles') || pathname.includes('/employer/candidates') || pathname.includes('/employer/profiles')) {
      initial.candidates = true;
    } else if (pathname.includes('/employer/interviews') || pathname.includes('/employer/question-bank') || pathname.includes('/employer/question-groups')) {
      initial.interviews = true;
    } else if (pathname.includes('/employer/company') || pathname.includes('/employer/verification') || pathname.includes('/employer/account') || pathname.includes('/employer/settings')) {
      initial.account = true;
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
