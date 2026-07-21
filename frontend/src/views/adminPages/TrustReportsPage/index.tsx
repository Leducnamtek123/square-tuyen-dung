'use client';

import React, { useMemo, useState } from 'react';
import {
  Box,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { ColumnDef } from '@tanstack/react-table';
import DataTable from '../../../components/Common/DataTable';
import FilterBar, { filterControlSx } from '../../../components/Common/FilterBar';
import { useDataTable } from '../../../hooks';
import type { TrustReport } from '../../../types/models';
import { useTrustReports } from './hooks/useTrustReports';

type StatusFilter = 'all' | TrustReport['status'];
type TargetTypeFilter = 'all' | TrustReport['targetType'];

const STATUS_OPTIONS: TrustReport['status'][] = ['open', 'reviewing', 'resolved', 'rejected'];
const TARGET_TYPE_OPTIONS: TrustReport['targetType'][] = ['job', 'company'];

const statusColor = (status: TrustReport['status']) => {
  if (status === 'resolved') return 'success';
  if (status === 'rejected') return 'default';
  if (status === 'reviewing') return 'warning';
  return 'error';
};

const TrustReportsPage = () => {
  const { t } = useTranslation('admin');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [targetTypeFilter, setTargetTypeFilter] = useState<TargetTypeFilter>('all');
  const [reporterFilter, setReporterFilter] = useState('');

  const {
    page,
    pageSize,
    pagination,
    onPaginationChange,
    sorting,
    onSortingChange,
    ordering,
    searchTerm,
    debouncedSearchTerm,
    onSearchChange,
    setPage,
  } = useDataTable({ initialPageSize: 10, initialSorting: [{ id: 'create_at', desc: true }] });

  const {
    data,
    isLoading,
    updateTrustReport,
    isMutating,
  } = useTrustReports({
    page: page + 1,
    pageSize,
    ordering,
    search: debouncedSearchTerm || undefined,
    status: statusFilter === 'all' ? undefined : statusFilter,
    targetType: targetTypeFilter === 'all' ? undefined : targetTypeFilter,
    reporter: reporterFilter.trim() || undefined,
  });

  const rows = data?.results || [];
  const totalRows = data?.count || 0;
  const emptyValue = t('common.na');

  const getStatusLabel = (status: TrustReport['status']) => {
    switch (status) {
      case 'reviewing':
        return t('pages.trustReports.status.reviewing');
      case 'resolved':
        return t('pages.trustReports.status.resolved');
      case 'rejected':
        return t('pages.trustReports.status.rejected');
      case 'open':
      default:
        return t('pages.trustReports.status.open');
    }
  };

  const activeFilterCount = [
    Boolean(searchTerm.trim()),
    statusFilter !== 'all',
    targetTypeFilter !== 'all',
    Boolean(reporterFilter.trim()),
  ].filter(Boolean).length;

  const resetFilters = () => {
    setStatusFilter('all');
    setTargetTypeFilter('all');
    setReporterFilter('');
    onSearchChange('');
    setPage(0);
  };

  const columns = useMemo<ColumnDef<TrustReport>[]>(() => [
    {
      accessorKey: 'id',
      header: t('pages.trustReports.table.id') as string,
      enableSorting: true,
    },
    {
      accessorKey: 'targetTitle',
      header: t('pages.trustReports.table.target') as string,
      cell: (info) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {info.row.original.targetTitle || info.row.original.targetType}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {info.row.original.targetType}
          </Typography>
        </Box>
      ),
    },
    {
      accessorKey: 'reason',
      header: t('pages.trustReports.table.reason') as string,
    },
    {
      accessorKey: 'reporterDict.email',
      header: t('pages.trustReports.table.reporter') as string,
      cell: (info) => info.row.original.reporterDict?.email || emptyValue,
    },
    {
      accessorKey: 'message',
      header: t('pages.trustReports.table.message') as string,
      cell: (info) => (
        <Typography variant="body2" sx={{ maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {info.getValue() as string || emptyValue}
        </Typography>
      ),
    },
    {
      accessorKey: 'status',
      header: t('pages.trustReports.table.status') as string,
      cell: (info) => {
        const row = info.row.original;
        return (
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
            <Chip size="small" label={getStatusLabel(row.status)} color={statusColor(row.status)} variant="outlined" />
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>{t('pages.trustReports.table.status')}</InputLabel>
              <Select
                label={t('pages.trustReports.table.status')}
                value={row.status}
                disabled={isMutating}
                onChange={(event) =>
                  updateTrustReport({ id: row.id, status: event.target.value as TrustReport['status'] })
                }
              >
                {STATUS_OPTIONS.map((status) => (
                  <MenuItem key={status} value={status}>
                    {getStatusLabel(status)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        );
      },
    },
  ], [emptyValue, getStatusLabel, isMutating, t, updateTrustReport]);

  return (
    <Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={2} sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            {t('pages.trustReports.title')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('pages.trustReports.subtitle')}
          </Typography>
        </Box>
      </Stack>

      <FilterBar
        title={t('pages.trustReports.filter.title')}
        description={t('pages.trustReports.filter.description')}
        searchValue={searchTerm}
        searchPlaceholder={t('pages.trustReports.searchPlaceholder')}
        onSearchChange={onSearchChange}
        onReset={resetFilters}
        resetLabel={t('pages.trustReports.filter.reset')}
        activeFilterCount={activeFilterCount}
        advancedLabel={t('pages.trustReports.filter.advanced')}
        advancedFilters={(
          <Stack spacing={2} sx={{ pt: 0.5 }}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <TextField
                label={t('pages.trustReports.filter.reporter')}
                value={reporterFilter}
                onChange={(event) => setReporterFilter(event.target.value)}
                fullWidth
                sx={filterControlSx}
                placeholder={t('pages.trustReports.filter.reporterPlaceholder')}
              />
              <FormControl fullWidth sx={filterControlSx}>
                <InputLabel>{t('pages.trustReports.filter.status')}</InputLabel>
                <Select
                  label={t('pages.trustReports.filter.status')}
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
                >
                  <MenuItem value="all">{t('pages.trustReports.filter.all')}</MenuItem>
                  {STATUS_OPTIONS.map((status) => (
                    <MenuItem key={status} value={status}>
                      {getStatusLabel(status)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
            <FormControl fullWidth sx={filterControlSx}>
              <InputLabel>{t('pages.trustReports.filter.targetType')}</InputLabel>
              <Select
                label={t('pages.trustReports.filter.targetType')}
                value={targetTypeFilter}
                onChange={(event) => setTargetTypeFilter(event.target.value as TargetTypeFilter)}
              >
                <MenuItem value="all">{t('pages.trustReports.filter.all')}</MenuItem>
                {TARGET_TYPE_OPTIONS.map((targetType) => (
                  <MenuItem key={targetType} value={targetType}>
                    {t(`pages.trustReports.targetType.${targetType}`)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        )}
        advancedDefaultOpen
        sx={{ mb: 3 }}
      />

      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
        <DataTable
          columns={columns}
          data={rows}
          isLoading={isLoading}
          rowCount={totalRows}
          pagination={pagination}
          onPaginationChange={onPaginationChange}
          paginationMode="visible"
          enableSorting
          sorting={sorting}
          onSortingChange={onSortingChange}
          emptyMessage={t('pages.trustReports.empty')}
        />
      </Paper>
    </Box>
  );
};

export default TrustReportsPage;
