'use client';

import { Box, Paper, Skeleton, Stack } from '@mui/material';

export default function AdminLoading() {
  return (
    <Box sx={{ width: '100%', py: 2 }}>
      {/* Top Header Skeleton */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Box>
          <Skeleton variant="text" width={220} height={36} />
          <Skeleton variant="text" width={340} height={20} />
        </Box>
        <Skeleton variant="rounded" width={140} height={40} sx={{ borderRadius: 2 }} />
      </Stack>

      {/* Metric Cards Skeleton */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 2.5, mb: 3 }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Paper key={i} elevation={0} sx={{ p: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
              <Skeleton variant="text" width={100} height={20} />
              <Skeleton variant="circular" width={36} height={36} />
            </Stack>
            <Skeleton variant="text" width={80} height={36} />
            <Skeleton variant="text" width={120} height={16} />
          </Paper>
        ))}
      </Box>

      {/* Main Table / Content Skeleton */}
      <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
        <Stack direction="row" spacing={2} sx={{ mb: 2.5 }}>
          <Skeleton variant="rounded" width={280} height={40} sx={{ borderRadius: 2 }} />
          <Skeleton variant="rounded" width={160} height={40} sx={{ borderRadius: 2 }} />
        </Stack>
        <Stack spacing={1.5}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} variant="rounded" height={52} sx={{ borderRadius: 1.5 }} />
          ))}
        </Stack>
      </Paper>
    </Box>
  );
}
