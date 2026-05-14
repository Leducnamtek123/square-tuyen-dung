import React from 'react';
import { Box, Button, Chip, CircularProgress, LinearProgress, Paper, Stack, Typography } from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import PsychologyIcon from '@mui/icons-material/Psychology';
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
  color: 'primary' | 'info';
};

const ScoreBar = ({ icon, label, value, color }: ScoreBarProps) => (
  <Box>
    <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2} mb={1}>
      <Typography variant="body2" sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary', letterSpacing: 0 }}>
        {icon}
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 850, color: `${color}.main` }}>
        {value || 0}<Box component="span" sx={{ color: 'text.disabled', ml: 0.25, fontWeight: 700 }}>/10</Box>
      </Typography>
    </Stack>
    <LinearProgress
      variant="determinate"
      value={(value || 0) * 10}
      sx={{
        height: 8,
        borderRadius: 1,
        bgcolor: color === 'primary' ? pc.primary(0.06) : pc.info(0.06),
        '& .MuiLinearProgress-bar': {
          borderRadius: 1,
          bgcolor: `${color}.main`,
        },
      }}
    />
  </Box>
);

const InterviewAiEvaluationCard: React.FC<InterviewAiEvaluationCardProps> = ({
  session,
  effectiveStatus,
  t,
  onTriggerAi,
  isTriggeringAi = false,
}) => {
  const overallScore = session.aiOverallScore ?? session.ai_overall_score;
  const technicalScore = Number(session.aiTechnicalScore ?? session.ai_technical_score ?? 0);
  const communicationScore = Number(session.aiCommunicationScore ?? session.ai_communication_score ?? 0);
  const hasResult = overallScore !== null && overallScore !== undefined;
  const isProcessing = effectiveStatus === 'processing' || session.status === 'processing';
  const canTriggerAi = effectiveStatus === 'completed' || session.status === 'completed';

  return (
    <Paper elevation={0} sx={interviewDetailCardSx}>
      <InterviewDetailSectionHeader
        icon={<AutoAwesomeIcon />}
        title={t('interviewDetail.subtitle.aiEvaluation')}
        iconColor="primary"
        action={
          isProcessing ? (
            <Chip
              label={t('interviewDetail.messages.aiAnalyzing', { defaultValue: 'Analyzing' })}
              size="small"
              sx={{ height: 24, fontWeight: 800, bgcolor: pc.info(0.08), color: 'info.main', borderRadius: 1.5 }}
            />
          ) : undefined
        }
      />

      {hasResult ? (
        <Stack spacing={2.5}>
          <Box
            sx={{
              ...interviewDetailPanelSx,
              p: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 2,
              bgcolor: pc.primary(0.035),
            }}
          >
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800, letterSpacing: 0 }}>
                {t('interviewDetail.label.aiOverallQuality', { defaultValue: 'AI overall quality' })}
              </Typography>
              <Typography variant="h3" color="primary" sx={{ fontWeight: 900, letterSpacing: 0, lineHeight: 1.05 }}>
                {overallScore}<Box component="span" sx={{ fontSize: '1rem', fontWeight: 800, color: 'text.disabled', ml: 0.5 }}>/10</Box>
              </Typography>
            </Box>
            <AutoAwesomeIcon sx={{ fontSize: 36, color: 'primary.main', opacity: 0.55 }} />
          </Box>

          <ScoreBar
            icon={<PsychologyIcon sx={{ fontSize: 18, color: 'primary.main' }} />}
            label={t('interviewDetail.label.technicalScore')}
            value={technicalScore}
            color="primary"
          />
          <ScoreBar
            icon={<AutoAwesomeIcon sx={{ fontSize: 18, color: 'info.main' }} />}
            label={t('interviewDetail.label.communicationScore')}
            value={communicationScore}
            color="info"
          />

          <Box sx={{ ...interviewDetailPanelSx, p: 2, bgcolor: pc.actionDisabled(0.03) }}>
            <Typography variant="body2" sx={{ fontWeight: 650, color: 'text.primary', lineHeight: 1.75 }}>
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
              py: 1.25,
              textTransform: 'none',
              boxShadow: 'none',
              '&:hover': { boxShadow: 'none', bgcolor: pc.primary(0.04) },
            }}
          >
            {t('interviewDetail.actions.retryAi')}
          </Button>
        </Stack>
      ) : (
        <Box sx={{ py: 5, textAlign: 'center' }}>
          {isProcessing ? (
            <>
              <CircularProgress size={34} thickness={4} sx={{ mb: 2.5, color: 'primary.main' }} />
              <Typography variant="subtitle2" color="text.primary" sx={{ fontWeight: 850, letterSpacing: 0 }}>
                {t('interviewDetail.messages.aiAnalyzing')}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontWeight: 600 }}>
                {t('interviewDetail.messages.aiAnalyzingDesc')}
              </Typography>
            </>
          ) : (
            <>
              <AutoAwesomeIcon sx={{ fontSize: 48, color: 'text.disabled', opacity: 0.25, mb: 1.5 }} />
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3, fontWeight: 700, maxWidth: 300, mx: 'auto', lineHeight: 1.7 }}>
                {canTriggerAi ? t('interviewDetail.messages.aiNeedsTrigger') : t('interviewDetail.messages.notEnded')}
              </Typography>
              {canTriggerAi && (
                <Button
                  variant="contained"
                  onClick={onTriggerAi}
                  disabled={isTriggeringAi}
                  startIcon={<AutoAwesomeIcon />}
                  sx={{
                    
                    fontWeight: 850,
                    px: 3,
                    py: 1.25,
                    textTransform: 'none',
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
