import React from 'react';

import {
    Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Typography, Chip, Tooltip,
    IconButton, Box, CircularProgress
} from '@mui/material';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import EditIcon from '@mui/icons-material/Edit';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import dayjs from '../../../../configs/dayjs-config';

const JobTable = ({ jobs, loading, onView, onEdit, onApprove, onReject, onDelete }) => {
    if (loading && jobs.length === 0) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
                <CircularProgress />
            </Box>
        );
    }



    const getStatusChip = (status) => {

        switch (status) {

            case 1:

                return <Chip label="Chờ duyệt" color="warning" size="small" />;

            case 2:

                return <Chip label="Từ chối" color="error" size="small" />;

            case 3:

                return <Chip label="Đã duyệt" color="success" size="small" />;

            default:

                return <Chip label="Không xác định" size="small" />;

        }

    };



    return (

        <TableContainer>

            <Table>

                <TableHead sx={{ bgcolor: 'grey.100' }}>

                    <TableRow>

                        <TableCell sx={{ fontWeight: 'bold' }}>Tin tuyển dụng / Công ty</TableCell>

                        <TableCell sx={{ fontWeight: 'bold' }}>Ngày đăng</TableCell>

                        <TableCell sx={{ fontWeight: 'bold' }}>Hạn cuối</TableCell>

                        <TableCell sx={{ fontWeight: 'bold' }}>Trạng thái</TableCell>

                        <TableCell sx={{ fontWeight: 'bold' }} align="right">Thao tác</TableCell>

                    </TableRow>

                </TableHead>

                <TableBody>

                    {jobs.map((job) => (

                        <TableRow key={job.id} hover>

                            <TableCell>

                                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>

                                    {job.jobName}

                                </Typography>

                                <Typography variant="caption" color="textSecondary">

                                    {job.companyDict?.companyName}

                                </Typography>

                            </TableCell>

                            <TableCell>{dayjs(job.createAt).format('DD/MM/YYYY')}</TableCell>

                            <TableCell>{dayjs(job.deadline).format('DD/MM/YYYY')}</TableCell>

                            <TableCell>{getStatusChip(job.status)}</TableCell>

                            <TableCell align="right">

                                <Tooltip title="Xem chi tiết">

                                    <IconButton size="small" onClick={() => onView(job)} color="primary">

                                        <VisibilityOutlinedIcon fontSize="small" />

                                    </IconButton>

                                </Tooltip>

                                <Tooltip title="Chỉnh sửa">

                                    <IconButton size="small" onClick={() => onEdit(job)} color="secondary">

                                        <EditIcon fontSize="small" />

                                    </IconButton>

                                </Tooltip>

                                {job.status === 1 && (

                                    <>

                                        <Tooltip title="Duyệt">

                                            <IconButton size="small" onClick={() => onApprove(job.id)} color="success">

                                                <CheckCircleOutlineIcon fontSize="small" />

                                            </IconButton>

                                        </Tooltip>

                                        <Tooltip title="Từ chối">

                                            <IconButton size="small" onClick={() => onReject(job.id)} color="error">

                                                <HighlightOffIcon fontSize="small" />

                                            </IconButton>

                                        </Tooltip>

                                    </>

                                )}

                                <Tooltip title="Xóa">

                                    <IconButton size="small" onClick={() => onDelete(job.id)} color="error">

                                        <DeleteOutlineIcon fontSize="small" />

                                    </IconButton>

                                </Tooltip>

                            </TableCell>

                        </TableRow>

                    ))}

                </TableBody>

            </Table>

        </TableContainer>

    );

};



export default JobTable;

