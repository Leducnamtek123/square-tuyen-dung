import React from 'react';
import { Box, Skeleton, Stack, Typography } from '@mui/material';
import { Grid2 as Grid } from '@mui/material';

const GeneralInfoCardLoading = () => (
  <Box sx={{ p: 3, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 'custom.info' }}>
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
        <Typography variant="h6" flex={1}>
          <Skeleton />
        </Typography>
        <Box>
          <Skeleton variant="circular" width={50} height={50} />
        </Box>
      </Stack>
    </Box>

    <Box sx={{ px: 1 }}>
      <Box sx={{ py: 2 }}>
        <Skeleton height={5} />
      </Box>

      <Grid container spacing={4}>
        <Grid size={6}>
          {Array(8)
            .fill(0)
            .map((_, index) => (
              <Typography component="div" variant="h5" key={index}>
                <Skeleton />
              </Typography>
            ))}
        </Grid>

        <Grid size={6}>
          {Array(8)
            .fill(0)
            .map((_, index) => (
              <Typography component="div" variant="h5" key={index}>
                <Skeleton />
              </Typography>
            ))}
        </Grid>
      </Grid>
    </Box>
  </Box>
);

export default GeneralInfoCardLoading;
