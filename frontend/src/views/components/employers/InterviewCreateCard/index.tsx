'use client';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Box, Button, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, Skeleton, TextField, Typography, alpha, useTheme, type Theme } from "@mui/material";
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import toastMessages from '../../../../utils/toastMessages';
import { useTranslation } from 'react-i18next';
import { ROUTES } from '../../../../configs/constants';
import { 
    useEmployerJobPosts, 
    useAppliedResumes, 
    useEmployerQuestions, 
    useQuestionGroups, 
    useInterviewDetail, 
    useInterviewMutations, 
    useQuestionMutations 
} from '../hooks/useEmployerQueries';
import BackdropLoading from '../../../../components/Common/Loading/BackdropLoading';
import CloseIcon from '@mui/icons-material/Close';
import InterviewCreateCardForm from './InterviewCreateCardForm';
import type { FormValues } from './types';
import type { JobPostActivity, Question, QuestionGroup } from '../../../../types/models';

interface InterviewCreateCardProps {
  title?: string;
  sessionId?: string | number;
}

/** Extract id from a field that may be a nested object or a plain ID */
const extractId = (field: unknown): string | number => {
    if (field != null && typeof field === 'object' && 'id' in field) {
        return (field as { id: number }).id;
    }
    return (field as string | number) ?? '';
};

