'use client';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Box, Typography, Chip, Stack, Divider, LinearProgress, Button, IconButton,
  Paper, Avatar, alpha, useTheme, type Theme, TextField, InputAdornment,
  FormControl, InputLabel, Select, MenuItem, Alert, Tooltip,
} from "@mui/material";
import { useTranslation } from 'react-i18next';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import BlockIcon from '@mui/icons-material/Block';
import PersonIcon from '@mui/icons-material/Person';
import WorkIcon from '@mui/icons-material/Work';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ScheduleIcon from '@mui/icons-material/Schedule';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RefreshIcon from '@mui/icons-material/Refresh';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopCircleIcon from '@mui/icons-material/StopCircle';
import Link from 'next/link';
import interviewService from '../../../services/interviewService';
import { type InterviewSession } from '../../../types/models';
import { ROUTES } from '../../../configs/constants';
import DataTable from '../../../components/Common/DataTable';
import { confirmModal } from '../../../utils/sweetalert2Modal';
import toastMessages from '../../../utils/toastMessages';
import type { CellContext as ReactTableCellContext, SortingState } from '@tanstack/react-table';

const ACTIVE_STATUSES = ['in_progress', 'calibration', 'processing', 'connecting', 'active'];
const CLOSED_STATUSES = ['cancelled', 'completed', 'interrupted'];

const getStatusColor = (status: string): "success" | "primary" | "info" | "error" | "default" => {
  switch (status) {
    case 'completed':
      return 'success';
    case 'in_progress':
    case 'calibration':
    case 'processing':
    case 'connecting':
    case 'active':
      return 'primary';
    case 'scheduled':
      return 'info';
    case 'cancelled':
      return 'error';
    default:
      return 'default';
  }
};

const canJoinSession = (status: string) => !CLOSED_STATUSES.includes(status);
const canForceEndSession = (status: string) => ACTIVE_STATUSES.includes(status);
const canEditSession = (status: string) => ['draft', 'scheduled'].includes(status);
const canCancelSession = (status: string) => status === 'scheduled';

/** Elapsed time component that ticks every second */
const ElapsedTimer: React.FC<{ startTime: string | null | undefined }> = ({ startTime }) => {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!startTime) return;
    const start = new Date(startTime).getTime();
    const update = () => setElapsed(Math.floor((Date.now() - start) / 1000));
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  if (!startTime) return null;

  const m = Math.floor(elapsed / 60);
  const s = elapsed % 60;

  return (
    <Typography
      variant="caption"
      sx={{
        fontWeight: 900,
        fontFamily: 'monospace',
        fontSize: '0.85rem',
        color: 'primary.main',
        letterSpacing: 1,
      }}
    >
      {m.toString().padStart(2, '0')}:{s.toString().padStart(2, '0')}
    </Typography>
  );
};

