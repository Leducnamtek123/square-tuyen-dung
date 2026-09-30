'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  Button,
  Avatar,
  Chip,
  Stack,
  useTheme,
} from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { setActiveWorkspace } from '@/redux/userSlice';
import type { NativeEmployee } from '@/services/hrmService';
import type { Workspace } from '@/types/models';

interface Props {
  employee?: NativeEmployee;
  companyName?: string;
  companyLogo?: string;
}

export const EmployeeHeader: React.FC<Props> = ({ employee, companyName, companyLogo }) => {
  const theme = useTheme();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { currentUser } = useAppSelector((state) => state.user);

  const handleSwitchToJobSeeker = () => {
    const jobSeekerWorkspace: Workspace = {
      type: 'job_seeker',
      label: 'Ứng viên',
      companyId: null,
    };
    dispatch(setActiveWorkspace(jobSeekerWorkspace));
    router.push('/dashboard');
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        color: '#0f172a',
        zIndex: 1100,
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, md: 4 }, minHeight: 64 }}>
        {/* Left: InfoHR + Company Identity */}
        <Stack direction="row" spacing={2} alignItems="center">
          <Link href="/employee/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 900,
                color: '#2563eb',
                letterSpacing: '-0.5px',
                mr: 1,
              }}
            >
              InfoHR
            </Typography>
            <Chip
              label="ESS • Portal Nhân Viên"
              size="small"
              sx={{
                bgcolor: '#eff6ff',
                color: '#2563eb',
                fontWeight: 700,
                fontSize: '0.75rem',
                border: '1px solid #bfdbfe',
              }}
            />
          </Link>

          <Box sx={{ display: { xs: 'none', sm: 'block' }, height: 24, width: 1, bgcolor: '#e2e8f0' }} />

          {/* Company Brand Badge */}
          <Stack direction="row" spacing={1} alignItems="center" sx={{ display: { xs: 'none', sm: 'flex' } }}>
            <Avatar
              src={companyLogo}
              alt={companyName || 'Company'}
              sx={{ width: 28, height: 28, bgcolor: '#f1f5f9', border: '1px solid #cbd5e1' }}
            >
              <BusinessIcon sx={{ fontSize: 16, color: '#64748b' }} />
            </Avatar>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#334155' }}>
              {companyName || employee?.company_name || 'Doanh nghiệp'}
            </Typography>
          </Stack>
        </Stack>

        {/* Right: Switch Workspace + User Avatar */}
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Button
            size="small"
            variant="outlined"
            startIcon={<SwapHorizIcon sx={{ fontSize: 18 }} />}
            onClick={handleSwitchToJobSeeker}
            sx={{
              textTransform: 'none',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '0.8125rem',
              color: '#475569',
              borderColor: '#cbd5e1',
              '&:hover': {
                borderColor: '#94a3b8',
                backgroundColor: '#f8fafc',
              },
            }}
          >
            Cổng Ứng viên
          </Button>

          <Stack direction="row" spacing={1} alignItems="center">
            <Avatar
              src={employee?.avatar || currentUser?.avatarUrl || undefined}
              alt={employee?.full_name || 'Employee Avatar'}
              sx={{
                width: 36,
                height: 36,
                bgcolor: '#2563eb',
                fontWeight: 800,
                fontSize: '0.875rem',
              }}
            >
              {employee?.first_name?.charAt(0)?.toUpperCase() || 'U'}
            </Avatar>
            <Box sx={{ display: { xs: 'none', md: 'block' } }}>
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a', lineHeight: 1.2 }}>
                {employee?.full_name || currentUser?.fullName || 'Nhân viên'}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <VerifiedUserOutlinedIcon sx={{ fontSize: 12, color: '#16a34a' }} />
                {employee?.employee_code || 'SQ-EMP'}
              </Typography>
            </Box>
          </Stack>
        </Stack>
      </Toolbar>
    </AppBar>
  );
};

export default EmployeeHeader;
