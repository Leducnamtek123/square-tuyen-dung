'use client';

import React, { useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import dayjs from '@/configs/dayjs-config';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import type { RowSelectionState } from '@tanstack/react-table';
import {
  Briefcase,
  Plus,
  Download,
  Upload,
  Search,
  SlidersHorizontal,
  X,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import toastMessages from '@/utils/toastMessages';
import { confirmModal } from '@/utils/sweetalert2Modal';
import BackdropLoading from '@/components/Common/Loading/BackdropLoading';
import jobService from '@/services/jobService';
import JobPostsTable from '../JobPostsTable';
import { useDataTable } from '@/hooks';
import { useCompanyProfile, useEmployerJobPosts, useJobPostMutations } from '../hooks/useEmployerQueries';
import { useConfig } from '@/hooks/useConfig';
import {
  GlobalFilterDrawer,
  jobPostFilterConfig,
  useGlobalFilter,
} from '@/components/Common/Filters';
import { ExportModal, type ExportColumn, type ExportScope } from '@/components/Common/ExportModal';
import { ImportModal } from '@/components/Common/ImportModal';
import { ROUTES } from '@/configs/constants';
import { localizeRoutePath } from '@/configs/routeLocalization';
import AiCandidateRecommendationModal from '../AiCandidateRecommendationModal';

const JobPostCard = () => {
  const router = useRouter();
  const { t, i18n } = useTranslation('employer');
  const { allConfig } = useConfig();
  const verificationHref = localizeRoutePath(`/${ROUTES.EMPLOYER.VERIFICATION}`, i18n.language);
  const [aiModalOpen, setAiModalOpen] = React.useState(false);
  const [selectedAiJob, setSelectedAiJob] = React.useState<any>(null);

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

  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});

  const filter = useGlobalFilter({
    config: jobPostFilterConfig,
    allConfig,
    onApply: () => {
      onPaginationChange({ pageIndex: 0, pageSize });
    },
    onReset: () => {
      onPaginationChange({ pageIndex: 0, pageSize });
    },
  });

  const { control, handleSubmit, reset, register, setValue } = useForm<any>({
    defaultValues: filter.appliedValues,
  });

  // Sync react-hook-form when filter values change externally
  React.useEffect(() => {
    reset(filter.appliedValues);
  }, [filter.appliedValues, reset]);

  const activeUrgentVal = useMemo(() => {
    const raw = filter.appliedValues.isUrgent;
    if (raw === 'true' || raw === true || raw === 1 || raw === '1') return true;
    if (raw === 'false' || raw === false || raw === 2 || raw === '2') return false;
    return undefined;
  }, [filter.appliedValues.isUrgent]);

  // Data Fetching & Mutations
  const { data, isLoading } = useEmployerJobPosts({
    page: page + 1,
    pageSize,
    ordering,
    kw: filter.appliedValues.kw || undefined,
    careerId: filter.appliedValues.careerId || undefined,
    cityId: filter.appliedValues.cityId || undefined,
    positionId: filter.appliedValues.positionId || undefined,
    experienceId: filter.appliedValues.experienceId || undefined,
    typeOfWorkplaceId: filter.appliedValues.typeOfWorkplaceId || undefined,
    jobTypeId: filter.appliedValues.jobTypeId || undefined,
    genderId: filter.appliedValues.genderId || undefined,
    isUrgent: activeUrgentVal,
    statusId: filter.appliedValues.statusId,
  });

  const { deleteJobPost, isMutating } = useJobPostMutations();
  const { data: companyProfile } = useCompanyProfile();
  const isCompanyVerified = Boolean(companyProfile?.isVerified);
  const isCreateBlocked = Boolean(companyProfile) && !isCompanyVerified;

  const createJobPostHref = localizeRoutePath(`/${ROUTES.EMPLOYER.JOB_POST_CREATE}`, i18n.language);

  const handleShowUpdate = useCallback(
    (slugOrId: string | number) => {
      const editRoute = localizeRoutePath(
        `/${ROUTES.EMPLOYER.JOB_POST}/${slugOrId}/edit`,
        i18n.language
      );
      router.push(editRoute);
    },
    [router, i18n.language]
  );

  const handleShowAdd = useCallback(() => {
    if (isCreateBlocked) return;
    router.push(createJobPostHref);
  }, [isCreateBlocked, router, createJobPostHref]);

  const handleDelete = useCallback(
    (slugOrId: string | number) => {
      confirmModal(
        async () => {
          try {
            await deleteJobPost(slugOrId);
            toastMessages.success(t('jobPost.delete.success'));
          } catch (error) {
            // Error handled by mutation hook
          }
        },
        t('jobPost.delete.title'),
        t('jobPost.delete.confirm'),
        'warning'
      );
    },
    [deleteJobPost, t]
  );

  const [exportModalOpen, setExportModalOpen] = React.useState(false);
  const [importModalOpen, setImportModalOpen] = React.useState(false);

  const jobPostExportColumns: ExportColumn[] = React.useMemo(
    () => [
      {
        id: 'title',
        label: t('jobPost.table.title'),
        checked: true,
        getValue: (row) => row['Chức Danh'] || row.jobName || row.title || '---',
      },
      {
        id: 'createdDate',
        label: t('jobPost.table.createdDate'),
        checked: true,
        getValue: (row) => {
          const val = row['Ngày Đăng'] || row.createAt || row.createdDate;
          return val ? dayjs(val).format('DD/MM/YYYY') : '---';
        },
      },
      {
        id: 'deadline',
        label: t('jobPost.table.deadline'),
        checked: true,
        getValue: (row) => {
          const val = row['Ngày Hết Hạn'] || row.deadline;
          return val ? dayjs(val).format('DD/MM/YYYY') : '---';
        },
      },
      {
        id: 'status',
        label: t('jobPost.table.status'),
        checked: true,
        getValue: (row) => row['Trạng thái'] || row.status || '---',
      },
      {
        id: 'applicationsCount',
        label: t('jobPost.table.applications'),
        checked: true,
        getValue: (row) =>
          row['Số Hồ Sơ Ứng Tuyển'] != null
            ? String(row['Số Hồ Sơ Ứng Tuyển'])
            : row.appliedNumber != null
            ? String(row.appliedNumber)
            : row.applicationsCount != null
            ? String(row.applicationsCount)
            : '0',
      },
      {
        id: 'creator',
        label: t('jobPost.table.creator'),
        checked: true,
        getValue: (row) => row['Người tạo'] || row.creator || '---',
      },
    ],
    [t]
  );

  const handleFetchJobPostsExportData = useCallback(
    async (scope: ExportScope) => {
      const params = {
        page: 1,
        pageSize: scope === 'all' ? 1000 : pageSize,
        ordering,
        kw: scope === 'all' ? undefined : filter.appliedValues.kw || undefined,
        isUrgent: scope === 'all' ? undefined : activeUrgentVal,
        status:
          scope === 'all'
            ? undefined
            : filter.appliedValues.statusId === ''
            ? undefined
            : filter.appliedValues.statusId,
      };
      const resData = await jobService.exportEmployerJobPosts(params);
      const exportList = (resData || []) as Record<string, any>[];
      if (scope === 'selected') {
        const selectedIds = Object.keys(rowSelection).filter((id) => rowSelection[id]);
        if (selectedIds.length === 0) return [];
        const filtered = exportList.filter((item) => {
          const itemId = String(item.id ?? item.ID ?? item['Mã Việc Làm'] ?? item.slug ?? '');
          return selectedIds.includes(itemId);
        });
        if (filtered.length > 0) return filtered;
        const currentList = data?.results || [];
        return currentList.filter((item: any) => selectedIds.includes(String(item.id ?? item.slug)));
      }
      return exportList;
    },
    [pageSize, ordering, filter.appliedValues, activeUrgentVal, rowSelection, data?.results]
  );

  const handleSearchFormSubmit = (formData: any) => {
    filter.handleApply(formData);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setValue('statusId', val);
    const updated = { ...filter.appliedValues, statusId: val };
    reset(updated);
    filter.handleApply(updated);
  };

  const handleClearFilters = () => {
    reset(jobPostFilterConfig.defaultValues);
    filter.handleReset();
  };

  return (
    <div className="w-full">
      {/* Main Container Card */}
      <div className="w-full bg-white border border-slate-200/80 rounded-[4px] shadow-2xs p-4 md:p-6 space-y-4">
        {/* Header Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[4px] bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base md:text-lg font-bold text-slate-900 tracking-tight">
                {t('jobPost.title')}
              </h1>
              <p className="text-xs text-slate-500">
                {t('jobPost.manageSubtitle')}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setImportModalOpen(true)}
              className="h-8.5 px-3 rounded-[4px] text-xs font-medium border-slate-200 text-slate-700 hover:bg-slate-50 gap-1.5 shadow-2xs cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-slate-500" />
              Nhập Excel/CSV
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setExportModalOpen(true)}
              className="h-8.5 px-3 rounded-[4px] text-xs font-medium border-slate-200 text-slate-700 hover:bg-slate-50 gap-1.5 shadow-2xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              {t('jobPost.exportList')}
            </Button>

            <Button
              size="sm"
              onClick={handleShowAdd}
              disabled={isCreateBlocked}
              className="h-8.5 px-3.5 rounded-[4px] text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white gap-1.5 shadow-2xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              {t('jobPost.createNew')}
            </Button>
          </div>
        </div>

        {/* 1-Line Compact Filter Bar */}
        <form onSubmit={handleSubmit(handleSearchFormSubmit)} className="space-y-2.5">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                {...register('kw')}
                type="text"
                placeholder={t('jobPost.filters.keywordsPlaceholder')}
                className="w-full h-9 pl-9 pr-3 rounded-[4px] border border-slate-200 bg-white text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 transition-colors"
              />
            </div>

            {/* Status Select Dropdown */}
            <div className="w-full sm:w-48 shrink-0">
              <select
                {...register('statusId')}
                onChange={handleStatusChange}
                className="w-full h-9 px-3 rounded-[4px] border border-slate-200 bg-white text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 cursor-pointer"
              >
                <option value="">{t('jobPost.filters.statusPlaceholder')}</option>
                <option value="3">Đã duyệt</option>
                <option value="1">Chờ duyệt</option>
                <option value="2">Bị từ chối</option>
              </select>
            </div>

            {/* Filter Drawer Toggle */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => filter.setDrawerOpen(true)}
              className="h-9 px-3 rounded-[4px] text-xs font-medium border-slate-200 text-slate-700 hover:bg-slate-50 gap-1.5 cursor-pointer shrink-0"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
              {t('jobPost.filter')}
              {filter.activeFilterCount > 0 && (
                <span className="w-4.5 h-4.5 rounded-[3px] bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center ml-0.5">
                  {filter.activeFilterCount}
                </span>
              )}
            </Button>

            {/* Search Submit Button */}
            <Button
              type="submit"
              size="sm"
              className="h-9 px-4 rounded-[4px] text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white gap-1.5 cursor-pointer shrink-0 shadow-2xs"
            >
              <Search className="w-3.5 h-3.5" />
              {t('jobPost.filters.search')}
            </Button>
          </div>

          {/* Active Filter Tags */}
          {filter.activeTags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 py-1.5 px-2.5 rounded-[4px] bg-slate-50 border border-slate-200/80 text-xs">
              <span className="font-semibold text-slate-500 uppercase tracking-wider text-[10px] mr-1">
                Đang lọc ({filter.activeTags.length}):
              </span>
              {filter.activeTags.map((tag) => (
                <span
                  key={tag.key}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[3px] bg-blue-50 text-blue-800 border border-blue-200/80 text-xs font-medium"
                >
                  <span>
                    {tag.label}: <strong className="font-semibold">{tag.valueLabel}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      reset({ ...filter.appliedValues, [tag.key]: '' });
                      filter.handleRemoveTag(tag.key);
                    }}
                    className="border-0 bg-transparent p-0 text-blue-500 hover:text-blue-800 transition-colors ml-0.5 cursor-pointer flex items-center justify-center"
                    aria-label="Xóa bộ lọc"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="h-6 px-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 text-xs font-semibold ml-2 rounded-[3px] cursor-pointer"
              >
                <RotateCcw className="w-3 h-3 mr-1" />
                Xóa tất cả
              </Button>
            </div>
          )}
        </form>

        {/* Company Verification Warning */}
        {isCreateBlocked ? (
          <div className="rounded-[4px] border border-amber-200 bg-amber-50/80 p-3 flex items-center justify-between text-xs text-amber-900">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{t('jobPost.verificationRequired.message')}</span>
            </div>
            <a
              href={verificationHref}
              className="font-semibold underline hover:text-amber-950 shrink-0 ml-3"
            >
              {t('jobPost.verificationRequired.action')}
            </a>
          </div>
        ) : null}

        {/* Job Posts Table */}
        <JobPostsTable
          variant="flat"
          rows={data?.results || []}
          isLoading={isLoading}
          rowCount={data?.count || 0}
          pagination={pagination}
          onPaginationChange={onPaginationChange}
          sorting={sorting}
          onSortingChange={onSortingChange}
          handleDelete={handleDelete}
          handleUpdate={handleShowUpdate}
          onOpenAiRecommendation={(job) => {
            setSelectedAiJob(job);
            setAiModalOpen(true);
          }}
          enableRowSelection
          rowSelection={rowSelection}
          onRowSelectionChange={setRowSelection}
          onClearFilters={handleClearFilters}
          hasActiveFilters={filter.activeTags.length > 0 || Boolean(filter.appliedValues.statusId)}
        />
      </div>

      {/* Global Filter Drawer */}
      <GlobalFilterDrawer
        open={filter.drawerOpen}
        onClose={() => filter.setDrawerOpen(false)}
        config={jobPostFilterConfig}
        control={control as any}
        allConfig={allConfig}
        handleReset={handleClearFilters}
        handleSubmit={handleSubmit}
        handleApply={(formData) => {
          filter.handleApply(formData);
        }}
      />

      {/* AI Recommendation Modal */}
      <AiCandidateRecommendationModal
        open={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        jobPost={selectedAiJob}
      />

      {/* Export Modal */}
      <ExportModal
        open={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        defaultFileName="DanhSachTinTuyenDung"
        columns={jobPostExportColumns}
        fetchData={handleFetchJobPostsExportData}
        entity="job_post"
        totalRecords={{
          all: data?.count || 0,
          filtered: data?.count || 0,
          selected: Object.keys(rowSelection).filter((k) => rowSelection[k]).length,
        }}
      />

      {/* Import Modal */}
      <ImportModal
        open={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        entity="job_post"
        title="Nhập tin tuyển dụng (Job Post Import)"
        onSuccess={() => {
          router.refresh();
        }}
      />

      {isMutating && <BackdropLoading />}
    </div>
  );
};

export default JobPostCard;
