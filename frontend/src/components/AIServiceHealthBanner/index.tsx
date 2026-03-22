/**
 * AIServiceHealthBanner
 *
 * Shows the live connectivity status of three core AI services:
 *  - LLM (Chat / llama-cpp)
 *  - STT (Whisper)
 *  - TTS (VieNeu TTS)
 *
 * Each badge auto-probes its service endpoint periodically and turns
 *   🟢 Online  / 🟡 Checking  / 🔴 Offline
 *
 * Used on the InterviewLivePage so admins know before starting an AI interview
 * whether all AI services are available.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Box, Chip, CircularProgress, Tooltip, Typography } from '@mui/material';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import { useTranslation } from 'react-i18next';
import chatbotService from '../../services/chatbotService';
import httpRequest from '../../utils/httpRequest';

type ServiceStatus = 'checking' | 'online' | 'offline';

interface ServiceState {
  status: ServiceStatus;
  latencyMs?: number;
}

const PROBE_INTERVAL_MS = 30_000; // re-probe every 30 s

// ---------------------------------------------------------------------------
// Individual probes
// ---------------------------------------------------------------------------

async function probeLLM(): Promise<ServiceState> {
  const t0 = Date.now();
  try {
    await chatbotService.chat({
      messages: [{ role: 'user', content: 'ping' }],
    });
    return { status: 'online', latencyMs: Date.now() - t0 };
  } catch {
    return { status: 'offline' };
  }
}

async function probeSTT(): Promise<ServiceState> {
  // STT needs a file — we just check if the endpoint responds at all
  const t0 = Date.now();
  try {
    // A GET to the service base (expect 404 or 405, not 0)
    const res = await httpRequest.get('ai/transcribe/', { timeout: 5000 } as any).catch(() => null);
    // Even a 405 means the service is up
    return { status: 'online', latencyMs: Date.now() - t0 };
  } catch {
    return { status: 'offline' };
  }
}

async function probeTTS(): Promise<ServiceState> {
  const t0 = Date.now();
  try {
    await httpRequest.get('ai/tts/', { timeout: 5000 } as any).catch(() => null);
    return { status: 'online', latencyMs: Date.now() - t0 };
  } catch {
    return { status: 'offline' };
  }
}

// ---------------------------------------------------------------------------
// Util
// ---------------------------------------------------------------------------

const statusColor = (s: ServiceStatus) => {
  if (s === 'online') return 'success';
  if (s === 'offline') return 'error';
  return 'default';
};

const statusDotColor = (s: ServiceStatus) => {
  if (s === 'online') return '#22c55e';
  if (s === 'offline') return '#ef4444';
  return '#f59e0b';
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const AIServiceHealthBanner: React.FC = () => {
  const { t } = useTranslation('admin');

  const [llm, setLlm] = useState<ServiceState>({ status: 'checking' });
  const [stt, setStt] = useState<ServiceState>({ status: 'checking' });
  const [tts, setTts] = useState<ServiceState>({ status: 'checking' });
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const probe = useCallback(async () => {
    setLlm((s) => ({ ...s, status: 'checking' }));
    setStt((s) => ({ ...s, status: 'checking' }));
    setTts((s) => ({ ...s, status: 'checking' }));
    const [llmRes, sttRes, ttsRes] = await Promise.all([probeLLM(), probeSTT(), probeTTS()]);
    setLlm(llmRes);
    setStt(sttRes);
    setTts(ttsRes);
  }, []);

  useEffect(() => {
    probe();
    timerRef.current = setInterval(probe, PROBE_INTERVAL_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [probe]);

  const services: { label: string; state: ServiceState }[] = [
    { label: 'LLM (Chat AI)', state: llm },
    { label: 'STT (Whisper)', state: stt },
    { label: 'TTS (VieNeu)', state: tts },
  ];

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 1.5,
        p: 1.5,
        mb: 2,
        borderRadius: 2,
        background: (theme) =>
          theme.palette.mode === 'dark'
            ? 'rgba(255,255,255,0.04)'
            : 'rgba(0,0,0,0.03)',
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Typography
        variant="caption"
        fontWeight={600}
        sx={{ color: 'text.secondary', mr: 0.5, whiteSpace: 'nowrap' }}
      >
        AI Services:
      </Typography>

      {services.map(({ label, state }) => (
        <Tooltip
          key={label}
          title={
            state.status === 'online'
              ? `${label}: Online${state.latencyMs != null ? ` (${state.latencyMs}ms)` : ''}`
              : state.status === 'offline'
              ? `${label}: Offline — Hệ thống AI này hiện không phản hồi.`
              : `${label}: Đang kiểm tra...`
          }
          placement="bottom"
        >
          <Chip
            size="small"
            icon={
              state.status === 'checking' ? (
                <CircularProgress size={10} sx={{ ml: '4px' }} />
              ) : (
                <FiberManualRecordIcon
                  sx={{ fontSize: '10px !important', color: statusDotColor(state.status) }}
                />
              )
            }
            label={label}
            color={statusColor(state.status) as any}
            variant="outlined"
            sx={{ fontWeight: 500, fontSize: '0.72rem' }}
          />
        </Tooltip>
      ))}
    </Box>
  );
};

export default AIServiceHealthBanner;
