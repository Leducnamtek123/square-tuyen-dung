import React from 'react';
import { Tooltip, Chip, CircularProgress, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import PsychologyIcon from '@mui/icons-material/Psychology';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';

export interface AIAnalysisComponentProps {
  row: any;
  onOpenDrawer: () => void;
}

const renderIcon = (
  IconComponent: React.ElementType | undefined,
  props?: Record<string, any>,
) : React.ReactElement | undefined => {
  if (!IconComponent) return undefined;
  return <IconComponent {...props} />;
};

const AIAnalysisComponent: React.FC<AIAnalysisComponentProps> = ({ row, onOpenDrawer }) => {
  const { t } = useTranslation('employer');
  const isCompleted = row.aiAnalysisStatus === 'completed';
  const isProcessing = row.aiAnalysisStatus === 'processing';
  const isFailed = row.aiAnalysisStatus === 'failed';

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'success';
    if (score >= 40) return 'warning';
    return 'error';
  };

  if (isCompleted) {
    return (
      <Tooltip
        title={t('appliedResume.ai.viewAnalysis', 'Xem phân tích chi tiết')}
        arrow
        placement="top"
      >
        <Chip
          icon={renderIcon(PsychologyIcon)}
          label={`${row.aiAnalysisScore || 0}/100`}
          color={getScoreColor((row.aiAnalysisScore as number) || 0)}
          size="small"
          onClick={onOpenDrawer}
          sx={{ fontWeight: 'bold', cursor: 'pointer' }}
        />
      </Tooltip>
    );
  }

  if (isProcessing) {
    return (
      <Tooltip title={t('appliedResume.ai.processing', 'Đang phân tích')} arrow>
        <Chip
          icon={<CircularProgress size={12} color="inherit" />}
          label={t('appliedResume.ai.processing', 'Đang xử lý...')}
          color="info"
          size="small"
          onClick={onOpenDrawer}
          variant="outlined"
          sx={{ cursor: 'pointer' }}
        />
      </Tooltip>
    );
  }

  if (isFailed) {
    return (
      <Tooltip title="Phân tích lỗi. Bấm để xem chi tiết" arrow>
        <Chip
          icon={renderIcon(AutoFixHighIcon)}
          label={t('appliedResume.ai.retry', 'Thử lại')}
          color="error"
          size="small"
          onClick={onOpenDrawer}
          variant="outlined"
          sx={{ fontWeight: 'bold', cursor: 'pointer' }}
        />
      </Tooltip>
    );
  }

  return (
    <Button
      variant="outlined"
      size="small"
      startIcon={renderIcon(AutoFixHighIcon)}
      onClick={onOpenDrawer}
      sx={{ textTransform: 'none', borderRadius: 1.5, fontSize: '0.75rem', py: 0.25 }}
    >
      {t('appliedResume.ai.analyze')}
    </Button>
  );
};

export default AIAnalysisComponent;
