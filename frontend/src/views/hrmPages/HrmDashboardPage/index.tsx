'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
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
  MenuItem,
  CircularProgress,
  IconButton,
  Avatar,
  Stack,
  Alert,
  Tooltip,
  LinearProgress,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import EventBusyOutlinedIcon from '@mui/icons-material/EventBusyOutlined';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import AddIcon from '@mui/icons-material/Add';
import BusinessIcon from '@mui/icons-material/Business';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined';
import RefreshIcon from '@mui/icons-material/Refresh';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

import {
  useHrmDashboardStats,
  useHrmEmployees,
  useHrmDepartments,
  useHrmLeaves,
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

export default function HrmDashboardPage() {
  TabTitle('Tổng quan Quản lý Nhân sự (HRM)');
  const { push } = useRouter();

  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useHrmDashboardStats();
  const { data: employees = [], isLoading: empLoading } = useHrmEmployees();
  const { data: departments = [] } = useHrmDepartments();
  const { data: leaveRequests = [], isLoading: leavesLoading } = useHrmLeaves();

  const { createEmployee, approveLeave, rejectLeave } = useHrmMutations();

  const [openAddEmpModal, setOpenAddEmpModal] = useState(false);
  const [empForm, setEmpForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    department: '',
    status: 'PROBATION',
    employment_type: 'FULL_TIME',
    join_date: new Date().toISOString().split('T')[0],
  });

  const handleCreateEmployee = async () => {
    if (!empForm.first_name || !empForm.last_name || !empForm.email) return;
    createEmployee.mutate(
      {
        ...empForm,
        department: empForm.department ? Number(empForm.department) : null,
      } as any,
      {
        onSuccess: () => {
          setOpenAddEmpModal(false);
          setEmpForm({
            first_name: '',
            last_name: '',
            email: '',
            phone: '',
            department: '',
            status: 'PROBATION',
            employment_type: 'FULL_TIME',
            join_date: new Date().toISOString().split('T')[0],
          });
        },
      }
    );
  };

  const totalEmployeesCount = (stats?.active_employees || 0) + (stats?.probation_employees || 0);
  const pendingLeaves = leaveRequests.filter((l) => l.status === 'PENDING');
  const recentEmployees = [...employees].slice(0, 5);

  const kpis = [
    {
      title: 'Nhân sự Chính thức',
      value: stats?.active_employees ?? 0,
      icon: <PeopleAltOutlinedIcon sx={{ fontSize: 24 }} />,
      color: '#2563eb',
      bgColor: '#eff6ff',
      tag: 'Đang làm việc',
      tagBg: '#dbeafe',
    },
    {
      title: 'Nhân sự Thử việc',
      value: stats?.probation_employees ?? 0,
      icon: <BadgeOutlinedIcon sx={{ fontSize: 24 }} />,
      color: '#d97706',
      bgColor: '#fffbeb',
      tag: 'Đang thử việc',
      tagBg: '#fef3c7',
    },
    {
      title: 'Đơn nghỉ phép chờ duyệt',
      value: stats?.pending_leaves ?? pendingLeaves.length,
      icon: <EventBusyOutlinedIcon sx={{ fontSize: 24 }} />,
      color: '#ea580c',
      bgColor: '#fff7ed',
      tag: 'Cần xử lý',
      tagBg: '#ffedd5',
    },
    {
      title: 'Hợp đồng cần tái ký',
      value: stats?.expiring_contracts ?? 0,
      icon: <AssignmentOutlinedIcon sx={{ fontSize: 24 }} />,
      color: '#dc2626',
      bgColor: '#fef2f2',
      tag: 'Trong 30 ngày',
      tagBg: '#fee2e2',
    },
  ];

  const quickActions = [
    {
      title: 'Hồ sơ Nhân viên',
      desc: 'Xem danh bạ, sơ yếu lý lịch và chi tiết công tác',
      icon: <PeopleAltOutlinedIcon sx={{ fontSize: 22 }} />,
      href: '/employer/hrm/employees',
      color: '#2563eb',
      bgColor: '#eff6ff',
    },
    {
      title: 'Tiếp nhận Onboarding',
      desc: 'Quy trình đón nhân sự mới từ tuyển dụng',
      icon: <PersonAddOutlinedIcon sx={{ fontSize: 22 }} />,
      href: '/employer/hrm/onboarding',
      color: '#16a34a',
      bgColor: '#f0fdf4',
    },
    {
      title: 'Phòng ban & Vị trí',
      desc: 'Quản lý cơ cấu phòng ban và chức danh',
      icon: <BusinessIcon sx={{ fontSize: 22 }} />,
      href: '/employer/hrm/departments',
      color: '#7c3aed',
      bgColor: '#f5f3ff',
    },
    {
      title: 'Sơ đồ Cây Tổ chức',
      desc: 'Trực quan hóa cấu trúc phân cấp quản lý',
      icon: <AccountTreeOutlinedIcon sx={{ fontSize: 22 }} />,
      href: '/employer/hrm/org-chart',
      color: '#d97706',
      bgColor: '#fffbeb',
    },
  ];

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
              <DashboardOutlinedIcon sx={{ fontSize: 24 }} />
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 900, color: '#0f172a', fontSize: { xs: '1.25rem', md: '1.5rem' }, letterSpacing: '-0.02em' }}>
                Tổng quan Quản lý Nhân sự (HRM)
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500, fontSize: '0.875rem' }}>
                Hệ thống điều hành nhân sự toàn diện, quản lý cơ cấu tổ chức & chế độ phúc lợi
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={1.5} alignItems="center">
            <Button
              variant="outlined"
              size="small"
              startIcon={<RefreshIcon sx={{ fontSize: 16 }} />}
              onClick={() => refetchStats()}
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
              onClick={() => push('/employer/hrm/onboarding')}
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
              Tiếp nhận Onboarding
            </Button>
          </Stack>
        </Box>

        {/* 1. Top Bento KPI Cards */}
        <Grid container spacing={2.5}>
          {kpis.map((kpi, idx) => (
            <Grid key={kpi.title || `kpi-${idx}`} size={{ xs: 12, sm: 6, lg: 3 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  borderRadius: 3,
                  border: '1px solid #e2e8f0',
                  bgcolor: '#ffffff',
                  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.02)',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: kpi.color,
                    boxShadow: '0 8px 24px -4px rgba(15, 23, 42, 0.08)',
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1.5 }}>
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: '12px',
                      bgcolor: kpi.bgColor,
                      color: kpi.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {kpi.icon}
                  </Box>
                  <Chip
                    label={kpi.tag}
                    size="small"
                    sx={{
                      height: 22,
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      bgcolor: kpi.tagBg,
                      color: kpi.color,
                      borderRadius: 1.5,
                    }}
                  />
                </Stack>

                <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600, fontSize: '0.8125rem' }}>
                  {kpi.title}
                </Typography>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 900,
                    color: '#0f172a',
                    fontFamily: 'var(--font-mono)',
                    letterSpacing: '-0.02em',
                    mt: 0.5,
                  }}
                >
                  {statsLoading ? <CircularProgress size={24} /> : kpi.value.toLocaleString()}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* 2. Middle Bento Row (60% Department Breakdown | 40% Quick Actions) */}
        <Grid container spacing={3}>
          {/* Department Breakdown */}
          <Grid size={{ xs: 12, md: 7 }}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                border: '1px solid #e2e8f0',
                bgcolor: '#ffffff',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <Box>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2.5 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '1rem' }}>
                    Phân bổ Nhân sự theo Phòng ban
                  </Typography>
                  <Button
                    size="small"
                    endIcon={<ArrowForwardOutlinedIcon sx={{ fontSize: 14 }} />}
                    onClick={() => push('/employer/hrm/departments')}
                    sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.8125rem', color: '#2563eb' }}
                  >
                    Xem tất cả
                  </Button>
                </Stack>

                <Stack spacing={2}>
                  {(stats?.department_breakdown || []).length === 0 ? (
                    <Typography variant="body2" sx={{ color: '#94a3b8', py: 3, textAlign: 'center' }}>
                      Chưa có dữ liệu phòng ban.
                    </Typography>
                  ) : (
                    (stats?.department_breakdown || []).slice(0, 5).map((dept) => {
                      const percentage = totalEmployeesCount > 0 ? Math.round((dept.emp_count / totalEmployeesCount) * 100) : 0;
                      return (
                        <Box key={dept.id}>
                          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.75 }}>
                            <Typography variant="body2" sx={{ fontWeight: 700, color: '#1e293b', fontSize: '0.85rem' }}>
                              {dept.name}
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 800, color: '#64748b', fontSize: '0.8125rem', fontFamily: 'var(--font-mono)' }}>
                              {dept.emp_count} nhân sự ({percentage}%)
                            </Typography>
                          </Stack>
                          <LinearProgress
                            variant="determinate"
                            value={percentage}
                            sx={{
                              height: 7,
                              borderRadius: 3.5,
                              bgcolor: '#f1f5f9',
                              '& .MuiLinearProgress-bar': {
                                borderRadius: 3.5,
                                bgcolor: '#2563eb',
                              },
                            }}
                          />
                        </Box>
                      );
                    })
                  )}
                </Stack>
              </Box>
            </Paper>
          </Grid>

          {/* Quick Workflows */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                border: '1px solid #e2e8f0',
                bgcolor: '#ffffff',
                height: '100%',
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '1rem', mb: 2 }}>
                Lối tắt Nghiệp vụ HRM
              </Typography>

              <Grid container spacing={1.5}>
                {quickActions.map((action, idx) => (
                  <Grid key={action.href || action.title || `action-${idx}`} size={12}>
                    <Box
                      onClick={() => push(action.href)}
                      sx={{
                        p: 1.75,
                        borderRadius: 2.5,
                        border: '1px solid #f1f5f9',
                        bgcolor: '#f8fafc',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          borderColor: action.color,
                          bgcolor: '#ffffff',
                          boxShadow: '0 4px 14px 0 rgba(0, 0, 0, 0.05)',
                          transform: 'translateX(3px)',
                        },
                      }}
                    >
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Box
                          sx={{
                            width: 38,
                            height: 38,
                            borderRadius: '10px',
                            bgcolor: action.bgColor,
                            color: action.color,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          {action.icon}
                        </Box>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.875rem' }}>
                            {action.title}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500, fontSize: '0.75rem' }}>
                            {action.desc}
                          </Typography>
                        </Box>
                      </Stack>
                      <ArrowForwardOutlinedIcon sx={{ fontSize: 16, color: '#94a3b8' }} />
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>
        </Grid>

        {/* 3. Bottom Bento Row (Recent Leaves | Recent Employees) */}
        <Grid container spacing={3}>
          {/* Recent Leave Requests */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                border: '1px solid #e2e8f0',
                bgcolor: '#ffffff',
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '1rem' }}>
                  Đơn Nghỉ phép Chờ duyệt ({pendingLeaves.length})
                </Typography>
                <Button
                  size="small"
                  endIcon={<ArrowForwardOutlinedIcon sx={{ fontSize: 14 }} />}
                  onClick={() => push('/employer/hrm/leaves')}
                  sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.8125rem', color: '#2563eb' }}
                >
                  Xem tất cả
                </Button>
              </Stack>

              {pendingLeaves.length === 0 ? (
                <Typography variant="body2" sx={{ color: '#94a3b8', py: 4, textAlign: 'center' }}>
                  Hiện không có đơn nghỉ phép nào đang chờ duyệt.
                </Typography>
              ) : (
                <TableContainer sx={{ border: '1px solid #f1f5f9', borderRadius: 2, overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                  <Table size="small" sx={{ minWidth: 360 }}>
                    <TableHead sx={{ bgcolor: '#f8fafc' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.75rem' }}>Nhân viên</TableCell>
                        <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.75rem' }}>Thời gian</TableCell>
                        <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.75rem' }} align="right">Hành động</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {pendingLeaves.slice(0, 4).map((leave) => (
                        <TableRow key={leave.id} hover>
                          <TableCell sx={{ fontWeight: 700, color: '#0f172a', fontSize: '0.8125rem' }}>
                            {leave.employee_name || `#${leave.employee}`}
                          </TableCell>
                          <TableCell sx={{ fontSize: '0.775rem', color: '#64748b', fontFamily: 'var(--font-mono)' }}>
                            {leave.start_date} ({leave.total_days} ngày)
                          </TableCell>
                          <TableCell align="right">
                            <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                              <IconButton aria-label="Thao tác"
                                size="small"
                                onClick={() => approveLeave.mutate(leave.id)}
                                sx={{ color: '#16a34a', bgcolor: '#f0fdf4', '&:hover': { bgcolor: '#dcfce7' } }}
                              >
                                <CheckIcon sx={{ fontSize: 16 }} />
                              </IconButton>
                              <IconButton aria-label="Thao tác"
                                size="small"
                                onClick={() => rejectLeave.mutate({ id: leave.id })}
                                sx={{ color: '#dc2626', bgcolor: '#fef2f2', '&:hover': { bgcolor: '#fee2e2' } }}
                              >
                                <CloseIcon sx={{ fontSize: 16 }} />
                              </IconButton>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Paper>
          </Grid>

          {/* Recent Employees */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                border: '1px solid #e2e8f0',
                bgcolor: '#ffffff',
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '1rem' }}>
                  Nhân sự Gần đây
                </Typography>
                <Button
                  size="small"
                  endIcon={<ArrowForwardOutlinedIcon sx={{ fontSize: 14 }} />}
                  onClick={() => push('/employer/hrm/employees')}
                  sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.8125rem', color: '#2563eb' }}
                >
                  Xem tất cả
                </Button>
              </Stack>

              {recentEmployees.length === 0 ? (
                <Typography variant="body2" sx={{ color: '#94a3b8', py: 4, textAlign: 'center' }}>
                  Chưa có nhân sự nào trong danh bạ.
                </Typography>
              ) : (
                <Stack spacing={1.5}>
                  {recentEmployees.map((emp) => (
                    <Box
                      key={emp.id}
                      sx={{
                        p: 1.25,
                        borderRadius: 2,
                        bgcolor: '#f8fafc',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Stack direction="row" spacing={1.25} alignItems="center">
                        <Avatar
                          src={emp.avatar}
                          sx={{ width: 34, height: 34, bgcolor: '#eff6ff', color: '#2563eb', fontWeight: 800, fontSize: '0.875rem' }}
                        >
                          {emp.full_name?.charAt(0)?.toUpperCase() || 'E'}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a', fontSize: '0.8125rem' }}>
                            {emp.full_name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.725rem' }}>
                            {emp.department_name || 'Chưa phân phòng ban'}
                          </Typography>
                        </Box>
                      </Stack>
                      <Chip
                        label={emp.status === 'ACTIVE' ? 'Chính thức' : 'Thử việc'}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: '0.675rem',
                          fontWeight: 800,
                          borderRadius: 1,
                          bgcolor: emp.status === 'ACTIVE' ? '#f0fdf4' : '#fffbeb',
                          color: emp.status === 'ACTIVE' ? '#16a34a' : '#d97706',
                        }}
                      />
                    </Box>
                  ))}
                </Stack>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Stack>

      {/* Quick Add Employee Dialog */}
      <Dialog
        open={openAddEmpModal}
        onClose={() => setOpenAddEmpModal(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 900, color: '#0f172a', borderBottom: '1px solid #e2e8f0', p: 2.5 }}>
          Tạo nhanh Hồ sơ Nhân viên
        </DialogTitle>
        <DialogContent sx={{ p: 2.5, pt: '20px !important' }}>
          <Stack spacing={2}>
            <Grid container spacing={2}>
              <Grid size={6}>
                <TextField
                  label="Họ đệm"
                  value={empForm.first_name}
                  onChange={(e) => setEmpForm({ ...empForm, first_name: e.target.value })}
                  fullWidth
                  sx={inputSx}
                />
              </Grid>
              <Grid size={6}>
                <TextField
                  label="Tên"
                  value={empForm.last_name}
                  onChange={(e) => setEmpForm({ ...empForm, last_name: e.target.value })}
                  fullWidth
                  sx={inputSx}
                />
              </Grid>
            </Grid>
            <TextField
              label="Email liên hệ"
              type="email"
              value={empForm.email}
              onChange={(e) => setEmpForm({ ...empForm, email: e.target.value })}
              fullWidth
              sx={inputSx}
            />
            <TextField
              label="Số điện thoại"
              value={empForm.phone}
              onChange={(e) => setEmpForm({ ...empForm, phone: e.target.value })}
              fullWidth
              sx={inputSx}
            />
            <TextField
              select
              label="Phòng ban"
              value={empForm.department}
              onChange={(e) => setEmpForm({ ...empForm, department: e.target.value })}
              fullWidth
              sx={inputSx}
            >
              <MenuItem value="">-- Chưa chọn phòng ban --</MenuItem>
              {departments.map((d) => (
                <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>
              ))}
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, borderTop: '1px solid #e2e8f0' }}>
          <Button onClick={() => setOpenAddEmpModal(false)} sx={{ fontWeight: 700, color: '#64748b', textTransform: 'none' }}>
            Hủy
          </Button>
          <Button
            variant="contained"
            disabled={!empForm.first_name || !empForm.last_name || !empForm.email || createEmployee.isPending}
            onClick={handleCreateEmployee}
            sx={{ fontWeight: 800, borderRadius: 2, textTransform: 'none', bgcolor: '#2563eb' }}
          >
            {createEmployee.isPending ? 'Đang tạo...' : 'Tạo hồ sơ'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
