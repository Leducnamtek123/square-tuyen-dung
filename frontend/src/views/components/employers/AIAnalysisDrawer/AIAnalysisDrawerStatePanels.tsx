import React from 'react';
import {
  Box,
  Button,
  Chip,
  Divider,
  LinearProgress,
  Paper,
  Stack,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RefreshIcon from '@mui/icons-material/Refresh';
import ThumbDownAltIcon from '@mui/icons-material/ThumbDownAlt';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import PsychologyIcon from '@mui/icons-material/Psychology';
import { ScoreGauge } from './ScoreGauge';
import { SkillChipList } from './SkillChipList';
import { SectionCard } from './SectionCard';
import type { AIAnalysisData } from './types';
import type { TFunction } from 'i18next';
import pc from '@/utils/muiColors';

type Props = {
  data: AIAnalysisData | null;
  analyzing: boolean;
  scanProgress: number;
  isProcessing: boolean;
  isCompleted: boolean;
  isFailed: boolean;
  stats: { matchingSkills: number; missingSkills: number; totalSkills: number };
  onAnalyze: () => void;
  onSaveReview: (payload: { overrideScore?: number | string | null; note?: string; reviewStatus?: string }) => Promise<void>;
  t: TFunction;
};

const toRecordArray = (value: unknown): Array<Record<string, unknown>> => {
  if (Array.isArray(value)) {
    return value.filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === 'object' && !Array.isArray(item));
  }
  return [];
};

const getEvidenceArrays = (value: AIAnalysisData['aiAnalysisEvidence']) => {
  if (Array.isArray(value)) {
    return { criteriaResults: [], evidence: toRecordArray(value) };
  }
  if (value && typeof value === 'object') {
    return {
      criteriaResults: toRecordArray(value.criteria_results),
      evidence: toRecordArray(value.evidence),
    };
  }
  return { criteriaResults: [], evidence: [] };
};

const textValue = (value: unknown): string => (value == null ? '' : String(value));

