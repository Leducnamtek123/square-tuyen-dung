'use client';

import React, { useMemo } from 'react';
import { Box, Typography, Paper, Stack, Divider, LinearProgress, Skeleton, Button } from "@mui/material";
import { useTranslation } from 'react-i18next';
import { useTheme } from '@mui/material/styles';
import { Grid2 as Grid } from "@mui/material";

import RefreshIcon from '@mui/icons-material/Refresh';
import PeopleIcon from '@mui/icons-material/People';
import WorkIcon from '@mui/icons-material/Work';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import AssessmentIcon from '@mui/icons-material/Assessment';
import BusinessIcon from '@mui/icons-material/Business';
import DescriptionIcon from '@mui/icons-material/Description';
import BookmarkAddedIcon from '@mui/icons-material/BookmarkAdded';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';

import PieChartClient from '@/components/Common/Charts/PieChartClient';
import {
  ChartEmptyState,
  ChartLoadingState,
  chartColors,
  createDoughnutOptions,
  rgba,
} from '@/components/Common/Charts/chartDesign';
import { useAdminStats } from './hooks/useAdminStats';
import LiveMetricCard from './components/LiveMetricCard';
import AnalyticsCharts from './components/AnalyticsCharts';
import PendingActionWidget from './components/PendingActionWidget';

type ChartItem = {
  name: string;
  value: number;
  color: string;
};

type DashboardPanelProps = {
  title: string;
  children: React.ReactNode;
  accentColor?: string;
  action?: React.ReactNode;
};

type InfoRowProps = {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
  color?: string;
  loading?: boolean;
};

type ProgressRowProps = {
  label: string;
  value: number;
  total: number;
  color: string;
  formatter: (value: number) => string;
  loading?: boolean;
};

const n = (value?: number | null) => Number(value ?? 0);

const percent = (value: number, total: number) => {
  if (!total) return 0;
  return Math.round((value / total) * 100);
};

const DashboardPanel = ({ title, children, action }: DashboardPanelProps) => (
  <Paper
    elevation={0}
    sx={{
      height: '100%',
      p: { xs: 2, sm: 2.5 },
      borderRadius: 3,
      border: '1px solid #E2E8F0',
      bgcolor: '#FFFFFF',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.04)',
      overflow: 'hidden',
      position: 'relative',
    }}
  >
    <Stack spacing={2} sx={{ height: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
        <Typography variant="h6" sx={{ fontSize: '1.05rem', fontWeight: 700, color: '#0F172A' }}>
          {title}
        </Typography>
        {action}
      </Box>
      {children}
    </Stack>
  </Paper>
);

const InfoRow = ({ label, value, icon, color = chartColors.navy, loading }: InfoRowProps) => (
  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5 }}>
    <Stack direction="row" spacing={1.25} alignItems="center" sx={{ minWidth: 0 }}>
      {icon ? (
        <Box
          sx={{
            width: 28,
            height: 28,
            borderRadius: '8px',
            bgcolor: rgba(color, 0.1),
            color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
      ) : null}
      <Typography variant="body2" sx={{ color: '#475569', fontWeight: 500, fontSize: '0.875rem' }} noWrap>
        {label}
      </Typography>
    </Stack>
    {loading ? (
      <Skeleton variant="text" width={48} height={24} />
    ) : (
      <Typography variant="body2" sx={{ color: '#0F172A', fontWeight: 700, fontSize: '0.875rem' }}>
        {value}
      </Typography>
    )}
  </Box>
);

const ProgressRow = ({ label, value, total, color, formatter, loading }: ProgressRowProps) => {
  const pct = percent(value, total);
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.75 }}>
        <Typography variant="body2" sx={{ color: '#475569', fontWeight: 500, fontSize: '0.8125rem' }}>
          {label}
        </Typography>
        {loading ? (
          <Skeleton variant="text" width={56} height={20} />
        ) : (
          <Typography variant="caption" sx={{ color: '#0F172A', fontWeight: 700 }}>
            {formatter(value)} ({pct}%)
          </Typography>
        )}
      </Box>
      <LinearProgress
        variant={loading ? 'indeterminate' : 'determinate'}
        value={loading ? undefined : pct}
        sx={{
          height: 6,
          borderRadius: 3,
          bgcolor: '#F1F5F9',
          '& .MuiLinearProgress-bar': { bgcolor: color, borderRadius: 3 },
        }}
      />
    </Box>
  );
};

