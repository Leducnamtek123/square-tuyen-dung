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
  Drawer,
  Divider,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import DownloadIcon from '@mui/icons-material/Download';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import ContactPhoneIcon from '@mui/icons-material/ContactPhone';

import hrmService, { NativeEmployee, NativeDepartment } from '@/services/hrmService';
import { TabTitle } from '@/utils/generalFunction';

export default function EmployeeListPage() {
  TabTitle('Hồ sơ Nhân viên | Native HRM');

  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState<NativeEmployee[]>([]);
  const [departments, setDepartments] = useState<NativeDepartment[]>([]);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState<number | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Selected Employee Detail Drawer
  const [selectedEmp, setSelectedEmp] = useState<NativeEmployee | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [empData, deptData] = await Promise.all([
        hrmService.getEmployees(),
        hrmService.getDepartments(),
      ]);
      setEmployees(empData);
      setDepartments(deptData);
    } catch (err: any) {
      console.error('Error fetching employee list:', err);
      setError(err?.response?.data?.message || err?.message || 'Không thể tải danh sách nhân viên.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      searchQuery === '' ||
      emp.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.employee_code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.email?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDept = deptFilter === 'ALL' || emp.department === deptFilter;
    const matchesStatus = statusFilter === 'ALL' || emp.status === statusFilter;

    return matchesSearch && matchesDept && matchesStatus;
  });

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
            <BadgeOutlinedIcon fontSize="large" color="primary" /> Danh sách & Hồ sơ Nhân viên (Employee Directory)
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Quản lý Sơ yếu lý lịch, Trạng thái thử việc / chính thức và Cơ cấu phòng ban chuẩn Frappe HRMS
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5}>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchData} disabled={loading}>
            Làm mới
          </Button>
          <Button variant="contained" color="primary" startIcon={<AddIcon />}>
            Tạo Hồ sơ Nhân viên
          </Button>
        </Stack>
      </Box>

      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Filter Bar */}
      <Card sx={{ p: 2.5, mb: 3, borderRadius: 3, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, md: 5 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Tìm kiếm theo Tên nhân viên, Mã NV (SQ-EMP-xxx), Email, SĐT..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
              }}
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
            >
              <MenuItem value="ALL">Tất cả phòng ban</MenuItem>
              {departments.map((d) => (
                <MenuItem key={d.id} value={d.id}>
                  {d.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 6, md: 3.5 }}>
            <TextField
              select
              fullWidth
              size="small"
              label="Trạng thái Frappe"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="ALL">Tất cả trạng thái</MenuItem>
              <MenuItem value="ACTIVE">Chính thức (Active)</MenuItem>
              <MenuItem value="PROBATION">Thử việc (Probation)</MenuItem>
              <MenuItem value="RESIGNED">Đã nghỉ việc (Left)</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Card>

      {/* Employee Data Table */}
      {loading ? (
        <Box display="flex" justifyContent="center" py={8}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
          <Table>
            <TableHead sx={{ bgcolor: '#f8fafc' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Mã NV & Họ Tên</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Email & Số điện thoại</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Phòng ban & Vị trí</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Loại HĐ</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Trạng thái</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Ngày vào làm</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Hành động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredEmployees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                    <Typography color="text.secondary">Không tìm thấy hồ sơ nhân viên phù hợp.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredEmployees.map((emp) => (
                  <TableRow key={emp.id} hover sx={{ cursor: 'pointer' }} onClick={() => setSelectedEmp(emp)}>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1.5}>
                        <Avatar sx={{ bgcolor: 'primary.main', fontWeight: 700, width: 40, height: 40 }}>
                          {emp.first_name?.[0] || 'E'}
                        </Avatar>
                        <Box>
                          <Typography fontWeight={600} color="primary.dark">
                            {emp.full_name}
                          </Typography>
                          <Chip label={emp.employee_code} size="small" variant="outlined" sx={{ height: 20, fontSize: 11 }} />
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{emp.email}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {emp.phone || '---'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {emp.department_name || 'Chưa gán'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {emp.designation_title || 'Chưa gán chức danh'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={emp.employment_type === 'FULL_TIME' ? 'Toàn thời gian' : 'Khác'}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={
                          emp.status === 'ACTIVE'
                            ? 'Chính thức'
                            : emp.status === 'PROBATION'
                            ? 'Thử việc'
                            : 'Đã nghỉ việc'
                        }
                        color={
                          emp.status === 'ACTIVE'
                            ? 'success'
                            : emp.status === 'PROBATION'
                            ? 'warning'
                            : 'default'
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{emp.join_date || '---'}</Typography>
                    </TableCell>
                    <TableCell>
                      <Button size="small" variant="outlined" onClick={(e) => { e.stopPropagation(); setSelectedEmp(emp); }}>
                        Chi tiết
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Drawer: Employee Profile Detail */}
      <Drawer anchor="right" open={Boolean(selectedEmp)} onClose={() => setSelectedEmp(null)}>
        <Box sx={{ width: 450, p: 3 }}>
          {selectedEmp && (
            <>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <Avatar sx={{ bgcolor: 'primary.main', width: 64, height: 64, fontSize: 24, fontWeight: 700 }}>
                  {selectedEmp.first_name?.[0] || 'E'}
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight={700}>
                    {selectedEmp.full_name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedEmp.employee_code} • {selectedEmp.designation_title || 'Chưa gán vị trí'}
                  </Typography>
                  <Chip
                    label={selectedEmp.status === 'ACTIVE' ? 'Chính thức' : 'Thử việc'}
                    color={selectedEmp.status === 'ACTIVE' ? 'success' : 'warning'}
                    size="small"
                    sx={{ mt: 0.5 }}
                  />
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle2" fontWeight={700} color="primary" mb={1} display="flex" alignItems="center" gap={1}>
                <WorkOutlineIcon fontSize="small" color="primary" /> Thông tin Công việc (Job Details)
              </Typography>
              <Grid container spacing={1.5} sx={{ mb: 2 }}>
                <Grid size={6}>
                  <Typography variant="caption" color="text.secondary">Phòng ban</Typography>
                  <Typography variant="body2" fontWeight={600}>{selectedEmp.department_name || '---'}</Typography>
                </Grid>
                <Grid size={6}>
                  <Typography variant="caption" color="text.secondary">Quản lý trực tiếp</Typography>
                  <Typography variant="body2" fontWeight={600}>{selectedEmp.reports_to_name || '---'}</Typography>
                </Grid>
                <Grid size={6}>
                  <Typography variant="caption" color="text.secondary">Ngày gia nhập</Typography>
                  <Typography variant="body2" fontWeight={600}>{selectedEmp.join_date || '---'}</Typography>
                </Grid>
                <Grid size={6}>
                  <Typography variant="caption" color="text.secondary">Hạn thử việc</Typography>
                  <Typography variant="body2" fontWeight={600}>{selectedEmp.probation_end_date || '---'}</Typography>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle2" fontWeight={700} color="primary" mb={1} display="flex" alignItems="center" gap={1}>
                <ContactPhoneIcon fontSize="small" color="primary" /> Thông tin Liên hệ & Tài khoản (Personal Info)
              </Typography>
              <Grid container spacing={1.5}>
                <Grid size={12}>
                  <Typography variant="caption" color="text.secondary">Email công việc</Typography>
                  <Typography variant="body2" fontWeight={600}>{selectedEmp.email}</Typography>
                </Grid>
                <Grid size={6}>
                  <Typography variant="caption" color="text.secondary">Số điện thoại</Typography>
                  <Typography variant="body2" fontWeight={600}>{selectedEmp.phone || '---'}</Typography>
                </Grid>
                <Grid size={6}>
                  <Typography variant="caption" color="text.secondary">Giới tính</Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {selectedEmp.gender === 'MALE' ? 'Nam' : selectedEmp.gender === 'FEMALE' ? 'Nữ' : 'Khác'}
                  </Typography>
                </Grid>
                <Grid size={6}>
                  <Typography variant="caption" color="text.secondary">Tài khoản Ngân hàng</Typography>
                  <Typography variant="body2" fontWeight={600}>{selectedEmp.bank_account_number || '---'}</Typography>
                </Grid>
                <Grid size={6}>
                  <Typography variant="caption" color="text.secondary">Ngân hàng</Typography>
                  <Typography variant="body2" fontWeight={600}>{selectedEmp.bank_name || '---'}</Typography>
                </Grid>
              </Grid>
            </>
          )}
        </Box>
      </Drawer>
    </Box>
  );
}
