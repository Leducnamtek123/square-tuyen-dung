'use client';
import React, { useState, useMemo, useCallback } from 'react';
import { 
  Autocomplete, 
  Box, 
  Button, 
  Divider, 
  IconButton, 
  LinearProgress, 
  Stack, 
  TextField, 
  Tooltip, 
  Typography, 
  Grid2 as Grid,
  Paper,
  alpha,
  useTheme
} from "@mui/material";
import { useTranslation } from 'react-i18next';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import FilterListIcon from '@mui/icons-material/FilterList';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import RefreshIcon from '@mui/icons-material/Refresh';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import errorHandling from '../../../../utils/errorHandling';
import BackdropLoading from '../../../../components/Common/Loading/BackdropLoading';
import xlsxUtils from '../../../../utils/xlsxUtils';
import toastMessages from '../../../../utils/toastMessages';
import { confirmModal } from '../../../../utils/sweetalert2Modal';
import FormPopup from '../../../../components/Common/Controls/FormPopup';
import AppliedResumeFilterForm from '../AppliedResumeFilterForm';
import AppliedResumeTable from '../AppliedResumeTable';
import jobPostActivityService from '../../../../services/jobPostActivityService';
import { useAppliedResumes, useJobPostOptions, useDeleteJobPostActivity, useUpdateApplicationStatus } from '../hooks/useEmployerQueries';
import { useDataTable } from '../../../../hooks';
import { useConfig } from '@/hooks/useConfig';
import type { AxiosError } from 'axios';
import type { ApiError } from '../../../../types/api';
import type { OnChangeFn, PaginationState, SortingState } from '@tanstack/react-table';

import { AppliedResumeFilterData } from '../AppliedResumeFilterForm';

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

