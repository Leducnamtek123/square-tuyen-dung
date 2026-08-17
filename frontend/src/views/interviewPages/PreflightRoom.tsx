'use client';
import React, { useEffect, useReducer, useRef, useCallback } from 'react';
import { Box, Button, Typography, Stack, CircularProgress } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMicrophone,
  faMicrophoneSlash,
  faCheckCircle,
  faExclamationTriangle,
  faRedo,
  faLock,
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
  const activeStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    micDeniedMessageRef.current = t('errors.mic_denied');
  }, [t]);

  const requestMicrophone = useCallback(async () => {
    dispatch({ type: 'loading', value: true });
    dispatch({ type: 'error', value: '' });

    if (activeStreamRef.current) {
      activeStreamRef.current.getTracks().forEach((track) => track.stop());
      activeStreamRef.current = null;
    }

    try {
      const localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      activeStreamRef.current = localStream;
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
        let lastVolume = -1;
        let lastVolumeDispatchAt = 0;

        const renderFrame = (timestamp: number) => {
          if (!activeStreamRef.current) return;
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

          window.requestAnimationFrame(renderFrame);
        };

        window.requestAnimationFrame(renderFrame);
      }
    } catch {
      dispatch({ type: 'stream', value: null });
      dispatch({
        type: 'error',
        value: micDeniedMessageRef.current,
      });
    } finally {
      dispatch({ type: 'loading', value: false });
    }
  }, []);

  useEffect(() => {
    void requestMicrophone();

    return () => {
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
      }
      if (activeStreamRef.current) {
        activeStreamRef.current.getTracks().forEach((track) => track.stop());
        activeStreamRef.current = null;
      }
    };
  }, [requestMicrophone]);

  return (
    <Box
      sx={{
        p: { xs: 3.5, md: 5 },
        textAlign: 'center',
        background: 'rgba(2, 6, 23, 0.94)',
        borderRadius: '2rem',
        border: '1px solid rgba(56, 189, 248, 0.2)',
        boxShadow: '0 0 50px rgba(56, 189, 248, 0.12)',
        maxWidth: '620px',
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
          background: 'radial-gradient(circle at center, rgba(56, 189, 248, 0.12) 0%, transparent 65%)',
          pointerEvents: 'none',
        }}
      />

      <Typography
        variant="h4"
        sx={{ fontWeight: 900, color: 'white', mb: 1, textTransform: 'uppercase', letterSpacing: '1.5px', fontSize: { xs: '1.4rem', md: '1.85rem' } }}
      >
        {t('preflight.title')}
      </Typography>
      <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.65)', mb: 4, fontSize: '0.925rem' }}>
        {t('preflight.subtitle')}
      </Typography>

      <Stack alignItems="center" spacing={3.5} sx={{ mb: 5 }}>
        <Box
          sx={{
            position: 'relative',
            width: 110,
            height: 110,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            background: state.error ? 'rgba(244, 63, 94, 0.12)' : 'rgba(56, 189, 248, 0.12)',
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
              fontSize: '2.75rem',
              color: state.error ? '#fb7185' : state.stream ? '#38bdf8' : '#94a3b8',
              zIndex: 2,
            }}
          />
        </Box>

        {state.loading && <CircularProgress size={24} sx={{ color: '#38bdf8' }} />}

        {state.error && (
          <Stack spacing={2} sx={{ width: '100%' }}>
            <Stack
              direction="row"
              spacing={1.25}
              alignItems="center"
              justifyContent="center"
              sx={{
                background: 'rgba(244, 63, 94, 0.12)',
                px: 2.5,
                py: 1.5,
                borderRadius: '12px',
                border: '1px solid rgba(244, 63, 94, 0.3)',
              }}
            >
              <FontAwesomeIcon icon={faExclamationTriangle} color="#fb7185" />
              <Typography sx={{ color: '#fb7185', fontWeight: 600, fontSize: '0.875rem' }}>
                {state.error}
              </Typography>
            </Stack>

            {/* Visual Guide to Unblock Permission */}
            <Box
              sx={{
                bgcolor: 'rgba(15, 23, 42, 0.65)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                p: 2,
                textAlign: 'left',
              }}
            >
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                <FontAwesomeIcon icon={faLock} color="#38bdf8" style={{ fontSize: '0.85rem' }} />
                <Typography sx={{ color: '#e2e8f0', fontWeight: 700, fontSize: '0.825rem' }}>
                  Hướng dẫn mở khóa Microphone trên trình duyệt:
                </Typography>
              </Stack>
              <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.78rem', lineHeight: 1.5 }}>
                1. Nhấp vào biểu tượng <strong>Ổ khóa (🔒)</strong> hoặc <strong>Cài đặt trang</strong> ở góc trái thanh địa chỉ URL.
                <br />
                2. Chuyển mục <strong>Microphone</strong> thành <strong>Cho phép (Allow)</strong>.
                <br />
                3. Bấm nút <strong>"Thử lại kết nối micro"</strong> bên dưới.
              </Typography>
              <Button
                size="small"
                variant="outlined"
                startIcon={<FontAwesomeIcon icon={faRedo} style={{ fontSize: '0.75rem' }} />}
                onClick={() => void requestMicrophone()}
                sx={{
                  mt: 1.5,
                  color: '#38bdf8',
                  borderColor: 'rgba(56, 189, 248, 0.4)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  textTransform: 'none',
                  borderRadius: '8px',
                  '&:hover': { borderColor: '#38bdf8', bgcolor: 'rgba(56, 189, 248, 0.1)' },
                }}
              >
                Thử lại kết nối micro
              </Button>
            </Box>
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
