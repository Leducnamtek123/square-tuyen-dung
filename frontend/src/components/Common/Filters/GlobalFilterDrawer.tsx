'use client';

import React from 'react';
import {
  Drawer,
  Box,
  Stack,
  Typography,
  IconButton,
  Button,
  Tooltip,
} from '@mui/material';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import CloseIcon from '@mui/icons-material/Close';
import FilterFieldRenderer from './FilterFieldRenderer';
import type { FilterSystemConfig } from './types';
import type { useForm } from 'react-hook-form';

interface GlobalFilterDrawerProps {
  open: boolean;
  onClose: () => void;
  config: FilterSystemConfig;
  control: ReturnType<typeof useForm<any>>['control'];
  allConfig: any;
  handleReset: () => void;
  handleSubmit: ReturnType<typeof useForm<any>>['handleSubmit'];
  handleApply: (data: any) => void;
}

export const GlobalFilterDrawer: React.FC<GlobalFilterDrawerProps> = ({
  open,
  onClose,
  config,
  control,
  allConfig,
  handleReset,
  handleSubmit,
  handleApply,
}) => {
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 380 },
          maxWidth: '100vw',
          p: 0,
          bgcolor: '#FFFFFF',
        },
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Drawer Header */}
        <Box
          sx={{
            p: 2.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #E2E8F0',
          }}
        >
          <Stack direction="row" spacing={1.25} alignItems="center">
            <FilterAltIcon sx={{ fontSize: 20, color: 'primary.main' }} />
            <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1rem', color: '#0F172A' }}>
              {config.title.toUpperCase()}
            </Typography>
          </Stack>

          <Stack direction="row" spacing={1} alignItems="center">
            <Tooltip title="Xóa bộ lọc" arrow>
              <Button
                variant="text"
                color="error"
                size="small"
                onClick={handleReset}
                sx={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  textTransform: 'none',
                  minWidth: 'auto',
                  px: 1,
                }}
              >
                Xóa bộ lọc
              </Button>
            </Tooltip>
            <IconButton aria-label="Đóng" size="small" onClick={onClose} sx={{ color: '#64748B' }}>
              <CloseIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Stack>
        </Box>

        {/* Drawer Body - Dynamic Filter List */}
        <Box sx={{ flex: 1, overflowY: 'auto', p: 2.5 }}>
          <Stack spacing={2}>
            {config.fields.map((field) => (
              <FilterFieldRenderer
                key={field.key}
                field={field}
                control={control}
                allConfig={allConfig}
              />
            ))}
          </Stack>
        </Box>

        {/* Drawer Footer - Apply Button */}
        <Box sx={{ p: 2, borderTop: '1px solid #E2E8F0', bgcolor: '#F8FAFC' }}>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleSubmit((data) => {
              handleApply(data);
              onClose();
            })}
            sx={{
              height: 44,
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.9rem',
              textTransform: 'none',
            }}
          >
            Áp dụng bộ lọc
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
};

export default GlobalFilterDrawer;
