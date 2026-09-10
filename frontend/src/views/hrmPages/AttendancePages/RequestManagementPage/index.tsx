'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
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
  Tabs,
  Tab,
  InputAdornment,
  Alert,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import SearchIcon from '@mui/icons-material/Search';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import AddTaskIcon from '@mui/icons-material/AddTask';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import MoreTimeIcon from '@mui/icons-material/MoreTime';
import ScheduleSendIcon from '@mui/icons-material/ScheduleSend';
import BlockIcon from '@mui/icons-material/Block';
import DoneAllIcon from '@mui/icons-material/DoneAll';

import {
  useHrmAttendanceRequests,
  useHrmEmployees,
  useHrmLeaveTypes,
  useHrmMutations,
} from '../../hooks/useHrmQueries';
import {
  AttendanceRequestType,
  AttendanceRequestStatus,
  NativeAttendanceRequest,
} from '@/services/hrmService';
import { TabTitle } from '@/utils/generalFunction';
import pc from '@/utils/muiColors';

const inputSx = {
  '& .MuiOutlinedInput-root': {
    minHeight: 44,
    borderRadius: 2,
    backgroundColor: 'background.paper',
    '& fieldset': { borderColor: pc.divider(0.95) },
    '&:hover': { backgroundColor: pc.bgDefault(0.45) },
    '&:hover fieldset': { borderColor: pc.primary(0.35) },
    '&.Mui-focused fieldset': { borderColor: 'primary.main', borderWidth: 1 },
  },
  '& .MuiInputBase-input': {
    fontSize: '0.875rem',
    py: '10px',
  },
};

const REQUEST_TYPES = [
  { value: 'ALL', label: 'Tất cả đơn', icon: <HourglassEmptyIcon fontSize="small" /> },
  { value: 'LEAVE', label: 'Đơn xin nghỉ', icon: <EventBusyIcon fontSize="small" /> },
  { value: 'REGULARISATION', label: 'Cập nhật công', icon: <AddTaskIcon fontSize="small" /> },
  { value: 'BUSINESS_TRIP', label: 'Đi công tác', icon: <FlightTakeoffIcon fontSize="small" /> },
  { value: 'OVERTIME', label: 'Làm thêm giờ', icon: <MoreTimeIcon fontSize="small" /> },
  { value: 'LATE_EARLY', label: 'Đi muộn, về sớm', icon: <ScheduleSendIcon fontSize="small" /> },
];

