import React, { useState } from 'react';
import {
    Box,
    Typography,
    Paper,
    TextField,
    InputAdornment,
    Pagination,
    CircularProgress,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Grid,
    MenuItem,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import { useProfiles } from './hooks/useProfiles';
import { useCities } from '../CitiesPage/hooks/useCities';
import { useDistricts } from '../DistrictsPage/hooks/useDistricts';
import ProfileTable from './components/ProfileTable';

const ProfilesPage = () => {
    const [page, setPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');

    const {
        data,
        isLoading,
        createProfile,
        updateProfile,
        deleteProfile,
        isMutating
    } = useProfiles({
        page,
        kw: searchTerm
    });

    const { data: citiesData } = useCities();
    const cities = citiesData?.results || citiesData;

    // Dialog state
    const [openDialog, setOpenDialog] = useState(false);
    const [dialogMode, setDialogMode] = useState('add');
    const [currentProfile, setCurrentProfile] = useState(null);
    const [formData, setFormData] = useState({
        user: { fullName: '' },
        phone: '',
        birthday: '',
        gender: 'M',
        maritalStatus: 'S',
        location: {
            city: '',
            district: '',
            address: ''
        }
    });

    const { data: districtsData } = useDistricts({ city: formData.location.city });
    const districts = districtsData?.results || districtsData;

    // Delete dialog
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setPage(1);
    };

    const handleOpenAdd = () => {
        setDialogMode('add');
        setFormData({
            user: { fullName: '' },
            phone: '',
            birthday: '',
            gender: 'M',
            maritalStatus: 'S',
            location: {
                city: cities?.[0]?.id || '',
                district: '',
                address: ''
            }
        });
        setCurrentProfile(null);
        setOpenDialog(true);
    };

    const handleOpenEdit = (profile) => {
        setDialogMode('edit');
        setCurrentProfile(profile);
        setFormData({
            user: { fullName: profile.userDict?.fullName || '' },
            phone: profile.phone || '',
            birthday: profile.birthday || '',
            gender: profile.gender || 'M',
            maritalStatus: profile.maritalStatus || 'S',
            location: {
                city: profile.location?.city || '',
                district: profile.location?.district || '',
                address: profile.location?.address || ''
            }
        });
        setOpenDialog(true);
    };

    const handleOpenDelete = (profile) => {
        setCurrentProfile(profile);
        setOpenDeleteDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === 'fullName') {
            setFormData(prev => ({ ...prev, user: { ...prev.user, fullName: value } }));
        } else if (name.startsWith('loc_')) {
            const locField = name.replace('loc_', '');
            setFormData(prev => ({
                ...prev,
                location: { ...prev.location, [locField]: value }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSave = async () => {
        try {
            if (dialogMode === 'add') {
                await createProfile(formData);
            } else {
                await updateProfile({
                    id: currentProfile.id,
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
            await deleteProfile(currentProfile.id);
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
                    Thêm ứng viên
                </Button>
            </Box>

            <Paper sx={{ p: 2, mb: 3, borderRadius: '12px' }} elevation={0}>
                <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
                    <TextField
                        size="small"
                        placeholder="Tìm kiếm ứng viên..."
                        value={searchTerm}
                        onChange={handleSearch}
                        sx={{ width: 400 }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon fontSize="small" color="action" />
                                </InputAdornment>
                            ),
                        }}
                    />
                </Box>

                {isLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
                        <CircularProgress size={40} />
                    </Box>
                ) : (
                    <>
                        <ProfileTable
                            data={data?.results || data}
                            onEdit={handleOpenEdit}
                            onDelete={handleOpenDelete}
                        />
                        {data?.count > 0 && (
                            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                                <Pagination
                                    count={Math.ceil(data.count / 10)}
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
                    {dialogMode === 'add' ? 'Thêm hồ sơ ứng viên mới' : 'Chỉnh sửa hồ sơ ứng viên'}
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ pt: 1 }}>
                        <Grid item xs={12}>
                            <TextField
                                label="Họ và tên"
                                fullWidth
                                name="fullName"
                                value={formData.user.fullName}
                                onChange={handleInputChange}
                                required
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                label="Số điện thoại"
                                fullWidth
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                required
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                label="Ngày sinh"
                                fullWidth
                                type="date"
                                name="birthday"
                                value={formData.birthday}
                                onChange={handleInputChange}
                                InputLabelProps={{ shrink: true }}
                                required
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                select
                                label="Giới tính"
                                fullWidth
                                name="gender"
                                value={formData.gender}
                                onChange={handleInputChange}
                            >
                                <MenuItem value="M">Nam</MenuItem>
                                <MenuItem value="F">Nữ</MenuItem>
                                <MenuItem value="O">Khác</MenuItem>
                            </TextField>
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                select
                                label="Tình trạng hôn nhân"
                                fullWidth
                                name="maritalStatus"
                                value={formData.maritalStatus}
                                onChange={handleInputChange}
                            >
                                <MenuItem value="S">Độc thân</MenuItem>
                                <MenuItem value="M">Đã kết hôn</MenuItem>
                            </TextField>
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                select
                                label="Tỉnh thành"
                                fullWidth
                                name="loc_city"
                                value={formData.location.city}
                                onChange={handleInputChange}
                            >
                                {cities?.map(city => (
                                    <MenuItem key={city.id} value={city.id}>{city.name}</MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                select
                                label="Quận huyện"
                                fullWidth
                                name="loc_district"
                                value={formData.location.district}
                                onChange={handleInputChange}
                                disabled={!formData.location.city}
                            >
                                {districts?.map(d => (
                                    <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Địa chỉ cụ thể"
                                fullWidth
                                name="loc_address"
                                value={formData.location.address}
                                onChange={handleInputChange}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={handleCloseDialog} color="inherit">Hủy</Button>
                    <Button
                        onClick={handleSave}
                        variant="contained"
                        disabled={isMutating || !formData.user.fullName || !formData.phone}
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
                        Bạn có chắc chắn muốn xóa hồ sơ của <strong>{currentProfile?.userDict?.fullName}</strong>?
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
        </>
    );
};

export default ProfilesPage;
