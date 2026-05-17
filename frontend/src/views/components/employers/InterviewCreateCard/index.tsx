'use client';

import React, { useCallback, useMemo, useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Skeleton,
  TextField,
  Typography,
  alpha,
  type Theme,
  useTheme,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { useForm, useWatch } from 'react-hook-form';
import toastMessages from '../../../../utils/toastMessages';
import errorHandling from '../../../../utils/errorHandling';
import { useTranslation } from 'react-i18next';
import { ROUTES } from '../../../../configs/constants';
import {
  useAppliedResumes,
  useEmployerJobPosts,
  useEmployerQuestions,
  useEmployerVoiceProfiles,
  useInterviewDetail,
  useInterviewMutations,
  useQuestionGroups,
  useQuestionMutations,
} from '../hooks/useEmployerQueries';
import BackdropLoading from '../../../../components/Common/Loading/BackdropLoading';
import CloseIcon from '@mui/icons-material/Close';
import InterviewCreateCardForm from './InterviewCreateCardForm';
import type { FormValues } from './types';
import type { JobPostActivity, Question, QuestionGroup, VoiceProfile } from '../../../../types/models';
import pc from '@/utils/muiColors';

interface InterviewCreateCardProps {
  title?: string;
  sessionId?: string | number;
}

const extractId = (field: unknown): string | number => {
  if (field != null && typeof field === 'object' && 'id' in field) {
    return (field as { id: number }).id;
  }
  return (field as string | number) ?? '';
};

const getGrantJobId = (grant: NonNullable<VoiceProfile['grants']>[number]) => grant.jobPost ?? grant.job_post ?? null;

const isVoiceProfileAvailableForJob = (profile: VoiceProfile, jobPostId: string | number) => {
  const grants = profile.grants ?? [];
  if (!grants.length) return true;
  if (!jobPostId) {
    return grants.some((grant) => !getGrantJobId(grant));
  }
  return grants.some((grant) => {
    const grantJobId = getGrantJobId(grant);
    return !grantJobId || String(grantJobId) === String(jobPostId);
  });
};

type InterviewCreateCardInnerProps = {
  title?: string;
  sessionId?: string | number;
  jobPostIdQuery: string;
  candidateIdQuery: string;
  initialValues: FormValues;
  jobs: Array<{ id: string | number; jobName?: string }>;
  questions: Question[];
  questionGroups: QuestionGroup[];
  isLoadingJobs: boolean;
};

const InterviewCreateCardInner = ({
  title,
  sessionId,
  jobPostIdQuery,
  candidateIdQuery,
  initialValues,
  jobs,
  questions,
  questionGroups,
  isLoadingJobs,
}: InterviewCreateCardInnerProps) => {
  const { push, back } = useRouter();
  const { t } = useTranslation(['employer', 'interview', 'common']);
  const theme = useTheme();
  const { scheduleSession, updateSession, isMutating: isInterviewMutating } = useInterviewMutations();
  const { createQuestion, updateQuestion, isMutating: isQuestionMutating } = useQuestionMutations();
  const { data: voiceProfileData, isLoading: isLoadingVoiceProfiles } = useEmployerVoiceProfiles();

  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormValues>({
    defaultValues: initialValues,
  });

  const selectedJobPostId = watch('job_post');
  const selectedVoiceProfileId = useWatch({ control, name: 'voice_profile' });
  const { data: candidateData, isLoading: isLoadingCandidates } = useAppliedResumes(
    {
      jobPostId: selectedJobPostId as number,
      pageSize: 1000,
    },
    !!selectedJobPostId
  );

  const candidates = useMemo(() => candidateData?.results ?? [], [candidateData]) as JobPostActivity[];
  const voiceProfiles = useMemo(
    () => (voiceProfileData?.results ?? []).filter((profile) => isVoiceProfileAvailableForJob(profile, selectedJobPostId)),
    [selectedJobPostId, voiceProfileData],
  );
  const [isQuestionDialogOpen, setIsQuestionDialogOpen] = useState(false);
  const [questionDraft, setQuestionDraft] = useState('');
  const [editingQuestionId, setEditingQuestionId] = useState<number | null>(null);
  const [isLoadingSessionSave, setIsLoadingSessionSave] = useState(false);

  const handleJobPostChange = useCallback((value: string | number) => {
    setValue('job_post', value, { shouldValidate: true });
    setValue('candidate', '', { shouldValidate: false });
    setValue('voice_profile', '', { shouldValidate: false });
  }, [setValue]);

  React.useEffect(() => {
    if (!selectedVoiceProfileId) return;
    const stillAvailable = voiceProfiles.some((profile) => String(profile.id) === String(selectedVoiceProfileId));
    if (!stillAvailable) {
      setValue('voice_profile', '', { shouldValidate: false });
    }
  }, [selectedVoiceProfileId, setValue, voiceProfiles]);

    const handleQuestionGroupChange = useCallback((value: string | number) => {
    setValue('selected_group', value, { shouldValidate: true });

    if (!value) {
      setValue('selected_questions', [], { shouldValidate: true });
      return;
    }

    const group = questionGroups.find((item) => String(item.id) === String(value));
        setValue('selected_questions', group?.questions?.map((question: Question) => question.id) ?? [], { shouldValidate: true });
    }, [questionGroups, setValue]);

  const handleSaveQuestion = useCallback(async () => {
    const trimmed = questionDraft.trim();
    if (!trimmed) {
      toastMessages.error(t('interview:employer.questions.textRequired'));
      return;
    }

    try {
      if (editingQuestionId) {
        await updateQuestion({ id: editingQuestionId, data: { text: trimmed } });
        toastMessages.success(t('interview:employer.questions.updateSuccess'));
      } else {
        const newQuestion = await createQuestion({ text: trimmed });
        toastMessages.success(t('interview:employer.questions.createSuccess'));
        const current = watch('selected_questions') ?? [];
        setValue('selected_questions', [...current, newQuestion.id], { shouldValidate: true });
      }
      setIsQuestionDialogOpen(false);
    } catch {
      // Error handled by mutation hook
    }
  }, [questionDraft, editingQuestionId, updateQuestion, createQuestion, t, watch, setValue]);

  const onSubmit = useCallback(async (data: FormValues) => {
    try {
      setIsLoadingSessionSave(true);
      const selectedVoiceProfile = data.voice_profile && data.voice_profile !== 'auto'
        ? Number(data.voice_profile)
        : null;
      const payload = {
        job_post: Number(data.job_post),
        candidate: Number(data.candidate),
        scheduled_at: data.scheduled_at,
        voice_profile: selectedVoiceProfile,
        question_ids: data.selected_questions.filter(Boolean),
        type: 'mixed' as const,
      };

      if (sessionId) {
        await updateSession({ id: sessionId, data: payload });
        toastMessages.success(t('interview:interviewCreateCard.messages.updateSuccess'));
      } else {
        await scheduleSession(payload);
        toastMessages.success(t('interview:interviewCreateCard.messages.scheduleSuccess'));
      }
      push(`/${ROUTES.EMPLOYER.INTERVIEW_LIST}`);
    } catch (error) {
      errorHandling(error);
    } finally {
      setIsLoadingSessionSave(false);
    }
  }, [sessionId, updateSession, scheduleSession, t, push]);

  const handleOpenAddQuestion = useCallback(() => {
    setEditingQuestionId(null);
    setQuestionDraft('');
    setIsQuestionDialogOpen(true);
  }, []);

  const handleOpenEditQuestion = useCallback(() => {
    const id = watch('selected_questions')[0];
    const q = questions.find((item) => item.id === id);
    setEditingQuestionId(id);
    setQuestionDraft(q?.text ?? '');
    setIsQuestionDialogOpen(true);
  }, [watch, questions]);

  const inputSx = useMemo(() => ({
    '& .MuiOutlinedInput-root': {
      borderRadius: 2.5,
      backgroundColor: pc.actionDisabled( 0.03),
      '&:hover': { bgcolor: pc.actionDisabled( 0.06) },
      '& fieldset': { borderColor: pc.divider( 0.8) },
    },
  }), []);

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <InterviewCreateCardForm
        title={title}
        sessionId={sessionId}
        t={t}
        theme={theme}
        inputSx={inputSx}
        control={control}
        errors={errors}
        handleSubmit={handleSubmit}
        onSubmit={onSubmit}
        jobs={jobs}
        questions={questions}
        questionGroups={questionGroups}
        candidates={candidates}
        voiceProfiles={voiceProfiles}
        isLoadingJobs={isLoadingJobs}
        isLoadingCandidates={isLoadingCandidates}
        isLoadingVoiceProfiles={isLoadingVoiceProfiles}
        isInterviewMutating={isInterviewMutating || isLoadingSessionSave}
        selectedJobPostId={selectedJobPostId}
        selectedQuestionsCount={(watch('selected_questions') ?? []).length}
        onCancel={() => back()}
        onJobPostChange={handleJobPostChange}
        onQuestionGroupChange={handleQuestionGroupChange}
        onOpenAddQuestion={handleOpenAddQuestion}
        onOpenEditQuestion={handleOpenEditQuestion}
      />

      <Dialog
        open={isQuestionDialogOpen}
        onClose={() => setIsQuestionDialogOpen(false)}
        fullWidth
        maxWidth="sm"
        slotProps={{
          paper: {
            sx: {
              borderRadius: 4,
              p: 1,
              boxShadow: (paperTheme: Theme) => paperTheme.customShadows?.z24,
              border: '1px solid',
              borderColor: 'divider',
            },
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 900, fontSize: '1.5rem', letterSpacing: '-1px', pt: 3, px: 4 }}>
          {editingQuestionId ? t('interview:employer.questions.editTitle') : t('interview:employer.questions.createTitle')}
        </DialogTitle>
        <DialogContent sx={{ px: 4 }}>
          <Box sx={{ mt: 2 }}>
            <TextField
              value={questionDraft}
              onChange={(e) => setQuestionDraft(e.target.value)}
              label={t('interview:employer.questions.textLabel')}
              fullWidth
              multiline
              minRows={5}
              variant="outlined"
              slotProps={{
                input: { sx: { borderRadius: 3, fontWeight: 700, lineHeight: 1.8 } },
                inputLabel: { sx: { fontWeight: 600 } },
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 4, gap: 2 }}>
          <Button
            onClick={() => setIsQuestionDialogOpen(false)}
            color="inherit"
            sx={{ fontWeight: 900, textTransform: 'none', px: 3 }}
          >
            {t('common:cancel')}
          </Button>
          <Button
            onClick={handleSaveQuestion}
            variant="contained"
            color="primary"
            disabled={isQuestionMutating}
            sx={{
              
              px: 5,
              py: 1.25,
              fontWeight: 900,
              boxShadow: (paperTheme: Theme) => paperTheme.customShadows?.primary,
              textTransform: 'none',
            }}
          >
            {isQuestionMutating ? <CircularProgress size={24} color="inherit" /> : t('common:save')}
          </Button>
        </DialogActions>
      </Dialog>

      {(isInterviewMutating || isQuestionMutating) && <BackdropLoading />}
    </Box>
  );
};

const InterviewCreateCard: React.FC<InterviewCreateCardProps> = ({ title, sessionId }) => {
  const searchParams = useMemo(() => {
    if (typeof window === 'undefined') {
      return new URLSearchParams('');
    }
    return new URLSearchParams(window.location.search);
  }, []);
  const candidateIdQuery = searchParams.get('candidate') || '';
  const jobPostIdQuery = searchParams.get('jobPost') || '';

  const { t } = useTranslation(['employer', 'interview', 'common']);
  const { data: jobData, isLoading: isLoadingJobs } = useEmployerJobPosts({ pageSize: 1000 });
  const { data: questionData } = useEmployerQuestions({ pageSize: 1000 });
  const { data: groupData } = useQuestionGroups({ pageSize: 1000 });
  const { data: sessionDetail, isLoading: isLoadingSession } = useInterviewDetail(sessionId as string | number);

  const jobs = useMemo(() => jobData?.results ?? [], [jobData]);
  const questions = useMemo(() => questionData?.results ?? [], [questionData]);
  const questionGroups = useMemo(() => groupData?.results ?? [], [groupData]);

  const initialValues = useMemo<FormValues>(() => ({
    job_post: sessionDetail?.jobPost ? extractId(sessionDetail.jobPost) : (jobPostIdQuery ? Number(jobPostIdQuery) : ''),
    candidate: sessionDetail?.candidate ? extractId(sessionDetail.candidate) : (candidateIdQuery ? Number(candidateIdQuery) : ''),
    scheduled_at: sessionDetail?.scheduledAt ?? '',
    selected_group: sessionDetail?.questionGroup ? extractId(sessionDetail.questionGroup) : '',
    voice_profile: sessionDetail?.voiceProfile ?? sessionDetail?.voice_profile ?? '',
    selected_questions: sessionDetail?.questions?.map((q: Question) => q.id) ?? [],
  }), [candidateIdQuery, jobPostIdQuery, sessionDetail]);

  if (sessionId && isLoadingSession) {
    return (
      <Box sx={{ p: 4 }}>
        <Skeleton variant="rectangular" height={600} sx={{ borderRadius: 4 }} />
      </Box>
    );
  }

  return (
    <InterviewCreateCardInner
      title={title}
      sessionId={sessionId}
      jobPostIdQuery={jobPostIdQuery}
      candidateIdQuery={candidateIdQuery}
      initialValues={initialValues}
      jobs={jobs}
      questions={questions}
      questionGroups={questionGroups}
      isLoadingJobs={isLoadingJobs}
    />
  );
};

export default InterviewCreateCard;
