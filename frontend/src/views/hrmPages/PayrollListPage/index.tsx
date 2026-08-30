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
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import CalculateOutlinedIcon from '@mui/icons-material/CalculateOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined';
import CloseIcon from '@mui/icons-material/Close';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import MonetizationOnOutlinedIcon from '@mui/icons-material/MonetizationOnOutlined';
import CorporateFareOutlinedIcon from '@mui/icons-material/CorporateFareOutlined';

import {
  useHrmPayrollList,
  useHrmPayrollKPIs,
  useHrmMutations,
} from '../hooks/useHrmQueries';
import { NativeMonthlyPayrollRecord } from '@/services/hrmService';
import { TabTitle } from '@/utils/generalFunction';
import pc from '@/utils/muiColors';

const formatVND = (num: number | string | undefined | null) => {
  if (num === undefined || num === null) return '0 ₫';
  return Number(num).toLocaleString('vi-VN') + ' ₫';
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

export default function PayrollListPage() {
  TabTitle('Bảng Lương & Chi Phí Nhân Sự | InfoHR HRM');

  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState<number>(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(currentDate.getFullYear());
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  const queryParams = {
    month: selectedMonth,
    year: selectedYear,
    ...(selectedStatus !== 'ALL' ? { status: selectedStatus } : {}),
  };

  const { data: payrollRecords = [], isLoading: listLoading, refetch } = useHrmPayrollList(queryParams);
  const { data: kpis, isLoading: kpisLoading } = useHrmPayrollKPIs({ month: selectedMonth, year: selectedYear });
  const { calculateMonthlyPayroll, approveAllPayroll, markPaidAllPayroll } = useHrmMutations();

  const [openCalcModal, setOpenCalcModal] = useState(false);
  const [calcForm, setCalcForm] = useState({
    month: selectedMonth,
    year: selectedYear,
    standard_working_days: 22,
    bonus: 0,
  });

  const [viewingPayslip, setViewingPayslip] = useState<NativeMonthlyPayrollRecord | null>(null);

  const handleRunCalculate = () => {
    calculateMonthlyPayroll.mutate(calcForm, {
      onSuccess: () => {
        setOpenCalcModal(false);
        refetch();
      },
    });
  };

  const handleApproveAll = () => {
    approveAllPayroll.mutate({ month: selectedMonth, year: selectedYear });
  };

  const handleMarkPaidAll = () => {
    markPaidAllPayroll.mutate({ month: selectedMonth, year: selectedYear });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Box sx={{ width: '100%', pb: 6 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={700} color="text.primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ReceiptLongOutlinedIcon color="primary" /> Quản lý Bảng Lương & Chi Phí Doanh Nghiệp
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Tính toán Gross sang Net chuẩn luật Thuế TNCN & BHXH Việt Nam, theo dõi chi phí nhân sự
          </Typography>
        </Box>
        <Stack direction="row" spacing={1.5}>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<CalculateOutlinedIcon />}
            onClick={() => setOpenCalcModal(true)}
            sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2 }}
          >
            Tính Bảng Lương Tháng
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<CheckCircleOutlineIcon />}
            onClick={handleApproveAll}
            disabled={approveAllPayroll.isPending || !payrollRecords.some((r) => r.status === 'DRAFT')}
            sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2 }}
          >
            Duyệt Toàn Bộ
          </Button>
          <Button
            variant="contained"
            color="success"
            startIcon={<PaymentsOutlinedIcon />}
            onClick={handleMarkPaidAll}
            disabled={markPaidAllPayroll.isPending || !payrollRecords.some((r) => r.status === 'APPROVED')}
            sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2 }}
          >
            Đánh Dấu Đã Chi Trả
          </Button>
        </Stack>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Card sx={{ p: 2, borderRadius: 3, border: '1px solid', borderColor: pc.divider(0.9) }}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Box sx={{ p: 1.2, borderRadius: 2, bgcolor: '#eff6ff', color: '#2563eb' }}>
                <AccountBalanceWalletOutlinedIcon />
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                  Tổng Lương Gross
                </Typography>
                <Typography variant="h6" fontWeight={700} color="text.primary">
                  {formatVND(kpis?.total_gross)}
                </Typography>
              </Box>
            </Stack>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Card sx={{ p: 2, borderRadius: 3, border: '1px solid', borderColor: pc.divider(0.9) }}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Box sx={{ p: 1.2, borderRadius: 2, bgcolor: '#f0fdf4', color: '#16a34a' }}>
                <MonetizationOnOutlinedIcon />
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                  Tổng Lương Net (Thực nhận)
                </Typography>
                <Typography variant="h6" fontWeight={700} color="#16a34a">
                  {formatVND(kpis?.total_net)}
                </Typography>
              </Box>
            </Stack>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Card sx={{ p: 2, borderRadius: 3, border: '1px solid', borderColor: pc.divider(0.9) }}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Box sx={{ p: 1.2, borderRadius: 2, bgcolor: '#fffbeb', color: '#d97706' }}>
                <ReceiptLongOutlinedIcon />
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                  Tổng Thuế TNCN
                </Typography>
                <Typography variant="h6" fontWeight={700} color="#d97706">
                  {formatVND(kpis?.total_pit)}
                </Typography>
              </Box>
            </Stack>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Card sx={{ p: 2, borderRadius: 3, border: '1px solid', borderColor: pc.divider(0.9) }}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Box sx={{ p: 1.2, borderRadius: 2, bgcolor: '#faf5ff', color: '#9333ea' }}>
                <ReceiptLongOutlinedIcon />
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                  BH NSDLĐ Đóng (23.5%)
                </Typography>
                <Typography variant="h6" fontWeight={700} color="#9333ea">
                  {formatVND(kpis?.total_employer_insurance)}
                </Typography>
              </Box>
            </Stack>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Card sx={{ p: 2, borderRadius: 3, border: '1px solid', borderColor: pc.divider(0.9) }}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Box sx={{ p: 1.2, borderRadius: 2, bgcolor: '#fef2f2', color: '#dc2626' }}>
                <CorporateFareOutlinedIcon />
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                  Tổng Chi Phí Doanh Nghiệp
                </Typography>
                <Typography variant="h6" fontWeight={700} color="#dc2626">
                  {formatVND(kpis?.total_company_expense)}
                </Typography>
              </Box>
            </Stack>
          </Card>
        </Grid>
      </Grid>

      {/* Filter Bar */}
      <Card sx={{ p: 2, mb: 3, borderRadius: 3, border: '1px solid', borderColor: pc.divider(0.9) }}>
        <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
          <TextField
            select
            label="Tháng"
            size="small"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            sx={{ minWidth: 120, ...inputSx }}
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <MenuItem key={m} value={m}>
                Tháng {m}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Năm"
            size="small"
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            sx={{ minWidth: 120, ...inputSx }}
          >
            {[2024, 2025, 2026, 2027].map((y) => (
              <MenuItem key={y} value={y}>
                Năm {y}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Trạng thái"
            size="small"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            sx={{ minWidth: 160, ...inputSx }}
          >
            <MenuItem value="ALL">Tất cả trạng thái</MenuItem>
            <MenuItem value="DRAFT">Bản nháp</MenuItem>
            <MenuItem value="APPROVED">Đã phê duyệt</MenuItem>
            <MenuItem value="PAID">Đã chi trả</MenuItem>
          </TextField>

          <Box sx={{ flexGrow: 1 }} />
          <Typography variant="body2" color="text.secondary">
            Tìm thấy <b>{payrollRecords.length}</b> bản ghi lương tháng {selectedMonth}/{selectedYear}
          </Typography>
        </Stack>
      </Card>

      {/* Table */}
      <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: pc.divider(0.9), overflow: 'hidden' }}>
        <TableContainer component={Paper} elevation={0}>
          <Table>
            <TableHead sx={{ bgcolor: pc.bgDefault(0.5) }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Mã NV</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Nhân viên</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Phòng ban</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">Lương Gross</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="center">Công TT / Chuẩn</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">Tổng Thu Nhập</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">BH NLĐ (10.5%)</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">Thuế TNCN</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">Lương Net (Thực nhận)</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">Chi Phí Cty (NSDLĐ)</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="center">Trạng thái</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="center">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {listLoading ? (
                <TableRow>
                  <TableCell colSpan={12} align="center" sx={{ py: 6 }}>
                    <CircularProgress size={32} />
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Đang tải bảng lương...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : payrollRecords.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={12} align="center" sx={{ py: 6 }}>
                    <Typography variant="body1" color="text.secondary">
                      Chưa có dữ liệu bảng lương tháng {selectedMonth}/{selectedYear}.
                    </Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<CalculateOutlinedIcon />}
                      onClick={() => setOpenCalcModal(true)}
                      sx={{ mt: 1.5, textTransform: 'none', borderRadius: 2 }}
                    >
                      Bấm vào đây để tính lương ngay
                    </Button>
                  </TableCell>
                </TableRow>
              ) : (
                payrollRecords.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell sx={{ fontWeight: 600, color: 'primary.main' }}>
                      {row.employee_code}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{row.employee_name}</TableCell>
                    <TableCell>{row.department_name || '-'}</TableCell>
                    <TableCell align="right">{formatVND(row.gross_salary)}</TableCell>
                    <TableCell align="center">
                      <Chip
                        size="small"
                        label={`${row.working_days_actual} / ${row.standard_working_days}`}
                        sx={{ bgcolor: pc.bgDefault(0.6), fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                      {formatVND(row.total_income)}
                    </TableCell>
                    <TableCell align="right" sx={{ color: '#dc2626' }}>
                      -{formatVND(row.total_insurance)}
                    </TableCell>
                    <TableCell align="right" sx={{ color: '#d97706' }}>
                      -{formatVND(row.personal_income_tax)}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, color: '#16a34a', fontSize: '0.95rem' }}>
                      {formatVND(row.net_salary)}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, color: '#9333ea' }}>
                      {formatVND(row.total_company_expense)}
                    </TableCell>
                    <TableCell align="center">
                      {row.status === 'PAID' ? (
                        <Chip size="small" label="Đã chi trả" color="success" sx={{ fontWeight: 600 }} />
                      ) : row.status === 'APPROVED' ? (
                        <Chip size="small" label="Đã duyệt" color="info" sx={{ fontWeight: 600 }} />
                      ) : (
                        <Chip size="small" label="Bản nháp" color="warning" sx={{ fontWeight: 600 }} />
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Xem phiếu lương chi tiết">
                        <IconButton size="small" color="primary" onClick={() => setViewingPayslip(row)}>
                          <ReceiptLongOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Calculate Payroll Modal */}
      <Dialog open={openCalcModal} onClose={() => setOpenCalcModal(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          <CalculateOutlinedIcon color="primary" sx={{ verticalAlign: 'middle', mr: 1 }} />
          Tính Bảng Lương Tháng
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              select
              label="Tháng tính lương"
              fullWidth
              size="small"
              value={calcForm.month}
              onChange={(e) => setCalcForm({ ...calcForm, month: Number(e.target.value) })}
              sx={inputSx}
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <MenuItem key={m} value={m}>
                  Tháng {m}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Năm tính lương"
              fullWidth
              size="small"
              value={calcForm.year}
              onChange={(e) => setCalcForm({ ...calcForm, year: Number(e.target.value) })}
              sx={inputSx}
            >
              {[2024, 2025, 2026, 2027].map((y) => (
                <MenuItem key={y} value={y}>
                  Năm {y}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Ngày công chuẩn trong tháng"
              type="number"
              fullWidth
              size="small"
              value={calcForm.standard_working_days}
              onChange={(e) => setCalcForm({ ...calcForm, standard_working_days: Number(e.target.value) })}
              helperText="Số ngày công tiêu chuẩn (thường là 22 hoặc 26 ngày)"
              sx={inputSx}
            />

            <TextField
              label="Thưởng bổ sung (VND)"
              type="number"
              fullWidth
              size="small"
              value={calcForm.bonus}
              onChange={(e) => setCalcForm({ ...calcForm, bonus: Number(e.target.value) })}
              sx={inputSx}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenCalcModal(false)} sx={{ textTransform: 'none' }}>
            Hủy
          </Button>
          <Button
            variant="contained"
            onClick={handleRunCalculate}
            disabled={calculateMonthlyPayroll.isPending}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            {calculateMonthlyPayroll.isPending ? 'Đang tính toán...' : 'Bắt đầu tính'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Payslip Detail Modal */}
      {viewingPayslip && (
        <Dialog open={Boolean(viewingPayslip)} onClose={() => setViewingPayslip(null)} maxWidth="md" fullWidth>
          <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
            <Typography variant="h6" fontWeight={700}>
              PHIẾU LƯƠNG NHÂN VIÊN (PAYSLIP) - THÁNG {viewingPayslip.month}/{viewingPayslip.year}
            </Typography>
            <IconButton size="small" onClick={() => setViewingPayslip(null)}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers sx={{ p: 3 }}>
            {/* Header info */}
            <Grid container spacing={2} sx={{ mb: 2.5, bgcolor: pc.bgDefault(0.4), p: 2, borderRadius: 2 }}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" color="text.secondary">Họ và tên:</Typography>
                <Typography variant="subtitle1" fontWeight={700}>{viewingPayslip.employee_name}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>Mã nhân viên:</Typography>
                <Typography variant="body2" fontWeight={600}>{viewingPayslip.employee_code}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" color="text.secondary">Phòng ban:</Typography>
                <Typography variant="body2" fontWeight={600}>{viewingPayslip.department_name || 'Chưa phân bổ'}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>Ngày công thực tế:</Typography>
                <Typography variant="body2" fontWeight={600}>
                  {viewingPayslip.working_days_actual} / {viewingPayslip.standard_working_days} ngày
                </Typography>
              </Grid>
            </Grid>

            {/* Income & Deductions side by side */}
            <Grid container spacing={3}>
              {/* Cột 1: Thu nhập */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="subtitle2" fontWeight={700} color="primary.main" sx={{ mb: 1.5 }}>
                  1. CÁC KHOẢN THU NHẬP (INCOME)
                </Typography>
                <Stack spacing={1}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Lương Gross hợp đồng:</Typography>
                    <Typography variant="body2" fontWeight={600}>{formatVND(viewingPayslip.gross_salary)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Phụ cấp:</Typography>
                    <Typography variant="body2" fontWeight={600}>{formatVND(viewingPayslip.allowance)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Thưởng:</Typography>
                    <Typography variant="body2" fontWeight={600}>{formatVND(viewingPayslip.bonus)}</Typography>
                  </Box>
                  <Divider />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" fontWeight={700}>Tổng thu nhập:</Typography>
                    <Typography variant="body2" fontWeight={700} color="primary.main">{formatVND(viewingPayslip.total_income)}</Typography>
                  </Box>
                </Stack>
              </Grid>

              {/* Cột 2: Giảm trừ Người lao động */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="subtitle2" fontWeight={700} color="error.main" sx={{ mb: 1.5 }}>
                  2. GIẢM TRỪ NGƯỜI LAO ĐỘNG (DEDUCTIONS)
                </Typography>
                <Stack spacing={1}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">BHXH (8%):</Typography>
                    <Typography variant="body2" fontWeight={600}>{formatVND(viewingPayslip.bhxh_amount)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">BHYT (1.5%):</Typography>
                    <Typography variant="body2" fontWeight={600}>{formatVND(viewingPayslip.bhyt_amount)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">BHTN (1%):</Typography>
                    <Typography variant="body2" fontWeight={600}>{formatVND(viewingPayslip.bhtn_amount)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Thuế TNCN lũy tiến:</Typography>
                    <Typography variant="body2" fontWeight={600}>{formatVND(viewingPayslip.personal_income_tax)}</Typography>
                  </Box>
                  <Divider />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" fontWeight={700}>Tổng giảm trừ:</Typography>
                    <Typography variant="body2" fontWeight={700} color="error.main">
                      {formatVND(Number(viewingPayslip.total_insurance) + Number(viewingPayslip.personal_income_tax))}
                    </Typography>
                  </Box>
                </Stack>
              </Grid>
            </Grid>

            {/* Net Salary Highlight Box */}
            <Box sx={{ mt: 3, p: 2, bgcolor: '#f0fdf4', borderRadius: 2, border: '1px solid #86efac', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" fontWeight={700} color="#166534">
                THỰC LĨNH (NET SALARY):
              </Typography>
              <Typography variant="h5" fontWeight={800} color="#15803d">
                {formatVND(viewingPayslip.net_salary)}
              </Typography>
            </Box>

            {/* Chi phí NSDLĐ đóng */}
            <Box sx={{ mt: 3, p: 2, bgcolor: '#faf5ff', borderRadius: 2, border: '1px solid #e9d5ff' }}>
              <Typography variant="subtitle2" fontWeight={700} color="#6b21a8" sx={{ mb: 1 }}>
                3. CHI PHÍ DOANH NGHIỆP ĐÓNG BẢO HIỂM (EMPLOYER CONTRIBUTIONS - 23.5%)
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Typography variant="caption" color="text.secondary">BHXH (17.5%):</Typography>
                  <Typography variant="body2" fontWeight={600}>{formatVND(viewingPayslip.employer_bhxh)}</Typography>
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Typography variant="caption" color="text.secondary">BHYT (3%):</Typography>
                  <Typography variant="body2" fontWeight={600}>{formatVND(viewingPayslip.employer_bhyt)}</Typography>
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Typography variant="caption" color="text.secondary">BHTN (1%):</Typography>
                  <Typography variant="body2" fontWeight={600}>{formatVND(viewingPayslip.employer_bhtn)}</Typography>
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Typography variant="caption" color="text.secondary">Công đoàn (2%):</Typography>
                  <Typography variant="body2" fontWeight={600}>{formatVND(viewingPayslip.employer_union_fee)}</Typography>
                </Grid>
              </Grid>
              <Divider sx={{ my: 1.5 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" fontWeight={700} color="#6b21a8">
                  Tổng chi phí nhân sự Doanh nghiệp chi trả:
                </Typography>
                <Typography variant="subtitle1" fontWeight={700} color="#7e22ce">
                  {formatVND(viewingPayslip.total_company_expense)}
                </Typography>
              </Box>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button startIcon={<PrintOutlinedIcon />} onClick={handlePrint} sx={{ textTransform: 'none' }}>
              In Phiếu Lương
            </Button>
            <Button variant="contained" onClick={() => setViewingPayslip(null)} sx={{ textTransform: 'none' }}>
              Đóng
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
}
