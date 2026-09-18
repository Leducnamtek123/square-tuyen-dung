'use client';

import React from 'react';
import { Button, IconButton, Tooltip, Chip, type SxProps, type Theme } from '@mui/material';
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';
import { useProductTour } from './ProductTourContext';

interface ProductTourTriggerProps {
  tourKey: string;
  variant?: 'icon' | 'button' | 'chip';
  label?: string;
  size?: 'small' | 'medium';
  sx?: SxProps<Theme>;
}

export const ProductTourTrigger: React.FC<ProductTourTriggerProps> = ({
  tourKey,
  variant = 'button',
  label = 'Hướng dẫn',
  size = 'small',
  sx,
}) => {
  const { startTour } = useProductTour();

  const handleTrigger = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    startTour(tourKey, true); // force start
  };

  if (variant === 'icon') {
    return (
      <Tooltip title={label} arrow>
        <IconButton
          size={size}
          onClick={handleTrigger}
          aria-label={label}
          sx={{
            color: '#64748b',
            border: '1px solid rgba(226, 232, 240, 0.8)',
            bgcolor: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(8px)',
            transition: 'all 0.2s',
            '&:hover': {
              color: '#2563eb',
              borderColor: '#93c5fd',
              bgcolor: '#eff6ff',
            },
            ...sx,
          }}
        >
          <HelpOutlineOutlinedIcon sx={{ fontSize: size === 'small' ? 17 : 20 }} />
        </IconButton>
      </Tooltip>
    );
  }

  if (variant === 'chip') {
    return (
      <Chip
        icon={<HelpOutlineOutlinedIcon sx={{ fontSize: '15px !important', color: 'inherit !important' }} />}
        label={label}
        size="small"
        onClick={handleTrigger}
        clickable
        sx={{
          bgcolor: 'rgba(37, 99, 235, 0.08)',
          color: '#2563eb',
          fontWeight: 700,
          fontSize: '0.75rem',
          border: '1px solid rgba(147, 197, 253, 0.5)',
          height: 26,
          '&:hover': {
            bgcolor: 'rgba(37, 99, 235, 0.15)',
          },
          ...sx,
        }}
      />
    );
  }

  return (
    <Button
      size={size}
      variant="outlined"
      onClick={handleTrigger}
      startIcon={<HelpOutlineOutlinedIcon sx={{ fontSize: '15px !important' }} />}
      sx={{
        textTransform: 'none',
        fontWeight: 600,
        fontSize: '0.8rem',
        borderRadius: '9999px',
        borderColor: 'rgba(203, 213, 225, 0.8)',
        color: '#475569',
        bgcolor: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(6px)',
        py: 0.4,
        px: 1.5,
        '&:hover': {
          borderColor: '#93c5fd',
          color: '#2563eb',
          bgcolor: '#eff6ff',
        },
        ...sx,
      }}
    >
      {label}
    </Button>
  );
};
