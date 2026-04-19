import React, { useCallback, useState, useMemo } from 'react';
import { Box, Typography, Breadcrumbs, Link, Paper, TextField, InputAdornment, Tooltip, IconButton, Stack, Chip, Dialog, DialogTitle, DialogContent, DialogActions, Button } from "@mui/material";
import { useTranslation } from 'react-i18next';
import { ColumnDef } from '@tanstack/react-table';
import DataTable from '../../../components/Common/DataTable';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { useJobs } from './hooks/useJobs';
import { useDataTable } from '../../../hooks';
import { JobPost } from '../../../types/models';
import dayjs from '../../../configs/dayjs-config';

const JobsPage = () => {
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
        approveJob,
        rejectJob,
        deleteJob,
        isMutating
    } = useJobs({
        page: page + 1,
        pageSize,
        kw: searchTerm,
        ordering
    });

    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [currentJob, setCurrentJob] = useState<JobPost | null>(null);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        onPaginationChange({ pageIndex: 0, pageSize: pageSize });
    };

    const handleApprove = useCallback(async (id: string | number) => {
        try {
            await approveJob(id);
        } catch (error) {
            console.error(error);
        }
    }, [approveJob]);

    const handleReject = useCallback(async (id: string | number) => {
        try {
            await rejectJob(id);
        } catch (error) {
            console.error(error);
        }
    }, [rejectJob]);

    const handleOpenDelete = useCallback((job: JobPost) => {
        setCurrentJob(job);
        setOpenDeleteDialog(true);
    }, []);

    const handleCloseDialog = () => {
        setOpenDeleteDialog(false);
    };

    const handleDelete = async () => {
        if (!currentJob) return;
        try {
            await deleteJob(currentJob.id);
            handleCloseDialog();
        } catch (error) {
            console.error(error);
        }
    };

    const getStatusLabel = useCallback((status: JobPost['status'], isExpired?: boolean) => {
        const s = Number(status);
        if (isExpired && s === 3) {
            return <Chip label={t('pages.jobs.status.expired', 'Expired')} size="small" color="default" />;
        }
        switch (s) {
            case 1: return <Chip label={t('pages.jobs.status.pending', 'Pending Review')} size="small" color="warning" />;
            case 2: return <Chip label={t('pages.jobs.status.rejected', 'Rejected')} size="small" color="error" />;
            case 3: return <Chip label={t('pages.jobs.status.approved', 'Approved')} size="small" color="success" />;
            default: return <Chip label={t('pages.jobs.status.unknown', 'Unknown')} size="small" />;
        }
    }, [t]);

    const columns = useMemo<ColumnDef<JobPost>[]>(() => [
        {
            accessorKey: 'id',
            header: 'ID',
            enableSorting: true,
        },
        {
            accessorKey: 'jobName',
            header: t('pages.jobs.table.title') as string,
            enableSorting: true,
            cell: (info) => (
                <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {info.getValue() as string}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                        {info.row.original.companyDict?.companyName || info.row.original.company?.companyName || '—'}
                    </Typography>
                </Box>
            ),
        },
        {
            accessorKey: 'status',
            header: t('pages.jobs.table.status') as string,
            cell: (info) => getStatusLabel(info.getValue() as JobPost['status'], info.row.original.isExpired),
        },
        {
            accessorKey: 'createAt',
            header: t('pages.jobs.table.createdAt') as string,
            cell: (info) => info.getValue() ? dayjs(info.getValue() as string).format('DD/MM/YYYY') : '—',
        },
        {
            id: 'actions',
            header: t('pages.jobs.table.actions') as string,
            meta: { align: 'right' },
            cell: (info) => {
                const job = info.row.original;
                return (
                    <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                        <Tooltip title={t('pages.jobs.table.view', 'View Job')}>
                             <IconButton size="small" component="a" href={`/jobs/${job.slug}`} target="_blank" color="info">
                                <VisibilityIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                        {Number(job.status) === 1 && (
                            <>
                                <Tooltip title={t('pages.jobs.table.approve', 'Approve')}>
                                    <IconButton size="small" onClick={() => handleApprove(job.id)} color="success">
                                        <CheckCircleIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title={t('pages.jobs.table.reject', 'Reject')}>
                                    <IconButton size="small" onClick={() => handleReject(job.id)} color="warning">
                                        <CancelIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            </>
                        )}
                        {Number(job.status) === 3 && (
                            <Tooltip title={t('pages.jobs.table.reject', 'Revoke/Reject')}>
                                <IconButton size="small" onClick={() => handleReject(job.id)} color="warning">
                                    <CancelIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        )}
                        <Tooltip title={t('pages.jobs.table.delete')}>
                            <IconButton size="small" onClick={() => handleOpenDelete(job)} color="error">
                                <DeleteIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </Stack>
                );
            },
        },
    ], [getStatusLabel, handleApprove, handleOpenDelete, handleReject, t]);

    return (
        <Box>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary', mb: 1 }}>
                        {t('pages.jobs.title')}
                    </Typography>
                    <Breadcrumbs aria-label="breadcrumb">
                        <Link underline="hover" color="inherit" href="/admin">
                            {t('pages.jobs.breadcrumbAdmin')}
                        </Link>
                        <Typography color="text.primary">{t('pages.jobs.breadcrumbListings')}</Typography>
                        <Typography color="text.primary">{t('pages.jobs.breadcrumbJobs')}</Typography>
                    </Breadcrumbs>
                </Box>
            </Box>

            <Paper sx={{ p: 2, mb: 3, borderRadius: '12px' }} elevation={0}>
                <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
                    <TextField
                        size="small"
                        placeholder={t('pages.jobs.searchPlaceholder')}
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

            {/* Delete Confirmation */}
            <Dialog open={openDeleteDialog} onClose={handleCloseDialog}>
                <DialogTitle>{t('pages.jobs.deleteTitle')}</DialogTitle>
                <DialogContent>
                    <Typography>
                        {t('pages.jobs.deleteConfirm', { name: currentJob?.jobName })}
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={handleCloseDialog} color="inherit">{t('pages.jobs.cancel')}</Button>
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

export default JobsPage;
