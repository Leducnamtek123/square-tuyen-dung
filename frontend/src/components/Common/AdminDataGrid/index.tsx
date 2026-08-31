'use client';

import React, { useMemo, useCallback } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Checkbox,
  Skeleton,
  Typography,
  Stack,
  Button,
} from '@mui/material';
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined';
import TableToolbar from './TableToolbar';
import TablePagination from './TablePagination';
import type { AdminDataGridProps, ColumnDef, SortOrder } from './types';

export default function AdminDataGrid<T>({
  columns,
  data = [],
  totalCount,
  page = 1,
  pageSize = 10,
  pageSizeOptions = [10, 25, 50, 100],
  onPageChange,
  onPageSizeChange,
  orderBy,
  order = 'asc',
  onSortChange,
  searchQuery,
  onSearchChange,
  searchPlaceholder,
  filters,
  onFilterChange,
  onResetFilters,
  selectable = false,
  selectedRows = [],
  onSelectRows,
  getRowId = (row: any, idx?: number) => {
    const candidate = row?.id ?? row?.code ?? row?.slug ?? row?.uuid;
    if (candidate != null && String(candidate).trim() !== '') {
      return String(candidate);
    }
    return idx !== undefined ? `row-${idx}` : '';
  },
  bulkActions,
  onExport,
  onRefresh,
  loading = false,
  emptyTitle = 'Không có dữ liệu',
  emptyDescription = 'Không tìm thấy bản ghi nào phù hợp với điều kiện tìm kiếm hoặc bộ lọc hiện tại.',
  emptyAction,
  title,
  subtitle,
  headerAction,
  onRowClick,
  dense = false,
}: AdminDataGridProps<T>) {
  const actualTotalCount = totalCount !== undefined ? totalCount : data.length;

  const selectedRowIds = useMemo(() => {
    return new Set(selectedRows.map((r, i) => String(getRowId(r, i))));
  }, [selectedRows, getRowId]);

  const isAllSelected = useMemo(() => {
    if (data.length === 0) return false;
    return data.every((row, i) => selectedRowIds.has(String(getRowId(row, i))));
  }, [data, selectedRowIds, getRowId]);

  const isSomeSelected = useMemo(() => {
    return selectedRows.length > 0 && !isAllSelected;
  }, [selectedRows.length, isAllSelected]);

  const handleSelectAll = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (!onSelectRows) return;
      if (event.target.checked) {
        onSelectRows([...data]);
      } else {
        onSelectRows([]);
      }
    },
    [data, onSelectRows]
  );

  const handleToggleRow = useCallback(
    (row: T, index: number, event: React.MouseEvent) => {
      event.stopPropagation();
      if (!onSelectRows) return;
      const rowId = String(getRowId(row, index));
      if (selectedRowIds.has(rowId)) {
        onSelectRows(selectedRows.filter((r, i) => String(getRowId(r, i)) !== rowId));
      } else {
        onSelectRows([...selectedRows, row]);
      }
    },
    [getRowId, onSelectRows, selectedRowIds, selectedRows]
  );

  const handleClearSelection = useCallback(() => {
    if (onSelectRows) onSelectRows([]);
  }, [onSelectRows]);

  const handleSort = (columnId: string) => {
    if (!onSortChange) return;
    const isAsc = orderBy === columnId && order === 'asc';
    onSortChange(columnId, isAsc ? 'desc' : 'asc');
  };

  const cellPaddingY = dense ? 1 : 1.75;

  return (
    <Paper
      elevation={0}
      sx={{
        width: '100%',
        borderRadius: 3,
        border: '1px solid #E2E8F0',
        bgcolor: '#FFFFFF',
        overflow: 'hidden',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
      }}
    >
      {/* Table Toolbar */}
      <TableToolbar
        title={title}
        subtitle={subtitle}
        headerAction={headerAction}
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        searchPlaceholder={searchPlaceholder}
        filters={filters}
        onFilterChange={onFilterChange}
        onResetFilters={onResetFilters}
        selectedRows={selectedRows}
        onClearSelection={handleClearSelection}
        bulkActions={bulkActions}
        onExport={onExport}
        onRefresh={onRefresh}
        loading={loading}
      />

      {/* Main Table */}
      <TableContainer sx={{ maxHeight: 680, overflowX: 'auto' }}>
        <Table stickyHeader size={dense ? 'small' : 'medium'}>
          <TableHead>
            <TableRow sx={{ bgcolor: '#F8FAFC' }}>
              {selectable && (
                <TableCell
                  padding="checkbox"
                  sx={{
                    bgcolor: '#F8FAFC',
                    borderBottom: '1px solid #E2E8F0',
                    width: 48,
                    pl: 2,
                  }}
                >
                  <Checkbox
                    size="small"
                    indeterminate={isSomeSelected}
                    checked={isAllSelected}
                    onChange={handleSelectAll}
                    disabled={loading || data.length === 0}
                    sx={{ color: '#94A3B8', '&.Mui-checked': { color: '#2563EB' } }}
                  />
                </TableCell>
              )}

              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align || 'left'}
                  sx={{
                    bgcolor: '#F8FAFC',
                    color: '#475569',
                    fontWeight: 700,
                    fontSize: '0.8125rem',
                    borderBottom: '1px solid #E2E8F0',
                    py: 1.5,
                    whiteSpace: 'nowrap',
                    width: column.width,
                    minWidth: column.minWidth,
                    display: column.hideOnMobile ? { xs: 'none', md: 'table-cell' } : undefined,
                  }}
                >
                  {column.sortable && onSortChange ? (
                    <TableSortLabel
                      active={orderBy === column.id}
                      direction={orderBy === column.id ? order : 'asc'}
                      onClick={() => handleSort(column.id)}
                      sx={{
                        '&.Mui-active': { color: '#2563EB' },
                        '&:hover': { color: '#2563EB' },
                      }}
                    >
                      {column.header}
                    </TableSortLabel>
                  ) : (
                    column.header
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {loading ? (
              // Loading Skeletons
              Array.from({ length: pageSize > 10 ? 10 : pageSize }).map((_, rIdx) => (
                <TableRow key={`skeleton-row-${rIdx}`} sx={{ height: dense ? 44 : 56 }}>
                  {selectable && (
                    <TableCell sx={{ pl: 2, borderBottom: '1px solid #F1F5F9' }}>
                      <Skeleton variant="rectangular" width={18} height={18} sx={{ borderRadius: 0.5 }} />
                    </TableCell>
                  )}
                  {columns.map((col, cIdx) => (
                    <TableCell
                      key={`skeleton-cell-${cIdx}`}
                      sx={{
                        py: cellPaddingY,
                        borderBottom: '1px solid #F1F5F9',
                        display: col.hideOnMobile ? { xs: 'none', md: 'table-cell' } : undefined,
                      }}
                    >
                      <Skeleton
                        variant="text"
                        width={cIdx === 0 ? '60%' : cIdx === 1 ? '85%' : '45%'}
                        height={24}
                      />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : data.length === 0 ? (
              // Empty State
              <TableRow>
                <TableCell
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  sx={{ py: 8, textAlign: 'center', borderBottom: 'none' }}
                >
                  <Stack spacing={2} alignItems="center" justifyContent="center">
                    <Box
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: '50%',
                        bgcolor: '#F1F5F9',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <InboxOutlinedIcon sx={{ fontSize: 30, color: '#94A3B8' }} />
                    </Box>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#334155' }}>
                        {emptyTitle}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: '#64748B', maxWidth: 420, mt: 0.5, mx: 'auto' }}
                      >
                        {emptyDescription}
                      </Typography>
                    </Box>
                    {emptyAction && <Box sx={{ mt: 1 }}>{emptyAction}</Box>}
                  </Stack>
                </TableCell>
              </TableRow>
            ) : (
              // Normal Data Rows
              data.map((row, index) => {
                const rowId = String(getRowId(row, index));
                const isSelected = selectedRowIds.has(rowId);

                return (
                  <TableRow
                    key={rowId}
                    hover
                    selected={isSelected}
                    onClick={() => onRowClick && onRowClick(row)}
                    sx={{
                      cursor: onRowClick ? 'pointer' : 'default',
                      transition: 'background-color 150ms ease',
                      '&:hover': { bgcolor: '#F8FAFC' },
                      '&.Mui-selected': {
                        bgcolor: '#EFF6FF !important',
                        '&:hover': { bgcolor: '#DBEAFE !important' },
                      },
                    }}
                  >
                    {selectable && (
                      <TableCell
                        padding="checkbox"
                        sx={{
                          pl: 2,
                          borderBottom: '1px solid #F1F5F9',
                          width: 48,
                        }}
                      >
                        <Checkbox
                          size="small"
                          checked={isSelected}
                          onClick={(e) => handleToggleRow(row, index, e)}
                          sx={{ color: '#CBD5E1', '&.Mui-checked': { color: '#2563EB' } }}
                        />
                      </TableCell>
                    )}

                    {columns.map((column) => {
                      const value = column.accessorKey ? row[column.accessorKey] : undefined;
                      const rendered = column.cell ? column.cell(row, index) : (value as React.ReactNode);

                      return (
                        <TableCell
                          key={column.id}
                          align={column.align || 'left'}
                          sx={{
                            py: cellPaddingY,
                            fontSize: '0.875rem',
                            color: '#1E293B',
                            borderBottom: '1px solid #F1F5F9',
                            display: column.hideOnMobile ? { xs: 'none', md: 'table-cell' } : undefined,
                          }}
                        >
                          {rendered !== undefined && rendered !== null ? rendered : '—'}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Table Pagination */}
      {onPageChange && (
        <TablePagination
          page={page}
          pageSize={pageSize}
          totalCount={actualTotalCount}
          pageSizeOptions={pageSizeOptions}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      )}
    </Paper>
  );
}

export * from './types';
