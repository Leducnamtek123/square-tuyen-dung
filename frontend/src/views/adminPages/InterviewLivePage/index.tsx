import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Typography, Chip, Stack, Divider, LinearProgress, Paper } from "@mui/material";
import { ColumnDef } from '@tanstack/react-table';
import DataTable from '../../../components/Common/DataTable';
import AIToolsCard from '../../../components/Features/AIToolsCard';
import AIServiceHealthBanner from '../../../components/Features/AIServiceHealthBanner';
import { useInterviewLive, InterviewSessionExt } from './hooks/useInterviewLive';
import { useDataTable } from '../../../hooks';
import dayjs from '../../../configs/dayjs-config';

const getStatusColor = (status: string): "success" | "primary" | "info" | "error" | "default" => {
  const s = status.toLowerCase();
  switch (s) {
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
  const {
      page,
      pageSize: rowsPerPage,
      pagination,
      onPaginationChange
  } = useDataTable({ initialPageSize: 10 });

  const {
      data,
      isLoading: loading,
      stats
  } = useInterviewLive({
      page: page + 1,
      pageSize: rowsPerPage
  });

  const sessions = data?.results || [];
  const count = data?.count || 0;

  const columns: ColumnDef<InterviewSessionExt>[] = [
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
          {getValue() ? dayjs(getValue() as string).format('DD/MM/YYYY HH:mm') : t('common.na')}
        </Typography>
      ),
    },
    {
      header: t('pages.interviewLive.table.status'),
      accessorKey: 'status',
      cell: ({ getValue }) => {
        const rawStatus = getValue() as string;
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
  ];

  return (
    <Box>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        justifyContent="space-between"
        spacing={{ xs: 2, sm: 0 }}
        mb={2}
      >
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          {t('pages.interviewLive.title')}
        </Typography>
      </Stack>

      <AIServiceHealthBanner />

      <Stack direction="row" spacing={1.5} mb={3} mt={2} flexWrap="wrap">
        <Chip label={t('pages.interviewLive.stats.inProgress', { count: stats.active })} color="primary" variant="outlined" />
        <Chip label={t('pages.interviewLive.stats.scheduled', { count: stats.scheduled })} color="info" variant="outlined" />
        <Chip label={t('pages.interviewLive.stats.completed', { count: stats.completed })} color="success" variant="outlined" />
      </Stack>

      {loading && !sessions.length ? (
        <Box sx={{ width: '100%', mb: 2 }}>
          <LinearProgress color="primary" sx={{ height: 4, borderRadius: 3 }} />
        </Box>
      ) : (
        <Divider sx={{ mb: 2 }} />
      )}

      <Paper sx={{ p: 0, borderRadius: '12px', overflow: 'hidden' }} elevation={0}>
        <DataTable
            columns={columns}
            data={sessions}
            isLoading={loading}
            rowCount={count}
            pagination={pagination}
            onPaginationChange={onPaginationChange}
            emptyMessage={t('pages.interviewLive.table.emptyMessage')}
        />
      </Paper>

      <Box sx={{ mt: 3 }}>
         <AIToolsCard />
      </Box>
    </Box>
  );
};

export default InterviewLivePage;
