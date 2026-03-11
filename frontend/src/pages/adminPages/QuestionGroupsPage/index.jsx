import React, { useState } from 'react';
import { Box, Typography, Breadcrumbs, Link, Button, Paper, TextField, InputAdornment, Pagination, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, FormControl, InputLabel, Select, MenuItem, OutlinedInput, Chip } from "@mui/material";

import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import { useQuestionGroups } from './hooks/useQuestionGroups';
import QuestionGroupTable from './components/QuestionGroupTable';
import adminManagementService from '../../../services/adminManagementService';
import questionService from '../../../services/questionService';
import { transformQuestion, transformQuestionGroup } from '../../../utils/transformers';

const QuestionGroupsPage = () => {
    const [page, setPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');

    // Dialog state
    const [openDialog, setOpenDialog] = useState(false);
    const [dialogMode, setDialogMode] = useState('add'); // 'add' or 'edit'
    const [currentGroup, setCurrentGroup] = useState(null);
    const [groupName, setGroupName] = useState('');
    const [groupDescription, setGroupDescription] = useState('');
    const [selectedQuestions, setSelectedQuestions] = useState([]);
    const [allQuestions, setAllQuestions] = useState([]);

    // Create Question state
    const [openCreateQuestion, setOpenCreateQuestion] = useState(false);
    const [newQuestionContent, setNewQuestionContent] = useState('');
    const [isCreatingQuestion, setIsCreatingQuestion] = useState(false);

    // Delete dialog
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

    const {
        data,
        isLoading,
        createQuestionGroup,
        updateQuestionGroup,
        deleteQuestionGroup,
        isMutating
    } = useQuestionGroups({
        page,
        kw: searchTerm
    });

    React.useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const res = await questionService.getAllQuestions({ pageSize: 1000 });
                const rawQuestions = Array.isArray(res?.results) ? res.results : Array.isArray(res) ? res : [];
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
            const newQ = transformQuestion(res);
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

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setPage(1);
    };

    const handleOpenAdd = () => {
        setDialogMode('add');
        setGroupName('');
        setGroupDescription('');
        setSelectedQuestions([]);
        setCurrentGroup(null);
        setOpenDialog(true);
    };

    const handleOpenEdit = (group) => {
        setDialogMode('edit');
        setCurrentGroup(group);
        setGroupName(group.name);
        setGroupDescription(group.description || '');
        setSelectedQuestions(group.questions?.map(q => q.id) || []);
        setOpenDialog(true);
    };

    const handleOpenDelete = (group) => {
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
                        Question Group Management
                    </Typography>
                    <Breadcrumbs aria-label="breadcrumb">
                        <Link underline="hover" color="inherit" href="/admin">
                            Admin
                        </Link>
                        <Typography color="text.primary">Question Bank</Typography>
                        <Typography color="text.primary">Question Groups</Typography>
                    </Breadcrumbs>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleOpenAdd}
                    sx={{ borderRadius: '8px', textTransform: 'none' }}
                >
                    Add Question Group
                </Button>
            </Box>
            <Paper sx={{ p: 2, mb: 3, borderRadius: '12px' }} elevation={0}>
                <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
                    <TextField
                        size="small"
                        placeholder="Search question groups..."
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

                {isLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
                        <CircularProgress size={40} />
                    </Box>
                ) : (
                    <>
                        <QuestionGroupTable
                            data={(Array.isArray(data?.results) ? data.results : Array.isArray(data) ? data : []).map(transformQuestionGroup).filter(Boolean)}
                            onEdit={handleOpenEdit}
                            onDelete={handleOpenDelete}
                        />
                        {data?.count > 0 && (
                            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                                <Pagination
                                    count={Math.ceil(data.count / 10)}
                                    page={page}
                                    onChange={(e, v) => setPage(v)}
                                    color="primary"
                                />
                            </Box>
                        )}
                    </>
                )}
            </Paper>
            {/* Add/Edit Dialog */}
            <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="xs">
                <DialogTitle>
                    {dialogMode === 'add' ? 'Add New Question Group' : 'Edit Question Group'}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                            label="Question Group Name"
                            fullWidth
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                            required
                        />
                        <TextField
                            label="Description"
                            fullWidth
                            multiline
                            rows={3}
                            value={groupDescription}
                            onChange={(e) => setGroupDescription(e.target.value)}
                        />
                        <FormControl fullWidth>
                            <InputLabel>Select Questions</InputLabel>
                            <Select
                                multiple
                                value={selectedQuestions}
                                onChange={(e) => setSelectedQuestions(e.target.value)}
                                input={<OutlinedInput label="Select Questions" />}
                                renderValue={(selected) => (
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                        {selected.map((value) => {
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
                            Create New Question
                        </Button>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={handleCloseDialog} color="inherit">Cancel</Button>
                    <Button
                        onClick={handleSave}
                        variant="contained"
                        disabled={isMutating || !groupName.trim()}
                    >
                        {isMutating ? 'Saving...' : 'Save'}
                    </Button>
                </DialogActions>
            </Dialog>
            {/* Create Question Dialog */}
            <Dialog open={openCreateQuestion} onClose={() => setOpenCreateQuestion(false)} fullWidth maxWidth="xs">
                <DialogTitle>Create New Question</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 1 }}>
                        <TextField
                            label="Question Content"
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
                    <Button onClick={() => setOpenCreateQuestion(false)} color="inherit">Cancel</Button>
                    <Button
                        onClick={handleCreateQuestion}
                        variant="contained"
                        disabled={isCreatingQuestion || !newQuestionContent.trim()}
                    >
                        {isCreatingQuestion ? 'Creating...' : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>
            {/* Delete Confirmation */}
            <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete question group <strong>{currentGroup?.name}</strong>?
                        The questions inside will not be deleted, but the links to this group will be lost.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setOpenDeleteDialog(false)} color="inherit">Cancel</Button>
                    <Button
                        onClick={handleDelete}
                        color="error"
                        variant="contained"
                        disabled={isMutating}
                    >
                        {isMutating ? 'Deleting...' : 'Confirm Delete'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default QuestionGroupsPage;
