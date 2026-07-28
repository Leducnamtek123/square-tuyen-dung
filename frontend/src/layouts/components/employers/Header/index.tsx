'use client';

import React from 'react';
import NextLink from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppSelector } from '@/redux/hooks';
import { useTranslation } from 'react-i18next';
import { AppBar, Avatar, Box, Breadcrumbs, Card, IconButton, Link as MuiLink, Stack, Toolbar, Typography } from "@mui/material";
import MenuIcon from '@mui/icons-material/Menu';
import UserMenu from '../../commons/UserMenu';
import AccountSwitchMenu from '../../commons/AccountSwitchMenu';
const NotificationCard = React.lazy(() => import('../../../../components/Features/NotificationCard'));
const ChatCard = React.lazy(() => import('../../../../components/Features/ChatCard'));
import LanguageSwitcher from '../../commons/LanguageSwitcher';
import { getPortalBreadcrumbs } from '@/configs/portalBreadcrumbs';
import { localizeRoutePath } from '@/configs/routeLocalization';

interface HeaderProps {
  drawerWidth: number;
  handleDrawerToggle: () => void;
}

const shellHeaderHeight = { xs: 56, sm: 64 };

const Header = ({ drawerWidth, handleDrawerToggle }: HeaderProps) => {
  const { t, i18n } = useTranslation(['common', 'employer', 'admin']);
  const pathname = usePathname() || '';
  const { currentUser, isAuthenticated } = useAppSelector((state) => state.user);
  const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);
  const breadcrumbs = React.useMemo(() => getPortalBreadcrumbs(pathname), [pathname]);

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const authArea = (
    <Box sx={{ flexGrow: 0, ml: 1 }}>
      <Card
        elevation={0}
        onClick={handleOpenUserMenu}
        sx={{
          p: '3px 12px 3px 3px',
          borderRadius: '30px',
          backgroundColor: '#f8fafc',
          border: '1px solid #e2e8f0',
          cursor: 'pointer',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            backgroundColor: '#f1f5f9',
            borderColor: '#cbd5e1',
          },
        }}
      >
        <Stack direction="row" justifyContent="center" alignItems="center" spacing={1}>
          <Avatar
            alt={currentUser?.fullName}
            src={currentUser?.avatarUrl ?? undefined}
            sx={{ width: 32, height: 32, fontSize: '0.875rem' }}
          />
          <Typography
            variant="subtitle2"
            sx={{
              color: '#0f172a',
              fontWeight: 600,
              fontSize: '0.85rem',
              display: { xs: 'none', sm: 'block' },
            }}
          >
            {currentUser?.fullName}
          </Typography>
        </Stack>
      </Card>
      <UserMenu
        anchorElUser={anchorElUser}
        open={Boolean(anchorElUser)}
        handleCloseUserMenu={handleCloseUserMenu}
      />
    </Box>
  );

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        width: { xs: '100%', md: `calc(100% - ${drawerWidth}px)` },
        ml: { xs: 0, md: `${drawerWidth}px` },
        transition: 'all 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
        minHeight: shellHeaderHeight,
        backgroundColor: '#ffffff',
        color: '#1e293b',
        borderBottom: '1px solid #f1f5f9',
        boxShadow: '0 2px 10px rgba(15, 23, 42, 0.03)',
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ minHeight: shellHeaderHeight, minWidth: 0 }}>
        <Toolbar sx={{ minHeight: shellHeaderHeight, minWidth: 0, flex: '1 1 auto' }}>
          <IconButton
            color="inherit"
            aria-label={t('actions.openDrawer')}
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          {/* <AccountSwitchMenu /> Remove or conditionally render this */}
          {!isAuthenticated && <AccountSwitchMenu />}
          {breadcrumbs.length > 0 && (
            <Breadcrumbs
              aria-label={t('breadcrumbs.label')}
              separator="/"
              sx={{
                display: { xs: 'none', sm: 'flex' },
                minWidth: 0,
                color: '#64748b',
                '& .MuiBreadcrumbs-ol': {
                  flexWrap: 'nowrap',
                  minWidth: 0,
                },
                '& .MuiBreadcrumbs-li': {
                  minWidth: 0,
                },
                '& .MuiBreadcrumbs-separator': {
                  mx: 1,
                  color: '#94a3b8',
                },
              }}
            >
              {breadcrumbs.map((breadcrumb, index) => {
                const label = t(`${breadcrumb.namespace}:${breadcrumb.labelKey}`);
                const isLast = index === breadcrumbs.length - 1;
                const href = breadcrumb.href ? localizeRoutePath(breadcrumb.href, i18n.language) : undefined;

                if (!href || isLast) {
                  return (
                    <Typography
                      key={`${breadcrumb.namespace}:${breadcrumb.labelKey}:${index}`}
                      variant="body2"
                      sx={{
                        maxWidth: { sm: 180, md: 260, lg: 360 },
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        color: '#0f172a',
                        fontWeight: 700,
                      }}
                    >
                      {label}
                    </Typography>
                  );
                }

                return (
                  <MuiLink
                    key={`${breadcrumb.namespace}:${breadcrumb.labelKey}:${index}`}
                    component={NextLink}
                    href={href}
                    underline="hover"
                    color="inherit"
                    sx={{
                      maxWidth: { sm: 180, md: 260, lg: 360 },
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: '#64748b',
                      '&:hover': {
                        color: '#0f172a',
                      },
                    }}
                  >
                    {label}
                  </MuiLink>
                );
              })}
            </Breadcrumbs>
          )}
        </Toolbar>
        <Toolbar sx={{ minHeight: shellHeaderHeight, flexShrink: 0 }}>
          <LanguageSwitcher color="inherit" />
          {isAuthenticated && (
            <React.Suspense fallback={<Box width={40} />}>
              <NotificationCard />
            </React.Suspense>
          )}
          {isAuthenticated && (
            <React.Suspense fallback={<Box width={40} />}>
              <ChatCard />
            </React.Suspense>
          )}
          {authArea}
        </Toolbar>
      </Stack>
    </AppBar>
  );
};

export default Header;
