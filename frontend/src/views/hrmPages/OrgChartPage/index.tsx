'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CircularProgress,
  Chip,
  Avatar,
  Paper,
} from '@mui/material';
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';

import hrmService, { NativeOrgTreeNode } from '@/services/hrmService';
import { TabTitle } from '@/utils/generalFunction';

export default function OrgChartPage() {
  TabTitle('Sơ đồ Cây Tổ chức | Native HRM');

  const [loading, setLoading] = useState(true);
  const [orgTree, setOrgTree] = useState<NativeOrgTreeNode[]>([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await hrmService.getOrgChart().catch(() => []);
      setOrgTree(data);
    } catch (err) {
      console.error('Error fetching org chart:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const renderTreeNode = (node: NativeOrgTreeNode, level: number = 0) => (
    <Box key={node.id} sx={{ ml: level * 3, mt: 1.5, position: 'relative' }}>
      <Paper
        elevation={1}
        sx={{
          p: 2,
          borderRadius: 3,
          borderLeft: '4px solid #1976d2',
          bgcolor: level === 0 ? '#f0f7ff' : '#ffffff',
          maxWidth: 600,
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center" gap={1.5}>
            <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
              <AccountTreeOutlinedIcon fontSize="small" />
            </Avatar>
            <Box>
              <Typography fontWeight={700} color="primary.dark">
                {node.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Trưởng phòng: {node.manager_name || 'Chưa gán'}
              </Typography>
            </Box>
          </Box>
          <Chip label={`${node.employee_count} Nhân sự`} size="small" color="info" />
        </Box>
      </Paper>

      {node.children && node.children.length > 0 && (
        <Box sx={{ pl: 2, borderLeft: '2px dashed #bbb', ml: 2, mt: 1 }}>
          {node.children.map((child) => renderTreeNode(child, level + 1))}
        </Box>
      )}
    </Box>
  );

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
            <AccountTreeOutlinedIcon fontSize="large" color="primary" /> Sơ đồ Cây Tổ chức Doanh nghiệp (Org Chart Tree)
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Trực quan hóa cấu trúc Phân cấp Quản lý phòng ban & Nhân sự cấp dưới chuẩn Frappe HRMS
          </Typography>
        </Box>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" py={6}>
          <CircularProgress />
        </Box>
      ) : (
        <Card sx={{ p: 3, borderRadius: 3, boxShadow: '0 4px 16px rgba(0,0,0,0.05)' }}>
          {orgTree.length === 0 ? (
            <Typography color="text.secondary" align="center" py={4}>
              Chưa có dữ liệu cây tổ chức phòng ban.
            </Typography>
          ) : (
            orgTree.map((rootNode) => renderTreeNode(rootNode, 0))
          )}
        </Card>
      )}
    </Box>
  );
}
