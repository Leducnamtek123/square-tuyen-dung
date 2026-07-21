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
        variant="outlined"
        onClick={handleOpenUserMenu}
        sx={{
          p: 0.5,
          borderRadius: 50,
          backgroundColor: 'transparent',
          borderColor: '#7e57c2',
          cursor: 'pointer',
        }}
      >
        <Stack direction="row" justifyContent="center" alignItems="center">
          <Avatar alt={currentUser?.fullName} src={currentUser?.avatarUrl ?? undefined} />
          <Typography
            variant="subtitle1"
            sx={{
              px: 1,
              color: 'white',
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
      sx={{
        width: { xl: `calc(100% - ${drawerWidth}px)` },
        ml: { sm: `${drawerWidth}px` },
        minHeight: shellHeaderHeight,
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ minHeight: shellHeaderHeight, minWidth: 0 }}>
        <Toolbar sx={{ minHeight: shellHeaderHeight, minWidth: 0, flex: '1 1 auto' }}>
          <IconButton
            color="inherit"
            aria-label={t('actions.openDrawer')}
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { xl: 'none' } }}
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
                color: 'rgba(255,255,255,0.65)',
                '& .MuiBreadcrumbs-ol': {
                  flexWrap: 'nowrap',
                  minWidth: 0,
                },
                '& .MuiBreadcrumbs-li': {
                  minWidth: 0,
                },
                '& .MuiBreadcrumbs-separator': {
                  mx: 1,
                  color: 'rgba(255,255,255,0.55)',
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
                        color: 'common.white',
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
          <LanguageSwitcher />
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
