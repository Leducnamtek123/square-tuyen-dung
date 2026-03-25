import React from 'react';
import { Box, Card, Stack, Typography, Skeleton } from '@mui/material';

const Loading = () => (
  <Card 
    sx={{ 
      p: 2,
      boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
      border: `1px solid rgba(0,0,0,0.12)`,
      borderRadius: 2
    }}
  >
    <Stack direction="row" spacing={2}>
      <Box>
        <Skeleton 
          variant="rounded" 
          width={85} 
          height={85}
          sx={{ borderRadius: 2 }}
        />
      </Box>
      <Box flex={1}>
        <Typography variant="h6" gutterBottom>
          <Skeleton height={35} width="80%" />
        </Typography>
        <Typography variant="body2">
          <Skeleton height={25} width="60%" />
        </Typography>
        <Typography variant="body2">
          <Skeleton height={25} width="40%" />
        </Typography>
      </Box>
    </Stack>
  </Card>
);

export default Loading;
