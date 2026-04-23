import React from 'react';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  InputAdornment,
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
import { Grid2 as Grid } from '@mui/material';
import { Controller, type Control, type FieldErrors } from 'react-hook-form';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import CategoryIcon from '@mui/icons-material/Category';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import QuizIcon from '@mui/icons-material/Quiz';
import SendIcon from '@mui/icons-material/Send';
import DateTimePickerCustom from '../../../../components/Common/Controls/DateTimePickerCustom';
import type { FormValues } from './types';
import type { Question, QuestionGroup } from '../../../../types/models';
import type { TFunction } from 'i18next';

type Props = {
  t: TFunction;
  theme: Theme;
  control: Control<FormValues>;
  errors: FieldErrors<FormValues>;
  inputSx: Record<string, unknown>;
  questionGroups: QuestionGroup[];
  questions: Question[];
  selectedJobPostId: string | number;
  selectedQuestionsCount: number;
  isInterviewMutating: boolean;
  sessionId?: string | number;
  onCancel: () => void;
  onOpenAddQuestion: () => void;
  onOpenEditQuestion: () => void;
};

const InterviewCreateCardQuestionSection = ({
  t,
  theme,
  control,
  errors,
  inputSx,
  questionGroups,
  questions,
  selectedJobPostId,
  selectedQuestionsCount,
  isInterviewMutating,
  sessionId,
  onCancel,
  onOpenAddQuestion,
  onOpenEditQuestion,
}: Props) => {
  return (
    <>
      <Grid size={{ xs: 12, md: 6 }}>
        <DateTimePickerCustom
          name="scheduled_at"
          control={control}
          title={t('interview:interviewCreateCard.title.scheduledtime')}
          showRequired
          minDateTime={new Date().toISOString()}
        />
      </Grid>

      <Grid size={12}>
        <Divider sx={{ my: 2, borderStyle: 'dashed' }}>
          <Chip
            label={t('interview:interviewCreateCard.label.questions').toUpperCase()}
            size="small"
            sx={{ fontWeight: 900, bgcolor: 'background.neutral', color: 'text.secondary', letterSpacing: 1.5, px: 2 }}
          />
        </Divider>
      </Grid>

      <Grid size={12}>
        <Controller
          name="selected_group"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              select
              fullWidth
              label={t('interview:interviewCreateCard.label.selectquestiongroupoptional')}
              variant="outlined"
              helperText={t('interview:interviewCreateCard.helperText.selectaquestiongrouptoautomaticallyfillthequestions below')}
              sx={inputSx}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <CategoryIcon sx={{ fontSize: 20, color: 'info.main' }} />
                    </InputAdornment>
                  ),
                },
                inputLabel: { sx: { fontWeight: 600 } },
                formHelperText: { sx: { fontWeight: 700, fontStyle: 'italic', color: 'info.main', opacity: 0.8 } },
              }}
            >
              <MenuItem value="" sx={{ fontWeight: 600 }}>
                <em>{t('common:none')}</em>
              </MenuItem>
              {questionGroups.map((group) => (
                <MenuItem key={group.id} value={group.id} sx={{ fontWeight: 600 }}>
                  {group.name}
                </MenuItem>
              ))}
            </TextField>
          )}
        />
      </Grid>

      <Grid size={12}>
        <FormControl fullWidth error={!!errors.selected_questions} sx={inputSx}>
          <InputLabel sx={{ fontWeight: 600 }}>{t('interview:interviewCreateCard.label.selectinterviewquestions')}</InputLabel>
          <Controller
            name="selected_questions"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                multiple
                input={<OutlinedInput label={t('interview:interviewCreateCard.label.selectinterviewquestions')} />}
                renderValue={(selected: number[]) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {selected.map((val) => {
                      const q = questions.find((item) => item.id === val);
                      return (
                        <Chip
                          key={val}
                          label={(q?.text ?? `Q#${val}`).substring(0, 50)}
                          size="small"
                          sx={{
                            fontWeight: 900,
                            borderRadius: 1.5,
                            bgcolor: alpha(theme.palette.primary.main, 0.08),
                            color: 'primary.main',
                            border: '1px solid',
                            borderColor: alpha(theme.palette.primary.main, 0.1),
                            fontSize: '0.75rem',
                          }}
                        />
                      );
                    })}
                  </Box>
                )}
                startAdornment={
                  <InputAdornment position="start">
                    <QuizIcon sx={{ fontSize: 20, color: 'warning.main', ml: 1 }} />
                  </InputAdornment>
                }
              >
                <MenuItem disabled value="">
                  <em>{t('interview:interviewCreateCard.label.selectquestions')}</em>
                </MenuItem>
                {questions.map((question) => (
                  <MenuItem
                    key={question.id}
                    value={question.id}
                    sx={{ py: 1.5, borderBottom: '1px solid', borderColor: 'divider', '&:last-child': { borderBottom: 0 } }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                      {question.text}
                    </Typography>
                  </MenuItem>
                ))}
              </Select>
            )}
          />
          {errors.selected_questions && (
            <Typography variant="caption" color="error" sx={{ mt: 1, fontWeight: 800 }}>
              {errors.selected_questions.message}
            </Typography>
          )}
        </FormControl>
      </Grid>

      <Grid size={12}>
        <Stack direction="row" spacing={2.5} justifyContent="flex-end">
          <Button
            variant="outlined"
            size="medium"
            startIcon={<AddCircleOutlineIcon />}
            onClick={onOpenAddQuestion}
            sx={{ textTransform: 'none', borderRadius: 2.5, fontWeight: 900, borderStyle: 'dashed', px: 3 }}
          >
            {t('interview:employer.questions.add')}
          </Button>
          <Button
            variant="outlined"
            size="medium"
            color="secondary"
            startIcon={<EditIcon />}
            disabled={selectedQuestionsCount !== 1}
            onClick={onOpenEditQuestion}
            sx={{ textTransform: 'none', borderRadius: 2.5, fontWeight: 900, borderStyle: 'dashed', px: 3 }}
          >
            {t('interview:employer.questions.edit')}
          </Button>
        </Stack>
      </Grid>

      <Grid size={12}>
        <Divider sx={{ mt: 4, mb: 2, borderStyle: 'dashed' }} />
        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button
            onClick={onCancel}
            variant="text"
            color="inherit"
            startIcon={<CloseIcon />}
            sx={{ fontWeight: 900, px: 4, py: 1.5, textTransform: 'none', borderRadius: 3 }}
          >
            {t('common:cancel')}
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={isInterviewMutating}
            startIcon={!isInterviewMutating && <SendIcon />}
            sx={{
              borderRadius: 3,
              px: 8,
              py: 1.5,
              fontWeight: 900,
              boxShadow: (muiTheme) => muiTheme.customShadows?.primary,
              textTransform: 'none',
              fontSize: '1.05rem',
            }}
          >
            {isInterviewMutating ? <CircularProgress size={24} color="inherit" /> : sessionId ? t('common:save') : t('interview:interviewCreateCard.scheduleNow')}
          </Button>
        </Stack>
      </Grid>
    </>
  );
};

export default InterviewCreateCardQuestionSection;
