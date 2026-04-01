import React, { useMemo } from 'react';
import { Typography, Chip, Tooltip, IconButton, Stack } from "@mui/material";
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import dayjs from '../../../../configs/dayjs-config';
import { useTranslation } from 'react-i18next';
import { ColumnDef, SortingState, OnChangeFn, RowSelectionState } from '@tanstack/react-table';
import DataTable from '../../../../components/Common/DataTable';

interface InterviewTableRow {
    id: number | string;
    candidateName?: string;
    candidateEmail?: string;
    jobName?: string;
    interview_type?: string;
    interviewType?: string;
    scheduledAt?: string;
    status?: string;
    [key: string]: unknown;
}

interface InterviewTableProps {
    interviews: InterviewTableRow[];
    loading: boolean;
    rowCount?: number;
    pagination?: { pageIndex: number; pageSize: number };
    onPaginationChange?: (pagination: { pageIndex: number; pageSize: number }) => void;
    sorting?: SortingState;
    onSortingChange?: OnChangeFn<SortingState>;
    rowSelection?: RowSelectionState;
    onRowSelectionChange?: OnChangeFn<RowSelectionState>;
    onView: (interview: InterviewTableRow) => void;
    onDelete: (id: number | string) => void;
    onUpdateStatus: (id: number | string, status: string) => void;
}

const InterviewTable = ({ 
    interviews, 
    loading, 
    rowCount, 
    pagination, 
    onPaginationChange, 
    sorting,
    onSortingChange,
    rowSelection,
    onRowSelectionChange,
    onView, 
    onDelete, 
    onUpdateStatus 
}: InterviewTableProps) => {
    const { t } = useTranslation(['interview', 'admin']);

    const getStatusChip = (status: unknown) => {
        const lowerStatus = String(status ?? '').toLowerCase();
        switch (lowerStatus) {
            case 'completed':
                return <Chip label={t('common.status.completed', { ns: 'admin' })} color="success" size="small" />;
            case 'pending':
            case 'draft':
                return <Chip label={t('common.status.pending', { ns: 'admin' })} color="warning" size="small" />;
            case 'processing':
            case 'in_progress':
                return <Chip label={t('common.status.inProgress', { ns: 'admin' })} color="info" size="small" />;
            case 'scheduled':
                return <Chip label={t('common.status.scheduled', { ns: 'admin' })} color="primary" size="small" />;
            case 'cancelled':
                return <Chip label={t('common.status.cancelled', { ns: 'admin' }) as string} color="error" size="small" />;
            default:
                return <Chip label={(status || t('common.status.unknown', { ns: 'admin' })) as string} size="small" />;
        }
    };

    const getTypeChip = (type: unknown) => {
        switch (typeof type === 'string' ? type.toUpperCase() : '') {
            case 'VETTING':
                return <Chip label={t('pages.interviews.type.vetting', { ns: 'admin' }) as string} color="warning" size="small" variant="outlined" />;
            default:
                return <Chip label={t('pages.interviews.type.recruitment', { ns: 'admin' }) as string} color="primary" size="small" variant="outlined" />;
        }
    };

    const columns = useMemo<ColumnDef<InterviewTableRow>[]>(() => [
        {
            accessorKey: 'candidateName',
            header: t('interviewAdminPage.candidateEmployer', { ns: 'interview' }) as string,
            enableSorting: true,
            cell: (info) => (
                <Stack>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                        {info.getValue() as string}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                        {info.row.original.candidateEmail}
                    </Typography>
                </Stack>
            ),
        },
        {
            accessorKey: 'jobName',
            header: t('interviewAdminPage.jobPost', { ns: 'interview' }) as string,
            enableSorting: true,
            cell: (info) => info.getValue() || (
                <Typography variant="caption" color="text.disabled" sx={{ fontStyle: 'italic' }}>
                    {t('common.na', { ns: 'admin' })}
                </Typography>
            ),
        },
        {
            id: 'type',
            header: t('interviewAdminPage.type', { ns: 'interview' }) as string,
            cell: (info) => getTypeChip(info.row.original.interview_type || info.row.original.interviewType),
        },
        {
            accessorKey: 'scheduledAt',
            header: t('interviewAdminPage.time', { ns: 'interview' }) as string,
            enableSorting: true,
            cell: (info) => dayjs(info.getValue() as string).format('DD/MM/YYYY HH:mm'),
        },
        {
            accessorKey: 'status',
            header: t('interviewAdminPage.status', { ns: 'interview' }) as string,
            enableSorting: true,
            cell: (info) => getStatusChip(info.getValue()),
        },
        {
            id: 'actions',
            header: t('interviewAdminPage.actions', { ns: 'interview' }) as string,
            meta: { align: 'right' },
            cell: (info) => (
                <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                    <Tooltip title={t('interviewAdminPage.viewDetails', { ns: 'interview' })}>
                        <IconButton size="small" onClick={() => onView(info.row.original)} color="primary">
                            <VisibilityOutlinedIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    {String(info.row.original.status).toLowerCase() !== 'completed' && (
                        <Tooltip title={t('interviewAdminPage.markCompleted', { ns: 'interview' })}>
                            <IconButton size="small" onClick={() => onUpdateStatus(info.row.original.id, 'completed')} color="success">
                                <CheckCircleOutlineIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    )}
                    {String(info.row.original.status).toLowerCase() !== 'cancelled' && (
                        <Tooltip title={t('interviewAdminPage.cancelInterview', { ns: 'interview' })}>
                            <IconButton size="small" onClick={() => onUpdateStatus(info.row.original.id, 'cancelled')} color="warning">
                                <CancelOutlinedIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    )}
                    <Tooltip title={t('interviewAdminPage.delete', { ns: 'interview' })}>
                        <IconButton size="small" onClick={() => onDelete(info.row.original.id)} color="error">
                            <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Stack>
            ),
        },
    ], [t, onView, onUpdateStatus, onDelete]);

    return (
        <DataTable
            columns={columns}
            data={interviews || []}
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
            emptyMessage={t('common.table.noData', { ns: 'admin' })}
        />
    );
};

export default InterviewTable;
