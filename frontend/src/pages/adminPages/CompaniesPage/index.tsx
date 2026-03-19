import React, { useState } from 'react';
import { Box, Paper, TextField, InputAdornment, Pagination, CircularProgress, Button, Dialog, DialogTitle, DialogContent, DialogActions, Typography } from "@mui/material";
import { useTranslation } from 'react-i18next';
import Grid from "@mui/material/Grid2";

import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import { useCompanies } from './hooks/useCompanies';
import CompanyTable from './components/CompanyTable';

const CompaniesPage = () => {
    const { t } = useTranslation('admin');
    const PAGE_SIZE = 10;
    const [page, setPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');

    const {
        data,
        isLoading,
        createCompany,
        updateCompany,
        deleteCompany,
        isMutating
    } = useCompanies({
        page,
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
        setPage(1);
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

    return (
        <>
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

                {isLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
                        <CircularProgress size={40} />
                    </Box>
                ) : (
                    <>
                        <CompanyTable
                            data={((data as any)?.results || data) as any[]}
                            onEdit={handleOpenEdit}
                            onDelete={handleOpenDelete}
                        />
                        {(data as any)?.count > 0 && (
                            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                                <Pagination
                                    count={Math.ceil((data as any).count / PAGE_SIZE)}
                                    page={page}
                                    onChange={(e, v) => setPage(v)}
                                    color="primary"
                                />
                            </Box>
                        )}
                    </>
                )}
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
        </>
    );
};

export default CompaniesPage;
