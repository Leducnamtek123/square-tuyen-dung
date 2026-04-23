'use client';
import React, { useCallback, useMemo, useReducer } from 'react';
import { Box, Typography, Breadcrumbs, Link, Button, TextField, InputAdornment, Stack, Paper, alpha, useTheme, IconButton } from '@mui/material';
import { useTranslation } from 'react-i18next';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { ColumnDef } from '@tanstack/react-table';
import DataTable from '../../../../components/Common/DataTable';
import { useEmployerQuestions, useQuestionGroups, useQuestionMutations, useQuestionGroupMutations } from '../hooks/useEmployerQueries';
import { useDataTable, useDebounce } from '../../../../hooks';
import { confirmModal } from '../../../../utils/sweetalert2Modal';
import errorHandling from '../../../../utils/errorHandling';
import BackdropLoading from '../../../../components/Common/Loading/BackdropLoading';
import toastMessages from '../../../../utils/toastMessages';
import type { QuestionGroup, Question } from '../../../../types/models';
import QuestionGroupsDialogs from './QuestionGroupsDialogs';
import type { SelectChangeEvent } from '@mui/material';

interface QuestionGroupsCardProps {
  title?: string;
}

type State = {
  openDialog: boolean;
  dialogMode: 'add' | 'edit';
  currentGroup: QuestionGroup | null;
  groupName: string;
  groupDescription: string;
  selectedQuestions: number[];
  openCreateQuestion: boolean;
  newQuestionContent: string;
};

type Action =
  | { type: 'open_add' }
  | { type: 'open_edit'; group: QuestionGroup }
  | { type: 'close_dialog' }
  | { type: 'open_create_question' }
  | { type: 'close_create_question' }
  | { type: 'set_group_name'; value: string }
  | { type: 'set_group_description'; value: string }
  | { type: 'set_selected_questions'; value: number[] }
  | { type: 'set_new_question_content'; value: string }
  | { type: 'reset_group_form' };

