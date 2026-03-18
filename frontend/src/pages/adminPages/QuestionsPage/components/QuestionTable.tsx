// @ts-nocheck
import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Chip, Tooltip, IconButton, Box, CircularProgress } from "@mui/material";

import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { useTranslation } from 'react-i18next';

interface Props {
  [key: string]: any;
}



const QuestionTable = ({ questions, loading, onEdit, onDelete }) => {
    const { t } = useTranslation('admin');
    if (loading && questions.length === 0) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <TableContainer>
            <Table>
                <TableHead sx={{ bgcolor: 'grey.100' }}>
                    <TableRow>
                        <TableCell sx={{ fontWeight: 'bold' }}>{t('pages.questions.table.questionContent')}</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>{t('pages.questions.table.field')}</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>{t('pages.questions.table.difficulty')}</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }} align="right">{t('pages.questions.table.actions')}</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {questions.map((q) => (
                        <TableRow key={q.id} hover>
                            <TableCell>
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                    {q.questionText}
                                </Typography>
                            </TableCell>
                            <TableCell>
                                <Chip label={q.careerDict?.name || t('pages.questions.table.general')} size="small" variant="outlined" />
                            </TableCell>
                            <TableCell>
                                <Chip
                                    label={q.difficulty === 1 ? t('pages.questions.difficulty.easy') : q.difficulty === 2 ? t('pages.questions.difficulty.medium') : t('pages.questions.difficulty.hard')}
                                    size="small"
                                    color={q.difficulty === 1 ? 'success' : q.difficulty === 2 ? 'warning' : 'error'}
                                />
                            </TableCell>
                            <TableCell align="right">
                                <Tooltip title={t('pages.questions.table.edit')}>
                                    <IconButton size="small" onClick={() => onEdit(q)} color="primary">
                                        <EditIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title={t('pages.questions.table.delete')}>
                                    <IconButton size="small" onClick={() => onDelete(q.id)} color="error">
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

export default QuestionTable;
