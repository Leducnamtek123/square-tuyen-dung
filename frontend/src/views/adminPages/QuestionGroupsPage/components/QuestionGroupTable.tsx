import React, { useMemo } from 'react';
import { Typography, Tooltip, IconButton, Stack } from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { useTranslation } from 'react-i18next';
import { ColumnDef, SortingState, OnChangeFn } from '@tanstack/react-table';
import DataTable from '../../../../components/Common/DataTable';

interface QuestionGroupTableProps {
    data: import('../../../../types/models').QuestionGroup[];
    loading?: boolean;
    rowCount?: number;
    pagination?: { pageIndex: number; pageSize: number };
    onPaginationChange?: (pagination: { pageIndex: number; pageSize: number }) => void;
    sorting?: SortingState;
    onSortingChange?: OnChangeFn<SortingState>;
    onEdit: (group: import('../../../../types/models').QuestionGroup) => void;
    onDelete: (group: import('../../../../types/models').QuestionGroup) => void;
}

const QuestionGroupTable = ({ 
    data, 
    loading, 
    rowCount,
    pagination,
    onPaginationChange,
    sorting,
    onSortingChange,
    onEdit, 
    onDelete 
}: QuestionGroupTableProps) => {
    const { t } = useTranslation('admin');

    const columns = useMemo<ColumnDef<import('../../../../types/models').QuestionGroup>[]>(() => [
        {
            accessorKey: 'name',
            header: t('pages.questionGroups.table.groupName') as string,
            enableSorting: true,
            cell: (info) => (
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {info.getValue() as string}
                </Typography>
            ),
        },
        {
            accessorKey: 'description',
            header: t('pages.questionGroups.table.description') as string,
            cell: (info) => (
                <Typography variant="body2" color="text.secondary">
                    {info.getValue() as string || '---'}
                </Typography>
            ),
        },
        {
            accessorKey: 'questions',
            header: t('pages.questionGroups.table.questionCount') as string,
            cell: (info) => (
                <Typography variant="body2">
                    {(info.getValue() as unknown[])?.length || 0}
                </Typography>
            ),
        },
        {
            id: 'actions',
            header: t('pages.questionGroups.table.actions') as string,
            meta: { align: 'right' },
            cell: (info) => (
                <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Tooltip title={t('pages.questionGroups.table.edit')}>
                        <IconButton size="small" onClick={() => onEdit(info.row.original)} color="primary">
                            <EditIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title={t('pages.questionGroups.table.delete')}>
                        <IconButton size="small" onClick={() => onDelete(info.row.original)} color="error">
                            <DeleteOutlineIcon fontSize="small" />
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
            isLoading={loading}
            rowCount={rowCount}
            pagination={pagination}
            onPaginationChange={onPaginationChange}
            enableSorting
            sorting={sorting}
            onSortingChange={onSortingChange}
            emptyMessage={t('pages.questionGroups.table.noData')}
        />
    );
};

export default QuestionGroupTable;
