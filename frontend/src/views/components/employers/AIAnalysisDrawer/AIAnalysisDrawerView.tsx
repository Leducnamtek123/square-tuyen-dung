import React from 'react';
import { Box, CircularProgress, Drawer, Typography } from '@mui/material';
import type { TFunction } from 'i18next';
import AIAnalysisDrawerHeader from './AIAnalysisDrawerHeader';
import AIAnalysisDrawerResumeSection from './AIAnalysisDrawerResumeSection';
import AIAnalysisDrawerStatePanels from './AIAnalysisDrawerStatePanels';
import type { AIAnalysisData } from './types';

type Props = {
  open: boolean;
  onClose: () => void;
  data: AIAnalysisData | null;
  scanLinePosition: number;
  scanProgress: number;
  resumeFileUrl: string;
  onlineProfileUrl: string;
  analysisState: {
    loading: boolean;
    analyzing: boolean;
    phase: 'idle' | 'processing' | 'completed' | 'failed';
    canEmbedResume: boolean;
  };
  stats: { matchingSkills: number; missingSkills: number; totalSkills: number };
  onAnalyze: () => void;
  t: TFunction;
};

const DRAWER_WIDTH = 520;

const AIAnalysisDrawerView = ({
  open,
  onClose,
  data,
  scanLinePosition,
  scanProgress,
  resumeFileUrl,
  onlineProfileUrl,
  analysisState,
  stats,
  onAnalyze,
  t,
}: Props) => {
  const { loading, analyzing, canEmbedResume } = analysisState;
  const isProcessing = analysisState.phase === 'processing';
  const isCompleted = analysisState.phase === 'completed';
  const isFailed = analysisState.phase === 'failed';

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            width: { xs: '100%', sm: DRAWER_WIDTH },
            bgcolor: 'background.default',
            backgroundImage: 'none',
            boxShadow: (muiTheme) => muiTheme.customShadows?.z24,
          },
        },
      }}
      >
        <AIAnalysisDrawerHeader
          title={t('appliedResume.ai.drawerTitle')}
          subtitle={
            data?.fullName
              ? `${data.fullName}${data.jobName ? ` • ${data.jobName}` : ''}`
              : undefined
          }
          onClose={onClose}
        />

      {loading ? (
        <Box sx={{ p: 10, textAlign: 'center' }}>
          <CircularProgress color="primary" thickness={5} size={40} />
          <Typography variant="subtitle2" sx={{ mt: 3, color: 'text.secondary', fontWeight: 700 }}>
            {t('appliedResume.ai.loading')}
          </Typography>
        </Box>
      ) : (
        <Box sx={{ p: 3, overflowY: 'auto', flex: 1 }}>
          <AIAnalysisDrawerResumeSection
            resumeFileUrl={resumeFileUrl}
            onlineProfileUrl={onlineProfileUrl}
            canEmbedResume={canEmbedResume}
            isProcessing={isProcessing}
            scanLinePosition={scanLinePosition}
            t={t}
          />

          <AIAnalysisDrawerStatePanels
            data={data}
            analyzing={analyzing}
            scanProgress={scanProgress}
            isProcessing={isProcessing}
            isCompleted={isCompleted}
            isFailed={isFailed}
            stats={stats}
            onAnalyze={onAnalyze}
            t={t}
          />
        </Box>
      )}
    </Drawer>
  );
};

export default AIAnalysisDrawerView;
