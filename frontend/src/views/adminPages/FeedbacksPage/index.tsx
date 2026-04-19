import React, { useState, useMemo, useCallback } from 'react';
import {
  Box, Typography, Breadcrumbs, Link, Paper, IconButton,
  Chip, Switch, Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Tooltip, Rating, Stack
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useTranslation } from 'react-i18next';
import { ColumnDef } from '@tanstack/react-table';
import DataTable from '../../../components/Common/DataTable';
import { useDataTable } from '../../../hooks';
import { Feedback } from '../../../types/models';
import { useFeedbacks } from './hooks/useFeedbacks';
import dayjs from '../../../configs/dayjs-config';

const FeedbacksPage = () => {
  const { t } = useTranslation('admin');
  const [openDelete, setOpenDelete] = useState(false);
  const [current, setCurrent] = useState<Feedback | null>(null);

  const {
    sorting,
    onSortingChange,
    ordering,
  } = useDataTable();

  const {
      data,
      isLoading,
      updateFeedback,
      deleteFeedback,
      isMutating
  } = useFeedbacks({ ordering });

  const feedbacks = data?.results || [];

  const handleToggleActive = useCallback(async (fb: Feedback) => {
    try {
      await updateFeedback({ id: fb.id, data: { is_active: !fb.is_active } });
    } catch (e) { console.error(e); }
  }, [updateFeedback]);

  const handleDelete = async () => {
    if (!current) return;
    try {
      await deleteFeedback(current.id);
      setOpenDelete(false);
    } catch (e) { console.error(e); }
  };

  const columns = useMemo<ColumnDef<Feedback>[]>(() => [
    {
      accessorKey: 'id',
      header: t('pages.feedbacks.table.id') as string,
      enableSorting: true,
    },
    {
      accessorKey: 'userDict.fullName',
      header: t('pages.feedbacks.table.user') as string,
      enableSorting: true,
      cell: (info) => {
          const user = info.row.original.userDict;
          return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box 
                component="img" 
                src={user?.avatarUrl || ''} 
                alt=""
                onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => { e.currentTarget.style.display = 'none'; }}
                sx={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', border: '1px solid', borderColor: 'divider' }} 
              />
              <Box>
                <Typography variant="body2" fontWeight={600}>{user?.fullName || '—'}</Typography>
                <Typography variant="caption" color="text.secondary">{user?.email || ''}</Typography>
              </Box>
            </Box>
          );
      },
    },
    {
      accessorKey: 'content',
      header: t('pages.feedbacks.table.content') as string,
      cell: (info) => (
        <Typography variant="body2" sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {info.getValue() as string}
        </Typography>
      ),
    },
    {
      accessorKey: 'rating',
      header: t('pages.feedbacks.table.rating') as string,
      enableSorting: true,
      cell: (info) => <Rating value={info.getValue() as number} readOnly size="small" />,
    },
    {
      accessorKey: 'is_active',
      header: t('pages.feedbacks.table.status') as string,
      cell: (info) => (
        <Stack direction="row" spacing={0.5} alignItems="center">
          <Switch
            checked={!!info.getValue()}
            onChange={() => handleToggleActive(info.row.original)}
            size="small"
            color="success"
            disabled={isMutating}
          />
          <Chip label={info.getValue() ? t('pages.feedbacks.show') : t('pages.feedbacks.hide')} size="small"
            color={info.getValue() ? 'success' : 'default'} variant="outlined" />
        </Stack>
      ),
    },
    {
      accessorKey: 'create_at',
      header: t('pages.feedbacks.table.createdAt') as string,
      enableSorting: true,
      cell: (info) => info.getValue() ? dayjs(info.getValue() as string).format('DD/MM/YYYY') : '—',
    },
    {
      id: 'actions',
      header: t('pages.feedbacks.table.actions') as string,
      meta: { align: 'right' },
      cell: (info) => (
        <Tooltip title={t('pages.feedbacks.table.deleteTooltip')}>
          <IconButton size="small" color="error" onClick={() => { setCurrent(info.row.original); setOpenDelete(true); }}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      ),
    },
  ], [handleToggleActive, isMutating, t]);

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary', mb: 1 }}>{t('pages.feedbacks.title')}</Typography>
        <Breadcrumbs>
          <Link underline="hover" color="inherit" href="/admin">{t('pages.feedbacks.breadcrumbAdmin')}</Link>
          <Typography color="text.primary">{t('pages.feedbacks.breadcrumb')}</Typography>
        </Breadcrumbs>
      </Box>

      <Paper sx={{ p: 2, borderRadius: '12px' }} elevation={0}>
        <DataTable
            columns={columns}
            data={feedbacks}
            isLoading={isLoading}
            hidePagination
            enableSorting
            sorting={sorting}
            onSortingChange={onSortingChange}
            emptyMessage={t('pages.feedbacks.empty')}
        />
      </Paper>

      <Dialog open={openDelete} onClose={() => setOpenDelete(false)}>
        <DialogTitle>{t('pages.feedbacks.deleteTitle')}</DialogTitle>
        <DialogContent>
          <Typography>
            {t('pages.feedbacks.deleteConfirm', { name: current?.userDict?.fullName || 'N/A' })}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpenDelete(false)} color="inherit">{t('pages.feedbacks.cancel')}</Button>
          <Button onClick={handleDelete} color="error" variant="contained" disabled={isMutating}>
            {isMutating ? t('pages.feedbacks.deleting') : t('pages.feedbacks.delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FeedbacksPage;
