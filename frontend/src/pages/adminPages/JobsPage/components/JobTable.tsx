// @ts-nocheck
import React from 'react';

import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Chip, Tooltip, IconButton, Box, CircularProgress } from "@mui/material";

import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import EditIcon from '@mui/icons-material/Edit';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import dayjs from '../../../../configs/dayjs-config';
import { useTranslation } from 'react-i18next';

interface Props {
  [key: string]: any;
}



const JobTable = ({ jobs, loading, onView, onEdit, onApprove, onReject, onDelete }) => {
    const { t } = useTranslation('admin');
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
                return <Chip label={t('pages.jobs.table.status.pending')} color="warning" size="small" />;
            case 2:
                return <Chip label={t('pages.jobs.table.status.rejected')} color="error" size="small" />;
            case 3:
                return <Chip label={t('pages.jobs.table.status.approved')} color="success" size="small" />;
            default:
                return <Chip label={t('pages.jobs.table.status.unknown')} size="small" />;
        }
    };

    return (
        <TableContainer>
            <Table>
                <TableHead sx={{ bgcolor: 'grey.100' }}>
                    <TableRow>
                        <TableCell sx={{ fontWeight: 'bold' }}>{t('pages.jobs.table.jobPostCompany')}</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>{t('pages.jobs.table.postDate')}</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>{t('pages.jobs.table.deadline')}</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>{t('pages.jobs.table.statusCol')}</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }} align="right">{t('pages.jobs.table.actions')}</TableCell>
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
                                <Tooltip title={t('pages.jobs.table.viewDetails')}>
                                    <IconButton size="small" onClick={() => onView(job)} color="primary">
                                        <VisibilityOutlinedIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title={t('pages.jobs.table.edit')}>
                                    <IconButton size="small" onClick={() => onEdit(job)} color="secondary">
                                        <EditIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                                {job.status === 1 && (
                                    <>
                                        <Tooltip title={t('pages.jobs.table.approveAction')}>
                                            <IconButton size="small" onClick={() => onApprove(job.id)} color="success">
                                                <CheckCircleOutlineIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title={t('pages.jobs.table.rejectAction')}>
                                            <IconButton size="small" onClick={() => onReject(job.id)} color="error">
                                                <HighlightOffIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    </>
                                )}
                                <Tooltip title={t('pages.jobs.table.delete')}>
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
