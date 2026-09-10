'use client';

import React, { useState, useMemo } from 'react';
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
  TextField,
  MenuItem,
  CircularProgress,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Avatar,
  InputAdornment,
  Alert,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import RefreshIcon from '@mui/icons-material/Refresh';
import CalculateOutlinedIcon from '@mui/icons-material/CalculateOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import LockOpenOutlinedIcon from '@mui/icons-material/LockOpenOutlined';
import PaymentOutlinedIcon from '@mui/icons-material/PaymentOutlined';
import SearchIcon from '@mui/icons-material/Search';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import WorkHistoryOutlinedIcon from '@mui/icons-material/WorkHistoryOutlined';
import EventBusyOutlinedIcon from '@mui/icons-material/EventBusyOutlined';
import MoreTimeOutlinedIcon from '@mui/icons-material/MoreTimeOutlined';

import {
  useHrmMonthlyAttendanceSummaries,
  useHrmDepartments,
  useHrmMutations,
} from '../../hooks/useHrmQueries';
import { NativeMonthlyAttendanceSummary } from '@/services/hrmService';
import { TabTitle } from '@/utils/generalFunction';
import pc from '@/utils/muiColors';

const inputSx = {
  '& .MuiOutlinedInput-root': {
    minHeight: 40,
    borderRadius: 2,
    backgroundColor: 'background.paper',
    '& fieldset': { borderColor: pc.divider(0.95) },
    '&:hover': { backgroundColor: pc.bgDefault(0.45) },
    '&:hover fieldset': { borderColor: pc.primary(0.35) },
    '&.Mui-focused fieldset': { borderColor: 'primary.main', borderWidth: 1 },
  },
  '& .MuiInputBase-input': {
    fontSize: '0.875rem',
    py: '8px',
  },
};