const initialState: State = {
  openDialog: false,
  dialogMode: 'add',
  currentGroup: null,
  groupName: '',
  groupDescription: '',
  selectedQuestions: [],
  openCreateQuestion: false,
  newQuestionContent: '',
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'open_add':
      return { ...initialState, openDialog: true };
    case 'open_edit':
      return {
        ...state,
        openDialog: true,
        dialogMode: 'edit',
        currentGroup: action.group,
        groupName: action.group.name,
        groupDescription: action.group.description || '',
        selectedQuestions: action.group.questions?.map((q: Question) => q.id) || [],
      };
    case 'close_dialog':
      return { ...state, openDialog: false };
    case 'open_create_question':
      return { ...state, openCreateQuestion: true, newQuestionContent: '' };
    case 'close_create_question':
      return { ...state, openCreateQuestion: false };
    case 'set_group_name':
      return { ...state, groupName: action.value };
    case 'set_group_description':
      return { ...state, groupDescription: action.value };
    case 'set_selected_questions':
      return { ...state, selectedQuestions: action.value };
    case 'set_new_question_content':
      return { ...state, newQuestionContent: action.value };
    case 'reset_group_form':
      return { ...state, groupName: '', groupDescription: '', selectedQuestions: [], currentGroup: null, dialogMode: 'add' };
    default:
      return state;
  }
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
      '& fieldset': { borderColor: alpha(theme.palette.divider, 0.8) },
    },
  };

  const { page, pageSize, pagination, onPaginationChange } = useDataTable({ initialPageSize: 10 });
  const [state, dispatch] = useReducer(reducer, initialState);
  const [searchTerm, setSearchTerm] = React.useState('');
  const debouncedSearch = useDebounce(searchTerm, 500);

  const { data: groupData, isLoading: groupsLoading } = useQuestionGroups({ page: page + 1, pageSize, search: debouncedSearch });
  const { data: questionData } = useEmployerQuestions({ pageSize: 200 });
  const allQuestions = questionData?.results || [];
  const { createQuestionGroup, updateQuestionGroup, deleteQuestionGroup, isMutating: isGroupMutating } = useQuestionGroupMutations();
  const { createQuestion, isMutating: isQuestionMutating } = useQuestionMutations();

  const groups = groupData?.results || [];
  const count = groupData?.count || 0;

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    onPaginationChange({ pageIndex: 0, pageSize });
  };

  const handleOpenAdd = useCallback(() => dispatch({ type: 'open_add' }), []);
  const handleOpenEdit = useCallback((group: QuestionGroup) => dispatch({ type: 'open_edit', group }), []);
  const handleCloseDialog = useCallback(() => dispatch({ type: 'close_dialog' }), []);

  const handleSave = useCallback(async () => {
    if (!state.groupName.trim()) return;
    const payload = {
      name: state.groupName.trim(),
      description: state.groupDescription.trim(),
      question_ids: state.selectedQuestions,
    };

    try {
      if (state.dialogMode === 'add') {
        await createQuestionGroup(payload);
        toastMessages.success(t('employer:questionGroupsCard.messages.createSuccess'));
      } else if (state.currentGroup) {
        await updateQuestionGroup({ id: state.currentGroup.id, data: payload });
        toastMessages.success(t('employer:questionGroupsCard.messages.updateSuccess'));
      }
      handleCloseDialog();
    } catch (error) {
      errorHandling(error);
    }
  }, [createQuestionGroup, handleCloseDialog, state.currentGroup, state.dialogMode, state.groupDescription, state.groupName, state.selectedQuestions, t, updateQuestionGroup]);

  const handleCreateQuestion = useCallback(async () => {
    if (!state.newQuestionContent.trim()) return;
    try {
      const res = await createQuestion({ text: state.newQuestionContent.trim() });
      if (res?.id) {
        dispatch({ type: 'set_selected_questions', value: [...state.selectedQuestions, res.id] });
        toastMessages.success(t('interview:employer.questionBank.createSuccess'));
      }
      dispatch({ type: 'close_create_question' });
      dispatch({ type: 'set_new_question_content', value: '' });
    } catch (error) {
      errorHandling(error);
    }
  }, [createQuestion, state.newQuestionContent, state.selectedQuestions, t]);

  const handleDelete = useCallback((group: QuestionGroup) => {
    confirmModal(
      async () => {
        try {
          await deleteQuestionGroup(group.id);
          toastMessages.success(t('employer:questionGroupsCard.messages.deleteSuccess'));
        } catch {
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
      cell: ({ row }) => <Typography variant="body2" sx={{ fontWeight: 800, color: 'primary.main' }}>{row.original.name}</Typography>,
    },
    {
      header: t('employer:questionGroupsCard.table.numberOfQuestions'),
      accessorKey: 'questions',
      cell: ({ row }) => (
        <Typography variant="body2" sx={{ fontWeight: 700 }}>
          {row.original.questions?.length || 0}
        </Typography>
      ),
    },
    {
      header: t('employer:questionGroupsCard.table.description'),
      accessorKey: 'description',
      cell: ({ row }) => (
        <Typography variant="body2" color="text.secondary" sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', maxWidth: 300, fontWeight: 500 }}>
          {row.original.description || '---'}
        </Typography>
      ),
    },
    {
      header: '',
      id: 'actions',
      cell: ({ row }) => (
        <Stack direction="row" spacing={1} justifyContent="flex-end">
          <IconButton size="small" onClick={() => handleOpenEdit(row.original)} color="primary">
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={() => handleDelete(row.original)} color="error">
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Stack>
      ),
    },
  ], [handleDelete, handleOpenEdit, t]);

  return (
    <Paper elevation={0} sx={{ p: { xs: 2.5, sm: 4 }, borderRadius: 4, boxShadow: (muiTheme) => muiTheme.customShadows?.z1, border: '1px solid', borderColor: 'divider' }}>
      <Stack direction={{ xs: 'column', md: 'row' }} alignItems={{ xs: 'flex-start', md: 'center' }} justifyContent="space-between" spacing={2} mb={4}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 900, color: 'text.primary', mb: 1, letterSpacing: '-0.5px' }}>
            {resolvedTitle}
          </Typography>
          <Breadcrumbs aria-label="breadcrumb">
            <Link underline="hover" color="inherit" href="/employer/dashboard" sx={{ fontSize: '0.875rem', fontWeight: 500 }}>{t('common:breadcrumbs.employer')}</Link>
            <Typography color="text.secondary" sx={{ fontSize: '0.875rem', fontWeight: 500 }}>{t('employer:questionGroupsCard.onlineInterview')}</Typography>
            <Typography color="text.primary" sx={{ fontSize: '0.875rem', fontWeight: 700 }}>{t('employer:questionGroupsCard.questionGroups')}</Typography>
          </Breadcrumbs>
        </Box>
        <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={handleOpenAdd} sx={{ borderRadius: 1.5, px: 3, py: 1, boxShadow: 'none', fontWeight: 700, textTransform: 'none' }}>
          {t('employer:questionGroupsCard.actions.addGroup')}
        </Button>
      </Stack>

      <Box sx={{ mb: 4 }}>
        <TextField
          size="small"
          placeholder={t('employer:questionGroupsCard.placeholder.searchquestiongroups')}
          value={searchTerm}
          onChange={handleSearchChange}
          sx={{ width: { xs: '100%', sm: 320 }, ...inputSx }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" color="action" />
                </InputAdornment>
              ),
            },
          }}
        />
      </Box>

      <DataTable columns={columns} data={groups} isLoading={groupsLoading} rowCount={count} pagination={pagination} onPaginationChange={onPaginationChange} emptyMessage={t('employer:questionGroupsCard.noData')} />

      <QuestionGroupsDialogs
        openDialog={state.openDialog}
        dialogMode={state.dialogMode}
        currentGroup={state.currentGroup}
        groupName={state.groupName}
        groupDescription={state.groupDescription}
        selectedQuestions={state.selectedQuestions}
        openCreateQuestion={state.openCreateQuestion}
        newQuestionContent={state.newQuestionContent}
        allQuestions={allQuestions}
        inputSx={inputSx}
        isGroupMutating={isGroupMutating}
        isQuestionMutating={isQuestionMutating}
        t={t}
        theme={theme}
        onCloseDialog={handleCloseDialog}
        onGroupNameChange={(value) => dispatch({ type: 'set_group_name', value })}
        onGroupDescriptionChange={(value) => dispatch({ type: 'set_group_description', value })}
        onSelectedQuestionsChange={(value) => dispatch({ type: 'set_selected_questions', value })}
        onOpenCreateQuestion={() => dispatch({ type: 'open_create_question' })}
        onCloseCreateQuestion={() => dispatch({ type: 'close_create_question' })}
        onNewQuestionContentChange={(value) => dispatch({ type: 'set_new_question_content', value })}
        onSaveGroup={handleSave}
        onCreateQuestion={handleCreateQuestion}
      />

      {(isGroupMutating || isQuestionMutating) && <BackdropLoading />}
    </Paper>
  );
};

export default QuestionGroupsCard;
