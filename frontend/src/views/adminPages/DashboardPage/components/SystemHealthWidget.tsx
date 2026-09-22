'use client';

import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Stack,
  Chip,
  Skeleton,
  Divider,
  Tooltip,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import DnsOutlinedIcon from '@mui/icons-material/DnsOutlined';
import StorageOutlinedIcon from '@mui/icons-material/StorageOutlined';
import MemoryOutlinedIcon from '@mui/icons-material/MemoryOutlined';
import CloudQueueOutlinedIcon from '@mui/icons-material/CloudQueueOutlined';
import SyncAltOutlinedIcon from '@mui/icons-material/SyncAltOutlined';
import { useSystemHealth } from '../hooks/useAdminStats';

interface ServiceItemProps {
  name: string;
  sub: string;
  icon: React.ReactNode;
  status: 'up' | 'degraded' | 'down' | string;
}

const ServiceItem: React.FC<ServiceItemProps> = ({ name, sub, icon, status }) => {
  const isUp = status === 'up';
  const isDegraded = status === 'degraded';

  const statusConfig = isUp
    ? { label: 'Hoạt động', color: '#10B981', bg: '#ECFDF5', icon: <CheckCircleIcon sx={{ fontSize: 14 }} /> }
    : isDegraded
    ? { label: 'Cảnh báo', color: '#F59E0B', bg: '#FFFBEB', icon: <WarningAmberIcon sx={{ fontSize: 14 }} /> }
    : { label: 'Gián đoạn', color: '#EF4444', bg: '#FEF2F2', icon: <ErrorOutlineIcon sx={{ fontSize: 14 }} /> };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        p: 1.25,
        borderRadius: 2,
        bgcolor: '#F8FAFC',
        border: '1px solid #F1F5F9',
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: 1.5,
            bgcolor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#475569',
          }}
        >
          {icon}
        </Box>
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 700, color: '#1E293B', fontSize: '0.8125rem' }}>
            {name}
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748B', fontSize: '0.7rem' }}>
            {sub}
          </Typography>
        </Box>
      </Stack>

      <Chip
        icon={statusConfig.icon}
        label={statusConfig.label}
        size="small"
        sx={{
          bgcolor: statusConfig.bg,
          color: statusConfig.color,
          fontWeight: 700,
          fontSize: '0.7rem',
          height: 24,
          '& .MuiChip-icon': { color: 'inherit' },
        }}
      />
    </Box>
  );
};

export default function SystemHealthWidget() {
  const { data: health, isLoading } = useSystemHealth();

  const services = health?.services || {
    api: 'up',
    database: 'up',
    redis: 'up',
    storage: 'up',
    celery: 'up',
  };

  const isHealthy = health?.status !== 'down';

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        borderRadius: 3,
        border: '1px solid #E2E8F0',
        bgcolor: '#FFFFFF',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.04)',
      }}
    >
      {/* Header with Live indicator */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#0F172A', fontSize: '1.05rem' }}>
              Sức khỏe Hệ thống
            </Typography>
            <Tooltip title="Tự động kiểm tra mỗi 30 giây">
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: isHealthy ? '#10B981' : '#EF4444',
                  boxShadow: isHealthy
                    ? '0 0 0 3px rgba(16, 185, 129, 0.25)'
                    : '0 0 0 3px rgba(239, 68, 68, 0.25)',
                }}
              />
            </Tooltip>
          </Stack>
          <Typography variant="caption" sx={{ color: '#64748B', fontSize: '0.75rem' }}>
            Giám sát thời gian thực các microservices cốt lõi
          </Typography>
        </Box>

        <Chip
          label={health?.status === 'healthy' ? 'Ổn định' : 'Kiểm tra'}
          size="small"
          sx={{
            bgcolor: health?.status === 'healthy' ? '#ECFDF5' : '#FFFBEB',
            color: health?.status === 'healthy' ? '#059669' : '#D97706',
            fontWeight: 700,
            fontSize: '0.75rem',
          }}
        />
      </Box>

      {/* Services List */}
      <Stack spacing={1}>
        {isLoading ? (
          <>
            <Skeleton variant="rounded" height={44} />
            <Skeleton variant="rounded" height={44} />
            <Skeleton variant="rounded" height={44} />
            <Skeleton variant="rounded" height={44} />
          </>
        ) : (
          <>
            <ServiceItem
              name="REST API Gateway"
              sub="Django REST Framework"
              icon={<DnsOutlinedIcon sx={{ fontSize: 18 }} />}
              status={services.api}
            />
            <ServiceItem
              name="Cơ sở dữ liệu chính"
              sub="MySQL 8.0 Cluster"
              icon={<StorageOutlinedIcon sx={{ fontSize: 18 }} />}
              status={services.database}
            />
            <ServiceItem
              name="Bộ nhớ đệm & Phiên"
              sub="Redis 7 In-memory"
              icon={<MemoryOutlinedIcon sx={{ fontSize: 18 }} />}
              status={services.redis}
            />
            <ServiceItem
              name="Lưu trữ đối tượng"
              sub="MinIO S3 Storage"
              icon={<CloudQueueOutlinedIcon sx={{ fontSize: 18 }} />}
              status={services.storage}
            />
            <ServiceItem
              name="Hàng đợi tác vụ ngầm"
              sub="Celery Worker Engine"
              icon={<SyncAltOutlinedIcon sx={{ fontSize: 18 }} />}
              status={services.celery}
            />
          </>
        )}
      </Stack>

      <Divider sx={{ my: 1.5 }} />

      {/* Footer summary */}
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '0.7rem' }}>
          Tác vụ đang chạy: <strong>{health?.runningOperationsCount || 0}</strong>
        </Typography>
        <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '0.7rem' }}>
          Cập nhật: {health?.checkedAt ? new Date(health.checkedAt).toLocaleTimeString('vi-VN') : 'Đang tải...'}
        </Typography>
      </Stack>
    </Paper>
  );
}
