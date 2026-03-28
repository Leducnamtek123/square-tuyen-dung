import React, { useState } from 'react';
import { Box, Typography, Paper, TextField, InputAdornment, Button, Dialog, DialogTitle, DialogContent, DialogActions, Chip, Tooltip, IconButton } from "@mui/material";
import { useTranslation } from 'react-i18next';
import { Grid2 as Grid } from "@mui/material";
import { ColumnDef } from '@tanstack/react-table';
import DataTable from '../../../components/Common/DataTable';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import dayjs from '../../../configs/dayjs-config';

import SearchIcon from '@mui/icons-material/Search';
import { useResumes } from './hooks/useResumes';

const ResumesPage = () => {
    const { t } = useTranslation('admin');
    const PAGE_SIZE = 10;
    const [page, setPage] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');

    const {
        data,
        isLoading,
        updateResume,
        deleteResume,
        isMutating
    } = useResumes({
        page: page + 1,
        pageSize: PAGE_SIZE,
        kw: searchTerm
    }) as any;

    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [currentResume, setCurrentResume] = useState<any>(null);
    const [formData, setFormData] = useState({
        title: '',
        salaryMin: 0,
        salaryMax: 0,
        isActive: true,
    });

    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setPage(0);
    };

    const handleOpenEdit = (resume: any) => {
        setCurrentResume(resume);
        setFormData({
            title: resume.title || '',
            salaryMin: resume.salaryMin || 0,
            salaryMax: resume.salaryMax || 0,
            isActive: resume.isActive ?? true,
        });
        setOpenEditDialog(true);
    };

    const handleOpenDelete = (resume: any) => {
        setCurrentResume(resume);
        setOpenDeleteDialog(true);
    };

    const handleCloseDialogs = () => {
        setOpenEditDialog(false);
        setOpenDeleteDialog(false);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSaveEdit = async () => {
        try {
            await updateResume({
                id: currentResume.id,
                data: formData
            });
            handleCloseDialogs();
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = async () => {
        try {
            await deleteResume(currentResume.id);
            handleCloseDialogs();
        } catch (error) {
            console.error(error);
        }
    };

    const columns = React.useMemo<ColumnDef<any>[]>(() => [
        {
            accessorKey: 'title',
            header: t('pages.resumes.table.resumeTitle') as string,
            cell: (info) => (
                <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {info.getValue() as string}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        Slug: {info.row.original.slug}
                    </Typography>
                </Box>
            ),
        },
        {
            accessorKey: 'userDict.fullName',
            header: t('pages.resumes.table.candidate') as string,
            cell: (info) => info.getValue() || '---',
        },
        {
            accessorKey: 'type',
            header: t('pages.resumes.table.resumeType') as string,
            cell: (info) => (
                <Chip
                    label={info.getValue() === 'UPLOAD' ? t('pages.resumes.table.uploadedFile') : t('pages.resumes.table.onlineProfile')}
                    size="small"
                    variant="outlined"
                    color={info.getValue() === 'UPLOAD' ? 'primary' : 'secondary'}
                />
            ),
        },
        {
            accessorKey: 'experience',
            header: t('pages.resumes.table.experience') as string,
            cell: (info) => info.getValue() || '---',
        },
        {
            accessorKey: 'updateAt',
            header: t('pages.resumes.table.lastUpdate') as string,
            cell: (info) => dayjs(info.getValue() as string).format('DD/MM/YYYY HH:mm'),
        },
        {
            accessorKey: 'isActive',
            header: t('pages.resumes.table.status') as string,
            meta: { align: 'center' },
            cell: (info) => (
                <Chip
                    label={info.getValue() ? t('pages.resumes.table.active') : t('pages.resumes.table.inactive')}
                    size="small"
                    color={info.getValue() ? 'success' : 'default'}
                />
            ),
        },
        {
            id: 'actions',
            header: t('pages.resumes.table.actions') as string,
            meta: { align: 'right' },
            cell: (info) => (
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                    <Tooltip title={t('pages.resumes.table.viewDetails')}>
                        <IconButton size="small" onClick={() => handleOpenEdit(info.row.original)}>
                            <VisibilityIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title={t('pages.resumes.table.delete')}>
                        <IconButton size="small" onClick={() => handleOpenDelete(info.row.original)} color="error">
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Box>
            ),
        },
    ], [t]);

    return (
        <Box sx={{ p: 2 }}>
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
                    pagination={{
                        pageIndex: page,
                        pageSize: PAGE_SIZE,
                    }}
                    onPaginationChange={(pagination) => {
                        setPage(pagination.pageIndex);
                    }}
                />
            </Paper>
            {/* Edit Dialog */}
            <Dialog open={openEditDialog} onClose={handleCloseDialogs} fullWidth maxWidth="xs">
                <DialogTitle>{t('pages.resumes.editTitle')}</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ pt: 1 }}>
                        <Grid size={12}>
                            <TextField
                                label={t('pages.resumes.resumeTitleLabel')}
                                fullWidth
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                required
                            />
                        </Grid>
                        <Grid size={6}>
                            <TextField
                                label={t('pages.resumes.minSalaryLabel')}
                                fullWidth
                                type="number"
                                name="salaryMin"
                                value={formData.salaryMin}
                                onChange={handleInputChange}
                            />
                        </Grid>
                        <Grid size={6}>
                            <TextField
                                label={t('pages.resumes.maxSalaryLabel')}
                                fullWidth
                                type="number"
                                name="salaryMax"
                                value={formData.salaryMax}
                                onChange={handleInputChange}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={handleCloseDialogs} color="inherit">{t('pages.resumes.cancelBtn')}</Button>
                    <Button
                        onClick={handleSaveEdit}
                        variant="contained"
                        disabled={isMutating || !formData.title}
                    >
                        {isMutating ? t('pages.resumes.savingBtn') : t('pages.resumes.saveBtn')}
                    </Button>
                </DialogActions>
            </Dialog>
            {/* Delete Confirmation */}
            <Dialog open={openDeleteDialog} onClose={handleCloseDialogs}>
                <DialogTitle>{t('pages.resumes.deleteTitle')}</DialogTitle>
                <DialogContent>
                    <Typography dangerouslySetInnerHTML={{ __html: t('pages.resumes.deleteText', { name: currentResume?.title }) }} />
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={handleCloseDialogs} color="inherit">{t('pages.resumes.cancelBtn')}</Button>
                    <Button
                        onClick={handleDelete}
                        color="error"
                        variant="contained"
                        disabled={isMutating}
                    >
                        {isMutating ? t('pages.resumes.deletingBtn') : t('pages.resumes.deleteBtn')}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ResumesPage;
