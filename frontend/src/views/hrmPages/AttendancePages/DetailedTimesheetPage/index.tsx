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
  Avatar,
  InputAdornment,
} from '@mui/material';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import FingerprintIcon from '@mui/icons-material/Fingerprint';

import {
  useHrmTimesheet,
  useHrmDepartments,
  useHrmEmployees,
  useHrmMutations,
} from '../../hooks/useHrmQueries';
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
  if (!record) return <Typography variant="caption" sx={{ color: '#CBD5E1' }}>-</Typography>;
  const status = record.status;
  const workingHours = record.workingHours ?? record.working_hours ?? 8;
  const checkIn = record.checkIn ?? record.check_in ?? '08:00';
  const checkOut = record.checkOut ?? record.check_out ?? '17:30';
  const isAdjusted = record.is_manually_adjusted;

  if (status === 'PRESENT') {
    return (
      <Tooltip title={`Có mặt | ${workingHours}h (${checkIn?.slice(0, 5)} - ${checkOut?.slice(0, 5)})${isAdjusted ? ' [Đã điều chỉnh]' : ''}`}>
        <Chip
          size="small"
          label={isAdjusted ? 'X*' : 'X'}
          sx={{
            bgcolor: '#DCFCE7',
            color: '#15803D',
            fontWeight: 700,
            minWidth: 28,
            height: 22,
            fontSize: '0.75rem',
            borderRadius: 1,
          }}
        />
      </Tooltip>
    );
  }
  if (status === 'LATE') {
    return (
      <Tooltip title={`Đi muộn | Vào lúc ${checkIn?.slice(0, 5)} (+${record.late_minutes || 0}p)`}>
        <Chip
          size="small"
          label="M"
          sx={{
            bgcolor: '#FEF3C7',
            color: '#B45309',
            fontWeight: 700,
            minWidth: 28,
            height: 22,
            fontSize: '0.75rem',
            borderRadius: 1,
          }}
        />
      </Tooltip>
    );
  }
  if (status === 'EARLY_LEAVE') {
    return (
      <Tooltip title={`Về sớm | Ra lúc ${checkOut?.slice(0, 5)} (-${record.early_minutes || 0}p)`}>
        <Chip
          size="small"
          label="S"
          sx={{
            bgcolor: '#FFEDD5',
            color: '#C2410C',
            fontWeight: 700,
            minWidth: 28,
            height: 22,
            fontSize: '0.75rem',
            borderRadius: 1,
          }}
        />
      </Tooltip>
    );
  }
  if (status === 'ON_LEAVE') {
    return (
      <Tooltip title={`Nghỉ phép: ${record.notes || 'Có phép'}`}>
        <Chip
          size="small"
          label="P"
          sx={{
            bgcolor: '#DBEAFE',
            color: '#1D4ED8',
            fontWeight: 700,
            minWidth: 28,
            height: 22,
            fontSize: '0.75rem',
            borderRadius: 1,
          }}
        />
      </Tooltip>
    );
  }
  if (status === 'ABSENT') {
    return (
      <Tooltip title="Vắng mặt / Không phép">
        <Chip
          size="small"
          label="V"
          sx={{
            bgcolor: '#FEE2E2',
            color: '#B91C1C',
            fontWeight: 700,
            minWidth: 28,
            height: 22,
            fontSize: '0.75rem',
            borderRadius: 1,
          }}
        />
      </Tooltip>
    );
  }
  return <Chip size="small" label={status} sx={{ height: 22, fontSize: '0.7rem' }} />;
};

