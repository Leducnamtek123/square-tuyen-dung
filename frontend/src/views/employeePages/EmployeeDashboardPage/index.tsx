'use client';

import React from 'react';
import {
  Box,
  Container,
  CircularProgress,
  Typography,
  Button,
  Stack,
  Alert,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import hrmService from '@/services/hrmService';
import { EmployeeHeader } from './components/EmployeeHeader';
import { EmployeeHeroBanner } from './components/EmployeeHeroBanner';
import { PreboardingChecklistCard } from './components/PreboardingChecklistCard';
import { QuickPunchCard } from './components/QuickPunchCard';
import { EmployeeKpiRow } from './components/EmployeeKpiRow';
import { EmployeeTabsSection } from './components/EmployeeTabsSection';

export default function EmployeeDashboardPage() {
  const router = useRouter();

  const {
    data: profileData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['myHrmProfile'],
    queryFn: async () => {
      return await hrmService.getMyHrmProfile();
    },
    staleTime: 60 * 1000,
  });

  if (isLoading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#f8fafc' }}>
        <EmployeeHeader />
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Stack spacing={2} alignItems="center">
            <CircularProgress size={40} thickness={4} sx={{ color: '#2563eb' }} />
            <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600 }}>
              Đang tải Cổng nhân sự nội bộ...
            </Typography>
          </Stack>
        </Box>
      </Box>
    );
  }

  if (isError || !profileData?.employee) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#f8fafc' }}>
        <EmployeeHeader />
        <Container maxWidth="md" sx={{ py: 8 }}>
          <Alert severity="info" sx={{ mb: 3, borderRadius: '12px' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
              Chưa tìm thấy hồ sơ Nhân viên chính thức
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.5 }}>
              Tài khoản của bạn hiện tại chưa được chuyển đổi hoặc liên kết với hồ sơ nhân sự của doanh nghiệp nào. Nếu bạn vừa trúng tuyển, vui lòng liên hệ bộ phận Tuyển dụng / HR để hoàn tất quy trình tiếp nhận.
            </Typography>
          </Alert>

          <Button
            variant="contained"
            color="primary"
            startIcon={<ArrowBackIcon />}
            onClick={() => router.push('/dashboard')}
            sx={{ textTransform: 'none', borderRadius: '8px', fontWeight: 700 }}
          >
            Quay lại Cổng Ứng viên
          </Button>
        </Container>
      </Box>
    );
  }

  const {
    employee,
    active_contract,
    activeContract,
    leave_balances,
    leaveBalances,
    recent_payrolls,
    recentPayrolls,
    recent_attendance_summaries,
    recentAttendanceSummaries,
    onboarding_process,
    onboardingProcess,
    today_attendance,
    todayAttendance,
  } = profileData;

  const currentContract = active_contract || activeContract;
  const currentLeaveBalances = leave_balances || leaveBalances || [];
  const currentPayrolls = recent_payrolls || recentPayrolls || [];
  const currentSummaries = recent_attendance_summaries || recentAttendanceSummaries || [];
  const currentOnboarding = onboarding_process || onboardingProcess;
  const currentTodayAttendance = today_attendance || todayAttendance;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
      <EmployeeHeader
        employee={employee}
        companyName={employee?.company_name}
      />

      <Container maxWidth="xl" sx={{ py: { xs: 2.5, md: 4 }, flex: 1 }}>
        {/* Hero Identity Banner */}
        <EmployeeHeroBanner
          employee={employee}
          activeContract={currentContract}
        />

        {/* Preboarding Checklist (Displays if onboarding is not completed) */}
        <PreboardingChecklistCard
          process={currentOnboarding}
          onRefresh={refetch}
        />

        {/* Quick Web Attendance Punch Card */}
        <QuickPunchCard
          todayAttendance={currentTodayAttendance}
          onRefresh={refetch}
        />

        {/* Summary KPIs (Leave, Payroll, Probation, Shifts) */}
        <EmployeeKpiRow
          employee={employee}
          leaveBalances={currentLeaveBalances}
          recentPayrolls={currentPayrolls}
        />

        {/* Detailed Tabs: Contract, Leave Management, Payslips, Attendance Summaries */}
        <EmployeeTabsSection
          employee={employee}
          activeContract={currentContract}
          leaveBalances={currentLeaveBalances}
          recentPayrolls={currentPayrolls}
          recentAttendanceSummaries={currentSummaries}
          onRefresh={refetch}
        />
      </Container>
    </Box>
  );
}
