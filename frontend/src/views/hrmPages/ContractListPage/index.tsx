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
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

import hrmService, { NativeContract } from '@/services/hrmService';
import { TabTitle } from '@/utils/generalFunction';

export default function ContractListPage() {
  TabTitle('Hợp đồng Lao động & Mức lương | Native HRM');

  const [loading, setLoading] = useState(true);
  const [contracts, setContracts] = useState<NativeContract[]>([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await hrmService.getContracts().catch(() => []);
      setContracts(data);
    } catch (err) {
      console.error('Error fetching contracts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
            <DescriptionOutlinedIcon fontSize="large" color="primary" /> Quản lý Hợp đồng Lao động & Cấu trúc Lương (Employment Contracts)
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Theo dõi thời hạn Hợp đồng thử việc / xác định thời hạn, Mức lương cơ bản & Phụ cấp theo chuẩn Frappe HRMS
          </Typography>
        </Box>
      </Box>

      {/* Contract Table */}
      {loading ? (
        <Box display="flex" justifyContent="center" py={6}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 4px 16px rgba(0,0,0,0.05)' }}>
          <Table>
            <TableHead sx={{ bgcolor: '#f8fafc' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Số Hợp đồng</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Nhân viên</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Loại Hợp đồng</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Lương cơ bản (VND)</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Ngày hiệu lực</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Ngày hết hạn</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Trạng thái</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {contracts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">Chưa có hợp đồng nào trong hệ thống.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                contracts.map((c) => (
                  <TableRow key={c.id} hover>
                    <TableCell>
                      <Typography fontWeight={700} color="primary">
                        {c.contract_number}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {c.employee_name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={
                          c.contract_type === 'PROBATION'
                            ? 'Thử việc'
                            : c.contract_type === 'FIXED_TERM'
                            ? 'Xác định thời hạn'
                            : 'Không xác định thời hạn'
                        }
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={700}>
                        {Number(c.base_salary).toLocaleString('vi-VN')} đ
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{c.start_date}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{c.end_date || 'Vô thời hạn'}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={c.status === 'ACTIVE' ? 'Đang hiệu lực' : 'Đã hết hạn'}
                        color={c.status === 'ACTIVE' ? 'success' : 'default'}
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
    </Box>
  );
}
