'use client';

import * as React from 'react';
import { Box, Container } from "@mui/material";
import Header from '../components/commons/Header';
import Footer from '../components/commons/Footer';

const DefaultLayout = ({ children }: { children?: React.ReactNode }) => {

  return (

    <Box>

      <Header />

      <Container
        maxWidth="xl"
        sx={{
          paddingLeft: { xs: 2, sm: 4, md: 6, lg: 8, xl: 8 },
          paddingRight: { xs: 2, sm: 4, md: 6, lg: 8, xl: 8 },
          pb: { xs: 8, md: 4 },
        }}
      >
        <section>
          {children}
        </section>
      </Container>

      <Footer />
    </Box>

  );

};

export default DefaultLayout;
