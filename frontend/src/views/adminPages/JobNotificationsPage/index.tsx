import React, { useState } from 'react';
import { Box, Typography, Breadcrumbs, Link, Paper, TextField, InputAdornment, Dialog, DialogTitle, DialogContent, DialogActions, Button } from "@mui/material";
import { useTranslation } from 'react-i18next';
import { useDataTable } from '../../../hooks';

import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import { useJobNotifications } from './hooks/useJobNotifications';
import JobNotificationTable from './components/JobNotificationTable';

const JobNotificationsPage = () => {
    const { t } = useTranslation('admin');
    
    const {
        page,
        pageSize,
        sorting,
        onSortingChange,
        ordering,
        pagination,
        onPaginationChange,
        searchTerm,
        onSearchChange,
    } = useDataTable();

    const {
        data,
        isLoading,
        createJobNotification,
        updateJobNotification,
        deleteJobNotification,
        isMutating
    } = useJobNotifications({
        page: page + 1,
        pageSize: pageSize,
        kw: searchTerm,
        ordering,
    }) as any;

    const [openDialog, setOpenDialog] = useState(false);
    const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
    const [currentNotification, setCurrentNotification] = useState<any>(null);
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        user: '', // Target user ID
    });

    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        onSearchChange(e.target.value);
    };

    const handleOpenAdd = () => {
        setDialogMode('add');
        setFormData({
            title: '',
            content: '',
            user: '',
        });
        setCurrentNotification(null);
        setOpenDialog(true);
    };

    const handleOpenEdit = (notification: any) => {
        setDialogMode('edit');
        setCurrentNotification(notification);
        setFormData({
            title: notification.title || '',
            content: notification.content || '',
            user: notification.user || '',
        });
        setOpenDialog(true);
    };

    const handleOpenDelete = (notification: any) => {
        setCurrentNotification(notification);
        setOpenDeleteDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        try {
            if (dialogMode === 'add') {
                await createJobNotification(formData);
            } else {
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
        try {
            await deleteJobNotification(currentNotification.id);
            setOpenDeleteDialog(false);
        } catch (error) {
            console.error(error);
        }
    };

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
                        <Typography color="text.primary">{t('pages.jobNotifications.breadcrumbJobsInterviews')}</Typography>
                        <Typography color="text.primary">{t('pages.jobNotifications.title')}</Typography>
                    </Breadcrumbs>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleOpenAdd}
                    sx={{ borderRadius: '8px', textTransform: 'none' }}
                >
                    {t('pages.jobNotifications.addBtn')}
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

                <JobNotificationTable
                    data={(data as any)?.results || data}
                    isLoading={isLoading}
                    rowCount={(data as any)?.count || 0}
                    pagination={pagination}
                    onPaginationChange={onPaginationChange}
                    sorting={sorting}
                    onSortingChange={onSortingChange}
                    onEdit={handleOpenEdit}
                    onDelete={handleOpenDelete}
                />
            </Paper>
            {/* Add/Edit Dialog */}
            <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="sm">
                <DialogTitle>
                    {dialogMode === 'add' ? t('pages.jobNotifications.addTitle') : t('pages.jobNotifications.editTitle')}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                            label={t('pages.jobNotifications.labelTitle')}
                            fullWidth
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            required
                        />
                        <TextField
                            label={t('pages.jobNotifications.labelContent')}
                            fullWidth
                            multiline
                            rows={4}
                            name="content"
                            value={formData.content}
                            onChange={handleInputChange}
                            required
                        />
                        <TextField
                            label={t('pages.jobNotifications.labelRecipient')}
                            fullWidth
                            name="user"
                            value={formData.user}
                            onChange={handleInputChange}
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={handleCloseDialog} color="inherit">{t('pages.jobNotifications.cancelBtn')}</Button>
                    <Button
                        onClick={handleSave}
                        variant="contained"
                        disabled={isMutating || !formData.title || !formData.content}
                    >
                        {isMutating ? t('pages.jobNotifications.sendingBtn') : t('pages.jobNotifications.confirmBtn')}
                    </Button>
                </DialogActions>
            </Dialog>
            {/* Delete Confirmation */}
            <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
                <DialogTitle>{t('pages.jobNotifications.deleteConfirmTitle')}</DialogTitle>
                <DialogContent>
                    <Typography>
                        {t('pages.jobNotifications.deleteConfirmText', { title: currentNotification?.title })}
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setOpenDeleteDialog(false)} color="inherit">{t('pages.jobNotifications.cancelBtn')}</Button>
                    <Button
                        onClick={handleDelete}
                        color="error"
                        variant="contained"
                        disabled={isMutating}
                    >
                        {isMutating ? t('pages.jobNotifications.deletingBtn') : t('pages.jobNotifications.confirmBtn')}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default JobNotificationsPage;
