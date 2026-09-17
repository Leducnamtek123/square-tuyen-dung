import React from 'react';
import dayjs from 'dayjs';
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
  alpha,
  useTheme,
} from '@mui/material';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import RefreshIcon from '@mui/icons-material/Refresh';
import ThumbDownAltIcon from '@mui/icons-material/ThumbDownAlt';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import PsychologyIcon from '@mui/icons-material/Psychology';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { ScoreGauge } from './ScoreGauge';
import { SkillChipList } from './SkillChipList';
import { SectionCard } from './SectionCard';
import type { AIAnalysisData } from './types';
import type { TFunction } from 'i18next';
import pc from '@/utils/muiColors';
import { OperationTimeline, adaptResumeAnalysisOperation } from '@/components/operation';

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

type ParsedAIRecord = Record<string, unknown> & { clientId: string };

const toRecordArray = (value: unknown, prefix = 'item'): ParsedAIRecord[] => {
  if (Array.isArray(value)) {
    return value
      .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === 'object' && !Array.isArray(item))
      .map((item, idx) => ({
        ...item,
        clientId: item.id != null ? String(item.id) : (item.key ? String(item.key) : `${prefix}-${idx}`),
      }));
  }
  return [];
};

const getEvidenceArrays = (value: AIAnalysisData['aiAnalysisEvidence']) => {
  if (Array.isArray(value)) {
    return { criteriaResults: [], evidence: toRecordArray(value, 'evid') };
  }
  if (value && typeof value === 'object') {
    return {
      criteriaResults: toRecordArray(value.criteria_results, 'crit'),
      evidence: toRecordArray(value.evidence, 'evid'),
    };
  }
  return { criteriaResults: [], evidence: [] };
};

