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
  CircularProgress,
  Stack,
  Alert,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import BeachAccessIcon from '@mui/icons-material/BeachAccess';

import hrmService, { NativeLeaveRequest } from '@/services/hrmService';
import { TabTitle } from '@/utils/generalFunction';

export default function LeaveListPage() {
  TabTitle('Quản lý Nghỉ phép | Native HRM');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [leaveRequests, setLeaveRequests] = useState<NativeLeaveRequest[]>([]);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await hrmService.getLeaveRequests();
      setLeaveRequests(data);
    } catch (err: any) {
      console.error('Error fetching leave requests:', err);
      setError(err?.response?.data?.message || err?.message || 'Không thể tải danh sách nghỉ phép.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApprove = async (id: number) => {
    try {
      await hrmService.approveLeaveRequest(id);
      setSuccessMsg('Đã duyệt đơn xin nghỉ phép!');
      fetchData();
    } catch (err) {
      alert('Lỗi phê duyệt đơn nghỉ phép.');
    }
  };

  const handleReject = async (id: number) => {
    try {
      await hrmService.rejectLeaveRequest(id);
      setSuccessMsg('Đã từ chối đơn xin nghỉ phép!');
      fetchData();
    } catch (err) {
      alert('Lỗi từ chối đơn nghỉ phép.');
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
            <BeachAccessIcon fontSize="large" color="primary" /> Quản lý Nghỉ phép (Leave Management)
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Phê duyệt Đơn phép năm, Phép ốm, Thai sản & Theo dõi quỹ phép chuẩn Frappe HRMS
          </Typography>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {successMsg && (
        <Alert severity="success" onClose={() => setSuccessMsg(null)} sx={{ mb: 3 }}>
          {successMsg}
        </Alert>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" py={6}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 4px 16px rgba(0,0,0,0.05)' }}>
          <Table>
            <TableHead sx={{ bgcolor: '#f8fafc' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Nhân viên</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Loại phép</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Thời gian</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Số ngày nghỉ</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Lý do</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Trạng thái</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Hành động Phê duyệt</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {leaveRequests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">Chưa có đơn nghỉ phép nào cần xử lý.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                leaveRequests.map((leave) => (
                  <TableRow key={leave.id} hover>
                    <TableCell>
                      <Typography fontWeight={600}>{leave.employee_name}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={leave.leave_type_name || 'Nghỉ phép năm'} size="small" variant="outlined" color="primary" />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{`${leave.start_date} ➔ ${leave.end_date}`}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={700}>
                        {leave.total_days} ngày
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {leave.reason || '---'}
                      </Typography>
                    </TableCell>
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
                      {leave.status === 'PENDING' ? (
                        <Stack direction="row" spacing={1}>
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            startIcon={<CheckCircleIcon />}
                            onClick={() => handleApprove(leave.id)}
                          >
                            Duyệt
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            startIcon={<CancelIcon />}
                            onClick={() => handleReject(leave.id)}
                          >
                            Từ chối
                          </Button>
                        </Stack>
                      ) : (
                        <Typography variant="caption" color="text.secondary">
                          Đã xử lý
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
