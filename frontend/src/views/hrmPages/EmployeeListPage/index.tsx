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
  Avatar,
  Stack,
  Alert,
  Drawer,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import ContactPhoneIcon from '@mui/icons-material/ContactPhone';
import CloseIcon from '@mui/icons-material/Close';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import AccountBalanceOutlinedIcon from '@mui/icons-material/AccountBalanceOutlined';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';

import {
  useHrmEmployees,
  useHrmDepartments,
  useHrmDesignations,
  useHrmMutations,
} from '../hooks/useHrmQueries';
import hrmService, { NativeEmployee } from '@/services/hrmService';
import { TabTitle } from '@/utils/generalFunction';
import toastMessages from '@/utils/toastMessages';
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

export default function EmployeeListPage() {
  TabTitle('Danh sách & Hồ sơ Nhân viên | InfoHR HRM');

  const { data: employees = [], isLoading: loading, refetch } = useHrmEmployees();
  const { data: departments = [] } = useHrmDepartments();
  const { data: designations = [] } = useHrmDesignations();
  const { createEmployee, updateEmployee, deleteEmployee } = useHrmMutations();

  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState<number | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const [selectedEmp, setSelectedEmp] = useState<NativeEmployee | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [editingEmp, setEditingEmp] = useState<NativeEmployee | null>(null);
  const [deletingEmpId, setDeletingEmpId] = useState<number | null>(null);

  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    department: '',
    designation: '',
    status: 'PROBATION',
    employment_type: 'FULL_TIME',
    join_date: new Date().toISOString().split('T')[0],
    bank_name: '',
    bank_account_number: '',
    tax_id: '',
    social_insurance_id: '',
  });

  const [exporting, setExporting] = useState(false);

  const handleExportPayroll = async () => {
    try {
      setExporting(true);
      const blob = await hrmService.exportPayrollCsv();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `hrm_payroll_export_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toastMessages.success('Đã tải xuống bảng lương CSV thành công!');
    } catch (err) {
      toastMessages.error('Không thể xuất bảng lương.');
    } finally {
      setExporting(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingEmp(null);
    setForm({
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      department: '',
      designation: '',
      status: 'PROBATION',
      employment_type: 'FULL_TIME',
      join_date: new Date().toISOString().split('T')[0],
      bank_name: '',
      bank_account_number: '',
      tax_id: '',
      social_insurance_id: '',
    });
    setOpenModal(true);
  };

  const handleOpenEdit = (emp: NativeEmployee) => {
    setEditingEmp(emp);
    setForm({
      first_name: emp.first_name || '',
      last_name: emp.last_name || '',
      email: emp.email || '',
      phone: emp.phone || '',
      department: emp.department ? String(emp.department) : '',
      designation: emp.designation ? String(emp.designation) : '',
      status: emp.status || 'PROBATION',
      employment_type: emp.employment_type || 'FULL_TIME',
      join_date: emp.join_date || new Date().toISOString().split('T')[0],
      bank_name: emp.bank_name || '',
      bank_account_number: emp.bank_account_number || '',
      tax_id: emp.tax_id || '',
      social_insurance_id: emp.social_insurance_id || '',
    });
    setOpenModal(true);
  };

  const handleSave = async () => {
    if (!form.first_name || !form.last_name || !form.email) return;
    const payload = {
      ...form,
      department: form.department ? Number(form.department) : null,
      designation: form.designation ? Number(form.designation) : null,
    };

    if (editingEmp) {
      updateEmployee.mutate({ id: editingEmp.id, data: payload as any }, {
        onSuccess: () => {
          setOpenModal(false);
          if (selectedEmp && selectedEmp.id === editingEmp.id) {
            setSelectedEmp((prev) => prev ? { ...prev, ...payload } as any : null);
          }
        },
      });
    } else {
      createEmployee.mutate(payload as any, {
        onSuccess: () => setOpenModal(false),
      });
    }
  };

  const handleConfirmDelete = () => {
    if (!deletingEmpId) return;
    deleteEmployee.mutate(deletingEmpId, {
      onSuccess: () => {
        setDeletingEmpId(null);
        if (selectedEmp && selectedEmp.id === deletingEmpId) {
          setSelectedEmp(null);
        }
      },
    });
  };

  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      searchQuery === '' ||
      emp.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.employee_code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.phone?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDept = deptFilter === 'ALL' || emp.department === deptFilter;
    const matchesStatus = statusFilter === 'ALL' || emp.status === statusFilter;

    return matchesSearch && matchesDept && matchesStatus;
  });

  const renderStatusChip = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Chip label="Chính thức" size="small" sx={{ fontWeight: 800, fontSize: '0.725rem', bgcolor: '#f0fdf4', color: '#16a34a', borderRadius: 1.5 }} />;
      case 'PROBATION':
        return <Chip label="Thử việc" size="small" sx={{ fontWeight: 800, fontSize: '0.725rem', bgcolor: '#fffbeb', color: '#d97706', borderRadius: 1.5 }} />;
      case 'RESIGNED':
        return <Chip label="Đã nghỉ việc" size="small" sx={{ fontWeight: 800, fontSize: '0.725rem', bgcolor: '#f1f5f9', color: '#64748b', borderRadius: 1.5 }} />;
      case 'TERMINATED':
        return <Chip label="Đã chấm dứt" size="small" sx={{ fontWeight: 800, fontSize: '0.725rem', bgcolor: '#fef2f2', color: '#dc2626', borderRadius: 1.5 }} />;
      default:
        return <Chip label={status} size="small" sx={{ borderRadius: 1.5 }} />;
    }
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 1400, mx: 'auto', p: { xs: 2, sm: 3 } }}>
      <Stack spacing={3}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: '12px',
                bgcolor: '#eff6ff',
                color: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <BadgeOutlinedIcon sx={{ fontSize: 24 }} />
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 900, color: '#0f172a', fontSize: { xs: '1.25rem', md: '1.5rem' }, letterSpacing: '-0.02em' }}>
                Hồ sơ & Danh bạ Nhân viên
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500, fontSize: '0.875rem' }}>
                Quản lý sơ yếu lý lịch, hợp đồng và lịch sử công tác của toàn bộ nhân sự
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
              variant="outlined"
              size="small"
              disabled={exporting}
              startIcon={<DownloadOutlinedIcon sx={{ fontSize: 16 }} />}
              onClick={handleExportPayroll}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 700,
                color: '#16a34a',
                borderColor: '#bbf7d0',
                bgcolor: '#f0fdf4',
                '&:hover': { bgcolor: '#dcfce7', borderColor: '#86efac' },
              }}
            >
              {exporting ? 'Đang xuất...' : 'Xuất Bảng Lương (CSV)'}
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
                bgcolor: '#2563eb',
                boxShadow: '0 4px 12px 0 rgba(37, 99, 235, 0.2)',
                '&:hover': { bgcolor: '#1d4ed8' },
              }}
            >
              Tạo Hồ sơ Mới
            </Button>
          </Stack>
        </Box>

        {/* Filter Bar */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderRadius: 3,
            border: '1px solid #e2e8f0',
            bgcolor: '#ffffff',
          }}
        >
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, md: 5 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Tìm theo Tên, Mã NV (SQ-EMP-xxx), Email, SĐT..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                slotProps={{
                  input: {
                    startAdornment: <SearchIcon sx={{ color: '#94a3b8', mr: 1, fontSize: 20 }} />,
                  },
                }}
                sx={inputSx}
              />
            </Grid>
            <Grid size={{ xs: 6, md: 3.5 }}>
              <TextField
                select
                fullWidth
                size="small"
                label="Phòng ban"
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value as any)}
                sx={inputSx}
              >
                <MenuItem value="ALL">Tất cả Phòng ban</MenuItem>
                {departments.map((d) => (
                  <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 6, md: 3.5 }}>
              <TextField
                select
                fullWidth
                size="small"
                label="Trạng thái làm việc"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                sx={inputSx}
              >
                <MenuItem value="ALL">Tất cả Trạng thái</MenuItem>
                <MenuItem value="ACTIVE">Chính thức (Active)</MenuItem>
                <MenuItem value="PROBATION">Thử việc (Probation)</MenuItem>
                <MenuItem value="RESIGNED">Đã nghỉ việc</MenuItem>
                <MenuItem value="TERMINATED">Đã chấm dứt</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </Paper>

        {/* Employee Table */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: 3,
            border: '1px solid #e2e8f0',
            overflow: 'hidden',
            bgcolor: '#ffffff',
          }}
        >
          <TableContainer>
            <Table size="medium">
              <TableHead sx={{ bgcolor: '#f8fafc' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8125rem' }}>Mã & Họ tên</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8125rem' }}>Phòng ban & Chức danh</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8125rem' }}>Liên hệ</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8125rem' }}>Ngày vào làm</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8125rem' }}>Trạng thái</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8125rem' }} align="right">Hành động</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                      <CircularProgress size={28} />
                    </TableCell>
                  </TableRow>
                ) : filteredEmployees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 6, color: '#64748b' }}>
                      Không tìm thấy nhân viên nào phù hợp.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEmployees.map((emp) => (
                    <TableRow key={emp.id} hover sx={{ '&:last-child td': { borderBottom: 0 } }}>
                      <TableCell>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <Avatar
                            src={emp.avatar}
                            sx={{ width: 38, height: 38, bgcolor: '#eff6ff', color: '#2563eb', fontWeight: 800, fontSize: '0.875rem' }}
                          >
                            {emp.full_name?.charAt(0)?.toUpperCase() || 'E'}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a' }}>
                              {emp.full_name}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#64748b', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                              {emp.employee_code}
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#1e293b' }}>
                          {emp.designation_title || 'Chưa gán vị trí'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748b' }}>
                          {emp.department_name || 'Chưa phân phòng'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontSize: '0.8125rem', color: '#1e293b' }}>
                          {emp.email}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748b', fontFamily: 'var(--font-mono)' }}>
                          {emp.phone || '---'}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', color: '#475569' }}>
                        {emp.join_date || '---'}
                      </TableCell>
                      <TableCell>{renderStatusChip(emp.status)}</TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                          <Tooltip title="Xem chi tiết hồ sơ">
                            <IconButton aria-label="Thao tác"
                              size="small"
                              onClick={() => setSelectedEmp(emp)}
                              sx={{ color: '#64748b', '&:hover': { color: '#2563eb' } }}
                            >
                              <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Chỉnh sửa hồ sơ">
                            <IconButton aria-label="Thao tác"
                              size="small"
                              onClick={() => handleOpenEdit(emp)}
                              sx={{ color: '#64748b', '&:hover': { color: '#7c3aed' } }}
                            >
                              <EditOutlinedIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Xóa nhân sự">
                            <IconButton aria-label="Thao tác"
                              size="small"
                              onClick={() => setDeletingEmpId(emp.id)}
                              sx={{ color: '#64748b', '&:hover': { color: '#dc2626' } }}
                            >
                              <DeleteOutlineOutlinedIcon sx={{ fontSize: 18 }} />
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
      </Stack>

      {/* Employee Detail Drawer */}
      <Drawer
        anchor="right"
        open={Boolean(selectedEmp)}
        onClose={() => setSelectedEmp(null)}
        PaperProps={{ sx: { width: { xs: '100%', sm: 480 }, p: 3 } }}
      >
        {selectedEmp && (
          <Stack spacing={3}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 900, color: '#0f172a' }}>
                Hồ sơ Nhân viên
              </Typography>
              <IconButton aria-label="Thao tác" size="small" onClick={() => setSelectedEmp(null)} sx={{ color: '#64748b' }}>
                <CloseIcon />
              </IconButton>
            </Box>

            <Paper elevation={0} sx={{ p: 2.5, borderRadius: 2.5, bgcolor: '#f8fafc', border: '1px solid #e2e8f0', textAlign: 'center' }}>
              <Avatar
                src={selectedEmp.avatar}
                sx={{ width: 64, height: 64, mx: 'auto', mb: 1.5, bgcolor: '#eff6ff', color: '#2563eb', fontWeight: 800, fontSize: '1.5rem' }}
              >
                {selectedEmp.full_name?.charAt(0)?.toUpperCase()}
              </Avatar>
              <Typography variant="h6" sx={{ fontWeight: 900, color: '#0f172a' }}>
                {selectedEmp.full_name}
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                {selectedEmp.employee_code}
              </Typography>
              <Box sx={{ mt: 1 }}>{renderStatusChip(selectedEmp.status)}</Box>

              <Stack direction="row" spacing={1} justifyContent="center" sx={{ mt: 2 }}>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<EditOutlinedIcon sx={{ fontSize: 15 }} />}
                  onClick={() => handleOpenEdit(selectedEmp)}
                  sx={{ borderRadius: 1.75, textTransform: 'none', fontWeight: 700, fontSize: '0.775rem' }}
                >
                  Sửa thông tin
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteOutlineOutlinedIcon sx={{ fontSize: 15 }} />}
                  onClick={() => setDeletingEmpId(selectedEmp.id)}
                  sx={{ borderRadius: 1.75, textTransform: 'none', fontWeight: 700, fontSize: '0.775rem' }}
                >
                  Xóa nhân sự
                </Button>
              </Stack>
            </Paper>

            <Stack spacing={2}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 1 }}>
                <WorkOutlineIcon sx={{ fontSize: 18, color: '#2563eb' }} /> Thông tin Công tác
              </Typography>
              <Box sx={{ bgcolor: '#f8fafc', p: 2, borderRadius: 2, border: '1px solid #f1f5f9' }}>
                <Grid container spacing={1.5}>
                  <Grid size={6}>
                    <Typography variant="caption" sx={{ color: '#64748b' }}>Phòng ban</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{selectedEmp.department_name || 'Chưa gán'}</Typography>
                  </Grid>
                  <Grid size={6}>
                    <Typography variant="caption" sx={{ color: '#64748b' }}>Chức danh</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{selectedEmp.designation_title || 'Chưa gán'}</Typography>
                  </Grid>
                  <Grid size={6}>
                    <Typography variant="caption" sx={{ color: '#64748b' }}>Hình thức làm việc</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{selectedEmp.employment_type || 'FULL_TIME'}</Typography>
                  </Grid>
                  <Grid size={6}>
                    <Typography variant="caption" sx={{ color: '#64748b' }}>Ngày vào làm</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{selectedEmp.join_date || '---'}</Typography>
                  </Grid>
                </Grid>
              </Box>

              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                <ContactPhoneIcon sx={{ fontSize: 18, color: '#16a34a' }} /> Thông tin Liên hệ
              </Typography>
              <Box sx={{ bgcolor: '#f8fafc', p: 2, borderRadius: 2, border: '1px solid #f1f5f9' }}>
                <Typography variant="caption" sx={{ color: '#64748b' }}>Email</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, mb: 1 }}>{selectedEmp.email}</Typography>
                <Typography variant="caption" sx={{ color: '#64748b' }}>Số điện thoại</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{selectedEmp.phone || '---'}</Typography>
              </Box>

              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                <AccountBalanceOutlinedIcon sx={{ fontSize: 18, color: '#d97706' }} /> Thuế & Tài khoản Ngân hàng
              </Typography>
              <Box sx={{ bgcolor: '#f8fafc', p: 2, borderRadius: 2, border: '1px solid #f1f5f9' }}>
                <Grid container spacing={1.5}>
                  <Grid size={6}>
                    <Typography variant="caption" sx={{ color: '#64748b' }}>Mã số thuế</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{selectedEmp.tax_id || '---'}</Typography>
                  </Grid>
                  <Grid size={6}>
                    <Typography variant="caption" sx={{ color: '#64748b' }}>Mã số BHXH</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{selectedEmp.social_insurance_id || '---'}</Typography>
                  </Grid>
                  <Grid size={12}>
                    <Typography variant="caption" sx={{ color: '#64748b' }}>Tài khoản ngân hàng</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                      {selectedEmp.bank_account_number ? `${selectedEmp.bank_account_number} (${selectedEmp.bank_name || ''})` : '---'}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            </Stack>
          </Stack>
        )}
      </Drawer>

      {/* Create / Edit Employee Dialog */}
      <Dialog
        open={openModal}
        onClose={() => setOpenModal(false)}
        fullWidth
        maxWidth="md"
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 900, color: '#0f172a', borderBottom: '1px solid #e2e8f0', p: 2.5 }}>
          {editingEmp ? `Chỉnh sửa Hồ sơ: ${editingEmp.full_name}` : 'Tạo mới Hồ sơ Nhân sự'}
        </DialogTitle>
        <DialogContent sx={{ p: 2.5, pt: '20px !important' }}>
          <Stack spacing={2.5}>
            <Typography variant="caption" sx={{ fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
              1. Thông tin Định danh & Công tác
            </Typography>
            <Grid container spacing={2}>
              <Grid size={6}>
                <TextField
                  label="Họ đệm"
                  value={form.first_name}
                  onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                  fullWidth
                  sx={inputSx}
                />
              </Grid>
              <Grid size={6}>
                <TextField
                  label="Tên"
                  value={form.last_name}
                  onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                  fullWidth
                  sx={inputSx}
                />
              </Grid>
              <Grid size={6}>
                <TextField
                  label="Email liên hệ"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  fullWidth
                  sx={inputSx}
                />
              </Grid>
              <Grid size={6}>
                <TextField
                  label="Số điện thoại"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  fullWidth
                  sx={inputSx}
                />
              </Grid>
              <Grid size={6}>
                <TextField
                  select
                  label="Phòng ban"
                  value={form.department}
                  onChange={(e) => setForm({ ...form, department: e.target.value })}
                  fullWidth
                  sx={inputSx}
                >
                  <MenuItem value="">-- Chưa gán phòng ban --</MenuItem>
                  {departments.map((d) => (
                    <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={6}>
                <TextField
                  select
                  label="Chức danh"
                  value={form.designation}
                  onChange={(e) => setForm({ ...form, designation: e.target.value })}
                  fullWidth
                  sx={inputSx}
                >
                  <MenuItem value="">-- Chưa gán chức danh --</MenuItem>
                  {designations.map((d) => (
                    <MenuItem key={d.id} value={d.id}>{d.title}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={4}>
                <TextField
                  select
                  label="Trạng thái"
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as any })}
                  fullWidth
                  sx={inputSx}
                >
                  <MenuItem value="ACTIVE">Chính thức (Active)</MenuItem>
                  <MenuItem value="PROBATION">Thử việc (Probation)</MenuItem>
                  <MenuItem value="RESIGNED">Đã nghỉ việc</MenuItem>
                  <MenuItem value="TERMINATED">Đã chấm dứt</MenuItem>
                </TextField>
              </Grid>
              <Grid size={4}>
                <TextField
                  select
                  label="Hình thức làm việc"
                  value={form.employment_type}
                  onChange={(e) => setForm({ ...form, employment_type: e.target.value as any })}
                  fullWidth
                  sx={inputSx}
                >
                  <MenuItem value="FULL_TIME">Toàn thời gian</MenuItem>
                  <MenuItem value="PART_TIME">Bán thời gian</MenuItem>
                  <MenuItem value="CONTRACT">Hợp đồng khoán</MenuItem>
                  <MenuItem value="INTERN">Thực tập sinh</MenuItem>
                </TextField>
              </Grid>
              <Grid size={4}>
                <TextField
                  type="date"
                  label="Ngày vào làm"
                  slotProps={{ inputLabel: { shrink: true } }}
                  value={form.join_date}
                  onChange={(e) => setForm({ ...form, join_date: e.target.value })}
                  fullWidth
                  sx={inputSx}
                />
              </Grid>
            </Grid>

            <Typography variant="caption" sx={{ fontWeight: 800, color: '#64748b', textTransform: 'uppercase', mt: 1 }}>
              2. Tài khoản Ngân hàng & Thuế
            </Typography>
            <Grid container spacing={2}>
              <Grid size={6}>
                <TextField
                  label="Tên Ngân hàng"
                  placeholder="VD: Vietcombank, Techcombank..."
                  value={form.bank_name}
                  onChange={(e) => setForm({ ...form, bank_name: e.target.value })}
                  fullWidth
                  sx={inputSx}
                />
              </Grid>
              <Grid size={6}>
                <TextField
                  label="Số Tài khoản Ngân hàng"
                  value={form.bank_account_number}
                  onChange={(e) => setForm({ ...form, bank_account_number: e.target.value })}
                  fullWidth
                  sx={inputSx}
                />
              </Grid>
              <Grid size={6}>
                <TextField
                  label="Mã số Thuế cá nhân"
                  value={form.tax_id}
                  onChange={(e) => setForm({ ...form, tax_id: e.target.value })}
                  fullWidth
                  sx={inputSx}
                />
              </Grid>
              <Grid size={6}>
                <TextField
                  label="Mã số Bảo hiểm Xã hội (BHXH)"
                  value={form.social_insurance_id}
                  onChange={(e) => setForm({ ...form, social_insurance_id: e.target.value })}
                  fullWidth
                  sx={inputSx}
                />
              </Grid>
            </Grid>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, borderTop: '1px solid #e2e8f0' }}>
          <Button onClick={() => setOpenModal(false)} sx={{ fontWeight: 700, color: '#64748b', textTransform: 'none' }}>
            Hủy
          </Button>
          <Button
            variant="contained"
            disabled={!form.first_name || !form.last_name || !form.email || createEmployee.isPending || updateEmployee.isPending}
            onClick={handleSave}
            sx={{ fontWeight: 800, borderRadius: 2, textTransform: 'none', bgcolor: '#2563eb' }}
          >
            {editingEmp ? (updateEmployee.isPending ? 'Đang lưu...' : 'Lưu cập nhật') : (createEmployee.isPending ? 'Đang tạo...' : 'Tạo hồ sơ')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Employee Confirm Dialog */}
      <Dialog
        open={Boolean(deletingEmpId)}
        onClose={() => setDeletingEmpId(null)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 900, color: '#dc2626', p: 2.5 }}>
          Xác nhận Xóa Hồ sơ Nhân viên
        </DialogTitle>
        <DialogContent sx={{ p: 2.5, pt: '0 !important' }}>
          <Typography variant="body2" sx={{ color: '#475569' }}>
            Bạn có chắc chắn muốn xóa hồ sơ nhân sự này? Các hợp đồng và lịch sử công tác liên quan cũng sẽ bị xóa.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, borderTop: '1px solid #e2e8f0' }}>
          <Button onClick={() => setDeletingEmpId(null)} sx={{ fontWeight: 700, color: '#64748b', textTransform: 'none' }}>
            Hủy
          </Button>
          <Button
            variant="contained"
            disabled={deleteEmployee.isPending}
            onClick={handleConfirmDelete}
            sx={{ fontWeight: 800, borderRadius: 2, textTransform: 'none', bgcolor: '#dc2626', '&:hover': { bgcolor: '#b91c1c' } }}
          >
            {deleteEmployee.isPending ? 'Đang xóa...' : 'Xóa hồ sơ'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
