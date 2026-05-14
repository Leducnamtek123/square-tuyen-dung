import React from 'react';
import { Box, Divider, Paper, Typography, Stack, List, ListItem, ListItemIcon, ListItemText, Chip } from '@mui/material';
import { Grid2 as Grid } from "@mui/material";
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import FeedIcon from '@mui/icons-material/Feed';
import { InterviewSession } from '@/types/models';
import { TFunction } from 'i18next';
import pc from '@/utils/muiColors';
import InterviewDetailSectionHeader from './InterviewDetailSectionHeader';
import { interviewDetailCardSx, interviewDetailPanelSx } from './sectionStyles';

interface InterviewAnalysisPanelProps {
  session: InterviewSession;
  t: TFunction;
}

type DetailedFeedbackRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is DetailedFeedbackRecord => Boolean(value && typeof value === 'object' && !Array.isArray(value));

const getFirstDefined = (...values: unknown[]) => values.find((value) => value !== undefined && value !== null && value !== '');

const toStringValue = (value: unknown): string | null => {
    if (typeof value === 'string' && value.trim()) return value.trim();
    if (typeof value === 'number' && Number.isFinite(value)) return String(value);
    return null;
};

const toStringArray = (value: unknown): string[] => {
    if (Array.isArray(value)) {
        return value.flatMap((item) => {
            const text = toStringValue(item);
            return text ? [text] : [];
        });
    }

    if (typeof value === 'string') {
        return value.split('\n').reduce<string[]>((items, item) => {
            const trimmedItem = item.trim();
            if (trimmedItem) items.push(trimmedItem);
            return items;
        }, []);
    }

    return [];
};

