import React, { useMemo } from 'react';
import { Typography, Chip, Tooltip, IconButton, Stack } from "@mui/material";
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import EditIcon from '@mui/icons-material/Edit';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import dayjs from '../../../../configs/dayjs-config';
import { useTranslation } from 'react-i18next';
import { ColumnDef, SortingState, OnChangeFn, RowSelectionState } from '@tanstack/react-table';
import DataTable from '../../../../components/Common/DataTable';

import { JobPost } from '../../../../types/models';

interface JobPostExt extends JobPost {
  companyDict?: { companyName?: string };
}

interface JobTableProps {
    jobs: JobPostExt[];
    loading: boolean;
    rowCount?: number;
    pagination?: { pageIndex: number; pageSize: number };
    onPaginationChange?: (pagination: { pageIndex: number; pageSize: number }) => void;
    sorting?: SortingState;
    onSortingChange?: OnChangeFn<SortingState>;
    rowSelection?: RowSelectionState;
    onRowSelectionChange?: OnChangeFn<RowSelectionState>;
    onView: (job: JobPostExt) => void;
    onEdit: (job: JobPostExt) => void;
    onApprove: (id: string | number) => void;
    onReject: (id: string | number) => void;
    onDelete: (id: string | number) => void;
}

const JobTable = ({ 
    jobs, 
    loading, 
    rowCount, 
    pagination, 
    onPaginationChange, 
    sorting,
    onSortingChange,
    rowSelection,
    onRowSelectionChange,
    onView, 
    onEdit, 
    onApprove, 
    onReject, 
    onDelete 
}: JobTableProps) => {
    const { t } = useTranslation('admin');

    const getStatusChip = (status: number) => {
        switch (status) {
            case 1:
                return <Chip label={t('pages.jobs.table.status.pending')} color="warning" size="small" />;
            case 2:
                return <Chip label={t('pages.jobs.table.status.rejected')} color="error" size="small" />;
            case 3:
                return <Chip label={t('pages.jobs.table.status.approved')} color="success" size="small" />;
            default:
                return <Chip label={t('pages.jobs.table.status.unknown')} size="small" />;
        }
    };

    const columns = useMemo<ColumnDef<JobPostExt>[]>(() => [
        {
            accessorKey: 'jobName',
            header: t('pages.jobs.table.jobPostCompany') as string,
            enableSorting: true,
            cell: (info) => (
                <Stack>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                        {info.getValue() as string}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                        {info.row.original.companyDict?.companyName}
                    </Typography>
                </Stack>
            ),
        },
        {
            accessorKey: 'createAt',
            header: t('pages.jobs.table.postDate') as string,
            enableSorting: true,
            cell: (info) => dayjs(info.getValue() as string).format('DD/MM/YYYY'),
        },
        {
            accessorKey: 'deadline',
            header: t('pages.jobs.table.deadline') as string,
            enableSorting: true,
            cell: (info) => dayjs(info.getValue() as string).format('DD/MM/YYYY'),
        },
        {
            accessorKey: 'status',
            header: t('pages.jobs.table.statusCol') as string,
            cell: (info: any) => getStatusChip(info.getValue() as number),
        },
        {
            id: 'actions',
            header: t('pages.jobs.table.actions') as string,
            meta: { align: 'right' },
            cell: (info: any) => (
                <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                    <Tooltip title={t('pages.jobs.table.viewDetails')}>
                        <IconButton size="small" onClick={() => onView(info.row.original)} color="primary">
                            <VisibilityOutlinedIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title={t('pages.jobs.table.edit')}>
                        <IconButton size="small" onClick={() => onEdit(info.row.original)} color="secondary">
                            <EditIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    {info.row.original.status === 1 && (
                        <>
                            <Tooltip title={t('pages.jobs.table.approveAction')}>
                                <IconButton size="small" onClick={() => onApprove(info.row.original.id)} color="success">
                                    <CheckCircleOutlineIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title={t('pages.jobs.table.rejectAction')}>
                                <IconButton size="small" onClick={() => onReject(info.row.original.id)} color="error">
                                    <HighlightOffIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        </>
                    )}
                    <Tooltip title={t('pages.jobs.table.delete')}>
                        <IconButton size="small" onClick={() => onDelete(info.row.original.id)} color="error">
                            <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Stack>
            ),
        },
    ], [t, onView, onEdit, onApprove, onReject, onDelete]);

    return (
        <DataTable
            columns={columns}
            data={jobs || []}
            isLoading={loading}
            rowCount={rowCount}
            pagination={pagination}
            onPaginationChange={onPaginationChange}
            enableSorting
            sorting={sorting}
            onSortingChange={onSortingChange}
            enableRowSelection
            rowSelection={rowSelection}
            onRowSelectionChange={onRowSelectionChange}
            emptyMessage={t('common.table.noData')}
        />
    );
};

export default JobTable;
