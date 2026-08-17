import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Paper, 
  Stack, 
  Typography, 
  Skeleton, 
  Box, 
  alpha, 
  useTheme 
} from "@mui/material";
import { Grid2 as Grid } from "@mui/material";
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import HighlightOffOutlinedIcon from '@mui/icons-material/HighlightOffOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';
import { useEmployerGeneralStatistics } from '../hooks/useEmployerQueries';
import pc from '@/utils/muiColors';

interface StatItemProps {
  title: string;
  value: number | string | undefined;
  suffix?: string;
  color: string;
  Icon: React.ElementType;
  loading: boolean;
  trend?: string;
  sparkPath?: string;
}

const Sparkline = ({ color, path = "M0 18 Q 30 5, 60 15 T 120 8" }: { color: string; path?: string }) => {
  const gradientId = React.useId();
  return (
    <Box sx={{ width: '100%', height: 28, mt: 1.5, overflow: 'hidden' }}>
      <svg width="100%" height="28" viewBox="0 0 120 28" preserveAspectRatio="none" style={{ display: 'block' }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.25} />
            <stop offset="100%" stopColor={color} stopOpacity={0.0} />
          </linearGradient>
        </defs>
        <path
          d={`${path} L 120 28 L 0 28 Z`}
          fill={`url(#${gradientId})`}
        />
        <path
          d={path}
          fill="none"
          stroke={color}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </Box>
  );
};

const StatItem = ({ title, value, suffix, color, Icon, loading, trend, sparkPath }: StatItemProps) => {
  const isPositive = trend?.includes('↑');
  const isNeutral = trend?.includes('-') || trend?.includes('-');

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: '24px',
        border: '1px solid rgba(226, 232, 240, 0.8)',
        bgcolor: '#ffffff',
        boxShadow: '0 20px 40px -15px rgba(15, 23, 42, 0.04), 0 1px 3px 0 rgba(15, 23, 42, 0.02)',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'transform 180ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 180ms ease, border-color 180ms ease',
        position: 'relative',
        overflow: 'hidden',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 25px 45px -10px rgba(15, 57, 127, 0.12)',
          borderColor: alpha(color, 0.45),
        },
        '&:active': {
          transform: 'scale(0.99)',
        },
      }}
    >
      <Stack spacing={2}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 44,
              height: 44,
              borderRadius: '14px',
              bgcolor: alpha(color, 0.12),
              color: color,
              flexShrink: 0,
            }}
          >
            <Icon sx={{ fontSize: 24 }} />
          </Box>
          <Typography
            sx={{
              fontWeight: 600,
              color: '#64748B',
              fontSize: '0.875rem',
              lineHeight: 1.3,
            }}
          >
            {title}
          </Typography>
        </Stack>

        {loading ? (
          <Skeleton width="65%" height={44} variant="text" sx={{ borderRadius: 1.5 }} />
        ) : (
          <Stack spacing={1}>
            <Typography
              sx={{
                color: '#0F172A',
                fontFamily: 'var(--font-mono)',
                fontSize: '2.125rem',
                fontWeight: 800,
                lineHeight: 1.1,
                letterSpacing: '-0.03em',
              }}
            >
              {typeof value === 'number' ? value.toLocaleString() : value ?? 0}
              {suffix && (
                <Typography component="span" sx={{ fontSize: '1.125rem', fontWeight: 700, color: '#64748B', ml: 0.5, fontFamily: 'var(--font-sans)' }}>
                  {suffix}
                </Typography>
              )}
            </Typography>

            {trend && (
              <Stack direction="row" alignItems="center" spacing={0.75}>
                <Box
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    px: 1,
                    py: 0.25,
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    bgcolor: isPositive ? alpha('#10B981', 0.1) : isNeutral ? alpha('#64748B', 0.08) : alpha('#EF4444', 0.1),
                    color: isPositive ? '#059669' : isNeutral ? '#64748B' : '#DC2626',
                  }}
                >
                  {trend}
                </Box>
              </Stack>
            )}
          </Stack>
        )}
      </Stack>

      <Sparkline color={color} path={sparkPath} />
    </Paper>
  );
};

const EmployerQuantityStatistics = () => {

  const { t } = useTranslation('employer');

  const { data, isLoading } = useEmployerGeneralStatistics();

  const statItems = [
    {
      title: t('statItem.title.totalapplications'),
      value: data?.totalApply,
      color: '#E53935',
      Icon: GroupsOutlinedIcon,
      trend: undefined,
      sparkPath: 'M0 22 Q 25 24, 50 10 T 100 6 T 120 3',
    },
    {
      title: t('statItem.title.pendingjobposts'),
      value: data?.totalJobPostingPendingApproval,
      color: '#F59E0B',
      Icon: AccessTimeOutlinedIcon,
      trend: undefined,
      sparkPath: 'M0 16 Q 30 18, 60 14 T 120 16',
    },
    {
      title: t('statItem.title.expiredjobposts'),
      value: data?.totalJobPostExpired,
      color: '#EF4444',
      Icon: HighlightOffOutlinedIcon,
      trend: undefined,
      sparkPath: 'M0 20 Q 30 22, 70 12 T 120 18',
    },
    {
      title: t('statItem.title.totaljobposts'),
      value: data?.totalJobPost,
      color: '#8B5CF6',
      Icon: DescriptionOutlinedIcon,
      trend: undefined,
      sparkPath: 'M0 24 Q 35 22, 65 8 T 120 4',
    },
    {
      title: t('statItem.title.completedinterviews'),
      value: data?.totalInterviewsCompleted,
      color: '#10B981',
      Icon: CheckCircleOutlineIcon,
      trend: undefined,
      sparkPath: 'M0 18 Q 40 16, 80 20 T 120 14',
    },
    {
      title: t('statItem.title.conversionrate'),
      value: data?.conversionRate,
      suffix: '%',
      color: '#EAB308',
      Icon: TrendingUpOutlinedIcon,
      trend: undefined,
      sparkPath: 'M0 20 Q 30 15, 60 22 T 120 18',
    },
    {
      title: t('statItem.title.totalinterviews'),
      value: data?.totalInterviews,
      color: '#2563EB',
      Icon: VideocamOutlinedIcon,
      trend: undefined,
      sparkPath: 'M0 22 Q 30 12, 70 18 T 120 8',
    },
    {
      title: t('statItem.title.avgaiscore'),
      value: data?.avgAiOverallScore ? data.avgAiOverallScore.toFixed(1) : '0',
      suffix: '/10',
      color: '#06B6D4',
      Icon: SmartToyOutlinedIcon,
      trend: undefined,
      sparkPath: 'M0 20 Q 30 24, 70 10 T 120 5',
    },
  ];

  return (
    <Grid container spacing={3}>
      {statItems.map((item) => (
        <Grid key={item.title} size={{ xs: 12, sm: 6, md: 6, lg: 3 }}>
          <StatItem
            title={item.title}
            value={item.value}
            suffix={item.suffix}
            color={item.color}
            Icon={item.Icon}
            loading={isLoading}
            trend={item.trend}
            sparkPath={item.sparkPath}
          />
        </Grid>
      ))}
    </Grid>
  );
};

export default EmployerQuantityStatistics;
