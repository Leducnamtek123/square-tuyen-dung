'use client';

import React, { useMemo } from 'react';
import {
  Box, Typography, Breadcrumbs, Link, Paper,
  Chip, Stack, Tooltip, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, Button
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import DeleteIcon from '@mui/icons-material/Delete';
import { useTranslation } from 'react-i18next';
import { ColumnDef } from '@tanstack/react-table';
import DataTable from '../../../components/Common/DataTable';
import { useDataTable } from '../../../hooks';
import { InterviewSession } from '../../../types/models';
import { useInterviews } from './hooks/useInterviews';
import dayjs from '../../../configs/dayjs-config';
import toastMessages from '../../../utils/toastMessages';
import FilterBar from '@/components/Common/FilterBar';

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
    searchTerm,
    debouncedSearchTerm,
    onSearchChange,
  } = useDataTable({ initialPageSize: 10 });

  const [selectedInterview, setSelectedInterview] = React.useState<InterviewSession | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<InterviewSession | null>(null);

  const {
      data,
      isLoading,
      updateInterviewStatus,
      deleteInterview,
      isMutating,
  } = useInterviews({
      page: page + 1,
      pageSize,
      ordering,
      kw: debouncedSearchTerm || undefined,
  });

  const interviews = data?.results || [];

  const handleSearch = (value: string) => {
    onSearchChange(value);
    onPaginationChange({ pageIndex: 0, pageSize });
  };

  const handleUpdateStatus = React.useCallback(async (id: string | number, nextStatus: string) => {
    try {
      await updateInterviewStatus({ id, status: nextStatus });
      toastMessages.success(t('pages.interviews.toast.statusUpdated', 'Interview status updated'));
    } catch (error) {
      console.error(error);
      toastMessages.error(t('pages.interviews.toast.statusUpdateError', 'Could not update interview status'));
    }
  }, [t, updateInterviewStatus]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteInterview(deleteTarget.id);
      setDeleteTarget(null);
      toastMessages.success(t('pages.interviews.toast.deleteSuccess', 'Interview deleted'));
    } catch (error) {
      console.error(error);
      toastMessages.error(t('pages.interviews.toast.deleteError', 'Could not delete interview'));
    }
  };

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
      accessorKey: 'jobName',
      header: t('pages.interviews.table.jobPost') as string,
      cell: (info) => info.getValue() as string || '—',
    },
    {
      accessorKey: 'candidateName',
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
    },
    {
      id: 'actions',
      header: t('pages.interviews.table.actions', 'Actions') as string,
      meta: { align: 'right' },
      cell: (info) => {
        const interview = info.row.original;
        const status = String(interview.status || '').toLowerCase();
        return (
          <Stack direction="row" spacing={0.5} justifyContent="flex-end">
            <Tooltip title={t('pages.interviews.table.view', 'View details')}>
              <IconButton size="small" color="info" onClick={() => setSelectedInterview(interview)}>
                <VisibilityIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            {status !== 'completed' && status !== 'cancelled' && (
              <>
                <Tooltip title={t('pages.interviews.table.markCompleted', 'Mark completed')}>
                  <IconButton
                    size="small"
                    color="success"
                    disabled={isMutating}
                    onClick={() => handleUpdateStatus(interview.id, 'completed')}
                  >
                    <CheckCircleIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title={t('pages.interviews.table.cancel', 'Cancel')}>
                  <IconButton
                    size="small"
                    color="warning"
                    disabled={isMutating}
                    onClick={() => handleUpdateStatus(interview.id, 'cancelled')}
                  >
                    <CancelIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </>
            )}
            <Tooltip title={t('pages.interviews.table.delete', 'Delete')}>
              <IconButton size="small" color="error" disabled={isMutating} onClick={() => setDeleteTarget(interview)}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        );
      },
    }
  ], [handleUpdateStatus, isMutating, t]);

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
        <Box sx={{ p: 2, pb: 0 }}>
          <FilterBar
            title={t('pages.interviews.filter.title', 'Bộ lọc phỏng vấn')}
            searchValue={searchTerm}
            searchPlaceholder={t('pages.interviews.searchPlaceholder', 'Search interviews...')}
            onSearchChange={handleSearch}
            onReset={() => handleSearch('')}
            resetDisabled={!searchTerm}
            resetLabel={t('common.clearFilters', 'Xóa lọc')}
          />
        </Box>
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

      <Dialog open={!!selectedInterview} onClose={() => setSelectedInterview(null)} fullWidth maxWidth="sm">
        <DialogTitle>{t('pages.interviews.detailTitle', 'Interview details')}</DialogTitle>
        <DialogContent>
          <Stack spacing={1.25} sx={{ pt: 1 }}>
            <Typography variant="body2"><strong>{t('pages.interviews.table.room')}:</strong> {selectedInterview?.roomName || '—'}</Typography>
            <Typography variant="body2"><strong>{t('pages.interviews.table.candidate')}:</strong> {selectedInterview?.candidateName || '—'}</Typography>
            <Typography variant="body2"><strong>{t('pages.interviews.table.jobPost')}:</strong> {selectedInterview?.jobName || '—'}</Typography>
            <Typography variant="body2"><strong>{t('pages.interviews.table.status')}:</strong> {selectedInterview?.status || '—'}</Typography>
            <Typography variant="body2"><strong>{t('pages.interviews.table.scheduledAt')}:</strong> {selectedInterview?.scheduledAt ? dayjs(selectedInterview.scheduledAt).format('DD/MM/YYYY HH:mm') : '—'}</Typography>
            {selectedInterview?.recordingUrl && (
              <Link href={selectedInterview.recordingUrl} target="_blank" rel="noreferrer">
                {t('pages.interviews.recordingLink', 'Open recording')}
              </Link>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedInterview(null)}>{t('common.close', 'Close')}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
        <DialogTitle>{t('pages.interviews.deleteTitle', 'Delete interview')}</DialogTitle>
        <DialogContent>
          <Typography>
            {t('pages.interviews.deleteConfirm', { name: deleteTarget?.roomName || deleteTarget?.id || '' })}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)} color="inherit">{t('common.cancel', 'Cancel')}</Button>
          <Button onClick={handleDelete} color="error" variant="contained" disabled={isMutating}>
            {isMutating ? t('common.deleting', 'Deleting...') : t('common.delete', 'Delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default InterviewsPage;
