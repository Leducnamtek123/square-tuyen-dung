import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box, Typography, Breadcrumbs, Link, Paper, IconButton,
  Chip, Switch, Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Tooltip, Rating, Stack
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { PaginatedResponse } from '@/types/api';
import DeleteIcon from '@mui/icons-material/Delete';
import { useTranslation } from 'react-i18next';
import adminManagementService from '../../../services/adminManagementService';
import { ColumnDef } from '@tanstack/react-table';
import DataTable from '../../../components/Common/DataTable';
import { useDataTable } from '../../../hooks';

const FeedbacksPage = () => {
  const { t } = useTranslation('admin');
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openDelete, setOpenDelete] = useState(false);
  const [current, setCurrent] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  const {
    sorting,
    onSortingChange,
    ordering,
  } = useDataTable();

  const fetchFeedbacks = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await adminManagementService.getFeedbacks({ ordering }) as PaginatedResponse<Record<string, unknown>>;
      setFeedbacks(res.results || []);
    } catch (e) { console.error(e); }
    finally { setIsLoading(false); }
  }, [ordering]);

  useEffect(() => { fetchFeedbacks(); }, [fetchFeedbacks]);

  const handleToggleActive = async (fb: any) => {
    try {
      await adminManagementService.updateFeedback(fb.id, { is_active: !fb.is_active });
      fetchFeedbacks();
    } catch (e) { console.error(e); }
  };

  const handleDelete = async () => {
    if (!current) return;
    setIsSaving(true);
    try {
      await adminManagementService.deleteFeedback(current.id);
      setOpenDelete(false);
      fetchFeedbacks();
    } catch (e) { console.error(e); }
    finally { setIsSaving(false); }
  };

  const columns = useMemo<ColumnDef<any>[]>(() => [
    {
      accessorKey: 'id',
      header: t('pages.feedbacks.table.id') as string,
      enableSorting: true,
    },
    {
      accessorKey: 'userDict.fullName',
      header: t('pages.feedbacks.table.user') as string,
      enableSorting: true,
      cell: (info) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {info.row.original.userDict?.avatarUrl && (
            <Box component="img" src={info.row.original.userDict.avatarUrl} alt=""
              sx={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} />
          )}
          <Box>
            <Typography variant="body2" fontWeight={600}>{info.getValue() as string || 'N/A'}</Typography>
            <Typography variant="caption" color="text.secondary">{info.row.original.userDict?.email || ''}</Typography>
          </Box>
        </Box>
      ),
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
          />
          <Chip label={info.getValue() ? t('pages.feedbacks.show') : t('pages.feedbacks.hide')} size="small"
            color={info.getValue() ? 'success' : 'default'} />
        </Stack>
      ),
    },
    {
      accessorKey: 'create_at',
      header: t('pages.feedbacks.table.createdAt') as string,
      enableSorting: true,
      cell: (info) => info.getValue() ? new Date(info.getValue() as string).toLocaleDateString('vi-VN') : '—',
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
  ], [t, handleToggleActive]);

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>{t('pages.feedbacks.title')}</Typography>
        <Breadcrumbs>
          <Link underline="hover" color="inherit" href="/">{t('pages.feedbacks.breadcrumbAdmin')}</Link>
          <Typography color="text.primary">{t('pages.feedbacks.breadcrumb')}</Typography>
        </Breadcrumbs>
      </Box>

      <DataTable
        columns={columns}
        data={feedbacks || []}
        isLoading={isLoading}
        hidePagination
        enableSorting
        sorting={sorting}
        onSortingChange={onSortingChange}
        emptyMessage={t('pages.feedbacks.empty')}
      />

      <Dialog open={openDelete} onClose={() => setOpenDelete(false)}>
        <DialogTitle>{t('pages.feedbacks.deleteTitle')}</DialogTitle>
        <DialogContent>
          <Typography>
            {t('pages.feedbacks.deleteConfirm', { name: current?.userDict?.fullName || 'N/A' })}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpenDelete(false)} color="inherit">{t('pages.feedbacks.cancel')}</Button>
          <Button onClick={handleDelete} color="error" variant="contained" disabled={isSaving}>
            {isSaving ? t('pages.feedbacks.deleting') : t('pages.feedbacks.delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FeedbacksPage;
