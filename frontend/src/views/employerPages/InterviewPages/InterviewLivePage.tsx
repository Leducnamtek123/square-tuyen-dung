'use client';

import React, { useCallback, useEffect, useMemo, useReducer, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  FormControlLabel,
  IconButton,
  InputAdornment,
  LinearProgress,
  Paper,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import SearchOffIcon from '@mui/icons-material/SearchOff';

import interviewService from '@/services/interviewService';
import { type InterviewSession } from '@/types/models';
import InterviewLiveCandidateCard from '@/views/components/employers/InterviewLiveCandidateCard';
import { getLiveInterviewSessions } from './liveInterviewSessions';

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
    () => getLiveInterviewSessions(state.allSessions),
    [state.allSessions],
  );

  const [searchQuery, setSearchQuery] = useState('');

  const filteredSessions = useMemo(() => {
    if (!searchQuery.trim()) return activeSessions;
    const q = searchQuery.trim().toLowerCase();
    return activeSessions.filter((session) => {
      const candidateName = (session.candidateName || '').toLowerCase();
      const jobName = (
        typeof session.questionGroup === 'object' && session.questionGroup && 'name' in session.questionGroup
          ? String((session.questionGroup as any).name)
          : session.jobName || ''
      ).toLowerCase();
      const room = (session.roomName || '').toLowerCase();
      return candidateName.includes(q) || jobName.includes(q) || room.includes(q);
    });
  }, [activeSessions, searchQuery]);

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
    <Box sx={{ px: { xs: 1.5, sm: 3 }, py: { xs: 2.5, sm: 3 }, maxWidth: 1600, mx: 'auto' }}>
      {/* Top Header & Controls */}
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        alignItems={{ xs: 'flex-start', md: 'center' }}
        justifyContent="space-between"
        spacing={2}
        sx={{
          mb: 3.5,
          p: { xs: 2, sm: 2.5 },
          borderRadius: 4,
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.04)',
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 0.5 }}>
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: '12px',
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <FiberManualRecordIcon
                sx={{
                  fontSize: 14,
                  color: activeSessions.length > 0 ? '#EF4444' : '#94A3B8',
                  animation: activeSessions.length > 0 ? 'liveDotPing 1.8s infinite' : 'none',
                  '@keyframes liveDotPing': {
                    '0%, 100%': { transform: 'scale(1)', opacity: 1 },
                    '50%': { transform: 'scale(1.4)', opacity: 0.5 },
                  },
                }}
              />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Stack direction="row" alignItems="center" spacing={1.25} flexWrap="wrap">
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 800,
                    letterSpacing: '-0.02em',
                    color: 'text.primary',
                    fontSize: { xs: '1.25rem', sm: '1.45rem' },
                  }}
                >
                  {t('interviewLive.title')}
                </Typography>
                <Box
                  sx={{
                    px: 1.25,
                    py: 0.25,
                    borderRadius: '20px',
                    bgcolor: activeSessions.length > 0 ? alpha('#EF4444', 0.1) : alpha(theme.palette.text.secondary, 0.08),
                    border: '1px solid',
                    borderColor: activeSessions.length > 0 ? alpha('#EF4444', 0.25) : 'divider',
                    color: activeSessions.length > 0 ? '#EF4444' : 'text.secondary',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                  }}
                >
                  {searchQuery.trim() && filteredSessions.length !== activeSessions.length
                    ? `${filteredSessions.length}/${activeSessions.length} ${t('interviewLive.activeNow').toLowerCase()}`
                    : `${activeSessions.length} ${t('interviewLive.activeNow').toLowerCase()}`}
                </Box>
              </Stack>
              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.25, fontWeight: 500 }}>
                {t('interviewLive.subtitle')}
              </Typography>
            </Box>
          </Stack>
        </Box>

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1.5}
          alignItems={{ xs: 'stretch', sm: 'center' }}
          sx={{ width: { xs: '100%', md: 'auto' }, flexShrink: 0 }}
        >
          {/* Candidate search toolbar */}
          <TextField
            size="small"
            placeholder={t('interviewLive.searchPlaceholder', 'Tìm theo tên ứng viên, vị trí...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                </InputAdornment>
              ),
              endAdornment: searchQuery ? (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearchQuery('')} edge="end" sx={{ p: 0.25 }}>
                    <CloseIcon sx={{ fontSize: 15 }} />
                  </IconButton>
                </InputAdornment>
              ) : null,
              sx: {
                borderRadius: '10px',
                fontSize: '0.8125rem',
                bgcolor: 'background.paper',
                height: 38,
                '& fieldset': {
                  borderColor: 'divider',
                },
                '&:hover fieldset': {
                  borderColor: 'primary.main',
                },
              },
            }}
            sx={{ width: { xs: '100%', sm: 240, md: 260 } }}
          />

          <Stack direction="row" spacing={1} alignItems="center">
            {/* Auto-refresh toggle */}
            <Tooltip title={state.autoRefresh ? 'Tắt tự động làm mới' : 'Bật tự động làm mới (mỗi 5s)'} arrow>
              <FormControlLabel
                control={
                  <Switch
                    size="small"
                    checked={state.autoRefresh}
                    onChange={() => dispatch({ type: 'toggle-auto-refresh' })}
                    color="primary"
                    sx={{ mr: 0.25 }}
                  />
                }
                label={
                  <Typography variant="body2" sx={{ fontSize: '0.78rem', fontWeight: 700, color: 'text.secondary', userSelect: 'none', whiteSpace: 'nowrap' }}>
                    {state.autoRefresh ? t('interviewLive.autoRefresh.on', 'Tự động') : t('interviewLive.autoRefresh.off', 'Tắt')}
                  </Typography>
                }
                sx={{
                  m: 0,
                  px: 1.25,
                  py: 0.5,
                  borderRadius: '10px',
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: 'background.paper',
                  height: 38,
                }}
              />
            </Tooltip>

            {/* Refresh icon button */}
            <Tooltip title={state.refreshing ? t('interviewLive.updating') : t('common:actions.refresh')} arrow>
              <span>
                <IconButton
                  onClick={() => fetchSessions()}
                  disabled={state.refreshing}
                  size="small"
                  sx={{
                    width: 38,
                    height: 38,
                    borderRadius: '10px',
                    border: '1px solid',
                    borderColor: 'divider',
                    color: 'text.primary',
                    bgcolor: 'background.paper',
                    '&:hover': {
                      borderColor: 'primary.main',
                      bgcolor: alpha(theme.palette.primary.main, 0.04),
                    },
                  }}
                >
                  <RefreshIcon
                    sx={{
                      fontSize: 19,
                      animation: state.refreshing ? 'spin 1s linear infinite' : 'none',
                      '@keyframes spin': {
                        '0%': { transform: 'rotate(0deg)' },
                        '100%': { transform: 'rotate(360deg)' },
                      },
                    }}
                  />
                </IconButton>
              </span>
            </Tooltip>
          </Stack>
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
          sx={{ mb: 3, borderRadius: 3 }}
        >
          {state.error}
        </Alert>
      )}

      {state.loading && (
        <Box sx={{ width: '100%', mb: 3 }}>
          <LinearProgress
            color="primary"
            sx={{
              height: 4,
              borderRadius: 3,
              bgcolor: alpha(theme.palette.primary.main, 0.1),
            }}
          />
        </Box>
      )}

      {/* Main Content Area */}
      {activeSessions.length === 0 && !state.loading ? (
        <Paper
          elevation={0}
          sx={{
            py: 8,
            px: 3,
            borderRadius: 4,
            border: '1px dashed',
            borderColor: 'divider',
            bgcolor: 'background.paper',
            textAlign: 'center',
            maxWidth: 640,
            mx: 'auto',
            my: 4,
          }}
        >
          <Box
            sx={{
              width: 72,
              height: 72,
              borderRadius: '20px',
              bgcolor: alpha(theme.palette.primary.main, 0.08),
              color: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2.5,
            }}
          >
            <FiberManualRecordIcon sx={{ fontSize: 28, color: 'text.disabled' }} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary', mb: 1, letterSpacing: '-0.01em' }}>
            {t('interviewLive.noData.title')}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 440, mx: 'auto', lineHeight: 1.6 }}>
            {t('interviewLive.noData.subtitle')}
          </Typography>
          <Button
            variant="outlined"
            size="small"
            onClick={() => fetchSessions()}
            startIcon={<RefreshIcon />}
            sx={{ mt: 3, borderRadius: '10px', textTransform: 'none', fontWeight: 700 }}
          >
            {t('common:actions.refresh')}
          </Button>
        </Paper>
      ) : filteredSessions.length === 0 && !state.loading ? (
        <Paper
          elevation={0}
          sx={{
            py: 7,
            px: 3,
            borderRadius: 4,
            border: '1px dashed',
            borderColor: 'divider',
            bgcolor: 'background.paper',
            textAlign: 'center',
            maxWidth: 520,
            mx: 'auto',
            my: 4,
          }}
        >
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: '16px',
              bgcolor: alpha(theme.palette.primary.main, 0.08),
              color: 'text.secondary',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2,
            }}
          >
            <SearchOffIcon sx={{ fontSize: 28 }} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary', mb: 0.75 }}>
            {t('interviewLive.noSearchMatch', 'Không tìm thấy phiên phỏng vấn phù hợp')}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 400, mx: 'auto', mb: 2.5 }}>
            {t('interviewLive.noSearchMatchHint', 'Thử tìm kiếm với từ khóa khác hoặc xóa bộ lọc')}
          </Typography>
          <Button
            variant="outlined"
            size="small"
            onClick={() => setSearchQuery('')}
            sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 700 }}
          >
            {t('common:actions.clear', 'Xóa bộ lọc')}
          </Button>
        </Paper>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              md: 'repeat(2, 1fr)',
            },
            gap: 2.5,
          }}
        >
          {filteredSessions.map((session) => (
            <InterviewLiveCandidateCard
              key={session.id}
              session={session}
              onForceEnd={handleForceEnd}
              isForceEnding={state.actionLoadingId === session.id}
            />
          ))}
        </Box>
      )}
    </Box>
  );
};

export default InterviewLivePage;
