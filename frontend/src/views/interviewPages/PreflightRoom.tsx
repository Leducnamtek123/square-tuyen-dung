'use client';
import React, { useEffect, useReducer, useRef } from 'react';
import { Box, Button, Typography, Stack, CircularProgress } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMicrophone,
  faMicrophoneSlash,
  faCheckCircle,
  faExclamationTriangle,
} from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';

interface PreflightRoomProps {
  onJoin: () => void;
  onCancel: () => void;
  starting: boolean;
}

type PreflightState = {
  stream: MediaStream | null;
  error: string;
  loading: boolean;
  volume: number;
};

type PreflightAction =
  | { type: 'loading'; value: boolean }
  | { type: 'stream'; value: MediaStream | null }
  | { type: 'error'; value: string }
  | { type: 'volume'; value: number };

const initialState: PreflightState = {
  stream: null,
  error: '',
  loading: false,
  volume: 0,
};

function reducer(state: PreflightState, action: PreflightAction): PreflightState {
  switch (action.type) {
    case 'loading':
      return { ...state, loading: action.value };
    case 'stream':
      return { ...state, stream: action.value };
    case 'error':
      return { ...state, error: action.value };
    case 'volume':
      return { ...state, volume: action.value };
    default:
      return state;
  }
}

export const PreflightRoom = ({ onJoin, onCancel, starting }: PreflightRoomProps) => {
  const { t } = useTranslation(['interview', 'common']);
  const [state, dispatch] = useReducer(reducer, initialState);
  const audioContextRef = useRef<AudioContext | null>(null);
  const micDeniedMessageRef = useRef(t('errors.mic_denied'));

  useEffect(() => {
    micDeniedMessageRef.current = t('errors.mic_denied');
  }, [t]);

  useEffect(() => {
    let animationFrame = 0;
    let localStream: MediaStream | null = null;
    let disposed = false;
    let lastVolume = -1;
    let lastVolumeDispatchAt = 0;

    const checkMicrophone = async () => {
      dispatch({ type: 'loading', value: true });

      try {
        localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        if (disposed) {
          localStream.getTracks().forEach((track) => track.stop());
          return;
        }

        dispatch({ type: 'stream', value: localStream });
        dispatch({ type: 'error', value: '' });

        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          const audioContext = new AudioContextClass();
          audioContextRef.current = audioContext;

          const analyser = audioContext.createAnalyser();
          analyser.fftSize = 256;

          const source = audioContext.createMediaStreamSource(localStream);
          source.connect(analyser);

          const dataArray = new Uint8Array(analyser.frequencyBinCount);

          const renderFrame = (timestamp: number) => {
            if (disposed) return;
            analyser.getByteFrequencyData(dataArray);

            let sum = 0;
            for (let i = 0; i < dataArray.length; i += 1) {
              sum += dataArray[i];
            }

            const average = sum / dataArray.length;
            const nextVolume = Math.min(100, Math.round((average / 255) * 100 * 2));
            if (nextVolume !== lastVolume && timestamp - lastVolumeDispatchAt >= 80) {
              lastVolume = nextVolume;
              lastVolumeDispatchAt = timestamp;
              dispatch({ type: 'volume', value: nextVolume });
            }

            animationFrame = window.requestAnimationFrame(renderFrame);
          };

          animationFrame = window.requestAnimationFrame(renderFrame);
        }
      } catch (error) {
        if (disposed) return;
        dispatch({ type: 'stream', value: null });
        dispatch({
          type: 'error',
          value: micDeniedMessageRef.current,
        });
      } finally {
        if (!disposed) {
          dispatch({ type: 'loading', value: false });
        }
      }
    };

    void checkMicrophone();

    return () => {
      disposed = true;
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }

      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
      }

      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <Box
      sx={{
        p: { xs: 4, md: 6 },
        textAlign: 'center',
        background: 'rgba(2, 6, 23, 0.9)',
        borderRadius: '2rem',
        border: '1px solid rgba(56, 189, 248, 0.2)',
        boxShadow: '0 0 50px rgba(56, 189, 248, 0.1)',
        maxWidth: '600px',
        mx: 'auto',
        width: '100%',
        position: 'relative',
        zIndex: 10,
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at center, rgba(56, 189, 248, 0.1) 0%, transparent 60%)',
          pointerEvents: 'none',
        }}
      />

      <Typography
        variant="h4"
        sx={{ fontWeight: 900, color: 'white', mb: 1, textTransform: 'uppercase', letterSpacing: '2px' }}
      >
            {t('preflight.title')}
      </Typography>
      <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.6)', mb: 5 }}>
          {t('preflight.subtitle')}
      </Typography>

      <Stack alignItems="center" spacing={4} sx={{ mb: 6 }}>
        <Box
          sx={{
            position: 'relative',
            width: 120,
            height: 120,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            background: state.error ? 'rgba(244, 63, 94, 0.1)' : 'rgba(56, 189, 248, 0.1)',
            border: `2px solid ${
              state.error ? 'rgba(244, 63, 94, 0.5)' : state.stream ? 'rgba(56, 189, 248, 0.5)' : 'rgba(255,255,255,0.1)'
            }`,
            transition: 'all 0.3s ease',
          }}
        >
          {state.stream &&
            ['ring-1', 'ring-2', 'ring-3'].map((ringKey, index) => (
              <Box
                key={ringKey}
                sx={{
                  position: 'absolute',
                  inset: -10 * (index + 1),
                  borderRadius: '50%',
                  border: '1px solid rgba(56, 189, 248, 0.2)',
                  opacity: Math.max(0, state.volume / 100 - index * 0.2),
                  transform: `scale(${1 + (state.volume / 100) * (0.2 + index * 0.1)})`,
                  transition: 'transform 0.1s ease, opacity 0.1s ease',
                }}
              />
            ))}

          <FontAwesomeIcon
            icon={state.error ? faMicrophoneSlash : faMicrophone}
            style={{
              fontSize: '3rem',
              color: state.error ? '#fb7185' : state.stream ? '#38bdf8' : '#94a3b8',
              zIndex: 2,
            }}
          />
        </Box>

        {state.loading && <CircularProgress size={24} sx={{ color: '#38bdf8' }} />}

        {state.error && (
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{
              background: 'rgba(244, 63, 94, 0.1)',
              px: 3,
              py: 1.5,
              borderRadius: '12px',
              border: '1px solid rgba(244, 63, 94, 0.2)',
            }}
          >
            <FontAwesomeIcon icon={faExclamationTriangle} color="#fb7185" />
            <Typography sx={{ color: '#fb7185', fontWeight: 600, fontSize: '0.9rem' }}>
              {state.error}
            </Typography>
          </Stack>
        )}

        {state.stream && !state.error && (
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{
              background: 'rgba(52, 211, 153, 0.1)',
              px: 3,
              py: 1.5,
              borderRadius: '12px',
              border: '1px solid rgba(52, 211, 153, 0.2)',
            }}
          >
            <FontAwesomeIcon icon={faCheckCircle} color="#34d399" />
            <Typography sx={{ color: '#34d399', fontWeight: 600, fontSize: '0.9rem' }}>
              {t('preflight.mic_ready')}
            </Typography>
          </Stack>
        )}
      </Stack>

      <Stack direction="row" spacing={2} justifyContent="center">
        <Button
          variant="outlined"
          onClick={onCancel}
          disabled={starting}
          sx={{
            px: 4,
            py: 1.5,
            borderRadius: '12px',
            borderColor: 'rgba(255,255,255,0.2)',
            color: 'white',
            '&:hover': { borderColor: 'white', background: 'rgba(255,255,255,0.05)' },
          }}
        >
          {t('common:actions.cancel')}
        </Button>
        <Button
          variant="contained"
          onClick={onJoin}
          disabled={starting || !state.stream || !!state.error}
          sx={{
            px: 5,
            py: 1.5,
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #0ea5e9, #2563eb)',
            color: 'white',
            fontWeight: 800,
            textTransform: 'uppercase',
            boxShadow: '0 4px 20px rgba(14, 165, 233, 0.4)',
            '&:hover': {
              background: 'linear-gradient(135deg, #38bdf8, #3b82f6)',
              boxShadow: '0 4px 25px rgba(14, 165, 233, 0.6)',
            },
            '&:disabled': {
              background: 'rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.3)',
              boxShadow: 'none',
            },
          }}
        >
          {starting ? <CircularProgress size={24} color="inherit" /> : t('preflight.join')}
        </Button>
      </Stack>
    </Box>
  );
};
