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
  alpha,
  type Theme,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import type { QuestionGroup, Question } from '../../../../types/models';
import type { TFunction } from 'i18next';
import type { SelectChangeEvent } from '@mui/material';

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
  inputSx: Record<string, unknown>;
  isGroupMutating: boolean;
  isQuestionMutating: boolean;
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
}: Props) => {
  return (
    <>
      <Dialog
        open={openDialog}
        onClose={onCloseDialog}
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
              onChange={(e) => onGroupNameChange(e.target.value)}
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
              onChange={(e) => onGroupDescriptionChange(e.target.value)}
              sx={inputSx}
            />
            <FormControl fullWidth variant="outlined" sx={inputSx}>
              <InputLabel sx={{ px: 0.5 }}>{t('employer:questionGroupsCard.label.selectquestions')}</InputLabel>
              <Select
                multiple
                value={selectedQuestions}
                onChange={(e: SelectChangeEvent<number[]>) => onSelectedQuestionsChange(e.target.value as number[])}
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
                          sx={{
                            borderRadius: 1.5,
                            fontWeight: 700,
                            bgcolor: alpha(theme.palette.primary.main, 0.08),
                            color: 'primary.main',
                            border: '1px solid',
                            borderColor: alpha(theme.palette.primary.main, 0.1),
                          }}
                        />
                      );
                    })}
                  </Box>
                )}
                MenuProps={{ slotProps: { paper: { sx: { borderRadius: 2, mt: 1, maxHeight: 300, boxShadow: (muiTheme: Theme) => muiTheme.customShadows?.z8 } } } }}
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
              onClick={onOpenCreateQuestion}
              color="primary"
              sx={{ alignSelf: 'flex-start', borderRadius: 1.5, textTransform: 'none', fontWeight: 800, px: 2, py: 1, bgcolor: alpha(theme.palette.primary.main, 0.05), '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.1) } }}
            >
              {t('employer:questionGroupsCard.actions.createNewQuestion')}
            </Button>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 4, pt: 3, gap: 2 }}>
          <Button onClick={onCloseDialog} color="inherit" sx={{ fontWeight: 700, textTransform: 'none', borderRadius: 1.5, px: 3 }}>
            {t('common:actions.cancel')}
          </Button>
          <Button
            onClick={onSaveGroup}
            variant="contained"
            disabled={isGroupMutating || !groupName.trim()}
            sx={{ px: 4, py: 1.25, borderRadius: 1.5, fontWeight: 900, boxShadow: 'none', textTransform: 'none' }}
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
              autoFocus
              sx={inputSx}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 4, pt: 3, gap: 2 }}>
          <Button onClick={onCloseCreateQuestion} color="inherit" sx={{ fontWeight: 700, textTransform: 'none', borderRadius: 1.5, px: 3 }}>
            {t('common:actions.cancel')}
          </Button>
          <Button
            onClick={onCreateQuestion}
            variant="contained"
            disabled={isQuestionMutating || !newQuestionContent.trim()}
            sx={{ px: 4, py: 1.25, borderRadius: 1.5, fontWeight: 900, boxShadow: 'none', textTransform: 'none' }}
          >
            {t('common:actions.save')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default QuestionGroupsDialogs;
