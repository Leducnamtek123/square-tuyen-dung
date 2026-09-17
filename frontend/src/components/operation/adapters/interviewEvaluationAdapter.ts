import type { OperationPayload, OperationStep, OperationStatus } from '../types';

export interface EvaluationSessionData {
  id?: number | string | null;
  status?: string | null;
  jobName?: string | null;
  companyName?: string | null;
  candidateName?: string | null;
  progress?: number | null;
  evaluationProgress?: number | null;
  aiEvaluationProgress?: number | null;
  aiOverallScore?: number | null;
  ai_overall_score?: number | null;
  aiTechnicalScore?: number | null;
  ai_technical_score?: number | null;
  aiCommunicationScore?: number | null;
  ai_communication_score?: number | null;
  aiSummary?: string | null;
  ai_summary?: string | null;
  aiStrengths?: string[] | string | null;
  ai_strengths?: string[] | string | null;
  aiWeaknesses?: string[] | string | null;
  ai_weaknesses?: string[] | string | null;
  sessionMetadata?: Record<string, any> | null;
  session_metadata?: Record<string, any> | null;
  [key: string]: any;
}

const STEP_DEFINITIONS = [
  {
    key: 'sync_recording',
    label: 'Đồng bộ dữ liệu phòng phỏng vấn',
    runningDetail: 'Đang đồng bộ dữ liệu phiên phỏng vấn...',
    completedDetail: 'Đồng bộ dữ liệu phiên phỏng vấn thành công.',
  },
  {
    key: 'transcribe_align',
    label: 'Tổng hợp hội thoại & phiên âm',
    runningDetail: 'Đang tổng hợp nội dung hội thoại...',
    completedDetail: 'Tổng hợp hội thoại & phiên âm thành công.',
  },
  {
    key: 'ai_scoring',
    label: 'AI đánh giá năng lực & chuyên môn',
    runningDetail: 'Mô hình AI đang phân tích năng lực và dẫn chứng câu trả lời...',
    completedDetail: 'AI hoàn thành đánh giá năng lực & chuyên môn.',
  },
  {
    key: 'apply_weights',
    label: 'Áp dụng thang điểm & trọng số',
    runningDetail: 'Đang áp dụng trọng số đánh giá doanh nghiệp...',
    completedDetail: 'Áp dụng thang điểm & trọng số thành công.',
  },
  {
    key: 'publish_report',
    label: 'Hoàn tất báo cáo & công bố kết quả',
    runningDetail: 'Đang lưu trữ báo cáo và phát sự kiện hoàn tất...',
    completedDetail: 'Hoàn tất báo cáo & công bố kết quả.',
  },
] as const;

/**
 * Converts an interview session into an OperationPayload.
 *
 * 5 steps:
 * - sync_recording (0-19%)
 * - transcribe_align (20-39%)
 * - ai_scoring (40-69%)
 * - apply_weights (70-89%)
 * - publish_report (90-99%)
 * - completed: 100%
 */
