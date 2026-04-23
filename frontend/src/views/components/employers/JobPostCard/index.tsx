'use client';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Button, Divider, LinearProgress, Stack, Typography, Paper, Tooltip, Theme } from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import FilterListIcon from '@mui/icons-material/FilterList';
import {
  convertEditorStateToHTMLString,
  createEditorStateFromHTMLString,
} from '../../../../utils/editorUtils';
import toastMessages from '../../../../utils/toastMessages';
import errorHandling from '../../../../utils/errorHandling';
import { confirmModal } from '../../../../utils/sweetalert2Modal';
import BackdropLoading from '../../../../components/Common/Loading/BackdropLoading';
import xlsxUtils from '../../../../utils/xlsxUtils';
import type { AxiosError } from 'axios';
import FormPopup from '../../../../components/Common/Controls/FormPopup';
import JobPostFilterForm from '../JobPostFilterForm';
import JobPostForm from '../JobPostForm';
import type { JobPostFormValues } from '../JobPostForm/JobPostSchema';
import jobService from '../../../../services/jobService';
import JobPostsTable from '../JobPostsTable';
import { useDataTable } from '../../../../hooks';
import { useEmployerJobPosts, useJobPostMutations } from '../hooks/useEmployerQueries';
import type { ApiError } from '../../../../types/api';
import type { EditorState } from 'draft-js';
import type { JobPostInput } from '../../../../services/jobService';

type JobPostEditData = Partial<JobPostFormValues> & { id?: string | number };

type FilterState = { kw: string; isUrgent: boolean | ''; statusId: string | number };

type JobPostCardState = {
  filterData: FilterState;
  openPopup: boolean;
  editData: JobPostEditData | null;
  serverErrors: Record<string, string[]> | null;
  isProcessing: boolean;
};

type JobPostCardAction =
  | { type: 'setFilter'; value: FilterState }
  | { type: 'openAdd' }
  | { type: 'openEdit'; value: JobPostEditData }
  | { type: 'closePopup' }
  | { type: 'setErrors'; value: Record<string, string[]> | null }
  | { type: 'setProcessing'; value: boolean };

const initialState: JobPostCardState = {
  filterData: { kw: '', isUrgent: '', statusId: '' },
  openPopup: false,
  editData: null,
  serverErrors: null,
  isProcessing: false,
};

function reducer(state: JobPostCardState, action: JobPostCardAction): JobPostCardState {
  switch (action.type) {
    case 'setFilter':
      return { ...state, filterData: action.value };
    case 'openAdd':
      return { ...state, openPopup: true, editData: null, serverErrors: null };
    case 'openEdit':
      return { ...state, openPopup: true, editData: action.value };
    case 'closePopup':
      return { ...state, openPopup: false };
    case 'setErrors':
      return { ...state, serverErrors: action.value };
    case 'setProcessing':
      return { ...state, isProcessing: action.value };
    default:
      return state;
  }
}

