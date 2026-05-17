import React from 'react';
import { Box, Button, Chip, Paper, TextField, Typography, InputAdornment, Divider, MenuItem, alpha, type Theme } from '@mui/material';
import { Grid2 as Grid } from '@mui/material';
import { Controller, type Control, type FieldErrors, type UseFormHandleSubmit } from 'react-hook-form';
import EventIcon from '@mui/icons-material/Event';
import WorkIcon from '@mui/icons-material/Work';
import PersonIcon from '@mui/icons-material/Person';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import type { FormValues } from './types';
import type { JobPostActivity, Question, QuestionGroup, VoiceProfile } from '../../../../types/models';
import type { TFunction } from 'i18next';
import InterviewCreateCardQuestionSection from './InterviewCreateCardQuestionSection';

type Props = {
  title?: string;
  sessionId?: string | number;
  t: TFunction;
  theme: Theme;
  inputSx: Record<string, unknown>;
  control: Control<FormValues>;
  errors: FieldErrors<FormValues>;
  handleSubmit: UseFormHandleSubmit<FormValues>;
  onSubmit: (data: FormValues) => Promise<void>;
  jobs: Array<{ id: string | number; jobName?: string }>;
  questions: Question[];
  questionGroups: QuestionGroup[];
  candidates: JobPostActivity[];
  voiceProfiles: VoiceProfile[];
  isLoadingJobs: boolean;
  isLoadingCandidates: boolean;
  isLoadingVoiceProfiles: boolean;
  isInterviewMutating: boolean;
  selectedJobPostId: string | number;
  selectedQuestionsCount: number;
  onCancel: () => void;
  onJobPostChange: (value: string | number) => void;
  onQuestionGroupChange: (value: string | number) => void;
  onOpenAddQuestion: () => void;
  onOpenEditQuestion: () => void;
};

