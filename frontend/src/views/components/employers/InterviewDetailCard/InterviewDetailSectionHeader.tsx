import React from 'react';
import { Box, Divider, Stack, Typography } from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';
import pc from '@/utils/muiColors';

type InterviewDetailSectionHeaderProps = {
  icon: React.ReactNode;
  title: React.ReactNode;
  action?: React.ReactNode;
  iconColor?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info';
  sx?: SxProps<Theme>;
};

const colorMap = {
  primary: pc.primary,
  secondary: pc.secondary,
  success: pc.success,
  error: pc.error,
  warning: pc.warning,
  info: pc.info,
} as const;

const InterviewDetailSectionHeader = ({
  icon,
  title,
  action,
  iconColor = 'primary',
  sx,
}: InterviewDetailSectionHeaderProps) => (
  <>
    <Stack direction="row" alignItems="center" spacing={1.5} sx={sx}>
      <Box
        sx={{
          width: 32,
          height: 32,
          borderRadius: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: colorMap[iconColor](0.08),
          color: `${iconColor}.main`,
          flexShrink: 0,
          '& svg': { fontSize: 20 },
        }}
      >
        {icon}
      </Box>
      <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'text.primary', letterSpacing: 0 }}>
        {title}
      </Typography>
      {action && <Box sx={{ ml: 'auto' }}>{action}</Box>}
    </Stack>
    <Divider sx={{ mt: 2.25, mb: 2.5 }} />
  </>
);

export default InterviewDetailSectionHeader;
