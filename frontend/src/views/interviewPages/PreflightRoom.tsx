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
        p: { xs: 3, sm: 4.5, md: 5 },
        textAlign: 'center',
        background: 'rgba(255, 255, 255, 0.94)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderRadius: { xs: '1.5rem', md: '2rem' },
        border: '1px solid rgba(226, 232, 240, 0.9)',
        boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.08), 0 1px 0 rgba(255, 255, 255, 1) inset',
        maxWidth: '560px',
        mx: 'auto',
        width: '100%',
        position: 'relative',
        zIndex: 10,
      }}
    >
      {/* Ambient top highlight */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: '15%',
          right: '15%',
          height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(14, 165, 233, 0.5), transparent)',
          pointerEvents: 'none',
        }}
      />

      <Typography
        variant="h4"
        sx={{
          fontWeight: 800,
          color: '#0f172a',
          mb: 1,
          letterSpacing: '-0.025em',
          fontSize: { xs: '1.35rem', md: '1.6rem' },
        }}
      >
        {t('preflight.title')}
      </Typography>
      <Typography
        variant="body2"
        sx={{
          color: '#64748b',
          mb: 4,
          fontSize: { xs: '0.85rem', md: '0.925rem' },
          lineHeight: 1.6,
          maxWidth: '46ch',
          mx: 'auto',
        }}
      >
        {t('preflight.subtitle')}
      </Typography>

      <Stack alignItems="center" spacing={3} sx={{ mb: 4 }}>
        {/* Visualizer Icon & Waveform Wrapper */}
        <Box
          sx={{
            position: 'relative',
            width: 104,
            height: 104,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            background: state.error
              ? '#fff1f2'
              : state.stream
              ? '#f0f9ff'
              : '#f8fafc',
            border: `1.5px solid ${
              state.error
                ? '#fecdd3'
                : state.stream
                ? '#7dd3fc'
                : '#e2e8f0'
            }`,
            boxShadow: state.error
              ? '0 0 25px rgba(244, 63, 94, 0.15)'
              : state.stream
              ? '0 0 30px rgba(14, 165, 233, 0.18)'
              : 'none',
            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {/* Subtle audio volume pulsation rings */}
          {state.stream &&
            ['ring-1', 'ring-2'].map((ringKey, index) => (
              <Box
                key={ringKey}
                sx={{
                  position: 'absolute',
                  inset: -8 * (index + 1),
                  borderRadius: '50%',
                  border: '1px solid rgba(14, 165, 233, 0.3)',
                  opacity: Math.max(0, state.volume / 100 - index * 0.3),
                  transform: `scale(${1 + (state.volume / 100) * (0.15 + index * 0.1)})`,
                  transition: 'transform 0.08s ease, opacity 0.08s ease',
                  pointerEvents: 'none',
                }}
              />
            ))}

          <FontAwesomeIcon
            icon={state.error ? faMicrophoneSlash : faMicrophone}
            style={{
              fontSize: '2.35rem',
              color: state.error ? '#e11d48' : state.stream ? '#0284c7' : '#94a3b8',
              zIndex: 2,
              filter: state.stream ? 'drop-shadow(0 2px 6px rgba(14, 165, 233, 0.3))' : 'none',
              transition: 'color 0.2s ease',
            }}
          />
        </Box>

        {/* Dynamic Waveform Visualizer Bars when Stream is active */}
        {state.stream && (
          <Stack direction="row" spacing={0.75} alignItems="center" sx={{ height: 28 }}>
            {[14, 28, 42, 56, 42, 28, 14].map((baseHeight, i) => {
              const dynamicHeight = Math.max(
                4,
                Math.min(28, Math.round(baseHeight * 0.2 + (state.volume / 100) * baseHeight))
              );
              return (
                <Box
                  key={i}
                  sx={{
                    width: 4,
                    height: `${dynamicHeight}px`,
                    borderRadius: 2,
                    background: state.volume > 15 ? 'linear-gradient(180deg, #0ea5e9, #0284c7)' : 'rgba(14, 165, 233, 0.5)',
                    transition: 'height 0.08s ease',
                  }}
                />
              );
            })}
          </Stack>
        )}

        {state.loading && (
          <Stack direction="row" spacing={1.5} alignItems="center">
            <CircularProgress size={18} sx={{ color: '#0284c7' }} />
            <Typography sx={{ color: '#64748b', fontSize: '0.85rem' }}>
              {t('common:status.loading')}
            </Typography>
          </Stack>
        )}

        {/* Error Notification & Guide Card */}
        {state.error && (
          <Stack spacing={2} sx={{ width: '100%' }}>
            <Stack
              direction="row"
              spacing={1.25}
              alignItems="center"
              justifyContent="center"
              sx={{
                background: '#fff1f2',
                px: 2.5,
                py: 1.25,
                borderRadius: '12px',
                border: '1px solid #fecdd3',
              }}
            >
              <FontAwesomeIcon icon={faExclamationTriangle} color="#e11d48" style={{ fontSize: '0.9rem' }} />
              <Typography sx={{ color: '#e11d48', fontWeight: 600, fontSize: '0.85rem' }}>
                {state.error}
              </Typography>
            </Stack>

            {/* Visual Guide to Unblock Permission */}
            <Box
              sx={{
                bgcolor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '14px',
                p: 2.5,
                textAlign: 'left',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              }}
            >
              <Stack direction="row" spacing={1.25} alignItems="center" sx={{ mb: 1.5 }}>
                <Box
                  sx={{
                    width: 24,
                    height: 24,
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#e0f2fe',
                    color: '#0284c7',
                  }}
                >
                  <FontAwesomeIcon icon={faLock} style={{ fontSize: '0.75rem' }} />
                </Box>
                <Typography sx={{ color: '#0f172a', fontWeight: 700, fontSize: '0.825rem' }}>
                  Hướng dẫn mở khóa Microphone trên trình duyệt:
                </Typography>
              </Stack>
              <Typography
                component="div"
                sx={{
                  color: '#475569',
                  fontSize: '0.8rem',
                  lineHeight: 1.7,
                  pl: 0.5,
                }}
              >
                <div><strong>Bước 1:</strong> Nhấp vào biểu tượng <strong>Cài đặt trang / Ổ khóa</strong> ở góc trái thanh địa chỉ URL.</div>
                <div><strong>Bước 2:</strong> Chuyển mục <strong>Microphone</strong> sang trạng thái <strong>Cho phép (Allow)</strong>.</div>
                <div><strong>Bước 3:</strong> Bấm nút <strong>"Thử lại kết nối micro"</strong> bên dưới.</div>
              </Typography>
              <Button
                size="small"
                variant="outlined"
                startIcon={<FontAwesomeIcon icon={faRedo} style={{ fontSize: '0.7rem' }} />}
                onClick={() => void requestMicrophone()}
                sx={{
                  mt: 2,
                  color: '#0284c7',
                  borderColor: '#bae6fd',
                  bgcolor: '#f0f9ff',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  textTransform: 'none',
                  borderRadius: '8px',
                  px: 2,
                  py: 0.75,
                  transition: 'all 0.15s ease',
                  '&:hover': {
                    borderColor: '#0284c7',
                    bgcolor: '#e0f2fe',
                    boxShadow: '0 0 10px rgba(14, 165, 233, 0.15)',
                  },
                  '&:active': {
                    transform: 'scale(0.98)',
                  },
                }}
              >
                Thử lại kết nối micro
              </Button>
            </Box>
          </Stack>
        )}

        {/* Ready Badge */}
        {state.stream && !state.error && (
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{
              background: '#ecfdf5',
              px: 2.5,
              py: 1,
              borderRadius: '9999px',
              border: '1px solid #a7f3d0',
              boxShadow: '0 2px 10px rgba(16, 185, 129, 0.1)',
            }}
          >
            <FontAwesomeIcon icon={faCheckCircle} color="#059669" style={{ fontSize: '0.85rem' }} />
            <Typography sx={{ color: '#047857', fontWeight: 600, fontSize: '0.825rem' }}>
              {t('preflight.mic_ready')}
            </Typography>
          </Stack>
        )}
      </Stack>

      {/* Action Footer */}
      <Stack
        direction={{ xs: 'column-reverse', sm: 'row' }}
        spacing={1.5}
        justifyContent="center"
        alignItems="center"
        sx={{ pt: 1, width: '100%' }}
      >
        <Button
          onClick={onCancel}
          disabled={starting}
          sx={{
            width: { xs: '100%', sm: 'auto' },
            minWidth: { xs: '100%', sm: '120px' },
            px: 3,
            py: 1.25,
            borderRadius: '12px',
            background: '#f1f5f9',
            border: '1px solid #e2e8f0',
            color: '#475569',
            fontSize: '0.875rem',
            fontWeight: 600,
            textTransform: 'none',
            transition: 'all 0.15s ease',
            '&:hover': {
              borderColor: '#cbd5e1',
              background: '#e2e8f0',
              color: '#0f172a',
            },
            '&:active': {
              transform: 'scale(0.98)',
            },
          }}
        >
          {t('common:actions.cancel')}
        </Button>
        <Button
          onClick={onJoin}
          disabled={starting || !state.stream || !!state.error}
          sx={{
            width: { xs: '100%', sm: 'auto' },
            minWidth: { xs: '100%', sm: '180px' },
            px: 4,
            py: 1.25,
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
            color: '#ffffff',
            fontWeight: 700,
            fontSize: '0.875rem',
            letterSpacing: '0.02em',
            textTransform: 'none',
            boxShadow: '0 4px 18px rgba(14, 165, 233, 0.35)',
            transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            '&:hover': {
              background: 'linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%)',
              boxShadow: '0 6px 22px rgba(14, 165, 233, 0.5)',
            },
            '&:active': {
              transform: 'scale(0.98)',
            },
            '&:disabled': {
              background: '#f1f5f9',
              color: '#94a3b8',
              border: '1px solid #e2e8f0',
              boxShadow: 'none',
              cursor: 'not-allowed',
            },
          }}
        >
          {starting ? <CircularProgress size={20} color="inherit" /> : t('preflight.join')}
        </Button>
      </Stack>
    </Box>
  );
};
