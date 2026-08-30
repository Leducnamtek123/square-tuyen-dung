'use client';

import * as React from 'react';
import PropTypes from 'prop-types';
import { Box } from "@mui/material";

import Header from '../components/employers/Header';
import Sidebar from '../components/employers/Sidebar';
import ManagementFooter from '../components/commons/ManagementFooter';
import AdminCommandPalette from '@/components/Common/AdminCommandPalette';

interface AdminLayoutProps {
  windowGetter?: () => unknown;
  children?: React.ReactNode;
}

const EXPANDED_WIDTH = 240;
const COLLAPSED_WIDTH = 64;

const AdminLayout = (props: AdminLayoutProps) => {
  const { windowGetter, children } = props;
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [isCollapsed, setIsCollapsed] = React.useState<boolean>(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('square_sidebar_collapsed');
      if (saved === 'true') {
        setIsCollapsed(true);
      }
    }
  }, []);

  // Global Ctrl+K / Cmd+K shortcut
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleCollapse = React.useCallback(() => {
    setIsCollapsed((prev) => {
      const next = !prev;
      return next;
    });
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('square_sidebar_collapsed', String(!isCollapsed));
      } catch (err) {
        console.warn('Could not save sidebar collapsed state:', err);
      }
    }
  }, [isCollapsed]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const currentDrawerWidth = isCollapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH;

  const container =
    windowGetter !== undefined ? () => (windowGetter() as Window).document.body : undefined;

  return (
    <Box sx={{ display: 'flex', minHeight: '100dvh', backgroundColor: '#F8FAFC' }}>
      {/* Start: Header */}
      <Header
        drawerWidth={currentDrawerWidth}
        handleDrawerToggle={handleDrawerToggle}
      />
      {/* End: Header */}

      <Box
        component="nav"
        sx={{
          width: { md: currentDrawerWidth },
          flexShrink: { md: 0 },
          transition: 'width 150ms cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* Start: Sidebar */}
        <Sidebar
          drawerWidth={currentDrawerWidth}
          isAdmin
          isCollapsed={isCollapsed}
          toggleCollapse={toggleCollapse}
        />
        <Sidebar.MobileSidebar
          drawerWidth={EXPANDED_WIDTH}
          container={container}
          mobileOpen={mobileOpen}
          handleDrawerToggle={handleDrawerToggle}
          isAdmin
        />
        {/* End: Sidebar */}
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100dvh',
          width: {
            xs: '100%',
            md: `calc(100% - ${currentDrawerWidth}px)`,
          },
          transition: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <Box
          sx={{
            flexGrow: 1,
            mt: '60px',
            bgcolor: '#F8FAFC',
            display: 'flex',
            justifyContent: 'center',
            width: '100%',
          }}
        >
          <Box
            sx={{
              width: '100%',
              maxWidth: '1600px',
              p: {
                xs: 2, // 16px
                sm: 3, // 24px (8pt system)
              },
            }}
          >
            {children}
          </Box>
        </Box>
        <ManagementFooter />
      </Box>

      {/* Global Admin Command Palette (Ctrl+K) */}
      <AdminCommandPalette
        open={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
      />
    </Box>
  );
};

AdminLayout.propTypes = {
  window: PropTypes.func,
};

export default AdminLayout;
