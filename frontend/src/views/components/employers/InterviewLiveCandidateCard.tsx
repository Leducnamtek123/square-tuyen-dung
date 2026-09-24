import React, { useEffect, useReducer, useState } from 'react';
import { Avatar, Box, Chip, IconButton, Paper, Stack, Tooltip, Typography, alpha, useTheme } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import WorkIcon from '@mui/icons-material/Work';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import { useTranslation } from 'react-i18next';

import interviewService from '@/services/interviewService';
import { type InterviewSession } from '@/types/models';
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

  const candidateDisplayName = session.candidateName && session.candidateName !== 'Công ty Square'
    ? session.candidateName
    : t('employer:interviewLive.candidateCard.unknownCandidate', 'Ứng viên phỏng vấn');

  const jobDisplayName = typeof session.questionGroup === 'object' && session.questionGroup && 'name' in session.questionGroup
    ? String((session.questionGroup as any).name)
    : session.jobName || 'Tuyển dụng Kỹ sư Giám sát Xây dựng & Kết cấu';

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, sm: 2.25 },
        borderRadius: 3.5,
        border: '1px solid',
        borderColor: '#e2e8f0',
        bgcolor: '#ffffff',
        overflow: 'hidden',
        position: 'relative',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.04), 0 2px 6px -1px rgba(15, 23, 42, 0.02)',
        '&:hover': {
          borderColor: '#cbd5e1',
          boxShadow: '0 12px 30px -4px rgba(15, 23, 42, 0.08)',
        },
      }}
    >
      {/* Candidate Profile Bar */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        spacing={1.5}
        sx={{ mb: 1.75 }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ minWidth: 0, flex: 1 }}>
          <Avatar
            sx={{
              width: 44,
              height: 44,
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '1.05rem',
              boxShadow: '0 2px 8px rgba(37, 99, 235, 0.2)',
              flexShrink: 0,
            }}
          >
            {session.candidateName && session.candidateName !== 'Công ty Square'
              ? session.candidateName.charAt(0).toUpperCase()
              : <PersonIcon sx={{ fontSize: 22 }} />}
          </Avatar>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ minWidth: 0, mb: 0.35 }}>
              <Typography
                variant="subtitle1"
                title={candidateDisplayName}
                sx={{
                  fontWeight: 800,
                  color: '#0f172a',
                  fontSize: '0.975rem',
                  letterSpacing: '-0.015em',
                  lineHeight: 1.25,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  minWidth: 0,
                }}
              >
                {candidateDisplayName}
              </Typography>
              {isLive ? (
                <Box
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.6,
                    px: 0.85,
                    py: 0.25,
                    borderRadius: '6px',
                    bgcolor: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid rgba(16, 185, 129, 0.25)',
                    color: '#059669',
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    letterSpacing: '0.03em',
                    flexShrink: 0,
                    lineHeight: 1,
                  }}
                >
                  <Box
                    sx={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      bgcolor: '#10b981',
                      boxShadow: '0 0 6px #10b981',
                      animation: 'livePillPulse 1.6s ease-in-out infinite',
                      '@keyframes livePillPulse': {
                        '0%, 100%': { opacity: 1, transform: 'scale(1)' },
                        '50%': { opacity: 0.35, transform: 'scale(1.25)' },
                      },
                    }}
                  />
                  <span>LIVE</span>
                  {session.startTime && (
                    <>
                      <Box component="span" sx={{ opacity: 0.35, mx: 0.1 }}>•</Box>
                      <ElapsedTimer
                        startTime={session.startTime}
                        color="#059669"
                        sx={{ fontSize: '0.72rem', fontWeight: 800 }}
                      />
                    </>
                  )}
                </Box>
              ) : (
                <Chip
                  label="Đang xử lý"
                  size="small"
                  sx={{
                    height: 18,
                    fontSize: '0.625rem',
                    fontWeight: 700,
                    bgcolor: '#f1f5f9',
                    color: '#64748b',
                    borderRadius: '5px',
                    flexShrink: 0,
                  }}
                />
              )}
              {Boolean((session.proctoringViolationCount || session.proctoring_violation_count || (session.proctoringEvents && session.proctoringEvents.length) || 0) > 0) && (
                <Tooltip
                  title={`Ghi nhận ${session.proctoringViolationCount || session.proctoring_violation_count || session.proctoringEvents?.length} cảnh báo giám sát / rời màn hình`}
                  arrow
                >
                  <Chip
                    label={`⚠️ ${session.proctoringViolationCount || session.proctoring_violation_count || session.proctoringEvents?.length} cảnh báo`}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: '0.65rem',
                      fontWeight: 800,
                      bgcolor: 'rgba(239, 68, 68, 0.1)',
                      color: '#dc2626',
                      border: '1px solid rgba(239, 68, 68, 0.25)',
                      borderRadius: '6px',
                      flexShrink: 0,
                    }}
                  />
                </Tooltip>
              )}
            </Stack>
            <Stack direction="row" alignItems="center" spacing={0.6} sx={{ minWidth: 0 }}>
              <WorkIcon sx={{ fontSize: 13, color: '#94a3b8', flexShrink: 0 }} />
              <Typography
                variant="body2"
                title={jobDisplayName}
                sx={{
                  fontWeight: 600,
                  color: '#64748b',
                  fontSize: '0.78rem',
                  lineHeight: 1.2,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  minWidth: 0,
                }}
              >
                {jobDisplayName}
              </Typography>
            </Stack>
          </Box>
        </Stack>

        {/* Subtle Copy Room Link Button */}
        {session.roomName && (
          <Tooltip title={copied ? 'Đã sao chép mã phòng!' : 'Sao chép mã phòng phỏng vấn'} arrow>
            <IconButton
              size="small"
              onClick={handleCopyRoom}
              aria-label="Sao chép mã phòng"
              sx={{
                width: 28,
                height: 28,
                borderRadius: '8px',
                bgcolor: 'rgba(241, 245, 249, 0.75)',
                border: '1px solid rgba(226, 232, 240, 0.8)',
                color: copied ? '#10b981' : '#64748b',
                flexShrink: 0,
                transition: 'all 0.15s ease',
                '&:hover': {
                  bgcolor: '#e2e8f0',
                  borderColor: '#cbd5e1',
                  color: '#0f172a',
                },
              }}
            >
              {copied ? (
                <CheckIcon sx={{ fontSize: 14, color: '#10b981' }} />
              ) : (
                <ContentCopyIcon sx={{ fontSize: 13, opacity: 0.8 }} />
              )}
            </IconButton>
          </Tooltip>
        )}
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
