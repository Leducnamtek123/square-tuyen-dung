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
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  Inbox,
} from 'lucide-react';
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
  onRowsPerPageChange?: (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  emptyMessage?: string;
  paginationMode?: 'visible' | 'hidden';
  variant?: 'card' | 'flat';
  stickyHeader?: boolean;
  maxHeight?: number | string;
}

type CellAlign = 'left' | 'center' | 'right' | 'justify' | 'inherit';
type ColumnMeta = { align?: CellAlign };

const alignToClass: Record<CellAlign, string> = {
  left: 'text-left',
  center: 'text-center justify-center',
  right: 'text-right justify-end',
  justify: 'text-justify',
  inherit: 'text-left',
};

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
  const rawPageIndex = pagination?.pageIndex ?? page;
  const finalPageSize = pagination?.pageSize ?? rowsPerPage;
  const maxPageIndex = finalCount > 0 ? Math.max(0, Math.ceil(finalCount / finalPageSize) - 1) : 0;
  const finalPageIndex = Math.min(Math.max(0, rawPageIndex), maxPageIndex);

  // Auto-adjust pagination state if page index is out of bounds
  React.useEffect(() => {
    if (finalCount > 0 && rawPageIndex > maxPageIndex) {
      if (onPaginationChange && pagination) {
        onPaginationChange({ ...pagination, pageIndex: maxPageIndex });
      }
    }
  }, [finalCount, rawPageIndex, maxPageIndex, onPaginationChange, pagination]);

  const handlePageChange = (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    if (onPaginationChange && pagination) {
      onPaginationChange({ ...pagination, pageIndex: newPage });
    } else if (onPageChange) {
      onPageChange(event, newPage);
    }
  };

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newPageSize = parseInt(event.target.value, 10);
    if (onPaginationChange && pagination) {
      onPaginationChange({ pageIndex: 0, pageSize: newPageSize });
    } else if (onRowsPerPageChange) {
      onRowsPerPageChange(event as any);
    }
  };

  // Auto add selection column if enabled and not already present
  const columns = React.useMemo(() => {
    if (!enableRowSelection) return userColumns;

    const hasSelectionCol = userColumns.some(
      (col) => col.id === 'select' || (col as any).accessorKey === 'select'
    );
    if (hasSelectionCol) return userColumns;

    const selectionColumn: ColumnDef<TData, unknown> = {
      id: 'select',
      header: ({ table }) => (
        <div className="flex items-center justify-center">
          <input
            type="checkbox"
            className="h-4 w-4 rounded-[3px] border border-slate-300 text-blue-600 focus:ring-blue-500/20 focus:ring-offset-0 cursor-pointer accent-blue-600"
            checked={table.getIsAllPageRowsSelected()}
            ref={(input) => {
              if (input) {
                input.indeterminate =
                  !table.getIsAllPageRowsSelected() && table.getIsSomePageRowsSelected();
              }
            }}
            onChange={table.getToggleAllPageRowsSelectedHandler()}
            disabled={data.length === 0}
            aria-label="Chọn tất cả"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          <input
            type="checkbox"
            className="h-4 w-4 rounded-[3px] border border-slate-300 text-blue-600 focus:ring-blue-500/20 focus:ring-offset-0 cursor-pointer accent-blue-600"
            checked={row.getIsSelected()}
            disabled={!row.getCanSelect()}
            onChange={row.getToggleSelectedHandler()}
            aria-label="Chọn dòng"
          />
        </div>
      ),
      size: 40,
      enableSorting: false,
    };

    return [selectionColumn, ...userColumns];
  }, [enableRowSelection, userColumns, data.length]);

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
    getRowId:
      getRowId ||
      ((row: any, index) =>
        String(
          row?.id ??
            row?.code ??
            row?.slug ??
            row?.uuid ??
            (index !== undefined ? `row-${index}` : '')
        )),
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    manualSorting: !!onSortingChange,
  });

  const displayEmptyMessage = emptyMessage || t('common.table.noData', 'Không có dữ liệu');

  const totalPages = Math.max(1, Math.ceil(finalCount / finalPageSize));
  const pageStartIndex = finalCount > 0 ? finalPageIndex * finalPageSize + 1 : 0;
  const pageEndIndex = Math.min((finalPageIndex + 1) * finalPageSize, finalCount);

  return (
    <div
      className={cn(
        'w-full flex flex-col',
        variant === 'card'
          ? 'border border-slate-200/80 rounded-[4px] bg-white overflow-hidden shadow-2xs'
          : 'overflow-hidden bg-white'
      )}
    >
      {/* Mobile Swipe Cue Banner */}
      <div className="flex md:hidden items-center justify-between px-3 py-1.5 bg-slate-50 border-b border-slate-100 text-[11px] font-medium text-slate-500">
        <span>⇄ Vuốt ngang để xem đủ các cột & thao tác</span>
      </div>

      {/* Table Container */}
      <div
        className="w-full overflow-x-auto relative"
        style={{
          maxHeight: maxHeight ? maxHeight : undefined,
          overflowY: maxHeight ? 'auto' : undefined,
        }}
      >
        <Table className="min-w-[680px]">
          <TableHeader
            className={cn(
              stickyHeader && 'sticky top-0 z-10 bg-slate-50/95 backdrop-blur-xs shadow-xs'
            )}
          >
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const meta = header.column.columnDef.meta as ColumnMeta | undefined;
                  const alignClass = meta?.align ? alignToClass[meta.align] : 'text-left';
                  const canSort = header.column.getCanSort();
                  const isSorted = header.column.getIsSorted();

                  return (
                    <TableHead
                      key={header.id}
                      className={cn(
                        'py-2.5 px-3.5 text-xs font-semibold text-slate-600 select-none',
                        alignClass
                      )}
                    >
                      {header.isPlaceholder ? null : canSort ? (
                        <button
                          type="button"
                          onClick={header.column.getToggleSortingHandler()}
                          className={cn(
                            'group inline-flex items-center gap-1.5 font-semibold text-xs text-slate-600 uppercase tracking-wider hover:text-slate-900 border-0 appearance-none bg-transparent p-0 cursor-pointer',
                            alignClass
                          )}
                          title="Sắp xếp cột"
                        >
                          <span>
                            {flexRender(header.column.columnDef.header, header.getContext())}
                          </span>
                          {isSorted === 'asc' ? (
                            <ArrowUp className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          ) : isSorted === 'desc' ? (
                            <ArrowDown className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          ) : (
                            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 opacity-50 group-hover:opacity-100 shrink-0" />
                          )}
                        </button>
                      ) : (
                        <div
                          className={cn(
                            'font-semibold text-xs text-slate-600 uppercase tracking-wider',
                            alignClass
                          )}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                        </div>
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, rowIndex) => (
                <TableRow key={`skeleton-row-${rowIndex}`} className="hover:bg-transparent">
                  {columns.map((col, colIndex) => (
                    <TableCell key={`skeleton-cell-${colIndex}`} className="py-3 px-3.5">
                      <div
                        className={cn(
                          'h-4.5 bg-slate-100 rounded-[3px] animate-pulse',
                          (col as any).id === 'select'
                            ? 'w-4 h-4 mx-auto'
                            : colIndex === 0
                            ? 'w-3/4'
                            : 'w-1/2'
                        )}
                      />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : data.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() ? 'selected' : undefined}
                  className={cn(
                    'transition-colors hover:bg-slate-50/70',
                    row.getIsSelected() && 'bg-blue-50/40'
                  )}
                >
                  {row.getVisibleCells().map((cell) => {
                    const meta = cell.column.columnDef.meta as ColumnMeta | undefined;
                    const alignClass = meta?.align ? alignToClass[meta.align] : 'text-left';

                    return (
                      <TableCell
                        key={cell.id}
                        className={cn('py-2.5 px-3.5 text-sm text-slate-700', alignClass)}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="py-12 text-center">
                  <div className="flex flex-col items-center justify-center gap-2 text-slate-400">
                    <Inbox className="w-8 h-8 stroke-1 text-slate-300" />
                    <span className="text-sm font-medium text-slate-500">
                      {displayEmptyMessage}
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Modern Pagination Toolbar */}
      {paginationMode === 'visible' && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-slate-200/80 bg-white text-xs text-slate-600">
          <div className="flex items-center gap-3">
            <span>
              {finalCount > 0 ? (
                <>
                  Hiển thị <span className="font-semibold text-slate-900">{pageStartIndex}</span> -{' '}
                  <span className="font-semibold text-slate-900">{pageEndIndex}</span> trong tổng số{' '}
                  <span className="font-semibold text-slate-900">{finalCount}</span> bản ghi
                </>
              ) : (
                'Không có dữ liệu'
              )}
            </span>

            <div className="hidden sm:flex items-center gap-1.5 pl-3 border-l border-slate-200">
              <span className="text-slate-500">Mỗi trang:</span>
              <select
                value={finalPageSize}
                onChange={handleRowsPerPageChange}
                disabled={isLoading}
                className="h-7 px-2 rounded-[3px] border border-slate-200 bg-white text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-600 cursor-pointer disabled:opacity-50"
              >
                {[5, 10, 20, 25, 50].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => handlePageChange(e, finalPageIndex - 1)}
              disabled={finalPageIndex === 0 || isLoading}
              className="h-8 px-2.5 rounded-[4px] text-xs font-medium border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronLeft className="w-3.5 h-3.5 mr-1" />
              Trang trước
            </Button>

            <span className="px-2 py-1 text-xs font-medium text-slate-700">
              Trang <span className="font-semibold">{finalPageIndex + 1}</span> / {totalPages}
            </span>

            <Button
              variant="outline"
              size="sm"
              onClick={(e) => handlePageChange(e, finalPageIndex + 1)}
              disabled={finalPageIndex >= totalPages - 1 || isLoading}
              className="h-8 px-2.5 rounded-[4px] text-xs font-medium border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40"
            >
              Trang sau
              <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
