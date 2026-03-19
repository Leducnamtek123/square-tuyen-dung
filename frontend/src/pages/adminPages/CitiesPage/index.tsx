import React, { useState } from 'react';
import { Box, Typography, Breadcrumbs, Link, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress, IconButton, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, TextField, TablePagination } from "@mui/material";
import { useTranslation } from 'react-i18next';

import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useCities } from './hooks/useCities';

const CitiesPage = () => {
    const { t } = useTranslation('admin');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const [openDialog, setOpenDialog] = useState(false);
    const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
    const [currentCity, setCurrentCity] = useState<any>(null);
    const [cityName, setCityName] = useState('');
    const [cityCode, setCityCode] = useState('');

    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

    const {
        data,
        isLoading,
        createCity,
        updateCity,
        deleteCity,
        isMutating
    } = useCities({ page: page + 1, pageSize: rowsPerPage }) as any;

    const handleOpenAdd = () => {
        setDialogMode('add');
        setCityName('');
        setCityCode('');
        setCurrentCity(null);
        setOpenDialog(true);
    };

    const handleOpenEdit = (city: any) => {
        setDialogMode('edit');
        setCurrentCity(city);
        setCityName(city.name);
        setCityCode(city.code || '');
        setOpenDialog(true);
    };

    const handleOpenDelete = (city: any) => {
        setCurrentCity(city);
        setOpenDeleteDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
    };

    const handleSave = async () => {
        if (!cityName.trim()) return;

        try {
            if (dialogMode === 'add') {
                await createCity({ name: cityName, code: cityCode || null });
            } else {
                await updateCity({ id: currentCity.id, data: { name: cityName, code: cityCode || null } });
            }
            handleCloseDialog();
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = async () => {
        try {
            await deleteCity(currentCity.id);
            setOpenDeleteDialog(false);
        } catch (error) {
            console.error(error);
        }
    };

    const displayData = data?.results || data || [];

    return (
        <Box>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary', mb: 1 }}>
                        {t('pages.cities.title')}
                    </Typography>
                    <Breadcrumbs aria-label={t('common.breadcrumb')}>
                        <Link underline="hover" color="inherit" href="/admin">
                            {t('pages.cities.breadcrumbAdmin')}
                        </Link>
                        <Typography color="text.primary">{t('pages.cities.breadcrumbGeneral')}</Typography>
                        <Typography color="text.primary">{t('pages.cities.breadcrumbCities')}</Typography>
                    </Breadcrumbs>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleOpenAdd}
                    sx={{ borderRadius: '8px', textTransform: 'none' }}
                >
                    {t('pages.cities.addCity')}
                </Button>
            </Box>

            <Paper sx={{ p: 2, mb: 3, borderRadius: '12px' }} elevation={0}>
                {isLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
                        <CircularProgress size={40} />
                    </Box>
                ) : (
                    <>
                        <TableContainer>
                            <Table sx={{ minWidth: 650 }}>
                                <TableHead sx={{ bgcolor: 'grey.50' }}>
                                    <TableRow>
                                        <TableCell width={80}>{t('pages.cities.table.id')}</TableCell>
                                        <TableCell>{t('pages.cities.table.cityName')}</TableCell>
                                        <TableCell>{t('pages.cities.table.code')}</TableCell>
                                        <TableCell align="right">{t('pages.cities.table.actions')}</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {displayData.map((row: any) => (
                                        <TableRow key={row.id} hover>
                                            <TableCell>{row.id}</TableCell>
                                            <TableCell sx={{ fontWeight: 500 }}>{row.name}</TableCell>
                                            <TableCell>{row.code || '---'}</TableCell>
                                            <TableCell align="right">
                                                <Tooltip title={t('pages.cities.table.edit')}>
                                                    <IconButton size="small" color="primary" onClick={() => handleOpenEdit(row)}>
                                                        <EditIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title={t('pages.cities.table.delete')}>
                                                    <IconButton size="small" color="error" onClick={() => handleOpenDelete(row)}>
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {displayData.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                                                {t('pages.cities.table.noData')}
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <TablePagination
                            rowsPerPageOptions={[5, 10, 25]}
                            component="div"
                            count={data?.count || 0}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            onPageChange={(e, v) => setPage(v)}
                            onRowsPerPageChange={(e) => {
                                setRowsPerPage(parseInt(e.target.value, 10));
                                setPage(0);
                            }}
                            labelRowsPerPage={t('common.pagination.rowsPerPage')}
                            labelDisplayedRows={({ from, to, count }) =>
                                t('common.pagination.displayedRows', { from, to, count })
                            }
                        />
                    </>
                )}
            </Paper>

            {/* Add/Edit Dialog */}
            <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="xs">
                <DialogTitle>
                    {dialogMode === 'add' ? t('pages.cities.addConfirmTitle') : t('pages.cities.editConfirmTitle')}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                            label={t('pages.cities.cityNameLabel')}
                            fullWidth
                            value={cityName}
                            onChange={(e) => setCityName(e.target.value)}
                            required
                        />
                        <TextField
                            label={t('pages.cities.cityCodeLabel')}
                            fullWidth
                            value={cityCode}
                            onChange={(e) => setCityCode(e.target.value)}
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={handleCloseDialog} color="inherit">{t('pages.cities.cancelBtn')}</Button>
                    <Button
                        onClick={handleSave}
                        variant="contained"
                        disabled={isMutating || !cityName.trim()}
                    >
                        {isMutating ? t('pages.cities.savingBtn') : t('pages.cities.saveBtn')}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation */}
            <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
                <DialogTitle>{t('pages.cities.deleteTitle')}</DialogTitle>
                <DialogContent>
                    <Typography dangerouslySetInnerHTML={{ __html: String(t('pages.cities.deleteText', { name: currentCity?.name })) }} />
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setOpenDeleteDialog(false)} color="inherit">{t('pages.cities.cancelBtn')}</Button>
                    <Button
                        onClick={handleDelete}
                        color="error"
                        variant="contained"
                        disabled={isMutating}
                    >
                        {isMutating ? t('pages.cities.deletingBtn') : t('pages.cities.deleteBtn')}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default CitiesPage;
