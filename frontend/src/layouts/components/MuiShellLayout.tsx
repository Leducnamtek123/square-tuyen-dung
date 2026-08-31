'use client';

import * as React from 'react';
import { useAppSelector } from '@/redux/hooks';
import { useTranslation } from 'react-i18next';

import { usePathname } from 'next/navigation';

import { AppBar, Avatar, Box, CssBaseline, Divider, Drawer, IconButton, List, Stack, Toolbar, Typography } from "@mui/material";

import MenuIcon from '@mui/icons-material/Menu';

import AccountSwitchMenu from './commons/AccountSwitchMenu';

import UserMenu from './commons/UserMenu';

import NotificationCard from '@/components/Features/NotificationCard';

import ChatCard from '@/components/Features/ChatCard';

import LanguageSwitcher from './commons/LanguageSwitcher';
import ManagementFooter from './commons/ManagementFooter';

import { IMAGES } from '@/configs/constants';

import MuiShellNavList, { type NavItem } from './MuiShellNavList';

interface MuiShellLayoutProps {
  title?: string;
  navItems: NavItem[];
  children: any;
}
const drawerWidth = 240;

const createInitialExpanded = (items: NavItem[]) => {
  const expanded: Record<string, boolean> = {};

  items.forEach((item) => {

    if (item.children && item.children.length) {

      expanded[item.id] = true;

    }

  });

  return expanded;

};

const MuiShellLayout = ({ title, navItems, children }: MuiShellLayoutProps) => {

  const { t } = useTranslation('common');

  const pathname = usePathname();

  const { currentUser, isAuthenticated } = useAppSelector((state) => state.user);

  const [mobileOpen, setMobileOpen] = React.useState(false);

  const [expandedItems, setExpandedItems] = React.useState<Record<string, boolean>>(() => createInitialExpanded(navItems));

  const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);

  const handleDrawerToggle = () => {

    setMobileOpen(!mobileOpen);

  };

  const handleToggleGroup = (id: string) => {

    setExpandedItems((prev) => ({ ...prev, [id]: !prev[id] }));

  };

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {

    setAnchorElUser(event.currentTarget);

  };

  const handleCloseUserMenu = () => {

    setAnchorElUser(null);

  };

  const drawer = (

    <Box>

      <Toolbar sx={{ justifyContent: 'center' }}>

        <Avatar src={IMAGES.getTextLogo('dark')} variant="rounded" sx={{ height: 40, width: 'auto' }} />

      </Toolbar>

      <Divider />

      <List>

        <MuiShellNavList
          items={navItems}
          expandedItems={expandedItems}
          onToggleGroup={handleToggleGroup}
          currentPathname={pathname}
        />

      </List>

    </Box>

  );

  return (

    <Box sx={{ display: 'flex', minHeight: '100dvh', bgcolor: 'background.default' }}>

      <CssBaseline />

      <AppBar position="fixed" color="primary">

        <Toolbar sx={{ gap: { xs: 1, sm: 2 }, justifyContent: 'space-between', px: { xs: 1, sm: 2 } }}>

          <Stack direction="row" alignItems="center" spacing={{ xs: 0.5, sm: 1.5 }} sx={{ minWidth: 0, flexShrink: 1 }}>

            <IconButton

              color="inherit"

              aria-label={t('actions.openDrawer')}

              edge="start"

              onClick={handleDrawerToggle}

              sx={{ display: { sm: 'none' } }}

            >

              <MenuIcon />

            </IconButton>

            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
              <AccountSwitchMenu />
            </Box>

            {title ? (
              <Typography
                variant="h6"
                noWrap
                sx={{
                  fontSize: { xs: '0.95rem', sm: '1.25rem' },
                  fontWeight: 700,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: { xs: 150, sm: 280, md: 'none' },
                }}
              >
                {title}
              </Typography>
            ) : null}

          </Stack>

          <Stack direction="row" alignItems="center" spacing={{ xs: 0.5, sm: 1 }} sx={{ flexShrink: 0 }}>

            <LanguageSwitcher />

            {isAuthenticated && (
              <Box sx={{ display: { xs: 'none', sm: 'flex' } }}>
                <NotificationCard />
              </Box>
            )}

            {isAuthenticated && (
              <Box sx={{ display: { xs: 'none', sm: 'flex' } }}>
                <ChatCard />
              </Box>
            )}

            <Stack

              direction="row"

              alignItems="center"

              spacing={1}

              onClick={handleOpenUserMenu}

              sx={{ cursor: 'pointer' }}

            >

              <Avatar src={currentUser?.avatarUrl || undefined} sx={{ width: 34, height: 34 }}>
                {currentUser?.fullName?.charAt(0)?.toUpperCase()}
              </Avatar>

              <Typography variant="subtitle1" sx={{ display: { xs: 'none', md: 'block' }, color: 'inherit' }}>

                {currentUser?.fullName}

              </Typography>

            </Stack>

            <UserMenu

              anchorElUser={anchorElUser}

              open={Boolean(anchorElUser)}

              handleCloseUserMenu={handleCloseUserMenu}

            />

          </Stack>

        </Toolbar>

      </AppBar>

      <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>

        <Drawer

          variant="temporary"

          open={mobileOpen}

          onClose={handleDrawerToggle}

          ModalProps={{ keepMounted: true }}

          sx={{

            display: { xs: 'block', sm: 'none' },

            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },

          }}

        >

          {drawer}

        </Drawer>

        <Drawer

          variant="permanent"

          open

          sx={{

            display: { xs: 'none', sm: 'block' },

            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },

          }}

        >

          {drawer}

        </Drawer>

      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100dvh',
          p: { xs: 1.5, sm: 2.5, md: 3 },
          width: { sm: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Toolbar />
        <Box sx={{ flexGrow: 1 }}>
          {children}
        </Box>
        <ManagementFooter />
      </Box>

    </Box>

  );

};

export default MuiShellLayout;
