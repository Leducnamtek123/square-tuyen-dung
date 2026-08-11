'use client';

import dynamic from 'next/dynamic';
import { Box, Typography, Skeleton } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import type { LocationPickerProps } from './LocationPickerContent';

const LocationPickerContent = dynamic(() => import('./LocationPickerContent'), {
  ssr: false,
  loading: () => (
    <Box
      sx={{
        width: '100%',
        height: '360px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8f9fa',
        borderRadius: 2.5,
        border: '1px dashed #ced4da',
        gap: 1.5,
        p: 2,
      }}
    >
      <Skeleton variant="rectangular" width="100%" height={40} sx={{ borderRadius: 1.5 }} />
      <Skeleton variant="rectangular" width="100%" height={260} sx={{ borderRadius: 2 }} />
      <Typography
        sx={{
          color: 'text.secondary',
          fontStyle: 'italic',
          fontSize: '0.875rem',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <LocationOnIcon fontSize="small" color="primary" />
        Đang tải bản đồ định vị OpenStreetMap...
      </Typography>
    </Box>
  ),
});

export default function LocationPicker(props: LocationPickerProps) {
  return <LocationPickerContent {...props} />;
}

export type { LocationValue, LocationPickerProps } from './LocationPickerContent';
