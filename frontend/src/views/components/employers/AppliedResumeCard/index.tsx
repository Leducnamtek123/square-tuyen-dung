'use client';
import React, { useMemo, useCallback, useReducer } from 'react';
import dayjs from '@/configs/dayjs-config';
import { Box, Paper } from "@mui/material";
import { useTranslation } from 'react-i18next';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import errorHandling from '../../../../utils/errorHandling';
import BackdropLoading from '../../../../components/Common/Loading/BackdropLoading';
import xlsxUtils from '../../../../utils/xlsxUtils';
import toastMessages from '../../../../utils/toastMessages';
import { confirmModal } from '../../../../utils/sweetalert2Modal';
import FormPopup from '../../../../components/Common/Controls/FormPopup';
import AppliedResumeFilterForm from '../AppliedResumeFilterForm';
import AppliedResumeTable from '../AppliedResumeTable';
import AppliedResumeKanban from '../AppliedResumeKanban';
import jobPostActivityService from '../../../../services/jobPostActivityService';
import hrmService, { type EmployeeFromApplicationPayload } from '../../../../services/hrmService';
import { useAppliedResumes, useJobPostOptions, useDeleteJobPostActivity, useUpdateApplicationStatus } from '../hooks/useEmployerQueries';
import { useDataTable } from '../../../../hooks';
import { useConfig } from '@/hooks/useConfig';
import type { JobPostActivity } from '@/types/models';
import type { OnChangeFn, PaginationState, SortingState, RowSelectionState } from '@tanstack/react-table';
import { ExportModal, type ExportColumn, type ExportScope } from '@/components/Common/ExportModal';

import { AppliedResumeFilterData } from '../AppliedResumeFilterForm';
import AppliedResumeToolbar from './AppliedResumeToolbar';
import EmployeeFromApplicationDialog from '../EmployeeFromApplicationDialog';
import ManualCandidateForm from '../ManualCandidateForm';
import type { ManualCandidateFormValues } from '../ManualCandidateForm';

interface AppliedResumeCardProps {
  title: string;
}

const defaultFilterData: AppliedResumeFilterData = {
  cityId: '',
  careerId: '',
  experienceId: '',
  positionId: '',
  academicLevelId: '',
  typeOfWorkplaceId: '',
  jobTypeId: '',
  genderId: '',
  maritalStatusId: '',
  aiReviewStatus: '',
  aiScoreMax: '',
};

const hasFilterValue = (value: unknown) => value !== '' && value !== null && value !== undefined;
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

type AppliedResumeState = {
  viewMode: 'table' | 'board';
  filterData: AppliedResumeFilterData;
  openPopup: boolean;
  isProcessing: boolean;
  jobPostIdSelect: string;
  applicationStatusSelect: string;
  aiAnalysisStatusSelect: string;
  aiScoreMin: string;
  blindMode: boolean;
};

type AppliedResumeAction =
  | { type: 'set_view_mode'; payload: 'table' | 'board' }
  | { type: 'set_filter_data'; payload: AppliedResumeFilterData }
  | { type: 'open_popup' }
  | { type: 'close_popup' }
  | { type: 'set_processing'; payload: boolean }
  | { type: 'set_job_post_id'; payload: string }
  | { type: 'set_application_status'; payload: string }
  | { type: 'set_ai_analysis_status'; payload: string }
  | { type: 'set_ai_score_min'; payload: string }
  | { type: 'set_blind_mode'; payload: boolean }
  | { type: 'reset_filters' };

const initialState: AppliedResumeState = {
  viewMode: 'table',
  filterData: defaultFilterData,
  openPopup: false,
  isProcessing: false,
  jobPostIdSelect: '',
  applicationStatusSelect: '',
  aiAnalysisStatusSelect: '',
  aiScoreMin: '',
  blindMode: false,
};

const reducer = (state: AppliedResumeState, action: AppliedResumeAction): AppliedResumeState => {
  switch (action.type) {
    case 'set_view_mode':
      return { ...state, viewMode: action.payload };
    case 'set_filter_data':
      return { ...state, filterData: action.payload };
    case 'open_popup':
      return { ...state, openPopup: true };
    case 'close_popup':
      return { ...state, openPopup: false };
    case 'set_processing':
      return { ...state, isProcessing: action.payload };
    case 'set_job_post_id':
      return { ...state, jobPostIdSelect: action.payload };
    case 'set_application_status':
      return { ...state, applicationStatusSelect: action.payload };
    case 'set_ai_analysis_status':
      return { ...state, aiAnalysisStatusSelect: action.payload };
    case 'set_ai_score_min':
      return { ...state, aiScoreMin: action.payload };
    case 'set_blind_mode':
      return { ...state, blindMode: action.payload };
    case 'reset_filters':
      return {
        ...state,
        filterData: defaultFilterData,
        jobPostIdSelect: '',
        applicationStatusSelect: '',
        aiAnalysisStatusSelect: '',
        aiScoreMin: '',
        blindMode: false,
      };
    default:
      return state;
  }
};

