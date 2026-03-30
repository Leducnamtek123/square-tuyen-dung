import React, { useState, useMemo } from 'react';
import { Box, Typography, Breadcrumbs, Link, Paper, TextField, InputAdornment, Button, Dialog, DialogTitle, DialogContent, DialogActions, MenuItem, Tooltip, IconButton, Stack } from "@mui/material";
import { useTranslation } from 'react-i18next';
import { ColumnDef } from '@tanstack/react-table';
import DataTable from '../../../components/Common/DataTable';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import { useWards } from './hooks/useWards';
import { useDistricts } from '../DistrictsPage/hooks/useDistricts';
import { useCities } from '../CitiesPage/hooks/useCities';
import { useDataTable } from '../../../hooks';
import { Ward, District, City } from '../../../types/models';

const WardsPage = () => {
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
    const [cityFilter, setCityFilter] = useState<string | number>('');
    const [districtFilter, setDistrictFilter] = useState<string | number>('');

    const {
        data,
        isLoading,
        createWard,
        updateWard,
        deleteWard,
        isMutating
    } = useWards({
        page: page + 1,
        pageSize,
        kw: searchTerm,
        district: districtFilter || undefined,
        ordering
    });

    const { data: citiesData } = useCities({ pageSize: 100 });
    const { data: districtsData } = useDistricts({ 
        pageSize: 500, 
        city: cityFilter || undefined 
    });

    const cities = citiesData?.results || [];
    const districts = districtsData?.results || [];

    const [openDialog, setOpenDialog] = useState(false);
    const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
    const [currentWard, setCurrentWard] = useState<Ward | null>(null);
    const [formData, setFormData] = useState<Partial<Ward>>({
        name: '',
        code: '',
        district: undefined
    });

    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        onPaginationChange({ pageIndex: 0, pageSize: pageSize });
    };

    const handleCityFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCityFilter(e.target.value);
        setDistrictFilter('');
        onPaginationChange({ pageIndex: 0, pageSize: pageSize });
    };

    const handleDistrictFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDistrictFilter(e.target.value);
        onPaginationChange({ pageIndex: 0, pageSize: pageSize });
    };

    const handleOpenAdd = () => {
        setDialogMode('add');
        setFormData({ name: '', code: '', district: districtFilter ? Number(districtFilter) : undefined });
        setOpenDialog(true);
    };

    const handleOpenEdit = (ward: Ward) => {
        setDialogMode('edit');
        setCurrentWard(ward);
        setFormData({
            name: ward.name || '',
            code: ward.code || '',
            district: typeof ward.district === 'object' ? (ward.district as District)?.id : ward.district
        });
        setOpenDialog(true);
    };

    const handleOpenDelete = (ward: Ward) => {
        setCurrentWard(ward);
        setOpenDeleteDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setOpenDeleteDialog(false);
    };

    const handleSave = async () => {
        try {
            if (dialogMode === 'add') {
                await createWard(formData);
            } else if (currentWard) {
                await updateWard({
                    id: currentWard.id,
                    data: formData
                });
            }
            handleCloseDialog();
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = async () => {
        if (!currentWard) return;
        try {
            await deleteWard(currentWard.id);
            handleCloseDialog();
        } catch (error) {
            console.error(error);
        }
    };

    const columns = useMemo<ColumnDef<Ward>[]>(() => [
        {
            accessorKey: 'id',
            header: 'ID',
            enableSorting: true,
        },
        {
            accessorKey: 'name',
            header: t('pages.wards.table.name') as string,
            enableSorting: true,
            cell: (info) => (
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {info.getValue() as string}
                </Typography>
            ),
        },
        {
            accessorKey: 'code',
            header: t('pages.wards.table.code') as string,
            enableSorting: true,
        },
        {
            accessorKey: 'districtDict.name',
            header: t('pages.wards.table.district') as string,
            cell: (info) => info.getValue() as string || '—',
        },
        {
            accessorKey: 'districtDict.cityDict.name',
            header: t('pages.wards.table.city') as string,
            cell: (info) => info.getValue() as string || '—',
        },
        {
            id: 'actions',
            header: t('pages.wards.table.actions') as string,
            meta: { align: 'right' },
            cell: (info) => (
                <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                    <Tooltip title={t('pages.wards.table.edit')}>
                        <IconButton size="small" onClick={() => handleOpenEdit(info.row.original)} color="primary">
                            <EditIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title={t('pages.wards.table.delete')}>
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
                        {t('pages.wards.title')}
                    </Typography>
                    <Breadcrumbs aria-label="breadcrumb">
                        <Link underline="hover" color="inherit" href="/admin">
                            {t('pages.wards.breadcrumbAdmin')}
                        </Link>
                        <Typography color="text.primary">{t('pages.wards.breadcrumbLocations')}</Typography>
                        <Typography color="text.primary">{t('pages.wards.breadcrumbWards')}</Typography>
                    </Breadcrumbs>
                </Box>
                <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenAdd}>
                    {t('pages.wards.add')}
                </Button>
            </Box>

            <Paper sx={{ p: 2, mb: 3, borderRadius: '12px' }} elevation={0}>
                <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <TextField
                        size="small"
                        placeholder={t('pages.wards.searchPlaceholder')}
                        value={searchTerm}
                        onChange={handleSearch}
                        sx={{ width: 250 }}
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
                    <TextField
                        select
                        size="small"
                        label={t('pages.wards.filterByCity')}
                        value={cityFilter}
                        onChange={handleCityFilterChange}
                        sx={{ width: 180 }}
                    >
                        <MenuItem value="">{t('common.all')}</MenuItem>
                        {cities.map((city: City) => (
                            <MenuItem key={city.id} value={city.id}>{city.name}</MenuItem>
                        ))}
                    </TextField>
                    <TextField
                        select
                        size="small"
                        label={t('pages.wards.filterByDistrict')}
                        value={districtFilter}
                        onChange={handleDistrictFilterChange}
                        sx={{ width: 220 }}
                        disabled={!cityFilter}
                    >
                        <MenuItem value="">{t('common.all')}</MenuItem>
                        {districts.map((district: District) => (
                            <MenuItem key={district.id} value={district.id}>{district.name}</MenuItem>
                        ))}
                    </TextField>
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
            <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="xs">
                <DialogTitle>
                    {dialogMode === 'add' ? t('pages.wards.add') : t('pages.wards.edit')}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
                        <TextField
                            select
                            label={t('pages.wards.form.district')}
                            fullWidth
                            value={formData.district || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, district: Number(e.target.value) }))}
                            required
                        >
                            {districts.map((district: District) => (
                                <MenuItem key={district.id} value={district.id}>{district.name}</MenuItem>
                            ))}
                        </TextField>
                        <TextField
                            label={t('pages.wards.form.name')}
                            fullWidth
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            required
                        />
                        <TextField
                            label={t('pages.wards.form.code')}
                            fullWidth
                            value={formData.code}
                            onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                            required
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={handleCloseDialog} color="inherit">{t('pages.wards.cancel')}</Button>
                    <Button
                        onClick={handleSave}
                        variant="contained"
                        disabled={isMutating || !formData.name || !formData.code || !formData.district}
                    >
                        {isMutating ? t('common.saving') : t('common.save')}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation */}
            <Dialog open={openDeleteDialog} onClose={handleCloseDialog}>
                <DialogTitle>{t('pages.wards.deleteTitle')}</DialogTitle>
                <DialogContent>
                    <Typography>
                        {t('pages.wards.deleteConfirm', { name: currentWard?.name })}
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={handleCloseDialog} color="inherit">{t('pages.wards.cancel')}</Button>
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

export default WardsPage;
