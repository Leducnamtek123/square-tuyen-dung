import React from 'react';
import {
  Button,
  CircularProgress,
  InputAdornment,
  MenuItem,
  Paper,
  Stack,
  TextField,
} from '@mui/material';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import RateReviewIcon from '@mui/icons-material/RateReview';
import SchoolIcon from '@mui/icons-material/School';
import SendIcon from '@mui/icons-material/Send';
import type { TFunction } from 'i18next';
import type { EvalFormType } from './types';
import pc from '@/utils/muiColors';
import InterviewDetailSectionHeader from './InterviewDetailSectionHeader';
import { interviewDetailCardSx } from './sectionStyles';

interface InterviewHrEvaluationFormProps {
  evalForm: EvalFormType;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSubmit: () => void;
  disabled: boolean;
  submitting: boolean;
  t: TFunction;
}

const inputSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 2,
    backgroundColor: pc.actionDisabled(0.025),
    '&:hover': { bgcolor: pc.actionDisabled(0.045) },
    '& fieldset': { borderColor: pc.divider(0.8) },
  },
  '& .MuiInputLabel-root': { fontWeight: 650 },
} as const;

const InterviewHrEvaluationForm: React.FC<InterviewHrEvaluationFormProps> = ({
  evalForm,
  onChange,
  onSubmit,
  disabled,
  submitting,
  t,
}) => (
  <Paper elevation={0} sx={interviewDetailCardSx}>
    <InterviewDetailSectionHeader
      icon={<RateReviewIcon />}
      title={t('interviewDetail.actions.hrEvaluation')}
      iconColor="secondary"
    />

    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
        <TextField
          label={t('interviewDetail.actions.attitudeScore')}
          name="attitude_score"
          type="number"
          fullWidth
          size="small"
          value={evalForm.attitude_score}
          onChange={onChange}
          sx={inputSx}
          slotProps={{
            htmlInput: { min: 0, max: 10, step: 0.1 },
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <EmojiEmotionsIcon sx={{ fontSize: 20, color: 'warning.main' }} />
                </InputAdornment>
              ),
            },
          }}
        />
        <TextField
          label={t('interviewDetail.actions.professionalScore')}
          name="professional_score"
          type="number"
          fullWidth
          size="small"
          value={evalForm.professional_score}
          onChange={onChange}
          sx={inputSx}
          slotProps={{
            htmlInput: { min: 0, max: 10, step: 0.1 },
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SchoolIcon sx={{ fontSize: 20, color: 'info.main' }} />
                </InputAdornment>
              ),
            },
          }}
        />
      </Stack>

      <TextField
        select
        label={t('interviewDetail.actions.resultLabel')}
        name="result"
        fullWidth
        size="small"
        value={evalForm.result}
        onChange={onChange}
        sx={inputSx}
      >
        <MenuItem value="pending" sx={{ fontWeight: 650 }}>{t('interviewDetail.actions.pending')}</MenuItem>
        <MenuItem value="passed" sx={{ fontWeight: 750, color: 'success.main', bgcolor: pc.success(0.04) }}>{t('interviewDetail.actions.passed')}</MenuItem>
        <MenuItem value="failed" sx={{ fontWeight: 750, color: 'error.main', bgcolor: pc.error(0.04) }}>{t('interviewDetail.actions.failed')}</MenuItem>
      </TextField>

      <TextField
        label={t('interviewDetail.actions.comments')}
        name="comments"
        multiline
        rows={3}
        fullWidth
        value={evalForm.comments}
        onChange={onChange}
        placeholder={t('interviewDetail.actions.commentsPlaceholder', { defaultValue: 'Add HR notes and final assessment...' })}
        sx={inputSx}
        slotProps={{ input: { sx: { lineHeight: 1.7 } } }}
      />

      <TextField
        label={t('interviewDetail.actions.proposedSalary')}
        name="proposed_salary"
        type="number"
        fullWidth
        size="small"
        value={evalForm.proposed_salary}
        onChange={onChange}
        sx={{
          ...inputSx,
          '& .MuiOutlinedInput-root': {
            ...inputSx['& .MuiOutlinedInput-root'],
            fontWeight: 800,
            color: 'success.main',
          },
        }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <MonetizationOnIcon sx={{ fontSize: 20, color: 'success.main' }} />
              </InputAdornment>
            ),
          },
        }}
      />

      <Button
        variant="contained"
        color="secondary"
        fullWidth
        disabled={disabled || submitting}
        onClick={onSubmit}
        startIcon={!submitting && <SendIcon />}
        sx={{
          
          py: 1.25,
          fontWeight: 850,
          boxShadow: 'none',
          textTransform: 'none',
          '&:hover': { boxShadow: 'none' },
        }}
      >
        {submitting ? <CircularProgress size={22} color="inherit" /> : t('interviewDetail.actions.submitEvaluation')}
      </Button>
    </Stack>
  </Paper>
);

export default InterviewHrEvaluationForm;
