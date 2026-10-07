'use client';

import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import dayjs from 'dayjs';
import { Eye, BookmarkX, FileText, FileSpreadsheet, MapPin } from 'lucide-react';
import type {
  ColumnDef,
  PaginationState,
  SortingState,
  OnChangeFn,
  RowSelectionState,
} from '@tanstack/react-table';

import { CV_TYPES, ROUTES } from '@/configs/constants';
import { localizeRoutePath } from '@/configs/routeLocalization';
import DataTable from '@/components/Common/DataTable';
import { formatRoute } from '@/utils/funcUtils';
import { formatLocalizedSalaryRange } from '@/utils/customData';
import { tConfig } from '@/utils/tConfig';
import { useConfig } from '@/hooks/useConfig';
import type { ResumeSaved } from '@/types/models';
import { getSavedResumeActionState } from './savedResumeActions';

interface SavedResumeTableProps {
  rows: ResumeSaved[];
  isLoading: boolean;
  handleUnsave: (slug: string) => void;
  rowCount: number;
  pagination: PaginationState;
  onPaginationChange: OnChangeFn<PaginationState>;
  sorting: SortingState;
  onSortingChange: OnChangeFn<SortingState>;
  enableRowSelection?: boolean;
  rowSelection?: RowSelectionState;
  onRowSelectionChange?: OnChangeFn<RowSelectionState>;
  variant?: 'card' | 'flat';
}

const SavedResumeTable: React.FC<SavedResumeTableProps> = (props) => {
  const { t, i18n } = useTranslation(['employer', 'common']);
  const { push } = useRouter();
  const {
    rows,
    isLoading,
    handleUnsave,
    rowCount,
    pagination,
    onPaginationChange,
    sorting,
    onSortingChange,
    enableRowSelection = false,
    rowSelection,
    onRowSelectionChange,
    variant = 'card',
  } = props;
  const { allConfig } = useConfig();

  const columns = useMemo<ColumnDef<ResumeSaved>[]>(
    () => [
      {
        accessorKey: 'resume.title',
        header: t('employer:savedResumeTable.label.resumeTitle'),
        enableSorting: true,
        cell: (info) => (
          <div className="flex items-center gap-2">
            {info.row.original.resume?.type === CV_TYPES.cvWebsite ? (
              <div className="w-7 h-7 rounded-[4px] bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4" />
              </div>
            ) : (
              <div className="w-7 h-7 rounded-[4px] bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
            )}
            <span className="font-semibold text-slate-900 text-sm line-clamp-1">
              {String(info.getValue() ?? '') || (
                <span className="text-slate-400 font-normal italic text-xs">
                  {t('common:notUpdated')}
                </span>
              )}
            </span>
          </div>
        ),
      },
      {
        accessorKey: 'resume.userDict.fullName',
        header: t('employer:savedResumeTable.label.candidateName'),
        enableSorting: true,
        cell: (info) => {
          const name = String(info.getValue() ?? '---');
          const initial = name !== '---' ? name.charAt(0).toUpperCase() : '?';
          return (
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-[3px] bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center shrink-0">
                {initial}
              </div>
              <span className="font-semibold text-slate-800 text-sm">{name}</span>
            </div>
          );
        },
      },
      {
        id: 'salary',
        header: t('employer:savedResumeTable.label.salary'),
        cell: (info) => {
          const str = formatLocalizedSalaryRange(
            info.row.original.resume?.salaryMin,
            info.row.original.resume?.salaryMax,
            i18n.language
          );
          return str ? (
            <span className="font-semibold text-emerald-700 text-xs">{str}</span>
          ) : (
            <span className="text-slate-400 font-normal italic text-xs">
              {t('common:notUpdated')}
            </span>
          );
        },
      },
      {
        accessorKey: 'resume.experience',
        header: t('employer:savedResumeTable.label.experience'),
        cell: (info) => {
          const val = tConfig(allConfig?.experienceDict?.[info.getValue() as number]);
          return val ? (
            <span className="inline-flex items-center px-2 py-0.5 rounded-[3px] text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/80 whitespace-nowrap">
              {val}
            </span>
          ) : (
            <span className="text-slate-400 font-normal italic text-xs">
              {t('common:notUpdated')}
            </span>
          );
        },
      },
      {
        accessorKey: 'resume.city',
        header: t('employer:savedResumeTable.label.cityProvince'),
        cell: (info) => {
          const val = tConfig(allConfig?.cityDict?.[info.getValue() as number]);
          return (
            <div className="flex items-center gap-1 text-slate-600 text-xs">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{val || t('common:notUpdated')}</span>
            </div>
          );
        },
      },
      {
        accessorKey: 'createAt',
        header: t('employer:savedResumeTable.label.savedDate'),
        enableSorting: true,
        cell: (info) => (
          <span className="text-xs text-slate-500 font-medium">
            {info.getValue() ? dayjs(info.getValue() as string).format('DD/MM/YYYY') : '---'}
          </span>
        ),
      },
      {
        id: 'actions',
        header: t('employer:savedResumeTable.label.actions'),
        meta: { align: 'right' },
        cell: (info) => {
          const actionState = getSavedResumeActionState(info.row.original);
          const detailHref = actionState.canView
            ? localizeRoutePath(
                `/${formatRoute(ROUTES.EMPLOYER.PROFILE_DETAIL, actionState.slug)}`,
                i18n.language
              )
            : undefined;

          return (
            <div className="flex items-center justify-end gap-1.5">
              <button
                type="button"
                aria-label="Xem chi tiết"
                title={t('employer:savedResumeTable.title.viewprofile')}
                disabled={!actionState.canView}
                onClick={() => {
                  if (!detailHref) return;
                  push(detailHref);
                }}
                className="w-8 h-8 rounded-[4px] border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-blue-600 flex items-center justify-center transition-colors shadow-2xs disabled:opacity-40 cursor-pointer"
              >
                <Eye className="w-4 h-4" />
              </button>

              <button
                type="button"
                title={t('employer:savedResumeTable.label.unsave')}
                disabled={!actionState.canUnsave}
                onClick={() => {
                  if (!actionState.canUnsave) return;
                  handleUnsave(actionState.slug);
                }}
                className="inline-flex items-center gap-1 h-8 px-2 rounded-[4px] border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold transition-colors disabled:opacity-40 cursor-pointer"
              >
                <BookmarkX className="w-3.5 h-3.5" />
                <span>{t('employer:savedResumeTable.label.unsave')}</span>
              </button>
            </div>
          );
        },
      },
    ],
    [allConfig, handleUnsave, i18n.language, push, t]
  );

  return (
    <DataTable
      variant={variant}
      columns={columns}
      data={rows}
      isLoading={isLoading}
      rowCount={rowCount}
      pagination={pagination}
      onPaginationChange={onPaginationChange}
      enableSorting
      sorting={sorting}
      onSortingChange={onSortingChange}
      enableRowSelection={enableRowSelection}
      rowSelection={rowSelection}
      onRowSelectionChange={onRowSelectionChange}
      emptyMessage={t('employer:savedResumeTable.title.youhaventsavedanycandidatesyet')}
    />
  );
};

export default SavedResumeTable;
