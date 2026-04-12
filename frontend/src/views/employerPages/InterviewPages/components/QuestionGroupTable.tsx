import React, { useMemo } from 'react';
import { Typography, Tooltip, IconButton, Stack } from "@mui/material";
import { useTranslation } from 'react-i18next';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { ColumnDef } from '@tanstack/react-table';
import DataTable from '../../../../components/Common/DataTable';

interface Question {
    id: string | number;
    [key: string]: unknown;
}

interface QuestionGroup {
    id: string | number;
    name: string;
    description?: string;
    questions?: Question[];
}

interface QuestionGroupTableProps {
    data: QuestionGroup[];
    loading: boolean;
    onEdit: (item: QuestionGroup) => void;
    onDelete: (item: QuestionGroup) => void;
}

const QuestionGroupTable = ({ data, loading, onEdit, onDelete }: QuestionGroupTableProps) => {
    const { t } = useTranslation('employer');

    const columns = useMemo<ColumnDef<QuestionGroup>[]>(() => [
        {
            accessorKey: 'name',
            header: t('questionGroupsCard.label.questiongroupname') as string,
            cell: (info) => (
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {info.getValue() as string}
                </Typography>
            ),
        },
        {
            accessorKey: 'description',
            header: t('questionGroupsCard.label.description') as string,
            cell: (info) => (
                <Typography variant="body2" color="text.secondary">
                    {info.getValue() as string || '---'}
                </Typography>
            ),
        },
        {
            accessorKey: 'questions',
            header: t('questionGroupsCard.table.numberOfQuestions') as string,
            cell: (info) => (
                <Typography variant="body2">
                    {(info.getValue() as Question[])?.length || 0}
                </Typography>
            ),
        },
        {
            id: 'actions',
            header: t('jobPost.table.actions') as string,
            meta: { align: 'right' },
            cell: (info) => (
                <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Tooltip title={t('jobPost.tooltips.update')}>
                        <IconButton size="small" onClick={() => onEdit(info.row.original)} color="primary">
                            <EditIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title={t('jobPost.tooltips.delete')}>
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
            hidePagination
            emptyMessage={t('questionGroupsCard.table.noData')}
        />
    );
};

export default QuestionGroupTable;
