import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Typography, Chip, Stack, Divider, LinearProgress } from "@mui/material";

import { ColumnDef } from '@tanstack/react-table';
import { Theme } from '@mui/material/styles';
import { PaginatedResponse } from '@/types/api';

import interviewService from '../../../services/interviewService';
import { transformInterviewSession } from '../../../utils/transformers';
import DataTable from '../../../components/Common/DataTable';
import AIToolsCard from '../../../components/Features/AIToolsCard';
import AIServiceHealthBanner from '../../../components/Features/AIServiceHealthBanner';
import { InterviewSession } from '../../../types/models';

type InterviewSessionExt = InterviewSession & {
  companyDict?: { companyName?: string };
  jobPostDict?: { companyName?: string };
  room?: string;
};

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
  const { t } = useTranslation('admin');
  const [sessions, setSessions] = useState<InterviewSessionExt[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await interviewService.getSessions({
        page: page + 1,
        pageSize: rowsPerPage,
      }) as unknown as PaginatedResponse<Record<string, unknown>>;
      const data = res;
      const rawSessions = data.results || data || [];
      const mapped = rawSessions.map(transformInterviewSession);
      setSessions(mapped.filter(Boolean) as InterviewSessionExt[]);
      setCount(data.count || rawSessions.length);
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
    const hasActiveSession = sessions.some((session) => ACTIVE_STATUSES.includes(String(session.status)));
    if (!hasActiveSession) return undefined;
    const interval = setInterval(fetchSessions, 5000);
    return () => clearInterval(interval);
  }, [sessions, fetchSessions]);

  const handleChangePage = (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const stats = useMemo(() => {
    const active = sessions.filter((s) => ACTIVE_STATUSES.includes(s.status)).length;
    const scheduled = sessions.filter((s) => s.status === 'scheduled').length;
    const completed = sessions.filter((s) => s.status === 'completed').length;
    return { active, scheduled, completed };
  }, [sessions]);

  const columns = useMemo<ColumnDef<InterviewSessionExt>[]>(
    () => [
      {
        header: t('pages.interviewLive.table.company'),
        accessorKey: 'companyName',
        cell: ({ row }) => {
          const original = row.original;
          return (
            <Typography variant="body2">
              {original.companyName ||
                original.companyDict?.companyName ||
                original.jobPostDict?.companyName ||
                t('common.na')}
            </Typography>
          );
        },
      },
      {
        header: t('pages.interviewLive.table.candidate'),
        accessorKey: 'candidateName',
        cell: ({ row }) => {
          const original = row.original;
          return (
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {original.candidateName || t('common.na')}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {original.candidateEmail || t('common.na')}
              </Typography>
            </Box>
          );
        },
      },
      {
        header: t('pages.interviewLive.table.position'),
        accessorKey: 'jobName',
        cell: ({ getValue }) => <Typography variant="body2">{String(getValue() || '') || t('common.na')}</Typography>,
      },
      {
        header: t('pages.interviewLive.table.room'),
        accessorKey: 'roomName',
        cell: ({ row }) => {
          const original = row.original;
          return (
            <Typography variant="body2">
              {original.roomName || original.room || t('common.na')}
            </Typography>
          );
        },
      },
      {
        header: t('pages.interviewLive.table.time'),
        accessorKey: 'scheduledAt',
        cell: ({ getValue }) => (
          <Typography variant="body2">
            {getValue() ? new Date(getValue() as string).toLocaleString() : t('common.na')}
          </Typography>
        ),
      },
      {
        header: t('pages.interviewLive.table.status'),
        accessorKey: 'status',
        cell: ({ getValue }) => {
          const rawStatus = getValue();
          const status = String(rawStatus ?? '').toLowerCase();
          let label = rawStatus;
          if (status === 'completed') label = t('common.status.completed');
          else if (['in_progress', 'calibration', 'processing', 'connecting', 'active'].includes(status)) label = t('common.status.inProgress');
          else if (status === 'scheduled') label = t('common.status.scheduled');
          else if (status === 'cancelled') label = t('common.status.cancelled');
          
          return (
            <Chip
              label={label as React.ReactNode}
              color={getStatusColor(status)}
              size="small"
              sx={{ fontWeight: 'bold' }}
            />
          );
        },
      },
    ],
    [t]
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
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          {t('pages.interviewLive.title')}
        </Typography>
      </Stack>

      {/* AI Service Health Badges */}
      <AIServiceHealthBanner />

      <Stack direction="row" spacing={1.5} mb={3} flexWrap="wrap">
        <Chip label={t('pages.interviewLive.stats.inProgress', { count: stats.active })} color="primary" variant="outlined" />
        <Chip label={t('pages.interviewLive.stats.scheduled', { count: stats.scheduled })} color="info" variant="outlined" />
        <Chip label={t('pages.interviewLive.stats.completed', { count: stats.completed })} color="success" variant="outlined" />
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
          boxShadow: (theme: Theme) => (theme as unknown as Record<string, Record<string, number>>).customShadows?.card || 1,
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
          emptyMessage={t('pages.interviewLive.table.emptyMessage')}
        />
      </Box>

      <AIToolsCard />
    </Box>
  );
};

export default InterviewLivePage;
