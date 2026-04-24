'use client';

import React, { useCallback, useEffect, useMemo, useReducer } from 'react';
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
import pc from '@/utils/muiColors';

const ACTIVE_STATUSES = new Set(['in_progress', 'calibration', 'connecting', 'active']);

const normalizeStatus = (status: string) => status.trim().toLowerCase();

type InterviewLivePageState = {
  allSessions: InterviewSession[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  autoRefresh: boolean;
  actionLoadingId: number | null;
};

type InterviewLivePageAction =
  | { type: 'set-all-sessions'; value: InterviewSession[] }
  | { type: 'set-loading'; value: boolean }
  | { type: 'set-refreshing'; value: boolean }
  | { type: 'set-error'; value: string | null }
  | { type: 'toggle-auto-refresh' }
  | { type: 'set-action-loading-id'; value: number | null };

const initialState: InterviewLivePageState = {
  allSessions: [],
  loading: true,
  refreshing: false,
  error: null,
  autoRefresh: true,
  actionLoadingId: null,
};

const reducer = (
  state: InterviewLivePageState,
  action: InterviewLivePageAction,
): InterviewLivePageState => {
  switch (action.type) {
    case 'set-all-sessions':
      return { ...state, allSessions: action.value };
    case 'set-loading':
      return { ...state, loading: action.value };
    case 'set-refreshing':
      return { ...state, refreshing: action.value };
    case 'set-error':
      return { ...state, error: action.value };
    case 'toggle-auto-refresh':
      return { ...state, autoRefresh: !state.autoRefresh };
    case 'set-action-loading-id':
      return { ...state, actionLoadingId: action.value };
    default:
      return state;
  }
};

const InterviewLivePage = () => {
  const { t } = useTranslation(['employer', 'interview', 'common']);
  const theme = useTheme();
  const [state, dispatch] = useReducer(reducer, initialState);

  const activeSessions = useMemo(
    () => state.allSessions.filter((session) => ACTIVE_STATUSES.has(normalizeStatus(session.status))),
    [state.allSessions],
  );

  const stats = useMemo(
    () => ({
      active: activeSessions.length,
      scheduled: state.allSessions.filter((session) => normalizeStatus(session.status) === 'scheduled').length,
      completed: state.allSessions.filter((session) => normalizeStatus(session.status) === 'completed').length,
    }),
    [activeSessions.length, state.allSessions],
  );

  const fetchSessions = useCallback(async (opts?: { silent?: boolean }) => {
    const silent = opts?.silent ?? false;

    if (silent) {
      dispatch({ type: 'set-refreshing', value: true });
    } else {
      dispatch({ type: 'set-loading', value: true });
      dispatch({ type: 'set-error', value: null });
    }

    try {
      const data = await interviewService.getSessions({
        pageSize: 200,
        ordering: '-create_at',
      });

      dispatch({ type: 'set-all-sessions', value: data.results || [] });
    } catch (fetchError) {
      console.error('Error fetching live interview sessions', fetchError);
      dispatch({
        type: 'set-error',
        value: t('common:messages.loadFailed'),
      });
    } finally {
      if (silent) {
        dispatch({ type: 'set-refreshing', value: false });
      } else {
        dispatch({ type: 'set-loading', value: false });
      }
    }
  }, [t]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  useEffect(() => {
    if (!state.autoRefresh) return undefined;
    if (activeSessions.length === 0) return undefined;
    const interval = setInterval(() => fetchSessions({ silent: true }), 5000);
    return () => clearInterval(interval);
  }, [activeSessions.length, state.autoRefresh, fetchSessions]);

  const handleForceEnd = useCallback(async (session: InterviewSession) => {
    if (!session.roomName) return;
    dispatch({ type: 'set-action-loading-id', value: session.id });
    try {
      await interviewService.updateSessionStatus(session.roomName, 'completed');
      await fetchSessions();
    } catch (updateError) {
      console.error('Error force ending session', updateError);
      dispatch({
        type: 'set-error',
        value: t('common:messages.actionFailed'),
      });
    } finally {
      dispatch({ type: 'set-action-loading-id', value: null });
    }
  }, [fetchSessions, t]);

  return (
    <Box sx={{ px: { xs: 1, sm: 2 }, py: { xs: 2, sm: 2 }, backgroundColor: 'background.paper', borderRadius: 2 }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        justifyContent="space-between"
        spacing={{ xs: 2, sm: 0 }}
        mb={3}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary', fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
            {t('interviewLive.title')}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            {t('employer:interviewLive.subtitle')}
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5} alignItems="center">
          <Button
            variant="outlined"
            color={state.autoRefresh ? 'primary' : 'inherit'}
            onClick={() => dispatch({ type: 'toggle-auto-refresh' })}
            sx={{ borderRadius: 2, px: 2, textTransform: 'none' }}
          >
            {state.autoRefresh ? t('employer:interviewLive.autoRefresh.on') : t('employer:interviewLive.autoRefresh.off')}
          </Button>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => fetchSessions()}
            startIcon={<RefreshIcon />}
            sx={{ borderRadius: 2, px: 2, textTransform: 'none' }}
          >
            {state.refreshing ? t('employer:interviewLive.updating') : t('common:actions.refresh')}
          </Button>
        </Stack>
      </Stack>

      {state.error && (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => fetchSessions()}>
              {t('common:actions.retry')}
            </Button>
          }
          sx={{ mb: 2 }}
        >
          {state.error}
        </Alert>
      )}

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={4}>
        <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: pc.primary( 0.15), bgcolor: pc.primary( 0.04), flex: 1, minWidth: 160 }}>
          <Stack direction="row" alignItems="center" spacing={1.5} mb={1.5}>
            <Avatar sx={{ width: 36, height: 36, bgcolor: pc.primary( 0.12), color: theme.palette.primary.main }}>
              <TrendingUpIcon sx={{ fontSize: 20 }} />
            </Avatar>
            <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase' }}>
              {t('employer:interviewLive.stats.inProgressLabel')}
            </Typography>
          </Stack>
          <Typography variant="h3" sx={{ fontWeight: 900, color: theme.palette.primary.main }}>
            {stats.active}
          </Typography>
        </Paper>

        <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: pc.info( 0.15), bgcolor: pc.info( 0.04), flex: 1, minWidth: 160 }}>
          <Stack direction="row" alignItems="center" spacing={1.5} mb={1.5}>
            <Avatar sx={{ width: 36, height: 36, bgcolor: pc.info( 0.12), color: theme.palette.info.main }}>
              <ScheduleIcon sx={{ fontSize: 20 }} />
            </Avatar>
            <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase' }}>
              {t('employer:interviewLive.stats.scheduledLabel')}
            </Typography>
          </Stack>
          <Typography variant="h3" sx={{ fontWeight: 900, color: theme.palette.info.main }}>
            {stats.scheduled}
          </Typography>
        </Paper>

        <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: pc.success( 0.15), bgcolor: pc.success( 0.04), flex: 1, minWidth: 160 }}>
          <Stack direction="row" alignItems="center" spacing={1.5} mb={1.5}>
            <Avatar sx={{ width: 36, height: 36, bgcolor: pc.success( 0.12), color: theme.palette.success.main }}>
              <CheckCircleIcon sx={{ fontSize: 20 }} />
            </Avatar>
            <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase' }}>
              {t('employer:interviewLive.stats.completedLabel')}
            </Typography>
          </Stack>
          <Typography variant="h3" sx={{ fontWeight: 900, color: theme.palette.success.main }}>
            {stats.completed}
          </Typography>
        </Paper>
      </Stack>

      {state.loading && (
        <Box sx={{ width: '100%', mb: 2 }}>
          <LinearProgress color="primary" sx={{ height: 4, borderRadius: 3 }} />
        </Box>
      )}

      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
        <FiberManualRecordIcon sx={{ fontSize: 12, color: theme.palette.primary.main, animation: 'liveDot 2s infinite', '@keyframes liveDot': { '0%, 100%': { opacity: 1 }, '50%': { opacity: 0.35 } } }} />
        <Typography variant="subtitle1" sx={{ fontWeight: 900, color: 'text.primary' }}>
          {t('employer:interviewLive.activeNow')}
        </Typography>
      </Stack>

      {activeSessions.length === 0 && !state.loading ? (
        <Paper
          elevation={0}
          sx={{
            p: 4,
            borderRadius: 4,
            border: '1px dashed',
            borderColor: 'divider',
            bgcolor: pc.bgPaper( 0.8),
            textAlign: 'center',
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
            {t('employer:interviewLive.noData.title')}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {t('employer:interviewLive.noData.subtitle')}
          </Typography>
        </Paper>
      ) : (
        <Stack spacing={2}>
          {activeSessions.map((session) => (
            <InterviewLiveCandidateCard
              key={session.id}
              session={session}
              onForceEnd={handleForceEnd}
              isForceEnding={state.actionLoadingId === session.id}
            />
          ))}
        </Stack>
      )}
    </Box>
  );
};

export default InterviewLivePage;