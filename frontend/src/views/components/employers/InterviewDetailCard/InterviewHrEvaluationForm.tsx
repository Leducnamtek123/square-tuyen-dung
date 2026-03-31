import React from 'react';
import { 
    Box, 
    Button, 
    CircularProgress, 
    Divider, 
    MenuItem, 
    Paper, 
    Stack, 
    TextField, 
    Typography,
    InputAdornment,
    alpha,
    useTheme
} from '@mui/material';
import RateReviewIcon from '@mui/icons-material/RateReview';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import SchoolIcon from '@mui/icons-material/School';
import SendIcon from '@mui/icons-material/Send';
import { EvalFormType } from './index';
import { TFunction } from 'i18next';

interface InterviewHrEvaluationFormProps {
  evalForm: EvalFormType;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSubmit: () => void;
  disabled: boolean;
  submitting: boolean;
  t: TFunction;
}

const InterviewHrEvaluationForm: React.FC<InterviewHrEvaluationFormProps> = ({ evalForm, onChange, onSubmit, disabled, submitting, t }) => {
    const theme = useTheme();

    const inputSx = {
        '& .MuiOutlinedInput-root': {
            borderRadius: 2.5,
            backgroundColor: alpha(theme.palette.action.disabled, 0.03),
            '&:hover': { bgcolor: alpha(theme.palette.action.disabled, 0.06) },
            '& fieldset': { borderColor: alpha(theme.palette.divider, 0.8) }
        }
    };

    return (
        <Paper 
            elevation={0}
            sx={{
                p: { xs: 3, md: 5 },
                borderRadius: 4,
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: (theme) => theme.customShadows?.z1,
                bgcolor: 'background.paper',
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            <Stack direction="row" alignItems="center" spacing={1.5} mb={3}>
                <RateReviewIcon color="secondary" sx={{ fontSize: 24 }} />
                <Typography variant="h6" sx={{ fontWeight: 900, color: 'secondary.main', letterSpacing: '-0.5px' }}>
                    {t('interviewDetail.actions.hrEvaluation')}
                </Typography>
            </Stack>

            <Divider sx={{ mb: 4, borderStyle: 'dashed' }} />

            <Stack spacing={4}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
                    <TextField
                        label={t('interviewDetail.actions.attitudeScore')}
                        name="attitude_score"
                        type="number"
                        fullWidth
                        value={evalForm.attitude_score}
                        onChange={onChange}
                        sx={inputSx}
                        slotProps={{ 
                            htmlInput: { min: 0, max: 10, step: 0.1 },
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <EmojiEmotionsIcon sx={{ fontSize: 20, color: 'warning.main' }} />
                                    </InputAdornment>
                                ),
                            },
                            inputLabel: { sx: { fontWeight: 600 } }
                        }}
                    />
                    <TextField
                        label={t('interviewDetail.actions.professionalScore')}
                        name="professional_score"
                        type="number"
                        fullWidth
                        value={evalForm.professional_score}
                        onChange={onChange}
                        sx={inputSx}
                        slotProps={{ 
                            htmlInput: { min: 0, max: 10, step: 0.1 },
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SchoolIcon sx={{ fontSize: 20, color: 'info.main' }} />
                                    </InputAdornment>
                                ),
                            },
                            inputLabel: { sx: { fontWeight: 600 } }
                        }}
                    />
                </Stack>

                <TextField
                    select
                    label={t('interviewDetail.actions.resultLabel')}
                    name="result"
                    fullWidth
                    value={evalForm.result}
                    onChange={onChange}
                    sx={inputSx}
                    slotProps={{
                        inputLabel: { sx: { fontWeight: 600 } }
                    }}
                >
                    <MenuItem value="pending" sx={{ fontWeight: 600 }}>{t('interviewDetail.actions.pending')}</MenuItem>
                    <MenuItem value="passed" sx={{ fontWeight: 800, color: 'success.main', bgcolor: alpha(theme.palette.success.main, 0.04) }}>{t('interviewDetail.actions.passed')}</MenuItem>
                    <MenuItem value="failed" sx={{ fontWeight: 800, color: 'error.main', bgcolor: alpha(theme.palette.error.main, 0.04) }}>{t('interviewDetail.actions.failed')}</MenuItem>
                </TextField>

                <TextField
                    label={t('interviewDetail.actions.comments')}
                    name="comments"
                    multiline
                    rows={4}
                    fullWidth
                    value={evalForm.comments}
                    onChange={onChange}
                    placeholder="Enter HR feedback and internal notes..."
                    sx={inputSx}
                    slotProps={{
                        input: { sx: { lineHeight: 1.8 } },
                        inputLabel: { sx: { fontWeight: 600 } }
                    }}
                />

                <TextField
                    label={t('interviewDetail.actions.proposedSalary')}
                    name="proposed_salary"
                    type="number"
                    fullWidth
                    value={evalForm.proposed_salary}
                    onChange={onChange}
                    sx={{
                        ...inputSx,
                        '& .MuiOutlinedInput-root': {
                            ...inputSx['& .MuiOutlinedInput-root'],
                            fontWeight: 800, 
                            color: 'success.main'
                        }
                    }}
                    slotProps={{
                        input: {
                            startAdornment: (
                                <InputAdornment position="start">
                                    <MonetizationOnIcon sx={{ fontSize: 20, color: 'success.main' }} />
                                </InputAdornment>
                            ),
                        },
                        inputLabel: { sx: { fontWeight: 600 } }
                    }}
                />

                <Button
                    variant="contained"
                    color="secondary"
                    fullWidth
                    disabled={disabled || submitting}
                    onClick={onSubmit}
                    startIcon={!submitting && <SendIcon />}
                    sx={{ 
                        borderRadius: 3, 
                        py: 2, 
                        fontWeight: 900,
                        boxShadow: (theme) => theme.customShadows?.secondary,
                        textTransform: 'none',
                        fontSize: '1.1rem',
                        transition: 'all 0.25s',
                        '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: (theme) => theme.customShadows?.secondary
                        }
                    }}
                >
                    {submitting ? <CircularProgress size={24} color="inherit" /> : t('interviewDetail.actions.submitEvaluation')}
                </Button>
            </Stack>
        </Paper>
    );
};

export default InterviewHrEvaluationForm;