const InterviewLivePage = () => {
  const { t } = useTranslation(['employer', 'interview', 'common']);
  const theme = useTheme();
  const [activeSessions, setActiveSessions] = useState<InterviewSession[]>([]);
  const [otherSessions, setOtherSessions] = useState<InterviewSession[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch active sessions separately to ensure they are always visible
      const activePromise = interviewService.getSessions({
        status: 'in_progress', // or multiple if supported, but in_progress is the main one
        pageSize: 50, // reasonably large
      });

      // Fetch the main paginated list based on filters
      const mainPromise = interviewService.getSessions({
        page: page + 1,
        pageSize: rowsPerPage,
        search: searchTerm,
        status: statusFilter === 'all' ? undefined : statusFilter,
        ordering: '-create_at',
      });

      const [activeData, mainData] = await Promise.all([activePromise, mainPromise]);

      setActiveSessions(activeData.results || []);
      setOtherSessions(mainData.results || []);
      setCount(mainData.count || 0);
    } catch (fetchError) {
      console.error('Error fetching realtime sessions', fetchError);
      setError(t('common:messages.loadFailed', { defaultValue: 'Không thể tải dữ liệu phỏng vấn live. Vui lòng thử lại.' }));
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, searchTerm, statusFilter, t]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  useEffect(() => {
    if (!autoRefresh) return undefined;
    const hasActiveSession = activeSessions.length > 0;
    if (!hasActiveSession) return undefined;
    const interval = setInterval(fetchSessions, 5000);
    return () => clearInterval(interval);
  }, [activeSessions.length, fetchSessions, autoRefresh]);

  useEffect(() => {
    setPage(0);
  }, [searchTerm, statusFilter]);

  const getLink = useCallback((path: string) => {
    if (path.startsWith(ROUTES.EMPLOYER.DASHBOARD) || path.startsWith('employer/')) {
      return `/${path}`;
    }
    const base = ROUTES.EMPLOYER.DASHBOARD ? `/${ROUTES.EMPLOYER.DASHBOARD}/` : '/';
    return `${base}${path}`;
  }, []);

  const handleForceEnd = useCallback((session: InterviewSession) => {
    if (!session.roomName || !canForceEndSession(session.status)) return;
    confirmModal(
      async () => {
        setActionLoadingId(session.id);
        try {
          await interviewService.updateSessionStatus(session.roomName, 'completed');
          toastMessages.success(t('interview:interviewDetail.messages.forceEndSuccess', { defaultValue: 'Interview stopped successfully.' }));
          await fetchSessions();
        } catch (updateError) {
          console.error('Error force ending session', updateError);
          const message = t('common:messages.actionFailed', { defaultValue: 'Action failed. Please try again.' });
          setError(message);
          toastMessages.error(message);
        } finally {
          setActionLoadingId(null);
        }
      },
      t('interview:interviewDetail.messages.confirmForceEndTitle', { defaultValue: 'Stop Interview' }),
      t('interview:interviewDetail.messages.confirmForceEnd', { defaultValue: 'Are you sure you want to stop this interview now?' }),
      'warning'
    );
  }, [fetchSessions, t]);

  const handleCancel = useCallback((session: InterviewSession) => {
    if (!session.roomName || !canCancelSession(session.status)) return;
    confirmModal(
      async () => {
        setActionLoadingId(session.id);
        try {
          await interviewService.updateSessionStatus(session.roomName, 'cancelled');
          toastMessages.success(t('interview:interviewListCard.messages.cancelSuccess', { defaultValue: 'Interview cancelled successfully.' }));
          await fetchSessions();
        } catch (cancelError) {
          console.error('Error cancelling session', cancelError);
          const message = t('common:messages.actionFailed', { defaultValue: 'Action failed. Please try again.' });
          setError(message);
          toastMessages.error(message);
        } finally {
          setActionLoadingId(null);
        }
      },
      t('interview:interviewListCard.confirmCancelTitle', { defaultValue: 'Cancel Interview' }),
      t('interview:interviewListCard.confirmCancelMessage', { defaultValue: 'Are you sure you want to cancel this interview?' }),
      'warning'
    );
  }, [fetchSessions, t]);

  const handleDelete = useCallback((session: InterviewSession) => {
    confirmModal(
      async () => {
        setActionLoadingId(session.id);
        try {
          await interviewService.deleteSession(session.id);
          toastMessages.success(t('interview:interviewListCard.messages.deleteSuccess', { defaultValue: 'Interview deleted successfully.' }));
          await fetchSessions();
        } catch (deleteError) {
          console.error('Error deleting session', deleteError);
          const message = t('common:messages.actionFailed', { defaultValue: 'Action failed. Please try again.' });
          setError(message);
          toastMessages.error(message);
        } finally {
          setActionLoadingId(null);
        }
      },
      t('interview:interviewListCard.confirmDeleteTitle', { defaultValue: 'Delete Interview' }),
      t('interview:interviewListCard.confirmDeleteMessage', { defaultValue: 'Are you sure you want to delete this interview? This action cannot be undone.' }),
      'warning'
    );
  }, [fetchSessions, t]);

  const stats = useMemo(() => {
    // This is approximate based on current view, but better than nothing
    // For real stats, we'd need a separate stats endpoint
    return { 
      active: activeSessions.length, 
      scheduled: otherSessions.filter(s => s.status === 'scheduled').length, 
      completed: otherSessions.filter(s => s.status === 'completed').length 
    };
  }, [activeSessions, otherSessions]);

  // Filter logic is now handled server-side for otherSessions
  // activeSessions are always shown if they exist

  const columns = useMemo(
    () => [
      {
        header: t('interviewLive.table.candidate'),
        accessorKey: 'candidateName',
        cell: ({ row }: ReactTableCellContext<InterviewSession, unknown>) => (
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {row.original.candidateName || 'N/A'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {row.original.candidateEmail || '---'}
            </Typography>
          </Box>
        ),
      },
      {
        header: t('interviewLive.table.position'),
        accessorKey: 'jobName',
        cell: ({ getValue }: ReactTableCellContext<InterviewSession, unknown>) => <Typography variant="body2">{(getValue() as string) || 'N/A'}</Typography>,
      },
      {
        header: t('interviewLive.table.room'),
        accessorKey: 'roomName',
        cell: ({ row }: ReactTableCellContext<InterviewSession, unknown>) => (
          <Typography variant="body2">
            {row.original.roomName || 'N/A'}
          </Typography>
        ),
      },
      {
        header: t('interviewLive.table.time'),
        accessorKey: 'scheduledAt',
        cell: ({ getValue }: ReactTableCellContext<InterviewSession, unknown>) => (
          <Typography variant="body2">
            {(getValue() as string) ? new Date(getValue() as string).toLocaleString() : 'N/A'}
          </Typography>
        ),
      },
      {
        header: t('interviewLive.table.status'),
        accessorKey: 'status',
        cell: ({ getValue }: ReactTableCellContext<InterviewSession, unknown>) => (
          <Chip
            label={t(`interview:interviewListCard.statuses.${getValue() as string}`, { defaultValue: (getValue() as string)?.replaceAll('_', ' ')?.toUpperCase() })}
            color={getStatusColor(getValue() as string)}
            size="small"
            sx={{ fontWeight: 'bold' }}
          />
        ),
      },
      {
        header: '',
        id: 'actions',
        enableSorting: false,
        cell: ({ row }: ReactTableCellContext<InterviewSession, unknown>) => {
          const session = row.original;
          const joinable = canJoinSession(session.status);
          const stoppable = canForceEndSession(session.status);
          const editable = canEditSession(session.status);
          const cancellable = canCancelSession(session.status);

          return (
            <Stack direction="row" spacing={1} justifyContent="flex-end">
              {joinable && (
                <Tooltip title={t('common:actions.joinNow', { defaultValue: 'Join' })}>
                  <IconButton
                    component={Link}
                    href={getLink(ROUTES.EMPLOYER.INTERVIEW_SESSION.replace(':id', session.id.toString()))}
                    color="success"
                    size="small"
                    sx={{ bgcolor: alpha(theme.palette.success.main, 0.08), '&:hover': { bgcolor: alpha(theme.palette.success.main, 0.16) } }}
                  >
                    <PlayArrowIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
              {stoppable && (
                <Tooltip title={t('common:actions.stop', { defaultValue: 'Stop' })}>
                  <span>
                    <IconButton
                      onClick={() => handleForceEnd(session)}
                      disabled={actionLoadingId === session.id}
                      color="error"
                      size="small"
                      sx={{ bgcolor: alpha(theme.palette.error.main, 0.08), '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.16) } }}
                    >
                      <StopCircleIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
              )}
              {editable && (
                <Tooltip title={t('interview:interviewListCard.editInterview', { defaultValue: 'Edit Interview' })}>
                  <IconButton
                    component={Link}
                    href={getLink(ROUTES.EMPLOYER.INTERVIEW_EDIT.replace(':id', session.id.toString()))}
                    color="info"
                    size="small"
                    sx={{ bgcolor: alpha(theme.palette.info.main, 0.08), '&:hover': { bgcolor: alpha(theme.palette.info.main, 0.16) } }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
              {cancellable && (
                <Tooltip title={t('interview:interviewListCard.cancelInterview', { defaultValue: 'Cancel Interview' })}>
                  <span>
                    <IconButton
                      onClick={() => handleCancel(session)}
                      disabled={actionLoadingId === session.id}
                      color="warning"
                      size="small"
                      sx={{ bgcolor: alpha(theme.palette.warning.main, 0.08), '&:hover': { bgcolor: alpha(theme.palette.warning.main, 0.16) } }}
                    >
                      <BlockIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
              )}
              <Tooltip title={t('common:actions.details', { defaultValue: 'Details' })}>
                <IconButton
                  component={Link}
                  href={getLink(ROUTES.EMPLOYER.INTERVIEW_DETAIL.replace(':id', session.id.toString()))}
                  color="primary"
                  size="small"
                  sx={{
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                    '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.16) },
                  }}
                >
                  <VisibilityIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title={t('interview:interviewListCard.deleteInterview', { defaultValue: 'Delete Interview' })}>
                <span>
                  <IconButton
                    onClick={() => handleDelete(session)}
                    disabled={actionLoadingId === session.id}
                    color="error"
                    size="small"
                    sx={{ bgcolor: alpha(theme.palette.error.main, 0.08), '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.16) } }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
            </Stack>
          );
        },
      },
    ],
    [t, getLink, theme.palette, handleForceEnd, handleCancel, handleDelete, actionLoadingId]
  );

  const StatCard: React.FC<{
    icon: React.ReactNode;
    label: string;
    value: number;
    color: string;
    pulse?: boolean;
  }> = ({ icon, label, value, color, pulse }) => (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 3,
        border: '1px solid',
        borderColor: alpha(color, 0.15),
        bgcolor: alpha(color, 0.04),
        flex: 1,
        minWidth: 160,
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.3s',
        '&:hover': {
          borderColor: alpha(color, 0.3),
          transform: 'translateY(-2px)',
          boxShadow: `0 8px 24px ${alpha(color, 0.1)}`,
        },
      }}
    >
      {pulse && (
        <Box
          sx={{
            position: 'absolute',
            top: 12,
            right: 12,
            width: 8,
            height: 8,
            borderRadius: '50%',
            bgcolor: color,
            animation: 'statPulse 2s infinite',
            '@keyframes statPulse': {
              '0%, 100%': { opacity: 1, boxShadow: `0 0 0 0px ${alpha(color, 0.4)}` },
              '50%': { opacity: 0.6, boxShadow: `0 0 0 6px ${alpha(color, 0)}` },
            },
          }}
        />
      )}
      <Stack direction="row" alignItems="center" spacing={1.5} mb={1.5}>
        <Avatar
          sx={{
            width: 36,
            height: 36,
            bgcolor: alpha(color, 0.12),
            color: color,
          }}
        >
          {icon}
        </Avatar>
        <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.7rem' }}>
          {label}
        </Typography>
      </Stack>
      <Typography variant="h3" sx={{ fontWeight: 900, color: color, letterSpacing: '-1px' }}>
        {value}
      </Typography>
    </Paper>
  );

  return (
    <Box sx={{ px: { xs: 1, sm: 2 }, py: { xs: 2, sm: 2 }, backgroundColor: 'background.paper', borderRadius: 2 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between" spacing={{ xs: 2, sm: 0 }} mb={3}>
        <Typography variant="h5" sx={{ fontWeight: 600, background: theme.palette.primary.main, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
          {t('interviewLive.title')}
        </Typography>
        <Stack direction="row" spacing={1.5}>
          <Tooltip title={autoRefresh ? t('common:autoRefreshOff', { defaultValue: 'Tắt auto-refresh' }) : t('common:autoRefreshOn', { defaultValue: 'Bật auto-refresh' })}>
            <IconButton onClick={() => setAutoRefresh((prev) => !prev)} size="small" color={autoRefresh ? 'primary' : 'default'}>
              {autoRefresh ? <VisibilityIcon fontSize="small" /> : <VisibilityOffIcon fontSize="small" />}
            </IconButton>
          </Tooltip>
          <Button variant="outlined" color="primary" onClick={fetchSessions} startIcon={<RefreshIcon />} sx={{ borderRadius: 2, px: 2 }}>
            {t('common:actions.refresh', { defaultValue: 'Làm mới' })}
          </Button>
          <Button variant="contained" color="primary" startIcon={<AddIcon />} component={Link} href={getLink(ROUTES.EMPLOYER.INTERVIEW_CREATE)} sx={{ borderRadius: 2, px: 3 }}>
            {t('interviewLive.scheduleBtn')}
          </Button>
        </Stack>
      </Stack>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} mb={2}>
        <TextField
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder={t('interviewLive.searchPlaceholder', { defaultValue: 'Tìm ứng viên, vị trí, phòng...' })}
          size="small"
          fullWidth
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
        />
        <FormControl size="small" sx={{ minWidth: 220 }}>
          <InputLabel id="interview-live-status-filter">{t('interviewLive.table.status')}</InputLabel>
          <Select labelId="interview-live-status-filter" value={statusFilter} label={t('interviewLive.table.status')} onChange={(event) => setStatusFilter(event.target.value)}>
            <MenuItem value="all">{t('common:all', { defaultValue: 'Tất cả' })}</MenuItem>
            <MenuItem value="scheduled">{t('interview:interviewListCard.statuses.scheduled', { defaultValue: 'Scheduled' })}</MenuItem>
            <MenuItem value="in_progress">{t('interview:interviewListCard.statuses.in_progress', { defaultValue: 'In Progress' })}</MenuItem>
            <MenuItem value="processing">{t('interview:interviewListCard.statuses.processing', { defaultValue: 'Processing' })}</MenuItem>
            <MenuItem value="completed">{t('interview:interviewListCard.statuses.completed', { defaultValue: 'Completed' })}</MenuItem>
            <MenuItem value="cancelled">{t('interview:interviewListCard.statuses.cancelled', { defaultValue: 'Cancelled' })}</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      {error && (
        <Alert severity="error" action={<Button color="inherit" size="small" onClick={fetchSessions}>{t('common:actions.retry', { defaultValue: 'Thử lại' })}</Button>} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={4}>
        <StatCard icon={<TrendingUpIcon sx={{ fontSize: 20 }} />} label={t('interviewLive.stats.inProgressLabel', { defaultValue: 'In Progress' })} value={stats.active} color={theme.palette.primary.main} pulse={stats.active > 0} />
        <StatCard icon={<ScheduleIcon sx={{ fontSize: 20 }} />} label={t('interviewLive.stats.scheduledLabel', { defaultValue: 'Scheduled' })} value={stats.scheduled} color={theme.palette.info.main} />
        <StatCard icon={<CheckCircleIcon sx={{ fontSize: 20 }} />} label={t('interviewLive.stats.completedLabel', { defaultValue: 'Completed' })} value={stats.completed} color={theme.palette.success.main} />
      </Stack>

      {loading && <Box sx={{ width: '100%', mb: 2 }}><LinearProgress color="primary" sx={{ height: 4, borderRadius: 3 }} /></Box>}

      {activeSessions.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Stack direction="row" alignItems="center" spacing={1.5} mb={2.5}>
            <FiberManualRecordIcon sx={{ fontSize: 12, color: theme.palette.primary.main, animation: 'liveDot 2s infinite', '@keyframes liveDot': { '0%, 100%': { opacity: 1 }, '50%': { opacity: 0.3 } } }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 900, color: 'text.primary' }}>{t('interviewLive.activeNow', { defaultValue: 'Active Now' })}</Typography>
          </Stack>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} flexWrap="wrap" useFlexGap>
            {activeSessions.map((session) => (
              <Paper key={session.id} elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: alpha(theme.palette.primary.main, 0.15), bgcolor: alpha(theme.palette.primary.main, 0.02), flex: { xs: '1 1 100%', md: '1 1 calc(50% - 8px)' }, maxWidth: { md: 'calc(50% - 8px)' }, position: 'relative', overflow: 'hidden', transition: 'all 0.3s', cursor: 'pointer', '&:hover': { borderColor: alpha(theme.palette.primary.main, 0.3), transform: 'translateY(-2px)', boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.1)}` } }} component={Link} href={getLink(ROUTES.EMPLOYER.INTERVIEW_DETAIL.replace(':id', session.id.toString()))}>
                <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${alpha(theme.palette.primary.main, 0.3)}, ${theme.palette.primary.main}, ${alpha(theme.palette.primary.main, 0.3)})`, animation: 'shimmer 2s infinite', '@keyframes shimmer': { '0%': { transform: 'translateX(-100%)' }, '100%': { transform: 'translateX(100%)' } } }} />
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <Box>
                    <Stack direction="row" alignItems="center" spacing={1} mb={0.5}><PersonIcon sx={{ fontSize: 18, color: 'text.secondary' }} /><Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{session.candidateName || 'Unknown'}</Typography></Stack>
                    <Stack direction="row" alignItems="center" spacing={1}><WorkIcon sx={{ fontSize: 14, color: 'text.disabled' }} /><Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>{session.jobName || 'N/A'}</Typography></Stack>
                  </Box>
                  <Stack alignItems="flex-end" spacing={0.5}><Chip label={t(`interview:interviewListCard.statuses.${session.status}`, { defaultValue: session.status?.replaceAll('_', ' ')?.toUpperCase() })} color="primary" size="small" sx={{ fontWeight: 900, fontSize: '0.65rem', height: 22 }} /><ElapsedTimer startTime={session.startTime} /></Stack>
                </Stack>
                <Divider sx={{ my: 1.5, borderStyle: 'dashed', borderColor: alpha(theme.palette.primary.main, 0.1) }} />
                <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="flex-end">
                  {canJoinSession(session.status) && <Button variant="text" size="small" startIcon={<PlayArrowIcon />} component={Link} href={getLink(ROUTES.EMPLOYER.INTERVIEW_SESSION.replace(':id', session.id.toString()))} onClick={(e) => e.stopPropagation()} sx={{ color: 'success.main', fontWeight: 800 }}>{t('common:actions.joinNow', { defaultValue: 'Join' })}</Button>}
                  {session.status === 'in_progress' && <Button variant="text" size="small" startIcon={<VisibilityOffIcon />} component={Link} href={getLink(ROUTES.EMPLOYER.INTERVIEW_DETAIL.replace(':id', session.id.toString()))} onClick={(e) => e.stopPropagation()} sx={{ color: 'warning.main', fontWeight: 800 }}>{t('common:actions.observe', { defaultValue: 'Observe' })}</Button>}
                  {canForceEndSession(session.status) && <Button variant="text" size="small" startIcon={<StopCircleIcon />} onClick={(e) => { e.stopPropagation(); handleForceEnd(session); }} disabled={actionLoadingId === session.id} sx={{ color: 'error.main', fontWeight: 800 }}>{t('common:actions.stop', { defaultValue: 'Stop' })}</Button>}
                </Stack>
              </Paper>
            ))}
          </Stack>
        </Box>
      )}

      <DataTable
        columns={columns}
        data={otherSessions}
        isLoading={loading}
        rowCount={count}
        pagination={{ pageIndex: page, pageSize: rowsPerPage }}
        onPaginationChange={(newState) => {
          setPage(newState.pageIndex);
          setRowsPerPage(newState.pageSize);
        }}
      />
    </Box>
  );
};

export default InterviewLivePage;
