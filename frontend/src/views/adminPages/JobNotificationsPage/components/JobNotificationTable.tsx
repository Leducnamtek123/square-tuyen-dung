import React, { useMemo } from 'react';
import { Typography, IconButton, Tooltip, Stack } from "@mui/material";
import { useTranslation } from 'react-i18next';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import dayjs from '../../../../configs/dayjs-config';
import { ColumnDef, SortingState, OnChangeFn } from '@tanstack/react-table';
import DataTable from '../../../../components/Common/DataTable';

interface JobNotificationTableProps {
    data: any[];
    isLoading?: boolean;
    rowCount?: number;
    pagination?: { pageIndex: number; pageSize: number };
    onPaginationChange?: (pagination: { pageIndex: number; pageSize: number }) => void;
    sorting?: SortingState;
    onSortingChange?: OnChangeFn<SortingState>;
    onEdit?: (row: any) => void;
    onDelete?: (row: any) => void;
}

const JobNotificationTable = ({ 
    data, 
    isLoading,
    rowCount,
    pagination,
    onPaginationChange,
    sorting,
    onSortingChange,
    onEdit, 
    onDelete 
}: JobNotificationTableProps) => {
    const { t } = useTranslation('admin');

    const columns = useMemo<ColumnDef<any>[]>(() => [
        {
            accessorKey: 'title',
            header: t('pages.jobNotifications.table.title') as string,
            enableSorting: true,
            cell: (info) => (
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {info.getValue() as string}
                </Typography>
            ),
        },
        {
            accessorKey: 'content',
            header: t('pages.jobNotifications.table.content') as string,
        },
        {
            id: 'recipient',
            header: t('pages.jobNotifications.table.recipient') as string,
            cell: (info) => (
                <Stack>
                    <Typography variant="body2">{info.row.original.userDict?.fullName || t('common.system', { ns: 'admin' })}</Typography>
                    <Typography variant="caption" color="text.secondary">{info.row.original.userDict?.email}</Typography>
                </Stack>
            ),
        },
        {
            accessorKey: 'createAt',
            header: t('pages.jobNotifications.table.sentAt') as string,
            enableSorting: true,
            cell: (info) => dayjs(info.getValue() as string).format('DD/MM/YYYY HH:mm'),
        },
        {
            id: 'actions',
            header: t('pages.jobNotifications.table.actions') as string,
            meta: { align: 'right' },
            cell: (info) => (
                <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Tooltip title={t('pages.jobNotifications.table.edit')}>
                        <IconButton size="small" onClick={() => onEdit?.(info.row.original)} color="primary">
                            <EditIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title={t('pages.jobNotifications.table.delete')}>
                        <IconButton size="small" onClick={() => onDelete?.(info.row.original)} color="error">
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Stack>
            ),
        },
    ], [t, onEdit, onDelete]);

    return (
        <DataTable
            columns={columns}
            data={data || []}
            isLoading={isLoading}
            rowCount={rowCount}
            pagination={pagination}
            onPaginationChange={onPaginationChange}
            enableSorting
            sorting={sorting}
            onSortingChange={onSortingChange}
            emptyMessage={t('pages.jobNotifications.table.noData')}
        />
    );
};

export default JobNotificationTable;
