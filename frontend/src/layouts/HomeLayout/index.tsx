'use client';

import React from 'react';
import { Box, Container } from "@mui/material";
import Header from '../components/commons/Header';
import SubHeader from '../components/commons/SubHeader';
import TopSlide from '../components/commons/TopSlide';
import Footer from '../components/commons/Footer';

const HomeLayout = ({ children }: { children?: React.ReactNode }) => {

  return (

    <Box>

      <Header />

      <SubHeader />

      <Container
        maxWidth="xl"
        sx={{
          paddingLeft: 0,
          paddingRight: 0,
        }}
      >

        <section>

          <TopSlide />

        </section>

      </Container>

      <Container
        maxWidth="xl"
        sx={{
          paddingLeft: { xs: 2, sm: 4, md: 6, lg: 8, xl: 8 },
          paddingRight: { xs: 2, sm: 4, md: 6, lg: 8, xl: 8 },
        }}
      >

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
