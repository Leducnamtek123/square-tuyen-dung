/*

MyJob Recruitment System - Part of MyJob Platform



Author: Bui Khanh Huy

Email: khuy220@gmail.com

Copyright (c) 2023 Bui Khanh Huy



License: MIT License

See the LICENSE file in the project root for full license information.

*/



import React from 'react';

import { useSelector } from 'react-redux';

import { Box, Chip, IconButton, TableBody, TableCell, Tooltip } from '@mui/material';

import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';

import dayjs from 'dayjs';

import EditOutlinedIcon from '@mui/icons-material/EditOutlined';



import DataTable from '../../../../components/DataTable';

import { JOB_POST_STATUS_BG_COLOR } from '../../../../configs/constants';



const JobPostsTable = (props) => {

  const { rows, isLoading, count, page, rowsPerPage, order, orderBy, handleRequestSort, handleChangePage, handleChangeRowsPerPage, handleDelete, handleUpdate } = props;

  const { allConfig } = useSelector((state) => state.config);



  const columns = React.useMemo(() => [

    {

      header: 'Tên tin đăng',

      accessorKey: 'jobName',

      cell: ({ row }) => (

        <Box>

          {row.original.jobName}{' '}

          {row.original.isUrgent && (

            <Chip

              label="Tuyển gấp"

              color="error"

              variant="outlined"

              size="small"

              sx={{ ml: 1 }}

            />

          )}

        </Box>

      ),

    },

    {

      header: 'Ngày đăng',

      accessorKey: 'createAt',

      cell: ({ getValue }) => dayjs(getValue()).format('DD/MM/YYYY'),

    },

    {

      header: 'Thời hạn nộp',

      accessorKey: 'deadline',

      cell: ({ row }) => (

        <span style={{ color: row.original.isExpired ? 'red' : '#2a3eb1' }}>

          {dayjs(row.original.deadline).format('DD/MM/YYYY')}

        </span>

      ),

    },

    {

      header: 'Lượt nộp',

      accessorKey: 'appliedNumber',

    },

    {

      header: 'Lượt xem',

      accessorKey: 'views',

    },

    {

      header: 'Trạng thái',

      accessorKey: 'status',

      cell: ({ getValue }) => (

        <Chip

          label={allConfig?.jobPostStatusDict[getValue()] || '---'}

          color={JOB_POST_STATUS_BG_COLOR[getValue()] || 'default'}

          size="small"

        />

      ),

    },

    {

      header: '',

      id: 'actions',

      cell: ({ row }) => (

        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>

          <Tooltip title="Cập nhật" arrow>

            <IconButton

              color="secondary"

              onClick={() => handleUpdate(row.original.slug || row.original.id)}
            >

              <EditOutlinedIcon />

            </IconButton>

          </Tooltip>

          <Tooltip title="Xóa" arrow>

            <IconButton

              color="error"

              onClick={() => handleDelete(row.original.slug || row.original.id)}
            >

              <DeleteOutlineOutlinedIcon />

            </IconButton>

          </Tooltip>

        </Box>

      ),

    },

  ], [allConfig, handleDelete, handleUpdate]);



  return (

    <DataTable

      columns={columns}

      data={rows}

      isLoading={isLoading}

      count={count}

      page={page}

      rowsPerPage={rowsPerPage}

      onPageChange={handleChangePage}

      onRowsPerPageChange={handleChangeRowsPerPage}

      emptyMessage="Bạn chưa có tin tuyển dụng nào"

    />

  );

};



export default JobPostsTable;

