import React, { useState } from 'react';
import { Box, Card, CardHeader, CardContent, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem } from "@mui/material";
import { useTranslation } from 'react-i18next';
import { useDataTable } from '../../../hooks';

import AddIcon from '@mui/icons-material/Add';
import { useQuestions, useCreateQuestion, useUpdateQuestion, useDeleteQuestion } from './hooks/useQuestions';
import { useCareers } from '../CareersPage/hooks/useCareers';
import QuestionTable from './components/QuestionTable';
import { Question, Career } from '../../../types/models';
import { PaginatedResponse } from '../../../types/api';
import { Theme } from '@mui/material/styles';

type QuestionExt = Question & {
    difficulty?: number;
    career?: string | number;
};

const QuestionsPage = () => {
    const { t } = useTranslation('admin');
    const {
        page,
        pageSize,
        sorting,
        onSortingChange,
        ordering,
        pagination,
        onPaginationChange,
        rowSelection,
        onRowSelectionChange,
    } = useDataTable();
    
    const [openDialog, setOpenDialog] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState<QuestionExt | null>(null);
    const [formData, setFormData] = useState({
        questionText: '',
        difficulty: 1,
        career: '',
    });

    const { data: questionsData, isLoading } = useQuestions({
        page: page + 1,
        pageSize: pageSize,
        ordering,
    });

    const { data: careersData } = useCareers({ pageSize: 100 });
    const careers = (careersData as unknown as PaginatedResponse<Career>)?.results || [];

    const createMutation = useCreateQuestion();
    const updateMutation = useUpdateQuestion();
    const deleteMutation = useDeleteQuestion();

    const handleOpenAdd = () => {
        setEditingQuestion(null);
        setFormData({ questionText: '', difficulty: 1, career: '' });
        setOpenDialog(true);
    };

    const handleOpenEdit = (question: QuestionExt) => {
        setEditingQuestion(question);
        setFormData({
            questionText: String(question.questionText || ''),
            difficulty: Number(question.difficulty || 1),
            career: String(question.career || ''),
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

            <Card sx={{ borderRadius: '12px', boxShadow: (theme: Theme) => (theme as unknown as Record<string, Record<string, number>>).customShadows?.card || 1 }} elevation={0}>
                <CardHeader title={t('pages.questions.listTitle')} sx={{ pb: 0 }} />
                <CardContent>
                    {Object.keys(rowSelection).length > 0 && (
                        <Box sx={{ mb: 2, p: 2, bgcolor: 'primary.light', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Typography variant="subtitle2" color="primary.contrastText">
                                {t('pages.questions.bulkSelect.selectedCount', { count: Object.keys(rowSelection).length })}
                            </Typography>
                            <Button 
                                variant="contained" 
                                color="error" 
                                size="small"
                                onClick={() => {
                                    if (window.confirm(t('pages.questions.bulkSelect.deleteConfirm'))) {
                                        // Handle bulk delete here
                                        console.log('Bulk delete questions:', Object.keys(rowSelection));
                                    }
                                }}
                            >
                                {t('pages.questions.bulkSelect.deleteBtn')}
                            </Button>
                        </Box>
                    )}
                    <QuestionTable
                        questions={questionsData?.results || []}
                        loading={isLoading}
                        rowCount={questionsData?.count || 0}
                        pagination={pagination}
                        onPaginationChange={onPaginationChange}
                        sorting={sorting}
                        onSortingChange={onSortingChange}
                        rowSelection={rowSelection}
                        onRowSelectionChange={onRowSelectionChange}
                        onEdit={handleOpenEdit}
                        onDelete={(id: string | number) => {
                            if (window.confirm(t('pages.questions.deleteConfirm'))) {
                                deleteMutation.mutate(id);
                            }
                        }}
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
                            onChange={(e) => setFormData({ ...formData, difficulty: Number(e.target.value) })}
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
