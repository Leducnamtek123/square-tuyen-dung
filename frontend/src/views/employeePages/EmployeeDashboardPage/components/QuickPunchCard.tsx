'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Typography,
  Button,
  Stack,
  Chip,
  CircularProgress,
  Grid2 as Grid,
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import toastMessages from '@/utils/toastMessages';
import hrmService, { type NativeAttendanceRecord } from '@/services/hrmService';
import dayjs from 'dayjs';

interface Props {
  todayAttendance?: NativeAttendanceRecord | null;
  onRefresh: () => void;
}

export const QuickPunchCard: React.FC<Props> = ({ todayAttendance, onRefresh }) => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDateString, setCurrentDateString] = useState<string>('');
  const [isPunching, setIsPunching] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
      const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
      const dayName = days[now.getDay()];
      const formattedDate = dayjs(now).format('DD/MM/YYYY');
      setCurrentDateString(`${dayName}, ngày ${formattedDate}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const hasCheckedIn = Boolean(todayAttendance?.check_in || todayAttendance?.checkIn);
  const hasCheckedOut = Boolean(todayAttendance?.check_out || todayAttendance?.checkOut);

  const checkInTime = todayAttendance?.check_in || todayAttendance?.checkIn;
  const checkOutTime = todayAttendance?.check_out || todayAttendance?.checkOut;
  const workHours = todayAttendance?.working_hours ?? todayAttendance?.workingHours ?? 0;

  const handlePunch = async (punchType: 'CHECK_IN' | 'CHECK_OUT' | 'AUTO') => {
    setIsPunching(true);
    try {
      const res = await hrmService.punchSelfAttendance({
        punch_type: punchType,
      });
      toastMessages.success(res?.message || 'Chấm công thành công!');
      onRefresh();
    } catch (err: any) {
      console.error('Punch attendance error:', err);
      toastMessages.error(err?.message || 'Chấm công thất bại. Vui lòng thử lại.');
    } finally {
      setIsPunching(false);
    }
  };

  return (
    <Card
      elevation={0}
      sx={{
        p: 3,
        borderRadius: '16px',
        bgcolor: '#ffffff',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)',
        mb: 3,
      }}
    >
      <Grid container spacing={3} alignItems="center">
        {/* Real-time Clock */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Stack spacing={0.5}>
            <Stack direction="row" spacing={1} alignItems="center">
              <AccessTimeIcon sx={{ color: '#2563eb', fontSize: 20 }} />
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Đồng hồ chấm công Web
              </Typography>
            </Stack>
            <Typography variant="h3" sx={{ fontWeight: 900, color: '#0f172a', letterSpacing: '-1px' }}>
              {currentTime || '--:--:--'}
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>
              {currentDateString || 'Đang cập nhật...'}
            </Typography>
          </Stack>
        </Grid>

        {/* Status of Today */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Box
            sx={{
              p: 2,
              borderRadius: '12px',
              bgcolor: '#f8fafc',
              border: '1px solid #e2e8f0',
            }}
          >
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, display: 'block', mb: 1 }}>
              Ca làm việc: Ca Hành Chính (08:30 - 17:30)
            </Typography>

            <Stack direction="row" spacing={2} alignItems="center">
              <Box>
                <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                  Giờ vào:
                </Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: hasCheckedIn ? '#16a34a' : '#64748b' }}>
                  {hasCheckedIn ? String(checkInTime).slice(0, 5) : '--:--'}
                </Typography>
              </Box>

              <Typography variant="body2" sx={{ color: '#cbd5e1' }}>
                →
              </Typography>

              <Box>
                <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                  Giờ ra:
                </Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: hasCheckedOut ? '#2563eb' : '#64748b' }}>
                  {hasCheckedOut ? String(checkOutTime).slice(0, 5) : '--:--'}
                </Typography>
              </Box>

              <Box sx={{ ml: 'auto !important' }}>
                <Chip
                  icon={<CheckCircleOutlineIcon sx={{ fontSize: 16 }} />}
                  label={
                    hasCheckedOut
                      ? `Đã xong (${workHours}h)`
                      : hasCheckedIn
                      ? 'Đang làm việc'
                      : 'Chưa vào ca'
                  }
                  size="small"
                  color={hasCheckedOut ? 'default' : hasCheckedIn ? 'success' : 'warning'}
                  sx={{ fontWeight: 700 }}
                />
              </Box>
            </Stack>
          </Box>
        </Grid>

        {/* Action Button */}
        <Grid size={{ xs: 12, md: 3 }}>
          <Stack spacing={1}>
            {!hasCheckedIn ? (
              <Button
                variant="contained"
                color="primary"
                size="large"
                startIcon={<LoginIcon />}
                disabled={isPunching}
                onClick={() => handlePunch('CHECK_IN')}
                sx={{
                  py: 1.5,
                  borderRadius: '12px',
                  fontWeight: 800,
                  fontSize: '0.9375rem',
                  textTransform: 'none',
                  boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)',
                }}
              >
                {isPunching ? <CircularProgress size={24} color="inherit" /> : 'Vào ca (Check-in)'}
              </Button>
            ) : !hasCheckedOut ? (
              <Button
                variant="contained"
                color="secondary"
                size="large"
                startIcon={<LogoutIcon />}
                disabled={isPunching}
                onClick={() => handlePunch('CHECK_OUT')}
                sx={{
                  py: 1.5,
                  borderRadius: '12px',
                  fontWeight: 800,
                  fontSize: '0.9375rem',
                  textTransform: 'none',
                  bgcolor: '#0f172a',
                  '&:hover': { bgcolor: '#1e293b' },
                  boxShadow: '0 4px 14px rgba(15, 23, 42, 0.3)',
                }}
              >
                {isPunching ? <CircularProgress size={24} color="inherit" /> : 'Ra ca (Check-out)'}
              </Button>
            ) : (
              <Button
                variant="outlined"
                color="inherit"
                size="large"
                startIcon={<AccessTimeIcon />}
                disabled={isPunching}
                onClick={() => handlePunch('AUTO')}
                sx={{
                  py: 1.5,
                  borderRadius: '12px',
                  fontWeight: 700,
                  fontSize: '0.9375rem',
                  textTransform: 'none',
                  borderColor: '#cbd5e1',
                  color: '#475569',
                }}
              >
                {isPunching ? <CircularProgress size={24} color="inherit" /> : 'Quẹt thẻ lại'}
              </Button>
            )}
            <Typography variant="caption" sx={{ color: '#94a3b8', textAlign: 'center', display: 'block' }}>
              Hệ thống tự động ghi nhận nhật ký quẹt thẻ
            </Typography>
          </Stack>
        </Grid>
      </Grid>
    </Card>
  );
};

export default QuickPunchCard;