const AppliedResumeCard: React.FC<AppliedResumeCardProps> = ({ title: cardTitle }) => {
  const { t } = useTranslation(['employer', 'common']);
  const { allConfig } = useConfig();
  const theme = useTheme();

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
  const [isProcessing, setIsProcessing] = useState(false);
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
  const { updateStatus, isMutating: isUpdatingStatus } = useUpdateApplicationStatus();

  const resumes = queryData?.results || [];
  const count = queryData?.count || 0;

  const numbersFilter = useMemo(() => {
    return Object.values(filterData).filter(v => v !== '').length;
  }, [filterData]);

  const handleFilter = useCallback((data: AppliedResumeFilterData) => {
    setOpenPopup(false);
    setFilterData({ ...data });
    onPaginationChange({ pageIndex: 0, pageSize });
  }, [onPaginationChange, pageSize]);

  const handleExport = async () => {
    setIsProcessing(true);
    try {
      const resData = await jobPostActivityService.exportAppliedResume(queryParams);
      xlsxUtils.exportToXLSX(resData as any, 'AppliedProfilesList');
    } catch (error) {
      errorHandling(error as AxiosError<{ errors?: ApiError }>);
    } finally {
      setIsProcessing(false);
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
    setFilterData(defaultFilterData);
    setJobPostIdSelect('');
    setApplicationStatusSelect('');
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
        <Stack 
          direction={{ xs: 'column', sm: 'row' }} 
          alignItems={{ xs: 'flex-start', sm: 'center' }} 
          justifyContent="space-between" 
          spacing={3} 
          mb={5}
        >
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 900, color: 'text.primary', letterSpacing: '-1px', mb: 0.5 }}>
              {cardTitle}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
              {t('employer:appliedResume.manageSubtitle', 'Track and manage candidate applications efficiently across all job postings.')}
            </Typography>
          </Box>
          <Button 
              variant="contained" 
              color="primary" 
              startIcon={<FileDownloadOutlinedIcon />} 
              onClick={handleExport} 
              sx={{ 
                borderRadius: 3, 
                px: 4, 
                py: 1.25,
                boxShadow: (theme) => theme.customShadows?.primary, 
                fontWeight: 900,
                textTransform: 'none'
              }}
          >
            {t('employer:appliedResume.downloadList')}
          </Button>
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
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 3 }}>
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
                {t('employer:appliedResume.filters').toUpperCase()}
            </Typography>
          </Stack>
          
          <Grid container spacing={3} alignItems="center">
              <Grid size={{ xs: 12, sm: 6, md: 5 }}>
                  <Autocomplete
                      getOptionLabel={(option) => option.jobName}
                      value={jobPostOptions.find((o) => String(o.id) === jobPostIdSelect) || null}
                      onChange={(e, value) => {
                          setJobPostIdSelect(value?.id ? String(value.id) : '');
                          onPaginationChange({ pageIndex: 0, pageSize });
                      }}
                      disablePortal
                      size="small"
                      options={jobPostOptions}
                      renderInput={(params) => (
                          <TextField 
                              {...params} 
                              placeholder={t('employer:appliedResume.allJobPosts')}
                              InputProps={{
                                ...params.InputProps,
                                startAdornment: (
                                  <>
                                    <WorkOutlineIcon sx={{ color: 'text.disabled', mr: 1, fontSize: 20 }} />
                                    {params.InputProps.startAdornment}
                                  </>
                                ),
                              }}
                              sx={{ 
                                '& .MuiOutlinedInput-root': { 
                                  borderRadius: 2, 
                                  bgcolor: 'background.paper',
                                  fontWeight: 600
                                } 
                              }} 
                          />
                      )}
                  />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <Autocomplete
                      getOptionLabel={(option) => option.name}
                      value={allConfig?.applicationStatusOptions?.find(o => String(o.id) === applicationStatusSelect) || null}
                      onChange={(e, value) => {
                          setApplicationStatusSelect(value?.id ? String(value.id) : '');
                          onPaginationChange({ pageIndex: 0, pageSize });
                      }}
                      disablePortal
                      size="small"
                      options={allConfig?.applicationStatusOptions || []}
                      renderInput={(params) => (
                          <TextField 
                              {...params} 
                              placeholder={t('employer:appliedResume.allStatuses')}
                              InputProps={{
                                ...params.InputProps,
                                startAdornment: (
                                  <>
                                    <AssignmentTurnedInIcon sx={{ color: 'text.disabled', mr: 1, fontSize: 20 }} />
                                    {params.InputProps.startAdornment}
                                  </>
                                ),
                              }}
                              sx={{ 
                                '& .MuiOutlinedInput-root': { 
                                  borderRadius: 2, 
                                  bgcolor: 'background.paper',
                                  fontWeight: 600
                                } 
                              }} 
                          />
                      )}
                  />
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                  <Stack direction="row" spacing={1.5} justifyContent={{ xs: 'flex-end', md: 'flex-end' }}>
                      <Tooltip title={t('common:reset')} arrow>
                          <IconButton 
                              onClick={handleResetFilterData} 
                              sx={{ 
                                  bgcolor: 'background.paper', 
                                  borderRadius: 2,
                                  border: '1px solid',
                                  borderColor: 'divider',
                                  '&:hover': { bgcolor: 'action.hover' }
                              }}
                          >
                              <RefreshIcon sx={{ fontSize: 20 }} />
                          </IconButton>
                      </Tooltip>
                      <Button
                          variant="outlined"
                          color="inherit"
                          startIcon={<FilterListIcon />}
                          endIcon={<ExpandMoreIcon />}
                          onClick={() => setOpenPopup(true)}
                          sx={{ 
                              borderRadius: 2.5, 
                              px: 3, 
                              fontWeight: 800,
                              textTransform: 'none',
                              bgcolor: 'background.paper',
                              borderStyle: 'dashed',
                              '&:hover': { bgcolor: 'primary.extralight', borderColor: 'primary.main', borderStyle: 'solid' }
                          }}
                      >
                          {t('employer:appliedResume.advancedFilter')} 
                          {numbersFilter > 0 && (
                            <Box 
                              component="span" 
                              sx={{ 
                                ml: 1, 
                                px: 1, 
                                py: 0.25, 
                                borderRadius: 1, 
                                bgcolor: 'primary.main', 
                                color: 'white',
                                fontSize: '0.75rem',
                                fontWeight: 900
                              }}
                            >
                              {numbersFilter}
                            </Box>
                          )}
                      </Button>
                  </Stack>
              </Grid>
          </Grid>
        </Paper>

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
        />

        <FormPopup title={t('employer:appliedResume.advancedFilter')} openPopup={openPopup} setOpenPopup={setOpenPopup}>
          <AppliedResumeFilterForm handleFilter={handleFilter} filterData={filterData} />
        </FormPopup>

        {(isProcessing || isDeleting || isUpdatingStatus) && <BackdropLoading />}
      </Paper>
    </Box>
  );
};

export default AppliedResumeCard;
