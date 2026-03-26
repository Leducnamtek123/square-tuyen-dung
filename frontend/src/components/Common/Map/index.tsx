'use client';

import dynamic from 'next/dynamic';
import { Box, Typography } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';

interface MapProps {
  title?: string;
  subTitle?: string;
  latitude?: number;
  longitude?: number;
}

const MapContent = dynamic(() => import('./MapContent'), {
  ssr: false,
  loading: () => (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '250px',
        backgroundColor: '#f8f9fa',
        borderRadius: 2,
        border: '1px dashed #ced4da',
      }}
    >
      <Typography
        sx={{
          color: '#9e9e9e',
          fontStyle: 'italic',
          fontSize: '0.875rem',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <LocationOnIcon fontSize="small" />
        Đang tải bản đồ...
      </Typography>
    </Box>
  ),
});

const Map = (props: MapProps) => {
  return <MapContent {...props} />;
};

export default Map;
