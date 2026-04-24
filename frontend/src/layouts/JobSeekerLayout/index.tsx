'use client';

import React from "react";
import { Box, Container } from "@mui/material";
import Header from "../components/commons/Header";
import TabBar from "../components/jobSeekers/TabBar";
import Footer from "../components/commons/Footer";

const JobSeekerLayout = ({ children }: { children?: React.ReactNode }) => {

  return (

    <Box>

      <Header />

      <Box>

        <Container maxWidth="xl">

          <TabBar />

        </Container>

      </Box>

      <Container

        maxWidth="xl"

        sx={{

          my: {

            xs: 1.5,

            sm: 2,

            md: 3,

            lg: 3,

            xl: 3,

          },

          paddingLeft: { xs: 1, sm: 4, md: 6, lg: 8, xl: 8 },

          paddingRight: { xs: 1, sm: 4, md: 6, lg: 8, xl: 8 },

        }}

      >

        {children}

      </Container>

      <Box

        sx={{

          mt: {

            xs: 0,

            sm: 2,

            md: 6,

            lg: 8,

            xl: 10,

          },

          px: {

            xs: 1,

            sm: 5,

            md: 8,

            lg: 10,

            xl: 14,

          },

          py: {

            xs: 2,

            sm: 2,

            md: 2,

            lg: 5,

            xl: 5,

          },

          color: "text.primary",

          bgcolor: "background.paper",

          borderTop: '1px solid',

          borderColor: 'divider',

        }}

      >

        <Footer />

      </Box>

    </Box>

  );

};

export default JobSeekerLayout;
