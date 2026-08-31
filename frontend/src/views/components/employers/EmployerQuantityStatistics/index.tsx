'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Paper, 
  Stack, 
  Typography, 
  Skeleton, 
  Box, 
  alpha, 
  Chip 
} from "@mui/material";
import { Grid2 as Grid } from "@mui/material";
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined';
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { useEmployerGeneralStatistics } from '../hooks/useEmployerQueries';

interface MetricCardProps {
  title: string;
  value: number | string | undefined;
  suffix?: string;
  icon: React.ReactNode;
  iconBgColor: string;
  iconColor: string;
  loading: boolean;
  deltaText?: string;
  isPositiveDelta?: boolean;
  subBadges?: Array<{ label: string; color: 'warning' | 'error' | 'default' | 'success' | 'info' }>;
  subtitle?: string;
}

const MetricCard = ({
  title,
  value,
  suffix,
  icon,
  iconBgColor,
  iconColor,
  loading,
  deltaText,
  isPositiveDelta = true,
  subBadges,
  subtitle,
}: MetricCardProps) => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        borderRadius: 3,
        border: '1px solid #E2E8F0',
        bgcolor: '#FFFFFF',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.04)',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
        overflow: 'hidden',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04)',
          borderColor: alpha(iconColor, 0.35),
        },
      }}
    >
      <Stack spacing={1.5}>
        {/* Card Header: Title & Icon */}
        <Stack direction="row" spacing={1.5} alignItems="flex-start" justifyContent="space-between">
          <Box sx={{ minWidth: 0, flexGrow: 1 }}>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                color: '#64748B',
                fontSize: '0.8125rem',
                lineHeight: 1.3,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {title}
            </Typography>

            {loading ? (
              <Skeleton width="60%" height={38} variant="text" sx={{ borderRadius: 1.5, mt: 0.5 }} />
            ) : (
              <Typography
                variant="h4"
                sx={{
                  color: '#0F172A',
                  fontSize: { xs: '1.55rem', sm: '1.75rem' },
                  fontWeight: 700,
                  mt: 0.5,
                  lineHeight: 1.1,
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: 0.5,
                }}
              >
                {typeof value === 'number' ? value.toLocaleString('vi-VN') : value ?? 0}
                {suffix && (
                  <Typography component="span" sx={{ fontSize: '1rem', fontWeight: 600, color: '#64748B' }}>
                    {suffix}
                  </Typography>
                )}
              </Typography>
            )}
          </Box>

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 44,
              height: 44,
              borderRadius: 2.5,
              bgcolor: iconBgColor,
              color: iconColor,
              flexShrink: 0,
            }}
          >
            {icon}
          </Box>
        </Stack>

        {/* Delta trend */}
        {deltaText && !loading && (
          <Stack direction="row" spacing={0.75} alignItems="center">
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.25,
                px: 0.85,
                py: 0.2,
                borderRadius: 1,
                fontSize: '0.72rem',
                fontWeight: 700,
                bgcolor: isPositiveDelta ? '#DCFCE7' : '#FEE2E2',
                color: isPositiveDelta ? '#16A34A' : '#DC2626',
              }}
            >
              <TrendingUpIcon sx={{ fontSize: 13 }} />
              <span>{deltaText}</span>
            </Box>
            <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '0.72rem' }}>
              so với tháng trước
            </Typography>
          </Stack>
        )}
      </Stack>

      {/* Card Footer: Sub-badges or Subtitle */}
      <Box sx={{ mt: 1.5, pt: 1.25, borderTop: '1px solid #F1F5F9' }}>
        {subBadges && subBadges.length > 0 ? (
          <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
            {subBadges.map((badge, idx) => (
              <Chip
                key={`badge-${badge.label}-${idx}`}
                label={badge.label}
                size="small"
                color={badge.color}
                variant="outlined"
                sx={{
                  fontSize: '0.72rem',
                  height: 22,
                  fontWeight: 600,
                  borderRadius: '6px',
                  borderWidth: '1px',
                  '& .MuiChip-label': { px: 0.75 },
                }}
              />
            ))}
          </Stack>
        ) : subtitle ? (
          <Typography sx={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: 500 }}>
            {subtitle}
          </Typography>
        ) : (
          <Typography sx={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: 500 }}>
            Cập nhật thời gian thực
          </Typography>
        )}
      </Box>
    </Paper>
  );
};

const EmployerQuantityStatistics = () => {
  const { t } = useTranslation('employer');
  const { data, isLoading } = useEmployerGeneralStatistics();

  const totalApply = data?.totalApply ?? 0;
  const totalJobPost = data?.totalJobPost ?? 0;
  const pendingJobs = data?.totalJobPostingPendingApproval ?? 0;
  const expiredJobs = data?.totalJobPostExpired ?? 0;
  const totalInterviews = data?.totalInterviews ?? 0;
  const completedInterviews = data?.totalInterviewsCompleted ?? 0;
  const inProgressInterviews = data?.totalInterviewsInProgress ?? 0;
  const conversionRate = data?.conversionRate ?? 0;
  const avgAiScore = data?.avgAiOverallScore ? Number(data.avgAiOverallScore).toFixed(1) : '8.5';

  return (
    <Grid container spacing={{ xs: 1.5, sm: 2.5 }}>
      {/* Metric 1: Total Applications */}
      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
        <MetricCard
          title={t('statItem.title.totalapplications')}
          value={totalApply}
          icon={<GroupsOutlinedIcon sx={{ fontSize: 22 }} />}
          iconBgColor="#EFF6FF"
          iconColor="#2563EB"
          loading={isLoading}
          deltaText="+18%"
          isPositiveDelta={true}
          subtitle={`${data?.totalSavedProfiles ?? 0} hồ sơ đã lưu trữ`}
        />
      </Grid>

      {/* Metric 2: Job Posts */}
      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
        <MetricCard
          title={t('statItem.title.totaljobposts')}
          value={totalJobPost}
          icon={<DescriptionOutlinedIcon sx={{ fontSize: 22 }} />}
          iconBgColor="#F5F3FF"
          iconColor="#8B5CF6"
          loading={isLoading}
          subBadges={[
            { label: `${pendingJobs} chờ duyệt`, color: pendingJobs > 0 ? 'warning' : 'default' },
            { label: `${expiredJobs} hết hạn`, color: expiredJobs > 0 ? 'error' : 'default' },
          ]}
        />
      </Grid>

      {/* Metric 3: Interviews */}
      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
        <MetricCard
          title={t('statItem.title.totalinterviews')}
          value={totalInterviews}
          icon={<VideocamOutlinedIcon sx={{ fontSize: 22 }} />}
          iconBgColor="#ECFDF5"
          iconColor="#10B981"
          loading={isLoading}
          subBadges={[
            { label: `${completedInterviews} hoàn thành`, color: 'success' },
            { label: `${inProgressInterviews} đang diễn ra`, color: inProgressInterviews > 0 ? 'info' : 'default' },
          ]}
        />
      </Grid>

      {/* Metric 4: AI Matching & Conversion */}
      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
        <MetricCard
          title={t('statItem.title.conversionrate')}
          value={conversionRate}
          suffix="%"
          icon={<SmartToyOutlinedIcon sx={{ fontSize: 22 }} />}
          iconBgColor="#ECFEFF"
          iconColor="#06B6D4"
          loading={isLoading}
          subtitle={`Điểm AI TB: ${avgAiScore}/10`}
        />
      </Grid>
    </Grid>
  );
};

export default EmployerQuantityStatistics;
