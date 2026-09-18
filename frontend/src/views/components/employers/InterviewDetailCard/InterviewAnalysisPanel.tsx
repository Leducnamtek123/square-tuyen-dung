import React from 'react';
import { Box, Divider, Paper, Typography, Stack, List, ListItem, ListItemIcon, ListItemText, Chip, alpha, useTheme } from '@mui/material';
import { Grid2 as Grid } from "@mui/material";
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import FeedIcon from '@mui/icons-material/Feed';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import Diversity3Icon from '@mui/icons-material/Diversity3';
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
    const theme = useTheme();
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
        <Paper elevation={0} sx={interviewDetailCardSx}>
            <InterviewDetailSectionHeader icon={<AnalyticsIcon />} title={t('interviewDetail.subtitle.analysis')} />
            
            <Grid container spacing={2.5}>
                {/* Strengths Bento Box */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <Box
                        sx={{
                            p: 2.25,
                            borderRadius: 3.5,
                            bgcolor: alpha('#16a34a', 0.03),
                            border: '1px solid',
                            borderColor: alpha('#16a34a', 0.15),
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                        }}
                    >
                        <Stack direction="row" alignItems="center" spacing={1.25} sx={{ mb: 2 }}>
                            <Box
                                sx={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: '10px',
                                    bgcolor: alpha('#16a34a', 0.1),
                                    color: '#16a34a',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <EmojiEventsOutlinedIcon sx={{ fontSize: 18 }} />
                            </Box>
                            <Typography variant="subtitle2" sx={{ color: '#15803d', fontWeight: 800, fontSize: '0.875rem', letterSpacing: '-0.01em' }}>
                                {t('interviewDetail.label.strengths')}
                            </Typography>
                        </Stack>

                        <List dense sx={{ py: 0, flex: 1 }}>
                            {strengths.length > 0 ? strengths.map((item, idx) => (
                                <ListItem 
                                    key={`${item}-${idx}`} 
                                    sx={{ 
                                        px: 1.75, 
                                        py: 1.25, 
                                        alignItems: 'flex-start', 
                                        bgcolor: 'background.paper', 
                                        borderRadius: 2.5, 
                                        mb: 1.25, 
                                        border: '1px solid', 
                                        borderColor: alpha('#16a34a', 0.15),
                                        boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                                    }}
                                >
                                    <ListItemIcon sx={{ minWidth: 26, mt: 0.25 }}>
                                        <CheckCircleOutlineIcon sx={{ fontSize: 16, color: '#16a34a' }} />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={item}
                                        slotProps={{
                                            primary: {
                                                variant: 'body2',
                                                lineHeight: 1.6,
                                                fontWeight: 600,
                                                color: 'text.primary',
                                                fontSize: '0.8125rem',
                                            },
                                        }}
                                    />
                                </ListItem>
                            )) : (
                                <Box sx={{ py: 4, textAlign: 'center', bgcolor: 'action.hover', borderRadius: 2.5, border: '1px dashed', borderColor: 'divider' }}>
                                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>{t('interviewDetail.messages.noData')}</Typography>
                                </Box>
                            )}
                        </List>
                    </Box>
                </Grid>

                {/* Weaknesses Bento Box */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <Box
                        sx={{
                            p: 2.25,
                            borderRadius: 3.5,
                            bgcolor: alpha('#f59e0b', 0.03),
                            border: '1px solid',
                            borderColor: alpha('#f59e0b', 0.18),
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                        }}
                    >
                        <Stack direction="row" alignItems="center" spacing={1.25} sx={{ mb: 2 }}>
                            <Box
                                sx={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: '10px',
                                    bgcolor: alpha('#f59e0b', 0.12),
                                    color: '#d97706',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <TrackChangesIcon sx={{ fontSize: 18 }} />
                            </Box>
                            <Typography variant="subtitle2" sx={{ color: '#b45309', fontWeight: 800, fontSize: '0.875rem', letterSpacing: '-0.01em' }}>
                                {t('interviewDetail.label.weaknesses')}
                            </Typography>
                        </Stack>

                        <List dense sx={{ py: 0, flex: 1 }}>
                            {weaknesses.length > 0 ? weaknesses.map((item, idx) => (
                                <ListItem 
                                    key={`${item}-${idx}`} 
                                    sx={{ 
                                        px: 1.75, 
                                        py: 1.25, 
                                        alignItems: 'flex-start', 
                                        bgcolor: 'background.paper', 
                                        borderRadius: 2.5, 
                                        mb: 1.25, 
                                        border: '1px solid', 
                                        borderColor: alpha('#f59e0b', 0.2),
                                        boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                                    }}
                                >
                                    <ListItemIcon sx={{ minWidth: 26, mt: 0.25 }}>
                                        <ErrorOutlineIcon sx={{ fontSize: 16, color: '#d97706' }} />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={item}
                                        slotProps={{
                                            primary: {
                                                variant: 'body2',
                                                lineHeight: 1.6,
                                                fontWeight: 600,
                                                color: 'text.primary',
                                                fontSize: '0.8125rem',
                                            },
                                        }}
                                    />
                                </ListItem>
                            )) : (
                                <Box sx={{ py: 4, textAlign: 'center', bgcolor: 'action.hover', borderRadius: 2.5, border: '1px dashed', borderColor: 'divider' }}>
                                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>{t('interviewDetail.messages.noData')}</Typography>
                                </Box>
                            )}
                        </List>
                    </Box>
                </Grid>

                {/* Detailed Feedback & Cultural Fit */}
                <Grid size={12}>
                    <Box sx={{ 
                        ...interviewDetailPanelSx,
                        p: { xs: 2, md: 2.5 }, 
                        bgcolor: 'background.paper', 
                        borderColor: 'divider',
                        borderRadius: 3.5,
                    }}>
                        <Stack direction="row" alignItems="center" spacing={1.25} mb={2}>
                            <FeedIcon color="primary" sx={{ fontSize: 22 }} />
                            <Typography variant="subtitle1" sx={{ fontWeight: 800, letterSpacing: '-0.01em', color: 'text.primary', fontSize: '0.9375rem' }}>
                                {t('interviewDetail.label.detailedFeedback')}
                            </Typography>
                        </Stack>
                        <Divider sx={{ mb: 2.5 }} />
                        {typeof detailedFeedbackRaw === 'string' ? (
                            <Typography variant="body2" sx={{ lineHeight: 1.8, color: 'text.primary', fontWeight: 500, whiteSpace: 'pre-wrap', fontSize: '0.875rem' }}>
                                {detailedFeedbackRaw}
                            </Typography>
                        ) : hasStructuredFeedback ? (
                            <Stack spacing={2}>
                                {softSkills && (
                                    <Box
                                        sx={{
                                            p: 2,
                                            borderRadius: 2.5,
                                            bgcolor: alpha(theme.palette.primary.main, 0.03),
                                            border: '1px solid',
                                            borderColor: alpha(theme.palette.primary.main, 0.12),
                                        }}
                                    >
                                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.25 }}>
                                            <RecordVoiceOverIcon sx={{ fontSize: 18, color: 'primary.main' }} />
                                            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'primary.main', fontSize: '0.8125rem' }}>
                                                {t('interviewDetail.label.softSkills')}
                                            </Typography>
                                        </Stack>
                                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ flexWrap: 'wrap' }}>
                                            {toStringValue(getFirstDefined(softSkills.confidence, softSkills.confidence_score)) && (
                                                <Chip
                                                    label={`${t('interviewDetail.label.confidence')}: ${toStringValue(getFirstDefined(softSkills.confidence, softSkills.confidence_score))}`}
                                                    size="small"
                                                    sx={{ fontWeight: 750, borderRadius: '8px', fontSize: '0.75rem', bgcolor: alpha('#16a34a', 0.1), color: '#16a34a', border: '1px solid', borderColor: alpha('#16a34a', 0.2) }}
                                                />
                                            )}
                                            {toStringValue(getFirstDefined(softSkills.clarity, softSkills.clarity_score)) && (
                                                <Chip
                                                    label={`${t('interviewDetail.label.clarity')}: ${toStringValue(getFirstDefined(softSkills.clarity, softSkills.clarity_score))}`}
                                                    size="small"
                                                    sx={{ fontWeight: 750, borderRadius: '8px', fontSize: '0.75rem', bgcolor: alpha('#0284c7', 0.1), color: '#0284c7', border: '1px solid', borderColor: alpha('#0284c7', 0.2) }}
                                                />
                                            )}
                                            {toStringValue(getFirstDefined(softSkills.tone, softSkills.voice)) && (
                                                <Chip
                                                    label={`${t('interviewDetail.label.tone')}: ${toStringValue(getFirstDefined(softSkills.tone, softSkills.voice))}`}
                                                    size="small"
                                                    sx={{ fontWeight: 750, borderRadius: '8px', fontSize: '0.75rem', bgcolor: alpha('#6366f1', 0.1), color: '#6366f1', border: '1px solid', borderColor: alpha('#6366f1', 0.2) }}
                                                />
                                            )}
                                        </Stack>
                                    </Box>
                                )}

                                {culturalFit && (
                                    <Box
                                        sx={{
                                            p: 2,
                                            borderRadius: 2.5,
                                            bgcolor: alpha('#6366f1', 0.03),
                                            border: '1px solid',
                                            borderColor: alpha('#6366f1', 0.14),
                                        }}
                                    >
                                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                                            <Diversity3Icon sx={{ fontSize: 18, color: '#6366f1' }} />
                                            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#6366f1', fontSize: '0.8125rem' }}>
                                                {t('interviewDetail.label.culturalFit')}
                                            </Typography>
                                        </Stack>
                                        <Typography variant="body2" sx={{ lineHeight: 1.75, color: 'text.primary', fontWeight: 500, fontSize: '0.875rem' }}>
                                            {culturalFit}
                                        </Typography>
                                    </Box>
                                )}

                                {structuredQuestionPerformance.length > 0 && (
                                    <Box
                                        sx={{
                                            p: 2,
                                            borderRadius: 2.5,
                                            bgcolor: 'action.hover',
                                            border: '1px solid',
                                            borderColor: 'divider',
                                        }}
                                    >
                                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.primary', mb: 1.5, fontSize: '0.8125rem' }}>
                                            {t('interviewDetail.label.questionPerformance')}
                                        </Typography>
                                        <Stack spacing={1.5}>
                                            {structuredQuestionPerformance.map((item, idx) => {
                                                const question = toStringValue(getFirstDefined(item.question, item.question_text, item.text)) || t('interviewDetail.label.question');
                                                const feedback = toStringValue(getFirstDefined(item.feedback, item.comment, item.answer)) || t('interviewDetail.messages.noDetails');
                                                const score = toStringValue(getFirstDefined(item.score, item.points));

                                                return (
                                                    <Box
                                                        key={String((item as { id?: unknown })?.id || `${question}-${idx}`)}
                                                        sx={{
                                                            p: 2,
                                                            borderRadius: 2,
                                                            bgcolor: 'background.paper',
                                                            border: '1px solid',
                                                            borderColor: 'divider',
                                                        }}
                                                    >
                                                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
                                                            <Typography variant="body2" sx={{ fontWeight: 750, color: 'text.primary', lineHeight: 1.6, fontSize: '0.8125rem' }}>
                                                                {question}
                                                            </Typography>
                                                            {score && (
                                                                <Chip
                                                                    label={`${score}/10`}
                                                                    size="small"
                                                                    sx={{
                                                                        fontWeight: 850,
                                                                        bgcolor: alpha(theme.palette.primary.main, 0.08),
                                                                        color: 'primary.main',
                                                                        borderRadius: '6px',
                                                                        fontSize: '0.6875rem',
                                                                    }}
                                                                />
                                                            )}
                                                        </Stack>
                                                        <Typography variant="body2" sx={{ mt: 1, lineHeight: 1.7, color: 'text.secondary', fontWeight: 500, whiteSpace: 'pre-wrap', fontSize: '0.8125rem' }}>
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
                            <Typography variant="body2" sx={{ lineHeight: 1.8, color: 'text.primary', fontWeight: 500, whiteSpace: 'pre-wrap', fontSize: '0.875rem' }}>
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
