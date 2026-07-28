'use client';

import React, { Suspense } from 'react';
import { Drawer, useTheme } from "@mui/material";
import DrawerContent from './DrawerContent';
import type { Theme as StylesTheme } from '@mui/material/styles';

interface SidebarProps {
  drawerWidth: number;
  isAdmin?: boolean;
  liveInterviewCount?: number;
  isCollapsed?: boolean;
  toggleCollapse?: () => void;
}

interface MobileSidebarProps extends SidebarProps {
  container?: Element | (() => Element | null) | null;
  mobileOpen: boolean;
  handleDrawerToggle: () => void;
}

const Sidebar = ({ drawerWidth, isAdmin, liveInterviewCount, isCollapsed = false, toggleCollapse }: SidebarProps) => {
  const theme = useTheme();

  return (
    <Drawer
      variant="permanent"
      sx={{
        display: {
          xs: 'none',
          md: 'block',
        },
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          boxSizing: 'border-box',
          width: drawerWidth,
          borderRight: '1px solid #f1f5f9',
          backgroundColor: '#ffffff',
          boxShadow: '4px 0 20px rgba(15, 23, 42, 0.02)',
          borderRadius: 0,
          transition: 'width 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
          overflowX: 'hidden',
        },
      }}
      open
    >
      <Suspense fallback={null}>
        <DrawerContent isAdmin={isAdmin} liveInterviewCount={liveInterviewCount} isCollapsed={isCollapsed} toggleCollapse={toggleCollapse} />
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
  liveInterviewCount,
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
          md: 'none',
        },
        '& .MuiDrawer-paper': {
          boxSizing: 'border-box',
          width: drawerWidth,
          borderRight: '0px',
          backgroundColor: theme.palette.background.paper,
          boxShadow: (theme: StylesTheme & { customShadows?: Record<string, string> }) => theme.customShadows?.sidebar,
          borderRadius: 0,
        },
      }}
    >
      <Suspense fallback={null}>
        <DrawerContent isAdmin={isAdmin} liveInterviewCount={liveInterviewCount} isCollapsed={false} />
      </Suspense>
    </Drawer>
  );
};

Sidebar.MobileSidebar = MobileSidebar;

export default Sidebar;
