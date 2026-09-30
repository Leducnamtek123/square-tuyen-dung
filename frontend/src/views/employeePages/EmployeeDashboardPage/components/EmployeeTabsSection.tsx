'use client';

import React, { useState } from 'react';
import {
  Box,
  Card,
  Typography,
  Tabs,
  Tab,
  Stack,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  CircularProgress,
  Grid2 as Grid,
} from '@mui/material';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import BeachAccessOutlinedIcon from '@mui/icons-material/BeachAccessOutlined';
import ReceiptOutlinedIcon from '@mui/icons-material/ReceiptOutlined';
import HistoryToggleOffOutlinedIcon from '@mui/icons-material/HistoryToggleOffOutlined';
import AddIcon from '@mui/icons-material/Add';
import type {
  NativeEmployee,
  NativeContract,
  NativeLeaveBalance,
  NativeMonthlyPayrollRecord,
} from '@/services/hrmService';
import hrmService from '@/services/hrmService';
import toastMessages from '@/utils/toastMessages';
import dayjs from 'dayjs';

interface Props {
  employee?: NativeEmployee;
  activeContract?: NativeContract | null;
  leaveBalances?: NativeLeaveBalance[];
  recentPayrolls?: NativeMonthlyPayrollRecord[];
  recentAttendanceSummaries?: any[];
  onRefresh: () => void;
}

