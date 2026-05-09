'use client';

import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, Slide, Box } from '@mui/material';
import type { TransitionProps } from '@mui/material/transitions';
import { useTranslation } from 'react-i18next';
import InterviewObserverDialogHeader from './InterviewObserverDialogHeader';
import InterviewObserverDialogVisualizer from './InterviewObserverDialogVisualizer';
import InterviewObserverDialogTranscript from './InterviewObserverDialogTranscript';

interface InterviewObserverDialogProps {
  open: boolean;
  onClose: () => void;
  sessionId: number | string;
  candidateName?: string | null;
  jobName?: string | null;
  liveStatus: string | null;
  sseConnected: boolean;
}

const Transition = ({
  ref,
  ...props
}: TransitionProps & { children: React.ReactElement; ref?: React.Ref<unknown> }) => (
  <Slide direction="up" ref={ref} {...props} />
);

const InterviewObserverDialogContent: React.FC<InterviewObserverDialogProps> = ({
  open,
  onClose,
  candidateName,
  jobName,
  liveStatus,
  sseConnected,
}) => {
  const { t } = useTranslation(['employer', 'interview', 'common']);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!open) return;
    const interval = setInterval(() => setElapsed((value) => value + 1), 1000);
    return () => clearInterval(interval);
  }, [open]);

  const elapsedLabel = `${Math.floor(elapsed / 60)
    .toString()
    .padStart(2, '0')}:${(elapsed % 60).toString().padStart(2, '0')}`;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen
      slots={{ transition: Transition }}
      slotProps={{
        paper: {
          sx: {
            bgcolor: '#0a0e1a',
            backgroundImage: 'radial-gradient(ellipse at top, rgba(56,189,248,0.07) 0%, transparent 60%)',
          },
        },
      }}
    >
      <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <InterviewObserverDialogHeader
          candidateName={candidateName}
          jobName={jobName}
          liveStatus={liveStatus}
          sseConnected={sseConnected}
          elapsedLabel={elapsedLabel}
          onClose={onClose}
          t={t}
        />
        <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          <Box
            sx={{
              width: { xs: '0%', md: '55%' },
              display: { xs: 'none', md: 'flex' },
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              borderRight: '1px solid rgba(255,255,255,0.05)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                background: 'radial-gradient(circle at center, rgba(56,189,248,0.08) 0%, transparent 70%)',
              }}
            />
            <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
              <InterviewObserverDialogVisualizer />
            </Box>
          </Box>

          <InterviewObserverDialogTranscript t={t} />
        </Box>
      </DialogContent>
    </Dialog>
  );
};

const InterviewObserverDialog: React.FC<InterviewObserverDialogProps> = (props) => (
  <InterviewObserverDialogContent {...props} />
);

export default InterviewObserverDialog;
