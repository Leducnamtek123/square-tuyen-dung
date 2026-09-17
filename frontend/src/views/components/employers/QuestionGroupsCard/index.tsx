'use client';
import React, { useCallback, useMemo, useReducer, useState } from 'react';
import { Box, Typography, Button, Stack, Paper, useTheme, IconButton, Tooltip, CircularProgress, alpha, Chip } from '@mui/material';
import { useTranslation } from 'react-i18next';
import AddIcon from '@mui/icons-material/Add';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import PublicIcon from '@mui/icons-material/Public';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { ColumnDef } from '@tanstack/react-table';
import DataTable from '@/components/Common/DataTable';
import { interviewService } from '@/services/interviewService';
import { useEmployerQuestions, useQuestionGroups, useQuestionMutations, useQuestionGroupMutations } from '../hooks/useEmployerQueries';
import { useDataTable, useDebounce } from '@/hooks';
import { confirmModal } from '@/utils/sweetalert2Modal';
import errorHandling from '@/utils/errorHandling';
import BackdropLoading from '@/components/Common/Loading/BackdropLoading';
import toastMessages from '@/utils/toastMessages';
import type { QuestionGroup, Question } from '@/types/models';
import QuestionGroupsDialogs from './QuestionGroupsDialogs';
import type { SelectChangeEvent } from '@mui/material';
import FilterBar, { filterControlSx } from '@/components/Common/FilterBar';

interface QuestionGroupsCardProps {
  title?: string;
}

type State = {
  openDialog: boolean;
  dialogMode: 'add' | 'edit';
  currentGroup: QuestionGroup | null;
  groupName: string;
  groupDescription: string;
  isPublic: boolean;
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
  | { type: 'set_is_public'; value: boolean }
  | { type: 'set_selected_questions'; value: number[] }
  | { type: 'set_new_question_content'; value: string }
  | { type: 'reset_group_form' };

const initialState: State = {
  openDialog: false,
  dialogMode: 'add',
  currentGroup: null,
  groupName: '',
  groupDescription: '',
  isPublic: false,
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
        isPublic: Boolean(action.group.is_public ?? action.group.isPublic ?? false),
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
    case 'set_is_public':
      return { ...state, isPublic: action.value };
    case 'set_selected_questions':
      return { ...state, selectedQuestions: action.value };
    case 'set_new_question_content':
      return { ...state, newQuestionContent: action.value };
    case 'reset_group_form':
      return { ...state, groupName: '', groupDescription: '', isPublic: false, selectedQuestions: [], currentGroup: null, dialogMode: 'add' };
    default:
      return state;
  }
}

