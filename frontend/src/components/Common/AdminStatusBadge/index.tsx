'use client';

import React from 'react';
import { Box, Typography } from '@mui/material';

export type StatusVariant =
  | 'active'
  | 'approved'
  | 'verified'
  | 'success'
  | 'pending'
  | 'in_review'
  | 'waiting'
  | 'warning'
  | 'rejected'
  | 'blocked'
  | 'banned'
  | 'error'
  | 'flagged'
  | 'spam'
  | 'inactive'
  | 'draft'
  | 'archived'
  | 'info'
  | 'ai';

export interface AdminStatusBadgeProps {
  status: StatusVariant | string;
  label?: string;
  size?: 'small' | 'medium';
  showDot?: boolean;
  icon?: React.ReactNode;
}

interface StyleConfig {
  bg: string;
  text: string;
  border: string;
  dot: string;
  defaultLabel: string;
}

const STYLE_MAP: Record<string, StyleConfig> = {
  active: { bg: '#F0FDF4', text: '#15803D', border: '#BBF7D0', dot: '#22C55E', defaultLabel: 'Đang hoạt động' },
  approved: { bg: '#F0FDF4', text: '#15803D', border: '#BBF7D0', dot: '#22C55E', defaultLabel: 'Đã duyệt' },
  verified: { bg: '#ECFDF5', text: '#047857', border: '#A7F3D0', dot: '#10B981', defaultLabel: 'Đã xác thực' },
  success: { bg: '#F0FDF4', text: '#15803D', border: '#BBF7D0', dot: '#22C55E', defaultLabel: 'Thành công' },

  pending: { bg: '#FFFBEB', text: '#B45309', border: '#FDE68A', dot: '#F59E0B', defaultLabel: 'Chờ duyệt' },
  in_review: { bg: '#FFFBEB', text: '#B45309', border: '#FDE68A', dot: '#F59E0B', defaultLabel: 'Đang xem xét' },
  waiting: { bg: '#FFFBEB', text: '#B45309', border: '#FDE68A', dot: '#F59E0B', defaultLabel: 'Chờ xử lý' },
  warning: { bg: '#FFFBEB', text: '#B45309', border: '#FDE68A', dot: '#F59E0B', defaultLabel: 'Cảnh báo' },

  rejected: { bg: '#FEF2F2', text: '#B91C1C', border: '#FECACA', dot: '#EF4444', defaultLabel: 'Đã từ chối' },
  blocked: { bg: '#FEF2F2', text: '#B91C1C', border: '#FECACA', dot: '#EF4444', defaultLabel: 'Đã khóa' },
  banned: { bg: '#FEF2F2', text: '#B91C1C', border: '#FECACA', dot: '#EF4444', defaultLabel: 'Đã cấm' },
  error: { bg: '#FEF2F2', text: '#B91C1C', border: '#FECACA', dot: '#EF4444', defaultLabel: 'Lỗi' },

  flagged: { bg: '#FFF7ED', text: '#C2410C', border: '#FFEDD5', dot: '#F97316', defaultLabel: 'Bị gắn cờ AI' },
  spam: { bg: '#FFF7ED', text: '#C2410C', border: '#FFEDD5', dot: '#F97316', defaultLabel: 'Nghi vấn Spam' },

  inactive: { bg: '#F8FAFC', text: '#475569', border: '#E2E8F0', dot: '#94A3B8', defaultLabel: 'Ngừng kích hoạt' },
  draft: { bg: '#F8FAFC', text: '#475569', border: '#E2E8F0', dot: '#94A3B8', defaultLabel: 'Bản nháp' },
  archived: { bg: '#F8FAFC', text: '#475569', border: '#E2E8F0', dot: '#94A3B8', defaultLabel: 'Lưu trữ' },

  info: { bg: '#EFF6FF', text: '#1D4ED8', border: '#BFDBFE', dot: '#3B82F6', defaultLabel: 'Thông tin' },
  ai: { bg: '#F5F3FF', text: '#6D28D9', border: '#DDD6FE', dot: '#8B5CF6', defaultLabel: 'AI Xử lý' },
};

const DEFAULT_STYLE: StyleConfig = {
  bg: '#F8FAFC',
  text: '#334155',
  border: '#E2E8F0',
  dot: '#64748B',
  defaultLabel: 'Không xác định',
};

export default function AdminStatusBadge({
  status,
  label,
  size = 'small',
  showDot = true,
  icon,
}: AdminStatusBadgeProps) {
  const normalizedKey = String(status || '').toLowerCase().trim();
  const config = STYLE_MAP[normalizedKey] || DEFAULT_STYLE;
  const displayLabel = label || config.defaultLabel;

  const isSmall = size === 'small';

  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.75,
        px: isSmall ? 1 : 1.5,
        py: isSmall ? 0.35 : 0.6,
        bgcolor: config.bg,
        border: `1px solid ${config.border}`,
        borderRadius: '9999px',
        color: config.text,
        fontWeight: 600,
        fontSize: isSmall ? '0.75rem' : '0.8125rem',
        lineHeight: 1,
        whiteSpace: 'nowrap',
        userSelect: 'none',
        transition: 'all 150ms ease',
      }}
    >
      {showDot && !icon && (
        <Box
          component="span"
          sx={{
            width: isSmall ? 6 : 7,
            height: isSmall ? 6 : 7,
            borderRadius: '50%',
            bgcolor: config.dot,
            flexShrink: 0,
          }}
        />
      )}
      {icon && (
        <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', fontSize: isSmall ? 14 : 16 }}>
          {icon}
        </Box>
      )}
      <Typography
        component="span"
        sx={{
          fontSize: 'inherit',
          fontWeight: 'inherit',
          color: 'inherit',
          lineHeight: 'inherit',
        }}
      >
        {displayLabel}
      </Typography>
    </Box>
  );
}
