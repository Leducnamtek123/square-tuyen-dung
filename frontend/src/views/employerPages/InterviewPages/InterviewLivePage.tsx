'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  LinearProgress,
  Paper,
  Stack,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RefreshIcon from '@mui/icons-material/Refresh';
import ScheduleIcon from '@mui/icons-material/Schedule';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

import interviewService from '../../../services/interviewService';
import { type InterviewSession } from '../../../types/models';
import InterviewLiveCandidateCard from '../../../views/components/employers/InterviewLiveCandidateCard';

const ACTIVE_STATUSES = new Set(['in_progress', 'calibration', 'connecting', 'active']);

const normalizeStatus = (status: string) => status.trim().toLowerCase();

const InterviewLivePage = () => {
  const { t } = useTranslation(['employer', 'interview', 'common']);
  const theme = useTheme();
  const [allSessions, setAllSessions] = useState<InterviewSession[]>([]);
  const [activeSessions, setActiveSessions] = useState<InterviewSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  const fetchSessions = useCallback(async (opts?: { silent?: boolean }) => {
    const silent = opts?.silent ?? false;

    if (silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
      setError(null);
    }

    try {
      const data = await interviewService.getSessions({
        pageSize: 200,
        ordering: '-create_at',
      });

      const sessions = data.results || [];
      setAllSessions(sessions);
      setActiveSessions(sessions.filter((session) => ACTIVE_STATUSES.has(normalizeStatus(session.status))));
    } catch (fetchError) {
      console.error('Error fetching live interview sessions', fetchError);
      setError(t('common:messages.loadFailed', { defaultValue: 'Không thể tải dữ liệu phỏng vấn live. Vui lòng thử lại.' }));
    } finally {
      if (silent) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  }, [t]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  useEffect(() => {
    if (!autoRefresh) return undefined;
    if (activeSessions.length === 0) return undefined;
    const interval = setInterval(() => fetchSessions({ silent: true }), 5000);
    return () => clearInterval(interval);
  }, [activeSessions.length, autoRefresh, fetchSessions]);

  const stats = useMemo(() => ({
    active: activeSessions.length,
    scheduled: allSessions.filter((session) => normalizeStatus(session.status) === 'scheduled').length,
    completed: allSessions.filter((session) => normalizeStatus(session.status) === 'completed').length,
  }), [activeSessions.length, allSessions]);

  const handleForceEnd = useCallback(async (session: InterviewSession) => {
    if (!session.roomName) return;
    setActionLoadingId(session.id);
    try {
      await interviewService.updateSessionStatus(session.roomName, 'completed');
      await fetchSessions();
    } catch (updateError) {
      console.error('Error force ending session', updateError);
      setError(t('common:messages.actionFailed', { defaultValue: 'Không thể thao tác lúc này. Vui lòng thử lại.' }));
    } finally {
      setActionLoadingId(null);
    }
  }, [fetchSessions, t]);

  return (
    <Box sx={{ px: { xs: 1, sm: 2 }, py: { xs: 2, sm: 2 }, backgroundColor: 'background.paper', borderRadius: 2 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between" spacing={{ xs: 2, sm: 0 }} mb={3}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary', fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
            {t('interviewLive.title', { defaultValue: 'Phỏng vấn Trực tiếp' })}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            Chỉ hiển thị các phiên đang live và preview realtime của ứng viên.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5} alignItems="center">
          <Button
            variant="outlined"
            color={autoRefresh ? 'primary' : 'inherit'}
            onClick={() => setAutoRefresh((prev) => !prev)}
            sx={{ borderRadius: 2, px: 2, textTransform: 'none' }}
          >
            {autoRefresh ? 'Auto refresh: ON' : 'Auto refresh: OFF'}
          </Button>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => fetchSessions()}
            startIcon={<RefreshIcon />}
            sx={{ borderRadius: 2, px: 2, textTransform: 'none' }}
          >
            {refreshing ? 'Đang cập nhật...' : t('common:actions.refresh', { defaultValue: 'Làm mới' })}
          </Button>
        </Stack>
      </Stack>

      {error && (
        <Alert severity="error" action={<Button color="inherit" size="small" onClick={() => fetchSessions()}>{t('common:actions.retry', { defaultValue: 'Thử lại' })}</Button>} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={4}>
        <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: alpha(theme.palette.primary.main, 0.15), bgcolor: alpha(theme.palette.primary.main, 0.04), flex: 1, minWidth: 160 }}>
          <Stack direction="row" alignItems="center" spacing={1.5} mb={1.5}>
            <Avatar sx={{ width: 36, height: 36, bgcolor: alpha(theme.palette.primary.main, 0.12), color: theme.palette.primary.main }}>
              <TrendingUpIcon sx={{ fontSize: 20 }} />
            </Avatar>
            <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase' }}>
              Đang diễn ra
            </Typography>
          </Stack>
          <Typography variant="h3" sx={{ fontWeight: 900, color: theme.palette.primary.main }}>
            {stats.active}
          </Typography>
        </Paper>

        <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: alpha(theme.palette.info.main, 0.15), bgcolor: alpha(theme.palette.info.main, 0.04), flex: 1, minWidth: 160 }}>
          <Stack direction="row" alignItems="center" spacing={1.5} mb={1.5}>
            <Avatar sx={{ width: 36, height: 36, bgcolor: alpha(theme.palette.info.main, 0.12), color: theme.palette.info.main }}>
              <ScheduleIcon sx={{ fontSize: 20 }} />
            </Avatar>
            <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase' }}>
              Đã lên lịch
            </Typography>
          </Stack>
          <Typography variant="h3" sx={{ fontWeight: 900, color: theme.palette.info.main }}>
            {stats.scheduled}
          </Typography>
        </Paper>

        <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: alpha(theme.palette.success.main, 0.15), bgcolor: alpha(theme.palette.success.main, 0.04), flex: 1, minWidth: 160 }}>
          <Stack direction="row" alignItems="center" spacing={1.5} mb={1.5}>
            <Avatar sx={{ width: 36, height: 36, bgcolor: alpha(theme.palette.success.main, 0.12), color: theme.palette.success.main }}>
              <CheckCircleIcon sx={{ fontSize: 20 }} />
            </Avatar>
            <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase' }}>
              Đã hoàn thành
            </Typography>
          </Stack>
          <Typography variant="h3" sx={{ fontWeight: 900, color: theme.palette.success.main }}>
            {stats.completed}
          </Typography>
        </Paper>
      </Stack>

      {loading && (
        <Box sx={{ width: '100%', mb: 2 }}>
          <LinearProgress color="primary" sx={{ height: 4, borderRadius: 3 }} />
        </Box>
      )}

      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
        <FiberManualRecordIcon sx={{ fontSize: 12, color: theme.palette.primary.main, animation: 'liveDot 2s infinite', '@keyframes liveDot': { '0%, 100%': { opacity: 1 }, '50%': { opacity: 0.35 } } }} />
        <Typography variant="subtitle1" sx={{ fontWeight: 900, color: 'text.primary' }}>
          Active Now
        </Typography>
      </Stack>

      {activeSessions.length === 0 && !loading ? (
        <Paper
          elevation={0}
          sx={{
            p: 4,
            borderRadius: 4,
            border: '1px dashed',
            borderColor: 'divider',
            bgcolor: alpha(theme.palette.background.paper, 0.8),
            textAlign: 'center',
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
            Chưa có phiên live nào
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Khi ứng viên bật camera hoặc mic, card realtime sẽ xuất hiện ở đây.
          </Typography>
        </Paper>
      ) : (
        <Stack spacing={2}>
          {activeSessions.map((session) => (
            <InterviewLiveCandidateCard
              key={session.id}
              session={session}
              onForceEnd={handleForceEnd}
              isForceEnding={actionLoadingId === session.id}
            />
          ))}
        </Stack>
      )}
    </Box>
  );
};

export default InterviewLivePage;
