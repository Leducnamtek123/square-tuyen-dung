'use client';

import React, { useCallback, useMemo, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Tooltip,
  Stack,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import MarkEmailReadOutlinedIcon from '@mui/icons-material/MarkEmailReadOutlined';
import { useTranslation } from 'react-i18next';
import { ColumnDef } from '@tanstack/react-table';
import DataTable from '../../../components/Common/DataTable';
import FilterBar, { filterControlSx } from '../../../components/Common/FilterBar';
import { useDataTable } from '../../../hooks';
import { ContactMessage } from '../../../types/models';
import { useContactMessages } from './hooks/useContactMessages';
import dayjs from '../../../configs/dayjs-config';

type CategoryFilter = 'all' | 'bug_report' | 'feedback' | 'support';
type ReadFilter = 'all' | 'read' | 'unread';

const ContactMessagesPage = () => {
  const { t } = useTranslation('admin');
  const [openDelete, setOpenDelete] = useState(false);
  const [current, setCurrent] = useState<ContactMessage | null>(null);
  const [viewDetail, setViewDetail] = useState<ContactMessage | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [readFilter, setReadFilter] = useState<ReadFilter>('all');

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
    setPage,
  } = useDataTable({ initialPageSize: 10, initialSorting: [{ id: 'create_at', desc: true }] });

  const {
    data,
    isLoading,
    markAsRead,
    deleteMessage,
    isMutating,
  } = useContactMessages({
    page: page + 1,
    pageSize,
    ordering,
    search: debouncedSearchTerm || undefined,
    category: categoryFilter === 'all' ? undefined : categoryFilter,
    is_read:
      readFilter === 'all'
        ? undefined
        : readFilter === 'read',
  });

  const messages = data?.results || [];
  const totalMessages = data?.count || 0;

  const handleToggleRead = useCallback(async (msg: ContactMessage) => {
    if (msg.is_read || msg.isRead) return;
    try {
      await markAsRead(msg.id);
    } catch (e) {
      console.error(e);
    }
  }, [markAsRead]);

  const handleDelete = async () => {
    if (!current) return;
    try {
      await deleteMessage(current.id);
      setOpenDelete(false);
      setCurrent(null);
    } catch (e) {
      console.error(e);
    }
  };

  const activeFilterCount = [
    Boolean(searchTerm.trim()),
    categoryFilter !== 'all',
    readFilter !== 'all',
  ].filter(Boolean).length;

  const resetFilters = () => {
    setCategoryFilter('all');
    setReadFilter('all');
    onSearchChange('');
    setPage(0);
  };

  const columns = useMemo<ColumnDef<ContactMessage>[]>(() => [
    {
      accessorKey: 'id',
      header: t('pages.contactMessages.table.id') as string,
      enableSorting: true,
    },
    {
      accessorKey: 'category',
      header: t('pages.contactMessages.table.category') as string,
      cell: (info) => {
        const value = info.getValue() as string | undefined;
        return (
          <Chip
            size="small"
            variant="outlined"
            color={value === 'bug_report' ? 'error' : value === 'feedback' ? 'primary' : 'default'}
            label={value ? t(`pages.contactMessages.categories.${value}`) : t('common:na')}
          />
        );
      },
    },
    {
      accessorKey: 'subject',
      header: t('pages.contactMessages.table.subject') as string,
      cell: (info) => info.getValue() || '—',
    },
    {
      accessorKey: 'name',
      header: t('pages.contactMessages.table.name') as string,
      enableSorting: true,
      cell: (info) => {
        const row = info.row.original;
        const isRead = row.is_read ?? row.isRead;
        return (
          <Typography variant="body2" sx={{ fontWeight: isRead ? 400 : 700 }}>
            {info.getValue() as string}
          </Typography>
        );
      },
    },
    {
      accessorKey: 'email',
      header: t('pages.contactMessages.table.email') as string,
      enableSorting: true,
    },
    {
      accessorKey: 'phone',
      header: t('pages.contactMessages.table.phone') as string,
      cell: (info) => info.getValue() || '—',
    },
    {
      accessorKey: 'pageUrl',
      header: t('pages.contactMessages.table.pageUrl') as string,
      cell: (info) => {
        const url = info.getValue() as string | undefined;
        if (!url) return '—';
        return (
          <Typography variant="body2" sx={{ maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {url}
          </Typography>
        );
      },
    },
    {
      accessorKey: 'content',
      header: t('pages.contactMessages.table.content') as string,
      cell: (info) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography
            variant="body2"
            sx={{
              maxWidth: 280,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              cursor: 'pointer',
            }}
            onClick={() => setViewDetail(info.row.original)}
          >
            {(info.getValue() as string)?.slice(0, 100)}
            {(info.getValue() as string)?.length > 100 ? '...' : ''}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'is_read',
      accessorFn: (row) => row.is_read ?? row.isRead,
      header: t('pages.contactMessages.table.status') as string,
      cell: (info) => {
        const isRead = info.getValue();
        return (
          <Chip
            label={isRead ? t('pages.contactMessages.read') : t('pages.contactMessages.unread')}
            size="small"
            color={isRead ? 'default' : 'info'}
            variant="outlined"
          />
        );
      },
    },
    {
      id: 'create_at',
      accessorFn: (row) => row.createAt || row.create_at,
      header: t('pages.contactMessages.table.createdAt') as string,
      enableSorting: true,
      cell: (info) => info.getValue() ? dayjs(info.getValue() as string).format('DD/MM/YYYY HH:mm') : '—',
    },
    {
      id: 'actions',
      header: t('pages.contactMessages.table.actions') as string,
      meta: { align: 'right' },
      cell: (info) => {
        const msg = info.row.original;
        const isRead = msg.is_read ?? msg.isRead;
        return (
          <Stack direction="row" spacing={0.5} justifyContent="flex-end">
            {!isRead && (
              <Tooltip title={t('pages.contactMessages.markAsRead')}>
                <IconButton
                  size="small"
                  color="primary"
                  onClick={() => handleToggleRead(msg)}
                  disabled={isMutating}
                >
                  <MarkEmailReadOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title={t('pages.contactMessages.deleteTooltip')}>
              <IconButton
                size="small"
                color="error"
                onClick={() => { setCurrent(msg); setOpenDelete(true); }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        );
      },
    },
  ], [handleToggleRead, isMutating, t]);

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary', mb: 1 }}>
          {t('pages.contactMessages.title')}
        </Typography>
      </Box>

      <FilterBar
        title={t('pages.contactMessages.filter.title')}
        description={t('pages.contactMessages.filter.description')}
        searchValue={searchTerm}
        searchPlaceholder={t('pages.contactMessages.searchPlaceholder')}
        onSearchChange={onSearchChange}
        onReset={resetFilters}
        resetLabel={t('pages.contactMessages.filter.reset')}
        activeFilterCount={activeFilterCount}
        advancedLabel={t('pages.contactMessages.filter.advanced')}
        advancedFilters={(
          <Stack spacing={2} sx={{ pt: 0.5 }}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <FormControl fullWidth sx={filterControlSx}>
                <InputLabel>{t('pages.contactMessages.filter.category')}</InputLabel>
                <Select
                  label={t('pages.contactMessages.filter.category')}
                  value={categoryFilter}
                  onChange={(event) => setCategoryFilter(event.target.value as CategoryFilter)}
                >
                  <MenuItem value="all">{t('common:all')}</MenuItem>
                  <MenuItem value="bug_report">{t('pages.contactMessages.categories.bug_report')}</MenuItem>
                  <MenuItem value="feedback">{t('pages.contactMessages.categories.feedback')}</MenuItem>
                  <MenuItem value="support">{t('pages.contactMessages.categories.support')}</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth sx={filterControlSx}>
                <InputLabel>{t('pages.contactMessages.filter.readStatus')}</InputLabel>
                <Select
                  label={t('pages.contactMessages.filter.readStatus')}
                  value={readFilter}
                  onChange={(event) => setReadFilter(event.target.value as ReadFilter)}
                >
                  <MenuItem value="all">{t('common:all')}</MenuItem>
                  <MenuItem value="read">{t('pages.contactMessages.read')}</MenuItem>
                  <MenuItem value="unread">{t('pages.contactMessages.unread')}</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </Stack>
        )}
        advancedDefaultOpen
        sx={{ mb: 3 }}
      />

      <Paper sx={{ p: 2, borderRadius: '12px' }} elevation={0}>
        <DataTable
          columns={columns}
          data={messages}
          isLoading={isLoading}
          rowCount={totalMessages}
          pagination={pagination}
          onPaginationChange={onPaginationChange}
          paginationMode="visible"
          enableSorting
          sorting={sorting}
          onSortingChange={onSortingChange}
          emptyMessage={t('pages.contactMessages.empty')}
        />
      </Paper>

      <Dialog open={openDelete} onClose={() => setOpenDelete(false)}>
        <DialogTitle>{t('pages.contactMessages.deleteTitle')}</DialogTitle>
        <DialogContent>
          <Typography>
            {t('pages.contactMessages.deleteConfirm', { name: current?.name || 'N/A' })}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpenDelete(false)} color="inherit">{t('pages.contactMessages.cancel')}</Button>
          <Button onClick={handleDelete} color="error" variant="contained" disabled={isMutating}>
            {isMutating ? t('pages.contactMessages.deleting') : t('pages.contactMessages.delete')}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={!!viewDetail}
        onClose={() => setViewDetail(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {t('pages.contactMessages.detailTitle')}
        </DialogTitle>
        <DialogContent dividers>
          {viewDetail && (
            <Stack spacing={2}>
              <Box>
                <Typography variant="caption" color="text.secondary">{t('pages.contactMessages.table.category')}</Typography>
                <Typography variant="body1">{t(`pages.contactMessages.categories.${viewDetail.category || 'bug_report'}`)}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">{t('pages.contactMessages.table.subject')}</Typography>
                <Typography variant="body1">{viewDetail.subject || '—'}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">{t('pages.contactMessages.table.name')}</Typography>
                <Typography variant="body1">{viewDetail.name}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">{t('pages.contactMessages.table.email')}</Typography>
                <Typography variant="body1" sx={{ wordBreak: 'break-all' }}>{viewDetail.email}</Typography>
              </Box>
              {viewDetail.phone && (
                <Box>
                  <Typography variant="caption" color="text.secondary">{t('pages.contactMessages.table.phone')}</Typography>
                  <Typography variant="body1">{viewDetail.phone}</Typography>
                </Box>
              )}
              <Box>
                <Typography variant="caption" color="text.secondary">{t('pages.contactMessages.table.pageUrl')}</Typography>
                <Typography variant="body1" sx={{ wordBreak: 'break-all' }}>
                  {viewDetail.pageUrl || '—'}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">{t('pages.contactMessages.table.content')}</Typography>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>{viewDetail.content}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">{t('pages.contactMessages.table.createdAt')}</Typography>
                <Typography variant="body2">
                  {dayjs(viewDetail.createAt || viewDetail.create_at).format('DD/MM/YYYY HH:mm')}
                </Typography>
              </Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setViewDetail(null)} variant="contained">
            {t('pages.contactMessages.close')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ContactMessagesPage;
