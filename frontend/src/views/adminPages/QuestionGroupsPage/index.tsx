import React, { useState, useMemo } from 'react';
import { Box, Typography, Breadcrumbs, Link, Paper, TextField, InputAdornment, Button, Dialog, DialogTitle, DialogContent, DialogActions, Tooltip, IconButton, Stack, Autocomplete, Chip, CircularProgress } from "@mui/material";
import { useTranslation } from 'react-i18next';
import { ColumnDef } from '@tanstack/react-table';
import DataTable from '../../../components/Common/DataTable';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import { useQuestionGroups } from './hooks/useQuestionGroups';
import { useQuestions } from '../QuestionsPage/hooks/useQuestions';
import { useDataTable } from '../../../hooks';
import { QuestionGroup, Question } from '../../../types/models';

interface QuestionGroupFormData {
    name: string;
    description: string;
    questionIds: number[];
}

const QuestionGroupsPage = () => {
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
        createQuestionGroup,
        updateQuestionGroup,
        deleteQuestionGroup,
        isMutating
    } = useQuestionGroups({
        page: page + 1,
        pageSize,
        kw: searchTerm,
        ordering
    });

    const { data: questionsData, isLoading: isLoadingQuestions } = useQuestions({ pageSize: 500 });
    const allQuestions = questionsData?.results || [];

    const [openDialog, setOpenDialog] = useState(false);
    const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
    const [currentGroup, setCurrentGroup] = useState<QuestionGroup | null>(null);
    const [formData, setFormData] = useState<QuestionGroupFormData>({
        name: '',
        description: '',
        questionIds: []
    });

    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        onPaginationChange({ pageIndex: 0, pageSize: pageSize });
    };

    const handleOpenAdd = () => {
        setDialogMode('add');
        setFormData({ name: '', description: '', questionIds: [] });
        setOpenDialog(true);
    };

    const handleOpenEdit = (group: QuestionGroup) => {
        setDialogMode('edit');
        setCurrentGroup(group);
        setFormData({
            name: group.name || '',
            description: group.description || '',
            questionIds: group.questions?.map(q => q.id) || group.questionIds || []
        });
        setOpenDialog(true);
    };

    const handleOpenDelete = (group: QuestionGroup) => {
        setCurrentGroup(group);
        setOpenDeleteDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setOpenDeleteDialog(false);
    };

    const handleSave = async () => {
        try {
            // Mapping for backend expectation (snake_case)
            const payload = {
                name: formData.name,
                description: formData.description,
                question_ids: formData.questionIds 
            };
            
            if (dialogMode === 'add') {
                await createQuestionGroup(payload);
            } else if (currentGroup) {
                await updateQuestionGroup({
                    id: currentGroup.id,
                    data: payload
                });
            }
            handleCloseDialog();
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = async () => {
        if (!currentGroup) return;
        try {
            await deleteQuestionGroup(currentGroup.id);
            handleCloseDialog();
        } catch (error) {
            console.error(error);
        }
    };

    const columns = useMemo<ColumnDef<QuestionGroup>[]>(() => [
        {
            accessorKey: 'id',
            header: 'ID',
            enableSorting: true,
        },
        {
            accessorKey: 'name',
            header: t('pages.questionGroups.table.name') as string,
            enableSorting: true,
            cell: (info) => (
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {info.getValue() as string}
                </Typography>
            ),
        },
        {
            accessorKey: 'description',
            header: t('pages.questionGroups.table.description') as string,
            cell: (info) => (
                <Typography variant="body2" sx={{ maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {info.getValue() as string || '—'}
                </Typography>
            ),
        },
        {
            id: 'questionsCount',
            header: t('pages.questionGroups.table.questionsCount') as string,
            cell: (info) => info.row.original.questions?.length || 0,
        },
        {
            id: 'actions',
            header: t('pages.questionGroups.table.actions') as string,
            meta: { align: 'right' },
            cell: (info) => (
                <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                    <Tooltip title={t('pages.questionGroups.table.edit')}>
                        <IconButton size="small" onClick={() => handleOpenEdit(info.row.original)} color="primary">
                            <EditIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title={t('pages.questionGroups.table.delete')}>
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
                        {t('pages.questionGroups.title')}
                    </Typography>
                    <Breadcrumbs aria-label="breadcrumb">
                        <Link underline="hover" color="inherit" href="/admin">
                            {t('pages.questionGroups.breadcrumbAdmin')}
                        </Link>
                        <Typography color="text.primary">{t('pages.questionGroups.breadcrumbContent')}</Typography>
                        <Typography color="text.primary">{t('pages.questionGroups.breadcrumbGroups')}</Typography>
                    </Breadcrumbs>
                </Box>
                <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenAdd}>
                    {t('pages.questionGroups.add')}
                </Button>
            </Box>

            <Paper sx={{ p: 2, mb: 3, borderRadius: '12px' }} elevation={0}>
                <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
                    <TextField
                        size="small"
                        placeholder={t('pages.questionGroups.searchPlaceholder')}
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
                    {dialogMode === 'add' ? t('pages.questionGroups.add') : t('pages.questionGroups.edit')}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
                        <TextField
                            label={t('pages.questionGroups.form.name')}
                            fullWidth
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            required
                        />
                        <TextField
                            label={t('pages.questionGroups.form.description')}
                            fullWidth
                            multiline
                            rows={2}
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        />
                        
                        <Autocomplete
                            multiple
                            options={allQuestions}
                            getOptionLabel={(option: Question) => option.text || `Question #${option.id}`}
                            value={allQuestions.filter(q => formData.questionIds?.includes(q.id))}
                            isOptionEqualToValue={(option, value) => option.id === value.id}
                            onChange={(_, newValue) => setFormData(prev => ({ ...prev, questionIds: newValue.map((v: Question) => v.id) }))}
                            loading={isLoadingQuestions}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label={t('pages.questionGroups.form.questions')}
                                    placeholder={t('pages.questionGroups.form.questionsPlaceholder')}
                                    slotProps={{
                                        input: {
                                            ...params.InputProps,
                                            endAdornment: (
                                                <React.Fragment>
                                                    {isLoadingQuestions ? <CircularProgress color="inherit" size={20} /> : null}
                                                    {params.InputProps.endAdornment}
                                                </React.Fragment>
                                            ),
                                        }
                                    }}
                                />
                            )}
                            renderTags={(value, getTagProps) =>
                                value.map((option: Question, index: number) => (
                                    <Chip
                                        variant="outlined"
                                        label={(option.text?.substring(0, 30) || '...') + '...'}
                                        size="small"
                                        {...getTagProps({ index })}
                                        key={option.id}
                                    />
                                ))
                            }
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={handleCloseDialog} color="inherit">{t('pages.questionGroups.cancel')}</Button>
                    <Button
                        onClick={handleSave}
                        variant="contained"
                        disabled={isMutating || !formData.name}
                    >
                        {isMutating ? t('common.saving') : t('common.save')}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation */}
            <Dialog open={openDeleteDialog} onClose={handleCloseDialog}>
                <DialogTitle>{t('pages.questionGroups.deleteTitle')}</DialogTitle>
                <DialogContent>
                    <Typography>
                        {t('pages.questionGroups.deleteConfirm', { name: currentGroup?.name })}
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={handleCloseDialog} color="inherit">{t('pages.questionGroups.cancel')}</Button>
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

export default QuestionGroupsPage;
