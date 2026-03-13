import React, { useState } from 'react';
import { Box, Typography, Paper, TextField, InputAdornment, Pagination, CircularProgress, Button, Dialog, DialogTitle, DialogContent, DialogActions, MenuItem } from "@mui/material";
import { useTranslation } from 'react-i18next';
import Grid from "@mui/material/Grid2";

import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import { useProfiles } from './hooks/useProfiles';
import { useCities } from '../CitiesPage/hooks/useCities';
import { useDistricts } from '../DistrictsPage/hooks/useDistricts';
import ProfileTable from './components/ProfileTable';

const ProfilesPage = () => {
    const { t } = useTranslation('admin');
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
                        {t('pages.profiles.addCandidate')}
                    </Button>
            </Box>
            <Paper sx={{ p: 2, mb: 3, borderRadius: '12px' }} elevation={0}>
                <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
                        <TextField
                            size="small"
                            placeholder={t('pages.profiles.searchPlaceholder')}
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
                    {dialogMode === 'add' ? t('pages.profiles.addTitle') : t('pages.profiles.editTitle')}
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ pt: 1 }}>
                        <Grid size={12}>
                            <TextField
                                label={t('pages.profiles.fullNameLabel')}
                                fullWidth
                                name="fullName"
                                value={formData.user.fullName}
                                onChange={handleInputChange}
                                required
                            />
                        </Grid>
                        <Grid size={6}>
                            <TextField
                                label={t('pages.profiles.phoneLabel')}
                                fullWidth
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                required
                            />
                        </Grid>
                        <Grid size={6}>
                            <TextField
                                label={t('pages.profiles.dobLabel')}
                                fullWidth
                                type="date"
                                name="birthday"
                                value={formData.birthday}
                                onChange={handleInputChange}
                                required
                                slotProps={{
                                    inputLabel: { shrink: true }
                                }}
                            />
                        </Grid>
                        <Grid size={6}>
                            <TextField
                                select
                                label={t('pages.profiles.genderLabel')}
                                fullWidth
                                name="gender"
                                value={formData.gender}
                                onChange={handleInputChange}
                            >
                                <MenuItem value="M">{t('pages.profiles.genderOptions.male')}</MenuItem>
                                <MenuItem value="F">{t('pages.profiles.genderOptions.female')}</MenuItem>
                                <MenuItem value="O">{t('pages.profiles.genderOptions.other')}</MenuItem>
                            </TextField>
                        </Grid>
                        <Grid size={6}>
                            <TextField
                                select
                                label={t('pages.profiles.maritalStatusLabel')}
                                fullWidth
                                name="maritalStatus"
                                value={formData.maritalStatus}
                                onChange={handleInputChange}
                            >
                                <MenuItem value="S">{t('pages.profiles.maritalOptions.single')}</MenuItem>
                                <MenuItem value="M">{t('pages.profiles.maritalOptions.married')}</MenuItem>
                            </TextField>
                        </Grid>
                        <Grid size={6}>
                            <TextField
                                select
                                label={t('pages.profiles.cityLabel')}
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
                        <Grid size={6}>
                            <TextField
                                select
                                label={t('pages.profiles.districtLabel')}
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
                        <Grid size={12}>
                            <TextField
                                label={t('pages.profiles.addressLabel')}
                                fullWidth
                                name="loc_address"
                                value={formData.location.address}
                                onChange={handleInputChange}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={handleCloseDialog} color="inherit">{t('pages.profiles.cancelBtn')}</Button>
                    <Button
                        onClick={handleSave}
                        variant="contained"
                        disabled={isMutating || !formData.user.fullName || !formData.phone}
                    >
                        {isMutating ? t('pages.profiles.savingBtn') : t('pages.profiles.saveBtn')}
                    </Button>
                </DialogActions>
            </Dialog>
            {/* Delete Confirmation */}
            <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
                <DialogTitle>{t('pages.profiles.deleteTitle')}</DialogTitle>
                <DialogContent>
                    <Typography dangerouslySetInnerHTML={{ __html: t('pages.profiles.deleteText', { name: currentProfile?.userDict?.fullName }) }} />
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setOpenDeleteDialog(false)} color="inherit">{t('pages.profiles.cancelBtn')}</Button>
                    <Button
                        onClick={handleDelete}
                        color="error"
                        variant="contained"
                        disabled={isMutating}
                    >
                        {isMutating ? t('pages.profiles.deletingBtn') : t('pages.profiles.deleteBtn')}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default ProfilesPage;
