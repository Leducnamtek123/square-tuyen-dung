import React from 'react';
import {
    Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Typography, Chip, Tooltip,
    IconButton, Box, CircularProgress
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

const QuestionTable = ({ questions, loading, onEdit, onDelete }) => {
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
                        <TableCell sx={{ fontWeight: 'bold' }}>Nội dung câu hỏi</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Lĩnh vực</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Mức độ</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }} align="right">Thao tác</TableCell>
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
                                <Chip label={q.careerDict?.name || 'Chung'} size="small" variant="outlined" />
                            </TableCell>
                            <TableCell>
                                <Chip
                                    label={q.difficulty === 1 ? 'Dễ' : q.difficulty === 2 ? 'Trung bình' : 'Khó'}
                                    size="small"
                                    color={q.difficulty === 1 ? 'success' : q.difficulty === 2 ? 'warning' : 'error'}
                                />
                            </TableCell>
                            <TableCell align="right">
                                <Tooltip title="Chỉnh sửa">
                                    <IconButton size="small" onClick={() => onEdit(q)} color="primary">
                                        <EditIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="Xóa">
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
