import React, { useState } from 'react';
import { Box, Paper, TextField, InputAdornment, Button, Dialog, DialogTitle, DialogContent, DialogActions, Typography, Avatar, Chip, Tooltip, IconButton } from "@mui/material";
import { useTranslation } from 'react-i18next';
import { Grid2 as Grid } from "@mui/material";
import { ColumnDef } from '@tanstack/react-table';
import DataTable from '../../../components/Common/DataTable';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';

import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import { useCompanies } from './hooks/useCompanies';

const CompaniesPage = () => {
    const { t } = useTranslation('admin');
    const PAGE_SIZE = 10;
    const [page, setPage] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');

    const {
        data,
        isLoading,
        createCompany,
        updateCompany,
        deleteCompany,
        isMutating
    } = useCompanies({
        page: page + 1,
        pageSize: PAGE_SIZE,
        kw: searchTerm
    }) as any;

    const [openDialog, setOpenDialog] = useState(false);
    const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
    const [currentCompany, setCurrentCompany] = useState<any>(null);
    const [formData, setFormData] = useState({
        companyName: '',
        taxCode: '',
        companyEmail: '',
        companyPhone: '',
        employeeSize: 0,
        fieldOperation: '',
        websiteUrl: '',
    });

    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setPage(0);
    };

    const handleOpenAdd = () => {
        setDialogMode('add');
        setFormData({
            companyName: '',
            taxCode: '',
            companyEmail: '',
            companyPhone: '',
            employeeSize: 50,
            fieldOperation: '',
            websiteUrl: '',
        });
        setCurrentCompany(null);
        setOpenDialog(true);
    };

    const handleOpenEdit = (company: any) => {
        setDialogMode('edit');
        setCurrentCompany(company);
        setFormData({
            companyName: company.companyName || '',
            taxCode: company.taxCode || '',
            companyEmail: company.companyEmail || '',
            companyPhone: company.companyPhone || '',
            employeeSize: company.employeeSize || 0,
            fieldOperation: company.fieldOperation || '',
            websiteUrl: company.websiteUrl || '',
        });
        setOpenDialog(true);
    };

    const handleOpenDelete = (company: any) => {
        setCurrentCompany(company);
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
                const dataToSave = {
                    ...formData,
                    location: {
                        city: 1,
                        district: 1,
                        address: 'N/A'
                    },
                    since: '2023-01-01'
                };
                await createCompany(dataToSave);
            } else {
                await updateCompany({
                    id: currentCompany.id,
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
            await deleteCompany(currentCompany.id);
            setOpenDeleteDialog(false);
        } catch (error) {
            console.error(error);
        }
    };

    const columns = React.useMemo<ColumnDef<any>[]>(() => [
        {
            accessorKey: 'companyImageUrl',
            header: t('pages.companies.table.logo') as string,
            cell: (info) => (
                <Avatar
                    src={info.getValue() as string}
                    variant="rounded"
                    sx={{ width: 48, height: 48, border: '1px solid', borderColor: 'divider' }}
                />
            ),
        },
        {
            accessorKey: 'companyName',
            header: t('pages.companies.table.companyName') as string,
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
            accessorKey: 'employeeSize',
            header: t('pages.companies.table.scale') as string,
            cell: (info) => info.getValue() || '---',
        },
        {
            accessorKey: 'fieldOperation',
            header: t('pages.companies.table.field') as string,
            cell: (info) => info.getValue() || '---',
        },
        {
            accessorKey: 'locationDict.city',
            header: t('pages.companies.table.location') as string,
            cell: (info) => info.getValue() || '---',
        },
        {
            accessorKey: 'jobPostNumber',
            header: t('pages.companies.table.jobPosts') as string,
            meta: { align: 'center' },
            cell: (info) => <Chip label={String(info.getValue() || 0)} size="small" variant="outlined" />,
        },
        {
            accessorKey: 'followNumber',
            header: t('pages.companies.table.followers') as string,
            meta: { align: 'center' },
            cell: (info) => <Chip label={String(info.getValue() || 0)} size="small" />,
        },
        {
            id: 'actions',
            header: t('pages.companies.table.actions') as string,
            meta: { align: 'right' },
            cell: (info) => (
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                    <Tooltip title={t('pages.companies.table.viewDetails')}>
                        <IconButton size="small">
                            <VisibilityIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title={t('pages.companies.table.edit')}>
                        <IconButton size="small" color="primary" onClick={() => handleOpenEdit(info.row.original)}>
                            <EditIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title={t('pages.companies.table.delete')}>
                        <IconButton size="small" color="error" onClick={() => handleOpenDelete(info.row.original)}>
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Box>
            ),
        },
    ], [t]);

    return (
        <Box>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleOpenAdd}
                    sx={{ borderRadius: '8px', textTransform: 'none' }}
                >
                    {t('pages.companies.addCompany')}
                </Button>
            </Box>
            <Paper sx={{ p: 2, mb: 3, borderRadius: '12px' }} elevation={0}>
                <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
                    <TextField
                        size="small"
                        placeholder={t('pages.companies.searchPlaceholder')}
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
                    data={((data as any)?.results || data) as any[]}
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
            {/* Add/Edit Dialog */}
            <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="sm">
                <DialogTitle>
                    {dialogMode === 'add' ? t('pages.companies.addConfirmTitle') : t('pages.companies.editConfirmTitle')}
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ pt: 1 }}>
                        <Grid size={12}>
                            <TextField
                                label={t('pages.companies.companyNameLabel')}
                                fullWidth
                                name="companyName"
                                value={formData.companyName}
                                onChange={handleInputChange}
                                required
                            />
                        </Grid>
                        <Grid size={6}>
                            <TextField
                                label={t('pages.companies.taxCodeLabel')}
                                fullWidth
                                name="taxCode"
                                value={formData.taxCode}
                                onChange={handleInputChange}
                                required
                            />
                        </Grid>
                        <Grid size={6}>
                            <TextField
                                label={t('pages.companies.employeeSizeLabel')}
                                fullWidth
                                type="number"
                                name="employeeSize"
                                value={formData.employeeSize}
                                onChange={handleInputChange}
                                required
                            />
                        </Grid>
                        <Grid size={6}>
                            <TextField
                                label={t('pages.companies.companyEmailLabel')}
                                fullWidth
                                name="companyEmail"
                                value={formData.companyEmail}
                                onChange={handleInputChange}
                                required
                            />
                        </Grid>
                        <Grid size={6}>
                            <TextField
                                label={t('pages.companies.companyPhoneLabel')}
                                fullWidth
                                name="companyPhone"
                                value={formData.companyPhone}
                                onChange={handleInputChange}
                                required
                            />
                        </Grid>
                        <Grid size={12}>
                            <TextField
                                label={t('pages.companies.fieldOperationLabel')}
                                fullWidth
                                name="fieldOperation"
                                value={formData.fieldOperation}
                                onChange={handleInputChange}
                                required
                            />
                        </Grid>
                        <Grid size={12}>
                            <TextField
                                label={t('pages.companies.websiteLabel')}
                                fullWidth
                                name="websiteUrl"
                                value={formData.websiteUrl}
                                onChange={handleInputChange}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={handleCloseDialog} color="inherit">{t('pages.companies.cancelBtn')}</Button>
                    <Button
                        onClick={handleSave}
                        variant="contained"
                        disabled={isMutating || !formData.companyName || !formData.taxCode}
                    >
                        {isMutating ? t('pages.companies.savingBtn') : t('pages.companies.saveBtn')}
                    </Button>
                </DialogActions>
            </Dialog>
            {/* Delete Confirmation */}
            <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
                <DialogTitle>{t('pages.companies.deleteTitle')}</DialogTitle>
                <DialogContent>
                    <Typography dangerouslySetInnerHTML={{ __html: String(t('pages.companies.deleteText', { name: currentCompany?.companyName })) }} />
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setOpenDeleteDialog(false)} color="inherit">{t('pages.companies.cancelBtn')}</Button>
                    <Button
                        onClick={handleDelete}
                        color="error"
                        variant="contained"
                        disabled={isMutating}
                    >
                        {isMutating ? t('pages.companies.deletingBtn') : t('pages.companies.deleteBtn')}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default CompaniesPage;