export default function DashboardPage() {
  const { t } = useTranslation('admin');
  const theme = useTheme();
  const { data: stats, isLoading, refetch, isFetching } = useAdminStats();

  const totalUsers = n(stats?.totalUsers);
  const totalJobPosts = n(stats?.totalJobPosts);
  const totalApplications = n(stats?.totalApplications);
  const totalInterviews = n(stats?.totalInterviews);
  const totalCompanies = n(stats?.totalCompanies);
  const totalResumes = n(stats?.totalResumes);
  const totalVerifiedCompanies = n(stats?.totalCompaniesVerified);
  const totalActiveResumes = n(stats?.totalActiveResumes);

  const jobStatusItems: ChartItem[] = useMemo(() => [
    { name: t('dashboard.jobStates.active'), value: n(stats?.totalJobPostsActive), color: chartColors.emerald },
    { name: t('dashboard.jobStates.pending'), value: n(stats?.totalJobPostsPending), color: chartColors.amber },
    { name: t('dashboard.jobStates.expired'), value: n(stats?.totalJobPostsExpired), color: chartColors.slate },
    { name: t('dashboard.jobStates.rejected'), value: n(stats?.totalJobPostsRejected), color: chartColors.red },
  ], [stats, t]);

  const interviewStatusItems: ChartItem[] = useMemo(() => [
    { name: t('dashboard.interviewStates.completed'), value: n(stats?.totalInterviewsCompleted), color: chartColors.emerald },
    { name: t('dashboard.interviewStates.scheduled'), value: n(stats?.totalInterviewsScheduled), color: chartColors.sky },
    { name: t('dashboard.interviewStates.inProgress'), value: n(stats?.totalInterviewsInProgress), color: chartColors.cyan },
    { name: t('dashboard.interviewStates.draft'), value: n(stats?.totalInterviewsDraft), color: chartColors.slate },
    { name: t('dashboard.interviewStates.cancelled'), value: n(stats?.totalInterviewsCancelled), color: chartColors.red },
  ], [stats, t]);

  const applicationPipelineItems = useMemo(() => [
    { label: t('dashboard.applicationStates.pending'), value: n(stats?.totalApplicationsPending), color: chartColors.amber },
    { label: t('dashboard.applicationStates.contacted'), value: n(stats?.totalApplicationsContacted), color: chartColors.cyan },
    { label: t('dashboard.applicationStates.tested'), value: n(stats?.totalApplicationsTested), color: chartColors.sky },
    { label: t('dashboard.applicationStates.interviewed'), value: n(stats?.totalApplicationsInterviewed), color: chartColors.violet },
    { label: t('dashboard.applicationStates.hired'), value: n(stats?.totalApplicationsHired), color: chartColors.emerald },
    { label: t('dashboard.applicationStates.notSelected'), value: n(stats?.totalApplicationsNotSelected), color: chartColors.red },
  ], [stats, t]);

  const jobChartData = useMemo(() => ({
    labels: jobStatusItems.map((item) => item.name),
    datasets: [{
      data: jobStatusItems.map((item) => item.value),
      backgroundColor: jobStatusItems.map((item) => item.color),
      borderWidth: 0,
    }],
  }), [jobStatusItems]);

  const interviewChartData = useMemo(() => ({
    labels: interviewStatusItems.map((item) => item.name),
    datasets: [{
      data: interviewStatusItems.map((item) => item.value),
      backgroundColor: interviewStatusItems.map((item) => item.color),
      borderWidth: 0,
    }],
  }), [interviewStatusItems]);

  const pieOptions = useMemo(() => createDoughnutOptions(theme), [theme]);

  return (
    <Box sx={{ width: '100%', pb: 6 }}>
      {/* Header section */}
      <Box
        sx={{
          mb: 3.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F172A', fontSize: { xs: '1.5rem', sm: '1.875rem' } }}>
            {t('dashboard.operatingStats')}
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B', mt: 0.5 }}>
            {t('dashboard.last30Days')}
          </Typography>
        </Box>

        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={() => refetch()}
          disabled={isFetching}
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: 2.5,
            borderColor: '#E2E8F0',
            color: '#334155',
            bgcolor: '#FFFFFF',
            '&:hover': { borderColor: '#CBD5E1', bgcolor: '#F8FAFC' },
          }}
        >
          {isFetching ? t('dashboard.loadingChart') : 'Làm mới dữ liệu'}
        </Button>
      </Box>

      {/* KPI Cards Grid */}
      <Grid container spacing={{ xs: 1.5, sm: 2.5 }} sx={{ mb: 3.5 }}>
        <Grid size={{ xs: 6, sm: 6, md: 4, lg: 2.4 }}>
          <LiveMetricCard
            title={t('dashboard.noUserData')}
            value={totalUsers}
            subtitle={`${t('dashboard.last30Days')}: +${n(stats?.newUsers30d)}`}
            deltaPercent={14}
            icon={<PeopleIcon sx={{ fontSize: 24 }} />}
            iconBgColor="#EFF6FF"
            iconColor="#2563EB"
            loading={isLoading}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 6, md: 4, lg: 2.4 }}>
          <LiveMetricCard
            title={t('dashboard.jobPostStatus')}
            value={totalJobPosts}
            subtitle={`${t('dashboard.newJobPosts30d')}: ${n(stats?.newJobPosts30d)}`}
            deltaPercent={8}
            icon={<WorkIcon sx={{ fontSize: 24 }} />}
            iconBgColor="#ECFDF5"
            iconColor="#10B981"
            loading={isLoading}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 6, md: 4, lg: 2.4 }}>
          <LiveMetricCard
            title={t('dashboard.applicationPipeline')}
            value={totalApplications}
            subtitle={`${t('dashboard.newApplications30d')}: ${n(stats?.newApplications30d)}`}
            deltaPercent={22}
            icon={<DescriptionIcon sx={{ fontSize: 24 }} />}
            iconBgColor="#FFFBEB"
            iconColor="#F59E0B"
            loading={isLoading}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 6, md: 4, lg: 2.4 }}>
          <LiveMetricCard
            title={t('dashboard.companies')}
            value={totalCompanies}
            subtitle={`${t('dashboard.verifiedCompanies')}: ${totalVerifiedCompanies}`}
            deltaPercent={12}
            icon={<BusinessIcon sx={{ fontSize: 24 }} />}
            iconBgColor="#F5F3FF"
            iconColor="#8B5CF6"
            loading={isLoading}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 6, md: 4, lg: 2.4 }}>
          <LiveMetricCard
            title={t('dashboard.interviews')}
            value={totalInterviews}
            subtitle={`${t('dashboard.newInterviews30d')}: ${n(stats?.newInterviews30d)}`}
            deltaPercent={35}
            icon={<SmartToyOutlinedIcon sx={{ fontSize: 24 }} />}
            iconBgColor="#FDF2F8"
            iconColor="#EC4899"
            loading={isLoading}
          />
        </Grid>
      </Grid>

      {/* Main Trends & Pending Actions */}
      <Grid container spacing={3} sx={{ mb: 3.5 }}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <AnalyticsCharts />
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <PendingActionWidget stats={stats} loading={isLoading} />
        </Grid>
      </Grid>

      {/* Breakdown Panels */}
      <Grid container spacing={3}>
        {/* Job Status Distribution */}
        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <DashboardPanel title={t('dashboard.jobPostStatus')}>
            {isLoading ? (
              <ChartLoadingState height={240} />
            ) : totalJobPosts === 0 ? (
              <ChartEmptyState height={240} label={t('dashboard.noJobPostData')} />
            ) : (
              <Box sx={{ height: 240, position: 'relative' }}>
                <PieChartClient data={jobChartData} options={pieOptions} />
              </Box>
            )}
            <Divider sx={{ my: 1.5 }} />
            <Stack spacing={1.25}>
              <InfoRow label={t('dashboard.activeRate')} value={`${percent(n(stats?.totalJobPostsActive), totalJobPosts)}%`} loading={isLoading} />
              <InfoRow label={t('dashboard.savedJobs')} value={n(stats?.totalSavedJobPosts).toLocaleString()} icon={<BookmarkAddedIcon sx={{ fontSize: 16 }} />} loading={isLoading} />
            </Stack>
          </DashboardPanel>
        </Grid>

        {/* Application Funnel */}
        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <DashboardPanel title={t('dashboard.applicationPipeline')}>
            {totalApplications === 0 ? (
              <ChartEmptyState height={240} label={t('dashboard.noApplicationData')} />
            ) : (
              <Stack spacing={1.5} sx={{ py: 1 }}>
                {applicationPipelineItems.map((item) => (
                  <ProgressRow
                    key={item.label}
                    label={item.label}
                    value={item.value}
                    total={totalApplications}
                    color={item.color}
                    formatter={(v) => v.toLocaleString()}
                    loading={isLoading}
                  />
                ))}
              </Stack>
            )}
            <Divider sx={{ my: 1.5 }} />
            <Stack spacing={1.25}>
              <InfoRow label={t('dashboard.hiringRate')} value={`${percent(n(stats?.totalApplicationsHired), totalApplications)}%`} color={chartColors.emerald} loading={isLoading} />
              <InfoRow label={t('dashboard.avgApplicationsPerJob')} value={(totalJobPosts ? (totalApplications / totalJobPosts).toFixed(1) : '0')} loading={isLoading} />
            </Stack>
          </DashboardPanel>
        </Grid>

        {/* Interview & Profile Ecosystem */}
        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <DashboardPanel title={t('dashboard.interviewStatus')}>
            {isLoading ? (
              <ChartLoadingState height={240} />
            ) : totalInterviews === 0 ? (
              <ChartEmptyState height={240} label={t('dashboard.noInterviewData')} />
            ) : (
              <Box sx={{ height: 240, position: 'relative' }}>
                <PieChartClient data={interviewChartData} options={pieOptions} />
              </Box>
            )}
            <Divider sx={{ my: 1.5 }} />
            <Stack spacing={1.25}>
              <InfoRow label={t('dashboard.completionRate')} value={`${percent(n(stats?.totalInterviewsCompleted), totalInterviews)}%`} color={chartColors.emerald} loading={isLoading} />
              <InfoRow label={t('dashboard.questionBank')} value={n(stats?.totalQuestions).toLocaleString()} icon={<QuestionAnswerIcon sx={{ fontSize: 16 }} />} loading={isLoading} />
              <InfoRow label={t('dashboard.questionGroups')} value={n(stats?.totalQuestionGroups).toLocaleString()} icon={<AssessmentIcon sx={{ fontSize: 16 }} />} loading={isLoading} />
            </Stack>
          </DashboardPanel>
        </Grid>

        {/* Company & Profile Ecosystem */}
        <Grid size={{ xs: 12 }}>
          <DashboardPanel title={t('dashboard.profileCompanyStats')}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Stack spacing={1.25}>
                  <InfoRow label={t('dashboard.verifiedRate')} value={`${percent(totalVerifiedCompanies, totalCompanies)}%`} color={chartColors.emerald} loading={isLoading} />
                  <InfoRow label={t('dashboard.companyFollowers')} value={n(stats?.totalCompanyFollowers).toLocaleString()} icon={<BusinessIcon sx={{ fontSize: 16 }} />} loading={isLoading} />
                </Stack>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Stack spacing={1.25}>
                  <InfoRow label={t('dashboard.resumes')} value={totalResumes.toLocaleString()} icon={<DescriptionIcon sx={{ fontSize: 16 }} />} loading={isLoading} />
                  <InfoRow label={t('dashboard.activeResumes')} value={totalActiveResumes.toLocaleString()} loading={isLoading} />
                </Stack>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Stack spacing={1.25}>
                  <InfoRow label={t('dashboard.activeProfileRate')} value={`${percent(totalActiveResumes, totalResumes)}%`} color={chartColors.sky} loading={isLoading} />
                  <InfoRow label={t('dashboard.savedResumes')} value={n(stats?.totalSavedResumes).toLocaleString()} icon={<BookmarkAddedIcon sx={{ fontSize: 16 }} />} loading={isLoading} />
                </Stack>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Stack spacing={1.25}>
                  <InfoRow label={t('dashboard.resumeViews')} value={n(stats?.totalResumeViews).toLocaleString()} icon={<VisibilityIcon sx={{ fontSize: 16 }} />} loading={isLoading} />
                </Stack>
              </Grid>
            </Grid>
          </DashboardPanel>
        </Grid>
      </Grid>
    </Box>
  );
}
