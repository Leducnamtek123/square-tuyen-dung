'use client';

import React from 'react';
import { Box, Typography } from '@mui/material';

interface Props {
  sx?: object;
}

const subscribeToStaticYear = () => () => {};
const getCurrentYearSnapshot = () => new Date().getFullYear();

const ManagementFooter: React.FC<Props> = ({ sx }) => {
  const currentYear = React.useSyncExternalStore(
    subscribeToStaticYear,
    getCurrentYearSnapshot,
    getCurrentYearSnapshot
  );

  return (
    <Box
      component="footer"
      sx={{
        py: 2.5,
        px: { xs: 2, sm: 3 },
        mt: 'auto',
        borderTop: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'transparent',
        ...sx,
      }}
    >
      <Typography
        variant="body2"
        sx={{
          color: 'text.secondary',
          fontSize: '0.85rem',
          fontWeight: 500,
          textAlign: 'center',
        }}
      >
        Copyright © {currentYear} INFOHR All rights reserved.
      </Typography>
    </Box>
  );
};

export default ManagementFooter;
