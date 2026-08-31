'use client';

import * as React from 'react';

import { Box } from "@mui/material";

import Header from '../components/employers/Header';
import Sidebar from '../components/employers/Sidebar';
import { useLiveInterviewCount } from '@/views/employerPages/InterviewPages/useLiveInterviewCount';
import ManagementFooter from '../components/commons/ManagementFooter';

interface EmployerLayoutProps {
  windowGetter?: () => unknown;
  children?: React.ReactNode;
}

const EXPANDED_WIDTH = 240;
const COLLAPSED_WIDTH = 64;

function EmployerLayout(props: EmployerLayoutProps) {
  const { windowGetter, children } = props;
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [isCollapsed, setIsCollapsed] = React.useState<boolean>(false);
  const liveInterviewCount = useLiveInterviewCount();

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('square_sidebar_collapsed');
      if (saved === 'true') {
        setIsCollapsed(true);
      }
    }
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
          isAdmin={false}
          liveInterviewCount={liveInterviewCount}
          isCollapsed={isCollapsed}
          toggleCollapse={toggleCollapse}
        />
        <Sidebar.MobileSidebar
          drawerWidth={EXPANDED_WIDTH}
          container={container}
          mobileOpen={mobileOpen}
          handleDrawerToggle={handleDrawerToggle}
          isAdmin={false}
          liveInterviewCount={liveInterviewCount}
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
    </Box>
  );
}

export default EmployerLayout;