const JobPostCard = () => {
  const { t } = useTranslation('employer');

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

  const [state, dispatch] = React.useReducer(reducer, initialState);

  // Data Fetching & Mutations
  const { data, isLoading } = useEmployerJobPosts({
    page: page + 1,
    pageSize,
    ordering,
    kw: state.filterData.kw,
    isUrgent: state.filterData.isUrgent === '' ? undefined : state.filterData.isUrgent,
    status: state.filterData.statusId === '' ? undefined : state.filterData.statusId,
  });

  const { addJobPost, updateJobPost, deleteJobPost, isMutating } = useJobPostMutations();

  const handleShowUpdate = useCallback(async (slugOrId: string | number) => {
    dispatch({ type: 'setProcessing', value: true });
    try {
      const resData = await jobService.getEmployerJobPostDetailById(slugOrId);
      const data: JobPostEditData = {
        ...resData,
        career: resData.career?.id ?? '',
        position: resData.position ?? '',
        experience: resData.experience ?? '',
        typeOfWorkplace: resData.typeOfWorkplace ?? '',
        jobType: resData.jobType ?? '',
        academicLevel: resData.academicLevel ?? '',
        genderRequired: resData.genderRequired ?? '',
        jobDescription: createEditorStateFromHTMLString(resData.jobDescription || ''),
        jobRequirement: createEditorStateFromHTMLString(resData.jobRequirement || ''),
        benefitsEnjoyed: createEditorStateFromHTMLString(resData.benefitsEnjoyed || ''),
        location: {
          city: (typeof resData.location?.city === 'object' ? resData.location?.city?.id : resData.location?.city) ?? '',
          district: (typeof resData.location?.district === 'object' ? resData.location?.district?.id : resData.location?.district) ?? '',
          address: resData.location?.address || '',
          lat: resData.location?.lat ?? '',
          lng: resData.location?.lng ?? '',
        },
      };
      dispatch({ type: 'openEdit', value: data });
    } catch (error) {
      errorHandling(error);
    } finally {
      dispatch({ type: 'setProcessing', value: false });
    }
  }, []);

  const handleShowAdd = useCallback(() => {
    dispatch({ type: 'openAdd' });
  }, []);

  const handleAddOrUpdate = async (formData: JobPostFormValues) => {
    dispatch({ type: 'setErrors', value: null });
    const editId = state.editData?.id;
    const payload: JobPostInput = {
      jobName: formData.jobName || '',
      deadline: formData.deadline ? (typeof formData.deadline === 'string' ? formData.deadline : formData.deadline.toISOString()) : '',
      quantity: Number(formData.quantity),
      salaryMin: Number(formData.salaryMin),
      salaryMax: Number(formData.salaryMax),
      isHot: formData.isHot,
      isUrgent: formData.isUrgent,
      career: Number(formData.career),
      position: Number(formData.position),
      experience: Number(formData.experience),
      academicLevel: Number(formData.academicLevel),
      jobType: Number(formData.jobType),
      interviewTemplate: formData.interviewTemplate ? Number(formData.interviewTemplate) : null,
      typeOfWorkplace: Number(formData.typeOfWorkplace),
      genderRequired: formData.genderRequired,
      jobDescription: convertEditorStateToHTMLString(formData.jobDescription as EditorState),
      jobRequirement: convertEditorStateToHTMLString(formData.jobRequirement as EditorState),
      benefitsEnjoyed: convertEditorStateToHTMLString(formData.benefitsEnjoyed as EditorState),
      contactPersonName: formData.contactPersonName,
      contactPersonPhone: formData.contactPersonPhone,
      contactPersonEmail: formData.contactPersonEmail,
      location: {
        city: Number(formData.location.city),
        district: Number(formData.location.district),
        address: formData.location.address,
        lat: null,
        lng: null,
      },
    };

    try {
      if (editId != null) {
        await updateJobPost({ id: editId, data: payload });
        toastMessages.success(t('jobPost.messages.updateSuccess'));
      } else {
        await addJobPost(payload);
        toastMessages.success(t('jobPost.messages.addSuccess'));
      }
      dispatch({ type: 'closePopup' });
    } catch (error) {
      errorHandling(error, (errs) => dispatch({ type: 'setErrors', value: errs as Record<string, string[]> }));
    }
  };

  const handleDelete = useCallback((slugOrId: string | number) => {
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
  }, [deleteJobPost, t]);

    const handleFilter = useCallback((data: { kw: string, isUrgent: number | string, statusId: string | number }) => {
    dispatch({
      type: 'setFilter',
      value: {
      kw: data.kw,
      isUrgent: data.isUrgent === 1 ? true : data.isUrgent === 2 ? false : '',
      statusId: data.statusId,
      },
    });
    onPaginationChange({ pageIndex: 0, pageSize });
  }, [onPaginationChange, pageSize]);

  const handleExport = async () => {
    dispatch({ type: 'setProcessing', value: true });
    try {
      const params = {
        page: page + 1,
        pageSize,
        ordering,
        kw: state.filterData.kw,
        isUrgent: state.filterData.isUrgent === '' ? undefined : state.filterData.isUrgent,
        status: state.filterData.statusId === '' ? undefined : state.filterData.statusId,
      };
      const resData = await jobService.exportEmployerJobPosts(params);
      xlsxUtils.exportToXLSX(resData, 'JobList');
    } catch (error) {
      errorHandling(error);
    } finally {
      dispatch({ type: 'setProcessing', value: false });
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Paper 
        elevation={0}
        sx={{ 
          p: { xs: 3, md: 5 }, 
          borderRadius: 4, 
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: (theme: Theme) => theme.customShadows?.z1,
          bgcolor: 'background.paper'
        }}
      >
        <Stack 
          direction={{ xs: 'column', sm: 'row' }} 
          alignItems={{ xs: 'flex-start', sm: 'center' }} 
          justifyContent="space-between" 
          spacing={3} 
          mb={5}
        >
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 900, color: 'text.primary', letterSpacing: '-1px', mb: 0.5 }}>
              {t('jobPost.title')}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
              {t('jobPost.manageSubtitle', 'Manage and monitor all your job postings in one place.')}
            </Typography>
          </Box>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} width={{ xs: '100%', sm: 'auto' }}>
            <Button 
              variant="outlined" 
              color="inherit" 
              startIcon={<FileDownloadOutlinedIcon />} 
              onClick={handleExport} 
              sx={{ 
                borderRadius: 2.5, 
                px: 3, 
                py: 1,
                fontWeight: 800, 
                textTransform: 'none',
                borderStyle: 'dashed'
              }}
            >
              {t('jobPost.exportList')}
            </Button>
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<AddIcon />} 
              onClick={handleShowAdd} 
              sx={{ 
                borderRadius: 3, 
                px: 4, 
                py: 1.25,
                boxShadow: (theme: Theme) => theme.customShadows?.primary, 
                fontWeight: 900,
                textTransform: 'none'
              }}
            >
              {t('jobPost.createNew')}
            </Button>
          </Stack>
        </Stack>

        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 5,
            borderRadius: 3,
            bgcolor: 'background.neutral',
            border: '1px solid',
            borderColor: 'divider'
          }}
        >
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems={{ xs: 'flex-start', md: 'center' }}>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 140 }}>
              <Box sx={{ 
                p: 0.75, 
                borderRadius: 1.5, 
                bgcolor: 'primary.extralight', 
                color: 'primary.main',
                display: 'flex'
              }}>
                <FilterListIcon sx={{ fontSize: 20 }} />
              </Box>
              <Typography variant="subtitle1" sx={{ color: 'text.primary', fontWeight: 900, letterSpacing: '0.5px' }}>
                {t('jobPost.filter').toUpperCase()}
              </Typography>
            </Stack>
            <Box flex={1} width="100%">
              <JobPostFilterForm handleFilter={handleFilter} />
            </Box>
          </Stack>
        </Paper>

        <JobPostsTable
          rows={data?.results || []}
          isLoading={isLoading}
          rowCount={data?.count || 0}
          pagination={pagination}
          onPaginationChange={onPaginationChange}
          sorting={sorting}
          onSortingChange={onSortingChange}
          handleDelete={handleDelete}
          handleUpdate={handleShowUpdate}
        />

        <FormPopup
          title={t('jobPost.popupTitle')}
          openPopup={state.openPopup}
          setOpenPopup={(open) => dispatch({ type: open ? 'openAdd' : 'closePopup' })}
        >
          <JobPostForm handleAddOrUpdate={handleAddOrUpdate} editData={state.editData} serverErrors={state.serverErrors} />
        </FormPopup>

        {(state.isProcessing || isMutating) && <BackdropLoading />}
      </Paper>
    </Box>
  );
};

export default JobPostCard;
