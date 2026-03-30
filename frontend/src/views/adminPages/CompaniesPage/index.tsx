import React, { useState, useRef } from 'react';
import { Box, Paper, TextField, InputAdornment, Button, Dialog, DialogTitle, DialogContent, DialogActions, Typography, Avatar, Chip, Tooltip, IconButton, Stack, Breadcrumbs, Link } from "@mui/material";
import { useTranslation } from 'react-i18next';
import { Grid2 as Grid } from "@mui/material";
import { ColumnDef } from '@tanstack/react-table';
import DataTable from '../../../components/Common/DataTable';
import { useDataTable } from '../../../hooks';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import { useCompanies } from './hooks/useCompanies';
import { Company } from '../../../types/models';
import { IMAGES } from '../../../configs/constants';

interface CompanyFormData {
    companyName: string;
    taxCode: string;
    companyEmail: string;
    companyPhone: string;
    employeeSize: number;
    fieldOperation: string;
    websiteUrl: string;
    description: string;
}

const CompaniesPage = () => {
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
    } = useDataTable({ initialPageSize: 10 });

    const {
        data,
        isLoading,
        createCompany,
        updateCompany,
        deleteCompany,
        isMutating
    } = useCompanies({
        page: page + 1,
        pageSize: pageSize,
        kw: searchTerm,
        ordering,
    });

    const [openDialog, setOpenDialog] = useState(false);
    const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
    const [currentCompany, setCurrentCompany] = useState<Company | null>(null);
    
    const [formData, setFormData] = useState<CompanyFormData>({
        companyName: '',
        taxCode: '',
        companyEmail: '',
        companyPhone: '',
        employeeSize: 0,
        fieldOperation: '',
        websiteUrl: '',
        description: '',
    });

    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string>('');
    const logoInputRef = useRef<HTMLInputElement>(null);

    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        onSearchChange(e.target.value);
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
            description: '',
        });
        setLogoFile(null);
        setLogoPreview('');
        setCurrentCompany(null);
        setOpenDialog(true);
    };

    const handleOpenEdit = (company: Company) => {
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
            description: company.description || '',
        });
        setLogoFile(null);
        setLogoPreview(company.companyImageUrl || '');
        setOpenDialog(true);
    };

    const handleOpenDelete = (company: Company) => {
        setCurrentCompany(company);
        setOpenDeleteDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'employeeSize' ? Number(value) : value }));
    };

    const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setLogoFile(file);
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    const handleSave = async () => {
        const dataToSend = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
            dataToSend.append(key, String(value));
        });
        
        if (logoFile) {
            dataToSend.append('companyImageFile', logoFile);
        }

        // Add default location for new companies if needed by API
        if (dialogMode === 'add') {
             // If API requires a flat location object or ID
             dataToSend.append('cityId', '1'); 
             dataToSend.append('districtId', '1');
             dataToSend.append('wardId', '1');
             dataToSend.append('address', 'N/A');
        }

        try {
            if (dialogMode === 'add') {
                await createCompany(dataToSend);
            } else if (currentCompany) {
                await updateCompany({
                    id: currentCompany.id,
                    data: dataToSend
                });
            }
            handleCloseDialog();
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = async () => {
        if (!currentCompany) return;
        try {
            await deleteCompany(currentCompany.id);
            setOpenDeleteDialog(false);
        } catch (error) {
            console.error(error);
        }
    };

    const columns = React.useMemo<ColumnDef<Company>[]>(() => [
        {
            accessorKey: 'companyImageUrl',
            header: t('pages.companies.table.logo') as string,
            cell: (info) => (
                <Avatar
                    src={info.getValue() as string || IMAGES.companyLogoDefault}
                    variant="rounded"
                    sx={{ width: 48, height: 48, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}
                />
            ),
        },
        {
            accessorKey: 'companyName',
            header: t('pages.companies.table.companyName') as string,
            enableSorting: true,
            cell: (info) => (
                <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {info.getValue() as string}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                         {info.row.original.taxCode || '—'}
                    </Typography>
                </Box>
            ),
        },
        {
            accessorKey: 'employeeSize',
            header: t('pages.companies.table.scale') as string,
            enableSorting: true,
            cell: (info) => info.getValue() || '---',
        },
        {
            accessorKey: 'fieldOperation',
            header: t('pages.companies.table.field') as string,
            enableSorting: true,
            cell: (info) => info.getValue() || '---',
        },
        {
            accessorKey: 'locationDict.city',
            header: t('pages.companies.table.location') as string,
            cell: (info) => info.getValue() as string || '---',
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
                        <IconButton size="small" component="a" href={`/companies/${info.row.original.slug}`} target="_blank">
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
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary', mb: 1 }}>
                        {t('pages.companies.title')}
                    </Typography>
                    <Breadcrumbs>
                        <Link underline="hover" color="inherit" href="/admin">{t('pages.companies.breadcrumbAdmin')}</Link>
                        <Typography color="text.primary">{t('pages.companies.breadcrumbList')}</Typography>
                    </Breadcrumbs>
                </Box>
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
            <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="md">
                <DialogTitle sx={{ fontWeight: 700 }}>
                    {dialogMode === 'add' ? t('pages.companies.addConfirmTitle') : t('pages.companies.editConfirmTitle')}
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={3} sx={{ pt: 1 }}>
                        <Grid size={12} sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                             <Box sx={{ position: 'relative' }}>
                                <Avatar 
                                    src={logoPreview || IMAGES.companyLogoDefault} 
                                    sx={{ width: 100, height: 100, border: '2px solid', borderColor: 'primary.main', borderRadius: '12px' }}
                                    variant="rounded"
                                />
                                <IconButton 
                                    component="label"
                                    sx={{ 
                                        position: 'absolute', 
                                        bottom: -10, 
                                        right: -10, 
                                        bgcolor: 'primary.main', 
                                        color: 'white',
                                        '&:hover': { bgcolor: 'primary.dark' }
                                    }}
                                    size="small"
                                >
                                    <input type="file" hidden accept="image/*" onChange={handleLogoSelect} ref={logoInputRef} />
                                    <PhotoCameraIcon fontSize="small" />
                                </IconButton>
                             </Box>
                        </Grid>
                        
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
                                placeholder="https://..."
                            />
                        </Grid>
                        <Grid size={12}>
                            <TextField
                                label={t('pages.companies.descriptionLabel')}
                                fullWidth
                                multiline
                                rows={4}
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button onClick={handleCloseDialog} color="inherit">{t('pages.companies.cancelBtn')}</Button>
                    <Button
                        onClick={handleSave}
                        variant="contained"
                        disabled={isMutating || !formData.companyName || !formData.taxCode}
                        sx={{ px: 4 }}
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
