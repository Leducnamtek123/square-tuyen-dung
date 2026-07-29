'use client';

import { useCallback, useEffect, useReducer, useRef } from 'react';
import tokenService from '../../../../services/tokenService';
import { useAppSelector } from '../../../../hooks/useAppStore';

/**
 * SSE event data types for realtime interview monitoring.
 */
export interface SSETranscript {
  id: number;
  speakerRole: 'ai_agent' | 'candidate';
  content: string;
  speechDurationMs: number | null;
  createAt: string | null;
}

interface SSEStatusEvent {
  sessionId: number;
  oldStatus: string;
  newStatus: string;
  startTime: string | null;
  endTime: string | null;
  duration: number | null;
}

interface SSETranscriptEvent {
  sessionId: number;
  transcript: SSETranscript;
}

interface UseInterviewSSEOptions {
  sessionId: string | number | undefined;
  enabled?: boolean;
}

interface UseInterviewSSEReturn {
  liveTranscripts: SSETranscript[];
  liveStatus: string | null;
  connected: boolean;
  error: string | null;
  statusEvents: SSEStatusEvent[];
}

type InterviewSSEState = UseInterviewSSEReturn;

type InterviewSSEAction =
  | { type: 'reset' }
  | { type: 'connected' }
  | { type: 'disconnected' }
  | { type: 'connectionLost'; error: string }
  | { type: 'transcriptAdded'; transcript: SSETranscript }
  | { type: 'statusChanged'; event: SSEStatusEvent };

const initialInterviewSSEState: InterviewSSEState = {
  liveTranscripts: [],
  liveStatus: null,
  connected: false,
  error: null,
  statusEvents: [],
};

export const buildInterviewSSEUrl = ({
  apiBase,
  sessionId,
  token,
  activeCompanyId,
}: {
  apiBase: string;
  sessionId: string | number;
  token: string;
  activeCompanyId?: string | number | null;
}) => {
  const base = apiBase.replace(/\/$/, '');
  const params = [`token=${encodeURIComponent(token)}`];
  if (activeCompanyId !== null && activeCompanyId !== undefined && String(activeCompanyId).trim()) {
    params.push(`activeCompanyId=${encodeURIComponent(String(activeCompanyId))}`);
  }
  return `${base}/interview/web/sessions/${encodeURIComponent(String(sessionId))}/stream/?${params.join('&')}`;
};

const interviewSSEReducer = (
  state: InterviewSSEState,
  action: InterviewSSEAction,
): InterviewSSEState => {
  switch (action.type) {
    case 'reset':
      return initialInterviewSSEState;
    case 'connected':
      return { ...state, connected: true, error: null };
    case 'disconnected':
      return { ...state, connected: false };
    case 'connectionLost':
      return { ...state, connected: false, error: action.error };
    case 'transcriptAdded':
      if (state.liveTranscripts.some((transcript) => transcript.id === action.transcript.id)) {
        return state;
      }
      return {
        ...state,
        liveTranscripts: [...state.liveTranscripts, action.transcript],
      };
    case 'statusChanged':
      return {
        ...state,
        liveStatus: action.event.newStatus,
        statusEvents: [...state.statusEvents, action.event],
      };
    default:
      return state;
  }
};

/**
 * Custom hook for SSE (Server-Sent Events) connection to receive
 * realtime interview events (transcripts, status changes).
 */
export function useInterviewSSE({
  sessionId,
  enabled = true,
}: UseInterviewSSEOptions): UseInterviewSSEReturn {
  const [state, dispatch] = useReducer(interviewSSEReducer, initialInterviewSSEState);
  const activeWorkspace = useAppSelector((reduxState) => reduxState.user.activeWorkspace);
  const activeCompanyId = activeWorkspace?.type === 'company' ? activeWorkspace.companyId : null;
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectAttempts = useRef(0);

  const cleanup = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!sessionId || !enabled) return;

    const base = (process.env.NEXT_PUBLIC_API_BASE || '/api').replace(/\/$/, '');
    const token = tokenService.getAccessTokenFromCookie?.() || '';
    const url = buildInterviewSSEUrl({
      apiBase: base,
      sessionId,
      token,
      activeCompanyId,
    });

    dispatch({ type: 'reset' });
    reconnectAttempts.current = 0;

    const es = new EventSource(url);
    eventSourceRef.current = es;

    const onConnected = () => {
      dispatch({ type: 'connected' });
      reconnectAttempts.current = 0;
    };
    const onTranscript = (e: Event) => {
      try {
        const data: SSETranscriptEvent = JSON.parse((e as MessageEvent).data);
        dispatch({ type: 'transcriptAdded', transcript: data.transcript });
      } catch {
        // ignore parse errors
      }
    };
    const onStatus = (e: Event) => {
      try {
        const data: SSEStatusEvent = JSON.parse((e as MessageEvent).data);
        dispatch({ type: 'statusChanged', event: data });
      } catch {
        // ignore
      }
    };

    es.addEventListener('connected', onConnected);
    es.addEventListener('transcript_added', onTranscript);
    es.addEventListener('status_changed', onStatus);

    es.onerror = () => {
      dispatch({ type: 'disconnected' });
      es.close();
      eventSourceRef.current = null;
    };

    return () => {
      es.removeEventListener('connected', onConnected);
      es.removeEventListener('transcript_added', onTranscript);
      es.removeEventListener('status_changed', onStatus);
      es.close();
      eventSourceRef.current = null;
      cleanup();
    };
  }, [sessionId, enabled, activeCompanyId, cleanup]);

  return {
    liveTranscripts: state.liveTranscripts,
    liveStatus: state.liveStatus,
    connected: state.connected,
    error: state.error,
    statusEvents: state.statusEvents,
  };
}