export const EmployeeTabsSection: React.FC<Props> = ({
  employee,
  activeContract,
  leaveBalances = [],
  recentPayrolls = [],
  recentAttendanceSummaries = [],
  onRefresh,
}) => {
  const [tabIndex, setTabIndex] = useState(0);

  // Leave Request Dialog state
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);
  const [leaveType, setLeaveType] = useState<string>('ANNUAL');
  const [startDate, setStartDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [endDate, setEndDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [totalDays, setTotalDays] = useState(1);
  const [leaveReason, setLeaveReason] = useState('');
  const [submittingLeave, setSubmittingLeave] = useState(false);

  const handleOpenLeaveModal = () => {
    setLeaveModalOpen(true);
  };

  const handleCloseLeaveModal = () => {
    setLeaveModalOpen(false);
    setLeaveReason('');
  };

  const handleSubmitLeaveRequest = async () => {
    if (!leaveReason.trim()) {
      toastMessages.error('Vui lòng nhập lý do xin nghỉ phép.');
      return;
    }
    setSubmittingLeave(true);
    try {
      await hrmService.createLeaveRequest({
        employee: employee?.id,
        start_date: startDate,
        end_date: endDate,
        total_days: Number(totalDays),
        reason: leaveReason,
      });
      toastMessages.success('Gửi đơn xin nghỉ phép thành công. Vui lòng chờ quản lý phê duyệt.');
      handleCloseLeaveModal();
      onRefresh();
    } catch (err: any) {
      console.error('Leave request error:', err);
      toastMessages.error(err?.message || 'Có lỗi xảy ra khi tạo đơn nghỉ phép.');
    } finally {
      setSubmittingLeave(false);
    }
  };

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: '16px',
        bgcolor: '#ffffff',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)',
        mb: 4,
      }}
    >
      <Box sx={{ borderBottom: 1, borderColor: '#e2e8f0', px: 3, pt: 2 }}>
        <Tabs
          value={tabIndex}
          onChange={(_, val) => setTabIndex(val)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            '& .MuiTab-root': {
              fontWeight: 700,
              fontSize: '0.9375rem',
              textTransform: 'none',
              minHeight: 48,
              color: '#64748b',
              '&.Mui-selected': {
                color: '#2563eb',
              },
            },
          }}
        >
          <Tab icon={<DescriptionOutlinedIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Hồ sơ & Hợp đồng" />
          <Tab icon={<BeachAccessOutlinedIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Quản lý Nghỉ phép" />
          <Tab icon={<ReceiptOutlinedIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Phiếu lương cá nhân" />
          <Tab icon={<HistoryToggleOffOutlinedIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Lịch sử Chấm công" />
        </Tabs>
      </Box>

      <Box sx={{ p: 3 }}>
        {/* TAB 0: HỒ SƠ & HỢP ĐỒNG */}
        {tabIndex === 0 && (
          <Grid container spacing={3}>
            {/* Cột 1: Thông tin Hợp đồng */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Card
                variant="outlined"
                sx={{ p: 2.5, borderRadius: '12px', bgcolor: '#f8fafc', height: '100%' }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', mb: 2 }}>
                  📄 Hợp đồng Lao động hiện hành
                </Typography>
                {activeContract ? (
                  <Stack spacing={1.5}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" sx={{ color: '#64748b' }}>Số hợp đồng:</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a' }}>{activeContract.contract_number || activeContract.contractNumber}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" sx={{ color: '#64748b' }}>Loại hợp đồng:</Typography>
                      <Chip
                        label={
                          (activeContract.contract_type || activeContract.contractType) === 'PROBATION'
                            ? 'Thử việc'
                            : 'Xác định thời hạn'
                        }
                        size="small"
                        color="primary"
                        variant="outlined"
                        sx={{ fontWeight: 700, height: 24 }}
                      />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" sx={{ color: '#64748b' }}>Ngày bắt đầu:</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{dayjs(activeContract.start_date || activeContract.startDate).format('DD/MM/YYYY')}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" sx={{ color: '#64748b' }}>Lương cơ bản:</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 800, color: '#16a34a' }}>
                        {Number(activeContract.base_salary || activeContract.baseSalary || 0).toLocaleString('vi-VN')} đ
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" sx={{ color: '#64748b' }}>Phụ cấp thỏa thuận:</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {Number(activeContract.allowance || 0).toLocaleString('vi-VN')} đ
                      </Typography>
                    </Box>
                  </Stack>
                ) : (
                  <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                    Chưa có hợp đồng nào đang kích hoạt.
                  </Typography>
                )}
              </Card>
            </Grid>

            {/* Cột 2: Thông tin nhân sự cá nhân */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Card
                variant="outlined"
                sx={{ p: 2.5, borderRadius: '12px', bgcolor: '#f8fafc', height: '100%' }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', mb: 2 }}>
                  👤 Thông tin Hành chính & Thuế
                </Typography>
                <Stack spacing={1.5}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" sx={{ color: '#64748b' }}>Email công việc:</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{employee?.email || 'Chưa có'}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" sx={{ color: '#64748b' }}>Số điện thoại:</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{employee?.phone || 'Chưa cập nhật'}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" sx={{ color: '#64748b' }}>Mã số thuế (MST):</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{employee?.tax_id || 'Chưa nộp'}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" sx={{ color: '#64748b' }}>Tài khoản Ngân hàng:</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#2563eb' }}>
                      {employee?.bank_account_number
                        ? `${employee.bank_account_number} (${employee.bank_name || 'Ngân hàng'})`
                        : 'Chưa cập nhật'}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" sx={{ color: '#64748b' }}>Người phụ thuộc:</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{employee?.dependents_count || 0} người</Typography>
                  </Box>
                </Stack>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* TAB 1: NGHỈ PHÉP */}
        {tabIndex === 1 && (
          <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2.5 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a' }}>
                Chi tiết Quỹ phép Năm {dayjs().year()}
              </Typography>
              <Button
                variant="contained"
                color="primary"
                size="small"
                startIcon={<AddIcon />}
                onClick={handleOpenLeaveModal}
                sx={{ textTransform: 'none', borderRadius: '8px', fontWeight: 700 }}
              >
                Xin nghỉ phép
              </Button>
            </Stack>

            <TableContainer component={Paper} elevation={0} variant="outlined" sx={{ borderRadius: '12px', mb: 3 }}>
              <Table size="small">
                <TableHead sx={{ bgcolor: '#f8fafc' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Loại phép</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>Phép tiêu chuẩn</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>Phép thâm niên</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>Tồn năm trước</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>Đã sử dụng</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>Đang chờ duyệt</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>Còn lại</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {leaveBalances.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 3, color: '#94a3b8' }}>
                        Chưa có dữ liệu quỹ phép năm nay.
                      </TableCell>
                    </TableRow>
                  ) : (
                    leaveBalances.map((item) => (
                      <TableRow key={item.id} hover>
                        <TableCell sx={{ fontWeight: 700, color: '#0f172a' }}>
                          {item.leave_type_name || item.leaveTypeName || 'Phép năm chuẩn'}
                        </TableCell>
                        <TableCell align="center">{item.allocated_days ?? item.allocatedDays ?? 12}</TableCell>
                        <TableCell align="center">{item.seniority_bonus_days ?? item.seniorityBonusDays ?? 0}</TableCell>
                        <TableCell align="center">{item.carried_over_days ?? item.carriedOverDays ?? 0}</TableCell>
                        <TableCell align="center" sx={{ color: '#dc2626', fontWeight: 600 }}>{item.used_days ?? item.usedDays ?? 0}</TableCell>
                        <TableCell align="center" sx={{ color: '#d97706', fontWeight: 600 }}>{item.pending_days ?? item.pendingDays ?? 0}</TableCell>
                        <TableCell align="right" sx={{ color: '#16a34a', fontWeight: 800, fontSize: '0.9375rem' }}>
                          {Number(item.remaining_days ?? item.remainingDays ?? 12).toFixed(1)} ngày
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {/* TAB 2: PHIẾU LƯƠNG */}
        {tabIndex === 2 && (
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', mb: 2 }}>
              💵 Lịch sử Phiếu lương 6 tháng gần nhất
            </Typography>

            <TableContainer component={Paper} elevation={0} variant="outlined" sx={{ borderRadius: '12px' }}>
              <Table size="small">
                <TableHead sx={{ bgcolor: '#f8fafc' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Kỳ lương</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>Lương cơ bản</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>Phụ cấp</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>BHXH (10.5%)</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>Thuế TNCN</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>Thực nhận (Net)</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>Trạng thái</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentPayrolls.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 3, color: '#94a3b8' }}>
                        Chưa có dữ liệu phiếu lương nào được chốt.
                      </TableCell>
                    </TableRow>
                  ) : (
                    recentPayrolls.map((payroll) => (
                      <TableRow key={payroll.id} hover>
                        <TableCell sx={{ fontWeight: 800, color: '#0f172a' }}>
                          Tháng {payroll.month}/{payroll.year}
                        </TableCell>
                        <TableCell align="right">
                          {Number(payroll.gross_salary || payroll.grossSalary || payroll.base_salary || payroll.baseSalary || 0).toLocaleString('vi-VN')} đ
                        </TableCell>
                        <TableCell align="right">
                          {Number(payroll.allowance || 0).toLocaleString('vi-VN')} đ
                        </TableCell>
                        <TableCell align="right" sx={{ color: '#dc2626' }}>
                          -{Number(payroll.total_insurance || payroll.totalInsurance || 0).toLocaleString('vi-VN')} đ
                        </TableCell>
                        <TableCell align="right" sx={{ color: '#dc2626' }}>
                          -{Number(payroll.personal_income_tax || payroll.personalIncomeTax || payroll.pit_amount || payroll.pitAmount || 0).toLocaleString('vi-VN')} đ
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 800, color: '#16a34a', fontSize: '0.9375rem' }}>
                          {Number(payroll.net_salary || payroll.netSalary || 0).toLocaleString('vi-VN')} đ
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={(payroll.status || 'PAID') === 'PAID' ? 'Đã chi trả' : 'Chờ duyệt'}
                            size="small"
                            color={(payroll.status || 'PAID') === 'PAID' ? 'success' : 'warning'}
                            sx={{ fontWeight: 700, height: 22, fontSize: '0.75rem' }}
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {/* TAB 3: LỊCH SỬ CHẤM CÔNG */}
        {tabIndex === 3 && (
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', mb: 2 }}>
              ⏰ Tóm tắt Chấm công & Ngày công theo tháng
            </Typography>

            <TableContainer component={Paper} elevation={0} variant="outlined" sx={{ borderRadius: '12px' }}>
              <Table size="small">
                <TableHead sx={{ bgcolor: '#f8fafc' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Tháng/Năm</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>Công chuẩn</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>Công thực tế</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>Nghỉ có lương</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>Nghỉ không lương</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>Đi muộn (lần)</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>Tổng phút muộn</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentAttendanceSummaries.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 3, color: '#94a3b8' }}>
                        Chưa có dữ liệu bảng chấm công tháng nào được tổng hợp.
                      </TableCell>
                    </TableRow>
                  ) : (
                    recentAttendanceSummaries.map((summary: any, idx: number) => (
                      <TableRow key={idx} hover>
                        <TableCell sx={{ fontWeight: 800, color: '#0f172a' }}>
                          Tháng {summary.month}/{summary.year}
                        </TableCell>
                        <TableCell align="center">{summary.standard_working_days || 22}</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 700, color: '#16a34a' }}>
                          {summary.actual_working_days || summary.actualWorkingDays || 0}
                        </TableCell>
                        <TableCell align="center">{summary.paid_leave_days || summary.paidLeaveDays || 0}</TableCell>
                        <TableCell align="center">{summary.unpaid_leave_days || summary.unpaidLeaveDays || 0}</TableCell>
                        <TableCell align="center" sx={{ color: summary.late_count ? '#dc2626' : '#64748b' }}>
                          {summary.late_count || summary.lateCount || 0}
                        </TableCell>
                        <TableCell align="right" sx={{ color: summary.total_late_minutes ? '#dc2626' : '#64748b' }}>
                          {summary.total_late_minutes || summary.totalLateMinutes || 0} phút
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </Box>

      {/* Leave Request Dialog */}
      <Dialog open={leaveModalOpen} onClose={handleCloseLeaveModal} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, color: '#0f172a' }}>
          Tạo Đơn xin nghỉ phép
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <TextField
              select
              label="Phân loại nghỉ phép"
              value={leaveType}
              onChange={(e) => setLeaveType(e.target.value)}
              fullWidth
              size="small"
            >
              <MenuItem value="ANNUAL">Nghỉ phép năm (Có hưởng lương)</MenuItem>
              <MenuItem value="SICK">Nghỉ ốm đau / Khám chữa bệnh</MenuItem>
              <MenuItem value="PERSONAL">Nghỉ việc riêng (Kết hôn, tang chế)</MenuItem>
              <MenuItem value="UNPAID">Nghỉ không hưởng lương</MenuItem>
            </TextField>

            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <TextField
                  label="Từ ngày"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  fullWidth
                  size="small"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField
                  label="Đến ngày"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  fullWidth
                  size="small"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>

            <TextField
              label="Tổng số ngày nghỉ đăng ký"
              type="number"
              value={totalDays}
              onChange={(e) => setTotalDays(Number(e.target.value))}
              fullWidth
              size="small"
            />

            <TextField
              label="Lý do chi tiết xin nghỉ phép"
              multiline
              rows={3}
              value={leaveReason}
              onChange={(e) => setLeaveReason(e.target.value)}
              fullWidth
              size="small"
              placeholder="Nhập lý do xin nghỉ để cấp trên xem xét phê duyệt..."
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseLeaveModal} sx={{ textTransform: 'none', color: '#64748b' }}>
            Hủy
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmitLeaveRequest}
            disabled={submittingLeave}
            sx={{ textTransform: 'none', borderRadius: '8px', fontWeight: 700 }}
          >
            {submittingLeave ? <CircularProgress size={20} color="inherit" /> : 'Gửi đơn duyệt'}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default EmployeeTabsSection;
