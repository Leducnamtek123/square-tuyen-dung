import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Box, Typography, Chip, Stack, Divider, LinearProgress, Button, IconButton,
  Paper, Avatar, alpha, useTheme, type Theme,
} from "@mui/material";
import { useTranslation } from 'react-i18next';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import QuizIcon from '@mui/icons-material/Quiz';
import PersonIcon from '@mui/icons-material/Person';
import WorkIcon from '@mui/icons-material/Work';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ScheduleIcon from '@mui/icons-material/Schedule';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import Link from 'next/link';
import interviewService from '../../../services/interviewService';
import { transformInterviewSession } from '../../../utils/transformers';
import { type InterviewSession } from '../../../types/models';
import { type PaginatedResponse } from '../../../types/api';
import { ROUTES } from '../../../configs/constants';
import DataTable from '../../../components/Common/DataTable';
import AIToolsCard from '../../../components/Features/AIToolsCard';
import type { CellContext as ReactTableCellContext } from '@tanstack/react-table';

const ACTIVE_STATUSES = ['in_progress', 'calibration', 'processing', 'connecting', 'active'];

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
  const { t } = useTranslation('employer');
  const theme = useTheme();
  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    try {
      const data = await interviewService.getSessions({
        page: page + 1,
        pageSize: rowsPerPage,
      });
      const rawSessions = (data as PaginatedResponse<InterviewSession> & PaginatedResponse<Record<string, unknown>>)?.results || [];
      const mapped = rawSessions.map((session: Record<string, unknown>) => transformInterviewSession(session) as InterviewSession).filter(Boolean);
      setSessions(mapped);
      setCount(typeof data?.count === 'number' ? data.count : rawSessions.length);
    } catch (error) {
      console.error('Error fetching realtime sessions', error);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  useEffect(() => {
    const hasActiveSession = sessions.some((session) => ACTIVE_STATUSES.includes(session.status));
    if (!hasActiveSession) return undefined;
    const interval = setInterval(fetchSessions, 5000);
    return () => clearInterval(interval);
  }, [sessions, fetchSessions]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getLink = useCallback((path: string) => {
    if (path.startsWith(ROUTES.EMPLOYER.DASHBOARD) || path.startsWith('employer/')) {
        return `/${path}`;
    }
    const base = ROUTES.EMPLOYER.DASHBOARD ? `/${ROUTES.EMPLOYER.DASHBOARD}/` : '/';
    return `${base}${path}`;
  }, []);

  const stats = useMemo(() => {
    const active = sessions.filter((s) => ACTIVE_STATUSES.includes(s.status)).length;
    const scheduled = sessions.filter((s) => s.status === 'scheduled').length;
    const completed = sessions.filter((s) => s.status === 'completed').length;
    return { active, scheduled, completed };
  }, [sessions]);

  // Split sessions
  const activeSessions = useMemo(
    () => sessions.filter((s) => ACTIVE_STATUSES.includes(s.status)),
    [sessions]
  );
  const otherSessions = useMemo(
    () => sessions.filter((s) => !ACTIVE_STATUSES.includes(s.status)),
    [sessions]
  );

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
            label={t(`interviewLive.statuses.${getValue() as string}`, { defaultValue: (getValue() as string)?.replaceAll('_', ' ')?.toUpperCase() })}
            color={getStatusColor(getValue() as string)}
            size="small"
            sx={{ fontWeight: 'bold' }}
          />
        ),
      },
      {
        header: '',
        id: 'actions',
        cell: ({ row }: ReactTableCellContext<InterviewSession, unknown>) => (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <IconButton
              component={Link}
              href={getLink(ROUTES.EMPLOYER.INTERVIEW_DETAIL.replace(':id', row.original.id.toString()))}
              {...({} as Record<string, unknown>)}
              color="primary"
              size="small"
              sx={{
                bgcolor: 'primary.background',
                '&:hover': { bgcolor: 'primary.backgroundHover' },
              }}
            >
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Box>
        ),
      },
    ],
    [t, getLink]
  );

  // Stat card component
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
    <Box
      sx={{
        px: { xs: 1, sm: 2 },
        py: { xs: 2, sm: 2 },
        backgroundColor: 'background.paper',
        borderRadius: 2,
      }}
    >
      {/* Header */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        justifyContent="space-between"
        spacing={{ xs: 2, sm: 0 }}
        mb={3}
      >
        <Typography
          variant="h5"
          sx={{
            fontWeight: 600,
            background: (theme: Theme) => theme.palette.primary.main,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontSize: { xs: '1.25rem', sm: '1.5rem' },
          }}
        >
          {t('interviewLive.title')}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          component={Link}
          href={getLink(ROUTES.EMPLOYER.INTERVIEW_CREATE)}
          {...({} as Record<string, unknown>)}
          sx={{
            borderRadius: 2,
            px: 3,
            background: (theme: Theme) => theme.palette.primary.main,
            boxShadow: (theme: Theme & { customShadows?: Record<string, string | number> }) => theme.customShadows?.small || 1,
            '&:hover': {
              boxShadow: (theme: Theme & { customShadows?: Record<string, string | number> }) => theme.customShadows?.medium || 2,
            },
          }}
        >
          {t('interviewLive.scheduleBtn')}
        </Button>
      </Stack>

      {/* Stats Cards */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={4}>
        <StatCard
          icon={<TrendingUpIcon sx={{ fontSize: 20 }} />}
          label={t('interviewLive.stats.inProgress', { count: stats.active }).replace(String(stats.active), '').trim() || 'In Progress'}
          value={stats.active}
          color={theme.palette.primary.main}
          pulse={stats.active > 0}
        />
        <StatCard
          icon={<ScheduleIcon sx={{ fontSize: 20 }} />}
          label={t('interviewLive.stats.scheduled', { count: stats.scheduled }).replace(String(stats.scheduled), '').trim() || 'Scheduled'}
          value={stats.scheduled}
          color={theme.palette.info.main}
        />
        <StatCard
          icon={<CheckCircleIcon sx={{ fontSize: 20 }} />}
          label={t('interviewLive.stats.completed', { count: stats.completed }).replace(String(stats.completed), '').trim() || 'Completed'}
          value={stats.completed}
          color={theme.palette.success.main}
        />
      </Stack>

      {loading && (
        <Box sx={{ width: '100%', mb: 2 }}>
          <LinearProgress
            color="primary"
            sx={{
              height: { xs: 4, sm: 6 },
              borderRadius: 3,
              backgroundColor: 'primary.background',
            }}
          />
        </Box>
      )}

      {/* Active Session Cards */}
      {activeSessions.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Stack direction="row" alignItems="center" spacing={1.5} mb={2.5}>
            <FiberManualRecordIcon
              sx={{
                fontSize: 12,
                color: theme.palette.primary.main,
                animation: 'liveDot 2s infinite',
                '@keyframes liveDot': {
                  '0%, 100%': { opacity: 1 },
                  '50%': { opacity: 0.3 },
                },
              }}
            />
            <Typography variant="subtitle1" sx={{ fontWeight: 900, color: 'text.primary' }}>
              {t('interviewLive.activeNow', { defaultValue: 'Active Now' })}
            </Typography>
          </Stack>

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} flexWrap="wrap" useFlexGap>
            {activeSessions.map((session) => (
              <Paper
                key={session.id}
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  border: '1px solid',
                  borderColor: alpha(theme.palette.primary.main, 0.15),
                  bgcolor: alpha(theme.palette.primary.main, 0.02),
                  flex: { xs: '1 1 100%', md: '1 1 calc(50% - 8px)' },
                  maxWidth: { md: 'calc(50% - 8px)' },
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.3s',
                  cursor: 'pointer',
                  '&:hover': {
                    borderColor: alpha(theme.palette.primary.main, 0.3),
                    transform: 'translateY(-2px)',
                    boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.1)}`,
                  },
                }}
                component={Link}
                href={getLink(ROUTES.EMPLOYER.INTERVIEW_DETAIL.replace(':id', session.id.toString()))}
              >
                {/* Pulse indicator */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 3,
                    background: `linear-gradient(90deg, ${alpha(theme.palette.primary.main, 0.3)}, ${theme.palette.primary.main}, ${alpha(theme.palette.primary.main, 0.3)})`,
                    animation: 'shimmer 2s infinite',
                    '@keyframes shimmer': {
                      '0%': { transform: 'translateX(-100%)' },
                      '100%': { transform: 'translateX(100%)' },
                    },
                  }}
                />

                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <Box>
                    <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
                      <PersonIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.primary' }}>
                        {session.candidateName || 'Unknown'}
                      </Typography>
                    </Stack>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <WorkIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                      <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                        {session.jobName || 'N/A'}
                      </Typography>
                    </Stack>
                  </Box>
                  <Stack alignItems="flex-end" spacing={0.5}>
                    <Chip
                      label={t(`interviewLive.statuses.${session.status}`, { defaultValue: session.status?.replaceAll('_', ' ')?.toUpperCase() })}
                      color="primary"
                      size="small"
                      sx={{ fontWeight: 900, fontSize: '0.65rem', height: 22 }}
                    />
                    <ElapsedTimer startTime={session.startTime} />
                  </Stack>
                </Stack>

                <Divider sx={{ my: 1.5, borderStyle: 'dashed', borderColor: alpha(theme.palette.primary.main, 0.1) }} />

                {/* Quick Actions */}
                <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="flex-end">
                  <Button
                    variant="text"
                    size="small"
                    startIcon={<VisibilityIcon sx={{ fontSize: 16 }} />}
                    component={Link}
                    href={getLink(ROUTES.EMPLOYER.INTERVIEW_DETAIL.replace(':id', session.id.toString()))}
                    {...({} as Record<string, unknown>)}
                    onClick={(e: React.MouseEvent) => e.stopPropagation()}
                    sx={{
                      textTransform: 'none',
                      fontWeight: 800,
                      fontSize: '0.75rem',
                      color: 'primary.main',
                      '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.06) },
                    }}
                  >
                    {t('common:actions.details', { defaultValue: 'Details' })}
                  </Button>
                </Stack>
              </Paper>
            ))}
          </Stack>
        </Box>
      )}

      {/* Divider between active cards and table */}
      {activeSessions.length > 0 && otherSessions.length > 0 && (
        <Divider sx={{ mb: 3, borderStyle: 'dashed' }} />
      )}

      {/* Data Table for other sessions */}
      <Box
        sx={{
          backgroundColor: 'background.paper',
          borderRadius: 2,
          boxShadow: (theme: Theme & { customShadows?: Record<string, string | number> }) => theme.customShadows?.card || 1,
          overflow: 'hidden',
          width: '100%',
          '& .MuiTableContainer-root': {
            overflowX: 'auto',
          },
        }}
      >
        <DataTable
          columns={columns}
          data={activeSessions.length > 0 ? otherSessions : sessions}
          isLoading={loading}
          count={activeSessions.length > 0 ? count - activeSessions.length : count}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          emptyMessage={t('interviewLive.table.emptyMessage')}
        />
      </Box>

      <AIToolsCard />
    </Box>
  );
};

export default InterviewLivePage;
