'use client';

import { usePathname } from 'next/navigation';
import { Box, Container } from "@mui/material";
import Header from '../components/commons/Header';
import Footer from '../components/commons/Footer';

const AUTH_PATHS = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/employer/login',
  '/employer/register',
  '/employer/forgot-password',
  '/employer/reset-password',
];

const DefaultLayout = ({ children }: { children?: React.ReactNode }) => {
  const pathname = usePathname() || '';
  const isAuthPage = AUTH_PATHS.some((p) => pathname === p || pathname.endsWith(p));

  return (
    <Box sx={{ backgroundColor: isAuthPage ? { xs: '#FFFFFF', sm: 'inherit' } : 'inherit' }}>
      <Header />

      <Container
        component="main"
        maxWidth="xl"
        disableGutters={isAuthPage}
        sx={{
          paddingLeft: isAuthPage ? { xs: 0, sm: 4, md: 6, lg: 8, xl: 8 } : { xs: 2, sm: 4, md: 6, lg: 8, xl: 8 },
          paddingRight: isAuthPage ? { xs: 0, sm: 4, md: 6, lg: 8, xl: 8 } : { xs: 2, sm: 4, md: 6, lg: 8, xl: 8 },
          pb: isAuthPage ? { xs: 3, md: 4 } : { xs: 8, md: 4 },
        }}
      >
        {children}
      </Container>

      <Footer />
    </Box>
  );
};

export default DefaultLayout;
