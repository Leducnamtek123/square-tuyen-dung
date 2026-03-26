import * as React from 'react';
import { Box } from '@mui/material';

/**
 * AdminLoginLayout – A standalone layout for the admin login page.
 * No Header/Footer, full-screen gradient background.
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
      }}
    >
      {children}
    </Box>
  );
};

export default AdminLoginLayout;
