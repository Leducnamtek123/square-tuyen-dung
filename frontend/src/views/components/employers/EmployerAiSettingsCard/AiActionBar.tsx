'use client';

import React from 'react';
import {
  Box,
  Typography,
  Stack,
  Button,
  Chip,
  CircularProgress,
} from '@mui/material';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import RestartAltOutlinedIcon from '@mui/icons-material/RestartAltOutlined';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';

export interface AiActionBarProps {
  isDirty: boolean;
  isSaving: boolean;
  onSave: () => void;
  onReset: () => void;
}

export function AiActionBar({
  isDirty,
  isSaving,
  onSave,
  onReset,
}: AiActionBarProps) {
  return (
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      alignItems={{ xs: 'flex-start', md: 'center' }}
      justifyContent="space-between"
      spacing={2}
      sx={{ mb: 3 }}
    >
      {/* Title & Icon */}
      <Stack direction="row" alignItems="center" spacing={2}>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 3,
            bgcolor: '#eff6ff',
            color: '#2563eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(37, 99, 235, 0.12)',
          }}
        >
          <AutoAwesomeOutlinedIcon sx={{ fontSize: 26 }} />
        </Box>
        <Box>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 800,
                color: 'text.primary',
                fontSize: { xs: '1.25rem', md: '1.5rem' },
              }}
            >
              Cài đặt diện mạo và Không gian AI Phỏng vấn
            </Typography>
            {isDirty ? (
              <Chip
                label="Có thay đổi chưa lưu"
                size="small"
                color="warning"
                sx={{ fontWeight: 700, fontSize: '0.72rem', height: 24 }}
              />
            ) : (
              <Chip
                label="Đã lưu và đồng bộ"
                size="small"
                color="success"
                variant="outlined"
                sx={{ fontWeight: 700, fontSize: '0.72rem', height: 24 }}
              />
            )}
          </Stack>
          <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500, mt: 0.5 }}>
            Tùy biến Trợ lý AI Phỏng vấn Aila, video cử chỉ tự nhiên và không gian phòng phỏng vấn chuẩn doanh nghiệp
          </Typography>
        </Box>
      </Stack>

      {/* Action buttons */}
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Button
          variant="outlined"
          color="inherit"
          onClick={onReset}
          disabled={isSaving}
          startIcon={<RestartAltOutlinedIcon />}
          sx={{
            textTransform: 'none',
            fontWeight: 700,
            borderRadius: 2.5,
            px: 2.5,
            py: 0.9,
            color: 'text.secondary',
            borderColor: '#cbd5e1',
          }}
        >
          Khôi phục mặc định
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={onSave}
          disabled={isSaving}
          startIcon={isSaving ? <CircularProgress size={18} color="inherit" /> : <SaveOutlinedIcon />}
          sx={{
            textTransform: 'none',
            fontWeight: 700,
            borderRadius: 2.5,
            px: 3,
            py: 0.9,
          }}
        >
          {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
        </Button>
      </Stack>
    </Stack>
  );
}

export default AiActionBar;
