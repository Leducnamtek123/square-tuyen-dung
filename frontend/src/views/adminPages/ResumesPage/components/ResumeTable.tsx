import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Tooltip, Chip, Typography } from "@mui/material";

import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import dayjs from '../../../../configs/dayjs-config';
import { useTranslation } from 'react-i18next';

interface ResumeTableProps {
    data: any[];
    onEdit?: (resume: any) => void;
    onDelete?: (resume: any) => void;
}

const ResumeTable = ({ data, onEdit, onDelete }: ResumeTableProps) => {
    const { t } = useTranslation('admin');
    return (
        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
            <Table sx={{ minWidth: 800 }}>
                <TableHead sx={{ bgcolor: 'grey.50' }}>
                    <TableRow>
                        <TableCell>{t('pages.resumes.table.resumeTitle')}</TableCell>
                        <TableCell>{t('pages.resumes.table.candidate')}</TableCell>
                        <TableCell>{t('pages.resumes.table.resumeType')}</TableCell>
                        <TableCell>{t('pages.resumes.table.experience')}</TableCell>
                        <TableCell>{t('pages.resumes.table.lastUpdate')}</TableCell>
                        <TableCell align="center">{t('pages.resumes.table.status')}</TableCell>
                        <TableCell align="right">{t('pages.resumes.table.actions')}</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {data?.map((row) => (
                        <TableRow key={row.id} hover>
                            <TableCell>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                    {row.title}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Slug: {row.slug}
                                </Typography>
                            </TableCell>
                            <TableCell>{row.userDict?.fullName || '---'}</TableCell>
                            <TableCell>
                                <Chip
                                    label={row.type === 'UPLOAD' ? t('pages.resumes.table.uploadedFile') : t('pages.resumes.table.onlineProfile')}
                                    size="small"
                                    variant="outlined"
                                    color={row.type === 'UPLOAD' ? 'primary' : 'secondary'}
                                />
                            </TableCell>
                            <TableCell>{row.experience || '---'}</TableCell>
                            <TableCell>{dayjs(row.updateAt).format('DD/MM/YYYY HH:mm')}</TableCell>
                            <TableCell align="center">
                                <Chip
                                    label={row.isActive ? t('pages.resumes.table.active') : t('pages.resumes.table.inactive')}
                                    size="small"
                                    color={row.isActive ? 'success' : 'default'}
                                />
                            </TableCell>
                            <TableCell align="right">
                                <Tooltip title={t('pages.resumes.table.viewDetails')}>
                                    <IconButton size="small" onClick={() => onEdit?.(row)}>
                                        <VisibilityIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title={t('pages.resumes.table.delete')}>
                                    <IconButton size="small" onClick={() => onDelete?.(row)} color="error">
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            </TableCell>
                        </TableRow>
                    ))}
                    {(!data || data.length === 0) && (
                        <TableRow>
                            <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                                {t('pages.resumes.table.noData')}
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default ResumeTable;