const InterviewAnalysisPanel: React.FC<InterviewAnalysisPanelProps> = ({ session, t }) => {
    const strengthsRaw = session.aiStrengths || session.ai_strengths;
    const strengths: string[] = toStringArray(strengthsRaw);
        
    const weaknessesRaw = session.aiWeaknesses || session.ai_weaknesses;
    const weaknesses: string[] = toStringArray(weaknessesRaw);

    const detailedFeedbackRaw = session.aiDetailedFeedback || session.ai_detailed_feedback;
    const detailedFeedback = isRecord(detailedFeedbackRaw) ? detailedFeedbackRaw : null;

    const questionPerformance = detailedFeedback
        ? toStringArray(getFirstDefined(
            detailedFeedback.questionPerformance,
            detailedFeedback.question_performance,
        ))
        : [];

    const structuredQuestionPerformance = detailedFeedback && Array.isArray(getFirstDefined(
        detailedFeedback.questionPerformance,
        detailedFeedback.question_performance,
    ))
        ? (getFirstDefined(
            detailedFeedback.questionPerformance,
            detailedFeedback.question_performance,
        ) as Array<Record<string, unknown>>)
        : [];

    const softSkills = detailedFeedback && isRecord(getFirstDefined(
        detailedFeedback.softSkills,
        detailedFeedback.soft_skills,
    ))
        ? (getFirstDefined(
            detailedFeedback.softSkills,
            detailedFeedback.soft_skills,
        ) as DetailedFeedbackRecord)
        : null;

    const culturalFit = detailedFeedback
        ? toStringValue(getFirstDefined(
            detailedFeedback.culturalFit,
            detailedFeedback.cultural_fit,
        ))
        : null;

    const hasStructuredFeedback = Boolean(detailedFeedback && (softSkills || culturalFit || questionPerformance.length));

    return (
        <Paper
            elevation={0}
            sx={interviewDetailCardSx}
        >
            <InterviewDetailSectionHeader icon={<AnalyticsIcon />} title={t('interviewDetail.subtitle.analysis')} />
            
            <Grid container spacing={2.5}>
                <Grid size={{ xs: 12, md: 6 }}>
                    <Stack spacing={2.5}>
                        <Typography variant="subtitle2" sx={{ color: 'success.main', display: 'flex', alignItems: 'center', fontWeight: 850, letterSpacing: 0, fontSize: '0.85rem' }}>
                            <CheckCircleOutlineIcon sx={{ mr: 1, fontSize: 18 }} />
                            {t('interviewDetail.label.strengths')}
                        </Typography>
                        <List dense sx={{ py: 0 }}>
                            {strengths.length > 0 ? strengths.map((item) => (
                                <ListItem 
                                    key={item} 
                                    sx={{ 
                                        px: 2, 
                                        py: 1.5, 
                                        alignItems: 'flex-start', 
                                        bgcolor: pc.success( 0.04), 
                                        borderRadius: 2, 
                                        mb: 1, 
                                        border: '1px solid', 
                                        borderColor: pc.success( 0.1) 
                                    }}
                                >
                                    <ListItemIcon sx={{ minWidth: 32, mt: 0.5 }}>
                                        <CheckCircleOutlineIcon sx={{ fontSize: 16, color: 'success.main' }} />
                                    </ListItemIcon>
                                    <ListItemText primary={item} slotProps={{ primary: { variant: 'body2', lineHeight: 1.6, fontWeight: 650, color: 'success.dark' } }} />
                                </ListItem>
                            )) : (
                                <Box sx={{ py: 4, textAlign: 'center', bgcolor: pc.actionDisabled( 0.03), borderRadius: 2, border: '1px dashed', borderColor: 'divider' }}>
                                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 750, letterSpacing: 0 }}>{t('interviewDetail.messages.noData')}</Typography>
                                </Box>
                            )}
                        </List>
                    </Stack>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                    <Stack spacing={2.5}>
                        <Typography variant="subtitle2" sx={{ color: 'error.main', display: 'flex', alignItems: 'center', fontWeight: 850, letterSpacing: 0, fontSize: '0.85rem' }}>
                            <ErrorOutlineIcon sx={{ mr: 1, fontSize: 18 }} />
                            {t('interviewDetail.label.weaknesses')}
                        </Typography>
                        <List dense sx={{ py: 0 }}>
                            {weaknesses.length > 0 ? weaknesses.map((item) => (
                                <ListItem 
                                    key={item} 
                                    sx={{ 
                                        px: 2, 
                                        py: 1.5, 
                                        alignItems: 'flex-start', 
                                        bgcolor: pc.error( 0.04), 
                                        borderRadius: 2, 
                                        mb: 1, 
                                        border: '1px solid', 
                                        borderColor: pc.error( 0.1) 
                                    }}
                                >
                                    <ListItemIcon sx={{ minWidth: 32, mt: 0.5 }}>
                                        <ErrorOutlineIcon sx={{ fontSize: 16, color: 'error.main' }} />
                                    </ListItemIcon>
                                    <ListItemText primary={item} slotProps={{ primary: { variant: 'body2', lineHeight: 1.6, fontWeight: 650, color: 'error.dark' } }} />
                                </ListItem>
                            )) : (
                                <Box sx={{ py: 4, textAlign: 'center', bgcolor: pc.actionDisabled( 0.03), borderRadius: 2, border: '1px dashed', borderColor: 'divider' }}>
                                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 750, letterSpacing: 0 }}>{t('interviewDetail.messages.noData')}</Typography>
                                </Box>
                            )}
                        </List>
                    </Stack>
                </Grid>

                <Grid size={12}>
                    <Box sx={{ 
                        ...interviewDetailPanelSx,
                        p: { xs: 2, md: 2.5 }, 
                        bgcolor: pc.primary( 0.02), 
                        borderColor: pc.primary( 0.1),
                    }}>
                        <Stack direction="row" alignItems="center" spacing={1.25} mb={2}>
                            <FeedIcon color="primary" sx={{ fontSize: 24 }} />
                            <Typography variant="subtitle1" sx={{ fontWeight: 850, letterSpacing: 0, color: 'primary.main', fontSize: '0.95rem' }}>
                                {t('interviewDetail.label.detailedFeedback')}
                            </Typography>
                        </Stack>
                        <Divider sx={{ mb: 2.5, opacity: 0.5 }} />
                        {typeof detailedFeedbackRaw === 'string' ? (
                            <Typography variant="body2" sx={{ lineHeight: 1.8, color: 'text.primary', fontWeight: 650, whiteSpace: 'pre-wrap' }}>
                                {detailedFeedbackRaw}
                            </Typography>
                        ) : hasStructuredFeedback ? (
                            <Stack spacing={2}>
                                {softSkills && (
                                    <Box
                                        sx={{
                                            p: 2,
                                            borderRadius: 2,
                                            bgcolor: pc.bgPaper(0.72),
                                            border: '1px solid',
                                            borderColor: pc.primary( 0.08),
                                        }}
                                    >
                                        <Typography variant="subtitle2" sx={{ fontWeight: 850, color: 'primary.main', letterSpacing: 0 }}>
                                            {t('interviewDetail.label.softSkills')}
                                        </Typography>
                                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mt: 1.5, flexWrap: 'wrap' }}>
                                            {toStringValue(getFirstDefined(softSkills.confidence, softSkills.confidence_score)) && (
                                                <Chip label={`${t('interviewDetail.label.confidence')}: ${toStringValue(getFirstDefined(softSkills.confidence, softSkills.confidence_score))}`} size="small" sx={{ fontWeight: 800, borderRadius: 1.5, letterSpacing: 0 }} />
                                            )}
                                            {toStringValue(getFirstDefined(softSkills.clarity, softSkills.clarity_score)) && (
                                                <Chip label={`${t('interviewDetail.label.clarity')}: ${toStringValue(getFirstDefined(softSkills.clarity, softSkills.clarity_score))}`} size="small" sx={{ fontWeight: 800, borderRadius: 1.5, letterSpacing: 0 }} />
                                            )}
                                            {toStringValue(getFirstDefined(softSkills.tone, softSkills.voice)) && (
                                                <Chip label={`${t('interviewDetail.label.tone')}: ${toStringValue(getFirstDefined(softSkills.tone, softSkills.voice))}`} size="small" sx={{ fontWeight: 800, borderRadius: 1.5, letterSpacing: 0 }} />
                                            )}
                                        </Stack>
                                    </Box>
                                )}

                                {culturalFit && (
                                    <Box
                                        sx={{
                                            p: 2,
                                            borderRadius: 2,
                                            bgcolor: pc.info( 0.04),
                                            border: '1px solid',
                                            borderColor: pc.info( 0.12),
                                        }}
                                    >
                                        <Typography variant="subtitle2" sx={{ fontWeight: 850, color: 'info.main', letterSpacing: 0 }}>
                                            {t('interviewDetail.label.culturalFit')}
                                        </Typography>
                                        <Typography variant="body2" sx={{ mt: 1, lineHeight: 1.75, color: 'text.primary', fontWeight: 600 }}>
                                            {culturalFit}
                                        </Typography>
                                    </Box>
                                )}

                                {structuredQuestionPerformance.length > 0 && (
                                    <Box
                                        sx={{
                                            p: 2,
                                            borderRadius: 2,
                                            bgcolor: pc.actionDisabled( 0.03),
                                            border: '1px solid',
                                            borderColor: 'divider',
                                        }}
                                    >
                                        <Typography variant="subtitle2" sx={{ fontWeight: 850, color: 'text.primary', letterSpacing: 0 }}>
                                            {t('interviewDetail.label.questionPerformance')}
                                        </Typography>
                                        <Stack spacing={1.5} sx={{ mt: 1.5 }}>
                                            {structuredQuestionPerformance.map((item, idx) => {
                                                const question = toStringValue(getFirstDefined(item.question, item.question_text, item.text)) || `${t('interviewDetail.label.question')} ${idx + 1}`;
                                                const feedback = toStringValue(getFirstDefined(item.feedback, item.comment, item.answer)) || t('interviewDetail.messages.noDetails');
                                                const score = toStringValue(getFirstDefined(item.score, item.points));

                                                return (
                                                    <Box
                                                        key={`${question}-${feedback}-${score ?? 'na'}`}
                                                        sx={{
                                                            p: 2,
                                                            borderRadius: 2,
                                                            bgcolor: pc.bgPaper( 0.9),
                                                            border: '1px solid',
                                                            borderColor: pc.divider( 0.9),
                                                        }}
                                                    >
                                                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
                                                            <Typography variant="body2" sx={{ fontWeight: 800, color: 'text.primary', lineHeight: 1.6 }}>
                                                                {question}
                                                            </Typography>
                                                            {score && (
                                                                <Chip
                                                                    label={score}
                                                                    size="small"
                                                                    sx={{
                                                                        fontWeight: 850,
                                                                        bgcolor: pc.primary( 0.08),
                                                                        color: 'primary.main',
                                                                    }}
                                                                />
                                                            )}
                                                        </Stack>
                                                        <Typography variant="body2" sx={{ mt: 1, lineHeight: 1.75, color: 'text.secondary', fontWeight: 600, whiteSpace: 'pre-wrap' }}>
                                                            {feedback}
                                                        </Typography>
                                                    </Box>
                                                );
                                            })}
                                        </Stack>
                                    </Box>
                                )}
                            </Stack>
                        ) : (
                            <Typography variant="body2" sx={{ lineHeight: 1.8, color: 'text.primary', fontWeight: 650, whiteSpace: 'pre-wrap' }}>
                                {t('interviewDetail.messages.noDetails')}
                            </Typography>
                        )}
                    </Box>
                </Grid>
            </Grid>
        </Paper>
    );
};

export default InterviewAnalysisPanel;
