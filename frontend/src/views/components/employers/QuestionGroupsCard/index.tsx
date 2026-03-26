import React, { useState, useMemo, useEffect } from 'react';

import { useTranslation } from 'react-i18next';

import { Box, Typography, Breadcrumbs, Link, Button, Paper, TextField, InputAdornment, Dialog, DialogTitle, DialogContent, DialogActions, FormControl, InputLabel, Select, MenuItem, OutlinedInput, Chip, IconButton, Stack, Divider, LinearProgress, SelectChangeEvent } from "@mui/material";

import SearchIcon from '@mui/icons-material/Search';

import AddIcon from '@mui/icons-material/Add';

import EditIcon from '@mui/icons-material/Edit';

import DeleteIcon from '@mui/icons-material/Delete';

import { useQuestionGroups } from '../../../employerPages/InterviewPages/hooks/useQuestionGroups';

import DataTable from '../../../../components/Common/DataTable';

import questionService from '../../../../services/questionService';

import { transformQuestion, transformQuestionGroup } from '../../../../utils/transformers';

interface QuestionGroupsCardProps {
  title?: string;
}

const QuestionGroupsCard: React.FC<QuestionGroupsCardProps> = ({ title = "Question Groups Management" }) => {

  const { t } = useTranslation('employer');

    const [page, setPage] = useState(0);

    const [rowsPerPage, setRowsPerPage] = useState(10);

    const [searchTerm, setSearchTerm] = useState('');

    const [openDialog, setOpenDialog] = useState(false);

    const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add'); // 'add' or 'edit'

    const [currentGroup, setCurrentGroup] = useState<any>(null);

    const [groupName, setGroupName] = useState('');

    const [groupDescription, setGroupDescription] = useState('');

    const [selectedQuestions, setSelectedQuestions] = useState<any[]>([]);

    const [allQuestions, setAllQuestions] = useState<any[]>([]);

    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

    const [openCreateQuestion, setOpenCreateQuestion] = useState(false);

    const [newQuestionContent, setNewQuestionContent] = useState('');

    const [isCreatingQuestion, setIsCreatingQuestion] = useState(false);

    const {

        data,

        isLoading,

        createQuestionGroup,

        updateQuestionGroup,

        deleteQuestionGroup,

        isMutating

    } = useQuestionGroups({

        page: page + 1,

        pageSize: rowsPerPage,

        search: searchTerm

    });

    const handleChangePage = (event: any, newPage: number) => {

        setPage(newPage);

    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {

        setRowsPerPage(parseInt(event.target.value, 10));

        setPage(0);

    };

    useEffect(() => {

        const fetchQuestions = async () => {

            try {

                const res = await questionService.getQuestions({ pageSize: 1000 }) as any;

                const rawQuestions = Array.isArray(res?.results) ? res.results : Array.isArray(res) ? res : [];

                setAllQuestions(rawQuestions.map(transformQuestion).filter(Boolean));

            } catch (error: any) {

                console.error("Error fetching questions", error);

            }

        };

        fetchQuestions();

    }, []);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {

        setSearchTerm(e.target.value);

        setPage(0);

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

        const payload = {

            name: groupName.trim(),

            description: groupDescription.trim(),

            question_ids: selectedQuestions

        };

        try {

            if (dialogMode === 'add') {

                await createQuestionGroup(payload);

            } else {

                await updateQuestionGroup({

                    id: currentGroup.id,

                    data: payload

                });

            }

            handleCloseDialog();

        } catch (error: any) {

            console.error(error);

        }

    };

    const handleCreateQuestion = async () => {

        if (!newQuestionContent.trim()) return;

        setIsCreatingQuestion(true);

        try {

            const res = await questionService.createQuestion({

                text: newQuestionContent.trim()

            }) as any;

            const newQ = transformQuestion(res);

            if (newQ) {

                setAllQuestions(prev => [newQ, ...prev]);

                setSelectedQuestions(prev => [...prev, newQ.id]);

            }

            setOpenCreateQuestion(false);

            setNewQuestionContent('');

        } catch (error: any) {

            console.error("Error creating question", error);

        } finally {

            setIsCreatingQuestion(false);

        }

    };

    const handleDelete = async () => {

        try {

            await deleteQuestionGroup(currentGroup.id);

            setOpenDeleteDialog(false);

        } catch (error: any) {

            console.error(error);

        }

    };

    const columns = useMemo(() => [

        {

            header: t('questionGroupsCard.table.groupName'),

            accessorKey: 'name',

            cell: ({ getValue }: any) => getValue(),

        },

        {

            header: t('questionGroupsCard.table.numberOfQuestions'),

            accessorKey: 'questions',

            cell: ({ getValue }: any) => getValue()?.length || 0,

        },

        {

            header: t('questionGroupsCard.table.description'),

            accessorKey: 'description',

            cell: ({ getValue }: any) => getValue() || t('questionGroupsCard.table.na'),

        },

        {

            header: '',

            id: 'actions',

            cell: ({ row }: any) => (

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>

                    <IconButton size="small" onClick={() => handleOpenEdit(row.original)} color="primary">

                        <EditIcon fontSize="small" />

                    </IconButton>

                    <IconButton size="small" onClick={() => handleOpenDelete(row.original)} color="error">

                        <DeleteIcon fontSize="small" />

                    </IconButton>

                </Box>

            ),

        },

    ], []);

    const transformedData = useMemo(() => {

        const rawGroups = Array.isArray((data as any)?.results) ? (data as any).results : Array.isArray(data) ? data : [];

        return rawGroups.map(transformQuestionGroup).filter(Boolean);

    }, [data]);

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

                <Box>

                    <Typography

                        variant="h5"

                        sx={{

                            fontWeight: 600,

                            background: (theme) => theme.palette.primary.main || theme.palette.primary.main,

                            WebkitBackgroundClip: 'text',

                            WebkitTextFillColor: 'transparent',

                            fontSize: { xs: '1.25rem', sm: '1.5rem' },

                            mb: 0.5

                        }}

                    >

                        {title}

                    </Typography>

                    <Breadcrumbs aria-label={t('questionGroupsCard.label.breadcrumb', 'breadcrumb')}>

                        <Link underline="hover" color="inherit" href="/employer/dashboard" sx={{ fontSize: '0.875rem' }}>

                            Employer

                        </Link>

                        <Typography color="text.secondary" sx={{ fontSize: '0.875rem' }}>{t("questionGroupsCard.onlineInterview")}</Typography>

                        <Typography color="text.primary" sx={{ fontSize: '0.875rem' }}>{t("questionGroupsCard.questionGroups")}</Typography>

                    </Breadcrumbs>

                </Box>

                <Button

                    variant="contained"

                    color="primary"

                    startIcon={<AddIcon />}

                    onClick={handleOpenAdd}

                    sx={{

                        borderRadius: 2,

                        px: 3,

                        background: (theme: any) => theme.palette.primary.main,

                        boxShadow: (theme: any) => theme.customShadows?.small || 1,

                        '&:hover': {

                            boxShadow: (theme: any) => theme.customShadows?.medium || 2

                        }

                    }}

                >

                    Add Question Group

                </Button>

            </Stack>

            {/* Filter Section */}

            <Box sx={{ mb: 3 }}>

                <TextField

                    size="small"

                    placeholder={t('questionGroupsCard.placeholder.searchquestiongroups', 'Search question groups...')}

                    value={searchTerm}

                    onChange={handleSearch}

                    sx={{

                        width: { xs: '100%', sm: 300 },

                        '& .MuiOutlinedInput-root': {

                            borderRadius: 2

                        }

                    }}

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

            {/* Loading Progress */}

            {isLoading ? (

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

                boxShadow: (theme: any) => theme.customShadows?.card || 1,

                overflow: 'hidden',

                width: '100%',

                '& .MuiTableContainer-root': {

                    overflowX: 'auto'

                }

            }}>

                <DataTable

                    columns={columns}

                    data={transformedData}

                    isLoading={isLoading}

                    count={typeof (data as any)?.count === 'number' ? (data as any).count : transformedData.length}

                    page={page}

                    rowsPerPage={rowsPerPage}

                    onPageChange={handleChangePage}

                    onRowsPerPageChange={handleChangeRowsPerPage}

                />

            </Box>

            {/* Add/Edit Dialog */}

            <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="sm">

                <DialogTitle sx={{ fontWeight: 600 }}>

                    {dialogMode === 'add' ? t('questionGroupsCard.dialog.addTitle') : t('questionGroupsCard.dialog.editTitle')}

                </DialogTitle>

                <DialogContent>

                    <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>

                        <TextField

                            label={t('questionGroupsCard.label.questiongroupname', 'Question Group Name')}

                            fullWidth

                            variant="outlined"

                            value={groupName}

                            onChange={(e) => setGroupName(e.target.value)}

                            required

                        />

                        <TextField

                            label={t('questionGroupsCard.label.description', 'Description')}

                            fullWidth

                            multiline

                            rows={3}

                            variant="outlined"

                            value={groupDescription}

                            onChange={(e) => setGroupDescription(e.target.value)}

                        />

                        <FormControl fullWidth variant="outlined">

                            <InputLabel>Select Questions</InputLabel>

                             <Select

                                multiple

                                value={selectedQuestions}

                                onChange={(e: SelectChangeEvent<any[]>) => setSelectedQuestions(e.target.value as any[])}

                                input={<OutlinedInput label={t('questionGroupsCard.label.selectquestions', 'Select Questions')} />}

                                renderValue={(selected) => (

                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>

                                        {(selected as any[]).map((value) => {

                                            const q = allQuestions.find((item) => item.id === value);

                                            return <Chip key={value} label={q?.text?.substring(0, 30) || 'Question'} size="small" />;

                                        })}

                                    </Box>

                                )}

                            >

                                {allQuestions.map((q) => (

                                    <MenuItem key={q.id} value={q.id}>

                                        <Typography variant="body2" sx={{ maxWidth: 400, overflow: 'hidden', textOverflow: 'ellipsis' }}>

                                            {q.text}

                                        </Typography>

                                    </MenuItem>

                                ))}

                            </Select>

                        </FormControl>

                        <Button

                            variant="outlined"

                            startIcon={<AddIcon />}

                            onClick={() => setOpenCreateQuestion(true)}

                            sx={{ alignSelf: 'flex-start', borderRadius: 2 }}

                        >

                            Create New Question

                        </Button>

                    </Box>

                </DialogContent>

                <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>

                    <Button onClick={handleCloseDialog} color="inherit">{t('questionGroupsCard.dialog.cancel')}</Button>

                    <Button

                        onClick={handleSave}

                        variant="contained"

                        disabled={isMutating || !groupName.trim()}

                        sx={{ px: 4, borderRadius: 2 }}

                    >

                        {isMutating ? t('questionGroupsCard.dialog.saving') : t('questionGroupsCard.dialog.save')}

                    </Button>

                </DialogActions>

            </Dialog>

            {/* Create Question Dialog */}

            <Dialog open={openCreateQuestion} onClose={() => setOpenCreateQuestion(false)} fullWidth maxWidth="xs">

                <DialogTitle sx={{ fontWeight: 600 }}>{t('questionGroupsCard.dialog.createNewQuestion')}</DialogTitle>

                <DialogContent>

                    <Box sx={{ pt: 1 }}>

                        <TextField

                            label={t('questionGroupsCard.label.questioncontent', 'Question Content')}

                            fullWidth

                            multiline

                            rows={3}

                            variant="outlined"

                            value={newQuestionContent}

                            onChange={(e) => setNewQuestionContent(e.target.value)}

                            required

                        />

                    </Box>

                </DialogContent>

                <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>

                    <Button onClick={() => setOpenCreateQuestion(false)} color="inherit">{t('questionGroupsCard.dialog.cancel')}</Button>

                    <Button

                        onClick={handleCreateQuestion}

                        variant="contained"

                        disabled={isCreatingQuestion || !newQuestionContent.trim()}

                        sx={{ px: 4, borderRadius: 2 }}

                    >

                        {isCreatingQuestion ? t('questionGroupsCard.dialog.creating') : t('questionGroupsCard.dialog.create')}

                    </Button>

                </DialogActions>

            </Dialog>

            {/* Delete Confirmation */}

            <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>

                <DialogTitle sx={{ fontWeight: 600 }}>{t('questionGroupsCard.dialog.confirmDeleteTitle')}</DialogTitle>

                <DialogContent>

                    <Typography variant="body1">

                        Are you sure you want to delete the question group <strong>{currentGroup?.name}</strong>?

                    </Typography>

                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>

                        The questions inside will not be deleted, but their association with this group will be lost.

                    </Typography>

                </DialogContent>

                <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>

                    <Button onClick={() => setOpenDeleteDialog(false)} color="inherit">{t('questionGroupsCard.dialog.cancel')}</Button>

                    <Button

                        onClick={handleDelete}

                        color="error"

                        variant="contained"

                        disabled={isMutating}

                        sx={{ px: 4, borderRadius: 2 }}

                    >

                        {isMutating ? t('questionGroupsCard.dialog.deleting') : t('questionGroupsCard.dialog.confirmDeleteBtn')}

                    </Button>

                </DialogActions>

            </Dialog>

        </Box>

    );

};

export default QuestionGroupsCard;
