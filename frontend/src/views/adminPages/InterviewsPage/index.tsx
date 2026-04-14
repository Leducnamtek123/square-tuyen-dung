import React, { useMemo } from 'react';
import {
  Box, Typography, Breadcrumbs, Link, Paper,
  Chip
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { ColumnDef } from '@tanstack/react-table';
import DataTable from '../../../components/Common/DataTable';
import { useDataTable } from '../../../hooks';
import { InterviewSession } from '../../../types/models';
import { useInterviews } from './hooks/useInterviews';
import dayjs from '../../../configs/dayjs-config';

const STATUS_CHIP_COLORS: Record<string, "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning"> = {
  'scheduled': 'info',
  'in_progress': 'warning',
  'completed': 'success',
  'cancelled': 'error',
  'calibration': 'secondary',
  'processing': 'warning',
  'expired': 'default',
};

const InterviewsPage = () => {
  const { t } = useTranslation('admin');

  const {
    page,
    pageSize,
    sorting,
    onSortingChange,
    ordering,
    pagination,
    onPaginationChange,
  } = useDataTable({ initialPageSize: 10 });

  const {
      data,
      isLoading
  } = useInterviews({
      page: page + 1,
      pageSize,
      ordering
  });

  const interviews = data?.results || [];

  const columns = useMemo<ColumnDef<InterviewSession>[]>(() => [
    {
      accessorKey: 'id',
      header: 'ID',
      enableSorting: true,
    },
    {
      accessorKey: 'roomName',
      header: t('pages.interviews.table.room') as string,
      cell: (info) => (
        <Typography variant="body2" fontWeight={600}>
          {info.getValue() as string}
        </Typography>
      ),
    },
    {
      accessorKey: 'jobPostDict.jobName',
      header: t('pages.interviews.table.jobPost') as string,
      cell: (info) => info.getValue() as string || '—',
    },
    {
      accessorKey: 'jobSeekerDict.fullName',
      header: t('pages.interviews.table.candidate') as string,
      cell: (info) => info.getValue() as string || '—',
    },
    {
      accessorKey: 'status',
      header: t('pages.interviews.table.status') as string,
      enableSorting: true,
      cell: (info) => {
        const val = info.getValue() as string;
        return (
          <Chip
            label={t(`pages.interviews.status.${val}`)}
            size="small"
            color={STATUS_CHIP_COLORS[val] || 'default'}
            sx={{ fontWeight: 600 }}
          />
        );
      },
    },
    {
      accessorKey: 'scheduledAt',
      header: t('pages.interviews.table.scheduledAt') as string,
      enableSorting: true,
      cell: (info) => info.getValue() ? dayjs(info.getValue() as string).format('DD/MM/YYYY HH:mm') : '—',
    }
  ], [t]);

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>{t('pages.interviews.title')}</Typography>
        <Breadcrumbs>
          <Link underline="hover" color="inherit" href="/admin">{t('pages.interviews.breadcrumbAdmin')}</Link>
          <Typography color="text.primary">{t('pages.interviews.breadcrumb')}</Typography>
        </Breadcrumbs>
      </Box>

      <Paper sx={{ p: 0, borderRadius: '12px', overflow: 'hidden' }} elevation={0}>
        <DataTable
          columns={columns}
          data={interviews}
          isLoading={isLoading}
          rowCount={data?.count || 0}
          pagination={pagination}
          onPaginationChange={onPaginationChange}
          enableSorting
          sorting={sorting}
          onSortingChange={onSortingChange}
        />
      </Paper>
    </Box>
  );
};

export default InterviewsPage;
