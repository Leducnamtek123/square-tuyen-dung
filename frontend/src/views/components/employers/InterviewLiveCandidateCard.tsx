import React, { useEffect, useReducer, useState } from 'react';
import { Avatar, Box, Chip, IconButton, Paper, Stack, Tooltip, Typography, alpha, useTheme } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import WorkIcon from '@mui/icons-material/Work';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { useTranslation } from 'react-i18next';

import interviewService from '../../../services/interviewService';
import { type InterviewSession } from '../../../types/models';
import { ACTIVE_STATUSES, ElapsedTimer, getSafeLiveKitUrl, normalizeStatus } from './InterviewLiveCandidateCard/InterviewLiveCandidateCardPresence';
import InterviewLiveCandidateCardPanel from './InterviewLiveCandidateCard/InterviewLiveCandidateCardPanel';
import pc from '@/utils/muiColors';

interface InterviewLiveCandidateCardProps {
  session: InterviewSession;
  onForceEnd: (session: InterviewSession) => void;
  isForceEnding?: boolean;
}

type InterviewLiveCandidateCardState = {
  connectionDetails: { token: string; serverUrl: string } | null;
  loadingToken: boolean;
  tokenError: string | null;
  fullscreenOpen: boolean;
  hrPresenceDetails: { token: string; serverUrl: string } | null;
  hrPresenceLoading: boolean;
};

type InterviewLiveCandidateCardAction =
  | { type: 'set_connection_details'; value: { token: string; serverUrl: string } | null }
  | { type: 'set_loading_token'; value: boolean }
  | { type: 'set_token_error'; value: string | null }
  | { type: 'set_fullscreen_open'; value: boolean }
  | { type: 'set_hr_presence_details'; value: { token: string; serverUrl: string } | null }
  | { type: 'set_hr_presence_loading'; value: boolean }
  | { type: 'reset_when_hidden' };

const initialState: InterviewLiveCandidateCardState = {
  connectionDetails: null,
  loadingToken: false,
  tokenError: null,
  fullscreenOpen: false,
  hrPresenceDetails: null,
  hrPresenceLoading: false,
};

const resolveLiveKitServerUrl = (details: { serverUrl?: string }) => {
  const localUrl = getSafeLiveKitUrl();

  if (
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') &&
    localUrl
  ) {
    return localUrl;
  }

  return details.serverUrl || localUrl;
};

const reducer = (
  state: InterviewLiveCandidateCardState,
  action: InterviewLiveCandidateCardAction
): InterviewLiveCandidateCardState => {
  switch (action.type) {
    case 'set_connection_details':
      return { ...state, connectionDetails: action.value };
    case 'set_loading_token':
      return { ...state, loadingToken: action.value };
    case 'set_token_error':
      return { ...state, tokenError: action.value };
    case 'set_fullscreen_open':
      return { ...state, fullscreenOpen: action.value };
    case 'set_hr_presence_details':
      return { ...state, hrPresenceDetails: action.value };
    case 'set_hr_presence_loading':
      return { ...state, hrPresenceLoading: action.value };
    case 'reset_when_hidden':
      return {
        ...state,
        connectionDetails: null,
        loadingToken: false,
        tokenError: null,
        fullscreenOpen: false,
        hrPresenceDetails: null,
        hrPresenceLoading: false,
      };
    default:
      return state;
  }
};

