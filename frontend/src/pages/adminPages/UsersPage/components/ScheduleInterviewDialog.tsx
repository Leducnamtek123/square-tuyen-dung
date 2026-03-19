import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Box, Chip, Autocomplete, CircularProgress, Alert } from "@mui/material";
import { useTranslation, Trans } from 'react-i18next';

import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import questionService from '../../../../services/questionService';
import { useScheduleInterview } from '../../InterviewsPage/hooks/useInterviews';

interface ScheduleInterviewDialogProps {
    open: boolean;
    onClose: () => void;
    user: any;
}

const ScheduleInterviewDialog = ({ open, onClose, user }: ScheduleInterviewDialogProps) => {
    const { t } = useTranslation('admin');
    const [scheduledAt, setScheduledAt] = useState<Dayjs | null>(dayjs().add(1, 'day'));
    const [notes, setNotes] = useState('');
    const [selectedQuestions, setSelectedQuestions] = useState<any[]>([]);
    const [questions, setQuestions] = useState<any[]>([]);
    const [loadingQuestions, setLoadingQuestions] = useState(false);

    const scheduleInterviewMutation = useScheduleInterview() as any;

    useEffect(() => {
        if (open) {
            setLoadingQuestions(true);
            questionService.getQuestions({ pageSize: 100 })
                .then((res: any) => {
                    const items = res?.results || res || [];
                    setQuestions(items);
                })
                .catch(console.error)
                .finally(() => setLoadingQuestions(false));
        }
    }, [open]);

    useEffect(() => {
        if (!open) {
            setScheduledAt(dayjs().add(1, 'day'));
            setNotes('');
            setSelectedQuestions([]);
        }
    }, [open]);

    const handleSubmit = async () => {
        if (!scheduledAt) return;
        const payload = {
            candidate: user?.id,
            candidate_name: user?.fullName || user?.email,
            candidate_email: user?.email,
            scheduled_at: scheduledAt.toISOString(),
            interview_type: 'VETTING',
            notes,
            question_ids: selectedQuestions.map(q => q.id),
        };

        try {
            await scheduleInterviewMutation.mutateAsync(payload);
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
                            value={scheduledAt}
                            onChange={(v) => setScheduledAt(v)}
                            minDateTime={dayjs()}
                            slotProps={{
                                textField: { fullWidth: true }
                            }}
                        />
                    </LocalizationProvider>

                    <Autocomplete
                        multiple
                        options={questions}
                        getOptionLabel={(opt) => opt.text || opt.content || `Question #${opt.id}`}
                        value={selectedQuestions}
                        onChange={(_, v) => setSelectedQuestions(v)}
                        loading={loadingQuestions}
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
                            value.map((opt, idx) => (
                                <Chip
                                    {...getTagProps({ index: idx })}
                                    key={opt.id}
                                    label={opt.text || opt.content || `#${opt.id}`}
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
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder={t('pages.users.scheduleInterviewDialog.notesPlaceholder')}
                        fullWidth
                    />
                </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={onClose} color="inherit">
                    {t('pages.users.scheduleInterviewDialog.cancelBtn')}
                </Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={scheduleInterviewMutation.isPending || !scheduledAt}
                >
                    {scheduleInterviewMutation.isPending 
                        ? t('pages.users.scheduleInterviewDialog.schedulingBtn') 
                        : t('pages.users.scheduleInterviewDialog.submitBtn')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ScheduleInterviewDialog;
