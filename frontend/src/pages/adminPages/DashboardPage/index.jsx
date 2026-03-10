import React from 'react';
import { Box, Typography, Grid, Card, CardHeader, CardContent, Skeleton, Paper, Stack } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import WorkIcon from '@mui/icons-material/Work';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { useAdminStats } from './hooks/useAdminStats';
import StatCard from './components/StatCard';


const COLORS = ['#3f51b5', '#ff9800', '#f44336', '#4caf50', '#00bcd4'];

const DashboardPage = () => {
  const { data: stats, isLoading } = useAdminStats();

  const userRoleData = stats
    ? [
      { name: 'Nhà tuyển dụng', value: stats.totalEmployers || 0 },
      { name: 'Người tìm việc', value: stats.totalJobSeekers || 0 },
      { name: 'Quản trị viên', value: 5 },
    ]
    : [];

  return (
    <Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Tổng Người dùng"
            value={stats?.totalUsers}
            loading={isLoading}
            icon={<PeopleIcon sx={{ fontSize: 40 }} />}
            color="#3f51b5"
            trend={12}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Tin Tuyển dụng"
            value={stats?.totalJobPosts}
            loading={isLoading}
            icon={<WorkIcon sx={{ fontSize: 40 }} />}
            color="#4caf50"
            trend={8}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Chờ duyệt"
            value={stats?.totalJobPostsPending}
            loading={isLoading}
            icon={<QuestionAnswerIcon sx={{ fontSize: 40 }} />}
            color="#ff9800"
            trend={-5}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Lượt ứng tuyển"
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
            <CardHeader title="Phân bổ người dùng theo loại" />
            <CardContent sx={{ height: 350 }}>
              {isLoading ? (
                <Skeleton variant="rectangular" height="100%" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={userRoleData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name}: ${entry.value}`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {userRoleData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Stack spacing={3}>
            <Paper sx={{ p: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Thống kê chung</Typography>
              <Stack spacing={1}>
                <Typography variant="body2">Tổng: {stats?.totalUsers || 0} người dùng</Typography>
                <Typography variant="body2">Nhà tuyển dụng: {stats?.totalEmployers || 0}</Typography>
                <Typography variant="body2">Người tìm việc: {stats?.totalJobSeekers || 0}</Typography>
              </Stack>
            </Paper>
            <Paper sx={{ p: 3, background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Hệ thống</Typography>
              <Stack spacing={1}>
                <Typography variant="body2">Trạng thái: Hoạt động</Typography>
                <Typography variant="body2">Tin chờ duyệt: {stats?.totalJobPostsPending || 0}</Typography>
              </Stack>
            </Paper>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;
