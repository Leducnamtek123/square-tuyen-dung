'use client';

import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import {
  Sparkles,
  ExternalLink,
  Pencil,
  Trash2,
  Users,
  Eye,
  Calendar,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  Briefcase,
  AlertCircle,
} from 'lucide-react';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
  type Updater,
  type PaginationState,
  type RowSelectionState,
  type OnChangeFn,
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
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { useConfig } from '@/hooks/useConfig';
import { JOB_POST_STATUS_BG_COLOR } from '@/configs/constants';
import type { JobPost } from '@/types/models';
import { cn } from '@/lib/utils';

export interface JobPostsTableProps {
  rows: JobPost[];
  isLoading: boolean;
  rowCount: number;
  pagination: PaginationState;
  onPaginationChange: (pagination: PaginationState) => void;
  handleDelete: (slugOrId: string | number) => void;
  handleUpdate: (slugOrId: string | number) => void;
  onOpenAiRecommendation?: (jobPost: JobPost) => void;
  sorting: SortingState;
  onSortingChange: (sorting: Updater<SortingState>) => void;
  enableRowSelection?: boolean;
  rowSelection?: RowSelectionState;
  onRowSelectionChange?: OnChangeFn<RowSelectionState>;
  variant?: 'card' | 'flat';
  stickyHeader?: boolean;
  maxHeight?: number | string;
  onClearFilters?: () => void;
  hasActiveFilters?: boolean;
}

