import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Chip, IconButton, Tooltip } from "@mui/material";
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import dayjs from 'dayjs';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DataTable from '../../../../components/Common/DataTable';
import { JOB_POST_STATUS_BG_COLOR } from '../../../../configs/constants';
import { useAppSelector } from '../../../../redux/hooks';
import { useConfig } from '@/hooks/useConfig';

interface JobPost {
  id: number;
  slug?: string;
  jobName: string;
  createAt: string;
  deadline: string;
  appliedNumber?: number;
  views?: number;
  isVerify?: boolean;
  isUrgent: boolean;
  isExpired?: boolean;
  status?: number;
}

interface JobPostsTableProps {
  rows: any[];
  isLoading: boolean;
  count: number;
  page: number;
  rowsPerPage: number;
  handleChangePage: (event: unknown, newPage: number) => void;
  handleChangeRowsPerPage: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleDelete: (slugOrId: string | number) => void;
  handleUpdate: (slugOrId: string | number) => void;
  handleRequestSort: (event: React.MouseEvent<unknown>, property: string) => void;
  headCells: any[];
  order: 'asc' | 'desc';
  orderBy: string;
}

const JobPostsTable = ({
  rows,
  isLoading,
  count,
  page,
  rowsPerPage,
  handleChangePage,
  handleChangeRowsPerPage,
  handleDelete,
  handleUpdate,
  handleRequestSort,
  headCells,
  order,
  orderBy,
}: JobPostsTableProps) => {

  const { t } = useTranslation('employer');

  const { allConfig } = useConfig();

  const columns = React.useMemo(() => [

    {

      header: t('jobPost.table.jobTitle'),

      accessorKey: 'jobName',

      cell: ({ row }: { row: { original: JobPost } }) => (

        <Box>

          {row.original.jobName}{' '}

          {row.original.isUrgent && (

            <Chip

              label={t('jobPost.urgent')}

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

      header: t('jobPost.table.postDate'),

      accessorKey: 'createAt',

      cell: ({ getValue }: { getValue: () => unknown }) => dayjs(getValue() as any).format('DD/MM/YYYY'),

    },

    {

      header: t('jobPost.table.deadline'),

      accessorKey: 'deadline',

      cell: ({ row }: { row: { original: JobPost } }) => (

        <span style={{ color: row.original.isExpired ? 'red' : '#2a3eb1' }}>

          {dayjs(row.original.deadline).format('DD/MM/YYYY')}

        </span>

      ),

    },

    {

      header: t('jobPost.table.applications'),

      accessorKey: 'appliedNumber',

    },

    {

      header: t('jobPost.table.views'),

      accessorKey: 'views',

    },

    {

      header: t('jobPost.table.status'),

      accessorKey: 'status',

      cell: ({ getValue }: { getValue: () => unknown }) => (

        <Chip

          label={(allConfig?.jobPostStatusDict as any)?.[getValue() as any] || '---'}

          color={(JOB_POST_STATUS_BG_COLOR as any)[getValue() as any] || 'default'}

          size="small"

        />

      ),

    },

    {

      header: '',

      id: 'actions',

      cell: ({ row }: { row: { original: JobPost } }) => (

        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>

          <Tooltip title={t('jobPost.tooltips.update')} arrow>

            <IconButton

              color="secondary"

              onClick={() => handleUpdate(row.original.slug || row.original.id)}

            >

              <EditOutlinedIcon />

            </IconButton>

          </Tooltip>

          <Tooltip title={t('jobPost.tooltips.delete')} arrow>

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

  ], [allConfig, handleDelete, handleUpdate, t]);

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

      emptyMessage={t('jobPost.noData')}

    />

  );

};

export default JobPostsTable;
