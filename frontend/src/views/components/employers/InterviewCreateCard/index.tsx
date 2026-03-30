'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { Box, Typography, Button, Paper, TextField, MenuItem, FormControl, InputLabel, Select, OutlinedInput, Chip, CircularProgress, Stack, Divider, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import { Grid2 as Grid } from "@mui/material";
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import toastMessages from '../../../../utils/toastMessages';
import { useTranslation } from 'react-i18next';
import { ROUTES } from '../../../../configs/constants';
import DateTimePickerCustom from '../../../../components/Common/Controls/DateTimePickerCustom';
import { useEmployerJobPosts, useAppliedResumes, useEmployerQuestions, useQuestionGroups, useInterviewDetail, useInterviewMutations, useQuestionMutations } from '../hooks/useEmployerQueries';
import errorHandling from '../../../../utils/errorHandling';
import BackdropLoading from '../../../../components/Common/Loading/BackdropLoading';
import type { AxiosError } from 'axios';
import type { ApiError } from '../../../../types/api';

interface FormValues {
  job_post: string | number;
  candidate: string | number;
  scheduled_at: string;
  selected_group: string | number;
  selected_questions: number[];
}

interface InterviewCreateCardProps {
  title?: string;
  sessionId?: string | number;
}

const InterviewCreateCard: React.FC<InterviewCreateCardProps> = ({ title, sessionId }) => {
    const navigate = useRouter();
    const { t } = useTranslation(['employer', 'interview', 'common']);

    const { control, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<FormValues>({
        defaultValues: {
            job_post: '',
            candidate: '',
            scheduled_at: '',
            selected_group: '',
            selected_questions: []
        }
    });

    const selectedJobPostId = watch('job_post');
    const selectedGroupId = watch('selected_group');

    // Data Fetching Hooks
    const { data: jobData } = useEmployerJobPosts({ pageSize: 1000 });
    const { data: questionData } = useEmployerQuestions({ pageSize: 1000 });
    const { data: groupData } = useQuestionGroups({ pageSize: 1000 });
    const { data: candidateData } = useAppliedResumes({ jobPostId: selectedJobPostId as number, pageSize: 1000 }, !!selectedJobPostId);
    const { data: sessionDetail, isLoading: isLoadingSession } = useInterviewDetail(sessionId as string | number);

    const { scheduleSession, updateSession, isMutating: isInterviewMutating } = useInterviewMutations();
    const { createQuestion, updateQuestion, isMutating: isQuestionMutating } = useQuestionMutations();

    const jobs = jobData?.results || [];
    const questions = questionData?.results || [];
    const questionGroups = groupData?.results || [];
    const candidates = candidateData?.results || [];

    const [isQuestionDialogOpen, setIsQuestionDialogOpen] = useState(false);
    const [questionDraft, setQuestionDraft] = useState('');
    const [editingQuestionId, setEditingQuestionId] = useState<number | null>(null);

    // Load existing session data if editing
    useEffect(() => {
        if (sessionDetail) {
            reset({
                job_post: (sessionDetail.jobPost as any)?.id || sessionDetail.jobPost || '',
                candidate: (sessionDetail.candidate as any)?.id || sessionDetail.candidate || '',
                scheduled_at: sessionDetail.scheduledAt || '',
                selected_group: (sessionDetail.questionGroup as any)?.id || (sessionDetail.questionGroup as any) || '',
                selected_questions: sessionDetail.questions?.map((q: any) => q.id) || []
            });
        }
    }, [sessionDetail, reset]);

    // Handle question group selection
    useEffect(() => {
        if (selectedGroupId) {
            const group = questionGroups.find((g) => String(g.id) === String(selectedGroupId));
            if (group && group.questions) {
                setValue('selected_questions', group.questions.map(q => q.id));
            }
        }
    }, [selectedGroupId, questionGroups, setValue]);

    const handleSaveQuestion = async () => {
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
                const current = watch('selected_questions') || [];
                setValue('selected_questions', [...current, newQuestion.id]);
            }
            setIsQuestionDialogOpen(false);
        } catch (error) {
            errorHandling(error as AxiosError<{ errors?: ApiError }>);
        }
    };

    const onSubmit = async (data: FormValues) => {
        try {
            const payload = {
                jobPostId: Number(data.job_post),
                candidateId: Number(data.candidate),
                scheduledAt: data.scheduled_at,
                questionIds: data.selected_questions.filter(Boolean),
                type: 'live' as const
            };

            if (sessionId) {
                await updateSession({ id: sessionId, data: payload });
                toastMessages.success(t('interview:interviewCreateCard.messages.updateSuccess'));
            } else {
                await scheduleSession(payload);
                toastMessages.success(t('interview:interviewCreateCard.messages.scheduleSuccess'));
            }
            navigate.push(`/${ROUTES.EMPLOYER.INTERVIEW_LIST}`);
        } catch (error) {
            errorHandling(error as AxiosError<{ errors?: ApiError }>);
        }
    };

    if (isLoadingSession && sessionId) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>;
    }

    return (
        <Box sx={{ px: { xs: 1, sm: 2 }, py: { xs: 2, sm: 2 }, backgroundColor: 'background.paper', borderRadius: 2 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={4}>
                <Typography variant="h5" sx={{ fontWeight: 600, fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
                    {title || t('interview:interviewCreateCard.title.scheduleOnlineInterview')}
                </Typography>
            </Stack>

            <Paper sx={{ p: { xs: 2, sm: 4 }, borderRadius: 3, boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <Grid container spacing={3}>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Controller
                                name="job_post"
                                control={control}
                                rules={{ required: t('interview:interviewCreateCard.validation.selectJobPost') }}
                                render={({ field }) => (
                                    <TextField {...field} select fullWidth label={t('interview:interviewCreateCard.label.selectjobpost')} error={!!errors.job_post} helperText={errors.job_post?.message}>
                                        {jobs.map((job) => <MenuItem key={job.id} value={job.id}>{job.jobName}</MenuItem>)}
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
                                    <TextField {...field} select fullWidth label={t('interview:interviewCreateCard.label.selectcandidate')} disabled={!selectedJobPostId} error={!!errors.candidate} helperText={errors.candidate?.message}>
                                        {candidates.map((c) => <MenuItem key={c.id} value={c.id}>{c.fullName} - {c.email}</MenuItem>)}
                                    </TextField>
                                )}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <DateTimePickerCustom name="scheduled_at" control={control} title={t('interview:interviewCreateCard.title.scheduledtime')} showRequired minDateTime={new Date().toISOString()} />
                        </Grid>
                        <Grid size={12}>
                            <Controller
                                name="selected_group"
                                control={control}
                                render={({ field }) => (
                                    <TextField {...field} select fullWidth label={t('interview:interviewCreateCard.label.selectquestiongroupoptional')} variant="outlined" helperText={t('interview:interviewCreateCard.helperText.selectaquestiongrouptoautomaticallyfillthequestionsbelow')}>
                                        <MenuItem value=""><em>{t('common:none')}</em></MenuItem>
                                        {questionGroups.map((group) => <MenuItem key={group.id} value={group.id}>{group.name}</MenuItem>)}
                                    </TextField>
                                )}
                            />
                        </Grid>
                        <Grid size={12}>
                            <FormControl fullWidth error={!!errors.selected_questions}>
                                <InputLabel>{t('interview:interviewCreateCard.label.selectinterviewquestions')}</InputLabel>
                                <Controller
                                    name="selected_questions"
                                    control={control}
                                    render={({ field }) => (
                                        <Select {...field} multiple input={<OutlinedInput label={t('interview:interviewCreateCard.label.selectinterviewquestions')} />} renderValue={(selected: any) => (
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                {selected.map((val: any) => {
                                                    const q = questions.find(item => String(item.id) === String(val));
                                                    return <Chip key={val} label={(q?.text || `Q#${val}`).substring(0, 30)} size="small" />;
                                                })}
                                            </Box>
                                        )}>
                                            {questions.map((q) => <MenuItem key={q.id} value={q.id}>{q.text}</MenuItem>)}
                                        </Select>
                                    )}
                                />
                                {errors.selected_questions && <Typography variant="caption" color="error">{errors.selected_questions.message}</Typography>}
                            </FormControl>
                        </Grid>
                        <Grid size={12}>
                            <Stack direction="row" spacing={2} justifyContent="flex-end">
                                <Button variant="outlined" onClick={() => { setEditingQuestionId(null); setQuestionDraft(''); setIsQuestionDialogOpen(true); }}>
                                    {t('interview:employer.questions.add')}
                                </Button>
                                <Button variant="outlined" disabled={(watch('selected_questions') || []).length !== 1} onClick={() => {
                                    const id = watch('selected_questions')[0];
                                    const q = questions.find(item => item.id === id);
                                    setEditingQuestionId(id);
                                    setQuestionDraft(q?.text || '');
                                    setIsQuestionDialogOpen(true);
                                }}>
                                    {t('interview:employer.questions.edit')}
                                </Button>
                            </Stack>
                        </Grid>
                        <Grid size={12}>
                            <Divider sx={{ my: 2 }} />
                            <Stack direction="row" spacing={2} justifyContent="flex-end">
                                <Button onClick={() => navigate.back()} variant="outlined" color="inherit">
                                    {t('common:cancel')}
                                </Button>
                                <Button type="submit" variant="contained" color="primary">
                                    {sessionId ? t('common:save') : t('interview:interviewCreateCard.scheduleNow')}
                                </Button>
                            </Stack>
                        </Grid>
                    </Grid>
                </form>
            </Paper>

            <Dialog open={isQuestionDialogOpen} onClose={() => setIsQuestionDialogOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle>{editingQuestionId ? t('interview:employer.questions.editTitle') : t('interview:employer.questions.createTitle')}</DialogTitle>
                <DialogContent sx={{ pt: 2 }}>
                    <TextField value={questionDraft} onChange={(e) => setQuestionDraft(e.target.value)} label={t('interview:employer.questions.textLabel')} fullWidth multiline minRows={3} />
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button onClick={() => setIsQuestionDialogOpen(false)} color="inherit">{t('common:cancel')}</Button>
                    <Button onClick={handleSaveQuestion} variant="contained" disabled={isQuestionMutating}>
                        {isQuestionMutating ? <CircularProgress size={24} /> : t('common:save')}
                    </Button>
                </DialogActions>
            </Dialog>

            {(isInterviewMutating || isQuestionMutating) && <BackdropLoading />}
        </Box>
    );
};

export default InterviewCreateCard;
