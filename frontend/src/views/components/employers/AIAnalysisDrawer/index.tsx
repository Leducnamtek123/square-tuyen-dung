'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import type { AxiosError } from 'axios';
import jobPostActivityService from '../../../../services/jobPostActivityService';
import toastMessages from '../../../../utils/toastMessages';
import errorHandling from '../../../../utils/errorHandling';
import type { JobPostActivity } from '@/types/models';
import AIAnalysisDrawerView from './AIAnalysisDrawerView';

export type AIAnalysisData = {
  id?: string | number;
  fullName?: string;
  jobName?: string;
  aiAnalysisStatus?: 'processing' | 'completed' | 'failed' | 'idle' | string;
  aiAnalysisProgress?: number;
  resumeFileUrl?: string;
  onlineProfileUrl?: string;
  resumeType?: string;
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

const EMBEDDABLE_HOSTS = new Set([
  'tuyendung.square.vn',
  's3.tuyendung.square.vn',
  'res.cloudinary.com',
  'firebasestorage.googleapis.com',
  'localhost',
]);

const toSkillArray = (skills: unknown): string[] => {
  if (Array.isArray(skills)) {
    return skills.flatMap((item) => {
      const text = String(item || '').trim();
      return text ? [text] : [];
    });
  }

  if (typeof skills === 'string') {
    return skills.split(',').flatMap((item) => {
      const text = item.trim();
      return text ? [text] : [];
    });
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
  if (Array.isArray(value)) return value.flatMap((item) => String(item));
  return undefined;
};

const toAIAnalysisData = (activity: JobPostActivity): AIAnalysisData => {
  const raw = activity as ActivityRawFields;
  const jobPostDict = raw.jobPostDict || {};
  const aiAnalysisScoreRaw = raw.aiAnalysisScore;
  const resumeSlug = activity.resume?.slug || activity.resumeSlug;
  const resumeType = activity.type || activity.resume?.type;
  // Build online profile URL from slug
  const onlineProfileUrl = resumeSlug
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/ho-so-truc-tuyen/${resumeSlug}`
    : undefined;

  return {
    id: activity.id,
    fullName: activity.fullName,
    jobName: activity.jobPost?.jobName || jobPostDict.jobName,
    aiAnalysisStatus: activity.aiAnalysisStatus,
    aiAnalysisProgress: activity.aiAnalysisProgress,
    resumeFileUrl: typeof raw.resumeFileUrl === 'string' ? raw.resumeFileUrl : undefined,
    onlineProfileUrl,
    resumeType,
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

type AIAnalysisDrawerState = {
  data: AIAnalysisData | null;
  loading: boolean;
  analyzing: boolean;
  scanLinePosition: number;
};

type AIAnalysisDrawerAction =
  | { type: 'set-data'; value: AIAnalysisData | null }
  | { type: 'set-loading'; value: boolean }
  | { type: 'set-analyzing'; value: boolean }
  | { type: 'set-scan-line'; value: number }
  | { type: 'sync-initial-data'; value: AIAnalysisData | null };

const initialState: AIAnalysisDrawerState = {
  data: null,
  loading: false,
  analyzing: false,
  scanLinePosition: -12,
};

function reducer(state: AIAnalysisDrawerState, action: AIAnalysisDrawerAction): AIAnalysisDrawerState {
  switch (action.type) {
    case 'set-data':
      return { ...state, data: action.value };
    case 'set-loading':
      return { ...state, loading: action.value };
    case 'set-analyzing':
      return { ...state, analyzing: action.value };
    case 'set-scan-line':
      return { ...state, scanLinePosition: action.value };
    case 'sync-initial-data':
      return {
        ...state,
        data: !state.data || action.value?.id !== state.data.id ? action.value : state.data,
      };
    default:
      return state;
  }
}

const AIAnalysisDrawer = ({ open, onClose, activityId, initialData, onAnalysisStateChange }: AIAnalysisDrawerProps) => {
  const { t } = useTranslation('employer');
  const [state, dispatch] = React.useReducer(reducer, {
    ...initialState,
    data: initialData || null,
  });

  React.useEffect(() => {
    if (!open || !initialData) return;
    dispatch({ type: 'sync-initial-data', value: initialData });
  }, [initialData, open]);

  React.useEffect(() => {
    if (!open || !activityId) return;

    const fetchDetail = async () => {
      dispatch({ type: 'set-loading', value: true });
      try {
        const res = await jobPostActivityService.getJobPostActivityDetail(activityId);
        dispatch({ type: 'set-data', value: res ? toAIAnalysisData(res) : null });
      } catch {
        // keep current data
      } finally {
        dispatch({ type: 'set-loading', value: false });
      }
    };

    fetchDetail();
  }, [open, activityId]);

  React.useEffect(() => {
    if (!open || !activityId || state.data?.aiAnalysisStatus !== 'processing') return;

    const interval = setInterval(async () => {
      try {
        const res = await jobPostActivityService.getJobPostActivityDetail(activityId);
        const newData = toAIAnalysisData(res);
        if (newData) {
          dispatch({ type: 'set-data', value: newData });
          onAnalysisStateChange?.({
            aiAnalysisStatus: normalizeAiStatus(newData.aiAnalysisStatus),
            aiAnalysisProgress: newData.aiAnalysisProgress,
          });
        }
        if (newData && newData.aiAnalysisStatus !== 'processing') {
          dispatch({ type: 'set-analyzing', value: false });
          clearInterval(interval);
        }
      } catch {
        // ignore polling errors
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [open, activityId, state.data?.aiAnalysisStatus, onAnalysisStateChange]);

  React.useEffect(() => {
    if (!open || state.data?.aiAnalysisStatus !== 'processing') {
      if (state.data?.aiAnalysisStatus !== 'completed') {
        dispatch({ type: 'set-scan-line', value: -12 });
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
      dispatch({ type: 'set-scan-line', value: -12 + phase * 124 });
      rafId = requestAnimationFrame(animateScanLine);
    };

    rafId = requestAnimationFrame(animateScanLine);

    return () => {
      isActive = false;
      cancelAnimationFrame(rafId);
    };
  }, [open, state.data?.aiAnalysisStatus]);

  const handleAnalyze = async () => {
    if (!activityId) return;
    try {
      dispatch({ type: 'set-analyzing', value: true });
      dispatch({
        type: 'set-data',
        value: { ...(state.data || {}), aiAnalysisStatus: 'processing', aiAnalysisProgress: 5 },
      });
      onAnalysisStateChange?.({ aiAnalysisStatus: 'processing', aiAnalysisProgress: 5 });
      // For online CVs, pass the online profile URL so backend can scrape it
      const payload: { onlineProfileUrl?: string } = {};
      if (state.data?.onlineProfileUrl && !state.data?.resumeFileUrl) {
        payload.onlineProfileUrl = state.data.onlineProfileUrl;
      }
      await jobPostActivityService.analyzeResume(activityId, payload);
      toastMessages.success(t('appliedResume.ai.analysisStarted'));
    } catch (err: unknown) {
      errorHandling(err as AxiosError);
      dispatch({ type: 'set-analyzing', value: false });
      dispatch({ type: 'set-data', value: { ...(state.data || {}), aiAnalysisStatus: 'failed' } });
      onAnalysisStateChange?.({ aiAnalysisStatus: 'failed', aiAnalysisProgress: 0 });
    }
  };

  const status = state.data?.aiAnalysisStatus;
  const isCompleted = status === 'completed';
  const isProcessing = status === 'processing';
  const isFailed = status === 'failed';
  const scanProgress = React.useMemo(() => {
    if (isCompleted) return 100;
    const progress = Number(state.data?.aiAnalysisProgress);
    if (Number.isFinite(progress)) {
      return Math.max(0, Math.min(100, Math.round(progress)));
    }
    return 0;
  }, [state.data?.aiAnalysisProgress, isCompleted]);

  const resumeFileUrl = typeof state.data?.resumeFileUrl === 'string' ? state.data.resumeFileUrl : '';
  const onlineProfileUrl = typeof state.data?.onlineProfileUrl === 'string' ? state.data.onlineProfileUrl : '';
  const canEmbedResume = React.useMemo(() => canEmbedUrl(resumeFileUrl), [resumeFileUrl]);
  const stats = React.useMemo(
    () => ({
      matchingSkills: toSkillArray(state.data?.aiAnalysisMatchingSkills).length,
      missingSkills: toSkillArray(state.data?.aiAnalysisMissingSkills).length,
      totalSkills: toSkillArray(state.data?.aiAnalysisSkills).length,
    }),
    [state.data?.aiAnalysisMatchingSkills, state.data?.aiAnalysisMissingSkills, state.data?.aiAnalysisSkills]
  );

  return (
    <AIAnalysisDrawerView
      open={open}
      onClose={onClose}
      loading={state.loading}
      data={state.data}
      analyzing={state.analyzing}
      scanLinePosition={state.scanLinePosition}
      scanProgress={scanProgress}
      isProcessing={isProcessing}
      isCompleted={isCompleted}
      isFailed={isFailed}
      resumeFileUrl={resumeFileUrl}
      onlineProfileUrl={onlineProfileUrl}
      canEmbedResume={canEmbedResume}
      stats={stats}
      onAnalyze={handleAnalyze}
      t={t}
    />
  );
};

export default AIAnalysisDrawer;
