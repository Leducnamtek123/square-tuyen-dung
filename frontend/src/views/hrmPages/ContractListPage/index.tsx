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
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import RefreshIcon from '@mui/icons-material/Refresh';
import AddIcon from '@mui/icons-material/Add';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import dayjs from 'dayjs';

import { useHrmContracts, useHrmEmployees, useHrmMutations } from '../hooks/useHrmQueries';
import { NativeContract } from '@/services/hrmService';
import { TabTitle } from '@/utils/generalFunction';
import pc from '@/utils/muiColors';

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

export default function ContractListPage() {
  TabTitle('Hợp đồng Lao động & Cấu trúc Lương | InfoHR HRM');

  const { data: contracts = [], isLoading: loading, refetch } = useHrmContracts();
  const { data: employees = [] } = useHrmEmployees();
  const { createContract, updateContract, deleteContract, renewContract } = useHrmMutations();

  const [openModal, setOpenModal] = useState(false);
  const [editingContract, setEditingContract] = useState<NativeContract | null>(null);
  const [deletingContractId, setDeletingContractId] = useState<number | null>(null);
  const [renewingContract, setRenewingContract] = useState<NativeContract | null>(null);

  const [renewForm, setRenewForm] = useState({
    contract_number: '',
    contract_type: 'FIXED_TERM' as 'PROBATION' | 'FIXED_TERM' | 'INDEFINITE',
    start_date: new Date().toISOString().split('T')[0],
    end_date: dayjs().add(1, 'year').format('YYYY-MM-DD'),
    base_salary: 15000000,
    allowance: 0,
    notes: '',
  });

  const [form, setForm] = useState({
    employee: '',
    contract_number: '',
    contract_type: 'FIXED_TERM' as 'PROBATION' | 'FIXED_TERM' | 'INDEFINITE',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    base_salary: 15000000,
    allowance: 0,
    status: 'ACTIVE' as 'ACTIVE' | 'EXPIRED' | 'TERMINATED',
    notes: '',
  });

  const totalContracts = contracts.length;
  const activeContracts = contracts.filter((c) => c.status === 'ACTIVE').length;
  const probationContracts = contracts.filter((c) => c.contract_type === 'PROBATION').length;
  
  const expiringSoonCount = contracts.filter((c) => {
    if (!c.end_date || c.status !== 'ACTIVE') return false;
    const diff = dayjs(c.end_date).diff(dayjs(), 'day');
    return diff >= 0 && diff <= 30;
  }).length;

  const handleOpenCreate = () => {
    setEditingContract(null);
    setForm({
      employee: employees.length > 0 ? String(employees[0].id) : '',
      contract_number: `HD-${dayjs().format('YYYYMMDD')}-${Math.floor(100 + Math.random() * 900)}`,
      contract_type: 'FIXED_TERM',
      start_date: new Date().toISOString().split('T')[0],
      end_date: dayjs().add(1, 'year').format('YYYY-MM-DD'),
      base_salary: 15000000,
      allowance: 0,
      status: 'ACTIVE',
      notes: '',
    });
    setOpenModal(true);
  };

  const handleOpenEdit = (c: NativeContract) => {
    setEditingContract(c);
    setForm({
      employee: String(c.employee),
      contract_number: c.contract_number,
      contract_type: c.contract_type || 'FIXED_TERM',
      start_date: c.start_date || new Date().toISOString().split('T')[0],
      end_date: c.end_date || '',
      base_salary: Number(c.base_salary || 0),
      allowance: Number(c.allowance || 0),
      status: c.status || 'ACTIVE',
      notes: c.notes || '',
    });
    setOpenModal(true);
  };

  const handleSave = async () => {
    if (!form.employee || !form.contract_number || !form.start_date) return;
    const payload = {
      employee: Number(form.employee),
      contract_number: form.contract_number,
      contract_type: form.contract_type,
      start_date: form.start_date,
      end_date: form.end_date || undefined,
      base_salary: Number(form.base_salary),
      allowance: Number(form.allowance),
      status: form.status,
      notes: form.notes || undefined,
    };

    if (editingContract) {
      updateContract.mutate({ id: editingContract.id, data: payload as any }, {
        onSuccess: () => setOpenModal(false),
      });
    } else {
      createContract.mutate(payload as any, {
        onSuccess: () => setOpenModal(false),
      });
    }
  };

  const handleConfirmDelete = () => {
    if (!deletingContractId) return;
    deleteContract.mutate(deletingContractId, {
      onSuccess: () => setDeletingContractId(null),
    });
  };

  const handleOpenRenew = (c: NativeContract) => {
    setRenewingContract(c);
    const startDate = c.end_date ? dayjs(c.end_date).add(1, 'day').format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD');
    const endDate = dayjs(startDate).add(1, 'year').format('YYYY-MM-DD');
    setRenewForm({
      contract_number: `HD-${dayjs().format('YYYYMMDD')}-${Math.floor(100 + Math.random() * 900)}`,
      contract_type: c.contract_type === 'PROBATION' ? 'FIXED_TERM' : c.contract_type,
      start_date: startDate,
      end_date: endDate,
      base_salary: Number(c.base_salary || 0),
      allowance: Number(c.allowance || 0),
      notes: `Gia hạn từ hợp đồng ${c.contract_number}`,
    });
  };

  const handleConfirmRenew = () => {
    if (!renewingContract) return;
    renewContract.mutate(
      {
        id: renewingContract.id,
        data: {
          contract_number: renewForm.contract_number,
          contract_type: renewForm.contract_type,
          start_date: renewForm.start_date,
          end_date: renewForm.contract_type === 'INDEFINITE' ? null : renewForm.end_date,
          base_salary: Number(renewForm.base_salary),
          allowance: Number(renewForm.allowance),
          notes: renewForm.notes,
        },
      },
      {
        onSuccess: () => {
          setRenewingContract(null);
        },
      }
    );
  };

  const renderExpirationBadge = (endDateStr?: string) => {
    if (!endDateStr) {
      return <Typography variant="caption" sx={{ color: '#64748b' }}>Không thời hạn</Typography>;
    }
    const diff = dayjs(endDateStr).diff(dayjs(), 'day');
    if (diff < 0) {
      return <Chip label="Đã hết hạn" size="small" sx={{ fontWeight: 800, fontSize: '0.7rem', bgcolor: '#fef2f2', color: '#dc2626', borderRadius: 1.5 }} />;
    }
    if (diff <= 30) {
      return (
        <Chip
          icon={<WarningAmberIcon sx={{ fontSize: '14px !important', color: '#dc2626 !important' }} />}
          label={`Còn ${diff} ngày`}
          size="small"
          sx={{ fontWeight: 800, fontSize: '0.7rem', bgcolor: '#fee2e2', color: '#dc2626', borderRadius: 1.5 }}
        />
      );
    }
    if (diff <= 60) {
      return (
        <Chip
          label={`Còn ${diff} ngày`}
          size="small"
          sx={{ fontWeight: 800, fontSize: '0.7rem', bgcolor: '#fffbeb', color: '#d97706', borderRadius: 1.5 }}
        />
      );
    }
    return (
      <Typography variant="caption" sx={{ color: '#475569', fontFamily: 'var(--font-mono)' }}>
        {endDateStr}
      </Typography>
    );
  };

  const renderContractTypeChip = (type: string) => {
    switch (type) {
      case 'PROBATION':
        return <Chip label="Thử việc" size="small" sx={{ fontWeight: 800, fontSize: '0.725rem', bgcolor: '#fffbeb', color: '#d97706', borderRadius: 1.5 }} />;
      case 'FIXED_TERM':
        return <Chip label="Xác định thời hạn" size="small" sx={{ fontWeight: 800, fontSize: '0.725rem', bgcolor: '#eff6ff', color: '#2563eb', borderRadius: 1.5 }} />;
      case 'INDEFINITE':
        return <Chip label="Không xác định thời hạn" size="small" sx={{ fontWeight: 800, fontSize: '0.725rem', bgcolor: '#f0fdf4', color: '#16a34a', borderRadius: 1.5 }} />;
      default:
        return <Chip label={type} size="small" sx={{ borderRadius: 1.5 }} />;
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
                bgcolor: '#eff6ff',
                color: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <DescriptionOutlinedIcon sx={{ fontSize: 24 }} />
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 900, color: '#0f172a', fontSize: { xs: '1.25rem', md: '1.5rem' }, letterSpacing: '-0.02em' }}>
                Hợp đồng Lao động & Cấu trúc Lương
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500, fontSize: '0.875rem' }}>
                Theo dõi thời hạn hợp đồng thử việc / chính thức, mức lương cơ bản và cảnh báo hạn tái ký
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
                bgcolor: '#2563eb',
                boxShadow: '0 4px 12px 0 rgba(37, 99, 235, 0.2)',
                '&:hover': { bgcolor: '#1d4ed8' },
              }}
            >
              Tạo Hợp đồng Mới
            </Button>
          </Stack>
        </Box>

        {/* Metric Cards */}
        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: '1px solid #e2e8f0', bgcolor: '#ffffff' }}>
              <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>Tổng hợp đồng lưu trữ</Typography>
              <Typography variant="h4" sx={{ fontWeight: 900, color: '#0f172a', fontFamily: 'var(--font-mono)', mt: 0.5 }}>
                {totalContracts}
              </Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: '1px solid #e2e8f0', bgcolor: '#ffffff' }}>
              <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>Hợp đồng đang hiệu lực</Typography>
              <Typography variant="h4" sx={{ fontWeight: 900, color: '#16a34a', fontFamily: 'var(--font-mono)', mt: 0.5 }}>
                {activeContracts}
              </Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: '1px solid #e2e8f0', bgcolor: '#ffffff' }}>
              <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>Hợp đồng thử việc</Typography>
              <Typography variant="h4" sx={{ fontWeight: 900, color: '#d97706', fontFamily: 'var(--font-mono)', mt: 0.5 }}>
                {probationContracts}
              </Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: '1px solid', borderColor: expiringSoonCount > 0 ? '#fca5a5' : '#e2e8f0', bgcolor: expiringSoonCount > 0 ? '#fff5f5' : '#ffffff' }}>
              <Typography variant="caption" sx={{ color: expiringSoonCount > 0 ? '#dc2626' : '#64748b', fontWeight: 700 }}>
                Hết hạn trong 30 ngày
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 900, color: '#dc2626', fontFamily: 'var(--font-mono)', mt: 0.5 }}>
                {expiringSoonCount}
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Contract Table */}
        <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid #e2e8f0', overflow: 'hidden', bgcolor: '#ffffff' }}>
          <TableContainer sx={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <Table size="medium" sx={{ minWidth: 820 }}>
              <TableHead sx={{ bgcolor: '#f8fafc' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8125rem' }}>Số Hợp đồng</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8125rem' }}>Nhân sự thụ hưởng</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8125rem' }}>Loại Hợp đồng</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8125rem' }}>Lương cơ bản (VND)</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8125rem' }}>Ngày hiệu lực</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8125rem' }}>Thời hạn / Cảnh báo</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8125rem' }} align="right">Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={7} align="center" sx={{ py: 6 }}><CircularProgress size={28} /></TableCell></TableRow>
                ) : contracts.length === 0 ? (
                  <TableRow><TableCell colSpan={7} align="center" sx={{ py: 6, color: '#64748b' }}>Chưa có hợp đồng nào trong hệ thống.</TableCell></TableRow>
                ) : (
                  contracts.map((c) => (
                    <TableRow key={c.id} hover sx={{ '&:last-child td': { borderBottom: 0 } }}>
                      <TableCell>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#2563eb', fontFamily: 'var(--font-mono)' }}>
                          {c.contract_number}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#0f172a' }}>
                        {c.employee_name || `#${c.employee}`}
                      </TableCell>
                      <TableCell>{renderContractTypeChip(c.contract_type)}</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: '#16a34a', fontFamily: 'var(--font-mono)', fontSize: '0.875rem' }}>
                        {Number(c.base_salary || 0).toLocaleString()} ₫
                      </TableCell>
                      <TableCell sx={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', color: '#475569' }}>
                        {c.start_date}
                      </TableCell>
                      <TableCell>{renderExpirationBadge(c.end_date)}</TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                          <Tooltip title="Tái ký / Gia hạn hợp đồng">
                            <IconButton aria-label="Tái ký" size="small" onClick={() => handleOpenRenew(c)} sx={{ color: '#64748b', '&:hover': { color: '#16a34a' } }}>
                              <AutorenewIcon sx={{ fontSize: 17 }} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Chỉnh sửa hợp đồng">
                            <IconButton aria-label="Thao tác" size="small" onClick={() => handleOpenEdit(c)} sx={{ color: '#64748b', '&:hover': { color: '#2563eb' } }}>
                              <EditOutlinedIcon sx={{ fontSize: 17 }} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Xóa hợp đồng">
                            <IconButton aria-label="Thao tác" size="small" onClick={() => setDeletingContractId(c.id)} sx={{ color: '#64748b', '&:hover': { color: '#dc2626' } }}>
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
      </Stack>

      {/* Create / Edit Contract Dialog */}
      <Dialog
        open={openModal}
        onClose={() => setOpenModal(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 900, color: '#0f172a', borderBottom: '1px solid #e2e8f0', p: 2.5 }}>
          {editingContract ? 'Chỉnh sửa Hợp đồng Lao động' : 'Tạo mới Hợp đồng Lao động'}
        </DialogTitle>
        <DialogContent sx={{ p: 2.5, pt: '20px !important' }}>
          <Stack spacing={2}>
            <TextField
              select
              label="Nhân viên thụ hưởng"
              value={form.employee}
              onChange={(e) => setForm({ ...form, employee: e.target.value })}
              fullWidth
              sx={inputSx}
            >
              {employees.map((emp) => (
                <MenuItem key={emp.id} value={emp.id}>{emp.full_name} ({emp.employee_code})</MenuItem>
              ))}
            </TextField>

            <Grid container spacing={2}>
              <Grid size={6}>
                <TextField
                  label="Số Hợp đồng"
                  value={form.contract_number}
                  onChange={(e) => setForm({ ...form, contract_number: e.target.value })}
                  fullWidth
                  sx={inputSx}
                />
              </Grid>
              <Grid size={6}>
                <TextField
                  select
                  label="Loại Hợp đồng"
                  value={form.contract_type}
                  onChange={(e) => setForm({ ...form, contract_type: e.target.value as any })}
                  fullWidth
                  sx={inputSx}
                >
                  <MenuItem value="PROBATION">Thử việc (Probation)</MenuItem>
                  <MenuItem value="FIXED_TERM">Xác định thời hạn</MenuItem>
                  <MenuItem value="INDEFINITE">Không xác định thời hạn</MenuItem>
                </TextField>
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid size={6}>
                <TextField
                  label="Lương cơ bản (VND)"
                  type="number"
                  value={form.base_salary}
                  onChange={(e) => setForm({ ...form, base_salary: Number(e.target.value) })}
                  fullWidth
                  sx={inputSx}
                />
              </Grid>
              <Grid size={6}>
                <TextField
                  label="Phụ cấp (VND)"
                  type="number"
                  value={form.allowance}
                  onChange={(e) => setForm({ ...form, allowance: Number(e.target.value) })}
                  fullWidth
                  sx={inputSx}
                />
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid size={6}>
                <TextField
                  type="date"
                  label="Ngày hiệu lực"
                  slotProps={{ inputLabel: { shrink: true } }}
                  value={form.start_date}
                  onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                  fullWidth
                  sx={inputSx}
                />
              </Grid>
              <Grid size={6}>
                <TextField
                  type="date"
                  label="Ngày hết hạn"
                  slotProps={{ inputLabel: { shrink: true } }}
                  value={form.end_date}
                  onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                  fullWidth
                  sx={inputSx}
                />
              </Grid>
            </Grid>

            <TextField
              select
              label="Trạng thái Hợp đồng"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as any })}
              fullWidth
              sx={inputSx}
            >
              <MenuItem value="ACTIVE">Hiệu lực (Active)</MenuItem>
              <MenuItem value="EXPIRED">Đã hết hạn (Expired)</MenuItem>
              <MenuItem value="TERMINATED">Đã chấm dứt (Terminated)</MenuItem>
            </TextField>

            <TextField
              label="Ghi chú thêm"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              fullWidth
              multiline
              minRows={2}
              sx={inputSx}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, borderTop: '1px solid #e2e8f0' }}>
          <Button onClick={() => setOpenModal(false)} sx={{ fontWeight: 700, color: '#64748b', textTransform: 'none' }}>
            Hủy
          </Button>
          <Button
            variant="contained"
            disabled={!form.employee || !form.contract_number || createContract.isPending || updateContract.isPending}
            onClick={handleSave}
            sx={{ fontWeight: 800, borderRadius: 2, textTransform: 'none', bgcolor: '#2563eb' }}
          >
            {editingContract ? (updateContract.isPending ? 'Đang lưu...' : 'Lưu cập nhật') : (createContract.isPending ? 'Đang tạo...' : 'Tạo hợp đồng')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Renew Contract Dialog */}
      <Dialog
        open={Boolean(renewingContract)}
        onClose={() => setRenewingContract(null)}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 900, color: '#16a34a', borderBottom: '1px solid #e2e8f0', p: 2.5, display: 'flex', alignItems: 'center', gap: 1 }}>
          <AutorenewIcon sx={{ color: '#16a34a' }} /> Tái ký / Gia hạn Hợp đồng Lao động
        </DialogTitle>
        <DialogContent sx={{ p: 2.5, pt: '20px !important' }}>
          {renewingContract && (
            <Stack spacing={2}>
              <Box sx={{ p: 2, bgcolor: '#f0fdf4', borderRadius: 2, border: '1px solid #bbf7d0' }}>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#166534' }}>
                  Gia hạn cho nhân sự: {renewingContract.employee_name || `#${renewingContract.employee}`}
                </Typography>
                <Typography variant="caption" sx={{ color: '#15803d', display: 'block', mt: 0.5 }}>
                  Hợp đồng cũ ({renewingContract.contract_number}) sẽ được chuyển sang trạng thái <b>EXPIRED</b> và hợp đồng mới sẽ có hiệu lực.
                </Typography>
              </Box>

              <Grid container spacing={2}>
                <Grid size={6}>
                  <TextField
                    label="Số Hợp đồng Mới"
                    value={renewForm.contract_number}
                    onChange={(e) => setRenewForm({ ...renewForm, contract_number: e.target.value })}
                    fullWidth
                    sx={inputSx}
                  />
                </Grid>
                <Grid size={6}>
                  <TextField
                    select
                    label="Loại Hợp đồng Mới"
                    value={renewForm.contract_type}
                    onChange={(e) => setRenewForm({ ...renewForm, contract_type: e.target.value as any })}
                    fullWidth
                    sx={inputSx}
                  >
                    <MenuItem value="FIXED_TERM">Xác định thời hạn</MenuItem>
                    <MenuItem value="INDEFINITE">Không xác định thời hạn</MenuItem>
                    <MenuItem value="PROBATION">Thử việc</MenuItem>
                  </TextField>
                </Grid>
              </Grid>

              <Grid container spacing={2}>
                <Grid size={6}>
                  <TextField
                    label="Lương cơ bản Mới (VND)"
                    type="number"
                    value={renewForm.base_salary}
                    onChange={(e) => setRenewForm({ ...renewForm, base_salary: Number(e.target.value) })}
                    fullWidth
                    sx={inputSx}
                  />
                </Grid>
                <Grid size={6}>
                  <TextField
                    label="Phụ cấp Mới (VND)"
                    type="number"
                    value={renewForm.allowance}
                    onChange={(e) => setRenewForm({ ...renewForm, allowance: Number(e.target.value) })}
                    fullWidth
                    sx={inputSx}
                  />
                </Grid>
              </Grid>

              <Grid container spacing={2}>
                <Grid size={6}>
                  <TextField
                    type="date"
                    label="Ngày bắt đầu Mới"
                    slotProps={{ inputLabel: { shrink: true } }}
                    value={renewForm.start_date}
                    onChange={(e) => setRenewForm({ ...renewForm, start_date: e.target.value })}
                    fullWidth
                    sx={inputSx}
                  />
                </Grid>
                <Grid size={6}>
                  <TextField
                    type="date"
                    label="Ngày kết thúc Mới"
                    slotProps={{ inputLabel: { shrink: true } }}
                    value={renewForm.end_date}
                    disabled={renewForm.contract_type === 'INDEFINITE'}
                    onChange={(e) => setRenewForm({ ...renewForm, end_date: e.target.value })}
                    fullWidth
                    sx={inputSx}
                  />
                </Grid>
              </Grid>

              <TextField
                label="Ghi chú gia hạn"
                value={renewForm.notes}
                onChange={(e) => setRenewForm({ ...renewForm, notes: e.target.value })}
                fullWidth
                multiline
                minRows={2}
                sx={inputSx}
              />
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2.5, borderTop: '1px solid #e2e8f0' }}>
          <Button onClick={() => setRenewingContract(null)} sx={{ fontWeight: 700, color: '#64748b', textTransform: 'none' }}>
            Hủy
          </Button>
          <Button
            variant="contained"
            disabled={!renewForm.contract_number || !renewForm.start_date || renewContract.isPending}
            onClick={handleConfirmRenew}
            sx={{ fontWeight: 800, borderRadius: 2, textTransform: 'none', bgcolor: '#16a34a', '&:hover': { bgcolor: '#15803d' } }}
          >
            {renewContract.isPending ? 'Đang xử lý...' : 'Xác nhận Tái ký Hợp đồng'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Contract Confirm Dialog */}
      <Dialog
        open={Boolean(deletingContractId)}
        onClose={() => setDeletingContractId(null)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 900, color: '#dc2626', p: 2.5 }}>
          Xác nhận Xóa Hợp đồng
        </DialogTitle>
        <DialogContent sx={{ p: 2.5, pt: '0 !important' }}>
          <Typography variant="body2" sx={{ color: '#475569' }}>
            Bạn có chắc chắn muốn xóa hợp đồng lao động này? Dữ liệu sau khi xóa sẽ không thể phục hồi.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, borderTop: '1px solid #e2e8f0' }}>
          <Button onClick={() => setDeletingContractId(null)} sx={{ fontWeight: 700, color: '#64748b', textTransform: 'none' }}>
            Hủy
          </Button>
          <Button
            variant="contained"
            disabled={deleteContract.isPending}
            onClick={handleConfirmDelete}
            sx={{ fontWeight: 800, borderRadius: 2, textTransform: 'none', bgcolor: '#dc2626', '&:hover': { bgcolor: '#b91c1c' } }}
          >
            {deleteContract.isPending ? 'Đang xóa...' : 'Xóa hợp đồng'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
