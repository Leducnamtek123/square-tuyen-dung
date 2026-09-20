import React from 'react';
import { Box, Card, Skeleton, Stack } from '@mui/material';

const CompanyLoading = () => (
  <Card
    sx={{
      p: 0,
      width: '100%',
      height: '100%',
      minHeight: 410,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      borderRadius: '18px',
      border: '1px solid #e2e8f0',
      bgcolor: '#ffffff',
      overflow: 'hidden',
    }}
    elevation={0}
  >
    <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, width: '100%' }}>
      {/* Cover Skeleton */}
      <Box sx={{ position: 'relative', width: '100%', height: 135 }}>
        <Skeleton variant="rectangular" width="100%" height={135} animation="wave" />

        {/* Floating Logo Skeleton */}
        <Box
          sx={{
            position: 'absolute',
            bottom: -24,
            left: 20,
            width: 64,
            height: 64,
            borderRadius: '14px',
            bgcolor: '#ffffff',
            border: '3px solid #ffffff',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            p: 0.5,
            zIndex: 2,
          }}
        >
          <Skeleton variant="rounded" width="100%" height="100%" sx={{ borderRadius: '10px' }} animation="wave" />
        </Box>
      </Box>

      {/* Info Section Skeleton */}
      <Box sx={{ px: 2.5, pt: 4, pb: 1.5, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Company Name Skeleton */}
        <Skeleton variant="text" width="70%" height={28} sx={{ mb: 1 }} animation="wave" />

        {/* Industry Tag Skeleton */}
        <Skeleton variant="rounded" width="45%" height={24} sx={{ borderRadius: '6px', mb: 2 }} animation="wave" />

        {/* Location & Size Metadata Skeleton */}
        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
          <Skeleton variant="text" width={90} height={20} animation="wave" />
          <Skeleton variant="text" width={90} height={20} animation="wave" />
        </Stack>

        {/* Highlights Bar Skeleton */}
        <Box
          sx={{
            mt: 'auto',
            pt: 1.5,
            borderTop: '1px dashed #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Skeleton variant="rounded" width={130} height={26} sx={{ borderRadius: '999px' }} animation="wave" />
          <Skeleton variant="text" width={80} height={20} animation="wave" />
        </Box>
      </Box>
    </Box>

    {/* Follow Button Skeleton */}
    <Box sx={{ px: 2.5, pb: 2.5, pt: 0.5, mt: 'auto', width: '100%' }}>
      <Skeleton variant="rounded" width="100%" height={42} sx={{ borderRadius: '12px' }} animation="wave" />
    </Box>
  </Card>
);

export default CompanyLoading;
