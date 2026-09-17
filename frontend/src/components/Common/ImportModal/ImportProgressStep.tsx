import React from 'react';
import { Box } from '@mui/material';
import { ProgressiveActivity } from '../ProgressiveActivity';
import type { ActivityStep, ImportJobState } from '@/types/exchange';

interface ImportProgressStepProps {
  activitySteps: ActivityStep[];
  progressPercent: number;
  currentStepText: string;
  elapsedSeconds: number;
  commitJob: ImportJobState | null;
}

export const ImportProgressStep: React.FC<ImportProgressStepProps> = ({
  activitySteps,
  progressPercent,
  currentStepText,
  elapsedSeconds,
  commitJob,
}) => {
  return (
    <Box sx={{ py: 2 }}>
      <ProgressiveActivity
        steps={activitySteps}
        progress={progressPercent}
        currentStepText={currentStepText}
        status="running"
        jobId={commitJob?.importId}
        title="Đang lưu dữ liệu vào hệ thống"
        subtitle="Hệ thống đang thực hiện giao dịch lưu trữ an toàn với kiểm tra toàn vẹn."
        totalRows={commitJob?.totalRows}
        processedRows={commitJob?.processedRows}
        errorCount={commitJob?.failedRows}
        elapsedSeconds={elapsedSeconds}
      />
    </Box>
  );
};
export default ImportProgressStep;
