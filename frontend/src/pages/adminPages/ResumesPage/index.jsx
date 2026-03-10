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
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useResumes } from './hooks/useResumes';
import ResumeTable from './components/ResumeTable';

const ResumesPage = () => {
    const [page, setPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');

    const {
        data,
        isLoading,
        updateResume,
        deleteResume,
        isMutating
    } = useResumes({
        page,
        kw: searchTerm
    });

    // Dialog state
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [currentResume, setCurrentResume] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        salaryMin: 0,
        salaryMax: 0,
        isActive: true,
    });

    // Delete dialog
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setPage(1);
    };

    const handleOpenEdit = (resume) => {
        setCurrentResume(resume);
        setFormData({
            title: resume.title || '',
            salaryMin: resume.salaryMin || 0,
            salaryMax: resume.salaryMax || 0,
            isActive: resume.isActive ?? true,
        });
        setOpenEditDialog(true);
    };

    const handleOpenDelete = (resume) => {
        setCurrentResume(resume);
        setOpenDeleteDialog(true);
    };

    const handleCloseDialogs = () => {
        setOpenEditDialog(false);
        setOpenDeleteDialog(false);
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSaveEdit = async () => {
        try {
            await updateResume({
                id: currentResume.id,
                data: formData
            });
            handleCloseDialogs();
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = async () => {
        try {
            await deleteResume(currentResume.id);
            handleCloseDialogs();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <>
            <Paper sx={{ p: 2, mb: 3, borderRadius: '12px' }} elevation={0}>
                <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
                    <TextField
                        size="small"
                        placeholder="Tìm kiếm CV..."
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
                        <ResumeTable
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

            {/* Edit Dialog */}
            <Dialog open={openEditDialog} onClose={handleCloseDialogs} fullWidth maxWidth="xs">
                <DialogTitle>Chỉnh sửa Resume</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ pt: 1 }}>
                        <Grid item xs={12}>
                            <TextField
                                label="Tiêu đề CV"
                                fullWidth
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                required
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                label="Lương tối thiểu"
                                fullWidth
                                type="number"
                                name="salaryMin"
                                value={formData.salaryMin}
                                onChange={handleInputChange}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                label="Lương tối đa"
                                fullWidth
                                type="number"
                                name="salaryMax"
                                value={formData.salaryMax}
                                onChange={handleInputChange}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={handleCloseDialogs} color="inherit">Hủy</Button>
                    <Button
                        onClick={handleSaveEdit}
                        variant="contained"
                        disabled={isMutating || !formData.title}
                    >
                        {isMutating ? 'Đang lưu...' : 'Lưu lại'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation */}
            <Dialog open={openDeleteDialog} onClose={handleCloseDialogs}>
                <DialogTitle>Xác nhận xóa</DialogTitle>
                <DialogContent>
                    <Typography>
                        Bạn có chắc chắn muốn xóa resume <strong>{currentResume?.title}</strong>?
                        Hành động này không thể hoàn tác.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={handleCloseDialogs} color="inherit">Hủy</Button>
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

export default ResumesPage;
