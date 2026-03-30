import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Chip, IconButton, Tooltip, Stack } from "@mui/material";
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import dayjs from 'dayjs';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DataTable from '../../../../components/Common/DataTable';
import { JOB_POST_STATUS_BG_COLOR } from '../../../../configs/constants';
import { useConfig } from '@/hooks/useConfig';
import type { JobPost } from '../../../../types/models';
import type { ColumnDef, SortingState, Updater, PaginationState } from '@tanstack/react-table';

interface JobPostsTableProps {
  rows: JobPost[];
  isLoading: boolean;
  rowCount: number;
  pagination: PaginationState;
  onPaginationChange: (pagination: PaginationState) => void;
  handleDelete: (slugOrId: string | number) => void;
  handleUpdate: (slugOrId: string | number) => void;
  sorting: SortingState;
  onSortingChange: (sorting: Updater<SortingState>) => void;
}

const JobPostsTable = ({
  rows,
  isLoading,
  rowCount,
  pagination,
  onPaginationChange,
  handleDelete,
  handleUpdate,
  sorting,
  onSortingChange,
}: JobPostsTableProps) => {

  const { t } = useTranslation('employer');
  const { allConfig } = useConfig();

  const columns = React.useMemo<ColumnDef<JobPost>[]>(() => [
    {
      header: t('jobPost.table.jobTitle'),
      accessorKey: 'jobName',
      enableSorting: true,
      cell: (info) => (
        <Box sx={{ fontWeight: 600 }}>
          {info.getValue() as string}{' '}
          {info.row.original.isUrgent && (
            <Chip
              label={t('jobPost.urgent')}
              color="error"
              variant="outlined"
              size="small"
              sx={{ ml: 1, fontWeight: 700 }}
            />
          )}
        </Box>
      ),
    },
    {
      header: t('jobPost.table.postDate'),
      accessorKey: 'createAt',
      enableSorting: true,
      cell: (info) => dayjs(info.getValue() as string).format('DD/MM/YYYY'),
    },
    {
      header: t('jobPost.table.deadline'),
      accessorKey: 'deadline',
      enableSorting: true,
      cell: (info) => (
        <Box component="span" sx={{ color: info.row.original.isExpired ? 'error.main' : 'primary.main', fontWeight: 600 }}>
          {dayjs(info.getValue() as string).format('DD/MM/YYYY')}
        </Box>
      ),
    },
    {
      header: t('jobPost.table.applications'),
      accessorKey: 'appliedNumber',
      enableSorting: true,
      cell: (info) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box component="span" sx={{ fontWeight: 700 }}>{info.getValue() as number || 0}</Box>
        </Box>
      )
    },
    {
      header: t('jobPost.table.views'),
      accessorKey: 'views',
      enableSorting: true,
    },
    {
      header: t('jobPost.table.status'),
      accessorKey: 'status',
      cell: (info) => {
        const val = String(info.getValue());
        const label = (allConfig?.jobPostStatusDict as Record<string, string>)?.[val] || '---';
        const color = ((JOB_POST_STATUS_BG_COLOR as Record<string, any>)[val]) || 'default';
        
        return (
          <Chip
            label={label}
            color={color}
            size="small"
            sx={{ fontWeight: 600 }}
          />
        );
      },
    },
    {
      header: '',
      id: 'actions',
      meta: { align: 'right' },
      cell: (info) => (
        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
          <Tooltip title={t('jobPost.tooltips.update')} arrow>
            <IconButton
              size="small"
              color="primary"
              onClick={() => handleUpdate(info.row.original.slug || info.row.original.id)}
            >
              <EditOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('jobPost.tooltips.delete')} arrow>
            <IconButton
              size="small"
              color="error"
              onClick={() => handleDelete(info.row.original.slug || info.row.original.id)}
            >
              <DeleteOutlineOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ], [allConfig, handleDelete, handleUpdate, t]);

  return (
    <DataTable
      columns={columns}
      data={rows}
      isLoading={isLoading}
      rowCount={rowCount}
      pagination={pagination}
      onPaginationChange={onPaginationChange}
      enableSorting
      sorting={sorting}
      onSortingChange={onSortingChange}
      emptyMessage={t('jobPost.noData')}
    />
  );
};

export default JobPostsTable;