export function adaptInterviewEvaluationOperation(
  session: EvaluationSessionData | null,
  evalProgress?: number
): OperationPayload | null {
  if (!session) {
    return null;
  }

  const rawStatus = (session.status || '').toLowerCase();
  const isFailed = rawStatus === 'failed';
  const hasCompletedScores =
    (session.aiOverallScore != null || session.ai_overall_score != null) &&
    Boolean(session.aiSummary || session.ai_summary);
  const isCompleted = (rawStatus === 'completed' || hasCompletedScores) && !isFailed;

  let progress = 0;
  if (isCompleted) {
    progress = 100;
  } else if (evalProgress != null) {
    progress = Math.min(100, Math.max(0, Math.round(evalProgress)));
  } else if (
    session.evaluationProgress != null ||
    session.progress != null ||
    session.aiEvaluationProgress != null
  ) {
    progress = Math.min(
      100,
      Math.max(
        0,
        Math.round(
          session.evaluationProgress ?? session.progress ?? session.aiEvaluationProgress ?? 0
        )
      )
    );
  } else if (rawStatus === 'processing' || rawStatus === 'running') {
    progress = 50;
  }

  let activeIndex = 0;
  if (progress >= 90) {
    activeIndex = 4;
  } else if (progress >= 70) {
    activeIndex = 3;
  } else if (progress >= 40) {
    activeIndex = 2;
  } else if (progress >= 20) {
    activeIndex = 1;
  } else {
    activeIndex = 0;
  }

  let operationStatus: OperationStatus = 'running';
  if (isFailed) {
    operationStatus = 'failed';
  } else if (isCompleted) {
    operationStatus = 'completed';
  } else if (rawStatus === 'scheduled' || rawStatus === 'pending') {
    operationStatus = 'queued';
  } else if (rawStatus === 'cancelled' || rawStatus === 'interrupted') {
    operationStatus = 'cancelled';
  }

  const steps: OperationStep[] = STEP_DEFINITIONS.map((def, idx) => {
    if (isCompleted) {
      return {
        key: def.key,
        label: def.label,
        status: 'completed',
        progress: 100,
        detail: def.completedDetail,
      };
    }

    if (isFailed) {
      if (idx < activeIndex) {
        return {
          key: def.key,
          label: def.label,
          status: 'completed',
          progress: 100,
          detail: def.completedDetail,
        };
      }
      if (idx === activeIndex) {
        return {
          key: def.key,
          label: def.label,
          status: 'failed',
          progress,
          detail: def.runningDetail,
          errorMessage: session.aiSummary || session.ai_summary || 'Đánh giá phỏng vấn thất bại',
        };
      }
      return {
        key: def.key,
        label: def.label,
        status: 'pending',
        progress: 0,
      };
    }

    // Running state
    if (idx < activeIndex) {
      return {
        key: def.key,
        label: def.label,
        status: 'completed',
        progress: 100,
        detail: def.completedDetail,
      };
    }
    if (idx === activeIndex) {
      return {
        key: def.key,
        label: def.label,
        status: 'running',
        progress,
        detail: def.runningDetail,
      };
    }
    return {
      key: def.key,
      label: def.label,
      status: 'pending',
      progress: 0,
    };
  });

  const metadata = session.sessionMetadata || session.session_metadata;
  const rawMetaObj =
    metadata && typeof metadata === 'object' && !Array.isArray(metadata)
      ? (metadata as Record<string, any>)
      : {};

  const operationId =
    rawMetaObj.operation_id ||
    rawMetaObj.operationId ||
    `op_interview_eval_${session.id || 'temp'}`;

  const currentStepKey = isCompleted
    ? 'publish_report'
    : STEP_DEFINITIONS[activeIndex]?.key;

  const overallScore = session.aiOverallScore ?? session.ai_overall_score;
  const technicalScore = session.aiTechnicalScore ?? session.ai_technical_score;
  const communicationScore = session.aiCommunicationScore ?? session.ai_communication_score;
  const summary = session.aiSummary ?? session.ai_summary;

  return {
    id: String(operationId),
    type: 'interview.evaluate',
    title: session.id ? `Đánh giá phỏng vấn AI #${session.id}` : 'Đánh giá phỏng vấn AI',
    status: operationStatus,
    progress: isCompleted ? 100 : progress,
    currentStepKey,
    steps,
    result:
      isCompleted && overallScore != null
        ? {
            overallScore: Number(overallScore),
            technicalScore: technicalScore != null ? Number(technicalScore) : 0,
            communicationScore: communicationScore != null ? Number(communicationScore) : 0,
            summary: summary || '',
          }
        : null,
    error: isFailed
      ? {
          code: 'EVALUATION_FAILED',
          message: String(summary || 'Đánh giá phỏng vấn thất bại'),
          detail: String(summary || 'Đánh giá phỏng vấn thất bại'),
        }
      : null,
    metadata: {
      sessionId: session.id,
      jobName: session.jobName,
      companyName: session.companyName,
      candidateName: session.candidateName,
      ...rawMetaObj,
    },
  };
}

export default adaptInterviewEvaluationOperation;
