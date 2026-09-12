'use client';

import React, { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Card,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Stack,
  Avatar,
  Tooltip,
  LinearProgress,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import EventBusyOutlinedIcon from '@mui/icons-material/EventBusyOutlined';
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import TableChartOutlinedIcon from '@mui/icons-material/TableChartOutlined';
import SummarizeOutlinedIcon from '@mui/icons-material/SummarizeOutlined';
import GridViewOutlinedIcon from '@mui/icons-material/GridViewOutlined';
import FingerprintOutlinedIcon from '@mui/icons-material/FingerprintOutlined';
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';

import {
  useHrmEmployees,
  useHrmWorkShifts,
  useHrmAttendanceRequests,
  useHrmTimesheet,
  useHrmMutations,
} from '../../hooks/useHrmQueries';
import { TabTitle } from '@/utils/generalFunction';

export default function AttendanceOverviewPage() {
  TabTitle('Tổng quan chấm công | InfoHR HRM');

  const router = useRouter();
  const today = new Date();
  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();
  const currentDay = today.getDate();

  // Queries
  const { data: employees = [], isLoading: empLoading } = useHrmEmployees();
  const { data: shifts = [] } = useHrmWorkShifts();
  const { data: requests = [], isLoading: reqLoading } = useHrmAttendanceRequests();
  const { data: timesheet, isLoading: timesheetLoading } = useHrmTimesheet({
    month: currentMonth,
    year: currentYear,
  });

  const { approveAttendanceRequestStage1, approveAttendanceRequestStage2 } = useHrmMutations();

  // Compute today's attendance stats
  const todayStats = useMemo(() => {
    let present = 0;
    let late = 0;
    let onLeave = 0;
    let absent = 0;

    if (timesheet?.employees) {
      timesheet.employees.forEach((emp: any) => {
        const rec = emp.records?.[currentDay];
        if (rec) {
          if (rec.status === 'PRESENT') present++;
          else if (rec.status === 'LATE') {
            present++;
            late++;
          } else if (rec.status === 'EARLY_LEAVE') {
            present++;
          } else if (rec.status === 'ON_LEAVE') onLeave++;
          else if (rec.status === 'ABSENT') absent++;
        }
      });
    }

    const total = employees.length || 1;
    const rate = Math.round((present / total) * 100);

    return { present, late, onLeave, absent, rate, total: employees.length };
  }, [timesheet, currentDay, employees.length]);

  // Pending requests (Stage 1 or Stage 2)
  const pendingRequests = useMemo(() => {
    return requests
      .filter((r) => r.status === 'PENDING_STAGE_1' || r.status === 'APPROVED_STAGE_1')
      .slice(0, 5);
  }, [requests]);

  const activeShifts = useMemo(() => {
    return shifts.filter((s) => s.is_active !== false);
  }, [shifts]);

  return (
    <Box>
      {/* Header Banner */}
      <Card
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 2.5,
          border: '1px solid #E2E8F0',
          backgroundColor: '#FFFFFF',
        }}
      >
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          alignItems={{ xs: 'stretch', md: 'center' }}
          justifyContent="space-between"
        >
          <Box>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 0.5 }}>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#0F172A' }}>
                Tổng quan chấm công & Chuyên cần
              </Typography>
              <Chip
                label={`Hôm nay: Ngày ${currentDay} Tháng ${currentMonth}, ${currentYear}`}
                size="small"
                sx={{
                  backgroundColor: '#EFF6FF',
                  color: '#2563EB',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                }}
              />
            </Stack>
            <Typography variant="body2" sx={{ color: '#64748B' }}>
              Theo dõi tình hình đi làm theo thời gian thực, duyệt đơn từ 2 cấp và quản lý ca làm việc
            </Typography>
          </Box>

          <Stack direction="row" spacing={1.5} flexWrap="wrap">
            <Button
              variant="outlined"
              onClick={() => router.push('/employer/hrm/attendances/timesheets')}
              sx={{
                textTransform: 'none',
                borderRadius: 2,
                borderColor: '#CBD5E1',
                color: '#334155',
                fontWeight: 600,
                '&:hover': { borderColor: '#94A3B8', backgroundColor: '#F8FAFC' },
              }}
            >
              Bảng chấm công chi tiết
            </Button>
            <Button
              variant="contained"
              onClick={() => router.push('/employer/hrm/attendances/shift-assignments')}
              sx={{
                textTransform: 'none',
                borderRadius: 2,
                backgroundColor: '#2563EB',
                fontWeight: 600,
                boxShadow: 'none',
                '&:hover': { backgroundColor: '#1D4ED8', boxShadow: 'none' },
              }}
            >
              Phân ca làm việc
            </Button>
          </Stack>
        </Stack>
      </Card>

      {/* 5 Top KPI Cards */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Card elevation={0} sx={{ p: 2.5, borderRadius: 2.5, border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF' }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Box sx={{ width: 44, height: 44, borderRadius: 2, bgcolor: '#DCFCE7', color: '#15803D', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircleOutlineIcon fontSize="medium" />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
                  Đi làm hôm nay
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#15803D', lineHeight: 1.2 }}>
                  {todayStats.rate}%
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748B' }}>
                  {todayStats.present}/{todayStats.total} nhân viên
                </Typography>
              </Box>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={todayStats.rate}
              sx={{ mt: 2, height: 6, borderRadius: 3, bgcolor: '#E2E8F0', '& .MuiLinearProgress-bar': { bgcolor: '#15803D', borderRadius: 3 } }}
            />
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Card elevation={0} sx={{ p: 2.5, borderRadius: 2.5, border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF' }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Box sx={{ width: 44, height: 44, borderRadius: 2, bgcolor: '#FEF3C7', color: '#B45309', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AccessTimeOutlinedIcon fontSize="medium" />
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
                  Đi muộn / Về sớm
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#B45309', lineHeight: 1.2 }}>
                  {todayStats.late}
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748B' }}>
                  Lượt trong ngày
                </Typography>
              </Box>
            </Stack>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Card elevation={0} sx={{ p: 2.5, borderRadius: 2.5, border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF' }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Box sx={{ width: 44, height: 44, borderRadius: 2, bgcolor: '#DBEAFE', color: '#1D4ED8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <EventBusyOutlinedIcon fontSize="medium" />
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
                  Nghỉ phép / Công tác
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#1D4ED8', lineHeight: 1.2 }}>
                  {todayStats.onLeave}
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748B' }}>
                  Đã được duyệt
                </Typography>
              </Box>
            </Stack>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Card elevation={0} sx={{ p: 2.5, borderRadius: 2.5, border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF' }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Box sx={{ width: 44, height: 44, borderRadius: 2, bgcolor: '#FEE2E2', color: '#B91C1C', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <HelpOutlineOutlinedIcon fontSize="medium" />
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
                  Vắng mặt chưa rõ
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#B91C1C', lineHeight: 1.2 }}>
                  {todayStats.absent}
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748B' }}>
                  Cần đối chiếu
                </Typography>
              </Box>
            </Stack>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Card elevation={0} sx={{ p: 2.5, borderRadius: 2.5, border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF' }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Box sx={{ width: 44, height: 44, borderRadius: 2, bgcolor: '#F3E8FF', color: '#7E22CE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <DescriptionOutlinedIcon fontSize="medium" />
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
                  Đơn chờ phê duyệt
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#7E22CE', lineHeight: 1.2 }}>
                  {pendingRequests.length}
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748B' }}>
                  Cần xử lý
                </Typography>
              </Box>
            </Stack>
          </Card>
        </Grid>
      </Grid>

      {/* Feature Navigation Shortcuts */}
      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0F172A', mb: 2 }}>
        Lối tắt phân hệ Chấm công
      </Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          {
            title: 'Bảng chấm công chi tiết',
            desc: 'Theo dõi chi tiết quẹt thẻ & ký hiệu công ngày 1-31',
            icon: <TableChartOutlinedIcon sx={{ color: '#2563EB' }} />,
            url: '/employer/hrm/attendances/timesheets',
            bg: '#EFF6FF',
          },
          {
            title: 'Bảng phân ca tổng hợp',
            desc: 'Lập lịch phân ca nhân viên và ca làm việc hàng loạt',
            icon: <GridViewOutlinedIcon sx={{ color: '#059669' }} />,
            url: '/employer/hrm/attendances/shift-assignments',
            bg: '#ECFDF5',
          },
          {
            title: 'Bảng chấm công tổng hợp',
            desc: 'Khóa công tháng và chuyển tính lương sang phân hệ Bảng lương',
            icon: <SummarizeOutlinedIcon sx={{ color: '#7C3AED' }} />,
            url: '/employer/hrm/attendances/monthly-summary',
            bg: '#F5F3FF',
          },
          {
            title: 'Trung tâm quản lý đơn từ',
            desc: 'Phê duyệt 2 cấp đơn xin nghỉ, cập nhật công, làm thêm giờ, công tác',
            icon: <DescriptionOutlinedIcon sx={{ color: '#EA580C' }} />,
            url: '/employer/hrm/attendances/requests',
            bg: '#FFF7ED',
          },
          {
            title: 'Dữ liệu máy chấm công',
            desc: 'Log quẹt thẻ máy chấm công và dữ liệu nhập từ Excel',
            icon: <FingerprintOutlinedIcon sx={{ color: '#0284C7' }} />,
            url: '/employer/hrm/attendances/biometric-logs',
            bg: '#F0F9FF',
          },
        ].map((item, idx) => (
          <Grid size={{ xs: 12, sm: 6, md: 2.4 }} key={idx}>
            <Card
              elevation={0}
              onClick={() => router.push(item.url)}
              sx={{
                p: 2.5,
                borderRadius: 2.5,
                border: '1px solid #E2E8F0',
                backgroundColor: '#FFFFFF',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                '&:hover': {
                  borderColor: '#2563EB',
                  boxShadow: '0 4px 12px rgba(37, 99, 235, 0.08)',
                  transform: 'translateY(-2px)',
                },
              }}
            >
              <Box>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 2,
                    backgroundColor: item.bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 1.5,
                  }}
                >
                  {item.icon}
                </Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A', mb: 0.5 }}>
                  {item.title}
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748B', display: 'block', lineHeight: 1.4 }}>
                  {item.desc}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', color: '#2563EB', mt: 2, fontSize: '0.75rem', fontWeight: 600 }}>
                Truy cập ngay <ArrowForwardOutlinedIcon sx={{ fontSize: '0.875rem !important', ml: 0.5 }} />
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Two Column Section */}
      <Grid container spacing={3}>
        {/* Left: Pending Requests */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 2.5,
              border: '1px solid #E2E8F0',
              overflow: 'hidden',
              backgroundColor: '#FFFFFF',
              height: '100%',
            }}
          >
            <Box sx={{ p: 2.5, borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0F172A' }}>
                  Đơn từ chờ duyệt gần đây
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748B' }}>
                  Cần phê duyệt từ Quản lý trực tiếp hoặc HR
                </Typography>
              </Box>
              <Button
                size="small"
                onClick={() => router.push('/employer/hrm/attendances/requests')}
                endIcon={<ArrowForwardOutlinedIcon sx={{ fontSize: 14 }} />}
                sx={{ textTransform: 'none', fontWeight: 600 }}
              >
                Xem tất cả
              </Button>
            </Box>

            <TableContainer component={Paper} elevation={0}>
              <Table size="small">
                <TableHead sx={{ backgroundColor: '#F8FAFC' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Nhân viên</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Loại đơn</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Thời gian</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Trạng thái</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, color: '#475569' }}>
                      Xử lý
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reqLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                        <CircularProgress size={24} sx={{ color: '#2563EB' }} />
                      </TableCell>
                    </TableRow>
                  ) : pendingRequests.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 4, color: '#64748B' }}>
                        Không có đơn từ nào cần duyệt vào lúc này.
                      </TableCell>
                    </TableRow>
                  ) : (
                    pendingRequests.map((req) => (
                      <TableRow key={req.id} hover>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#0F172A' }}>
                            {req.employee_name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#64748B' }}>
                            {req.employee_code}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Chip
                            label={req.request_type_label || req.request_type}
                            size="small"
                            sx={{ height: 22, fontSize: '0.6875rem', fontWeight: 600, bgcolor: '#EFF6FF', color: '#1D4ED8' }}
                          />
                        </TableCell>

                        <TableCell sx={{ fontSize: '0.8125rem', color: '#334155' }}>
                          {req.start_date}
                        </TableCell>

                        <TableCell>
                          <Chip
                            label={req.status === 'PENDING_STAGE_1' ? 'Chờ QL duyệt' : 'Chờ HR duyệt'}
                            size="small"
                            sx={{
                              height: 20,
                              fontSize: '0.6875rem',
                              fontWeight: 600,
                              bgcolor: req.status === 'PENDING_STAGE_1' ? '#FEF3C7' : '#E0F2FE',
                              color: req.status === 'PENDING_STAGE_1' ? '#B45309' : '#0369A1',
                            }}
                          />
                        </TableCell>

                        <TableCell align="right">
                          {req.status === 'PENDING_STAGE_1' ? (
                            <Button
                              size="small"
                              variant="contained"
                              onClick={() => approveAttendanceRequestStage1.mutateAsync(req.id)}
                              disabled={approveAttendanceRequestStage1.isPending}
                              sx={{ textTransform: 'none', fontSize: '0.6875rem', borderRadius: 1.5, py: 0.25 }}
                            >
                              Duyệt C1
                            </Button>
                          ) : (
                            <Button
                              size="small"
                              variant="contained"
                              color="success"
                              onClick={() => approveAttendanceRequestStage2.mutateAsync(req.id)}
                              disabled={approveAttendanceRequestStage2.isPending}
                              sx={{ textTransform: 'none', fontSize: '0.6875rem', borderRadius: 1.5, py: 0.25 }}
                            >
                              Duyệt C2
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Grid>

        {/* Right: Active Shifts */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 2.5,
              border: '1px solid #E2E8F0',
              overflow: 'hidden',
              backgroundColor: '#FFFFFF',
              height: '100%',
            }}
          >
            <Box sx={{ p: 2.5, borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0F172A' }}>
                  Ca làm việc đang áp dụng
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748B' }}>
                  {activeShifts.length} ca làm việc đang kích hoạt
                </Typography>
              </Box>
              <Button
                size="small"
                onClick={() => router.push('/employer/hrm/attendances/shifts')}
                endIcon={<ArrowForwardOutlinedIcon sx={{ fontSize: 14 }} />}
                sx={{ textTransform: 'none', fontWeight: 600 }}
              >
                Cài đặt ca
              </Button>
            </Box>

            <Stack spacing={1.5} sx={{ p: 2.5 }}>
              {activeShifts.length === 0 ? (
                <Typography variant="body2" sx={{ color: '#64748B', textAlign: 'center', py: 3 }}>
                  Chưa có ca làm việc nào được kích hoạt.
                </Typography>
              ) : (
                activeShifts.map((s) => (
                  <Paper
                    key={s.id}
                    variant="outlined"
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      backgroundColor: '#F8FAFC',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Chip
                        label={s.code}
                        size="small"
                        sx={{ fontWeight: 700, bgcolor: '#EFF6FF', color: '#2563EB', borderRadius: 1.5 }}
                      />
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A' }}>
                          {s.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748B' }}>
                          {s.start_time?.slice(0, 5)} - {s.end_time?.slice(0, 5)} • {s.working_hours} giờ làm
                        </Typography>
                      </Box>
                    </Stack>

                    <Chip
                      label={`x${s.work_factor || '1.0'}`}
                      size="small"
                      sx={{ height: 22, fontSize: '0.75rem', fontWeight: 600, bgcolor: '#E2E8F0', color: '#475569' }}
                    />
                  </Paper>
                ))
              )}
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
