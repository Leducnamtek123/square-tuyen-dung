'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Card,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import GridViewIcon from '@mui/icons-material/GridView';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import AutoFixHighOutlinedIcon from '@mui/icons-material/AutoFixHighOutlined';
import { APP_NAME } from '@/configs/constants';
import { localizeRoutePath } from '@/configs/routeLocalization';
import CandidateCompletenessBannerCard from '../CandidateDashboardMain/CandidateCompletenessBannerCard';
import CandidateQuickSupportCard from '../CandidateDashboardMain/CandidateQuickSupportCard';

interface CandidateSidebarProps {
  completenessPercent?: number;
}

const CandidateSidebar = ({ completenessPercent }: CandidateSidebarProps) => {
  const pathname = usePathname() || '';
  const { t, i18n } = useTranslation('common');

  // Helper function to check if a route is active regardless of language prefix (/vi/, /en/) or localized slug (/tai-khoan, /ho-so, /viec-lam)
  const isRouteActive = (key: string, rawPath: string, localizedPath: string) => {
    const cleanPathname = pathname.replace(/^\/(vi|en)/, '');
    const cleanLocalizedPath = localizedPath.replace(/^\/(vi|en)/, '');

    if (key === 'dashboard') {
      return (
        cleanPathname === '/' ||
        cleanPathname === '' ||
        cleanPathname.includes('/dashboard') ||
        cleanPathname.includes('/bang-dieu-khien') ||
        cleanPathname.includes('/trang-chu')
      );
    }

    if (cleanPathname === cleanLocalizedPath || cleanPathname === rawPath) {
      return true;
    }

    switch (key) {
      case 'profile':
        return cleanPathname.includes('/profile') || cleanPathname.includes('/ho-so');
      case 'cv-templates':
        return (
          cleanPathname.includes('/trang-tri-cv') ||
          cleanPathname.includes('/danh-sach-mau-cv') ||
          cleanPathname.includes('/cv-templates') ||
          cleanPathname.includes('/mau-cv')
        );
      case 'my-jobs':
        return cleanPathname.includes('/my-jobs') || cleanPathname.includes('/viec-lam');
      case 'my-interviews':
        return cleanPathname.includes('/my-interviews') || cleanPathname.includes('/phong-van');
      case 'account':
        return (
          cleanPathname.includes('/account') ||
          cleanPathname.includes('/tai-khoan') ||
          cleanPathname.includes('/settings') ||
          cleanPathname.includes('/cai-dat')
        );
      default:
        return false;
    }
  };

  const rawMenuItems = [
    {
      key: 'dashboard',
      label: 'Tổng quan',
      icon: <GridViewIcon />,
      rawPath: '/dashboard',
    },
    {
      key: 'profile',
      label: 'Hồ sơ của tôi',
      icon: <BadgeOutlinedIcon />,
      rawPath: '/profile',
    },
    {
      key: 'cv-templates',
      label: 'Trang trí CV',
      icon: <AutoFixHighOutlinedIcon />,
      rawPath: '/ung-vien/trang-tri-cv',
    },
    {
      key: 'my-jobs',
      label: 'Quản lý việc làm',
      icon: <WorkOutlineIcon />,
      rawPath: '/my-jobs',
    },
    {
      key: 'my-interviews',
      label: 'Phòng vấn của tôi',
      icon: <VideocamOutlinedIcon />,
      rawPath: '/my-interviews',
    },
    {
      key: 'account',
      label: 'Cài đặt tài khoản',
      icon: <SettingsOutlinedIcon />,
      rawPath: '/account',
    },
  ];

  const menuItems = rawMenuItems.map((item) => {
    const localizedPath = localizeRoutePath(item.rawPath, i18n.language);
    const active = isRouteActive(item.key, item.rawPath, localizedPath);
    return {
      ...item,
      path: localizedPath,
      active,
    };
  });

  return (
    <>
      {/* ── Mobile Layout (< 900px) ── */}
      <Box
        sx={{
          display: { xs: 'flex', md: 'none' },
          flexDirection: 'column',
          gap: 1.5,
          mb: 1.5,
          width: '100%',
        }}
      >
        {/* Sticky Horizontal Navigation Strip */}
        <Box
          component="nav"
          aria-label={t('nav.candidateNav', { defaultValue: 'Điều hướng ứng viên' })}
          sx={{
            position: 'sticky',
            top: { xs: 56, sm: 64 },
            zIndex: 10,
            backgroundColor: 'rgba(248, 250, 252, 0.95)',
            backdropFilter: 'blur(10px)',
            mx: { xs: -1.5, sm: -2 },
            px: { xs: 1.5, sm: 2 },
            py: 1,
            borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
            overflowX: 'auto',
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': { display: 'none' },
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              gap: 1,
              minWidth: 'max-content',
              py: 0.25,
            }}
          >
            {menuItems.map((item) => (
              <Box
                key={item.key}
                component={Link}
                href={item.path}
                aria-current={item.active ? 'page' : undefined}
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 1,
                  minHeight: 44,
                  px: 1.75,
                  py: 0.75,
                  borderRadius: '12px',
                  textDecoration: 'none',
                  whiteSpace: 'nowrap',
                  fontWeight: item.active ? 700 : 600,
                  fontSize: '0.85rem',
                  backgroundColor: item.active ? '#2563eb' : '#ffffff',
                  color: item.active ? '#ffffff' : '#475569',
                  border: '1px solid',
                  borderColor: item.active ? '#2563eb' : '#e2e8f0',
                  boxShadow: item.active ? '0 2px 8px rgba(37, 99, 235, 0.25)' : '0 1px 3px rgba(0,0,0,0.03)',
                  transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
                  '&:hover': {
                    transform: 'translateY(-1px)',
                    boxShadow: item.active ? '0 4px 12px rgba(37, 99, 235, 0.3)' : '0 2px 6px rgba(0,0,0,0.06)',
                  },
                  '&:active': {
                    transform: 'scale(0.98)',
                  },
                  '&:focus-visible': {
                    outline: '2px solid #2563eb',
                    outlineOffset: '2px',
                  },
                }}
              >
                {React.cloneElement(item.icon, {
                  sx: {
                    fontSize: 20,
                    color: item.active ? '#ffffff' : '#64748b',
                  },
                })}
                <span>{item.label}</span>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Compact Profile Completeness Banner Card */}
        <CandidateCompletenessBannerCard completenessPercent={completenessPercent} />

        {/* Compact Quick Support Card */}
        <CandidateQuickSupportCard />
      </Box>

      {/* ── Desktop Layout (>= 900px) ── */}
      <Box
        component="nav"
        aria-label={t('nav.candidateNav', { defaultValue: 'Điều hướng ứng viên' })}
        sx={{
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          gap: 2.5,
        }}
      >
        {/* Sidebar Navigation Card */}
        <Card
          elevation={0}
          sx={{
            p: 1.5,
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            backgroundColor: '#ffffff',
            boxShadow: '0 4px 20px -2px rgba(0,0,0,0.03)',
          }}
        >
          <List disablePadding>
            {menuItems.map((item) => (
              <ListItemButton
                key={item.key}
                component={Link}
                href={item.path}
                aria-current={item.active ? 'page' : undefined}
                sx={{
                  borderRadius: '12px',
                  mb: 0.5,
                  py: 1.2,
                  px: 2,
                  minHeight: 44,
                  backgroundColor: item.active ? '#eff6ff' : 'transparent',
                  color: item.active ? '#2563eb' : '#475569',
                  fontWeight: item.active ? 700 : 500,
                  borderLeft: item.active ? '4px solid #2563eb' : '4px solid transparent',
                  '&:hover': {
                    backgroundColor: item.active ? '#eff6ff' : '#f8fafc',
                    color: item.active ? '#2563eb' : '#0f172a',
                    transform: 'translateX(2px)',
                  },
                  '&:focus-visible': {
                    outline: '2px solid #2563eb',
                    outlineOffset: '2px',
                  },
                  transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              >
                <ListItemIcon
                  sx={{
                    color: item.active ? '#2563eb' : '#64748b',
                    minWidth: 36,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontSize: '0.925rem',
                    fontWeight: item.active ? 700 : 500,
                  }}
                />
              </ListItemButton>
            ))}
          </List>
        </Card>

        {/* Candidate Completeness Banner Card directly below sidebar navigation */}
        <CandidateCompletenessBannerCard completenessPercent={completenessPercent} />

        {/* Quick Support Card below completeness banner */}
        <CandidateQuickSupportCard />
      </Box>
    </>
  );
};

export default CandidateSidebar;
