'use client';

import React from 'react';
import {
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    useReactTable,
    ColumnDef,
    SortingState,
    OnChangeFn,
    RowSelectionState,
} from '@tanstack/react-table';
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableContainer, 
    TableHead, 
    TableRow, 
    Paper, 
    TablePagination, 
    Box, 
    Typography, 
    CircularProgress,
    Checkbox,
    TableSortLabel,
    Tooltip
} from "@mui/material";
import { useTranslation } from 'react-i18next';

interface Props<TData> {
  columns: ColumnDef<TData, unknown>[];
  data: TData[];
  isLoading?: boolean;
  rowCount?: number;
  pagination?: {
    pageIndex: number;
    pageSize: number;
  };
  onPaginationChange?: (pagination: { pageIndex: number; pageSize: number }) => void;
  
  // Sorting
  enableSorting?: boolean;
  sorting?: SortingState;
  onSortingChange?: OnChangeFn<SortingState>;
  
  // Selection
  enableRowSelection?: boolean;
  rowSelection?: RowSelectionState;
  onRowSelectionChange?: OnChangeFn<RowSelectionState>;
  getRowId?: (row: TData, relativeIndex: number) => string;

  // Deprecated: use rowCount, pagination, and onPaginationChange instead
  count?: number;
  page?: number;
  rowsPerPage?: number;
  onPageChange?: (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => void;
  onRowsPerPageChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  emptyMessage?: string;
  paginationMode?: 'visible' | 'hidden';
  variant?: 'card' | 'flat';
  stickyHeader?: boolean;
  maxHeight?: number | string;
}

type CellAlign = 'left' | 'center' | 'right' | 'justify' | 'inherit';
type ColumnMeta = { align?: CellAlign };

const DataTable = <TData,>({
    columns: userColumns,
    data,
    isLoading = false,
    rowCount,
    pagination,
    onPaginationChange,
    enableSorting = false,
    sorting,
    onSortingChange,
    enableRowSelection = false,
    rowSelection,
    onRowSelectionChange,
    getRowId,
    count = 0,
    page = 0,
    rowsPerPage = 10,
    onPageChange,
    onRowsPerPageChange,
    emptyMessage,
    paginationMode = 'visible',
    variant = 'card',
    stickyHeader = false,
    maxHeight,
}: Props<TData>) => {
    const { t } = useTranslation('admin');
    
    // Resolve props for backward compatibility
    const finalCount = rowCount ?? count;
    const finalPageIndex = pagination?.pageIndex ?? page;
    const finalPageSize = pagination?.pageSize ?? rowsPerPage;

    const handlePageChange = (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
        if (onPaginationChange && pagination) {
            onPaginationChange({ ...pagination, pageIndex: newPage });
        } else if (onPageChange) {
            onPageChange(event, newPage);
        }
    };

    const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newPageSize = parseInt(event.target.value, 10);
        if (onPaginationChange && pagination) {
            onPaginationChange({ pageIndex: 0, pageSize: newPageSize });
        } else if (onRowsPerPageChange) {
            onRowsPerPageChange(event);
        }
    };

    // Auto add selection column if enabled and not already present
    const columns = React.useMemo(() => {
        if (!enableRowSelection) return userColumns;
        
        const hasSelectionCol = userColumns.some(col => col.id === 'select' || (col as any).accessorKey === 'select');
        if (hasSelectionCol) return userColumns;

        const selectionColumn: ColumnDef<TData, unknown> = {
            id: 'select',
            header: ({ table }) => (
                <Checkbox
                    checked={table.getIsAllPageRowsSelected()}
                    indeterminate={table.getIsSomePageRowsSelected()}
                    onChange={table.getToggleAllPageRowsSelectedHandler()}
                    size="small"
                    color="primary"
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    disabled={!row.getCanSelect()}
                    onChange={row.getToggleSelectedHandler()}
                    size="small"
                    color="primary"
                />
            ),
            size: 48,
            enableSorting: false,
        };

        return [selectionColumn, ...userColumns];
    }, [enableRowSelection, userColumns]);
    
