'use client';

import React from 'react';
import {
  Box,
  Card,
  Avatar,
  Typography,
  Chip,
  Stack,
  Divider,
  Grid2 as Grid,
} from '@mui/material';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';
import SupervisorAccountOutlinedIcon from '@mui/icons-material/SupervisorAccountOutlined';
import type { NativeEmployee, NativeContract } from '@/services/hrmService';
import dayjs from 'dayjs';

interface Props {
  employee?: NativeEmployee;
  activeContract?: NativeContract | null;
}

export const EmployeeHeroBanner: React.FC<Props> = ({ employee, activeContract }) => {
  if (!employee) return null;

  const isProbation = employee.status === 'PROBATION';
  const joinDateFormatted = employee.join_date
    ? dayjs(employee.join_date).format('DD/MM/YYYY')
    : 'Chưa cập nhật';
  const probationEndFormatted = employee.probation_end_date
    ? dayjs(employee.probation_end_date).format('DD/MM/YYYY')
    : null;

  return (
    <Card
      elevation={0}
      sx={{
        p: { xs: 2.5, md: 3.5 },
        borderRadius: '16px',
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        color: '#ffffff',
        border: '1px solid #334155',
        boxShadow: '0 10px 30px -10px rgba(15, 23, 42, 0.4)',
        mb: 3,
      }}
    >
      <Grid container spacing={3} alignItems="center">
        {/* Avatar & Main Info */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2.5} alignItems={{ xs: 'flex-start', sm: 'center' }}>
            <Avatar
              src={employee.avatar}
              alt={employee.full_name}
              sx={{
                width: 76,
                height: 76,
                border: '3px solid #3b82f6',
                boxShadow: '0 4px 14px rgba(59, 130, 246, 0.35)',
                bgcolor: '#2563eb',
                fontSize: '1.75rem',
                fontWeight: 800,
              }}
            >
              {employee.first_name?.charAt(0)?.toUpperCase() || 'E'}
            </Avatar>

            <Box>
              <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" sx={{ mb: 0.75 }}>
                <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: '-0.3px' }}>
                  {employee.full_name}
                </Typography>
                <Chip
                  label={isProbation ? 'Đang thử việc' : 'Nhân viên chính thức'}
                  size="small"
                  sx={{
                    bgcolor: isProbation ? 'rgba(234, 179, 8, 0.2)' : 'rgba(34, 197, 94, 0.2)',
                    color: isProbation ? '#facc15' : '#4ade80',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    border: `1px solid ${isProbation ? '#ca8a04' : '#16a34a'}`,
                  }}
                />
              </Stack>

              <Typography variant="body2" sx={{ color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                <span style={{ color: '#60a5fa', fontWeight: 700 }}>{employee.designation_title || employee.designation_name || 'Vị trí chuyên môn'}</span>
                <span>•</span>
                <span>{employee.department_name || 'Phòng ban nội bộ'}</span>
                <span>•</span>
                <span>Mã NV: <strong>{employee.employee_code}</strong></span>
              </Typography>
            </Box>
          </Stack>
        </Grid>

        {/* Quick Context Columns */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            divider={<Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />}
            sx={{
              p: 2,
              borderRadius: '12px',
              bgcolor: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <Box sx={{ flex: 1 }}>
              <Typography variant="caption" sx={{ color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                <EventAvailableOutlinedIcon sx={{ fontSize: 14, color: '#60a5fa' }} />
                Ngày bắt đầu làm việc
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#f8fafc' }}>
                {joinDateFormatted}
              </Typography>
              {isProbation && probationEndFormatted && (
                <Typography variant="caption" sx={{ color: '#fbbf24', display: 'block', mt: 0.25 }}>
                  Hạn thử việc: {probationEndFormatted}
                </Typography>
              )}
            </Box>

            <Box sx={{ flex: 1 }}>
              <Typography variant="caption" sx={{ color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                <SupervisorAccountOutlinedIcon sx={{ fontSize: 14, color: '#60a5fa' }} />
                Quản lý trực tiếp
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#f8fafc' }}>
                {employee.reports_to_name || 'Ban Lãnh đạo'}
              </Typography>
              <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', mt: 0.25 }}>
                {employee.company_name || 'Doanh nghiệp'}
              </Typography>
            </Box>
          </Stack>
        </Grid>
      </Grid>
    </Card>
  );
};

export default EmployeeHeroBanner;
