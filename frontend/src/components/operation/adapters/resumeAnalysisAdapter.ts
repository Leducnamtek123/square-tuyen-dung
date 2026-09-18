import type { OperationPayload, OperationStep, OperationStatus } from '../types';

export interface ResumeAnalysisInputData {
  id?: string | number | null;
  fullName?: string | null;
  aiAnalysisStatus?: 'processing' | 'completed' | 'failed' | 'idle' | string | null;
  aiAnalysisProgress?: number | null;
  aiAnalysisScore?: number | null;
  aiAnalysisSummary?: string | null;
  aiAnalysisEvidence?:
    | {
        operation_id?: string;
        operationId?: string;
        [key: string]: any;
      }
    | any[]
    | null;
  [key: string]: any;
}

const STEP_DEFINITIONS = [
  {
    key: 'extract_text',
    label: 'Đọc & trích xuất tệp hồ sơ/CV',
    runningDetail: 'Đang đọc và trích xuất nội dung CV...',
    completedDetail: 'Trích xuất văn bản CV hoàn tất.',
  },
  {
    key: 'criteria_match',
    label: 'Đối soát tiêu chí & yêu cầu công việc',
    runningDetail: 'Đang thiết lập tiêu chí và đối soát yêu cầu...',
    completedDetail: 'Chuẩn bị tiêu chí đối soát hoàn tất.',
  },
  {
    key: 'llm_evaluation',
    label: 'Phân tích chuyên sâu với AI',
    runningDetail: 'Mô hình AI đang phân tích năng lực và dẫn chứng...',
    completedDetail: 'Mô hình AI đã hoàn tất phân tích.',
  },
  {
    key: 'scoring_finalize',
    label: 'Tổng hợp dẫn chứng & tính điểm',
    runningDetail: 'Đang chuẩn hóa điểm và tổng hợp kết quả...',
    completedDetail: 'Tổng hợp dẫn chứng & tính điểm hoàn tất.',
  },
] as const;

/**
 * Converts candidate AI analysis state into an OperationPayload.
 *
 * Progress mapping:
 * - 0-24%: extract_text running, others pending
 * - 25-44%: extract_text completed, criteria_match running, others pending
 * - 45-69%: extract_text completed, criteria_match completed, llm_evaluation running, scoring_finalize pending
 * - 70-99%: extract_text, criteria_match, llm_evaluation completed, scoring_finalize running
 * - 100% / completed: all completed
 * - failed: active step marked failed with error message
 */
export function adaptResumeAnalysisOperation(
  data: ResumeAnalysisInputData | null,
  scanProgress?: number
): OperationPayload {
  const rawProgress = scanProgress ?? data?.aiAnalysisProgress ?? 0;
  const progress = Math.min(100, Math.max(0, Math.round(rawProgress)));
  const statusStr = data?.aiAnalysisStatus;
  const isFailed = statusStr === 'failed';
  const isCompleted = statusStr === 'completed' || (progress >= 100 && !isFailed);

  // Determine active step index based on progress
  let activeIndex = 0;
  if (progress >= 70) {
    activeIndex = 3;
  } else if (progress >= 45) {
    activeIndex = 2;
  } else if (progress >= 25) {
    activeIndex = 1;
  } else {
    activeIndex = 0;
  }

  let operationStatus: OperationStatus = 'running';
  if (isFailed) {
    operationStatus = 'failed';
  } else if (isCompleted) {
    operationStatus = 'completed';
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
          errorMessage: data?.aiAnalysisSummary || 'Phân tích thất bại',
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

  const evidence = (data?.aiAnalysisEvidence && !Array.isArray(data.aiAnalysisEvidence))
    ? data.aiAnalysisEvidence
    : undefined;
  const operationId =
    evidence?.operation_id ||
    evidence?.operationId ||
    `op_ai_scan_${data?.id || 'temp'}`;

  const currentStepKey = isCompleted
    ? 'scoring_finalize'
    : STEP_DEFINITIONS[activeIndex]?.key;

  return {
    id: String(operationId),
    type: 'candidate.ai_scan',
    title: data?.id ? `AI phân tích ứng viên #${data.id}` : 'AI phân tích ứng viên',
    status: operationStatus,
    progress: isCompleted ? 100 : progress,
    currentStepKey,
    steps,
    result: isCompleted && data?.aiAnalysisScore != null
      ? { score: data.aiAnalysisScore, summary: data?.aiAnalysisSummary }
      : null,
    error: isFailed
      ? {
          code: 'AI_SCAN_FAILED',
          message: data?.aiAnalysisSummary || 'Phân tích thất bại',
        }
      : null,
    metadata: {
      activityId: data?.id,
      candidateName: data?.fullName,
    },
  };
}

export default adaptResumeAnalysisOperation;
