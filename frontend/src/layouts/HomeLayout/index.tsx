'use client';

import React from 'react';
import { Box, Container } from "@mui/material";
import Header from '../components/commons/Header';
import TopSlide from '../components/commons/TopSlide';
import Footer from '../components/commons/Footer';

const HomeLayout = ({ children }: { children?: React.ReactNode }) => {

  return (

    <Box sx={{ bgcolor: '#f8f9ff', minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
      <Header />

      <Box component="section" sx={{ width: '100%', overflow: 'hidden' }}>
        <TopSlide />
      </Box>

      <Container
        component="main"
        maxWidth="xl"
        sx={{
          px: { xs: 2, sm: 3, md: 4, lg: 6, xl: 6 },
          flex: 1,
        }}
      >
        {children}
      </Container>

      <Box
        component="footer"
        sx={{
          mt: 12,
          px: {
            xs: 2,
            sm: 5,
            md: 8,
            lg: 10,
            xl: 14,
          },
          py: {
            xs: 4,
            sm: 4,
            md: 5,
            lg: 6,
            xl: 6,
          },
          color: 'text.primary',
          bgcolor: 'background.paper',
          borderTop: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Footer />
      </Box>
    </Box>

  );

};

export default HomeLayout;
