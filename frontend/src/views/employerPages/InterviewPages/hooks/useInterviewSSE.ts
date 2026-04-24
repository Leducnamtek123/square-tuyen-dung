import { useCallback, useEffect, useRef, useState } from 'react';
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

/**
 * Custom hook for SSE (Server-Sent Events) connection to receive
 * realtime interview events (transcripts, status changes).
 */
export function useInterviewSSE({
  sessionId,
  enabled = true,
}: UseInterviewSSEOptions): UseInterviewSSEReturn {
  const [liveTranscripts, setLiveTranscripts] = useState<SSETranscript[]>([]);
  const [liveStatus, setLiveStatus] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusEvents, setStatusEvents] = useState<SSEStatusEvent[]>([]);
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

  const connect = useCallback(() => {
    if (!sessionId || !enabled) return;

    cleanup();

    const base = (process.env.NEXT_PUBLIC_API_BASE || '/api').replace(/\/$/, '');
    const token = tokenService.getAccessTokenFromCookie?.() || '';
    // SSE with auth token as query param (EventSource doesn't support headers)
    const url = `${base}/interview/web/sessions/${sessionId}/stream/?token=${encodeURIComponent(token)}`;

    const es = new EventSource(url);
    eventSourceRef.current = es;

    es.addEventListener('connected', () => {
      setConnected(true);
      setError(null);
      reconnectAttempts.current = 0;
    });

    es.addEventListener('transcript_added', (e: MessageEvent) => {
      try {
        const data: SSETranscriptEvent = JSON.parse(e.data);
        setLiveTranscripts((prev) => {
          // Deduplicate by id
          if (prev.some((t) => t.id === data.transcript.id)) return prev;
          return [...prev, data.transcript];
        });
      } catch {
        // ignore parse errors
      }
    });

    es.addEventListener('status_changed', (e: MessageEvent) => {
      try {
        const data: SSEStatusEvent = JSON.parse(e.data);
        setLiveStatus(data.newStatus);
        setStatusEvents((prev) => [...prev, data]);
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
      setConnected(false);
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
        setError('SSE connection lost. Please refresh the page.');
      }
    };
  }, [sessionId, enabled, cleanup]);

  useEffect(() => {
    connect();
    return cleanup;
  }, [connect, cleanup]);

  // Reset state when sessionId changes
  useEffect(() => {
    setLiveTranscripts([]);
    setLiveStatus(null);
    setStatusEvents([]);
    setError(null);
  }, [sessionId]);

  return {
    liveTranscripts,
    liveStatus,
    connected,
    error,
    statusEvents,
  };
}
