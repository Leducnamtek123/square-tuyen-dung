import React from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Divider,
  Stack,
  LinearProgress,
  CircularProgress,
  Button,
  Paper,
  Chip,
  useTheme,
  alpha,
  Theme
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PsychologyIcon from '@mui/icons-material/Psychology';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import ThumbDownAltIcon from '@mui/icons-material/ThumbDownAlt';
import DescriptionIcon from '@mui/icons-material/Description';
import RefreshIcon from '@mui/icons-material/Refresh';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { useTranslation } from 'react-i18next';
import jobPostActivityService from '../../../../services/jobPostActivityService';
import toastMessages from '../../../../utils/toastMessages';
import errorHandling from '../../../../utils/errorHandling';
import type { JobPostActivity } from '@/types/models';
import type { SvgIconProps } from '@mui/material/SvgIcon';

import { ScoreGauge } from './ScoreGauge';
import { SkillChipList } from './SkillChipList';
import { SectionCard } from './SectionCard';
import type { AxiosError } from 'axios';

export type AIAnalysisData = {
  id?: string | number;
  fullName?: string;
  jobName?: string;
  aiAnalysisStatus?: 'processing' | 'completed' | 'failed' | 'idle' | string;
  aiAnalysisProgress?: number;
  resumeFileUrl?: string;
  aiAnalysisMatchingSkills?: string | string[];
  aiAnalysisMissingSkills?: string | string[];
  aiAnalysisSkills?: string | string[];
  aiAnalysisSummary?: string;
  aiAnalysisPros?: string | string[];
  aiAnalysisCons?: string | string[];
  aiAnalysisScore?: number;
};

type ActivityRawFields = JobPostActivity & {
  jobPostDict?: { jobName?: string };
  resumeFileUrl?: string;
  aiAnalysisMatchingSkills?: string | string[];
  aiAnalysisMissingSkills?: string | string[];
  aiAnalysisSkills?: string | string[];
  aiAnalysisPros?: string | string[];
  aiAnalysisCons?: string | string[];
};

interface AIAnalysisDrawerProps {
  open: boolean;
  onClose: () => void;
  activityId: string | number | null;
  initialData?: AIAnalysisData | null;
  onAnalysisStateChange?: (nextState: {
    aiAnalysisStatus?: JobPostActivity['aiAnalysisStatus'];
    aiAnalysisProgress?: number;
  }) => void;
}

const renderIcon = (
  IconComponent: React.ElementType<SvgIconProps> | { default: React.ElementType<SvgIconProps> } | unknown,
  props?: SvgIconProps,
): React.ReactElement | null => {
  if (!IconComponent) return null;
  const maybeDefault = IconComponent as { default?: React.ElementType<SvgIconProps> };
  const Component = maybeDefault.default || IconComponent;
  const isRenderable =
    typeof Component === 'function' ||
    typeof Component === 'string' ||
    (typeof Component === 'object' &&
      Component !== null &&
      'render' in Component &&
      typeof (Component as { render?: unknown }).render === 'function');

  if (!isRenderable) {
    return null;
  }
  return React.createElement(Component as React.ElementType<SvgIconProps>, props);
};

const DRAWER_WIDTH = 520;
const EMBEDDABLE_HOSTS = new Set([
  'tuyendung.square.vn',
  's3.tuyendung.square.vn',
  'res.cloudinary.com',
  'firebasestorage.googleapis.com',
  'localhost',
]);

const toSkillArray = (skills: unknown): string[] => {
  if (Array.isArray(skills)) {
    return skills.map((item) => String(item || '').trim()).filter(Boolean);
  }

  if (typeof skills === 'string') {
    return skills.split(',').map((item) => item.trim()).filter(Boolean);
  }

  return [];
};

const normalizeAiStatus = (status: unknown): JobPostActivity['aiAnalysisStatus'] => {
  if (status === 'pending' || status === 'processing' || status === 'completed' || status === 'failed') {
    return status;
  }
  return undefined;
};

