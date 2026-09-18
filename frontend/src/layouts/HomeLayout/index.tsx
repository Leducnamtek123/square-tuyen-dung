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

      <Footer />
    </Box>

  );

};

export default HomeLayout;