const InterviewLiveCandidateCard: React.FC<InterviewLiveCandidateCardProps> = ({
  session,
  onForceEnd,
  isForceEnding = false,
}) => {
  const theme = useTheme();
  const { t } = useTranslation(['employer', 'interview', 'common']);
  const [state, dispatch] = useReducer(reducer, initialState);
  const [copied, setCopied] = useState(false);

  const normalizedStatus = normalizeStatus(session.status);
  const isLive = ACTIVE_STATUSES.has(normalizedStatus);
  const shouldLoadObserverToken = normalizedStatus === 'calibration' || normalizedStatus === 'in_progress';

  const handleCopyRoom = () => {
    if (!session.roomName) return;
    navigator.clipboard?.writeText(session.roomName);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    let alive = true;

    const loadToken = async () => {
      if (!shouldLoadObserverToken || !session.id) {
        dispatch({ type: 'set_connection_details', value: null });
        dispatch({ type: 'set_token_error', value: null });
        dispatch({ type: 'set_loading_token', value: false });
        return;
      }

      dispatch({ type: 'set_loading_token', value: true });
      dispatch({ type: 'set_token_error', value: null });

      try {
        const details = await interviewService.getObserverToken(session.id);
        if (!alive) return;

        const serverUrl = resolveLiveKitServerUrl(details);
        dispatch({ type: 'set_connection_details', value: { token: details.token, serverUrl } });
      } catch (err) {
        if (!alive) return;
        dispatch({ type: 'set_connection_details', value: null });
        dispatch({ type: 'set_token_error', value: err instanceof Error ? err.message : t('employer:interviewLive.candidateCard.tokenError') });
      } finally {
        if (alive) dispatch({ type: 'set_loading_token', value: false });
      }
    };

    loadToken();

    return () => {
      alive = false;
    };
  }, [shouldLoadObserverToken, session.id, t]);

  useEffect(() => {
    if (!isLive) {
      dispatch({ type: 'reset_when_hidden' });
    }
  }, [isLive]);

  const handleJoinAsHR = React.useCallback(async () => {
    if (!session.id) return;
    dispatch({ type: 'set_hr_presence_loading', value: true });
    try {
      const details = await interviewService.getHrPresenceToken(session.id);
      const serverUrl = resolveLiveKitServerUrl(details);
      dispatch({ type: 'set_hr_presence_details', value: { token: details.token, serverUrl } });
    } catch (err) {
      console.error('HR presence token error', err);
    } finally {
      dispatch({ type: 'set_hr_presence_loading', value: false });
    }
  }, [session.id]);

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, sm: 2.75 },
        borderRadius: 4,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        overflow: 'hidden',
        position: 'relative',
        transition: 'all 0.25s ease',
        boxShadow: '0 8px 30px -4px rgba(15, 23, 42, 0.06)',
        '&:hover': {
          borderColor: alpha(theme.palette.primary.main, 0.35),
          boxShadow: '0 16px 40px -6px rgba(15, 23, 42, 0.1)',
        },
      }}
    >
      {/* Top Accent Stripe */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: isLive
            ? `linear-gradient(90deg, #38BDF8, ${theme.palette.primary.main}, #818CF8)`
            : `linear-gradient(90deg, #22C55E, ${theme.palette.success.main}, #4ADE80)`,
        }}
      />

      {/* Candidate Profile Bar */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        justifyContent="space-between"
        spacing={2}
        sx={{ mb: 2 }}
      >
        <Stack direction="row" alignItems="center" spacing={1.75}>
          <Avatar
            sx={{
              width: 44,
              height: 44,
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: 'primary.main',
              fontWeight: 800,
              fontSize: '1.05rem',
              border: '1px solid',
              borderColor: alpha(theme.palette.primary.main, 0.2),
            }}
          >
            {session.candidateName ? session.candidateName.charAt(0).toUpperCase() : <PersonIcon />}
          </Avatar>
          <Box>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary', fontSize: '1.05rem', letterSpacing: '-0.01em' }}>
                {session.candidateName || t('employer:interviewLive.candidateCard.unknownCandidate')}
              </Typography>
            </Stack>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 0.25 }}>
              <WorkIcon sx={{ fontSize: 13, color: 'text.secondary' }} />
              <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.8125rem' }}>
                {session.jobName || 'Chuyên viên'}
              </Typography>
            </Stack>
          </Box>
        </Stack>

        {/* Telemetry Chips & Room Code */}
        <Stack direction="row" alignItems="center" spacing={1} sx={{ flexWrap: 'wrap' }}>
          {session.startTime && (
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.75,
                px: 1.25,
                py: 0.4,
                borderRadius: '10px',
                bgcolor: alpha(theme.palette.primary.main, 0.06),
                border: '1px solid',
                borderColor: alpha(theme.palette.primary.main, 0.15),
              }}
            >
              <AccessTimeIcon sx={{ fontSize: 13, color: 'primary.main' }} />
              <ElapsedTimer startTime={session.startTime} />
            </Box>
          )}

          {session.roomName && (
            <Tooltip title={copied ? 'Đã sao chép!' : 'Sao chép mã phòng'} arrow>
              <Chip
                icon={copied ? <CheckIcon sx={{ fontSize: '13px !important', color: '#16a34a !important' }} /> : <ContentCopyIcon sx={{ fontSize: '12px !important' }} />}
                label={session.roomName}
                size="small"
                onClick={handleCopyRoom}
                sx={{
                  fontFamily: 'monospace',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  borderRadius: '10px',
                  bgcolor: 'action.hover',
                  cursor: 'pointer',
                  '&:hover': { bgcolor: 'action.selected' },
                }}
              />
            </Tooltip>
          )}
        </Stack>
      </Stack>

      <InterviewLiveCandidateCardPanel
        session={session}
        connectionDetails={state.connectionDetails}
        loadingToken={state.loadingToken}
        tokenError={state.tokenError}
        isForceEnding={isForceEnding}
        fullscreenOpen={state.fullscreenOpen}
        isLive={isLive}
        hrPresenceDetails={state.hrPresenceDetails}
        hrPresenceLoading={state.hrPresenceLoading}
        onForceEnd={onForceEnd}
        onOpenFullscreen={() => dispatch({ type: 'set_fullscreen_open', value: true })}
        onCloseFullscreen={() => dispatch({ type: 'set_fullscreen_open', value: false })}
        onJoinAsHR={handleJoinAsHR}
        onLeaveHR={() => dispatch({ type: 'set_hr_presence_details', value: null })}
      />
    </Paper>
  );
};

export default InterviewLiveCandidateCard;
