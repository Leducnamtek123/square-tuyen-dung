import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Paper, TextField, MenuItem, FormControl, InputLabel, Select, OutlinedInput, Chip, CircularProgress, Stack, Divider, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import interviewService from '../../../../services/interviewService';
import questionService from '../../../../services/questionService';
import questionGroupService from '../../../../services/questionGroupService';
import jobService from '../../../../services/jobService';
import jobPostActivityService from '../../../../services/jobPostActivityService';
import { ROUTES } from '../../../../configs/constants';
import { transformQuestion, transformJobPost, transformAppliedResume, transformQuestionGroup } from '../../../../utils/transformers';
import DateTimePickerCustom from '../../../../components/Common/Controls/DateTimePickerCustom';

interface JobPost {
  jobName: string;
  [key: string]: any;
}

interface Question {
  id: number;
  text?: string;
  questionText?: string;
  content?: string;
  [key: string]: any;
}

interface QuestionGroup {
  id: number;
  name: string;
  questions?: Question[];
  [key: string]: any;
}

interface Candidate {
  id?: number;
  candidateId?: number;
  fullName?: string;
  candidateName?: string;
  email?: string;
  [key: string]: any;
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
}

const InterviewCreateCard: React.FC<InterviewCreateCardProps> = ({ title }) => {

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

    const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormValues>({

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

    const fetchQuestions = async () => {

        const questionsRes: any = await questionService.getQuestions({ pageSize: 1000 });

        const rawQuestions = Array.isArray(questionsRes?.results)

            ? questionsRes.results

            : Array.isArray(questionsRes)

                ? questionsRes

                : [];

        setQuestions(rawQuestions.map(transformQuestion).filter(Boolean));

    };

    useEffect(() => {

        const fetchData = async () => {

            setIsLoadingData(true);

            try {

                const [jobsRes, questionsRes, groupsRes] = await Promise.all([

                    jobService.getEmployerJobPost(),

                    questionService.getQuestions({ pageSize: 1000 }),

                    questionGroupService.getQuestionGroups({ pageSize: 1000 })

                ]) as any[];

                const rawJobs = Array.isArray(jobsRes?.results)

                    ? jobsRes.results

                    : Array.isArray(jobsRes)

                        ? jobsRes

                        : [];

                const rawQuestions = Array.isArray(questionsRes?.results)

                    ? questionsRes.results

                    : Array.isArray(questionsRes)

                        ? questionsRes

                        : [];

                const rawGroups = Array.isArray(groupsRes?.results)

                    ? groupsRes.results

                    : Array.isArray(groupsRes)

                        ? groupsRes

                        : [];

                setJobs(rawJobs.map(transformJobPost).filter(Boolean));

                setQuestions(rawQuestions.map(transformQuestion).filter(Boolean));

                setQuestionGroups(rawGroups.map(transformQuestionGroup).filter(Boolean));

            } catch (error) {

                console.error('Error fetching initial data', error);

                toast.error(t('interviewCreateCard.messages.loadDataError'));

            } finally {

                setIsLoadingData(false);

            }

        };

        fetchData();

    }, [t]);

    // Effect to auto-fill questions when a group is selected

    useEffect(() => {

        if (selectedGroupId) {

            const group = questionGroups.find((g) => String(g.id) === String(selectedGroupId));

            if (group && group.questions) {

                const questionIds = group.questions.map(q => q.id);

                setValue('selected_questions', questionIds);

            }

        } else {

            setValue('selected_questions', []);

        }

    }, [selectedGroupId, questionGroups, setValue]);

    useEffect(() => {

        if (selectedJobPostId) {

            jobPostActivityService.getAppliedResume({ jobPostId: selectedJobPostId, pageSize: 100 })

                .then((res: any) => {

                    const rawCandidates = Array.isArray(res?.results)

                        ? res.results

                        : Array.isArray(res)

                            ? res

                                    : [];

                    setCandidates(rawCandidates.map(transformAppliedResume).filter(Boolean));

                    setValue('candidate', '');

                })

                .catch(err => {

                    console.error('Error fetching candidates', err);

                    toast.error(t('interviewCreateCard.messages.loadCandidateError'));

                });

        } else {

            setCandidates([]);

            setValue('candidate', '');

        }

    }, [selectedJobPostId, setValue, t]);

    const openCreateQuestionDialog = () => {

        setEditingQuestionId(null);

        setQuestionDraft('');

        setIsQuestionDialogOpen(true);

    };

    const openEditQuestionDialog = () => {

        const selected = watch('selected_questions') || [];

        if (selected.length !== 1) {

            toast.error(t('interview:employer.questions.editSelectionError'));

            return;

        }

        const q = questions.find((item) => item.id === selected[0]);

        if (!q) {

            toast.error(t('interview:employer.questions.editSelectionError'));

            return;

        }

        setEditingQuestionId(q.id);

        setQuestionDraft(q.text || q.questionText || q.content || '');

        setIsQuestionDialogOpen(true);

    };

    const handleSaveQuestion = async () => {

        const trimmed = questionDraft.trim();

        if (!trimmed) {

            toast.error(t('interview:employer.questions.textRequired'));

            return;

        }

        setIsSavingQuestion(true);

        try {

            if (editingQuestionId) {

                await questionService.updateQuestion(editingQuestionId, { text: trimmed });

                toast.success(t('interview:employer.questions.updateSuccess'));

            } else {

                const newQuestion = (await questionService.createQuestion({ text: trimmed })) as any;

                toast.success(t('interview:employer.questions.createSuccess'));

                const createdId = newQuestion?.id || newQuestion?.data?.id || newQuestion?.results?.id;

                if (createdId) {

                    const current = watch('selected_questions') || [];

                    setValue('selected_questions', [...current, createdId]);

                }

            }

            await fetchQuestions();

            setIsQuestionDialogOpen(false);

        } catch (error) {

            console.error('Question save error:', error);

            toast.error(t('interview:employer.questions.saveError'));

        } finally {

            setIsSavingQuestion(false);

        }

    };

    const onSubmit = async (data: FormValues) => {

        try {

            const payload = {

                job_post: data.job_post,

                candidate: data.candidate,

                scheduled_at: data.scheduled_at,

                question_ids: data.selected_questions,

                type: 'mixed'

            };

            await interviewService.scheduleSession(payload);

            toast.success(t('interviewCreateCard.messages.scheduleSuccess'));

            // Fix double slash and ensure correct route

            navigate.push(`/${ROUTES.EMPLOYER.INTERVIEW_LIST}`);

        } catch (error) {

            console.error('Submit error:', error);

            toast.error(t('interviewCreateCard.messages.scheduleError'));

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

                                            <MenuItem key={job.id} value={job.id}>

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
