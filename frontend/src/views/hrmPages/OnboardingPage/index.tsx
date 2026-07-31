'use client';

import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined';
import WorkOutlineOutlinedIcon from '@mui/icons-material/WorkOutlineOutlined';

import hrmService, { NativeEmployee, NativeDepartment, NativeDesignation } from '@/services/hrmService';
import { TabTitle } from '@/utils/generalFunction';

export default function OnboardingPage() {
  TabTitle('Tiếp nhận & Onboarding Nhân viên | Frappe Logic');

  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState<NativeEmployee[]>([]);
  const [departments, setDepartments] = useState<NativeDepartment[]>([]);
  const [designations, setDesignations] = useState<NativeDesignation[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

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

  const fetchData = async () => {
    setLoading(true);
    try {
      const [empData, deptData, desigData] = await Promise.all([
        hrmService.getEmployees().catch(() => []),
        hrmService.getDepartments().catch(() => []),
        hrmService.getDesignations().catch(() => []),
      ]);
      setEmployees(empData.filter((e) => e.status === 'PROBATION' || e.status === 'ACTIVE'));
      setDepartments(deptData);
      setDesignations(desigData);
    } catch (err) {
      console.error('Error fetching onboarding data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOnboardSubmit = async () => {
    try {
      await hrmService.onboardCandidate({
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
      });

      setOpenModal(false);
      setSuccessMsg('Đã hoàn tất quy trình Tiếp nhận (Employee Onboarding) chuẩn Frappe HRMS!');
      fetchData();
    } catch (err) {
      alert('Lỗi tiếp nhận nhân viên. Vui lòng kiểm tra lại thông tin.');
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1400, margin: '0 auto' }}>
      {/* Page Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
          pb: 2,
          borderBottom: '1px solid #e0e0e0',
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight={700} color="primary" display="flex" alignItems="center" gap={1.5}>
            <RocketLaunchIcon fontSize="large" color="primary" /> Cầu nối Tiếp nhận Nhân viên (Recruitment-to-Employee Onboarding)
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Chuyển đổi Ứng viên trúng tuyển (Hired Candidate) &rarr; Thư mời nhận việc &rarr; Hồ sơ Nhân viên chính thức chuẩn Frappe HRMS
          </Typography>
        </Box>

        <Button
          variant="contained"
          color="secondary"
          startIcon={<PersonAddOutlinedIcon />}
          onClick={() => setOpenModal(true)}
          sx={{ fontWeight: 600, py: 1.2, px: 2.5 }}
        >
          Tiếp nhận Nhân viên Mới
        </Button>
      </Box>

      {successMsg && (
        <Alert severity="success" onClose={() => setSuccessMsg(null)} sx={{ mb: 3 }}>
          {successMsg}
        </Alert>
      )}

      {/* Process Flow Cards */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ p: 2.5, borderRadius: 3, bgcolor: '#f0f7ff', borderLeft: '4px solid #1976d2' }}>
            <Box display="flex" alignItems="center" gap={1.5}>
              <Avatar sx={{ bgcolor: 'primary.main' }}>1</Avatar>
              <Box>
                <Typography fontWeight={700}>1. Tuyển dụng Trúng tuyển</Typography>
                <Typography variant="caption" color="text.secondary">
                  Ứng viên hoàn thành phỏng vấn AI & Đạt trạng thái Hired
                </Typography>
              </Box>
            </Box>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ p: 2.5, borderRadius: 3, bgcolor: '#fff8e6', borderLeft: '4px solid #ed6c02' }}>
            <Box display="flex" alignItems="center" gap={1.5}>
              <Avatar sx={{ bgcolor: 'warning.main' }}>2</Avatar>
              <Box>
                <Typography fontWeight={700}>2. Thỏa thuận & Offer Letter</Typography>
                <Typography variant="caption" color="text.secondary">
                  Gán Phòng ban, Vị trí công việc & Mức lương thỏa thuận
                </Typography>
              </Box>
            </Box>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ p: 2.5, borderRadius: 3, bgcolor: '#eefbe9', borderLeft: '4px solid #2e7d32' }}>
            <Box display="flex" alignItems="center" gap={1.5}>
              <Avatar sx={{ bgcolor: 'success.main' }}>3</Avatar>
              <Box>
                <Typography fontWeight={700}>3. Sinh Mã NV (Employee ID)</Typography>
                <Typography variant="caption" color="text.secondary">
                  Chuyển thành Hồ sơ Nhân viên chính thức trong HRM
                </Typography>
              </Box>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Onboarded List */}
      <Typography variant="h6" fontWeight={700} mb={2}>
        Danh sách Nhân viên vừa Tiếp nhận (Onboarded Employees)
      </Typography>

      {loading ? (
        <Box display="flex" justifyContent="center" py={6}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 4px 16px rgba(0,0,0,0.05)' }}>
          <Table>
            <TableHead sx={{ bgcolor: '#f8fafc' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Mã NV & Họ Tên</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Email & SĐT</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Phòng ban tiếp nhận</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Chức danh</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Ngày nhận việc</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Trạng thái Frappe</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {employees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">Chưa có nhân viên nào được tiếp nhận gần đây.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                employees.map((emp) => (
                  <TableRow key={emp.id} hover>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1.5}>
                        <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36 }}>
                          {emp.first_name?.[0] || 'E'}
                        </Avatar>
                        <Box>
                          <Typography fontWeight={600}>{emp.full_name}</Typography>
                          <Typography variant="caption" color="text.secondary">{emp.employee_code}</Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{emp.email}</Typography>
                      <Typography variant="caption" color="text.secondary">{emp.phone || '---'}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>{emp.department_name || 'Chưa phân bổ'}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{emp.designation_title || 'Chưa gán'}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{emp.join_date || '---'}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={emp.status === 'ACTIVE' ? 'Active' : 'Probation'}
                        color={emp.status === 'ACTIVE' ? 'success' : 'warning'}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Modal: Onboard Form */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle fontWeight={700}>Quy trình Tiếp nhận Nhân viên Mới (Employee Onboarding)</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} sx={{ mt: 1 }}>
            <Grid container spacing={2}>
              <Grid size={6}>
                <TextField
                  fullWidth
                  label="Họ & Tên lót"
                  value={form.last_name}
                  onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                />
              </Grid>
              <Grid size={6}>
                <TextField
                  fullWidth
                  label="Tên"
                  value={form.first_name}
                  onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                />
              </Grid>
            </Grid>
            <TextField
              fullWidth
              label="Email cá nhân / công việc"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <TextField
              fullWidth
              label="Số điện thoại"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
            <Grid container spacing={2}>
              <Grid size={6}>
                <TextField
                  select
                  fullWidth
                  label="Phòng ban tiếp nhận"
                  value={form.department_id}
                  onChange={(e) => setForm({ ...form, department_id: e.target.value })}
                >
                  {departments.map((d) => (
                    <MenuItem key={d.id} value={d.id}>
                      {d.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={6}>
                <TextField
                  select
                  fullWidth
                  label="Chức danh (Designation)"
                  value={form.designation_id}
                  onChange={(e) => setForm({ ...form, designation_id: e.target.value })}
                >
                  {designations.map((d) => (
                    <MenuItem key={d.id} value={d.id}>
                      {d.title}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid size={6}>
                <TextField
                  type="date"
                  fullWidth
                  label="Ngày bắt đầu vào làm (DOJ)"
                  InputLabelProps={{ shrink: true }}
                  value={form.join_date}
                  onChange={(e) => setForm({ ...form, join_date: e.target.value })}
                />
              </Grid>
              <Grid size={6}>
                <TextField
                  type="number"
                  fullWidth
                  label="Mức lương thỏa thuận (VND)"
                  value={form.base_salary}
                  onChange={(e) => setForm({ ...form, base_salary: Number(e.target.value) })}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenModal(false)}>Hủy</Button>
          <Button variant="contained" color="secondary" onClick={handleOnboardSubmit}>
            Xác nhận Tiếp nhận (Create Employee)
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
