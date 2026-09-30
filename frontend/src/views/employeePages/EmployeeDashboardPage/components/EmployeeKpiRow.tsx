'use client';

import React, { useState } from 'react';
import {
  Box,
  Card,
  Typography,
  Stack,
  IconButton,
  Grid2 as Grid,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import BeachAccessIcon from '@mui/icons-material/BeachAccess';
import HourglassTopIcon from '@mui/icons-material/HourglassTop';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import type {
  NativeEmployee,
  NativeLeaveBalance,
  NativeMonthlyPayrollRecord,
} from '@/services/hrmService';
import dayjs from 'dayjs';

interface Props {
  employee?: NativeEmployee;
  leaveBalances?: NativeLeaveBalance[];
  recentPayrolls?: NativeMonthlyPayrollRecord[];
}

export const EmployeeKpiRow: React.FC<Props> = ({
  employee,
  leaveBalances = [],
  recentPayrolls = [],
}) => {
  const [showSalary, setShowSalary] = useState(false);

  // Leave Balance
  const annualLeave = leaveBalances[0];
  const remainingDays = annualLeave?.remaining_days ?? annualLeave?.remainingDays ?? 12;
  const usedDays = annualLeave?.used_days ?? annualLeave?.usedDays ?? 0;

  // Latest Payroll
  const latestPayroll = recentPayrolls[0];
  const netSalary = latestPayroll?.net_salary ?? latestPayroll?.netSalary ?? 0;
  const payrollMonth = latestPayroll?.month ? `${latestPayroll.month}/${latestPayroll.year}` : 'Chưa có';

  // Probation countdown
  const isProbation = employee?.status === 'PROBATION';
  let probationDaysLeft: number | null = null;
  if (isProbation && employee?.probation_end_date) {
    const today = dayjs();
    const end = dayjs(employee.probation_end_date);
    probationDaysLeft = Math.max(0, end.diff(today, 'day'));
  }

  return (
    <Grid container spacing={2.5} sx={{ mb: 3 }}>
      {/* KPI 1: Công chuẩn tháng này */}
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <Card
          elevation={0}
          sx={{
            p: 2.5,
            borderRadius: '16px',
            bgcolor: '#ffffff',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 10px rgba(15, 23, 42, 0.03)',
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
            <Box sx={{ p: 1, borderRadius: '10px', bgcolor: '#eff6ff', color: '#2563eb' }}>
              <CalendarMonthIcon sx={{ fontSize: 20 }} />
            </Box>
            <Typography variant="body2" sx={{ fontWeight: 700, color: '#64748b' }}>
              Công chuẩn tháng này
            </Typography>
          </Stack>
          <Typography variant="h5" sx={{ fontWeight: 900, color: '#0f172a', letterSpacing: '-0.5px' }}>
            22.0 <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#94a3b8' }}>ngày công</span>
          </Typography>
          <Typography variant="caption" sx={{ color: '#16a34a', fontWeight: 600, mt: 0.5, display: 'block' }}>
            Chu kỳ chấm công: 01 - 31 hàng tháng
          </Typography>
        </Card>
      </Grid>

      {/* KPI 2: Quỹ phép năm còn lại */}
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <Card
          elevation={0}
          sx={{
            p: 2.5,
            borderRadius: '16px',
            bgcolor: '#ffffff',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 10px rgba(15, 23, 42, 0.03)',
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
            <Box sx={{ p: 1, borderRadius: '10px', bgcolor: '#f0fdf4', color: '#16a34a' }}>
              <BeachAccessIcon sx={{ fontSize: 20 }} />
            </Box>
            <Typography variant="body2" sx={{ fontWeight: 700, color: '#64748b' }}>
              Quỹ phép khả dụng
            </Typography>
          </Stack>
          <Typography variant="h5" sx={{ fontWeight: 900, color: '#0f172a', letterSpacing: '-0.5px' }}>
            {Number(remainingDays).toFixed(1)} <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#94a3b8' }}>ngày phép</span>
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748b', mt: 0.5, display: 'block' }}>
            Đã nghỉ: {Number(usedDays).toFixed(1)} ngày trong năm nay
          </Typography>
        </Card>
      </Grid>

      {/* KPI 3: Lương thực nhận (Net) gần nhất */}
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <Card
          elevation={0}
          sx={{
            p: 2.5,
            borderRadius: '16px',
            bgcolor: '#ffffff',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 10px rgba(15, 23, 42, 0.03)',
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box sx={{ p: 1, borderRadius: '10px', bgcolor: '#fef3c7', color: '#d97706' }}>
                <AccountBalanceWalletIcon sx={{ fontSize: 20 }} />
              </Box>
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#64748b' }}>
                Lương Net gần nhất
              </Typography>
            </Stack>
            <IconButton size="small" onClick={() => setShowSalary((prev) => !prev)}>
              {showSalary ? <VisibilityOffIcon sx={{ fontSize: 18 }} /> : <VisibilityIcon sx={{ fontSize: 18 }} />}
            </IconButton>
          </Stack>
          <Typography variant="h5" sx={{ fontWeight: 900, color: '#0f172a', letterSpacing: '-0.5px' }}>
            {showSalary ? (
              netSalary > 0 ? (
                `${Number(netSalary).toLocaleString('vi-VN')} đ`
              ) : (
                '0 đ'
              )
            ) : (
              '•••••••• đ'
            )}
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748b', mt: 0.5, display: 'block' }}>
            Kỳ lương: {payrollMonth} (Bảo mật số dư)
          </Typography>
        </Card>
      </Grid>

      {/* KPI 4: Trạng thái thử việc / Chính thức */}
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <Card
          elevation={0}
          sx={{
            p: 2.5,
            borderRadius: '16px',
            bgcolor: '#ffffff',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 10px rgba(15, 23, 42, 0.03)',
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
            <Box sx={{ p: 1, borderRadius: '10px', bgcolor: '#f5f3ff', color: '#7c3aed' }}>
              <HourglassTopIcon sx={{ fontSize: 20 }} />
            </Box>
            <Typography variant="body2" sx={{ fontWeight: 700, color: '#64748b' }}>
              {isProbation ? 'Thời hạn Thử việc' : 'Hạng nhân viên'}
            </Typography>
          </Stack>
          <Typography variant="h5" sx={{ fontWeight: 900, color: '#0f172a', letterSpacing: '-0.5px' }}>
            {isProbation
              ? probationDaysLeft !== null
                ? `${probationDaysLeft} ngày`
                : 'Đang theo dõi'
              : 'Chính thức'}
          </Typography>
          <Typography variant="caption" sx={{ color: isProbation ? '#ca8a04' : '#16a34a', fontWeight: 600, mt: 0.5, display: 'block' }}>
            {isProbation ? 'Đang trong thời gian đánh giá năng lực' : 'Đã vượt qua kỳ thử việc'}
          </Typography>
        </Card>
      </Grid>
    </Grid>
  );
};

export default EmployeeKpiRow;
