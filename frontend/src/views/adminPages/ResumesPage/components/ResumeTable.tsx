import React from 'react';
import { Box, Typography, Chip, Tooltip, IconButton } from "@mui/material";
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import { useTranslation } from 'react-i18next';
import { ColumnDef, PaginationState, SortingState, OnChangeFn } from '@tanstack/react-table';
import DataTable from '../../../../components/Common/DataTable';
import dayjs from '../../../../configs/dayjs-config';
import { Resume } from '../../../../types/models';

interface ResumeTableProps {
    data: Resume[];
    isLoading: boolean;
    rowCount: number;
    pagination: PaginationState;
    onPaginationChange: OnChangeFn<PaginationState>;
    enableSorting?: boolean;
    sorting?: SortingState;
    onSortingChange?: OnChangeFn<SortingState>;
    onEdit: (resume: Resume) => void;
    onDelete: (resume: Resume) => void;
}

const ResumeTable = ({ data, isLoading, rowCount, pagination, onPaginationChange, enableSorting, sorting, onSortingChange, onEdit, onDelete }: ResumeTableProps) => {
    const { t } = useTranslation('admin');

    const columns = React.useMemo<ColumnDef<Resume>[]>(() => [
        {
            accessorKey: 'title',
            header: t('pages.resumes.table.resumeTitle') as string,
            enableSorting: true,
            cell: (info) => (
                <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {info.getValue() as string}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        Slug: {info.row.original.slug}
                    </Typography>
                </Box>
            ),
        },
        {
            accessorKey: 'userDict.fullName',
            header: t('pages.resumes.table.candidate') as string,
            enableSorting: true,
            cell: (info) => info.getValue() || '---',
        },
        {
            accessorKey: 'type',
            header: t('pages.resumes.table.resumeType') as string,
            cell: (info) => (
                <Chip
                    label={info.getValue() === 'UPLOAD' ? t('pages.resumes.table.uploadedFile') : t('pages.resumes.table.onlineProfile')}
                    size="small"
                    variant="outlined"
                    color={info.getValue() === 'UPLOAD' ? 'primary' : 'secondary'}
                />
            ),
        },
        {
            accessorKey: 'experience',
            header: t('pages.resumes.table.experience') as string,
            enableSorting: true,
            cell: (info) => info.getValue() || '---',
        },
        {
            accessorKey: 'updateAt',
            header: t('pages.resumes.table.lastUpdate') as string,
            enableSorting: true,
            cell: (info) => dayjs(info.getValue() as string).format('DD/MM/YYYY HH:mm'),
        },
        {
            accessorKey: 'isActive',
            header: t('pages.resumes.table.status') as string,
            meta: { align: 'center' },
            cell: (info) => (
                <Chip
                    label={info.getValue() ? t('pages.resumes.table.active') : t('pages.resumes.table.inactive')}
                    size="small"
                    color={info.getValue() ? 'success' : 'default'}
                />
            ),
        },
        {
            id: 'actions',
            header: t('pages.resumes.table.actions') as string,
            meta: { align: 'right' },
            cell: (info) => (
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                    <Tooltip title={t('pages.resumes.table.viewDetails')}>
                        <IconButton size="small" onClick={() => onEdit(info.row.original)}>
                            <VisibilityIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title={t('pages.resumes.table.delete')}>
                        <IconButton size="small" onClick={() => onDelete(info.row.original)} color="error">
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Box>
            ),
        },
    ], [t, onEdit, onDelete]);

    return (
        <DataTable
            columns={columns}
            data={data}
            isLoading={isLoading}
            rowCount={rowCount}
            pagination={pagination}
            onPaginationChange={onPaginationChange}
            enableSorting={enableSorting}
            sorting={sorting}
            onSortingChange={onSortingChange}
        />
    );
};

export default ResumeTable;
