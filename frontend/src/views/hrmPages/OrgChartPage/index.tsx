'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CircularProgress,
  Chip,
  Avatar,
  Paper,
  Alert,
  Button,
  Stack,
  IconButton,
  Collapse,
  Tooltip,
} from '@mui/material';
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import RefreshIcon from '@mui/icons-material/Refresh';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import BusinessIcon from '@mui/icons-material/Business';
import AddIcon from '@mui/icons-material/Add';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import UnfoldLessIcon from '@mui/icons-material/UnfoldLess';
import Link from 'next/link';

import { useHrmOrgChart } from '../hooks/useHrmQueries';
import { NativeOrgTreeNode } from '@/services/hrmService';
import { TabTitle } from '@/utils/generalFunction';

export default function OrgChartPage() {
  TabTitle('Sơ đồ Cây Tổ chức | InfoHR HRM');

  const { data: orgTree = [], isLoading: loading, error, refetch } = useHrmOrgChart();
  const [collapsedNodes, setCollapsedNodes] = useState<Record<number, boolean>>({});

  const toggleNode = (id: number) => {
    setCollapsedNodes((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const isExpanded = (id: number) => {
    return !collapsedNodes[id]; // Default expanded
  };

  const handleExpandAll = () => {
    setCollapsedNodes({});
  };

  const handleCollapseAll = () => {
    const allIds: Record<number, boolean> = {};
    const collectIds = (nodes: NativeOrgTreeNode[]) => {
      nodes.forEach((n) => {
        if (n && n.id) {
          allIds[n.id] = true;
          if (n.children && Array.isArray(n.children)) {
            collectIds(n.children);
          }
        }
      });
    };
    if (Array.isArray(orgTree)) {
      collectIds(orgTree);
    }
    setCollapsedNodes(allIds);
  };

  const renderTreeNode = (node: NativeOrgTreeNode, level: number = 0) => {
    if (!node) return null;
    const hasChildren = Array.isArray(node.children) && node.children.length > 0;
    const expanded = isExpanded(node.id);
    const nodeName = node.name || `Phòng ban #${node.id}`;
    const initialChar = nodeName.trim().charAt(0)?.toUpperCase() || 'D';

    return (
      <Box key={node.id} sx={{ ml: level === 0 ? 0 : { xs: 1, sm: 2.5, md: 4 }, mt: 1.5, position: 'relative' }}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 1.5, sm: 2.25 },
            borderRadius: 3,
            border: '1px solid',
            borderColor: level === 0 ? '#93c5fd' : '#e2e8f0',
            bgcolor: level === 0 ? '#f8fafc' : '#ffffff',
            maxWidth: 680,
            boxShadow: '0 2px 8px 0 rgba(0, 0, 0, 0.03)',
            transition: 'all 0.2s ease',
            '&:hover': {
              borderColor: '#2563eb',
              boxShadow: '0 6px 20px -4px rgba(37, 99, 235, 0.1)',
            },
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              {hasChildren ? (
                <IconButton aria-label="Thao tác"
                  size="small"
                  onClick={() => toggleNode(node.id)}
                  sx={{
                    width: 28,
                    height: 28,
                    bgcolor: '#eff6ff',
                    color: '#2563eb',
                    '&:hover': { bgcolor: '#dbeafe' },
                  }}
                >
                  {expanded ? <ExpandMoreIcon sx={{ fontSize: 18 }} /> : <ChevronRightIcon sx={{ fontSize: 18 }} />}
                </IconButton>
              ) : (
                <Box sx={{ width: 28, display: 'flex', justifyContent: 'center' }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#cbd5e1' }} />
                </Box>
              )}

              <Avatar
                sx={{
                  bgcolor: level === 0 ? '#2563eb' : '#eff6ff',
                  color: level === 0 ? '#ffffff' : '#2563eb',
                  width: 38,
                  height: 38,
                  fontWeight: 800,
                }}
              >
                {initialChar}
              </Avatar>

              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.9375rem' }}>
                  {nodeName}
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500 }}>
                  Trưởng phòng: <strong style={{ color: '#1e293b' }}>{node.managerName || node.manager_name || 'Chưa gán'}</strong>
                </Typography>
              </Box>
            </Stack>

            <Chip
              label={`${node.employeeCount ?? node.employee_count ?? 0} Nhân sự`}
              size="small"
              sx={{
                fontWeight: 800,
                fontSize: '0.75rem',
                bgcolor: level === 0 ? '#dbeafe' : '#f1f5f9',
                color: level === 0 ? '#1d4ed8' : '#334155',
                borderRadius: 1.5,
              }}
            />
          </Box>
        </Paper>

        {hasChildren && (
          <Collapse in={expanded}>
            <Box
              sx={{
                pl: { xs: 1, sm: 2 },
                ml: { xs: 1, sm: 2 },
                borderLeft: '2px dashed #cbd5e1',
                mt: 1,
              }}
            >
              {node.children.map((child) => renderTreeNode(child, level + 1))}
            </Box>
          </Collapse>
        )}
      </Box>
    );
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 1400, mx: 'auto', p: { xs: 1, sm: 2, md: 3 } }}>
      <Stack spacing={3}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: '12px',
                bgcolor: '#fffbeb',
                color: '#d97706',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <AccountTreeOutlinedIcon sx={{ fontSize: 24 }} />
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 900, color: '#0f172a', fontSize: { xs: '1.15rem', sm: '1.35rem', md: '1.5rem' }, letterSpacing: '-0.02em' }}>
                Sơ đồ Cây Tổ chức Doanh nghiệp
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500, fontSize: '0.8125rem' }}>
                Trực quan hóa cấu trúc phân cấp phòng ban, trưởng phòng phụ trách và định biên nhân sự
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" sx={{ width: { xs: '100%', sm: 'auto' } }}>
            <Tooltip title="Mở rộng tất cả các nhánh">
              <Button
                variant="outlined"
                size="small"
                startIcon={<UnfoldMoreIcon sx={{ fontSize: 16 }} />}
                onClick={handleExpandAll}
                sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, fontSize: '0.8125rem', flex: { xs: '1 1 auto', sm: 'none' } }}
              >
                Mở rộng
              </Button>
            </Tooltip>
            <Tooltip title="Thu gọn tất cả các nhánh">
              <Button
                variant="outlined"
                size="small"
                startIcon={<UnfoldLessIcon sx={{ fontSize: 16 }} />}
                onClick={handleCollapseAll}
                sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, fontSize: '0.8125rem', flex: { xs: '1 1 auto', sm: 'none' } }}
              >
                Thu gọn
              </Button>
            </Tooltip>
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
                flex: { xs: '1 1 auto', sm: 'none' },
                '&:hover': { bgcolor: '#f8fafc', borderColor: '#94a3b8' },
              }}
            >
              Làm mới
            </Button>
          </Stack>
        </Box>

        {/* Tree Render Container */}
        {loading ? (
          <Paper elevation={0} sx={{ p: 6, borderRadius: 3, border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
            <CircularProgress size={32} />
            <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600 }}>
              Đang tải sơ đồ cơ cấu tổ chức...
            </Typography>
          </Paper>
        ) : error ? (
          <Alert severity="error" sx={{ borderRadius: 3 }}>
            Không thể tải sơ đồ tổ chức. Vui lòng kiểm tra lại kết nối hoặc phân quyền.
          </Alert>
        ) : !Array.isArray(orgTree) || orgTree.length === 0 ? (
          <Paper elevation={0} sx={{ p: 6, textAlign: 'center', borderRadius: 3, border: '1px solid #e2e8f0', bgcolor: '#ffffff' }}>
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: '16px',
                bgcolor: '#f1f5f9',
                color: '#64748b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2,
              }}
            >
              <BusinessIcon sx={{ fontSize: 32 }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', mb: 1 }}>
              Chưa có dữ liệu Sơ đồ Tổ chức
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748b', maxWidth: 460, mx: 'auto', mb: 3 }}>
              Doanh nghiệp của bạn chưa tạo phòng ban nào hoặc chưa phân cấp cơ cấu tổ chức.
            </Typography>
            <Link href="/employer/hrm/departments" style={{ textDecoration: 'none' }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                sx={{
                  borderRadius: 2.5,
                  textTransform: 'none',
                  fontWeight: 800,
                  bgcolor: '#7c3aed',
                  boxShadow: '0 4px 12px 0 rgba(124, 58, 237, 0.2)',
                  '&:hover': { bgcolor: '#6d28d9' },
                }}
              >
                Đến trang Phòng ban & Thiết lập
              </Button>
            </Link>
          </Paper>
        ) : (
          <Paper
            elevation={0}
            sx={{
              p: { xs: 1.5, sm: 3, md: 4 },
              borderRadius: 3,
              border: '1px solid #e2e8f0',
              bgcolor: '#ffffff',
              overflowX: 'auto',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            <Box sx={{ pb: 1, mb: 2, borderBottom: '1px solid #f1f5f9' }}>
              <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Cấu trúc phân cấp bộ máy công ty
              </Typography>
            </Box>
            {orgTree.map((rootNode) => renderTreeNode(rootNode, 0))}
          </Paper>
        )}
      </Stack>
    </Box>
  );
}
