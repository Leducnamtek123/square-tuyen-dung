import React, { useState } from 'react';
import {
    Box,
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
    Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import { useCompanies } from './hooks/useCompanies';
import CompanyTable from './components/CompanyTable';

const CompaniesPage = () => {
    const [page, setPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');

    const {
        data,
        isLoading,
        createCompany,
        updateCompany,
        deleteCompany,
        isMutating
    } = useCompanies({
        page,
        kw: searchTerm
    });

    // Dialog state
    const [openDialog, setOpenDialog] = useState(false);
    const [dialogMode, setDialogMode] = useState('add');
    const [currentCompany, setCurrentCompany] = useState(null);
    const [formData, setFormData] = useState({
        companyName: '',
        taxCode: '',
        companyEmail: '',
        companyPhone: '',
        employeeSize: 0,
        fieldOperation: '',
        websiteUrl: '',
    });

    // Delete dialog
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setPage(1);
    };

    const handleOpenAdd = () => {
        setDialogMode('add');
        setFormData({
            companyName: '',
            taxCode: '',
            companyEmail: '',
            companyPhone: '',
            employeeSize: 50,
            fieldOperation: '',
            websiteUrl: '',
        });
        setCurrentCompany(null);
        setOpenDialog(true);
    };

    const handleOpenEdit = (company) => {
        setDialogMode('edit');
        setCurrentCompany(company);
        setFormData({
            companyName: company.companyName || '',
            taxCode: company.taxCode || '',
            companyEmail: company.companyEmail || '',
            companyPhone: company.companyPhone || '',
            employeeSize: company.employeeSize || 0,
            fieldOperation: company.fieldOperation || '',
            websiteUrl: company.websiteUrl || '',
        });
        setOpenDialog(true);
    };

    const handleOpenDelete = (company) => {
        setCurrentCompany(company);
        setOpenDeleteDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        try {
            if (dialogMode === 'add') {
                const dataToSave = {
                    ...formData,
                    location: {
                        city: 1,
                        district: 1,
                        address: 'N/A'
                    },
                    since: '2023-01-01'
                };
                await createCompany(dataToSave);
            } else {
                await updateCompany({
                    id: currentCompany.id,
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
            await deleteCompany(currentCompany.id);
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
                    Thêm công ty
                </Button>
            </Box>

            <Paper sx={{ p: 2, mb: 3, borderRadius: '12px' }} elevation={0}>
                <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
                    <TextField
                        size="small"
                        placeholder="Tìm kiếm công ty..."
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
                        <CompanyTable
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
                    {dialogMode === 'add' ? 'Thêm công ty mới' : 'Chỉnh sửa thông tin công ty'}
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ pt: 1 }}>
                        <Grid item xs={12}>
                            <TextField
                                label="Tên công ty"
                                fullWidth
                                name="companyName"
                                value={formData.companyName}
                                onChange={handleInputChange}
                                required
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                label="Mã số thuế"
                                fullWidth
                                name="taxCode"
                                value={formData.taxCode}
                                onChange={handleInputChange}
                                required
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                label="Quy mô nhân sự"
                                fullWidth
                                type="number"
                                name="employeeSize"
                                value={formData.employeeSize}
                                onChange={handleInputChange}
                                required
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                label="Email công ty"
                                fullWidth
                                name="companyEmail"
                                value={formData.companyEmail}
                                onChange={handleInputChange}
                                required
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                label="Số điện thoại"
                                fullWidth
                                name="companyPhone"
                                value={formData.companyPhone}
                                onChange={handleInputChange}
                                required
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Lĩnh vực hoạt động"
                                fullWidth
                                name="fieldOperation"
                                value={formData.fieldOperation}
                                onChange={handleInputChange}
                                required
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Website"
                                fullWidth
                                name="websiteUrl"
                                value={formData.websiteUrl}
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
                        disabled={isMutating || !formData.companyName || !formData.taxCode}
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
                        Bạn có chắc chắn muốn xóa công ty <strong>{currentCompany?.companyName}</strong>?
                        Hành động này không thể hoàn tác và có thể ảnh hưởng đến các tin đăng liên quan.
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

export default CompaniesPage;
