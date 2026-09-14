'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  Box,
  Button,
  Typography,
  Stack,
  CircularProgress,
  Chip,
  Avatar,
  Select,
  MenuItem,
  Switch,
  FormControl,
  LinearProgress,
  Grid2 as Grid,
  Alert,
} from '@mui/material';
import MicOutlinedIcon from '@mui/icons-material/MicOutlined';
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined';
import VideocamOffOutlinedIcon from '@mui/icons-material/VideocamOffOutlined';
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import QuizOutlinedIcon from '@mui/icons-material/QuizOutlined';
import TranslateOutlinedIcon from '@mui/icons-material/TranslateOutlined';
import BusinessCenterOutlinedIcon from '@mui/icons-material/BusinessCenterOutlined';
import GraphicEqOutlinedIcon from '@mui/icons-material/GraphicEqOutlined';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';
import ApartmentOutlinedIcon from '@mui/icons-material/ApartmentOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { AilaLogo } from '@/components/Common/AilaLogo';
import { IMAGES } from '@/configs/images';
import type { InterviewSession } from '@/types/models';

interface PreflightRoomProps {
  onJoin: () => void;
  onCancel: () => void;
  starting: boolean;
  session?: InterviewSession | null;
}

interface AudioDeviceOption {
  deviceId: string;
  label: string;
}

const TOTAL_EQUALIZER_BARS = 36;