export default function RequestManagementPage() {
  TabTitle('Trung tâm quản lý đơn từ | InfoHR HRM');

  const router = useRouter();
  const searchParams = useSearchParams();
  const paramType = searchParams.get('type') || 'ALL';

  const [activeTab, setActiveTab] = useState<string>(paramType);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    if (paramType) {
      setActiveTab(paramType);
    }
  }, [paramType]);

  // Queries
  const { data: requests = [], isLoading, refetch } = useHrmAttendanceRequests({
    request_type: activeTab === 'ALL' ? undefined : activeTab,
    status: statusFilter === 'ALL' ? undefined : statusFilter,
  });
  const { data: employees = [] } = useHrmEmployees();
  const { data: leaveTypes = [] } = useHrmLeaveTypes();

  // Mutations
  const {
    createAttendanceRequest,
    approveAttendanceRequestStage1,
    approveAttendanceRequestStage2,
    rejectAttendanceRequest,
    cancelAttendanceRequest,
  } = useHrmMutations();

  // Create Request Modal
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const todayStr = new Date().toISOString().split('T')[0];
  const [createForm, setCreateForm] = useState({
    employee: '',
    request_type: (activeTab !== 'ALL' ? activeTab : 'LEAVE') as AttendanceRequestType,
    leave_type: '',
    start_date: todayStr,
    end_date: todayStr,
    start_time: '08:00:00',
    end_time: '17:30:00',
    duration_hours: '8.00',
    reason: '',
  });

  // Rejection Dialog
  const [rejectDialog, setRejectDialog] = useState<{ open: boolean; requestId: number; reason: string }>({
    open: false,
    requestId: 0,
    reason: '',
  });

  const handleTabChange = (_: React.SyntheticEvent, newValue: string) => {
    setActiveTab(newValue);
    if (newValue === 'ALL') {
      router.push('/employer/hrm/attendances/requests');
    } else {
      router.push(`/employer/hrm/attendances/requests?type=${newValue}`);
    }
  };

  const handleOpenCreate = () => {
    setCreateForm({
      employee: employees.length > 0 ? String(employees[0].id) : '',
      request_type: (activeTab !== 'ALL' ? activeTab : 'LEAVE') as AttendanceRequestType,
      leave_type: leaveTypes.length > 0 ? String(leaveTypes[0].id) : '',
      start_date: todayStr,
      end_date: todayStr,
      start_time: '08:00:00',
      end_time: '17:30:00',
      duration_hours: '8.00',
      reason: '',
    });
    setOpenCreateModal(true);
  };

  const handleSubmitCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.employee) {
      alert('Vui lòng chọn nhân viên.');
      return;
    }

    const payload: Partial<NativeAttendanceRequest> = {
      employee: Number(createForm.employee),
      request_type: createForm.request_type,
      leave_type: createForm.request_type === 'LEAVE' && createForm.leave_type ? Number(createForm.leave_type) : null,
      start_date: createForm.start_date,
      end_date: createForm.end_date,
      start_time: ['REGULARISATION', 'OVERTIME', 'LATE_EARLY'].includes(createForm.request_type)
        ? (createForm.start_time.length === 5 ? `${createForm.start_time}:00` : createForm.start_time)
        : null,
      end_time: ['REGULARISATION', 'OVERTIME', 'LATE_EARLY'].includes(createForm.request_type)
        ? (createForm.end_time.length === 5 ? `${createForm.end_time}:00` : createForm.end_time)
        : null,
      duration_hours: createForm.request_type === 'OVERTIME' ? createForm.duration_hours : null,
      reason: createForm.reason.trim(),
    };

    await createAttendanceRequest.mutateAsync(payload);
    setOpenCreateModal(false);
  };

  const handleConfirmReject = async () => {
    if (rejectDialog.requestId) {
      await rejectAttendanceRequest.mutateAsync({
        id: rejectDialog.requestId,
        reason: rejectDialog.reason,
      });
      setRejectDialog({ open: false, requestId: 0, reason: '' });
    }
  };

  const getStatusChip = (status: AttendanceRequestStatus) => {
    switch (status) {
      case 'PENDING_STAGE_1':
        return (
          <Chip
            label="Chờ Quản lý duyệt (Cấp 1)"
            size="small"
            sx={{
              height: 24,
              fontSize: '0.75rem',
              fontWeight: 600,
              backgroundColor: '#FEF3C7',
              color: '#B45309',
            }}
          />
        );
      case 'APPROVED_STAGE_1':
        return (
          <Chip
            label="Chờ HR duyệt (Cấp 2)"
            size="small"
            sx={{
              height: 24,
              fontSize: '0.75rem',
              fontWeight: 600,
              backgroundColor: '#E0F2FE',
              color: '#0369A1',
            }}
          />
        );
      case 'APPROVED':
        return (
          <Chip
            label="Đã duyệt & Bù công"
            size="small"
            icon={<CheckCircleIcon sx={{ fontSize: '1rem !important' }} />}
            sx={{
              height: 24,
              fontSize: '0.75rem',
              fontWeight: 600,
              backgroundColor: '#DCFCE7',
              color: '#15803D',
            }}
          />
        );
      case 'REJECTED':
        return (
          <Chip
            label="Đã từ chối"
            size="small"
            sx={{
              height: 24,
              fontSize: '0.75rem',
              fontWeight: 600,
              backgroundColor: '#FEE2E2',
              color: '#B91C1C',
            }}
          />
        );
      case 'CANCELLED':
        return (
          <Chip
            label="Đã hủy"
            size="small"
            sx={{
              height: 24,
              fontSize: '0.75rem',
              fontWeight: 600,
              backgroundColor: '#F1F5F9',
              color: '#64748B',
            }}
          />
        );
      default:
        return <Chip label={status} size="small" />;
    }
  };

  const filteredRequests = requests.filter((req) => {
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const name = (req.employee_name || '').toLowerCase();
      const code = (req.employee_code || '').toLowerCase();
      const reason = (req.reason || '').toLowerCase();
      return name.includes(term) || code.includes(term) || reason.includes(term);
    }
    return true;
  });

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
              Trung tâm quản lý đơn từ chấm công
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748B' }}>
              Quy trình phê duyệt 2 cấp (Quản lý trực tiếp ➔ HR/Admin). Khi cấp 2 phê duyệt, hệ thống tự động bù công vào bảng chấm công chi tiết.
            </Typography>
          </Box>

          <Stack direction="row" spacing={1.5}>
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
              startIcon={<AddIcon />}
              onClick={handleOpenCreate}
              sx={{
                textTransform: 'none',
                borderRadius: 2,
                backgroundColor: '#2563EB',
                fontWeight: 600,
                boxShadow: 'none',
                '&:hover': { backgroundColor: '#1D4ED8', boxShadow: 'none' },
              }}
            >
              Gửi đơn mới
            </Button>
          </Stack>
        </Stack>

        {/* 5 Type Navigation Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mt: 2.5 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.875rem',
                minHeight: 44,
                gap: 1,
              },
            }}
          >
            {REQUEST_TYPES.map((t) => (
              <Tab
                key={t.value}
                value={t.value}
                icon={t.icon}
                iconPosition="start"
                label={t.label}
              />
            ))}
          </Tabs>
        </Box>

        {/* Filter Toolbar */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 2.5 }} alignItems="center">
          <TextField
            select
            size="small"
            label="Trạng thái duyệt"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            sx={{ minWidth: 220, ...inputSx }}
          >
            <MenuItem value="ALL">Tất cả trạng thái</MenuItem>
            <MenuItem value="PENDING_STAGE_1">Chờ Quản lý duyệt (Cấp 1)</MenuItem>
            <MenuItem value="APPROVED_STAGE_1">Chờ HR duyệt (Cấp 2)</MenuItem>
            <MenuItem value="APPROVED">Đã duyệt & Bù công</MenuItem>
            <MenuItem value="REJECTED">Đã từ chối</MenuItem>
            <MenuItem value="CANCELLED">Đã hủy</MenuItem>
          </TextField>

          <TextField
            size="small"
            placeholder="Tìm theo tên nhân viên, mã NV hoặc lý do..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" sx={{ color: '#94A3B8' }} />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 300, ...inputSx }}
          />

          <Box sx={{ ml: 'auto !important' }}>
            <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 500 }}>
              Tổng số: <strong>{filteredRequests.length}</strong> đơn
            </Typography>
          </Box>
        </Stack>
      </Card>

      {/* Table of Requests */}
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
                <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Loại đơn</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Thời gian áp dụng</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Lý do / Ghi chú</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Trạng thái duyệt</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Người duyệt</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, color: '#475569' }}>
                  Xử lý đơn
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                    <CircularProgress size={32} sx={{ color: '#2563EB' }} />
                  </TableCell>
                </TableRow>
              ) : filteredRequests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6, color: '#64748B' }}>
                    Không có đơn từ nào trong danh mục này.
                  </TableCell>
                </TableRow>
              ) : (
                filteredRequests.map((req) => (
                  <TableRow key={req.id} hover>
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
                          {(req.employee_name || 'N')[0]}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#0F172A', lineHeight: 1.2 }}>
                            {req.employee_name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#64748B' }}>
                            {req.employee_code} • {req.department_name}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={req.request_type_label || req.request_type}
                        size="small"
                        sx={{
                          fontWeight: 600,
                          backgroundColor: '#EFF6FF',
                          color: '#2563EB',
                          borderRadius: 1.5,
                        }}
                      />
                      {req.leave_type_name && (
                        <Typography variant="caption" sx={{ display: 'block', color: '#64748B', mt: 0.5 }}>
                          ({req.leave_type_name})
                        </Typography>
                      )}
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500, color: '#0F172A' }}>
                        {req.start_date === req.end_date ? req.start_date : `${req.start_date} ➔ ${req.end_date}`}
                      </Typography>
                      {(req.start_time || req.end_time || req.duration_hours) && (
                        <Typography variant="caption" sx={{ color: '#64748B' }}>
                          {req.start_time?.slice(0, 5)} - {req.end_time?.slice(0, 5)}
                          {req.duration_hours && ` (${req.duration_hours} giờ)`}
                        </Typography>
                      )}
                    </TableCell>

                    <TableCell sx={{ maxWidth: 220 }}>
                      <Typography variant="body2" sx={{ color: '#334155' }}>
                        {req.reason || '-'}
                      </Typography>
                      {req.rejection_reason && (
                        <Typography variant="caption" sx={{ color: '#DC2626', display: 'block', mt: 0.5 }}>
                          Lý do từ chối: {req.rejection_reason}
                        </Typography>
                      )}
                    </TableCell>

                    <TableCell>{getStatusChip(req.status)}</TableCell>

                    <TableCell sx={{ fontSize: '0.8125rem', color: '#475569' }}>
                      {req.manager_reviewer_name && (
                        <Box>
                          <strong>QL:</strong> {req.manager_reviewer_name}
                        </Box>
                      )}
                      {req.hr_reviewer_name && (
                        <Box>
                          <strong>HR:</strong> {req.hr_reviewer_name}
                        </Box>
                      )}
                      {!req.manager_reviewer_name && !req.hr_reviewer_name && '-'}
                    </TableCell>

                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        {/* Manager Approval Button (Stage 1) */}
                        {req.status === 'PENDING_STAGE_1' && (
                          <Tooltip title="Quản lý duyệt cấp 1">
                            <Button
                              size="small"
                              variant="contained"
                              color="primary"
                              onClick={() => approveAttendanceRequestStage1.mutateAsync(req.id)}
                              disabled={approveAttendanceRequestStage1.isPending}
                              sx={{
                                textTransform: 'none',
                                fontSize: '0.75rem',
                                borderRadius: 1.5,
                                px: 1.5,
                                fontWeight: 600,
                              }}
                            >
                              Duyệt Cấp 1
                            </Button>
                          </Tooltip>
                        )}

                        {/* HR Approval Button (Stage 2) */}
                        {req.status === 'APPROVED_STAGE_1' && (
                          <Tooltip title="HR phê duyệt & Tự động bù công">
                            <Button
                              size="small"
                              variant="contained"
                              color="success"
                              onClick={() => approveAttendanceRequestStage2.mutateAsync(req.id)}
                              disabled={approveAttendanceRequestStage2.isPending}
                              startIcon={<DoneAllIcon sx={{ fontSize: '1rem !important' }} />}
                              sx={{
                                textTransform: 'none',
                                fontSize: '0.75rem',
                                borderRadius: 1.5,
                                px: 1.5,
                                fontWeight: 600,
                              }}
                            >
                              Duyệt & Bù công
                            </Button>
                          </Tooltip>
                        )}

                        {/* Reject Button for pending requests */}
                        {['PENDING_STAGE_1', 'APPROVED_STAGE_1'].includes(req.status) && (
                          <Tooltip title="Từ chối đơn">
                            <Button
                              size="small"
                              variant="outlined"
                              color="error"
                              onClick={() => setRejectDialog({ open: true, requestId: req.id, reason: '' })}
                              sx={{
                                textTransform: 'none',
                                fontSize: '0.75rem',
                                borderRadius: 1.5,
                                px: 1.5,
                                fontWeight: 600,
                              }}
                            >
                              Từ chối
                            </Button>
                          </Tooltip>
                        )}

                        {/* Cancel Button */}
                        {['PENDING_STAGE_1', 'APPROVED_STAGE_1'].includes(req.status) && (
                          <Tooltip title="Hủy đơn">
                            <IconButton
                              size="small"
                              onClick={() => cancelAttendanceRequest.mutateAsync(req.id)}
                              disabled={cancelAttendanceRequest.isPending}
                              sx={{ color: '#94A3B8' }}
                            >
                              <BlockIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Create Request Modal */}
      <Dialog
        open={openCreateModal}
        onClose={() => setOpenCreateModal(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <form onSubmit={handleSubmitCreate}>
          <DialogTitle sx={{ fontWeight: 700, fontSize: '1.125rem', borderBottom: '1px solid #E2E8F0', pb: 2 }}>
            Tạo đơn từ chấm công mới
          </DialogTitle>

          <DialogContent sx={{ pt: 2.5 }}>
            <Grid container spacing={2}>
              {/* Employee */}
              <Grid size={{ xs: 12 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5, color: '#334155' }}>
                  Nhân viên làm đơn *
                </Typography>
                <TextField
                  select
                  fullWidth
                  required
                  value={createForm.employee}
                  onChange={(e) => setCreateForm({ ...createForm, employee: e.target.value })}
                  sx={inputSx}
                >
                  {employees.map((emp) => (
                    <MenuItem key={emp.id} value={String(emp.id)}>
                      {emp.first_name} {emp.last_name} ({emp.employee_code || 'Chưa có mã'}) - {emp.department_name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              {/* Request Type */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5, color: '#334155' }}>
                  Loại đơn từ *
                </Typography>
                <TextField
                  select
                  fullWidth
                  required
                  value={createForm.request_type}
                  onChange={(e) =>
                    setCreateForm({
                      ...createForm,
                      request_type: e.target.value as AttendanceRequestType,
                    })
                  }
                  sx={inputSx}
                >
                  <MenuItem value="LEAVE">Đơn xin nghỉ</MenuItem>
                  <MenuItem value="REGULARISATION">Đề nghị cập nhật công</MenuItem>
                  <MenuItem value="BUSINESS_TRIP">Đề nghị đi công tác</MenuItem>
                  <MenuItem value="OVERTIME">Đơn làm thêm giờ</MenuItem>
                  <MenuItem value="LATE_EARLY">Đơn đi muộn, về sớm</MenuItem>
                </TextField>
              </Grid>

              {/* Leave Type if LEAVE */}
              {createForm.request_type === 'LEAVE' && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5, color: '#334155' }}>
                    Loại nghỉ phép *
                  </Typography>
                  <TextField
                    select
                    fullWidth
                    required
                    value={createForm.leave_type}
                    onChange={(e) => setCreateForm({ ...createForm, leave_type: e.target.value })}
                    sx={inputSx}
                  >
                    {leaveTypes.map((lt) => (
                      <MenuItem key={lt.id} value={String(lt.id)}>
                        {lt.name} ({lt.is_paid || lt.isPaid ? 'Hưởng lương' : 'Không lương'})
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              )}

              {/* Start Date & End Date */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5, color: '#334155' }}>
                  Từ ngày *
                </Typography>
                <TextField
                  type="date"
                  fullWidth
                  required
                  value={createForm.start_date}
                  onChange={(e) => setCreateForm({ ...createForm, start_date: e.target.value })}
                  sx={inputSx}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5, color: '#334155' }}>
                  Đến ngày *
                </Typography>
                <TextField
                  type="date"
                  fullWidth
                  required
                  value={createForm.end_date}
                  onChange={(e) => setCreateForm({ ...createForm, end_date: e.target.value })}
                  sx={inputSx}
                />
              </Grid>

              {/* Time fields for OT, Regularisation, Late/Early */}
              {['REGULARISATION', 'OVERTIME', 'LATE_EARLY'].includes(createForm.request_type) && (
                <>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5, color: '#334155' }}>
                      Giờ bắt đầu
                    </Typography>
                    <TextField
                      type="time"
                      fullWidth
                      value={createForm.start_time.slice(0, 5)}
                      onChange={(e) => setCreateForm({ ...createForm, start_time: `${e.target.value}:00` })}
                      sx={inputSx}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5, color: '#334155' }}>
                      Giờ kết thúc
                    </Typography>
                    <TextField
                      type="time"
                      fullWidth
                      value={createForm.end_time.slice(0, 5)}
                      onChange={(e) => setCreateForm({ ...createForm, end_time: `${e.target.value}:00` })}
                      sx={inputSx}
                    />
                  </Grid>
                </>
              )}

              {/* Duration hours for OT */}
              {createForm.request_type === 'OVERTIME' && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5, color: '#334155' }}>
                    Số giờ làm thêm *
                  </Typography>
                  <TextField
                    type="number"
                    fullWidth
                    required
                    inputProps={{ step: '0.5', min: '0.5', max: '24' }}
                    value={createForm.duration_hours}
                    onChange={(e) => setCreateForm({ ...createForm, duration_hours: e.target.value })}
                    sx={inputSx}
                  />
                </Grid>
              )}

              {/* Reason */}
              <Grid size={{ xs: 12 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5, color: '#334155' }}>
                  Lý do chi tiết *
                </Typography>
                <TextField
                  fullWidth
                  required
                  multiline
                  rows={3}
                  placeholder="Nêu rõ lý do xin nghỉ, cập nhật công hoặc làm thêm giờ..."
                  value={createForm.reason}
                  onChange={(e) => setCreateForm({ ...createForm, reason: e.target.value })}
                  sx={inputSx}
                />
              </Grid>
            </Grid>
          </DialogContent>

          <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid #E2E8F0' }}>
            <Button onClick={() => setOpenCreateModal(false)} sx={{ textTransform: 'none', color: '#64748B' }}>
              Hủy
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={createAttendanceRequest.isPending}
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
              Gửi phê duyệt
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Reject Reason Dialog */}
      <Dialog
        open={rejectDialog.open}
        onClose={() => setRejectDialog({ ...rejectDialog, open: false })}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: '#DC2626', pb: 1 }}>
          Từ chối đơn từ
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: '#64748B', mb: 2 }}>
            Vui lòng nhập lý do từ chối để thông báo cho nhân viên.
          </Typography>
          <TextField
            fullWidth
            required
            multiline
            rows={3}
            placeholder="Lý do không duyệt đơn..."
            value={rejectDialog.reason}
            onChange={(e) => setRejectDialog({ ...rejectDialog, reason: e.target.value })}
            sx={inputSx}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setRejectDialog({ ...rejectDialog, open: false })}
            sx={{ textTransform: 'none', color: '#64748B' }}
          >
            Hủy
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleConfirmReject}
            disabled={rejectAttendanceRequest.isPending || !rejectDialog.reason.trim()}
            sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 600 }}
          >
            Xác nhận từ chối
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