const getIdentityWarnings = (value: AIAnalysisData['aiAnalysisEvidence']) => {
  if (!value || Array.isArray(value) || typeof value !== 'object') {
    return [];
  }
  const record = value as { identity_warnings?: unknown; identityWarnings?: unknown };
  return toRecordArray(record.identity_warnings ?? record.identityWarnings, 'warn');
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
  const identityWarnings = getIdentityWarnings(data?.aiAnalysisEvidence);

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
    const operation = adaptResumeAnalysisOperation(data, scanProgress);
    return (
      <Box sx={{ mb: 2.5 }}>
        <OperationTimeline operation={operation} onRetry={onAnalyze} />
      </Box>
    );
  }

  if (isFailed) {
    const isMissingResume = data?.aiAnalysisSummary?.includes('Không tìm thấy') ||
                            data?.aiAnalysisSummary?.includes('Khong tim thay') ||
                            data?.aiAnalysisSummary?.includes('chưa có') ||
                            data?.aiAnalysisSummary?.includes('không đọc được');

    return (
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 2.5,
          border: '1px solid',
          borderColor: alpha(theme.palette.error.main, 0.24),
          borderRadius: 3,
          bgcolor: alpha(theme.palette.error.main, 0.025),
        }}
      >
        <Stack direction="row" spacing={2} alignItems="flex-start">
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              bgcolor: alpha(theme.palette.error.main, 0.1),
              color: 'error.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <ErrorOutlineIcon sx={{ fontSize: 24 }} />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1} sx={{ mb: 0.75 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'text.primary', lineHeight: 1.3 }}>
                {t('appliedResume.ai.failedTitle')}
              </Typography>
              <Chip
                size="small"
                label={isMissingResume ? "Cần bổ sung hồ sơ" : "Lỗi xử lý"}
                sx={{
                  fontWeight: 700,
                  fontSize: '0.72rem',
                  bgcolor: alpha(theme.palette.error.main, 0.1),
                  color: 'error.main',
                  borderRadius: 1.5,
                }}
              />
            </Stack>

            <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6, fontWeight: 500 }}>
              {data?.aiAnalysisSummary || t('appliedResume.ai.failed')}
            </Typography>

            {isMissingResume && (
              <Box
                sx={{
                  mt: 2,
                  p: 1.75,
                  borderRadius: 2,
                  bgcolor: 'background.paper',
                  border: '1px solid',
                  borderColor: pc.divider(0.8),
                }}
              >
                <Stack direction="row" spacing={1} alignItems="flex-start">
                  <Box sx={{ color: 'info.main', display: 'flex', mt: 0.25 }}>
                    <AutoFixHighIcon sx={{ fontSize: 18 }} />
                  </Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, lineHeight: 1.6 }}>
                    Gợi ý dành cho Nhà tuyển dụng: Hồ sơ ứng viên cần có tệp CV hoặc thông tin chi tiết để AI tiến hành đối chiếu năng lực. Nhà tuyển dụng có thể tải lên tệp CV trực tiếp hoặc liên hệ ứng viên để hoàn thiện thông tin.
                  </Typography>
                </Stack>
              </Box>
            )}

            <Stack direction="row" spacing={1.5} sx={{ mt: 2.5 }}>
              <Button
                variant="contained"
                color="primary"
                size="small"
                startIcon={<RefreshIcon />}
                onClick={onAnalyze}
                disabled={analyzing}
                sx={{ textTransform: 'none', fontWeight: 700, px: 2.5, py: 0.8 }}
              >
                {t('appliedResume.ai.retry')}
              </Button>
            </Stack>
          </Box>
        </Stack>
      </Paper>
    );
  }

  if (!isCompleted) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 3.5,
          mb: 2.5,
          border: '1px solid',
          borderColor: alpha(theme.palette.primary.main, 0.2),
          borderRadius: 3,
          bgcolor: alpha(theme.palette.primary.main, 0.02),
          textAlign: 'center',
          transition: 'all 0.2s ease',
          '&:hover': {
            borderColor: 'primary.main',
            bgcolor: alpha(theme.palette.primary.main, 0.035),
          },
        }}
      >
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            bgcolor: alpha(theme.palette.primary.main, 0.1),
            color: 'primary.main',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 2,
          }}
        >
          <PsychologyIcon sx={{ fontSize: 32 }} />
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary', mb: 1, letterSpacing: '-0.3px' }}>
          {t('appliedResume.ai.idleTitle')}
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', display: 'block', mb: 3, fontWeight: 500, px: 2, lineHeight: 1.6 }}>
          {t('appliedResume.ai.idleHint')}
        </Typography>

        <Stack direction="row" spacing={1} justifyContent="center" sx={{ mb: 3, flexWrap: 'wrap', gap: 1 }}>
          <Chip
            size="small"
            label="Đối chiếu kỹ năng JD"
            sx={{ fontWeight: 600, fontSize: '0.75rem', bgcolor: alpha(theme.palette.primary.main, 0.08), color: 'primary.dark' }}
          />
          <Chip
            size="small"
            label="Chấm điểm năng lực"
            sx={{ fontWeight: 600, fontSize: '0.75rem', bgcolor: alpha(theme.palette.primary.main, 0.08), color: 'primary.dark' }}
          />
          <Chip
            size="small"
            label="Đánh giá chi tiết"
            sx={{ fontWeight: 600, fontSize: '0.75rem', bgcolor: alpha(theme.palette.primary.main, 0.08), color: 'primary.dark' }}
          />
        </Stack>

        <Button
          variant="contained"
          color="primary"
          size="medium"
          startIcon={<AutoFixHighIcon />}
          onClick={onAnalyze}
          disabled={analyzing}
          sx={{
            textTransform: 'none',
            px: 3.5,
            py: 1.1,
            fontWeight: 700,
            fontSize: '0.92rem',
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
          p: 2.25,
          mb: 2,
          border: '1px solid',
          borderColor: alpha(theme.palette.success.main, 0.24),
          borderRadius: 3,
          bgcolor: alpha(theme.palette.success.main, 0.04),
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

      {identityWarnings.length > 0 && (
        <SectionCard
          title={t('employer:appliedResume.ai.identityWarningTitle')}
          icon={<WarningAmberIcon fontSize="small" />}
          iconColor={theme.palette.warning.main}
        >
          <Stack spacing={1.25}>
            {identityWarnings.map((item, index) => {
              const applicationName = textValue(item.application_name || item.applicationName);
              const resumeName = textValue(item.resume_name || item.resumeName);
              const warningText = applicationName || resumeName
                ? t('employer:appliedResume.ai.identityWarningBody', {
                    applicationName: applicationName || '-',
                    resumeName: resumeName || '-',
                  })
                : textValue(item.message);

              return (
                <Paper
                  key={item.clientId}
                  elevation={0}
                  sx={{
                    p: 1.5,
                    border: '1px solid',
                    borderColor: pc.warning(0.35),
                    borderRadius: 2,
                    bgcolor: pc.warning(0.08),
                  }}
                >
                  <Typography variant="body2" sx={{ color: 'warning.dark', fontWeight: 800, lineHeight: 1.65 }}>
                    {warningText}
                  </Typography>
                </Paper>
              );
            })}
          </Stack>
        </SectionCard>
      )}

      <SectionCard title={t('employer:appliedResume.ai.reviewTitle')} icon={<PsychologyIcon fontSize="small" />} iconColor={theme.palette.info.main}>
        <Stack spacing={2}>
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', rowGap: 1 }}>
            <Chip
              size="small"
              label={t(`employer:appliedResume.ai.reviewStatus.${data?.aiAnalysisReviewStatus || 'ai_only'}`, {
                defaultValue: data?.aiAnalysisReviewStatus || 'ai_only',
              })}
              sx={{ fontWeight: 800, borderRadius: 1.5 }}
            />
            {data?.aiAnalysisReviewedAt && (
              <Chip
                size="small"
                variant="outlined"
                label={t('employer:appliedResume.ai.reviewedAtLabel', {
                  date: dayjs(data.aiAnalysisReviewedAt).format('DD/MM/YYYY HH:mm'),
                })}
                sx={{ borderRadius: 1.5 }}
              />
            )}
          </Stack>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <TextField
              label={t('employer:appliedResume.ai.overrideScore')}
              value={overrideScore}
              onChange={(event) => setOverrideScore(event.target.value)}
              type="number"
              size="small"
              slotProps={{ htmlInput: { min: 0, max: 100 } }}
              sx={{ width: { xs: '100%', sm: 150 } }}
            />
            <TextField
              label={t('employer:appliedResume.ai.reviewNote')}
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
            {t('employer:appliedResume.ai.saveReview')}
          </Button>
        </Stack>
      </SectionCard>

      <SectionCard title={t('appliedResume.ai.overviewTitle')} icon={<PsychologyIcon fontSize="small" />} iconColor={theme.palette.secondary.main}>
        <Typography variant="body2" sx={{ color: 'text.primary', lineHeight: 1.8, fontWeight: 600, opacity: 0.9 }}>
          {data?.aiAnalysisSummary || t('appliedResume.ai.noEvaluation')}
        </Typography>
      </SectionCard>

      {criteriaResults.length > 0 && (
        <SectionCard title={t('employer:appliedResume.ai.criteriaTitle')} icon={<CheckCircleIcon fontSize="small" />} iconColor={theme.palette.info.main}>
          <Stack spacing={1.25}>
            {criteriaResults.map((item) => (
              <Paper key={item.clientId} elevation={0} sx={{ p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                <Stack direction="row" justifyContent="space-between" spacing={2} alignItems="flex-start">
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 900 }}>
                      {textValue(item.label || item.key || 'Criterion')}
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
        <SectionCard title={t('employer:appliedResume.ai.evidenceTitle')} icon={<AutoFixHighIcon fontSize="small" />} iconColor={theme.palette.primary.main}>
          <Stack spacing={1.25}>
            {evidence.map((item, index) => (
              <Paper key={item.clientId} elevation={0} sx={{ p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
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
