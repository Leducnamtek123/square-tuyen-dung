import React from 'react';
import { Tooltip, Chip, CircularProgress, Button, Box, alpha, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import PsychologyIcon from '@mui/icons-material/Psychology';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import { JobPostActivity } from '@/types/models';
import pc from '@/utils/muiColors';

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
    return (
      <Tooltip title={t('appliedResume.ai.processing')} arrow>
        <Chip
          icon={<CircularProgress size={12} color="inherit" thickness={5} />}
          label={t('appliedResume.ai.processing')}
          onClick={onOpenDrawer}
          variant="outlined"
          sx={{ 
            cursor: 'pointer', 
            borderRadius: 1.5,
            fontWeight: 800,
            fontSize: '0.7rem',
            bgcolor: pc.info( 0.08),
            color: 'info.main',
            borderColor: pc.info( 0.2),
            '& .MuiChip-icon': { ml: 0.5 },
            '&:hover': {
                bgcolor: pc.info( 0.15),
                borderColor: 'info.main'
            }
          }}
        />
      </Tooltip>
    );
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
        fontWeight: 900,
        color: 'primary.main',
        borderColor: pc.primary( 0.3),
        borderStyle: 'dashed',
        '&:hover': {
            bgcolor: pc.primary( 0.06),
            borderColor: 'primary.main',
            borderStyle: 'solid'
        }
      }}
    >
      {t('appliedResume.ai.analyze')}
    </Button>
  );
};

export default AIAnalysisComponent;
