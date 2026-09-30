'use client';

import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';

interface Props {
  title?: string;
  subTitle?: string;
  latitude?: number;
  longitude?: number;
  height?: string | number;
}

const MapContent: React.FC<Props> = ({ title, subTitle, latitude, longitude, height = '260px' }) => {
  const latNum = typeof latitude === 'number' ? latitude : typeof latitude === 'string' && latitude ? parseFloat(latitude as unknown as string) : null;
  const lngNum = typeof longitude === 'number' ? longitude : typeof longitude === 'string' && longitude ? parseFloat(longitude as unknown as string) : null;
  const hasCoords = latNum !== null && lngNum !== null && !isNaN(latNum) && !isNaN(lngNum) && (latNum !== 0 || lngNum !== 0);

  // Ưu tiên tọa độ nếu có, fallback về địa chỉ (subTitle) hoặc tên công ty (title)
  const query = hasCoords ? `${latNum},${lngNum}` : (subTitle || title || '').trim();

  if (!query) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height,
          backgroundColor: '#f8f9fa',
          borderRadius: 2,
          border: '1px dashed #ced4da',
          p: 2,
          textAlign: 'center',
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
          Chưa thể xác định vị trí trên bản đồ
        </Typography>
      </Box>
    );
  }

  const mapSrc = `https://maps.google.com/maps?q=${encodeURIComponent(query)}&hl=vi&z=15&output=embed`;
  const safeExternalMapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;

  return (
    <Paper
      elevation={1}
      sx={{
        overflow: 'hidden',
        height,
        width: '100%',
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        position: 'relative',
        bgcolor: '#f8fafc',
      }}
    >
      <iframe
        title={title || subTitle || 'Bản đồ vị trí'}
        src={mapSrc}
        width="100%"
        height="100%"
        style={{ border: 0, display: 'block' }}
        loading="lazy"
        allowFullScreen
        referrerPolicy="no-referrer-when-downgrade"
      />
      <Box
        component="a"
        href={safeExternalMapUrl}
        target="_blank"
        rel="noopener noreferrer"
        sx={{
          position: 'absolute',
          bottom: 10,
          right: 10,
          zIndex: 10,
          bgcolor: 'rgba(255, 255, 255, 0.94)',
          backdropFilter: 'blur(4px)',
          px: 1.25,
          py: 0.5,
          borderRadius: 1.5,
          border: '1px solid #e2e8f0',
          fontSize: '0.75rem',
          fontWeight: 600,
          color: '#2563eb',
          textDecoration: 'none',
          boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          transition: 'all 0.2s ease',
          '&:hover': {
            bgcolor: '#ffffff',
            color: '#1d4ed8',
            boxShadow: '0 4px 10px rgba(0,0,0,0.12)',
            transform: 'translateY(-1px)',
          },
        }}
      >
        <LocationOnIcon sx={{ fontSize: 14 }} />
        Mở Google Maps
      </Box>
    </Paper>
  );
};

export default MapContent;
