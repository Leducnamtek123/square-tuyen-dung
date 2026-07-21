import React from 'react';
import { Box, Skeleton, Stack, Typography } from '@mui/material';

const ExperienceDetailCardLoading = () => (
  <Stack>
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
      {['summary', 'detail'].map((item) => (
        <Box sx={{ py: 1 }} key={item}>
          <Skeleton />
          <Skeleton />
          <Skeleton />
        </Box>
      ))}
    </Box>
  </Stack>
);

export default ExperienceDetailCardLoading;
