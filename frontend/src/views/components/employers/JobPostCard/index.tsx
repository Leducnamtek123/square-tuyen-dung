import React, { useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Button, Divider, LinearProgress, Stack, Typography } from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
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
import jobService from '../../../../services/jobService';
import JobPostsTable from '../JobPostsTable';
import { useDataTable } from '../../../../hooks';
import { useEmployerJobPosts, useJobPostMutations } from '../hooks/useEmployerQueries';
import type { ApiError } from '../../../../types/api';

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

  const [filterData, setFilterData] = useState<{ kw: string; isUrgent: boolean | ''; statusId: string | number }>({
    kw: '',
    isUrgent: '',
    statusId: '',
  });

  const { data, isLoading } = useEmployerJobPosts({
    page: page + 1,
    pageSize,
    ordering,
    kw: filterData.kw,
    isUrgent: filterData.isUrgent === '' ? undefined : filterData.isUrgent,
    status: filterData.statusId === '' ? undefined : filterData.statusId,
  });

  const { addJobPost, updateJobPost, deleteJobPost, isMutating } = useJobPostMutations();

  const [openPopup, setOpenPopup] = useState(false);
  const [editData, setEditData] = useState<Record<string, unknown> | null>(null);
  const [serverErrors, setServerErrors] = useState<Record<string, string[]> | null>(null);
  const [isFullScreenLoading, setIsFullScreenLoading] = useState(false);

  const handleShowUpdate = async (slugOrId: string | number) => {
    setIsFullScreenLoading(true);
    try {
      const resData = await jobService.getEmployerJobPostDetailById(slugOrId);
      const data = {
        ...resData,
        jobDescription: createEditorStateFromHTMLString(resData.jobDescription || ''),
        jobRequirement: createEditorStateFromHTMLString(resData.jobRequirement || ''),
        benefitsEnjoyed: createEditorStateFromHTMLString(resData.benefitsEnjoyed || ''),
      };
      setEditData(data as unknown as Record<string, unknown>);
      setOpenPopup(true);
    } catch (error) {
      errorHandling(error as AxiosError<{ errors?: ApiError }>);
    } finally {
      setIsFullScreenLoading(false);
    }
  };

  const handleShowAdd = () => {
    setEditData(null);
    setOpenPopup(true);
  };

  const handleAddOrUpdate = async (formData: any) => {
    const payload = {
      ...formData,
      jobDescription: convertEditorStateToHTMLString(formData.jobDescription),
      jobRequirement: convertEditorStateToHTMLString(formData.jobRequirement),
      benefitsEnjoyed: convertEditorStateToHTMLString(formData.benefitsEnjoyed),
    };

    setIsFullScreenLoading(true);
    try {
      if (editData && 'id' in editData) {
        await updateJobPost({ id: editData.id as string | number, data: payload });
        toastMessages.success(t('jobPost.messages.updateSuccess'));
      } else {
        await addJobPost(payload);
        toastMessages.success(t('jobPost.messages.addSuccess'));
      }
      setOpenPopup(false);
    } catch (error) {
      errorHandling(error as AxiosError<{ errors?: ApiError }>, setServerErrors as any);
    } finally {
      setIsFullScreenLoading(false);
    }
  };

  const handleDelete = (slugOrId: string | number) => {
    confirmModal(
      async () => {
        setIsFullScreenLoading(true);
        try {
          await deleteJobPost(slugOrId);
          toastMessages.success(t('jobPost.delete.success'));
        } catch (error) {
          errorHandling(error as AxiosError<{ errors?: ApiError }>);
        } finally {
          setIsFullScreenLoading(false);
        }
      },
      t('jobPost.delete.title'),
      t('jobPost.delete.confirm'),
      'warning'
    );
  };

  const handleFilter = (data: { kw: string, isUrgent: number | string, statusId: string | number }) => {
    setFilterData({
      kw: data.kw,
      isUrgent: data.isUrgent === 1 ? true : data.isUrgent === 2 ? false : '',
      statusId: data.statusId,
    });
    onPaginationChange({ pageIndex: 0, pageSize });
  };

  const handleExport = async () => {
    setIsFullScreenLoading(true);
    try {
      const params = {
        page: page + 1,
        pageSize,
        ordering,
        kw: filterData.kw,
        isUrgent: filterData.isUrgent === '' ? undefined : filterData.isUrgent,
        status: filterData.statusId === '' ? undefined : filterData.statusId,
      };
      const resData = await jobService.exportEmployerJobPosts(params);
      xlsxUtils.exportToXLSX(resData as unknown as Record<string, unknown>[], 'JobList');
    } catch (error) {
      errorHandling(error as AxiosError<{ errors?: ApiError }>);
    } finally {
      setIsFullScreenLoading(false);
    }
  };

  return (
    <Box sx={{ px: { xs: 1, sm: 2 }, py: { xs: 2, sm: 2 }, backgroundColor: 'background.paper', borderRadius: 2 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between" spacing={{ xs: 2, sm: 0 }} mb={4}>
        <Typography variant="h5" sx={{ fontWeight: 600, fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
          {t('jobPost.title')}
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} width={{ xs: '100%', sm: 'auto' }}>
          <Button variant="outlined" color="inherit" startIcon={<FileDownloadOutlinedIcon />} onClick={handleExport} sx={{ borderRadius: 2, px: 3 }}>
            {t('jobPost.exportList')}
          </Button>
          <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={handleShowAdd} sx={{ borderRadius: 2, px: 3, boxShadow: 'none' }}>
            {t('jobPost.createNew')}
          </Button>
        </Stack>
      </Stack>

      <Stack direction={{ xs: 'column', md: 'row' }} sx={{ mb: 3 }} spacing={2} alignItems={{ xs: 'flex-start', md: 'center' }}>
        <Box>
          <Typography variant="subtitle1" sx={{ color: 'text.secondary', fontWeight: 600 }}>
            {t('jobPost.filter')}
          </Typography>
        </Box>
        <Box flex={1} width="100%">
          <JobPostFilterForm handleFilter={handleFilter} />
        </Box>
      </Stack>

      {isLoading ? (
        <Box sx={{ width: '100%', mb: 2 }}>
          <LinearProgress />
        </Box>
      ) : (
        <Divider sx={{ mb: 2 }} />
      )}

      <Box sx={{ backgroundColor: 'background.paper', borderRadius: 2, overflow: 'hidden', width: '100%' }}>
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
      </Box>

      <FormPopup title={t('jobPost.popupTitle')} openPopup={openPopup} setOpenPopup={setOpenPopup}>
        <JobPostForm handleAddOrUpdate={handleAddOrUpdate} editData={editData} serverErrors={serverErrors} />
      </FormPopup>

      {(isFullScreenLoading || isMutating) && <BackdropLoading />}
    </Box>
  );
};

export default JobPostCard;
