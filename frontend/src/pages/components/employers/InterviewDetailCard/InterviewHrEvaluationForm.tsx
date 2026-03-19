import React from 'react';
import { Box, Button, CircularProgress, Divider, MenuItem, Paper, Stack, TextField, Typography } from '@mui/material';
import { EvalFormType } from './index';

interface InterviewHrEvaluationFormProps {
  evalForm: EvalFormType;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSubmit: () => void;
  disabled: boolean;
  submitting: boolean;
  t: (key: string, options?: any) => string;
}

const InterviewHrEvaluationForm: React.FC<InterviewHrEvaluationFormProps> = ({ evalForm, onChange, onSubmit, disabled, submitting, t }) => {
    return (
        <Paper sx={{
            p: 3,
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: (theme) => theme.shadows[1],
            bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.1)' : '#fff'
        }}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 700, color: 'secondary.main' }}>
                {t('interviewDetail.actions.hrEvaluation')}
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Stack spacing={2.5}>
                <Stack direction="row" spacing={2}>
                    <TextField
                        label={t('interviewDetail.actions.attitudeScore')}
                        name="attitude_score"
                        type="number"
                        fullWidth
                        value={evalForm.attitude_score}
                        onChange={onChange}
                        slotProps={{ htmlInput: { min: 0, max: 10, step: 0.1 } }}
                    />
                    <TextField
                        label={t('interviewDetail.actions.professionalScore')}
                        name="professional_score"
                        type="number"
                        fullWidth
                        value={evalForm.professional_score}
                        onChange={onChange}
                        slotProps={{ htmlInput: { min: 0, max: 10, step: 0.1 } }}
                    />
                </Stack>
                <TextField
                    select
                    label={t('interviewDetail.actions.resultLabel')}
                    name="result"
                    fullWidth
                    value={evalForm.result}
                    onChange={onChange}
                >
                    <MenuItem value="pending">{t('interviewDetail.actions.pending')}</MenuItem>
                    <MenuItem value="passed">{t('interviewDetail.actions.passed')}</MenuItem>
                    <MenuItem value="failed">{t('interviewDetail.actions.failed')}</MenuItem>
                </TextField>
                <TextField
                    label={t('interviewDetail.actions.comments')}
                    name="comments"
                    multiline
                    rows={3}
                    fullWidth
                    value={evalForm.comments}
                    onChange={onChange}
                />
                <TextField
                    label={t('interviewDetail.actions.proposedSalary')}
                    name="proposed_salary"
                    type="number"
                    fullWidth
                    value={evalForm.proposed_salary}
                    onChange={onChange}
                />
                <Button
                    variant="contained"
                    color="secondary"
                    fullWidth
                    disabled={disabled}
                    onClick={onSubmit}
                    sx={{ borderRadius: 2, py: 1.2, fontWeight: 700 }}
                >
                    {submitting ? <CircularProgress size={24} color="inherit" /> : t('interviewDetail.actions.submitEvaluation')}
                </Button>
            </Stack>
        </Paper>
    );
};

export default InterviewHrEvaluationForm;