const AppliedResumeCard: React.FC<AppliedResumeCardProps> = ({ title: cardTitle }) => {
  const { t } = useTranslation(['employer', 'common']);
  const { allConfig } = useConfig();
  const queryClient = useQueryClient();
  const [state, dispatch] = useReducer(reducer, initialState);
  const [employeeSourceActivity, setEmployeeSourceActivity] = React.useState<JobPostActivity | null>(null);
  const [manualCandidatePopupOpen, setManualCandidatePopupOpen] = React.useState(false);
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});

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
    initialPageSize: 10
  });

  const [optimisticAnalysis, setOptimisticAnalysis] = React.useState<Record<string, Partial<JobPostActivity>>>({});

  const { data: jobPostOptions = [] } = useJobPostOptions();

  const queryParams = useMemo(() => ({
    page: state.viewMode === 'board' ? 1 : page + 1,
    pageSize: state.viewMode === 'board' ? 100 : pageSize,
    ordering,
    ...state.filterData,
    jobPostId: state.jobPostIdSelect,
    status: state.applicationStatusSelect,
    aiAnalysisStatus: state.aiAnalysisStatusSelect,
    aiScoreMin: state.aiScoreMin,
    blind: state.blindMode ? true : undefined,
  }), [
    page,
    pageSize,
    ordering,
    state.filterData,
    state.jobPostIdSelect,
    state.applicationStatusSelect,
    state.aiAnalysisStatusSelect,
    state.aiScoreMin,
    state.blindMode,
    state.viewMode,
  ]);

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
    mutationFn: (payload: EmployeeFromApplicationPayload) => hrmService.createEmployeeFromApplication(payload),
    onSuccess: () => {
      toastMessages.success(t('employer:employees.hrm.convert.success'));
      setEmployeeSourceActivity(null);
      queryClient.invalidateQueries({ queryKey: ['appliedResumes'] });
    },
    onError: () => toastMessages.error(t('employer:employees.hrm.convert.error')),
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

  React.useEffect(() => {
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
        const serverHasPatch = patchEntries.every(([key, value]) => Object.is((row as unknown as Record<string, unknown>)[key], value));
        const serverFinishedAnalysis = patch.aiAnalysisStatus === 'processing' && ['completed', 'failed'].includes(row.aiAnalysisStatus || '');

        if (serverHasPatch || serverFinishedAnalysis) {
          delete next[id];
          changed = true;
        }
      });

      return changed ? next : prev;
    });
  }, [queryData?.results]);

  const handleAnalysisStateChange = useCallback((id: string | number, nextState: Partial<JobPostActivity>) => {
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
  }, [queryClient, queryParams]);

  const [exportModalOpen, setExportModalOpen] = React.useState(false);

  const appliedResumeExportColumns: ExportColumn[] = useMemo(() => [
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
      getValue: (row) => (row.aiAnalysisScore != null ? String(row.aiAnalysisScore) : row.aiScore != null ? String(row.aiScore) : '---'),
    },
  ], [t]);

  const handleFilter = useCallback((data: AppliedResumeFilterData) => {
    dispatch({ type: 'close_popup' });
    dispatch({ type: 'set_filter_data', payload: { ...data } });
    onPaginationChange({ pageIndex: 0, pageSize });
  }, [onPaginationChange, pageSize]);

  const handleFetchAppliedResumeExportData = useCallback(async (scope: ExportScope) => {
    const params = scope === 'all' ? {} : queryParams;
    const resData = await jobPostActivityService.exportAppliedResume(params);
    const exportList = (resData || []) as Record<string, any>[];
    if (scope === 'selected') {
      const selectedIds = Object.keys(rowSelection).filter(id => rowSelection[id]);
      if (selectedIds.length === 0) return [];
      const filtered = exportList.filter((item) => selectedIds.includes(String(item.id ?? item.ID ?? item.slug ?? '')));
      if (filtered.length > 0) return filtered;
      return resumes.filter((r) => selectedIds.includes(String(r.id)));
    }
    return exportList;
  }, [queryParams, rowSelection, resumes]);

  const handleCreateManualCandidate = async (data: ManualCandidateFormValues) => {
    await manualCandidateMutation.mutateAsync(buildManualCandidateFormData(data));
  };

  const handleChangeApplicationStatus = async (id: string | number, value: string | number, callback: (result: boolean) => void) => {
    try {
      await updateStatus({ id, status: value });
      toastMessages.success(t('employer:appliedResume.status.updateSuccess'));
      callback(true);
    } catch (error) {
      // Error handled in hook
      callback(false);
    }
  };

  const handleDelete = useCallback((id: string | number) => {
    confirmModal(
      async () => {
        try {
          await deleteJobPostActivity(id);
          toastMessages.success(t('employer:appliedResume.delete.success'));
        } catch (error) {
           // Error handled in hook
        }
      },
      t('employer:appliedResume.delete.title'),
      t('employer:appliedResume.delete.confirm'),
      'warning'
    );
  }, [deleteJobPostActivity, t]);

  const handleResetFilterData = useCallback(() => {
    dispatch({ type: 'reset_filters' });
    onPaginationChange({ pageIndex: 0, pageSize });
  }, [onPaginationChange, pageSize]);

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
          overflow: 'hidden'
        }}
      >
        <AppliedResumeToolbar
          title={cardTitle}
          t={t}
          allConfig={allConfig}
          viewMode={state.viewMode}
          onViewModeChange={(nextValue) => dispatch({ type: 'set_view_mode', payload: nextValue })}
          jobPostOptions={jobPostOptions}
          jobPostIdSelect={state.jobPostIdSelect}
          onJobPostSelect={(value) => {
            dispatch({ type: 'set_job_post_id', payload: value });
            onPaginationChange({ pageIndex: 0, pageSize });
          }}
          applicationStatusSelect={state.applicationStatusSelect}
          onApplicationStatusSelect={(value) => {
            dispatch({ type: 'set_application_status', payload: value });
            onPaginationChange({ pageIndex: 0, pageSize });
          }}
          aiAnalysisStatusSelect={state.aiAnalysisStatusSelect}
          onAiAnalysisStatusSelect={(value) => {
            dispatch({ type: 'set_ai_analysis_status', payload: value });
            onPaginationChange({ pageIndex: 0, pageSize });
          }}
          aiScoreMin={state.aiScoreMin}
          onAiScoreMinChange={(value) => {
            dispatch({ type: 'set_ai_score_min', payload: value });
            onPaginationChange({ pageIndex: 0, pageSize });
          }}
          blindMode={state.blindMode}
          onBlindModeChange={(value) => {
            dispatch({ type: 'set_blind_mode', payload: value });
            onPaginationChange({ pageIndex: 0, pageSize });
          }}
          numbersFilter={Object.values(state.filterData).filter(hasFilterValue).length}
          onResetFilterData={handleResetFilterData}
          onOpenFilterPopup={() => dispatch({ type: 'open_popup' })}
          onOpenManualCandidatePopup={() => setManualCandidatePopupOpen(true)}
          onExport={() => setExportModalOpen(true)}
        />

        {state.viewMode === 'table' ? (
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
              blindMode={state.blindMode}
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
              blindMode={state.blindMode}
            />
        )}

        <FormPopup title={t('employer:appliedResume.advancedFilter')} openPopup={state.openPopup} setOpenPopup={(open) => dispatch({ type: open ? 'open_popup' : 'close_popup' })}>
          <AppliedResumeFilterForm handleFilter={handleFilter} filterData={state.filterData} />
        </FormPopup>

        <FormPopup
          title={t('employer:manualCandidate.appliedDialogTitle')}
          openPopup={manualCandidatePopupOpen}
          setOpenPopup={setManualCandidatePopupOpen}
          buttonText={t('employer:manualCandidate.actions.save')}
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

        {(state.isProcessing || isDeleting || isUpdatingStatus || manualCandidateMutation.isPending) && <BackdropLoading />}
      </Paper>
      <EmployeeFromApplicationDialog
        open={Boolean(employeeSourceActivity)}
        activity={employeeSourceActivity}
        loading={createEmployeeMutation.isPending}
        onClose={() => setEmployeeSourceActivity(null)}
        onSubmit={(payload) => createEmployeeMutation.mutate(payload)}
        t={t}
      />
    </Box>
  );
};

export default AppliedResumeCard;