const JobPostsTable = ({
  rows,
  isLoading,
  rowCount,
  pagination,
  onPaginationChange,
  handleDelete,
  handleUpdate,
  onOpenAiRecommendation,
  sorting,
  onSortingChange,
  enableRowSelection = false,
  rowSelection,
  onRowSelectionChange,
  onClearFilters,
  hasActiveFilters = false,
}: JobPostsTableProps) => {
  const { t, i18n } = useTranslation('employer');
  const { allConfig } = useConfig();

  const columns = useMemo<ColumnDef<JobPost>[]>(() => {
    const cols: ColumnDef<JobPost>[] = [];

    if (enableRowSelection) {
      cols.push({
        id: 'selection',
        header: ({ table }) => (
          <div className="flex items-center justify-center">
            <Checkbox
              checked={
                table.getIsAllPageRowsSelected() ||
                (table.getIsSomePageRowsSelected() && 'indeterminate')
              }
              onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
              aria-label="Chọn tất cả"
              className="rounded-[3px] border-slate-300"
            />
          </div>
        ),
        cell: ({ row }) => (
          <div className="flex items-center justify-center">
            <Checkbox
              checked={row.getIsSelected()}
              disabled={!row.getCanSelect()}
              onCheckedChange={(value) => row.toggleSelected(!!value)}
              aria-label="Chọn dòng"
              className="rounded-[3px] border-slate-300"
            />
          </div>
        ),
        size: 40,
        enableSorting: false,
      });
    }

    cols.push(
      {
        header: t('jobPost.table.jobTitle'),
        accessorKey: 'jobName',
        enableSorting: true,
        cell: ({ row }) => {
          const job = row.original;
          const title = job.jobName || (job as any).title || '---';
          const isUrgent = Boolean(job.isUrgent);

          return (
            <div className="flex items-center gap-2 py-0.5">
              <span
                onClick={() => handleUpdate(job.slug || job.id)}
                className="font-semibold text-slate-900 hover:text-blue-600 transition-colors cursor-pointer text-sm leading-snug"
              >
                {title}
              </span>
              {isUrgent && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-[3px] text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 tracking-wider uppercase shrink-0">
                  {t('jobPost.urgent')}
                </span>
              )}
            </div>
          );
        },
      },
      {
        header: 'Gợi ý hồ sơ bởi AI',
        id: 'aiRecommendation',
        cell: ({ row }) => {
          const job = row.original;
          const totalCount = job.aiRecommendedCount ?? (job as any).ai_recommended_count ?? 0;
          const rawAvatars = (job.aiRecommendedAvatars ||
            (job as any).ai_recommended_avatars ||
            []) as Array<{ name?: string; initial?: string; avatarUrl?: string | null }>;

          if (totalCount === 0) {
            return (
              <span
                onClick={() => onOpenAiRecommendation?.(job)}
                className="text-xs text-slate-400 italic hover:text-blue-600 cursor-pointer block text-center"
              >
                --
              </span>
            );
          }

          const avatars = rawAvatars;
          const remainingCount = Math.max(0, totalCount - avatars.length);

          return (
            <div
              onClick={() => onOpenAiRecommendation?.(job)}
              className="group inline-flex flex-col items-start cursor-pointer py-1"
            >
              {avatars.length > 0 ? (
                <div className="flex items-center -space-x-1.5 mb-1 transition-transform group-hover:scale-105 duration-150">
                  {avatars.slice(0, 3).map((item, idx) => (
                    <div
                      key={`avt-${job.id}-${idx}`}
                      className="w-6 h-6 rounded-[3px] border border-white bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-700 shadow-2xs overflow-hidden"
                      title={item.name}
                    >
                      {item.avatarUrl ? (
                        <img
                          src={item.avatarUrl}
                          alt={item.name || 'Candidate'}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        item.initial || 'U'
                      )}
                    </div>
                  ))}
                  {remainingCount > 0 && (
                    <div className="w-6 h-6 rounded-[3px] border border-white bg-slate-700 text-white flex items-center justify-center text-[10px] font-bold shadow-2xs">
                      +{remainingCount}
                    </div>
                  )}
                </div>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[3px] bg-blue-50 text-blue-700 border border-blue-200/80 text-xs font-semibold mb-1 group-hover:bg-blue-100 transition-colors">
                  <Sparkles className="w-3 h-3 text-blue-600" />
                  {totalCount} gợi ý
                </span>
              )}
              <span className="text-[11px] font-medium text-blue-600 group-hover:underline">
                Xem danh sách
              </span>
            </div>
          );
        },
      },
      {
        header: t('jobPost.table.postDate'),
        accessorKey: 'createAt',
        enableSorting: true,
        cell: (info) => (
          <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5 whitespace-nowrap">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            {info.getValue() ? dayjs(info.getValue() as string).format('DD/MM/YYYY') : '---'}
          </span>
        ),
      },
      {
        header: t('jobPost.table.deadline'),
        accessorKey: 'deadline',
        enableSorting: true,
        cell: ({ row }) => {
          const val = row.original.deadline;
          const isExpired = Boolean(row.original.isExpired);
          if (!val) return <span className="text-xs text-slate-400">---</span>;

          return (
            <span
              className={cn(
                'inline-flex items-center px-2 py-0.5 rounded-[3px] text-xs font-medium border whitespace-nowrap',
                isExpired
                  ? 'bg-rose-50 text-rose-700 border-rose-200/80'
                  : 'bg-slate-50 text-slate-700 border-slate-200'
              )}
            >
              {dayjs(val).format('DD/MM/YYYY')}
            </span>
          );
        },
      },
      {
        header: t('jobPost.table.applications'),
        accessorKey: 'appliedNumber',
        enableSorting: true,
        cell: (info) => (
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-sm font-semibold text-blue-600">
              {Number(info.getValue() ?? 0)}
            </span>
          </div>
        ),
      },
      {
        header: t('jobPost.table.views'),
        accessorKey: 'views',
        enableSorting: true,
        cell: (info) => (
          <div className="flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-sm font-medium text-slate-600">
              {Number(info.getValue() ?? 0)}
            </span>
          </div>
        ),
      },
      {
        header: t('jobPost.table.status'),
        accessorKey: 'status',
        cell: (info) => {
          const raw = String(info.getValue() ?? '').trim();
          const lower = raw.toLowerCase();
          const isEn = Boolean(i18n?.language && i18n.language.startsWith('en'));

          const STATUS_MAP: Record<
            string,
            { labelVi: string; labelEn: string; bg: string; text: string; border: string; dot: string }
          > = {
            '1': {
              labelVi: 'Chờ duyệt',
              labelEn: 'Pending',
              bg: 'bg-amber-50',
              text: 'text-amber-800',
              border: 'border-amber-200/80',
              dot: 'bg-amber-500',
            },
            pending: {
              labelVi: 'Chờ duyệt',
              labelEn: 'Pending',
              bg: 'bg-amber-50',
              text: 'text-amber-800',
              border: 'border-amber-200/80',
              dot: 'bg-amber-500',
            },
            '2': {
              labelVi: 'Bị từ chối',
              labelEn: 'Rejected',
              bg: 'bg-rose-50',
              text: 'text-rose-800',
              border: 'border-rose-200/80',
              dot: 'bg-rose-500',
            },
            rejected: {
              labelVi: 'Bị từ chối',
              labelEn: 'Rejected',
              bg: 'bg-rose-50',
              text: 'text-rose-800',
              border: 'border-rose-200/80',
              dot: 'bg-rose-500',
            },
            '3': {
              labelVi: 'Đã duyệt',
              labelEn: 'Approved',
              bg: 'bg-emerald-50',
              text: 'text-emerald-800',
              border: 'border-emerald-200/80',
              dot: 'bg-emerald-500',
            },
            approved: {
              labelVi: 'Đã duyệt',
              labelEn: 'Approved',
              bg: 'bg-emerald-50',
              text: 'text-emerald-800',
              border: 'border-emerald-200/80',
              dot: 'bg-emerald-500',
            },
          };

          const mapped = STATUS_MAP[raw] || STATUS_MAP[lower];
          const label = mapped
            ? isEn
              ? mapped.labelEn
              : mapped.labelVi
            : allConfig?.jobPostStatusDict?.[raw] || raw.toUpperCase() || '---';

          const style = mapped || {
            bg: 'bg-slate-50',
            text: 'text-slate-700',
            border: 'border-slate-200',
            dot: 'bg-slate-400',
          };

          return (
            <span
              className={cn(
                'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[3px] text-xs font-semibold border whitespace-nowrap',
                style.bg,
                style.text,
                style.border
              )}
            >
              <span className={cn('h-1.5 w-1.5 rounded-[1px] shrink-0', style.dot)} />
              {label}
            </span>
          );
        },
      },
      {
        id: 'actions',
        header: () => <span className="sr-only">Thao tác</span>,
        cell: ({ row }) => {
          const job = row.original;
          const idOrSlug = job.slug || job.id;

          return (
            <div className="flex items-center justify-end gap-1.5">
              {job.slug && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => window.open(`/jobs/${job.slug}`, '_blank')}
                  title="Xem tin đăng tuyển"
                  aria-label="Xem tin đăng tuyển"
                  className="h-7 w-7 rounded-[4px] border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 text-slate-500 hover:text-blue-600 shadow-2xs cursor-pointer"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </Button>
              )}
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleUpdate(idOrSlug)}
                title={t('jobPost.tooltips.update')}
                aria-label={t('jobPost.tooltips.update')}
                className="h-7 w-7 rounded-[4px] border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 text-slate-500 hover:text-blue-600 shadow-2xs cursor-pointer"
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleDelete(idOrSlug)}
                title={t('jobPost.tooltips.delete')}
                aria-label={t('jobPost.tooltips.delete')}
                className="h-7 w-7 rounded-[4px] border-slate-200 bg-white hover:bg-rose-50 hover:border-rose-200 text-slate-500 hover:text-rose-600 shadow-2xs cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          );
        },
      }
    );

    return cols;
  }, [allConfig, enableRowSelection, handleDelete, handleUpdate, onOpenAiRecommendation, t, i18n]);

  const totalPages = Math.max(1, Math.ceil(rowCount / (pagination.pageSize || 10)));

  const table = useReactTable({
    data: rows,
    columns,
    pageCount: totalPages,
    state: {
      pagination,
      sorting: sorting ?? [],
      rowSelection: rowSelection ?? {},
    },
    enableRowSelection,
    enableSorting: true,
    onSortingChange,
    onRowSelectionChange,
    getRowId: (row: any, index) =>
      String(row?.id ?? row?.code ?? row?.slug ?? row?.uuid ?? `row-${index}`),
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: !!onSortingChange,
  });

  const pageStartIndex = pagination.pageIndex * pagination.pageSize + 1;
  const pageEndIndex = Math.min((pagination.pageIndex + 1) * pagination.pageSize, rowCount);

  return (
    <div className="w-full space-y-3">
      {/* Table Container */}
      <div className="rounded-[4px] border border-slate-200/80 bg-white shadow-2xs overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-slate-50/75">
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  const sortDirection = header.column.getIsSorted();

                  return (
                    <TableHead
                      key={header.id}
                      className={cn(
                        'text-xs font-semibold text-slate-600',
                        canSort && 'cursor-pointer select-none hover:text-slate-900'
                      )}
                      onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                    >
                      <div className="flex items-center gap-1.5">
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                        {canSort && (
                          <span className="text-slate-400">
                            {sortDirection === 'asc' ? (
                              <ArrowUp className="w-3.5 h-3.5 text-blue-600" />
                            ) : sortDirection === 'desc' ? (
                              <ArrowDown className="w-3.5 h-3.5 text-blue-600" />
                            ) : (
                              <ArrowUpDown className="w-3 h-3 opacity-60 hover:opacity-100" />
                            )}
                          </span>
                        )}
                      </div>
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {isLoading ? (
              Array.from({ length: Math.min(5, pagination.pageSize || 5) }).map((_, index) => (
                <TableRow key={`loading-row-${index}`}>
                  {columns.map((_, colIndex) => (
                    <TableCell key={`loading-col-${colIndex}`}>
                      <Skeleton className="h-5 w-full rounded-[3px] bg-slate-100" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-44 text-center">
                  <div className="flex flex-col items-center justify-center gap-2 text-slate-500 py-4">
                    <div className="w-10 h-10 rounded-[4px] bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <p className="text-sm font-semibold text-slate-800">
                      {t('jobPost.noData')}
                    </p>
                    <p className="text-xs text-slate-500 max-w-sm">
                      {hasActiveFilters
                        ? 'Không tìm thấy tin tuyển dụng nào phù hợp với bộ lọc hiện tại.'
                        : 'Bạn chưa tạo tin tuyển dụng nào. Hãy bắt đầu đăng tin để tiếp cận ứng viên.'}
                    </p>
                    {hasActiveFilters && onClearFilters && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={onClearFilters}
                        className="mt-1 h-8 px-3 rounded-[4px] text-xs font-semibold border-blue-200 text-blue-600 bg-blue-50/50 hover:bg-blue-100/60 cursor-pointer shadow-2xs"
                      >
                        Xóa bộ lọc (Xem lại tất cả tin đăng)
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className="hover:bg-slate-50/70 border-b border-slate-100 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-2.5">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Modern SaaS Pagination Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-1 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <span>
            {rowCount > 0 ? (
              <>
                Hiển thị <span className="font-semibold text-slate-900">{pageStartIndex}</span> -{' '}
                <span className="font-semibold text-slate-900">{pageEndIndex}</span> trong tổng số{' '}
                <span className="font-semibold text-slate-900">{rowCount}</span> tin
              </>
            ) : (
              'Không có dữ liệu'
            )}
          </span>

          <div className="hidden md:flex items-center gap-1.5 ml-4 pl-4 border-l border-slate-200">
            <span className="text-slate-500">Hiển thị mỗi trang:</span>
            <select
              value={pagination.pageSize}
              onChange={(e) => {
                onPaginationChange({
                  pageIndex: 0,
                  pageSize: Number(e.target.value),
                });
              }}
              className="h-7 px-2 rounded-[3px] border border-slate-200 bg-white text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-600 cursor-pointer"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (pagination.pageIndex > 0) {
                onPaginationChange({
                  ...pagination,
                  pageIndex: pagination.pageIndex - 1,
                });
              }
            }}
            disabled={pagination.pageIndex === 0 || isLoading}
            className="h-8 px-2.5 rounded-[4px] text-xs font-medium border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40"
          >
            <ChevronLeft className="w-3.5 h-3.5 mr-1" />
            Trang trước
          </Button>

          <span className="px-2 py-1 text-xs font-medium text-slate-700">
            Trang <span className="font-semibold">{pagination.pageIndex + 1}</span> / {totalPages}
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (pagination.pageIndex < totalPages - 1) {
                onPaginationChange({
                  ...pagination,
                  pageIndex: pagination.pageIndex + 1,
                });
              }
            }}
            disabled={pagination.pageIndex >= totalPages - 1 || isLoading}
            className="h-8 px-2.5 rounded-[4px] text-xs font-medium border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40"
          >
            Trang sau
            <ChevronRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default JobPostsTable;