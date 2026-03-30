import React, { useState, useMemo } from 'react';
import { Autocomplete, Box, Button, Divider, IconButton, LinearProgress, Stack, TextField, Tooltip, Typography, Grid2 as Grid } from "@mui/material";
import { useTranslation } from 'react-i18next';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import FilterListIcon from '@mui/icons-material/FilterList';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import RefreshIcon from '@mui/icons-material/Refresh';
import errorHandling from '../../../../utils/errorHandling';
import BackdropLoading from '../../../../components/Common/Loading/BackdropLoading';
import xlsxUtils from '../../../../utils/xlsxUtils';
import toastMessages from '../../../../utils/toastMessages';
import { confirmModal } from '../../../../utils/sweetalert2Modal';
import FormPopup from '../../../../components/Common/Controls/FormPopup';
import AppliedResumeFilterForm from '../AppliedResumeFilterForm';
import AppliedResumeTable from '../AppliedResumeTable';
import jobPostActivityService from '../../../../services/jobPostActivityService';
import { useAppliedResumes, useJobPostOptions, useDeleteJobPostActivity } from '../hooks/useEmployerQueries';
import { useDataTable } from '../../../../hooks';
import { useConfig } from '@/hooks/useConfig';
import type { AxiosError } from 'axios';
import type { ApiError } from '../../../../types/api';

interface AppliedResumeCardProps {
  title: string;
}

