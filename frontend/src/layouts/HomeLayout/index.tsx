'use client';

import React from 'react';
import { Box, Container } from "@mui/material";
import Header from '../components/commons/Header';
import TopSlide from '../components/commons/TopSlide';
import Footer from '../components/commons/Footer';

const HomeLayout = ({ children }: { children?: React.ReactNode }) => {

  return (

    <Box sx={{ bgcolor: '#f8f9ff' }}>

      <Header />

      <Container
        maxWidth="xl"
        sx={{
          px: { xs: 2, sm: 3, md: 4, lg: 6, xl: 6 },
        }}
      >
        <section>
          <TopSlide />
        </section>
        <section>
          {children}
        </section>
      </Container>

      <Box
        sx={{
          mt: 10,
          px: {
            xs: 2,
            sm: 5,
            md: 8,
            lg: 10,
            xl: 14,
          },
          py: {
            xs: 3,
            sm: 3,
            md: 3,
            lg: 5,
            xl: 5,
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