const toStringOrStringArray = (value: unknown): string | string[] | undefined => {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value.map((item) => String(item));
  return undefined;
};

const toAIAnalysisData = (activity: JobPostActivity): AIAnalysisData => {
  const raw = activity as ActivityRawFields;
  const jobPostDict = raw.jobPostDict || {};
  const aiAnalysisScoreRaw = raw.aiAnalysisScore;

  return {
    id: activity.id,
    fullName: activity.fullName,
    jobName: activity.jobPost?.jobName || jobPostDict.jobName,
    aiAnalysisStatus: activity.aiAnalysisStatus,
    aiAnalysisProgress: activity.aiAnalysisProgress,
    resumeFileUrl: typeof raw.resumeFileUrl === 'string' ? raw.resumeFileUrl : undefined,
    aiAnalysisMatchingSkills: toStringOrStringArray(raw.aiAnalysisMatchingSkills),
    aiAnalysisMissingSkills: toStringOrStringArray(raw.aiAnalysisMissingSkills),
    aiAnalysisSkills: toStringOrStringArray(raw.aiAnalysisSkills),
    aiAnalysisSummary: typeof activity.aiAnalysisSummary === 'string' ? activity.aiAnalysisSummary : undefined,
    aiAnalysisPros: toStringOrStringArray(raw.aiAnalysisPros),
    aiAnalysisCons: toStringOrStringArray(raw.aiAnalysisCons),
    aiAnalysisScore: typeof aiAnalysisScoreRaw === 'number' ? aiAnalysisScoreRaw : undefined,
  };
};

const canEmbedUrl = (url: string): boolean => {
  if (!url || typeof window === 'undefined') return false;

  try {
    const parsed = new URL(url, window.location.origin);
    return EMBEDDABLE_HOSTS.has(parsed.hostname) || parsed.hostname === window.location.hostname;
  } catch {
    return false;
  }
};

