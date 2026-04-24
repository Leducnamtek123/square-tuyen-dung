import React from 'react';
import { Box, Typography, Tooltip } from '@mui/material';
import { alpha, type Theme } from '@mui/material/styles';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBolt, faFire } from '@fortawesome/free-solid-svg-icons';
import pc from '@/utils/muiColors';

type StatusBadgeProps = {
  theme: Theme;
};

export const UrgentBadge = ({ theme }: StatusBadgeProps) => (
  <Tooltip title="Tuyen gap" placement="top">
    <Box
      sx={{
        position: 'absolute',
        top: -6,
        right: -6,
        backgroundColor: theme.palette.warning.main,
        borderRadius: '50%',
        width: 28,
        height: 28,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: `0 0 12px ${pc.warning( 0.5)}`,
        animation: 'pulse 2s infinite',
        '@keyframes pulse': {
          '0%': {
            transform: 'scale(1)',
            boxShadow: `0 0 0 0 ${pc.warning( 0.5)}`,
          },
          '70%': {
            transform: 'scale(1.05)',
            boxShadow: `0 0 0 10px ${pc.warning( 0)}`,
          },
          '100%': {
            transform: 'scale(1)',
            boxShadow: `0 0 0 0 ${pc.warning( 0)}`,
          },
        },
      }}
    >
      <FontAwesomeIcon
        icon={faBolt}
        style={{
          fontSize: '14px',
          color: theme.palette.common.white,
        }}
      />
    </Box>
  </Tooltip>
);

export const HotBadge = ({ theme }: StatusBadgeProps) => (
  <Box
    sx={{
      backgroundColor: theme.palette.hot.background,
      px: 1.25,
      py: 0.5,
      borderRadius: '16px',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      boxShadow: `0 0 12px ${theme.palette.hot.main}40`,
      animation: 'pulse 2s infinite',
      '@keyframes pulse': {
        '0%': {
          transform: 'scale(1)',
          boxShadow: `0 0 0 0 ${theme.palette.hot.main}40`,
        },
        '70%': {
          transform: 'scale(1.05)',
          boxShadow: `0 0 0 10px ${theme.palette.hot.main}00`,
        },
        '100%': {
          transform: 'scale(1)',
          boxShadow: `0 0 0 0 ${theme.palette.hot.main}00`,
        },
      },
    }}
  >
    <FontAwesomeIcon
      icon={faFire}
      style={{
        fontSize: '14px',
        color: theme.palette.hot.main,
      }}
    />
    <Typography
      sx={{
        fontSize: '12px',
        fontWeight: 'bold',
        color: theme.palette.hot.main,
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
      }}
    >
      Hot
    </Typography>
  </Box>
);