export default function DetailedTimesheetPage() {
  TabTitle('Bảng chấm công chi tiết | InfoHR HRM');

  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [selectedDepartment, setSelectedDepartment] = useState<number | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');

  const { data: timesheetData, isLoading, refetch } = useHrmTimesheet({
    month: selectedMonth,
    year: selectedYear,
    department: selectedDepartment,
  });

  const { data: departments = [] } = useHrmDepartments();
  const { data: employees = [] } = useHrmEmployees();
  const { quickCheckin } = useHrmMutations();

  // Cell Detail Dialog
  const [cellDetail, setCellDetail] = useState<{
    open: boolean;
    employeeName: string;
    employeeId?: number;
    dayNumber: number;
    record: any;
  }>({
    open: false,
    employeeName: '',
    dayNumber: 1,
    record: null,
  });

  // Quick Checkin Modal
  const [openCheckinModal, setOpenCheckinModal] = useState(false);
  const [checkinForm, setCheckinForm] = useState({
    employee_id: '',
    date: new Date().toISOString().split('T')[0],
    status: 'PRESENT',
    check_in: '08:00',
    check_out: '17:30',
    working_hours: 8,
    notes: '',
  });

  const handleOpenCheckin = () => {
    setCheckinForm({
      employee_id: employees[0]?.id ? String(employees[0].id) : '',
      date: new Date().toISOString().split('T')[0],
      status: 'PRESENT',
      check_in: '08:00',
      check_out: '17:30',
      working_hours: 8,
      notes: '',
    });
    setOpenCheckinModal(true);
  };

  const handleSubmitCheckin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkinForm.employee_id) return;
    await quickCheckin.mutateAsync({
      employee_id: Number(checkinForm.employee_id),
      date: checkinForm.date,
      status: checkinForm.status,
      check_in: checkinForm.check_in,
      check_out: checkinForm.check_out,
      working_hours: Number(checkinForm.working_hours),
      notes: checkinForm.notes,
    });
    setOpenCheckinModal(false);
  };

  const handleCellClick = (emp: any, dayNum: number) => {
    const rec = emp.records?.[dayNum];
    setCellDetail({
      open: true,
      employeeName: emp.fullName || emp.full_name || '',
      employeeId: emp.employeeId || emp.employee_id,
      dayNumber: dayNum,
      record: rec,
    });
  };

  const employeesList = timesheetData?.employees || [];
  const filteredEmployees = employeesList.filter((emp) => {
    const name = (emp.fullName || emp.full_name || '').toLowerCase();
    const code = (emp.employeeCode || emp.employee_code || '').toLowerCase();
    const term = searchTerm.toLowerCase();
    return name.includes(term) || code.includes(term);
  });

  const daysList = timesheetData?.days || [];

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
              Bảng chấm công chi tiết (1 - {timesheetData?.total_days || timesheetData?.totalDays || 31})
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748B' }}>
              Theo dõi chi tiết quẹt thẻ, giờ vào/ra và trạng thái công từng ngày của nhân viên
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
              startIcon={<FingerprintIcon />}
              onClick={handleOpenCheckin}
              sx={{
                textTransform: 'none',
                borderRadius: 2,
                backgroundColor: '#2563EB',
                fontWeight: 600,
                boxShadow: 'none',
                '&:hover': { backgroundColor: '#1D4ED8', boxShadow: 'none' },
              }}
            >
              Điểm danh nhanh
            </Button>
          </Stack>
        </Stack>

        {/* Filter Row */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 2.5 }} alignItems="center" flexWrap="wrap">
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
            value={selectedDepartment || ''}
            onChange={(e) => setSelectedDepartment(e.target.value ? Number(e.target.value) : undefined)}
            sx={{ minWidth: 180, ...inputSx }}
          >
            <MenuItem value="">Tất cả phòng ban</MenuItem>
            {departments.map((d) => (
              <MenuItem key={d.id} value={d.id}>
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

          {/* Ký hiệu công legend */}
          <Stack direction="row" spacing={0.75} alignItems="center" sx={{ ml: 'auto !important' }} flexWrap="wrap">
            <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, mr: 0.5 }}>
              Ký hiệu:
            </Typography>
            <Chip size="small" label="X: Đủ công" sx={{ height: 20, fontSize: '0.6875rem', bgcolor: '#DCFCE7', color: '#15803D', fontWeight: 700 }} />
            <Chip size="small" label="X*: Đã chỉnh" sx={{ height: 20, fontSize: '0.6875rem', bgcolor: '#DCFCE7', color: '#15803D', fontWeight: 700, border: '1px dashed #15803D' }} />
            <Chip size="small" label="M: Đi muộn" sx={{ height: 20, fontSize: '0.6875rem', bgcolor: '#FEF3C7', color: '#B45309', fontWeight: 700 }} />
            <Chip size="small" label="S: Về sớm" sx={{ height: 20, fontSize: '0.6875rem', bgcolor: '#FFEDD5', color: '#C2410C', fontWeight: 700 }} />
            <Chip size="small" label="P: Nghỉ phép" sx={{ height: 20, fontSize: '0.6875rem', bgcolor: '#DBEAFE', color: '#1D4ED8', fontWeight: 700 }} />
            <Chip size="small" label="KP: Không phép" sx={{ height: 20, fontSize: '0.6875rem', bgcolor: '#FEE2E2', color: '#B91C1C', fontWeight: 700 }} />
            <Chip size="small" label="V: Vắng mặt" sx={{ height: 20, fontSize: '0.6875rem', bgcolor: '#F1F5F9', color: '#475569', fontWeight: 700 }} />
          </Stack>
        </Stack>
      </Card>

      {/* Detailed Timesheet Matrix Table */}
      <Card
        elevation={0}
        sx={{
          borderRadius: 2.5,
          border: '1px solid #E2E8F0',
          overflow: 'hidden',
          backgroundColor: '#FFFFFF',
        }}
      >
        <TableContainer component={Paper} elevation={0} sx={{ maxHeight: 'calc(100vh - 360px)' }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{
                    fontWeight: 700,
                    minWidth: 180,
                    position: 'sticky',
                    left: 0,
                    zIndex: 15,
                    backgroundColor: '#F8FAFC',
                    borderRight: '1px solid #E2E8F0',
                  }}
                >
                  Nhân viên ({filteredEmployees.length})
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 700,
                    minWidth: 120,
                    position: 'sticky',
                    left: 180,
                    zIndex: 15,
                    backgroundColor: '#F8FAFC',
                    borderRight: '2px solid #CBD5E1',
                  }}
                >
                  Phòng ban
                </TableCell>

                {/* Day Columns */}
                {daysList.map((d: any) => {
                  const isWeekend = d.isWeekend ?? (d.dayOfWeek === 'T7' || d.dayOfWeek === 'CN');
                  return (
                    <TableCell
                      key={d.day}
                      align="center"
                      sx={{
                        minWidth: 42,
                        maxWidth: 42,
                        p: 0.5,
                        backgroundColor: isWeekend ? '#FFFBEB' : '#F8FAFC',
                        color: isWeekend ? '#D97706' : '#334155',
                        borderRight: '1px solid #F1F5F9',
                      }}
                    >
                      <Box sx={{ fontSize: '0.75rem', fontWeight: 700 }}>{d.day}</Box>
                      <Box sx={{ fontSize: '0.6875rem' }}>{d.dayOfWeek}</Box>
                    </TableCell>
                  );
                })}

                {/* Summary Stats Columns */}
                <TableCell align="center" sx={{ fontWeight: 700, minWidth: 70, backgroundColor: '#F8FAFC' }}>
                  Đi làm
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, minWidth: 65, backgroundColor: '#F8FAFC' }}>
                  Đi muộn
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, minWidth: 65, backgroundColor: '#F8FAFC' }}>
                  Nghỉ
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, minWidth: 75, backgroundColor: '#F8FAFC' }}>
                  Tổng giờ
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={daysList.length + 6} align="center" sx={{ py: 8 }}>
                    <CircularProgress size={36} sx={{ color: '#2563EB' }} />
                  </TableCell>
                </TableRow>
              ) : filteredEmployees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={daysList.length + 6} align="center" sx={{ py: 8, color: '#64748B' }}>
                    Không có dữ liệu chấm công cho tháng {selectedMonth}/{selectedYear}.
                  </TableCell>
                </TableRow>
              ) : (
                filteredEmployees.map((emp) => (
                  <TableRow key={emp.employeeId || emp.employee_id} hover>
                    {/* Sticky Employee */}
                    <TableCell
                      sx={{
                        position: 'sticky',
                        left: 0,
                        zIndex: 5,
                        backgroundColor: '#FFFFFF',
                        borderRight: '1px solid #E2E8F0',
                        py: 1,
                      }}
                    >
                      <Stack direction="row" spacing={1.25} alignItems="center">
                        <Avatar
                          sx={{
                            width: 28,
                            height: 28,
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            backgroundColor: '#2563EB',
                          }}
                        >
                          {(emp.fullName || emp.full_name || 'N')[0]}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#0F172A', lineHeight: 1.2 }}>
                            {emp.fullName || emp.full_name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#64748B' }}>
                            {emp.employeeCode || emp.employee_code}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>

                    {/* Sticky Department */}
                    <TableCell
                      sx={{
                        position: 'sticky',
                        left: 180,
                        zIndex: 5,
                        backgroundColor: '#FFFFFF',
                        borderRight: '2px solid #CBD5E1',
                        fontSize: '0.8125rem',
                        color: '#475569',
                      }}
                    >
                      {emp.departmentName || emp.department_name || 'Chưa phân bổ'}
                    </TableCell>

                    {/* Days */}
                    {daysList.map((d: any) => {
                      const rec = emp.records?.[d.day];
                      const isWeekend = d.isWeekend ?? (d.dayOfWeek === 'T7' || d.dayOfWeek === 'CN');

                      return (
                        <TableCell
                          key={d.day}
                          align="center"
                          onClick={() => handleCellClick(emp, d.day)}
                          sx={{
                            p: 0.25,
                            cursor: 'pointer',
                            backgroundColor: isWeekend ? '#FFFDF5' : '#FFFFFF',
                            borderRight: '1px solid #F1F5F9',
                            '&:hover': { backgroundColor: '#EFF6FF' },
                          }}
                        >
                          {renderStatusBadge(rec)}
                        </TableCell>
                      );
                    })}

                    {/* Stats */}
                    <TableCell align="center" sx={{ fontWeight: 600, color: '#15803D' }}>
                      {emp.stats?.totalPresent ?? emp.stats?.total_present ?? 0}
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600, color: '#B45309' }}>
                      {emp.stats?.totalLate ?? emp.stats?.total_late ?? 0}
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600, color: '#1D4ED8' }}>
                      {emp.stats?.totalLeave ?? emp.stats?.total_leave ?? 0}
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, color: '#0F172A' }}>
                      {emp.stats?.totalHours ?? emp.stats?.total_hours ?? 0}h
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Cell Detail Dialog */}
      <Dialog
        open={cellDetail.open}
        onClose={() => setCellDetail({ ...cellDetail, open: false })}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 700, borderBottom: '1px solid #E2E8F0', pb: 1.5 }}>
          Chi tiết chấm công ngày {cellDetail.dayNumber}/{selectedMonth}/{selectedYear}
        </DialogTitle>
        <DialogContent sx={{ pt: 2.5 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, color: '#0F172A', mb: 1.5 }}>
            Nhân viên: {cellDetail.employeeName}
          </Typography>

          {cellDetail.record ? (
            <Stack spacing={1.5}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" sx={{ color: '#64748B' }}>
                  Trạng thái:
                </Typography>
                {renderStatusBadge(cellDetail.record)}
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" sx={{ color: '#64748B' }}>
                  Giờ vào:
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {cellDetail.record.checkIn || cellDetail.record.check_in || '-'}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" sx={{ color: '#64748B' }}>
                  Giờ ra:
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {cellDetail.record.checkOut || cellDetail.record.check_out || '-'}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" sx={{ color: '#64748B' }}>
                  Số giờ làm việc:
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {cellDetail.record.workingHours || cellDetail.record.working_hours || 0} giờ
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" sx={{ color: '#64748B' }}>
                  Đi muộn / Về sớm:
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#B45309' }}>
                  +{cellDetail.record.late_minutes || 0}p / -{cellDetail.record.early_minutes || 0}p
                </Typography>
              </Box>
              {cellDetail.record.is_manually_adjusted && (
                <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: '#FEF3C7', color: '#92400E', fontSize: '0.8125rem' }}>
                  <strong>Hiệu chỉnh thủ công:</strong> {cellDetail.record.adjustment_reason || 'Đã chỉnh sửa'}
                </Box>
              )}
            </Stack>
          ) : (
            <Typography variant="body2" sx={{ color: '#64748B' }}>
              Chưa có dữ liệu chấm công hoặc ngày nghỉ trong ngày này.
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid #E2E8F0' }}>
          <Button onClick={() => setCellDetail({ ...cellDetail, open: false })} sx={{ textTransform: 'none' }}>
            Đóng
          </Button>
        </DialogActions>
      </Dialog>

      {/* Quick Checkin Modal */}
      <Dialog
        open={openCheckinModal}
        onClose={() => setOpenCheckinModal(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <form onSubmit={handleSubmitCheckin}>
          <DialogTitle sx={{ fontWeight: 700, borderBottom: '1px solid #E2E8F0', pb: 2 }}>
            Điểm danh & Chấm công nhanh
          </DialogTitle>
          <DialogContent sx={{ pt: 2.5 }}>
            <Stack spacing={2}>
              <TextField
                select
                fullWidth
                label="Nhân viên"
                required
                value={checkinForm.employee_id}
                onChange={(e) => setCheckinForm({ ...checkinForm, employee_id: e.target.value })}
                sx={inputSx}
              >
                {employees.map((emp) => (
                  <MenuItem key={emp.id} value={String(emp.id)}>
                    {emp.first_name} {emp.last_name} ({emp.employee_code || 'NV'})
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                type="date"
                fullWidth
                label="Ngày chấm công"
                required
                value={checkinForm.date}
                onChange={(e) => setCheckinForm({ ...checkinForm, date: e.target.value })}
                sx={inputSx}
              />

              <TextField
                select
                fullWidth
                label="Trạng thái"
                value={checkinForm.status}
                onChange={(e) => setCheckinForm({ ...checkinForm, status: e.target.value })}
                sx={inputSx}
              >
                <MenuItem value="PRESENT">Đủ công</MenuItem>
                <MenuItem value="LATE">Đi muộn</MenuItem>
                <MenuItem value="EARLY_LEAVE">Về sớm</MenuItem>
                <MenuItem value="ON_LEAVE">Nghỉ phép</MenuItem>
                <MenuItem value="ABSENT">Vắng mặt không phép</MenuItem>
              </TextField>

              <Stack direction="row" spacing={2}>
                <TextField
                  type="time"
                  fullWidth
                  label="Giờ vào"
                  value={checkinForm.check_in}
                  onChange={(e) => setCheckinForm({ ...checkinForm, check_in: e.target.value })}
                  sx={inputSx}
                />
                <TextField
                  type="time"
                  fullWidth
                  label="Giờ ra"
                  value={checkinForm.check_out}
                  onChange={(e) => setCheckinForm({ ...checkinForm, check_out: e.target.value })}
                  sx={inputSx}
                />
              </Stack>

              <TextField
                fullWidth
                label="Ghi chú điều chỉnh"
                placeholder="VD: Chấm công bù, xác nhận qua máy vân tay..."
                value={checkinForm.notes}
                onChange={(e) => setCheckinForm({ ...checkinForm, notes: e.target.value })}
                sx={inputSx}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid #E2E8F0' }}>
            <Button onClick={() => setOpenCheckinModal(false)} sx={{ textTransform: 'none', color: '#64748B' }}>
              Hủy
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={quickCheckin.isPending}
              sx={{
                textTransform: 'none',
                borderRadius: 2,
                backgroundColor: '#2563EB',
                px: 3,
                fontWeight: 600,
                boxShadow: 'none',
                '&:hover': { backgroundColor: '#1D4ED8', boxShadow: 'none' },
              }}
            >
              Lưu điểm danh
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
