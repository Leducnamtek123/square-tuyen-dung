'use client';
import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Paper, TextField, MenuItem, FormControl, InputLabel, Select, OutlinedInput, Chip, CircularProgress, Stack, Divider, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import { Grid2 as Grid } from "@mui/material";
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import toastMessages from '../../../../utils/toastMessages';
import { useTranslation } from 'react-i18next';
import interviewService from '../../../../services/interviewService';
import questionService from '../../../../services/questionService';
import { PaginatedResponse } from '@/types/api';
import questionGroupService from '../../../../services/questionGroupService';
import jobService from '../../../../services/jobService';
import jobPostActivityService from '../../../../services/jobPostActivityService';
import { ROUTES } from '../../../../configs/constants';
import { transformQuestion, transformJobPost, transformAppliedResume, transformQuestionGroup } from '../../../../utils/transformers';
import DateTimePickerCustom from '../../../../components/Common/Controls/DateTimePickerCustom';

interface JobPost {
  jobName: string;
  [key: string]: unknown;
}

interface Question {
  id: number;
  text?: string;
  questionText?: string;
  content?: string;
  [key: string]: unknown;
}

interface QuestionGroup {
  id: number;
  name: string;
  questions?: Question[];
  [key: string]: unknown;
}

interface Candidate {
  id?: number;
  candidateId?: number;
  fullName?: string;
  candidateName?: string;
  email?: string;
  [key: string]: unknown;
}

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

    const [jobs, setJobs] = useState<JobPost[]>([]);

    const [questions, setQuestions] = useState<Question[]>([]);

    const [questionGroups, setQuestionGroups] = useState<QuestionGroup[]>([]);

    const [candidates, setCandidates] = useState<Candidate[]>([]);

    const [isLoadingData, setIsLoadingData] = useState(true);

    const [isQuestionDialogOpen, setIsQuestionDialogOpen] = useState(false);

    const [isSavingQuestion, setIsSavingQuestion] = useState(false);

    const [questionDraft, setQuestionDraft] = useState('');

    const [editingQuestionId, setEditingQuestionId] = useState<number | null>(null);

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

    const prevJobIdRef = React.useRef<string | number | null>(null);
    const prevGroupIdRef = React.useRef<string | number | null>(null);

    const fetchQuestions = async () => {

        const questionsRes = await questionService.getQuestions({ pageSize: 1000 });

        const rawQuestions = (questionsRes as unknown as PaginatedResponse<Record<string, unknown>>).results || [];

        setQuestions(rawQuestions.map((q) => transformQuestion(q as Record<string, unknown>) as Question).filter(Boolean));

    };

    useEffect(() => {

        const fetchData = async () => {

            setIsLoadingData(true);

            try {

                const [jobsRes, questionsRes, groupsRes] = await Promise.all([

                    jobService.getEmployerJobPost(),

                    questionService.getQuestions({ pageSize: 1000 }),

                    questionGroupService.getQuestionGroups({ pageSize: 1000 })

                ]);

                const rawJobs = (jobsRes as unknown as PaginatedResponse<Record<string, unknown>>)?.results || [];
                const rawQuestions = (questionsRes as unknown as PaginatedResponse<Record<string, unknown>>)?.results || [];
                const rawGroups = (groupsRes as unknown as PaginatedResponse<Record<string, unknown>>)?.results || [];

                setJobs(rawJobs.map((j) => transformJobPost(j as Record<string, unknown>) as JobPost).filter(Boolean));

                setQuestions(rawQuestions.map((q) => transformQuestion(q as Record<string, unknown>) as Question).filter(Boolean));

                setQuestionGroups(rawGroups.map((g) => transformQuestionGroup(g as Record<string, unknown>) as QuestionGroup).filter(Boolean));

            } catch (error) {

                console.error('Error fetching initial data', error);

                toastMessages.error(t('interviewCreateCard.messages.loadDataError'));

            } finally {

                setIsLoadingData(false);

            }

        };

        fetchData();

    }, [t]);

    // Fetch existing session if editing
    useEffect(() => {
        if (sessionId) {
            interviewService.getSessionDetail(sessionId as number | string)
                .then((baseSession) => {
                    const session = baseSession as unknown as Record<string, unknown>;
                    if (session) {
                        reset({
                            job_post: ((session.jobPost as Record<string, unknown>)?.id || session.jobPost || session.job_post || '') as string | number,
                            candidate: ((session.candidate as Record<string, unknown>)?.id || session.candidate || session.candidate_id || '') as string | number,
                            scheduled_at: (session.scheduledAt as string) || (session.scheduled_at as string) || '',
                            selected_group: (session.questionGroup as string | number) || (session.question_group as string | number) || '',
                            selected_questions: (session.questions as Question[])?.map((q) => q.id) || []
                        });
                    }
                })
                .catch(err => {
                    console.error('Error fetching session detail', err);
                    toastMessages.error(t('interviewCreateCard.messages.loadDataError'));
                });
        }
    }, [sessionId, reset, t]);

    useEffect(() => {
        if (selectedGroupId) {
            const group = questionGroups.find((g) => String(g.id) === String(selectedGroupId));
            if (group && group.questions) {
                const questionIds = group.questions.map(q => q.id);
                // Only update questions if the group ID has actually changed (user interaction)
                if (prevGroupIdRef.current !== null && prevGroupIdRef.current !== selectedGroupId) {
                    setValue('selected_questions', questionIds);
                }
            }
        } else {
            // Only clear questions if the group was manually reset to empty
            if (prevGroupIdRef.current !== null && prevGroupIdRef.current !== selectedGroupId) {
                setValue('selected_questions', []);
            }
        }
        prevGroupIdRef.current = selectedGroupId || null;
    }, [selectedGroupId, questionGroups, setValue]);

    useEffect(() => {
        if (selectedJobPostId) {
            jobPostActivityService.getAppliedResume({ jobPostId: selectedJobPostId as number | string, pageSize: 100 })
                .then((res) => {
                    const resRecord = res as unknown as Record<string, unknown>;
                    const rawCandidates = (resRecord as unknown as PaginatedResponse<Record<string, unknown>>)?.results || [];
                    setCandidates(rawCandidates.map((c) => transformAppliedResume(c as Record<string, unknown>) as Candidate).filter(Boolean));
                    
                    // Only clear candidate if the job post ID has actually changed (user interaction)
                    if (prevJobIdRef.current !== null && prevJobIdRef.current !== selectedJobPostId) {
                        setValue('candidate', '');
                    }
                })
                .catch(err => {
                    console.error('Error fetching candidates', err);
                    toastMessages.error(t('interviewCreateCard.messages.loadCandidateError'));
                });
        } else {
            setCandidates([]);
            if (prevJobIdRef.current !== null && prevJobIdRef.current !== selectedJobPostId) {
                setValue('candidate', '');
            }
        }
        prevJobIdRef.current = selectedJobPostId || null;
    }, [selectedJobPostId, setValue, t]);

    const openCreateQuestionDialog = () => {

        setEditingQuestionId(null);

        setQuestionDraft('');

        setIsQuestionDialogOpen(true);

    };

    const openEditQuestionDialog = () => {

        const selected = watch('selected_questions') || [];

        if (selected.length !== 1) {

            toastMessages.error(t('interview:employer.questions.editSelectionError'));

            return;

        }

        const q = questions.find((item) => item.id === selected[0]);

        if (!q) {

            toastMessages.error(t('interview:employer.questions.editSelectionError'));

            return;

        }

        setEditingQuestionId(q.id);

        setQuestionDraft(q.text || q.questionText || q.content || '');

        setIsQuestionDialogOpen(true);

    };

    const handleSaveQuestion = async () => {

        const trimmed = questionDraft.trim();

        if (!trimmed) {

            toastMessages.error(t('interview:employer.questions.textRequired'));

            return;

        }

        setIsSavingQuestion(true);

        try {

            if (editingQuestionId) {

                await questionService.updateQuestion(editingQuestionId, { text: trimmed });

                toastMessages.success(t('interview:employer.questions.updateSuccess'));

            } else {

                const newQuestion = (await questionService.createQuestion({ text: trimmed })) as unknown as Question;

                toastMessages.success(t('interview:employer.questions.createSuccess'));

                const createdId = (newQuestion as Record<string, unknown>)?.id || (newQuestion as Record<string, unknown>)?.data || (newQuestion as Record<string, unknown>)?.results;

                const createdIdNum = createdId as number;
                if (createdIdNum) {

                    const current = watch('selected_questions') || [];

                    setValue('selected_questions', [...current, createdIdNum]);

                }

            }

            await fetchQuestions();

            setIsQuestionDialogOpen(false);

        } catch (error) {

            console.error('Question save error:', error);

            toastMessages.error(t('interview:employer.questions.saveError'));

        } finally {

            setIsSavingQuestion(false);

        }

    };

    const onSubmit = async (data: FormValues) => {
        try {
            const payload = {
                jobPostId: Number(data.job_post),
                candidateId: Number(data.candidate),
                scheduledAt: data.scheduled_at,
                questionIds: data.selected_questions.filter(Boolean),
                type: 'live' as 'ai' | 'live'
            };

            if (sessionId) {
                await interviewService.updateSession(sessionId, payload);
                toastMessages.success(t('interviewCreateCard.messages.updateSuccess', { defaultValue: 'Cập nhật thành công' }));
            } else {
                await interviewService.scheduleSession(payload);
                toastMessages.success(t('interviewCreateCard.messages.scheduleSuccess'));
            }

            navigate.push(`/${ROUTES.EMPLOYER.INTERVIEW_LIST}`);
        } catch (error) {
            console.error('Submit error:', error);
            toastMessages.error(sessionId ? t('interviewCreateCard.messages.updateError', { defaultValue: 'Cập nhật thất bại' }) : t('interviewCreateCard.messages.scheduleError'));
        }
    };

    if (isLoadingData) {

        return (

            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '40vh' }}>

                <CircularProgress />

            </Box>

        );

    }

    return (

        <Box sx={{

            px: { xs: 1, sm: 2 },

            py: { xs: 2, sm: 2 },

            backgroundColor: 'background.paper',

            borderRadius: 2

        }}>

            {/* Header Section */}

            <Stack

                direction={{ xs: 'column', sm: 'row' }}

                alignItems={{ xs: 'flex-start', sm: 'center' }}

                justifyContent="space-between"

                spacing={{ xs: 2, sm: 0 }}

                mb={4}

            >

                <Typography

                    variant="h5"

                    sx={{

                        fontWeight: 600,

                        background: (theme) => theme.palette.primary.main || theme.palette.primary.main,

                        WebkitBackgroundClip: 'text',

                        WebkitTextFillColor: 'transparent',

                        fontSize: { xs: '1.25rem', sm: '1.5rem' }

                    }}

                >

                    {title || t('interviewCreateCard.title.scheduleOnlineInterview')}

                </Typography>

            </Stack>

            <Paper sx={{ p: { xs: 2, sm: 4 }, borderRadius: 3, boxShadow: (theme) => theme.customShadows?.card || 2 }}>

                <form onSubmit={handleSubmit(onSubmit)}>

                    <Grid container spacing={3}>

                        <Grid

                            size={{

                                xs: 12,

                                md: 6

                            }}>

                            <Controller

                                name="job_post"

                                control={control}

                                rules={{ required: t('interviewCreateCard.validation.selectJobPost') }}

                                render={({ field }) => (

                                    <TextField

                                        {...field}

                                        select

                                        fullWidth

                                        label={t('interviewCreateCard.label.selectjobpost')}

                                        error={!!errors.job_post}

                                        helperText={errors.job_post?.message}

                                        variant="outlined"

                                    >

                                        {jobs.map((job) => (

                                            <MenuItem key={String(job.id)} value={job.id as string | number}>

                                                {job.jobName}

                                            </MenuItem>

                                        ))}

                                    </TextField>

                                )}

                            />

                        </Grid>

                        <Grid

                            size={{

                                xs: 12,

                                md: 6

                            }}>

                            <Controller

                                name="candidate"

                                control={control}

                                rules={{ required: t('interviewCreateCard.validation.selectCandidate') }}

                                render={({ field }) => (

                                    <TextField

                                        {...field}

                                        select

                                        fullWidth

                                        label={t('interviewCreateCard.label.selectcandidate')}

                                        disabled={!selectedJobPostId || candidates.length === 0}

                                        error={!!errors.candidate}

                                        helperText={errors.candidate?.message || (selectedJobPostId && candidates.length === 0 ? t('interviewCreateCard.noCandidates') : '')}

                                        variant="outlined"

                                    >

                                        {candidates.map((c) => (

                                            <MenuItem key={c.candidateId || c.id} value={c.candidateId || c.id}>

                                                {c.candidateName || c.fullName} - {c.email}

                                            </MenuItem>

                                        ))}

                                    </TextField>

                                )}

                            />

                        </Grid>

                        <Grid

                            size={{

                                xs: 12,

                                md: 6

                            }}>

                            <DateTimePickerCustom

                                name="scheduled_at"

                                control={control}

                                title={t('interviewCreateCard.title.scheduledtime')}

                                showRequired

                                minDateTime={new Date().toISOString()}

                            />

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

                                        label={t('interviewCreateCard.label.selectquestiongroupoptional')}

                                        variant="outlined"

                                        helperText={t('interviewCreateCard.helperText.selectaquestiongrouptoautomaticallyfillthequestionsbelow')}

                                    >

                                        <MenuItem value="">

                                            <em>{t('interviewCreateCard.none')}</em>

                                        </MenuItem>

                                        {questionGroups.map((group) => (

                                            <MenuItem key={group.id} value={group.id}>

                                                {group.name} ({group.questions?.length || 0} {t('interviewCreateCard.questions')})

                                            </MenuItem>

                                        ))}

                                    </TextField>

                                )}

                            />

                        </Grid>

                        <Grid size={12}>

                            <FormControl fullWidth variant="outlined" error={!!errors.selected_questions}>

                                <InputLabel>{t('interviewCreateCard.label.selectinterviewquestions')}</InputLabel>

                                <Controller

                                    name="selected_questions"

                                    control={control}

                                    render={({ field }) => (

                                        <Select

                                            {...field}

                                            multiple

                                            input={<OutlinedInput label={t('interviewCreateCard.label.selectinterviewquestions')} />}

                                            renderValue={(selected: unknown) => (

                                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>

                                                    {(Array.isArray(selected) ? selected : []).map((value: number) => {

                                                        const q = questions.find(item => item.id === value);

                                                        const label = q?.text || q?.questionText || q?.content || `Question #${value}`;

                                                        return <Chip key={value} label={(label as string).substring(0, 30) + ((label as string).length > 30 ? '...' : '')} size="small" />;

                                                    })}

                                                </Box>

                                            )}

                                        >

                                            {questions.length === 0 && (

                                                <MenuItem disabled>

                                                    <em>{t('interviewCreateCard.noQuestions')}</em>

                                                </MenuItem>

                                            )}

                                            {questions.map((q) => (

                                                <MenuItem key={q.id} value={q.id}>

                                                    <Typography variant="body2" sx={{ maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis' }}>

                                                        {q.text || q.questionText || q.content || `Question #${q.id}`}

                                                    </Typography>

                                                </MenuItem>

                                            ))}

                                        </Select>

                                    )}

                                />

                                {errors.selected_questions && <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>{errors.selected_questions.message}</Typography>}

                            </FormControl>

                        </Grid>

                        <Grid size={12}>

                            <Stack direction="row" spacing={2} justifyContent="flex-end">

                                <Button

                                    variant="outlined"

                                    onClick={openCreateQuestionDialog}

                                >

                                    {t('interview:employer.questions.add')}

                                </Button>

                                <Button

                                    variant="outlined"

                                    onClick={openEditQuestionDialog}

                                    disabled={(watch('selected_questions') || []).length !== 1}

                                >

                                    {t('interview:employer.questions.edit')}

                                </Button>

                            </Stack>

                        </Grid>

                        <Grid size={12}>

                            <Divider sx={{ my: 2 }} />

                            <Stack direction="row" spacing={2} justifyContent="flex-end">

                                <Button

                                    onClick={() => navigate.back()}

                                    variant="outlined"

                                    color="inherit"

                                    sx={{ borderRadius: 2, px: 3 }}

                                >

                                    {t('interviewCreateCard.cancel')}

                                </Button>

                                <Button

                                    type="submit"

                                    variant="contained"

                                    sx={{

                                        borderRadius: 2,

                                        px: 4,

                                        background: (theme) => theme.palette.primary.main

                                    }}

                                >

                                    {t('interviewCreateCard.scheduleNow')}

                                </Button>

                            </Stack>

                        </Grid>

                    </Grid>

                </form>

            </Paper>

            <Dialog

                open={isQuestionDialogOpen}

                onClose={() => setIsQuestionDialogOpen(false)}

                fullWidth

                maxWidth="sm"

            >

                <DialogTitle>

                    {editingQuestionId

                        ? t('interview:employer.questions.editTitle')

                        : t('interview:employer.questions.createTitle')}

                </DialogTitle>

                <DialogContent sx={{ pt: 2 }}>

                    <TextField

                        value={questionDraft}

                        onChange={(event) => setQuestionDraft(event.target.value)}

                        label={t('interview:employer.questions.textLabel')}

                        placeholder={t('interview:employer.questions.textPlaceholder')}

                        fullWidth

                        multiline

                        minRows={3}

                    />

                </DialogContent>

                <DialogActions sx={{ px: 3, pb: 3 }}>

                    <Button

                        onClick={() => setIsQuestionDialogOpen(false)}

                        color="inherit"

                    >

                        {t('common:actions.cancel')}

                    </Button>

                    <Button

                        onClick={handleSaveQuestion}

                        variant="contained"

                        disabled={isSavingQuestion}

                    >

                        {editingQuestionId

                            ? t('interview:employer.questions.saveEdit')

                            : t('interview:employer.questions.saveCreate')}

                    </Button>

                </DialogActions>

            </Dialog>

        </Box>

    );

};

export default InterviewCreateCard;
