import React from 'react';
import { Tooltip, Chip, CircularProgress, Button, Box, alpha, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import PsychologyIcon from '@mui/icons-material/Psychology';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import { JobPostActivity } from '@/types/models';
import pc from '@/utils/muiColors';
import { OperationProgress, adaptResumeAnalysisOperation } from '@/components/operation';

interface AIAnalysisComponentProps {
  row: JobPostActivity;
  onOpenDrawer: () => void;
}

const AIAnalysisComponent: React.FC<AIAnalysisComponentProps> = ({ row, onOpenDrawer }) => {
  const { t } = useTranslation('employer');
  const theme = useTheme();
  const isCompleted = row.aiAnalysisStatus === 'completed';
  const isProcessing = row.aiAnalysisStatus === 'processing';
  const isFailed = row.aiAnalysisStatus === 'failed';

  const getScoreColor = (score: number) => {
    if (score >= 70) return theme.palette.success;
    if (score >= 40) return theme.palette.warning;
    return theme.palette.error;
  };

  if (isCompleted) {
    const score = (row.aiAnalysisEffectiveScore ?? row.aiAnalysisScore ?? 0) as number;
    const color = getScoreColor(score);
    return (
      <Tooltip
        title={t('appliedResume.ai.viewAnalysis')}
        arrow
        placement="top"
      >
        <Chip
          icon={<PsychologyIcon sx={{ fontSize: '1rem !important' }} />}
          label={`${score}/100`}
          onClick={onOpenDrawer}
          sx={{ 
            fontWeight: 900, 
            cursor: 'pointer',
            borderRadius: 1.5,
            px: 0.5,
            bgcolor: alpha(color.main, 0.08),
            color: color.main,
            border: '1px solid',
            borderColor: alpha(color.main, 0.1),
            '& .MuiChip-icon': { color: 'inherit', ml: 0.5 },
            '&:hover': {
                bgcolor: alpha(color.main, 0.15),
                borderColor: color.main
            }
          }}
        />
      </Tooltip>
    );
  }

  if (isProcessing) {
    const operation = adaptResumeAnalysisOperation(row, row.aiAnalysisProgress || 10);
    return <OperationProgress operation={operation} size="sm" onClick={onOpenDrawer} />;
  }

  if (isFailed) {
    return (
      <Tooltip title={t('appliedResume.ai.failed')} arrow>
        <Chip
          icon={<AutoFixHighIcon sx={{ fontSize: '1rem !important' }} />}
          label={t('appliedResume.ai.retry')}
          onClick={onOpenDrawer}
          sx={{ 
            fontWeight: 900, 
            cursor: 'pointer',
            borderRadius: 1.5,
            bgcolor: pc.error( 0.08),
            color: 'error.main',
            border: '1px solid',
            borderColor: pc.error( 0.1),
            '& .MuiChip-icon': { color: 'inherit', ml: 0.5 },
            '&:hover': {
                bgcolor: pc.error( 0.15),
                borderColor: 'error.main'
            }
          }}
        />
      </Tooltip>
    );
  }

  return (
    <Button
      variant="outlined"
      size="small"
      startIcon={<AutoFixHighIcon sx={{ fontSize: 18 }} />}
      onClick={onOpenDrawer}
      sx={{ 
        textTransform: 'none', 
        fontSize: '0.75rem', 
        py: 0.5,
        px: 1.5,
        fontWeight: 800,
        color: '#2563EB',
        border: '1px solid #BFDBFE',
        bgcolor: '#EFF6FF',
        borderRadius: '8px',
        transition: 'all 0.2s ease',
        '&:hover': {
          bgcolor: '#DBEAFE',
          borderColor: '#1D4ED8',
          color: '#1D4ED8',
        }
      }}
    >
      {t('appliedResume.ai.analyze')}
    </Button>
  );
};

export default AIAnalysisComponent;
