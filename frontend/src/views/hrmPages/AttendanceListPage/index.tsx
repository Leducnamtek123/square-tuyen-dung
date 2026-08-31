'use client';

import React, { useState } from 'react';
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
} from '@mui/material';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';

import {
  useHrmTimesheet,
  useHrmDepartments,
  useHrmEmployees,
  useHrmMutations,
} from '../hooks/useHrmQueries';
import { TabTitle } from '@/utils/generalFunction';
import pc from '@/utils/muiColors';

const inputSx = {
  '& .MuiOutlinedInput-root': {
    minHeight: 40,
    borderRadius: 2,
    backgroundColor: 'background.paper',
    transition: 'background-color 0.2s ease, border-color 0.2s ease',
    '& fieldset': { borderColor: pc.divider(0.95) },
    '&:hover': { backgroundColor: pc.bgDefault(0.45) },
    '&:hover fieldset': { borderColor: pc.primary(0.35) },
    '&.Mui-focused fieldset': {
      borderColor: 'primary.main',
      borderWidth: 1,
    },
  },
  '& .MuiInputBase-input': {
    fontSize: '0.875rem',
    py: '8px',
  },
};

const renderStatusBadge = (record: any) => {
  if (!record) return <Typography variant="caption" color="text.disabled">-</Typography>;
  const status = record.status;
  const workingHours = record.workingHours || record.working_hours || 8;
  const checkIn = record.checkIn || record.check_in || '08:30';
  const checkOut = record.checkOut || record.check_out || '17:30';

  if (status === 'PRESENT') {
    return (
      <Tooltip title={`Có mặt | ${workingHours}h (${checkIn} - ${checkOut})`}>
        <Chip size="small" label="P" sx={{ bgcolor: '#dcfce7', color: '#15803d', fontWeight: 700, minWidth: 28, height: 24, fontSize: '0.75rem' }} />
      </Tooltip>
    );
  }
  if (status === 'LATE') {
    return (
      <Tooltip title={`Đi muộn | Vào lúc ${record.checkIn || record.check_in || '09:15'}`}>
        <Chip size="small" label="L" sx={{ bgcolor: '#fef3c7', color: '#b45309', fontWeight: 700, minWidth: 28, height: 24, fontSize: '0.75rem' }} />
      </Tooltip>
    );
  }
  if (status === 'EARLY_LEAVE') {
    return (
      <Tooltip title={`Về sớm | Ra lúc ${record.checkOut || record.check_out || '16:00'}`}>
        <Chip size="small" label="EL" sx={{ bgcolor: '#ffedd5', color: '#c2410c', fontWeight: 700, minWidth: 28, height: 24, fontSize: '0.7rem' }} />
      </Tooltip>
    );
  }
  if (status === 'ON_LEAVE') {
    return (
      <Tooltip title="Nghỉ phép có lý do">
        <Chip size="small" label="OL" sx={{ bgcolor: '#dbeafe', color: '#1d4ed8', fontWeight: 700, minWidth: 28, height: 24, fontSize: '0.7rem' }} />
      </Tooltip>
    );
  }
  if (status === 'ABSENT') {
    return (
      <Tooltip title="Vắng mặt / Không phép">
        <Chip size="small" label="A" sx={{ bgcolor: '#fee2e2', color: '#b91c1c', fontWeight: 700, minWidth: 28, height: 24, fontSize: '0.75rem' }} />
      </Tooltip>
    );
  }
  if (status === 'WEEKEND') {
    return (
      <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 500 }}>
        CT
      </Typography>
    );
  }
  return <Typography variant="caption" color="text.disabled">-</Typography>;
};

