'use client';

import React, { useMemo, useCallback, useState, useEffect } from 'react';
import dayjs from '@/configs/dayjs-config';
import {
  Box,
  Paper,
  Button,
  Stack,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
} from '@mui/material';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewKanbanIcon from '@mui/icons-material/ViewKanban';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { useTranslation } from 'react-i18next';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';

import errorHandling from '../../../../utils/errorHandling';
import BackdropLoading from '../../../../components/Common/Loading/BackdropLoading';
import toastMessages from '../../../../utils/toastMessages';
import { confirmModal } from '../../../../utils/sweetalert2Modal';
import FormPopup from '../../../../components/Common/Controls/FormPopup';
import AppliedResumeTable from '../AppliedResumeTable';
import AppliedResumeKanban from '../AppliedResumeKanban';
import jobPostActivityService from '../../../../services/jobPostActivityService';
import hrmService, { type OnboardCandidatePayload } from '../../../../services/hrmService';
import {
  useAppliedResumes,
  useJobPostOptions,
  useDeleteJobPostActivity,
  useUpdateApplicationStatus,
} from '../hooks/useEmployerQueries';
import { useDataTable } from '../../../../hooks';
import { useConfig } from '@/hooks/useConfig';
import type { JobPostActivity } from '@/types/models';
import type { OnChangeFn, PaginationState, SortingState, RowSelectionState } from '@tanstack/react-table';
import { ExportModal, type ExportColumn, type ExportScope } from '@/components/Common/ExportModal';
import EmployeeFromApplicationDialog from '../EmployeeFromApplicationDialog';
import ManualCandidateForm, { type ManualCandidateFormValues } from '../ManualCandidateForm';
import {
  GlobalFilterBar,
  ActiveFilterChips,
  GlobalFilterDrawer,
  appliedResumeFilterConfig,
  useGlobalFilter,
} from '@/components/Common/Filters';

interface AppliedResumeCardProps {
  title: string;
}

const MANUAL_CANDIDATE_FORM_ID = 'manual-applied-candidate-form';

const appendManualCandidateValue = (formData: FormData, key: string, value: unknown) => {
  if (value == null || value === '') return;
  if (value instanceof File) {
    formData.append(key, value);
    return;
  }
  formData.append(key, String(value));
};

const buildManualCandidateFormData = (data: ManualCandidateFormValues) => {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => appendManualCandidateValue(formData, key, value));
  return formData;
};

