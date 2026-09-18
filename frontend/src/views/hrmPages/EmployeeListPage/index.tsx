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
  Tabs,
  Tab,
  Badge,
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
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import FolderSharedOutlinedIcon from '@mui/icons-material/FolderSharedOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import TrendingDownOutlinedIcon from '@mui/icons-material/TrendingDownOutlined';
import SwapHorizOutlinedIcon from '@mui/icons-material/SwapHorizOutlined';
import AttachMoneyOutlinedIcon from '@mui/icons-material/AttachMoneyOutlined';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import GavelOutlinedIcon from '@mui/icons-material/GavelOutlined';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import ExitToAppOutlinedIcon from '@mui/icons-material/ExitToAppOutlined';
import LaunchOutlinedIcon from '@mui/icons-material/LaunchOutlined';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined';
import ChatBubbleOutlineOutlinedIcon from '@mui/icons-material/ChatBubbleOutlineOutlined';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import { ExportModal } from '@/components/Common/ExportModal';
import { ImportModal } from '@/components/Common/ImportModal';

import {
  useHrmEmployees,
  useHrmDepartments,
  useHrmDesignations,
  useHrmMutations,
  useHrmCareerHistories,
  useHrmDocuments,
} from '../hooks/useHrmQueries';
import hrmService, {
  NativeEmployee,
  NativeEmployeeCareerHistory,
  NativeEmployeeDocument,
} from '@/services/hrmService';
import { TabTitle } from '@/utils/generalFunction';
import toastMessages from '@/utils/toastMessages';
import pc from '@/utils/muiColors';

const CAREER_EVENT_CONFIG: Record<
  string,
  { label: string; color: string; bg: string; icon: React.ElementType }
> = {
  ONBOARDING: { label: 'Tiếp nhận / Tuyển dụng mới', color: '#2563eb', bg: '#eff6ff', icon: PersonAddOutlinedIcon },
  HIRED: { label: 'Tuyển dụng mới', color: '#2563eb', bg: '#eff6ff', icon: PersonAddOutlinedIcon },
  PROMOTION: { label: 'Thăng chức', color: '#16a34a', bg: '#f0fdf4', icon: TrendingUpOutlinedIcon },
  TRANSFER: { label: 'Điều chuyển bộ phận', color: '#7c3aed', bg: '#f5f3ff', icon: SwapHorizOutlinedIcon },
  SALARY_ADJUSTMENT: { label: 'Điều chỉnh lương', color: '#d97706', bg: '#fffbeb', icon: AttachMoneyOutlinedIcon },
  SALARY_INCREASE: { label: 'Điều chỉnh lương', color: '#d97706', bg: '#fffbeb', icon: AttachMoneyOutlinedIcon },
  ROLE_CHANGE: { label: 'Thay đổi vị trí / Chức danh', color: '#0d9488', bg: '#f0fdfa', icon: SwapHorizOutlinedIcon },
  DEMOTION: { label: 'Giáng chức', color: '#ea580c', bg: '#fff7ed', icon: TrendingDownOutlinedIcon },
  REWARD: { label: 'Khen thưởng', color: '#0284c7', bg: '#f0f9ff', icon: EmojiEventsOutlinedIcon },
  DISCIPLINE: { label: 'Kỷ luật', color: '#dc2626', bg: '#fef2f2', icon: GavelOutlinedIcon },
  RESIGNATION: { label: 'Thôi việc / Nghỉ việc', color: '#64748b', bg: '#f1f5f9', icon: ExitToAppOutlinedIcon },
  TERMINATION: { label: 'Chấm dứt hợp đồng', color: '#64748b', bg: '#f1f5f9', icon: ExitToAppOutlinedIcon },
};

const DOCUMENT_TYPE_CONFIG: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  IDENTITY_CARD: { label: 'CCCD / CMND / Hộ chiếu', color: '#2563eb', bg: '#eff6ff' },
  CCCD: { label: 'CCCD / CMND / Hộ chiếu', color: '#2563eb', bg: '#eff6ff' },
  LABOR_CONTRACT: { label: 'Hợp đồng lao động', color: '#0d9488', bg: '#f0fdfa' },
  DEGREE_CERTIFICATE: { label: 'Bằng cấp / Chứng chỉ', color: '#7c3aed', bg: '#f5f3ff' },
  DEGREE: { label: 'Bằng cấp / Chứng chỉ', color: '#7c3aed', bg: '#f5f3ff' },
  HEALTH_CERTIFICATE: { label: 'Giấy khám sức khỏe', color: '#d97706', bg: '#fffbeb' },
  HEALTH_CERT: { label: 'Giấy khám sức khỏe', color: '#d97706', bg: '#fffbeb' },
  TAX_DOCUMENT: { label: 'Mã số thuế / Giảm trừ gia cảnh', color: '#0284c7', bg: '#f0f9ff' },
  DECISION: { label: 'Quyết định bổ nhiệm / khen thưởng', color: '#16a34a', bg: '#f0fdf4' },
  RESUME: { label: 'Sơ yếu lý lịch', color: '#475569', bg: '#f8fafc' },
  OTHER: { label: 'Tài liệu khác', color: '#64748b', bg: '#f1f5f9' },
};

