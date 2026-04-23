'use client';
import React, { useMemo, useCallback, useReducer } from 'react';
import { Box, Paper } from "@mui/material";
import { useTranslation } from 'react-i18next';
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
import { useAppliedResumes, useJobPostOptions, useDeleteJobPostActivity, useUpdateApplicationStatus } from '../hooks/useEmployerQueries';
import { useDataTable } from '../../../../hooks';
import { useConfig } from '@/hooks/useConfig';
import type { JobPostActivity } from '@/types/models';
import type { OnChangeFn, PaginationState, SortingState } from '@tanstack/react-table';

import { AppliedResumeFilterData } from '../AppliedResumeFilterForm';
import AppliedResumeToolbar from './AppliedResumeToolbar';

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
};

type AppliedResumeState = {
  viewMode: 'table' | 'board';
  filterData: AppliedResumeFilterData;
  openPopup: boolean;
  isProcessing: boolean;
  jobPostIdSelect: string;
  applicationStatusSelect: string;
};

type AppliedResumeAction =
  | { type: 'set_view_mode'; payload: 'table' | 'board' }
  | { type: 'set_filter_data'; payload: AppliedResumeFilterData }
  | { type: 'open_popup' }
  | { type: 'close_popup' }
  | { type: 'set_processing'; payload: boolean }
  | { type: 'set_job_post_id'; payload: string }
  | { type: 'set_application_status'; payload: string }
  | { type: 'reset_filters' };

const initialState: AppliedResumeState = {
  viewMode: 'table',
  filterData: defaultFilterData,
  openPopup: false,
  isProcessing: false,
  jobPostIdSelect: '',
  applicationStatusSelect: '',
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
    case 'reset_filters':
      return {
        ...state,
        filterData: defaultFilterData,
        jobPostIdSelect: '',
        applicationStatusSelect: '',
      };
    default:
      return state;
  }
};

const AppliedResumeCard: React.FC<AppliedResumeCardProps> = ({ title: cardTitle }) => {
  const { t } = useTranslation(['employer', 'common']);
  const { allConfig } = useConfig();
  const [state, dispatch] = useReducer(reducer, initialState);

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

  const [optimisticAnalysis, setOptimisticAnalysis] = React.useState<Record<string, Pick<JobPostActivity, 'aiAnalysisStatus' | 'aiAnalysisProgress'>>>({});

  const { data: jobPostOptions = [] } = useJobPostOptions();

  const queryParams = useMemo(() => ({
    page: state.viewMode === 'board' ? 1 : page + 1,
    pageSize: state.viewMode === 'board' ? 100 : pageSize,
    ordering,
    ...state.filterData,
    jobPostId: state.jobPostIdSelect,
    status: state.applicationStatusSelect,
  }), [page, pageSize, ordering, state.filterData, state.jobPostIdSelect, state.applicationStatusSelect, state.viewMode]);

  const { data: queryData, isLoading } = useAppliedResumes(queryParams);
  const { deleteJobPostActivity, isMutating: isDeleting } = useDeleteJobPostActivity();
  const { updateStatus, isMutating: isUpdatingStatus } = useUpdateApplicationStatus();

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
    if (!sourceRows.length || !Object.keys(optimisticAnalysis).length) return;

    setOptimisticAnalysis((prev) => {
      let changed = false;
      const next = { ...prev };

      Object.keys(prev).forEach((id) => {
        const row = sourceRows.find((item) => String(item.id) === id);
        const status = row?.aiAnalysisStatus;
        if (!row || status === 'processing' || status === 'completed' || status === 'failed') {
          delete next[id];
          changed = true;
        }
      });

      return changed ? next : prev;
    });
  }, [queryData?.results, optimisticAnalysis]);

  const handleAnalysisStateChange = useCallback((id: string | number, nextState: Pick<JobPostActivity, 'aiAnalysisStatus' | 'aiAnalysisProgress'>) => {
    setOptimisticAnalysis((prev) => ({
      ...prev,
      [String(id)]: nextState,
    }));
  }, []);

  const handleFilter = useCallback((data: AppliedResumeFilterData) => {
    dispatch({ type: 'close_popup' });
    dispatch({ type: 'set_filter_data', payload: { ...data } });
    onPaginationChange({ pageIndex: 0, pageSize });
  }, [onPaginationChange, pageSize]);

  const handleExport = async () => {
    dispatch({ type: 'set_processing', payload: true });
    try {
      const resData = await jobPostActivityService.exportAppliedResume(queryParams);
      xlsxUtils.exportToXLSX(resData, 'AppliedProfilesList');
    } catch (error) {
      errorHandling(error);
    } finally {
      dispatch({ type: 'set_processing', payload: false });
    }
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
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Paper 
        elevation={0}
        sx={{ 
          p: { xs: 3, md: 5 }, 
          borderRadius: 4, 
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: (theme) => theme.customShadows?.z1,
          bgcolor: 'background.paper'
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
          numbersFilter={Object.values(state.filterData).filter((v) => v !== '').length}
          onResetFilterData={handleResetFilterData}
          onOpenFilterPopup={() => dispatch({ type: 'open_popup' })}
          onExport={handleExport}
        />

        {state.viewMode === 'table' ? (
            <AppliedResumeTable
              rows={resumes}
              isLoading={isLoading}
              rowCount={count}
              pagination={pagination}
              onPaginationChange={onPaginationChange as OnChangeFn<PaginationState>}
              sorting={sorting}
              onSortingChange={onSortingChange as OnChangeFn<SortingState>}
              handleChangeApplicationStatus={handleChangeApplicationStatus}
              handleDelete={handleDelete}
              onAnalysisStateChange={handleAnalysisStateChange}
            />
        ) : (
          <AppliedResumeKanban
              rows={resumes}
              isLoading={isLoading}
              handleChangeApplicationStatus={handleChangeApplicationStatus}
              handleDelete={handleDelete}
              onAnalysisStateChange={handleAnalysisStateChange}
            />
        )}

        <FormPopup title={t('employer:appliedResume.advancedFilter')} openPopup={state.openPopup} setOpenPopup={(open) => dispatch({ type: open ? 'open_popup' : 'close_popup' })}>
          <AppliedResumeFilterForm handleFilter={handleFilter} filterData={state.filterData} />
        </FormPopup>

        {(state.isProcessing || isDeleting || isUpdatingStatus) && <BackdropLoading />}
      </Paper>
    </Box>
  );
};

export default AppliedResumeCard;
