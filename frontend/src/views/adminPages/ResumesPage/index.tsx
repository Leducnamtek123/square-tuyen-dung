'use client';

import React, { useState, useMemo } from 'react';
import { Box, Typography, Breadcrumbs, Link, Paper, TextField, InputAdornment, Tooltip, IconButton, Stack, Dialog, DialogTitle, DialogContent, DialogActions, Button } from "@mui/material";
import { useTranslation } from 'react-i18next';
import { ColumnDef } from '@tanstack/react-table';
import DataTable from '../../../components/Common/DataTable';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DownloadIcon from '@mui/icons-material/Download';
import { useResumes } from './hooks/useResumes';
import { useDataTable, useDebounce } from '../../../hooks';
import { Resume } from '../../../types/models';
import dayjs from '../../../configs/dayjs-config';

const ResumesPage = () => {
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
        deleteResume,
        isMutating
    } = useResumes({
        page: page + 1,
        pageSize,
        kw: debouncedSearch,
        ordering
    });

    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [currentResume, setCurrentResume] = useState<Resume | null>(null);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        onPaginationChange({ pageIndex: 0, pageSize: pageSize });
    };

    const handleOpenDelete = (resume: Resume) => {
        setCurrentResume(resume);
        setOpenDeleteDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDeleteDialog(false);
    };

    const handleDelete = async () => {
        if (!currentResume) return;
        try {
            await deleteResume(currentResume.id);
            handleCloseDialog();
        } catch (error) {
            console.error(error);
        }
    };

    const columns = useMemo<ColumnDef<Resume>[]>(() => [
        {
            accessorKey: 'id',
            header: 'ID',
            enableSorting: true,
        },
        {
            accessorKey: 'title',
            header: t('pages.resumes.table.title') as string,
            enableSorting: true,
            cell: (info) => (
                <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {info.getValue() as string}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                        {info.row.original.userDict?.fullName || '—'}
                    </Typography>
                </Box>
            ),
        },
        {
            accessorKey: 'isActive',
            header: t('pages.resumes.table.default') as string,
            cell: (info) => info.getValue() ? t('common.yes') : t('common.no'),
        },
        {
            accessorKey: 'createAt',
            header: t('pages.resumes.table.createdAt') as string,
            cell: (info) => info.getValue() ? dayjs(info.getValue() as string).format('DD/MM/YYYY') : '—',
        },
        {
            id: 'actions',
            header: t('pages.resumes.table.actions') as string,
            meta: { align: 'right' },
            cell: (info) => {
                const resume = info.row.original;
                return (
                    <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                        <Tooltip title={t('pages.resumes.table.view')}>
                             <IconButton size="small" component="a" href={resume.fileUrl || '#'} target="_blank" color="info">
                                <VisibilityIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title={t('pages.resumes.table.download')}>
                             <IconButton size="small" component="a" href={resume.fileUrl || '#'} download color="primary">
                                <DownloadIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title={t('pages.resumes.table.delete')}>
                            <IconButton size="small" onClick={() => handleOpenDelete(resume)} color="error">
                                <DeleteIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </Stack>
                );
            },
        },
    ], [t]);

    return (
        <Box>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary', mb: 1 }}>
                        {t('pages.resumes.title')}
                    </Typography>
                    <Breadcrumbs aria-label="breadcrumb">
                        <Link underline="hover" color="inherit" href="/admin">
                            {t('pages.resumes.breadcrumbAdmin')}
                        </Link>
                        <Typography color="text.primary">{t('pages.resumes.breadcrumbResources')}</Typography>
                        <Typography color="text.primary">{t('pages.resumes.breadcrumbResumes')}</Typography>
                    </Breadcrumbs>
                </Box>
            </Box>

            <Paper sx={{ p: 2, mb: 3, borderRadius: '12px' }} elevation={0}>
                <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
                    <TextField
                        size="small"
                        placeholder={t('pages.resumes.searchPlaceholder')}
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
                <DialogTitle>{t('pages.resumes.deleteTitle')}</DialogTitle>
                <DialogContent>
                    <Typography>
                        {t('pages.resumes.deleteConfirm', { title: currentResume?.title })}
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={handleCloseDialog} color="inherit">{t('pages.resumes.cancel')}</Button>
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

export default ResumesPage;
