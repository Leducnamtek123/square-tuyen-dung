import React, { useState, useMemo } from 'react';
import { Box, Typography, Breadcrumbs, Link, Paper, TextField, InputAdornment, Button, Dialog, DialogTitle, DialogContent, DialogActions, Tooltip, IconButton, Stack, MenuItem } from "@mui/material";
import { useTranslation } from 'react-i18next';
import { ColumnDef } from '@tanstack/react-table';
import DataTable from '../../../components/Common/DataTable';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import { useQuestions } from './hooks/useQuestions';
import { useDataTable } from '../../../hooks';
import { Question } from '../../../types/models';

const QuestionsPage = () => {
    const { t } = useTranslation('admin');
    
    const {
        page,
        pageSize,
        sorting,
        onSortingChange,
        ordering,
        pagination,
        onPaginationChange
    } = useDataTable({ initialPageSize: 10 });

    const [searchTerm, setSearchTerm] = useState('');

    const {
        data,
        isLoading,
        createQuestion,
        updateQuestion,
        deleteQuestion,
        isMutating
    } = useQuestions({
        page: page + 1,
        pageSize,
        kw: searchTerm,
        ordering
    });

    const [openDialog, setOpenDialog] = useState(false);
    const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
    const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
    const [formData, setFormData] = useState<Partial<Question>>({
        text: '',
        category: '',
        questionType: 'GENERAL'
    });

    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        onPaginationChange({ pageIndex: 0, pageSize: pageSize });
    };

    const handleOpenAdd = () => {
        setDialogMode('add');
        setFormData({ text: '', category: '', questionType: 'GENERAL' });
        setOpenDialog(true);
    };

    const handleOpenEdit = (question: Question) => {
        setDialogMode('edit');
        setCurrentQuestion(question);
        setFormData({
            text: question.text || '',
            category: question.category || '',
            questionType: question.questionType || 'GENERAL'
        });
        setOpenDialog(true);
    };

    const handleOpenDelete = (question: Question) => {
        setCurrentQuestion(question);
        setOpenDeleteDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setOpenDeleteDialog(false);
    };

    const handleSave = async () => {
        try {
            if (dialogMode === 'add') {
                await createQuestion(formData);
            } else if (currentQuestion) {
                await updateQuestion({
                    id: currentQuestion.id,
                    data: formData
                });
            }
            handleCloseDialog();
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = async () => {
        if (!currentQuestion) return;
        try {
            await deleteQuestion(currentQuestion.id);
            handleCloseDialog();
        } catch (error) {
            console.error(error);
        }
    };

    const columns = useMemo<ColumnDef<Question>[]>(() => [
        {
            accessorKey: 'id',
            header: 'ID',
            enableSorting: true,
        },
        {
            accessorKey: 'text',
            header: t('pages.questions.table.text') as string,
            enableSorting: true,
            cell: (info) => (
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {info.getValue() as string}
                </Typography>
            ),
        },
        {
            accessorKey: 'questionType',
            header: t('pages.questions.table.type') as string,
            cell: (info) => info.getValue() as string || '—',
        },
        {
            accessorKey: 'category',
            header: t('pages.questions.table.category') as string,
            cell: (info) => info.getValue() as string || '—',
        },
        {
            id: 'actions',
            header: t('pages.questions.table.actions') as string,
            meta: { align: 'right' },
            cell: (info) => (
                <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                    <Tooltip title={t('pages.questions.table.edit')}>
                        <IconButton size="small" onClick={() => handleOpenEdit(info.row.original)} color="primary">
                            <EditIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title={t('pages.questions.table.delete')}>
                        <IconButton size="small" onClick={() => handleOpenDelete(info.row.original)} color="error">
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Stack>
            ),
        },
    ], [t]);

    return (
        <Box>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary', mb: 1 }}>
                        {t('pages.questions.title')}
                    </Typography>
                    <Breadcrumbs aria-label="breadcrumb">
                        <Link underline="hover" color="inherit" href="/admin">
                            {t('pages.questions.breadcrumbAdmin')}
                        </Link>
                        <Typography color="text.primary">{t('pages.questions.breadcrumbContent')}</Typography>
                        <Typography color="text.primary">{t('pages.questions.breadcrumbQuestions')}</Typography>
                    </Breadcrumbs>
                </Box>
                <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenAdd}>
                    {t('pages.questions.add')}
                </Button>
            </Box>

            <Paper sx={{ p: 2, mb: 3, borderRadius: '12px' }} elevation={0}>
                <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
                    <TextField
                        size="small"
                        placeholder={t('pages.questions.searchPlaceholder')}
                        value={searchTerm}
                        onChange={handleSearch}
                        sx={{ width: 400 }}
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon fontSize="small" color="action" />
                                    </InputAdornment>
                                ),
                            }
                        }}
                    />
                </Box>

                <DataTable
                    columns={columns}
                    data={data?.results || []}
                    isLoading={isLoading}
                    rowCount={data?.count || 0}
                    pagination={pagination}
                    onPaginationChange={onPaginationChange}
                    enableSorting
                    sorting={sorting}
                    onSortingChange={onSortingChange}
                />
            </Paper>

            {/* Add/Edit Dialog */}
            <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="sm">
                <DialogTitle>
                    {dialogMode === 'add' ? t('pages.questions.add') : t('pages.questions.edit')}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
                        <TextField
                            label={t('pages.questions.form.text')}
                            fullWidth
                            multiline
                            rows={3}
                            value={formData.text}
                            onChange={(e) => setFormData(prev => ({ ...prev, text: e.target.value }))}
                            required
                        />
                        <TextField
                            select
                            label={t('pages.questions.form.type')}
                            fullWidth
                            value={formData.questionType}
                            onChange={(e) => setFormData(prev => ({ ...prev, questionType: e.target.value }))}
                        >
                            <MenuItem value="GENERAL">{t('admin:auto.index_general_0db3', `General`)}</MenuItem>
                            <MenuItem value="TECHNICAL">{t('admin:auto.index_technical_ad1e', `Technical`)}</MenuItem>
                            <MenuItem value="BEHAVIORAL">{t('admin:auto.index_behavioral_f828', `Behavioral`)}</MenuItem>
                        </TextField>
                        <TextField
                            label={t('pages.questions.form.category')}
                            fullWidth
                            value={formData.category}
                            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={handleCloseDialog} color="inherit">{t('pages.questions.cancel')}</Button>
                    <Button
                        onClick={handleSave}
                        variant="contained"
                        disabled={isMutating || !formData.text}
                    >
                        {isMutating ? t('common.saving') : t('common.save')}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation */}
            <Dialog open={openDeleteDialog} onClose={handleCloseDialog}>
                <DialogTitle>{t('pages.questions.deleteTitle')}</DialogTitle>
                <DialogContent>
                    <Typography>
                        {t('pages.questions.deleteConfirm', { text: currentQuestion?.text })}
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={handleCloseDialog} color="inherit">{t('pages.questions.cancel')}</Button>
                    <Button
                        onClick={handleDelete}
                        color="error"
                        variant="contained"
                        disabled={isMutating}
                    >
                        {isMutating ? t('common.deleting') : t('common.delete')}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default QuestionsPage;