const defaultFilterData = {
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

const AppliedResumeCard: React.FC<AppliedResumeCardProps> = ({ title: cardTitle }) => {
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
    initialPageSize: 10
  });

  const [filterData, setFilterData] = useState(defaultFilterData);
  const [openPopup, setOpenPopup] = useState(false);
  const [isFullScreenLoading, setIsFullScreenLoading] = useState(false);
  const [jobPostIdSelect, setJobPostIdSelect] = useState('');
  const [applicationStatusSelect, setApplicationStatusSelect] = useState('');

  const { data: jobPostOptions = [] } = useJobPostOptions();

  const queryParams = useMemo(() => ({
    page: page + 1,
    pageSize,
    ordering,
    ...filterData,
    jobPostId: jobPostIdSelect,
    status: applicationStatusSelect,
  }), [page, pageSize, ordering, filterData, jobPostIdSelect, applicationStatusSelect]);

  const { data: queryData, isLoading } = useAppliedResumes(queryParams);
  const { deleteJobPostActivity, isMutating: isDeleting } = useDeleteJobPostActivity();
  const resumes = queryData?.results || [];
  const count = queryData?.count || 0;

  const numbersFilter = useMemo(() => {
    return Object.values(filterData).filter(v => v !== '').length;
  }, [filterData]);

  const handleFilter = (data: typeof defaultFilterData) => {
    setOpenPopup(false);
    setFilterData({ ...data });
    onPaginationChange({ pageIndex: 0, pageSize });
  };

  const handleExport = async () => {
    setIsFullScreenLoading(true);
    try {
      const resData = await jobPostActivityService.exportAppliedResume(queryParams);
      xlsxUtils.exportToXLSX(resData as unknown as Record<string, unknown>[], 'AppliedProfilesList');
    } catch (error) {
      errorHandling(error as AxiosError<{ errors?: ApiError }>);
    } finally {
      setIsFullScreenLoading(false);
    }
  };

  const handleChangeApplicationStatus = async (id: string | number, value: string | number, callback: (result: boolean) => void) => {
    setIsFullScreenLoading(true);
    try {
      await jobPostActivityService.changeApplicationStatus(id as string, { status: value });
      toastMessages.success(t('employer:appliedResume.status.updateSuccess'));
      callback(true);
    } catch (error) {
      errorHandling(error as AxiosError<{ errors?: ApiError }>);
      callback(false);
    } finally {
      setIsFullScreenLoading(false);
    }
  };

  const handleDelete = (id: string | number) => {
    confirmModal(
      async () => {
        try {
          await deleteJobPostActivity(id);
          toastMessages.success(t('employer:appliedResume.delete.success'));
        } catch (error) {
           errorHandling(error as AxiosError<{ errors?: ApiError }>);
        }
      },
      t('employer:appliedResume.delete.title'),
      t('employer:appliedResume.delete.confirm'),
      'warning'
    );
  };

  const handleResetFilterData = () => {
    setFilterData(defaultFilterData);
    setJobPostIdSelect('');
    setApplicationStatusSelect('');
    onPaginationChange({ pageIndex: 0, pageSize });
  };

  return (
    <Box sx={{ px: { xs: 1, sm: 2 }, py: { xs: 2, sm: 2 }, backgroundColor: 'background.paper', borderRadius: 2 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between" spacing={{ xs: 2, sm: 0 }} mb={4}>
        <Typography variant="h5" sx={{ fontWeight: 600, fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
          {cardTitle}
        </Typography>
        <Button variant="outlined" color="inherit" startIcon={<FileDownloadOutlinedIcon />} onClick={handleExport} sx={{ borderRadius: 2, px: 3, width: { xs: '100%', sm: 'auto' } }}>
          {t('employer:appliedResume.downloadList')}
        </Button>
      </Stack>

      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" sx={{ color: 'text.secondary', fontWeight: 600, mb: 2 }}>
          {t('employer:appliedResume.filters')}
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, md: 4, xl: 5 }}>
            <Autocomplete
              getOptionLabel={(option) => option.jobName}
              value={jobPostOptions.find((o) => String(o.id) === jobPostIdSelect) || null}
              onChange={(e, value) => setJobPostIdSelect(value?.id ? String(value.id) : '')}
              disablePortal
              size="small"
              options={jobPostOptions}
              renderInput={(params) => <TextField {...params} placeholder={t('employer:appliedResume.allJobPosts')} />}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4, xl: 3 }}>
            <Autocomplete
              getOptionLabel={(option) => option.name}
              value={(allConfig?.applicationStatusOptions as any[])?.find(o => String(o.id) === applicationStatusSelect) || null}
              onChange={(e, value) => setApplicationStatusSelect(value?.id ? String(value.id) : '')}
              disablePortal
              size="small"
              options={(allConfig?.applicationStatusOptions as any[]) || []}
              renderInput={(params) => <TextField {...params} placeholder={t('employer:appliedResume.allStatuses')} />}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 12, md: 4 }}>
            <Stack direction="row" spacing={1}>
              <Tooltip title={t('common:reset')} arrow>
                <IconButton onClick={handleResetFilterData} sx={{ backgroundColor: 'action.hover', borderRadius: 2 }}>
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
              <Button
                variant="contained"
                color="primary"
                startIcon={<FilterListIcon />}
                endIcon={<ExpandMoreIcon />}
                onClick={() => setOpenPopup(true)}
                sx={{ borderRadius: 2, px: 3, boxShadow: 'none' }}
              >
                {t('employer:appliedResume.advancedFilter')} ({numbersFilter})
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Box>

      {isLoading ? (
        <Box sx={{ width: '100%', mb: 2 }}>
          <LinearProgress />
        </Box>
      ) : (
        <Divider sx={{ mb: 2 }} />
      )}

      <Box sx={{ backgroundColor: 'background.paper', borderRadius: 2, overflow: 'hidden', width: '100%' }}>
        <AppliedResumeTable
          rows={resumes}
          isLoading={isLoading}
          rowCount={count}
          pagination={pagination}
          onPaginationChange={onPaginationChange as any}
          sorting={sorting}
          onSortingChange={onSortingChange as any}
          handleChangeApplicationStatus={handleChangeApplicationStatus}
          handleDelete={handleDelete}
        />
      </Box>

      <FormPopup title={t('employer:appliedResume.advancedFilter')} openPopup={openPopup} setOpenPopup={setOpenPopup}>
        <AppliedResumeFilterForm handleFilter={handleFilter} filterData={filterData} />
      </FormPopup>

      {(isFullScreenLoading || isDeleting) && <BackdropLoading />}
    </Box>
  );
};

export default AppliedResumeCard;