const QuestionGroupsCard: React.FC<QuestionGroupsCardProps> = ({ title }) => {
  const { t } = useTranslation(['employer', 'interview', 'common']);
  const theme = useTheme();
  const resolvedTitle = title || t('employer:questionGroupsCard.title');

  const inputSx = filterControlSx as Record<string, unknown>;

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

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    onPaginationChange({ pageIndex: 0, pageSize });
  };

  const isSystemGroup = useCallback((group?: QuestionGroup | null) => {
    if (!group) return false;
    return group.canWrite === false || !group.company;
  }, []);

  const handleOpenAdd = useCallback(() => dispatch({ type: 'open_add' }), []);
  const handleOpenEdit = useCallback((group: QuestionGroup) => dispatch({ type: 'open_edit', group }), []);
  const handleCloseDialog = useCallback(() => dispatch({ type: 'close_dialog' }), []);

  const handleSave = useCallback(async () => {
    if (!state.groupName.trim()) return;
    const payload = {
      name: state.groupName.trim(),
      description: state.groupDescription.trim(),
      question_ids: state.selectedQuestions,
      is_public: state.isPublic,
    };

    try {
      if (state.dialogMode === 'add') {
        await createQuestionGroup(payload);
        toastMessages.success(t('employer:questionGroupsCard.messages.createSuccess'));
      } else if (state.currentGroup) {
        if (isSystemGroup(state.currentGroup)) {
          await createQuestionGroup(payload);
          toastMessages.success('Đã nhân bản bộ câu hỏi thành công cho doanh nghiệp!');
        } else {
          await updateQuestionGroup({ id: state.currentGroup.id, data: payload });
          toastMessages.success(t('employer:questionGroupsCard.messages.updateSuccess'));
        }
      }
      handleCloseDialog();
    } catch (error) {
      errorHandling(error);
    }
  }, [createQuestionGroup, handleCloseDialog, isSystemGroup, state.currentGroup, state.dialogMode, state.groupDescription, state.groupName, state.isPublic, state.selectedQuestions, t, updateQuestionGroup]);

  const handleTogglePublic = useCallback(async (group: QuestionGroup) => {
    if (isSystemGroup(group)) {
      toastMessages.warn('Không thể thay đổi trạng thái bộ câu hỏi chuẩn hệ thống');
      return;
    }
    const currentStatus = Boolean(group.is_public ?? group.isPublic ?? false);
    const nextStatus = !currentStatus;
    try {
      await updateQuestionGroup({ id: group.id, data: { is_public: nextStatus } });
      toastMessages.success(
        nextStatus
          ? 'Đã chuyển sang trạng thái công khai cho ứng viên'
          : 'Đã chuyển sang trạng thái riêng tư nội bộ'
      );
    } catch (error) {
      errorHandling(error);
    }
  }, [isSystemGroup, updateQuestionGroup]);

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
    if (isSystemGroup(group)) {
      toastMessages.warn('Bộ câu hỏi chuẩn hệ thống không thể xóa');
      return;
    }
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
  }, [deleteQuestionGroup, isSystemGroup, t]);

  const [startingMockGroupId, setStartingMockGroupId] = useState<number | null>(null);

  const handleTestGroupMock = useCallback(async (group: QuestionGroup) => {
    const qIds = group.questions?.map((q: Question) => q.id) || [];
    if (qIds.length === 0) {
      toastMessages.warn(t('employer:questionGroupsCard.messages.emptyGroupWarning'));
      return;
    }

    setStartingMockGroupId(group.id);
    try {
      const res = await interviewService.createMockSession({
        job_title: group.name,
        question_group_id: group.id,
        question_ids: qIds,
      });
      toastMessages.success(t('employer:questionGroupsCard.messages.testRoomCreated'));
      const targetUrl = res.interview_url || res.interviewUrl || `/interview/${res.invite_token || res.id}`;
      window.open(targetUrl, '_blank');
    } catch (error) {
      errorHandling(error);
    } finally {
      setStartingMockGroupId(null);
    }
  }, [t]);

  const columns = useMemo<ColumnDef<QuestionGroup>[]>(() => [
    {
      header: t('employer:questionGroupsCard.table.groupName'),
      accessorKey: 'name',
      cell: ({ row }) => {
        const isSystem = isSystemGroup(row.original);
        return (
          <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
            <Typography variant="body2" sx={{ fontWeight: 800, color: 'primary.main' }}>
              {row.original.name}
            </Typography>
            {isSystem && (
              <Chip
                label="Mẫu hệ thống"
                size="small"
                sx={{
                  height: 20,
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  bgcolor: '#e0f2fe',
                  color: '#0369a1',
                  border: '1px solid #bae6fd',
                }}
              />
            )}
          </Stack>
        );
      },
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
      header: t('employer:questionGroupsCard.table.status'),
      accessorKey: 'is_public',
      cell: ({ row }) => {
        const isPublic = Boolean(row.original.is_public ?? row.original.isPublic);
        const isSystem = isSystemGroup(row.original);
        return (
          <Tooltip
            title={
              isSystem
                ? 'Bộ câu hỏi chuẩn hệ thống không thể thay đổi trạng thái'
                : isPublic
                ? 'Bấm để chuyển sang riêng tư nội bộ'
                : 'Bấm để công khai cho ứng viên luyện tập'
            }
            arrow
          >
            <span>
              <Chip
                icon={isPublic ? <PublicIcon sx={{ fontSize: '15px !important' }} /> : <LockOutlinedIcon sx={{ fontSize: '15px !important' }} />}
                label={isPublic ? 'Công khai' : 'Riêng tư'}
                size="small"
                disabled={isSystem}
                onClick={
                  isSystem
                    ? undefined
                    : (e) => {
                        e.stopPropagation();
                        handleTogglePublic(row.original);
                      }
                }
                sx={{
                  cursor: isSystem ? 'not-allowed' : 'pointer',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  color: isPublic ? '#047857' : '#334155',
                  bgcolor: isPublic ? '#d1fae5' : '#f1f5f9',
                  border: '1px solid',
                  borderColor: isPublic ? '#a7f3d0' : '#cbd5e1',
                  transition: 'all 0.2s ease',
                  '&.Mui-disabled': {
                    opacity: 0.85,
                    color: isPublic ? '#047857' : '#334155',
                    bgcolor: isPublic ? '#d1fae5' : '#f1f5f9',
                    borderColor: isPublic ? '#a7f3d0' : '#cbd5e1',
                  },
                  '&:hover': isSystem
                    ? undefined
                    : {
                        bgcolor: isPublic ? '#a7f3d0' : '#e2e8f0',
                        transform: 'scale(1.04)',
                      },
                }}
              />
            </span>
          </Tooltip>
        );
      },
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
        <Stack direction="row" spacing={1} justifyContent="flex-end" alignItems="center">
          <Tooltip title={t('employer:questionGroupsCard.actions.testGroupTooltip')} arrow>
            <span>
              <Button
                size="small"
                variant="outlined"
                color="primary"
                startIcon={startingMockGroupId === row.original.id ? <CircularProgress size={14} color="inherit" /> : <AutoAwesomeRoundedIcon sx={{ fontSize: 16 }} />}
                disabled={startingMockGroupId === row.original.id}
                onClick={() => handleTestGroupMock(row.original)}
                sx={{
                  textTransform: 'none',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  borderRadius: '999px',
                  py: 0.5,
                  px: 1.75,
                  whiteSpace: 'nowrap',
                  borderColor: 'primary.main',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.06),
                    borderColor: 'primary.dark',
                  },
                }}
              >
                {t('employer:questionGroupsCard.actions.testWithAI')}
              </Button>
            </span>
          </Tooltip>
          <Tooltip title={t('common:actions.edit')} arrow>
            <span>
              <IconButton
                aria-label="Sửa nhóm câu hỏi"
                size="small"
                onClick={() => handleOpenEdit(row.original)}
                sx={{
                  bgcolor: alpha(theme.palette.primary.main, 0.08),
                  color: 'primary.main',
                  borderRadius: '10px',
                  transition: 'all 0.2s ease',
                  '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.18), transform: 'scale(1.05)' },
                }}
              >
                <EditOutlinedIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip
            title={
              isSystemGroup(row.original)
                ? 'Bộ câu hỏi chuẩn hệ thống không thể xóa'
                : t('common:actions.delete')
            }
            arrow
          >
            <span>
              <IconButton
                aria-label="Xóa nhóm câu hỏi"
                size="small"
                disabled={isSystemGroup(row.original)}
                onClick={() => handleDelete(row.original)}
                sx={{
                  bgcolor: isSystemGroup(row.original)
                    ? alpha(theme.palette.action.disabledBackground, 0.1)
                    : alpha(theme.palette.error.main, 0.08),
                  color: isSystemGroup(row.original)
                    ? theme.palette.action.disabled
                    : 'error.main',
                  borderRadius: '10px',
                  transition: 'all 0.2s ease',
                  '&:hover': isSystemGroup(row.original)
                    ? undefined
                    : { bgcolor: alpha(theme.palette.error.main, 0.18), transform: 'scale(1.05)' },
                }}
              >
                <DeleteOutlineRoundedIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </Stack>
      ),
    },
  ], [handleDelete, handleOpenEdit, handleTestGroupMock, handleTogglePublic, isSystemGroup, startingMockGroupId, t, theme]);

  return (
    <Paper elevation={0} sx={{ p: { xs: 2.5, sm: 4 }, borderRadius: 4, boxShadow: (muiTheme) => muiTheme.customShadows?.z1, border: '1px solid', borderColor: 'divider' }}>
      <Stack direction={{ xs: 'column', md: 'row' }} alignItems={{ xs: 'flex-start', md: 'center' }} justifyContent="space-between" spacing={2} mb={4}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 900, color: 'text.primary', mb: 1, letterSpacing: '-0.5px' }}>
            {resolvedTitle}
          </Typography>
        </Box>
        <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={handleOpenAdd} sx={{ px: 3, py: 1, boxShadow: 'none', fontWeight: 700, textTransform: 'none' }}>
          {t('employer:questionGroupsCard.actions.addGroup')}
        </Button>
      </Stack>

      <FilterBar
        title={t('employer:questionGroupsCard.filters')}
        searchValue={searchTerm}
        searchPlaceholder={t('employer:questionGroupsCard.placeholder.searchquestiongroups')}
        onSearchChange={handleSearchChange}
        onReset={() => handleSearchChange('')}
        resetDisabled={!searchTerm}
        resetLabel={t('common:reset')}
        sx={{ mb: 4 }}
      />

      <DataTable columns={columns} data={groups} isLoading={groupsLoading} rowCount={count} pagination={pagination} onPaginationChange={onPaginationChange} emptyMessage={t('employer:questionGroupsCard.noData')} />

      <QuestionGroupsDialogs
        openDialog={state.openDialog}
        dialogMode={state.dialogMode}
        currentGroup={state.currentGroup}
        groupName={state.groupName}
        groupDescription={state.groupDescription}
        isPublic={state.isPublic}
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
        onIsPublicChange={(value) => dispatch({ type: 'set_is_public', value })}
        onSelectedQuestionsChange={(value) => dispatch({ type: 'set_selected_questions', value })}
        onOpenCreateQuestion={() => dispatch({ type: 'open_create_question' })}
        onCloseCreateQuestion={() => dispatch({ type: 'close_create_question' })}
        onNewQuestionContentChange={(value) => dispatch({ type: 'set_new_question_content', value })}
        onSaveGroup={handleSave}
        onCreateQuestion={handleCreateQuestion}
        onTestGroup={() => {
          if (state.selectedQuestions.length === 0) {
            toastMessages.warn(t('employer:questionGroupsCard.messages.emptyGroupWarning'));
            return;
          }
          handleTestGroupMock({
            id: state.currentGroup?.id || 0,
            name: state.groupName || t('employer:questionGroupsCard.title'),
            questions: state.selectedQuestions.map((id) => ({ id } as Question)),
          } as QuestionGroup);
        }}
        isTestingGroup={startingMockGroupId != null}
      />

      {(isGroupMutating || isQuestionMutating) && <BackdropLoading />}
    </Paper>
  );
};

export default QuestionGroupsCard;
