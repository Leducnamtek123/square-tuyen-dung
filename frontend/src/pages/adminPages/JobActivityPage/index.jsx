import React, { useState } from 'react';
import {
    Box,
    Typography,
    Breadcrumbs,
    Link,
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
    MenuItem,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useJobActivities } from './hooks/useJobActivities';
import JobActivityTable from './components/JobActivityTable';

const JobActivityPage = () => {
    const [page, setPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');

    const {
        data,
        isLoading,
        updateJobActivity,
        deleteJobActivity,
        isMutating
    } = useJobActivities({
        page,
        kw: searchTerm
    });

    // Dialog state
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [currentActivity, setCurrentActivity] = useState(null);
    const [statusValue, setStatusValue] = useState('');

    // Delete dialog
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setPage(1);
    };

    const handleOpenEdit = (activity) => {
        setCurrentActivity(activity);
        setStatusValue(activity.status || 'PENDING');
        setOpenEditDialog(true);
    };

    const handleOpenDelete = (activity) => {
        setCurrentActivity(activity);
        setOpenDeleteDialog(true);
    };

    const handleCloseDialogs = () => {
        setOpenEditDialog(false);
        setOpenDeleteDialog(false);
    };

    const handleSaveStatus = async () => {
        try {
            await updateJobActivity({
                id: currentActivity.id,
                data: { status: statusValue }
            });
            handleCloseDialogs();
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = async () => {
        try {
            await deleteJobActivity(currentActivity.id);
            handleCloseDialogs();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <Box>
            <Box sx={{ mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary', mb: 1 }}>
                    Nhật ký hoạt động tin tuyển dụng
                </Typography>
                <Breadcrumbs aria-label="breadcrumb">
                    <Link underline="hover" color="inherit" href="/admin">
                        Admin
                    </Link>
                    <Typography color="text.primary">Công việc & Phỏng vấn</Typography>
                    <Typography color="text.primary">Hoạt động tin đăng</Typography>
                </Breadcrumbs>
            </Box>

            <Paper sx={{ p: 2, mb: 3, borderRadius: '12px' }} elevation={0}>
                <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
                    <TextField
                        size="small"
                        placeholder="Tìm kiếm hoạt động..."
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
                        <JobActivityTable
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

            {/* Edit Status Dialog */}
            <Dialog open={openEditDialog} onClose={handleCloseDialogs} fullWidth maxWidth="xs">
                <DialogTitle>Cập nhật trạng thái ứng tuyển</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 1 }}>
                        <TextField
                            select
                            fullWidth
                            label="Trạng thái"
                            value={statusValue}
                            onChange={(e) => setStatusValue(e.target.value)}
                        >
                            <MenuItem value="APPLIED">Đã ứng tuyển</MenuItem>
                            <MenuItem value="PENDING">Chờ xử lý</MenuItem>
                            <MenuItem value="ACCEPTED">Đã chấp nhận</MenuItem>
                            <MenuItem value="REJECTED">Đã từ chối</MenuItem>
                        </TextField>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={handleCloseDialogs} color="inherit">Hủy</Button>
                    <Button
                        onClick={handleSaveStatus}
                        variant="contained"
                        disabled={isMutating}
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
                        Bạn có chắc chắn muốn xóa nhật ký hoạt động này của <strong>{currentActivity?.userDict?.fullName}</strong>?
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
        </Box>
    );
};

export default JobActivityPage;
