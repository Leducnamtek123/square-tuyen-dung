'use client';

import React from 'react';
import Link from 'next/link';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Skeleton,
  Stack,
  LinearProgress,
  Tooltip,
  IconButton,
} from '@mui/material';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import LaunchOutlinedIcon from '@mui/icons-material/LaunchOutlined';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import { useTranslation } from 'react-i18next';
import type { AdminGeneralStats, TopViewedJobItem } from '@/services/statisticService';

interface TopViewedJobsWidgetProps {
  stats?: AdminGeneralStats;
  loading?: boolean;
}

export default function TopViewedJobsWidget({ stats, loading = false }: TopViewedJobsWidgetProps) {
  const { t } = useTranslation('admin');
  const topJobs = stats?.topViewedJobs || [];

  const getStatusChip = (status: number) => {
    switch (status) {
      case 1:
        return <Chip label={t('dashboard.jobStates.pending', 'Chờ duyệt')} color="warning" size="small" sx={{ fontWeight: 600, fontSize: '0.75rem', height: 22 }} />;
      case 2:
        return <Chip label={t('dashboard.jobStates.rejected', 'Từ chối')} color="error" size="small" sx={{ fontWeight: 600, fontSize: '0.75rem', height: 22 }} />;
      case 3:
        return <Chip label={t('dashboard.jobStates.active', 'Đang tuyển')} color="success" size="small" sx={{ fontWeight: 600, fontSize: '0.75rem', height: 22 }} />;
      default:
        return <Chip label="Khác" size="small" sx={{ fontWeight: 600, fontSize: '0.75rem', height: 22 }} />;
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, sm: 2.5 },
        borderRadius: 3,
        border: '1px solid #E2E8F0',
        bgcolor: '#FFFFFF',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.04)',
      }}
    >
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
        <Box>
          <Stack direction="row" spacing={1} alignItems="center">
            <Box
              sx={{
                width: 28,
                height: 28,
                borderRadius: '8px',
                bgcolor: '#ECFEFF',
                color: '#0891B2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <TrendingUpOutlinedIcon sx={{ fontSize: 18 }} />
            </Box>
            <Typography variant="h6" sx={{ fontSize: '1.05rem', fontWeight: 700, color: '#0F172A' }}>
              {t('dashboard.topViewedJobs')}
            </Typography>
          </Stack>
          <Typography variant="body2" sx={{ color: '#64748B', fontSize: '0.8125rem', mt: 0.5 }}>
            {t('dashboard.topViewedJobsSubtitle')}
          </Typography>
        </Box>
        <Link
          href="/admin/jobs"
          style={{ textDecoration: 'none' }}
        >
          <Typography
            variant="caption"
            sx={{
              fontWeight: 600,
              color: '#2563EB',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.5,
              '&:hover': { textDecoration: 'underline' },
            }}
          >
            Quản lý tin tuyển dụng →
          </Typography>
        </Link>
      </Box>

      {loading ? (
        <Stack spacing={1.5} sx={{ py: 1 }}>
          {[1, 2, 3, 4].map((idx) => (
            <Skeleton key={idx} variant="rounded" height={42} sx={{ borderRadius: 2 }} />
          ))}
        </Stack>
      ) : topJobs.length === 0 ? (
        <Box sx={{ py: 5, textAlign: 'center', color: '#94A3B8' }}>
          <VisibilityOutlinedIcon sx={{ fontSize: 36, mb: 1, opacity: 0.4 }} />
          <Typography variant="body2">{t('dashboard.noTopJobsData')}</Typography>
        </Box>
      ) : (
        <TableContainer sx={{ overflowX: 'auto' }}>
          <Table size="small" sx={{ minWidth: 600 }}>
            <TableHead>
              <TableRow sx={{ '& th': { color: '#64748B', fontWeight: 600, fontSize: '0.75rem', bgcolor: '#F8FAFC', py: 1 } }}>
                <TableCell>Vị trí tuyển dụng</TableCell>
                <TableCell align="right">Lượt xem</TableCell>
                <TableCell align="right">Ứng tuyển</TableCell>
                <TableCell align="center">Tỷ lệ nộp đơn</TableCell>
                <TableCell align="center">Trạng thái</TableCell>
                <TableCell align="right">Chi tiết</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {topJobs.map((job: TopViewedJobItem, index: number) => {
                const convRate = job.conversionRate ?? 0;
                return (
                  <TableRow
                    key={job.id}
                    hover
                    sx={{
                      '&:last-child td, &:last-child th': { border: 0 },
                      '& td': { py: 1.25 },
                    }}
                  >
                    <TableCell sx={{ minWidth: 200 }}>
                      <Stack direction="row" spacing={1.25} alignItems="center">
                        <Typography
                          variant="caption"
                          sx={{
                            width: 20,
                            height: 20,
                            borderRadius: '50%',
                            bgcolor: index === 0 ? '#FEF3C7' : index === 1 ? '#F1F5F9' : '#F8FAFC',
                            color: index === 0 ? '#B45309' : '#64748B',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.7rem',
                            flexShrink: 0,
                          }}
                        >
                          {index + 1}
                        </Typography>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#0F172A' }} noWrap>
                            {job.jobName}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#64748B' }} noWrap display="block">
                            {job.companyName || 'Doanh nghiệp'}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#0891B2' }}>
                        {job.views.toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A' }}>
                        {job.applicationsCount.toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell align="center" sx={{ minWidth: 120 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}>
                        <LinearProgress
                          variant="determinate"
                          value={Math.min(convRate * 5, 100)}
                          sx={{
                            width: 50,
                            height: 6,
                            borderRadius: 3,
                            bgcolor: '#F1F5F9',
                            '& .MuiLinearProgress-bar': {
                              bgcolor: convRate > 10 ? '#10B981' : convRate > 3 ? '#F59E0B' : '#94A3B8',
                              borderRadius: 3,
                            },
                          }}
                        />
                        <Typography variant="caption" sx={{ fontWeight: 700, color: '#334155' }}>
                          {convRate}%
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="center">{getStatusChip(job.status)}</TableCell>
                    <TableCell align="right">
                      <Tooltip title="Mở trang xem việc làm">
                        <IconButton
                          size="small"
                          component={Link}
                          href={`/viec-lam/${job.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{ color: '#64748B', '&:hover': { color: '#2563EB' } }}
                        >
                          <LaunchOutlinedIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Paper>
  );
}
