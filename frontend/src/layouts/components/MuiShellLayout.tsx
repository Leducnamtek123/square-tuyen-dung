'use client';

import * as React from 'react';
import { useAppSelector } from '@/redux/hooks';

import { usePathname } from 'next/navigation';

import { AppBar, Avatar, Box, CssBaseline, Divider, Drawer, IconButton, List, Stack, Toolbar, Typography } from "@mui/material";

import MenuIcon from '@mui/icons-material/Menu';

import AccountSwitchMenu from './commons/AccountSwitchMenu';

import UserMenu from './commons/UserMenu';

import NotificationCard from '../../components/Features/NotificationCard';

import ChatCard from '../../components/Features/ChatCard';

import LanguageSwitcher from './commons/LanguageSwitcher';

import { IMAGES } from '../../configs/constants';

import MuiShellNavList, { type NavItem } from './MuiShellNavList';

interface MuiShellLayoutProps {
  title?: string;
  navItems: NavItem[];
  children: React.ReactNode;
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

    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>

      <CssBaseline />

      <AppBar position="fixed" color="primary">

        <Toolbar sx={{ gap: 2, justifyContent: 'space-between' }}>

          <Stack direction="row" alignItems="center" spacing={2}>

            <IconButton

              color="inherit"

              aria-label="open drawer"

              edge="start"

              onClick={handleDrawerToggle}

              sx={{ display: { sm: 'none' } }}

            >

              <MenuIcon />

            </IconButton>

            <AccountSwitchMenu />

            {title ? <Typography variant="h6">{title}</Typography> : null}

          </Stack>

          <Stack direction="row" alignItems="center" spacing={1}>

            <LanguageSwitcher />

            {isAuthenticated && <NotificationCard />}

            {isAuthenticated && <ChatCard />}

            <Stack

              direction="row"

              alignItems="center"

              spacing={1}

              onClick={handleOpenUserMenu}

              sx={{ cursor: 'pointer' }}

            >

              <Avatar src={currentUser?.avatarUrl || undefined} />

              <Typography variant="subtitle1" sx={{ display: { xs: 'none', sm: 'block' }, color: 'inherit' }}>

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

      <Box component="main" sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` } }}>

        <Toolbar />

        {children}

      </Box>

    </Box>

  );

};

export default MuiShellLayout;