export default function AttendanceListPage() {
  TabTitle('Bảng Chấm Công Tháng & Lưới Ngày Công | InfoHR HRM');

  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState<number>(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(currentDate.getFullYear());
  const [selectedDept, setSelectedDept] = useState<number | 'ALL'>('ALL');

  const queryParams = {
    month: selectedMonth,
    year: selectedYear,
    ...(selectedDept !== 'ALL' ? { department: selectedDept } : {}),
  };

  const { data: timesheetData, isLoading: timesheetLoading, refetch } = useHrmTimesheet(queryParams);
  const { data: departments = [] } = useHrmDepartments();
  const { data: employees = [] } = useHrmEmployees();
  const { quickCheckin } = useHrmMutations();

  const [openCheckinModal, setOpenCheckinModal] = useState(false);
  const [checkinForm, setCheckinForm] = useState<{
    employee_id: number | null;
    date: string;
    status: string;
    check_in: string;
    check_out: string;
    working_hours: number;
    notes: string;
  }>({
    employee_id: employees[0]?.id ?? null,
    date: new Date().toISOString().split('T')[0],
    status: 'PRESENT',
    check_in: '08:30:00',
    check_out: '17:30:00',
    working_hours: 8.0,
    notes: '',
  });

  const handleRunCheckin = () => {
    if (!checkinForm.employee_id) return;
    quickCheckin.mutate({ ...checkinForm, employee_id: checkinForm.employee_id }, {
      onSuccess: () => {
        setOpenCheckinModal(false);
        refetch();
      },
    });
  };

  return (
    <Box sx={{ width: '100%', pb: 6 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={700} color="text.primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <EventAvailableOutlinedIcon color="primary" /> Bảng Chấm Công & Quản Lý Lưới Ngày Công
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Theo dõi chi tiết thời gian làm việc, đi muộn, về sớm và ngày nghỉ phép theo từng ngày trong tháng
          </Typography>
        </Box>
        <Stack direction="row" spacing={1.5}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AccessTimeOutlinedIcon />}
            onClick={() => {
              if (employees.length > 0) {
                setCheckinForm((prev) => ({ ...prev, employee_id: employees[0].id }));
              }
              setOpenCheckinModal(true);
            }}
            sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2 }}
          >
            Chấm Công Nhanh
          </Button>
        </Stack>
      </Box>

      {/* Legend & Filter Bar */}
      <Card sx={{ p: 2, mb: 3, borderRadius: 3, border: '1px solid', borderColor: pc.divider(0.9) }}>
        <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" sx={{ mb: 2 }}>
          <TextField
            select
            label="Tháng"
            size="small"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            sx={{ minWidth: 120, ...inputSx }}
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <MenuItem key={m} value={m}>
                Tháng {m}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Năm"
            size="small"
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            sx={{ minWidth: 120, ...inputSx }}
          >
            {[2024, 2025, 2026, 2027].map((y) => (
              <MenuItem key={y} value={y}>
                Năm {y}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Phòng ban"
            size="small"
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
            sx={{ minWidth: 180, ...inputSx }}
          >
            <MenuItem value="ALL">Tất cả phòng ban</MenuItem>
            {departments.map((d) => (
              <MenuItem key={d.id} value={d.id}>
                {d.name}
              </MenuItem>
            ))}
          </TextField>

          <Box sx={{ flexGrow: 1 }} />
          <Typography variant="body2" color="text.secondary">
            Tổng số nhân viên: <b>{timesheetData?.employees?.length || 0}</b>
          </Typography>
        </Stack>

        {/* Legend */}
        <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" sx={{ pt: 1, borderTop: '1px dashed', borderColor: pc.divider(0.8) }}>
          <Typography variant="caption" fontWeight={700} color="text.secondary">
            Chú thích ký hiệu:
          </Typography>
          <Stack direction="row" spacing={0.75} alignItems="center">
            <Chip size="small" label="P" sx={{ bgcolor: '#dcfce7', color: '#15803d', fontWeight: 700, height: 20, fontSize: '0.7rem' }} />
            <Typography variant="caption">Có mặt (Present)</Typography>
          </Stack>
          <Stack direction="row" spacing={0.75} alignItems="center">
            <Chip size="small" label="L" sx={{ bgcolor: '#fef3c7', color: '#b45309', fontWeight: 700, height: 20, fontSize: '0.7rem' }} />
            <Typography variant="caption">Đi muộn (Late)</Typography>
          </Stack>
          <Stack direction="row" spacing={0.75} alignItems="center">
            <Chip size="small" label="EL" sx={{ bgcolor: '#ffedd5', color: '#c2410c', fontWeight: 700, height: 20, fontSize: '0.7rem' }} />
            <Typography variant="caption">Về sớm (Early Leave)</Typography>
          </Stack>
          <Stack direction="row" spacing={0.75} alignItems="center">
            <Chip size="small" label="OL" sx={{ bgcolor: '#dbeafe', color: '#1d4ed8', fontWeight: 700, height: 20, fontSize: '0.7rem' }} />
            <Typography variant="caption">Nghỉ phép (On Leave)</Typography>
          </Stack>
          <Stack direction="row" spacing={0.75} alignItems="center">
            <Chip size="small" label="A" sx={{ bgcolor: '#fee2e2', color: '#b91c1c', fontWeight: 700, height: 20, fontSize: '0.7rem' }} />
            <Typography variant="caption">Vắng mặt (Absent)</Typography>
          </Stack>
        </Stack>
      </Card>

      {/* Timesheet Matrix Table */}
      <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: pc.divider(0.9), overflow: 'hidden' }}>
        <TableContainer component={Paper} elevation={0} sx={{ maxHeight: 600 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, minWidth: 100, bgcolor: 'background.paper', position: 'sticky', left: 0, zIndex: 3 }}>
                  Mã NV
                </TableCell>
                <TableCell sx={{ fontWeight: 700, minWidth: 160, bgcolor: 'background.paper', position: 'sticky', left: 100, zIndex: 3 }}>
                  Họ và tên
                </TableCell>
                <TableCell sx={{ fontWeight: 700, minWidth: 140, bgcolor: 'background.paper' }}>
                  Phòng ban
                </TableCell>

                {/* Days 1..N Header */}
                {timesheetData?.days?.map((d) => (
                  <TableCell
                    key={d.day}
                    align="center"
                    sx={{
                      fontWeight: 700,
                      minWidth: 36,
                      p: 0.5,
                      bgcolor: d.is_weekend ? '#f8fafc' : 'background.paper',
                      color: d.is_weekend ? 'text.disabled' : 'text.primary',
                    }}
                  >
                    <Typography variant="caption" display="block" fontWeight={700}>
                      {d.day}
                    </Typography>
                    <Typography variant="caption" sx={{ fontSize: '0.65rem', color: 'text.secondary' }}>
                      {d.dayOfWeek || d.day_of_week}
                    </Typography>
                  </TableCell>
                ))}

                {/* Summary Columns */}
                <TableCell align="center" sx={{ fontWeight: 700, minWidth: 70, bgcolor: '#f0fdf4', color: '#166534' }}>
                  Công TT
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, minWidth: 60, bgcolor: '#fffbeb', color: '#b45309' }}>
                  Muộn
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, minWidth: 60, bgcolor: '#eff6ff', color: '#1d4ed8' }}>
                  Phép
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, minWidth: 70, bgcolor: '#faf5ff', color: '#7e22ce' }}>
                  Tổng giờ
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {timesheetLoading ? (
                <TableRow>
                  <TableCell colSpan={36} align="center" sx={{ py: 6 }}>
                    <CircularProgress size={32} />
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Đang tải dữ liệu chấm công...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : timesheetData?.employees?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={36} align="center" sx={{ py: 6 }}>
                    <Typography variant="body2" color="text.secondary">
                      Chưa có dữ liệu nhân sự cho tháng này.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                timesheetData?.employees?.map((emp) => (
                  <TableRow key={emp.employeeId || emp.employee_id} hover>
                    <TableCell sx={{ fontWeight: 600, color: 'primary.main', position: 'sticky', left: 0, bgcolor: 'background.paper', zIndex: 1 }}>
                      {emp.employeeCode || emp.employee_code}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, position: 'sticky', left: 100, bgcolor: 'background.paper', zIndex: 1 }}>
                      {emp.fullName || emp.full_name}
                    </TableCell>
                    <TableCell sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>
                      {emp.departmentName || emp.department_name || '-'}
                    </TableCell>

                    {/* Day Cells */}
                    {timesheetData?.days?.map((d) => {
                      const record = emp.records[d.day];
                      return (
                        <TableCell
                          key={d.day}
                          align="center"
                          sx={{
                            p: 0.25,
                            bgcolor: (d.isWeekend ?? d.is_weekend) ? '#f8fafc' : 'inherit',
                          }}
                        >
                          {renderStatusBadge(record)}
                        </TableCell>
                      );
                    })}

                    {/* Summary Data */}
                    <TableCell align="center" sx={{ fontWeight: 700, bgcolor: '#f0fdf4', color: '#15803d' }}>
                      {emp.stats?.totalPresent ?? emp.stats?.total_present ?? 0}
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, bgcolor: '#fffbeb', color: '#b45309' }}>
                      {emp.stats?.totalLate ?? emp.stats?.total_late ?? 0}
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, bgcolor: '#eff6ff', color: '#1d4ed8' }}>
                      {emp.stats?.totalLeave ?? emp.stats?.total_leave ?? 0}
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, bgcolor: '#faf5ff', color: '#7e22ce' }}>
                      {emp.stats?.totalHours ?? emp.stats?.total_hours ?? 0}h
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Quick Check-in Modal */}
      <Dialog open={openCheckinModal} onClose={() => setOpenCheckinModal(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          <AccessTimeOutlinedIcon color="primary" sx={{ verticalAlign: 'middle', mr: 1 }} />
          Chấm Công Nhanh
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              select
              label="Nhân viên"
              fullWidth
              size="small"
              value={checkinForm.employee_id ?? ''}
              onChange={(e) => setCheckinForm({ ...checkinForm, employee_id: e.target.value ? Number(e.target.value) : null })}
              sx={inputSx}
            >
              {employees.map((emp) => (
                <MenuItem key={emp.id} value={emp.id}>
                  {emp.fullName || emp.full_name} ({emp.employeeCode || emp.employee_code})
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Ngày chấm công"
              type="date"
              fullWidth
              size="small"
              value={checkinForm.date}
              onChange={(e) => setCheckinForm({ ...checkinForm, date: e.target.value })}
              InputLabelProps={{ shrink: true }}
              sx={inputSx}
            />

            <TextField
              select
              label="Trạng thái"
              fullWidth
              size="small"
              value={checkinForm.status}
              onChange={(e) => setCheckinForm({ ...checkinForm, status: e.target.value })}
              sx={inputSx}
            >
              <MenuItem value="PRESENT">Có mặt (Present)</MenuItem>
              <MenuItem value="LATE">Đi muộn (Late)</MenuItem>
              <MenuItem value="EARLY_LEAVE">Về sớm (Early Leave)</MenuItem>
              <MenuItem value="ABSENT">Vắng mặt (Absent)</MenuItem>
              <MenuItem value="ON_LEAVE">Nghỉ phép (On Leave)</MenuItem>
            </TextField>

            <Stack direction="row" spacing={2}>
              <TextField
                label="Giờ vào"
                type="time"
                fullWidth
                size="small"
                value={checkinForm.check_in}
                onChange={(e) => setCheckinForm({ ...checkinForm, check_in: e.target.value })}
                InputLabelProps={{ shrink: true }}
                sx={inputSx}
              />
              <TextField
                label="Giờ ra"
                type="time"
                fullWidth
                size="small"
                value={checkinForm.check_out}
                onChange={(e) => setCheckinForm({ ...checkinForm, check_out: e.target.value })}
                InputLabelProps={{ shrink: true }}
                sx={inputSx}
              />
            </Stack>

            <TextField
              label="Số giờ làm việc"
              type="number"
              fullWidth
              size="small"
              value={checkinForm.working_hours}
              onChange={(e) => setCheckinForm({ ...checkinForm, working_hours: Number(e.target.value) })}
              sx={inputSx}
            />

            <TextField
              label="Ghi chú"
              fullWidth
              size="small"
              value={checkinForm.notes}
              onChange={(e) => setCheckinForm({ ...checkinForm, notes: e.target.value })}
              sx={inputSx}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenCheckinModal(false)} sx={{ textTransform: 'none' }}>
            Hủy
          </Button>
          <Button
            variant="contained"
            onClick={handleRunCheckin}
            disabled={quickCheckin.isPending}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            {quickCheckin.isPending ? 'Đang lưu...' : 'Lưu chấm công'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
