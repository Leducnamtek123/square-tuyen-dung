'use client';

import * as React from 'react';

import PropTypes from 'prop-types';

import { Box } from "@mui/material";

import Header from '../components/employers/Header';
import Sidebar from '../components/employers/Sidebar';
import { useLiveInterviewCount } from '@/views/employerPages/InterviewPages/useLiveInterviewCount';
import ManagementFooter from '../components/commons/ManagementFooter';

interface EmployerLayoutProps {
  window?: () => Window;
  children?: React.ReactNode;
}

const EXPANDED_WIDTH = 250;
const COLLAPSED_WIDTH = 70;

function EmployerLayout(props: EmployerLayoutProps) {
  const { window, children } = props;
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
      if (typeof window !== 'undefined') {
        localStorage.setItem('square_sidebar_collapsed', String(next));
      }
      return next;
    });
  }, []);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const currentDrawerWidth = isCollapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH;

  const container =
    window !== undefined ? () => window().document.body : undefined;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
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
          transition: 'width 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
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
          minHeight: '100vh',
          width: {
            xs: '100%',
            md: `calc(100% - ${currentDrawerWidth}px)`,
          },
          transition: 'all 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <Box
          sx={{
            flexGrow: 1,
            p: {
              xs: 1,
              sm: 3,
            },
            mt: 7,
          }}
        >
          {children}
        </Box>
        <ManagementFooter />
      </Box>
    </Box>
  );
}

EmployerLayout.propTypes = {

  /**

   * Injected by the documentation to work in an iframe.

   * You won't need it on your project.

   */

  window: PropTypes.func,

};

export default EmployerLayout;
