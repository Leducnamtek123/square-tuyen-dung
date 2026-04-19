'use client';
import React, { useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Box, 
  Typography, 
  Breadcrumbs, 
  Link, 
  Button, 
  TextField, 
  InputAdornment, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  OutlinedInput, 
  Chip, 
  IconButton, 
  Stack, 
  Divider, 
  SelectChangeEvent,
  Tooltip,
  Paper,
  alpha,
  useTheme,
  Theme
} from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DataTable from '../../../../components/Common/DataTable';
import { useEmployerQuestions, useQuestionGroups, useQuestionMutations, useQuestionGroupMutations } from '../hooks/useEmployerQueries';
import { useDataTable } from '../../../../hooks';
import { confirmModal } from '../../../../utils/sweetalert2Modal';
import errorHandling from '../../../../utils/errorHandling';
import BackdropLoading from '../../../../components/Common/Loading/BackdropLoading';
import toastMessages from '../../../../utils/toastMessages';
import type { AxiosError } from 'axios';
import type { ApiError } from '../../../../types/api';
import type { QuestionGroup, Question } from '../../../../types/models';
import type { ColumnDef } from '@tanstack/react-table';

interface QuestionGroupsCardProps {
  title?: string;
}

const QuestionGroupsCard: React.FC<QuestionGroupsCardProps> = ({ title }) => {
    const { t } = useTranslation(['employer', 'interview', 'common']);
    const theme = useTheme();
    const resolvedTitle = title || t('employer:questionGroupsCard.title', 'Question Groups Management');

    const inputSx = {
        '& .MuiOutlinedInput-root': {
            borderRadius: 2.5,
            backgroundColor: alpha(theme.palette.action.disabled, 0.03),
            '&:hover': { bgcolor: alpha(theme.palette.action.disabled, 0.06) },
            '& fieldset': { borderColor: alpha(theme.palette.divider, 0.8) }
        }
    };

    const {
        page,
        pageSize,
        pagination,
        onPaginationChange,
    } = useDataTable({ initialPageSize: 10 });

    const [searchTerm, setSearchTerm] = useState('');
    const [openDialog, setOpenDialog] = useState(false);
    const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
    const [currentGroup, setCurrentGroup] = useState<QuestionGroup | null>(null);
    const [groupName, setGroupName] = useState('');
    const [groupDescription, setGroupDescription] = useState('');
    const [selectedQuestions, setSelectedQuestions] = useState<number[]>([]);
    
    const [openCreateQuestion, setOpenCreateQuestion] = useState(false);
    const [newQuestionContent, setNewQuestionContent] = useState('');

    // Data Fetching
    const { data: groupData, isLoading: groupsLoading } = useQuestionGroups({
        page: page + 1,
        pageSize,
        search: searchTerm
    });

    const { data: questionData } = useEmployerQuestions({ pageSize: 200 }); // Load enough questions for selection
    const allQuestions = questionData?.results || [];

    const { createQuestionGroup, updateQuestionGroup, deleteQuestionGroup, isMutating: isGroupMutating } = useQuestionGroupMutations();
    const { createQuestion, isMutating: isQuestionMutating } = useQuestionMutations();

    const groups = groupData?.results || [];
    const count = groupData?.count || 0;

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        onPaginationChange({ pageIndex: 0, pageSize });
    };

    const handleOpenAdd = () => {
        setDialogMode('add');
        setGroupName('');
        setGroupDescription('');
        setSelectedQuestions([]);
        setCurrentGroup(null);
        setOpenDialog(true);
    };

    const handleOpenEdit = useCallback((group: QuestionGroup) => {
        setDialogMode('edit');
        setCurrentGroup(group);
        setGroupName(group.name);
        setGroupDescription(group.description || '');
        setSelectedQuestions(group.questions?.map((q: Question) => q.id) || []);
        setOpenDialog(true);
    }, []);

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
                toastMessages.success(t('employer:questionGroupsCard.messages.createSuccess'));
            } else if (currentGroup) {
                await updateQuestionGroup({ id: currentGroup.id, data: payload });
                toastMessages.success(t('employer:questionGroupsCard.messages.updateSuccess'));
            }
            handleCloseDialog();
        } catch (error) {
            errorHandling(error);
        }
    };

    const handleCreateQuestion = async () => {
        if (!newQuestionContent.trim()) return;
        try {
            const res = await createQuestion({ text: newQuestionContent.trim() });
            if (res && (res as { id?: number }).id) {
                setSelectedQuestions((prev: number[]) => [...prev, (res as { id: number }).id]);
                toastMessages.success(t('interview:employer.questionBank.createSuccess'));
            }
            setOpenCreateQuestion(false);
            setNewQuestionContent('');
        } catch (error) {
            errorHandling(error);
        }
    };

    const handleDelete = useCallback((group: QuestionGroup) => {
        confirmModal(
            async () => {
                try {
                    await deleteQuestionGroup(group.id);
                    toastMessages.success(t('employer:questionGroupsCard.messages.deleteSuccess'));
                } catch (error) {
                    // Error handled by mutation hook
                }
            },
            t('employer:questionGroupsCard.dialog.confirmDeleteTitle'),
            t('employer:questionGroupsCard.dialog.confirmDeleteMessage', { name: group.name }),
            'warning'
        );
    }, [deleteQuestionGroup, t]);

    const columns = useMemo<ColumnDef<QuestionGroup>[]>(() => [
        {
            header: t('employer:questionGroupsCard.table.groupName'),
            accessorKey: 'name',
            cell: ({ row }: { row: { original: QuestionGroup } }) => <Typography variant="body2" sx={{ fontWeight: 800, color: 'primary.main' }}>{row.original.name}</Typography>,
        },
        {
            header: t('employer:questionGroupsCard.table.numberOfQuestions'),
            accessorKey: 'questions',
            cell: ({ row }: { row: { original: QuestionGroup } }) => (
                <Chip 
                    label={row.original.questions?.length || 0} 
                    size="small" 
                    variant="outlined" 
                    sx={{ fontWeight: 900, borderRadius: 1.5, borderColor: alpha(theme.palette.primary.main, 0.3), color: 'primary.main', bgcolor: alpha(theme.palette.primary.main, 0.05) }} 
                />
            ),
        },
        {
            header: t('employer:questionGroupsCard.table.description'),
            accessorKey: 'description',
            cell: ({ row }: { row: { original: QuestionGroup } }) => (
                <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    sx={{ 
                        display: '-webkit-box', 
                        WebkitLineClamp: 2, 
                        WebkitBoxOrient: 'vertical', 
                        overflow: 'hidden',
                        maxWidth: 300,
                        fontWeight: 500
                    }}
                >
                    {row.original.description || '---'}
                </Typography>
            ),
        },
        {
            header: '',
            id: 'actions',
            cell: ({ row }: { row: { original: QuestionGroup } }) => (
                <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Tooltip title={t('common:actions.edit')} arrow>
                        <IconButton 
                            size="small" 
                            onClick={() => handleOpenEdit(row.original)} 
                            color="primary" 
                            sx={{ bgcolor: alpha(theme.palette.primary.main, 0.08), '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.15) } }}
                        >
                            <EditIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title={t('common:actions.delete')} arrow>
                        <IconButton 
                            size="small" 
                            onClick={() => handleDelete(row.original)} 
                            color="error" 
                            sx={{ bgcolor: alpha(theme.palette.error.main, 0.08), '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.15) } }}
                        >
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Stack>
            ),
        },
    ], [t, handleOpenEdit, handleDelete, theme]);

    return (
        <Paper elevation={0} sx={{ p: { xs: 2.5, sm: 4 }, borderRadius: 4, boxShadow: (theme) => theme.customShadows?.z1, border: '1px solid', borderColor: 'divider' }}>
            <Stack 
                direction={{ xs: 'column', md: 'row' }} 
                alignItems={{ xs: 'flex-start', md: 'center' }} 
                justifyContent="space-between" 
                spacing={2} 
                mb={4}
            >
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 900, color: 'text.primary', mb: 1, letterSpacing: '-0.5px' }}>
                        {resolvedTitle}
                    </Typography>
                    <Breadcrumbs aria-label="breadcrumb">
                        <Link underline="hover" color="inherit" href="/employer/dashboard" sx={{ fontSize: '0.875rem', fontWeight: 500 }}>{t('common:breadcrumbs.employer')}</Link>
                        <Typography color="text.secondary" sx={{ fontSize: '0.875rem', fontWeight: 500 }}>{t("employer:questionGroupsCard.onlineInterview")}</Typography>
                        <Typography color="text.primary" sx={{ fontSize: '0.875rem', fontWeight: 700 }}>{t("employer:questionGroupsCard.questionGroups")}</Typography>
                    </Breadcrumbs>
                </Box>
                <Button 
                    variant="contained" 
                    color="primary" 
                    startIcon={<AddIcon />} 
                    onClick={handleOpenAdd} 
                    sx={{ borderRadius: 1.5, px: 3, py: 1, boxShadow: 'none', fontWeight: 700, textTransform: 'none' }}
                >
                    {t('employer:questionGroupsCard.actions.addGroup')}
                </Button>
            </Stack>

            <Box sx={{ mb: 4 }}>
                <TextField
                    size="small"
                    placeholder={t('employer:questionGroupsCard.placeholder.searchquestiongroups')}
                    value={searchTerm}
                    onChange={handleSearchChange}
                    sx={{ 
                        width: { xs: '100%', sm: 320 }, 
                        ...inputSx
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

            <DataTable
                columns={columns}
                data={groups}
                isLoading={groupsLoading}
                rowCount={count}
                pagination={pagination}
                onPaginationChange={onPaginationChange}
                emptyMessage={t('employer:questionGroupsCard.noData')}
            />

            {/* Add/Edit Dialog */}
            <Dialog 
                open={openDialog} 
                onClose={handleCloseDialog} 
                fullWidth 
                maxWidth="sm" 
                slotProps={{ paper: { sx: { borderRadius: 3, p: 1 } } }}
            >
                <DialogTitle sx={{ fontWeight: 900, pt: 3, px: 3, fontSize: '1.5rem' }}>
                    {dialogMode === 'add' ? t('employer:questionGroupsCard.dialog.addTitle') : t('employer:questionGroupsCard.dialog.editTitle')}
                </DialogTitle>
                <DialogContent sx={{ px: 3, pb: 0 }}>
                    <Stack spacing={3} sx={{ pt: 2 }}>
                        <TextField
                            label={t('employer:questionGroupsCard.label.questiongroupname')}
                            fullWidth
                            variant="outlined"
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                            required
                            sx={inputSx}
                        />
                        <TextField
                            label={t('employer:questionGroupsCard.label.description')}
                            fullWidth
                            multiline
                            rows={3}
                            variant="outlined"
                            value={groupDescription}
                            onChange={(e) => setGroupDescription(e.target.value)}
                            sx={inputSx}
                        />
                        <FormControl fullWidth variant="outlined" sx={inputSx}>
                            <InputLabel sx={{ px: 0.5 }}>{t('employer:questionGroupsCard.label.selectquestions')}</InputLabel>
                            <Select
                                multiple
                                value={selectedQuestions}
                                onChange={(e: SelectChangeEvent<number[]>) => setSelectedQuestions(e.target.value as number[])}
                                input={<OutlinedInput label={t('employer:questionGroupsCard.label.selectquestions')} />}
                                renderValue={(selected) => (
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                        {(selected as number[]).map((value) => {
                                            const q = allQuestions.find((item) => item.id === value);
                                            return (
                                                <Chip 
                                                    key={value} 
                                                    label={q?.text?.substring(0, 30) || 'Question'} 
                                                    size="small" 
                                                    sx={{ borderRadius: 1.5, fontWeight: 700, bgcolor: alpha(theme.palette.primary.main, 0.08), color: 'primary.main', border: '1px solid', borderColor: alpha(theme.palette.primary.main, 0.1) }}
                                                />
                                            );
                                        })}
                                    </Box>
                                )}
                                MenuProps={{ slotProps: { paper: { sx: { borderRadius: 2, mt: 1, maxHeight: 300, boxShadow: (theme: Theme) => theme.customShadows?.z8 } } } }}
                            >
                                {allQuestions.map((q) => (
                                    <MenuItem key={q.id} value={q.id}>
                                        <Typography variant="body2" sx={{ maxWidth: 400, overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 500 }}>
                                            {q.text}
                                        </Typography>
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <Button
                            variant="text"
                            startIcon={<AddIcon />}
                            onClick={() => setOpenCreateQuestion(true)}
                            color="primary"
                            sx={{ alignSelf: 'flex-start', borderRadius: 1.5, textTransform: 'none', fontWeight: 800, px: 2, py: 1, bgcolor: alpha(theme.palette.primary.main, 0.05), '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.1) } }}
                        >
                            {t('employer:questionGroupsCard.actions.createNewQuestion')}
                        </Button>
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 4, pt: 3, gap: 2 }}>
                    <Button 
                        onClick={handleCloseDialog} 
                        color="inherit" 
                        sx={{ fontWeight: 700, textTransform: 'none', borderRadius: 1.5, px: 3 }}
                    >
                        {t('common:actions.cancel')}
                    </Button>
                    <Button
                        onClick={handleSave}
                        variant="contained"
                        disabled={isGroupMutating || !groupName.trim()}
                        sx={{ px: 4, py: 1.25, borderRadius: 1.5, fontWeight: 900, boxShadow: 'none', textTransform: 'none' }}
                    >
                        {t('common:actions.save')}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Create Question Inline Dialog */}
            <Dialog 
                open={openCreateQuestion} 
                onClose={() => setOpenCreateQuestion(false)} 
                fullWidth 
                maxWidth="xs" 
                slotProps={{ paper: { sx: { borderRadius: 3, p: 1 } } }}
            >
                <DialogTitle sx={{ fontWeight: 900, pt: 3, px: 3 }}>{t('employer:questionGroupsCard.dialog.createNewQuestion')}</DialogTitle>
                <DialogContent sx={{ px: 3, pb: 0 }}>
                    <Box sx={{ pt: 2 }}>
                        <TextField
                            label={t('employer:questionGroupsCard.label.questioncontent')}
                            fullWidth
                            multiline
                            rows={4}
                            variant="outlined"
                            value={newQuestionContent}
                            onChange={(e) => setNewQuestionContent(e.target.value)}
                            required
                            autoFocus
                            sx={inputSx}
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 4, pt: 3, gap: 2 }}>
                    <Button 
                        onClick={() => setOpenCreateQuestion(false)} 
                        color="inherit" 
                        sx={{ fontWeight: 700, textTransform: 'none', borderRadius: 1.5, px: 3 }}
                    >
                        {t('common:actions.cancel')}
                    </Button>
                    <Button
                        onClick={handleCreateQuestion}
                        variant="contained"
                        disabled={isQuestionMutating || !newQuestionContent.trim()}
                        sx={{ px: 4, py: 1.25, borderRadius: 1.5, fontWeight: 900, boxShadow: 'none', textTransform: 'none' }}
                    >
                        {t('common:actions.save')}
                    </Button>
                </DialogActions>
            </Dialog>

            {(isGroupMutating || isQuestionMutating) && <BackdropLoading />}
        </Paper>
    );
};

export default QuestionGroupsCard;
