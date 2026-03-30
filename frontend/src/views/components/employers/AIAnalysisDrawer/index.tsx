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

import { ScoreGauge } from './ScoreGauge';
import { SkillChipList } from './SkillChipList';
import { SectionCard } from './SectionCard';

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
  [key: string]: unknown;
};

interface AIAnalysisDrawerProps {
  open: boolean;
  onClose: () => void;
  activityId: string | number | null;
  initialData?: AIAnalysisData | null;
}

const renderIcon = (
  IconComponent: React.ElementType | { default: React.ElementType } | unknown,
  props?: Record<string, unknown>,
): React.ReactElement | null => {
  if (!IconComponent) return null;
  // Handle ESM default export interop
  const Component = (IconComponent as { default: React.ElementType }).default || (IconComponent as React.ElementType);
  // Final check to prevent Error #130 if Component is still invalid
  if (typeof Component !== 'function' && typeof Component !== 'string' && typeof (Component as Record<string, unknown>)?.render !== 'function') {
    return null;
  }
  return <Component {...props} />;
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
}) => {
  const { t } = useTranslation('employer');
  const [data, setData] = React.useState<AIAnalysisData | null>(initialData || null);
  const [loading, setLoading] = React.useState(false);
  const [analyzing, setAnalyzing] = React.useState(false);
  const [scanLinePosition, setScanLinePosition] = React.useState(-12);

  // Synchronize with initialData ONLY when drawer opens or initialData changes ID.
  // This prevents infinite re-render loops if initialData changes due to parent cache updates.
  React.useEffect(() => {
    if (open && initialData && (!data || initialData.id !== data.id)) {
      setData(initialData);
    }
  }, [initialData, open, data?.id]);

  // Fetch full detail when drawer opens
  React.useEffect(() => {
    if (!open || !activityId) return;

    const fetchDetail = async () => {
      setLoading(true);
      try {
        const res = await jobPostActivityService.getJobPostActivityDetail(activityId);
        setData((res as AIAnalysisData) || null);
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
        const newData = res as AIAnalysisData;
        if (newData) {
          setData(newData);
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
  }, [open, activityId, data?.aiAnalysisStatus]);

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
      await jobPostActivityService.analyzeResume(activityId);
      toastMessages.success(t('appliedResume.ai.analysisStarted'));
    } catch (err: unknown) {
      errorHandling(err as import('axios').AxiosError<Record<string, unknown>>);
      setAnalyzing(false);
      setData((prev) => ({ ...(prev || {}), aiAnalysisStatus: 'failed' }));
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
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: DRAWER_WIDTH },
          bgcolor: '#fafbfc',
        },
      }}
    >
      <Box
        sx={{
          px: 2.5,
          py: 2,
          bgcolor: 'white',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          {renderIcon(PsychologyIcon, { sx: { color: '#06b6d4', fontSize: 28 } })}
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1e293b', lineHeight: 1.2 }}>
              {t('appliedResume.ai.drawerTitle')}
            </Typography>
            {data?.fullName && (
              <Typography variant="caption" sx={{ color: '#64748b' }}>
                {data.fullName} - {data.jobName}
              </Typography>
            )}
          </Box>
        </Stack>
        <IconButton onClick={onClose} size="small">
          {renderIcon(CloseIcon)}
        </IconButton>
      </Box>

      {loading ? (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <CircularProgress />
          <Typography variant="body2" sx={{ mt: 2, color: '#64748b' }}>
            {t('appliedResume.ai.loading')}
          </Typography>
        </Box>
      ) : (
        <Box sx={{ p: 2.5, overflowY: 'auto', flex: 1 }}>
          {resumeFileUrl && (
            <SectionCard title={t('appliedResume.ai.resumeTitle')} icon={renderIcon(DescriptionIcon, { fontSize: 'small' })} iconColor="#22d3ee">
              <Box
                sx={{
                  border: '1px solid rgba(34,211,238,0.28)',
                  borderRadius: 2,
                  overflow: 'hidden',
                  height: { xs: 260, sm: 350 },
                  bgcolor: '#0f172a',
                  position: 'relative',
                  backgroundImage:
                    'linear-gradient(rgba(34,211,238,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.08) 1px, transparent 1px), radial-gradient(110% 90% at 10% 5%, rgba(15,23,42,0.55) 0%, rgba(2,6,23,0.98) 100%)',
                  backgroundSize: '22px 22px, 22px 22px, cover',
                }}
              >
                {canEmbedResume ? (
                  <iframe
                    src={resumeFileUrl}
                    title={t('appliedResume.ai.resumeTitle')}
                    width="100%"
                    height="100%"
                    style={{ border: 'none', opacity: isProcessing ? 0.85 : 1 }}
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <Stack
                    alignItems="center"
                    justifyContent="center"
                    sx={{ height: '100%', px: 2.5, textAlign: 'center', color: '#cbd5e1', gap: 1.5 }}
                  >
                    {renderIcon(DescriptionIcon, { sx: { fontSize: 36, color: '#67e8f9' } })}
                    <Typography variant="body2">
                      {t('appliedResume.ai.cannotEmbed')}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                      {t('appliedResume.ai.cannotEmbedHint')}
                    </Typography>
                  </Stack>
                )}

                <Box sx={{ position: 'absolute', top: 10, left: 10, width: 28, height: 28, borderTop: '2px solid #22d3ee', borderLeft: '2px solid #22d3ee', pointerEvents: 'none' }} />
                <Box sx={{ position: 'absolute', top: 10, right: 10, width: 28, height: 28, borderTop: '2px solid #22d3ee', borderRight: '2px solid #22d3ee', pointerEvents: 'none' }} />
                <Box sx={{ position: 'absolute', bottom: 10, left: 10, width: 28, height: 28, borderBottom: '2px solid #22d3ee', borderLeft: '2px solid #22d3ee', pointerEvents: 'none' }} />
                <Box sx={{ position: 'absolute', bottom: 10, right: 10, width: 28, height: 28, borderBottom: '2px solid #22d3ee', borderRight: '2px solid #22d3ee', pointerEvents: 'none' }} />

                {isProcessing && (
                  <Box
                    sx={{
                      position: 'absolute',
                      left: 0,
                      right: 0,
                      top: `calc(${scanLinePosition}% - 18px)`,
                      height: 34,
                      background:
                        'linear-gradient(180deg, rgba(34,211,238,0) 0%, rgba(34,211,238,0.58) 45%, rgba(34,211,238,0) 100%)',
                      boxShadow: '0 0 22px rgba(34,211,238,0.68), 0 0 46px rgba(34,211,238,0.32)',
                      pointerEvents: 'none',
                    }}
                  />
                )}
              </Box>

              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 1.25 }}>
                <Typography variant="caption" sx={{ color: '#64748b' }}>
                  {isProcessing ? t('appliedResume.ai.scanStatusScanning') : isCompleted ? t('appliedResume.ai.scanStatusComplete') : t('appliedResume.ai.scanStatusIdle')}
                </Typography>
                <Button
                  href={resumeFileUrl}
                  target="_blank"
                  variant="text"
                  size="small"
                  startIcon={renderIcon(OpenInNewIcon, { fontSize: 'small' })}
                  sx={{ textTransform: 'none', fontSize: '0.75rem' }}
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
                p: 2.5,
                mb: 1.5,
                border: '1px solid rgba(34,211,238,0.35)',
                borderRadius: 2,
                background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 55%, #0f172a 100%)',
              }}
            >
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.2 }}>
                <Typography variant="subtitle2" sx={{ color: '#a5f3fc', fontWeight: 700 }}>
                  {t('appliedResume.ai.scanning')}
                </Typography>
                <Chip size="small" label={`${scanProgress}%`} sx={{ color: '#0f172a', bgcolor: '#67e8f9', fontWeight: 700 }} />
              </Stack>
              <LinearProgress
                variant="determinate"
                value={scanProgress}
                sx={{
                  height: 8,
                  borderRadius: 999,
                  bgcolor: 'rgba(103,232,249,0.2)',
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 999,
                    background: 'linear-gradient(90deg, #22d3ee 0%, #06b6d4 55%, #0891b2 100%)',
                  },
                }}
              />
              <Typography variant="caption" sx={{ color: '#bae6fd', mt: 1, display: 'block' }}>
                {t('appliedResume.ai.scanProgress')}
              </Typography>
            </Paper>
          )}

          {isFailed && (
            <Paper elevation={0} sx={{ p: 3, mb: 1.5, border: '1px solid #fecaca', borderRadius: 2, bgcolor: '#fef2f2', textAlign: 'center' }}>
              {renderIcon(CancelIcon, { sx: { fontSize: 36, color: '#ef4444', mb: 1 } })}
              <Typography variant="body1" sx={{ fontWeight: 600, color: '#991b1b' }}>
                {t('appliedResume.ai.failedTitle')}
              </Typography>
              {data?.aiAnalysisSummary && (
                <Typography variant="body2" sx={{ color: '#b91c1c', mt: 0.5, fontSize: '0.8rem' }}>
                  {data.aiAnalysisSummary}
                </Typography>
              )}
              <Button
                variant="outlined"
                color="error"
                size="small"
                startIcon={renderIcon(RefreshIcon)}
                onClick={handleAnalyze}
                disabled={analyzing}
                sx={{ mt: 2, textTransform: 'none' }}
              >
                {t('appliedResume.ai.retry')}
              </Button>
            </Paper>
          )}

          {!isCompleted && !isProcessing && !isFailed && (
            <Paper
              elevation={0}
              sx={{
                p: 3,
                mb: 1.5,
                border: '1px dashed #67e8f9',
                borderRadius: 2,
                textAlign: 'center',
                background: 'linear-gradient(135deg, #f8fafc 0%, #ecfeff 100%)',
              }}
            >
              {renderIcon(AutoFixHighIcon, { sx: { fontSize: 40, color: '#0891b2', mb: 1 } })}
              <Typography variant="body1" sx={{ fontWeight: 700, color: '#0f172a', mb: 0.5 }}>
                {t('appliedResume.ai.idleTitle')}
              </Typography>
              <Typography variant="caption" sx={{ color: '#475569', display: 'block', mb: 2 }}>
                {t('appliedResume.ai.idleHint')}
              </Typography>
              <Button
                variant="contained"
                startIcon={renderIcon(AutoFixHighIcon)}
                onClick={handleAnalyze}
                disabled={analyzing}
                sx={{
                  textTransform: 'none',
                  background: 'linear-gradient(90deg, #0891b2 0%, #22d3ee 100%)',
                  color: '#0f172a',
                  fontWeight: 700,
                  '&:hover': { background: 'linear-gradient(90deg, #0e7490 0%, #06b6d4 100%)' },
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
                  p: 2,
                  mb: 1.5,
                  border: '1px solid #bae6fd',
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #ecfeff 0%, #f0fdfa 100%)',
                }}
              >
                <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between" sx={{ flexWrap: 'wrap', rowGap: 1 }}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    {renderIcon(CheckCircleIcon, { sx: { color: '#0e7490' } })}
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#134e4a' }}>
                      {t('appliedResume.ai.completeTitle')}
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={1}>
                    <Chip size="small" label={`Match: ${stats.matchingSkills}`} color="success" variant="outlined" />
                    <Chip size="small" label={`Missing: ${stats.missingSkills}`} color="error" variant="outlined" />
                    <Chip size="small" label={`Skills: ${stats.totalSkills}`} color="info" variant="outlined" />
                  </Stack>
                </Stack>
              </Paper>

              <Paper elevation={0} sx={{ mb: 1.5, border: '1px solid #e2e8f0', borderRadius: 2 }}>
                <ScoreGauge score={data?.aiAnalysisScore || 0} />
              </Paper>

              <SectionCard title={t('appliedResume.ai.overviewTitle')} icon={renderIcon(PsychologyIcon, { fontSize: 'small' })} iconColor="#6366f1">
                <Typography variant="body2" sx={{ color: '#334155', lineHeight: 1.7 }}>
                  {data?.aiAnalysisSummary || t('appliedResume.ai.noEvaluation')}
                </Typography>
              </SectionCard>

              <SectionCard title={t('appliedResume.ai.prosTitle')} icon={renderIcon(ThumbUpAltIcon, { fontSize: 'small' })} iconColor="#22c55e">
                <SkillChipList skills={data?.aiAnalysisPros} color="success" />
              </SectionCard>

              <SectionCard title={t('appliedResume.ai.consTitle')} icon={renderIcon(ThumbDownAltIcon, { fontSize: 'small' })} iconColor="#ef4444">
                <SkillChipList skills={data?.aiAnalysisCons} color="error" />
              </SectionCard>

              <SectionCard title={t('appliedResume.ai.matchingSkillsTitle')} icon={renderIcon(CheckCircleIcon, { fontSize: 'small' })} iconColor="#22c55e">
                <SkillChipList skills={data?.aiAnalysisMatchingSkills} color="success" icon={renderIcon(CheckCircleIcon) || undefined} />
              </SectionCard>

              <SectionCard title={t('appliedResume.ai.missingSkillsTitle')} icon={renderIcon(CancelIcon, { fontSize: 'small' })} iconColor="#f97316">
                <SkillChipList skills={data?.aiAnalysisMissingSkills} color="error" icon={renderIcon(CancelIcon) || undefined} />
              </SectionCard>

              <SectionCard title={t('appliedResume.ai.allSkillsTitle')} icon={renderIcon(AutoFixHighIcon, { fontSize: 'small' })} iconColor="#3b82f6">
                <SkillChipList skills={data?.aiAnalysisSkills} color="primary" />
              </SectionCard>

              <Box sx={{ textAlign: 'center', mt: 2, mb: 3 }}>
                <Divider sx={{ mb: 2 }} />
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={renderIcon(RefreshIcon)}
                  onClick={handleAnalyze}
                  disabled={analyzing}
                  sx={{ textTransform: 'none' }}
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
