import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, Typography, IconButton, Tooltip } from "@mui/material";

import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import dayjs from '../../../../configs/dayjs-config';
import { useTranslation } from 'react-i18next';

// Define specific types for the data rows
interface JobActivityRow {
    id: string;
    userDict?: { fullName: string; email?: string };
    jobPostDict?: { jobName: string };
    companyDict?: { companyName: string };
    status: 'APPLIED' | 'ACCEPTED' | 'REJECTED' | string; // More specific status types
    updateAt: string;
}

interface JobActivityTableProps {
    data: JobActivityRow[]; // Use the specific row type
    onEdit?: (row: JobActivityRow) => void; // Type the handler parameter
    onDelete?: (row: JobActivityRow) => void; // Type the handler parameter
}

const JobActivityTable = ({ data, onEdit, onDelete }: JobActivityTableProps) => {
    const { t } = useTranslation('admin');
    return (
        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
            <Table sx={{ minWidth: 800 }}>
                <TableHead sx={{ bgcolor: 'grey.50' }}>
                    <TableRow>
                        <TableCell>{t('pages.jobActivity.table.candidate')}</TableCell>
                        <TableCell>{t('pages.jobActivity.table.jobPost')}</TableCell>
                        <TableCell>{t('pages.jobActivity.table.company')}</TableCell>
                        <TableCell>{t('pages.jobActivity.table.status')}</TableCell>
                        <TableCell>{t('pages.jobActivity.table.updatedAt')}</TableCell>
                        <TableCell align="right">{t('pages.jobActivity.table.actions')}</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {data?.map((row) => (
                        <TableRow key={row.id} hover>
                            <TableCell>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                    {row.userDict?.fullName || '---'}
                                </Typography>
                            </TableCell>
                            <TableCell>{row.jobPostDict?.jobName || '---'}</TableCell>
                            <TableCell>{row.companyDict?.companyName || '---'}</TableCell>
                            <TableCell>
                                <Chip
                                    label={row.status || '---'}
                                    size="small"
                                    color={
                                        row.status === 'APPLIED' ? 'primary' :
                                            row.status === 'ACCEPTED' ? 'success' :
                                                row.status === 'REJECTED' ? 'error' : 'default'
                                    }
                                />
                            </TableCell>
                            <TableCell>{dayjs(row.updateAt).format('DD/MM/YYYY HH:mm')}</TableCell>
                            <TableCell align="right">
                                <Tooltip title={t('pages.jobActivity.table.updateStatus')}>
                                    <IconButton size="small" onClick={() => onEdit?.(row)} color="primary">
                                        <EditIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title={t('pages.jobActivity.table.delete')}>
                                    <IconButton size="small" onClick={() => onDelete?.(row)} color="error">
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            </TableCell>
                        </TableRow>
                    ))}
                    {(!data || data.length === 0) && (
                        <TableRow>
                            <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                                {t('pages.jobActivity.table.noData')}
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default JobActivityTable;
