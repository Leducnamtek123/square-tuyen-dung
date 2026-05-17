'use client';

import React, { useMemo, useReducer, useState } from 'react';
import {
  Box,
  Breadcrumbs,
  Button,
  Chip,
  FormControl,
  InputLabel,
  Link,
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
import { ColumnDef } from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';
import DataTable from '@/components/Common/DataTable';
import FilterBar, { filterControlSx } from '@/components/Common/FilterBar';
import dayjs from '@/configs/dayjs-config';
import { useDataTable, useDebounce } from '@/hooks';
import adminManagementService from '@/services/adminManagementService';
import type { AuditLog } from '@/types/models';

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
  | { type: 'set_search_term'; value: string }
  | { type: 'set_action'; value: string }
  | { type: 'set_field'; field: Exclude<keyof AuditLogPageState, 'searchTerm' | 'action'>; value: string }
  | { type: 'reset' };

const actions = ['create', 'update', 'delete', 'approve', 'reject', 'status_change', 'bulk_status', 'agent_access', 'export'];

const actionColor = (action: string): 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info' => {
  if (action === 'delete' || action === 'reject') return 'error';
  if (action === 'approve') return 'success';
  if (action === 'status_change' || action === 'bulk_status') return 'warning';
  if (action === 'export' || action === 'agent_access') return 'info';
  if (action === 'create') return 'primary';
  return 'default';
};

const makeExportFilename = () => {
  const stamp = dayjs().format('YYYYMMDD-HHmmss');
  return `audit-logs-${stamp}.csv`;
};

const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

