import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Box, Typography, Chip, Stack, Divider, LinearProgress, Button, IconButton, type Theme } from "@mui/material";
import { useTranslation } from 'react-i18next';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import Link from 'next/link';
import interviewService from '../../../services/interviewService';
import { transformInterviewSession } from '../../../utils/transformers';
import { type InterviewSession } from '../../../types/models';
import { type PaginatedResponse } from '../../../types/api';
import { ROUTES } from '../../../configs/constants';
import DataTable from '../../../components/Common/DataTable';
import AIToolsCard from '../../../components/Features/AIToolsCard';

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

const InterviewLivePage = () => {
  const { t } = useTranslation('employer');
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
      const rawSessions = (data as unknown as PaginatedResponse<Record<string, unknown>>)?.results || [];
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

  const columns = useMemo(
    () => [
      {
        header: t('interviewLive.table.candidate'),
        accessorKey: 'candidateName',
        cell: ({ row }: { row: { original: InterviewSession } }) => (
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
        cell: ({ getValue }: { getValue: () => string }) => <Typography variant="body2">{getValue() || 'N/A'}</Typography>,
      },
      {
        header: t('interviewLive.table.room'),
        accessorKey: 'roomName',
        cell: ({ row }: { row: { original: InterviewSession } }) => (
          <Typography variant="body2">
            {row.original.roomName || 'N/A'}
          </Typography>
        ),
      },
      {
        header: t('interviewLive.table.time'),
        accessorKey: 'scheduledAt',
        cell: ({ getValue }: { getValue: () => string }) => (
          <Typography variant="body2">
            {getValue() ? new Date(getValue()).toLocaleString() : 'N/A'}
          </Typography>
        ),
      },
      {
        header: t('interviewLive.table.status'),
        accessorKey: 'status',
        cell: ({ getValue }: { getValue: () => string }) => (
          <Chip
            label={t(`interviewLive.statuses.${getValue()}`, { defaultValue: getValue()?.replaceAll('_', ' ')?.toUpperCase() })}
            color={getStatusColor(getValue())}
            size="small"
            sx={{ fontWeight: 'bold' }}
          />
        ),
      },
      {
        header: '',
        id: 'actions',
        cell: ({ row }: { row: { original: InterviewSession } }) => (
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

  return (
    <Box
      sx={{
        px: { xs: 1, sm: 2 },
        py: { xs: 2, sm: 2 },
        backgroundColor: 'background.paper',
        borderRadius: 2,
      }}
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        justifyContent="space-between"
        spacing={{ xs: 2, sm: 0 }}
        mb={2}
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

      <Stack direction="row" spacing={1.5} mb={3} flexWrap="wrap">
        <Chip label={t('interviewLive.stats.inProgress', { count: stats.active })} color="primary" variant="outlined" />
        <Chip label={t('interviewLive.stats.scheduled', { count: stats.scheduled })} color="info" variant="outlined" />
        <Chip label={t('interviewLive.stats.completed', { count: stats.completed })} color="success" variant="outlined" />
      </Stack>

      {loading ? (
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
      ) : (
        <Divider sx={{ mb: 2 }} />
      )}

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
          data={sessions}
          isLoading={loading}
          count={count}
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
