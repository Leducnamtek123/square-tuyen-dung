import React from 'react';
import { Avatar, Box, Card, Skeleton, Stack, Typography } from '@mui/material';

const CompanyLoading = () => (
  <Card
    sx={{
      p: 2,
      boxShadow: 0,
    }}
  >
    <Stack>
      <Box>
        <Skeleton variant="rounded" height={150} />
      </Box>

      <Box sx={{ px: 2 }}>
        <Stack direction="row" justifyContent="space-between" spacing={2}>
          <Avatar
            sx={{
              width: 85,
              height: 85,
              marginTop: -5,
              backgroundColor: 'white',
            }}
            variant="rounded"
          >
            <Skeleton variant="rounded" sx={{ width: 85, height: 85 }} />
          </Avatar>

          <Box flex={1} sx={{ py: 1 }}>
            <Typography variant="caption" display="block">
              <Skeleton />
            </Typography>
          </Box>
        </Stack>
      </Box>

      <Box sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          <Skeleton />
        </Typography>
        <Typography variant="body2" gutterBottom>
          <Skeleton />
        </Typography>
        <Typography variant="body2" gutterBottom>
          <Skeleton />
        </Typography>
        <Typography variant="body2" gutterBottom>
          <Skeleton />
        </Typography>
        <Typography variant="body2" gutterBottom>
          <Skeleton />
        </Typography>
      </Box>

      <Box sx={{ px: 2 }}>
        <Skeleton variant="rounded" height={30} />
      </Box>
    </Stack>
  </Card>
);

export default CompanyLoading;
