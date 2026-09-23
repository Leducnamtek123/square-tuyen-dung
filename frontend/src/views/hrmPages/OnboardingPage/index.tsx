'use client';

import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Button,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stepper,
  Step,
  StepLabel,
  TextField,
  MenuItem,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import RefreshIcon from '@mui/icons-material/Refresh';

import {
  useHrmOnboardingProcesses,
  useHrmOnboardingStats,
  useHrmDepartments,
  useHrmDesignations,
  useHrmMutations,
} from '../hooks/useHrmQueries';
import { TabTitle } from '@/utils/generalFunction';
import pc from '@/utils/muiColors';

import { OnboardingKpiCards } from './components/OnboardingKpiCards';
import { OnboardingFilters } from './components/OnboardingFilters';
import { OnboardingTableView } from './components/OnboardingTableView';
import { OnboardingKanbanView } from './components/OnboardingKanbanView';
import { OnboardingDetailDrawer } from './components/OnboardingDetailDrawer';

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

const MANUAL_STEPS = ['Hồ sơ Cá nhân', 'Phòng ban & Vị trí', 'Đãi ngộ & Ký kết'];

export default function OnboardingPage() {
  TabTitle('Tiếp nhận & Onboarding Nhân viên | InfoHR HRM');

  // Filter and view states
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState<string | number>('');
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');
  const [selectedProcessId, setSelectedProcessId] = useState<number | null>(null);

  // Queries
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useHrmOnboardingStats();
  const {
    data: processes = [],
    isLoading: processesLoading,
    refetch: refetchProcesses,
  } = useHrmOnboardingProcesses({
    stage: stageFilter || undefined,
    department: deptFilter || undefined,
    search: search || undefined,
  });

  const { data: departments = [] } = useHrmDepartments();
  const { data: designations = [] } = useHrmDesignations();
  const { onboardCandidate } = useHrmMutations();

  // Manual Onboard Modal state
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

  const handleRefresh = () => {
    refetchStats();
    refetchProcesses();
  };

  const handleResetFilters = () => {
    setSearch('');
    setStageFilter('');
    setDeptFilter('');
  };

  const handleNextStep = () => {
    setActiveStep((prev) => prev + 1);
  };

  const handleBackStep = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleManualOnboardSubmit = async () => {
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
          handleRefresh();
        },
      }
    );
  };

  // Client-side text filtering if search term entered
  const filteredProcesses = useMemo(() => {
    if (!search.trim()) return processes;
    const q = search.trim().toLowerCase();
    return processes.filter((proc) => {
      const emp = proc.employee_detail;
      const fullName = (emp?.full_name || emp?.fullName || '').toLowerCase();
      const code = (emp?.employee_code || emp?.employeeCode || '').toLowerCase();
      const email = (emp?.email || '').toLowerCase();
      const dept = (emp?.department_name || emp?.departmentName || '').toLowerCase();
      const pos = (emp?.designation_title || emp?.designationTitle || '').toLowerCase();
      return (
        fullName.includes(q) ||
        code.includes(q) ||
        email.includes(q) ||
        dept.includes(q) ||
        pos.includes(q)
      );
    });
  }, [processes, search]);

  return (
    <Box sx={{ width: '100%', maxWidth: 1440, mx: 'auto', p: { xs: 2, sm: 3 } }}>
      <Stack spacing={3}>
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
              sx={{
                width: 46,
                height: 46,
                borderRadius: '14px',
                bgcolor: '#eff6ff',
                color: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1.5px solid #dbeafe',
              }}
            >
              <RocketLaunchIcon sx={{ fontSize: 26 }} />
            </Box>
            <Box>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 900,
                  color: '#0f172a',
                  fontSize: { xs: '1.25rem', md: '1.5rem' },
                  letterSpacing: '-0.02em',
                }}
              >
                Trung tâm Tiếp nhận & Onboarding Nhân sự
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500, fontSize: '0.875rem' }}>
                Quản trị quy trình tiếp nhận ứng viên trúng tuyển từ nộp hồ sơ số, hậu cần nội bộ đến kết thúc thử việc
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={1.5} alignItems="center">
            <Button
              variant="outlined"
              size="small"
              startIcon={<RefreshIcon sx={{ fontSize: 16 }} />}
              onClick={handleRefresh}
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
              Tiếp nhận Trực tiếp
            </Button>
          </Stack>
        </Box>

        {/* KPI Summary Cards */}
        <OnboardingKpiCards
          stats={stats}
          loading={statsLoading}
          selectedFilterStage={stageFilter}
          onFilterClick={(stage) => {
            setStageFilter((prev) => (prev === stage ? '' : stage));
          }}
        />

        {/* Toolbar & Filters */}
        <OnboardingFilters
          search={search}
          onSearchChange={setSearch}
          stage={stageFilter}
          onStageChange={setStageFilter}
          department={deptFilter}
          onDepartmentChange={setDeptFilter}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          departments={departments}
          onReset={handleResetFilters}
        />

        {/* View Mode Content: Table vs Kanban */}
        {viewMode === 'table' ? (
          <OnboardingTableView
            processes={filteredProcesses}
            loading={processesLoading}
            onSelectProcess={(proc) => setSelectedProcessId(proc.id)}
          />
        ) : (
          <OnboardingKanbanView
            processes={filteredProcesses}
            loading={processesLoading}
            onSelectProcess={(proc) => setSelectedProcessId(proc.id)}
          />
        )}
      </Stack>

      {/* 5-Stage Interactive Onboarding Drawer */}
      <OnboardingDetailDrawer
        open={Boolean(selectedProcessId)}
        onClose={() => setSelectedProcessId(null)}
        processId={selectedProcessId}
      />

      {/* Manual Onboarding Modal (For direct HR entry) */}
      <Dialog
        open={openModal}
        onClose={() => setOpenModal(false)}
        fullWidth
        maxWidth="sm"
        slotProps={{ paper: { sx: { borderRadius: 3 } } }}
      >
        <DialogTitle sx={{ fontWeight: 900, color: '#0f172a', borderBottom: '1px solid #e2e8f0', p: 2.5 }}>
          Tiếp nhận & Khởi tạo Nhân sự Mới
        </DialogTitle>
        <DialogContent sx={{ p: 2.5, pt: '24px !important' }}>
          <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 3.5 }}>
            {MANUAL_STEPS.map((label) => (
              <Step key={label}>
                <StepLabel sx={{ '& .MuiStepLabel-label': { fontWeight: 700, fontSize: '0.775rem' } }}>
                  {label}
                </StepLabel>
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
                  <MenuItem key={d.id} value={d.id}>
                    {d.name}
                  </MenuItem>
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
                  <MenuItem key={d.id} value={d.id}>
                    {d.title}
                  </MenuItem>
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
            onClick={handleBackStep}
            sx={{ fontWeight: 700, color: '#64748b', textTransform: 'none' }}
          >
            Quay lại
          </Button>

          {activeStep < MANUAL_STEPS.length - 1 ? (
            <Button
              variant="contained"
              disabled={activeStep === 0 && (!form.first_name || !form.last_name || !form.email)}
              onClick={handleNextStep}
              sx={{ fontWeight: 800, borderRadius: 2, textTransform: 'none', bgcolor: '#2563eb' }}
            >
              Tiếp tục
            </Button>
          ) : (
            <Button
              variant="contained"
              disabled={onboardCandidate.isPending}
              onClick={handleManualOnboardSubmit}
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
