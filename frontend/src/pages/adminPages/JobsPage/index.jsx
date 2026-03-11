import React, { useState } from 'react';

import { Box, Card, CardHeader, CardContent, Typography, TablePagination, Dialog, DialogTitle, DialogContent, DialogActions, Button, Divider, TextField } from "@mui/material";

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

        if (window.confirm('Are you sure you want to delete this job post?')) {

            deleteMutation.mutate(id);

        }

    };

    return (
        <>
            <JobFilters searchTerm={searchTerm} onSearchChange={handleSearchChange} />
            <Card>

                <CardHeader

                    title={`Job Post List (${jobsData?.count || 0} total)`}

                    subheader={jobsData ? `Showing ${page * rowsPerPage + 1} to ${Math.min(page * rowsPerPage + rowsPerPage, jobsData.count)}` : ''}

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

                        labelRowsPerPage="Rows per page:"

                        labelDisplayedRows={({ from, to, count }) => `${from}-${to} of ${count}`}

                    />

                </CardContent>

            </Card>
            {/* Job Detail Dialog */}
            <Dialog open={openDetail} onClose={() => setOpenDetail(false)} maxWidth="md" fullWidth>

                <DialogTitle sx={{ fontWeight: 'bold' }}>Job Post Details</DialogTitle>

                <DialogContent dividers>

                    {selectedJob && (

                        <Box>

                            <Typography variant="h6" color="primary" gutterBottom>

                                {selectedJob.jobName}

                            </Typography>

                            <Typography variant="subtitle1" gutterBottom>

                                Company: {selectedJob.companyDict?.companyName}

                            </Typography>

                            <Divider sx={{ my: 2 }} />

                            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>

                                <Box>

                                    <Typography variant="caption" color="textSecondary">Salary</Typography>

                                    <Typography variant="body2">

                                        {selectedJob.salaryMin?.toLocaleString()} - {selectedJob.salaryMax?.toLocaleString()} VND

                                    </Typography>

                                </Box>

                                <Box>

                                    <Typography variant="caption" color="textSecondary">Quantity</Typography>

                                    <Typography variant="body2">{selectedJob.quantity} people</Typography>

                                </Box>

                                <Box>

                                    <Typography variant="caption" color="textSecondary">Experience</Typography>

                                    <Typography variant="body2">{selectedJob.experience} years</Typography>

                                </Box>

                                <Box>

                                    <Typography variant="caption" color="textSecondary">Academic Level</Typography>

                                    <Typography variant="body2">{selectedJob.academicLevel}</Typography>

                                </Box>

                            </Box>

                            <Divider sx={{ my: 2 }} />

                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>Job Description</Typography>

                            <Box dangerouslySetInnerHTML={{ __html: selectedJob.jobDescription }} sx={{ fontSize: '0.875rem' }} />

                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mt: 2, mb: 1 }}>Job Requirements</Typography>

                            <Box dangerouslySetInnerHTML={{ __html: selectedJob.jobRequirement }} sx={{ fontSize: '0.875rem' }} />

                        </Box>

                    )}

                </DialogContent>

                <DialogActions>

                    <Button onClick={() => setOpenDetail(false)}>Close</Button>

                    {selectedJob?.status === 1 && (

                        <>

                            <Button onClick={() => { rejectMutation.mutate(selectedJob.id); setOpenDetail(false); }} color="error">Reject</Button>

                            <Button onClick={() => { approveMutation.mutate(selectedJob.id); setOpenDetail(false); }} variant="contained" color="success">Approve Post</Button>

                        </>

                    )}

                </DialogActions>

            </Dialog>
            {/* Edit Job Dialog */}
            <Dialog open={openEdit} onClose={() => setOpenEdit(false)} maxWidth="sm" fullWidth>

                <DialogTitle sx={{ fontWeight: 'bold' }}>Edit Job Post</DialogTitle>

                <DialogContent dividers>

                    <TextField

                        fullWidth

                        label="Job Title"

                        value={editJob.jobName}

                        onChange={(e) => setEditJob({ ...editJob, jobName: e.target.value })}

                        sx={{ mb: 2 }}

                    />

                    <TextField

                        fullWidth

                        label="Deadline"

                        type="date"

                        value={editJob.deadline ? dayjs(editJob.deadline).format('YYYY-MM-DD') : ''}

                        onChange={(e) => setEditJob({ ...editJob, deadline: e.target.value })}

                        slotProps={{
                            inputLabel: { shrink: true }
                        }}

                    />

                </DialogContent>

                <DialogActions>

                    <Button onClick={() => setOpenEdit(false)}>Cancel</Button>

                    <Button onClick={handleSaveEdit} variant="contained">Save</Button>

                </DialogActions>

            </Dialog>
        </>
    );

};

export default JobsPage;
