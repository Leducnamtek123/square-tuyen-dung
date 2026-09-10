'use client';

import React, { useState, useMemo } from 'react';
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
  TextField,
  MenuItem,
  InputAdornment,
  LinearProgress,
  Divider,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import MoreTimeOutlinedIcon from '@mui/icons-material/MoreTimeOutlined';
import EventBusyOutlinedIcon from '@mui/icons-material/EventBusyOutlined';

import {
  useHrmEmployees,
  useHrmDepartments,
  useHrmMonthlyAttendanceSummaries,
} from '../../hooks/useHrmQueries';
import { TabTitle } from '@/utils/generalFunction';

const inputSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 2,
    fontSize: '0.875rem',
    backgroundColor: '#FFFFFF',
    '& fieldset': { borderColor: '#E2E8F0' },
    '&:hover fieldset': { borderColor: '#CBD5E1' },
    '&.Mui-focused fieldset': { borderColor: '#2563EB', borderWidth: '1.5px' },
  },
};

export default function AttendanceReportsPage() {
  TabTitle('Báo cáo & Thống kê Chuyên cần | InfoHR HRM');

  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState<number>(today.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(today.getFullYear());
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const { data: departments = [] } = useHrmDepartments();
  const { data: employees = [] } = useHrmEmployees();
  const {
    data: summaries = [],
    isLoading: summaryLoading,
    refetch,
  } = useHrmMonthlyAttendanceSummaries({
    month: selectedMonth,
    year: selectedYear,
  });

  // Filtered dataset
  const filteredData = useMemo(() => {
    return summaries.filter((s) => {
      const matchDept =
        selectedDept === 'ALL' ||
        (s.department_name && s.department_name.toLowerCase().includes(selectedDept.toLowerCase()));
      const matchSearch =
        !searchTerm.trim() ||
        (s.employee_name && s.employee_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (s.employee_code && s.employee_code.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchDept && matchSearch;
    });
  }, [summaries, selectedDept, searchTerm]);

  // Aggregate metrics
  const aggregateStats = useMemo(() => {
    let totalStandardDays = 0;
    let totalActualDays = 0;
    let totalOTHours = 0;
    let totalLateEarly = 0;
    let totalPaidLeave = 0;
    let totalUnpaidLeave = 0;

    filteredData.forEach((item) => {
      totalStandardDays += Number(item.standard_work_days) || 26;
      totalActualDays += Number(item.actual_work_days) || 0;
      totalOTHours += (Number(item.overtime_hours_weekday) || 0) + (Number(item.overtime_hours_weekend) || 0);
      totalLateEarly += (Number(item.late_occurrences) || 0) + (Number(item.early_occurrences) || 0);
      totalPaidLeave += Number(item.paid_leave_days) || 0;
      totalUnpaidLeave += Number(item.unpaid_leave_days) || 0;
    });

    const attendanceRate =
      totalStandardDays > 0
        ? Math.min(100, Math.round((totalActualDays / totalStandardDays) * 100))
        : 100;

    return {
      attendanceRate,
      totalActualDays,
      totalOTHours: Math.round(totalOTHours * 10) / 10,
      totalLateEarly,
      totalLeaveDays: totalPaidLeave + totalUnpaidLeave,
      employeeCount: filteredData.length,
    };
  }, [filteredData]);

  // Department Breakdown
  const deptBreakdown = useMemo(() => {
    const map: Record<string, { name: string; totalDays: number; actualDays: number; count: number }> = {};

    filteredData.forEach((s) => {
      const dName = s.department_name || 'Khác';
      if (!map[dName]) {
        map[dName] = { name: dName, totalDays: 0, actualDays: 0, count: 0 };
      }
      map[dName].totalDays += Number(s.standard_work_days) || 26;
      map[dName].actualDays += Number(s.actual_work_days) || 0;
      map[dName].count += 1;
    });

    return Object.values(map).map((d) => {
      const rate = d.totalDays > 0 ? Math.min(100, Math.round((d.actualDays / d.totalDays) * 100)) : 100;
      return { ...d, rate };
    });
  }, [filteredData]);

  // Export CSV Handler
  const handleExportCSV = () => {
    if (filteredData.length === 0) return;

    const headers = [
      'Mã nhân viên',
      'Họ và tên',
      'Phòng ban',
      'Công chuẩn',
      'Công thực tế',
      'Giờ làm thêm',
      'Đi muộn về sớm',
      'Nghỉ phép',
      'Nghỉ không lương',
      'Tỷ lệ chuyên cần (%)',
    ];

    const rows = filteredData.map((s) => {
      const std = Number(s.standard_work_days) || 26;
      const act = Number(s.actual_work_days) || 0;
      const rate = std > 0 ? Math.min(100, Math.round((act / std) * 100)) : 100;
      const ot = (Number(s.overtime_hours_weekday) || 0) + (Number(s.overtime_hours_weekend) || 0);

      return [
        `"${s.employee_code || ''}"`,
        `"${s.employee_name || ''}"`,
        `"${s.department_name || ''}"`,
        std,
        act,
        ot,
        (Number(s.late_occurrences) || 0) + (Number(s.early_occurrences) || 0),
        Number(s.paid_leave_days) || 0,
        Number(s.unpaid_leave_days) || 0,
        rate,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Bao_cao_chuyen_can_Thang_${selectedMonth}_${selectedYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 2,
                  backgroundColor: '#EFF6FF',
                  color: '#2563EB',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <AssessmentOutlinedIcon />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#0F172A' }}>
                Báo cáo & Thống kê Chuyên cần
              </Typography>
            </Stack>
            <Typography variant="body2" sx={{ color: '#64748B' }}>
              Phân tích tỷ lệ đi làm, số giờ làm thêm và tình hình chấp hành thời gian làm việc toàn doanh nghiệp
            </Typography>
          </Box>

          <Stack direction="row" spacing={1.5} flexWrap="wrap" alignItems="center">
            <TextField
              select
              size="small"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              sx={{ width: 130, ...inputSx }}
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <MenuItem key={m} value={m}>
                  Tháng {m}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              size="small"
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              sx={{ width: 110, ...inputSx }}
            >
              {[today.getFullYear() - 1, today.getFullYear(), today.getFullYear() + 1].map((y) => (
                <MenuItem key={y} value={y}>
                  Năm {y}
                </MenuItem>
              ))}
            </TextField>

            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={() => refetch()}
              sx={{
                textTransform: 'none',
                borderRadius: 2,
                borderColor: '#CBD5E1',
                color: '#334155',
                fontWeight: 600,
                '&:hover': { borderColor: '#94A3B8', backgroundColor: '#F8FAFC' },
              }}
            >
              Làm mới
            </Button>

            <Button
              variant="contained"
              startIcon={<FileDownloadOutlinedIcon />}
              onClick={handleExportCSV}
              sx={{
                textTransform: 'none',
                borderRadius: 2,
                backgroundColor: '#2563EB',
                fontWeight: 600,
                boxShadow: 'none',
                '&:hover': { backgroundColor: '#1D4ED8', boxShadow: 'none' },
              }}
            >
              Xuất dữ liệu Excel
            </Button>
          </Stack>
        </Stack>
      </Card>

      {/* 4 Executive KPI Cards */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card elevation={0} sx={{ p: 2.5, borderRadius: 2.5, border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF' }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Box sx={{ width: 44, height: 44, borderRadius: 2, bgcolor: '#DCFCE7', color: '#15803D', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircleOutlineIcon fontSize="medium" />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
                  Tỷ lệ chuyên cần bình quân
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#15803D', lineHeight: 1.2 }}>
                  {aggregateStats.attendanceRate}%
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748B' }}>
                  {aggregateStats.employeeCount} nhân sự theo dõi
                </Typography>
              </Box>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={aggregateStats.attendanceRate}
              sx={{ mt: 2, height: 6, borderRadius: 3, bgcolor: '#E2E8F0', '& .MuiLinearProgress-bar': { bgcolor: '#15803D', borderRadius: 3 } }}
            />
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card elevation={0} sx={{ p: 2.5, borderRadius: 2.5, border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF' }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Box sx={{ width: 44, height: 44, borderRadius: 2, bgcolor: '#F3E8FF', color: '#7E22CE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MoreTimeOutlinedIcon fontSize="medium" />
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
                  Tổng số giờ làm thêm
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#7E22CE', lineHeight: 1.2 }}>
                  {aggregateStats.totalOTHours} giờ
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748B' }}>
                  Trong tháng {selectedMonth}/{selectedYear}
                </Typography>
              </Box>
            </Stack>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card elevation={0} sx={{ p: 2.5, borderRadius: 2.5, border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF' }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Box sx={{ width: 44, height: 44, borderRadius: 2, bgcolor: '#FEF3C7', color: '#B45309', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AccessTimeOutlinedIcon fontSize="medium" />
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
                  Lượt đi muộn, về sớm
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#B45309', lineHeight: 1.2 }}>
                  {aggregateStats.totalLateEarly} lượt
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748B' }}>
                  Cần nhắc nhở chấp hành
                </Typography>
              </Box>
            </Stack>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card elevation={0} sx={{ p: 2.5, borderRadius: 2.5, border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF' }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Box sx={{ width: 44, height: 44, borderRadius: 2, bgcolor: '#DBEAFE', color: '#1D4ED8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <EventBusyOutlinedIcon fontSize="medium" />
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
                  Tổng ngày nghỉ phép
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#1D4ED8', lineHeight: 1.2 }}>
                  {aggregateStats.totalLeaveDays} ngày
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748B' }}>
                  Bao gồm phép năm & không lương
                </Typography>
              </Box>
            </Stack>
          </Card>
        </Grid>
      </Grid>

      {/* Department Breakdown Bar */}
      {deptBreakdown.length > 0 && (
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
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0F172A', mb: 2 }}>
            Tỷ lệ chuyên cần theo phòng ban
          </Typography>
          <Grid container spacing={2.5}>
            {deptBreakdown.map((dept, idx) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={idx}>
                <Box sx={{ p: 2, borderRadius: 2, backgroundColor: '#F8FAFC', border: '1px solid #F1F5F9' }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#1E293B' }}>
                      {dept.name}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: dept.rate >= 90 ? '#15803D' : '#B45309' }}>
                      {dept.rate}%
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={dept.rate}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: '#E2E8F0',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: dept.rate >= 90 ? '#10B981' : '#F59E0B',
                        borderRadius: 4,
                      },
                    }}
                  />
                  <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mt: 1 }}>
                    {dept.count} nhân sự tham gia chấm công
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Card>
      )}

      {/* Detailed Table Section */}
      <Card
        elevation={0}
        sx={{
          borderRadius: 2.5,
          border: '1px solid #E2E8F0',
          backgroundColor: '#FFFFFF',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            p: 2.5,
            borderBottom: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0F172A' }}>
            Chi tiết chuyên cần theo từng nhân viên
          </Typography>

          <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
            <TextField
              size="small"
              placeholder="Tìm theo tên hoặc mã nhân viên..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" sx={{ color: '#94A3B8' }} />
                  </InputAdornment>
                ),
              }}
              sx={{ width: { xs: '100%', sm: 260 }, ...inputSx }}
            />

            <TextField
              select
              size="small"
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              sx={{ width: { xs: '100%', sm: 180 }, ...inputSx }}
            >
              <MenuItem value="ALL">Tất cả phòng ban</MenuItem>
              {departments.map((d) => (
                <MenuItem key={d.id} value={d.name}>
                  {d.name}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        </Box>

        <TableContainer sx={{ maxHeight: 600 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, color: '#334155', backgroundColor: '#F8FAFC' }}>Mã NV</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#334155', backgroundColor: '#F8FAFC' }}>Họ và tên</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#334155', backgroundColor: '#F8FAFC' }}>Phòng ban</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, color: '#334155', backgroundColor: '#F8FAFC' }}>Công chuẩn</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, color: '#334155', backgroundColor: '#F8FAFC' }}>Công thực tế</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, color: '#334155', backgroundColor: '#F8FAFC' }}>Giờ làm thêm</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, color: '#334155', backgroundColor: '#F8FAFC' }}>Đi muộn, về sớm</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, color: '#334155', backgroundColor: '#F8FAFC' }}>Nghỉ phép</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, color: '#334155', backgroundColor: '#F8FAFC' }}>Nghỉ không lương</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, color: '#334155', backgroundColor: '#F8FAFC' }}>Chuyên cần</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {summaryLoading ? (
                <TableRow>
                  <TableCell colSpan={10} align="center" sx={{ py: 6 }}>
                    <CircularProgress size={32} />
                    <Typography variant="body2" sx={{ color: '#64748B', mt: 1.5 }}>
                      Đang tính toán số liệu thống kê...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} align="center" sx={{ py: 6 }}>
                    <Typography variant="body2" sx={{ color: '#94A3B8' }}>
                      Chưa có dữ liệu thống kê cho bộ lọc được chọn
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((row) => {
                  const std = Number(row.standard_work_days) || 26;
                  const act = Number(row.actual_work_days) || 0;
                  const rate = std > 0 ? Math.min(100, Math.round((act / std) * 100)) : 100;
                  const ot = (Number(row.overtime_hours_weekday) || 0) + (Number(row.overtime_hours_weekend) || 0);
                  const lateEarly = (Number(row.late_occurrences) || 0) + (Number(row.early_occurrences) || 0);

                  return (
                    <TableRow key={row.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                      <TableCell sx={{ fontWeight: 600, color: '#2563EB' }}>
                        {row.employee_code}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#0F172A' }}>
                        {row.employee_name}
                      </TableCell>
                      <TableCell sx={{ color: '#64748B' }}>
                        {row.department_name || '-'}
                      </TableCell>
                      <TableCell align="center" sx={{ color: '#64748B' }}>
                        {std}
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700, color: '#059669' }}>
                        {act}
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600, color: ot > 0 ? '#7E22CE' : '#94A3B8' }}>
                        {ot > 0 ? `${ot}h` : '-'}
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600, color: lateEarly > 0 ? '#B45309' : '#94A3B8' }}>
                        {lateEarly > 0 ? `${lateEarly} lượt` : '-'}
                      </TableCell>
                      <TableCell align="center" sx={{ color: Number(row.paid_leave_days) > 0 ? '#2563EB' : '#94A3B8' }}>
                        {Number(row.paid_leave_days) || '-'}
                      </TableCell>
                      <TableCell align="center" sx={{ color: Number(row.unpaid_leave_days) > 0 ? '#DC2626' : '#94A3B8' }}>
                        {Number(row.unpaid_leave_days) || '-'}
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={`${rate}%`}
                          size="small"
                          sx={{
                            fontWeight: 700,
                            fontSize: '0.75rem',
                            backgroundColor: rate >= 90 ? '#DCFCE7' : rate >= 75 ? '#FEF3C7' : '#FEE2E2',
                            color: rate >= 90 ? '#15803D' : rate >= 75 ? '#B45309' : '#B91C1C',
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
}
