import React, { useState, useMemo } from 'react';
import { Box, Typography, Breadcrumbs, Link, Paper, TextField, InputAdornment, Button, Dialog, DialogTitle, DialogContent, DialogActions, MenuItem, Tooltip, IconButton, Stack } from "@mui/material";
import { useTranslation } from 'react-i18next';
import { ColumnDef } from '@tanstack/react-table';
import DataTable from '../../../components/Common/DataTable';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import { useDistricts } from './hooks/useDistricts';
import { useCities } from '../CitiesPage/hooks/useCities';
import { useDataTable, useDebounce } from '../../../hooks';
import { District, City } from '../../../types/models';
import type { DistrictPayload } from '../../../services/adminManagementService';

const DistrictsPage = () => {
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
    const [cityFilter, setCityFilter] = useState<string | number>('');

    const {
        data,
        isLoading,
        createDistrict,
        updateDistrict,
        deleteDistrict,
        isMutating
    } = useDistricts({
        page: page + 1,
        pageSize,
        kw: debouncedSearch,
        city: cityFilter ? Number(cityFilter) : undefined,
        ordering
    });

    const { data: citiesData } = useCities({ pageSize: 100 });
    const cities = citiesData?.results || [];

    const [openDialog, setOpenDialog] = useState(false);
    const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
    const [currentDistrict, setCurrentDistrict] = useState<District | null>(null);
    const [formData, setFormData] = useState<Partial<DistrictPayload>>({
        name: '',
        code: '',
        city: undefined
    });

    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        onPaginationChange({ pageIndex: 0, pageSize: pageSize });
    };

    const handleCityFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCityFilter(e.target.value);
        onPaginationChange({ pageIndex: 0, pageSize: pageSize });
    };

    const handleOpenAdd = () => {
        setDialogMode('add');
        setFormData({ name: '', code: '', city: cityFilter ? Number(cityFilter) : undefined });
        setOpenDialog(true);
    };

    const handleOpenEdit = (district: District) => {
        setDialogMode('edit');
        setCurrentDistrict(district);
        setFormData({
            name: district.name || '',
            code: district.code || '',
            city: district.city ? Number(typeof district.city === 'object' ? district.city?.id : district.city) : undefined
        });
        setOpenDialog(true);
    };

    const handleOpenDelete = (district: District) => {
        setCurrentDistrict(district);
        setOpenDeleteDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setOpenDeleteDialog(false);
    };

    const handleSave = async () => {
        if (!formData.name || !formData.code || !formData.city) return;

        const payload: DistrictPayload = {
            name: formData.name,
            code: formData.code,
            city: Number(formData.city),
        };

        try {
            if (dialogMode === 'add') {
                await createDistrict(payload);
            } else if (currentDistrict) {
                await updateDistrict({
                    id: currentDistrict.id,
                    data: payload
                });
            }
            handleCloseDialog();
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = async () => {
        if (!currentDistrict) return;
        try {
            await deleteDistrict(currentDistrict.id);
            handleCloseDialog();
        } catch (error) {
            console.error(error);
        }
    };

    const columns = useMemo<ColumnDef<District>[]>(() => [
        {
            accessorKey: 'id',
            header: 'ID',
            enableSorting: true,
        },
        {
            accessorKey: 'name',
            header: t('pages.districts.table.name') as string,
            enableSorting: true,
            cell: (info) => (
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {info.getValue() as string}
                </Typography>
            ),
        },
        {
            accessorKey: 'code',
            header: t('pages.districts.table.code') as string,
            enableSorting: true,
        },
        {
            accessorKey: 'cityDict.name',
            header: t('pages.districts.table.city') as string,
            cell: (info) => info.getValue() as string || '—',
        },
        {
            id: 'actions',
            header: t('pages.districts.table.actions') as string,
            meta: { align: 'right' },
            cell: (info) => (
                <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                    <Tooltip title={t('pages.districts.table.edit')}>
                        <IconButton size="small" onClick={() => handleOpenEdit(info.row.original)} color="primary">
                            <EditIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title={t('pages.districts.table.delete')}>
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
                        {t('pages.districts.title')}
                    </Typography>
                    <Breadcrumbs aria-label="breadcrumb">
                        <Link underline="hover" color="inherit" href="/admin">
                            {t('pages.districts.breadcrumbAdmin')}
                        </Link>
                        <Typography color="text.primary">{t('pages.districts.breadcrumbLocations')}</Typography>
                        <Typography color="text.primary">{t('pages.districts.breadcrumbDistricts')}</Typography>
                    </Breadcrumbs>
                </Box>
                <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenAdd}>
                    {t('pages.districts.add')}
                </Button>
            </Box>

            <Paper sx={{ p: 2, mb: 3, borderRadius: '12px' }} elevation={0}>
                <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
                    <TextField
                        size="small"
                        placeholder={t('pages.districts.searchPlaceholder')}
                        value={searchTerm}
                        onChange={handleSearch}
                        sx={{ width: 300 }}
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
                        label={t('pages.districts.filterByCity')}
                        value={cityFilter}
                        onChange={handleCityFilterChange}
                        sx={{ width: 220 }}
                    >
                        <MenuItem value="">{t('common.all')}</MenuItem>
                        {cities.map((city: City) => (
                            <MenuItem key={city.id} value={city.id}>{city.name}</MenuItem>
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
                    {dialogMode === 'add' ? t('pages.districts.add') : t('pages.districts.edit')}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
                        <TextField
                            select
                            label={t('pages.districts.form.city')}
                            fullWidth
                            value={formData.city || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, city: Number(e.target.value) }))}
                            required
                        >
                            {cities.map((city) => (
                                <MenuItem key={city.id} value={city.id}>{city.name}</MenuItem>
                            ))}
                        </TextField>
                        <TextField
                            label={t('pages.districts.form.name')}
                            fullWidth
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            required
                        />
                        <TextField
                            label={t('pages.districts.form.code')}
                            fullWidth
                            value={formData.code}
                            onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                            required
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={handleCloseDialog} color="inherit">{t('pages.districts.cancel')}</Button>
                    <Button
                        onClick={handleSave}
                        variant="contained"
                        disabled={isMutating || !formData.name || !formData.code || !formData.city}
                    >
                        {isMutating ? t('common.saving') : t('common.save')}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation */}
            <Dialog open={openDeleteDialog} onClose={handleCloseDialog}>
                <DialogTitle>{t('pages.districts.deleteTitle')}</DialogTitle>
                <DialogContent>
                    <Typography>
                        {t('pages.districts.deleteConfirm', { name: currentDistrict?.name })}
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={handleCloseDialog} color="inherit">{t('pages.districts.cancel')}</Button>
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

export default DistrictsPage;
