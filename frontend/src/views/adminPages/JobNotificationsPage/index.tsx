import React, { useState, useMemo } from 'react';
import { Box, Typography, Breadcrumbs, Link, Paper, TextField, InputAdornment, Button, Dialog, DialogTitle, DialogContent, DialogActions, Tooltip, IconButton, Stack } from "@mui/material";
import { useTranslation } from 'react-i18next';
import { ColumnDef } from '@tanstack/react-table';
import DataTable from '../../../components/Common/DataTable';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import dayjs from '../../../configs/dayjs-config';

import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import { useJobNotifications } from './hooks/useJobNotifications';
import { useDataTable } from '../../../hooks';
import { Notification } from '../../../types/models';

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
        kw: searchTerm,
        ordering
    });

    const [openDialog, setOpenDialog] = useState(false);
    const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
    const [currentNotification, setCurrentNotification] = useState<Notification | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        imageUrl: ''
    });

    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        onPaginationChange({ pageIndex: 0, pageSize: pageSize });
    };

    const handleOpenAdd = () => {
        setDialogMode('add');
        setFormData({ title: '', content: '', imageUrl: '' });
        setOpenDialog(true);
    };

    const handleOpenEdit = (notification: Notification) => {
        setDialogMode('edit');
        setCurrentNotification(notification);
        setFormData({
            title: notification.title || '',
            content: notification.content || '',
            imageUrl: notification.imageUrl || ''
        });
        setOpenDialog(true);
    };

    const handleOpenDelete = (notification: Notification) => {
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

    const columns = useMemo<ColumnDef<Notification>[]>(() => [
        {
            accessorKey: 'id',
            header: 'ID',
            enableSorting: true,
        },
        {
            accessorKey: 'imageUrl',
            header: t('pages.jobNotifications.table.image') as string,
            cell: (info) => (
                info.getValue() ? (
                    <Box component="img" src={info.getValue() as string} sx={{ width: 60, height: 40, objectFit: 'cover', borderRadius: 1 }} />
                ) : '—'
            ),
        },
        {
            accessorKey: 'title',
            header: t('pages.jobNotifications.table.title') as string,
            enableSorting: true,
            cell: (info) => (
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {info.getValue() as string}
                </Typography>
            ),
        },
        {
            accessorKey: 'content',
            header: t('pages.jobNotifications.table.content') as string,
            cell: (info) => (
                <Typography variant="body2" sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {info.getValue() as string}
                </Typography>
            ),
        },
        {
            accessorKey: 'createAt',
            header: t('pages.jobNotifications.table.createdAt') as string,
            enableSorting: true,
            cell: (info) => info.getValue() ? dayjs(info.getValue() as string).format('DD/MM/YYYY HH:mm') : '—',
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

            {/* Add/Edit Dialog */}
            <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="sm">
                <DialogTitle>
                    {dialogMode === 'add' ? t('pages.jobNotifications.addNotification') : t('pages.jobNotifications.editNotification')}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
                        <TextField
                            label={t('pages.jobNotifications.form.title')}
                            fullWidth
                            value={formData.title}
                            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                            required
                        />
                        <TextField
                            label={t('pages.jobNotifications.form.imageUrl')}
                            fullWidth
                            value={formData.imageUrl}
                            onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                        />
                        <TextField
                            label={t('pages.jobNotifications.form.content')}
                            fullWidth
                            multiline
                            rows={4}
                            value={formData.content}
                            onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                            required
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={handleCloseDialog} color="inherit">{t('pages.jobNotifications.cancel')}</Button>
                    <Button
                        onClick={handleSave}
                        variant="contained"
                        disabled={isMutating || !formData.title || !formData.content}
                    >
                        {isMutating ? t('common.saving') : t('common.save')}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation */}
            <Dialog open={openDeleteDialog} onClose={handleCloseDialog}>
                <DialogTitle>{t('pages.jobNotifications.deleteTitle')}</DialogTitle>
                <DialogContent>
                    <Typography>
                        {t('pages.jobNotifications.deleteConfirm', { title: currentNotification?.title })}
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
