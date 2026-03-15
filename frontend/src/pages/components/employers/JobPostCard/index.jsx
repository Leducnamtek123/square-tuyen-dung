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

import BackdropLoading from '../../../../components/loading/BackdropLoading';

import xlsxUtils from '../../../../utils/xlsxUtils';

import FormPopup from '../../../../components/controls/FormPopup';

import JobPostFilterForm from '../JobPostFilterForm';

import JobPostForm from '../JobPostForm';

import jobService from '../../../../services/jobService';

import JobPostsTable from '../JobPostsTable';

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

  const [order, setOrder] = React.useState('asc');

  const [orderBy, setOrderBy] = React.useState('createAt');

  const [page, setPage] = React.useState(0);

  const [count, setCount] = React.useState(0);

  const [rowsPerPage, setRowsPerPage] = React.useState(pageSize);

  const [filterData, setFilterData] = React.useState({

    kw: '',

    isUrgent: '',

  });

  const [openPopup, setOpenPopup] = React.useState(false);

  const [isSuccess, setIsSuccess] = React.useState(false);

  const [isLoadingJobPost, setIsLoadingJobPost] = React.useState(true);

  const [isFullScreenLoading, setIsFullScreenLoading] = React.useState(false);

  const [JobPosts, setJobPosts] = React.useState([]);

  const [editData, setEditData] = React.useState(null);

  const [serverErrors, setServerErrors] = React.useState(null);

  const handleRequestSort = (event, property) => {

    const isAsc = orderBy === property && order === 'asc';

    setOrder(isAsc ? 'desc' : 'asc');

    setOrderBy(property);

  };

  const handleChangePage = (event, newPage) => {

    setPage(newPage);

  };

  const handleChangeRowsPerPage = (event) => {

    setRowsPerPage(parseInt(event.target.value, 10));

    setPage(0);

  };

  React.useEffect(() => {

    const loadJobPosts = async (params) => {

      setIsLoadingJobPost(true);

      try {

        const resData = await jobService.getEmployerJobPost(params);

        const data = resData;

        const rawPosts = Array.isArray(data?.results)

          ? data.results

          : Array.isArray(data)

          ? data

          : [];

        setCount(typeof data?.count === 'number' ? data.count : rawPosts.length);

        setJobPosts(rawPosts);

      } catch (error) {

        errorHandling(error);

      } finally {

        setIsLoadingJobPost(false);

      }

    };

    loadJobPosts({

      page: page + 1,

      pageSize: rowsPerPage,

      ordering: `${order === 'desc' ? '-' : ''}${orderBy}`,

      ...filterData,

    });

  }, [isSuccess, page, rowsPerPage, order, orderBy, filterData]);

  const handleShowUpdate = (slugOrId) => {

    const loadJobPostDetailById = async (jobPostId) => {

      setIsFullScreenLoading(true);

      try {

        const resData = await jobService.getEmployerJobPostDetailById(

          jobPostId

        );

        var data = resData;

        data = {

          ...data,

          jobDescription: createEditorStateFromHTMLString(

            data?.jobDescription || ''

          ),

          jobRequirement: createEditorStateFromHTMLString(

            data?.jobRequirement || ''

          ),

          benefitsEnjoyed: createEditorStateFromHTMLString(

            data?.benefitsEnjoyed || ''

          ),

        };

        setEditData(data);

        setOpenPopup(true);

      } catch (error) {

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

  const handleAddOrUpdate = (data) => {

    const dataCustom = {

      ...data,

      jobDescription: convertEditorStateToHTMLString(data.jobDescription),

      jobRequirement: convertEditorStateToHTMLString(data.jobRequirement),

      benefitsEnjoyed: convertEditorStateToHTMLString(data.benefitsEnjoyed),

    };

    const create = async (data) => {

      setIsFullScreenLoading(true);

      try {

        await jobService.addJobPost(data);

        setOpenPopup(false);

        setIsSuccess(!isSuccess);

        toastMessages.success(t('jobPost.messages.addSuccess'));

      } catch (error) {

        errorHandling(error, setServerErrors);

      } finally {

        setIsFullScreenLoading(false);

      }

    };

    const update = async (data) => {

      setIsFullScreenLoading(true);

      try {

        await jobService.updateJobPostById(data.slug || data.id, data);

        setOpenPopup(false);

        setIsSuccess(!isSuccess);

        toastMessages.success(t('jobPost.messages.updateSuccess'));

      } catch (error) {

        errorHandling(error);

      } finally {

        setIsFullScreenLoading(false);

      }

    };

    if ('id' in data) {

      update(dataCustom);

    } else {

      create(dataCustom);

    }

  };

  const handleDeleteJobPost = (slugOrId) => {

    const del = async (id) => {

      try {

        await jobService.deleteJobPostById(id);

        setIsSuccess(!isSuccess);

        toastMessages.success(t('jobPost.delete.success'));

      } catch (error) {

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

  const handleFilter = (data) => {

    setFilterData({

      ...data,

      isUrgent: data.isUrgent === 1 ? true : data.isUrgent === 2 ? false : '',

      pageSize: rowsPerPage,

    });

    setPage(0);

  };

  const handleExport = () => {

    const exportJobPosts = async (params) => {

      setIsFullScreenLoading(true);

      try {

        const resData = await jobService.exportEmployerJobPosts(params);

        const data = resData;

        xlsxUtils.exportToXLSX(data, 'JobList');

      } catch (error) {

        errorHandling(error);

      } finally {

        setIsFullScreenLoading(false);

      }

    };

    exportJobPosts({

      page: page + 1,

      pageSize: rowsPerPage,

      ordering: `${order === 'desc' ? '-' : ''}${orderBy}`,

      ...filterData,

    });

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

            background: 'primary.gradient',

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

            color="secondary"

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

              background: 'primary.gradient',

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

          handleDelete={handleDeleteJobPost}

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
