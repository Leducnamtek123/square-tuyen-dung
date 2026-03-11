import React from 'react';

import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Chip, Tooltip, IconButton, Box, CircularProgress, Stack } from "@mui/material";

import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import dayjs from '../../../../configs/dayjs-config';

const InterviewTable = ({ interviews, loading, onView, onDelete, onUpdateStatus }) => {
    if (loading && interviews.length === 0) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
                <CircularProgress />
            </Box>
        );
    }

    const getStatusChip = (status) => {
        switch (status) {
            case 'COMPLETED':
            case 'completed':
                return <Chip label="Completed" color="success" size="small" />;
            case 'PENDING':
            case 'pending':
            case 'draft':
                return <Chip label="Pending" color="warning" size="small" />;
            case 'PROCESSING':
            case 'in_progress':
                return <Chip label="In Progress" color="info" size="small" />;
            case 'scheduled':
                return <Chip label="Scheduled" color="primary" size="small" />;
            case 'cancelled':
            case 'CANCELLED':
                return <Chip label="Cancelled" color="error" size="small" />;
            default:
                return <Chip label={status} size="small" />;
        }
    };

    const getTypeChip = (type) => {
        switch (type) {
            case 'VETTING':
                return <Chip label="Vetting" color="warning" size="small" variant="outlined" />;
            default:
                return <Chip label="Recruitment" color="primary" size="small" variant="outlined" />;
        }
    };

    return (
        <TableContainer>
            <Table>
                <TableHead sx={{ bgcolor: 'grey.100' }}>
                    <TableRow>
                        <TableCell sx={{ fontWeight: 'bold' }}>Candidate / Employer</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Job Post</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Time</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }} align="right">Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {interviews.map((i) => (
                        <TableRow key={i.id} hover>
                            <TableCell>
                                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                                    {i.candidateName}
                                </Typography>
                                <Typography variant="caption" color="textSecondary">
                                    {i.candidateEmail}
                                </Typography>
                            </TableCell>
                            <TableCell>
                                {i.jobName || (
                                    <Typography variant="caption" color="text.disabled" sx={{ fontStyle: 'italic' }}>
                                        N/A
                                    </Typography>
                                )}
                            </TableCell>
                            <TableCell>{getTypeChip(i.interview_type || i.interviewType)}</TableCell>
                            <TableCell>{dayjs(i.scheduledAt).format('DD/MM/YYYY HH:mm')}</TableCell>
                            <TableCell>{getStatusChip(i.status)}</TableCell>
                            <TableCell align="right">
                                <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                                    <Tooltip title="View details">
                                        <IconButton size="small" onClick={() => onView(i)} color="primary">
                                            <VisibilityOutlinedIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                    {i.status !== 'completed' && i.status !== 'COMPLETED' && (
                                        <Tooltip title="Mark as completed">
                                            <IconButton size="small" onClick={() => onUpdateStatus(i.id, 'completed')} color="success">
                                                <CheckCircleOutlineIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    )}
                                    {i.status !== 'cancelled' && i.status !== 'CANCELLED' && (
                                        <Tooltip title="Cancel interview">
                                            <IconButton size="small" onClick={() => onUpdateStatus(i.id, 'cancelled')} color="warning">
                                                <CancelOutlinedIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    )}
                                    <Tooltip title="Delete">
                                        <IconButton size="small" onClick={() => onDelete(i.id)} color="error">
                                            <DeleteOutlineIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                </Stack>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default InterviewTable;
