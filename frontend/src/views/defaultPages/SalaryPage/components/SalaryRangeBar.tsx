'use client';

import React from 'react';
import { Box, Stack, Typography } from '@mui/material';

interface SalaryRangeBarProps {
  min: number | string;
  max: number | string;
  median: number | string;
  className?: string;
}

export const SalaryRangeBar: React.FC<SalaryRangeBarProps> = ({
  min,
  max,
  median,
}) => {
  const numMin = Number(min) || 0;
  const numMax = Number(max) || 0;
  const numMedian = Number(median) || Math.round((numMin + numMax) / 2);

  const span = numMax - numMin;
  const medianPercent =
    span > 0 ? Math.min(Math.max(Math.round(((numMedian - numMin) / span) * 100), 8), 92) : 50;

  const formatMillions = (val: number) => {
    if (!val || isNaN(val)) return '0 Tr';
    const inMillions = val / 1_000_000;
    return `${inMillions.toLocaleString('vi-VN', { maximumFractionDigits: 1 })} Tr`;
  };

  const formatVND = (val: number) => {
    if (!val || isNaN(val)) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  return (
    <Box sx={{ width: '100%', minWidth: { xs: '100%', sm: 260 } }}>
      {/* Three Metric Checkpoints */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
        <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.78rem' }}>
          Thấp nhất: <strong style={{ color: '#0f172a' }}>{formatMillions(numMin)}</strong>
        </Typography>

        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.6,
            px: 1,
            py: 0.25,
            borderRadius: '6px',
            bgcolor: '#f0fdf4',
            color: '#15803d',
            border: '1px solid #bbf7d0',
            fontSize: '0.75rem',
            fontWeight: 700,
          }}
        >
          <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#16a34a' }} />
          <span>P50: {formatMillions(numMedian)}</span>
        </Box>

        <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.78rem' }}>
          Cao nhất: <strong style={{ color: '#0f172a' }}>{formatMillions(numMax)}</strong>
        </Typography>
      </Stack>

      {/* Visual Range Track with Proportional Pin */}
      <Box sx={{ position: 'relative', py: 0.75 }}>
        <Box
          sx={{
            height: 7,
            borderRadius: '4px',
            bgcolor: '#e2e8f0',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <Box
            sx={{
              height: '100%',
              borderRadius: '4px',
              background: 'linear-gradient(90deg, #60a5fa 0%, #38bdf8 50%, #34d399 100%)',
            }}
          />
        </Box>

        {/* Median Pin Indicator */}
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: `${medianPercent}%`,
            transform: 'translate(-50%, -50%)',
            width: 14,
            height: 14,
            borderRadius: '50%',
            bgcolor: '#16a34a',
            border: '2.5px solid #ffffff',
            boxShadow: '0 2px 6px rgba(22, 163, 74, 0.45)',
            pointerEvents: 'none',
            transition: 'left 250ms ease',
          }}
          title={`Trung vị P50: ${formatMillions(numMedian)}`}
        />
      </Box>

      {/* Sub-label showing actual full VND bounds */}
      <Stack direction="row" justifyContent="space-between" sx={{ mt: 0.5 }}>
        <Typography
          variant="caption"
          sx={{ color: '#64748b', fontSize: '0.72rem', fontFamily: 'monospace' }}
        >
          {formatVND(numMin)}
        </Typography>
        <Typography
          variant="caption"
          sx={{ color: '#64748b', fontSize: '0.72rem', fontFamily: 'monospace' }}
        >
          {formatVND(numMax)}
        </Typography>
      </Stack>
    </Box>
  );
};

export default SalaryRangeBar;
