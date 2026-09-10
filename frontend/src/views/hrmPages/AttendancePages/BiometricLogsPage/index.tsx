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
  Avatar,
  InputAdornment,
  Alert,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import FingerprintIcon from '@mui/icons-material/Fingerprint';
import PlayArrowOutlinedIcon from '@mui/icons-material/PlayArrowOutlined';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import RouterOutlinedIcon from '@mui/icons-material/RouterOutlined';

import {
  useHrmBiometricPunchLogs,
  useHrmEmployees,
  useHrmMutations,
} from '../../hooks/useHrmQueries';
import { NativeBiometricPunchLog } from '@/services/hrmService';
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

export default function BiometricLogsPage() {
  TabTitle('Dữ liệu máy chấm công | InfoHR HRM');

  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [sourceFilter, setSourceFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Queries
  const {
    data: punchLogs = [],
    isLoading,
    refetch,
  } = useHrmBiometricPunchLogs({
    date: selectedDate || undefined,
    source: sourceFilter === 'ALL' ? undefined : sourceFilter,
  });

  const { data: employees = [] } = useHrmEmployees();

  // Mutations
  const { createBiometricPunchLog, processDailyPunchLogs } = useHrmMutations();

  // Create Manual Punch Modal
  const [openModal, setOpenModal] = useState(false);
  const [punchForm, setPunchForm] = useState({
    employee: '',
    biometric_id: '',
    punch_time: `${todayStr}T08:00:00`,
    punch_type: 'AUTO',
    source: 'MANUAL',
    device_name: 'Máy chấm công Cổng chính',
  });

  const handleOpenCreate = () => {
    setPunchForm({
      employee: employees.length > 0 ? String(employees[0].id) : '',
      biometric_id: employees.length > 0 ? (employees[0].employee_code || '1') : '1',
      punch_time: `${todayStr}T08:00:00`,
      punch_type: 'AUTO',
      source: 'MANUAL',
      device_name: 'Máy chấm công Cổng chính',
    });
    setOpenModal(true);
  };

  const handleEmployeeChange = (empId: string) => {
    const emp = employees.find((e) => String(e.id) === empId);
    setPunchForm({
      ...punchForm,
      employee: empId,
      biometric_id: emp?.employee_code || empId,
    });
  };

  const handleSubmitPunch = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: Partial<NativeBiometricPunchLog> = {
      employee: punchForm.employee ? Number(punchForm.employee) : null,
      biometric_id: punchForm.biometric_id.trim() || 'UNKNOWN',
      punch_time: punchForm.punch_time,
      punch_type: punchForm.punch_type,
      source: punchForm.source,
      device_name: punchForm.device_name,
    };
    await createBiometricPunchLog.mutateAsync(payload);
    setOpenModal(false);
  };

  const handleProcessDaily = async () => {
    await processDailyPunchLogs.mutateAsync(selectedDate);
  };

  const getSourceChip = (source: string) => {
    switch (source) {
      case 'ZKTECO':
        return (
          <Chip
            icon={<RouterOutlinedIcon sx={{ fontSize: '0.875rem !important' }} />}
            label="ZKTeco TCP 4200"
            size="small"
            sx={{ height: 22, fontSize: '0.6875rem', fontWeight: 600, bgcolor: '#EFF6FF', color: '#1D4ED8' }}
          />
        );
      case 'EXCEL_IMPORT':
        return (
          <Chip
            label="Import Excel"
            size="small"
            sx={{ height: 22, fontSize: '0.6875rem', fontWeight: 600, bgcolor: '#DCFCE7', color: '#15803D' }}
          />
        );
      case 'WEB_APP':
        return (
          <Chip
            label="Web App"
            size="small"
            sx={{ height: 22, fontSize: '0.6875rem', fontWeight: 600, bgcolor: '#F3E8FF', color: '#7E22CE' }}
          />
        );
      default:
        return (
          <Chip
            label="Thủ công"
            size="small"
            sx={{ height: 22, fontSize: '0.6875rem', fontWeight: 600, bgcolor: '#F1F5F9', color: '#475569' }}
          />
        );
    }
  };

  const getPunchTypeChip = (type: string) => {
    if (type === 'CHECK_IN') {
      return (
        <Chip
          label="Giờ vào"
          size="small"
          sx={{ height: 22, fontSize: '0.6875rem', fontWeight: 700, bgcolor: '#DCFCE7', color: '#15803D' }}
        />
      );
    }
    if (type === 'CHECK_OUT') {
      return (
        <Chip
          label="Giờ ra"
          size="small"
          sx={{ height: 22, fontSize: '0.6875rem', fontWeight: 700, bgcolor: '#FFEDD5', color: '#C2410C' }}
        />
      );
    }
    return (
      <Chip
        label="Tự động"
        size="small"
        sx={{ height: 22, fontSize: '0.6875rem', fontWeight: 600, bgcolor: '#F1F5F9', color: '#475569' }}
      />
    );
  };

  const filteredLogs = punchLogs.filter((p) => {
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const name = (p.employee_name || '').toLowerCase();
      const code = (p.employee_code || '').toLowerCase();
      const bioId = (p.biometric_id || '').toLowerCase();
      const device = (p.device_name || '').toLowerCase();
      return name.includes(term) || code.includes(term) || bioId.includes(term) || device.includes(term);
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
              Dữ liệu máy chấm công
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748B' }}>
              Tiếp nhận dữ liệu quẹt thẻ từ máy chấm công kết nối mạng, đối chiếu ca làm việc để tính giờ công tự động
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
              variant="outlined"
              color="success"
              startIcon={<PlayArrowOutlinedIcon />}
              onClick={handleProcessDaily}
              disabled={processDailyPunchLogs.isPending}
              sx={{
                textTransform: 'none',
                borderRadius: 2,
                fontWeight: 600,
              }}
            >
              {processDailyPunchLogs.isPending ? 'Đang xử lý...' : `Tổng hợp công ngày ${selectedDate}`}
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
              Ghi nhận quẹt thẻ
            </Button>
          </Stack>
        </Stack>

        {/* Filters */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 2.5 }} alignItems="center" flexWrap="wrap">
          <TextField
            type="date"
            size="small"
            label="Ngày quẹt thẻ"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            sx={{ minWidth: 160, ...inputSx }}
          />

          <TextField
            select
            size="small"
            label="Nguồn dữ liệu"
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            sx={{ minWidth: 180, ...inputSx }}
          >
            <MenuItem value="ALL">Tất cả nguồn</MenuItem>
            <MenuItem value="ZKTECO">ZKTeco (TCP 4200)</MenuItem>
            <MenuItem value="EXCEL_IMPORT">Import Excel</MenuItem>
            <MenuItem value="WEB_APP">Web App</MenuItem>
            <MenuItem value="MANUAL">Thủ công</MenuItem>
          </TextField>

          <TextField
            size="small"
            placeholder="Tìm theo mã vân tay, nhân viên, thiết bị..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" sx={{ color: '#94A3B8' }} />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 280, ...inputSx }}
          />

          <Box sx={{ ml: 'auto !important' }}>
            <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 500 }}>
              Tổng cộng: <strong>{filteredLogs.length}</strong> lượt quẹt
            </Typography>
          </Box>
        </Stack>
      </Card>

      {/* Logs Table */}
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
                <TableCell sx={{ fontWeight: 600, color: '#475569', py: 1.5 }}>Mã vân tay / Thẻ</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Nhân viên</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Phòng ban</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Thời gian quẹt thẻ</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, color: '#475569' }}>
                  Loại quẹt
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Nguồn dữ liệu</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Tên thiết bị / IP</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                    <CircularProgress size={32} sx={{ color: '#2563EB' }} />
                  </TableCell>
                </TableRow>
              ) : filteredLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6, color: '#64748B' }}>
                    <FingerprintIcon sx={{ fontSize: 40, color: '#CBD5E1', mb: 1, display: 'block', mx: 'auto' }} />
                    Không có log máy chấm công nào cho ngày {selectedDate}.
                  </TableCell>
                </TableRow>
              ) : (
                filteredLogs.map((log) => (
                  <TableRow key={log.id} hover>
                    <TableCell sx={{ py: 1.5 }}>
                      <Chip
                        label={log.biometric_id}
                        size="small"
                        sx={{
                          fontWeight: 700,
                          backgroundColor: '#F8FAFC',
                          border: '1px solid #E2E8F0',
                          borderRadius: 1.5,
                        }}
                      />
                    </TableCell>

                    <TableCell>
                      {log.employee ? (
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
                            {(log.employee_name || 'N')[0]}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#0F172A', lineHeight: 1.2 }}>
                              {log.employee_name}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#64748B' }}>
                              {log.employee_code}
                            </Typography>
                          </Box>
                        </Stack>
                      ) : (
                        <Typography variant="body2" sx={{ color: '#94A3B8', fontStyle: 'italic' }}>
                          Chưa gắn nhân viên
                        </Typography>
                      )}
                    </TableCell>

                    <TableCell sx={{ color: '#475569', fontSize: '0.8125rem' }}>
                      {log.department_name || '-'}
                    </TableCell>

                    <TableCell sx={{ fontWeight: 600, color: '#0F172A' }}>
                      {log.punch_time.replace('T', ' ').slice(0, 19)}
                    </TableCell>

                    <TableCell align="center">{getPunchTypeChip(log.punch_type)}</TableCell>

                    <TableCell>{getSourceChip(log.source)}</TableCell>

                    <TableCell sx={{ color: '#64748B', fontSize: '0.8125rem' }}>
                      {log.device_name || 'Cổng kết nối mặc định'}
                      {log.device_ip && ` (${log.device_ip})`}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Manual Punch Modal */}
      <Dialog
        open={openModal}
        onClose={() => setOpenModal(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <form onSubmit={handleSubmitPunch}>
          <DialogTitle sx={{ fontWeight: 700, borderBottom: '1px solid #E2E8F0', pb: 2 }}>
            Ghi nhận quẹt thẻ thủ công
          </DialogTitle>
          <DialogContent sx={{ pt: 2.5 }}>
            <Stack spacing={2}>
              <TextField
                select
                fullWidth
                label="Nhân viên"
                required
                value={punchForm.employee}
                onChange={(e) => handleEmployeeChange(e.target.value)}
                sx={inputSx}
              >
                {employees.map((emp) => (
                  <MenuItem key={emp.id} value={String(emp.id)}>
                    {emp.first_name} {emp.last_name} ({emp.employee_code || 'NV'}) - {emp.department_name}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                fullWidth
                label="Mã vân tay / ID máy"
                required
                value={punchForm.biometric_id}
                onChange={(e) => setPunchForm({ ...punchForm, biometric_id: e.target.value })}
                sx={inputSx}
              />

              <TextField
                type="datetime-local"
                fullWidth
                label="Thời gian quẹt thẻ"
                required
                value={punchForm.punch_time}
                onChange={(e) => setPunchForm({ ...punchForm, punch_time: e.target.value })}
                sx={inputSx}
              />

              <TextField
                select
                fullWidth
                label="Loại quẹt"
                value={punchForm.punch_type}
                onChange={(e) => setPunchForm({ ...punchForm, punch_type: e.target.value })}
                sx={inputSx}
              >
                <MenuItem value="AUTO">Tự động nhận diện</MenuItem>
                <MenuItem value="CHECK_IN">Giờ vào</MenuItem>
                <MenuItem value="CHECK_OUT">Giờ ra</MenuItem>
              </TextField>

              <TextField
                fullWidth
                label="Tên thiết bị / Nơi chấm"
                value={punchForm.device_name}
                onChange={(e) => setPunchForm({ ...punchForm, device_name: e.target.value })}
                sx={inputSx}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid #E2E8F0' }}>
            <Button onClick={() => setOpenModal(false)} sx={{ textTransform: 'none', color: '#64748B' }}>
              Hủy
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={createBiometricPunchLog.isPending}
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
              Ghi nhận
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
