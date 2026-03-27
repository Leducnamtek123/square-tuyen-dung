import * as React from 'react';
import { Box } from '@mui/material';
import LanguageSwitcher from '../components/commons/LanguageSwitcher';

/**
 * AdminLoginLayout – A standalone layout for the admin login page.
 * No Header/Footer, full-screen gradient background.
 * Includes a LanguageSwitcher in the top-right corner.
 */
const AdminLoginLayout = ({ children }: { children?: React.ReactNode }) => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0f2027 0%, #203a43 40%, #2c5364 100%)',
        p: { xs: 0, sm: 2, md: 4 },
        position: 'relative',
      }}
    >
      {/* Language switcher – top-right corner */}
      <Box sx={{ position: 'absolute', top: 16, right: 16, zIndex: 10 }}>
        <LanguageSwitcher color="white" />
      </Box>
      {children}
    </Box>
  );
};

export default AdminLoginLayout;
