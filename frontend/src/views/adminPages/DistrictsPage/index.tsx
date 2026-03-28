import React, { useState, useEffect, useMemo } from 'react';
import { Box, Typography, Breadcrumbs, Link, Button, IconButton, Tooltip, MenuItem, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Paper } from "@mui/material";
import { useTranslation } from 'react-i18next';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useDistricts } from './hooks/useDistricts';
import { useCities } from '../CitiesPage/hooks/useCities';
import { ColumnDef } from '@tanstack/react-table';
import DataTable from '../../../components/Common/DataTable';

const DistrictsPage = () => {
    const { t } = useTranslation('admin');
    const { data: citiesData, isLoading: isLoadingCities } = useCities() as any;
    const cities = (citiesData?.results || citiesData) as any[];

    const [selectedCity, setSelectedCity] = useState<string | number>('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    useEffect(() => {
        if (cities && cities.length > 0 && !selectedCity) {
            setSelectedCity(cities[0].id);
        }
    }, [cities, selectedCity]);

    const {
        data: districtsData,
        isLoading: isLoadingDistricts,
        createDistrict,
        updateDistrict,
        deleteDistrict,
        isMutating
    } = useDistricts({ city: selectedCity, page: page + 1, pageSize: rowsPerPage }) as any;

    const districts = (districtsData?.results || districtsData) as any[];

    const [openDialog, setOpenDialog] = useState(false);
    const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
    const [currentDistrict, setCurrentDistrict] = useState<any>(null);
    const [districtName, setDistrictName] = useState('');
    const [districtCode, setDistrictCode] = useState('');
    const [targetCityId, setTargetCityId] = useState<string | number>('');

    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

    const handleOpenAdd = () => {
        setDialogMode('add');
        setDistrictName('');
        setDistrictCode('');
        setTargetCityId(selectedCity || (cities && cities[0]?.id) || '');
        setCurrentDistrict(null);
        setOpenDialog(true);
    };

    const handleOpenEdit = (district: any) => {
        setDialogMode('edit');
        setCurrentDistrict(district);
        setDistrictName(district.name);
        setDistrictCode(district.code || '');
        setTargetCityId(district.city);
        setOpenDialog(true);
    };

    const handleOpenDelete = (district: any) => {
        setCurrentDistrict(district);
        setOpenDeleteDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
    };

    const handleSave = async () => {
        if (!districtName.trim() || !targetCityId) return;

        try {
            if (dialogMode === 'add') {
                await createDistrict({ name: districtName, code: districtCode || null, city: targetCityId });
            } else {
                await updateDistrict({
                    id: currentDistrict.id,
                    data: { name: districtName, code: districtCode || null, city: targetCityId }
                });
            }
            handleCloseDialog();
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = async () => {
        try {
            await deleteDistrict(currentDistrict.id);
            setOpenDeleteDialog(false);
        } catch (error) {
            console.error(error);
        }
    };

    const columns = useMemo<ColumnDef<any>[]>(() => [
        {
            accessorKey: 'id',
            header: t('pages.districts.table.id') as string,
            size: 80,
        },
        {
            accessorKey: 'name',
            header: t('pages.districts.table.districtName') as string,
            cell: (info) => (
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {info.getValue() as string}
                </Typography>
            ),
        },
        {
            accessorKey: 'code',
            header: t('pages.districts.table.code') as string,
            cell: (info) => info.getValue() as string || '---',
        },
        {
            id: 'actions',
            header: t('pages.districts.table.actions') as string,
            meta: { align: 'right' },
            cell: (info) => (
                <Box>
                    <Tooltip title={t('pages.districts.table.edit')}>
                        <IconButton size="small" color="primary" onClick={() => handleOpenEdit(info.row.original)}>
                            <EditIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title={t('pages.districts.table.delete')}>
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
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary', mb: 1 }}>
                        {t('pages.districts.title')}
                    </Typography>
                    <Breadcrumbs aria-label={t('common.breadcrumb')}>
                        <Link underline="hover" color="inherit" href="/admin">
                            {t('pages.districts.breadcrumbAdmin')}
                        </Link>
                        <Typography color="text.primary">{t('pages.districts.breadcrumbGeneral')}</Typography>
                        <Typography color="text.primary">{t('pages.districts.breadcrumbDistricts')}</Typography>
                    </Breadcrumbs>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleOpenAdd}
                    sx={{ borderRadius: '8px', textTransform: 'none' }}
                >
                    {t('pages.districts.addDistrict')}
                </Button>
            </Box>

            <Paper sx={{ p: 2, mb: 3, borderRadius: '12px' }} elevation={0}>
                <Box sx={{ mb: 3, width: 300 }}>
                    <TextField
                        select
                        fullWidth
                        size="small"
                        label={t('pages.districts.filterCityPlaceholder')}
                        value={selectedCity}
                        onChange={(e) => {
                            setSelectedCity(e.target.value);
                            setPage(0);
                        }}
                        disabled={isLoadingCities}
                    >
                        {cities?.map((city: any) => (
                            <MenuItem key={city.id} value={city.id}>
                                {city.name}
                            </MenuItem>
                        ))}
                    </TextField>
                </Box>

                <DataTable
                    columns={columns}
                    data={districts || []}
                    isLoading={isLoadingDistricts}
                    rowCount={districtsData?.count || 0}
                    pagination={{
                        pageIndex: page,
                        pageSize: rowsPerPage,
                    }}
                    onPaginationChange={(pagination) => {
                        setPage(pagination.pageIndex);
                        setRowsPerPage(pagination.pageSize);
                    }}
                    emptyMessage={!selectedCity ? t('pages.districts.table.noCitySelected') : t('pages.districts.table.noData')}
                />
            </Paper>

            {/* Add/Edit Dialog */}
            <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="xs">
                <DialogTitle>
                    {dialogMode === 'add' ? t('pages.districts.addConfirmTitle') : t('pages.districts.editConfirmTitle')}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                            select
                            label={t('pages.districts.cityLabel')}
                            fullWidth
                            value={targetCityId}
                            onChange={(e) => setTargetCityId(e.target.value)}
                            required
                        >
                            {cities?.map((city: any) => (
                                <MenuItem key={city.id} value={city.id}>
                                    {city.name}
                                </MenuItem>
                            ))}
                        </TextField>
                        <TextField
                            label={t('pages.districts.districtNameLabel')}
                            fullWidth
                            value={districtName}
                            onChange={(e) => setDistrictName(e.target.value)}
                            required
                        />
                        <TextField
                            label={t('pages.districts.districtCodeLabel')}
                            fullWidth
                            value={districtCode}
                            onChange={(e) => setDistrictCode(e.target.value)}
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={handleCloseDialog} color="inherit">{t('pages.districts.cancelBtn')}</Button>
                    <Button
                        onClick={handleSave}
                        variant="contained"
                        disabled={isMutating || !districtName.trim() || !targetCityId}
                    >
                        {isMutating ? t('pages.districts.savingBtn') : t('pages.districts.saveBtn')}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation */}
            <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
                <DialogTitle>{t('pages.districts.deleteTitle')}</DialogTitle>
                <DialogContent>
                    <Typography dangerouslySetInnerHTML={{ __html: String(t('pages.districts.deleteText', { name: currentDistrict?.name })) }} />
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setOpenDeleteDialog(false)} color="inherit">{t('pages.districts.cancelBtn')}</Button>
                    <Button
                        onClick={handleDelete}
                        color="error"
                        variant="contained"
                        disabled={isMutating}
                    >
                        {isMutating ? t('pages.districts.deletingBtn') : t('pages.districts.deleteBtn')}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default DistrictsPage;
