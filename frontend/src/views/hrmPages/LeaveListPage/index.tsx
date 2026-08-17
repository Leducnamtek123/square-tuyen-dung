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
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

import hrmService, { NativeLeaveRequest } from '@/services/hrmService';
import { TabTitle } from '@/utils/generalFunction';
import toastMessages from '@/utils/toastMessages';

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
      toastMessages.success('Đã duyệt đơn xin nghỉ phép thành công!');
      fetchData();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Lỗi phê duyệt đơn nghỉ phép.';
      toastMessages.error(msg);
    }
  };

  const handleReject = async (id: number) => {
    try {
      await hrmService.rejectLeaveRequest(id);
      setSuccessMsg('Đã từ chối đơn xin nghỉ phép!');
      toastMessages.success('Đã từ chối đơn xin nghỉ phép!');
      fetchData();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Lỗi từ chối đơn nghỉ phép.';
      toastMessages.error(msg);
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

      {/* Top Leave Summary Metrics */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2.5} sx={{ mb: 3.5 }}>
        <Paper
          elevation={0}
          sx={{
            flex: 1,
            p: 2.5,
            borderRadius: '20px',
            border: '1px solid rgba(226, 232, 240, 0.85)',
            boxShadow: '0 20px 40px -15px rgba(15, 23, 42, 0.04), 0 1px 3px rgba(0, 0, 0, 0.02)',
            bgcolor: '#ffffff',
          }}
        >
          <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
            Tổng số đơn gửi
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a', fontFamily: 'var(--font-mono)', mt: 0.5 }}>
            {leaveRequests.length}
          </Typography>
        </Paper>

        <Paper
          elevation={0}
          sx={{
            flex: 1,
            p: 2.5,
            borderRadius: '20px',
            border: '1px solid rgba(226, 232, 240, 0.85)',
            boxShadow: '0 20px 40px -15px rgba(15, 23, 42, 0.04), 0 1px 3px rgba(0, 0, 0, 0.02)',
            bgcolor: '#ffffff',
          }}
        >
          <Typography variant="caption" sx={{ color: '#16a34a', fontWeight: 600 }}>
            Đã duyệt thành công
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#16a34a', fontFamily: 'var(--font-mono)', mt: 0.5 }}>
            {leaveRequests.filter((l) => l.status === 'APPROVED').length}
          </Typography>
        </Paper>

        <Paper
          elevation={0}
          sx={{
            flex: 1,
            p: 2.5,
            borderRadius: '20px',
            border: '1px solid rgba(226, 232, 240, 0.85)',
            boxShadow: '0 20px 40px -15px rgba(15, 23, 42, 0.04), 0 1px 3px rgba(0, 0, 0, 0.02)',
            bgcolor: '#ffffff',
          }}
        >
          <Typography variant="caption" sx={{ color: '#ea580c', fontWeight: 600 }}>
            Đơn đang chờ duyệt
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#ea580c', fontFamily: 'var(--font-mono)', mt: 0.5 }}>
            {leaveRequests.filter((l) => l.status === 'PENDING').length}
          </Typography>
        </Paper>
      </Stack>

      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 3, borderRadius: '12px' }}>
          {error}
        </Alert>
      )}

      {successMsg && (
        <Alert severity="success" onClose={() => setSuccessMsg(null)} sx={{ mb: 3, borderRadius: '12px' }}>
          {successMsg}
        </Alert>
      )}

      {loading ? (
        <Paper sx={{ p: 3, borderRadius: '24px', border: '1px solid rgba(226, 232, 240, 0.85)', boxShadow: '0 20px 40px -15px rgba(15, 23, 42, 0.04)' }}>
          <Stack spacing={2}>
            {Array.from(Array(5).keys()).map((i) => (
              <Box key={i} sx={{ display: 'flex', gap: 2, alignItems: 'center', py: 1 }}>
                <Box sx={{ width: '20%', height: 24, bgcolor: '#f1f5f9', borderRadius: '6px' }} />
                <Box sx={{ width: '15%', height: 24, bgcolor: '#f1f5f9', borderRadius: '6px' }} />
                <Box sx={{ width: '25%', height: 24, bgcolor: '#f1f5f9', borderRadius: '6px' }} />
                <Box sx={{ width: '15%', height: 24, bgcolor: '#f1f5f9', borderRadius: '6px' }} />
                <Box sx={{ width: '25%', height: 24, bgcolor: '#f1f5f9', borderRadius: '6px' }} />
              </Box>
            ))}
          </Stack>
        </Paper>
      ) : (
        <TableContainer
          component={Paper}
          sx={{
            borderRadius: '24px',
            border: '1px solid rgba(226, 232, 240, 0.85)',
            boxShadow: '0 20px 40px -15px rgba(15, 23, 42, 0.04), 0 1px 3px rgba(0, 0, 0, 0.02)',
            overflow: 'hidden',
          }}
        >
          <Table>
            <TableHead sx={{ bgcolor: '#f8fafc' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.875rem' }}>Nhân viên</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.875rem' }}>Loại phép</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.875rem' }}>Thời gian</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.875rem' }}>Số ngày</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.875rem' }}>Lý do</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.875rem' }}>Trạng thái</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.875rem' }}>Hành động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {leaveRequests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                    <Typography color="text.secondary" sx={{ fontWeight: 500 }}>Chưa có đơn nghỉ phép nào cần xử lý.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                leaveRequests.map((leave) => (
                  <TableRow
                    key={leave.id}
                    hover
                    sx={{
                      transition: 'background-color 150ms ease',
                      '&:hover': { bgcolor: '#f8fafc' },
                    }}
                  >
                    <TableCell>
                      <Typography fontWeight={700} sx={{ color: '#0f172a', fontSize: '0.9rem' }}>{leave.employee_name}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={leave.leave_type_name || 'Nghỉ phép năm'}
                        size="small"
                        sx={{
                          borderRadius: '8px',
                          fontWeight: 600,
                          fontSize: '0.78rem',
                          bgcolor: 'rgba(37, 99, 235, 0.08)',
                          color: '#2563eb',
                          border: '1px solid rgba(37, 99, 235, 0.15)',
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#475569', fontSize: '0.85rem' }}>
                        {leave.start_date} <ArrowForwardIcon sx={{ fontSize: 13, color: '#94a3b8' }} /> {leave.end_date}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#0f172a' }}>
                        {leave.total_days} ngày
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
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
                        sx={{
                          borderRadius: '8px',
                          fontWeight: 700,
                          fontSize: '0.78rem',
                          bgcolor:
                            leave.status === 'APPROVED'
                              ? 'rgba(22, 163, 74, 0.1)'
                              : leave.status === 'REJECTED'
                              ? 'rgba(239, 68, 68, 0.1)'
                              : 'rgba(249, 115, 22, 0.1)',
                          color:
                            leave.status === 'APPROVED'
                              ? '#16a34a'
                              : leave.status === 'REJECTED'
                              ? '#ef4444'
                              : '#ea580c',
                        }}
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
                            sx={{
                              borderRadius: '8px',
                              fontWeight: 700,
                              textTransform: 'none',
                              boxShadow: 'none',
                              '&:hover': { boxShadow: '0 4px 12px rgba(22, 163, 74, 0.25)' },
                            }}
                          >
                            Duyệt
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            startIcon={<CancelIcon />}
                            onClick={() => handleReject(leave.id)}
                            sx={{
                              borderRadius: '8px',
                              fontWeight: 700,
                              textTransform: 'none',
                            }}
                          >
                            Từ chối
                          </Button>
                        </Stack>
                      ) : (
                        <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600 }}>
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
