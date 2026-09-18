'use client';

import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  CircularProgress,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import BarChartClient from '@/components/Common/Charts/BarChartClient';
import { useAdminTrendStats } from '../hooks/useAdminStats';
import { createCartesianOptions } from '@/components/Common/Charts/chartDesign';

export default function AnalyticsCharts() {
  const [days, setDays] = useState<number>(30);
  const theme = useTheme();
  const { data: trendStats, isLoading } = useAdminTrendStats(days);

  const handlePeriodChange = (
    _event: React.MouseEvent<HTMLElement>,
    newDays: number | null
  ) => {
    if (newDays !== null) {
      setDays(newDays);
    }
  };

  const chartData = {
    labels: trendStats?.labels || [],
    datasets: [
      {
        label: 'Người dùng mới',
        data: trendStats?.newUsers || [],
        backgroundColor: '#3B82F6',
        borderRadius: 4,
      },
      {
        label: 'Tin tuyển dụng',
        data: trendStats?.newJobs || [],
        backgroundColor: '#10B981',
        borderRadius: 4,
      },
      {
        label: 'Hồ sơ ứng tuyển',
        data: trendStats?.newApplications || [],
        backgroundColor: '#F59E0B',
        borderRadius: 4,
      },
      {
        label: 'Phỏng vấn AI',
        data: trendStats?.newInterviews || [],
        backgroundColor: '#8B5CF6',
        borderRadius: 4,
      },
    ],
  };

  const chartOptions = createCartesianOptions(theme, {
    displayLegend: true,
  });

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
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 1.5,
          mb: 2.5,
        }}
      >
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#0F172A', fontSize: '1.125rem' }}>
            Xu hướng tăng trưởng hệ thống
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B', mt: 0.25, fontSize: '0.8125rem' }}>
            Thống kê thời gian thực về đăng ký, tin đăng, lượt ứng tuyển và phỏng vấn AI
          </Typography>
        </Box>

        <ToggleButtonGroup
          size="small"
          value={days}
          exclusive
          onChange={handlePeriodChange}
          sx={{
            bgcolor: '#F8FAFC',
            p: 0.5,
            borderRadius: 2,
            border: '1px solid #E2E8F0',
            '& .MuiToggleButton-root': {
              border: 'none',
              borderRadius: 1.5,
              px: 1.5,
              py: 0.5,
              fontSize: '0.75rem',
              fontWeight: 600,
              textTransform: 'none',
              color: '#64748B',
              '&.Mui-selected': {
                bgcolor: '#FFFFFF',
                color: '#2563EB',
                boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
              },
            },
          }}
        >
          <ToggleButton value={7}>7 ngày</ToggleButton>
          <ToggleButton value={30}>30 ngày</ToggleButton>
          <ToggleButton value={90}>3 tháng</ToggleButton>
          <ToggleButton value={365}>1 năm</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Box sx={{ height: 320, position: 'relative' }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <CircularProgress size={32} thickness={4} />
          </Box>
        ) : (
          <BarChartClient data={chartData} options={chartOptions} />
        )}
      </Box>
    </Paper>
  );
}
