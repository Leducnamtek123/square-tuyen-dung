import React, { useState } from 'react';
import { Box, Typography, Breadcrumbs, Link, Paper, TextField, InputAdornment, Pagination, CircularProgress, Button, Dialog, DialogTitle, DialogContent, DialogActions, MenuItem } from "@mui/material";
import { useTranslation } from 'react-i18next';

import SearchIcon from '@mui/icons-material/Search';
import { useJobActivities } from './hooks/useJobActivities';
import JobActivityTable from './components/JobActivityTable';

const JobActivityPage = () => {
    const { t } = useTranslation('admin');
    const [page, setPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');

    const {
        data,
        isLoading,
        updateJobActivity,
        deleteJobActivity,
        isMutating
    } = useJobActivities({
        page,
        kw: searchTerm
    });

    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [currentActivity, setCurrentActivity] = useState(null);
    const [statusValue, setStatusValue] = useState('');

    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setPage(1);
    };

    const handleOpenEdit = (activity) => {
        setCurrentActivity(activity);
        setStatusValue(activity.status || 'PENDING');
        setOpenEditDialog(true);
    };

    const handleOpenDelete = (activity) => {
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

                {isLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
                        <CircularProgress size={40} />
                    </Box>
                ) : (
                    <>
                        <JobActivityTable
                            data={data?.results || data}
                            onEdit={handleOpenEdit}
                            onDelete={handleOpenDelete}
                        />
                        {data?.count > 0 && (
                            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                                <Pagination
                                    count={Math.ceil(data.count / 10)}
                                    page={page}
                                    onChange={(e, v) => setPage(v)}
                                    color="primary"
                                />
                            </Box>
                        )}
                    </>
                )}
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
