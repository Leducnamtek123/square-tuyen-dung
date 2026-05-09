'use client';

import { useCallback, useEffect, useReducer, useRef } from 'react';
import tokenService from '../../../../services/tokenService';

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

  const connect = useCallback((shouldResetState = false) => {
    cleanup();
    if (shouldResetState) {
      dispatch({ type: 'reset' });
      reconnectAttempts.current = 0;
    }

    if (!sessionId || !enabled) return;

    const base = (process.env.NEXT_PUBLIC_API_BASE || '/api').replace(/\/$/, '');
    const token = tokenService.getAccessTokenFromCookie?.() || '';
    // SSE with auth token as query param (EventSource doesn't support headers)
    const url = `${base}/interview/web/sessions/${sessionId}/stream/?token=${encodeURIComponent(token)}`;

    const es = new EventSource(url);
    eventSourceRef.current = es;

    es.addEventListener('connected', () => {
      dispatch({ type: 'connected' });
      reconnectAttempts.current = 0;
    });

    es.addEventListener('transcript_added', (e: MessageEvent) => {
      try {
        const data: SSETranscriptEvent = JSON.parse(e.data);
        dispatch({ type: 'transcriptAdded', transcript: data.transcript });
      } catch {
        // ignore parse errors
      }
    });

    es.addEventListener('status_changed', (e: MessageEvent) => {
      try {
        const data: SSEStatusEvent = JSON.parse(e.data);
        dispatch({ type: 'statusChanged', event: data });
      } catch {
        // ignore
      }
    });

    es.addEventListener('heartbeat', () => {
      // Keep-alive, no action needed
    });

    es.addEventListener('error', () => {
      // ignore SSE error events from server
    });

    es.onerror = () => {
      dispatch({ type: 'disconnected' });
      es.close();
      eventSourceRef.current = null;

      // Exponential backoff reconnect (max 30s)
      const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
      reconnectAttempts.current += 1;

      if (reconnectAttempts.current <= 10) {
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, delay);
      } else {
        dispatch({ type: 'connectionLost', error: 'SSE connection lost. Please refresh the page.' });
      }
    };
  }, [sessionId, enabled, cleanup]);

  useEffect(() => {
    connect(true);
    return cleanup;
  }, [connect, cleanup]);

  return {
    liveTranscripts: state.liveTranscripts,
    liveStatus: state.liveStatus,
    connected: state.connected,
    error: state.error,
    statusEvents: state.statusEvents,
  };
}
