import React from 'react';
import { Box, Button, Chip, CircularProgress, LinearProgress, Paper, Stack, Typography, alpha, useTheme } from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import PsychologyIcon from '@mui/icons-material/Psychology';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import VerifiedIcon from '@mui/icons-material/Verified';
import type { TFunction } from 'i18next';
import { InterviewSession } from '@/types/models';
import pc from '@/utils/muiColors';
import InterviewDetailSectionHeader from './InterviewDetailSectionHeader';
import { interviewDetailCardSx, interviewDetailPanelSx } from './sectionStyles';

interface InterviewAiEvaluationCardProps {
  session: InterviewSession;
  effectiveStatus?: string;
  t: TFunction;
  onTriggerAi: () => void;
  isTriggeringAi?: boolean;
}

type ScoreBarProps = {
  icon: React.ReactNode;
  label: React.ReactNode;
  value: number;
  color: string;
};

const ScoreBar = ({ icon, label, value, color }: ScoreBarProps) => (
  <Box>
    <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2} mb={0.75}>
      <Typography variant="body2" sx={{ fontWeight: 750, display: 'flex', alignItems: 'center', gap: 1, color: 'text.primary', fontSize: '0.8125rem' }}>
        {icon}
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 850, color, fontSize: '0.875rem' }}>
        {value || 0}<Box component="span" sx={{ color: 'text.disabled', ml: 0.25, fontWeight: 700, fontSize: '0.75rem' }}>/10</Box>
      </Typography>
    </Stack>
    <LinearProgress
      variant="determinate"
      value={(value || 0) * 10}
      sx={{
        height: 7,
        borderRadius: 2,
        bgcolor: alpha(color, 0.12),
        '& .MuiLinearProgress-bar': {
          borderRadius: 2,
          bgcolor: color,
        },
      }}
    />
  </Box>
);

const getRatingBadge = (score: number) => {
  if (score >= 8.5) return { label: 'Xuất sắc', color: '#16a34a', bg: alpha('#22c55e', 0.1) };
  if (score >= 7.0) return { label: 'Khá / Phù hợp', color: '#0284c7', bg: alpha('#0284c7', 0.1) };
  if (score >= 5.0) return { label: 'Trung bình', color: '#d97706', bg: alpha('#f59e0b', 0.1) };
  return { label: 'Cần xem xét lại', color: '#e11d48', bg: alpha('#f43f5e', 0.1) };
};

