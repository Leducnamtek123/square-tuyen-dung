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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Stack,
  IconButton,
  Tooltip,
  FormControlLabel,
  Switch,
  InputAdornment,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SearchIcon from '@mui/icons-material/Search';

import { useHrmWorkShifts, useHrmMutations } from '../../hooks/useHrmQueries';
import { NativeWorkShift } from '@/services/hrmService';
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

export default function ShiftListPage() {
  TabTitle('Danh sách ca làm việc | InfoHR HRM');

  const { data: shifts = [], isLoading, refetch } = useHrmWorkShifts();
  const { createWorkShift, updateWorkShift, deleteWorkShift } = useHrmMutations();

  const [searchTerm, setSearchTerm] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const [editingShift, setEditingShift] = useState<NativeWorkShift | null>(null);
  const [deletingShiftId, setDeletingShiftId] = useState<number | null>(null);

  const [form, setForm] = useState({
    code: '',
    name: '',
    start_time: '08:00:00',
    end_time: '17:30:00',
    break_start: '12:00:00',
    break_end: '13:30:00',
    working_hours: '8.00',
    work_factor: '1.00',
    grace_period_late_minutes: 15,
    grace_period_early_minutes: 15,
    is_overnight: false,
    is_active: true,
  });

  const handleOpenCreate = () => {
    setEditingShift(null);
    setForm({
      code: '',
      name: '',
      start_time: '08:00:00',
      end_time: '17:30:00',
      break_start: '12:00:00',
      break_end: '13:30:00',
      working_hours: '8.00',
      work_factor: '1.00',
      grace_period_late_minutes: 15,
      grace_period_early_minutes: 15,
      is_overnight: false,
      is_active: true,
    });
    setOpenModal(true);
  };

  const handleOpenEdit = (shift: NativeWorkShift) => {
    setEditingShift(shift);
    setForm({
      code: shift.code || '',
      name: shift.name || '',
      start_time: shift.start_time ? shift.start_time.slice(0, 8) : '08:00:00',
      end_time: shift.end_time ? shift.end_time.slice(0, 8) : '17:30:00',
      break_start: shift.break_start ? shift.break_start.slice(0, 8) : '',
      break_end: shift.break_end ? shift.break_end.slice(0, 8) : '',
      working_hours: String(shift.working_hours || '8.00'),
      work_factor: String(shift.work_factor || '1.00'),
      grace_period_late_minutes: shift.grace_period_late_minutes ?? 15,
      grace_period_early_minutes: shift.grace_period_early_minutes ?? 15,
      is_overnight: Boolean(shift.is_overnight),
      is_active: shift.is_active !== false,
    });
    setOpenModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: Partial<NativeWorkShift> = {
      code: form.code.trim(),
      name: form.name.trim(),
      start_time: form.start_time.length === 5 ? `${form.start_time}:00` : form.start_time,
      end_time: form.end_time.length === 5 ? `${form.end_time}:00` : form.end_time,
      break_start: form.break_start ? (form.break_start.length === 5 ? `${form.break_start}:00` : form.break_start) : null,
      break_end: form.break_end ? (form.break_end.length === 5 ? `${form.break_end}:00` : form.break_end) : null,
      working_hours: form.working_hours,
      work_factor: form.work_factor,
      grace_period_late_minutes: Number(form.grace_period_late_minutes),
      grace_period_early_minutes: Number(form.grace_period_early_minutes),
      is_overnight: form.is_overnight,
      is_active: form.is_active,
    };

    if (editingShift) {
      await updateWorkShift.mutateAsync({ id: editingShift.id, data: payload });
    } else {
      await createWorkShift.mutateAsync(payload);
    }
    setOpenModal(false);
  };

  const handleDelete = async () => {
    if (deletingShiftId) {
      await deleteWorkShift.mutateAsync(deletingShiftId);
      setDeletingShiftId(null);
    }
  };

  const filteredShifts = shifts.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box>
      {/* Header Actions */}
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
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          alignItems={{ xs: 'stretch', sm: 'center' }}
          justifyContent="space-between"
        >
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#0F172A', mb: 0.5 }}>
              Danh sách ca làm việc
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748B' }}>
              Thiết lập khung giờ vào/ra, thời gian nghỉ giữa ca, dung sai đi muộn về sớm và hệ số công
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
              Thêm ca làm việc
            </Button>
          </Stack>
        </Stack>

        {/* Search */}
        <Box sx={{ mt: 2.5, maxWidth: 360 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Tìm theo mã hoặc tên ca..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" sx={{ color: '#94A3B8' }} />
                </InputAdornment>
              ),
            }}
            sx={inputSx}
          />
        </Box>
      </Card>

      {/* Shifts Table */}
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
                <TableCell sx={{ fontWeight: 600, color: '#475569', py: 1.5 }}>Mã ca</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Tên ca làm việc</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Khung giờ làm việc</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Nghỉ giữa ca</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, color: '#475569' }}>
                  Giờ công
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, color: '#475569' }}>
                  Hệ số công
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, color: '#475569' }}>
                  Dung sai (Muộn/Sớm)
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, color: '#475569' }}>
                  Trạng thái
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, color: '#475569' }}>
                  Hành động
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                    <CircularProgress size={32} sx={{ color: '#2563EB' }} />
                  </TableCell>
                </TableRow>
              ) : filteredShifts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 6, color: '#64748B' }}>
                    <AccessTimeIcon sx={{ fontSize: 40, color: '#CBD5E1', mb: 1, display: 'block', mx: 'auto' }} />
                    Không tìm thấy ca làm việc nào.
                  </TableCell>
                </TableRow>
              ) : (
                filteredShifts.map((shift) => (
                  <TableRow key={shift.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <TableCell sx={{ py: 1.5 }}>
                      <Chip
                        label={shift.code}
                        size="small"
                        sx={{
                          fontWeight: 700,
                          backgroundColor: '#EFF6FF',
                          color: '#2563EB',
                          borderRadius: 1.5,
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#0F172A' }}>
                      {shift.name}
                      {shift.is_overnight && (
                        <Chip
                          label="Qua đêm"
                          size="small"
                          sx={{
                            ml: 1,
                            height: 18,
                            fontSize: '0.6875rem',
                            backgroundColor: '#FEF3C7',
                            color: '#92400E',
                          }}
                        />
                      )}
                    </TableCell>
                    <TableCell sx={{ color: '#334155' }}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {shift.start_time?.slice(0, 5)} - {shift.end_time?.slice(0, 5)}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ color: '#64748B', fontSize: '0.8125rem' }}>
                      {shift.break_start && shift.break_end
                        ? `${shift.break_start.slice(0, 5)} - ${shift.break_end.slice(0, 5)}`
                        : 'Không nghỉ'}
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600, color: '#0F172A' }}>
                      {shift.working_hours}h
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={`x${shift.work_factor || '1.0'}`}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: '0.75rem',
                          backgroundColor: '#F1F5F9',
                          color: '#475569',
                        }}
                      />
                    </TableCell>
                    <TableCell align="center" sx={{ color: '#64748B', fontSize: '0.8125rem' }}>
                      +{shift.grace_period_late_minutes || 0}p / -{shift.grace_period_early_minutes || 0}p
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={shift.is_active !== false ? 'Hoạt động' : 'Tạm dừng'}
                        size="small"
                        sx={{
                          height: 22,
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          backgroundColor: shift.is_active !== false ? '#DCFCE7' : '#F1F5F9',
                          color: shift.is_active !== false ? '#15803D' : '#64748B',
                        }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                        <Tooltip title="Chỉnh sửa">
                          <IconButton size="small" onClick={() => handleOpenEdit(shift)} sx={{ color: '#2563EB' }}>
                            <EditOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Xóa">
                          <IconButton
                            size="small"
                            onClick={() => setDeletingShiftId(shift.id)}
                            sx={{ color: '#DC2626' }}
                          >
                            <DeleteOutlineOutlinedIcon fontSize="small" />
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
      </Card>

      {/* Create / Edit Dialog */}
      <Dialog
        open={openModal}
        onClose={() => setOpenModal(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <form onSubmit={handleSubmit}>
          <DialogTitle sx={{ fontWeight: 700, fontSize: '1.125rem', borderBottom: '1px solid #E2E8F0', pb: 2 }}>
            {editingShift ? 'Chỉnh sửa ca làm việc' : 'Thêm ca làm việc mới'}
          </DialogTitle>
          <DialogContent sx={{ pt: 2.5 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5, color: '#334155' }}>
                  Mã ca *
                </Typography>
                <TextField
                  fullWidth
                  required
                  placeholder="VD: HC, CA1, CA_DEM"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  sx={inputSx}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 8 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5, color: '#334155' }}>
                  Tên ca làm việc *
                </Typography>
                <TextField
                  fullWidth
                  required
                  placeholder="VD: Ca hành chính, Ca sáng..."
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  sx={inputSx}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5, color: '#334155' }}>
                  Giờ vào ca *
                </Typography>
                <TextField
                  fullWidth
                  required
                  type="time"
                  value={form.start_time.slice(0, 5)}
                  onChange={(e) => setForm({ ...form, start_time: `${e.target.value}:00` })}
                  inputProps={{ step: 300 }}
                  sx={inputSx}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5, color: '#334155' }}>
                  Giờ tan ca *
                </Typography>
                <TextField
                  fullWidth
                  required
                  type="time"
                  value={form.end_time.slice(0, 5)}
                  onChange={(e) => setForm({ ...form, end_time: `${e.target.value}:00` })}
                  inputProps={{ step: 300 }}
                  sx={inputSx}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5, color: '#334155' }}>
                  Bắt đầu nghỉ trưa
                </Typography>
                <TextField
                  fullWidth
                  type="time"
                  value={form.break_start ? form.break_start.slice(0, 5) : ''}
                  onChange={(e) =>
                    setForm({ ...form, break_start: e.target.value ? `${e.target.value}:00` : '' })
                  }
                  inputProps={{ step: 300 }}
                  sx={inputSx}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5, color: '#334155' }}>
                  Kết thúc nghỉ trưa
                </Typography>
                <TextField
                  fullWidth
                  type="time"
                  value={form.break_end ? form.break_end.slice(0, 5) : ''}
                  onChange={(e) =>
                    setForm({ ...form, break_end: e.target.value ? `${e.target.value}:00` : '' })
                  }
                  inputProps={{ step: 300 }}
                  sx={inputSx}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5, color: '#334155' }}>
                  Số giờ làm chuẩn *
                </Typography>
                <TextField
                  fullWidth
                  required
                  type="number"
                  inputProps={{ step: '0.25', min: '0', max: '24' }}
                  value={form.working_hours}
                  onChange={(e) => setForm({ ...form, working_hours: e.target.value })}
                  sx={inputSx}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5, color: '#334155' }}>
                  Hệ số công
                </Typography>
                <TextField
                  fullWidth
                  type="number"
                  inputProps={{ step: '0.1', min: '0.5', max: '3' }}
                  value={form.work_factor}
                  onChange={(e) => setForm({ ...form, work_factor: e.target.value })}
                  sx={inputSx}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5, color: '#334155' }}>
                  Cho phép đi muộn (phút)
                </Typography>
                <TextField
                  fullWidth
                  type="number"
                  value={form.grace_period_late_minutes}
                  onChange={(e) => setForm({ ...form, grace_period_late_minutes: Number(e.target.value) })}
                  sx={inputSx}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5, color: '#334155' }}>
                  Cho phép về sớm (phút)
                </Typography>
                <TextField
                  fullWidth
                  type="number"
                  value={form.grace_period_early_minutes}
                  onChange={(e) => setForm({ ...form, grace_period_early_minutes: Number(e.target.value) })}
                  sx={inputSx}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={form.is_overnight}
                      onChange={(e) => setForm({ ...form, is_overnight: e.target.checked })}
                      color="primary"
                    />
                  }
                  label="Ca làm việc qua đêm"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={form.is_active}
                      onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                      color="primary"
                    />
                  }
                  label="Kích hoạt ca làm việc"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid #E2E8F0' }}>
            <Button onClick={() => setOpenModal(false)} sx={{ textTransform: 'none', color: '#64748B' }}>
              Hủy
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={createWorkShift.isPending || updateWorkShift.isPending}
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
              {editingShift ? 'Cập nhật' : 'Thêm mới'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={Boolean(deletingShiftId)}
        onClose={() => setDeletingShiftId(null)}
        PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: '#0F172A' }}>Xác nhận xóa ca làm việc?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: '#64748B' }}>
            Hành động này không thể hoàn tác. Các phân ca và dữ liệu chấm công đã đối chiếu với ca này có thể bị ảnh hưởng.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeletingShiftId(null)} sx={{ textTransform: 'none', color: '#64748B' }}>
            Hủy
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDelete}
            disabled={deleteWorkShift.isPending}
            sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 600 }}
          >
            Xác nhận xóa
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
