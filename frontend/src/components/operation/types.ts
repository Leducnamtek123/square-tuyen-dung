export type OperationStatus = 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';
export type OperationStepStatus = 'pending' | 'running' | 'completed' | 'failed' | 'skipped';

export interface OperationStep {
  key: string;
  label: string;
  status: OperationStepStatus;
  progress?: number; // 0 - 100
  detail?: string;
  resultSummary?: string;
  errorMessage?: string;
  startedAt?: string | null;
  completedAt?: string | null;
}

export interface OperationErrorPayload {
  code?: string;
  message: string;
  detail?: string;
}

export interface OperationPayload {
  id: string;
  type: string;
  title: string;
  status: OperationStatus;
  progress: number;
  currentStepKey?: string | null;
  steps: OperationStep[];
  result?: Record<string, any> | null;
  error?: OperationErrorPayload | null;
  metadata?: Record<string, any>;
  createdAt?: string | null;
  updatedAt?: string | null;
  finishedAt?: string | null;
}

export interface ActiveOperationsResponse {
  results: OperationPayload[];
}

export interface UseOperationOptions {
  operationId?: string | null;
  initialData?: OperationPayload | null;
  pollingInterval?: number; // default 2000 ms
  enabled?: boolean; // default true if operationId is truthy
  onCompleted?: (result: Record<string, any> | null, operation: OperationPayload) => void;
  onError?: (error: OperationErrorPayload | null, operation: OperationPayload) => void;
}
