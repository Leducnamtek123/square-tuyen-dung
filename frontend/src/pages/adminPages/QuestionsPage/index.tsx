import React, { useState } from 'react';
import { Box, Card, CardHeader, CardContent, Typography, Button, TablePagination, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem } from "@mui/material";
import { useTranslation } from 'react-i18next';

import AddIcon from '@mui/icons-material/Add';
import { useQuestions, useCreateQuestion, useUpdateQuestion, useDeleteQuestion } from './hooks/useQuestions';
import { useCareers } from '../CareersPage/hooks/useCareers';
import QuestionTable from './components/QuestionTable';

const QuestionsPage = () => {
    const { t } = useTranslation('admin');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [openDialog, setOpenDialog] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState<any>(null);
    const [formData, setFormData] = useState({
        questionText: '',
        difficulty: 1,
        career: '',
    });

    const { data: questionsData, isLoading } = useQuestions({
        page: page + 1,
        pageSize: rowsPerPage,
    }) as any;

    const { data: careersData } = useCareers({ pageSize: 100 }) as any;
    const careers = (careersData?.results || []) as any[];

    const createMutation = useCreateQuestion() as any;
    const updateMutation = useUpdateQuestion() as any;
    const deleteMutation = useDeleteQuestion() as any;

    const handleChangePage = (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleOpenAdd = () => {
        setEditingQuestion(null);
        setFormData({ questionText: '', difficulty: 1, career: '' });
        setOpenDialog(true);
    };

    const handleOpenEdit = (question: any) => {
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
                    {t('pages.questions.title')}
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleOpenAdd}
                    sx={{ borderRadius: '8px', textTransform: 'none' }}
                >
                    {t('pages.questions.addBtn')}
                </Button>
            </Box>

            <Card sx={{ borderRadius: '12px', boxShadow: (theme) => (theme as any).customShadows.card }} elevation={0}>
                <CardHeader title={t('pages.questions.listTitle')} sx={{ pb: 0 }} />
                <CardContent>
                    <QuestionTable
                        questions={questionsData?.results || []}
                        loading={isLoading}
                        onEdit={handleOpenEdit}
                        onDelete={(id: string | number) => {
                            if (window.confirm(t('pages.questions.deleteConfirm'))) {
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
                        labelRowsPerPage={t('common.pagination.rowsPerPage')}
                        labelDisplayedRows={({ from, to, count }) => 
                            t('common.pagination.displayedRows', { from, to, count })
                        }
                    />
                </CardContent>
            </Card>

            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>{editingQuestion ? t('pages.questions.editTitle') : t('pages.questions.addTitle')}</DialogTitle>
                <DialogContent dividers>
                    <TextField
                        fullWidth
                        label={t('pages.questions.questionContentLabel')}
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
                            label={t('pages.questions.difficultyLabel')}
                            value={formData.difficulty}
                            onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as any })}
                        >
                            <MenuItem value={1}>{t('pages.questions.difficulty.easy')}</MenuItem>
                            <MenuItem value={2}>{t('pages.questions.difficulty.medium')}</MenuItem>
                            <MenuItem value={3}>{t('pages.questions.difficulty.hard')}</MenuItem>
                        </TextField>

                        <TextField
                            fullWidth
                            select
                            label={t('pages.questions.fieldCareerLabel')}
                            value={formData.career}
                            onChange={(e) => setFormData({ ...formData, career: e.target.value })}
                        >
                            <MenuItem value=""><em>{t('pages.questions.selectCareer')}</em></MenuItem>
                            {careers.map((c) => (
                                <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                            ))}
                        </TextField>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setOpenDialog(false)} color="inherit">{t('pages.questions.cancelBtn')}</Button>
                    <Button
                        onClick={handleSubmit}
                        variant="contained"
                        disabled={createMutation.isPending || updateMutation.isPending || !formData.questionText.trim()}
                    >
                        {createMutation.isPending || updateMutation.isPending ? t('pages.questions.savingBtn') : t('pages.questions.saveBtn')}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default QuestionsPage;
