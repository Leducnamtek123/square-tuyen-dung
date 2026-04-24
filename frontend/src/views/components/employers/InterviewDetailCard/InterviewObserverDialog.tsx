'use client';

import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, Slide, Box } from '@mui/material';
import type { TransitionProps } from '@mui/material/transitions';
import { useTranslation } from 'react-i18next';
import { LiveKitRoom } from '@livekit/components-react';
import type { SSETranscript } from '../../../employerPages/InterviewPages/hooks/useInterviewSSE';
import InterviewObserverDialogHeader from './InterviewObserverDialogHeader';
import InterviewObserverDialogVisualizer from './InterviewObserverDialogVisualizer';
import InterviewObserverDialogTranscript from './InterviewObserverDialogTranscript';

interface InterviewObserverDialogProps {
  open: boolean;
  onClose: () => void;
  sessionId: number | string;
  candidateName?: string | null;
  jobName?: string | null;
  liveTranscripts: SSETranscript[];
  liveStatus: string | null;
  sseConnected: boolean;
  connectionDetails?: { token: string; serverUrl: string } | null;
}

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & { children: React.ReactElement },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const InterviewObserverDialogContent: React.FC<InterviewObserverDialogProps> = ({
  open,
  onClose,
  candidateName,
  jobName,
  liveTranscripts,
  liveStatus,
  sseConnected,
  connectionDetails,
}) => {
  const { t } = useTranslation(['employer', 'interview', 'common']);
  const transcriptEndRef = React.useRef<HTMLDivElement>(null);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [liveTranscripts]);

  useEffect(() => {
    if (!open) return;
    const interval = setInterval(() => setElapsed((value) => value + 1), 1000);
    return () => clearInterval(interval);
  }, [open]);

  const elapsedLabel = `${Math.floor(elapsed / 60)
    .toString()
    .padStart(2, '0')}:${(elapsed % 60).toString().padStart(2, '0')}`;

  /**
   * Build the dialog body.
   * `withVisualizer` must only be true when rendered inside <LiveKitRoom>,
   * because InterviewObserverDialogVisualizer uses useTracks() which requires
   * the LiveKit room context.
   */
  const buildContent = (withVisualizer: boolean) => (
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
            {/* useTracks() inside InterviewObserverDialogVisualizer requires LiveKitRoom context */}
            {withVisualizer && <InterviewObserverDialogVisualizer />}
          </Box>
        </Box>

        <InterviewObserverDialogTranscript liveTranscripts={liveTranscripts} t={t} />
      </Box>
    </DialogContent>
  );

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
      {connectionDetails ? (
        <LiveKitRoom
          token={connectionDetails.token}
          serverUrl={connectionDetails.serverUrl}
          connect={open}
          audio={false}
          video={false}
        >
          {/* Render visualizer only inside LiveKitRoom so useTracks has context */}
          {buildContent(true)}
        </LiveKitRoom>
      ) : (
        /* No LiveKit connection — render without visualizer to avoid missing context */
        buildContent(false)
      )}
    </Dialog>
  );
};

const InterviewObserverDialog: React.FC<InterviewObserverDialogProps> = (props) => (
  <InterviewObserverDialogContent {...props} />
);

export default InterviewObserverDialog;
