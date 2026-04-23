import toastMessages from '../../../../utils/toastMessages';
import React, { useEffect, useReducer } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Box, Chip, Autocomplete, CircularProgress, Alert } from "@mui/material";
import { useTranslation, Trans } from 'react-i18next';

import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import questionService from '../../../../services/questionService';
import { User as UserModel, Question } from '../../../../types/models';

interface ScheduleInterviewDialogProps {
    open: boolean;
    onClose: () => void;
    user: UserModel | null;
}

const ScheduleInterviewDialog = ({ open, onClose, user }: ScheduleInterviewDialogProps) => {
    const { t } = useTranslation('admin');
    const [state, dispatch] = useReducer(
        (
            current: {
                scheduledAt: Dayjs | null;
                notes: string;
                selectedQuestions: Question[];
                questions: Question[];
                loadingQuestions: boolean;
            },
            action:
                | { type: 'set_scheduled_at'; value: Dayjs | null }
                | { type: 'set_notes'; value: string }
                | { type: 'set_selected_questions'; value: Question[] }
                | { type: 'set_questions'; value: Question[] }
                | { type: 'set_loading_questions'; value: boolean }
                | { type: 'reset_form' }
        ) => {
            switch (action.type) {
                case 'set_scheduled_at':
                    return { ...current, scheduledAt: action.value };
                case 'set_notes':
                    return { ...current, notes: action.value };
                case 'set_selected_questions':
                    return { ...current, selectedQuestions: action.value };
                case 'set_questions':
                    return { ...current, questions: action.value };
                case 'set_loading_questions':
                    return { ...current, loadingQuestions: action.value };
                case 'reset_form':
                    return {
                        scheduledAt: dayjs().add(1, 'day'),
                        notes: '',
                        selectedQuestions: [],
                        questions: [],
                        loadingQuestions: false,
                    };
                default:
                    return current;
            }
        },
        {
            scheduledAt: dayjs().add(1, 'day'),
            notes: '',
            selectedQuestions: [],
            questions: [],
            loadingQuestions: false,
        }
    );

    useEffect(() => {
        if (open) {
            dispatch({ type: 'set_loading_questions', value: true });
            questionService.getQuestions({ pageSize: 100 })
                .then((res) => {
                    const items = res?.results || [];
                    dispatch({ type: 'set_questions', value: items });
                })
                .catch(console.error)
                .finally(() => dispatch({ type: 'set_loading_questions', value: false }));
        }
    }, [open]);

    useEffect(() => {
        if (!open) {
            dispatch({ type: 'reset_form' });
        }
    }, [open]);

    const handleSubmit = async () => {
        if (!state.scheduledAt || !user) return;
        const payload = {
            candidate: user.id,
            candidate_name: user.fullName || user.email,
            candidate_email: user.email,
            scheduled_at: state.scheduledAt.toISOString(),
            interview_type: 'VETTING',
            notes: state.notes,
            question_ids: state.selectedQuestions.map(q => q.id),
        };

        try {
            toastMessages.success('Under construction'); 
            onClose();
        } catch (err) {
            console.error('Schedule interview error:', err);
        }
    };

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
                        options={state.questions}
                            getOptionLabel={(opt) => opt.content || opt.text || `Question #${opt.id}`}
                        value={state.selectedQuestions}
                            isOptionEqualToValue={(option, value) => option.id === value.id}
                        onChange={(_, v) => dispatch({ type: 'set_selected_questions', value: v })}
                        loading={state.loadingQuestions}
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
                                                {state.loadingQuestions && <CircularProgress size={20} />}
                                                {params.InputProps.endAdornment}
                                            </>
                                        ),
                                    }
                                }}
                            />
                        )}
                        renderTags={(value, getTagProps) =>
                            value.map((opt, idx) => (
                                <Chip
                                    {...getTagProps({ index: idx })}
                                    key={opt.id}
                                    label={opt.content || opt.text || `#${opt.id}`}
                                    size="small"
                                    color="primary"
                                    variant="outlined"
                                />
                            ))
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
                    disabled={!state.scheduledAt}
                    >
                        {t('pages.users.scheduleInterviewDialog.submitBtn')}
                    </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ScheduleInterviewDialog;
