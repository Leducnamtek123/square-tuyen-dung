import React from 'react';
import { Box, IconButton, Stack, Typography, alpha, useTheme } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PsychologyIcon from '@mui/icons-material/Psychology';

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
        borderColor: alpha(theme.palette.divider, 0.8),
      }}
    >
      <Stack direction="row" spacing={2} alignItems="center">
        <Box
          sx={{
            p: 1,
            borderRadius: 1.5,
            bgcolor: alpha(theme.palette.primary.main, 0.1),
            color: 'primary.main',
            display: 'flex',
          }}
        >
          <PsychologyIcon sx={{ fontSize: 24 }} />
        </Box>
        <Box>
          <Typography
            variant="h6"
            sx={{ fontWeight: 900, color: 'text.primary', lineHeight: 1.2, letterSpacing: '-0.5px' }}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
      </Stack>
      <IconButton
        onClick={onClose}
        size="small"
        sx={{
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
