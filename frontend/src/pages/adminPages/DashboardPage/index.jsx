import React from 'react';
import { Box, Typography, Card, CardHeader, CardContent, Skeleton, Paper, Stack } from "@mui/material";
import { useTranslation } from 'react-i18next';
import Grid from "@mui/material/Grid2";

import PeopleIcon from '@mui/icons-material/People';
import WorkIcon from '@mui/icons-material/Work';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { useAdminStats } from './hooks/useAdminStats';
import StatCard from './components/StatCard';

ChartJS.register(ArcElement, Tooltip, Legend);

const COLORS = ['#3f51b5', '#ff9800', '#f44336', '#4caf50', '#00bcd4'];

const DashboardPage = () => {
  const { t } = useTranslation('admin');
  const { data: stats, isLoading } = useAdminStats();

  const userRoleData = stats
    ? [
      { name: t('dashboard.roles.employer'), value: stats.totalEmployers || 0 },
      { name: t('dashboard.roles.jobSeeker'), value: stats.totalJobSeekers || 0 },
      { name: t('dashboard.roles.admin'), value: 5 },
    ]
    : [];

  const pieData = {
    labels: userRoleData.map((item) => item.name),
    datasets: [
      {
        data: userRoleData.map((item) => item.value),
        backgroundColor: COLORS,
        borderWidth: 0,
      },
    ],
  };

  const pieOptions = {
    plugins: {
      legend: {
        position: 'bottom',
      },
      tooltip: {
        callbacks: {
          label: (context) => `${context.label}: ${context.parsed}`,
        },
      },
    },
    maintainAspectRatio: false,
  };

  return (
    <Box>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid
          size={{
            xs: 12,
            sm: 6,
            md: 3
          }}>
          <StatCard
            title={t('dashboard.totalUsers')}
            value={stats?.totalUsers}
            loading={isLoading}
            icon={<PeopleIcon sx={{ fontSize: 40 }} />}
            color="#3f51b5"
            trend={12}
          />
        </Grid>
        <Grid
          size={{
            xs: 12,
            sm: 6,
            md: 3
          }}>
          <StatCard
            title={t('dashboard.jobPosts')}
            value={stats?.totalJobPosts}
            loading={isLoading}
            icon={<WorkIcon sx={{ fontSize: 40 }} />}
            color="#4caf50"
            trend={8}
          />
        </Grid>
        <Grid
          size={{
            xs: 12,
            sm: 6,
            md: 3
          }}>
          <StatCard
            title={t('dashboard.pendingApproval')}
            value={stats?.totalJobPostsPending}
            loading={isLoading}
            icon={<QuestionAnswerIcon sx={{ fontSize: 40 }} />}
            color="#ff9800"
            trend={-5}
          />
        </Grid>
        <Grid
          size={{
            xs: 12,
            sm: 6,
            md: 3
          }}>
          <StatCard
            title={t('dashboard.applications')}
            value={stats?.totalApplications}
            loading={isLoading}
            icon={<AssessmentIcon sx={{ fontSize: 40 }} />}
            color="#00bcd4"
            trend={15}
          />
        </Grid>
      </Grid>
      <Grid container spacing={3}>
        <Grid
          size={{
            xs: 12,
            md: 8
          }}>
          <Card sx={{ height: '100%' }}>
            <CardHeader title={t('dashboard.userDistribution')} />
            <CardContent sx={{ height: 350 }}>
              {isLoading ? (
                <Skeleton variant="rectangular" height="100%" />
              ) : (
                <Box sx={{ height: '100%' }}>
                  <Pie data={pieData} options={pieOptions} />
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid
          size={{
            xs: 12,
            md: 4
          }}>
          <Stack spacing={3}>
            <Paper sx={{ p: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>{t('dashboard.generalStats')}</Typography>
              <Stack spacing={1}>
                <Typography variant="body2">{t('dashboard.total')} {stats?.totalUsers || 0} {t('dashboard.users')}</Typography>
                <Typography variant="body2">{t('dashboard.employers')} {stats?.totalEmployers || 0}</Typography>
                <Typography variant="body2">{t('dashboard.jobSeekers')} {stats?.totalJobSeekers || 0}</Typography>
              </Stack>
            </Paper>
            <Paper sx={{ p: 3, background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>{t('dashboard.systemInfo')}</Typography>
              <Stack spacing={1}>
                <Typography variant="body2">{t('dashboard.status')} {t('dashboard.statusActive')}</Typography>
                <Typography variant="body2">{t('dashboard.pendingPosts')} {stats?.totalJobPostsPending || 0}</Typography>
              </Stack>
            </Paper>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;
