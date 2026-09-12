import React from 'react';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  Stack,
  TextField,
  Typography,
  IconButton,
  Tooltip,
  Paper,
  alpha,
  type Theme,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import CloseIcon from '@mui/icons-material/Close';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import MapIcon from '@mui/icons-material/Map';
import type { QuestionGroup, Question } from '@/types/models';
import type { TFunction } from 'i18next';
import type { SelectChangeEvent } from '@mui/material';
import type { SxProps } from '@mui/material/styles';
import pc from '@/utils/muiColors';
import { getQuestionShortTitle } from '@/utils/transformers';

type Props = {
  openDialog: boolean;
  dialogMode: 'add' | 'edit';
  currentGroup: QuestionGroup | null;
  groupName: string;
  groupDescription: string;
  selectedQuestions: number[];
  openCreateQuestion: boolean;
  newQuestionContent: string;
  allQuestions: Question[];
  inputSx: SxProps<Theme>;
  isGroupMutating: boolean;
  isQuestionMutating: boolean;
  isTestingGroup?: boolean;
  t: TFunction;
  theme: Theme;
  onCloseDialog: () => void;
  onGroupNameChange: (value: string) => void;
  onGroupDescriptionChange: (value: string) => void;
  onSelectedQuestionsChange: (value: number[]) => void;
  onOpenCreateQuestion: () => void;
  onCloseCreateQuestion: () => void;
  onNewQuestionContentChange: (value: string) => void;
  onSaveGroup: () => void;
  onCreateQuestion: () => void;
  onTestGroup?: () => void;
};

