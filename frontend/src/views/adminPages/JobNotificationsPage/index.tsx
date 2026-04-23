import React, { useState, useMemo } from 'react';
import { Box, Typography, Breadcrumbs, Link, Paper, TextField, InputAdornment, Button, Dialog, DialogTitle, DialogContent, DialogActions, Tooltip, IconButton, Stack, MenuItem } from "@mui/material";
import { useTranslation } from 'react-i18next';
import { ColumnDef } from '@tanstack/react-table';
import DataTable from '../../../components/Common/DataTable';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import { useJobNotifications } from './hooks/useJobNotifications';
import { useDataTable, useDebounce } from '../../../hooks';
import { JobPostNotification } from '../../../types/models';
import type { JobPostNotificationPayload } from '../../../services/adminManagementService';

const JobNotificationsPage = () => {
    const { t } = useTranslation('admin');

    const {
        page,
        pageSize,
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

    const [openDialog, setOpenDialog] = useState(false);
    const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
    const [currentNotification, setCurrentNotification] = useState<JobPostNotification | null>(null);
    const [formData, setFormData] = useState<JobPostNotificationPayload>({
        jobName: '',
        salary: null,
        frequency: 7,
        position: null,
        experience: null,
        career: null,
        city: null,
        isActive: false,
    });

    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        onPaginationChange({ pageIndex: 0, pageSize: pageSize });
    };

    const handleOpenAdd = () => {
        setDialogMode('add');
        setFormData({
            jobName: '',
            salary: null,
            frequency: 7,
            position: null,
            experience: null,
            career: null,
            city: null,
            isActive: false,
        });
        setOpenDialog(true);
    };

    const handleOpenEdit = (notification: JobPostNotification) => {
        setDialogMode('edit');
        setCurrentNotification(notification);
        setFormData({
            jobName: notification.jobName || '',
            salary: notification.salary ?? null,
            frequency: notification.frequency ?? 7,
            position: notification.position ?? null,
            experience: notification.experience ?? null,
            career: notification.career ?? null,
            city: notification.city ?? null,
            isActive: !!notification.isActive,
        });
        setOpenDialog(true);
    };

    const handleOpenDelete = (notification: JobPostNotification) => {
        setCurrentNotification(notification);
        setOpenDeleteDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setOpenDeleteDialog(false);
    };

    const handleSave = async () => {
        try {
            if (dialogMode === 'add') {
                await createJobNotification(formData);
            } else if (currentNotification) {
                await updateJobNotification({
                    id: currentNotification.id,
                    data: formData
                });
            }
            handleCloseDialog();
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = async () => {
        if (!currentNotification) return;
        try {
            await deleteJobNotification(currentNotification.id);
            handleCloseDialog();
        } catch (error) {
            console.error(error);
        }
    };

    const columns = useMemo<ColumnDef<JobPostNotification>[]>(() => [
        {
            accessorKey: 'id',
            header: 'ID',
            enableSorting: true,
        },
        {
            accessorKey: 'jobName',
            header: t('pages.jobNotifications.table.title', { defaultValue: 'Job Name' }) as string,
            enableSorting: true,
            cell: (info) => (
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {info.getValue() as string}
                </Typography>
            ),
        },
        {
            accessorKey: 'salary',
            header: t('pages.jobNotifications.form.salary', { defaultValue: 'Salary' }) as string,
            cell: (info) => info.getValue() ?? '-',
        },
        {
            accessorKey: 'frequency',
            header: t('pages.jobNotifications.form.frequency', { defaultValue: 'Frequency' }) as string,
            enableSorting: true,
            cell: (info) => info.getValue() ?? '-',
        },
        {
            accessorKey: 'isActive',
            header: t('pages.jobNotifications.form.isActive', { defaultValue: 'Active' }) as string,
            cell: (info) => (info.getValue() ? t('common.yes', { defaultValue: 'Yes' }) : t('common.no', { defaultValue: 'No' })),
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
                <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
                    <TextField
                        size="small"
                        placeholder={t('pages.jobNotifications.searchPlaceholder')}
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

            <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="sm">
                <DialogTitle>
                    {dialogMode === 'add' ? t('pages.jobNotifications.addNotification') : t('pages.jobNotifications.editNotification')}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
                        <TextField
                            label={t('pages.jobNotifications.form.title', { defaultValue: 'Job Name' })}
                            fullWidth
                            value={formData.jobName}
                            onChange={(e) => setFormData(prev => ({ ...prev, jobName: e.target.value }))}
                            required
                        />
                        <TextField
                            label={t('pages.jobNotifications.form.salary', { defaultValue: 'Salary' })}
                            fullWidth
                            type="number"
                            value={formData.salary ?? ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, salary: e.target.value ? Number(e.target.value) : null }))}
                        />
                        <TextField
                            label={t('pages.jobNotifications.form.frequency', { defaultValue: 'Frequency' })}
                            fullWidth
                            select
                            value={formData.frequency}
                            onChange={(e) => setFormData(prev => ({ ...prev, frequency: Number(e.target.value) }))}
                            required
                        >
                            <MenuItem value={1}>1</MenuItem>
                            <MenuItem value={7}>7</MenuItem>
                            <MenuItem value={30}>30</MenuItem>
                        </TextField>
                        <TextField
                            label={t('pages.jobNotifications.form.position', { defaultValue: 'Position' })}
                            fullWidth
                            type="number"
                            value={formData.position ?? ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value ? Number(e.target.value) : null }))}
                        />
                        <TextField
                            label={t('pages.jobNotifications.form.experience', { defaultValue: 'Experience' })}
                            fullWidth
                            type="number"
                            value={formData.experience ?? ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, experience: e.target.value ? Number(e.target.value) : null }))}
                        />
                        <TextField
                            label={t('pages.jobNotifications.form.careerId', { defaultValue: 'Career ID' })}
                            fullWidth
                            type="number"
                            value={formData.career ?? ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, career: e.target.value ? Number(e.target.value) : null }))}
                        />
                        <TextField
                            label={t('pages.jobNotifications.form.cityId', { defaultValue: 'City ID' })}
                            fullWidth
                            type="number"
                            value={formData.city ?? ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value ? Number(e.target.value) : null }))}
                        />
                        <TextField
                            label={t('pages.jobNotifications.form.isActive', { defaultValue: 'Active' })}
                            fullWidth
                            select
                            value={formData.isActive ? 'true' : 'false'}
                            onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.value === 'true' }))}
                        >
                            <MenuItem value="true">{t('common.yes', { defaultValue: 'Yes' })}</MenuItem>
                            <MenuItem value="false">{t('common.no', { defaultValue: 'No' })}</MenuItem>
                        </TextField>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={handleCloseDialog} color="inherit">{t('pages.jobNotifications.cancel')}</Button>
                    <Button
                        onClick={handleSave}
                        variant="contained"
                        disabled={isMutating || !formData.jobName || !formData.frequency}
                    >
                        {isMutating ? t('common.saving') : t('common.save')}
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={openDeleteDialog} onClose={handleCloseDialog}>
                <DialogTitle>{t('pages.jobNotifications.deleteTitle')}</DialogTitle>
                <DialogContent>
                    <Typography>
                        {t('pages.jobNotifications.deleteConfirm', { title: currentNotification?.jobName })}
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={handleCloseDialog} color="inherit">{t('pages.jobNotifications.cancel')}</Button>
                    <Button
                        onClick={handleDelete}
                        color="error"
                        variant="contained"
                        disabled={isMutating}
                    >
                        {isMutating ? t('common.deleting') : t('common.delete')}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default JobNotificationsPage;
