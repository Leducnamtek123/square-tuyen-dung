import React from 'react';
import { useAppSelector } from '@/redux/hooks';

import { Autocomplete, Box, Button, Divider, IconButton, LinearProgress, Stack, TextField, Tooltip, Typography } from "@mui/material";

import { useTranslation } from 'react-i18next';

import Grid from "@mui/material/Grid2";

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
import { useConfig } from '@/hooks/useConfig';

interface AppliedResumeCardProps {
  title: string;
}

const pageSize = 10;

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

  const { t } = useTranslation('employer');

  const { allConfig } = useConfig();

  const headCells = [

    {

      id: 'title',

      showOrder: false,

      numeric: false,

      disablePadding: true,

      label: t('appliedResume.table.profileName'),

    },

    {

      id: 'jobName',

      showOrder: false,

      numeric: false,

      disablePadding: false,

      label: t('appliedResume.table.appliedPosition'),

    },

    {

      id: 'appliedDate',

      showOrder: false,

      numeric: false,

      disablePadding: false,

      label: t('appliedResume.table.appliedDate'),

    },

    {

      id: 'type',

      showOrder: false,

      numeric: false,

      disablePadding: false,

      label: t('appliedResume.table.profileType'),

    },

    {

      id: 'aiAnalysis',

      showOrder: false,

      numeric: false,

      disablePadding: false,

      label: t('appliedResume.table.aiAnalysis'),

    },

    {

      id: 'city',

      showOrder: false,

      numeric: true,

      disablePadding: false,

      label: t('appliedResume.table.status'),

    },

    {

      id: 'action',

      showOrder: false,

      numeric: true,

      disablePadding: false,

      label: t('appliedResume.table.actions'),

    },

  ];

  const [openPopup, setOpenPopup] = React.useState(false);

  const [page, setPage] = React.useState(0);

  const [rowsPerPage, setRowsPerPage] = React.useState(pageSize);

  const [filterData, setFilterData] = React.useState(defaultFilterData);

  const [isFullScreenLoading, setIsFullScreenLoading] = React.useState(false);

  const [jobPostIdSelect, setJobPostIdSelect] = React.useState('');

  const [applicationStatusSelect, setApplicationStatusSelect] =

    React.useState('');

  // TanStack Query hooks
  const { data: jobPostOptions = [] } = useJobPostOptions();

  const queryParams = React.useMemo(() => ({
    page: page + 1,
    pageSize: rowsPerPage,
    ...filterData,
    jobPostId: jobPostIdSelect,
    status: applicationStatusSelect,
  }), [page, rowsPerPage, filterData, jobPostIdSelect, applicationStatusSelect]);

  const { data: queryData, isLoading } = useAppliedResumes(queryParams);
  const resumes = queryData?.results || [];
  const count = queryData?.count || 0;

  const deleteMutation = useDeleteJobPostActivity();

  let numbersFilter = React.useMemo(() => {
    let cnt = 0;
    let keys = Object.keys(filterData) as Array<keyof typeof filterData>;
    for (let i = 0; i < keys.length; i++) {
      if (
        keys[i] !== ('jobPostId' as any) &&
        keys[i] !== ('pageSize' as any) &&
        (filterData as any)[keys[i]] !== ''
      ) {
        cnt = cnt + 1;
      }
    }
    return cnt;
  }, [filterData]);

  const handleFilter = (data: any) => {

    setOpenPopup(false);

    setFilterData({

      ...data,

      pageSize: pageSize,

    });

    setPage(0);

  };

  const handleExport = () => {

    const exportJobPostsActivity = async (params: any) => {

      setIsFullScreenLoading(true);

      try {

        const resData = await jobPostActivityService.exportAppliedResume(

          params

        ) as any;

        const data = resData;

        xlsxUtils.exportToXLSX(data, 'AppliedProfilesList');

      } catch (error: any) {

        errorHandling(error);

      } finally {

        setIsFullScreenLoading(false);

      }

    };

    exportJobPostsActivity({

      page: page + 1,

      pageSize: rowsPerPage,

      ...filterData,

      jobPostId: jobPostIdSelect,

      status: applicationStatusSelect,

    });

  };

  const handleChangeApplicationStatus = (id: string, value: any, callback: (result: boolean) => void) => {

    const changeStatus = async (id: string, data: any) => {

      setIsFullScreenLoading(true);

      try {

        await jobPostActivityService.changeApplicationStatus(id, data);

        toastMessages.success(t('appliedResume.status.updateSuccess'));

        // success

        callback(true);

      } catch (error: any) {

        // Failed

        errorHandling(error);

        callback(false);

      } finally {

        setIsFullScreenLoading(false);

      }

    };

    changeStatus(id, { status: value });

  };

  const handleDelete = (id: string) => {

    confirmModal(

      () => deleteMutation.mutate(id, {
        onSuccess: () => toastMessages.success(t('appliedResume.delete.success')),
      }),

      t('appliedResume.delete.title'),

      t('appliedResume.delete.confirm'),

      'warning'

    );

  };

  const handleChangePage = (event: unknown, newPage: number) => {

    setPage(newPage);

  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {

    setRowsPerPage(parseInt(event.target.value, 10));

    setPage(0);

  };

  const handleResetFilterData = () => {

    setFilterData(defaultFilterData);

    setJobPostIdSelect('');

    setApplicationStatusSelect('');

  };

  return (

    <Box sx={{

      px: { xs: 1, sm: 2 },

      py: { xs: 2, sm: 2 },

      backgroundColor: 'background.paper',

      borderRadius: 2

    }}>

      {/* Header Section */}

      <Stack

        direction={{ xs: 'column', sm: 'row' }}

        alignItems={{ xs: 'flex-start', sm: 'center' }}

        justifyContent="space-between"

        spacing={{ xs: 2, sm: 0 }}

        mb={4}

      >

        <Typography

          variant="h5"

          sx={{

            fontWeight: 600,

            background: 'primary.main',

            WebkitBackgroundClip: 'text',

            fontSize: { xs: '1.25rem', sm: '1.5rem' }

          }}

        >

          {cardTitle}

        </Typography>

        <Button

          variant="outlined"

          color="secondary"

          startIcon={<FileDownloadOutlinedIcon />}

          onClick={handleExport}

          sx={{

            borderRadius: 2,

            px: 3,

            width: { xs: '100%', sm: 'auto' },

            '&:hover': {

              backgroundColor: 'secondary.backgroundHover'

            }

          }}

        >

          {t('appliedResume.downloadList')}

        </Button>

      </Stack>

      {/* Filter Section */}

      <Box sx={{ mb: 3 }}>

        <Typography

          variant="subtitle1"

          sx={{

            color: 'text.secondary',

            fontWeight: 600,

            mb: 2

          }}

        >

          {t('appliedResume.filters')}

        </Typography>

        <Grid container spacing={2}>

          <Grid

            size={{

              xs: 12,

              sm: 6,

              md: 4,

              xl: 5

            }}>

            <Autocomplete

              getOptionLabel={(option) => option.jobName}

              value={jobPostOptions.find((o: any) => o.id === jobPostIdSelect) || null}

              onChange={(e, value) => setJobPostIdSelect(value?.id || '')}

              disablePortal

              size="small"

              options={jobPostOptions}

              renderInput={(params) => (

                <TextField

                  {...params}

                  placeholder={t('appliedResume.allJobPosts')}

                  sx={{

                    '& .MuiOutlinedInput-root': {

                      borderRadius: 2,

                      backgroundColor: 'background.paper'

                    }

                  }}

                />

              )}

            />

          </Grid>

          <Grid

            size={{

              xs: 12,

              sm: 6,

              md: 4,

              xl: 3

            }}>

            <Autocomplete

              getOptionLabel={(option) => option.name}

              value={

                (allConfig?.applicationStatusOptions as any[])?.find(

                  (o: any) => o.id === applicationStatusSelect

                ) || null

              }

              onChange={(e, value) => setApplicationStatusSelect(value?.id || '')}

              disablePortal

              size="small"

              options={(allConfig?.applicationStatusOptions as any[]) || []}

              renderInput={(params) => (

                <TextField

                  {...params}

                  placeholder={t('appliedResume.allStatuses')}

                  sx={{

                    '& .MuiOutlinedInput-root': {

                      borderRadius: 2,

                      backgroundColor: 'background.paper'

                    }

                  }}

                />

              )}

            />

          </Grid>

          <Grid

            size={{

              xs: 12,

              sm: 12,

              md: 4

            }}>

            <Stack

              direction="row"

              justifyContent={{ xs: 'flex-start', md: 'flex-start' }}

              spacing={1}

            >

              <Tooltip title={t('common:reset')} arrow>

                <IconButton

                  onClick={handleResetFilterData}

                  sx={{

                    backgroundColor: 'grey.100',

                    borderRadius: 2,

                    '&:hover': {

                      backgroundColor: 'grey.200'

                    }

                  }}

                >

                  <RefreshIcon />

                </IconButton>

              </Tooltip>

              <Button

                variant="contained"

                color="primary"

                startIcon={<FilterListIcon />}

                endIcon={<ExpandMoreIcon />}

                onClick={() => setOpenPopup(true)}

                sx={{

                  borderRadius: 2,

                  background: 'primary.main',

                  boxShadow: 'custom.small',

                  '&:hover': {

                    boxShadow: 'custom.medium'

                  }

                }}

              >

                {t('appliedResume.advancedFilter')} ({numbersFilter})

              </Button>

            </Stack>

          </Grid>

        </Grid>

      </Box>

      {/* Loading Progress */}

      {isLoading ? (

        <Box sx={{ width: '100%', mb: 2 }}>

          <LinearProgress

            color="primary"

            sx={{

              height: { xs: 4, sm: 6 },

              borderRadius: 3,

              backgroundColor: 'primary.background'

            }}

          />

        </Box>

      ) : (

        <Divider sx={{ mb: 2 }} />

      )}

      {/* Table Section */}

      <Box sx={{

        backgroundColor: 'background.paper',

        borderRadius: 2,

        boxShadow: 'custom.card',

        overflow: 'hidden',

        width: '100%',

        '& .MuiTableContainer-root': {

          overflowX: 'auto'

        }

      }}>

        <AppliedResumeTable

          headCells={headCells}

          rows={resumes}

          isLoading={isLoading}

          page={page}

          rowsPerPage={rowsPerPage}

          count={count}

          handleChangeApplicationStatus={handleChangeApplicationStatus}

          handleChangePage={handleChangePage}

          handleChangeRowsPerPage={handleChangeRowsPerPage}

          handleDelete={handleDelete}

        />

      </Box>

      {/* Popup and Loading remain unchanged */}

      <FormPopup

        title={t('appliedResume.advancedFilter')}

        buttonText={t('common:search')}

        buttonIcon={<FilterListIcon />}

        openPopup={openPopup}

        setOpenPopup={setOpenPopup}

      >

        <AppliedResumeFilterForm

          handleFilter={handleFilter}

          filterData={filterData}

        />

      </FormPopup>

      {isFullScreenLoading && <BackdropLoading />}

    </Box>

  );

};

export default AppliedResumeCard;
