import { ActivityStep, StepStatus } from '@/types/exchange';

export interface ProgressiveActivityProps {
  steps: ActivityStep[];
  progress: number;
  currentStepText?: string;
  status: StepStatus;
  jobId?: string;
  title?: string;
  subtitle?: string;
  totalRows?: number;
  processedRows?: number;
  errorCount?: number;
  elapsedSeconds?: number;
  onCancel?: () => void;
}
