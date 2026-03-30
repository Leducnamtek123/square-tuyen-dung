import React, { useState, useEffect } from 'react';
import { Box, Typography, Breadcrumbs, Link, Button, Paper, TextField, InputAdornment, Dialog, DialogTitle, DialogContent, DialogActions, FormControl, InputLabel, Select, MenuItem, OutlinedInput, Chip, SelectChangeEvent } from "@mui/material";
import { useTranslation } from 'react-i18next';
import { useDataTable } from '../../../hooks';

import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import { useQuestionGroups } from './hooks/useQuestionGroups';
import QuestionGroupTable from './components/QuestionGroupTable';
import questionService from '../../../services/questionService';
import { transformQuestion, transformQuestionGroup } from '../../../utils/transformers';
import { PaginatedResponse } from '@/types/api';

const QuestionGroupsPage = () => {
    const { t } = useTranslation('admin');
    
    const {
        page,
        pageSize,
        sorting,
        onSortingChange,
        ordering,
        pagination,
        onPaginationChange,
        searchTerm,
        onSearchChange,
    } = useDataTable();

    const [openDialog, setOpenDialog] = useState(false);
    const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
    const [currentGroup, setCurrentGroup] = useState<any>(null);
    const [groupName, setGroupName] = useState('');
    const [groupDescription, setGroupDescription] = useState('');
    const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
    const [allQuestions, setAllQuestions] = useState<any[]>([]);

    const [openCreateQuestion, setOpenCreateQuestion] = useState(false);
    const [newQuestionContent, setNewQuestionContent] = useState('');
    const [isCreatingQuestion, setIsCreatingQuestion] = useState(false);

    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

    const {
        data,
        isLoading,
        createQuestionGroup,
        updateQuestionGroup,
        deleteQuestionGroup,
        isMutating
    } = useQuestionGroups({
        page: page + 1,
        pageSize: pageSize,
        kw: searchTerm,
        ordering,
    }) as any;

    React.useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const res = await questionService.getAllQuestions({ pageSize: 1000 });
                const rawQuestions = res.results || [];
                setAllQuestions(rawQuestions.map(transformQuestion).filter(Boolean));
            } catch (error) {
                console.error("Error fetching questions", error);
            }
        };
        fetchQuestions();
    }, []);

    const handleCreateQuestion = async () => {
        if (!newQuestionContent.trim()) return;
        setIsCreatingQuestion(true);
        try {
            const res = await questionService.createQuestion({
                text: newQuestionContent.trim(),
                category: ''
            });
            const newQ = transformQuestion(res as any);
            if (newQ) {
                setAllQuestions(prev => [newQ, ...prev]);
                setSelectedQuestions(prev => [...prev, newQ.id]);
            }
            setOpenCreateQuestion(false);
            setNewQuestionContent('');
        } catch (error) {
            console.error("Error creating question", error);
        } finally {
            setIsCreatingQuestion(false);
        }
    };

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        onSearchChange(e.target.value);
    };

    const handleOpenAdd = () => {
        setDialogMode('add');
        setGroupName('');
        setGroupDescription('');
        setSelectedQuestions([]);
        setCurrentGroup(null);
        setOpenDialog(true);
    };

    const handleOpenEdit = (group: any) => {
        setDialogMode('edit');
        setCurrentGroup(group);
        setGroupName(group.name);
        setGroupDescription(group.description || '');
        setSelectedQuestions(group.questions?.map((q: any) => q.id) || []);
        setOpenDialog(true);
    };

    const handleOpenDelete = (group: any) => {
        setCurrentGroup(group);
        setOpenDeleteDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
    };

    const handleSave = async () => {
        if (!groupName.trim()) return;

        try {
            if (dialogMode === 'add') {
                await createQuestionGroup({
                    name: groupName,
                    description: groupDescription,
                    question_ids: selectedQuestions
                });
            } else {
                await updateQuestionGroup({
                    id: currentGroup.id,
                    data: {
                        name: groupName,
                        description: groupDescription,
                        question_ids: selectedQuestions
                    }
                });
            }
            handleCloseDialog();
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = async () => {
        try {
            await deleteQuestionGroup(currentGroup.id);
            setOpenDeleteDialog(false);
        } catch (error) {
            console.error(error);
        }
    };

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
                        <Typography color="text.primary">{t('pages.questionGroups.breadcrumbBank')}</Typography>
                        <Typography color="text.primary">{t('pages.questionGroups.breadcrumbGroups')}</Typography>
                    </Breadcrumbs>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleOpenAdd}
                    sx={{ borderRadius: '8px', textTransform: 'none' }}
                >
                    {t('pages.questionGroups.addBtn')}
                </Button>
            </Box>
            <Paper sx={{ p: 2, mb: 3, borderRadius: '12px' }} elevation={0}>
                <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
                    <TextField
                        size="small"
                        placeholder={t('pages.questionGroups.searchPlaceholder')}
                        value={searchTerm}
                        onChange={handleSearch}
                        sx={{ width: 300 }}
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

                <QuestionGroupTable
                    data={(data?.results || []).map(transformQuestionGroup).filter(Boolean)}
                    loading={isLoading}
                    rowCount={data?.count || 0}
                    pagination={pagination}
                    onPaginationChange={onPaginationChange}
                    sorting={sorting}
                    onSortingChange={onSortingChange}
                    onEdit={handleOpenEdit}
                    onDelete={handleOpenDelete}
                />
            </Paper>
            {/* Add/Edit Dialog */}
            <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="xs">
                <DialogTitle>
                    {dialogMode === 'add' ? t('pages.questionGroups.addTitle') : t('pages.questionGroups.editTitle')}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                            label={t('pages.questionGroups.groupNameLabel')}
                            fullWidth
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                            required
                        />
                        <TextField
                            label={t('pages.questionGroups.descriptionLabel')}
                            fullWidth
                            multiline
                            rows={3}
                            value={groupDescription}
                            onChange={(e) => setGroupDescription(e.target.value)}
                        />
                        <FormControl fullWidth>
                            <InputLabel>{t('pages.questionGroups.selectQuestionsLabel')}</InputLabel>
                            <Select
                                multiple
                                value={selectedQuestions}
                                onChange={(e: SelectChangeEvent<string[]>) => setSelectedQuestions(e.target.value as string[])}
                                input={<OutlinedInput label={t('pages.questionGroups.selectQuestionsLabel')} />}
                                renderValue={(selected) => (
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                        {(selected as string[]).map((value) => {
                                            const q = allQuestions.find((item) => item.id === value);
                                            return <Chip key={value} label={q?.text?.substring(0, 30) || 'Question'} />;
                                        })}
                                    </Box>
                                )}
                            >
                                {allQuestions.map((q) => (
                                    <MenuItem key={q.id} value={q.id}>
                                        {q.text}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <Button
                            variant="outlined"
                            startIcon={<AddIcon />}
                            onClick={() => setOpenCreateQuestion(true)}
                            sx={{ alignSelf: 'flex-start' }}
                        >
                            {t('pages.questionGroups.createQuestionBtn')}
                        </Button>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={handleCloseDialog} color="inherit">{t('pages.questionGroups.cancelBtn')}</Button>
                    <Button
                        onClick={handleSave}
                        variant="contained"
                        disabled={isMutating || !groupName.trim()}
                    >
                        {isMutating ? t('pages.questionGroups.savingBtn') : t('pages.questionGroups.saveBtn')}
                    </Button>
                </DialogActions>
            </Dialog>
            {/* Create Question Dialog */}
            <Dialog open={openCreateQuestion} onClose={() => setOpenCreateQuestion(false)} fullWidth maxWidth="xs">
                <DialogTitle>{t('pages.questionGroups.createQuestionTitle')}</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 1 }}>
                        <TextField
                            label={t('pages.questionGroups.questionContentLabel')}
                            fullWidth
                            multiline
                            rows={3}
                            value={newQuestionContent}
                            onChange={(e) => setNewQuestionContent(e.target.value)}
                            required
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setOpenCreateQuestion(false)} color="inherit">{t('pages.questionGroups.cancelBtn')}</Button>
                    <Button
                        onClick={handleCreateQuestion}
                        variant="contained"
                        disabled={isCreatingQuestion || !newQuestionContent.trim()}
                    >
                        {isCreatingQuestion ? t('pages.questionGroups.creatingBtn') : t('pages.questionGroups.createBtn')}
                    </Button>
                </DialogActions>
            </Dialog>
            {/* Delete Confirmation */}
            <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
                <DialogTitle>{t('pages.questionGroups.deleteTitle')}</DialogTitle>
                <DialogContent>
                    <Typography dangerouslySetInnerHTML={{ __html: t('pages.questionGroups.deleteText', { name: currentGroup?.name }) }} />
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setOpenDeleteDialog(false)} color="inherit">{t('pages.questionGroups.cancelBtn')}</Button>
                    <Button
                        onClick={handleDelete}
                        color="error"
                        variant="contained"
                        disabled={isMutating}
                    >
                        {isMutating ? t('pages.questionGroups.deletingBtn') : t('pages.questionGroups.deleteBtn')}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default QuestionGroupsPage;
