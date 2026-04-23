import React from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogContent,
  IconButton,
  Paper,
  Stack,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import StopCircleIcon from '@mui/icons-material/StopCircle';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import { LiveKitRoom } from '@livekit/components-react';
import { useTranslation } from 'react-i18next';
import { type InterviewSession } from '../../../../types/models';
import { ElapsedTimer, LiveObserverVisualizer, normalizeStatus } from './InterviewLiveCandidateCardPresence';

type Props = {
  session: InterviewSession;
  connectionDetails: { token: string; serverUrl: string } | null;
  loadingToken: boolean;
  tokenError: string | null;
  isForceEnding: boolean;
  fullscreenOpen: boolean;
  isLive: boolean;
  onForceEnd: (session: InterviewSession) => void;
  onOpenFullscreen: () => void;
  onCloseFullscreen: () => void;
};

const InterviewLiveCandidateCardPanel = ({
  session,
  connectionDetails,
  loadingToken,
  tokenError,
  isForceEnding,
  fullscreenOpen,
  isLive,
  onForceEnd,
  onOpenFullscreen,
  onCloseFullscreen,
}: Props) => {
  const theme = useTheme();
  const { t } = useTranslation(['employer', 'interview', 'common']);
  const normalizedStatus = normalizeStatus(session.status);
  const statusLabel = t(`interview:interviewListCard.statuses.${session.status}`, {
    defaultValue: normalizedStatus?.replaceAll('_', ' ')?.toUpperCase(),
  });

  return (
    <>
      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1.5 }}>
        {session.roomName || t('interview:interviewDetail.label.roomCode', { defaultValue: 'Room' })}
      </Typography>

      <Box
        sx={{
          borderRadius: 3,
          overflow: 'hidden',
          border: '1px solid',
          borderColor: alpha(theme.palette.divider, 0.9),
          bgcolor: alpha('#020617', 0.98),
          minHeight: 280,
        }}
      >
        {loadingToken ? (
          <Box sx={{ minHeight: 280, display: 'grid', placeItems: 'center' }}>
            <Stack spacing={1.5} alignItems="center">
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                {t('employer:interviewLive.candidateCard.connecting')}
              </Typography>
            </Stack>
          </Box>
        ) : tokenError ? (
          <Box sx={{ minHeight: 280, p: 2 }}>
            <Alert severity="warning">{tokenError}</Alert>
          </Box>
        ) : connectionDetails ? (
          <LiveKitRoom token={connectionDetails.token} serverUrl={connectionDetails.serverUrl} connect={isLive} audio={false} video={false}>
            <Box sx={{ p: 2 }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
                <Chip
                  icon={<FiberManualRecordIcon sx={{ fontSize: '10px !important', color: '#22c55e !important' }} />}
                  label="LIVE"
                  size="small"
                  sx={{
                    fontWeight: 900,
                    fontSize: '0.65rem',
                    letterSpacing: 1.5,
                    height: 24,
                    bgcolor: alpha('#22c55e', 0.08),
                    color: '#22c55e',
                    border: '1px solid',
                    borderColor: alpha('#22c55e', 0.16),
                  }}
                />
                <Stack direction="row" spacing={1}>
                  <Button size="small" variant="outlined" startIcon={<FullscreenIcon />} onClick={onOpenFullscreen} sx={{ fontWeight: 800, textTransform: 'none' }}>
                    {t('employer:interviewLive.candidateCard.maximize')}
                  </Button>
                  {normalizedStatus === 'in_progress' && (
                    <Button
                      size="small"
                      variant="text"
                      color="error"
                      startIcon={<StopCircleIcon />}
                      onClick={() => onForceEnd(session)}
                      disabled={isForceEnding}
                      sx={{ fontWeight: 800, textTransform: 'none' }}
                    >
                      {t('employer:interviewLive.candidateCard.end')}
                    </Button>
                  )}
                </Stack>
              </Stack>

              <LiveObserverVisualizer compact />
            </Box>
          </LiveKitRoom>
        ) : (
          <Box sx={{ minHeight: 280, display: 'grid', placeItems: 'center', p: 2 }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {t('employer:interviewLive.candidateCard.notReady')}
            </Typography>
          </Box>
        )}
      </Box>

      <Dialog
        open={fullscreenOpen}
        onClose={onCloseFullscreen}
        fullScreen
        sx={{
          '& .MuiDialog-paper': {
            bgcolor: '#020617',
            backgroundImage: 'radial-gradient(circle at top, rgba(56,189,248,0.08), transparent 60%)',
          },
        }}
      >
        <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column', height: '100vh' }}>
          <Box
            sx={{
              px: 3,
              py: 2,
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              bgcolor: 'rgba(10,14,26,0.86)',
              backdropFilter: 'blur(8px)',
            }}
          >
            <Box>
              <Typography variant="subtitle1" sx={{ color: '#fff', fontWeight: 900 }}>
                {session.candidateName || t('employer:interviewLive.candidateCard.unknownCandidate')}
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.55)' }}>
                {session.jobName || 'N/A'} · {statusLabel}
              </Typography>
            </Box>
            <IconButton onClick={onCloseFullscreen} sx={{ color: '#fff' }}>
              <CloseIcon />
            </IconButton>
          </Box>

          <Box sx={{ flex: 1, p: 3, minHeight: 0 }}>
            {connectionDetails ? (
              <LiveKitRoom token={connectionDetails.token} serverUrl={connectionDetails.serverUrl} connect={isLive} audio={false} video={false}>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1.6fr) minmax(320px, 0.8fr)' }, gap: 2, height: '100%' }}>
                  <Paper elevation={0} sx={{ minHeight: 0, borderRadius: 4, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', bgcolor: '#020617' }}>
                    <LiveObserverVisualizer compact={false} />
                  </Paper>

                  <Paper elevation={0} sx={{ p: 2, borderRadius: 4, border: '1px solid rgba(255,255,255,0.08)', bgcolor: 'rgba(15,23,42,0.9)', overflow: 'auto' }}>
                    <Typography variant="subtitle2" sx={{ color: '#fff', fontWeight: 900, mb: 1 }}>
                      {t('employer:interviewLive.candidateCard.liveSession')}
                    </Typography>
                    <Stack spacing={1.5}>
                      <Box>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.55)', display: 'block' }}>
                          {t('employer:interviewLive.candidateCard.candidate')}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#fff', fontWeight: 700 }}>
                          {session.candidateName || t('employer:interviewLive.candidateCard.unknownCandidate')}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.55)', display: 'block' }}>
                          {t('employer:interviewLive.candidateCard.position')}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#fff', fontWeight: 700 }}>
                          {session.jobName || 'N/A'}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.55)', display: 'block' }}>
                          {t('employer:interviewLive.candidateCard.room')}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#fff', fontWeight: 700 }}>
                          {session.roomName || 'N/A'}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.55)', display: 'block' }}>
                          {t('employer:interviewLive.candidateCard.time')}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#fff', fontWeight: 700 }}>
                          <ElapsedTimer startTime={session.startTime} />
                        </Typography>
                      </Box>
                      {normalizedStatus === 'in_progress' && (
                        <Button variant="contained" color="error" startIcon={<StopCircleIcon />} onClick={() => onForceEnd(session)} disabled={isForceEnding} sx={{ textTransform: 'none', fontWeight: 800 }}>
                          {t('employer:interviewLive.candidateCard.endSession')}
                        </Button>
                      )}
                    </Stack>
                  </Paper>
                </Box>
              </LiveKitRoom>
            ) : (
              <Alert severity="warning">{t('employer:interviewLive.candidateCard.noConnectionDetails')}</Alert>
            )}
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default InterviewLiveCandidateCardPanel;

