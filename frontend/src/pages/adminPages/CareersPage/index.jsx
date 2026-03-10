import React, { useState } from 'react';
import {
    Box,
    Typography,
    Breadcrumbs,
    Link,
    Button,
    Paper,
    TextField,
    InputAdornment,
    Pagination,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import { useCareers } from './hooks/useCareers';
import CareerTable from './components/CareerTable';

const CareersPage = () => {
    const [page, setPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');

    // Dialog state
    const [openDialog, setOpenDialog] = useState(false);
    const [dialogMode, setDialogMode] = useState('add'); // 'add' or 'edit'
    const [currentCareer, setCurrentCareer] = useState(null);
    const [careerName, setCareerName] = useState('');
    const [appIconName, setAppIconName] = useState('');

    // Delete dialog
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

    const {
        data,
        isLoading,
        createCareer,
        updateCareer,
        deleteCareer,
        isMutating
    } = useCareers({
        page,
        kw: searchTerm
    });

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setPage(1);
    };

    const handleOpenAdd = () => {
        setDialogMode('add');
        setCareerName('');
        setAppIconName('');
        setCurrentCareer(null);
        setOpenDialog(true);
    };

    const handleOpenEdit = (career) => {
        setDialogMode('edit');
        setCurrentCareer(career);
        setCareerName(career.name);
        setAppIconName(career.appIconName || '');
        setOpenDialog(true);
    };

    const handleOpenDelete = (career) => {
        setCurrentCareer(career);
        setOpenDeleteDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
    };

    const handleSave = async () => {
        if (!careerName.trim()) return;

        try {
            if (dialogMode === 'add') {
                await createCareer({ name: careerName, app_icon_name: appIconName });
            } else {
                await updateCareer({ id: currentCareer.id, data: { name: careerName, app_icon_name: appIconName } });
            }
            handleCloseDialog();
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = async () => {
        try {
            await deleteCareer(currentCareer.id);
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
                        Quản lý ngành nghề
                    </Typography>
                    <Breadcrumbs aria-label="breadcrumb">
                        <Link underline="hover" color="inherit" href="/admin">
                            Admin
                        </Link>
                        <Typography color="text.primary">Cấu hình chung</Typography>
                        <Typography color="text.primary">Ngành nghề</Typography>
                    </Breadcrumbs>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleOpenAdd}
                    sx={{ borderRadius: '8px', textTransform: 'none' }}
                >
                    Thêm ngành nghề
                </Button>
            </Box>

            <Paper sx={{ p: 2, mb: 3, borderRadius: '12px' }} elevation={0}>
                <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
                    <TextField
                        size="small"
                        placeholder="Tìm kiếm ngành nghề..."
                        value={searchTerm}
                        onChange={handleSearch}
                        sx={{ width: 300 }}
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
                        <CareerTable
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
            <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="xs">
                <DialogTitle>
                    {dialogMode === 'add' ? 'Thêm ngành nghề mới' : 'Chỉnh sửa ngành nghề'}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                            label="Tên ngành nghề"
                            fullWidth
                            value={careerName}
                            onChange={(e) => setCareerName(e.target.value)}
                            required
                        />
                        <TextField
                            label="Icon (App)"
                            fullWidth
                            value={appIconName}
                            onChange={(e) => setAppIconName(e.target.value)}
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={handleCloseDialog} color="inherit">Hủy</Button>
                    <Button
                        onClick={handleSave}
                        variant="contained"
                        disabled={isMutating || !careerName.trim()}
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
                        Bạn có chắc chắn muốn xóa ngành nghề <strong>{currentCareer?.name}</strong>?
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

export default CareersPage;
