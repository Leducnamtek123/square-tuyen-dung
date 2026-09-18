import React from 'react';
import { Box, IconButton, Stack, Typography, alpha, useTheme } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PsychologyIcon from '@mui/icons-material/Psychology';
import pc from '@/utils/muiColors';

type Props = {
  title: React.ReactNode;
  subtitle?: string;
  onClose: () => void;
};

const DRAWER_HEADER_STYLES = {
  px: 3,
  py: 2.5,
  bgcolor: 'background.paper',
  borderBottom: '1px solid',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  position: 'sticky',
  top: 0,
  zIndex: 10,
} as const;

const AIAnalysisDrawerHeader = ({ title, subtitle, onClose }: Props) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        ...DRAWER_HEADER_STYLES,
        borderColor: pc.divider( 0.8),
      }}
    >
      <Stack direction="row" spacing={2} alignItems="center">
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2,
            bgcolor: alpha(theme.palette.primary.main, 0.1),
            color: 'primary.main',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <PsychologyIcon sx={{ fontSize: 24 }} />
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 800, color: 'text.primary', lineHeight: 1.2, letterSpacing: '-0.3px' }}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="caption" noWrap sx={{ color: 'text.secondary', fontWeight: 600, display: 'block' }}>
              {subtitle}
            </Typography>
          )}
        </Box>
      </Stack>
      <IconButton
        aria-label="Đóng"
        onClick={onClose}
        size="small"
        sx={{
          color: 'text.secondary',
          bgcolor: alpha(theme.palette.action.disabled, 0.05),
          '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.1), color: 'error.main' },
        }}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </Box>
  );
};

export default AIAnalysisDrawerHeader;
