'use client';

import React from 'react';
import { Box, Paper, Typography, Stack, Skeleton } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

export interface LiveMetricCardProps {
  title: string;
  value?: number | string;
  subtitle?: string;
  deltaPercent?: number;
  deltaPeriod?: string;
  icon: React.ReactNode;
  iconBgColor?: string;
  iconColor?: string;
  loading?: boolean;
  onClick?: () => void;
}

export default function LiveMetricCard({
  title,
  value = 0,
  subtitle,
  deltaPercent,
  deltaPeriod = '30 ngày qua',
  icon,
  iconBgColor = '#EFF6FF',
  iconColor = '#2563EB',
  loading = false,
  onClick,
}: LiveMetricCardProps) {
  const isPositiveDelta = deltaPercent !== undefined && deltaPercent >= 0;

  return (
    <Paper
      elevation={0}
      onClick={onClick}
      sx={{
        p: 2.5,
        borderRadius: 3,
        border: '1px solid #E2E8F0',
        bgcolor: '#FFFFFF',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.04)',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': onClick
          ? {
              transform: 'translateY(-2px)',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04)',
              borderColor: '#CBD5E1',
            }
          : undefined,
      }}
    >
      <Stack direction="row" spacing={2} alignItems="flex-start" justifyContent="space-between">
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 600, fontSize: '0.8125rem' }}>
            {title}
          </Typography>

          {loading ? (
            <Skeleton variant="text" width={100} height={40} sx={{ mt: 0.5 }} />
          ) : (
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#0F172A', mt: 0.5, fontSize: '1.75rem' }}>
              {typeof value === 'number' ? value.toLocaleString('vi-VN') : value}
            </Typography>
          )}

          {subtitle && (
            <Typography variant="caption" sx={{ color: '#94A3B8', mt: 0.25, display: 'block' }}>
              {subtitle}
            </Typography>
          )}

          {deltaPercent !== undefined && !loading && (
            <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mt: 1 }}>
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.25,
                  px: 0.75,
                  py: 0.2,
                  borderRadius: 1,
                  bgcolor: isPositiveDelta ? '#DCFCE7' : '#FEE2E2',
                  color: isPositiveDelta ? '#16A34A' : '#DC2626',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                }}
              >
                {isPositiveDelta ? (
                  <TrendingUpIcon sx={{ fontSize: 14 }} />
                ) : (
                  <TrendingDownIcon sx={{ fontSize: 14 }} />
                )}
                {isPositiveDelta ? `+${deltaPercent}%` : `${deltaPercent}%`}
              </Box>
              <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '0.75rem' }}>
                so với {deltaPeriod}
              </Typography>
            </Stack>
          )}
        </Box>

        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 2.5,
            bgcolor: iconBgColor,
            color: iconColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
      </Stack>
    </Paper>
  );
}
