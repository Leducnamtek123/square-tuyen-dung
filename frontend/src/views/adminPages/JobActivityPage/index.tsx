import React, { useState } from 'react';
import { Box, Typography, Breadcrumbs, Link, Paper, TextField, InputAdornment, Button, Dialog, DialogTitle, DialogContent, DialogActions, MenuItem, Tooltip, IconButton, Chip } from "@mui/material";
import { useTranslation } from 'react-i18next';
import { ColumnDef } from '@tanstack/react-table';
import DataTable from '../../../components/Common/DataTable';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import dayjs from '../../../configs/dayjs-config';

import SearchIcon from '@mui/icons-material/Search';
import { useJobActivities } from './hooks/useJobActivities';

const JobActivityPage = () => {
    const { t } = useTranslation('admin');
    const PAGE_SIZE = 10;
    const [page, setPage] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');

    const {
        data,
        isLoading,
        updateJobActivity,
        deleteJobActivity,
        isMutating
    } = useJobActivities({
        page: page + 1,
        pageSize: PAGE_SIZE,
        kw: searchTerm
    }) as any;

    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [currentActivity, setCurrentActivity] = useState<any>(null);
    const [statusValue, setStatusValue] = useState('');

    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setPage(0);
    };

    const handleOpenEdit = (activity: any) => {
        setCurrentActivity(activity);
        setStatusValue(activity.status || 'PENDING');
        setOpenEditDialog(true);
    };

    const handleOpenDelete = (activity: any) => {
        setCurrentActivity(activity);
        setOpenDeleteDialog(true);
    };

    const handleCloseDialogs = () => {
        setOpenEditDialog(false);
        setOpenDeleteDialog(false);
    };

    const handleSaveStatus = async () => {
        try {
            await updateJobActivity({
                id: currentActivity.id,
                data: { status: statusValue }
            });
            handleCloseDialogs();
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = async () => {
        try {
            await deleteJobActivity(currentActivity.id);
            handleCloseDialogs();
        } catch (error) {
            console.error(error);
        }
    };

    const columns = React.useMemo<ColumnDef<any>[]>(() => [
        {
            accessorKey: 'userDict.fullName',
            header: t('pages.jobActivity.table.candidate') as string,
            cell: (info) => (
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {info.getValue() as string || '---'}
                </Typography>
            ),
        },
        {
            accessorKey: 'jobPostDict.jobName',
            header: t('pages.jobActivity.table.jobPost') as string,
            cell: (info) => info.getValue() || '---',
        },
        {
            accessorKey: 'companyDict.companyName',
            header: t('pages.jobActivity.table.company') as string,
            cell: (info) => info.getValue() || '---',
        },
        {
            accessorKey: 'status',
            header: t('pages.jobActivity.table.status') as string,
            cell: (info) => {
                const status = info.getValue() as string;
                return (
                    <Chip
                        label={status || '---'}
                        size="small"
                        color={
                            status === 'APPLIED' ? 'primary' :
                                status === 'ACCEPTED' ? 'success' :
                                    status === 'REJECTED' ? 'error' : 'default'
                        }
                    />
                );
            },
        },
        {
            accessorKey: 'updateAt',
            header: t('pages.jobActivity.table.updatedAt') as string,
            cell: (info) => dayjs(info.getValue() as string).format('DD/MM/YYYY HH:mm'),
        },
        {
            id: 'actions',
            header: t('pages.jobActivity.table.actions') as string,
            meta: { align: 'right' },
            cell: (info) => (
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
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
                </Box>
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
                        value={searchTerm}
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
                    data={(data as any)?.results || []}
                    isLoading={isLoading}
                    rowCount={(data as any)?.count || 0}
                    pagination={{
                        pageIndex: page,
                        pageSize: PAGE_SIZE,
                    }}
                    onPaginationChange={(pagination) => {
                        setPage(pagination.pageIndex);
                    }}
                />
            </Paper>
            {/* Edit Status Dialog */}
            <Dialog open={openEditDialog} onClose={handleCloseDialogs} fullWidth maxWidth="xs">
                <DialogTitle>{t('pages.jobActivity.editStatusTitle')}</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 1 }}>
                        <TextField
                            select
                            fullWidth
                            label={t('pages.jobActivity.statusLabel')}
                            value={statusValue}
                            onChange={(e) => setStatusValue(e.target.value)}
                        >
                            <MenuItem value="APPLIED">{t('pages.jobActivity.statusOptions.applied')}</MenuItem>
                            <MenuItem value="PENDING">{t('pages.jobActivity.statusOptions.pending')}</MenuItem>
                            <MenuItem value="ACCEPTED">{t('pages.jobActivity.statusOptions.accepted')}</MenuItem>
                            <MenuItem value="REJECTED">{t('pages.jobActivity.statusOptions.rejected')}</MenuItem>
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
            <Dialog open={openDeleteDialog} onClose={handleCloseDialogs}>
                <DialogTitle>{t('pages.jobActivity.deleteTitle')}</DialogTitle>
                <DialogContent>
                    <Typography dangerouslySetInnerHTML={{ __html: t('pages.jobActivity.deleteText', { name: currentActivity?.userDict?.fullName }) }} />
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
