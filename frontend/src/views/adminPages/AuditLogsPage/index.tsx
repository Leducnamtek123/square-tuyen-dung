'use client';

import React, { useMemo, useReducer, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import { useQuery } from '@tanstack/react-query';
import { ColumnDef, RowSelectionState } from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';
import DataTable from '@/components/Common/DataTable';
import FilterBar, { filterControlSx } from '@/components/Common/FilterBar';
import dayjs from '@/configs/dayjs-config';
import { useDataTable, useDebounce } from '@/hooks';
import adminManagementService from '@/services/adminManagementService';
import type { AuditLog } from '@/types/models';
import { ExportModal, type ExportColumn, type ExportScope } from '@/components/Common/ExportModal';

type AuditLogPageState = {
  searchTerm: string;
  action: string;
  actorEmail: string;
  resourceType: string;
  resourceId: string;
  dateFrom: string;
  dateTo: string;
};

type AuditLogPageAction =
  | { type: 'set_field'; field: Exclude<keyof AuditLogPageState, 'searchTerm' | 'action'>; value: string }
  | { type: 'set_search_term'; value: string }
  | { type: 'set_action'; value: string }
  | { type: 'reset' };

const initialState: AuditLogPageState = {
  searchTerm: '',
  action: '',
  actorEmail: '',
  resourceType: '',
  resourceId: '',
  dateFrom: '',
  dateTo: '',
};

function reducer(state: AuditLogPageState, action: AuditLogPageAction): AuditLogPageState {
  switch (action.type) {
    case 'set_field':
      return { ...state, [action.field]: action.value };
    case 'set_search_term':
      return { ...state, searchTerm: action.value };
    case 'set_action':
      return { ...state, action: action.value };
    case 'reset':
      return initialState;
    default:
      return state;
  }
}

const actions = ['create', 'update', 'delete', 'approve', 'reject', 'status_change', 'bulk_status', 'agent_access', 'export'];

const actionColor = (action: string): 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info' => {
  if (action === 'delete' || action === 'reject') return 'error';
  if (action === 'approve') return 'success';
  if (action === 'status_change' || action === 'bulk_status') return 'warning';
  if (action === 'export' || action === 'agent_access') return 'info';
  if (action === 'create') return 'primary';
  return 'default';
};

