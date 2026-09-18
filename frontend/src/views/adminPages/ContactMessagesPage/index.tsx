'use client';

import React, { useCallback, useMemo, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Chip,
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
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import { useTranslation } from 'react-i18next';
import { ColumnDef } from '@tanstack/react-table';
import DataTable from '@/components/Common/DataTable';
import FilterBar, { filterControlSx } from '@/components/Common/FilterBar';
import AdminStatusBadge from '@/components/Common/AdminStatusBadge';
import AdminConfirmDialog from '@/components/Common/AdminConfirmDialog';
import AdminDetailDrawer from '@/components/Common/AdminDetailDrawer';
import { useDataTable } from '@/hooks';
import { ContactMessage } from '@/types/models';
import { useContactMessages } from './hooks/useContactMessages';
import dayjs from '@/configs/dayjs-config';

type CategoryFilter = 'all' | 'bug_report' | 'feedback' | 'support';
type ReadFilter = 'all' | 'read' | 'unread';

const ContactMessagesPage = () => {
  const { t } = useTranslation(['admin', 'common']);
  const [deleteTarget, setDeleteTarget] = useState<ContactMessage | null>(null);
  const [inspectingMessage, setInspectingMessage] = useState<ContactMessage | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [readFilter, setReadFilter] = useState<ReadFilter>('all');

  const {
    page,
    pageSize,
    sorting,
    onSortingChange,
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
    ordering: sorting.length > 0 ? `${sorting[0].desc ? '-' : ''}${sorting[0].id}` : undefined,
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
      if (inspectingMessage?.id === msg.id) {
        setInspectingMessage((prev) => prev ? { ...prev, is_read: true, isRead: true } : null);
      }
    } catch (e) {
      console.error(e);
    }
  }, [inspectingMessage?.id, markAsRead]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMessage(deleteTarget.id);
      setDeleteTarget(null);
      if (inspectingMessage?.id === deleteTarget.id) {
        setInspectingMessage(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const resetFilters = () => {
    setCategoryFilter('all');
    setReadFilter('all');
    onSearchChange('');
    setPage(0);
  };

  const activeFilterCount = [
    Boolean(searchTerm.trim()),
    categoryFilter !== 'all',
    readFilter !== 'all',
  ].filter(Boolean).length;

  const columns = useMemo<ColumnDef<ContactMessage>[]>(
    () => [
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
        cell: (info) => (
          <Typography
            variant="body2"
            onClick={() => {
              setInspectingMessage(info.row.original);
              handleToggleRead(info.row.original);
            }}
            sx={{ fontWeight: 600, color: '#1E293B', cursor: 'pointer', '&:hover': { color: '#2563EB', textDecoration: 'underline' } }}
          >
            {(info.getValue() as string) || '-'}
          </Typography>
        ),
      },
      {
        accessorKey: 'name',
        header: t('pages.contactMessages.table.name') as string,
        enableSorting: true,
        cell: (info) => {
          const row = info.row.original;
          const isRead = row.is_read ?? row.isRead;
          return (
            <Typography variant="body2" sx={{ fontWeight: isRead ? 500 : 700, color: isRead ? '#475569' : '#0F172A' }}>
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
        cell: (info) => info.getValue() || '-',
      },
      {
        accessorKey: 'pageUrl',
        header: t('pages.contactMessages.table.pageUrl') as string,
        cell: (info) => {
          const url = info.getValue() as string | undefined;
          if (!url) return '-';
          return (
            <Typography variant="body2" sx={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {url}
            </Typography>
          );
        },
      },
      {
        id: 'is_read',
        accessorFn: (row) => row.is_read ?? row.isRead,
        header: t('pages.contactMessages.table.status') as string,
        cell: (info) => {
          const isRead = info.getValue();
          return isRead ? (
            <AdminStatusBadge status="verified" label={t('pages.contactMessages.read')} />
          ) : (
            <AdminStatusBadge status="pending" label={t('pages.contactMessages.unread')} />
          );
        },
      },
      {
        id: 'create_at',
        accessorFn: (row) => row.createAt || row.create_at,
        header: t('pages.contactMessages.table.createdAt') as string,
        enableSorting: true,
        cell: (info) => (info.getValue() ? dayjs(info.getValue() as string).format('DD/MM/YYYY HH:mm') : '-'),
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
              <Tooltip title={t('pages.contactMessages.table.content')}>
                <IconButton
                  size="small"
                  onClick={() => {
                    setInspectingMessage(msg);
                    handleToggleRead(msg);
                  }}
                  sx={{ color: '#64748B' }}
                >
                  <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
              {!isRead && (
                <Tooltip title={t('pages.contactMessages.markAsRead')}>
                  <IconButton
                    aria-label="Thao tác"
                    size="small"
                    color="primary"
                    onClick={() => handleToggleRead(msg)}
                    disabled={isMutating}
                  >
                    <MarkEmailReadOutlinedIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Tooltip>
              )}
              <Tooltip title={t('pages.contactMessages.deleteTooltip')}>
                <IconButton
                  aria-label="Thao tác"
                  size="small"
                  color="error"
                  onClick={() => setDeleteTarget(msg)}
                >
                  <DeleteIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
            </Stack>
          );
        },
      },
    ],
    [handleToggleRead, isMutating, t]
  );

  return (
    <Box sx={{ width: '100%', pb: 6 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F172A', fontSize: { xs: '1.5rem', sm: '1.875rem' }, lineHeight: 1.2 }}>
          {t('pages.contactMessages.title')}
        </Typography>
        <Typography variant="body2" sx={{ color: '#64748B', mt: 0.5 }}>
          {t('pages.contactMessages.filter.description')}
        </Typography>
      </Box>

      {/* Main Table Paper */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 2.5 },
          mb: 3,
          borderRadius: 3,
          border: '1px solid #E2E8F0',
          bgcolor: '#FFFFFF',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.04)',
        }}
      >
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
                    onChange={(event) => {
                      setCategoryFilter(event.target.value as CategoryFilter);
                      setPage(0);
                    }}
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
                    onChange={(event) => {
                      setReadFilter(event.target.value as ReadFilter);
                      setPage(0);
                    }}
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
        />

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

      {/* Delete Confirmation Dialog */}
      <AdminConfirmDialog
        open={Boolean(deleteTarget)}
        title={t('pages.contactMessages.deleteTitle')}
        message={t('pages.contactMessages.deleteConfirm', { name: deleteTarget?.name || 'N/A' })}
        variant="danger"
        loading={isMutating}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />

      {/* Detail Drawer */}
      <AdminDetailDrawer
        open={Boolean(inspectingMessage)}
        onClose={() => setInspectingMessage(null)}
        title={t('pages.contactMessages.detailTitle')}
        subtitle={`Người gửi: ${inspectingMessage?.name || 'Ẩn danh'}`}
        footerAction={
          inspectingMessage && !(inspectingMessage.is_read || inspectingMessage.isRead) ? (
            <Button
              size="small"
              variant="contained"
              startIcon={<MarkEmailReadOutlinedIcon />}
              onClick={() => handleToggleRead(inspectingMessage)}
              sx={{ textTransform: 'none', fontWeight: 600 }}
            >
              {t('pages.contactMessages.markAsRead')}
            </Button>
          ) : undefined
        }
      >
        {inspectingMessage && (
          <Stack spacing={2.5}>
            <Box sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: 2, border: '1px solid #E2E8F0' }}>
              <Stack spacing={1}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" sx={{ color: '#64748B' }}>{t('pages.contactMessages.table.category')}:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{t(`pages.contactMessages.categories.${inspectingMessage.category || 'bug_report'}`)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" sx={{ color: '#64748B' }}>{t('pages.contactMessages.table.subject')}:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{inspectingMessage.subject || '-'}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" sx={{ color: '#64748B' }}>{t('pages.contactMessages.table.name')}:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{inspectingMessage.name}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" sx={{ color: '#64748B' }}>{t('pages.contactMessages.table.email')}:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#2563EB' }}>
                    <a href={`mailto:${inspectingMessage.email}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                      {inspectingMessage.email}
                    </a>
                  </Typography>
                </Box>
                {inspectingMessage.phone && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" sx={{ color: '#64748B' }}>{t('pages.contactMessages.table.phone')}:</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{inspectingMessage.phone}</Typography>
                  </Box>
                )}
                {inspectingMessage.pageUrl && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" sx={{ color: '#64748B' }}>{t('pages.contactMessages.table.pageUrl')}:</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, wordBreak: 'break-all' }}>{inspectingMessage.pageUrl}</Typography>
                  </Box>
                )}
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" sx={{ color: '#64748B' }}>{t('pages.contactMessages.table.createdAt')}:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {dayjs(inspectingMessage.createAt || inspectingMessage.create_at).format('DD/MM/YYYY HH:mm')}
                  </Typography>
                </Box>
              </Stack>
            </Box>

            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A', mb: 1 }}>
                {t('pages.contactMessages.table.content')}
              </Typography>
              <Paper
                variant="outlined"
                sx={{ p: 2, borderRadius: 2, bgcolor: '#FFFFFF', whiteSpace: 'pre-wrap', fontSize: '0.875rem', lineHeight: 1.6 }}
              >
                {inspectingMessage.content || '-'}
              </Paper>
            </Box>
          </Stack>
        )}
      </AdminDetailDrawer>
    </Box>
  );
};

export default ContactMessagesPage;
