import React from 'react';
import { Box, Typography, Grid, Card, CardHeader, CardContent, Skeleton, Paper, Stack } from '@mui/material';
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
  const { data: stats, isLoading } = useAdminStats();

  const userRoleData = stats
    ? [
      { name: 'Nha tuyen dung', value: stats.totalEmployers || 0 },
      { name: 'Nguoi tim viec', value: stats.totalJobSeekers || 0 },
      { name: 'Quan tri vien', value: 5 },
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
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Tong nguoi dung"
            value={stats?.totalUsers}
            loading={isLoading}
            icon={<PeopleIcon sx={{ fontSize: 40 }} />}
            color="#3f51b5"
            trend={12}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Tin tuyen dung"
            value={stats?.totalJobPosts}
            loading={isLoading}
            icon={<WorkIcon sx={{ fontSize: 40 }} />}
            color="#4caf50"
            trend={8}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Cho duyet"
            value={stats?.totalJobPostsPending}
            loading={isLoading}
            icon={<QuestionAnswerIcon sx={{ fontSize: 40 }} />}
            color="#ff9800"
            trend={-5}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Luot ung tuyen"
            value={stats?.totalApplications}
            loading={isLoading}
            icon={<AssessmentIcon sx={{ fontSize: 40 }} />}
            color="#00bcd4"
            trend={15}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card sx={{ height: '100%' }}>
            <CardHeader title="Phan bo nguoi dung theo loai" />
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

        <Grid item xs={12} md={4}>
          <Stack spacing={3}>
            <Paper sx={{ p: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Thong ke chung</Typography>
              <Stack spacing={1}>
                <Typography variant="body2">Tong: {stats?.totalUsers || 0} nguoi dung</Typography>
                <Typography variant="body2">Nha tuyen dung: {stats?.totalEmployers || 0}</Typography>
                <Typography variant="body2">Nguoi tim viec: {stats?.totalJobSeekers || 0}</Typography>
              </Stack>
            </Paper>
            <Paper sx={{ p: 3, background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>He thong</Typography>
              <Stack spacing={1}>
                <Typography variant="body2">Trang thai: Hoat dong</Typography>
                <Typography variant="body2">Tin cho duyet: {stats?.totalJobPostsPending || 0}</Typography>
              </Stack>
            </Paper>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;
