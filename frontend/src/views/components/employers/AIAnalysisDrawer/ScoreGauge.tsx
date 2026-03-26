import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

export const ScoreGauge: React.FC<{ score: number }> = ({ score }) => {
  const getColor = () => {
    if (score >= 80) return '#22c55e';
    if (score >= 60) return '#f59e0b';
    if (score >= 40) return '#f97316';
    return '#ef4444';
  };

  const getLabel = () => {
    if (score >= 80) return 'Rất phù hợp';
    if (score >= 60) return 'Phù hợp';
    if (score >= 40) return 'Tạm được';
    return 'Chưa phù hợp';
  };

  return (
    <Box sx={{ textAlign: 'center', py: 2 }}>
      <Box
        sx={{
          position: 'relative',
          display: 'inline-flex',
          width: 120,
          height: 120,
        }}
      >
        <CircularProgress
          variant="determinate"
          value={100}
          size={120}
          thickness={6}
          sx={{ color: '#f1f5f9', position: 'absolute' }}
        />
        <CircularProgress
          variant="determinate"
          value={score}
          size={120}
          thickness={6}
          sx={{ color: getColor() }}
        />
        <Box
          sx={{
            position: 'absolute',
            top: 0, left: 0, bottom: 0, right: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography variant="h4" sx={{ fontWeight: 700, color: getColor() }}>
            {score}
          </Typography>
          <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.7rem' }}>
            /100
          </Typography>
        </Box>
      </Box>
      <Typography
        variant="body2"
        sx={{ mt: 1, fontWeight: 600, color: getColor() }}
      >
        {getLabel()}
      </Typography>
    </Box>
  );
};
