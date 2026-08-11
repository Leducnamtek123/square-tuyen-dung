'use client';

import React from 'react';
import {
  Box,
  Card,
  Typography,
  Select,
  MenuItem,
  Stack,
  LinearProgress,
} from '@mui/material';
import InsertChartOutlinedIcon from '@mui/icons-material/InsertChartOutlined';

interface CandidateActivityChartCardProps {
  stats?: {
    appliedCount?: number;
    savedCount?: number;
    viewedCount?: number;
    followingCount?: number;
  };
}

const CandidateActivityChartCard: React.FC<CandidateActivityChartCardProps> = ({ stats }) => {
  const [timeframe, setTimeframe] = React.useState('7_days');

  const appliedCount = stats?.appliedCount ?? 0;
  const savedCount = stats?.savedCount ?? 0;
  const viewedCount = stats?.viewedCount ?? 0;
  const followingCount = stats?.followingCount ?? 0;

  const totalActivity = appliedCount + savedCount + viewedCount + followingCount;

  return (
    <Card
      elevation={0}
      sx={{
        p: 2.5,
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        backgroundColor: '#ffffff',
        boxShadow: '0 4px 20px -2px rgba(0,0,0,0.03)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0f172a' }}>
          Hoạt động của bạn
        </Typography>

        <Select
          size="small"
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value)}
          sx={{
            borderRadius: '8px',
            fontSize: '0.8rem',
            fontWeight: 600,
            color: '#475569',
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: '#cbd5e1',
            },
          }}
        >
          <MenuItem value="7_days">7 ngày qua</MenuItem>
          <MenuItem value="30_days">30 ngày qua</MenuItem>
          <MenuItem value="90_days">90 ngày qua</MenuItem>
        </Select>
      </Box>

      {totalActivity === 0 ? (
        /* Empty State Graphic */
        <Box
          sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            py: 4,
            textAlign: 'center',
          }}
        >
          <Box
            sx={{
              width: 100,
              height: 80,
              mb: 2,
              borderRadius: '12px',
              backgroundColor: '#eff6ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#3b82f6',
            }}
          >
            <InsertChartOutlinedIcon sx={{ fontSize: 54 }} />
          </Box>

          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a', mb: 0.5 }}>
            Chưa có dữ liệu thống kê
          </Typography>

          <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.8rem' }}>
            Khi bạn hoạt động, dữ liệu sẽ được hiển thị tại đây.
          </Typography>
        </Box>
      ) : (
        /* Real Activity Bars Breakdown */
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', py: 2 }}>
          <Stack spacing={2}>
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569' }}>
                  Hồ sơ đã ứng tuyển
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#16a34a' }}>
                  {appliedCount}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={Math.min(appliedCount * 25, 100)}
                sx={{ height: 8, borderRadius: 4, backgroundColor: '#f0fdf4', '& .MuiLinearProgress-bar': { backgroundColor: '#16a34a' } }}
              />
            </Box>

            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569' }}>
                  Việc làm đã lưu
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#2563eb' }}>
                  {savedCount}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={Math.min(savedCount * 25, 100)}
                sx={{ height: 8, borderRadius: 4, backgroundColor: '#eff6ff', '& .MuiLinearProgress-bar': { backgroundColor: '#2563eb' } }}
              />
            </Box>

            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569' }}>
                  Nhà tuyển dụng đã xem CV
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#4f46e5' }}>
                  {viewedCount}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={Math.min(viewedCount * 25, 100)}
                sx={{ height: 8, borderRadius: 4, backgroundColor: '#eef2ff', '& .MuiLinearProgress-bar': { backgroundColor: '#4f46e5' } }}
              />
            </Box>

            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569' }}>
                  Công ty đang theo dõi
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#ea580c' }}>
                  {followingCount}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={Math.min(followingCount * 25, 100)}
                sx={{ height: 8, borderRadius: 4, backgroundColor: '#fff7ed', '& .MuiLinearProgress-bar': { backgroundColor: '#ea580c' } }}
              />
            </Box>
          </Stack>
        </Box>
      )}
    </Card>
  );
};

export default CandidateActivityChartCard;
