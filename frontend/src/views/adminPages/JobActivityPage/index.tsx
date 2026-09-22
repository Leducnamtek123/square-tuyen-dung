'use client';

import React, { useMemo, useState } from 'react';
import { Box, Typography, Paper, Chip } from "@mui/material";
import { useTranslation } from 'react-i18next';
import { ColumnDef } from '@tanstack/react-table';
import DataTable from '@/components/Common/DataTable';
import dayjs from '@/configs/dayjs-config';

import { useJobActivities } from './hooks/useJobActivities';
import { useDataTable, useDebounce } from '@/hooks';
import { JobPostActivity } from '@/types/models';
import FilterBar from '@/components/Common/FilterBar';
import {
    getJobActivityStatusOption,
} from './applicationStatus';

const JobActivityPage = () => {
    const { t } = useTranslation('admin');
    
    const {
        page,
        pageSize: rowsPerPage,
        sorting,
        onSortingChange,
        ordering,
        pagination,
        onPaginationChange
    } = useDataTable({ initialPageSize: 10 });

    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearch = useDebounce(searchTerm, 500);

    const {
        data,
        isLoading,
    } = useJobActivities({
        page: page + 1,
        pageSize: rowsPerPage,
        kw: debouncedSearch,
        ordering
    });

    const handleSearch = (value: string) => {
        setSearchTerm(value);
        onPaginationChange({ pageIndex: 0, pageSize: rowsPerPage });
    };

    const columns = useMemo<ColumnDef<JobPostActivity>[]>(() => [
        {
            id: 'index',
            header: 'STT',
            cell: (info) => info.row.index + 1,
            size: 60,
        },
        {
            accessorKey: 'fullName',
            header: t('pages.jobActivity.table.candidate') as string,
            enableSorting: true,
            cell: (info) => (
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      {info.getValue() as string || '---'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                      {info.row.original.email}
                  </Typography>
                </Box>
            ),
        },
        {
            accessorKey: 'jobName',
            header: t('pages.jobActivity.table.jobPost') as string,
            cell: (info) => info.getValue() as string || '---',
        },
        {
            accessorKey: 'companyDict.companyName',
            header: t('pages.jobActivity.table.company') as string,
            cell: (info) => info.getValue() as string || '---',
        },
        {
            accessorKey: 'status',
            header: t('pages.jobActivity.table.status') as string,
            enableSorting: true,
            cell: (info) => {
                const status = info.getValue() as number;
                const statusOption = getJobActivityStatusOption(status);
                return (
                    <Chip
                        label={t(`pages.jobActivity.statusOptions.${statusOption.i18nKey}`)}
                        size="small"
                        color={statusOption.color}
                        variant={statusOption.variant}
                    />
                );
            },
        },
        {
            accessorKey: 'createAt',
            header: t('pages.jobActivity.table.updatedAt') as string,
            enableSorting: true,
            cell: (info) => info.getValue() ? dayjs(info.getValue() as string).format('DD/MM/YYYY HH:mm') : '-',
        },
    ], [t]);

    return (
        <Box>
            <Box sx={{ mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
                    {t('pages.jobActivity.title', { defaultValue: 'Nhật ký ứng tuyển toàn sàn (Read-only Audit Log)' })}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {t('pages.jobActivity.subtitle', { defaultValue: 'Nhật ký lưu trữ dữ liệu nộp đơn ứng tuyển của các công ty (Chỉ xem / Audit Log)' })}
                </Typography>
            </Box>
            <Paper sx={{ p: 2, mb: 3, borderRadius: '12px' }} elevation={0}>
                <FilterBar
                    title={t('pages.jobActivity.filter.title')}
                    searchValue={searchTerm}
                    searchPlaceholder={t('pages.jobActivity.searchPlaceholder')}
                    onSearchChange={handleSearch}
                    onReset={() => handleSearch('')}
                    resetDisabled={!searchTerm}
                    resetLabel={t('common.clearFilters')}
                />

                <DataTable
                    columns={columns}
                    data={data?.results || []}
                    isLoading={isLoading}
                    rowCount={data?.count || 0}
                    pagination={pagination}
                    onPaginationChange={onPaginationChange}
                    enableSorting
                    sorting={sorting}
                    onSortingChange={onSortingChange}
                />
            </Paper>
        </Box>
    );
};

export default JobActivityPage;
