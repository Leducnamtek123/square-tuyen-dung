'use client';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
    Box, 
    Typography, 
    Button, 
    Paper, 
    TextField, 
    MenuItem, 
    FormControl, 
    InputLabel, 
    Select, 
    OutlinedInput, 
    Chip, 
    CircularProgress, 
    Stack, 
    Divider, 
    Dialog, 
    DialogTitle, 
    DialogContent, 
    DialogActions,
    Skeleton,
    InputAdornment,
    alpha,
    useTheme,
    Theme
} from "@mui/material";
import { Grid2 as Grid } from "@mui/material";
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import toastMessages from '../../../../utils/toastMessages';
import { useTranslation } from 'react-i18next';
import { ROUTES } from '../../../../configs/constants';
import DateTimePickerCustom from '../../../../components/Common/Controls/DateTimePickerCustom';
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
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import EditIcon from '@mui/icons-material/Edit';
import EventIcon from '@mui/icons-material/Event';
import WorkIcon from '@mui/icons-material/Work';
import PersonIcon from '@mui/icons-material/Person';
import QuizIcon from '@mui/icons-material/Quiz';
import CategoryIcon from '@mui/icons-material/Category';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';
import type { InterviewSession, Question, QuestionGroup, User } from '../../../../types/models';

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
    const candidates = useMemo(() => candidateData?.results ?? [], [candidateData]);

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
        onChange: (value: string | number) => void,
        value: string | number
    ) => {
        onChange(value);
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
            <Paper
                elevation={0}
                sx={{
                    p: { xs: 3, md: 5 },
                    borderRadius: 4,
                    border: '1px solid',
                    borderColor: 'divider',
                    boxShadow: (theme: Theme) => theme.customShadows?.z1,
                    bgcolor: 'background.paper',
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                <Stack direction="row" alignItems="center" spacing={2.5} mb={6}>
                    <Box sx={{ 
                        width: 48,
                        height: 48, 
                        borderRadius: 2, 
                        bgcolor: 'primary.extralight', 
                        color: 'primary.main',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: (theme: Theme) => alpha(theme.palette.primary.main, 0.1)
                    }}>
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
                </Stack>

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

                        {/* Job Post Select */}
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Controller
                                name="job_post"
                                control={control}
                                rules={{ required: t('interview:interviewCreateCard.validation.selectJobPost') }}
                                render={({ field }) => (
                                    <TextField 
                                        {...field}
                                        onChange={(e) => handleJobPostChange(field.onChange, e.target.value)}
                                        select 
                                        fullWidth 
                                        label={t('interview:interviewCreateCard.label.selectjobpost')} 
                                        error={!!errors.job_post} 
                                        helperText={errors.job_post?.message}
                                        disabled={isLoadingJobs}
                                        sx={inputSx}
                                        slotProps={{
                                            input: {
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <WorkIcon sx={{ fontSize: 20, color: 'primary.main' }} />
                                                    </InputAdornment>
                                                ),
                                            },
                                            inputLabel: { sx: { fontWeight: 600 } }
                                        }}
                                    >
                                        {jobs.map((job) => <MenuItem key={job.id} value={job.id} sx={{ fontWeight: 600 }}>{job.jobName}</MenuItem>)}
                                    </TextField>
                                )}
                            />
                        </Grid>

                        {/* Candidate Select */}
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
                                        slotProps={{
                                            input: {
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <PersonIcon sx={{ fontSize: 20, color: 'secondary.main' }} />
                                                    </InputAdornment>
                                                ),
                                            },
                                            inputLabel: { sx: { fontWeight: 600 } }
                                        }}
                                    >
                                        {candidates.length === 0 && !isLoadingCandidates && selectedJobPostId ? (
                                            <MenuItem disabled value="">
                                                <em>{t('interview:interviewCreateCard.noCandidates')}</em>
                                            </MenuItem>
                                        ) : null}
                                        {candidates.map((c) => (
                                            <MenuItem key={c.userId ?? c.id} value={c.userId ?? c.id} sx={{ fontWeight: 600 }}>
                                                {c.fullName} - {c.email}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                )}
                            />
                        </Grid>

                        {/* Scheduled Time */}
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

                        {/* Question Group */}
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
                                            formHelperText: { sx: { fontWeight: 700, fontStyle: 'italic', color: 'info.main', opacity: 0.8 } }
                                        }}
                                    >
                                        <MenuItem value="" sx={{ fontWeight: 600 }}><em>{t('common:none')}</em></MenuItem>
                                        {questionGroups.map((group) => <MenuItem key={group.id} value={group.id} sx={{ fontWeight: 600 }}>{group.name}</MenuItem>)}
                                    </TextField>
                                )}
                            />
                        </Grid>

                        {/* Questions Multi-Select */}
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
                                                        const q = questions.find(item => item.id === val);
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
                                                                    fontSize: '0.75rem'
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
                                            {questions.map((q) => (
                                                <MenuItem key={q.id} value={q.id} sx={{ py: 1.5, borderBottom: '1px solid', borderColor: 'divider', '&:last-child': { borderBottom: 0 } }}>
                                                    <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>{q.text}</Typography>
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    )}
                                />
                                {errors.selected_questions && <Typography variant="caption" color="error" sx={{ mt: 1, fontWeight: 800 }}>{errors.selected_questions.message}</Typography>}
                            </FormControl>
                        </Grid>

                        {/* Question Buttons */}
                        <Grid size={12}>
                            <Stack direction="row" spacing={2.5} justifyContent="flex-end">
                                <Button 
                                    variant="outlined" 
                                    size="medium"
                                    startIcon={<AddCircleOutlineIcon />}
                                    onClick={handleOpenAddQuestion}
                                    sx={{ 
                                        textTransform: 'none', 
                                        borderRadius: 2.5, 
                                        fontWeight: 900,
                                        borderStyle: 'dashed',
                                        px: 3
                                    }}
                                >
                                    {t('interview:employer.questions.add')}
                                </Button>
                                <Button 
                                    variant="outlined" 
                                    size="medium"
                                    color="secondary"
                                    startIcon={<EditIcon />}
                                    disabled={(watch('selected_questions') ?? []).length !== 1} 
                                    onClick={handleOpenEditQuestion}
                                    sx={{ 
                                        textTransform: 'none', 
                                        borderRadius: 2.5, 
                                        fontWeight: 900,
                                        borderStyle: 'dashed',
                                        px: 3
                                    }}
                                >
                                    {t('interview:employer.questions.edit')}
                                </Button>
                            </Stack>
                        </Grid>
                        
                        {/* Submit */}
                        <Grid size={12}>
                            <Divider sx={{ mt: 4, mb: 2, borderStyle: 'dashed' }} />
                            <Stack direction="row" spacing={2} justifyContent="flex-end">
                                <Button 
                                    onClick={() => navigate.back()} 
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
                                        boxShadow: (theme: Theme) => theme.customShadows?.primary,
                                        textTransform: 'none',
                                        fontSize: '1.05rem'
                                    }}
                                >
                                    {isInterviewMutating ? <CircularProgress size={24} color="inherit" /> : (sessionId ? t('common:save') : t('interview:interviewCreateCard.scheduleNow'))}
                                </Button>
                            </Stack>
                        </Grid>
                    </Grid>
                </form>
            </Paper>

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
