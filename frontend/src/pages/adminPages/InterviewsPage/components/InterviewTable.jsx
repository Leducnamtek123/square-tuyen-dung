import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Chip, Tooltip, IconButton, Box, CircularProgress, Stack } from "@mui/material";

import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import dayjs from '../../../../configs/dayjs-config';
import { useTranslation } from 'react-i18next';

const InterviewTable = ({ interviews, loading, onView, onDelete, onUpdateStatus }) => {
    const { t } = useTranslation(['interview', 'admin']);
    
    if (loading && interviews.length === 0) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
                <CircularProgress />
            </Box>
        );
    }

    const getStatusChip = (status) => {
        const lowerStatus = String(status ?? '').toLowerCase();
        switch (lowerStatus) {
            case 'completed':
                return <Chip label={t('common.status.completed', { ns: 'admin' })} color="success" size="small" />;
            case 'pending':
            case 'draft':
                return <Chip label={t('common.status.pending', { ns: 'admin' })} color="warning" size="small" />;
            case 'processing':
            case 'in_progress':
                return <Chip label={t('common.status.inProgress', { ns: 'admin' })} color="info" size="small" />;
            case 'scheduled':
                return <Chip label={t('common.status.scheduled', { ns: 'admin' })} color="primary" size="small" />;
            case 'cancelled':
                return <Chip label={t('common.status.cancelled', { ns: 'admin' })} color="error" size="small" />;
            default:
                return <Chip label={status || t('common.status.unknown', { ns: 'admin' })} size="small" />;
        }
    };

    const getTypeChip = (type) => {
        switch (type?.toUpperCase()) {
            case 'VETTING':
                return <Chip label={t('pages.interviews.type.vetting', { ns: 'admin' })} color="warning" size="small" variant="outlined" />;
            default:
                return <Chip label={t('pages.interviews.type.recruitment', { ns: 'admin' })} color="primary" size="small" variant="outlined" />;
        }
    };

    return (
        <TableContainer>
            <Table>
                <TableHead sx={{ bgcolor: 'grey.100' }}>
                    <TableRow>
                        <TableCell sx={{ fontWeight: 'bold' }}>{t('interviewAdminPage.candidateEmployer', { ns: 'interview' })}</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>{t('interviewAdminPage.jobPost', { ns: 'interview' })}</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>{t('interviewAdminPage.type', { ns: 'interview' })}</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>{t('interviewAdminPage.time', { ns: 'interview' })}</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>{t('interviewAdminPage.status', { ns: 'interview' })}</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }} align="right">{t('interviewAdminPage.actions', { ns: 'interview' })}</TableCell>
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
                                    {t('common.na', { ns: 'admin' })}
                                    </Typography>
                                )}
                            </TableCell>
                            <TableCell>{getTypeChip(i.interview_type || i.interviewType)}</TableCell>
                            <TableCell>{dayjs(i.scheduledAt).format('DD/MM/YYYY HH:mm')}</TableCell>
                            <TableCell>{getStatusChip(i.status)}</TableCell>
                            <TableCell align="right">
                                <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                                    <Tooltip title={t('interviewAdminPage.viewDetails', { ns: 'interview' })}>
                                        <IconButton size="small" onClick={() => onView(i)} color="primary">
                                            <VisibilityOutlinedIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                    {i.status !== 'completed' && i.status !== 'COMPLETED' && (
                                        <Tooltip title={t('interviewAdminPage.markCompleted', { ns: 'interview' })}>
                                            <IconButton size="small" onClick={() => onUpdateStatus(i.id, 'completed')} color="success">
                                                <CheckCircleOutlineIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    )}
                                    {i.status !== 'cancelled' && i.status !== 'CANCELLED' && (
                                        <Tooltip title={t('interviewAdminPage.cancelInterview', { ns: 'interview' })}>
                                            <IconButton size="small" onClick={() => onUpdateStatus(i.id, 'cancelled')} color="warning">
                                                <CancelOutlinedIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    )}
                                    <Tooltip title={t('interviewAdminPage.delete', { ns: 'interview' })}>
                                        <IconButton size="small" onClick={() => onDelete(i.id)} color="error">
                                            <DeleteOutlineIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                </Stack>
                            </TableCell>
                        </TableRow>
                    ))}
                    {interviews.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                                <Typography color="text.secondary">{t('common.table.noData', { ns: 'admin' })}</Typography>
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default InterviewTable;