const AppliedResumeCard: React.FC<AppliedResumeCardProps> = ({ title: cardTitle }) => {
  const { t } = useTranslation(['employer', 'common']);
  const { allConfig } = useConfig();
  const queryClient = useQueryClient();

  const [viewMode, setViewMode] = useState<'table' | 'board'>('table');
  const [blindMode, setBlindMode] = useState(false);
  const [employeeSourceActivity, setEmployeeSourceActivity] = useState<JobPostActivity | null>(null);
  const [manualCandidatePopupOpen, setManualCandidatePopupOpen] = useState(false);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [optimisticAnalysis, setOptimisticAnalysis] = useState<Record<string, Partial<JobPostActivity>>>({});

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

  const { data: jobPostOptions = [] } = useJobPostOptions();

  const filter = useGlobalFilter({
    config: appliedResumeFilterConfig,
    allConfig: {
      ...allConfig,
      jobPostOptions,
    },
    onApply: () => {
      onPaginationChange({ pageIndex: 0, pageSize });
    },
    onReset: () => {
      onPaginationChange({ pageIndex: 0, pageSize });
    },
  });

  const { control, handleSubmit, reset } = useForm<any>({
    defaultValues: filter.appliedValues,
  });

  useEffect(() => {
    reset(filter.appliedValues);
  }, [filter.appliedValues, reset]);

  const queryParams = useMemo(
    () => ({
      page: viewMode === 'board' ? 1 : page + 1,
      pageSize: viewMode === 'board' ? 100 : pageSize,
      ordering,
      kw: filter.appliedValues.kw || undefined,
      jobPostId: filter.appliedValues.jobPostId || undefined,
      status: filter.appliedValues.applicationStatus || undefined,
      aiAnalysisStatus: filter.appliedValues.aiAnalysisStatus || undefined,
      aiScoreMin: filter.appliedValues.aiScoreMin || undefined,
      cityId: filter.appliedValues.cityId || undefined,
      careerId: filter.appliedValues.careerId || undefined,
      experienceId: filter.appliedValues.experienceId || undefined,
      positionId: filter.appliedValues.positionId || undefined,
      academicLevelId: filter.appliedValues.academicLevelId || undefined,
      typeOfWorkplaceId: filter.appliedValues.typeOfWorkplaceId || undefined,
      jobTypeId: filter.appliedValues.jobTypeId || undefined,
      genderId: filter.appliedValues.genderId || undefined,
      maritalStatusId: filter.appliedValues.maritalStatusId || undefined,
      blind: blindMode ? true : undefined,
    }),
    [page, pageSize, ordering, viewMode, filter.appliedValues, blindMode]
  );

  const { data: queryData, isLoading } = useAppliedResumes(queryParams);
  const { deleteJobPostActivity, isMutating: isDeleting } = useDeleteJobPostActivity();
  const { updateStatus, isMutating: isUpdatingStatus } = useUpdateApplicationStatus();

  const manualCandidateMutation = useMutation({
    mutationFn: (payload: FormData) => jobPostActivityService.createManualAppliedCandidate(payload),
    onSuccess: () => {
      toastMessages.success(t('employer:manualCandidate.messages.createSuccess'));
      setManualCandidatePopupOpen(false);
      queryClient.invalidateQueries({ queryKey: ['appliedResumes'] });
    },
    onError: (error) => errorHandling(error),
  });

  const createEmployeeMutation = useMutation({
    mutationFn: (payload: any) =>
      hrmService.onboardCandidate(payload),
    onSuccess: () => {
      toastMessages.success(
        t('employer:employees.hrm.convert.success', {
          defaultValue: 'Tiếp nhận ứng viên vào hệ thống nhân sự thành công!',
        }),
      );
      setEmployeeSourceActivity(null);
      queryClient.invalidateQueries({ queryKey: ['appliedResumes'] });
      queryClient.invalidateQueries({ queryKey: ['hrmEmployees'] });
      queryClient.invalidateQueries({ queryKey: ['hrmDashboardStats'] });
    },
    onError: (error: any) => {
      const msg =
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        (Array.isArray(error?.response?.data) ? error?.response?.data[0] : null) ||
        t('employer:employees.hrm.convert.error', {
          defaultValue: 'Không thể tiếp nhận ứng viên. Vui lòng thử lại.',
        });
      toastMessages.error(msg);
    },
  });

  const resumes = useMemo(() => {
    const sourceRows = queryData?.results || [];
    if (!Object.keys(optimisticAnalysis).length) return sourceRows;

    return sourceRows.map((row) => {
      const patch = optimisticAnalysis[String(row.id)];
      return patch ? { ...row, ...patch } : row;
    });
  }, [queryData?.results, optimisticAnalysis]);

  const count = queryData?.count || 0;

  useEffect(() => {
    const sourceRows = queryData?.results || [];

    setOptimisticAnalysis((prev) => {
      if (!sourceRows.length || !Object.keys(prev).length) return prev;

      let changed = false;
      const next = { ...prev };

      Object.entries(prev).forEach(([id, patch]) => {
        const row = sourceRows.find((item) => String(item.id) === id);
        if (!row) {
          delete next[id];
          changed = true;
          return;
        }

        const patchEntries = Object.entries(patch).filter(([, value]) => value !== undefined);
        const serverHasPatch = patchEntries.every(
          ([key, value]) => Object.is((row as unknown as Record<string, unknown>)[key], value)
        );
        const serverFinishedAnalysis =
          patch.aiAnalysisStatus === 'processing' &&
          ['completed', 'failed'].includes(row.aiAnalysisStatus || '');

        if (serverHasPatch || serverFinishedAnalysis) {
          delete next[id];
          changed = true;
        }
      });

      return changed ? next : prev;
    });
  }, [queryData?.results]);

  const handleAnalysisStateChange = useCallback(
    (id: string | number, nextState: Partial<JobPostActivity>) => {
      queryClient.setQueryData(['employerAppliedResumes', queryParams], (oldData: any) => {
        if (!oldData?.results) return oldData;
        return {
          ...oldData,
          results: oldData.results.map((item: JobPostActivity) => {
            if (String(item.id) !== String(id)) return item;
            return { ...item, ...nextState };
          }),
        };
      });
    },
    [queryClient, queryParams]
  );

  const appliedResumeExportColumns: ExportColumn[] = useMemo(
    () => [
      {
        id: 'candidateName',
        label: t('employer:appliedResume.table.candidateName', 'Họ và tên ứng viên'),
        checked: true,
        getValue: (row) => row.fullName || row['Họ và tên'] || row.candidateName || row.name || '---',
      },
      {
        id: 'jobTitle',
        label: t('employer:appliedResume.table.jobTitle', 'Tin tuyển dụng'),
        checked: true,
        getValue: (row) => row.jobName || row['Vị trí ứng tuyển'] || row.jobTitle || '---',
      },
      {
        id: 'appliedDate',
        label: t('employer:appliedResume.table.appliedDate', 'Ngày nộp'),
        checked: true,
        getValue: (row) => {
          const val = row.createAt || row['Ngày ứng tuyển'] || row.appliedDate;
          return val ? dayjs(val).format('DD/MM/YYYY') : '---';
        },
      },
      {
        id: 'status',
        label: t('employer:appliedResume.table.status', 'Trạng thái'),
        checked: true,
        getValue: (row) => row.statusApply || row['Kết quả tuyển dụng'] || row.status || '---',
      },
      {
        id: 'phone',
        label: t('employer:appliedResume.table.phone', 'Số điện thoại'),
        checked: true,
        getValue: (row) => row.phone || row['Số điện thoại'] || '---',
      },
      {
        id: 'email',
        label: t('employer:appliedResume.table.email', 'Email'),
        checked: true,
        getValue: (row) => row.email || row.Email || '---',
      },
      {
        id: 'aiScore',
        label: t('employer:appliedResume.table.aiScore', 'Điểm AI'),
        checked: true,
        getValue: (row) =>
          row.aiAnalysisScore != null
            ? String(row.aiAnalysisScore)
            : row.aiScore != null
            ? String(row.aiScore)
            : '---',
      },
    ],
    [t]
  );

  const handleFetchAppliedResumeExportData = useCallback(
    async (scope: ExportScope) => {
      const params = scope === 'all' ? {} : queryParams;
      const resData = await jobPostActivityService.exportAppliedResume(params);
      const exportList = (resData || []) as Record<string, any>[];
      if (scope === 'selected') {
        const selectedIds = Object.keys(rowSelection).filter((id) => rowSelection[id]);
        if (selectedIds.length === 0) return [];
        const filtered = exportList.filter((item) =>
          selectedIds.includes(String(item.id ?? item.ID ?? item.slug ?? ''))
        );
        if (filtered.length > 0) return filtered;
        return resumes.filter((r) => selectedIds.includes(String(r.id)));
      }
      return exportList;
    },
    [queryParams, rowSelection, resumes]
  );

  const handleCreateManualCandidate = async (data: ManualCandidateFormValues) => {
    await manualCandidateMutation.mutateAsync(buildManualCandidateFormData(data));
  };

  const handleChangeApplicationStatus = async (
    id: string | number,
    value: string | number,
    callback: (result: boolean) => void
  ) => {
    try {
      await updateStatus({ id, status: value });
      toastMessages.success(t('employer:appliedResume.status.updateSuccess'));
      callback(true);
    } catch {
      callback(false);
    }
  };

  const handleDelete = useCallback(
    (id: string | number) => {
      confirmModal(
        async () => {
          try {
            await deleteJobPostActivity(id);
            toastMessages.success(t('employer:appliedResume.delete.success'));
          } catch {
            // Handled
          }
        },
        t('employer:appliedResume.delete.title'),
        t('employer:appliedResume.delete.confirm'),
        'warning'
      );
    },
    [deleteJobPostActivity, t]
  );

  const formattedJobPostOptions = useMemo(
    () => jobPostOptions.map((jp) => ({ id: String(jp.id), name: jp.jobName })),
    [jobPostOptions]
  );


  return (
    <Box sx={{ width: '100%' }}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, md: 3.5 },
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: (theme) => theme.customShadows?.z1,
          bgcolor: 'background.paper',
          overflow: 'hidden',
        }}
      >
        {/* Header Section */}
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          alignItems={{ xs: 'flex-start', md: 'center' }}
          justifyContent="space-between"
          spacing={2.5}
          mb={3}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                p: 1,
                borderRadius: 2,
                bgcolor: 'primary.extralight',
                color: 'primary.main',
                display: 'flex',
              }}
            >
              <AssignmentTurnedInIcon sx={{ fontSize: 28 }} />
            </Box>
            <Box>
              <Typography
                variant="h4"
                sx={{ fontWeight: 900, color: 'text.primary', letterSpacing: '-1px', mb: 0.5 }}
              >
                {cardTitle}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                {t('employer:appliedResume.subtitle', 'Quản lý và sàng lọc hồ sơ ứng tuyển từ các tin tuyển dụng')}
              </Typography>
            </Box>
          </Box>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems="center" width={{ xs: '100%', md: 'auto' }}>
            {/* View Mode Switch */}
            <ToggleButtonGroup
              size="small"
              value={viewMode}
              exclusive
              onChange={(_, next) => {
                if (next) {
                  setViewMode(next);
                  onPaginationChange({ pageIndex: 0, pageSize });
                }
              }}
              sx={{
                bgcolor: '#F8FAFC',
                '& .MuiToggleButton-root': {
                  px: 1.5,
                  py: 0.75,
                  fontWeight: 700,
                  fontSize: '0.8125rem',
                  textTransform: 'none',
                  border: '1px solid #E2E8F0',
                  '&.Mui-selected': {
                    bgcolor: 'primary.main',
                    color: '#FFFFFF',
                    '&:hover': {
                      bgcolor: 'primary.dark',
                    },
                  },
                },
              }}
            >
              <ToggleButton value="table">
                <ViewListIcon sx={{ fontSize: 18, mr: 0.5 }} />
                Bảng
              </ToggleButton>
              <ToggleButton value="board">
                <ViewKanbanIcon sx={{ fontSize: 18, mr: 0.5 }} />
                Kanban
              </ToggleButton>
            </ToggleButtonGroup>

            {/* Blind Mode Toggle */}
            <Tooltip title="Ẩn thông tin cá nhân (họ tên, ảnh, liên hệ) để đánh giá công bằng">
              <ToggleButton
                value="blind"
                selected={blindMode}
                onChange={() => setBlindMode((prev) => !prev)}
                size="small"
                sx={{
                  px: 1.5,
                  py: 0.75,
                  fontWeight: 700,
                  fontSize: '0.8125rem',
                  textTransform: 'none',
                  borderRadius: '8px !important',
                  borderColor: blindMode ? 'warning.main' : '#E2E8F0',
                  color: blindMode ? 'warning.dark' : '#64748B',
                  bgcolor: blindMode ? 'warning.light' : '#F8FAFC',
                  '&:hover': {
                    bgcolor: blindMode ? 'warning.light' : '#F1F5F9',
                  },
                }}
              >
                <VisibilityOffIcon sx={{ fontSize: 18, mr: 0.5 }} />
                {t('employer:appliedResume.ai.blindMode')}
              </ToggleButton>
            </Tooltip>

            {/* Export List Button */}
            <Button
              variant="outlined"
              color="inherit"
              startIcon={<FileDownloadOutlinedIcon />}
              onClick={() => setExportModalOpen(true)}
              sx={{
                px: 2.5,
                py: 1,
                fontWeight: 800,
                textTransform: 'none',
                border: '1px solid #E2E8F0',
                bgcolor: '#FFFFFF',
                color: '#334155',
                '&:hover': {
                  bgcolor: '#F8FAFC',
                  borderColor: '#CBD5E1',
                },
              }}
            >
              {t('employer:appliedResume.downloadList', 'Tải danh sách')}
            </Button>

            {/* Add Candidate Button */}
            <Button
              variant="contained"
              color="primary"
              startIcon={<PersonAddIcon />}
              onClick={() => setManualCandidatePopupOpen(true)}
              sx={{
                px: 3,
                py: 1,
                boxShadow: (theme) => theme.customShadows?.primary,
                fontWeight: 900,
                textTransform: 'none',
              }}
            >
              {t('employer:manualCandidate.title', 'Thêm ứng viên')}
            </Button>
          </Stack>
        </Stack>

        {/* Unified Global Filter Bar */}
        <Stack spacing={1.5} sx={{ mb: 3 }}>
          <GlobalFilterBar
            control={control}
            handleSubmit={handleSubmit}
            handleSearchSubmit={(data) => {
              filter.handleApply(data);
            }}
            primaryFieldName="jobPostId"
            primaryFieldOptions={formattedJobPostOptions}
            primaryFieldPlaceholder={t('employer:appliedResume.filters.selectJobPost', 'Tất cả tin tuyển dụng')}
            searchPlaceholder={t('employer:appliedResume.filters.searchPlaceholder', 'Tìm ứng viên theo tên, email, SĐT...')}
            onOpenFilterDrawer={() => filter.setDrawerOpen(true)}
            activeFilterCount={filter.activeFilterCount}
          />

          <ActiveFilterChips
            tags={filter.activeTags}
            onRemoveTag={(key) => {
              reset({ ...filter.appliedValues, [key]: '' });
              filter.handleRemoveTag(key);
            }}
            onClearAll={() => {
              reset(appliedResumeFilterConfig.defaultValues);
              filter.handleReset();
            }}
          />
        </Stack>

        {/* Main Content: Table or Kanban */}
        {viewMode === 'table' ? (
          <AppliedResumeTable
            variant="flat"
            rows={resumes}
            isLoading={isLoading}
            rowCount={count}
            pagination={pagination}
            onPaginationChange={onPaginationChange as OnChangeFn<PaginationState>}
            sorting={sorting}
            onSortingChange={onSortingChange as OnChangeFn<SortingState>}
            handleChangeApplicationStatus={handleChangeApplicationStatus}
            handleDelete={handleDelete}
            onCreateEmployee={setEmployeeSourceActivity}
            onAnalysisStateChange={handleAnalysisStateChange}
            blindMode={blindMode}
            enableRowSelection
            rowSelection={rowSelection}
            onRowSelectionChange={setRowSelection as OnChangeFn<RowSelectionState>}
          />
        ) : (
          <AppliedResumeKanban
            rows={resumes}
            isLoading={isLoading}
            handleChangeApplicationStatus={handleChangeApplicationStatus}
            handleDelete={handleDelete}
            onCreateEmployee={setEmployeeSourceActivity}
            onAnalysisStateChange={handleAnalysisStateChange}
            onAddCandidate={() => setManualCandidatePopupOpen(true)}
            blindMode={blindMode}
          />
        )}

        {/* Global Filter Drawer */}
        <GlobalFilterDrawer
          open={filter.drawerOpen}
          onClose={() => filter.setDrawerOpen(false)}
          config={appliedResumeFilterConfig}
          control={control}
          allConfig={{
            ...allConfig,
            jobPostOptions,
          }}
          handleReset={() => {
            reset(appliedResumeFilterConfig.defaultValues);
            filter.handleReset();
            filter.setDrawerOpen(false);
          }}
          handleSubmit={handleSubmit}
          handleApply={(data) => {
            filter.handleApply(data);
          }}
        />

        {/* Add Candidate Form Popup */}
        <FormPopup
          title={t('employer:manualCandidate.appliedDialogTitle', 'Thêm ứng viên ứng tuyển')}
          openPopup={manualCandidatePopupOpen}
          setOpenPopup={setManualCandidatePopupOpen}
          buttonText={t('employer:manualCandidate.actions.save', 'Lưu hồ sơ')}
          isSubmitting={manualCandidateMutation.isPending}
          formId={MANUAL_CANDIDATE_FORM_ID}
        >
          <ManualCandidateForm
            formId={MANUAL_CANDIDATE_FORM_ID}
            onSubmit={handleCreateManualCandidate}
            jobPostOptions={jobPostOptions}
            requireJobPost
          />
        </FormPopup>

        {/* Export Modal */}
        <ExportModal
          open={exportModalOpen}
          onClose={() => setExportModalOpen(false)}
          defaultFileName="DanhSachHoSoUngTuyen"
          columns={appliedResumeExportColumns}
          fetchData={handleFetchAppliedResumeExportData}
          totalRecords={{
            all: count || 0,
            filtered: count || 0,
            selected: Object.keys(rowSelection).filter((k) => rowSelection[k]).length,
          }}
        />

        {/* Convert to HRM Employee Dialog */}
        {employeeSourceActivity && (
          <EmployeeFromApplicationDialog
            open={Boolean(employeeSourceActivity)}
            onClose={() => setEmployeeSourceActivity(null)}
            activity={employeeSourceActivity}
            loading={createEmployeeMutation.isPending}
            onSubmit={async (payload: any) => {
              await createEmployeeMutation.mutateAsync(payload);
            }}
            t={t}
          />
        )}


        {(isDeleting || isUpdatingStatus || createEmployeeMutation.isPending) && <BackdropLoading />}
      </Paper>
    </Box>
  );
};

export default AppliedResumeCard;
