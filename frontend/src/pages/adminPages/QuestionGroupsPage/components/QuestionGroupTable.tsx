import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Tooltip, IconButton, Box, CircularProgress } from "@mui/material";

import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { useTranslation } from 'react-i18next';

interface QuestionGroupTableProps {
    data: any[];
    loading?: boolean;
    onEdit: (group: any) => void;
    onDelete: (group: any) => void;
}

const QuestionGroupTable = ({ data, loading, onEdit, onDelete }: QuestionGroupTableProps) => {
    const { t } = useTranslation('admin');
    if (loading && (!data || data.length === 0)) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!data || data.length === 0) {
        return (
            <Box sx={{ p: 5, textAlign: 'center' }}>
                <Typography color="text.secondary">{t('pages.questionGroups.table.noData')}</Typography>
            </Box>
        );
    }

    return (
        <TableContainer>
            <Table>
                <TableHead sx={{ bgcolor: 'grey.100' }}>
                    <TableRow>
                        <TableCell sx={{ fontWeight: 'bold' }}>{t('pages.questionGroups.table.groupName')}</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>{t('pages.questionGroups.table.description')}</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>{t('pages.questionGroups.table.questionCount')}</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }} align="right">{t('pages.questionGroups.table.actions')}</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {data.map((item) => (
                        <TableRow key={item.id} hover>
                            <TableCell>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                    {item.name}
                                </Typography>
                            </TableCell>
                            <TableCell>
                                <Typography variant="body2" color="text.secondary">
                                    {item.description || '---'}
                                </Typography>
                            </TableCell>
                            <TableCell>
                                <Typography variant="body2">
                                    {item.questions?.length || 0}
                                </Typography>
                            </TableCell>
                            <TableCell align="right">
                                <Tooltip title={t('pages.questionGroups.table.edit')}>
                                    <IconButton size="small" onClick={() => onEdit(item)} color="primary">
                                        <EditIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title={t('pages.questionGroups.table.delete')}>
                                    <IconButton size="small" onClick={() => onDelete(item)} color="error">
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

export default QuestionGroupTable;
