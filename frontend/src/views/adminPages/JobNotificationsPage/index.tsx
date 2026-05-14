'use client';

import React, { useMemo, useReducer } from 'react';
import { Box, Typography, Breadcrumbs, Link, Paper, Button, Tooltip, IconButton, Stack } from "@mui/material";
import { useTranslation } from 'react-i18next';
import { ColumnDef } from '@tanstack/react-table';
import DataTable from '../../../components/Common/DataTable';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useJobNotifications } from './hooks/useJobNotifications';
import { useDataTable, useDebounce } from '../../../hooks';
import { JobPostNotification } from '../../../types/models';
import JobNotificationFormDialog from './JobNotificationFormDialog';
import JobNotificationDeleteDialog from './JobNotificationDeleteDialog';
import { createEmptyJobNotificationFormData, type JobNotificationsPageState, type JobNotificationsFormData } from './types';
import FilterBar from '@/components/Common/FilterBar';

const initialState: JobNotificationsPageState = {
    searchTerm: '',
    openDialog: false,
    dialogMode: 'add',
    currentNotification: null,
    formData: createEmptyJobNotificationFormData(),
    openDeleteDialog: false,
};

type Action =
    | { type: 'set_search'; value: string }
    | { type: 'open_add' }
    | { type: 'open_edit'; notification: JobPostNotification }
    | { type: 'open_delete'; notification: JobPostNotification }
    | { type: 'close_all' }
    | { type: 'set_form'; value: JobNotificationsFormData };

const reducer = (state: JobNotificationsPageState, action: Action): JobNotificationsPageState => {
    switch (action.type) {
        case 'set_search':
            return { ...state, searchTerm: action.value };
        case 'open_add':
            return {
                ...state,
                dialogMode: 'add',
                currentNotification: null,
                formData: createEmptyJobNotificationFormData(),
                openDialog: true,
                openDeleteDialog: false,
            };
        case 'open_edit':
            return {
                ...state,
                dialogMode: 'edit',
                currentNotification: action.notification,
                formData: {
                    jobName: action.notification.jobName || '',
                    salary: action.notification.salary ?? null,
                    frequency: action.notification.frequency ?? 7,
                    position: action.notification.position ?? null,
                    experience: action.notification.experience ?? null,
                    career: action.notification.career ?? null,
                    city: action.notification.city ?? null,
                    isActive: !!action.notification.isActive,
                },
                openDialog: true,
                openDeleteDialog: false,
            };
        case 'open_delete':
            return {
                ...state,
                currentNotification: action.notification,
                openDeleteDialog: true,
                openDialog: false,
            };
        case 'close_all':
            return {
                ...state,
                openDialog: false,
                openDeleteDialog: false,
                currentNotification: null,
            };
        case 'set_form':
            return {
                ...state,
                formData: action.value,
            };
        default:
            return state;
    }
};

