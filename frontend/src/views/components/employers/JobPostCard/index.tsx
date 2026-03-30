import React from 'react';
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
import type { JobPost } from '../../../../types/models';
import type { ApiError } from '../../../../types/api';





const pageSize = 10;

const JobPostCard = () => {

  const { t } = useTranslation('employer');

  const headCells = React.useMemo(() => [

    {

      id: 'jobName',

      showOrder: true,

      numeric: false,

      disablePadding: true,

      label: t('jobPost.table.jobTitle'),

    },

    {

      id: 'createAt',

      showOrder: true,

      numeric: false,

      disablePadding: false,

      label: t('jobPost.table.postDate'),

    },

    {

      id: 'deadline',

      showOrder: true,

      numeric: false,

      disablePadding: false,

      label: t('jobPost.table.deadline'),

    },

    {

      id: 'appliedTotal',

      showOrder: true,

      numeric: false,

      disablePadding: false,

      label: t('jobPost.table.applications'),

    },

    {

      id: 'viewedTotal',

      showOrder: true,

      numeric: false,

      disablePadding: false,

      label: t('jobPost.table.views'),

    },

    {

      id: 'isVerify',

      showOrder: false,

      numeric: false,

      disablePadding: false,

      label: t('jobPost.table.status'),

    },

    {

      id: 'action',

      showOrder: false,

      numeric: true,

      disablePadding: false,

      label: t('jobPost.table.actions'),

    },

  ], [t]);

  const {
    page,
    pageSize: rowsPerPage,
    sorting,
    onSortingChange,
    ordering,
    pagination,
    onPaginationChange,
  } = useDataTable({ 
    initialSorting: [{ id: 'createAt', desc: true }],
    initialPageSize: pageSize
  });

  const [count, setCount] = React.useState<number>(0);

  const [filterData, setFilterData] = React.useState<{ kw: string; isUrgent: boolean | '' }>({
    kw: '',
    isUrgent: '',
  });

  const [openPopup, setOpenPopup] = React.useState<boolean>(false);

  const [isSuccess, setIsSuccess] = React.useState<boolean>(false);

  const [isLoadingJobPost, setIsLoadingJobPost] = React.useState<boolean>(true);

  const [isFullScreenLoading, setIsFullScreenLoading] = React.useState<boolean>(false);

  const [JobPosts, setJobPosts] = React.useState<JobPost[]>([]);

  const [editData, setEditData] = React.useState<Record<string, unknown> | null>(null);

  const [serverErrors, setServerErrors] = React.useState<Record<string, string[]> | null>(null);

  const handleRequestSort = (event: React.MouseEvent<unknown>, property: string) => {
    // legacy handler, no longer needed if we use DataTable's onSortingChange
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    onPaginationChange({ pageIndex: newPage, pageSize: rowsPerPage });
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    onPaginationChange({ pageIndex: 0, pageSize: parseInt(event.target.value, 10) });
  };

  const loadJobPosts = React.useCallback(async (params: Record<string, unknown>) => {

    setIsLoadingJobPost(true);

    try {

      const resData = await jobService.getEmployerJobPost(params) as { results: JobPost[], count?: number };

      setJobPosts(resData.results);

      setCount(resData.count || resData.results?.length || 0);

    } catch (error) {

      errorHandling(error as AxiosError<{ errors?: ApiError }>);

    } finally {

      setIsLoadingJobPost(false);

    }

  }, []);

  React.useEffect(() => {

    loadJobPosts({
      page: page + 1,
      pageSize: rowsPerPage,
      ordering,
      ...filterData,
    });
  }, [loadJobPosts, isSuccess, page, rowsPerPage, ordering, filterData]);

  const handleShowUpdate = async (slugOrId: string | number) => {

    const loadJobPostDetailById = async (jobPostId: string | number) => {

      setIsFullScreenLoading(true);

      try {

        const resData = await jobService.getEmployerJobPostDetailById(

          jobPostId

        ) as unknown as Record<string, unknown>;

        let data = resData;

        data = {

          ...data,

          jobDescription: createEditorStateFromHTMLString(

            (data as Record<string, unknown>)?.jobDescription as string || ''

          ),

          jobRequirement: createEditorStateFromHTMLString(

            (data as Record<string, unknown>)?.jobRequirement as string || ''

          ),

          benefitsEnjoyed: createEditorStateFromHTMLString(

            (data as Record<string, unknown>)?.benefitsEnjoyed as string || ''

          ),

        };

        setEditData(data as Record<string, unknown>);

        setOpenPopup(true);

      } catch (error) {

        errorHandling(error as AxiosError<{ errors?: ApiError }>);

      } finally {

        setIsFullScreenLoading(false);

      }

    };

    loadJobPostDetailById(slugOrId);

  };

  const handleShowAdd = () => {

    setEditData(null);

    setOpenPopup(true);

  };

  const handleAddOrUpdate = async (data: import('../JobPostForm/JobPostSchema').JobPostFormValues) => {

    const dataCustom: Record<string, unknown> = {

      ...data,

      jobDescription: convertEditorStateToHTMLString(data.jobDescription),

      jobRequirement: convertEditorStateToHTMLString(data.jobRequirement),

      benefitsEnjoyed: convertEditorStateToHTMLString(data.benefitsEnjoyed),

    };

    const handleAdd = async (payload: Record<string, unknown>) => {

      setIsFullScreenLoading(true);

      try {

        await jobService.addJobPost(payload as unknown as Parameters<typeof jobService.addJobPost>[0]);

        setOpenPopup(false);

        setIsSuccess(!isSuccess);

        toastMessages.success(t('jobPost.messages.addSuccess'));

      } catch (error) {

        errorHandling(error as AxiosError<{ errors?: ApiError }>, setServerErrors as unknown as Parameters<typeof errorHandling>[1]);

      } finally {

        setIsFullScreenLoading(false);

      }

    };

    const update = async (payload: Record<string, unknown>) => {

      setIsFullScreenLoading(true);

      try {

        await jobService.updateJobPostById(payload.slug as string || payload.id as string, payload as unknown as Parameters<typeof jobService.updateJobPostById>[1]);

        setOpenPopup(false);

        setIsSuccess(!isSuccess);

        toastMessages.success(t('jobPost.messages.updateSuccess'));

      } catch (error) {

        errorHandling(error as AxiosError<{ errors?: ApiError }>);

      } finally {

        setIsFullScreenLoading(false);

      }

    };

    if ('id' in data) {

      update(dataCustom);

    } else {

      handleAdd(dataCustom);

    }

  };

  const handleDelete = async (slugOrId: string | number) => {

    const del = async (id: string | number) => {

      try {

        await jobService.deleteJobPostById(id);

        setIsSuccess(!isSuccess);

        toastMessages.success(t('jobPost.delete.success'));

      } catch (error) {

        errorHandling(error as AxiosError<{ errors?: ApiError }>);

      } finally {

        setIsFullScreenLoading(false);

      }

    };

    confirmModal(

      () => del(slugOrId),

      t('jobPost.delete.title'),

      t('jobPost.delete.confirm'),

      'warning'

    );

  };

  const handleFilter = (data: { kw: string, isUrgent: number | string }) => {
    setFilterData({
      kw: data.kw,
      isUrgent: data.isUrgent === 1 ? true : data.isUrgent === 2 ? false : '',
    });
    onPaginationChange({ pageIndex: 0, pageSize: rowsPerPage });
  };

  const handleExport = async () => {

    setIsFullScreenLoading(true);

    try {

      const params = {

        page: page + 1,
        pageSize: rowsPerPage,
        ordering,
        kw: filterData.kw,
        // Drop empty string to pass undefined to satisfy api get params type
        isUrgent: filterData.isUrgent === '' ? undefined : filterData.isUrgent,
      };

      const resData = await jobService.exportEmployerJobPosts(params as any);

      xlsxUtils.exportToXLSX(resData as unknown as Record<string, unknown>[], 'JobList');

    } catch (error) {

      errorHandling(error as AxiosError<{ errors?: ApiError }>);

    } finally {

      setIsFullScreenLoading(false);

    }

  };

  return (

    <Box sx={{ 

      px: { xs: 1, sm: 2 }, 

      py: { xs: 2, sm: 2 }, 

      backgroundColor: 'background.paper', 

      borderRadius: 2 

    }}>

      {/* Header Section - Responsive */}

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

          {t('jobPost.title')}

        </Typography>

        <Stack 

          direction={{ xs: 'column', sm: 'row' }} 

          spacing={2}

          width={{ xs: '100%', sm: 'auto' }}

        >

          <Button

            variant="outlined"

            color="secondary" // Original color was 'secondary'
            startIcon={<FileDownloadOutlinedIcon />}
            onClick={handleExport}
            fullWidth={false}

            sx={{

              borderRadius: 2,

              px: 3,

              '&:hover': {

                backgroundColor: 'secondary.backgroundHover'

              }

            }}

          >

            {t('jobPost.exportList')}

          </Button>

          <Button

            variant="contained"

            color="primary"

            startIcon={<AddIcon />}

            onClick={handleShowAdd}

            fullWidth={false}

            sx={{

              borderRadius: 2,

              px: 3,

              background: 'primary.main',

              boxShadow: 'custom.small',

              '&:hover': {

                boxShadow: 'custom.medium'

              }

            }}

          >

            {t('jobPost.createNew')}

          </Button>

        </Stack>

      </Stack>

      {/* Filter Section - Responsive */}

      <Stack

        direction={{ xs: 'column', md: 'row' }}

        sx={{ mb: 3 }}

        spacing={2}

        alignItems={{ xs: 'flex-start', md: 'center' }}

      >

        <Box>

          <Typography 

            variant="subtitle1" 

            sx={{ 

              color: 'text.secondary',

              fontWeight: 600,

              mb: { xs: 1, md: 0 }

            }}

          >

            {t('jobPost.filter')}

          </Typography>

        </Box>

        <Box flex={1} width="100%">

          <JobPostFilterForm handleFilter={handleFilter} />

        </Box>

      </Stack>

      {/* Loading Progress */}

      {isLoadingJobPost ? (

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

        <JobPostsTable
          rows={JobPosts}
          isLoading={isLoadingJobPost}
          rowCount={count}
          pagination={pagination}
          onPaginationChange={onPaginationChange}
          sorting={sorting}
          onSortingChange={onSortingChange}
          handleDelete={handleDelete}
          handleUpdate={handleShowUpdate}
        />

      </Box>

      <FormPopup

        title={t('jobPost.popupTitle')}

        openPopup={openPopup}

        setOpenPopup={setOpenPopup}

      >

        <JobPostForm

          handleAddOrUpdate={handleAddOrUpdate}

          editData={editData}

          serverErrors={serverErrors}

        />

      </FormPopup>

      {isFullScreenLoading && <BackdropLoading />}

    </Box>

  );

};

export default JobPostCard;
