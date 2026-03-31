'use client';
import React, { useState, useEffect } from 'react';
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
    useTheme
} from "@mui/material";
import { Grid2 as Grid } from "@mui/material";
import { useRouter } from 'next/navigation';
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
import errorHandling from '../../../../utils/errorHandling';
import BackdropLoading from '../../../../components/Common/Loading/BackdropLoading';
import type { AxiosError } from 'axios';
import type { ApiError } from '../../../../types/api';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import EditIcon from '@mui/icons-material/Edit';
import EventIcon from '@mui/icons-material/Event';
import WorkIcon from '@mui/icons-material/Work';
import PersonIcon from '@mui/icons-material/Person';
import QuizIcon from '@mui/icons-material/Quiz';
import CategoryIcon from '@mui/icons-material/Category';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';

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
    const theme = useTheme();

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
        if (selectedGroupId && selectedGroupId !== "") {
            const group = questionGroups.find((g) => String(g.id) === String(selectedGroupId));
            if (group && group.questions) {
                setValue('selected_questions', group.questions.map(q => q.id), { shouldValidate: true });
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
                setValue('selected_questions', [...current, newQuestion.id], { shouldValidate: true });
            }
            setIsQuestionDialogOpen(false);
        } catch (error) {
            // Error handled by mutation hook
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
            // Error handled by mutation hook
        }
    };

    const inputSx = {
        '& .MuiOutlinedInput-root': {
            borderRadius: 2.5,
            backgroundColor: alpha(theme.palette.action.disabled, 0.03),
            '&:hover': { bgcolor: alpha(theme.palette.action.disabled, 0.06) },
            '& fieldset': { borderColor: alpha(theme.palette.divider, 0.8) }
        }
    };

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
                    boxShadow: (theme: any) => theme.customShadows?.z1,
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
                        boxShadow: (theme: any) => alpha(theme.palette.primary.main, 0.1)
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

                        <Grid size={{ xs: 12, md: 6 }}>
                            <Controller
                                name="job_post"
                                control={control}
                                rules={{ required: t('interview:interviewCreateCard.validation.selectJobPost') }}
                                render={({ field }) => (
                                    <TextField 
                                        {...field} 
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
                                        {candidates.map((c) => <MenuItem key={c.id} value={c.id} sx={{ fontWeight: 600 }}>{c.fullName} - {c.email}</MenuItem>)}
                                    </TextField>
                                )}
                            />
                        </Grid>
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
                                            formHelperText: { sx: { fontWeight: 700, fontStyle: 'italic', color: 'info.main', opacity: 0.8 } }
                                        }}
                                    >
                                        <MenuItem value="" sx={{ fontWeight: 600 }}><em>{t('common:none')}</em></MenuItem>
                                        {questionGroups.map((group) => <MenuItem key={group.id} value={group.id} sx={{ fontWeight: 600 }}>{group.name}</MenuItem>)}
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
                                            renderValue={(selected: any) => (
                                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                                    {selected.map((val: any) => {
                                                        const q = questions.find(item => String(item.id) === String(val));
                                                        return (
                                                            <Chip 
                                                                key={val} 
                                                                label={(q?.text || `Q#${val}`).substring(0, 50)} 
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
                        <Grid size={12}>
                            <Stack direction="row" spacing={2.5} justifyContent="flex-end">
                                <Button 
                                    variant="outlined" 
                                    size="medium"
                                    startIcon={<AddCircleOutlineIcon />}
                                    onClick={() => { setEditingQuestionId(null); setQuestionDraft(''); setIsQuestionDialogOpen(true); }}
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
                                    disabled={(watch('selected_questions') || []).length !== 1} 
                                    onClick={() => {
                                        const id = watch('selected_questions')[0];
                                        const q = questions.find(item => item.id === id);
                                        setEditingQuestionId(id);
                                        setQuestionDraft(q?.text || '');
                                        setIsQuestionDialogOpen(true);
                                    }}
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
                                        boxShadow: (theme: any) => theme.customShadows?.primary,
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

            <Dialog 
                open={isQuestionDialogOpen} 
                onClose={() => setIsQuestionDialogOpen(false)} 
                fullWidth 
                maxWidth="sm"
                PaperProps={{ 
                    sx: { 
                        borderRadius: 4, 
                        p: 1,
                        boxShadow: (theme: any) => theme.customShadows?.z24,
                        border: '1px solid',
                        borderColor: 'divider'
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
                            boxShadow: (theme: any) => theme.customShadows?.primary,
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
