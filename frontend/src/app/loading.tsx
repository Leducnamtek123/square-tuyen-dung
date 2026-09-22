'use client';

import { Box, CircularProgress } from '@mui/material';

export default function Loading() {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '120px',
        width: '100%',
        py: 4,
      }}
    >
      <CircularProgress size={32} thickness={4} sx={{ color: '#2563eb' }} />
    </Box>
  );
}
