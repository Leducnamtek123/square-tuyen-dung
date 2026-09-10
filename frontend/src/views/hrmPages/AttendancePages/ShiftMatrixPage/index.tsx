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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Stack,
  Avatar,
  IconButton,
  Tooltip,
  MenuItem,
  Checkbox,
  FormControlLabel,
  FormGroup,
  InputAdornment,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import AddTaskIcon from '@mui/icons-material/AddTask';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

import {
  useHrmEmployees,
  useHrmDepartments,
  useHrmWorkShifts,
  useHrmShiftAssignments,
  useHrmMutations,
} from '../../hooks/useHrmQueries';
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

const DAYS_OF_WEEK = [
  { label: 'Thứ 2', value: 0 },
  { label: 'Thứ 3', value: 1 },
  { label: 'Thứ 4', value: 2 },
  { label: 'Thứ 5', value: 3 },
  { label: 'Thứ 6', value: 4 },
  { label: 'Thứ 7', value: 5 },
  { label: 'Chủ nhật', value: 6 },
];

export default function ShiftMatrixPage() {
  TabTitle('Bảng phân ca tổng hợp | InfoHR HRM');

  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState<number>(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(currentDate.getFullYear());
  const [selectedDepartment, setSelectedDepartment] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Queries
  const { data: employees = [], isLoading: empLoading } = useHrmEmployees();
  const { data: departments = [] } = useHrmDepartments();
  const { data: shifts = [] } = useHrmWorkShifts();

  const daysInMonth = useMemo(() => {
    return new Date(selectedYear, selectedMonth, 0).getDate();
  }, [selectedYear, selectedMonth]);

  const startDateStr = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-01`;
  const endDateStr = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`;

  const {
    data: assignments = [],
    isLoading: assignLoading,
    refetch,
  } = useHrmShiftAssignments({
    month: selectedMonth,
    year: selectedYear,
    start_date: startDateStr,
    end_date: endDateStr,
  });

  const { batchAssignShifts, deleteShiftAssignment } = useHrmMutations();

  // Batch Assign Modal
  const [openBatchModal, setOpenBatchModal] = useState(false);
  const [batchForm, setBatchForm] = useState({
    shift_id: '',
    start_date: startDateStr,
    end_date: endDateStr,
    is_off_day: false,
    selectedDays: [0, 1, 2, 3, 4], // T2 - T6
    employee_ids: [] as number[],
    note: '',
  });

  // Single cell assignment quick edit
  const [cellEditModal, setCellEditModal] = useState<{
    open: boolean;
    employeeId: number;
    employeeName: string;
    date: string;
    currentAssignmentId?: number;
    currentShiftId?: number | null;
  }>({
    open: false,
    employeeId: 0,
    employeeName: '',
    date: '',
  });
  const [singleShiftSelect, setSingleShiftSelect] = useState<string>('');

  // Matrix Map: employee_id -> dayNumber (1-31) -> assignment
  const matrixMap = useMemo(() => {
    const map: Record<number, Record<number, typeof assignments[0]>> = {};
    assignments.forEach((asg) => {
      const day = parseInt(asg.date.split('-')[2], 10);
      if (!map[asg.employee]) {
        map[asg.employee] = {};
      }
      map[asg.employee][day] = asg;
    });
    return map;
  }, [assignments]);

  // Filtered employees
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      if (selectedDepartment !== 'ALL' && emp.department !== Number(selectedDepartment)) {
        return false;
      }
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const fullName = `${emp.first_name || ''} ${emp.last_name || ''}`.toLowerCase();
        const code = (emp.employee_code || '').toLowerCase();
        return fullName.includes(term) || code.includes(term);
      }
      return true;
    });
  }, [employees, selectedDepartment, searchTerm]);

  // Open Batch Modal
  const handleOpenBatch = () => {
    setBatchForm({
      shift_id: shifts.length > 0 ? String(shifts[0].id) : '',
      start_date: startDateStr,
      end_date: endDateStr,
      is_off_day: false,
      selectedDays: [0, 1, 2, 3, 4],
      employee_ids: filteredEmployees.map((e) => e.id),
      note: '',
    });
    setOpenBatchModal(true);
  };

  const handleDayToggle = (dayVal: number) => {
    setBatchForm((prev) => {
      const exists = prev.selectedDays.includes(dayVal);
      return {
        ...prev,
        selectedDays: exists
          ? prev.selectedDays.filter((d) => d !== dayVal)
          : [...prev.selectedDays, dayVal],
      };
    });
  };

  const handleToggleSelectAllEmployees = () => {
    if (batchForm.employee_ids.length === filteredEmployees.length) {
      setBatchForm({ ...batchForm, employee_ids: [] });
    } else {
      setBatchForm({ ...batchForm, employee_ids: filteredEmployees.map((e) => e.id) });
    }
  };

  const handleToggleEmployeeInBatch = (empId: number) => {
    setBatchForm((prev) => {
      const exists = prev.employee_ids.includes(empId);
      return {
        ...prev,
        employee_ids: exists
          ? prev.employee_ids.filter((id) => id !== empId)
          : [...prev.employee_ids, empId],
      };
    });
  };

  const handleSubmitBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (batchForm.employee_ids.length === 0) {
      alert('Vui lòng chọn ít nhất một nhân viên.');
      return;
    }

    await batchAssignShifts.mutateAsync({
      employee_ids: batchForm.employee_ids,
      shift_id: batchForm.is_off_day ? null : Number(batchForm.shift_id),
      start_date: batchForm.start_date,
      end_date: batchForm.end_date,
      applicable_days_of_week: batchForm.selectedDays,
      is_off_day: batchForm.is_off_day,
      note: batchForm.note,
    });
    setOpenBatchModal(false);
  };

  const handleCellClick = (emp: typeof employees[0], day: number) => {
    const dateStr = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const asg = matrixMap[emp.id]?.[day];

    setCellEditModal({
      open: true,
      employeeId: emp.id,
      employeeName: `${emp.first_name || ''} ${emp.last_name || ''}`,
      date: dateStr,
      currentAssignmentId: asg?.id,
      currentShiftId: asg?.shift,
    });
    setSingleShiftSelect(asg?.is_off_day ? 'OFF' : asg?.shift ? String(asg.shift) : '');
  };

  const handleSaveSingleCell = async () => {
    if (!singleShiftSelect) {
      // If cleared, delete assignment if exists
      if (cellEditModal.currentAssignmentId) {
        await deleteShiftAssignment.mutateAsync(cellEditModal.currentAssignmentId);
      }
    } else {
      await batchAssignShifts.mutateAsync({
        employee_ids: [cellEditModal.employeeId],
        shift_id: singleShiftSelect === 'OFF' ? null : Number(singleShiftSelect),
        start_date: cellEditModal.date,
        end_date: cellEditModal.date,
        is_off_day: singleShiftSelect === 'OFF',
      });
    }
    setCellEditModal({ ...cellEditModal, open: false });
  };

  // Day headers array
  const dayColumns = useMemo(() => {
    const list = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const dateObj = new Date(selectedYear, selectedMonth - 1, d);
      const dayOfWeek = dateObj.getDay(); // 0 is Sun, 1 is Mon...
      const dayOfWeekLabel = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][dayOfWeek];
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      list.push({ day: d, label: dayOfWeekLabel, isWeekend });
    }
    return list;
  }, [selectedYear, selectedMonth, daysInMonth]);

  return (
    <Box>
      {/* Header Bar */}
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
              Bảng phân ca tổng hợp
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748B' }}>
              Lập lịch ca làm việc cho nhân viên theo tháng, hỗ trợ phân ca tự động hàng loạt theo thứ trong tuần
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
              startIcon={<AddTaskIcon />}
              onClick={handleOpenBatch}
              sx={{
                textTransform: 'none',
                borderRadius: 2,
                backgroundColor: '#2563EB',
                fontWeight: 600,
                boxShadow: 'none',
                '&:hover': { backgroundColor: '#1D4ED8', boxShadow: 'none' },
              }}
            >
              Phân ca hàng loạt
            </Button>
          </Stack>
        </Stack>

        {/* Filter Controls */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          alignItems="center"
          sx={{ mt: 2.5 }}
          flexWrap="wrap"
        >
          {/* Month Selector */}
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

          {/* Year Selector */}
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

          {/* Department Filter */}
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

          {/* Employee Search */}
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

          {/* Shift Legend */}
          <Stack direction="row" spacing={1} alignItems="center" sx={{ ml: 'auto !important' }}>
            <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
              Ghi chú:
            </Typography>
            {shifts.map((s) => (
              <Chip
                key={s.id}
                label={`${s.code}: ${s.start_time?.slice(0, 5)} - ${s.end_time?.slice(0, 5)}`}
                size="small"
                sx={{ height: 22, fontSize: '0.6875rem', backgroundColor: '#EFF6FF', color: '#1D4ED8' }}
              />
            ))}
            <Chip
              label="Ngày nghỉ"
              size="small"
              sx={{ height: 22, fontSize: '0.6875rem', backgroundColor: '#F1F5F9', color: '#64748B' }}
            />
          </Stack>
        </Stack>
      </Card>

      {/* Matrix Table */}
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
                {/* Sticky Header Employee Column */}
                <TableCell
                  sx={{
                    fontWeight: 700,
                    color: '#1E293B',
                    minWidth: 200,
                    position: 'sticky',
                    left: 0,
                    zIndex: 10,
                    backgroundColor: '#F8FAFC',
                    borderRight: '1px solid #E2E8F0',
                  }}
                >
                  Nhân viên ({filteredEmployees.length})
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 700,
                    color: '#1E293B',
                    minWidth: 140,
                    position: 'sticky',
                    left: 200,
                    zIndex: 10,
                    backgroundColor: '#F8FAFC',
                    borderRight: '2px solid #CBD5E1',
                  }}
                >
                  Phòng ban
                </TableCell>

                {/* Day Columns */}
                {dayColumns.map(({ day, label, isWeekend }) => (
                  <TableCell
                    key={day}
                    align="center"
                    sx={{
                      minWidth: 46,
                      maxWidth: 46,
                      p: 0.5,
                      fontWeight: 700,
                      backgroundColor: isWeekend ? '#FFFBEB' : '#F8FAFC',
                      color: isWeekend ? '#D97706' : '#334155',
                      borderRight: '1px solid #F1F5F9',
                    }}
                  >
                    <Box sx={{ fontSize: '0.75rem' }}>{day}</Box>
                    <Box sx={{ fontSize: '0.6875rem', fontWeight: 500 }}>{label}</Box>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {empLoading || assignLoading ? (
                <TableRow>
                  <TableCell colSpan={daysInMonth + 2} align="center" sx={{ py: 8 }}>
                    <CircularProgress size={36} sx={{ color: '#2563EB' }} />
                  </TableCell>
                </TableRow>
              ) : filteredEmployees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={daysInMonth + 2} align="center" sx={{ py: 8, color: '#64748B' }}>
                    Không có dữ liệu nhân viên thỏa mãn điều kiện lọc.
                  </TableCell>
                </TableRow>
              ) : (
                filteredEmployees.map((emp) => (
                  <TableRow key={emp.id} hover sx={{ '&:hover': { backgroundColor: '#F8FAFC' } }}>
                    {/* Sticky Employee Name */}
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
                          {(emp.first_name || emp.last_name || 'N')[0]}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#0F172A', lineHeight: 1.2 }}>
                            {emp.first_name} {emp.last_name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#64748B' }}>
                            {emp.employee_code}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>

                    {/* Sticky Department Name */}
                    <TableCell
                      sx={{
                        position: 'sticky',
                        left: 200,
                        zIndex: 5,
                        backgroundColor: '#FFFFFF',
                        borderRight: '2px solid #CBD5E1',
                        fontSize: '0.8125rem',
                        color: '#475569',
                      }}
                    >
                      {emp.department_name || 'Chưa phân bổ'}
                    </TableCell>

                    {/* Day Matrix Cells */}
                    {dayColumns.map(({ day, isWeekend }) => {
                      const asg = matrixMap[emp.id]?.[day];
                      const shiftCode = asg?.shift_code;
                      const isOff = asg?.is_off_day;

                      return (
                        <TableCell
                          key={day}
                          align="center"
                          onClick={() => handleCellClick(emp, day)}
                          sx={{
                            p: 0.25,
                            cursor: 'pointer',
                            backgroundColor: isWeekend ? '#FFFDF5' : '#FFFFFF',
                            borderRight: '1px solid #F1F5F9',
                            transition: 'background-color 0.15s ease',
                            '&:hover': { backgroundColor: '#EFF6FF' },
                          }}
                        >
                          {isOff ? (
                            <Chip
                              label="OFF"
                              size="small"
                              sx={{
                                height: 22,
                                minWidth: 36,
                                fontSize: '0.6875rem',
                                fontWeight: 700,
                                backgroundColor: '#F1F5F9',
                                color: '#64748B',
                                borderRadius: 1,
                              }}
                            />
                          ) : shiftCode ? (
                            <Tooltip title={asg.shift_name || shiftCode}>
                              <Chip
                                label={shiftCode}
                                size="small"
                                sx={{
                                  height: 22,
                                  minWidth: 36,
                                  fontSize: '0.6875rem',
                                  fontWeight: 700,
                                  backgroundColor: '#EFF6FF',
                                  color: '#2563EB',
                                  borderRadius: 1,
                                }}
                              />
                            </Tooltip>
                          ) : (
                            <Box
                              sx={{
                                height: 22,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#CBD5E1',
                                fontSize: '0.75rem',
                              }}
                            >
                              -
                            </Box>
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Batch Assign Modal */}
      <Dialog
        open={openBatchModal}
        onClose={() => setOpenBatchModal(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <form onSubmit={handleSubmitBatch}>
          <DialogTitle sx={{ fontWeight: 700, fontSize: '1.125rem', borderBottom: '1px solid #E2E8F0', pb: 2 }}>
            Phân ca làm việc hàng loạt
          </DialogTitle>

          <DialogContent sx={{ pt: 2.5 }}>
            <Grid container spacing={2.5}>
              {/* Shift selection */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5, color: '#334155' }}>
                  Chọn ca làm việc *
                </Typography>
                <TextField
                  select
                  fullWidth
                  required={!batchForm.is_off_day}
                  disabled={batchForm.is_off_day}
                  value={batchForm.shift_id}
                  onChange={(e) => setBatchForm({ ...batchForm, shift_id: e.target.value })}
                  sx={inputSx}
                >
                  {shifts.map((s) => (
                    <MenuItem key={s.id} value={String(s.id)}>
                      {s.code} - {s.name} ({s.start_time?.slice(0, 5)} - {s.end_time?.slice(0, 5)})
                    </MenuItem>
                  ))}
                </TextField>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={batchForm.is_off_day}
                      onChange={(e) => setBatchForm({ ...batchForm, is_off_day: e.target.checked })}
                      color="primary"
                    />
                  }
                  label="Đánh dấu là ngày nghỉ tuần"
                  sx={{ mt: 0.5 }}
                />
              </Grid>

              {/* Date Range */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5, color: '#334155' }}>
                  Khoảng thời gian áp dụng *
                </Typography>
                <Stack direction="row" spacing={1.5}>
                  <TextField
                    type="date"
                    size="small"
                    fullWidth
                    required
                    value={batchForm.start_date}
                    onChange={(e) => setBatchForm({ ...batchForm, start_date: e.target.value })}
                    sx={inputSx}
                  />
                  <TextField
                    type="date"
                    size="small"
                    fullWidth
                    required
                    value={batchForm.end_date}
                    onChange={(e) => setBatchForm({ ...batchForm, end_date: e.target.value })}
                    sx={inputSx}
                  />
                </Stack>
              </Grid>

              {/* Days of Week */}
              <Grid size={{ xs: 12 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5, color: '#334155' }}>
                  Áp dụng cho các thứ trong tuần:
                </Typography>
                <FormGroup row sx={{ gap: 1 }}>
                  {DAYS_OF_WEEK.map((d) => (
                    <FormControlLabel
                      key={d.value}
                      control={
                        <Checkbox
                          checked={batchForm.selectedDays.includes(d.value)}
                          onChange={() => handleDayToggle(d.value)}
                          color="primary"
                          size="small"
                        />
                      }
                      label={d.label}
                    />
                  ))}
                </FormGroup>
              </Grid>

              {/* Employee Selection List */}
              <Grid size={{ xs: 12 }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mb: 1,
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155' }}>
                    Nhân viên được áp dụng ({batchForm.employee_ids.length}/{filteredEmployees.length}):
                  </Typography>
                  <Button size="small" onClick={handleToggleSelectAllEmployees} sx={{ textTransform: 'none' }}>
                    {batchForm.employee_ids.length === filteredEmployees.length
                      ? 'Bỏ chọn tất cả'
                      : 'Chọn tất cả'}
                  </Button>
                </Box>

                <Paper
                  variant="outlined"
                  sx={{
                    maxHeight: 180,
                    overflowY: 'auto',
                    p: 1,
                    borderRadius: 2,
                    backgroundColor: '#F8FAFC',
                  }}
                >
                  <Grid container spacing={1}>
                    {filteredEmployees.map((emp) => {
                      const isSelected = batchForm.employee_ids.includes(emp.id);
                      return (
                        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={emp.id}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={isSelected}
                                onChange={() => handleToggleEmployeeInBatch(emp.id)}
                                size="small"
                              />
                            }
                            label={
                              <Box sx={{ fontSize: '0.8125rem' }}>
                                <Typography variant="body2" sx={{ fontSize: '0.8125rem', fontWeight: 500 }}>
                                  {emp.first_name} {emp.last_name}
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#64748B' }}>
                                  {emp.employee_code}
                                </Typography>
                              </Box>
                            }
                          />
                        </Grid>
                      );
                    })}
                  </Grid>
                </Paper>
              </Grid>

              {/* Note */}
              <Grid size={{ xs: 12 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5, color: '#334155' }}>
                  Ghi chú phân ca
                </Typography>
                <TextField
                  fullWidth
                  placeholder="VD: Lịch làm việc tháng 9/2026..."
                  value={batchForm.note}
                  onChange={(e) => setBatchForm({ ...batchForm, note: e.target.value })}
                  sx={inputSx}
                />
              </Grid>
            </Grid>
          </DialogContent>

          <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid #E2E8F0' }}>
            <Button onClick={() => setOpenBatchModal(false)} sx={{ textTransform: 'none', color: '#64748B' }}>
              Hủy
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={batchAssignShifts.isPending}
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
              Áp dụng phân ca
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Single Cell Quick Edit Dialog */}
      <Dialog
        open={cellEditModal.open}
        onClose={() => setCellEditModal({ ...cellEditModal, open: false })}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: '1.05rem', borderBottom: '1px solid #E2E8F0', pb: 1.5 }}>
          Phân ca ngày {cellEditModal.date}
        </DialogTitle>
        <DialogContent sx={{ pt: 2.5 }}>
          <Typography variant="body2" sx={{ color: '#0F172A', fontWeight: 600, mb: 2 }}>
            Nhân viên: {cellEditModal.employeeName}
          </Typography>

          <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5, color: '#334155' }}>
            Chọn ca hoặc ngày nghỉ
          </Typography>
          <TextField
            select
            fullWidth
            value={singleShiftSelect}
            onChange={(e) => setSingleShiftSelect(e.target.value)}
            sx={inputSx}
          >
            <MenuItem value="">
              <em>-- Chưa phân ca --</em>
            </MenuItem>
            <MenuItem value="OFF">
              <strong>Ngày nghỉ tuần</strong>
            </MenuItem>
            {shifts.map((s) => (
              <MenuItem key={s.id} value={String(s.id)}>
                {s.code} - {s.name}: {s.start_time?.slice(0, 5)} đến {s.end_time?.slice(0, 5)}
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid #E2E8F0' }}>
          <Button
            onClick={() => setCellEditModal({ ...cellEditModal, open: false })}
            sx={{ textTransform: 'none', color: '#64748B' }}
          >
            Hủy
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveSingleCell}
            disabled={batchAssignShifts.isPending || deleteShiftAssignment.isPending}
            sx={{
              textTransform: 'none',
              borderRadius: 2,
              backgroundColor: '#2563EB',
              fontWeight: 600,
              boxShadow: 'none',
              '&:hover': { backgroundColor: '#1D4ED8', boxShadow: 'none' },
            }}
          >
            Lưu thay đổi
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
