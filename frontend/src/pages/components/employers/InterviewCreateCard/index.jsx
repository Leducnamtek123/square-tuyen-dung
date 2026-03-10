/*
MyJob Recruitment System - Part of MyJob Platform

Author: Bui Khanh Huy
Email: khuy220@gmail.com
Copyright (c) 2023 Bui Khanh Huy

License: MIT License
See the LICENSE file in the project root for full license information.
*/

import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    Paper,
    TextField,
    Grid,
    MenuItem,
    FormControl,
    InputLabel,
    Select,
    OutlinedInput,
    Chip,
    CircularProgress,
    Stack,
    Divider
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'react-toastify';

import interviewService from '../../../../services/interviewService';
import questionService from '../../../../services/questionService';
import questionGroupService from '../../../../services/questionGroupService';
import jobService from '../../../../services/jobService';
import jobPostActivityService from '../../../../services/jobPostActivityService';
import { ROUTES } from '../../../../configs/constants';
import { transformQuestion, transformJobPost, transformAppliedResume, transformQuestionGroup } from '../../../../utils/transformers';
import DateTimePickerCustom from '../../../../components/controls/DateTimePickerCustom';

const InterviewCreateCard = ({ title = "Lên lịch Phỏng vấn trực tuyến" }) => {
    const navigate = useNavigate();
    const [jobs, setJobs] = useState([]);
    const [questions, setQuestions] = useState([]);
    const [questionGroups, setQuestionGroups] = useState([]);
    const [candidates, setCandidates] = useState([]);
    const [isLoadingData, setIsLoadingData] = useState(true);

    const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm({
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

    useEffect(() => {
        const fetchData = async () => {
            setIsLoadingData(true);
            try {
                const [jobsRes, questionsRes, groupsRes] = await Promise.all([
                    jobService.getEmployerJobPost(),
                    questionService.getQuestions({ pageSize: 1000 }),
                    questionGroupService.getQuestionGroups({ pageSize: 1000 })
                ]);

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
                toast.error('Lỗi khi tải dữ liệu ban đầu');
            } finally {
                setIsLoadingData(false);
            }
        };
        fetchData();
    }, []);

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
                .then(res => {
                    const rawCandidates = Array.isArray(res?.results)
                        ? res.results
                        : Array.isArray(res)
                            ? res
                            : Array.isArray(res?.data?.results)
                                ? res.data.results
                                : Array.isArray(res?.data)
                                    ? res.data
                                    : [];
                    setCandidates(rawCandidates.map(transformAppliedResume).filter(Boolean));
                    setValue('candidate', '');
                })
                .catch(err => {
                    console.error('Error fetching candidates', err);
                    toast.error('Lỗi khi tải danh sách ứng viên');
                });
        } else {
            setCandidates([]);
            setValue('candidate', '');
        }
    }, [selectedJobPostId, setValue]);

    const onSubmit = async (data) => {
        try {
            const payload = {
                job_post: data.job_post,
                candidate: data.candidate,
                scheduled_at: data.scheduled_at,
                question_ids: data.selected_questions,
                type: 'mixed'
            };
            await interviewService.scheduleSession(payload);
            toast.success('Đã lên lịch phỏng vấn thành công');
            // Fix double slash and ensure correct route
            navigate(`/${ROUTES.EMPLOYER.INTERVIEW_LIST}`);
        } catch (error) {
            console.error('Submit error:', error);
            toast.error('Lỗi khi lên lịch phỏng vấn');
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
                        background: (theme) => theme.palette.primary.gradient || theme.palette.primary.main,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        fontSize: { xs: '1.25rem', sm: '1.5rem' }
                    }}
                >
                    {title}
                </Typography>
            </Stack>

            <Paper sx={{ p: { xs: 2, sm: 4 }, borderRadius: 3, boxShadow: (theme) => theme.customShadows?.card || 2 }}>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <Controller
                                name="job_post"
                                control={control}
                                rules={{ required: 'Vui lòng chọn tin tuyển dụng' }}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        select
                                        fullWidth
                                        label="Chọn tin tuyển dụng"
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
                        <Grid item xs={12} md={6}>
                            <Controller
                                name="candidate"
                                control={control}
                                rules={{ required: 'Vui lòng chọn ứng viên' }}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        select
                                        fullWidth
                                        label="Chọn ứng viên"
                                        disabled={!selectedJobPostId || candidates.length === 0}
                                        error={!!errors.candidate}
                                        helperText={errors.candidate?.message || (selectedJobPostId && candidates.length === 0 ? 'Không có ứng viên nào đã ứng tuyển' : '')}
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
                        <Grid item xs={12} md={6}>
                            <DateTimePickerCustom
                                name="scheduled_at"
                                control={control}
                                title="Thời gian dự kiến"
                                showRequired
                                minDateTime={new Date().toISOString()}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Controller
                                name="selected_group"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        select
                                        fullWidth
                                        label="Chọn bộ câu hỏi (Tùy chọn)"
                                        variant="outlined"
                                        helperText="Chọn bộ câu hỏi để tự động điền các câu hỏi bên dưới"
                                    >
                                        <MenuItem value="">
                                            <em>Không chọn</em>
                                        </MenuItem>
                                        {questionGroups.map((group) => (
                                            <MenuItem key={group.id} value={group.id}>
                                                {group.name} ({group.questions?.length || 0} câu hỏi)
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                )}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl fullWidth variant="outlined" error={!!errors.selected_questions}>
                                <InputLabel>Chọn câu hỏi phỏng vấn</InputLabel>
                                <Controller
                                    name="selected_questions"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            {...field}
                                            multiple
                                            input={<OutlinedInput label="Chọn câu hỏi phỏng vấn" />}
                                            renderValue={(selected) => (
                                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                    {(Array.isArray(selected) ? selected : []).map((value) => {
                                                        const q = questions.find(item => item.id === value);
                                                        const label = q?.text || q?.questionText || q?.content || `Câu hỏi #${value}`;
                                                        return <Chip key={value} label={label.substring(0, 30) + (label.length > 30 ? '...' : '')} size="small" />;
                                                    })}
                                                </Box>
                                            )}
                                        >
                                            {questions.length === 0 && (
                                                <MenuItem disabled>
                                                    <em>Không có câu hỏi nào. Hãy tạo câu hỏi trong Ngân hàng câu hỏi.</em>
                                                </MenuItem>
                                            )}
                                            {questions.map((q) => (
                                                <MenuItem key={q.id} value={q.id}>
                                                    <Typography variant="body2" sx={{ maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                        {q.text || q.questionText || q.content || `Câu hỏi #${q.id}`}
                                                    </Typography>
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    )}
                                />
                                {errors.selected_questions && <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>{errors.selected_questions.message}</Typography>}
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <Divider sx={{ my: 2 }} />
                            <Stack direction="row" spacing={2} justifyContent="flex-end">
                                <Button
                                    onClick={() => navigate(-1)}
                                    variant="outlined"
                                    color="inherit"
                                    sx={{ borderRadius: 2, px: 3 }}
                                >
                                    Hủy bỏ
                                </Button>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    sx={{
                                        borderRadius: 2,
                                        px: 4,
                                        background: (theme) => theme.palette.primary.gradient
                                    }}
                                >
                                    Lên lịch ngay
                                </Button>
                            </Stack>
                        </Grid>
                    </Grid>
                </form>
            </Paper>
        </Box>
    );
};

export default InterviewCreateCard;

