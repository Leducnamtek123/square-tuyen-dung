import React from 'react';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  InputAdornment,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import EmojiEmotionsOutlinedIcon from '@mui/icons-material/EmojiEmotionsOutlined';
import MonetizationOnOutlinedIcon from '@mui/icons-material/MonetizationOnOutlined';
import RateReviewOutlinedIcon from '@mui/icons-material/RateReviewOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import SendIcon from '@mui/icons-material/Send';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import HourglassEmptyOutlinedIcon from '@mui/icons-material/HourglassEmptyOutlined';
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
    borderRadius: 2.5,
    backgroundColor: '#FFFFFF',
    '&:hover': { bgcolor: '#F8FAFC' },
    '& fieldset': { borderColor: 'divider' },
    '&.Mui-focused fieldset': { borderColor: 'primary.main', borderWidth: '1.5px' },
  },
  '& .MuiInputLabel-root': { fontWeight: 700, fontSize: '0.875rem' },
} as const;

const QUICK_SCORES = [6, 7, 8, 9, 10];

const InterviewHrEvaluationForm: React.FC<InterviewHrEvaluationFormProps> = ({
  evalForm,
  onChange,
  onSubmit,
  disabled,
  submitting,
  t,
}) => {
  const theme = useTheme();

  const handleQuickScore = (fieldName: 'attitude_score' | 'professional_score', score: number) => {
    if (disabled || submitting) return;
    const syntheticEvent = {
      target: {
        name: fieldName,
        value: String(score),
      },
    } as React.ChangeEvent<HTMLInputElement>;
    onChange(syntheticEvent);
  };

  const handleDecisionClick = (resultValue: 'passed' | 'pending' | 'failed') => {
    if (disabled || submitting) return;
    const syntheticEvent = {
      target: {
        name: 'result',
        value: resultValue,
      },
    } as React.ChangeEvent<HTMLInputElement>;
    onChange(syntheticEvent);
  };

  return (
    <Paper elevation={0} sx={interviewDetailCardSx}>
      <InterviewDetailSectionHeader
        icon={<RateReviewOutlinedIcon />}
        title={t('interviewDetail.actions.hrEvaluation')}
        iconColor="primary"
      />

      <Stack spacing={2.5}>
        {/* Quick Decision Segmented Cards */}
        <Box>
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              fontWeight: 800,
              mb: 1,
              color: 'text.secondary',
              textTransform: 'uppercase',
              fontSize: '0.6875rem',
              letterSpacing: '0.04em',
            }}
          >
            {t('interviewDetail.actions.resultLabel')}
          </Typography>
          <Stack direction="row" spacing={1}>
            {/* Passed */}
            <Box
              onClick={() => handleDecisionClick('passed')}
              sx={{
                flex: 1,
                py: 1.25,
                px: 1,
                borderRadius: 2,
                textAlign: 'center',
                cursor: disabled || submitting ? 'not-allowed' : 'pointer',
                opacity: disabled || submitting ? 0.6 : 1,
                border: '1.5px solid',
                borderColor: evalForm?.result === 'passed' ? '#16a34a' : 'divider',
                bgcolor: evalForm?.result === 'passed' ? 'rgba(34, 197, 94, 0.08)' : '#FFFFFF',
                color: evalForm?.result === 'passed' ? '#15803d' : 'text.secondary',
                transition: 'all 0.15s ease-in-out',
                '&:hover': {
                  borderColor: '#16a34a',
                  bgcolor: 'rgba(34, 197, 94, 0.04)',
                },
              }}
            >
              <CheckCircleOutlineIcon sx={{ fontSize: 18, mb: 0.25, display: 'block', mx: 'auto' }} />
              <Typography variant="caption" sx={{ fontWeight: 800, fontSize: '0.75rem', display: 'block' }}>
                {t('interviewDetail.actions.passed')}
              </Typography>
            </Box>

            {/* Pending */}
            <Box
              onClick={() => handleDecisionClick('pending')}
              sx={{
                flex: 1,
                py: 1.25,
                px: 1,
                borderRadius: 2,
                textAlign: 'center',
                cursor: disabled || submitting ? 'not-allowed' : 'pointer',
                opacity: disabled || submitting ? 0.6 : 1,
                border: '1.5px solid',
                borderColor: evalForm?.result === 'pending' ? '#d97706' : 'divider',
                bgcolor: evalForm?.result === 'pending' ? 'rgba(245, 158, 11, 0.08)' : '#FFFFFF',
                color: evalForm?.result === 'pending' ? '#b45309' : 'text.secondary',
                transition: 'all 0.15s ease-in-out',
                '&:hover': {
                  borderColor: '#d97706',
                  bgcolor: 'rgba(245, 158, 11, 0.04)',
                },
              }}
            >
              <HourglassEmptyOutlinedIcon sx={{ fontSize: 18, mb: 0.25, display: 'block', mx: 'auto' }} />
              <Typography variant="caption" sx={{ fontWeight: 800, fontSize: '0.75rem', display: 'block' }}>
                {t('interviewDetail.actions.pending')}
              </Typography>
            </Box>

            {/* Failed */}
            <Box
              onClick={() => handleDecisionClick('failed')}
              sx={{
                flex: 1,
                py: 1.25,
                px: 1,
                borderRadius: 2,
                textAlign: 'center',
                cursor: disabled || submitting ? 'not-allowed' : 'pointer',
                opacity: disabled || submitting ? 0.6 : 1,
                border: '1.5px solid',
                borderColor: evalForm?.result === 'failed' ? '#dc2626' : 'divider',
                bgcolor: evalForm?.result === 'failed' ? 'rgba(239, 68, 68, 0.08)' : '#FFFFFF',
                color: evalForm?.result === 'failed' ? '#b91c1c' : 'text.secondary',
                transition: 'all 0.15s ease-in-out',
                '&:hover': {
                  borderColor: '#dc2626',
                  bgcolor: 'rgba(239, 68, 68, 0.04)',
                },
              }}
            >
              <CancelOutlinedIcon sx={{ fontSize: 18, mb: 0.25, display: 'block', mx: 'auto' }} />
              <Typography variant="caption" sx={{ fontWeight: 800, fontSize: '0.75rem', display: 'block' }}>
                {t('interviewDetail.actions.failed')}
              </Typography>
            </Box>
          </Stack>
        </Box>

        {/* Hidden Fallback Select for Form Integrity & Accessibility */}
        <Box sx={{ display: 'none' }}>
          <TextField
            select
            label={t('interviewDetail.actions.resultLabel')}
            name="result"
            fullWidth
            size="small"
            value={evalForm?.result || 'pending'}
            onChange={onChange}
            sx={inputSx}
          >
            <MenuItem value="pending">{t('interviewDetail.actions.pending')}</MenuItem>
            <MenuItem value="passed">{t('interviewDetail.actions.passed')}</MenuItem>
            <MenuItem value="failed">{t('interviewDetail.actions.failed')}</MenuItem>
          </TextField>
        </Box>

        {/* Scores: Attitude & Professional */}
        <Stack spacing={2}>
          {/* Attitude Score */}
          <Box>
            <TextField
              label={t('interviewDetail.actions.attitudeScore')}
              name="attitude_score"
              type="number"
              fullWidth
              size="small"
              value={evalForm?.attitude_score ?? ''}
              onChange={onChange}
              disabled={disabled || submitting}
              sx={inputSx}
              slotProps={{
                htmlInput: { min: 1, max: 10, step: 0.1 },
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmojiEmotionsOutlinedIcon sx={{ fontSize: 18, color: '#f59e0b' }} />
                    </InputAdornment>
                  ),
                },
              }}
            />
            <Stack direction="row" spacing={0.6} sx={{ mt: 0.75, alignItems: 'center' }}>
              <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.6875rem', fontWeight: 700, mr: 0.5 }}>
                Chọn nhanh:
              </Typography>
              {QUICK_SCORES.map((score) => {
                const isSelected = Number(evalForm?.attitude_score) === score;
                return (
                  <Chip
                    key={`att-${score}`}
                    label={score}
                    size="small"
                    onClick={() => handleQuickScore('attitude_score', score)}
                    sx={{
                      height: 22,
                      width: 28,
                      fontSize: '0.6875rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      bgcolor: isSelected ? 'primary.main' : '#F1F5F9',
                      color: isSelected ? '#FFFFFF' : 'text.secondary',
                      border: '1px solid',
                      borderColor: isSelected ? 'primary.main' : 'divider',
                      '&:hover': {
                        bgcolor: isSelected ? 'primary.dark' : pc.primary(0.08),
                        color: isSelected ? '#FFFFFF' : 'primary.main',
                      },
                    }}
                  />
                );
              })}
            </Stack>
          </Box>

          {/* Professional Score */}
          <Box>
            <TextField
              label={t('interviewDetail.actions.professionalScore')}
              name="professional_score"
              type="number"
              fullWidth
              size="small"
              value={evalForm?.professional_score ?? ''}
              onChange={onChange}
              disabled={disabled || submitting}
              sx={inputSx}
              slotProps={{
                htmlInput: { min: 1, max: 10, step: 0.1 },
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SchoolOutlinedIcon sx={{ fontSize: 18, color: '#0284c7' }} />
                    </InputAdornment>
                  ),
                },
              }}
            />
            <Stack direction="row" spacing={0.6} sx={{ mt: 0.75, alignItems: 'center' }}>
              <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.6875rem', fontWeight: 700, mr: 0.5 }}>
                Chọn nhanh:
              </Typography>
              {QUICK_SCORES.map((score) => {
                const isSelected = Number(evalForm?.professional_score) === score;
                return (
                  <Chip
                    key={`pro-${score}`}
                    label={score}
                    size="small"
                    onClick={() => handleQuickScore('professional_score', score)}
                    sx={{
                      height: 22,
                      width: 28,
                      fontSize: '0.6875rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      bgcolor: isSelected ? '#0284c7' : '#F1F5F9',
                      color: isSelected ? '#FFFFFF' : 'text.secondary',
                      border: '1px solid',
                      borderColor: isSelected ? '#0284c7' : 'divider',
                      '&:hover': {
                        bgcolor: isSelected ? '#0369a1' : 'rgba(2, 132, 199, 0.08)',
                        color: isSelected ? '#FFFFFF' : '#0284c7',
                      },
                    }}
                  />
                );
              })}
            </Stack>
          </Box>
        </Stack>

        {/* Proposed Salary */}
        <TextField
          label={t('interviewDetail.actions.proposedSalary')}
          name="proposed_salary"
          type="number"
          fullWidth
          size="small"
          value={evalForm?.proposed_salary ?? ''}
          onChange={onChange}
          disabled={disabled || submitting}
          sx={{
            ...inputSx,
            '& .MuiOutlinedInput-root': {
              ...inputSx['& .MuiOutlinedInput-root'],
              fontWeight: 800,
              color: 'text.primary',
            },
          }}
          slotProps={{
            htmlInput: { min: 0, step: 100000 },
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <MonetizationOnOutlinedIcon sx={{ fontSize: 18, color: '#16a34a' }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.disabled', fontSize: '0.75rem' }}>
                    VND
                  </Typography>
                </InputAdornment>
              ),
            },
          }}
        />

        {/* Comments */}
        <TextField
          label={t('interviewDetail.actions.comments')}
          name="comments"
          multiline
          rows={3}
          fullWidth
          value={evalForm?.comments ?? ''}
          onChange={onChange}
          disabled={disabled || submitting}
          placeholder={t('interviewDetail.actions.commentsPlaceholder')}
          sx={inputSx}
          slotProps={{ input: { sx: { lineHeight: 1.6, fontSize: '0.875rem' } } }}
        />

        {/* Primary Action Button (InfoHR Blue Gradient & High Contrast) */}
        <Button
          variant="contained"
          fullWidth
          disabled={disabled || submitting}
          onClick={onSubmit}
          startIcon={!submitting && <SendIcon sx={{ fontSize: 17 }} />}
          sx={{
            py: 1.35,
            fontWeight: 800,
            fontSize: '0.9375rem',
            letterSpacing: '0.01em',
            textTransform: 'none',
            borderRadius: 2.5,
            bgcolor: 'primary.main',
            color: '#FFFFFF',
            boxShadow: '0 4px 14px 0 rgba(37, 99, 235, 0.35)',
            transition: 'all 0.15s ease-in-out',
            '&:hover': {
              bgcolor: 'primary.dark',
              boxShadow: '0 6px 20px 0 rgba(37, 99, 235, 0.45)',
            },
            '&.Mui-disabled': {
              bgcolor: 'action.disabledBackground',
              color: 'action.disabled',
              boxShadow: 'none',
            },
          }}
        >
          {submitting ? <CircularProgress size={22} color="inherit" /> : t('interviewDetail.actions.submitEvaluation')}
        </Button>
      </Stack>
    </Paper>
  );
};

export default InterviewHrEvaluationForm;