const AIAnalysisDrawer: React.FC<AIAnalysisDrawerProps> = ({
  open,
  onClose,
  activityId,
  initialData,
  onAnalysisStateChange,
}) => {
  const { t } = useTranslation('employer');
  const theme = useTheme();
  const [data, setData] = React.useState<AIAnalysisData | null>(initialData || null);
  const [loading, setLoading] = React.useState(false);
  const [analyzing, setAnalyzing] = React.useState(false);
  const [scanLinePosition, setScanLinePosition] = React.useState(-12);

  // Synchronize with initialData ONLY when drawer opens or initialData changes ID.
  // This prevents infinite re-render loops if initialData changes due to parent cache updates.
  React.useEffect(() => {
    if (!open || !initialData) return;
    setData((prev) => (!prev || initialData.id !== prev.id ? initialData : prev));
  }, [initialData, open]);

  // Fetch full detail when drawer opens
  React.useEffect(() => {
    if (!open || !activityId) return;

    const fetchDetail = async () => {
      setLoading(true);
      try {
        const res = await jobPostActivityService.getJobPostActivityDetail(activityId);
        setData(res ? toAIAnalysisData(res) : null);
      } catch {
        // use initial data if fetch fails
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [open, activityId]);

  // Poll while processing
  React.useEffect(() => {
    if (!open || !activityId || data?.aiAnalysisStatus !== 'processing') return;

    const interval = setInterval(async () => {
      try {
        const res = await jobPostActivityService.getJobPostActivityDetail(activityId);
        const newData = toAIAnalysisData(res);
        if (newData) {
          setData(newData);
          onAnalysisStateChange?.({
            aiAnalysisStatus: normalizeAiStatus(newData.aiAnalysisStatus),
            aiAnalysisProgress: newData.aiAnalysisProgress,
          });
        }
        if (newData && newData.aiAnalysisStatus !== 'processing') {
          setAnalyzing(false);
          clearInterval(interval);
        }
      } catch {
        // ignore
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [open, activityId, data?.aiAnalysisStatus, onAnalysisStateChange]);

  React.useEffect(() => {
    if (!open || data?.aiAnalysisStatus !== 'processing') {
      if (data?.aiAnalysisStatus !== 'completed') {
        setScanLinePosition(-12);
      }
      return;
    }

    let isActive = true;
    let rafId = 0;
    const startAt = performance.now();
    const cycleMs = 2600;

    const animateScanLine = (now: number) => {
      if (!isActive) return;
      const phase = ((now - startAt) % cycleMs) / cycleMs;
      setScanLinePosition(-12 + phase * 124);
      rafId = requestAnimationFrame(animateScanLine);
    };

    rafId = requestAnimationFrame(animateScanLine);

    return () => {
      isActive = false;
      cancelAnimationFrame(rafId);
    };
  }, [open, data?.aiAnalysisStatus]);

  const handleAnalyze = async () => {
    if (!activityId) return;
    try {
      setAnalyzing(true);
      setData((prev) => ({ ...(prev || {}), aiAnalysisStatus: 'processing', aiAnalysisProgress: 5 }));
      onAnalysisStateChange?.({ aiAnalysisStatus: 'processing', aiAnalysisProgress: 5 });
      await jobPostActivityService.analyzeResume(activityId);
      toastMessages.success(t('appliedResume.ai.analysisStarted'));
    } catch (err: unknown) {
      errorHandling(err as AxiosError);
      setAnalyzing(false);
      setData((prev) => ({ ...(prev || {}), aiAnalysisStatus: 'failed' }));
      onAnalysisStateChange?.({ aiAnalysisStatus: 'failed', aiAnalysisProgress: 0 });
    }
  };

  const status = data?.aiAnalysisStatus;
  const isCompleted = status === 'completed';
  const isProcessing = status === 'processing';
  const isFailed = status === 'failed';
  const scanProgress = React.useMemo(() => {
    if (isCompleted) return 100;
    const progress = Number(data?.aiAnalysisProgress);
    if (Number.isFinite(progress)) {
      return Math.max(0, Math.min(100, Math.round(progress)));
    }
    return isProcessing ? 0 : 0;
  }, [data?.aiAnalysisProgress, isCompleted, isProcessing]);

  const resumeFileUrl = typeof data?.resumeFileUrl === 'string' ? data.resumeFileUrl : '';
  const canEmbedResume = React.useMemo(() => canEmbedUrl(resumeFileUrl), [resumeFileUrl]);

  const stats = React.useMemo(() => {
    const matchingSkills = toSkillArray(data?.aiAnalysisMatchingSkills).length;
    const missingSkills = toSkillArray(data?.aiAnalysisMissingSkills).length;
    const totalSkills = toSkillArray(data?.aiAnalysisSkills).length;
    return { matchingSkills, missingSkills, totalSkills };
  }, [data?.aiAnalysisMatchingSkills, data?.aiAnalysisMissingSkills, data?.aiAnalysisSkills]);

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            width: { xs: '100%', sm: DRAWER_WIDTH },
            bgcolor: 'background.default',
            backgroundImage: 'none',
            boxShadow: (theme: Theme) => theme.customShadows?.z24
          },
        },
      }}
    >
      <Box
        sx={{
          px: 3,
          py: 2.5,
          bgcolor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: alpha(theme.palette.divider, 0.8),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <Box sx={{ 
              p: 1, 
              borderRadius: 1.5, 
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: 'primary.main',
              display: 'flex'
          }}>
            {renderIcon(PsychologyIcon, { sx: { fontSize: 24 } })}
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 900, color: 'text.primary', lineHeight: 1.2, letterSpacing: '-0.5px' }}>
              {t('appliedResume.ai.drawerTitle')}
            </Typography>
            {data?.fullName && (
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                {data.fullName} • {data.jobName}
              </Typography>
            )}
          </Box>
        </Stack>
        <IconButton 
            onClick={onClose} 
            size="small"
            sx={{ 
                bgcolor: alpha(theme.palette.action.disabled, 0.05),
                '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.1), color: 'error.main' }
            }}
        >
          {renderIcon(CloseIcon, { fontSize: 'small' })}
        </IconButton>
      </Box>

      {loading ? (
        <Box sx={{ p: 10, textAlign: 'center' }}>
          <CircularProgress color="primary" thickness={5} size={40} />
          <Typography variant="subtitle2" sx={{ mt: 3, color: 'text.secondary', fontWeight: 700 }}>
            {t('appliedResume.ai.loading')}
          </Typography>
        </Box>
      ) : (
        <Box sx={{ p: 3, overflowY: 'auto', flex: 1 }}>
          {resumeFileUrl && (
            <SectionCard title={t('appliedResume.ai.resumeTitle')} icon={renderIcon(DescriptionIcon, { fontSize: 'small' })} iconColor={theme.palette.info.main}>
              <Box
                sx={{
                  border: '1px solid',
                  borderColor: alpha(theme.palette.info.main, 0.2),
                  borderRadius: 3,
                  overflow: 'hidden',
                  height: { xs: 260, sm: 380 },
                  bgcolor: '#0f172a',
                  position: 'relative',
                  backgroundImage: `
                    linear-gradient(${alpha(theme.palette.info.main, 0.08)} 1px, transparent 1px), 
                    linear-gradient(90deg, ${alpha(theme.palette.info.main, 0.08)} 1px, transparent 1px), 
                    radial-gradient(110% 90% at 10% 5%, rgba(15,23,42,0.55) 0%, rgba(2,6,23,0.98) 100%)
                  `,
                  backgroundSize: '22px 22px, 22px 22px, cover',
                  boxShadow: (theme: Theme) => theme.customShadows?.z8
                }}
              >
                {canEmbedResume ? (
                  <iframe
                    src={resumeFileUrl}
                    title={t('appliedResume.ai.resumeTitle')}
                    width="100%"
                    height="100%"
                    style={{ border: 'none', opacity: isProcessing ? 0.7 : 1, transition: 'opacity 0.3s' }}
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <Stack
                    alignItems="center"
                    justifyContent="center"
                    sx={{ height: '100%', px: 4, textAlign: 'center', color: 'rgba(255,255,255,0.7)', gap: 2 }}
                  >
                    {renderIcon(DescriptionIcon, { sx: { fontSize: 48, color: theme.palette.info.light, opacity: 0.8 } })}
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      {t('appliedResume.ai.cannotEmbed')}
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.6, maxWidth: 280 }}>
                      {t('appliedResume.ai.cannotEmbedHint')}
                    </Typography>
                  </Stack>
                )}
                
                <Box sx={{ position: 'absolute', top: 12, left: 12, width: 24, height: 24, borderTop: `2px solid ${alpha(theme.palette.info.main, 0.5)}`, borderLeft: `2px solid ${alpha(theme.palette.info.main, 0.5)}`, pointerEvents: 'none' }} />
                <Box sx={{ position: 'absolute', top: 12, right: 12, width: 24, height: 24, borderTop: `2px solid ${alpha(theme.palette.info.main, 0.5)}`, borderRight: `2px solid ${alpha(theme.palette.info.main, 0.5)}`, pointerEvents: 'none' }} />
                <Box sx={{ position: 'absolute', bottom: 12, left: 12, width: 24, height: 24, borderBottom: `2px solid ${alpha(theme.palette.info.main, 0.5)}`, borderLeft: `2px solid ${alpha(theme.palette.info.main, 0.5)}`, pointerEvents: 'none' }} />
                <Box sx={{ position: 'absolute', bottom: 12, right: 12, width: 24, height: 24, borderBottom: `2px solid ${alpha(theme.palette.info.main, 0.5)}`, borderRight: `2px solid ${alpha(theme.palette.info.main, 0.5)}`, pointerEvents: 'none' }} />

                {isProcessing && (
                  <Box
                    sx={{
                      position: 'absolute',
                      left: 0,
                      right: 0,
                      top: `calc(${scanLinePosition}% - 18px)`,
                      height: 34,
                      background: `linear-gradient(180deg, transparent 0%, ${alpha(theme.palette.info.main, 0.4)} 45%, transparent 100%)`,
                      boxShadow: `0 0 20px ${alpha(theme.palette.info.main, 0.4)}, 0 0 40px ${alpha(theme.palette.info.main, 0.2)}`,
                      pointerEvents: 'none',
                    }}
                  />
                )}
              </Box>

              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 1.5 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                  {isProcessing ? t('appliedResume.ai.scanStatusScanning') : isCompleted ? t('appliedResume.ai.scanStatusComplete') : t('appliedResume.ai.scanStatusIdle')}
                </Typography>
                <Button
                  href={resumeFileUrl}
                  target="_blank"
                  variant="text"
                  size="small"
                  startIcon={renderIcon(OpenInNewIcon, { fontSize: 'small' })}
                  sx={{ textTransform: 'none', fontSize: '0.75rem', fontWeight: 900 }}
                >
                  {t('appliedResume.ai.openCV')}
                </Button>
              </Stack>
            </SectionCard>
          )}

          {isProcessing && (
            <Paper
              elevation={0}
              sx={{
                p: 3,
                mb: 2,
                border: '1px solid',
                borderColor: alpha(theme.palette.info.main, 0.3),
                borderRadius: 3,
                background: `linear-gradient(135deg, ${theme.palette.info.dark} 0%, ${alpha(theme.palette.info.dark, 0.8)} 100%)`,
                boxShadow: (theme: Theme) => theme.customShadows?.info
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
                        boxShadow: '0 0 10px rgba(0,0,0,0.2)'
                    }} 
                />
              </Stack>
              <LinearProgress
                variant="determinate"
                value={scanProgress}
                sx={{
                  height: 10,
                  borderRadius: 5,
                  bgcolor: alpha(theme.palette.info.light, 0.2),
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
          )}

          {isFailed && (
            <Paper 
                elevation={0} 
                sx={{ 
                    p: 4, 
                    mb: 2, 
                    border: '1px solid', 
                    borderColor: alpha(theme.palette.error.main, 0.2), 
                    borderRadius: 3, 
                    bgcolor: alpha(theme.palette.error.main, 0.04), 
                    textAlign: 'center' 
                }}
            >
              {renderIcon(CancelIcon, { sx: { fontSize: 48, color: 'error.main', mb: 2, opacity: 0.8 } })}
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
                startIcon={renderIcon(RefreshIcon)}
                onClick={handleAnalyze}
                disabled={analyzing}
                sx={{ mt: 3, textTransform: 'none', fontWeight: 900, borderRadius: 2, boxShadow: (theme: Theme) => theme.customShadows?.error }}
              >
                {t('appliedResume.ai.retry')}
              </Button>
            </Paper>
          )}

          {!isCompleted && !isProcessing && !isFailed && (
            <Paper
              elevation={0}
              sx={{
                p: 5,
                mb: 2,
                border: '2px dashed',
                borderColor: alpha(theme.palette.primary.main, 0.3),
                borderRadius: 4,
                textAlign: 'center',
                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.02)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
                transition: 'all 0.3s ease',
                '&:hover': {
                    borderColor: 'primary.main',
                    bgcolor: alpha(theme.palette.primary.main, 0.06)
                }
              }}
            >
              <Box sx={{ 
                  p: 2, 
                  borderRadius: '50%', 
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  display: 'inline-flex',
                  mb: 2
              }}>
                {renderIcon(AutoFixHighIcon, { sx: { fontSize: 48, color: 'primary.main' } })}
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
                startIcon={renderIcon(AutoFixHighIcon)}
                onClick={handleAnalyze}
                disabled={analyzing}
                sx={{
                  textTransform: 'none',
                  px: 4,
                  py: 1.5,
                  borderRadius: 3,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                  color: 'white',
                  fontWeight: 900,
                  fontSize: '1rem',
                  boxShadow: (theme: Theme) => theme.customShadows?.primary,
                  '&:hover': { transform: 'translateY(-2px)', boxShadow: (theme: Theme) => theme.customShadows?.z12 }
                }}
              >
                {t('appliedResume.ai.startScan')}
              </Button>
            </Paper>
          )}

          {isCompleted && (
            <>
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  mb: 2,
                  border: '1px solid',
                  borderColor: alpha(theme.palette.success.main, 0.2),
                  borderRadius: 3,
                  background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.04)} 0%, ${alpha(theme.palette.success.main, 0.08)} 100%)`,
                  boxShadow: (theme: Theme) => theme.customShadows?.success
                }}
              >
                <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="space-between" sx={{ flexWrap: 'wrap', rowGap: 1.5 }}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Box sx={{ color: 'success.main', display: 'flex' }}>
                        {renderIcon(CheckCircleIcon, { sx: { fontSize: 24 } })}
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
                    borderColor: alpha(theme.palette.divider, 0.8), 
                    borderRadius: 3,
                    bgcolor: 'background.paper',
                    boxShadow: (theme: Theme) => theme.customShadows?.z1
                }}
              >
                <ScoreGauge score={data?.aiAnalysisScore || 0} />
              </Paper>

              <SectionCard title={t('appliedResume.ai.overviewTitle')} icon={renderIcon(PsychologyIcon, { fontSize: 'small' })} iconColor={theme.palette.secondary.main}>
                <Typography variant="body2" sx={{ color: 'text.primary', lineHeight: 1.8, fontWeight: 600, opacity: 0.9 }}>
                  {data?.aiAnalysisSummary || t('appliedResume.ai.noEvaluation')}
                </Typography>
              </SectionCard>

              <SectionCard title={t('appliedResume.ai.prosTitle')} icon={renderIcon(ThumbUpAltIcon, { fontSize: 'small' })} iconColor={theme.palette.success.main}>
                <SkillChipList skills={data?.aiAnalysisPros} color="success" />
              </SectionCard>

              <SectionCard title={t('appliedResume.ai.consTitle')} icon={renderIcon(ThumbDownAltIcon, { fontSize: 'small' })} iconColor={theme.palette.error.main}>
                <SkillChipList skills={data?.aiAnalysisCons} color="error" />
              </SectionCard>

              <SectionCard title={t('appliedResume.ai.matchingSkillsTitle')} icon={renderIcon(CheckCircleIcon, { fontSize: 'small' })} iconColor={theme.palette.success.main}>
                <SkillChipList skills={data?.aiAnalysisMatchingSkills} color="success" icon={renderIcon(CheckCircleIcon) || undefined} />
              </SectionCard>

              <SectionCard title={t('appliedResume.ai.missingSkillsTitle')} icon={renderIcon(CancelIcon, { fontSize: 'small' })} iconColor={theme.palette.warning.main}>
                <SkillChipList skills={data?.aiAnalysisMissingSkills} color="error" icon={renderIcon(CancelIcon) || undefined} />
              </SectionCard>

              <SectionCard title={t('appliedResume.ai.allSkillsTitle')} icon={renderIcon(AutoFixHighIcon, { fontSize: 'small' })} iconColor={theme.palette.primary.main}>
                <SkillChipList skills={data?.aiAnalysisSkills} color="primary" />
              </SectionCard>

              <Box sx={{ textAlign: 'center', mt: 3, mb: 4 }}>
                <Divider sx={{ mb: 3, borderStyle: 'dashed' }} />
                <Button
                  variant="outlined"
                  color="primary"
                  size="medium"
                  startIcon={renderIcon(RefreshIcon)}
                  onClick={handleAnalyze}
                  disabled={analyzing}
                  sx={{ 
                    textTransform: 'none', 
                    fontWeight: 900, 
                    borderRadius: 2,
                    px: 3
                  }}
                >
                  {t('appliedResume.ai.reanalyze')}
                </Button>
              </Box>
            </>
          )}
        </Box>
      )}
    </Drawer>
  );
};

export default AIAnalysisDrawer;



