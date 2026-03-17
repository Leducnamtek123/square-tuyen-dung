import React from 'react';
import { Box } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

const ValidationError = ({ message }) => {
  if (!message) return null;

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        color: 'red',
        fontSize: 13,
        mt: 0.5,
        ml: 0.5,
        gap: '4px'
      }}
    >
      <ErrorOutlineIcon sx={{ fontSize: '16px' }} />
      {message}
    </Box>
  );
};

export default ValidationError;
