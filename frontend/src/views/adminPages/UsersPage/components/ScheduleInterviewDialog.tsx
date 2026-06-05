'use client';

import toastMessages from '../../../../utils/toastMessages';
import React, { useEffect, useReducer, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Box, Chip, Autocomplete, CircularProgress, Alert } from "@mui/material";
import { useTranslation, Trans } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';

import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import interviewService from '../../../../services/interviewService';
import questionService from '../../../../services/questionService';
import { User as UserModel, Question } from '../../../../types/models';

interface ScheduleInterviewDialogProps {
    open: boolean;
    onClose: () => void;
    user: UserModel | null;
}

type ScheduleQuestionResponse = {
    results?: Question[];
    data?: Question[] | { results?: Question[] };
};

export const normalizeScheduleQuestionOptions = (response: unknown): Question[] => {
    if (Array.isArray(response)) return response as Question[];
    if (!response || typeof response !== 'object') return [];

    const payload = response as ScheduleQuestionResponse;
    if (Array.isArray(payload.results)) return payload.results;
    if (Array.isArray(payload.data)) return payload.data;
    if (payload.data && typeof payload.data === 'object' && Array.isArray(payload.data.results)) {
        return payload.data.results;
    }
    return [];
};

const ScheduleInterviewDialog = ({ open, onClose, user }: ScheduleInterviewDialogProps) => {
    const { t } = useTranslation(['admin', 'common']);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { data: loadedQuestions = [], isFetching: loadingQuestions } = useQuery({
        queryKey: ['schedule-interview-questions', open],
        queryFn: async () => {
            const res = await questionService.getQuestions({ pageSize: 100 });
            return normalizeScheduleQuestionOptions(res);
        },
        enabled: open,
        staleTime: 0,
    });
    const [state, dispatch] = useReducer(
        (
            current: {
                scheduledAt: Dayjs | null;
                notes: string;
                selectedQuestions: Question[];
            },
            action:
                | { type: 'set_scheduled_at'; value: Dayjs | null }
                | { type: 'set_notes'; value: string }
                | { type: 'set_selected_questions'; value: Question[] }
                | { type: 'reset_form' }
        ) => {
            switch (action.type) {
                case 'set_scheduled_at':
                    return { ...current, scheduledAt: action.value };
                case 'set_notes':
                    return { ...current, notes: action.value };
                case 'set_selected_questions':
                    return { ...current, selectedQuestions: action.value };
                case 'reset_form':
                    return {
                        scheduledAt: dayjs().add(1, 'day'),
                        notes: '',
                        selectedQuestions: [],
                    };
                default:
                    return current;
            }
        },
        {
            scheduledAt: dayjs().add(1, 'day'),
            notes: '',
            selectedQuestions: [],
        }
    );

    useEffect(() => {
        if (!open) {
            dispatch({ type: 'reset_form' });
        }
    }, [open]);

    const handleSubmit = async () => {
        if (!state.scheduledAt || !user || isSubmitting) return;
        const questionIds = state.selectedQuestions.map((question) => question.id);
        const payload = {
            candidate: Number(user.id),
            scheduled_at: state.scheduledAt.toISOString(),
            type: 'mixed' as const,
            notes: state.notes.trim() || undefined,
            question_ids: questionIds,
        };

        try {
            setIsSubmitting(true);
            await interviewService.scheduleSession(payload);
            toastMessages.success(t('pages.users.scheduleInterviewDialog.success'));
            onClose();
        } catch (err) {
            toastMessages.error(t('pages.users.scheduleInterviewDialog.error'));
            console.error('Schedule interview error:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const getQuestionLabel = (question: Question) => (
        question.content || question.text || t('pages.users.scheduleInterviewDialog.questionFallback', { id: question.id })
    );

    if (!user) return null;

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                <VideocamOutlinedIcon color="primary" /> {t('pages.users.scheduleInterviewDialog.title')}
            </DialogTitle>
            <DialogContent>
                <Alert severity="info" sx={{ mb: 2, mt: 1 }}>
                    <Trans
                        i18nKey="pages.users.scheduleInterviewDialog.vettingFor"
                        t={t}
                        values={{ name: user.fullName || user.email }}
                        components={{ strong: <strong /> }}
                    />
                    {user.roleName && (
                        <Chip label={user.roleName} size="small" sx={{ ml: 1 }}
                            color={user.roleName === 'EMPLOYER' ? 'primary' : 'default'}
                        />
                    )}
                </Alert>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DateTimePicker
                            label={t('pages.users.scheduleInterviewDialog.timeLabel')}
                            value={state.scheduledAt}
                            onChange={(v) => dispatch({ type: 'set_scheduled_at', value: v })}
                            minDateTime={dayjs()}
                            slotProps={{
                                textField: { fullWidth: true }
                            }}
                        />
                    </LocalizationProvider>

                        <Autocomplete
                            multiple
                        options={loadedQuestions}
                            getOptionLabel={getQuestionLabel}
                        value={state.selectedQuestions}
                            isOptionEqualToValue={(option, value) => option.id === value.id}
                        onChange={(_, v) => dispatch({ type: 'set_selected_questions', value: v })}
                        loading={loadingQuestions}
                        noOptionsText={t('common:noOptions')}
                        loadingText={t('common:loading')}
                        openText={t('common:autocomplete.open')}
                        closeText={t('common:autocomplete.close')}
                        clearText={t('common:autocomplete.clear')}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label={t('pages.users.scheduleInterviewDialog.questionsLabel')}
                                placeholder={t('pages.users.scheduleInterviewDialog.questionsPlaceholder')}
                                slotProps={{
                                    input: {
                                        ...params.InputProps,
                                    endAdornment: (
                                        <>
                                                {loadingQuestions && <CircularProgress size={20} />}
                                                {params.InputProps.endAdornment}
                                            </>
                                        ),
                                    }
                                }}
                            />
                        )}
                        renderTags={(value, getTagProps) =>
                            value.map((opt, idx) => {
                                const { key: tagKey, ...tagProps } = getTagProps({ index: idx });
                                return (
                                    <Chip
                                        key={opt.id ?? tagKey}
                                        {...tagProps}
                                        label={getQuestionLabel(opt)}
                                        size="small"
                                        color="primary"
                                        variant="outlined"
                                    />
                                );
                            })
                        }
                    />

                        <TextField
                        label={t('pages.users.scheduleInterviewDialog.notesLabel')}
                        multiline
                        rows={3}
                        value={state.notes}
                        onChange={(e) => dispatch({ type: 'set_notes', value: e.target.value })}
                        placeholder={t('pages.users.scheduleInterviewDialog.notesPlaceholder')}
                        fullWidth
                    />
                </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3 }}>
                <Button onClick={onClose} color="inherit">
                    {t('pages.users.scheduleInterviewDialog.cancelBtn')}
                </Button>
                    <Button
                        onClick={handleSubmit}
                        variant="contained"
                    disabled={!state.scheduledAt || isSubmitting}
                    >
                        {isSubmitting
                            ? t('pages.users.scheduleInterviewDialog.schedulingBtn')
                            : t('pages.users.scheduleInterviewDialog.submitBtn')}
                    </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ScheduleInterviewDialog;