const JobNotificationsPage = () => {
    const { t } = useTranslation('admin');
    const [state, dispatch] = useReducer(reducer, initialState);

    const {
        page,
        pageSize,
        sorting,
        onSortingChange,
        ordering,
        pagination,
        onPaginationChange
    } = useDataTable({ initialPageSize: 10 });

    const debouncedSearch = useDebounce(state.searchTerm, 500);

    const {
        data,
        isLoading,
        createJobNotification,
        updateJobNotification,
        deleteJobNotification,
        isMutating
    } = useJobNotifications({
        page: page + 1,
        pageSize,
        search: debouncedSearch,
        ordering
    });

    const handleSearch = (value: string) => {
        dispatch({ type: 'set_search', value });
        onPaginationChange({ pageIndex: 0, pageSize: pageSize });
    };

    const handleOpenAdd = () => {
        dispatch({ type: 'open_add' });
    };

    const handleOpenEdit = (notification: JobPostNotification) => {
        dispatch({ type: 'open_edit', notification });
    };

    const handleOpenDelete = (notification: JobPostNotification) => {
        dispatch({ type: 'open_delete', notification });
    };

    const handleCloseDialog = () => {
        dispatch({ type: 'close_all' });
    };

    const handleSave = async () => {
        try {
            if (state.dialogMode === 'add') {
                await createJobNotification(state.formData);
            } else if (state.currentNotification) {
                await updateJobNotification({
                    id: state.currentNotification.id,
                    data: state.formData
                });
            }
            handleCloseDialog();
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = async () => {
        if (!state.currentNotification) return;
        try {
            await deleteJobNotification(state.currentNotification.id);
            handleCloseDialog();
        } catch (error) {
            console.error(error);
        }
    };

    const columns = useMemo<ColumnDef<JobPostNotification>[]>(() => [
        {
            accessorKey: 'id',
            header: t('common:id') as string,
            enableSorting: true,
        },
        {
            accessorKey: 'jobName',
            header: t('pages.jobNotifications.table.title') as string,
            enableSorting: true,
            cell: (info) => (
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {info.getValue() as string}
                </Typography>
            ),
        },
        {
            accessorKey: 'salary',
            header: t('pages.jobNotifications.form.salary') as string,
            cell: (info) => info.getValue() ?? '-',
        },
        {
            accessorKey: 'frequency',
            header: t('pages.jobNotifications.form.frequency') as string,
            enableSorting: true,
            cell: (info) => info.getValue() ?? '-',
        },
        {
            accessorKey: 'isActive',
            header: t('pages.jobNotifications.form.isActive') as string,
            cell: (info) => (info.getValue() ? t('common.yes') : t('common.no')),
        },
        {
            id: 'actions',
            header: t('pages.jobNotifications.table.actions') as string,
            meta: { align: 'right' },
            cell: (info) => (
                <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                    <Tooltip title={t('pages.jobNotifications.table.edit')}>
                        <IconButton size="small" onClick={() => handleOpenEdit(info.row.original)} color="primary">
                            <EditIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title={t('pages.jobNotifications.table.delete')}>
                        <IconButton size="small" onClick={() => handleOpenDelete(info.row.original)} color="error">
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Stack>
            ),
        },
    ], [t]);

    return (
        <Box>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary', mb: 1 }}>
                        {t('pages.jobNotifications.title')}
                    </Typography>
                    <Breadcrumbs aria-label="breadcrumb">
                        <Link underline="hover" color="inherit" href="/admin">
                            {t('pages.jobNotifications.breadcrumbAdmin')}
                        </Link>
                        <Typography color="text.primary">{t('pages.jobNotifications.breadcrumbNotifications')}</Typography>
                    </Breadcrumbs>
                </Box>
                <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenAdd}>
                    {t('pages.jobNotifications.addNotification')}
                </Button>
            </Box>

            <Paper sx={{ p: 2, mb: 3, borderRadius: '12px' }} elevation={0}>
                <FilterBar
                    title={t('pages.jobNotifications.filter.title', 'Bộ lọc thông báo việc làm')}
                    searchValue={state.searchTerm}
                    searchPlaceholder={t('pages.jobNotifications.searchPlaceholder')}
                    onSearchChange={handleSearch}
                    onReset={() => handleSearch('')}
                    resetDisabled={!state.searchTerm}
                    resetLabel={t('common.clearFilters', 'Xóa lọc')}
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

            <JobNotificationFormDialog
                open={state.openDialog}
                mode={state.dialogMode}
                formData={state.formData}
                isMutating={isMutating}
                t={t}
                onClose={handleCloseDialog}
                onSave={handleSave}
                onChange={(next) => dispatch({ type: 'set_form', value: next })}
            />

            <JobNotificationDeleteDialog
                open={state.openDeleteDialog}
                notification={state.currentNotification}
                isMutating={isMutating}
                t={t}
                onClose={handleCloseDialog}
                onDelete={handleDelete}
            />
        </Box>
    );
};

export default JobNotificationsPage;
