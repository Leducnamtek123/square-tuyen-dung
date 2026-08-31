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
  CircularProgress,
  Stack,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Tooltip,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import BeachAccessIcon from '@mui/icons-material/BeachAccess';
import RefreshIcon from '@mui/icons-material/Refresh';
import AddIcon from '@mui/icons-material/Add';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import dayjs from 'dayjs';

import { useHrmLeaves, useHrmEmployees, useHrmLeaveBalances, useHrmMutations } from '../hooks/useHrmQueries';
import { TabTitle } from '@/utils/generalFunction';
import pc from '@/utils/muiColors';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import AutoFixHighOutlinedIcon from '@mui/icons-material/AutoFixHighOutlined';

const inputSx = {
  '& .MuiOutlinedInput-root': {
    minHeight: 44,
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
    py: '10px',
  },
};

export default function LeaveListPage() {
  TabTitle('Quản lý Nghỉ phép & Quỹ Phép | InfoHR HRM');

  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [activeTab, setActiveTab] = useState<'REQUESTS' | 'BALANCES'>('REQUESTS');

  const { data: leaveRequests = [], isLoading: loading, refetch } = useHrmLeaves();
  const { data: leaveBalances = [], isLoading: balancesLoading } = useHrmLeaveBalances({ year: selectedYear });
  const { data: employees = [] } = useHrmEmployees();
  const { createLeaveRequest, deleteLeaveRequest, approveLeave, rejectLeave, autoAllocateLeaveBalances } = useHrmMutations();

  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [rejectDialogId, setRejectDialogId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [deletingLeaveId, setDeletingLeaveId] = useState<number | null>(null);

  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    employee: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
    total_days: 1,
    reason: '',
  });

  const totalLeaves = leaveRequests.length;
  const pendingLeaves = leaveRequests.filter((l) => l.status === 'PENDING').length;
  const approvedLeaves = leaveRequests.filter((l) => l.status === 'APPROVED').length;
  const rejectedLeaves = leaveRequests.filter((l) => l.status === 'REJECTED').length;

  const filteredLeaves = leaveRequests.filter((l) => {
    if (statusFilter === 'ALL') return true;
    return l.status === statusFilter;
  });

  const handleOpenCreate = () => {
    setCreateForm({
      employee: employees.length > 0 ? String(employees[0].id) : '',
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date().toISOString().split('T')[0],
      total_days: 1,
      reason: '',
    });
    setOpenCreateModal(true);
  };

  const handleCreateSubmit = async () => {
    if (!createForm.employee || !createForm.start_date || !createForm.end_date) return;
    createLeaveRequest.mutate(
      {
        employee: Number(createForm.employee),
        start_date: createForm.start_date,
        end_date: createForm.end_date,
        total_days: Number(createForm.total_days),
        reason: createForm.reason || undefined,
        status: 'PENDING',
      },
      {
        onSuccess: () => setOpenCreateModal(false),
      }
    );
  };

  const handleConfirmReject = () => {
    if (rejectDialogId === null) return;
    rejectLeave.mutate(
      { id: rejectDialogId, reason: rejectReason },
      {
        onSuccess: () => {
          setRejectDialogId(null);
          setRejectReason('');
        },
      }
    );
  };

  const handleConfirmDelete = () => {
    if (!deletingLeaveId) return;
    deleteLeaveRequest.mutate(deletingLeaveId, {
      onSuccess: () => setDeletingLeaveId(null),
    });
  };

  const handleAutoAllocate = () => {
    autoAllocateLeaveBalances.mutate(selectedYear);
  };

  const renderStatusChip = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Chip label="Chờ duyệt" size="small" sx={{ fontWeight: 800, fontSize: '0.725rem', bgcolor: '#fffbeb', color: '#d97706', borderRadius: 1.5 }} />;
      case 'APPROVED':
        return <Chip label="Đã duyệt" size="small" sx={{ fontWeight: 800, fontSize: '0.725rem', bgcolor: '#f0fdf4', color: '#16a34a', borderRadius: 1.5 }} />;
      case 'REJECTED':
        return <Chip label="Đã từ chối" size="small" sx={{ fontWeight: 800, fontSize: '0.725rem', bgcolor: '#fef2f2', color: '#dc2626', borderRadius: 1.5 }} />;
      default:
        return <Chip label={status} size="small" sx={{ borderRadius: 1.5 }} />;
    }
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 1400, mx: 'auto', p: { xs: 2, sm: 3 } }}>
      <Stack spacing={3.5}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: '12px',
                bgcolor: '#fff7ed',
                color: '#ea580c',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <BeachAccessIcon sx={{ fontSize: 24 }} />
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 900, color: '#0f172a', fontSize: { xs: '1.25rem', md: '1.5rem' }, letterSpacing: '-0.02em' }}>
                Quản lý Đơn Nghỉ phép (Leaves)
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500, fontSize: '0.875rem' }}>
                Phê duyệt đơn nghỉ phép năm, phép ốm, thai sản và theo dõi quỹ phép nhân viên
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={1.5} alignItems="center">
            <Button
              variant="outlined"
              size="small"
              startIcon={<RefreshIcon sx={{ fontSize: 16 }} />}
              onClick={() => refetch()}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 700,
                color: '#0f172a',
                borderColor: '#cbd5e1',
                bgcolor: '#ffffff',
                '&:hover': { bgcolor: '#f8fafc', borderColor: '#94a3b8' },
              }}
            >
              Làm mới
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenCreate}
              sx={{
                borderRadius: 2.5,
                textTransform: 'none',
                fontWeight: 800,
                fontSize: '0.875rem',
                bgcolor: '#ea580c',
                boxShadow: '0 4px 12px 0 rgba(234, 88, 12, 0.2)',
                '&:hover': { bgcolor: '#c2410c' },
              }}
            >
              Tạo Đơn Nghỉ Phép
            </Button>
          </Stack>
        </Box>

        {/* Tab Navigation */}
        <Box sx={{ borderBottom: 1, borderColor: '#e2e8f0' }}>
          <Stack direction="row" spacing={3}>
            <Button
              onClick={() => setActiveTab('REQUESTS')}
              sx={{
                pb: 1.5,
                borderRadius: 0,
                borderBottom: '2px solid',
                borderColor: activeTab === 'REQUESTS' ? '#ea580c' : 'transparent',
                color: activeTab === 'REQUESTS' ? '#ea580c' : '#64748b',
                fontWeight: activeTab === 'REQUESTS' ? 800 : 600,
                fontSize: '0.95rem',
                textTransform: 'none',
                '&:hover': { bgcolor: 'transparent', color: '#ea580c' },
              }}
            >
              Đơn Nghỉ Phép ({totalLeaves})
            </Button>
            <Button
              onClick={() => setActiveTab('BALANCES')}
              sx={{
                pb: 1.5,
                borderRadius: 0,
                borderBottom: '2px solid',
                borderColor: activeTab === 'BALANCES' ? '#ea580c' : 'transparent',
                color: activeTab === 'BALANCES' ? '#ea580c' : '#64748b',
                fontWeight: activeTab === 'BALANCES' ? 800 : 600,
                fontSize: '0.95rem',
                textTransform: 'none',
                '&:hover': { bgcolor: 'transparent', color: '#ea580c' },
              }}
            >
              Quỹ Phép & Thâm Niên Nhân Sự ({leaveBalances.length})
            </Button>
          </Stack>
        </Box>

        {activeTab === 'REQUESTS' ? (
          <>
            {/* Metric Cards */}
            <Grid container spacing={2.5}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Paper
                  elevation={0}
                  onClick={() => setStatusFilter('ALL')}
                  sx={{
                    p: 2.5,
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: statusFilter === 'ALL' ? '#2563eb' : '#e2e8f0',
                    bgcolor: '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    '&:hover': { borderColor: '#2563eb' },
                  }}
                >
                  <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>Tổng số đơn gửi</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 900, color: '#0f172a', fontFamily: 'var(--font-mono)', mt: 0.5 }}>
                    {totalLeaves}
                  </Typography>
                </Paper>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Paper
                  elevation={0}
                  onClick={() => setStatusFilter('PENDING')}
                  sx={{
                    p: 2.5,
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: statusFilter === 'PENDING' ? '#d97706' : '#e2e8f0',
                    bgcolor: '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    '&:hover': { borderColor: '#d97706' },
                  }}
                >
                  <Typography variant="caption" sx={{ color: '#d97706', fontWeight: 700 }}>Đơn chờ duyệt</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 900, color: '#d97706', fontFamily: 'var(--font-mono)', mt: 0.5 }}>
                    {pendingLeaves}
                  </Typography>
                </Paper>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Paper
                  elevation={0}
                  onClick={() => setStatusFilter('APPROVED')}
                  sx={{
                    p: 2.5,
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: statusFilter === 'APPROVED' ? '#16a34a' : '#e2e8f0',
                    bgcolor: '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    '&:hover': { borderColor: '#16a34a' },
                  }}
                >
                  <Typography variant="caption" sx={{ color: '#16a34a', fontWeight: 700 }}>Đã phê duyệt</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 900, color: '#16a34a', fontFamily: 'var(--font-mono)', mt: 0.5 }}>
                    {approvedLeaves}
                  </Typography>
                </Paper>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Paper
                  elevation={0}
                  onClick={() => setStatusFilter('REJECTED')}
                  sx={{
                    p: 2.5,
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: statusFilter === 'REJECTED' ? '#dc2626' : '#e2e8f0',
                    bgcolor: '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    '&:hover': { borderColor: '#dc2626' },
                  }}
                >
                  <Typography variant="caption" sx={{ color: '#dc2626', fontWeight: 700 }}>Đã từ chối</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 900, color: '#dc2626', fontFamily: 'var(--font-mono)', mt: 0.5 }}>
                    {rejectedLeaves}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>

            {/* Leave Requests Table */}
            <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid #e2e8f0', overflow: 'hidden', bgcolor: '#ffffff' }}>
              <TableContainer sx={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                <Table size="medium" sx={{ minWidth: 720 }}>
                  <TableHead sx={{ bgcolor: '#f8fafc' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8125rem' }}>Nhân sự làm đơn</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8125rem' }}>Thời gian nghỉ</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8125rem' }}>Số ngày</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8125rem' }}>Lý do nghỉ</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8125rem' }}>Trạng thái</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8125rem' }} align="right">Hành động</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loading ? (
                      <TableRow><TableCell colSpan={6} align="center" sx={{ py: 6 }}><CircularProgress size={28} /></TableCell></TableRow>
                    ) : filteredLeaves.length === 0 ? (
                      <TableRow><TableCell colSpan={6} align="center" sx={{ py: 6, color: '#64748b' }}>Không có đơn nghỉ phép nào phù hợp.</TableCell></TableRow>
                    ) : (
                      filteredLeaves.map((l) => (
                        <TableRow key={l.id} hover sx={{ '&:last-child td': { borderBottom: 0 } }}>
                          <TableCell sx={{ fontWeight: 800, color: '#0f172a' }}>
                            {l.employeeName || l.employee_name || `#${l.employee}`}
                          </TableCell>
                          <TableCell sx={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', color: '#1e293b' }}>
                            {l.startDate || l.start_date} → {l.endDate || l.end_date}
                          </TableCell>
                          <TableCell sx={{ fontWeight: 800, color: '#2563eb', fontFamily: 'var(--font-mono)' }}>
                            {l.totalDays ?? l.total_days} ngày
                          </TableCell>
                          <TableCell sx={{ color: '#475569', fontSize: '0.825rem', maxWidth: 220 }}>
                            {l.reason || 'Nghỉ phép cá nhân'}
                          </TableCell>
                          <TableCell>{renderStatusChip(l.status)}</TableCell>
                          <TableCell align="right">
                            <Stack direction="row" spacing={0.75} justifyContent="flex-end" alignItems="center">
                              {l.status === 'PENDING' && (
                                <>
                                  <Button
                                    size="small"
                                    variant="contained"
                                    disabled={approveLeave.isPending}
                                    startIcon={<CheckIcon sx={{ fontSize: 15 }} />}
                                    onClick={() => approveLeave.mutate(l.id)}
                                    sx={{
                                      borderRadius: 1.75,
                                      textTransform: 'none',
                                      fontWeight: 800,
                                      fontSize: '0.775rem',
                                      bgcolor: '#16a34a',
                                      boxShadow: 'none',
                                      '&:hover': { bgcolor: '#15803d' },
                                    }}
                                  >
                                    Duyệt
                                  </Button>
                                  <Button
                                    size="small"
                                    variant="outlined"
                                    disabled={rejectLeave.isPending}
                                    startIcon={<CloseIcon sx={{ fontSize: 15 }} />}
                                    onClick={() => {
                                      setRejectDialogId(l.id);
                                      setRejectReason('');
                                    }}
                                    sx={{
                                      borderRadius: 1.75,
                                      textTransform: 'none',
                                      fontWeight: 700,
                                      fontSize: '0.775rem',
                                      color: '#dc2626',
                                      borderColor: '#fca5a5',
                                      '&:hover': { bgcolor: '#fef2f2', borderColor: '#ef4444' },
                                    }}
                                  >
                                    Từ chối
                                  </Button>
                                </>
                              )}
                              <Tooltip title="Hủy / Xóa đơn nghỉ phép">
                                <IconButton aria-label="Thao tác"
                                  size="small"
                                  onClick={() => setDeletingLeaveId(l.id)}
                                  sx={{ color: '#64748b', '&:hover': { color: '#dc2626' } }}
                                >
                                  <DeleteOutlineOutlinedIcon sx={{ fontSize: 17 }} />
                                </IconButton>
                              </Tooltip>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </>
        ) : (
          <>
            {/* Quota / Balance Management Tab */}
            <Card sx={{ p: 2, borderRadius: 3, border: '1px solid #e2e8f0', bgcolor: '#ffffff' }}>
              <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between" flexWrap="wrap">
                <Stack direction="row" spacing={2} alignItems="center">
                  <TextField
                    select
                    label="Năm tính phép"
                    size="small"
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    sx={{ minWidth: 140, ...inputSx }}
                  >
                    {[2024, 2025, 2026, 2027].map((y) => (
                      <MenuItem key={y} value={y}>Năm {y}</MenuItem>
                    ))}
                  </TextField>
                  <Typography variant="body2" sx={{ color: '#64748b' }}>
                    Luật LĐ: 12 ngày phép/năm + 1 ngày cho mỗi 5 năm thâm niên
                  </Typography>
                </Stack>

                <Button
                  variant="contained"
                  startIcon={<AutoFixHighOutlinedIcon />}
                  onClick={handleAutoAllocate}
                  disabled={autoAllocateLeaveBalances.isPending}
                  sx={{
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 700,
                    bgcolor: '#2563eb',
                    '&:hover': { bgcolor: '#1d4ed8' },
                  }}
                >
                  {autoAllocateLeaveBalances.isPending ? 'Đang cấp phát...' : `Cấp phát Quỹ Phép Năm ${selectedYear}`}
                </Button>
              </Stack>
            </Card>

            {/* Leave Balances Table */}
            <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid #e2e8f0', overflow: 'hidden', bgcolor: '#ffffff' }}>
              <TableContainer sx={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                <Table size="medium" sx={{ minWidth: 860 }}>
                  <TableHead sx={{ bgcolor: '#f8fafc' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8125rem' }}>Mã NV</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8125rem' }}>Nhân sự</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8125rem' }}>Loại phép</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8125rem' }} align="center">Phép tiêu chuẩn</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8125rem' }} align="center">Phép thâm niên</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8125rem' }} align="center">Tồn năm trước</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8125rem' }} align="center">Đã sử dụng</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8125rem' }} align="center">Chờ duyệt</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8125rem' }} align="center">Tổng được hưởng</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8125rem' }} align="center">Số ngày còn lại</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {balancesLoading ? (
                      <TableRow><TableCell colSpan={10} align="center" sx={{ py: 6 }}><CircularProgress size={28} /></TableCell></TableRow>
                    ) : leaveBalances.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={10} align="center" sx={{ py: 6, color: '#64748b' }}>
                          Chưa có dữ liệu quỹ phép năm {selectedYear}. Hãy bấm "Cấp phát Quỹ Phép Năm {selectedYear}" ở trên.
                        </TableCell>
                      </TableRow>
                    ) : (
                      leaveBalances.map((bal: any) => (
                        <TableRow key={bal.id} hover sx={{ '&:last-child td': { borderBottom: 0 } }}>
                          <TableCell sx={{ fontWeight: 700, color: '#2563eb', fontFamily: 'var(--font-mono)' }}>
                            {bal.employeeCode || bal.employee_code || '-'}
                          </TableCell>
                          <TableCell sx={{ fontWeight: 800, color: '#0f172a' }}>
                            {bal.employeeName || bal.employee_name || `#${bal.employee}`}
                          </TableCell>
                          <TableCell sx={{ color: '#475569' }}>
                            {bal.leaveTypeName || bal.leave_type_name || 'Phép năm'}
                          </TableCell>
                          <TableCell align="center" sx={{ fontFamily: 'var(--font-mono)' }}>
                            {bal.allocatedDays ?? bal.allocated_days}
                          </TableCell>
                          <TableCell align="center" sx={{ fontFamily: 'var(--font-mono)', color: '#16a34a', fontWeight: 700 }}>
                            +{bal.seniorityBonusDays ?? bal.seniority_bonus_days ?? 0}
                          </TableCell>
                          <TableCell align="center" sx={{ fontFamily: 'var(--font-mono)' }}>
                            {bal.carriedOverDays ?? bal.carried_over_days ?? 0}
                          </TableCell>
                          <TableCell align="center" sx={{ fontFamily: 'var(--font-mono)', color: '#dc2626', fontWeight: 600 }}>
                            {bal.usedDays ?? bal.used_days}
                          </TableCell>
                          <TableCell align="center" sx={{ fontFamily: 'var(--font-mono)', color: '#d97706' }}>
                            {bal.pendingDays ?? bal.pending_days}
                          </TableCell>
                          <TableCell align="center" sx={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                            {bal.totalAllowedDays ?? bal.total_allowed_days}
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={`${bal.remainingDays ?? bal.remaining_days} ngày`}
                              size="small"
                              sx={{
                                fontWeight: 900,
                                bgcolor: (bal.remainingDays ?? bal.remaining_days) > 0 ? '#f0fdf4' : '#fef2f2',
                                color: (bal.remainingDays ?? bal.remaining_days) > 0 ? '#16a34a' : '#dc2626',
                                borderRadius: 1.5,
                              }}
                            />
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </>
        )}
      </Stack>

      {/* Create Leave Request Dialog */}
      <Dialog
        open={openCreateModal}
        onClose={() => setOpenCreateModal(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 900, color: '#0f172a', borderBottom: '1px solid #e2e8f0', p: 2.5 }}>
          Tạo Đơn Xin Nghỉ Phép Mới
        </DialogTitle>
        <DialogContent sx={{ p: 2.5, pt: '20px !important' }}>
          <Stack spacing={2}>
            <TextField
              select
              label="Nhân viên làm đơn"
              value={createForm.employee}
              onChange={(e) => setCreateForm({ ...createForm, employee: e.target.value })}
              fullWidth
              sx={inputSx}
            >
              {employees.map((emp) => (
                <MenuItem key={emp.id} value={emp.id}>{emp.fullName || emp.full_name} ({emp.employeeCode || emp.employee_code})</MenuItem>
              ))}
            </TextField>

            <Grid container spacing={2}>
              <Grid size={6}>
                <TextField
                  type="date"
                  label="Từ ngày"
                  slotProps={{ inputLabel: { shrink: true } }}
                  value={createForm.start_date}
                  onChange={(e) => setCreateForm({ ...createForm, start_date: e.target.value })}
                  fullWidth
                  sx={inputSx}
                />
              </Grid>
              <Grid size={6}>
                <TextField
                  type="date"
                  label="Đến ngày"
                  slotProps={{ inputLabel: { shrink: true } }}
                  value={createForm.end_date}
                  onChange={(e) => setCreateForm({ ...createForm, end_date: e.target.value })}
                  fullWidth
                  sx={inputSx}
                />
              </Grid>
            </Grid>

            <TextField
              label="Tổng số ngày nghỉ"
              type="number"
              value={createForm.total_days}
              onChange={(e) => setCreateForm({ ...createForm, total_days: Number(e.target.value) })}
              fullWidth
              sx={inputSx}
            />

            <TextField
              label="Lý do nghỉ phép"
              placeholder="VD: Nghỉ phép năm, việc gia đình, khám sức khỏe..."
              value={createForm.reason}
              onChange={(e) => setCreateForm({ ...createForm, reason: e.target.value })}
              fullWidth
              multiline
              minRows={2}
              sx={inputSx}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, borderTop: '1px solid #e2e8f0' }}>
          <Button onClick={() => setOpenCreateModal(false)} sx={{ fontWeight: 700, color: '#64748b', textTransform: 'none' }}>
            Hủy
          </Button>
          <Button
            variant="contained"
            disabled={!createForm.employee || !createForm.start_date || createLeaveRequest.isPending}
            onClick={handleCreateSubmit}
            sx={{ fontWeight: 800, borderRadius: 2, textTransform: 'none', bgcolor: '#ea580c', '&:hover': { bgcolor: '#c2410c' } }}
          >
            {createLeaveRequest.isPending ? 'Đang gửi...' : 'Gửi đơn nghỉ phép'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reject Leave Dialog */}
      <Dialog
        open={rejectDialogId !== null}
        onClose={() => setRejectDialogId(null)}
        fullWidth
        maxWidth="xs"
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 900, color: '#0f172a', borderBottom: '1px solid #e2e8f0', p: 2.5 }}>
          Từ chối Đơn Nghỉ phép
        </DialogTitle>
        <DialogContent sx={{ p: 2.5, pt: '20px !important' }}>
          <TextField
            label="Lý do từ chối"
            placeholder="Nhập lý do phản hồi cho nhân viên..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            fullWidth
            multiline
            minRows={3}
            sx={inputSx}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2.5, borderTop: '1px solid #e2e8f0' }}>
          <Button onClick={() => setRejectDialogId(null)} sx={{ fontWeight: 700, color: '#64748b', textTransform: 'none' }}>
            Hủy
          </Button>
          <Button
            variant="contained"
            disabled={rejectLeave.isPending}
            onClick={handleConfirmReject}
            sx={{ fontWeight: 800, borderRadius: 2, textTransform: 'none', bgcolor: '#dc2626', '&:hover': { bgcolor: '#b91c1c' } }}
          >
            {rejectLeave.isPending ? 'Đang xử lý...' : 'Xác nhận Từ chối'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Leave Confirm Dialog */}
      <Dialog
        open={Boolean(deletingLeaveId)}
        onClose={() => setDeletingLeaveId(null)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 900, color: '#dc2626', p: 2.5 }}>
          Xác nhận Hủy Đơn Nghỉ phép
        </DialogTitle>
        <DialogContent sx={{ p: 2.5, pt: '0 !important' }}>
          <Typography variant="body2" sx={{ color: '#475569' }}>
            Bạn có chắc chắn muốn hủy / xóa đơn nghỉ phép này khỏi hệ thống?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, borderTop: '1px solid #e2e8f0' }}>
          <Button onClick={() => setDeletingLeaveId(null)} sx={{ fontWeight: 700, color: '#64748b', textTransform: 'none' }}>
            Hủy
          </Button>
          <Button
            variant="contained"
            disabled={deleteLeaveRequest.isPending}
            onClick={handleConfirmDelete}
            sx={{ fontWeight: 800, borderRadius: 2, textTransform: 'none', bgcolor: '#dc2626', '&:hover': { bgcolor: '#b91c1c' } }}
          >
            {deleteLeaveRequest.isPending ? 'Đang hủy...' : 'Hủy đơn'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
