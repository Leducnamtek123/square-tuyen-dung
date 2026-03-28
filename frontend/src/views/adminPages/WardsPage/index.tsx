import React, { useEffect, useMemo, useState } from 'react';
import {
    Box,
    Typography,
    Breadcrumbs,
    Link,
    Button,
    Paper,
    IconButton,
    Tooltip,
    MenuItem,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from "@mui/material";
import { useTranslation } from 'react-i18next';
import { ColumnDef } from '@tanstack/react-table';
import DataTable from '../../../components/Common/DataTable';

import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useCities } from '../CitiesPage/hooks/useCities';
import { useDistricts } from '../DistrictsPage/hooks/useDistricts';
import { useWards } from './hooks/useWards';

const WardsPage = () => {
    const { t } = useTranslation('admin');
    const { data: citiesData, isLoading: isLoadingCities } = useCities() as any;
    const cities = (citiesData?.results || citiesData) as any[];

    const [selectedCity, setSelectedCity] = useState<string | number>('');
    const [selectedDistrict, setSelectedDistrict] = useState<string | number>('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    useEffect(() => {
        if (cities && cities.length > 0 && !selectedCity) {
            setSelectedCity(cities[0].id);
        }
    }, [cities, selectedCity]);

    const { data: districtsData, isLoading: isLoadingDistricts } = useDistricts({
        city: selectedCity,
        page: 1,
        pageSize: 1000
    }) as any;
    const districts = (districtsData?.results || districtsData) as any[];

    useEffect(() => {
        if (!districts || districts.length === 0) {
            setSelectedDistrict('');
            return;
        }
        const hasSelectedDistrict = districts.some((value: any) => String(value.id) === String(selectedDistrict));
        if (!hasSelectedDistrict) {
            setSelectedDistrict(districts[0].id);
        }
    }, [districts, selectedDistrict]);

    const {
        data: wardsData,
        isLoading: isLoadingWards,
        createWard,
        updateWard,
        deleteWard,
        isMutating
    } = useWards({ district: selectedDistrict, page: page + 1, pageSize: rowsPerPage }) as any;
    const wards = (wardsData?.results || wardsData) as any[];

    const districtNameById = useMemo(() => {
        const result: Record<string | number, string> = {};
        (districts || []).forEach((district: any) => {
            result[district.id] = district.name;
        });
        return result;
    }, [districts]);

    const columns = useMemo<ColumnDef<any>[]>(() => [
        {
            accessorKey: 'id',
            header: t('pages.wards.table.id') as string,
            size: 80,
        },
        {
            accessorKey: 'name',
            header: t('pages.wards.table.wardName') as string,
            cell: (info) => <Typography sx={{ fontWeight: 500 }}>{info.getValue() as string}</Typography>,
        },
        {
            accessorKey: 'code',
            header: t('pages.wards.table.wardCode') as string,
            cell: (info) => info.getValue() || '---',
        },
        {
            accessorKey: 'district',
            header: t('pages.wards.table.districtName') as string,
            cell: (info) => districtNameById[info.getValue() as string | number] || '---',
        },
        {
            id: 'actions',
            header: t('pages.wards.table.actions') as string,
            meta: { align: 'right' },
            cell: (info) => (
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                    <Tooltip title={t('pages.wards.table.edit')}>
                        <IconButton size="small" color="primary" onClick={() => handleOpenEdit(info.row.original)}>
                            <EditIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title={t('pages.wards.table.delete')}>
                        <IconButton size="small" color="error" onClick={() => handleOpenDelete(info.row.original)}>
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Box>
            ),
        },
    ], [t, districtNameById]);

    const [openDialog, setOpenDialog] = useState(false);
    const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
    const [currentWard, setCurrentWard] = useState<any>(null);
    const [wardName, setWardName] = useState('');
    const [wardCode, setWardCode] = useState('');
    const [targetDistrictId, setTargetDistrictId] = useState<string | number>('');

    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

    const handleOpenAdd = () => {
        setDialogMode('add');
        setWardName('');
        setWardCode('');
        setTargetDistrictId(selectedDistrict || (districts && districts[0]?.id) || '');
        setCurrentWard(null);
        setOpenDialog(true);
    };

    const handleOpenEdit = (ward: any) => {
        setDialogMode('edit');
        setCurrentWard(ward);
        setWardName(ward.name);
        setWardCode(ward.code || '');
        setTargetDistrictId(ward.district);
        setOpenDialog(true);
    };

    const handleOpenDelete = (ward: any) => {
        setCurrentWard(ward);
        setOpenDeleteDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
    };

    const handleSave = async () => {
        if (!wardName.trim() || !targetDistrictId) return;

        try {
            if (dialogMode === 'add') {
                await createWard({ name: wardName, code: wardCode || null, district: targetDistrictId });
            } else {
                await updateWard({
                    id: currentWard.id,
                    data: { name: wardName, code: wardCode || null, district: targetDistrictId }
                });
            }
            handleCloseDialog();
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = async () => {
        try {
            await deleteWard(currentWard.id);
            setOpenDeleteDialog(false);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <Box>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary', mb: 1 }}>
                        {t('pages.wards.title')}
                    </Typography>
                    <Breadcrumbs aria-label={t('common.breadcrumb')}>
                        <Link underline="hover" color="inherit" href="/admin">
                            {t('pages.wards.breadcrumbAdmin')}
                        </Link>
                        <Typography color="text.primary">{t('pages.wards.breadcrumbGeneral')}</Typography>
                        <Typography color="text.primary">{t('pages.wards.breadcrumbWards')}</Typography>
                    </Breadcrumbs>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleOpenAdd}
                    sx={{ borderRadius: '8px', textTransform: 'none' }}
                >
                    {t('pages.wards.addWard')}
                </Button>
            </Box>

            <Paper sx={{ p: 2, mb: 3, borderRadius: '12px' }} elevation={0}>
                <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
                    <TextField
                        select
                        fullWidth
                        size="small"
                        label={t('pages.wards.filterCityPlaceholder')}
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
                    <TextField
                        select
                        fullWidth
                        size="small"
                        label={t('pages.wards.filterDistrictPlaceholder')}
                        value={selectedDistrict}
                        onChange={(e) => {
                            setSelectedDistrict(e.target.value);
                            setPage(0);
                        }}
                        disabled={isLoadingDistricts || !(districts && districts.length > 0)}
                    >
                        {districts?.map((district: any) => (
                            <MenuItem key={district.id} value={district.id}>
                                {district.name}
                            </MenuItem>
                        ))}
                    </TextField>
                </Box>


                <DataTable
                    columns={columns}
                    data={wards || []}
                    isLoading={isLoadingWards}
                    rowCount={wardsData?.count || 0}
                    pagination={{
                        pageIndex: page,
                        pageSize: rowsPerPage,
                    }}
                    onPaginationChange={(pagination) => {
                        setPage(pagination.pageIndex);
                        setRowsPerPage(pagination.pageSize);
                    }}
                    emptyMessage={!selectedDistrict ? t('pages.wards.table.noDistrictSelected') : t('pages.wards.table.noData')}
                />
            </Paper>

            <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="xs">
                <DialogTitle>
                    {dialogMode === 'add' ? t('pages.wards.addConfirmTitle') : t('pages.wards.editConfirmTitle')}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                            select
                            label={t('pages.wards.districtLabel')}
                            fullWidth
                            value={targetDistrictId}
                            onChange={(e) => setTargetDistrictId(e.target.value)}
                            required
                        >
                            {districts?.map((district: any) => (
                                <MenuItem key={district.id} value={district.id}>
                                    {district.name}
                                </MenuItem>
                            ))}
                        </TextField>
                        <TextField
                            label={t('pages.wards.wardNameLabel')}
                            fullWidth
                            value={wardName}
                            onChange={(e) => setWardName(e.target.value)}
                            required
                        />
                        <TextField
                            label={t('pages.wards.wardCodeLabel')}
                            fullWidth
                            value={wardCode}
                            onChange={(e) => setWardCode(e.target.value)}
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={handleCloseDialog} color="inherit">{t('pages.wards.cancelBtn')}</Button>
                    <Button
                        onClick={handleSave}
                        variant="contained"
                        disabled={isMutating || !wardName.trim() || !targetDistrictId}
                    >
                        {isMutating ? t('pages.wards.savingBtn') : t('pages.wards.saveBtn')}
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
                <DialogTitle>{t('pages.wards.deleteTitle')}</DialogTitle>
                <DialogContent>
                    <Typography dangerouslySetInnerHTML={{ __html: String(t('pages.wards.deleteText', { name: currentWard?.name })) }} />
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setOpenDeleteDialog(false)} color="inherit">{t('pages.wards.cancelBtn')}</Button>
                    <Button
                        onClick={handleDelete}
                        color="error"
                        variant="contained"
                        disabled={isMutating}
                    >
                        {isMutating ? t('pages.wards.deletingBtn') : t('pages.wards.deleteBtn')}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default WardsPage;
