import React, { useState, useEffect, useRef } from 'react';
import { Box, Button, Typography, Stack, CircularProgress } from '@mui/material';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMicrophone, faMicrophoneSlash, faCheckCircle, faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";

interface PreflightRoomProps {
  onJoin: () => void;
  onCancel: () => void;
  starting: boolean;
}

export const PreflightRoom = ({ onJoin, onCancel, starting }: PreflightRoomProps) => {
  const { t } = useTranslation(['interview', 'common']);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const [volume, setVolume] = useState(0);

  useEffect(() => {
    let animationFrame: number;
    let localStream: MediaStream | null = null;
    const checkMicrophone = async () => {
      setLoading(true);
      try {
        localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        setStream(localStream);
        setError('');

        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
            const audioContext = new AudioContextClass();
            audioContextRef.current = audioContext;
            const analyser = audioContext.createAnalyser();
            analyserRef.current = analyser;
            analyser.fftSize = 256;

            const source = audioContext.createMediaStreamSource(localStream);
            source.connect(analyser);

            const dataArray = new Uint8Array(analyser.frequencyBinCount);

            const renderFrame = () => {
                analyser.getByteFrequencyData(dataArray);
                let sum = 0;
                for (let i = 0; i < dataArray.length; i++) {
                    sum += dataArray[i];
                }
                const average = sum / dataArray.length;
                setVolume(Math.min(100, Math.round((average / 255) * 100 * 2)));
                animationFrame = requestAnimationFrame(renderFrame);
            };
            renderFrame();
        }
      } catch (err) {
        setStream(null);
        setError(t('errors.mic_denied', { defaultValue: 'Yêu cầu quyền thu âm bị từ chối. Vui lòng cấp quyền Microphone để tiếp tục.' }));
      } finally {
        setLoading(false);
      }
    };

    checkMicrophone();

    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
          audioContextRef.current.close().catch(() => {});
      }
      if (localStream) {
          localStream.getTracks().forEach(track => track.stop());
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Box sx={{ p: {xs: 4, md: 6}, textAlign: 'center', background: 'rgba(2, 6, 23, 0.9)', borderRadius: '2rem', border: '1px solid rgba(56, 189, 248, 0.2)', boxShadow: '0 0 50px rgba(56, 189, 248, 0.1)', maxWidth: '600px', mx: 'auto', width: '100%', position: 'relative', zIndex: 10 }}>
      {/* Visual background aura */}
      <Box sx={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at center, rgba(56, 189, 248, 0.1) 0%, transparent 60%)', pointerEvents: 'none' }} />
      
      <Typography variant="h4" sx={{ fontWeight: '900', color: 'white', mb: 1, textTransform: 'uppercase', letterSpacing: '2px' }}>
        {t('preflight.title', { defaultValue: 'Kiểm tra thiết bị' })}
      </Typography>
      <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.6)', mb: 5 }}>
         {t('preflight.subtitle', { defaultValue: 'Đảm bảo Micro của bạn hoạt động tốt trước khi bắt đầu phỏng vấn AI.'})}
      </Typography>

      <Stack alignItems="center" spacing={4} sx={{ mb: 6 }}>
        <Box sx={{
            position: 'relative',
            width: 120,
            height: 120,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            background: error ? 'rgba(244, 63, 94, 0.1)' : 'rgba(56, 189, 248, 0.1)',
            border: `2px solid ${error ? 'rgba(244, 63, 94, 0.5)' : stream ? 'rgba(56, 189, 248, 0.5)' : 'rgba(255,255,255,0.1)'}`,
            transition: 'all 0.3s ease',
        }}>
            {/* Volume indicator rings */}
            {stream && Array.from({length: 3}).map((_, i) => (
                <Box key={i} sx={{
                    position: 'absolute',
                    inset: -10 * (i+1),
                    borderRadius: '50%',
                    border: '1px solid rgba(56, 189, 248, 0.2)',
                    opacity: Math.max(0, volume / 100 - (i * 0.2)),
                    transform: `scale(${1 + (volume/100) * (0.2 + i*0.1)})`,
                    transition: 'transform 0.1s ease, opacity 0.1s ease',
                }} />
            ))}

            <FontAwesomeIcon 
                icon={error ? faMicrophoneSlash : faMicrophone} 
                style={{ fontSize: '3rem', color: error ? '#fb7185' : stream ? '#38bdf8' : '#94a3b8', zIndex: 2 }} 
            />
        </Box>

        {loading && <CircularProgress size={24} sx={{ color: '#38bdf8' }} />}

        {error && (
            <Stack direction="row" spacing={1} alignItems="center" sx={{ background: 'rgba(244, 63, 94, 0.1)', px: 3, py: 1.5, borderRadius: '12px', border: '1px solid rgba(244, 63, 94, 0.2)' }}>
                <FontAwesomeIcon icon={faExclamationTriangle} color="#fb7185" />
                <Typography sx={{ color: '#fb7185', fontWeight: 600, fontSize: '0.9rem' }}>{error}</Typography>
            </Stack>
        )}

        {stream && !error && (
             <Stack direction="row" spacing={1} alignItems="center" sx={{ background: 'rgba(52, 211, 153, 0.1)', px: 3, py: 1.5, borderRadius: '12px', border: '1px solid rgba(52, 211, 153, 0.2)' }}>
                <FontAwesomeIcon icon={faCheckCircle} color="#34d399" />
                <Typography sx={{ color: '#34d399', fontWeight: 600, fontSize: '0.9rem' }}>
                    {t('preflight.mic_ready', { defaultValue: 'Microphone đã sẵn sàng' })}
                </Typography>
            </Stack>
        )}
      </Stack>

      <Stack direction="row" spacing={2} justifyContent="center">
        <Button
            variant="outlined"
            onClick={onCancel}
            disabled={starting}
            sx={{ px: 4, py: 1.5, borderRadius: '12px', borderColor: 'rgba(255,255,255,0.2)', color: 'white', '&:hover': { borderColor: 'white', background: 'rgba(255,255,255,0.05)' } }}
        >
             {t('common:actions.cancel', { defaultValue: 'Huỷ bỏ' })}
        </Button>
        <Button
            variant="contained"
            onClick={onJoin}
            disabled={starting || !stream || !!error}
            sx={{ px: 5, py: 1.5, borderRadius: '12px', background: 'linear-gradient(135deg, #0ea5e9, #2563eb)', color: 'white', fontWeight: 800, textTransform: 'uppercase', boxShadow: '0 4px 20px rgba(14, 165, 233, 0.4)', '&:hover': { background: 'linear-gradient(135deg, #38bdf8, #3b82f6)', boxShadow: '0 4px 25px rgba(14, 165, 233, 0.6)' }, '&:disabled': { background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.3)', boxShadow: 'none' } }}
        >
            {starting ? <CircularProgress size={24} color="inherit" /> : t('preflight.join', { defaultValue: 'Vòng Phỏng Vấn' })}
        </Button>
      </Stack>
    </Box>
  );
};
