import React, { useState } from 'react';
import { Box, Card, CardHeader, CardContent, Typography, Button, TablePagination, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem } from "@mui/material";

import AddIcon from '@mui/icons-material/Add';
import { useQuestions, useCreateQuestion, useUpdateQuestion, useDeleteQuestion } from './hooks/useQuestions';
import { useCareers } from '../CareersPage/hooks/useCareers';
import QuestionTable from './components/QuestionTable';

const QuestionsPage = () => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [openDialog, setOpenDialog] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState(null);
    const [formData, setFormData] = useState({
        questionText: '',
        difficulty: 1,
        career: '',
    });

    const { data: questionsData, isLoading } = useQuestions({
        page: page + 1,
        pageSize: rowsPerPage,
    });

    const { data: careersData } = useCareers({ pageSize: 100 });
    const careers = careersData?.results || [];

    const createMutation = useCreateQuestion();
    const updateMutation = useUpdateQuestion();
    const deleteMutation = useDeleteQuestion();

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleOpenAdd = () => {
        setEditingQuestion(null);
        setFormData({ questionText: '', difficulty: 1, career: '' });
        setOpenDialog(true);
    };

    const handleOpenEdit = (question) => {
        setEditingQuestion(question);
        setFormData({
            questionText: question.questionText,
            difficulty: question.difficulty,
            career: question.career || '',
        });
        setOpenDialog(true);
    };

    const handleSubmit = () => {
        if (editingQuestion) {
            updateMutation.mutate({ id: editingQuestion.id, data: formData }, {
                onSuccess: () => setOpenDialog(false)
            });
        } else {
            createMutation.mutate(formData, {
                onSuccess: () => setOpenDialog(false)
            });
        }
    };

    return (
        <Box>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                    Interview Question Bank
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleOpenAdd}
                    sx={{ borderRadius: '8px', textTransform: 'none' }}
                >
                    Add Question
                </Button>
            </Box>

            <Card sx={{ borderRadius: '12px', boxShadow: (theme) => theme.customShadows.card }} elevation={0}>
                <CardHeader title="Question List" sx={{ pb: 0 }} />
                <CardContent>
                    <QuestionTable
                        questions={questionsData?.results || []}
                        loading={isLoading}
                        onEdit={handleOpenEdit}
                        onDelete={(id) => {
                            if (window.confirm('Are you sure you want to delete this question?')) {
                                deleteMutation.mutate(id);
                            }
                        }}
                    />
                    <TablePagination
                        rowsPerPageOptions={[5, 10, 25]}
                        component="div"
                        count={questionsData?.count || 0}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        labelRowsPerPage="Rows per page:"
                    />
                </CardContent>
            </Card>

            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>{editingQuestion ? 'Edit Question' : 'Add New Question'}</DialogTitle>
                <DialogContent dividers>
                    <TextField
                        fullWidth
                        label="Question Content"
                        multiline
                        rows={4}
                        value={formData.questionText}
                        onChange={(e) => setFormData({ ...formData, questionText: e.target.value })}
                        sx={{ mb: 2 }}
                        required
                    />
                    <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                        <TextField
                            fullWidth
                            select
                            label="Difficulty"
                            value={formData.difficulty}
                            onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                        >
                            <MenuItem value={1}>Easy</MenuItem>
                            <MenuItem value={2}>Medium</MenuItem>
                            <MenuItem value={3}>Hard</MenuItem>
                        </TextField>

                        <TextField
                            fullWidth
                            select
                            label="Field / Career"
                            value={formData.career}
                            onChange={(e) => setFormData({ ...formData, career: e.target.value })}
                        >
                            <MenuItem value=""><em>-- Select Career --</em></MenuItem>
                            {careers.map((c) => (
                                <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                            ))}
                        </TextField>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setOpenDialog(false)} color="inherit">Cancel</Button>
                    <Button
                        onClick={handleSubmit}
                        variant="contained"
                        disabled={createMutation.isPending || updateMutation.isPending || !formData.questionText.trim()}
                    >
                        {createMutation.isPending || updateMutation.isPending ? 'Saving...' : 'Save'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default QuestionsPage;
