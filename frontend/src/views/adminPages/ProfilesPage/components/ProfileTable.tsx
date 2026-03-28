import React, { useMemo } from 'react';
import { IconButton, Tooltip, Avatar, Typography, Stack } from "@mui/material";
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useTranslation } from 'react-i18next';
import { ColumnDef, SortingState, OnChangeFn } from '@tanstack/react-table';
import DataTable from '../../../../components/Common/DataTable';

interface ProfileTableProps {
    data: any[];
    isLoading?: boolean;
    rowCount?: number;
    pagination?: { pageIndex: number; pageSize: number };
    onPaginationChange?: (pagination: { pageIndex: number; pageSize: number }) => void;
    sorting?: SortingState;
    onSortingChange?: OnChangeFn<SortingState>;
    onView?: (profile: any) => void;
    onEdit: (profile: any) => void;
    onDelete: (profile: any) => void;
}

const ProfileTable = ({ 
    data, 
    isLoading,
    rowCount,
    pagination,
    onPaginationChange,
    sorting,
    onSortingChange,
    onView, 
    onEdit, 
    onDelete 
}: ProfileTableProps) => {
    const { t } = useTranslation('admin');

    const columns = useMemo<ColumnDef<any>[]>(() => [
        {
            id: 'avatar',
            header: t('pages.profiles.table.avatar') as string,
            cell: (info) => (
                <Avatar
                    src={info.row.original.userDict?.avatar}
                    sx={{ width: 40, height: 40 }}
                />
            ),
        },
        {
            accessorKey: 'userDict.fullName',
            header: t('pages.profiles.table.fullName') as string,
            enableSorting: true,
            cell: (info) => (
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {info.getValue() as string || '---'}
                </Typography>
            ),
        },
        {
            accessorKey: 'userDict.email',
            header: t('pages.profiles.table.email') as string,
            enableSorting: true,
            cell: (info) => info.getValue() as string || '---',
        },
        {
            accessorKey: 'userDict.phone',
            header: t('pages.profiles.table.phone') as string,
            cell: (info) => info.getValue() as string || '---',
        },
        {
            accessorKey: 'userDict.gender',
            header: t('pages.profiles.table.gender') as string,
            cell: (info) => info.getValue() as string || '---',
        },
        {
            accessorKey: 'userDict.birthday',
            header: t('pages.profiles.table.dob') as string,
            cell: (info) => info.getValue() as string || '---',
        },
        {
            id: 'actions',
            header: t('pages.profiles.table.actions') as string,
            meta: { align: 'right' },
            cell: (info) => (
                <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Tooltip title={t('pages.profiles.table.viewDetails')}>
                        <IconButton size="small" onClick={() => onView?.(info.row.original)}>
                            <VisibilityIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title={t('pages.profiles.table.edit')}>
                        <IconButton size="small" onClick={() => onEdit?.(info.row.original)} color="primary">
                            <EditIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title={t('pages.profiles.table.delete')}>
                        <IconButton size="small" onClick={() => onDelete?.(info.row.original)} color="error">
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Stack>
            ),
        },
    ], [t, onView, onEdit, onDelete]);

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
            emptyMessage={t('pages.profiles.table.noData')}
        />
    );
};

export default ProfileTable;
