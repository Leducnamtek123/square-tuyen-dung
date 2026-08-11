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
import { APP_NAME } from '@/configs/constants';
import { localizeRoutePath } from '@/configs/routeLocalization';
import CandidateCompletenessBannerCard from '../CandidateDashboardMain/CandidateCompletenessBannerCard';
import CandidateQuickSupportCard from '../CandidateDashboardMain/CandidateQuickSupportCard';

interface CandidateSidebarProps {
  completenessPercent?: number;
}

const CandidateSidebar = ({ completenessPercent }: CandidateSidebarProps) => {
  const pathname = usePathname() || '';
  const { i18n } = useTranslation('common');

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
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
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
              sx={{
                borderRadius: '12px',
                mb: 0.5,
                py: 1.2,
                px: 2,
                backgroundColor: item.active ? '#eff6ff' : 'transparent',
                color: item.active ? '#2563eb' : '#475569',
                fontWeight: item.active ? 700 : 500,
                borderLeft: item.active ? '4px solid #2563eb' : '4px solid transparent',
                '&:hover': {
                  backgroundColor: item.active ? '#eff6ff' : '#f8fafc',
                  color: item.active ? '#2563eb' : '#0f172a',
                },
                transition: 'all 0.2s ease-in-out',
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
  );
};

export default CandidateSidebar;
