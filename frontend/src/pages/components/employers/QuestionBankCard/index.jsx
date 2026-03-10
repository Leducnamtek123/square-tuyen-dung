/*
MyJob Recruitment System - Part of MyJob Platform

Author: Bui Khanh Huy
Email: khuy220@gmail.com
Copyright (c) 2023 Bui Khanh Huy

License: MIT License
See the LICENSE file in the project root for full license information.
*/

import React, { useState, useEffect, useMemo } from 'react';
import {
    Box,
    Typography,
    Button,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Chip,
    Stack,
    Divider,
    LinearProgress
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { toast } from 'react-toastify';

import questionService from '../../../../services/questionService';
import { transformQuestion } from '../../../../utils/transformers';
import DataTable from '../../../../components/DataTable';

const QuestionBankCard = ({ title = "Ngân hàng câu hỏi AI" }) => {
    const [questions, setQuestions] = useState([]);
    const [count, setCount] = useState(0);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState({ text: '', category: '' });
    const [isEdit, setIsEdit] = useState(false);

    const fetchQuestions = async () => {
        setLoading(true);
        try {
            const data = await questionService.getQuestions({
                page: page + 1,
                pageSize: rowsPerPage
            });
            const rawQuestions = Array.isArray(data?.results) ? data.results : Array.isArray(data) ? data : [];
            setQuestions(rawQuestions.map(transformQuestion).filter(Boolean));
            setCount(typeof data?.count === 'number' ? data.count : rawQuestions.length);
        } catch (error) {
            console.error('Error fetching questions', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQuestions();
    }, [page, rowsPerPage]);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleOpen = (q = { text: '', category: '' }) => {
        setCurrentQuestion(q);
        setIsEdit(!!q.id);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleSubmit = async () => {
        const payload = {
            text: currentQuestion.text?.trim() || '',
            category: currentQuestion.category?.trim() || ''
        };

        if (!payload.text) {
            toast.error('Vui lòng nhập nội dung câu hỏi');
            return;
        }

        try {
            if (isEdit) {
                await questionService.updateQuestion(currentQuestion.id, payload);
                toast.success('Cập nhật câu hỏi thành công');
            } else {
                await questionService.createQuestion(payload);
                toast.success('Thêm câu hỏi mới thành công');
            }
            fetchQuestions();
            handleClose();
        } catch (error) {
            toast.error('Có lỗi xảy ra');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa câu hỏi này?')) {
            try {
                await questionService.deleteQuestion(id);
                toast.success('Xóa thành công');
                fetchQuestions();
            } catch (error) {
                toast.error('Không thể xóa câu hỏi này');
            }
        }
    };

    const columns = useMemo(() => [
        {
            header: 'Nội dung câu hỏi',
            accessorKey: 'text',
            cell: ({ getValue }) => (
                <Typography variant="body2" sx={{
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                }}>
                    {getValue()}
                </Typography>
            ),
        },
        {
            header: 'Phân loại',
            accessorKey: 'category',
            cell: ({ getValue }) => (
                <Chip
                    label={getValue() || 'Chưa phân loại'}
                    size="small"
                    variant="outlined"
                    color={getValue() ? "primary" : "default"}
                />
            ),
        },
        {
            header: '',
            id: 'actions',
            cell: ({ row }) => (
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                    <IconButton size="small" onClick={() => handleOpen(row.original)} color="primary">
                        <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDelete(row.original.id)} color="error">
                        <DeleteIcon fontSize="small" />
                    </IconButton>
                </Box>
            ),
        },
    ], []);

    return (
        <Box sx={{
            px: { xs: 1, sm: 2 },
            py: { xs: 2, sm: 2 },
            backgroundColor: 'background.paper',
            borderRadius: 2
        }}>
            {/* Header Section */}
            <Stack
                direction={{ xs: 'column', sm: 'row' }}
                alignItems={{ xs: 'flex-start', sm: 'center' }}
                justifyContent="space-between"
                spacing={{ xs: 2, sm: 0 }}
                mb={4}
            >
                <Typography
                    variant="h5"
                    sx={{
                        fontWeight: 600,
                        background: (theme) => theme.palette.primary.gradient || theme.palette.primary.main,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        fontSize: { xs: '1.25rem', sm: '1.5rem' }
                    }}
                >
                    {title}
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpen()}
                    sx={{
                        borderRadius: 2,
                        px: 3,
                        background: (theme) => theme.palette.primary.gradient,
                        boxShadow: (theme) => theme.customShadows?.small || 1,
                        '&:hover': {
                            boxShadow: (theme) => theme.customShadows?.medium || 2
                        }
                    }}
                >
                    Thêm câu hỏi
                </Button>
            </Stack>

            {/* Loading Progress */}
            {loading ? (
                <Box sx={{ width: '100%', mb: 2 }}>
                    <LinearProgress
                        color="primary"
                        sx={{
                            height: { xs: 4, sm: 6 },
                            borderRadius: 3,
                            backgroundColor: 'primary.background'
                        }}
                    />
                </Box>
            ) : (
                <Divider sx={{ mb: 2 }} />
            )}

            {/* Table Section */}
            <Box sx={{
                backgroundColor: 'background.paper',
                borderRadius: 2,
                boxShadow: (theme) => theme.customShadows?.card || 1,
                overflow: 'hidden',
                width: '100%',
                '& .MuiTableContainer-root': {
                    overflowX: 'auto'
                }
            }}>
                <DataTable
                    columns={columns}
                    data={questions}
                    isLoading={loading}
                    count={count}
                    page={page}
                    rowsPerPage={rowsPerPage}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </Box>

            {/* Dialog */}
            <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
                <DialogTitle sx={{ fontWeight: 600 }}>
                    {isEdit ? 'Chỉnh sửa câu hỏi' : 'Thêm câu hỏi mới'}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 1 }}>
                        <TextField
                            autoFocus
                            margin="dense"
                            label="Nội dung câu hỏi"
                            fullWidth
                            multiline
                            rows={4}
                            variant="outlined"
                            value={currentQuestion.text || ''}
                            onChange={(e) => setCurrentQuestion({ ...currentQuestion, text: e.target.value })}
                            sx={{ mb: 3 }}
                        />
                        <TextField
                            margin="dense"
                            label="Phân loại (vd: Kỹ thuật, Kỹ năng mềm...)"
                            fullWidth
                            variant="outlined"
                            value={currentQuestion.category}
                            onChange={(e) => setCurrentQuestion({ ...currentQuestion, category: e.target.value })}
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3, gap: 1 }}>
                    <Button onClick={handleClose} color="inherit">Hủy</Button>
                    <Button
                        onClick={handleSubmit}
                        variant="contained"
                        sx={{ px: 4, borderRadius: 2 }}
                    >
                        Lưu lại
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default QuestionBankCard;