export const PreflightRoom: React.FC<PreflightRoomProps> = ({
  onJoin,
  onCancel,
  starting,
  session,
}) => {
  // Device & Stream States
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const [audioDevices, setAudioDevices] = useState<AudioDeviceOption[]>([]);
  const [selectedAudioId, setSelectedAudioId] = useState<string>('');
  const [cameraEnabled, setCameraEnabled] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [volume, setVolume] = useState<number>(0);
  const [dbLevel, setDbLevel] = useState<number>(-55);
  const [hasDetectedVoice, setHasDetectedVoice] = useState<boolean>(false);
  const [bars, setBars] = useState<number[]>(() =>
    Array.from({ length: TOTAL_EQUALIZER_BARS }, () => 4)
  );

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const activeVideoTrackRef = useRef<MediaStreamTrack | null>(null);
  const activeAudioStreamRef = useRef<MediaStream | null>(null);

  // Metadata Resolution from Session
  const isMock =
    session?.sessionType === 'mock' ||
    (session as any)?.type === 'practice' ||
    (!session?.jobPost && !session?.companyName);

  const jobTitle =
    session?.jobName ||
    (session?.jobPost as any)?.title ||
    (session?.session_metadata as any)?.position_title ||
    (session?.session_metadata as any)?.job_title ||
    (isMock ? 'Luyện tập kỹ năng phỏng vấn AI' : 'Vị trí Tuyển dụng');

  const companyName = isMock
    ? 'Trợ lý AI AILA · Chế độ Luyện tập cá nhân'
    : (session?.companyName ||
       (session?.jobPost as any)?.company?.name ||
       'Nhà tuyển dụng InfoHR');

  const companyLogo =
    session?.companyLogo ||
    (session?.jobPost as any)?.company?.logo ||
    session?.company_logo;

  const questionsCount =
    session?.questionsCount ||
    session?.questions_count ||
    (session?.session_metadata as any)?.total_questions ||
    12;

  const difficultyLabel =
    (session?.session_metadata as any)?.difficulty || 'TRUNG BÌNH';

  // 1. Enumerate Audio Devices
  const loadAudioDevices = useCallback(async () => {
    try {
      if (!navigator.mediaDevices?.enumerateDevices) return;
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioInputs = devices
        .filter((d) => d.kind === 'audioinput')
        .map((d, index) => ({
          deviceId: d.deviceId,
          label: d.label || `Microphone ${index + 1}`,
        }));
      setAudioDevices(audioInputs);
      if (audioInputs.length > 0 && !selectedAudioId) {
        setSelectedAudioId(audioInputs[0].deviceId);
      }
    } catch {
      // Ignore enumeration failure
    }
  }, [selectedAudioId]);

  // 2. Request & Manage Microphone Stream
  const initAudioStream = useCallback(async () => {
    setError('');

    // Stop previous audio tracks
    if (activeAudioStreamRef.current) {
      activeAudioStreamRef.current.getTracks().forEach((track) => track.stop());
      activeAudioStreamRef.current = null;
    }

    try {
      const constraints: MediaStreamConstraints = {
        audio: selectedAudioId
          ? { deviceId: { exact: selectedAudioId }, echoCancellation: true, noiseSuppression: true }
          : { echoCancellation: true, noiseSuppression: true },
        video: false,
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      activeAudioStreamRef.current = stream;
      setAudioStream(stream);
      void loadAudioDevices();
    } catch {
      setAudioStream(null);
      setError('Không thể truy cập Microphone. Vui lòng cho phép quyền truy cập micro trên trình duyệt.');
    }
  }, [selectedAudioId, loadAudioDevices]);

  // 3. Request & Manage Camera Stream
  const initVideoStream = useCallback(async () => {
    // Stop previous video track
    if (activeVideoTrackRef.current) {
      activeVideoTrackRef.current.stop();
      activeVideoTrackRef.current = null;
    }

    if (!cameraEnabled) {
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      return;
    }

    try {
      const vStream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      const track = vStream.getVideoTracks()[0];
      activeVideoTrackRef.current = track;
      if (videoRef.current) {
        videoRef.current.srcObject = new MediaStream([track]);
      }
    } catch {
      // Camera is optional; fallback gracefully
      setCameraEnabled(false);
    }
  }, [cameraEnabled]);

  useEffect(() => {
    void initAudioStream();
  }, [initAudioStream]);

  useEffect(() => {
    void initVideoStream();
    return () => {
      if (activeVideoTrackRef.current) {
        activeVideoTrackRef.current.stop();
        activeVideoTrackRef.current = null;
      }
    };
  }, [initVideoStream]);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      if (activeAudioStreamRef.current) {
        activeAudioStreamRef.current.getTracks().forEach((t) => t.stop());
        activeAudioStreamRef.current = null;
      }
      if (activeVideoTrackRef.current) {
        activeVideoTrackRef.current.stop();
        activeVideoTrackRef.current = null;
      }
    };
  }, []);

  // 4. Web Audio Analyzer for Volume and Equalizer Waveform
  useEffect(() => {
    if (!audioStream) {
      setVolume(0);
      setDbLevel(-55);
      return;
    }

    let audioContext: AudioContext | null = null;
    let animId: number | null = null;

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        audioContext = new AudioCtx();
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 128;
        analyser.smoothingTimeConstant = 0.65;

        const source = audioContext.createMediaStreamSource(audioStream);
        source.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        let lastUpdate = 0;

        const render = (timestamp: number) => {
          analyser.getByteFrequencyData(dataArray);

          let sum = 0;
          let sumSquares = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
            sumSquares += dataArray[i] * dataArray[i];
          }

          const avg = sum / dataArray.length;
          const calculatedVolume = Math.min(100, Math.round((avg / 255) * 100 * 2));

          // Calculate dB level (typical voice range -60 dB to -15 dB)
          const calculatedDb = calculatedVolume > 0
            ? Math.round(-55 + (calculatedVolume / 100) * 40)
            : -55;

          if (calculatedVolume > 12) {
            setHasDetectedVoice(true);
          }

          if (timestamp - lastUpdate >= 45) {
            lastUpdate = timestamp;
            setVolume(calculatedVolume);
            setDbLevel(calculatedDb);

            // Compute equalizer bars
            const newBars: number[] = [];
            const step = Math.max(1, Math.floor(dataArray.length / TOTAL_EQUALIZER_BARS));
            for (let b = 0; b < TOTAL_EQUALIZER_BARS; b++) {
              const val = dataArray[b * step] || 0;
              const barHeight = Math.max(4, Math.round((val / 255) * 28 + (calculatedVolume / 100) * 8));
              newBars.push(barHeight);
            }
            setBars(newBars);
          }

          animId = window.requestAnimationFrame(render);
        };

        animId = window.requestAnimationFrame(render);
      }
    } catch {
      // Fallback
    }

    return () => {
      if (animId) window.cancelAnimationFrame(animId);
      if (audioContext && audioContext.state !== 'closed') {
        audioContext.close().catch(() => {});
      }
    };
  }, [audioStream]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        borderRadius: { xs: '20px', md: '28px' },
        overflow: 'hidden',
        bgcolor: '#ffffff',
        border: '1px solid rgba(226, 232, 240, 0.9)',
        boxShadow: '0 25px 60px -15px rgba(15, 23, 42, 0.12), 0 1px 2px rgba(0, 0, 0, 0.04)',
        width: '100%',
        minHeight: { md: 620 },
      }}
    >
      {/* -- Left Column: Branded InfoHR Half (Refined Dark Slate Navy) -- */}
      <Box
        sx={{
          width: { xs: '100%', md: '40%' },
          minWidth: { md: '350px' },
          background: 'linear-gradient(165deg, #090d16 0%, #0f172a 45%, #18223c 100%)',
          color: '#ffffff',
          p: { xs: 3, sm: 3.5, md: 4 },
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: 3,
          position: 'relative',
          overflow: 'hidden',
          boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.08), inset -1px 0 0 rgba(255, 255, 255, 0.05)',
        }}
      >
        {/* Ambient Top & Bottom Tech Glows */}
        <Box
          sx={{
            position: 'absolute',
            top: -50,
            right: -50,
            width: 220,
            height: 220,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(37, 99, 235, 0.2) 0%, transparent 70%)',
            filter: 'blur(40px)',
            pointerEvents: 'none',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: -40,
            left: -40,
            width: 180,
            height: 180,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(14, 165, 233, 0.12) 0%, transparent 70%)',
            filter: 'blur(35px)',
            pointerEvents: 'none',
          }}
        />

        {/* Top InfoHR Branding & Badges */}
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Stack direction="row" alignItems="center" spacing={1.25} sx={{ mb: 2 }}>
            <Box
              component="img"
              src={IMAGES.getTextLogo('light')}
              alt="InfoHR"
              sx={{ height: 26, width: 'auto', display: 'block' }}
            />
            <Chip
              icon={
                isMock ? (
                  <AilaLogo size={14} variant="mark" />
                ) : (
                  <ApartmentOutlinedIcon sx={{ fontSize: '13px !important', color: '#93c5fd !important' }} />
                )
              }
              label={isMock ? 'AILA MOCK PRACTICE' : 'OFFICIAL INTERVIEW'}
              size="small"
              sx={{
                bgcolor: 'rgba(37, 99, 235, 0.18)',
                color: '#bfdbfe',
                fontWeight: 800,
                fontSize: '0.675rem',
                letterSpacing: '0.06em',
                height: 24,
                borderRadius: '6px',
                border: '1px solid rgba(147, 197, 253, 0.28)',
                '& .MuiChip-icon': { ml: 0.75 },
              }}
            />
          </Stack>

          <Stack direction="row" spacing={1} sx={{ mb: 2.5, flexWrap: 'wrap', gap: 0.75 }}>
            <Chip
              icon={
                isMock ? (
                  <AilaLogo size={13} variant="mark" />
                ) : (
                  <FiberManualRecordIcon sx={{ fontSize: '8px !important', color: '#60a5fa !important' }} />
                )
              }
              label={isMock ? 'LUYỆN TẬP TỰ DO' : 'PHỎNG VẤN CHÍNH THỨC'}
              size="small"
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.08)',
                color: '#f1f5f9',
                fontWeight: 700,
                fontSize: '0.6875rem',
                letterSpacing: '0.04em',
                height: 24,
                borderRadius: '9999px',
                backdropFilter: 'blur(6px)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                '& .MuiChip-icon': { ml: 0.75 },
              }}
            />
            <Chip
              icon={<FiberManualRecordIcon sx={{ fontSize: '8px !important', color: '#fbbf24 !important' }} />}
              label={difficultyLabel}
              size="small"
              sx={{
                bgcolor: 'rgba(245, 158, 11, 0.14)',
                color: '#fde68a',
                fontWeight: 700,
                fontSize: '0.6875rem',
                letterSpacing: '0.04em',
                height: 24,
                borderRadius: '9999px',
                backdropFilter: 'blur(6px)',
                border: '1px solid rgba(251, 191, 36, 0.28)',
              }}
            />
            {isMock ? (
              <Chip
                icon={<LockOutlinedIcon sx={{ fontSize: '11px !important', color: '#34d399 !important' }} />}
                label="KẾT QUẢ RIÊNG TƯ"
                size="small"
                sx={{
                  bgcolor: 'rgba(16, 185, 129, 0.14)',
                  color: '#a7f3d0',
                  fontWeight: 700,
                  fontSize: '0.6875rem',
                  letterSpacing: '0.04em',
                  height: 24,
                  borderRadius: '9999px',
                  backdropFilter: 'blur(6px)',
                  border: '1px solid rgba(52, 211, 153, 0.28)',
                }}
              />
            ) : (
              <Chip
                icon={<FiberManualRecordIcon sx={{ fontSize: '8px !important', color: '#f43f5e !important' }} />}
                label="TỰ ĐỘNG GHI HÌNH"
                size="small"
                sx={{
                  bgcolor: 'rgba(244, 63, 94, 0.14)',
                  color: '#fecdd3',
                  fontWeight: 700,
                  fontSize: '0.6875rem',
                  letterSpacing: '0.04em',
                  height: 24,
                  borderRadius: '9999px',
                  backdropFilter: 'blur(6px)',
                  border: '1px solid rgba(244, 63, 94, 0.28)',
                }}
              />
            )}
          </Stack>

          {/* Job Title & Company */}
          <Stack direction="row" spacing={1.75} alignItems="center" sx={{ mb: 3 }}>
            <Avatar
              src={isMock ? undefined : (companyLogo || undefined)}
              alt={isMock ? 'AILA AI' : companyName}
              sx={{
                width: 52,
                height: 52,
                borderRadius: '16px',
                bgcolor: isMock ? 'rgba(37, 99, 235, 0.15)' : '#0f172a',
                border: isMock ? '1.5px solid rgba(59, 130, 246, 0.4)' : '1.5px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 8px 24px -4px rgba(0, 0, 0, 0.45)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                p: isMock ? 0.5 : 0,
              }}
            >
              {isMock ? (
                <AilaLogo size={36} variant="mark" />
              ) : (
                <ApartmentOutlinedIcon sx={{ color: '#ffffff', fontSize: 26 }} />
              )}
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 800,
                  color: '#ffffff',
                  fontSize: { xs: '1.25rem', md: '1.45rem' },
                  lineHeight: 1.25,
                  letterSpacing: '-0.01em',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  wordBreak: 'break-word',
                }}
              >
                {jobTitle}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: '#94a3b8',
                  fontWeight: 600,
                  textTransform: isMock ? 'none' : 'uppercase',
                  letterSpacing: isMock ? '0.01em' : '0.04em',
                  fontSize: '0.75rem',
                  display: 'block',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {companyName}
              </Typography>
            </Box>
          </Stack>

          {/* Two Frosted Metric Cards */}
          <Stack spacing={1.5}>
            <Box
              sx={{
                p: 2,
                borderRadius: '16px',
                bgcolor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(10px)',
                transition: 'border-color 0.2s ease',
                '&:hover': {
                  borderColor: 'rgba(255, 255, 255, 0.14)',
                },
              }}
            >
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.75 }}>
                <QuizOutlinedIcon sx={{ fontSize: 15, color: '#94a3b8' }} />
                <Typography
                  sx={{
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: '#94a3b8',
                  }}
                >
                  CÂU HỎI
                </Typography>
              </Stack>
              <Typography sx={{ fontSize: '1.85rem', fontWeight: 800, color: '#ffffff', lineHeight: 1 }}>
                {questionsCount}
              </Typography>
            </Box>

            <Box
              sx={{
                p: 2,
                borderRadius: '16px',
                bgcolor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(10px)',
                transition: 'border-color 0.2s ease',
                '&:hover': {
                  borderColor: 'rgba(255, 255, 255, 0.14)',
                },
              }}
            >
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.75 }}>
                <TranslateOutlinedIcon sx={{ fontSize: 15, color: '#94a3b8' }} />
                <Typography
                  sx={{
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: '#94a3b8',
                  }}
                >
                  NGÔN NGỮ PHỎNG VẤN
                </Typography>
              </Stack>
              <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff' }}>
                VN Tiếng Việt
              </Typography>
            </Box>
          </Stack>
        </Box>

        {/* Bottom Tips Card */}
        <Box
          sx={{
            p: 2.25,
            borderRadius: '16px',
            bgcolor: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
            <LightbulbOutlinedIcon sx={{ fontSize: 17, color: '#fbbf24' }} />
            <Typography sx={{ fontWeight: 700, fontSize: '0.8125rem', color: '#f8fafc' }}>
              {isMock ? 'Mẹo luyện tập AI hiệu quả' : 'Mẹo phỏng vấn chính thức'}
            </Typography>
          </Stack>
          {isMock ? (
            <Box sx={{ color: '#cbd5e1', fontSize: '0.75rem', lineHeight: 1.65 }}>
              <div style={{ color: '#e2e8f0' }}>• Tự do luyện tập nhiều lần để rèn luyện sự tự tin</div>
              <div style={{ color: '#e2e8f0' }}>• Trả lời tự nhiên theo cấu trúc STAR: Tình huống, Nhiệm vụ, Hành động và Kết quả</div>
              <div style={{ color: '#e2e8f0' }}>• AI sẽ phân tích giọng nói, độ lưu loát và đưa ra gợi ý sau phiên</div>
              <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mt: 1.25 }}>
                <LockOutlinedIcon sx={{ fontSize: 13, color: '#34d399 !important' }} />
                <Typography sx={{ fontSize: '0.72rem', fontWeight: 600, color: '#6ee7b7 !important' }}>
                  Dữ liệu riêng tư — Kết quả không gửi cho nhà tuyển dụng
                </Typography>
              </Stack>
            </Box>
          ) : (
            <Box sx={{ color: '#cbd5e1', fontSize: '0.75rem', lineHeight: 1.65 }}>
              <div style={{ color: '#e2e8f0' }}>• Tìm không gian yên tĩnh và đủ ánh sáng</div>
              <div style={{ color: '#e2e8f0' }}>• Nói rõ ràng, tốc độ đều đặn và tự nhiên</div>
              <div style={{ color: '#e2e8f0' }}>• Sử dụng phương pháp STAR cho các câu hỏi tình huống và hành vi</div>
              <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mt: 1.25 }}>
                <FiberManualRecordIcon sx={{ fontSize: '8px', color: '#f43f5e !important' }} />
                <Typography sx={{ fontSize: '0.72rem', fontWeight: 600, color: '#fca5a5 !important' }}>
                  Cuộc họp được tự động ghi hình để Hội đồng tuyển dụng đánh giá
                </Typography>
              </Stack>
            </Box>
          )}
        </Box>
      </Box>

      {/* -- Right Column: Clean White Hardware & Testing Half ------- */}
      <Box
        sx={{
          flex: 1,
          p: { xs: 3, sm: 3.5, md: 4 },
          bgcolor: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: 2.5,
        }}
      >
        {/* Error Notification if mic is blocked */}
        {error && (
          <Alert
            severity="error"
            action={
              <Button
                color="inherit"
                size="small"
                startIcon={<RefreshOutlinedIcon />}
                onClick={() => void initAudioStream()}
                sx={{ textTransform: 'none', fontWeight: 700 }}
              >
                Thử lại
              </Button>
            }
            sx={{ borderRadius: '12px' }}
          >
            {error}
          </Alert>
        )}

        {/* 1. Camera Video Preview Box */}
        <Box
          sx={{
            width: '100%',
            aspectRatio: '16/9',
            maxHeight: { xs: 210, sm: 250, md: 280 },
            bgcolor: '#0f172a',
            borderRadius: '16px',
            overflow: 'hidden',
            position: 'relative',
            boxShadow: '0 4px 20px rgba(15, 23, 42, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {cameraEnabled ? (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transform: 'scaleX(-1)',
                }}
              />
              <Chip
                icon={<FiberManualRecordIcon sx={{ fontSize: '9px !important', color: '#22c55e !important' }} />}
                label="Preview"
                size="small"
                sx={{
                  position: 'absolute',
                  top: 12,
                  right: 12,
                  bgcolor: 'rgba(15, 23, 42, 0.65)',
                  color: '#ffffff',
                  backdropFilter: 'blur(6px)',
                  fontWeight: 700,
                  fontSize: '0.7rem',
                  height: 24,
                  borderRadius: '6px',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                }}
              />
            </>
          ) : (
            <Stack alignItems="center" spacing={1} sx={{ color: '#94a3b8' }}>
              <VideocamOffOutlinedIcon sx={{ fontSize: 44, color: '#64748b' }} />
              <Typography variant="caption" sx={{ fontWeight: 600, color: '#94a3b8', fontSize: '0.8rem' }}>
                Camera đang tắt — Có thể bật ở bên dưới
              </Typography>
            </Stack>
          )}
        </Box>

        {/* 2. Device Controls: Select Micro & Toggle Camera */}
        <Grid container spacing={2}>
          {/* Micro Selection */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <Box
              sx={{
                p: 1.5,
                borderRadius: '14px',
                border: '1px solid #e2e8f0',
                bgcolor: '#f8fafc',
                height: '100%',
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 700,
                  fontSize: '0.6875rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  color: '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  mb: 1,
                }}
              >
                <MicOutlinedIcon sx={{ fontSize: 15, color: '#2563eb' }} />
                Chọn Micro
              </Typography>
              <FormControl fullWidth size="small">
                <Select
                  value={selectedAudioId}
                  onChange={(e) => setSelectedAudioId(e.target.value)}
                  displayEmpty
                  sx={{
                    bgcolor: '#ffffff',
                    borderRadius: '10px',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#e2e8f0',
                    },
                  }}
                >
                  {audioDevices.length > 0 ? (
                    audioDevices.map((dev) => (
                      <MenuItem key={dev.deviceId} value={dev.deviceId} sx={{ fontSize: '0.8125rem' }}>
                        {dev.label || `Microphone · ${dev.deviceId.slice(0, 6)}...`}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem value="" sx={{ fontSize: '0.8125rem' }}>
                      Micro mặc định của hệ thống
                    </MenuItem>
                  )}
                </Select>
              </FormControl>
            </Box>
          </Grid>

          {/* Camera Toggle */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <Box
              sx={{
                p: 1.5,
                borderRadius: '14px',
                border: '1px solid #e2e8f0',
                bgcolor: '#f8fafc',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 700,
                  fontSize: '0.6875rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  color: '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  mb: 1,
                }}
              >
                <VideocamOutlinedIcon sx={{ fontSize: 16, color: '#2563eb' }} />
                Camera
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  bgcolor: '#ffffff',
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0',
                  px: 1.5,
                  py: 0.6,
                }}
              >
                <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: '#334155' }}>
                  Bật ghi hình
                </Typography>
                <Switch
                  checked={cameraEnabled}
                  onChange={(e) => setCameraEnabled(e.target.checked)}
                  size="small"
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: '#2563eb',
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      backgroundColor: '#2563eb',
                    },
                  }}
                />
              </Box>
            </Box>
          </Grid>
        </Grid>

        {/* 3. Audio Equalizer Waveform & dB Meter */}
        <Box sx={{ p: 2, borderRadius: '16px', bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
          {/* Status Indicator */}
          <Stack direction="row" spacing={1} alignItems="center" justifyContent="center" sx={{ mb: 1.5 }}>
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: volume > 10 ? '#16a34a' : '#2563eb',
                boxShadow: volume > 10 ? '0 0 10px #16a34a' : 'none',
              }}
            />
            <Typography
              variant="caption"
              sx={{
                fontWeight: 600,
                color: volume > 10 ? '#16a34a' : '#475569',
                fontSize: '0.75rem',
              }}
            >
              {volume > 10 ? 'Đang nhận tín hiệu giọng nói — Rất tốt!' : 'Đang nghe — Hãy nói để kiểm tra'}
            </Typography>
          </Stack>

          {/* Dynamic Equalizer Bar Waveform */}
          <Stack
            direction="row"
            spacing={0.5}
            alignItems="center"
            justifyContent="center"
            sx={{
              height: 38,
              mb: 1.5,
              px: 1,
            }}
          >
            {bars.map((barVal, i) => {
              const height = Math.max(4, Math.min(32, Math.round(barVal)));
              const isActive = volume > 8;
              return (
                <Box
                  key={i}
                  sx={{
                    width: 4,
                    height: `${height}px`,
                    borderRadius: '2px',
                    bgcolor: isActive ? '#2563eb' : '#cbd5e1',
                    transition: 'height 0.05s ease, background-color 0.1s ease',
                  }}
                />
              );
            })}
          </Stack>

          {/* Volume Meter & dB Display */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.75 }}>
            <Typography
              variant="caption"
              sx={{ fontSize: '0.6875rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}
            >
              Kiểm tra âm thanh
            </Typography>
            <Typography
              variant="caption"
              sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#334155', fontFamily: 'var(--font-mono)' }}
            >
              {dbLevel} dB
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={volume}
            sx={{
              height: 5,
              borderRadius: 3,
              bgcolor: '#e2e8f0',
              '& .MuiLinearProgress-bar': {
                bgcolor: volume > 60 ? '#16a34a' : '#2563eb',
                borderRadius: 3,
              },
            }}
          />
        </Box>

        {/* 4. Action Footer Buttons */}
        <Box>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Button
              onClick={onCancel}
              disabled={starting}
              variant="outlined"
              startIcon={<ArrowBackOutlinedIcon />}
              sx={{
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.875rem',
                borderColor: '#e2e8f0',
                color: '#475569',
                px: 2.5,
                py: 1.25,
                '&:hover': {
                  borderColor: '#cbd5e1',
                  bgcolor: '#f1f5f9',
                },
              }}
            >
              Quay lại
            </Button>

            <Button
              onClick={onJoin}
              disabled={starting || !audioStream || !!error}
              variant="contained"
              startIcon={hasDetectedVoice && isMock ? <AilaLogo size={16} variant="mark" /> : undefined}
              endIcon={hasDetectedVoice ? <ArrowForwardOutlinedIcon /> : <GraphicEqOutlinedIcon />}
              sx={{
                flex: 1,
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 700,
                fontSize: '0.875rem',
                py: 1.25,
                px: 3,
                bgcolor: '#2563eb',
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)',
                '&:hover': {
                  bgcolor: '#1d4ed8',
                },
              }}
            >
              {starting ? (
                <CircularProgress size={20} color="inherit" />
              ) : hasDetectedVoice ? (
                isMock ? 'Bắt đầu luyện tập cùng AILA' : 'Vào phòng phỏng vấn cùng NTD'
              ) : (
                'Đang chờ âm thanh...'
              )}
            </Button>
          </Stack>

          {error && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
              <Button
                onClick={onJoin}
                variant="outlined"
                color="inherit"
                size="small"
                sx={{
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  borderColor: '#cbd5e1',
                  color: '#64748b',
                  '&:hover': { bgcolor: '#f8fafc', borderColor: '#94a3b8' },
                }}
              >
                {isMock ? 'Bỏ qua kiểm tra & Vào luyện tập' : 'Bỏ qua kiểm tra & Vào phòng phỏng vấn'}
              </Button>
            </Box>
          )}

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 0.75,
              mt: 1.25,
            }}
          >
            {hasDetectedVoice ? (
              <>
                <CheckCircleOutlineIcon sx={{ fontSize: 16, color: '#16a34a' }} />
                <Typography
                  variant="caption"
                  sx={{
                    color: '#16a34a',
                    fontSize: '0.725rem',
                    fontWeight: 600,
                  }}
                >
                  Micro đã xác nhận thành công. Bạn có thể bắt đầu ngay!
                </Typography>
              </>
            ) : (
              <Typography
                variant="caption"
                sx={{
                  color: '#94a3b8',
                  fontSize: '0.725rem',
                }}
              >
                Hãy nói gì đó để kiểm tra âm thanh micro
              </Typography>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default PreflightRoom;