export default function AuditLogsPage() {
  const { t } = useTranslation('admin');
  const [isExporting, setIsExporting] = useState(false);
  const {
    page,
    pageSize: rowsPerPage,
    sorting,
    onSortingChange,
    ordering,
    pagination,
    onPaginationChange,
  } = useDataTable({ initialPageSize: 10 });

  const [state, dispatch] = useReducer(
    (current: AuditLogPageState, action: AuditLogPageAction): AuditLogPageState => {
      switch (action.type) {
        case 'set_search_term':
          return { ...current, searchTerm: action.value };
        case 'set_action':
          return { ...current, action: action.value };
        case 'set_field':
          return { ...current, [action.field]: action.value };
        case 'reset':
          return { searchTerm: '', action: '', actorEmail: '', resourceType: '', resourceId: '', dateFrom: '', dateTo: '' };
        default:
          return current;
      }
    },
    { searchTerm: '', action: '', actorEmail: '', resourceType: '', resourceId: '', dateFrom: '', dateTo: '' }
  );

  const debouncedSearch = useDebounce(state.searchTerm, 500);
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

  const handleExport = async () => {
    if (isExporting) return;

    setIsExporting(true);
    try {
      const blob = await adminManagementService.exportAuditLogs({
        ...queryParams,
        page: undefined,
        pageSize: undefined,
      });
      downloadBlob(blob, makeExportFilename());
    } finally {
      setIsExporting(false);
    }
  };

  const columns = useMemo<ColumnDef<AuditLog>[]>(
    () => [
      {
        accessorKey: 'id',
        header: 'ID',
        enableSorting: true,
        size: 72,
      },
      {
        accessorKey: 'createAt',
        header: t('pages.auditLogs.table.time', 'Thời gian') as string,
        enableSorting: true,
        cell: (info) => (info.getValue() ? dayjs(info.getValue() as string).format('DD/MM/YYYY HH:mm:ss') : '---'),
      },
      {
        accessorKey: 'action',
        header: t('pages.auditLogs.table.action', 'Hành động') as string,
        enableSorting: true,
        cell: (info) => {
          const action = String(info.getValue() || '');
          return <Chip size="small" color={actionColor(action)} label={t(`pages.auditLogs.actions.${action}`, action)} />;
        },
      },
      {
        accessorKey: 'actorEmail',
        header: t('pages.auditLogs.table.actor', 'Người thao tác') as string,
        cell: (info) => info.getValue() || 'system',
      },
      {
        accessorKey: 'resourceType',
        header: t('pages.auditLogs.table.resource', 'Đối tượng') as string,
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
        header: t('pages.auditLogs.table.request', 'Request') as string,
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
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary', mb: 1 }}>
          {t('pages.auditLogs.title', 'Nhật ký hệ thống')}
        </Typography>
        <Breadcrumbs aria-label="breadcrumb">
          <Link underline="hover" color="inherit" href="/admin">
            {t('pages.auditLogs.breadcrumbAdmin', 'Quản trị')}
          </Link>
          <Typography color="text.primary">{t('pages.auditLogs.breadcrumb', 'Nhật ký hệ thống')}</Typography>
        </Breadcrumbs>
      </Box>

      <Paper sx={{ p: 2, mb: 3, borderRadius: '12px' }} elevation={0}>
        <FilterBar
          title={t('pages.auditLogs.filter.title', 'Bộ lọc nhật ký')}
          searchValue={state.searchTerm}
          searchPlaceholder={t('pages.auditLogs.searchPlaceholder', 'Tìm email, hành động, đối tượng, request...')}
          onSearchChange={handleSearch}
          onReset={() => {
            dispatch({ type: 'reset' });
            onPaginationChange({ pageIndex: 0, pageSize: rowsPerPage });
          }}
          resetDisabled={!hasFilters}
          resetLabel={t('common.clearFilters', 'Xóa lọc')}
          activeFilterCount={activeFilterCount}
          advancedLabel={t('common.advancedFilters', 'Bộ lọc nâng cao')}
          actions={
            <Button variant="outlined" startIcon={<DownloadIcon />} onClick={handleExport} disabled={isLoading || isExporting}>
              {isExporting ? t('pages.auditLogs.exportingCsv', 'Đang xuất...') : t('pages.auditLogs.exportCsv', 'Xuất CSV')}
            </Button>
          }
          advancedFilters={
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.25} flexWrap="wrap">
              <TextField
                label={t('pages.auditLogs.filter.actorEmail', 'Email người thao tác')}
                size="small"
                value={state.actorEmail}
                onChange={(event) => handleFieldChange('actorEmail', event.target.value)}
                sx={[{ minWidth: 220 }, filterControlSx]}
              />
              <TextField
                label={t('pages.auditLogs.filter.resourceType', 'Loại đối tượng')}
                size="small"
                value={state.resourceType}
                onChange={(event) => handleFieldChange('resourceType', event.target.value)}
                sx={[{ minWidth: 220 }, filterControlSx]}
              />
              <TextField
                label={t('pages.auditLogs.filter.resourceId', 'ID đối tượng')}
                size="small"
                value={state.resourceId}
                onChange={(event) => handleFieldChange('resourceId', event.target.value)}
                sx={[{ minWidth: 180 }, filterControlSx]}
              />
              <TextField
                label={t('pages.auditLogs.filter.dateFrom', 'Từ ngày')}
                type="date"
                size="small"
                value={state.dateFrom}
                onChange={(event) => handleFieldChange('dateFrom', event.target.value)}
                sx={[{ minWidth: 180 }, filterControlSx]}
                slotProps={{ inputLabel: { shrink: true } }}
              />
              <TextField
                label={t('pages.auditLogs.filter.dateTo', 'Đến ngày')}
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
              <InputLabel id="audit-action-filter-label">{t('pages.auditLogs.filter.action', 'Hành động')}</InputLabel>
              <Select
                labelId="audit-action-filter-label"
                value={state.action}
                label={t('pages.auditLogs.filter.action', 'Hành động')}
                onChange={(event) => handleActionChange(event.target.value)}
              >
                <MenuItem value="">{t('pages.auditLogs.filter.allActions', 'Tất cả')}</MenuItem>
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
        />
      </Paper>
    </Box>
  );
}