export default function AuditLogsPage() {
  const { t } = useTranslation('admin');
  const [state, dispatch] = useReducer(reducer, initialState);
  const debouncedSearch = useDebounce(state.searchTerm, 500);

  const {
    page,
    pageSize: rowsPerPage,
    sorting,
    onSortingChange,
    ordering,
    pagination,
    onPaginationChange,
  } = useDataTable({
    initialSorting: [{ id: 'createAt', desc: true }],
    initialPageSize: 10,
  });

  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const activeFilterCount = [
    state.action,
    state.actorEmail,
    state.resourceType,
    state.resourceId,
    state.dateFrom,
    state.dateTo,
  ].filter(Boolean).length;
  const hasFilters = Boolean(state.searchTerm || activeFilterCount);

  const queryParams = useMemo(
    () => ({
      page: page + 1,
      pageSize: rowsPerPage,
      search: debouncedSearch,
      action: state.action || undefined,
      actorEmail: state.actorEmail || undefined,
      resourceType: state.resourceType || undefined,
      resourceId: state.resourceId || undefined,
      dateFrom: state.dateFrom || undefined,
      dateTo: state.dateTo || undefined,
      ordering,
    }),
    [debouncedSearch, ordering, page, rowsPerPage, state.action, state.actorEmail, state.dateFrom, state.dateTo, state.resourceId, state.resourceType]
  );

  const { data, isLoading } = useQuery({
    queryKey: ['admin-audit-logs', queryParams],
    queryFn: () => adminManagementService.getAuditLogs(queryParams),
  });

  const handleSearch = (value: string) => {
    dispatch({ type: 'set_search_term', value });
    onPaginationChange({ pageIndex: 0, pageSize: rowsPerPage });
  };

  const handleActionChange = (value: string) => {
    dispatch({ type: 'set_action', value });
    onPaginationChange({ pageIndex: 0, pageSize: rowsPerPage });
  };

  const handleFieldChange = (field: Exclude<keyof AuditLogPageState, 'searchTerm' | 'action'>, value: string) => {
    dispatch({ type: 'set_field', field, value });
    onPaginationChange({ pageIndex: 0, pageSize: rowsPerPage });
  };

  const [exportModalOpen, setExportModalOpen] = useState(false);

  const auditLogExportColumns: ExportColumn[] = useMemo(() => [
    { id: 'id', label: 'ID', checked: true, getValue: (row) => row.id || row.ID || '---' },
    {
      id: 'createAt',
      label: t('pages.auditLogs.table.time'),
      checked: true,
      getValue: (row) => (row.createAt ? dayjs(row.createAt).format('DD/MM/YYYY HH:mm:ss') : '---'),
    },
    { id: 'action', label: t('pages.auditLogs.table.action'), checked: true, getValue: (row) => row.action || '---' },
    { id: 'actorEmail', label: t('pages.auditLogs.table.actor'), checked: true, getValue: (row) => row.actorEmail || 'system' },
    { id: 'resourceType', label: t('pages.auditLogs.table.resource'), checked: true, getValue: (row) => row.resourceType || '---' },
    { id: 'resourceId', label: 'Resource ID', checked: true, getValue: (row) => row.resourceId || '---' },
    { id: 'requestMethod', label: 'HTTP Method', checked: true, getValue: (row) => row.requestMethod || '---' },
    { id: 'requestPath', label: 'Request Path', checked: true, getValue: (row) => row.requestPath || '---' },
  ], [t]);

  const handleFetchAuditLogExportData = React.useCallback(async (scope: ExportScope) => {
    const params = scope === 'all' ? {} : queryParams;
    const res = await adminManagementService.getAuditLogs({
      ...params,
      page: 1,
      pageSize: scope === 'all' ? 1000 : 100,
    });
    const exportList = (res.results || []) as Record<string, any>[];
    if (scope === 'selected') {
      const selectedIds = Object.keys(rowSelection).filter(id => rowSelection[id]);
      if (selectedIds.length === 0) return [];
      const filtered = exportList.filter((item) => selectedIds.includes(String(item.id ?? item.ID ?? '')));
      if (filtered.length > 0) return filtered;
      const currentList = data?.results || [];
      return currentList.filter((item: any) => selectedIds.includes(String(item.id)));
    }
    return exportList;
  }, [queryParams, rowSelection, data?.results]);

  const columns = useMemo<ColumnDef<AuditLog>[]>(
    () => [
      {
        accessorKey: 'id',
        header: 'ID',
        enableSorting: true,
        size: 72,
      },
      {
        id: 'create_at',
        accessorFn: (row) => row.createAt,
        header: t('pages.auditLogs.table.time') as string,
        enableSorting: true,
        cell: (info) => (info.getValue() ? dayjs(info.getValue() as string).format('DD/MM/YYYY HH:mm:ss') : '---'),
      },
      {
        accessorKey: 'action',
        header: t('pages.auditLogs.table.action') as string,
        enableSorting: true,
        cell: (info) => {
          const action = String(info.getValue() || '');
          return <Chip size="small" color={actionColor(action)} label={t(`pages.auditLogs.actions.${action}`, action)} />;
        },
      },
      {
        accessorKey: 'actorEmail',
        header: t('pages.auditLogs.table.actor') as string,
        cell: (info) => info.getValue() || 'system',
      },
      {
        accessorKey: 'resourceType',
        header: t('pages.auditLogs.table.resource') as string,
        cell: (info) => (
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {String(info.getValue() || '---')}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              #{info.row.original.resourceId || '---'} {info.row.original.resourceRepr ? `· ${info.row.original.resourceRepr}` : ''}
            </Typography>
          </Box>
        ),
      },
      {
        accessorKey: 'requestPath',
        header: t('pages.auditLogs.table.request') as string,
        cell: (info) => (
          <Tooltip title={String(info.getValue() || '')}>
            <Stack spacing={0.25}>
              <Typography variant="caption" sx={{ fontWeight: 700 }}>
                {info.row.original.requestMethod || '---'}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 280 }}>
                {String(info.getValue() || '---')}
              </Typography>
            </Stack>
          </Tooltip>
        ),
      },
      {
        accessorKey: 'ipAddress',
        header: 'IP',
        cell: (info) => info.getValue() || '---',
      },
    ],
    [t]
  );

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: '-0.02em', mb: 0.5 }}>
          {t('pages.auditLogs.title')}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t('pages.auditLogs.subtitle')}
        </Typography>
      </Box>

      <Paper sx={{ p: 2, mb: 3, borderRadius: '12px' }} elevation={0}>
        <FilterBar
          title={t('pages.auditLogs.filter.title')}
          searchValue={state.searchTerm}
          searchPlaceholder={t('pages.auditLogs.searchPlaceholder')}
          onSearchChange={handleSearch}
          onReset={() => {
            dispatch({ type: 'reset' });
            onPaginationChange({ pageIndex: 0, pageSize: rowsPerPage });
          }}
          resetDisabled={!hasFilters}
          resetLabel={t('common.clearFilters')}
          activeFilterCount={activeFilterCount}
          advancedLabel={t('common.advancedFilters')}
          actions={
            <Button variant="outlined" startIcon={<DownloadIcon />} onClick={() => setExportModalOpen(true)} disabled={isLoading}>
              {t('pages.auditLogs.exportCsv')}
            </Button>
          }
          advancedFilters={
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.25} flexWrap="wrap">
              <TextField
                label={t('pages.auditLogs.filter.actorEmail')}
                size="small"
                value={state.actorEmail}
                onChange={(event) => handleFieldChange('actorEmail', event.target.value)}
                sx={[{ minWidth: 220 }, filterControlSx]}
              />
              <TextField
                label={t('pages.auditLogs.filter.resourceType')}
                size="small"
                value={state.resourceType}
                onChange={(event) => handleFieldChange('resourceType', event.target.value)}
                sx={[{ minWidth: 220 }, filterControlSx]}
              />
              <TextField
                label={t('pages.auditLogs.filter.resourceId')}
                size="small"
                value={state.resourceId}
                onChange={(event) => handleFieldChange('resourceId', event.target.value)}
                sx={[{ minWidth: 180 }, filterControlSx]}
              />
              <TextField
                label={t('pages.auditLogs.filter.dateFrom')}
                type="date"
                size="small"
                value={state.dateFrom}
                onChange={(event) => handleFieldChange('dateFrom', event.target.value)}
                sx={[{ minWidth: 180 }, filterControlSx]}
                slotProps={{ inputLabel: { shrink: true } }}
              />
              <TextField
                label={t('pages.auditLogs.filter.dateTo')}
                type="date"
                size="small"
                value={state.dateTo}
                onChange={(event) => handleFieldChange('dateTo', event.target.value)}
                sx={[{ minWidth: 180 }, filterControlSx]}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Stack>
          }
        >
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel id="audit-action-filter-label">{t('pages.auditLogs.filter.action')}</InputLabel>
            <Select
              labelId="audit-action-filter-label"
              value={state.action}
              label={t('pages.auditLogs.filter.action')}
              onChange={(event) => handleActionChange(event.target.value)}
            >
              <MenuItem value="">{t('pages.auditLogs.filter.allActions')}</MenuItem>
              {actions.map((action) => (
                <MenuItem key={action} value={action}>
                  {t(`pages.auditLogs.actions.${action}`, action)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </FilterBar>

        <DataTable
          columns={columns}
          data={data?.results || []}
          isLoading={isLoading}
          rowCount={data?.count || 0}
          pagination={pagination}
          onPaginationChange={onPaginationChange}
          enableSorting
          sorting={sorting}
          onSortingChange={onSortingChange}
          enableRowSelection
          rowSelection={rowSelection}
          onRowSelectionChange={setRowSelection}
          stickyHeader
          maxHeight="calc(100vh - 280px)"
        />
      </Paper>

      <ExportModal
        open={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        defaultFileName="AuditLogs"
        columns={auditLogExportColumns}
        fetchData={handleFetchAuditLogExportData}
        totalRecords={{
          all: data?.count || 0,
          filtered: data?.count || 0,
          selected: Object.keys(rowSelection).filter((k) => rowSelection[k]).length,
        }}
      />
    </Box>
  );
}
