import React from 'react';
import { useAppSelector } from '@/redux/hooks';
import { useRouter } from 'next/navigation';
import { Box, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import { ColumnDef, PaginationState, SortingState } from '@tanstack/react-table';

import AIAnalysisDrawer from '../AIAnalysisDrawer';
import { CV_TYPES, ROUTES } from '../../../../configs/constants';
import DataTable from '../../../../components/Common/DataTable';
import { faFile, faFilePdf } from '@fortawesome/free-regular-svg-icons';
import { formatRoute } from '../../../../utils/funcUtils';

import SendEmailComponent from './SendEmailComponent';
import AppliedStatusComponent from './AppliedStatusComponent';
import AIAnalysisComponent from './AIAnalysisComponent';
import { useConfig } from '@/hooks/useConfig';

export type AppliedResumeRow = {
  id: string | number;
  fullName: string;
  type: string | number;
  title?: string;
  jobName?: string;
  createAt?: string;
  status?: string | number;
  resumeSlug?: string;
  isSentEmail?: boolean;
  email?: string;
  [key: string]: unknown;
};

interface AppliedResumeTableProps {
  rows: AppliedResumeRow[];
  isLoading: boolean;
  handleChangeApplicationStatus: (id: string | number, value: string | number, callback: (result: boolean) => void) => void;
  handleDelete: (id: string | number) => void;
  rowCount: number;
  pagination: PaginationState;
  onPaginationChange: import('@tanstack/react-table').OnChangeFn<PaginationState>;
  sorting: SortingState;
  onSortingChange: import('@tanstack/react-table').OnChangeFn<SortingState>;
}

const AppliedResumeTable: React.FC<AppliedResumeTableProps> = (props) => {
  const { t } = useTranslation(['employer', 'common']);
  const nav = useRouter();
  const { 
    rows, 
    isLoading, 
    handleChangeApplicationStatus, 
    handleDelete,
    rowCount,
    pagination,
    onPaginationChange,
    sorting,
    onSortingChange
  } = props;
  const { allConfig } = useConfig();
  const [openDrawerId, setOpenDrawerId] = React.useState<string | number | null>(null);

  const selectedActivityInfo = React.useMemo(() => {
    if (!openDrawerId) return null;
    return rows.find(r => r.id === openDrawerId);
  }, [openDrawerId, rows]);

  const columns = React.useMemo<ColumnDef<AppliedResumeRow>[]>(() => [
    {
      accessorKey: 'fullName',
      header: t('appliedResume.table.profileName') as string,
      enableSorting: true,
      cell: (info) => (
        <Box>
          <Typography sx={{ fontWeight: 'bold' }}>
            {info.getValue() as string}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {info.row.original.type === CV_TYPES.cvWebsite ? (
              <Tooltip title={t('appliedResume.table.onlineResume')} arrow>
                <FontAwesomeIcon icon={faFile} color="#441da0" size="xs" />
              </Tooltip>
            ) : (
              <Tooltip title={t('appliedResume.table.attachedResume')} arrow>
                <FontAwesomeIcon icon={faFilePdf} color="red" size="xs" />
              </Tooltip>
            )}
            <Typography variant="caption" color="text.secondary">
              {info.row.original.title || t('appliedResume.table.notUpdated')}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      accessorKey: 'jobName',
      header: t('appliedResume.table.appliedPosition') as string,
      enableSorting: true,
    },
    {
      accessorKey: 'createAt',
      header: t('appliedResume.table.appliedDate') as string,
      enableSorting: true,
      cell: (info) => dayjs(info.getValue() as string).format('DD/MM/YYYY'),
    },
    {
      accessorKey: 'type',
      header: t('appliedResume.table.profileType') as string,
      cell: (info) => info.getValue() === CV_TYPES.cvWebsite
        ? t('appliedResume.table.onlineResume')
        : t('appliedResume.table.attachedResume'),
    },
    {
      id: 'aiAnalysis',
      header: t('appliedResume.table.aiAnalysis') as string,
      meta: { align: 'center' },
      cell: (info) => <AIAnalysisComponent row={info.row.original} onOpenDrawer={() => setOpenDrawerId(info.row.original.id)} />,
    },
    {
      accessorKey: 'status',
      header: t('appliedResume.table.status') as string,
      meta: { align: 'right' },
      cell: (info) => (
        <AppliedStatusComponent
          options={allConfig?.applicationStatusOptions || []}
          defaultStatus={Number(info.getValue())}
          id={String(info.row.original.id)}
          handleChangeApplicationStatus={handleChangeApplicationStatus}
        />
      ),
    },
    {
      id: 'actions',
      header: t('appliedResume.table.actions') as string,
      meta: { align: 'right' },
      cell: (info) => (
        <Stack direction="row" spacing={1} justifyContent="flex-end">
          <Tooltip title={t('appliedResume.table.tooltips.view')} arrow>
            <IconButton
              color="primary"
              size="small"
              onClick={() => nav.push(`/${formatRoute(ROUTES.EMPLOYER.PROFILE_DETAIL, info.row.original.resumeSlug || '')}`)}
            >
              <RemoveRedEyeOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('appliedResume.table.tooltips.delete')} arrow>
            <IconButton
              size="small"
              color="error"
              onClick={() => handleDelete(info.row.original.id)}
            >
              <DeleteOutlineOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <SendEmailComponent
            jobPostActivityId={String(info.row.original.id)}
            isSentEmail={info.row.original.isSentEmail || false}
            email={info.row.original.email || ''}
            fullName={info.row.original.fullName}
          />
        </Stack>
      ),
    },
  ], [t, allConfig, handleChangeApplicationStatus, handleDelete, nav]);

  return (
    <>
      <AIAnalysisDrawer
        open={Boolean(openDrawerId)}
        onClose={() => setOpenDrawerId(null)}
        activityId={openDrawerId}
        initialData={selectedActivityInfo}
      />
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
        emptyMessage={t('appliedResume.table.noCandidates')}
      />
    </>
  );
};

export default AppliedResumeTable;