const InterviewCreateCard: React.FC<InterviewCreateCardProps> = ({ title, sessionId }) => {
    const navigate = useRouter();
    const searchParams = useSearchParams();
    const candidateIdQuery = searchParams.get('candidate') || '';
    const jobPostIdQuery = searchParams.get('jobPost') || '';

    const { t } = useTranslation(['employer', 'interview', 'common']);
    const theme = useTheme();

    const { control, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<FormValues>({
        defaultValues: {
            job_post: jobPostIdQuery ? Number(jobPostIdQuery) : '',
            candidate: candidateIdQuery ? Number(candidateIdQuery) : '',
            scheduled_at: '',
            selected_group: '',
            selected_questions: []
        }
    });

    const selectedJobPostId = watch('job_post');
    const selectedGroupId = watch('selected_group');

    // ── Data Fetching (TanStack Query) ─────────────────────────
    const { data: jobData, isLoading: isLoadingJobs } = useEmployerJobPosts({ pageSize: 1000 });
    const { data: questionData } = useEmployerQuestions({ pageSize: 1000 });
    const { data: groupData } = useQuestionGroups({ pageSize: 1000 });
    const { data: candidateData, isLoading: isLoadingCandidates } = useAppliedResumes({ 
        jobPostId: selectedJobPostId as number, 
        pageSize: 1000 
    }, !!selectedJobPostId);
    const { data: sessionDetail, isLoading: isLoadingSession } = useInterviewDetail(sessionId as string | number);

    const { scheduleSession, updateSession, isMutating: isInterviewMutating } = useInterviewMutations();
    const { createQuestion, updateQuestion, isMutating: isQuestionMutating } = useQuestionMutations();

    // ── Derived data (no state needed) ─────────────────────────
    const jobs = useMemo(() => jobData?.results ?? [], [jobData]);
    const questions = useMemo(() => questionData?.results ?? [], [questionData]);
    const questionGroups = useMemo(() => groupData?.results ?? [], [groupData]);
    const candidates = useMemo(() => candidateData?.results ?? [], [candidateData]) as JobPostActivity[];

    // ── Local state — only for dialog ──────────────────────────
    const [isQuestionDialogOpen, setIsQuestionDialogOpen] = useState(false);
    const [questionDraft, setQuestionDraft] = useState('');
    const [editingQuestionId, setEditingQuestionId] = useState<number | null>(null);

    // ── Load existing session data when editing ────────────────
    useEffect(() => {
        if (sessionDetail) {
            reset({
                job_post: extractId(sessionDetail.jobPost),
                candidate: extractId(sessionDetail.candidate),
                scheduled_at: sessionDetail.scheduledAt ?? '',
                selected_group: extractId(sessionDetail.questionGroup),
                selected_questions: sessionDetail.questions?.map((q: Question) => q.id) ?? []
            });
        }
    }, [sessionDetail, reset]);

    // ── Sync question group → selected questions ───────────────
    useEffect(() => {
        if (selectedGroupId && selectedGroupId !== "") {
            const group = questionGroups.find((g) => String(g.id) === String(selectedGroupId));
            if (group?.questions) {
                setValue('selected_questions', group.questions.map(q => q.id), { shouldValidate: true });
            }
        }
    }, [selectedGroupId, questionGroups, setValue]);

    // ── Handlers ───────────────────────────────────────────────
    const handleJobPostChange = useCallback((
        value: string | number
    ) => {
        setValue('job_post', value, { shouldValidate: true });
        // Reset candidate when job post is changed
        setValue('candidate', '', { shouldValidate: false });
    }, [setValue]);

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
            const payload = {
                job_post: Number(data.job_post),
                candidate: Number(data.candidate),
                scheduled_at: data.scheduled_at,
                question_ids: data.selected_questions.filter(Boolean),
                type: 'mixed' as const
            };

            if (sessionId) {
                await updateSession({ id: sessionId, data: payload });
                toastMessages.success(t('interview:interviewCreateCard.messages.updateSuccess'));
            } else {
                await scheduleSession(payload);
                toastMessages.success(t('interview:interviewCreateCard.messages.scheduleSuccess'));
            }
            navigate.push(`/${ROUTES.EMPLOYER.INTERVIEW_LIST}`);
        } catch {
            // Error handled by mutation hook
        }
    }, [sessionId, updateSession, scheduleSession, t, navigate]);

    const handleOpenAddQuestion = useCallback(() => {
        setEditingQuestionId(null);
        setQuestionDraft('');
        setIsQuestionDialogOpen(true);
    }, []);

    const handleOpenEditQuestion = useCallback(() => {
        const id = watch('selected_questions')[0];
        const q = questions.find(item => item.id === id);
        setEditingQuestionId(id);
        setQuestionDraft(q?.text ?? '');
        setIsQuestionDialogOpen(true);
    }, [watch, questions]);

    // ── Styles ─────────────────────────────────────────────────
    const inputSx = useMemo(() => ({
        '& .MuiOutlinedInput-root': {
            borderRadius: 2.5,
            backgroundColor: alpha(theme.palette.action.disabled, 0.03),
            '&:hover': { bgcolor: alpha(theme.palette.action.disabled, 0.06) },
            '& fieldset': { borderColor: alpha(theme.palette.divider, 0.8) }
        }
    }), [theme]);

    // ── Loading state ──────────────────────────────────────────
    if (isLoadingSession && sessionId) {
        return (
            <Box sx={{ p: 4 }}>
                <Skeleton variant="rectangular" height={600} sx={{ borderRadius: 4 }} />
            </Box>
        );
    }

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
                isLoadingJobs={isLoadingJobs}
                isLoadingCandidates={isLoadingCandidates}
                isInterviewMutating={isInterviewMutating}
                selectedJobPostId={selectedJobPostId}
                selectedQuestionsCount={(watch('selected_questions') ?? []).length}
                onCancel={() => navigate.back()}
                onJobPostChange={handleJobPostChange}
                onOpenAddQuestion={handleOpenAddQuestion}
                onOpenEditQuestion={handleOpenEditQuestion}
            />

            {/* Question Dialog */}
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
                            boxShadow: (theme: Theme) => theme.customShadows?.z24,
                            border: '1px solid',
                            borderColor: 'divider'
                        }
                    }
                }}
            >
                <DialogTitle sx={{ fontWeight: 900, fontSize: '1.5rem', letterSpacing: '-1px', pt: 3, px: 4 }}>
                    {editingQuestionId ? t('interview:employer.questions.editTitle') : t('interview:employer.questions.createTitle')}
                </DialogTitle>
                <DialogContent sx={{ px: 4 }}>
                    <Box sx={{ mt: 2 }}>
                        <TextField 
                            autoFocus
                            value={questionDraft} 
                            onChange={(e) => setQuestionDraft(e.target.value)} 
                            label={t('interview:employer.questions.textLabel')} 
                            fullWidth 
                            multiline 
                            minRows={5} 
                            variant="outlined"
                            slotProps={{
                                input: { sx: { borderRadius: 3, fontWeight: 700, lineHeight: 1.8 } },
                                inputLabel: { sx: { fontWeight: 600 } }
                            }}
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 4, gap: 2 }}>
                    <Button 
                        onClick={() => setIsQuestionDialogOpen(false)} 
                        color="inherit" 
                        sx={{ fontWeight: 900, textTransform: 'none', borderRadius: 2.5, px: 3 }}
                    >
                        {t('common:cancel')}
                    </Button>
                    <Button 
                        onClick={handleSaveQuestion} 
                        variant="contained" 
                        color="primary"
                        disabled={isQuestionMutating} 
                        sx={{ 
                            borderRadius: 2.5, 
                            px: 5, 
                            py: 1.25,
                            fontWeight: 900, 
                            boxShadow: (theme: Theme) => theme.customShadows?.primary,
                            textTransform: 'none'
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

export default InterviewCreateCard;
