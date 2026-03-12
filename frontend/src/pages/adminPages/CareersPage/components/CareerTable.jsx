import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Tooltip, Avatar } from "@mui/material";

import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useTranslation } from 'react-i18next';

const CareerTable = ({ data, onEdit, onDelete }) => {
    const { t } = useTranslation('admin');
    return (
        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
            <Table sx={{ minWidth: 650 }}>
                <TableHead sx={{ bgcolor: 'grey.50' }}>
                    <TableRow>
                        <TableCell width={80}>{t('pages.careers.table.id')}</TableCell>
                        <TableCell width={80}>{t('pages.careers.table.symbol')}</TableCell>
                        <TableCell>{t('pages.careers.table.careerName')}</TableCell>
                        <TableCell>{t('pages.careers.iconLabel')}</TableCell>
                        <TableCell align="center">{t('pages.careers.table.totalPosts')}</TableCell>
                        <TableCell align="right">{t('pages.careers.table.actions')}</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {data?.map((row) => (
                        <TableRow key={row.id} hover>
                            <TableCell>{row.id}</TableCell>
                            <TableCell>
                                <Avatar
                                    src={row.iconUrl}
                                    variant="rounded"
                                    sx={{ width: 32, height: 32, bgcolor: 'primary.light' }}
                                >
                                    {row.name.charAt(0)}
                                </Avatar>
                            </TableCell>
                            <TableCell sx={{ fontWeight: 500 }}>{row.name}</TableCell>
                            <TableCell>{row.appIconName || '---'}</TableCell>
                            <TableCell align="center">{row.jobPostTotal || 0}</TableCell>
                            <TableCell align="right">
                                <Tooltip title={t('pages.careers.table.edit')}>
                                    <IconButton size="small" onClick={() => onEdit?.(row)} color="primary">
                                        <EditIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title={t('pages.careers.table.delete')}>
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
                                {t('pages.careers.table.noData')}
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default CareerTable;
