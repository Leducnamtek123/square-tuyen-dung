import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Tooltip, IconButton, Box, CircularProgress, Paper } from "@mui/material";
import { useTranslation } from 'react-i18next';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

interface Question {
    id: string | number;
    [key: string]: any;
}

interface QuestionGroup {
    id: string | number;
    name: string;
    description?: string;
    questions?: Question[];
}

interface QuestionGroupTableProps {
    data: QuestionGroup[];
    loading: boolean;
    onEdit: (item: QuestionGroup) => void;
    onDelete: (item: QuestionGroup) => void;
}

const QuestionGroupTable = ({ data, loading, onEdit, onDelete }: QuestionGroupTableProps) => {
    const { t } = useTranslation('employer');

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
                <Typography color="text.secondary">{t('questionGroupsCard.table.noData')}</Typography>
            </Box>
        );
    }

    return (
        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
            <Table sx={{ minWidth: 750 }}>
                <TableHead sx={{ bgcolor: 'grey.50' }}>
                    <TableRow>
                        <TableCell>{t('questionGroupsCard.label.questiongroupname')}</TableCell>
                        <TableCell>{t('questionGroupsCard.label.description')}</TableCell>
                        <TableCell>{t('questionGroupsCard.label.questionCount')}</TableCell>
                        <TableCell align="right">{t('jobPost.table.actions')}</TableCell>
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
                                <Tooltip title={t('jobPost.tooltips.update')}>
                                    <IconButton size="small" onClick={() => onEdit(item)} color="primary">
                                        <EditIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title={t('jobPost.tooltips.delete')}>
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
