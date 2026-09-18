'use client';

import React from 'react';
import { Box, Paper, Stack, Typography } from '@mui/material';
import TrackChangesOutlinedIcon from '@mui/icons-material/TrackChangesOutlined';
import type { ResumeDetailResponse } from '@/types/models';

interface CareerObjectiveProps {
  profileDetail: ResumeDetailResponse;
}

export const CareerObjective: React.FC<CareerObjectiveProps> = ({ profileDetail }) => {
  const objective = profileDetail?.description?.trim();

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2.5, md: 3 },
        borderRadius: '16px',
        bgcolor: '#FFFFFF',
        border: '1px solid #E2E8F0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
      }}
    >
      {/* Section Title */}
      <Stack direction="row" alignItems="center" spacing={1.25} sx={{ mb: 2 }}>
        <Box
          sx={{
            width: 28,
            height: 28,
            borderRadius: '6px',
            bgcolor: '#EFF6FF',
            color: '#2563EB',
            display: 'grid',
            placeItems: 'center',
          }}
        >
          <TrackChangesOutlinedIcon sx={{ fontSize: 18 }} />
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1rem', color: '#0F172A' }}>
          Mục tiêu nghề nghiệp
        </Typography>
      </Stack>

      <Box
        sx={{
          p: 2.5,
          bgcolor: '#F8FAFC',
          borderRadius: '10px',
          border: '1px solid #F1F5F9',
        }}
      >
        <Typography
          variant="body2"
          sx={{
            color: objective ? '#334155' : '#94A3B8',
            fontStyle: objective ? 'normal' : 'italic',
            lineHeight: 1.7,
            fontWeight: 500,
            fontSize: '0.875rem',
            whiteSpace: 'pre-line',
          }}
        >
          {objective || 'Chưa cập nhật mục tiêu nghề nghiệp của ứng viên.'}
        </Typography>
      </Box>
    </Paper>
  );
};

export default CareerObjective;
