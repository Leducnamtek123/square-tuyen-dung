import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Breadcrumbs,
    Link,
    Button,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    CircularProgress,
    IconButton,
    Tooltip,
    MenuItem,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Pagination,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useDistricts } from './hooks/useDistricts';
import { useCities } from '../CitiesPage/hooks/useCities';

const DistrictsPage = () => {
    const { data: citiesData, isLoading: isLoadingCities } = useCities();
    const cities = citiesData?.results || citiesData;

    const [selectedCity, setSelectedCity] = useState('');
    const [page, setPage] = useState(1);

    useEffect(() => {
        if (cities && cities.length > 0 && !selectedCity) {
            setSelectedCity(cities[0].id);
        }
    }, [cities]);

    const {
        data: districtsData,
        isLoading: isLoadingDistricts,
        createDistrict,
        updateDistrict,
        deleteDistrict,
        isMutating
    } = useDistricts({ city: selectedCity, page });

    const districts = districtsData?.results || districtsData;

    // Dialog state
    const [openDialog, setOpenDialog] = useState(false);
    const [dialogMode, setDialogMode] = useState('add');
    const [currentDistrict, setCurrentDistrict] = useState(null);
    const [districtName, setDistrictName] = useState('');
    const [targetCityId, setTargetCityId] = useState('');

    // Delete dialog
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

    const handleOpenAdd = () => {
        setDialogMode('add');
        setDistrictName('');
        setTargetCityId(selectedCity || (cities && cities[0]?.id) || '');
        setCurrentDistrict(null);
        setOpenDialog(true);
    };

    const handleOpenEdit = (district) => {
        setDialogMode('edit');
        setCurrentDistrict(district);
        setDistrictName(district.name);
        setTargetCityId(district.city);
        setOpenDialog(true);
    };

    const handleOpenDelete = (district) => {
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
                await createDistrict({ name: districtName, city: targetCityId });
            } else {
                await updateDistrict({
                    id: currentDistrict.id,
                    data: { name: districtName, city: targetCityId }
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

    return (
        <Box>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary', mb: 1 }}>
                        Quản lý quận huyện
                    </Typography>
                    <Breadcrumbs aria-label="breadcrumb">
                        <Link underline="hover" color="inherit" href="/admin">
                            Admin
                        </Link>
                        <Typography color="text.primary">Cấu hình chung</Typography>
                        <Typography color="text.primary">Quận huyện</Typography>
                    </Breadcrumbs>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleOpenAdd}
                    sx={{ borderRadius: '8px', textTransform: 'none' }}
                >
                    Thêm quận huyện
                </Button>
            </Box>

            <Paper sx={{ p: 2, mb: 3, borderRadius: '12px' }} elevation={0}>
                <Box sx={{ mb: 3, width: 300 }}>
                    <TextField
                        select
                        fullWidth
                        size="small"
                        label="Chọn tỉnh thành để lọc"
                        value={selectedCity}
                        onChange={(e) => {
                            setSelectedCity(e.target.value);
                            setPage(1);
                        }}
                        disabled={isLoadingCities}
                    >
                        {cities?.map((city) => (
                            <MenuItem key={city.id} value={city.id}>
                                {city.name}
                            </MenuItem>
                        ))}
                    </TextField>
                </Box>

                {isLoadingDistricts ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
                        <CircularProgress size={40} />
                    </Box>
                ) : (
                    <>
                        <TableContainer>
                            <Table sx={{ minWidth: 650 }}>
                                <TableHead sx={{ bgcolor: 'grey.50' }}>
                                    <TableRow>
                                        <TableCell width={80}>ID</TableCell>
                                        <TableCell>Tên quận huyện</TableCell>
                                        <TableCell align="right">Thao tác</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {districts?.map((row) => (
                                        <TableRow key={row.id} hover>
                                            <TableCell>{row.id}</TableCell>
                                            <TableCell sx={{ fontWeight: 500 }}>{row.name}</TableCell>
                                            <TableCell align="right">
                                                <Tooltip title="Chỉnh sửa">
                                                    <IconButton size="small" color="primary" onClick={() => handleOpenEdit(row)}>
                                                        <EditIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Xóa">
                                                    <IconButton size="small" color="error" onClick={() => handleOpenDelete(row)}>
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {(!districts || districts.length === 0) && selectedCity && (
                                        <TableRow>
                                            <TableCell colSpan={3} align="center" sx={{ py: 3 }}>
                                                Không tìm thấy dữ liệu cho tỉnh thành này
                                            </TableCell>
                                        </TableRow>
                                    )}
                                    {!selectedCity && (
                                        <TableRow>
                                            <TableCell colSpan={3} align="center" sx={{ py: 3 }}>
                                                Vui lòng chọn tỉnh thành để xem danh sách quận huyện
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        {districtsData?.count > 10 && (
                            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                                <Pagination
                                    count={Math.ceil(districtsData.count / 10)}
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
            <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="xs">
                <DialogTitle>
                    {dialogMode === 'add' ? 'Thêm quận huyện mới' : 'Chỉnh sửa quận huyện'}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                            select
                            label="Tỉnh thành"
                            fullWidth
                            value={targetCityId}
                            onChange={(e) => setTargetCityId(e.target.value)}
                            required
                        >
                            {cities?.map((city) => (
                                <MenuItem key={city.id} value={city.id}>
                                    {city.name}
                                </MenuItem>
                            ))}
                        </TextField>
                        <TextField
                            label="Tên quận huyện"
                            fullWidth
                            value={districtName}
                            onChange={(e) => setDistrictName(e.target.value)}
                            required
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={handleCloseDialog} color="inherit">Hủy</Button>
                    <Button
                        onClick={handleSave}
                        variant="contained"
                        disabled={isMutating || !districtName.trim() || !targetCityId}
                    >
                        {isMutating ? 'Đang lưu...' : 'Lưu lại'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation */}
            <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
                <DialogTitle>Xác nhận xóa</DialogTitle>
                <DialogContent>
                    <Typography>
                        Bạn có chắc chắn muốn xóa quận huyện <strong>{currentDistrict?.name}</strong>?
                        Hành động này không thể hoàn tác.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setOpenDeleteDialog(false)} color="inherit">Hủy</Button>
                    <Button
                        onClick={handleDelete}
                        color="error"
                        variant="contained"
                        disabled={isMutating}
                    >
                        {isMutating ? 'Đang xóa...' : 'Xác nhận xóa'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default DistrictsPage;
