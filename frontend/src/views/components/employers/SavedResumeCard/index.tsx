'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import dayjs from '@/configs/dayjs-config';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { Bookmark, Upload, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import BackdropLoading from '@/components/Common/Loading/BackdropLoading';
import SavedResumeTable from '../SavedResumeTable';
import { useSavedResumes, useToggleSaveResume } from '../hooks/useEmployerQueries';
import resumeSavedService from '@/services/resumeSavedService';
import { useDataTable } from '@/hooks';
import toastMessages from '@/utils/toastMessages';
import { confirmModal } from '@/utils/sweetalert2Modal';
import type { OnChangeFn, PaginationState, SortingState, RowSelectionState } from '@tanstack/react-table';
import { ExportModal, type ExportColumn, type ExportScope } from '@/components/Common/ExportModal';
import { ImportModal } from '@/components/Common/ImportModal';
import { useConfig } from '@/hooks/useConfig';
import {
  useGlobalFilter,
  GlobalFilterBar,
  GlobalFilterDrawer,
  ActiveFilterChips,
  savedResumeFilterConfig,
} from '@/components/Common/Filters';

interface SavedResumeCardProps {
  title: string;
}

const SavedResumeCard: React.FC<SavedResumeCardProps> = ({ title }) => {
  const { t } = useTranslation(['employer', 'common']);
  const { allConfig } = useConfig();

  const {
    page,
    pageSize,
    sorting,
    onSortingChange,
    ordering,
    pagination,
    onPaginationChange,
  } = useDataTable({
    initialSorting: [{ id: 'createAt', desc: true }],
    initialPageSize: 10,
  });

  const {
    appliedValues,
    draftValues,
    drawerOpen,
    setDrawerOpen,
    activeFilterCount,
    activeTags,
    handleApply,
    handleReset,
    handleRemoveTag,
  } = useGlobalFilter<Record<string, any>>({
    config: savedResumeFilterConfig,
    allConfig,
    onApply: () => {
      onPaginationChange({ pageIndex: 0, pageSize });
    },
    onReset: () => {
      onPaginationChange({ pageIndex: 0, pageSize });
    },
  });

  const { control, reset, handleSubmit } = useForm<Record<string, any>>({
    defaultValues: draftValues,
  });

  useEffect(() => {
    reset(draftValues);
  }, [draftValues, reset]);

  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const queryParams = useMemo(
    () => ({
      page: page + 1,
      pageSize,
      ordering,
      ...appliedValues,
    }),
    [page, pageSize, ordering, appliedValues]
  );

  const { data: queryData, isLoading } = useSavedResumes(queryParams);
  const { toggleSaveResume } = useToggleSaveResume();

  const resumes = queryData?.results || [];
  const count = queryData?.count || 0;

  const handleUnsave = useCallback(
    (slug: string) => {
      confirmModal(
        async () => {
          try {
            await toggleSaveResume(slug);
            toastMessages.success(t('employer:savedResume.messages.unsaveSuccess'));
          } catch (error) {
            // error handling in hook
          }
        },
        t('employer:savedResume.confirmUnsaveTitle'),
        t('employer:savedResume.confirmUnsaveMessage'),
        'warning'
      );
    },
    [toggleSaveResume, t]
  );

  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);

  const savedResumeExportColumns: ExportColumn[] = useMemo(
    () => [
      {
        id: 'candidateName',
        label: t('employer:savedResume.columns.candidateName'),
        checked: true,
        getValue: (item: any) =>
          item.resume?.jobSeekerProfile?.fullName ||
          item.resume?.jobSeekerProfile?.user?.fullName ||
          '---',
      },
      {
        id: 'jobTitle',
        label: t('employer:savedResume.columns.jobTitle'),
        checked: true,
        getValue: (item: any) => item.resume?.title || '---',
      },
      {
        id: 'experience',
        label: t('employer:savedResume.columns.experience'),
        checked: true,
        getValue: (item: any) => {
          const exp = item.resume?.experience;
          if (!exp) return t('common:notUpdated');
          if (typeof exp === 'object') return exp.name || t('common:notUpdated');
          return exp;
        },
      },
      {
        id: 'city',
        label: t('employer:savedResume.columns.city'),
        checked: true,
        getValue: (item: any) => {
          const city = item.resume?.city;
          if (!city) return t('common:notUpdated');
          if (typeof city === 'object') return city.name || t('common:notUpdated');
          return city;
        },
      },
      {
        id: 'savedAt',
        label: t('employer:savedResume.columns.savedAt'),
        checked: true,
        getValue: (item: any) =>
          item.createAt ? dayjs(item.createAt).format('DD/MM/YYYY HH:mm') : '---',
      },
    ],
    [t]
  );

  const handleFetchSavedResumesExportData = useCallback(
    async (scope: ExportScope) => {
      if (scope === 'selected') {
        const selectedIndexes = Object.keys(rowSelection).map(Number);
        return selectedIndexes.map((idx) => resumes[idx]).filter(Boolean);
      }
      const res = await resumeSavedService.getResumesSaved({
        page: 1,
        pageSize: scope === 'all' ? 1000 : pageSize,
        ordering,
        ...appliedValues,
      });
      return res?.results || [];
    },
    [rowSelection, resumes, ordering, appliedValues, pageSize]
  );

  return (
    <div className="w-full">
      <BackdropLoading open={isLoading && resumes.length === 0} />

      <div className="w-full rounded-[4px] border border-slate-200/80 bg-white p-5 md:p-6 shadow-2xs space-y-4">
        {/* Row 1: Header Section (Title + Subtitle on Left, Actions on Right) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[4px] bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Bookmark className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h1>
              <p className="text-xs text-slate-500 font-normal mt-0.5">
                {t('employer:savedResume.subtitle')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setImportModalOpen(true)}
              className="h-9 px-3 rounded-[4px] border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              <Upload className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
              Nhập Excel/CSV
            </Button>
            <Button
              size="sm"
              onClick={() => setExportModalOpen(true)}
              className="h-9 px-3.5 rounded-[4px] bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs"
            >
              <Download className="w-3.5 h-3.5 mr-1.5" />
              {t('employer:savedResume.downloadList')}
            </Button>
          </div>
        </div>

        {/* Row 2: Global Filter Bar */}
        <GlobalFilterBar
          control={control}
          handleSubmit={handleSubmit}
          handleSearchSubmit={(data) => handleApply(data)}
          cityOptions={allConfig?.cityOptions || []}
          searchPlaceholder={t('employer:savedResumeFilterForm.placeholder.enterjobpostorcandidatename')}
          cityPlaceholder={t('employer:savedResumeFilterForm.placeholder.selectlocation')}
          onOpenFilterDrawer={() => setDrawerOpen(true)}
          activeFilterCount={activeFilterCount}
        />

        {/* Row 3: Active Filter Chips */}
        <ActiveFilterChips
          tags={activeTags}
          onRemoveTag={handleRemoveTag}
          onClearAll={handleReset}
        />

        {/* Global Filter Drawer Standard */}
        <GlobalFilterDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          config={savedResumeFilterConfig}
          control={control}
          allConfig={allConfig}
          handleReset={handleReset}
          handleSubmit={handleSubmit}
          handleApply={(data) => handleApply(data)}
        />

        {/* Row 4: Modern Table Content */}
        <div className="w-full overflow-hidden">
          <SavedResumeTable
            variant="flat"
            isLoading={isLoading}
            rows={resumes}
            rowCount={count}
            pagination={pagination}
            onPaginationChange={onPaginationChange as OnChangeFn<PaginationState>}
            sorting={sorting}
            onSortingChange={onSortingChange as OnChangeFn<SortingState>}
            handleUnsave={handleUnsave}
            enableRowSelection
            rowSelection={rowSelection}
            onRowSelectionChange={setRowSelection as OnChangeFn<RowSelectionState>}
          />
        </div>
      </div>

      {/* Export Modal */}
      <ExportModal
        open={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        columns={savedResumeExportColumns}
        fetchData={handleFetchSavedResumesExportData}
        totalRecords={{
          all: count,
          filtered: count,
          selected: Object.keys(rowSelection).filter((k) => rowSelection[k]).length,
        }}
      />

      {/* Import Modal */}
      <ImportModal
        open={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        entity="candidate"
        title="Nhập hồ sơ ứng viên (Candidate Import)"
      />
    </div>
  );
};

export default SavedResumeCard;
