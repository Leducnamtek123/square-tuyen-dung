// @ts-nocheck
import React from 'react';

import { Box, Pagination, Stack } from "@mui/material";

import Grid from "@mui/material/Grid2";

import JobPost from '../JobPost';

interface Props {
  [key: string]: any;
}



const JobPosts = (_props: Props) => {

  return (

    <Box>

      <Stack spacing={4}>

        <Grid container spacing={2}>

          {[1, 2, 3, 4, 5, 6, 7, 7, 1, 2, 3, 4].map((value) => (

            <Grid

              size={{

                xs: 12,

                sm: 12,

                md: 12,

                lg: 12,

                xl: 12

              }}>

              <JobPost />

            </Grid>

          ))}

        </Grid>

        <Stack>

          <Pagination

            count={10}

            color="primary"

            size="medium"

            variant="text"

            sx={{ margin: '0 auto' }}

            page={1}

          />

        </Stack>

      </Stack>

    </Box>

  );

};

export default JobPosts;
