import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, IconButton, Tooltip } from "@mui/material";
import { useTranslation } from 'react-i18next';

import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import dayjs from '../../../../configs/dayjs-config';

interface JobNotificationTableProps {
    data: any[];
    onEdit?: (row: any) => void;
    onDelete?: (row: any) => void;
}

const JobNotificationTable = ({ data, onEdit, onDelete }: JobNotificationTableProps) => {
    const { t } = useTranslation('admin');
    return (
        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
            <Table sx={{ minWidth: 800 }}>
                <TableHead sx={{ bgcolor: 'grey.50' }}>
                    <TableRow>
                        <TableCell width={200}>{t('pages.jobNotifications.table.title')}</TableCell>
                        <TableCell>{t('pages.jobNotifications.table.content')}</TableCell>
                        <TableCell width={250}>{t('pages.jobNotifications.table.recipient')}</TableCell>
                        <TableCell width={180}>{t('pages.jobNotifications.table.sentAt')}</TableCell>
                        <TableCell align="right">{t('pages.jobNotifications.table.actions')}</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {data?.map((row) => (
                        <TableRow key={row.id} hover>
                            <TableCell sx={{ fontWeight: 600 }}>{row.title}</TableCell>
                            <TableCell>{row.content}</TableCell>
                            <TableCell>
                                <Typography variant="body2">{row.userDict?.fullName || t('common.system', { ns: 'admin' })}</Typography>
                                <Typography variant="caption" color="text.secondary">{row.userDict?.email}</Typography>
                            </TableCell>
                            <TableCell>{dayjs(row.createAt).format('DD/MM/YYYY HH:mm')}</TableCell>
                            <TableCell align="right">
                                <Tooltip title={t('pages.jobNotifications.table.edit')}>
                                    <IconButton size="small" onClick={() => onEdit?.(row)} color="primary">
                                        <EditIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title={t('pages.jobNotifications.table.delete')}>
                                    <IconButton size="small" onClick={() => onDelete?.(row)} color="error">
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            </TableCell>
                        </TableRow>
                    ))}
                    {(!data || data.length === 0) && (
                        <TableRow>
                            <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                                {t('pages.jobNotifications.table.noData')}
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default JobNotificationTable;
