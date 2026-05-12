'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Box, Chip, CircularProgress, Tooltip, Typography } from '@mui/material';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import { useTranslation } from 'react-i18next';
import aiService, { type AIHealthResponse, type AIServiceStatus } from '@/services/aiService';

type ServiceStatus = 'checking' | AIServiceStatus;

interface ServiceState {
  status: ServiceStatus;
  latencyMs?: number;
  detail?: string;
}

type ServiceItem = { label: string; state: ServiceState };

const PROBE_INTERVAL_MS = 30_000;

const statusColor = (status: ServiceStatus): 'success' | 'error' | 'default' => {
  if (status === 'online') return 'success';
  if (status === 'offline') return 'error';
  return 'default';
};

const statusDotColor = (status: ServiceStatus) => {
  if (status === 'online') return '#22c55e';
  if (status === 'offline') return '#ef4444';
  return '#f59e0b';
};

const serviceLabels: Record<string, string> = {
  llm: 'LLM',
  stt: 'STT',
  tts: 'TTS',
  livekit: 'LiveKit',
  celery: 'Celery',
};

const initialServices: ServiceItem[] = ['LLM', 'STT', 'TTS', 'LiveKit', 'Celery'].map((label) => ({
  label,
  state: { status: 'checking' },
}));

const mapHealthToServices = (health: AIHealthResponse): ServiceItem[] =>
  Object.entries(health.checks).map(([key, value]) => ({
    label: serviceLabels[key] || key,
    state: {
      status: value.status,
      latencyMs: value.latencyMs ?? undefined,
      detail: value.error,
    },
  }));

const AIServiceHealthBanner: React.FC = () => {
  const { t } = useTranslation('admin');
  const [services, setServices] = useState<ServiceItem[]>(initialServices);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const probe = useCallback(async () => {
    setServices((items) =>
      items.map((item) => ({ ...item, state: { ...item.state, status: 'checking' } })),
    );
    try {
      const health = await aiService.getHealth();
      setServices(mapHealthToServices(health));
    } catch {
      setServices((items) => items.map((item) => ({ ...item, state: { status: 'offline' } })));
    }
  }, []);

  useEffect(() => {
    probe();
    timerRef.current = setInterval(probe, PROBE_INTERVAL_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [probe]);

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
        {t('aiHealth.title', 'AI services')}
      </Typography>

      {services.map(({ label, state }) => (
        <Tooltip
          key={label}
          title={
            state.status === 'online'
              ? `${label}: Online${state.latencyMs != null ? ` (${state.latencyMs}ms)` : ''}`
              : state.status === 'not_configured'
                ? `${label}: Not configured`
                : state.status === 'offline'
                  ? `${label}: Offline${state.detail ? ` - ${state.detail}` : ''}`
                  : `${label}: Checking...`
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
            color={statusColor(state.status)}
            variant="outlined"
            sx={{ fontWeight: 500, fontSize: '0.72rem' }}
          />
        </Tooltip>
      ))}
    </Box>
  );
};

export default AIServiceHealthBanner;
