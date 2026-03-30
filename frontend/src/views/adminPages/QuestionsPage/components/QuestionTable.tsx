import React, { useMemo } from 'react';
import { Typography, Chip, Tooltip, IconButton, Stack } from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { useTranslation } from 'react-i18next';
import { ColumnDef, SortingState, OnChangeFn, RowSelectionState } from '@tanstack/react-table';
import DataTable from '../../../../components/Common/DataTable';

import { Question } from '../../../../types/models';

interface QuestionTableProps {
    data: Question[];
    isLoading?: boolean;
    rowCount?: number;
    pagination?: { pageIndex: number; pageSize: number };
    onPaginationChange?: (pagination: { pageIndex: number; pageSize: number }) => void;
    sorting?: SortingState;
    onSortingChange?: OnChangeFn<SortingState>;
    rowSelection?: RowSelectionState;
    onRowSelectionChange?: OnChangeFn<RowSelectionState>;
    onEdit: (question: Question) => void;
    onDelete: (question: Question) => void;
}

const QuestionTable = ({ 
    data, 
    isLoading, 
    rowCount, 
    pagination, 
    onPaginationChange, 
    sorting,
    onSortingChange,
    rowSelection,
    onRowSelectionChange,
    onEdit, 
    onDelete 
}: QuestionTableProps) => {
    const { t } = useTranslation('admin');

    const columns = useMemo<ColumnDef<Question>[]>(() => [
        {
            accessorKey: 'questionText',
            header: t('pages.questions.table.questionContent') as string,
            enableSorting: true,
            cell: (info) => (
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {info.getValue() as string}
                </Typography>
            ),
        },
        {
            accessorKey: 'careerDict.name',
            id: 'career',
            header: t('pages.questions.table.field') as string,
            enableSorting: true,
            cell: (info) => (
                <Chip label={info.getValue() as string || t('pages.questions.table.general')} size="small" variant="outlined" />
            ),
        },
        {
            accessorKey: 'difficulty',
            header: t('pages.questions.table.difficulty') as string,
            enableSorting: true,
            cell: (info) => {
                const difficulty = info.getValue() as number;
                return (
                    <Chip
                        label={difficulty === 1 ? t('pages.questions.difficulty.easy') : difficulty === 2 ? t('pages.questions.difficulty.medium') : t('pages.questions.difficulty.hard')}
                        size="small"
                        color={difficulty === 1 ? 'success' : difficulty === 2 ? 'warning' : 'error'}
                    />
                );
            },
        },
        {
            id: 'actions',
            header: t('pages.questions.table.actions') as string,
            meta: { align: 'right' },
            cell: (info) => (
                <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Tooltip title={t('pages.questions.table.edit')}>
                        <IconButton size="small" onClick={() => onEdit(info.row.original)} color="primary">
                            <EditIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title={t('pages.questions.table.delete')}>
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
            isLoading={isLoading}
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

export default QuestionTable;
