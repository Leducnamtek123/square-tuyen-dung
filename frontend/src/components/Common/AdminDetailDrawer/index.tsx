'use client';

import React from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Divider,
  Stack,
  CircularProgress,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

export interface AdminDetailDrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  width?: number | string;
  headerAction?: React.ReactNode;
  footerAction?: React.ReactNode;
  loading?: boolean;
  children: React.ReactNode;
}

export default function AdminDetailDrawer({
  open,
  onClose,
  title,
  subtitle,
  width = 560,
  headerAction,
  footerAction,
  loading = false,
  children,
}: AdminDetailDrawerProps) {
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: width },
          bgcolor: '#FFFFFF',
          boxShadow: '-4px 0 24px rgba(0, 0, 0, 0.08)',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #E2E8F0',
          bgcolor: '#F8FAFC',
        }}
      >
        <Box sx={{ pr: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#1E293B', fontSize: '1.125rem' }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" sx={{ color: '#64748B', mt: 0.25, fontSize: '0.8125rem' }}>
              {subtitle}
            </Typography>
          )}
        </Box>

        <Stack direction="row" spacing={1} alignItems="center">
          {headerAction && <Box>{headerAction}</Box>}
          <IconButton
            size="small"
            onClick={onClose}
            sx={{
              color: '#94A3B8',
              bgcolor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              '&:hover': { bgcolor: '#F1F5F9', color: '#475569' },
            }}
          >
            <CloseIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Stack>
      </Box>

      {/* Body Content */}
      <Box sx={{ p: 3, flexGrow: 1, overflowY: 'auto' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
            <CircularProgress size={36} thickness={4} />
          </Box>
        ) : (
          children
        )}
      </Box>

      {/* Footer Actions */}
      {footerAction && (
        <Box
          sx={{
            p: 2,
            px: 3,
            borderTop: '1px solid #E2E8F0',
            bgcolor: '#F8FAFC',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: 1.5,
          }}
        >
          {footerAction}
        </Box>
      )}
    </Drawer>
  );
}
