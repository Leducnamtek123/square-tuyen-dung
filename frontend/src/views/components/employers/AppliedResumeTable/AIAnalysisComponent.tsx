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

  const getScoreStyle = (score: number) => {
    if (score >= 75) {
      return {
        bg: '#ECFDF5',
        border: '#A7F3D0',
        text: '#047857',
        hoverBg: '#D1FAE5',
      };
    }
    if (score >= 40) {
      return {
        bg: '#FFFBEB',
        border: '#FDE68A',
        text: '#B45309',
        hoverBg: '#FEF3C7',
      };
    }
    return {
      bg: '#FFF1F2',
      border: '#FECDD3',
      text: '#BE123C',
      hoverBg: '#FFE4E6',
    };
  };

  if (isCompleted) {
    const score = (row.aiAnalysisEffectiveScore ?? row.aiAnalysisScore ?? 0) as number;
    const scoreStyle = getScoreStyle(score);
    return (
      <Tooltip
        title={t('appliedResume.ai.viewAnalysis')}
        arrow
        placement="top"
      >
        <Chip
          icon={<PsychologyIcon sx={{ fontSize: '1.05rem !important', color: `${scoreStyle.text} !important` }} />}
          label={`${score}/100`}
          onClick={onOpenDrawer}
          sx={{ 
            fontWeight: 800, 
            fontSize: '0.8125rem',
            cursor: 'pointer',
            borderRadius: '8px',
            px: 0.75,
            bgcolor: scoreStyle.bg,
            color: scoreStyle.text,
            border: '1px solid',
            borderColor: scoreStyle.border,
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)',
            transition: 'all 0.15s ease',
            '& .MuiChip-icon': { ml: 0.25 },
            '&:hover': {
              bgcolor: scoreStyle.hoverBg,
              borderColor: scoreStyle.text,
              transform: 'translateY(-1px)',
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
