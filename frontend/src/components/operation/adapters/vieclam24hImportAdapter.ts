import type { OperationPayload, OperationStep, OperationStatus } from '../types';
import type { Vieclam24hImportJob } from '@/services/adminManagementService';

const STEP_DEFINITIONS = [
  {
    key: 'authenticate',
    label: 'Đăng nhập portal Vieclam24h',
    runningDetail: 'Đang kết nối và xác thực tài khoản Vieclam24h...',
    completedDetail: 'Xác thực thành công.',
  },
  {
    key: 'fetch_candidates',
    label: 'Tải danh sách ứng viên',
    runningDetail: 'Đang thu thập ứng viên...',
    completedDetail: 'Đã thu thập ứng viên.',
  },
  {
    key: 'parse_normalize',
    label: 'Chuẩn hóa dữ liệu hồ sơ',
    runningDetail: 'Đang phân tích và chuẩn hóa hồ sơ...',
    completedDetail: 'Đã chuẩn hóa hồ sơ.',
  },
  {
    key: 'deduplicate_save',
    label: 'Đối soát trùng lặp & lưu CSDL',
    runningDetail: 'Đang đối soát trùng lặp và lưu CSDL...',
    completedDetail: 'Đối soát và lưu CSDL hoàn tất.',
  },
  {
    key: 'generate_report',
    label: 'Tổng hợp báo cáo kết quả',
    runningDetail: 'Đang hoàn tất báo cáo...',
    completedDetail: 'Hoàn tất đồng bộ ứng viên Vieclam24h.',
  },
] as const;

/**
 * Converts a Vieclam24hImportJob into an OperationPayload.
 *
 * Progress mapping across 5 steps:
 * - 0-9%: authenticate running, others pending
 * - 10-39%: authenticate completed, fetch_candidates running, others pending
 * - 40-69%: authenticate & fetch_candidates completed, parse_normalize running, others pending
 * - 70-94%: authenticate, fetch_candidates, parse_normalize completed, deduplicate_save running, generate_report pending
 * - 95%+: authenticate, fetch_candidates, parse_normalize, deduplicate_save completed, generate_report running
 * - completed: all 5 steps completed
 * - failed: active step marked failed with errorMessage
 */
export function adaptVieclam24hImportOperation(
  job: Vieclam24hImportJob | null
): OperationPayload | null {
  if (!job) {
    return null;
  }

  const rawProgress = job.progress ?? 0;
  const progress = Math.min(100, Math.max(0, Math.round(rawProgress)));
  const isFailed = job.status === 'failed';
  const isCompleted = job.status === 'completed' || (progress >= 100 && !isFailed);

  // Determine active step index based on progress
  let activeIndex = 0;
  if (progress >= 95) {
    activeIndex = 4;
  } else if (progress >= 70) {
    activeIndex = 3;
  } else if (progress >= 40) {
    activeIndex = 2;
  } else if (progress >= 10) {
    activeIndex = 1;
  } else {
    activeIndex = 0;
  }

  let operationStatus: OperationStatus = 'running';
  if (isFailed) {
    operationStatus = 'failed';
  } else if (isCompleted) {
    operationStatus = 'completed';
  } else if (job.status === 'cancelled') {
    operationStatus = 'cancelled';
  } else if (job.status === 'pending' && progress === 0) {
    operationStatus = 'queued';
  }

  const steps: OperationStep[] = STEP_DEFINITIONS.map((def, idx) => {
    if (isCompleted) {
      let completedDetail: string = def.completedDetail;
      if (
        def.key === 'deduplicate_save' &&
        (job.createdCount != null || job.updatedCount != null || job.skippedCount != null)
      ) {
        completedDetail = `Đã lưu: tạo mới ${job.createdCount ?? 0}, cập nhật ${job.updatedCount ?? 0}, bỏ qua ${job.skippedCount ?? 0}.`;
      }

      return {
        key: def.key,
        label: def.label,
        status: 'completed',
        progress: 100,
        detail: completedDetail,
        startedAt: job.startedAt || null,
        completedAt: job.finishedAt || null,
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
          startedAt: job.startedAt || null,
          completedAt: null,
        };
      }
      if (idx === activeIndex) {
        return {
          key: def.key,
          label: def.label,
          status: 'failed',
          progress,
          detail: def.runningDetail,
          errorMessage: job.errorMessage || 'Đồng bộ thất bại',
          startedAt: job.startedAt || null,
          completedAt: job.finishedAt || null,
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
        startedAt: job.startedAt || null,
        completedAt: null,
      };
    }
    if (idx === activeIndex) {
      return {
        key: def.key,
        label: def.label,
        status: 'running',
        progress,
        detail: def.runningDetail,
        startedAt: job.startedAt || null,
      };
    }
    return {
      key: def.key,
      label: def.label,
      status: 'pending',
      progress: 0,
    };
  });

  const resultPayload = (job.resultPayload && typeof job.resultPayload === 'object' && !Array.isArray(job.resultPayload))
    ? (job.resultPayload as Record<string, any>)
    : undefined;
  const sourcePayload = (job.sourcePayload && typeof job.sourcePayload === 'object' && !Array.isArray(job.sourcePayload))
    ? (job.sourcePayload as Record<string, any>)
    : undefined;

  const operationId =
    resultPayload?.operation_id ||
    resultPayload?.operationId ||
    sourcePayload?.operation_id ||
    sourcePayload?.operationId ||
    `op_vieclam24h_import_${job.id}`;

  const currentStepKey = isCompleted
    ? 'generate_report'
    : STEP_DEFINITIONS[activeIndex]?.key;

  return {
    id: String(operationId),
    type: 'vieclam24h.import',
    title: `Đồng bộ ứng viên Vieclam24h #${job.id}`,
    status: operationStatus,
    progress: isCompleted ? 100 : progress,
    currentStepKey,
    steps,
    result: isCompleted
      ? {
          createdCount: job.createdCount,
          updatedCount: job.updatedCount,
          skippedCount: job.skippedCount,
        }
      : (resultPayload || null),
    error: isFailed
      ? {
          code: 'IMPORT_FAILED',
          message: job.errorMessage || 'Đồng bộ thất bại',
          detail: job.errorMessage || 'Đồng bộ thất bại',
        }
      : null,
    metadata: {
      jobId: job.id,
      sourceUrl: job.sourceUrl,
      sourceAccount: job.sourceAccount,
      targetCityId: job.targetCityId,
      targetDistrictId: job.targetDistrictId,
    },
    createdAt: job.startedAt || null,
    finishedAt: job.finishedAt || null,
  };
}

export default adaptVieclam24hImportOperation;