    const table = useReactTable({
        data,
        columns,
        pageCount: Math.ceil(finalCount / finalPageSize),
        state: {
            pagination: {
                pageIndex: finalPageIndex,
                pageSize: finalPageSize,
            },
            sorting: sorting ?? [],
            rowSelection: rowSelection ?? {},
        },
        enableRowSelection,
        enableSorting,
        onSortingChange,
        onRowSelectionChange,
        getRowId: getRowId || ((row: any, index) => String(row?.id ?? row?.slug ?? index)),
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        manualPagination: true,
        // Manual sorting if onSortingChange is provided (server-side)
        manualSorting: !!onSortingChange,
    });

    const displayEmptyMessage = emptyMessage || t('common.table.noData');

    return (
        <Box sx={{ width: '100%', overflow: 'hidden' }}>
            <TableContainer
                component={variant === 'flat' ? Box : Paper}
                sx={{
                    maxHeight: maxHeight || undefined,
                    overflowX: 'auto',
                    WebkitOverflowScrolling: 'touch',
                    width: '100%',
                    ...(variant === 'flat'
                        ? { borderRadius: 0, boxShadow: 'none', border: 'none' }
                        : { borderRadius: 2, boxShadow: 'none', border: '1px solid', borderColor: 'divider' })
                }}
            >
                <Table sx={{ minWidth: 650 }} stickyHeader={stickyHeader}>
                    <TableHead sx={{ bgcolor: 'grey.50' }}>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    const meta = header.column.columnDef.meta as ColumnMeta | undefined;
                                    const canSort = header.column.getCanSort();
                                    
                                    return (
                                        <TableCell
                                            key={header.id}
                                            align={(meta?.align as 'left' | 'center' | 'right' | 'justify' | 'inherit') || 'left'}
                                            sx={{ fontWeight: 'bold', color: 'text.secondary', py: 2 }}
                                            sortDirection={header.column.getIsSorted() || false}
                                        >
                                            {header.isPlaceholder ? null : (
                                                canSort ? (
                                                    <Tooltip title={t('common.table.sortTooltip')}>
                                                        <TableSortLabel
                                                            active={!!header.column.getIsSorted()}
                                                            direction={header.column.getIsSorted() || 'asc'}
                                                            onClick={header.column.getToggleSortingHandler()}
                                                        >
                                                            {flexRender(
                                                                header.column.columnDef.header,
                                                                header.getContext()
                                                            )}
                                                        </TableSortLabel>
                                                    </Tooltip>
                                                ) : (
                                                    flexRender(
                                                        header.column.columnDef.header,
                                                        header.getContext()
                                                    )
                                                )
                                            )}
                                        </TableCell>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableHead>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={columns.length} align="center" sx={{ py: 8 }}>
                                    <CircularProgress size={40} />
                                </TableCell>
                            </TableRow>
                        ) : data.length > 0 ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id} hover selected={row.getIsSelected()}>
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell 
                                            key={cell.id} 
                                            sx={{ py: 1.5 }}
                                            align={((cell.column.columnDef.meta as ColumnMeta | undefined)?.align) || 'left'}
                                        >
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} align="center" sx={{ py: 8 }}>
                                    <Typography color="text.secondary">{displayEmptyMessage}</Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {paginationMode === 'visible' && (
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={finalCount}
                    rowsPerPage={finalPageSize}
                    page={finalPageIndex}
                    onPageChange={handlePageChange}
                    onRowsPerPageChange={handleRowsPerPageChange}
                    backIconButtonProps={{ disabled: isLoading }}
                    nextIconButtonProps={{ disabled: isLoading }}
                    labelRowsPerPage={t('common.pagination.rowsPerPage')}
                    labelDisplayedRows={({ from, to, count }) => 
                        t('common.pagination.displayedRows', { from, to, count })
                    }
                    sx={{
                        '& .MuiTablePagination-toolbar': {
                            flexWrap: 'wrap',
                            justifyContent: { xs: 'center', sm: 'flex-end' },
                            px: { xs: 1, sm: 2 },
                            gap: { xs: 0.5, sm: 0 },
                        },
                        '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                            fontSize: '0.8125rem',
                        },
                    }}
                />
            )}
        </Box>
    );
};

export default DataTable;


