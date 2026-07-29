import React from 'react';
import { Box, Typography } from '@mui/material';

interface AIScoreBadgeProps {
  score: number; // 0 to 100
  size?: 'small' | 'medium';
}

export const AIScoreBadge: React.FC<AIScoreBadgeProps> = ({ score, size = 'small' }) => {
  const normalizedScore = Math.min(100, Math.max(0, score));

  let color = '#22C55E'; // Green
  let bg = 'rgba(34, 197, 94, 0.1)';
  let borderColor = 'rgba(34, 197, 94, 0.2)';

  if (normalizedScore < 50) {
    color = '#EF4444'; // Danger Red
    bg = 'rgba(239, 68, 68, 0.1)';
    borderColor = 'rgba(239, 68, 68, 0.2)';
  } else if (normalizedScore < 80) {
    color = '#F59E0B'; // Warning Yellow
    bg = 'rgba(245, 158, 11, 0.1)';
    borderColor = 'rgba(245, 158, 11, 0.2)';
  }

  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 1,
        px: size === 'small' ? 1.25 : 1.5,
        py: size === 'small' ? 0.4 : 0.6,
        borderRadius: '999px',
        backgroundColor: bg,
        border: `1px solid ${borderColor}`,
        minWidth: size === 'small' ? 76 : 90,
      }}
    >
      {/* Progress mini bar */}
      <Box
        sx={{
          width: 24,
          height: 5,
          borderRadius: 3,
          backgroundColor: 'rgba(0, 0, 0, 0.08)',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <Box
          sx={{
            width: `${normalizedScore}%`,
            height: '100%',
            backgroundColor: color,
            borderRadius: 3,
            transition: 'width 150ms ease-in-out',
          }}
        />
      </Box>

      <Typography
        variant="caption"
        sx={{
          fontWeight: 700,
          color: color,
          fontSize: size === 'small' ? '0.75rem' : '0.8125rem',
          lineHeight: 1,
        }}
      >
        {normalizedScore}%
      </Typography>
    </Box>
  );
};

export default AIScoreBadge;