export default function SummaryTimesheetPage() {
  TabTitle('Bảng chấm công tổng hợp | InfoHR HRM');

  const router = useRouter();
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState<number>(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(currentDate.getFullYear());
  const [selectedDepartment, setSelectedDepartment] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Queries
  const {
    data: summaries = [],
    isLoading,
    refetch,
  } = useHrmMonthlyAttendanceSummaries({
    month: selectedMonth,
    year: selectedYear,
    department_id: selectedDepartment === 'ALL' ? undefined : Number(selectedDepartment),
  });

  const { data: departments = [] } = useHrmDepartments();

  // Mutations
  const {
    recalculateMonthlyAttendanceSummary,
    lockMonthlyAttendanceSummary,
    unlockMonthlyAttendanceSummary,
    pushSummaryToPayroll,
  } = useHrmMutations();

  // Confirm Dialogs
  const [pushConfirmModal, setPushConfirmModal] = useState<{
    open: boolean;
    summary: NativeMonthlyAttendanceSummary | null;
  }>({
    open: false,
    summary: null,
  });

  const [lockConfirmModal, setLockConfirmModal] = useState<{
    open: boolean;
    summary: NativeMonthlyAttendanceSummary | null;
    action: 'LOCK' | 'UNLOCK';
  }>({
    open: false,
    summary: null,
    action: 'LOCK',
  });

  // Filtered summaries
  const filteredSummaries = useMemo(() => {
    return summaries.filter((item) => {
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const name = (item.employee_name || '').toLowerCase();
        const code = (item.employee_code || '').toLowerCase();
        return name.includes(term) || code.includes(term);
      }
      return true;
    });
  }, [summaries, searchTerm]);

  // Aggregate KPI Stats
  const kpiStats = useMemo(() => {
    let totalActualDays = 0;
    let totalPaidLeave = 0;
    let totalUnpaidLeave = 0;
    let totalOTHours = 0;

    filteredSummaries.forEach((s) => {
      totalActualDays += Number(s.actual_work_days || 0);
      totalPaidLeave += Number(s.paid_leave_days || 0);
      totalUnpaidLeave += Number(s.unpaid_leave_days || 0);
      totalOTHours += Number(s.overtime_hours_weekday || 0) + Number(s.overtime_hours_weekend || 0);
    });

    return {
      count: filteredSummaries.length,
      totalActualDays: totalActualDays.toFixed(1),
      totalPaidLeave: totalPaidLeave.toFixed(1),
      totalUnpaidLeave: totalUnpaidLeave.toFixed(1),
      totalOTHours: totalOTHours.toFixed(1),
    };
  }, [filteredSummaries]);

  const handleRecalculate = async () => {
    await recalculateMonthlyAttendanceSummary.mutateAsync({
      month: selectedMonth,
      year: selectedYear,
    });
  };

  const handleConfirmLockToggle = async () => {
    if (!lockConfirmModal.summary) return;
    if (lockConfirmModal.action === 'LOCK') {
      await lockMonthlyAttendanceSummary.mutateAsync(lockConfirmModal.summary.id);
    } else {
      await unlockMonthlyAttendanceSummary.mutateAsync(lockConfirmModal.summary.id);
    }
    setLockConfirmModal({ open: false, summary: null, action: 'LOCK' });
  };

  const handleConfirmPush = async () => {
    if (!pushConfirmModal.summary) return;
    await pushSummaryToPayroll.mutateAsync(pushConfirmModal.summary.id);
    setPushConfirmModal({ open: false, summary: null });
  };

  return (
    <Box>
      {/* Header Toolbar */}
      <Card
        elevation={0}
        sx={{
          p: 2.5,
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
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#0F172A', mb: 0.5 }}>
              Bảng chấm công tổng hợp tháng {selectedMonth}/{selectedYear}
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748B' }}>
              Tổng kết ngày công, khóa dữ liệu chấm công và chuyển trực tiếp sang phân hệ Tính lương nhân viên
            </Typography>
          </Box>

          <Stack direction="row" spacing={1.5} flexWrap="wrap">
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={() => refetch()}
              sx={{
                textTransform: 'none',
                borderRadius: 2,
                borderColor: '#CBD5E1',
                color: '#475569',
                '&:hover': { borderColor: '#94A3B8', backgroundColor: '#F8FAFC' },
              }}
            >
              Làm mới
            </Button>
            <Button
              variant="contained"
              startIcon={<CalculateOutlinedIcon />}
              onClick={handleRecalculate}
              disabled={recalculateMonthlyAttendanceSummary.isPending}
              sx={{
                textTransform: 'none',
                borderRadius: 2,
                backgroundColor: '#2563EB',
                fontWeight: 600,
                boxShadow: 'none',
                '&:hover': { backgroundColor: '#1D4ED8', boxShadow: 'none' },
              }}
            >
              {recalculateMonthlyAttendanceSummary.isPending ? 'Đang tổng hợp...' : 'Tổng hợp lại dữ liệu'}
            </Button>
          </Stack>
        </Stack>

        {/* Filter Controls */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          sx={{ mt: 2.5 }}
          alignItems="center"
          flexWrap="wrap"
        >
          <TextField
            select
            size="small"
            label="Tháng"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            sx={{ minWidth: 110, ...inputSx }}
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
            label="Năm"
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            sx={{ minWidth: 110, ...inputSx }}
          >
            {[selectedYear - 1, selectedYear, selectedYear + 1].map((y) => (
              <MenuItem key={y} value={y}>
                Năm {y}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            size="small"
            label="Phòng ban"
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            sx={{ minWidth: 180, ...inputSx }}
          >
            <MenuItem value="ALL">Tất cả phòng ban</MenuItem>
            {departments.map((d) => (
              <MenuItem key={d.id} value={String(d.id)}>
                {d.name}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            size="small"
            placeholder="Tìm theo tên hoặc mã NV..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" sx={{ color: '#94A3B8' }} />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 240, ...inputSx }}
          />

          <Box sx={{ ml: 'auto !important' }}>
            <Button
              variant="outlined"
              size="small"
              onClick={() => router.push('/employer/hrm/payroll')}
              sx={{
                textTransform: 'none',
                borderRadius: 2,
                borderColor: '#10B981',
                color: '#059669',
                fontWeight: 600,
                '&:hover': { borderColor: '#059669', backgroundColor: '#ECFDF5' },
              }}
            >
              Xem Bảng lương ➔
            </Button>
          </Box>
        </Stack>
      </Card>

      {/* KPI Cards */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Card elevation={0} sx={{ p: 2, borderRadius: 2.5, border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF' }}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <GroupsOutlinedIcon fontSize="medium" />
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
                  Tổng nhân viên
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#0F172A', lineHeight: 1.2 }}>
                  {kpiStats.count}
                </Typography>
              </Box>
            </Stack>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Card elevation={0} sx={{ p: 2, borderRadius: 2.5, border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF' }}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: '#DCFCE7', color: '#15803D', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <WorkHistoryOutlinedIcon fontSize="medium" />
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
                  Công thực tế
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#15803D', lineHeight: 1.2 }}>
                  {kpiStats.totalActualDays} công
                </Typography>
              </Box>
            </Stack>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Card elevation={0} sx={{ p: 2, borderRadius: 2.5, border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF' }}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: '#DBEAFE', color: '#1D4ED8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircleOutlineIcon fontSize="medium" />
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
                  Nghỉ phép có lương
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#1D4ED8', lineHeight: 1.2 }}>
                  {kpiStats.totalPaidLeave} ngày
                </Typography>
              </Box>
            </Stack>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Card elevation={0} sx={{ p: 2, borderRadius: 2.5, border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF' }}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: '#FEE2E2', color: '#B91C1C', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <EventBusyOutlinedIcon fontSize="medium" />
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
                  Nghỉ không lương
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#B91C1C', lineHeight: 1.2 }}>
                  {kpiStats.totalUnpaidLeave} ngày
                </Typography>
              </Box>
            </Stack>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Card elevation={0} sx={{ p: 2, borderRadius: 2.5, border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF' }}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: '#F3E8FF', color: '#7E22CE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MoreTimeOutlinedIcon fontSize="medium" />
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
                  Tổng làm thêm (OT)
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#7E22CE', lineHeight: 1.2 }}>
                  {kpiStats.totalOTHours} giờ
                </Typography>
              </Box>
            </Stack>
          </Card>
        </Grid>
      </Grid>

      {/* Summaries Table */}
      <Card
        elevation={0}
        sx={{
          borderRadius: 2.5,
          border: '1px solid #E2E8F0',
          overflow: 'hidden',
          backgroundColor: '#FFFFFF',
        }}
      >
        <TableContainer component={Paper} elevation={0}>
          <Table>
            <TableHead sx={{ backgroundColor: '#F8FAFC' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, color: '#475569', py: 1.5 }}>Nhân viên</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Phòng ban</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, color: '#475569' }}>
                  Công chuẩn
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, color: '#475569' }}>
                  Công thực tế
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, color: '#475569' }}>
                  Nghỉ phép
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, color: '#475569' }}>
                  Nghỉ K.Lương
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, color: '#475569' }}>
                  Giờ OT (Thường / CT)
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, color: '#475569' }}>
                  Đi muộn / Về sớm
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, color: '#475569' }}>
                  Trạng thái
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, color: '#475569' }}>
                  Thao tác
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={10} align="center" sx={{ py: 6 }}>
                    <CircularProgress size={32} sx={{ color: '#2563EB' }} />
                  </TableCell>
                </TableRow>
              ) : filteredSummaries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} align="center" sx={{ py: 6, color: '#64748B' }}>
                    Chưa có bảng tổng hợp công cho tháng {selectedMonth}/{selectedYear}. Vui lòng bấm &quot;Tổng hợp lại dữ liệu&quot; ở góc trên.
                  </TableCell>
                </TableRow>
              ) : (
                filteredSummaries.map((item) => (
                  <TableRow key={item.id} hover>
                    <TableCell sx={{ py: 1.5 }}>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Avatar
                          sx={{
                            width: 32,
                            height: 32,
                            fontSize: '0.8125rem',
                            fontWeight: 600,
                            backgroundColor: '#2563EB',
                          }}
                        >
                          {(item.employee_name || 'N')[0]}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#0F172A', lineHeight: 1.2 }}>
                            {item.employee_name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#64748B' }}>
                            {item.employee_code}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>

                    <TableCell sx={{ color: '#475569', fontSize: '0.8125rem' }}>
                      {item.department_name || 'Chưa phân bổ'}
                    </TableCell>

                    <TableCell align="center" sx={{ fontWeight: 600, color: '#0F172A' }}>
                      {item.standard_work_days}
                    </TableCell>

                    <TableCell align="center">
                      <Chip
                        label={`${item.actual_work_days} công`}
                        size="small"
                        sx={{
                          height: 24,
                          fontWeight: 700,
                          backgroundColor: '#DCFCE7',
                          color: '#15803D',
                        }}
                      />
                    </TableCell>

                    <TableCell align="center" sx={{ color: '#1D4ED8', fontWeight: 600 }}>
                      {item.paid_leave_days}
                    </TableCell>

                    <TableCell align="center" sx={{ color: '#B91C1C', fontWeight: 600 }}>
                      {item.unpaid_leave_days}
                    </TableCell>

                    <TableCell align="center" sx={{ fontSize: '0.8125rem' }}>
                      <strong>{item.overtime_hours_weekday || 0}h</strong> / {item.overtime_hours_weekend || 0}h
                    </TableCell>

                    <TableCell align="center" sx={{ color: '#64748B', fontSize: '0.8125rem' }}>
                      +{item.late_occurrences || 0} / -{item.early_occurrences || 0}
                    </TableCell>

                    <TableCell align="center">
                      <Stack spacing={0.5} alignItems="center">
                        <Chip
                          icon={item.is_locked ? <LockOutlinedIcon sx={{ fontSize: '0.875rem !important' }} /> : <LockOpenOutlinedIcon sx={{ fontSize: '0.875rem !important' }} />}
                          label={item.is_locked ? 'Đã khóa' : 'Chưa khóa'}
                          size="small"
                          sx={{
                            height: 22,
                            fontSize: '0.6875rem',
                            fontWeight: 600,
                            backgroundColor: item.is_locked ? '#EFF6FF' : '#FEF3C7',
                            color: item.is_locked ? '#1D4ED8' : '#B45309',
                          }}
                        />
                        {item.pushed_to_payroll_at && (
                          <Chip
                            label="Đã chuyển lương"
                            size="small"
                            sx={{
                              height: 18,
                              fontSize: '0.625rem',
                              backgroundColor: '#ECFDF5',
                              color: '#059669',
                              fontWeight: 600,
                            }}
                          />
                        )}
                      </Stack>
                    </TableCell>

                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        {/* Lock / Unlock Toggle Button */}
                        <Tooltip title={item.is_locked ? 'Mở khóa bảng công' : 'Khóa bảng công'}>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() =>
                              setLockConfirmModal({
                                open: true,
                                summary: item,
                                action: item.is_locked ? 'UNLOCK' : 'LOCK',
                              })
                            }
                            sx={{
                              textTransform: 'none',
                              fontSize: '0.75rem',
                              borderRadius: 1.5,
                              px: 1.25,
                              color: item.is_locked ? '#B45309' : '#1D4ED8',
                              borderColor: item.is_locked ? '#FCD34D' : '#BFDBFE',
                            }}
                          >
                            {item.is_locked ? 'Mở khóa' : 'Khóa công'}
                          </Button>
                        </Tooltip>

                        {/* Push to Payroll Button */}
                        <Tooltip title="Chuyển dữ liệu tính lương trực tiếp vào Bảng lương tháng">
                          <Button
                            size="small"
                            variant="contained"
                            startIcon={<PaymentOutlinedIcon sx={{ fontSize: '1rem !important' }} />}
                            onClick={() => setPushConfirmModal({ open: true, summary: item })}
                            sx={{
                              textTransform: 'none',
                              fontSize: '0.75rem',
                              borderRadius: 1.5,
                              backgroundColor: '#059669',
                              fontWeight: 600,
                              boxShadow: 'none',
                              '&:hover': { backgroundColor: '#047857', boxShadow: 'none' },
                            }}
                          >
                            Chuyển tính lương
                          </Button>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Lock / Unlock Confirmation Modal */}
      <Dialog
        open={lockConfirmModal.open}
        onClose={() => setLockConfirmModal({ ...lockConfirmModal, open: false })}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          {lockConfirmModal.action === 'LOCK' ? 'Khóa bảng chấm công?' : 'Mở khóa bảng chấm công?'}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: '#64748B' }}>
            {lockConfirmModal.action === 'LOCK'
              ? `Khóa bảng công của nhân viên "${lockConfirmModal.summary?.employee_name}" tháng ${selectedMonth}/${selectedYear} sẽ ngăn chặn việc hiệu chỉnh dữ liệu quẹt thẻ.`
              : `Mở khóa bảng công của nhân viên "${lockConfirmModal.summary?.employee_name}" tháng ${selectedMonth}/${selectedYear} để cho phép cập nhật lại dữ liệu chấm công.`}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setLockConfirmModal({ ...lockConfirmModal, open: false })} sx={{ textTransform: 'none', color: '#64748B' }}>
            Hủy
          </Button>
          <Button
            variant="contained"
            onClick={handleConfirmLockToggle}
            disabled={lockMonthlyAttendanceSummary.isPending || unlockMonthlyAttendanceSummary.isPending}
            sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 600 }}
          >
            {lockConfirmModal.action === 'LOCK' ? 'Xác nhận khóa' : 'Xác nhận mở khóa'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Push to Payroll Confirmation Modal */}
      <Dialog
        open={pushConfirmModal.open}
        onClose={() => setPushConfirmModal({ ...pushConfirmModal, open: false })}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: '1.125rem', borderBottom: '1px solid #E2E8F0', pb: 2 }}>
          Chuyển số liệu sang tính lương tháng {selectedMonth}/{selectedYear}
        </DialogTitle>
        <DialogContent sx={{ pt: 2.5 }}>
          <Alert severity="info" sx={{ mb: 2.5, borderRadius: 2 }}>
            Hành động này sẽ khóa bảng chấm công và tự động tính toán lương theo quy chuẩn pháp luật Việt Nam (BHXH, BHYT, BHTN, Giảm trừ gia cảnh và Thuế TNCN lũy tiến) vào phân hệ <strong>Bảng lương (Payroll)</strong>.
          </Alert>

          {pushConfirmModal.summary && (
            <Stack spacing={1.5} sx={{ p: 2, borderRadius: 2, bgcolor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" sx={{ color: '#64748B' }}>
                  Nhân viên:
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  {pushConfirmModal.summary.employee_name} ({pushConfirmModal.summary.employee_code})
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" sx={{ color: '#64748B' }}>
                  Công thực tế + Nghỉ phép có lương:
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#15803D' }}>
                  {Number(pushConfirmModal.summary.actual_work_days) + Number(pushConfirmModal.summary.paid_leave_days)} / {pushConfirmModal.summary.standard_work_days} công
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" sx={{ color: '#64748B' }}>
                  Nghỉ không lương (Trừ lương):
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#B91C1C' }}>
                  {pushConfirmModal.summary.unpaid_leave_days} ngày
                </Typography>
              </Box>
            </Stack>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid #E2E8F0' }}>
          <Button onClick={() => setPushConfirmModal({ ...pushConfirmModal, open: false })} sx={{ textTransform: 'none', color: '#64748B' }}>
            Hủy
          </Button>
          <Button
            variant="contained"
            onClick={handleConfirmPush}
            disabled={pushSummaryToPayroll.isPending}
            sx={{
              textTransform: 'none',
              borderRadius: 2,
              backgroundColor: '#059669',
              px: 3,
              fontWeight: 600,
              boxShadow: 'none',
              '&:hover': { backgroundColor: '#047857', boxShadow: 'none' },
            }}
          >
            {pushSummaryToPayroll.isPending ? 'Đang chuyển...' : 'Xác nhận chuyển tính lương'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
