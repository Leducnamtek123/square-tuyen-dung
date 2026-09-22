'use client';

import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Stack,
  Divider,
  LinearProgress,
  Skeleton,
} from '@mui/material';
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import VideoCameraFrontOutlinedIcon from '@mui/icons-material/VideoCameraFrontOutlined';
import type { AdminGeneralStats } from '@/services/statisticService';

interface AiVoiceInterviewHealthWidgetProps {
  stats?: AdminGeneralStats;
  loading?: boolean;
}

const formatDuration = (seconds?: number): string => {
  if (!seconds || seconds <= 0) return '0 giây';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) return `${secs}s`;
  if (secs === 0) return `${mins}m`;
  return `${mins}m ${secs}s`;
};

export default function AiVoiceInterviewHealthWidget({
  stats,
  loading = false,
}: AiVoiceInterviewHealthWidgetProps) {
  const totalInterviews = Number(stats?.totalInterviews || 0);
  const completedInterviews = Number(stats?.totalInterviewsCompleted || 0);
  const completionRate = totalInterviews > 0 ? Math.round((completedInterviews / totalInterviews) * 100) : 0;
  const avgDuration = Number(stats?.avgInterviewDurationSeconds || 0);
  const proctoringWarnings = Number(stats?.proctoringEventsCount || 0);
  const hireRate = Number(stats?.aiRecommendHireRate || 0);

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        borderRadius: 3,
        border: '1px solid #E2E8F0',
        bgcolor: '#FFFFFF',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.04)',
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box>
          <Stack direction="row" spacing={1} alignItems="center">
            <Box
              sx={{
                width: 28,
                height: 28,
                borderRadius: 1.5,
                bgcolor: '#FDF2F8',
                color: '#EC4899',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <SmartToyOutlinedIcon sx={{ fontSize: 18 }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#0F172A', fontSize: '1.05rem' }}>
              Hiệu suất Voice AI & Phỏng vấn
            </Typography>
          </Stack>
          <Typography variant="caption" sx={{ color: '#64748B', fontSize: '0.75rem', mt: 0.25, display: 'block' }}>
            Giám sát chất lượng tương tác và độ tin cậy AI phỏng vấn
          </Typography>
        </Box>
      </Box>

      {/* Grid of 4 Key AI Metrics */}
      <Stack spacing={2} sx={{ mb: 1 }}>
        {/* Metric 1: Completion Rate */}
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <VideoCameraFrontOutlinedIcon sx={{ fontSize: 16, color: '#2563EB' }} />
              <Typography variant="body2" sx={{ color: '#475569', fontWeight: 500, fontSize: '0.8125rem' }}>
                Tỷ lệ hoàn tất phỏng vấn
              </Typography>
            </Stack>
            {loading ? (
              <Skeleton width={40} height={20} />
            ) : (
              <Typography variant="caption" sx={{ color: '#0F172A', fontWeight: 700 }}>
                {completionRate}% ({completedInterviews}/{totalInterviews})
              </Typography>
            )}
          </Box>
          <LinearProgress
            variant={loading ? 'indeterminate' : 'determinate'}
            value={completionRate}
            sx={{
              height: 6,
              borderRadius: 3,
              bgcolor: '#F1F5F9',
              '& .MuiLinearProgress-bar': { bgcolor: '#2563EB', borderRadius: 3 },
            }}
          />
        </Box>

        {/* Metric 2: AI Recommendation Hire Rate */}
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <CheckCircleOutlineIcon sx={{ fontSize: 16, color: '#10B981' }} />
              <Typography variant="body2" sx={{ color: '#475569', fontWeight: 500, fontSize: '0.8125rem' }}>
                Tỷ lệ AI đánh giá đạt tiêu chuẩn
              </Typography>
            </Stack>
            {loading ? (
              <Skeleton width={40} height={20} />
            ) : (
              <Typography variant="caption" sx={{ color: '#0F172A', fontWeight: 700 }}>
                {hireRate}%
              </Typography>
            )}
          </Box>
          <LinearProgress
            variant={loading ? 'indeterminate' : 'determinate'}
            value={hireRate}
            sx={{
              height: 6,
              borderRadius: 3,
              bgcolor: '#F1F5F9',
              '& .MuiLinearProgress-bar': { bgcolor: '#10B981', borderRadius: 3 },
            }}
          />
        </Box>
      </Stack>

      <Divider sx={{ my: 2 }} />

      {/* Row of 2 highlights: Avg Duration & Proctoring Events */}
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
        <Box
          sx={{
            p: 1.5,
            borderRadius: 2,
            bgcolor: '#F8FAFC',
            border: '1px solid #F1F5F9',
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
            <AccessTimeOutlinedIcon sx={{ fontSize: 16, color: '#8B5CF6' }} />
            <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
              Thời lượng TB
            </Typography>
          </Stack>
          {loading ? (
            <Skeleton width={60} height={24} />
          ) : (
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0F172A' }}>
              {formatDuration(avgDuration)}
            </Typography>
          )}
        </Box>

        <Box
          sx={{
            p: 1.5,
            borderRadius: 2,
            bgcolor: proctoringWarnings > 0 ? '#FFFBEB' : '#F8FAFC',
            border: '1px solid',
            borderColor: proctoringWarnings > 0 ? '#FEF3C7' : '#F1F5F9',
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
            <SecurityOutlinedIcon
              sx={{ fontSize: 16, color: proctoringWarnings > 0 ? '#F59E0B' : '#64748B' }}
            />
            <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
              Cảnh báo gian lận
            </Typography>
          </Stack>
          {loading ? (
            <Skeleton width={40} height={24} />
          ) : (
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 800,
                color: proctoringWarnings > 0 ? '#D97706' : '#0F172A',
              }}
            >
              {proctoringWarnings} sự kiện
            </Typography>
          )}
        </Box>
      </Box>
    </Paper>
  );
}
