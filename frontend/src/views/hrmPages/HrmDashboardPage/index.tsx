'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tabs,
  Tab,
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
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';

import hrmService, {
  HrmDashboardStats,
  NativeEmployee,
  NativeDepartment,
  NativeLeaveRequest,
  NativeOrgTreeNode,
} from '@/services/hrmService';
import { TabTitle } from '@/utils/generalFunction';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} id={`hrm-tabpanel-${index}`} {...other}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export default function HrmDashboardPage() {
  TabTitle('Quản lý Nhân sự (HRM)');

  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<HrmDashboardStats | null>(null);
  const [employees, setEmployees] = useState<NativeEmployee[]>([]);
  const [departments, setDepartments] = useState<NativeDepartment[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<NativeLeaveRequest[]>([]);
  const [orgChart, setOrgChart] = useState<NativeOrgTreeNode[]>([]);
  
  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState<number | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modals
  const [openAddEmpModal, setOpenAddEmpModal] = useState(false);
  const [openAddDeptModal, setOpenAddDeptModal] = useState(false);
  const [openOnboardModal, setOpenOnboardModal] = useState(false);

  // Forms
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

  const [deptForm, setDeptForm] = useState({
    name: '',
    code: '',
    description: '',
  });

  const [onboardForm, setOnboardForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    department_id: '',
    join_date: new Date().toISOString().split('T')[0],
    base_salary: 12000000,
  });

  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const [statsData, empData, deptData, leaveData, orgData] = await Promise.all([
        hrmService.getDashboardStats(),
        hrmService.getEmployees(),
        hrmService.getDepartments(),
        hrmService.getLeaveRequests(),
        hrmService.getOrgChart(),
      ]);

      if (statsData) setStats(statsData);
      setEmployees(empData);
      setDepartments(deptData);
      setLeaveRequests(leaveData);
      setOrgChart(orgData);
    } catch (err: any) {
      console.error('Error fetching HRM data:', err);
      setErrorMessage(err?.response?.data?.message || err?.message || 'Không thể tải dữ liệu HRM.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleCreateEmployee = async () => {
    try {
      await hrmService.createEmployee({
        first_name: empForm.first_name,
        last_name: empForm.last_name,
        email: empForm.email,
        phone: empForm.phone,
        department: empForm.department ? Number(empForm.department) : undefined,
        status: empForm.status as any,
        employment_type: empForm.employment_type as any,
        join_date: empForm.join_date,
      });
      setOpenAddEmpModal(false);
      setActionSuccess('Đã thêm nhân viên mới thành công!');
      fetchData();
    } catch (err) {
      alert('Không thể tạo nhân viên. Vui lòng kiểm tra lại thông tin.');
    }
  };

  const handleCreateDepartment = async () => {
    try {
      await hrmService.createDepartment({
        name: deptForm.name,
        code: deptForm.code,
        description: deptForm.description,
      });
      setOpenAddDeptModal(false);
      setActionSuccess('Đã tạo phòng ban mới thành công!');
      fetchData();
    } catch (err) {
      alert('Không thể tạo phòng ban.');
    }
  };

  const handleOnboardCandidate = async () => {
    try {
      await hrmService.onboardCandidate({
        first_name: onboardForm.first_name,
        last_name: onboardForm.last_name,
        email: onboardForm.email,
        phone: onboardForm.phone,
        department_id: onboardForm.department_id ? Number(onboardForm.department_id) : undefined,
        join_date: onboardForm.join_date,
        base_salary: Number(onboardForm.base_salary),
      });
      setOpenOnboardModal(false);
      setActionSuccess('Đã tiếp nhận ứng viên trúng tuyển thành công!');
      fetchData();
    } catch (err) {
      alert('Không thể tiếp nhận ứng viên.');
    }
  };

  const handleApproveLeave = async (id: number) => {
    try {
      await hrmService.approveLeaveRequest(id);
      setActionSuccess('Đã duyệt đơn nghỉ phép!');
      fetchData();
    } catch (err) {
      alert('Lỗi phê duyệt đơn nghỉ phép.');
    }
  };

  const handleRejectLeave = async (id: number) => {
    try {
      await hrmService.rejectLeaveRequest(id);
      setActionSuccess('Đã từ chối đơn nghỉ phép!');
      fetchData();
    } catch (err) {
      alert('Lỗi từ chối đơn nghỉ phép.');
    }
  };

  // Filtered employees
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
      {/* Header Banner */}
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
          <Typography variant="h4" fontWeight={700} color="primary">
            Quản lý Nhân sự (Native HRM)
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Hệ thống Quản lý Hồ sơ Nhân sự, Phòng ban, Hợp đồng & Nghỉ phép tập trung
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchData}
            disabled={loading}
          >
            Làm mới
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            startIcon={<PersonAddOutlinedIcon />}
            onClick={() => setOpenOnboardModal(true)}
          >
            Tiếp nhận Ứng viên
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => setOpenAddEmpModal(true)}
          >
            Thêm Nhân viên
          </Button>
        </Stack>
      </Box>

      {errorMessage && (
        <Alert severity="error" onClose={() => setErrorMessage(null)} sx={{ mb: 3 }}>
          {errorMessage}
        </Alert>
      )}

      {actionSuccess && (
        <Alert severity="success" onClose={() => setActionSuccess(null)} sx={{ mb: 3 }}>
          {actionSuccess}
        </Alert>
      )}

      {/* KPI Cards */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', bgcolor: '#f0f7ff' }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Nhân viên Chính thức
                  </Typography>
                  <Typography variant="h3" fontWeight={700} color="primary.main" sx={{ my: 0.5 }}>
                    {stats?.active_employees || 0}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Đang hoạt động trong công ty
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'primary.light', width: 48, height: 48 }}>
                  <PeopleAltOutlinedIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', bgcolor: '#fff8e6' }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Đang Thử việc
                  </Typography>
                  <Typography variant="h3" fontWeight={700} color="warning.main" sx={{ my: 0.5 }}>
                    {stats?.probation_employees || 0}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Nhân sự mới gia nhập
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'warning.light', width: 48, height: 48 }}>
                  <BadgeOutlinedIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', bgcolor: '#f0f9ff' }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Đơn phép chờ duyệt
                  </Typography>
                  <Typography variant="h3" fontWeight={700} color="primary.main" sx={{ my: 0.5 }}>
                    {stats?.pending_leaves || 0}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Cần phê duyệt từ Manager
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'primary.light', width: 48, height: 48 }}>
                  <EventBusyOutlinedIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', bgcolor: '#eefbe9' }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Hợp đồng sắp hết hạn
                  </Typography>
                  <Typography variant="h3" fontWeight={700} color="success.main" sx={{ my: 0.5 }}>
                    {stats?.expiring_contracts || 0}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Trong 30 ngày tới
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'success.light', width: 48, height: 48 }}>
                  <AssignmentOutlinedIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab icon={<PeopleAltOutlinedIcon />} iconPosition="start" label="Danh sách Nhân sự" />
          <Tab icon={<BusinessIcon />} iconPosition="start" label="Phòng ban & Tổ chức" />
          <Tab icon={<EventBusyOutlinedIcon />} iconPosition="start" label="Quản lý Nghỉ phép" />
          <Tab icon={<AccountTreeOutlinedIcon />} iconPosition="start" label="Sơ đồ Cây Tổ chức" />
        </Tabs>
      </Box>

      {/* Tab 1: Employee Directory */}
      <CustomTabPanel value={tabValue} index={0}>
        <Card sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, md: 5 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Tìm kiếm nhân viên theo Tên, Mã NV, Email..."
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
                label="Trạng thái"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="ALL">Tất cả trạng thái</MenuItem>
                <MenuItem value="ACTIVE">Chính thức</MenuItem>
                <MenuItem value="PROBATION">Thử việc</MenuItem>
                <MenuItem value="RESIGNED">Đã nghỉ việc</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </Card>

        {loading ? (
          <Box display="flex" justifyContent="center" py={5}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <Table>
              <TableHead sx={{ bgcolor: '#f8fafc' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Mã NV & Họ Tên</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Email & SĐT</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Phòng ban & Chức vụ</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Loại HĐ</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Trạng thái</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Ngày vào làm</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredEmployees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">Chưa có nhân viên nào phù hợp.</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEmployees.map((emp) => (
                    <TableRow key={emp.id} hover>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1.5}>
                          <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36 }}>
                            {emp.first_name?.[0] || 'E'}
                          </Avatar>
                          <Box>
                            <Typography fontWeight={600}>{emp.full_name}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {emp.employee_code}
                            </Typography>
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
                        <Typography variant="body2" fontWeight={500}>
                          {emp.department_name || 'Chưa phân bổ'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {emp.designation_title || 'Chưa xếp vị trí'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={emp.employment_type === 'FULL_TIME' ? 'Chính thức' : 'Khác'}
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
                              : 'Đã nghỉ'
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
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </CustomTabPanel>

      {/* Tab 2: Departments */}
      <CustomTabPanel value={tabValue} index={1}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" fontWeight={600}>
            Cơ cấu Phòng ban Công ty
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenAddDeptModal(true)}
          >
            Thêm Phòng ban
          </Button>
        </Box>

        <Grid container spacing={2.5}>
          {departments.map((dept) => (
            <Grid key={dept.id} size={{ xs: 12, sm: 6, md: 4 }}>
              <Card sx={{ borderRadius: 3, p: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6" fontWeight={600}>
                    {dept.name}
                  </Typography>
                  {dept.code && <Chip label={dept.code} size="small" color="primary" variant="outlined" />}
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ my: 1 }}>
                  {dept.description || 'Chưa có mô tả phòng ban.'}
                </Typography>
                <Box display="flex" justifyContent="space-between" alignItems="center" mt={2} pt={1} borderTop="1px solid #eee">
                  <Typography variant="caption" color="text.secondary">
                    Trưởng phòng: {dept.manager_name || 'Chưa gán'}
                  </Typography>
                  <Chip label={`${dept.employee_count} Nhân sự`} size="small" color="info" />
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      </CustomTabPanel>

      {/* Tab 3: Leave Requests */}
      <CustomTabPanel value={tabValue} index={2}>
        <Typography variant="h6" fontWeight={600} mb={2}>
          Danh sách Đơn xin nghỉ phép
        </Typography>

        <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
          <Table>
            <TableHead sx={{ bgcolor: '#f8fafc' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Nhân viên</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Loại phép</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Thời gian</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Số ngày</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Lý do</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Trạng thái</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Hành động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {leaveRequests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">Chưa có đơn nghỉ phép nào.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                leaveRequests.map((leave) => (
                  <TableRow key={leave.id} hover>
                    <TableCell sx={{ fontWeight: 600 }}>{leave.employee_name}</TableCell>
                    <TableCell>{leave.leave_type_name || 'Nghỉ phép năm'}</TableCell>
                    <TableCell>{`${leave.start_date} -> ${leave.end_date}`}</TableCell>
                    <TableCell>{leave.total_days} ngày</TableCell>
                    <TableCell>{leave.reason || '---'}</TableCell>
                    <TableCell>
                      <Chip
                        label={
                          leave.status === 'APPROVED'
                            ? 'Đã duyệt'
                            : leave.status === 'REJECTED'
                            ? 'Từ chối'
                            : 'Chờ duyệt'
                        }
                        color={
                          leave.status === 'APPROVED'
                            ? 'success'
                            : leave.status === 'REJECTED'
                            ? 'error'
                            : 'warning'
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {leave.status === 'PENDING' && (
                        <Stack direction="row" spacing={1}>
                          <Tooltip title="Duyệt đơn">
                            <IconButton color="success" size="small" onClick={() => handleApproveLeave(leave.id)}>
                              <CheckCircleOutlineIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Từ chối">
                            <IconButton color="error" size="small" onClick={() => handleRejectLeave(leave.id)}>
                              <HighlightOffIcon />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </CustomTabPanel>

      {/* Tab 4: Org Chart */}
      <CustomTabPanel value={tabValue} index={3}>
        <Card sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight={600} mb={2}>
            Sơ đồ Cây Tổ chức Công ty (Org Chart)
          </Typography>

          {orgChart.length === 0 ? (
            <Alert severity="info">
              Chưa có cấu trúc phòng ban cấp cao. Vui lòng tạo phòng ban và chọn phòng ban cha để tạo cây sơ đồ tổ chức.
            </Alert>
          ) : (
            <Box sx={{ pl: 2 }}>
              {orgChart.map((node) => (
                <Box key={node.id} sx={{ mb: 2, p: 2, borderLeft: '3px solid #1976d2', bgcolor: '#f8fafc', borderRadius: 2 }}>
                  <Typography variant="subtitle1" fontWeight={700} color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                    <BusinessIcon fontSize="small" />
                    {node.name} {node.code && `(${node.code})`}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Trưởng phòng: {node.manager_name || 'Chưa gán'} | Quy mô: {node.employee_count} nhân viên
                  </Typography>

                  {node.children && node.children.length > 0 && (
                    <Box sx={{ pl: 3, mt: 1.5 }}>
                      {node.children.map((child) => (
                        <Box key={child.id} sx={{ mb: 1, p: 1.5, borderLeft: '2px solid #9c27b0', bgcolor: '#fff', borderRadius: 1 }}>
                          <Typography variant="body2" fontWeight={600} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                            <FolderOutlinedIcon fontSize="small" color="secondary" />
                            {child.name} {child.code && `(${child.code})`}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  )}
                </Box>
              ))}
            </Box>
          )}
        </Card>
      </CustomTabPanel>

      {/* Modal 1: Add Employee */}
      <Dialog open={openAddEmpModal} onClose={() => setOpenAddEmpModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle fontWeight={700}>Thêm Hồ sơ Nhân viên Mới</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} sx={{ mt: 1 }}>
            <Grid container spacing={2}>
              <Grid size={6}>
                <TextField
                  fullWidth
                  label="Họ & Tên lót"
                  value={empForm.last_name}
                  onChange={(e) => setEmpForm({ ...empForm, last_name: e.target.value })}
                />
              </Grid>
              <Grid size={6}>
                <TextField
                  fullWidth
                  label="Tên"
                  value={empForm.first_name}
                  onChange={(e) => setEmpForm({ ...empForm, first_name: e.target.value })}
                />
              </Grid>
            </Grid>
            <TextField
              fullWidth
              label="Email"
              value={empForm.email}
              onChange={(e) => setEmpForm({ ...empForm, email: e.target.value })}
            />
            <TextField
              fullWidth
              label="Số điện thoại"
              value={empForm.phone}
              onChange={(e) => setEmpForm({ ...empForm, phone: e.target.value })}
            />
            <TextField
              select
              fullWidth
              label="Phòng ban"
              value={empForm.department}
              onChange={(e) => setEmpForm({ ...empForm, department: e.target.value })}
            >
              {departments.map((d) => (
                <MenuItem key={d.id} value={d.id}>
                  {d.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              type="date"
              fullWidth
              label="Ngày vào làm"
              InputLabelProps={{ shrink: true }}
              value={empForm.join_date}
              onChange={(e) => setEmpForm({ ...empForm, join_date: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddEmpModal(false)}>Hủy</Button>
          <Button variant="contained" onClick={handleCreateEmployee}>
            Tạo Hồ sơ
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal 2: Add Department */}
      <Dialog open={openAddDeptModal} onClose={() => setOpenAddDeptModal(false)} maxWidth="xs" fullWidth>
        <DialogTitle fontWeight={700}>Tạo Phòng ban Mới</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="Tên phòng ban"
              value={deptForm.name}
              onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
            />
            <TextField
              fullWidth
              label="Mã phòng ban (vd: DEPT-IT)"
              value={deptForm.code}
              onChange={(e) => setDeptForm({ ...deptForm, code: e.target.value })}
            />
            <TextField
              fullWidth
              multiline
              rows={2}
              label="Mô tả"
              value={deptForm.description}
              onChange={(e) => setDeptForm({ ...deptForm, description: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddDeptModal(false)}>Hủy</Button>
          <Button variant="contained" onClick={handleCreateDepartment}>
            Tạo Phòng ban
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal 3: Onboard Candidate */}
      <Dialog open={openOnboardModal} onClose={() => setOpenOnboardModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle fontWeight={700}>Tiếp nhận Ứng viên Trúng tuyển sang HRM</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} sx={{ mt: 1 }}>
            <Grid container spacing={2}>
              <Grid size={6}>
                <TextField
                  fullWidth
                  label="Họ & Tên lót"
                  value={onboardForm.last_name}
                  onChange={(e) => setOnboardForm({ ...onboardForm, last_name: e.target.value })}
                />
              </Grid>
              <Grid size={6}>
                <TextField
                  fullWidth
                  label="Tên"
                  value={onboardForm.first_name}
                  onChange={(e) => setOnboardForm({ ...onboardForm, first_name: e.target.value })}
                />
              </Grid>
            </Grid>
            <TextField
              fullWidth
              label="Email"
              value={onboardForm.email}
              onChange={(e) => setOnboardForm({ ...onboardForm, email: e.target.value })}
            />
            <TextField
              fullWidth
              label="Số điện thoại"
              value={onboardForm.phone}
              onChange={(e) => setOnboardForm({ ...onboardForm, phone: e.target.value })}
            />
            <TextField
              select
              fullWidth
              label="Phòng ban tiếp nhận"
              value={onboardForm.department_id}
              onChange={(e) => setOnboardForm({ ...onboardForm, department_id: e.target.value })}
            >
              {departments.map((d) => (
                <MenuItem key={d.id} value={d.id}>
                  {d.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              type="number"
              fullWidth
              label="Mức lương thỏa thuận (VND)"
              value={onboardForm.base_salary}
              onChange={(e) => setOnboardForm({ ...onboardForm, base_salary: Number(e.target.value) })}
            />
            <TextField
              type="date"
              fullWidth
              label="Ngày nhận việc"
              InputLabelProps={{ shrink: true }}
              value={onboardForm.join_date}
              onChange={(e) => setOnboardForm({ ...onboardForm, join_date: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenOnboardModal(false)}>Hủy</Button>
          <Button variant="contained" color="secondary" onClick={handleOnboardCandidate}>
            Xác nhận Tiếp nhận Nhân viên
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
