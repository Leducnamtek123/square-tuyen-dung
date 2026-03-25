import React from 'react';
import { Paper, Stack, Box, Typography } from '@mui/material';

export const SectionCard: React.FC<{
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  iconColor?: string;
}> = ({ title, icon, children, iconColor = '#3b82f6' }) => (
  <Paper
    elevation={0}
    sx={{
      p: 2,
      mb: 1.5,
      border: '1px solid #e2e8f0',
      borderRadius: 2,
      '&:hover': { borderColor: '#cbd5e1' },
    }}
  >
    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
      <Box sx={{ color: iconColor, display: 'flex' }}>{icon}</Box>
      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1e293b' }}>
        {title}
      </Typography>
    </Stack>
    {children}
  </Paper>
);
