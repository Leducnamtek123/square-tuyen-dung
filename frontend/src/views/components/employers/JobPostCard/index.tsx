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
import FormPopup from '../../../../components/Common/Controls/FormPopup';
import JobPostFilterForm from '../JobPostFilterForm';
import JobPostForm from '../JobPostForm';
import jobService from '../../../../services/jobService';
import JobPostsTable from '../JobPostsTable';

interface JobPost {
  id: number;
  slug?: string;
  jobName: string;
  createAt: string;
  deadline: string;
  appliedTotal: number;
  viewedTotal: number;
  isVerify: boolean;
  isUrgent: boolean;
  [key: string]: any;
}



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

  const [order, setOrder] = React.useState<'asc' | 'desc'>('asc');

  const [orderBy, setOrderBy] = React.useState<string>('createAt');

  const [page, setPage] = React.useState<number>(0);

  const [count, setCount] = React.useState<number>(0);

  const [rowsPerPage, setRowsPerPage] = React.useState<number>(pageSize);

  const [filterData, setFilterData] = React.useState<any>({

    kw: '',

    isUrgent: '',

  });

  const [openPopup, setOpenPopup] = React.useState<boolean>(false);

  const [isSuccess, setIsSuccess] = React.useState<boolean>(false);

  const [isLoadingJobPost, setIsLoadingJobPost] = React.useState<boolean>(true);

  const [isFullScreenLoading, setIsFullScreenLoading] = React.useState<boolean>(false);

  const [JobPosts, setJobPosts] = React.useState<JobPost[]>([]);

  const [editData, setEditData] = React.useState<any>(null);

  const [serverErrors, setServerErrors] = React.useState<any>(null);

  const handleRequestSort = (event: React.MouseEvent<unknown>, property: string) => {

    const isAsc = orderBy === property && order === 'asc';

    setOrder(isAsc ? 'desc' : 'asc');

    setOrderBy(property);

  };

  const handleChangePage = (event: unknown, newPage: number) => {

    setPage(newPage);

  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {

    setRowsPerPage(parseInt(event.target.value, 10));

    setPage(0);

  };

  const loadJobPosts = React.useCallback(async (params: any) => {

    setIsLoadingJobPost(true);

    try {

      const resData: any = await jobService.getJobPosts(params);

      setJobPosts(resData.results);

      setCount(resData.count || resData.results?.length || 0);

    } catch (error: any) {

      errorHandling(error);

    } finally {

      setIsLoadingJobPost(false);

    }

  }, []);

  React.useEffect(() => {

    loadJobPosts({

      page: page + 1,

      pageSize: rowsPerPage,

      ordering: `${order === 'desc' ? '-' : ''}${orderBy}`,

      ...filterData,

    });

  }, [loadJobPosts, isSuccess, page, rowsPerPage, order, orderBy, filterData]);

  const handleShowUpdate = async (slugOrId: string | number) => {

    const loadJobPostDetailById = async (jobPostId: string | number) => {

      setIsFullScreenLoading(true);

      try {

        const resData: any = await jobService.getEmployerJobPostDetailById(

          jobPostId

        );

        let data = resData;

        data = {

          ...data,

          jobDescription: createEditorStateFromHTMLString(

            data?.jobDescription || ''

          ),

          jobRequirement: createEditorStateFromHTMLString(

            data?.jobRequirement || ''

          ),

          benefitsEnjoyed: createEditorStateFromHTMLString(

            (data as any)?.benefitsEnjoyed || ''

          ),

        };

        setEditData(data as any);

        setOpenPopup(true);

      } catch (error: any) {

        errorHandling(error);

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

  const handleAddOrUpdate = async (data: any) => {

    const dataCustom = {

      ...data,

      jobDescription: convertEditorStateToHTMLString(data.jobDescription),

      jobRequirement: convertEditorStateToHTMLString(data.jobRequirement),

      benefitsEnjoyed: convertEditorStateToHTMLString(data.benefitsEnjoyed),

    };

    const handleAdd = async (data: any) => {

      setIsFullScreenLoading(true);

      try {

        await jobService.addJobPost(data);

        setOpenPopup(false);

        setIsSuccess(!isSuccess);

        toastMessages.success(t('jobPost.messages.addSuccess'));

      } catch (error: any) {

        errorHandling(error, setServerErrors);

      } finally {

        setIsFullScreenLoading(false);

      }

    };

    const update = async (data: any) => {

      setIsFullScreenLoading(true);

      try {

        await jobService.updateJobPostById(data.slug || data.id, data);

        setOpenPopup(false);

        setIsSuccess(!isSuccess);

        toastMessages.success(t('jobPost.messages.updateSuccess'));

      } catch (error: any) {

        errorHandling(error);

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

      } catch (error: any) {

        errorHandling(error);

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

      ...data,

      isUrgent: data.isUrgent === 1 ? true : data.isUrgent === 2 ? false : '',

      pageSize: rowsPerPage,

    });

    setPage(0);

  };

  const handleExport = async () => {

    setIsFullScreenLoading(true);

    try {

      const params = {

        page: page + 1,

        pageSize: rowsPerPage,

        ordering: `${order === 'desc' ? '-' : ''}${orderBy}`,

        ...filterData,

      };

      const resData: any = await jobService.exportEmployerJobPosts(params);

      xlsxUtils.exportToXLSX(resData, 'JobList');

    } catch (error: any) {

      errorHandling(error);

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

          headCells={headCells}

          rows={JobPosts}

          isLoading={isLoadingJobPost}

          order={order}

          orderBy={orderBy}

          page={page}

          rowsPerPage={rowsPerPage}

          count={count}

          handleRequestSort={handleRequestSort}

          handleChangePage={handleChangePage}

          handleChangeRowsPerPage={handleChangeRowsPerPage}

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
