'use client';

import React, { useEffect, useReducer } from 'react';
import { Avatar, Box, Paper, Stack, Typography, alpha, useTheme } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import WorkIcon from '@mui/icons-material/Work';
import { useTranslation } from 'react-i18next';

import interviewService from '../../../services/interviewService';
import { type InterviewSession } from '../../../types/models';
import { ACTIVE_STATUSES, getSafeLiveKitUrl, normalizeStatus } from './InterviewLiveCandidateCard/InterviewLiveCandidateCardPresence';
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
};

type InterviewLiveCandidateCardAction =
  | { type: 'set_connection_details'; value: { token: string; serverUrl: string } | null }
  | { type: 'set_loading_token'; value: boolean }
  | { type: 'set_token_error'; value: string | null }
  | { type: 'set_fullscreen_open'; value: boolean }
  | { type: 'reset_when_hidden' };

const initialState: InterviewLiveCandidateCardState = {
  connectionDetails: null,
  loadingToken: false,
  tokenError: null,
  fullscreenOpen: false,
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
    case 'reset_when_hidden':
      return {
        ...state,
        connectionDetails: null,
        loadingToken: false,
        tokenError: null,
        fullscreenOpen: false,
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

  const normalizedStatus = normalizeStatus(session.status);
  const isLive = ACTIVE_STATUSES.has(normalizedStatus);

  useEffect(() => {
    let alive = true;

    const loadToken = async () => {
      if (!isLive || !session.id) {
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

        const serverUrl = details.serverUrl || details.server_url || details.url || getSafeLiveKitUrl();
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
  }, [isLive, session.id, t]);

  useEffect(() => {
    if (!isLive) {
      dispatch({ type: 'reset_when_hidden' });
    }
  }, [isLive]);

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        borderRadius: 4,
        border: '1px solid',
        borderColor: pc.primary( 0.12),
        bgcolor: pc.bgPaper( 0.9),
        overflow: 'hidden',
        position: 'relative',
        transition: 'all 0.25s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: `0 16px 40px ${pc.primary( 0.08)}`,
        },
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: isLive
            ? `linear-gradient(90deg, ${pc.primary( 0.2)}, ${theme.palette.primary.main}, ${pc.primary( 0.2)})`
            : `linear-gradient(90deg, ${pc.success( 0.15)}, ${theme.palette.success.main}, ${pc.success( 0.15)})`,
        }}
      />

      <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={2} sx={{ mb: 1.75 }}>
        <Box>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
            <Avatar sx={{ width: 28, height: 28, bgcolor: pc.primary( 0.1), color: 'primary.main' }}>
              <PersonIcon sx={{ fontSize: 18 }} />
            </Avatar>
            <Typography variant="subtitle1" sx={{ fontWeight: 900, color: 'text.primary' }}>
              {session.candidateName || t('employer:interviewLive.candidateCard.unknownCandidate')}
            </Typography>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={1}>
            <WorkIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
              {session.jobName || 'N/A'}
            </Typography>
          </Stack>
        </Box>
      </Stack>

        <InterviewLiveCandidateCardPanel
          session={session}
          connectionDetails={state.connectionDetails}
          loadingToken={state.loadingToken}
          tokenError={state.tokenError}
          isForceEnding={isForceEnding}
          fullscreenOpen={state.fullscreenOpen}
          isLive={isLive}
          onForceEnd={onForceEnd}
          onOpenFullscreen={() => dispatch({ type: 'set_fullscreen_open', value: true })}
          onCloseFullscreen={() => dispatch({ type: 'set_fullscreen_open', value: false })}
        />
    </Paper>
  );
};

export default InterviewLiveCandidateCard;