const InterviewCreateCardForm = ({
  title,
  sessionId,
  t,
  theme,
  inputSx,
  control,
  errors,
  handleSubmit,
  onSubmit,
  jobs,
  questionGroups,
  questions,
  candidates,
  voiceProfiles,
  isLoadingJobs,
  isLoadingCandidates,
  isLoadingVoiceProfiles,
  isInterviewMutating,
  selectedJobPostId,
  selectedQuestionsCount,
  onCancel,
  onJobPostChange,
  onQuestionGroupChange,
  onOpenAddQuestion,
  onOpenEditQuestion,
}: Props) => {
  const getCandidateUserId = React.useCallback((candidate: JobPostActivity) => {
    return candidate.userId ?? candidate.userDict?.id ?? null;
  }, []);

  const getCandidateLabel = React.useCallback((candidate: JobPostActivity) => {
    const name = candidate.userDict?.fullName || candidate.fullName || '';
    const email = candidate.userDict?.email || candidate.email || '';
    return [name, email].filter(Boolean).join(' - ');
  }, []);

  const isDefaultVoiceProfile = React.useCallback((profile: VoiceProfile) => {
    return Boolean(profile.grants?.some((grant) => grant.isDefault ?? grant.is_default));
  }, []);

  const jobPostSlotProps = React.useMemo(() => ({
    input: {
      startAdornment: (
        <InputAdornment position="start">
          <WorkIcon sx={{ fontSize: 20, color: 'primary.main' }} />
        </InputAdornment>
      ),
    },
    inputLabel: { sx: { fontWeight: 600 } },
  }), []);

  const candidateSlotProps = React.useMemo(() => ({
    input: {
      startAdornment: (
        <InputAdornment position="start">
          <PersonIcon sx={{ fontSize: 20, color: 'secondary.main' }} />
        </InputAdornment>
      ),
    },
    inputLabel: { sx: { fontWeight: 600 } },
  }), []);

  const voiceProfileSlotProps = React.useMemo(() => ({
    input: {
      startAdornment: (
        <InputAdornment position="start">
          <RecordVoiceOverIcon sx={{ fontSize: 20, color: 'success.main' }} />
        </InputAdornment>
      ),
    },
    inputLabel: { sx: { fontWeight: 600 } },
  }), []);

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 3, md: 5 },
        borderRadius: 4,
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: (muiTheme) => muiTheme.customShadows?.z1,
        bgcolor: 'background.paper',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Box sx={{ p: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', spacing: 2.5, mb: 6 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              bgcolor: 'primary.extralight',
              color: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: (muiTheme) => alpha(muiTheme.palette.primary.main, 0.1),
              mr: 2.5,
            }}
          >
            <EventIcon sx={{ fontSize: 28 }} />
          </Box>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 900, color: 'text.primary', letterSpacing: '-1px' }}>
              {title || (sessionId ? t('interview:interviewCreateCard.title.editOnlineInterview') : t('interview:interviewCreateCard.title.scheduleOnlineInterview'))}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, mt: 0.5, opacity: 0.8 }}>
              {t('interview:interviewCreateCard.description.schedulingHelper')}
            </Typography>
          </Box>
        </Box>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={5}>
            <Grid size={12}>
              <Divider sx={{ mb: 1, borderStyle: 'dashed' }}>
                <Chip
                  label={t('interview:interviewCreateCard.label.basicInfo').toUpperCase()}
                  size="small"
                  sx={{ fontWeight: 900, bgcolor: 'background.neutral', color: 'text.secondary', letterSpacing: 1.5, px: 2 }}
                />
              </Divider>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="job_post"
                control={control}
                rules={{ required: t('interview:interviewCreateCard.validation.selectJobPost') }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    onChange={(e) => onJobPostChange(e.target.value)}
                    select
                    fullWidth
                    label={t('interview:interviewCreateCard.label.selectjobpost')}
                    error={!!errors.job_post}
                    helperText={errors.job_post?.message}
                    disabled={isLoadingJobs}
                    sx={inputSx}
                    slotProps={jobPostSlotProps}
                  >
                    {jobs.map((job) => (
                      <MenuItem key={job.id} value={job.id} sx={{ fontWeight: 600 }}>
                        {job.jobName}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="candidate"
                control={control}
                rules={{ required: t('interview:interviewCreateCard.validation.selectCandidate') }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    fullWidth
                    label={t('interview:interviewCreateCard.label.selectcandidate')}
                    disabled={!selectedJobPostId || isLoadingCandidates}
                    error={!!errors.candidate}
                    helperText={errors.candidate?.message}
                    sx={inputSx}
                    slotProps={candidateSlotProps}
                  >
                    {candidates.length === 0 && !isLoadingCandidates && selectedJobPostId ? (
                      <MenuItem disabled value="">
                        <em>{t('interview:interviewCreateCard.noCandidates')}</em>
                      </MenuItem>
                    ) : null}
                    {candidates.map((candidate) => {
                      const candidateUserId = getCandidateUserId(candidate);
                      if (candidateUserId == null) return null;

                      return (
                        <MenuItem key={candidateUserId} value={candidateUserId} sx={{ fontWeight: 600 }}>
                          {getCandidateLabel(candidate)}
                        </MenuItem>
                      );
                    })}
                  </TextField>
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="voice_profile"
                control={control}
                render={({ field }) => (
                  <TextField
                    name={field.name}
                    inputRef={field.ref}
                    onBlur={field.onBlur}
                    value={field.value || 'auto'}
                    onChange={(e) => field.onChange(e.target.value === 'auto' ? '' : e.target.value)}
                    select
                    fullWidth
                    label="AI voice"
                    disabled={isLoadingVoiceProfiles}
                    helperText="Leave auto to use the default voice granted for this job or company."
                    sx={inputSx}
                    slotProps={voiceProfileSlotProps}
                  >
                    <MenuItem value="auto" sx={{ fontWeight: 600 }}>
                      <em>Auto/default voice</em>
                    </MenuItem>
                    {voiceProfiles.map((profile) => (
                      <MenuItem key={profile.id} value={profile.id} sx={{ fontWeight: 600 }}>
                        {profile.name}{isDefaultVoiceProfile(profile) ? ' (default)' : ''}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>

            <InterviewCreateCardQuestionSection
              t={t}
              theme={theme}
              control={control}
              errors={errors}
              inputSx={inputSx}
              questionGroups={questionGroups}
              questions={questions}
              selectedJobPostId={selectedJobPostId}
              selectedQuestionsCount={selectedQuestionsCount}
              isInterviewMutating={isInterviewMutating}
              sessionId={sessionId}
              onCancel={onCancel}
              onOpenAddQuestion={onOpenAddQuestion}
              onOpenEditQuestion={onOpenEditQuestion}
              onQuestionGroupChange={onQuestionGroupChange}
            />
          </Grid>
        </form>
      </Box>
    </Paper>
  );
};

export default InterviewCreateCardForm;
