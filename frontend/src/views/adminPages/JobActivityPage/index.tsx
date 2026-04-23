import React, { useMemo, useReducer } from 'react';
import { Box, Typography, Breadcrumbs, Link, Paper, TextField, InputAdornment, Button, Dialog, DialogTitle, DialogContent, DialogActions, MenuItem, Tooltip, IconButton, Chip, Stack } from "@mui/material";
import { useTranslation } from 'react-i18next';
import { ColumnDef } from '@tanstack/react-table';
import DataTable from '../../../components/Common/DataTable';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import dayjs from '../../../configs/dayjs-config';

import SearchIcon from '@mui/icons-material/Search';
import { useJobActivities } from './hooks/useJobActivities';
import { useDataTable, useDebounce } from '../../../hooks';
import { JobPostActivity } from '../../../types/models';

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

    type JobActivityPageState = {
        searchTerm: string;
        openEditDialog: boolean;
        openDeleteDialog: boolean;
        currentActivity: JobPostActivity | null;
        statusValue: number;
    };

    type JobActivityPageAction =
        | { type: 'set-search-term'; value: string }
        | { type: 'open-edit'; activity: JobPostActivity }
        | { type: 'open-delete'; activity: JobPostActivity }
        | { type: 'close-dialogs' }
        | { type: 'set-status'; value: number };

    const [state, dispatch] = useReducer(
        (current: JobActivityPageState, action: JobActivityPageAction): JobActivityPageState => {
            switch (action.type) {
                case 'set-search-term':
                    return { ...current, searchTerm: action.value };
                case 'open-edit':
                    return {
                        ...current,
                        openEditDialog: true,
                        currentActivity: action.activity,
                        statusValue: action.activity.status || 0,
                    };
                case 'open-delete':
                    return {
                        ...current,
                        openDeleteDialog: true,
                        currentActivity: action.activity,
                    };
                case 'close-dialogs':
                    return {
                        ...current,
                        openEditDialog: false,
                        openDeleteDialog: false,
                    };
                case 'set-status':
                    return { ...current, statusValue: action.value };
                default:
                    return current;
            }
        },
        {
            searchTerm: '',
            openEditDialog: false,
            openDeleteDialog: false,
            currentActivity: null,
            statusValue: 0,
        }
    );

    const debouncedSearch = useDebounce(state.searchTerm, 500);

    const {
        data,
        isLoading,
        updateJobActivity,
        deleteJobActivity,
        isMutating
    } = useJobActivities({
        page: page + 1,
        pageSize: rowsPerPage,
        kw: debouncedSearch,
        ordering
    });

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        dispatch({ type: 'set-search-term', value: e.target.value });
        onPaginationChange({ pageIndex: 0, pageSize: rowsPerPage });
    };

    const handleOpenEdit = (activity: JobPostActivity) => {
        dispatch({ type: 'open-edit', activity });
    };

    const handleOpenDelete = (activity: JobPostActivity) => {
        dispatch({ type: 'open-delete', activity });
    };

    const handleCloseDialogs = () => {
        dispatch({ type: 'close-dialogs' });
    };

    const handleSaveStatus = async () => {
        if (!state.currentActivity) return;
        try {
            await updateJobActivity({
                id: state.currentActivity.id,
                data: { status: state.statusValue }
            });
            handleCloseDialogs();
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = async () => {
        if (!state.currentActivity) return;
        try {
            await deleteJobActivity(state.currentActivity.id);
            handleCloseDialogs();
        } catch (error) {
            console.error(error);
        }
    };

    const columns = useMemo<ColumnDef<JobPostActivity>[]>(() => [
        {
            accessorKey: 'id',
            header: 'ID',
            enableSorting: true,
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
            accessorKey: 'jobPost.jobName',
            header: t('pages.jobActivity.table.jobPost') as string,
            cell: (info) => info.getValue() as string || '---',
        },
        {
            accessorKey: 'jobPost.company.companyName',
            header: t('pages.jobActivity.table.company') as string,
            cell: (info) => info.getValue() as string || '---',
        },
        {
            accessorKey: 'status',
            header: t('pages.jobActivity.table.status') as string,
            enableSorting: true,
            cell: (info) => {
                const status = info.getValue() as number;
                return (
                    <Chip
                        label={t(`pages.jobActivity.statusOptions.${status === 1 ? 'applied' : status === 2 ? 'pending' : status === 3 ? 'accepted' : 'rejected'}`)}
                        size="small"
                        color={
                            status === 3 ? 'success' :
                                status === 4 ? 'error' : 'default'
                        }
                        variant={status === 1 ? 'outlined' : 'filled'}
                    />
                );
            },
        },
        {
            accessorKey: 'createAt',
            header: t('pages.jobActivity.table.updatedAt') as string,
            enableSorting: true,
            cell: (info) => info.getValue() ? dayjs(info.getValue() as string).format('DD/MM/YYYY HH:mm') : '—',
        },
        {
            id: 'actions',
            header: t('pages.jobActivity.table.actions') as string,
            meta: { align: 'right' },
            cell: (info) => (
                <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                    <Tooltip title={t('pages.jobActivity.table.updateStatus')}>
                        <IconButton size="small" onClick={() => handleOpenEdit(info.row.original)} color="primary">
                            <EditIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title={t('pages.jobActivity.table.delete')}>
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
            <Box sx={{ mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary', mb: 1 }}>
                    {t('pages.jobActivity.title')}
                </Typography>
                <Breadcrumbs aria-label="breadcrumb">
                    <Link underline="hover" color="inherit" href="/admin">
                        {t('pages.jobActivity.breadcrumbAdmin')}
                    </Link>
                    <Typography color="text.primary">{t('pages.jobActivity.breadcrumbJobs')}</Typography>
                    <Typography color="text.primary">{t('pages.jobActivity.breadcrumbActivity')}</Typography>
                </Breadcrumbs>
            </Box>
            <Paper sx={{ p: 2, mb: 3, borderRadius: '12px' }} elevation={0}>
                <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
                    <TextField
                        size="small"
                        placeholder={t('pages.jobActivity.searchPlaceholder')}
                        value={state.searchTerm}
                        onChange={handleSearch}
                        sx={{ width: 400 }}
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon fontSize="small" color="action" />
                                    </InputAdornment>
                                ),
                            }
                        }}
                    />
                </Box>

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
            {/* Edit Status Dialog */}
            <Dialog open={state.openEditDialog} onClose={handleCloseDialogs} fullWidth maxWidth="xs">
                <DialogTitle>{t('pages.jobActivity.editStatusTitle')}</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 1 }}>
                        <TextField
                            select
                            fullWidth
                            label={t('pages.jobActivity.statusLabel')}
                            value={state.statusValue}
                            onChange={(e) => dispatch({ type: 'set-status', value: Number(e.target.value) })}
                        >
                            <MenuItem value={1}>{t('pages.jobActivity.statusOptions.applied')}</MenuItem>
                            <MenuItem value={2}>{t('pages.jobActivity.statusOptions.pending')}</MenuItem>
                            <MenuItem value={3}>{t('pages.jobActivity.statusOptions.accepted')}</MenuItem>
                            <MenuItem value={4}>{t('pages.jobActivity.statusOptions.rejected')}</MenuItem>
                        </TextField>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={handleCloseDialogs} color="inherit">{t('pages.jobActivity.cancelBtn')}</Button>
                    <Button
                        onClick={handleSaveStatus}
                        variant="contained"
                        disabled={isMutating}
                    >
                        {isMutating ? t('pages.jobActivity.savingBtn') : t('pages.jobActivity.saveBtn')}
                    </Button>
                </DialogActions>
            </Dialog>
            {/* Delete Confirmation */}
            <Dialog open={state.openDeleteDialog} onClose={handleCloseDialogs}>
                <DialogTitle>{t('pages.jobActivity.deleteTitle')}</DialogTitle>
                <DialogContent>
                    <Typography>
                        {t('pages.jobActivity.deleteText', { name: state.currentActivity?.fullName })}
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={handleCloseDialogs} color="inherit">{t('pages.jobActivity.cancelBtn')}</Button>
                    <Button
                        onClick={handleDelete}
                        color="error"
                        variant="contained"
                        disabled={isMutating}
                    >
                        {isMutating ? t('pages.jobActivity.deletingBtn') : t('pages.jobActivity.deleteBtn')}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default JobActivityPage;