const InterviewAiEvaluationCard: React.FC<InterviewAiEvaluationCardProps> = ({
  session,
  effectiveStatus,
  t,
  onTriggerAi,
  isTriggeringAi = false,
}) => {
  const theme = useTheme();
  const overallScore = session.aiOverallScore ?? session.ai_overall_score;
  const technicalScore = Number(session.aiTechnicalScore ?? session.ai_technical_score ?? 0);
  const communicationScore = Number(session.aiCommunicationScore ?? session.ai_communication_score ?? 0);
  const hasResult = overallScore !== null && overallScore !== undefined;
  const numOverallScore = Number(overallScore || 0);
  const isProcessing = effectiveStatus === 'processing' || session.status === 'processing';
  const canTriggerAi = effectiveStatus === 'completed' || session.status === 'completed';
  const rating = getRatingBadge(numOverallScore);

  return (
    <Paper elevation={0} sx={interviewDetailCardSx}>
      <InterviewDetailSectionHeader
        icon={<AutoAwesomeIcon />}
        title={t('interviewDetail.subtitle.aiEvaluation')}
        iconColor="primary"
        action={
          isProcessing ? (
            <Chip
              label={t('interviewDetail.messages.aiAnalyzing')}
              size="small"
              sx={{ height: 24, fontWeight: 800, bgcolor: pc.info(0.08), color: 'info.main', borderRadius: 1.5 }}
            />
          ) : undefined
        }
      />

      {hasResult ? (
        <Stack spacing={2.5}>
          {/* Top Scorecard Bento Highlight */}
          <Box
            sx={{
              p: 2.25,
              borderRadius: 3.5,
              background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.08) 0%, rgba(99, 102, 241, 0.06) 100%)',
              border: '1px solid',
              borderColor: alpha(theme.palette.primary.main, 0.18),
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
              <Box>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.6875rem' }}>
                    {t('interviewDetail.label.aiOverallQuality')}
                  </Typography>
                  <Box
                    sx={{
                      px: 1,
                      py: 0.2,
                      borderRadius: '8px',
                      bgcolor: rating.bg,
                      color: rating.color,
                      fontWeight: 800,
                      fontSize: '0.6875rem',
                    }}
                  >
                    {rating.label}
                  </Box>
                </Stack>
                <Typography variant="h3" sx={{ fontWeight: 900, color: 'primary.main', letterSpacing: '-0.03em', lineHeight: 1 }}>
                  {overallScore}
                  <Box component="span" sx={{ fontSize: '1.15rem', fontWeight: 700, color: 'text.disabled', ml: 0.5 }}>
                    /10
                  </Box>
                </Typography>
              </Box>
              <Box
                sx={{
                  width: 52,
                  height: 52,
                  borderRadius: '16px',
                  bgcolor: alpha(theme.palette.primary.main, 0.12),
                  color: 'primary.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <AutoAwesomeIcon sx={{ fontSize: 28 }} />
              </Box>
            </Stack>
          </Box>

          {/* Sub-scores */}
          <Stack spacing={2} sx={{ p: 2, borderRadius: 3, bgcolor: 'action.hover', border: '1px solid', borderColor: 'divider' }}>
            <ScoreBar
              icon={<PsychologyIcon sx={{ fontSize: 18, color: '#0284c7' }} />}
              label={t('interviewDetail.label.technicalScore')}
              value={technicalScore}
              color="#0284c7"
            />
            <ScoreBar
              icon={<QuestionAnswerIcon sx={{ fontSize: 18, color: '#6366f1' }} />}
              label={t('interviewDetail.label.communicationScore')}
              value={communicationScore}
              color="#6366f1"
            />
          </Stack>

          {/* Executive Summary */}
          <Box
            sx={{
              p: 2.25,
              borderRadius: 3,
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: '0 2px 8px -2px rgba(15, 23, 42, 0.04)',
            }}
          >
            <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', display: 'block', mb: 0.75, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Tóm tắt nhận định AI
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 550, color: 'text.primary', lineHeight: 1.75, fontSize: '0.875rem' }}>
              {session.aiSummary || session.ai_summary || t('interviewDetail.messages.aiGenerating')}
            </Typography>
          </Box>

          <Button
            variant="outlined"
            fullWidth
            onClick={onTriggerAi}
            disabled={isTriggeringAi}
            startIcon={<AutoAwesomeIcon />}
            sx={{
              fontWeight: 800,
              py: 1.1,
              borderRadius: '12px',
              textTransform: 'none',
              fontSize: '0.8125rem',
              boxShadow: 'none',
              borderColor: 'divider',
              color: 'text.primary',
              '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.05), borderColor: 'primary.main' },
            }}
          >
            {t('interviewDetail.actions.retryAi')}
          </Button>
        </Stack>
      ) : (
        <Box sx={{ py: 6, textAlign: 'center' }}>
          {isProcessing ? (
            <>
              <CircularProgress size={36} thickness={4} sx={{ mb: 2.5, color: 'primary.main' }} />
              <Typography variant="subtitle2" color="text.primary" sx={{ fontWeight: 850, letterSpacing: '-0.01em' }}>
                {t('interviewDetail.messages.aiAnalyzing')}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontWeight: 550, fontSize: '0.8125rem', maxWidth: 280, mx: 'auto' }}>
                {t('interviewDetail.messages.aiAnalyzingDesc')}
              </Typography>
            </>
          ) : (
            <>
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: '16px',
                  bgcolor: alpha(theme.palette.primary.main, 0.08),
                  color: 'primary.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 2,
                }}
              >
                <AutoAwesomeIcon sx={{ fontSize: 28 }} />
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3, fontWeight: 600, maxWidth: 280, mx: 'auto', lineHeight: 1.6, fontSize: '0.8125rem' }}>
                {canTriggerAi ? t('interviewDetail.messages.aiNeedsTrigger') : t('interviewDetail.messages.notEnded')}
              </Typography>
              {canTriggerAi && (
                <Button
                  variant="contained"
                  onClick={onTriggerAi}
                  disabled={isTriggeringAi}
                  startIcon={<AutoAwesomeIcon />}
                  sx={{
                    fontWeight: 800,
                    px: 3,
                    py: 1.1,
                    borderRadius: '12px',
                    textTransform: 'none',
                    fontSize: '0.8125rem',
                    boxShadow: 'none',
                    '&:hover': { boxShadow: 'none' },
                  }}
                >
                  {t('interviewDetail.actions.triggerAi')}
                </Button>
              )}
            </>
          )}
        </Box>
      )}
    </Paper>
  );
};

export default InterviewAiEvaluationCard;
