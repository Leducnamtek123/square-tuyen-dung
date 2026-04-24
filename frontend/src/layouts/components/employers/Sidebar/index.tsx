'use client';

import React from 'react';
import { Suspense } from 'react';
import { Drawer, useTheme, Theme } from "@mui/material";
import DrawerContent from './DrawerContent';
import type { Theme as StylesTheme } from '@mui/material/styles';

interface SidebarProps {
  drawerWidth: number;
  isAdmin?: boolean;
}

interface MobileSidebarProps extends SidebarProps {
  container?: Element | (() => Element | null) | null;
  mobileOpen: boolean;
  handleDrawerToggle: () => void;
}

const Sidebar = ({ drawerWidth, isAdmin }: SidebarProps) => {
  const theme = useTheme();

  return (
    <Drawer
      variant="permanent"
      sx={{
        display: {
          xs: 'none',
          sm: 'none',
          md: 'none',
          lg: 'none',
          xl: 'block',
        },
        '& .MuiDrawer-paper': {
          boxSizing: 'border-box',
          width: drawerWidth,
          borderRight: '0px',
          backgroundColor: theme.palette.background.paper,
          boxShadow: (theme as Theme).customShadows?.z8,
          borderRadius: '0px 10px 10px 0px',
        },
      }}
      open
    >
      <Suspense fallback={null}>
        <DrawerContent isAdmin={isAdmin} />
      </Suspense>
    </Drawer>
  );
};

const MobileSidebar = ({
  drawerWidth,
  container,
  mobileOpen,
  handleDrawerToggle,
  isAdmin,
}: MobileSidebarProps) => {
  const theme = useTheme();

  return (
    <Drawer
      container={container}
      variant="temporary"
      open={mobileOpen}
      onClose={handleDrawerToggle}
      ModalProps={{
        keepMounted: true,
      }}
      sx={{
        display: {
          xs: 'block',
          sm: 'block',
          md: 'block',
          lg: 'block',
          xl: 'none',
        },
        '& .MuiDrawer-paper': {
          boxSizing: 'border-box',
          width: drawerWidth,
          borderRight: '0px',
          backgroundColor: theme.palette.background.paper,
          boxShadow: (theme: StylesTheme & { customShadows?: Record<string, string> }) => theme.customShadows?.sidebar,
          borderRadius: '0px 10px 10px 0px',
        },
      }}
    >
      <Suspense fallback={null}>
        <DrawerContent isAdmin={isAdmin} />
      </Suspense>
    </Drawer>
  );
};

Sidebar.MobileSidebar = MobileSidebar;

export default Sidebar;