const formatVND = (val?: number | string | null) => {
  if (!val) return '---';
  const num = Number(val);
  if (isNaN(num)) return '---';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
};

const getDocExpiryStatus = (expiryDate?: string | null) => {
  if (!expiryDate) return { label: 'Vô thời hạn', color: '#64748b', bg: '#f1f5f9', isExpired: false, isExpiringSoon: false };
  const exp = new Date(expiryDate).getTime();
  const now = new Date().getTime();
  const diffDays = Math.ceil((exp - now) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) {
    return { label: `Hết hạn ${Math.abs(diffDays)} ngày`, color: '#dc2626', bg: '#fef2f2', isExpired: true, isExpiringSoon: false };
  }
  if (diffDays <= 30) {
    return { label: `Hết hạn sau ${diffDays} ngày`, color: '#d97706', bg: '#fffbeb', isExpired: false, isExpiringSoon: true };
  }
  return { label: 'Còn hiệu lực', color: '#16a34a', bg: '#f0fdf4', isExpired: false, isExpiringSoon: false };
};

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
  const {
    createEmployee,
    updateEmployee,
    deleteEmployee,
    createCareerHistory,
    deleteCareerHistory,
    createEmployeeDocument,
    deleteEmployeeDocument,
  } = useHrmMutations();

  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState<number | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const [importModalOpen, setImportModalOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);

  const [selectedEmp, setSelectedEmp] = useState<NativeEmployee | null>(null);
  const [detailTab, setDetailTab] = useState<number>(0);

  const { data: careerHistories = [], isLoading: loadingHistories } = useHrmCareerHistories(
    selectedEmp ? { employee_id: selectedEmp.id } : undefined
  );
  const { data: employeeDocuments = [], isLoading: loadingDocuments } = useHrmDocuments(
    selectedEmp ? { employee_id: selectedEmp.id } : undefined
  );

  const [openModal, setOpenModal] = useState(false);
  const [editingEmp, setEditingEmp] = useState<NativeEmployee | null>(null);
  const [deletingEmpId, setDeletingEmpId] = useState<number | null>(null);

  const [openCareerModal, setOpenCareerModal] = useState(false);
  const [careerForm, setCareerForm] = useState({
    event_type: 'PROMOTION',
    effective_date: new Date().toISOString().split('T')[0],
    decision_number: '',
    new_department: '',
    new_designation: '',
    new_salary: '',
    note: '',
  });

  const [openDocModal, setOpenDocModal] = useState(false);
  const [docForm, setDocForm] = useState({
    document_type: 'CCCD',
    name: '',
    file_url: '',
    issue_date: '',
    expiry_date: '',
    note: '',
  });

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
    dependents_count: 0,
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
      dependents_count: 0,
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
      dependents_count: (emp as any).dependents_count ?? (emp as any).dependentsCount ?? 0,
    });
    setOpenModal(true);
  };

  const handleSave = async () => {
    if (!form.first_name || !form.last_name || !form.email) return;
    const payload = {
      ...form,
      department: form.department ? Number(form.department) : null,
      designation: form.designation ? Number(form.designation) : null,
      dependents_count: Number(form.dependents_count || 0),
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

  const handleOpenAddCareer = () => {
    setCareerForm({
      event_type: 'PROMOTION',
      effective_date: new Date().toISOString().split('T')[0],
      decision_number: '',
      new_department: selectedEmp?.department ? String(selectedEmp.department) : '',
      new_designation: selectedEmp?.designation ? String(selectedEmp.designation) : '',
      new_salary: '',
      note: '',
    });
    setOpenCareerModal(true);
  };

  const handleSaveCareer = () => {
    if (!selectedEmp || !careerForm.effective_date) return;
    createCareerHistory.mutate(
      {
        employee: selectedEmp.id,
        event_type: careerForm.event_type as any,
        effective_date: careerForm.effective_date,
        decision_number: careerForm.decision_number || undefined,
        new_department: careerForm.new_department ? Number(careerForm.new_department) : undefined,
        new_designation: careerForm.new_designation ? Number(careerForm.new_designation) : undefined,
        new_salary: careerForm.new_salary ? Number(careerForm.new_salary) : undefined,
        note: careerForm.note || undefined,
      },
      {
        onSuccess: () => {
          setOpenCareerModal(false);
        },
      }
    );
  };

  const handleOpenAddDoc = () => {
    setDocForm({
      document_type: 'CCCD',
      name: '',
      file_url: '',
      issue_date: '',
      expiry_date: '',
      note: '',
    });
    setOpenDocModal(true);
  };

  const handleSaveDoc = () => {
    if (!selectedEmp || !docForm.name) return;
    createEmployeeDocument.mutate(
      {
        employee: selectedEmp.id,
        document_type: docForm.document_type as any,
        name: docForm.name,
        file_url: docForm.file_url || undefined,
        issue_date: docForm.issue_date || undefined,
        expiry_date: docForm.expiry_date || undefined,
        note: docForm.note || undefined,
      },
      {
        onSuccess: () => {
          setOpenDocModal(false);
        },
      }
    );
  };

  const filteredEmployees = employees.filter((emp) => {
    const name = emp.fullName || emp.full_name || '';
    const code = emp.employeeCode || emp.employee_code || '';
    const matchesSearch =
      searchQuery === '' ||
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      code.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
              startIcon={<UploadFileOutlinedIcon sx={{ fontSize: 16 }} />}
              onClick={() => setImportModalOpen(true)}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 700,
                color: '#2563eb',
                borderColor: '#bfdbfe',
                bgcolor: '#eff6ff',
                '&:hover': { bgcolor: '#dbeafe', borderColor: '#93c5fd' },
              }}
            >
              Nhập Excel/CSV
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<FileDownloadOutlinedIcon sx={{ fontSize: 16 }} />}
              onClick={() => setExportModalOpen(true)}
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
              Xuất dữ liệu
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
          <TableContainer sx={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <Table size="medium" sx={{ minWidth: 780 }}>
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
                            {(emp.fullName || emp.full_name)?.charAt(0)?.toUpperCase() || 'E'}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a' }}>
                              {emp.fullName || emp.full_name}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#64748b', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                              {emp.employeeCode || emp.employee_code}
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#1e293b' }}>
                          {emp.designationTitle || emp.designation_title || 'Chưa gán vị trí'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748b' }}>
                          {emp.departmentName || emp.department_name || 'Chưa phân phòng'}
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
                              onClick={() => {
                                setSelectedEmp(emp);
                                setDetailTab(0);
                              }}
                              sx={{ color: '#64748b', '&:hover': { color: '#2563eb' } }}
                            >
                              <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Lịch sử công tác">
                            <IconButton aria-label="Thao tác"
                              size="small"
                              onClick={() => {
                                setSelectedEmp(emp);
                                setDetailTab(1);
                              }}
                              sx={{ color: '#64748b', '&:hover': { color: '#0d9488' } }}
                            >
                              <HistoryOutlinedIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Tài liệu số">
                            <IconButton aria-label="Thao tác"
                              size="small"
                              onClick={() => {
                                setSelectedEmp(emp);
                                setDetailTab(2);
                              }}
                              sx={{ color: '#64748b', '&:hover': { color: '#d97706' } }}
                            >
                              <FolderSharedOutlinedIcon sx={{ fontSize: 18 }} />
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
        PaperProps={{
          sx: {
            width: { xs: '100%', sm: 580, md: 680 },
            p: { xs: 2, sm: 3 },
            bgcolor: '#ffffff',
          },
        }}
      >
        {selectedEmp && (
          <Stack spacing={2.5}>
            {/* Drawer Top Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 900, color: '#0f172a' }}>
                Hồ sơ Nhân viên
              </Typography>
              <IconButton aria-label="Đóng" size="small" onClick={() => setSelectedEmp(null)} sx={{ color: '#64748b' }}>
                <CloseIcon />
              </IconButton>
            </Box>

            {/* Profile Overview Card */}
            <Paper elevation={0} sx={{ p: 2, borderRadius: 2.5, bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar
                  src={selectedEmp.avatar}
                  sx={{ width: 56, height: 56, bgcolor: '#eff6ff', color: '#2563eb', fontWeight: 800, fontSize: '1.25rem' }}
                >
                  {(selectedEmp.fullName || selectedEmp.full_name)?.charAt(0)?.toUpperCase()}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#0f172a', lineHeight: 1.2 }}>
                    {selectedEmp.fullName || selectedEmp.full_name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                    {selectedEmp.employeeCode || selectedEmp.employee_code} • {selectedEmp.department_name || 'Chưa gán PB'}
                  </Typography>
                  <Box sx={{ mt: 0.5 }}>{renderStatusChip(selectedEmp.status)}</Box>
                </Box>
                <Stack direction="row" spacing={1}>
                  <Tooltip title="Chỉnh sửa hồ sơ">
                    <IconButton
                      size="small"
                      onClick={() => handleOpenEdit(selectedEmp)}
                      sx={{ border: '1px solid #e2e8f0', borderRadius: 1.5, color: '#475569' }}
                    >
                      <EditOutlinedIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Xóa nhân sự">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => setDeletingEmpId(selectedEmp.id)}
                      sx={{ border: '1px solid #fee2e2', borderRadius: 1.5 }}
                    >
                      <DeleteOutlineOutlinedIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Stack>
            </Paper>

            {/* Tabs Header */}
            <Tabs
              value={detailTab}
              onChange={(_, val) => setDetailTab(val)}
              variant="fullWidth"
              sx={{
                borderBottom: '1px solid #e2e8f0',
                '& .MuiTab-root': {
                  fontWeight: 700,
                  fontSize: '0.8125rem',
                  textTransform: 'none',
                  minHeight: 44,
                  color: '#64748b',
                  '&.Mui-selected': { color: '#2563eb' },
                },
              }}
            >
              <Tab icon={<BadgeOutlinedIcon sx={{ fontSize: 17 }} />} iconPosition="start" label="Thông tin chung" />
              <Tab
                icon={
                  <Badge badgeContent={careerHistories.length} color="primary" sx={{ '& .MuiBadge-badge': { fontSize: '0.65rem', height: 16, minWidth: 16 } }}>
                    <HistoryOutlinedIcon sx={{ fontSize: 17 }} />
                  </Badge>
                }
                iconPosition="start"
                label="Lịch sử công tác"
              />
              <Tab
                icon={
                  <Badge badgeContent={employeeDocuments.length} color="info" sx={{ '& .MuiBadge-badge': { fontSize: '0.65rem', height: 16, minWidth: 16 } }}>
                    <FolderSharedOutlinedIcon sx={{ fontSize: 17 }} />
                  </Badge>
                }
                iconPosition="start"
                label="Hồ sơ tài liệu số"
              />
            </Tabs>

            {/* Tab 0: General Info */}
            {detailTab === 0 && (
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
                    <Grid size={12}>
                      <Typography variant="caption" sx={{ color: '#64748b' }}>Người phụ thuộc giảm trừ gia cảnh (Thuế TNCN)</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#2563eb' }}>
                        {(selectedEmp as any).dependents_count ?? (selectedEmp as any).dependentsCount ?? 0} người (-{Number(((selectedEmp as any).dependents_count ?? (selectedEmp as any).dependentsCount ?? 0) * 4400000).toLocaleString('vi-VN')} ₫/tháng)
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              </Stack>
            )}

            {/* Tab 1: Career History Timeline */}
            {detailTab === 1 && (
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a' }}>
                    Quá trình Công tác & Biến động ({careerHistories.length})
                  </Typography>
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<AddIcon sx={{ fontSize: 15 }} />}
                    onClick={handleOpenAddCareer}
                    sx={{
                      borderRadius: 1.75,
                      textTransform: 'none',
                      fontWeight: 800,
                      fontSize: '0.75rem',
                      bgcolor: '#2563eb',
                      '&:hover': { bgcolor: '#1d4ed8' },
                    }}
                  >
                    Thêm biến động
                  </Button>
                </Box>

                {loadingHistories ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                    <CircularProgress size={28} />
                  </Box>
                ) : careerHistories.length === 0 ? (
                  <Paper
                    elevation={0}
                    sx={{
                      p: 4,
                      textAlign: 'center',
                      borderRadius: 2.5,
                      bgcolor: '#f8fafc',
                      border: '1px dashed #cbd5e1',
                    }}
                  >
                    <HistoryOutlinedIcon sx={{ fontSize: 36, color: '#94a3b8', mb: 1 }} />
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#475569' }}>
                      Chưa ghi nhận biến động nhân sự nào
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', mb: 2 }}>
                      Ghi nhận thăng chức, điều chuyển bộ phận, tăng lương, khen thưởng hoặc kỷ luật
                    </Typography>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={handleOpenAddCareer}
                      sx={{ borderRadius: 1.75, textTransform: 'none', fontWeight: 700 }}
                    >
                      Tạo bản ghi biến động đầu tiên
                    </Button>
                  </Paper>
                ) : (
                  <Stack spacing={1.5} sx={{ position: 'relative', pl: 2, '&::before': { content: '""', position: 'absolute', left: 7, top: 12, bottom: 12, width: 2, bgcolor: '#e2e8f0' } }}>
                    {careerHistories.map((h) => {
                      const cfg = CAREER_EVENT_CONFIG[h.event_type] || {
                        label: h.event_type,
                        color: '#64748b',
                        bg: '#f1f5f9',
                        icon: HistoryOutlinedIcon,
                      };
                      const IconComp = cfg.icon;
                      return (
                        <Paper
                          key={h.id}
                          elevation={0}
                          sx={{
                            p: 2,
                            borderRadius: 2.5,
                            bgcolor: '#ffffff',
                            border: '1px solid #e2e8f0',
                            position: 'relative',
                            transition: 'border-color 0.2s',
                            '&:hover': { borderColor: cfg.color },
                          }}
                        >
                          <Box
                            sx={{
                              position: 'absolute',
                              left: -19,
                              top: 18,
                              width: 12,
                              height: 12,
                              borderRadius: '50%',
                              bgcolor: cfg.color,
                              border: '2px solid #ffffff',
                              boxShadow: `0 0 0 2px ${cfg.color}33`,
                            }}
                          />

                          <Stack spacing={1}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                                <Chip
                                  icon={<IconComp style={{ fontSize: 15, color: cfg.color }} />}
                                  label={cfg.label}
                                  size="small"
                                  sx={{
                                    bgcolor: cfg.bg,
                                    color: cfg.color,
                                    fontWeight: 800,
                                    fontSize: '0.725rem',
                                    borderRadius: 1.5,
                                  }}
                                />
                                {h.decision_number && (
                                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#334155', bgcolor: '#f1f5f9', px: 1, py: 0.25, borderRadius: 1 }}>
                                    Số QĐ: {h.decision_number}
                                  </Typography>
                                )}
                              </Box>

                              <Stack direction="row" spacing={0.5} alignItems="center">
                                <Typography variant="caption" sx={{ color: '#64748b', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                                  {h.effective_date}
                                </Typography>
                                <Tooltip title="Xóa bản ghi này">
                                  <IconButton
                                    size="small"
                                    onClick={() => deleteCareerHistory.mutate(h.id)}
                                    sx={{ color: '#94a3b8', '&:hover': { color: '#dc2626' } }}
                                  >
                                    <DeleteOutlineOutlinedIcon sx={{ fontSize: 16 }} />
                                  </IconButton>
                                </Tooltip>
                              </Stack>
                            </Box>

                            {/* Transition content */}
                            {(h.old_department_name || h.new_department_name) && (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, fontSize: '0.8125rem' }}>
                                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>Phòng ban:</Typography>
                                <Typography variant="body2" sx={{ fontWeight: 600, color: '#64748b' }}>{h.old_department_name || '---'}</Typography>
                                <ArrowForwardOutlinedIcon sx={{ fontSize: 13, color: '#94a3b8' }} />
                                <Typography variant="body2" sx={{ fontWeight: 800, color: '#0f172a' }}>{h.new_department_name || '---'}</Typography>
                              </Box>
                            )}

                            {(h.old_designation_title || h.new_designation_title) && (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, fontSize: '0.8125rem' }}>
                                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>Chức danh:</Typography>
                                <Typography variant="body2" sx={{ fontWeight: 600, color: '#64748b' }}>{h.old_designation_title || '---'}</Typography>
                                <ArrowForwardOutlinedIcon sx={{ fontSize: 13, color: '#94a3b8' }} />
                                <Typography variant="body2" sx={{ fontWeight: 800, color: '#0f172a' }}>{h.new_designation_title || '---'}</Typography>
                              </Box>
                            )}

                            {(h.old_salary || h.new_salary) && (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, fontSize: '0.8125rem' }}>
                                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>Mức lương:</Typography>
                                <Typography variant="body2" sx={{ fontWeight: 600, color: '#64748b', fontFamily: 'var(--font-mono)' }}>{formatVND(h.old_salary)}</Typography>
                                <ArrowForwardOutlinedIcon sx={{ fontSize: 13, color: '#94a3b8' }} />
                                <Typography variant="body2" sx={{ fontWeight: 800, color: '#16a34a', fontFamily: 'var(--font-mono)' }}>{formatVND(h.new_salary)}</Typography>
                              </Box>
                            )}

                            {h.note && (
                              <Typography variant="caption" sx={{ color: '#64748b', bgcolor: '#f8fafc', p: 1, borderRadius: 1.5, display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                <ChatBubbleOutlineOutlinedIcon sx={{ fontSize: 14, color: '#64748b' }} />
                                <span>{h.note}</span>
                              </Typography>
                            )}
                          </Stack>
                        </Paper>
                      );
                    })}
                  </Stack>
                )}
              </Stack>
            )}

            {/* Tab 2: Digital Document Vault */}
            {detailTab === 2 && (
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a' }}>
                    Hồ sơ & Chứng từ Số ({employeeDocuments.length})
                  </Typography>
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<CloudUploadOutlinedIcon sx={{ fontSize: 15 }} />}
                    onClick={handleOpenAddDoc}
                    sx={{
                      borderRadius: 1.75,
                      textTransform: 'none',
                      fontWeight: 800,
                      fontSize: '0.75rem',
                      bgcolor: '#0d9488',
                      '&:hover': { bgcolor: '#0f766e' },
                    }}
                  >
                    Tải lên tài liệu
                  </Button>
                </Box>

                {loadingDocuments ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                    <CircularProgress size={28} />
                  </Box>
                ) : employeeDocuments.length === 0 ? (
                  <Paper
                    elevation={0}
                    sx={{
                      p: 4,
                      textAlign: 'center',
                      borderRadius: 2.5,
                      bgcolor: '#f8fafc',
                      border: '1px dashed #cbd5e1',
                    }}
                  >
                    <FolderSharedOutlinedIcon sx={{ fontSize: 36, color: '#94a3b8', mb: 1 }} />
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#475569' }}>
                      Chưa có tài liệu số nào được lưu trữ
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', mb: 2 }}>
                      Lưu trữ CCCD/CMND, Hợp đồng lao động, Bằng cấp, Giấy khám sức khỏe dạng tệp số hóa
                    </Typography>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<CloudUploadOutlinedIcon />}
                      onClick={handleOpenAddDoc}
                      sx={{ borderRadius: 1.75, textTransform: 'none', fontWeight: 700 }}
                    >
                      Tải lên tài liệu đầu tiên
                    </Button>
                  </Paper>
                ) : (
                  <Stack spacing={1.5}>
                    {employeeDocuments.map((doc) => {
                      const typeCfg = DOCUMENT_TYPE_CONFIG[doc.document_type] || {
                        label: doc.document_type,
                        color: '#64748b',
                        bg: '#f1f5f9',
                      };
                      const expStatus = getDocExpiryStatus(doc.expiry_date);

                      return (
                        <Paper
                          key={doc.id}
                          elevation={0}
                          sx={{
                            p: 2,
                            borderRadius: 2.5,
                            bgcolor: '#ffffff',
                            border: '1px solid #e2e8f0',
                            transition: 'all 0.2s',
                            '&:hover': { borderColor: '#94a3b8', boxShadow: '0 2px 8px 0 rgba(0,0,0,0.04)' },
                          }}
                        >
                          <Stack spacing={1.25}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <Stack direction="row" spacing={1.5} alignItems="center">
                                <Box
                                  sx={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: 2,
                                    bgcolor: typeCfg.bg,
                                    color: typeCfg.color,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                  }}
                                >
                                  <DescriptionOutlinedIcon sx={{ fontSize: 20 }} />
                                </Box>
                                <Box>
                                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.875rem' }}>
                                    {doc.name}
                                  </Typography>
                                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.25 }}>
                                    <Chip
                                      label={typeCfg.label}
                                      size="small"
                                      sx={{
                                        bgcolor: typeCfg.bg,
                                        color: typeCfg.color,
                                        fontWeight: 800,
                                        fontSize: '0.675rem',
                                        height: 20,
                                        borderRadius: 1,
                                      }}
                                    />
                                    <Chip
                                      label={expStatus.label}
                                      size="small"
                                      sx={{
                                        bgcolor: expStatus.bg,
                                        color: expStatus.color,
                                        fontWeight: 800,
                                        fontSize: '0.675rem',
                                        height: 20,
                                        borderRadius: 1,
                                      }}
                                    />
                                  </Stack>
                                </Box>
                              </Stack>

                              <Stack direction="row" spacing={0.5}>
                                {doc.file_url && (
                                  <Tooltip title="Mở / Tải tệp">
                                    <IconButton
                                      size="small"
                                      onClick={() => window.open(doc.file_url, '_blank')}
                                      sx={{ color: '#2563eb', '&:hover': { bgcolor: '#eff6ff' } }}
                                    >
                                      <LaunchOutlinedIcon sx={{ fontSize: 16 }} />
                                    </IconButton>
                                  </Tooltip>
                                )}
                                <Tooltip title="Xóa tài liệu">
                                  <IconButton
                                    size="small"
                                    onClick={() => deleteEmployeeDocument.mutate(doc.id)}
                                    sx={{ color: '#94a3b8', '&:hover': { color: '#dc2626' } }}
                                  >
                                    <DeleteOutlineOutlinedIcon sx={{ fontSize: 16 }} />
                                  </IconButton>
                                </Tooltip>
                              </Stack>
                            </Box>

                            <Grid container spacing={1} sx={{ pt: 0.5, borderTop: '1px dashed #f1f5f9' }}>
                              {doc.issue_date && (
                                <Grid size={6}>
                                  <Typography variant="caption" sx={{ color: '#94a3b8' }}>Ngày cấp: </Typography>
                                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', fontFamily: 'var(--font-mono)' }}>
                                    {doc.issue_date}
                                  </Typography>
                                </Grid>
                              )}
                              {doc.expiry_date && (
                                <Grid size={6}>
                                  <Typography variant="caption" sx={{ color: '#94a3b8' }}>Hạn dùng: </Typography>
                                  <Typography variant="caption" sx={{ fontWeight: 700, color: expStatus.isExpired ? '#dc2626' : '#475569', fontFamily: 'var(--font-mono)' }}>
                                    {doc.expiry_date}
                                  </Typography>
                                </Grid>
                              )}
                              {doc.note && (
                                <Grid size={12}>
                                  <Typography variant="caption" sx={{ color: '#64748b' }}>
                                    Ghi chú: {doc.note}
                                  </Typography>
                                </Grid>
                              )}
                            </Grid>
                          </Stack>
                        </Paper>
                      );
                    })}
                  </Stack>
                )}
              </Stack>
            )}
          </Stack>
        )}
      </Drawer>

      {/* Create Career History Dialog */}
      <Dialog
        open={openCareerModal}
        onClose={() => setOpenCareerModal(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 900, color: '#0f172a', borderBottom: '1px solid #e2e8f0', p: 2.5 }}>
          Ghi nhận Biến động Nhân sự
        </DialogTitle>
        <DialogContent sx={{ p: 2.5, pt: '20px !important' }}>
          <Stack spacing={2}>
            <Grid container spacing={2}>
              <Grid size={12}>
                <TextField
                  select
                  label="Loại biến động"
                  value={careerForm.event_type}
                  onChange={(e) => setCareerForm({ ...careerForm, event_type: e.target.value })}
                  fullWidth
                  sx={inputSx}
                >
                  {Object.entries(CAREER_EVENT_CONFIG).map(([key, item]) => (
                    <MenuItem key={key} value={key}>{item.label}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={6}>
                <TextField
                  type="date"
                  label="Ngày hiệu lực"
                  slotProps={{ inputLabel: { shrink: true } }}
                  value={careerForm.effective_date}
                  onChange={(e) => setCareerForm({ ...careerForm, effective_date: e.target.value })}
                  fullWidth
                  sx={inputSx}
                />
              </Grid>
              <Grid size={6}>
                <TextField
                  label="Số quyết định"
                  placeholder="VD: QĐ-12/2026/TĐ"
                  value={careerForm.decision_number}
                  onChange={(e) => setCareerForm({ ...careerForm, decision_number: e.target.value })}
                  fullWidth
                  sx={inputSx}
                />
              </Grid>
              <Grid size={6}>
                <TextField
                  select
                  label="Phòng ban mới (nếu có)"
                  value={careerForm.new_department}
                  onChange={(e) => setCareerForm({ ...careerForm, new_department: e.target.value })}
                  fullWidth
                  sx={inputSx}
                >
                  <MenuItem value="">-- Giữ nguyên phòng ban --</MenuItem>
                  {departments.map((d) => (
                    <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={6}>
                <TextField
                  select
                  label="Chức danh mới (nếu có)"
                  value={careerForm.new_designation}
                  onChange={(e) => setCareerForm({ ...careerForm, new_designation: e.target.value })}
                  fullWidth
                  sx={inputSx}
                >
                  <MenuItem value="">-- Giữ nguyên chức danh --</MenuItem>
                  {designations.map((d) => (
                    <MenuItem key={d.id} value={d.id}>{d.title}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={12}>
                <TextField
                  label="Mức lương mới (VNĐ)"
                  type="number"
                  placeholder="VD: 25000000"
                  value={careerForm.new_salary}
                  onChange={(e) => setCareerForm({ ...careerForm, new_salary: e.target.value })}
                  fullWidth
                  sx={inputSx}
                />
              </Grid>
              <Grid size={12}>
                <TextField
                  label="Ghi chú / Căn cứ quyết định"
                  multiline
                  rows={2}
                  value={careerForm.note}
                  onChange={(e) => setCareerForm({ ...careerForm, note: e.target.value })}
                  fullWidth
                  sx={inputSx}
                />
              </Grid>
            </Grid>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, borderTop: '1px solid #e2e8f0' }}>
          <Button onClick={() => setOpenCareerModal(false)} sx={{ fontWeight: 700, color: '#64748b', textTransform: 'none' }}>
            Hủy
          </Button>
          <Button
            variant="contained"
            disabled={!careerForm.effective_date || createCareerHistory.isPending}
            onClick={handleSaveCareer}
            sx={{ fontWeight: 800, borderRadius: 2, textTransform: 'none', bgcolor: '#2563eb' }}
          >
            {createCareerHistory.isPending ? 'Đang lưu...' : 'Lưu biến động'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Employee Document Dialog */}
      <Dialog
        open={openDocModal}
        onClose={() => setOpenDocModal(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 900, color: '#0f172a', borderBottom: '1px solid #e2e8f0', p: 2.5 }}>
          Lưu trữ Hồ sơ Tài liệu số
        </DialogTitle>
        <DialogContent sx={{ p: 2.5, pt: '20px !important' }}>
          <Stack spacing={2}>
            <Grid container spacing={2}>
              <Grid size={6}>
                <TextField
                  select
                  label="Loại tài liệu"
                  value={docForm.document_type}
                  onChange={(e) => setDocForm({ ...docForm, document_type: e.target.value })}
                  fullWidth
                  sx={inputSx}
                >
                  {Object.entries(DOCUMENT_TYPE_CONFIG).map(([key, item]) => (
                    <MenuItem key={key} value={key}>{item.label}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={6}>
                <TextField
                  label="Tên tài liệu / Chứng từ"
                  placeholder="VD: CCCD 2 mặt scan, HĐLĐ 2026..."
                  value={docForm.name}
                  onChange={(e) => setDocForm({ ...docForm, name: e.target.value })}
                  fullWidth
                  sx={inputSx}
                />
              </Grid>
              <Grid size={12}>
                <TextField
                  label="Đường dẫn tệp / URL lưu trữ (S3 / Cloud)"
                  placeholder="https://s3.infohr.vn/documents/..."
                  value={docForm.file_url}
                  onChange={(e) => setDocForm({ ...docForm, file_url: e.target.value })}
                  fullWidth
                  sx={inputSx}
                />
              </Grid>
              <Grid size={6}>
                <TextField
                  type="date"
                  label="Ngày cấp (nếu có)"
                  slotProps={{ inputLabel: { shrink: true } }}
                  value={docForm.issue_date}
                  onChange={(e) => setDocForm({ ...docForm, issue_date: e.target.value })}
                  fullWidth
                  sx={inputSx}
                />
              </Grid>
              <Grid size={6}>
                <TextField
                  type="date"
                  label="Ngày hết hạn (nếu có)"
                  slotProps={{ inputLabel: { shrink: true } }}
                  value={docForm.expiry_date}
                  onChange={(e) => setDocForm({ ...docForm, expiry_date: e.target.value })}
                  fullWidth
                  sx={inputSx}
                />
              </Grid>
              <Grid size={12}>
                <TextField
                  label="Ghi chú hồ sơ"
                  multiline
                  rows={2}
                  value={docForm.note}
                  onChange={(e) => setDocForm({ ...docForm, note: e.target.value })}
                  fullWidth
                  sx={inputSx}
                />
              </Grid>
            </Grid>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, borderTop: '1px solid #e2e8f0' }}>
          <Button onClick={() => setOpenDocModal(false)} sx={{ fontWeight: 700, color: '#64748b', textTransform: 'none' }}>
            Hủy
          </Button>
          <Button
            variant="contained"
            disabled={!docForm.name || createEmployeeDocument.isPending}
            onClick={handleSaveDoc}
            sx={{ fontWeight: 800, borderRadius: 2, textTransform: 'none', bgcolor: '#0d9488', '&:hover': { bgcolor: '#0f766e' } }}
          >
            {createEmployeeDocument.isPending ? 'Đang lưu...' : 'Lưu tài liệu'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create / Edit Employee Dialog */}
      <Dialog
        open={openModal}
        onClose={() => setOpenModal(false)}
        fullWidth
        maxWidth="md"
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 900, color: '#0f172a', borderBottom: '1px solid #e2e8f0', p: 2.5 }}>
          {editingEmp ? `Chỉnh sửa Hồ sơ: ${editingEmp.fullName || editingEmp.full_name}` : 'Tạo mới Hồ sơ Nhân sự'}
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
              <Grid size={12}>
                <TextField
                  label="Số người phụ thuộc (Giảm trừ thuế TNCN)"
                  type="number"
                  placeholder="0"
                  value={form.dependents_count}
                  onChange={(e) => setForm({ ...form, dependents_count: Math.max(0, Number(e.target.value)) })}
                  helperText="Mỗi người phụ thuộc được giảm trừ 4.400.000 VNĐ/tháng khi tính thuế TNCN Gross-Net"
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

      {/* Export Modal */}
      <ExportModal
        open={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        defaultFileName="DanhSachNhanVien"
        columns={[]}
        entity="employee"
        totalRecords={{
          all: employees.length,
          filtered: employees.length,
          selected: 0,
        }}
      />

      {/* Import Modal */}
      <ImportModal
        open={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        entity="employee"
        title="Nhập danh sách nhân sự (HRM Employee Import)"
        onSuccess={() => {
          refetch();
        }}
      />
    </Box>
  );
}