const AIAnalysisDrawerStatePanels = ({
  data,
  analyzing,
  scanProgress,
  isProcessing,
  isCompleted,
  isFailed,
  stats,
  onAnalyze,
  onSaveReview,
  t,
}: Props) => {
  const theme = useTheme();
  const [overrideScore, setOverrideScore] = React.useState<string>('');
  const [reviewNote, setReviewNote] = React.useState<string>('');
  const [savingReview, setSavingReview] = React.useState(false);

  React.useEffect(() => {
    setOverrideScore(data?.aiAnalysisHrOverrideScore == null ? '' : String(data.aiAnalysisHrOverrideScore));
    setReviewNote(data?.aiAnalysisHrOverrideNote || '');
  }, [data?.id, data?.aiAnalysisHrOverrideScore, data?.aiAnalysisHrOverrideNote]);

  const { criteriaResults, evidence } = getEvidenceArrays(data?.aiAnalysisEvidence);

  const handleSaveReview = async () => {
    setSavingReview(true);
    try {
      await onSaveReview({
        overrideScore: overrideScore.trim() ? overrideScore : null,
        note: reviewNote,
        reviewStatus: overrideScore.trim() ? 'overridden' : 'reviewed',
      });
    } finally {
      setSavingReview(false);
    }
  };

  if (isProcessing) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 2,
          border: '1px solid',
          borderColor: pc.info( 0.3),
          borderRadius: 3,
          background: `linear-gradient(135deg, #0369a1 0%, rgba(3, 105, 161, 0.8) 100%)`,
          boxShadow: (muiTheme) => muiTheme.customShadows?.info,
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
          <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {t('appliedResume.ai.scanning')}
          </Typography>
          <Chip
            size="small"
            label={`${scanProgress}%`}
            sx={{
              color: 'info.dark',
              bgcolor: 'info.light',
              fontWeight: 1000,
              boxShadow: '0 0 10px rgba(0,0,0,0.2)',
            }}
          />
        </Stack>
        <LinearProgress
          variant="determinate"
          value={scanProgress}
          sx={{
            height: 10,
            borderRadius: 5,
            bgcolor: 'rgba(186, 230, 253, 0.2)',
            '& .MuiLinearProgress-bar': {
              borderRadius: 5,
              background: `linear-gradient(90deg, ${theme.palette.info.light} 0%, white 100%)`,
            },
          }}
        />
        <Typography variant="caption" sx={{ color: 'white', mt: 1.5, display: 'block', fontWeight: 600, opacity: 0.9 }}>
          {t('appliedResume.ai.scanProgress')}
        </Typography>
      </Paper>
    );
  }

  if (isFailed) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 4,
          mb: 2,
          border: '1px solid',
          borderColor: pc.error( 0.2),
          borderRadius: 3,
          bgcolor: pc.error( 0.04),
          textAlign: 'center',
        }}
      >
        <CancelIcon sx={{ fontSize: 48, color: 'error.main', mb: 2, opacity: 0.8 }} />
        <Typography variant="h6" sx={{ fontWeight: 900, color: 'error.dark' }}>
          {t('appliedResume.ai.failedTitle')}
        </Typography>
        {data?.aiAnalysisSummary && (
          <Typography variant="body2" sx={{ color: 'error.main', mt: 1, fontWeight: 600 }}>
            {data.aiAnalysisSummary}
          </Typography>
        )}
        <Button
          variant="contained"
          color="error"
          size="medium"
          startIcon={<RefreshIcon />}
          onClick={onAnalyze}
          disabled={analyzing}
          sx={{ mt: 3, textTransform: 'none', fontWeight: 900, boxShadow: (muiTheme) => muiTheme.customShadows?.error }}
        >
          {t('appliedResume.ai.retry')}
        </Button>
      </Paper>
    );
  }

  if (!isCompleted) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 5,
          mb: 2,
          border: '2px dashed',
          borderColor: pc.primary( 0.3),
          borderRadius: 4,
          textAlign: 'center',
          background: `linear-gradient(135deg, ${pc.primary( 0.02)} 0%, ${pc.primary( 0.05)} 100%)`,
          transition: 'all 0.3s ease',
          '&:hover': {
            borderColor: 'primary.main',
            bgcolor: pc.primary( 0.06),
          },
        }}
      >
        <Box
          sx={{
            p: 2,
            borderRadius: '50%',
            bgcolor: pc.primary( 0.1),
            display: 'inline-flex',
            mb: 2,
          }}
        >
          <AutoFixHighIcon sx={{ fontSize: 48, color: 'primary.main' }} />
        </Box>
        <Typography variant="h5" sx={{ fontWeight: 1000, color: 'text.primary', mb: 1, letterSpacing: '-0.5px' }}>
          {t('appliedResume.ai.idleTitle')}
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', display: 'block', mb: 4, fontWeight: 600, px: 2 }}>
          {t('appliedResume.ai.idleHint')}
        </Typography>
        <Button
          variant="contained"
          size="large"
          startIcon={<AutoFixHighIcon />}
          onClick={onAnalyze}
          disabled={analyzing}
          sx={{
            textTransform: 'none',
            px: 4,
            py: 1.5,
            
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            color: 'white',
            fontWeight: 900,
            fontSize: '1rem',
            boxShadow: (muiTheme) => muiTheme.customShadows?.primary,
            '&:hover': { transform: 'translateY(-2px)', boxShadow: (muiTheme) => muiTheme.customShadows?.z12 },
          }}
        >
          {t('appliedResume.ai.startScan')}
        </Button>
      </Paper>
    );
  }

  return (
    <>
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          mb: 2,
          border: '1px solid',
          borderColor: pc.success( 0.2),
          borderRadius: 3,
          background: `linear-gradient(135deg, ${pc.success( 0.04)} 0%, ${pc.success( 0.08)} 100%)`,
          boxShadow: (muiTheme) => muiTheme.customShadows?.success,
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="space-between" sx={{ flexWrap: 'wrap', rowGap: 1.5 }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box sx={{ color: 'success.main', display: 'flex' }}>
              <CheckCircleIcon sx={{ fontSize: 24 }} />
            </Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 900, color: 'success.dark', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {t('appliedResume.ai.completeTitle')}
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1}>
            <Chip size="small" label={`Match: ${stats.matchingSkills}`} sx={{ fontWeight: 800, bgcolor: 'success.main', color: 'white' }} />
            <Chip size="small" label={`Missing: ${stats.missingSkills}`} sx={{ fontWeight: 800, bgcolor: 'error.main', color: 'white' }} />
          </Stack>
        </Stack>
      </Paper>

      <Paper
        elevation={0}
        sx={{
          mb: 2,
          border: '1px solid',
          borderColor: pc.divider( 0.8),
          borderRadius: 3,
          bgcolor: 'background.paper',
          boxShadow: (muiTheme) => muiTheme.customShadows?.z1,
        }}
      >
        <ScoreGauge score={data?.aiAnalysisEffectiveScore ?? data?.aiAnalysisScore ?? 0} />
      </Paper>

      <SectionCard title={t('appliedResume.ai.reviewTitle', { defaultValue: 'HR review' })} icon={<PsychologyIcon fontSize="small" />} iconColor={theme.palette.info.main}>
        <Stack spacing={2}>
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', rowGap: 1 }}>
            <Chip
              size="small"
              label={t(`appliedResume.ai.reviewStatus.${data?.aiAnalysisReviewStatus || 'ai_only'}`, {
                defaultValue: data?.aiAnalysisReviewStatus || 'ai_only',
              })}
              sx={{ fontWeight: 800, borderRadius: 1.5 }}
            />
            {data?.aiAnalysisModel && (
              <Chip size="small" label={`Model: ${data.aiAnalysisModel}`} sx={{ fontWeight: 800, borderRadius: 1.5 }} />
            )}
            {data?.aiAnalysisPromptVersion && (
              <Chip size="small" label={`Prompt: ${data.aiAnalysisPromptVersion}`} sx={{ fontWeight: 800, borderRadius: 1.5 }} />
            )}
          </Stack>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <TextField
              label={t('appliedResume.ai.overrideScore', { defaultValue: 'Override score' })}
              value={overrideScore}
              onChange={(event) => setOverrideScore(event.target.value)}
              type="number"
              size="small"
              inputProps={{ min: 0, max: 100 }}
              sx={{ width: { xs: '100%', sm: 150 } }}
            />
            <TextField
              label={t('appliedResume.ai.reviewNote', { defaultValue: 'Review note' })}
              value={reviewNote}
              onChange={(event) => setReviewNote(event.target.value)}
              size="small"
              fullWidth
            />
          </Stack>
          <Button
            variant="contained"
            size="small"
            onClick={handleSaveReview}
            disabled={savingReview}
            sx={{ alignSelf: 'flex-start', textTransform: 'none', fontWeight: 900 }}
          >
            {t('appliedResume.ai.saveReview', { defaultValue: 'Save review' })}
          </Button>
        </Stack>
      </SectionCard>

      <SectionCard title={t('appliedResume.ai.overviewTitle')} icon={<PsychologyIcon fontSize="small" />} iconColor={theme.palette.secondary.main}>
        <Typography variant="body2" sx={{ color: 'text.primary', lineHeight: 1.8, fontWeight: 600, opacity: 0.9 }}>
          {data?.aiAnalysisSummary || t('appliedResume.ai.noEvaluation')}
        </Typography>
      </SectionCard>

      {criteriaResults.length > 0 && (
        <SectionCard title={t('appliedResume.ai.criteriaTitle', { defaultValue: 'Weighted criteria' })} icon={<CheckCircleIcon fontSize="small" />} iconColor={theme.palette.info.main}>
          <Stack spacing={1.25}>
            {criteriaResults.map((item, index) => (
              <Paper key={`${textValue(item.key)}-${index}`} elevation={0} sx={{ p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                <Stack direction="row" justifyContent="space-between" spacing={2} alignItems="flex-start">
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 900 }}>
                      {textValue(item.label || item.key || `Criterion ${index + 1}`)}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5, fontWeight: 600 }}>
                      {textValue(item.reason || item.evidence)}
                    </Typography>
                  </Box>
                  <Chip size="small" label={`${textValue(item.score || 0)}/100`} sx={{ fontWeight: 900, borderRadius: 1.5 }} />
                </Stack>
              </Paper>
            ))}
          </Stack>
        </SectionCard>
      )}

      {evidence.length > 0 && (
        <SectionCard title={t('appliedResume.ai.evidenceTitle', { defaultValue: 'Evidence' })} icon={<AutoFixHighIcon fontSize="small" />} iconColor={theme.palette.primary.main}>
          <Stack spacing={1.25}>
            {evidence.map((item, index) => (
              <Paper key={`${textValue(item.claim)}-${index}`} elevation={0} sx={{ p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 900, mb: 0.5 }}>
                  {textValue(item.claim || item.source || `Evidence ${index + 1}`)}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600, lineHeight: 1.6 }}>
                  {textValue(item.quote || item.evidence)}
                </Typography>
              </Paper>
            ))}
          </Stack>
        </SectionCard>
      )}

      <SectionCard title={t('appliedResume.ai.prosTitle')} icon={<ThumbUpAltIcon fontSize="small" />} iconColor={theme.palette.success.main}>
        <SkillChipList skills={data?.aiAnalysisPros} color="success" />
      </SectionCard>

      <SectionCard title={t('appliedResume.ai.consTitle')} icon={<ThumbDownAltIcon fontSize="small" />} iconColor={theme.palette.error.main}>
        <SkillChipList skills={data?.aiAnalysisCons} color="error" />
      </SectionCard>

      <SectionCard title={t('appliedResume.ai.matchingSkillsTitle')} icon={<CheckCircleIcon fontSize="small" />} iconColor={theme.palette.success.main}>
        <SkillChipList skills={data?.aiAnalysisMatchingSkills} color="success" icon={<CheckCircleIcon />} />
      </SectionCard>

      <SectionCard title={t('appliedResume.ai.missingSkillsTitle')} icon={<CancelIcon fontSize="small" />} iconColor={theme.palette.warning.main}>
        <SkillChipList skills={data?.aiAnalysisMissingSkills} color="error" icon={<CancelIcon />} />
      </SectionCard>

      <SectionCard title={t('appliedResume.ai.allSkillsTitle')} icon={<AutoFixHighIcon fontSize="small" />} iconColor={theme.palette.primary.main}>
        <SkillChipList skills={data?.aiAnalysisSkills} color="primary" />
      </SectionCard>

      <Box sx={{ textAlign: 'center', mt: 3, mb: 4 }}>
        <Divider sx={{ mb: 3, borderStyle: 'dashed' }} />
        <Button
          variant="outlined"
          color="primary"
          size="medium"
          startIcon={<RefreshIcon />}
          onClick={onAnalyze}
          disabled={analyzing}
          sx={{
            textTransform: 'none',
            fontWeight: 900,
            
            px: 3,
          }}
        >
          {t('appliedResume.ai.reanalyze')}
        </Button>
      </Box>
    </>
  );
};

export default AIAnalysisDrawerStatePanels;
