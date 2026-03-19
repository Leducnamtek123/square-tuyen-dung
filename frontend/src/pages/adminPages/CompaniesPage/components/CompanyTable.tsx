import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Tooltip, Avatar, Chip, Typography } from "@mui/material";

import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import { useTranslation } from 'react-i18next';

interface CompanyTableProps {
    data: any[];
    onEdit: (company: any) => void;
    onView?: (company: any) => void;
    onDelete: (company: any) => void;
}

const CompanyTable = ({ data, onEdit, onView, onDelete }: CompanyTableProps) => {
    const { t } = useTranslation('admin');
    return (
        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
            <Table sx={{ minWidth: 800 }}>
                <TableHead sx={{ bgcolor: 'grey.50' }}>
                    <TableRow>
                        <TableCell width={100}>{t('pages.companies.table.logo')}</TableCell>
                        <TableCell>{t('pages.companies.table.companyName')}</TableCell>
                        <TableCell>{t('pages.companies.table.scale')}</TableCell>
                        <TableCell>{t('pages.companies.table.field')}</TableCell>
                        <TableCell>{t('pages.companies.table.location')}</TableCell>
                        <TableCell align="center">{t('pages.companies.table.jobPosts')}</TableCell>
                        <TableCell align="center">{t('pages.companies.table.followers')}</TableCell>
                        <TableCell align="right">{t('pages.companies.table.actions')}</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {data?.map((row) => (
                        <TableRow key={row.id} hover>
                            <TableCell>
                                <Avatar
                                    src={row.companyImageUrl}
                                    variant="rounded"
                                    sx={{ width: 48, height: 48, border: '1px solid', borderColor: 'divider' }}
                                />
                            </TableCell>
                            <TableCell>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                    {row.companyName}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Slug: {row.slug}
                                </Typography>
                            </TableCell>
                            <TableCell>{row.employeeSize || '---'}</TableCell>
                            <TableCell>{row.fieldOperation || '---'}</TableCell>
                            <TableCell>{row.locationDict?.city || '---'}</TableCell>
                            <TableCell align="center">
                                <Chip label={row.jobPostNumber || 0} size="small" variant="outlined" />
                            </TableCell>
                            <TableCell align="center">
                                <Chip label={row.followNumber || 0} size="small" />
                            </TableCell>
                            <TableCell align="right">
                                <Tooltip title={t('pages.companies.table.viewDetails')}>
                                    <IconButton size="small" onClick={() => onView?.(row)}>
                                        <VisibilityIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title={t('pages.companies.table.edit')}>
                                    <IconButton size="small" onClick={() => onEdit?.(row)} color="primary">
                                        <EditIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title={t('pages.companies.table.delete')}>
                                    <IconButton size="small" onClick={() => onDelete?.(row)} color="error">
                                        <DeleteIcon fontSize="small" />
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

export default CompanyTable;
