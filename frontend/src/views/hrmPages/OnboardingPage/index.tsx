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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import RefreshIcon from '@mui/icons-material/Refresh';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined';
import AttachMoneyOutlinedIcon from '@mui/icons-material/AttachMoneyOutlined';

import {
  useHrmEmployees,
  useHrmDepartments,
  useHrmDesignations,
  useHrmMutations,
} from '../hooks/useHrmQueries';
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

const STEPS = ['Hồ sơ Cá nhân', 'Phòng ban & Vị trí', 'Đãi ngộ & Ký kết'];

export default function OnboardingPage() {
  TabTitle('Tiếp nhận & Onboarding Nhân viên | InfoHR HRM');

  const { data: employees = [], isLoading: loading, refetch } = useHrmEmployees();
  const { data: departments = [] } = useHrmDepartments();
  const { data: designations = [] } = useHrmDesignations();
  const { onboardCandidate } = useHrmMutations();

  const [openModal, setOpenModal] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    department_id: '',
    designation_id: '',
    join_date: new Date().toISOString().split('T')[0],
    probation_end_date: '',
    base_salary: 15000000,
    employment_type: 'FULL_TIME',
  });

  const onboardingEmployees = employees.filter((e) => e.status === 'PROBATION' || e.status === 'ACTIVE');

  const handleNext = () => {
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleOnboardSubmit = async () => {
    onboardCandidate.mutate(
      {
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        phone: form.phone,
        department_id: form.department_id ? Number(form.department_id) : undefined,
        designation_id: form.designation_id ? Number(form.designation_id) : undefined,
        join_date: form.join_date,
        probation_end_date: form.probation_end_date || undefined,
        base_salary: Number(form.base_salary),
        employment_type: form.employment_type,
      },
      {
        onSuccess: () => {
          setOpenModal(false);
          setActiveStep(0);
          setForm({
            first_name: '',
            last_name: '',
            email: '',
            phone: '',
            department_id: '',
            designation_id: '',
            join_date: new Date().toISOString().split('T')[0],
            probation_end_date: '',
            base_salary: 15000000,
            employment_type: 'FULL_TIME',
          });
        },
      }
    );
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
                bgcolor: '#f0fdf4',
                color: '#16a34a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <RocketLaunchIcon sx={{ fontSize: 24 }} />
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 900, color: '#0f172a', fontSize: { xs: '1.25rem', md: '1.5rem' }, letterSpacing: '-0.02em' }}>
                Tiếp nhận & Onboarding Nhân sự
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500, fontSize: '0.875rem' }}>
                Quy trình tiếp nhận ứng viên trúng tuyển, thiết lập hồ sơ và chuẩn bị hợp đồng thử việc
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
              startIcon={<PersonAddOutlinedIcon sx={{ fontSize: 18 }} />}
              onClick={() => {
                setActiveStep(0);
                setOpenModal(true);
              }}
              sx={{
                borderRadius: 2.5,
                textTransform: 'none',
                fontWeight: 800,
                fontSize: '0.875rem',
                bgcolor: '#16a34a',
                boxShadow: '0 4px 12px 0 rgba(22, 163, 74, 0.2)',
                '&:hover': { bgcolor: '#15803d' },
              }}
            >
              Tiếp nhận Nhân sự Mới
            </Button>
          </Stack>
        </Box>

        {/* 3 Step Workflow Overview Banner */}
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: '1px solid #e2e8f0', bgcolor: '#ffffff' }}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Box sx={{ width: 36, height: 36, borderRadius: '10px', bgcolor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <AssignmentIndOutlinedIcon sx={{ fontSize: 20 }} />
                </Box>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a' }}>1. Khởi tạo Hồ sơ</Typography>
                  <Typography variant="caption" sx={{ color: '#64748b' }}>Đồng bộ thông tin từ ứng viên trúng tuyển</Typography>
                </Box>
              </Stack>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: '1px solid #e2e8f0', bgcolor: '#ffffff' }}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Box sx={{ width: 36, height: 36, borderRadius: '10px', bgcolor: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <RocketLaunchIcon sx={{ fontSize: 20 }} />
                </Box>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a' }}>2. Bàn giao & Định danh</Typography>
                  <Typography variant="caption" sx={{ color: '#64748b' }}>Phân bổ phòng ban, chức danh & thiết bị</Typography>
                </Box>
              </Stack>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: '1px solid #e2e8f0', bgcolor: '#ffffff' }}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Box sx={{ width: 36, height: 36, borderRadius: '10px', bgcolor: '#fffbeb', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <AttachMoneyOutlinedIcon sx={{ fontSize: 20 }} />
                </Box>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a' }}>3. Ký kết Thử việc</Typography>
                  <Typography variant="caption" sx={{ color: '#64748b' }}>Kích hoạt hợp đồng và tài khoản nhân sự</Typography>
                </Box>
              </Stack>
            </Paper>
          </Grid>
        </Grid>

        {/* Onboarding List Table */}
        <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid #e2e8f0', overflow: 'hidden', bgcolor: '#ffffff' }}>
          <TableContainer>
            <Table size="medium">
              <TableHead sx={{ bgcolor: '#f8fafc' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8125rem' }}>Mã NV & Họ tên</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8125rem' }}>Phòng ban & Vị trí</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8125rem' }}>Ngày vào làm</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8125rem' }}>Hạn thử việc</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8125rem' }}>Trạng thái</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                      <CircularProgress size={28} />
                    </TableCell>
                  </TableRow>
                ) : onboardingEmployees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 6, color: '#64748b' }}>
                      Chưa có nhân sự nào trong danh sách tiếp nhận.
                    </TableCell>
                  </TableRow>
                ) : (
                  onboardingEmployees.map((emp) => (
                    <TableRow key={emp.id} hover sx={{ '&:last-child td': { borderBottom: 0 } }}>
                      <TableCell>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <Avatar
                            src={emp.avatar}
                            sx={{ width: 38, height: 38, bgcolor: '#f0fdf4', color: '#16a34a', fontWeight: 800, fontSize: '0.875rem' }}
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
                          {emp.designation_title || 'Chưa gán'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748b' }}>
                          {emp.department_name || 'Chưa phân phòng'}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', color: '#475569' }}>
                        {emp.join_date || '---'}
                      </TableCell>
                      <TableCell sx={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', color: '#d97706', fontWeight: 700 }}>
                        {emp.probation_end_date || '---'}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={emp.status === 'PROBATION' ? 'Đang thử việc' : 'Đã chính thức'}
                          size="small"
                          sx={{
                            fontWeight: 800,
                            fontSize: '0.725rem',
                            bgcolor: emp.status === 'PROBATION' ? '#fffbeb' : '#f0fdf4',
                            color: emp.status === 'PROBATION' ? '#d97706' : '#16a34a',
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
      </Stack>

      {/* Onboarding Multi-Step Dialog */}
      <Dialog
        open={openModal}
        onClose={() => setOpenModal(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 900, color: '#0f172a', borderBottom: '1px solid #e2e8f0', p: 2.5 }}>
          Tiếp nhận & Onboarding Nhân viên Mới
        </DialogTitle>
        <DialogContent sx={{ p: 2.5, pt: '24px !important' }}>
          <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 3.5 }}>
            {STEPS.map((label) => (
              <Step key={label}>
                <StepLabel sx={{ '& .MuiStepLabel-label': { fontWeight: 700, fontSize: '0.775rem' } }}>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {activeStep === 0 && (
            <Stack spacing={2}>
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
              </Grid>
              <TextField
                label="Email công việc / cá nhân"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                fullWidth
                sx={inputSx}
              />
              <TextField
                label="Số điện thoại liên hệ"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                fullWidth
                sx={inputSx}
              />
            </Stack>
          )}

          {activeStep === 1 && (
            <Stack spacing={2}>
              <TextField
                select
                label="Phòng ban tiếp nhận"
                value={form.department_id}
                onChange={(e) => setForm({ ...form, department_id: e.target.value })}
                fullWidth
                sx={inputSx}
              >
                <MenuItem value="">-- Chọn phòng ban --</MenuItem>
                {departments.map((d) => (
                  <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="Chức danh / Vị trí công việc"
                value={form.designation_id}
                onChange={(e) => setForm({ ...form, designation_id: e.target.value })}
                fullWidth
                sx={inputSx}
              >
                <MenuItem value="">-- Chọn chức danh --</MenuItem>
                {designations.map((d) => (
                  <MenuItem key={d.id} value={d.id}>{d.title}</MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="Hình thức làm việc"
                value={form.employment_type}
                onChange={(e) => setForm({ ...form, employment_type: e.target.value })}
                fullWidth
                sx={inputSx}
              >
                <MenuItem value="FULL_TIME">Toàn thời gian (Full-time)</MenuItem>
                <MenuItem value="PART_TIME">Bán thời gian (Part-time)</MenuItem>
                <MenuItem value="CONTRACT">Hợp đồng khoán</MenuItem>
                <MenuItem value="INTERN">Thực tập sinh (Intern)</MenuItem>
              </TextField>
            </Stack>
          )}

          {activeStep === 2 && (
            <Stack spacing={2}>
              <Grid container spacing={2}>
                <Grid size={6}>
                  <TextField
                    type="date"
                    label="Ngày bắt đầu vào làm"
                    slotProps={{ inputLabel: { shrink: true } }}
                    value={form.join_date}
                    onChange={(e) => setForm({ ...form, join_date: e.target.value })}
                    fullWidth
                    sx={inputSx}
                  />
                </Grid>
                <Grid size={6}>
                  <TextField
                    type="date"
                    label="Ngày kết thúc thử việc"
                    slotProps={{ inputLabel: { shrink: true } }}
                    value={form.probation_end_date}
                    onChange={(e) => setForm({ ...form, probation_end_date: e.target.value })}
                    fullWidth
                    sx={inputSx}
                  />
                </Grid>
              </Grid>
              <TextField
                label="Mức lương cơ bản (VND)"
                type="number"
                value={form.base_salary}
                onChange={(e) => setForm({ ...form, base_salary: Number(e.target.value) })}
                fullWidth
                sx={inputSx}
              />
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2.5, borderTop: '1px solid #e2e8f0', justifyContent: 'space-between' }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            sx={{ fontWeight: 700, color: '#64748b', textTransform: 'none' }}
          >
            Quay lại
          </Button>

          {activeStep < STEPS.length - 1 ? (
            <Button
              variant="contained"
              disabled={activeStep === 0 && (!form.first_name || !form.last_name || !form.email)}
              onClick={handleNext}
              sx={{ fontWeight: 800, borderRadius: 2, textTransform: 'none', bgcolor: '#2563eb' }}
            >
              Tiếp tục
            </Button>
          ) : (
            <Button
              variant="contained"
              disabled={onboardCandidate.isPending}
              onClick={handleOnboardSubmit}
              sx={{ fontWeight: 800, borderRadius: 2, textTransform: 'none', bgcolor: '#16a34a' }}
            >
              {onboardCandidate.isPending ? 'Đang hoàn tất...' : 'Hoàn tất Tiếp nhận'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}
