import React, { useState } from 'react';

import { Box, Card, CardHeader, CardContent, Typography, TablePagination, Dialog, DialogTitle, DialogContent, DialogActions, Button, Divider, TextField } from '@mui/material';

import { useJobs, useApproveJob, useRejectJob, useUpdateJob, useDeleteJob } from './hooks/useJobs';

import JobTable from './components/JobTable';

import JobFilters from './components/JobFilters';

import dayjs from '../../../configs/moment-config';



const JobsPage = () => {

    const [page, setPage] = useState(0);

    const [rowsPerPage, setRowsPerPage] = useState(10);

    const [searchTerm, setSearchTerm] = useState('');

    const [selectedJob, setSelectedJob] = useState(null);

    const [openDetail, setOpenDetail] = useState(false);

    const [openEdit, setOpenEdit] = useState(false);

    const [editJob, setEditJob] = useState({ jobName: '', deadline: '' });



    const { data: jobsData, isLoading } = useJobs({

        page: page + 1,

        pageSize: rowsPerPage,

        search: searchTerm,

    });



    const approveMutation = useApproveJob();

    const rejectMutation = useRejectJob();

    const updateMutation = useUpdateJob();

    const deleteMutation = useDeleteJob();



    const handleChangePage = (event, newPage) => {

        setPage(newPage);

    };



    const handleChangeRowsPerPage = (event) => {

        setRowsPerPage(parseInt(event.target.value, 10));

        setPage(0);

    };



    const handleSearchChange = (value) => {

        setSearchTerm(value);

        setPage(0);

    };



    const handleViewDetail = (job) => {

        setSelectedJob(job);

        setOpenDetail(true);

    };



    const handleEdit = (job) => {

        setSelectedJob(job);

        setEditJob({ jobName: job.jobName, deadline: job.deadline });

        setOpenEdit(true);

    };



    const handleSaveEdit = () => {

        updateMutation.mutate({ id: selectedJob.id, data: editJob }, {

            onSuccess: () => setOpenEdit(false)

        });

    };



    const handleDelete = (id) => {

        if (window.confirm('Bạn có chắc chắn muốn xóa tin đăng này?')) {

            deleteMutation.mutate(id);

        }

    };



    return (
        <>
            <JobFilters searchTerm={searchTerm} onSearchChange={handleSearchChange} />



            <Card>

                <CardHeader

                    title={`Danh sách Tin Tuyển dụng (${jobsData?.count || 0} tổng cộng)`}

                    subheader={jobsData ? `Hiển thị ${page * rowsPerPage + 1} đến ${Math.min(page * rowsPerPage + rowsPerPage, jobsData.count)}` : ''}

                />

                <CardContent>

                    <JobTable

                        jobs={jobsData?.results || []}

                        loading={isLoading}

                        onView={handleViewDetail}

                        onEdit={handleEdit}

                        onApprove={(id) => approveMutation.mutate(id)}

                        onReject={(id) => rejectMutation.mutate(id)}

                        onDelete={handleDelete}

                    />



                    <TablePagination

                        rowsPerPageOptions={[5, 10, 25]}

                        component="div"

                        count={jobsData?.count || 0}

                        rowsPerPage={rowsPerPage}

                        page={page}

                        onPageChange={handleChangePage}

                        onRowsPerPageChange={handleChangeRowsPerPage}

                        labelRowsPerPage="Số dòng mỗi trang:"

                        labelDisplayedRows={({ from, to, count }) => `${from}-${to} trong ${count}`}

                    />

                </CardContent>

            </Card>



            {/* Job Detail Dialog */}

            <Dialog open={openDetail} onClose={() => setOpenDetail(false)} maxWidth="md" fullWidth>

                <DialogTitle sx={{ fontWeight: 'bold' }}>Chi tiết tin tuyển dụng</DialogTitle>

                <DialogContent dividers>

                    {selectedJob && (

                        <Box>

                            <Typography variant="h6" color="primary" gutterBottom>

                                {selectedJob.jobName}

                            </Typography>

                            <Typography variant="subtitle1" gutterBottom>

                                Công ty: {selectedJob.companyDict?.companyName}

                            </Typography>

                            <Divider sx={{ my: 2 }} />

                            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>

                                <Box>

                                    <Typography variant="caption" color="textSecondary">Mức lương</Typography>

                                    <Typography variant="body2">

                                        {selectedJob.salaryMin?.toLocaleString()} - {selectedJob.salaryMax?.toLocaleString()} VNĐ

                                    </Typography>

                                </Box>

                                <Box>

                                    <Typography variant="caption" color="textSecondary">Số lượng</Typography>

                                    <Typography variant="body2">{selectedJob.quantity} người</Typography>

                                </Box>

                                <Box>

                                    <Typography variant="caption" color="textSecondary">Kinh nghiệm</Typography>

                                    <Typography variant="body2">{selectedJob.experience} năm</Typography>

                                </Box>

                                <Box>

                                    <Typography variant="caption" color="textSecondary">Trình độ</Typography>

                                    <Typography variant="body2">{selectedJob.academicLevel}</Typography>

                                </Box>

                            </Box>

                            <Divider sx={{ my: 2 }} />

                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>Mô tả công việc</Typography>

                            <Box dangerouslySetInnerHTML={{ __html: selectedJob.jobDescription }} sx={{ fontSize: '0.875rem' }} />



                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mt: 2, mb: 1 }}>Yêu cầu công việc</Typography>

                            <Box dangerouslySetInnerHTML={{ __html: selectedJob.jobRequirement }} sx={{ fontSize: '0.875rem' }} />

                        </Box>

                    )}

                </DialogContent>

                <DialogActions>

                    <Button onClick={() => setOpenDetail(false)}>Đóng</Button>

                    {selectedJob?.status === 1 && (

                        <>

                            <Button onClick={() => { rejectMutation.mutate(selectedJob.id); setOpenDetail(false); }} color="error">Từ chối</Button>

                            <Button onClick={() => { approveMutation.mutate(selectedJob.id); setOpenDetail(false); }} variant="contained" color="success">Duyệt tin</Button>

                        </>

                    )}

                </DialogActions>

            </Dialog>



            {/* Edit Job Dialog */}

            <Dialog open={openEdit} onClose={() => setOpenEdit(false)} maxWidth="sm" fullWidth>

                <DialogTitle sx={{ fontWeight: 'bold' }}>Chỉnh sửa tin tuyển dụng</DialogTitle>

                <DialogContent dividers>

                    <TextField

                        fullWidth

                        label="Tên công việc"

                        value={editJob.jobName}

                        onChange={(e) => setEditJob({ ...editJob, jobName: e.target.value })}

                        sx={{ mb: 2 }}

                    />

                    <TextField

                        fullWidth

                        label="Hạn cuối"

                        type="date"

                        value={editJob.deadline ? dayjs(editJob.deadline).format('YYYY-MM-DD') : ''}

                        onChange={(e) => setEditJob({ ...editJob, deadline: e.target.value })}

                        InputLabelProps={{ shrink: true }}

                    />

                </DialogContent>

                <DialogActions>

                    <Button onClick={() => setOpenEdit(false)}>Hủy</Button>

                    <Button onClick={handleSaveEdit} variant="contained">Lưu</Button>

                </DialogActions>

            </Dialog>

        </>
    );
};


export default JobsPage;