const QuestionGroupsDialogs = ({
  openDialog,
  dialogMode,
  currentGroup,
  groupName,
  groupDescription,
  selectedQuestions,
  openCreateQuestion,
  newQuestionContent,
  allQuestions,
  inputSx,
  isGroupMutating,
  isQuestionMutating,
  isTestingGroup,
  t,
  theme,
  onCloseDialog,
  onGroupNameChange,
  onGroupDescriptionChange,
  onSelectedQuestionsChange,
  onOpenCreateQuestion,
  onCloseCreateQuestion,
  onNewQuestionContentChange,
  onSaveGroup,
  onCreateQuestion,
  onTestGroup,
}: Props) => {
  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const next = [...selectedQuestions];
    const temp = next[index - 1];
    next[index - 1] = next[index];
    next[index] = temp;
    onSelectedQuestionsChange(next);
  };

  const handleMoveDown = (index: number) => {
    if (index === selectedQuestions.length - 1) return;
    const next = [...selectedQuestions];
    const temp = next[index + 1];
    next[index + 1] = next[index];
    next[index] = temp;
    onSelectedQuestionsChange(next);
  };

  const handleRemoveQuestion = (id: number) => {
    onSelectedQuestionsChange(selectedQuestions.filter((qId) => qId !== id));
  };

  const handleAutoArrangeRoadmap = () => {
    const stagePriority: Record<string, number> = {
      culture_fit: 1,
      general: 2,
      soft_skills: 3,
      technical: 4,
      behavioral: 5,
      situational: 6,
      problem_solving: 7,
    };
    const sorted = [...selectedQuestions].sort((aId, bId) => {
      const qA = allQuestions.find((q) => q.id === aId);
      const qB = allQuestions.find((q) => q.id === bId);
      const pA = stagePriority[(qA?.category || '').toLowerCase()] || 99;
      const pB = stagePriority[(qB?.category || '').toLowerCase()] || 99;
      return pA - pB;
    });
    onSelectedQuestionsChange(sorted);
  };

  const stageStats = React.useMemo(() => {
    let culture = 0;
    let technical = 0;
    let behavioral = 0;
    let situational = 0;
    selectedQuestions.forEach((id) => {
      const q = allQuestions.find((item) => item.id === id);
      const cat = (q?.category || '').toLowerCase();
      if (['culture_fit', 'general', 'soft_skills'].includes(cat)) culture++;
      else if (['technical'].includes(cat)) technical++;
      else if (['behavioral'].includes(cat)) behavioral++;
      else situational++;
    });
    return { culture, technical, behavioral, situational };
  }, [selectedQuestions, allQuestions]);

  const getCategoryInfo = (category?: string) => {
    const cat = (category || '').toLowerCase();
    if (['culture_fit', 'general', 'soft_skills'].includes(cat)) {
      return { label: 'Văn hóa & Mục tiêu', color: '#0284c7', bg: '#e0f2fe' };
    }
    if (cat === 'technical') {
      return { label: 'Kỹ năng chuyên môn', color: '#4f46e5', bg: '#e0e7ff' };
    }
    if (cat === 'behavioral') {
      return { label: 'Hành vi', color: '#d97706', bg: '#fef3c7' };
    }
    return { label: 'Giải quyết vấn đề', color: '#059669', bg: '#d1fae5' };
  };

  return (
    <>
      <Dialog
        open={openDialog}
        onClose={onCloseDialog}
        fullWidth
        maxWidth={selectedQuestions.length > 0 ? "md" : "sm"}
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
              onChange={(e) => onGroupNameChange(e.target.value)}
              required
              sx={inputSx}
            />
            <TextField
              label={t('employer:questionGroupsCard.label.description')}
              fullWidth
              multiline
              rows={2}
              variant="outlined"
              value={groupDescription}
              onChange={(e) => onGroupDescriptionChange(e.target.value)}
              sx={inputSx}
            />

            {/* Select Questions Dropdown */}
            <FormControl fullWidth variant="outlined" sx={inputSx}>
              <InputLabel sx={{ px: 0.5 }}>{t('employer:questionGroupsCard.label.selectquestions')}</InputLabel>
              <Select
                multiple
                value={selectedQuestions}
                onChange={(e: SelectChangeEvent<number[]>) => onSelectedQuestionsChange(e.target.value as number[])}
                input={<OutlinedInput label={t('employer:questionGroupsCard.label.selectquestions')} />}
                renderValue={(selected) => (
                  <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                    Đã chọn {(selected as number[]).length} câu hỏi cho bộ câu hỏi
                  </Typography>
                )}
                MenuProps={{ slotProps: { paper: { sx: { borderRadius: 2, mt: 1, maxHeight: 300, boxShadow: (muiTheme: Theme) => muiTheme.customShadows?.z8 } } } }}
              >
                {allQuestions.map((q) => {
                  const catInfo = getCategoryInfo(q.category);
                  return (
                    <MenuItem key={q.id} value={q.id} sx={{ py: 1, display: 'flex', gap: 1.5, alignItems: 'center' }}>
                      <Chip
                        label={catInfo.label}
                        size="small"
                        sx={{
                          height: 22,
                          fontSize: '0.6875rem',
                          fontWeight: 700,
                          color: catInfo.color,
                          bgcolor: catInfo.bg,
                          flexShrink: 0,
                        }}
                      />
                      <Typography variant="body2" sx={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 500 }}>
                        {q.text}
                      </Typography>
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>

            {/* Structured Interview Roadmap Preview in Question Group */}
            {selectedQuestions.length > 0 && (
              <Paper
                variant="outlined"
                sx={{
                  p: 2.5,
                  borderRadius: 2.5,
                  bgcolor: '#f8fafc',
                  borderColor: '#e2e8f0',
                }}
              >
                {/* Roadmap Header & Quick Actions */}
                <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between" spacing={1.5} sx={{ mb: 2 }}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: '8px', bgcolor: '#eff6ff', color: '#2563eb' }}>
                      <MapIcon sx={{ fontSize: 18 }} />
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a' }}>
                        Lộ trình phỏng vấn của bộ câu hỏi
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748b' }}>
                        Thứ tự các câu hỏi sẽ xuất hiện trong phòng phỏng vấn AI
                      </Typography>
                    </Box>
                  </Stack>

                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<AutoFixHighIcon sx={{ fontSize: 16 }} />}
                    onClick={handleAutoArrangeRoadmap}
                    sx={{
                      textTransform: 'none',
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      borderColor: '#cbd5e1',
                      color: '#334155',
                      bgcolor: '#ffffff',
                      '&:hover': { bgcolor: '#f1f5f9', borderColor: '#94a3b8' },
                    }}
                  >
                    Sắp xếp theo lộ trình chuẩn
                  </Button>
                </Stack>

                {/* Stage Breakdown Summary Chips */}
                <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mb: 2 }}>
                  {stageStats.culture > 0 && (
                    <Chip
                      size="small"
                      label={`Văn hóa: ${stageStats.culture}`}
                      sx={{ bgcolor: '#e0f2fe', color: '#0284c7', fontWeight: 700, fontSize: '0.75rem' }}
                    />
                  )}
                  {stageStats.technical > 0 && (
                    <Chip
                      size="small"
                      label={`Chuyên môn: ${stageStats.technical}`}
                      sx={{ bgcolor: '#e0e7ff', color: '#4f46e5', fontWeight: 700, fontSize: '0.75rem' }}
                    />
                  )}
                  {stageStats.behavioral > 0 && (
                    <Chip
                      size="small"
                      label={`Hành vi: ${stageStats.behavioral}`}
                      sx={{ bgcolor: '#fef3c7', color: '#d97706', fontWeight: 700, fontSize: '0.75rem' }}
                    />
                  )}
                  {stageStats.situational > 0 && (
                    <Chip
                      size="small"
                      label={`Tình huống: ${stageStats.situational}`}
                      sx={{ bgcolor: '#d1fae5', color: '#059669', fontWeight: 700, fontSize: '0.75rem' }}
                    />
                  )}
                </Stack>

                {/* Ordered Question List */}
                <Stack spacing={1} sx={{ maxHeight: 280, overflowY: 'auto', pr: 0.5 }}>
                  {selectedQuestions.map((qId, idx) => {
                    const q = allQuestions.find((item) => item.id === qId);
                    const catInfo = getCategoryInfo(q?.category);
                    const shortTitle = getQuestionShortTitle(q);

                    return (
                      <Paper
                        key={qId}
                        elevation={0}
                        sx={{
                          p: 1.5,
                          borderRadius: 2,
                          bgcolor: '#ffffff',
                          border: '1px solid #e2e8f0',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1.5,
                        }}
                      >
                        {/* Step Number Circle */}
                        <Box
                          sx={{
                            width: 26,
                            height: 26,
                            borderRadius: '50%',
                            bgcolor: '#f1f5f9',
                            color: '#334155',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.75rem',
                            fontWeight: 800,
                            flexShrink: 0,
                          }}
                        >
                          {idx + 1}
                        </Box>

                        {/* Category Chip */}
                        <Chip
                          label={catInfo.label}
                          size="small"
                          sx={{
                            height: 22,
                            fontSize: '0.6875rem',
                            fontWeight: 700,
                            color: catInfo.color,
                            bgcolor: catInfo.bg,
                            flexShrink: 0,
                          }}
                        />

                        {/* Title & Preview */}
                        <Box sx={{ minWidth: 0, flex: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a', lineHeight: 1.3 }} noWrap>
                            {shortTitle || `Câu hỏi #${qId}`}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#64748b' }} noWrap display="block">
                            {q?.text || ''}
                          </Typography>
                        </Box>

                        {/* Order Controls */}
                        <Stack direction="row" spacing={0.5} alignItems="center" sx={{ flexShrink: 0 }}>
                          <Tooltip title="Di chuyển lên">
                            <span>
                              <IconButton
                                size="small"
                                disabled={idx === 0}
                                onClick={() => handleMoveUp(idx)}
                                sx={{ p: 0.5 }}
                              >
                                <ArrowUpwardIcon sx={{ fontSize: 16 }} />
                              </IconButton>
                            </span>
                          </Tooltip>

                          <Tooltip title="Di chuyển xuống">
                            <span>
                              <IconButton
                                size="small"
                                disabled={idx === selectedQuestions.length - 1}
                                onClick={() => handleMoveDown(idx)}
                                sx={{ p: 0.5 }}
                              >
                                <ArrowDownwardIcon sx={{ fontSize: 16 }} />
                              </IconButton>
                            </span>
                          </Tooltip>

                          <Tooltip title="Xóa khỏi bộ câu hỏi">
                            <IconButton
                              size="small"
                              onClick={() => handleRemoveQuestion(qId)}
                              sx={{ p: 0.5, color: '#94a3b8', '&:hover': { color: '#ef4444' } }}
                            >
                              <CloseIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </Paper>
                    );
                  })}
                </Stack>
              </Paper>
            )}

            <Button
              variant="text"
              startIcon={<AddIcon />}
              onClick={onOpenCreateQuestion}
              color="primary"
              sx={{ alignSelf: 'flex-start', textTransform: 'none', fontWeight: 800, px: 2, py: 1, bgcolor: pc.primary( 0.05), '&:hover': { bgcolor: pc.primary( 0.1) } }}
            >
              {t('employer:questionGroupsCard.actions.createNewQuestion')}
            </Button>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 4, pt: 3, gap: 2 }}>
          {onTestGroup && selectedQuestions.length > 0 && (
            <Button
              onClick={onTestGroup}
              variant="outlined"
              color="info"
              disabled={isTestingGroup}
              startIcon={<PlayCircleOutlineIcon />}
              sx={{ fontWeight: 800, textTransform: 'none', px: 2.5, mr: 'auto' }}
            >
              {t('employer:questionGroupsCard.actions.testInDialog')}
            </Button>
          )}
          <Button onClick={onCloseDialog} color="inherit" sx={{ fontWeight: 700, textTransform: 'none', px: 3 }}>
            {t('common:actions.cancel')}
          </Button>
          <Button
            onClick={onSaveGroup}
            variant="contained"
            disabled={isGroupMutating || !groupName.trim()}
            sx={{ px: 4, py: 1.25, fontWeight: 900, boxShadow: 'none', textTransform: 'none' }}
          >
            {t('common:actions.save')}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openCreateQuestion}
        onClose={onCloseCreateQuestion}
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
              onChange={(e) => onNewQuestionContentChange(e.target.value)}
              required
              sx={inputSx}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 4, pt: 3, gap: 2 }}>
          <Button onClick={onCloseCreateQuestion} color="inherit" sx={{ fontWeight: 700, textTransform: 'none', px: 3 }}>
            {t('common:actions.cancel')}
          </Button>
          <Button
            onClick={onCreateQuestion}
            variant="contained"
            disabled={isQuestionMutating || !newQuestionContent.trim()}
            sx={{ px: 4, py: 1.25, fontWeight: 900, boxShadow: 'none', textTransform: 'none' }}
          >
            {t('common:actions.save')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default QuestionGroupsDialogs;
