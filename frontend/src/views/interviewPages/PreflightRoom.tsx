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
  onJoin: (config?: { cameraEnabled?: boolean; audioDeviceId?: string; videoDeviceId?: string }) => void;
  onCancel: () => void;
  starting: boolean;
  session?: InterviewSession | null;
}

interface AudioDeviceOption {
  deviceId: string;
  label: string;
}

interface VideoDeviceOption {
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
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const [audioDevices, setAudioDevices] = useState<AudioDeviceOption[]>([]);
  const [selectedAudioId, setSelectedAudioId] = useState<string>('');
  const [videoDevices, setVideoDevices] = useState<VideoDeviceOption[]>([]);
  const [selectedVideoId, setSelectedVideoId] = useState<string>('');
  const [cameraEnabled, setCameraEnabled] = useState<boolean>(true);
  const [cameraLoading, setCameraLoading] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [volume, setVolume] = useState<number>(0);
  const [dbLevel, setDbLevel] = useState<number>(-55);
  const [hasDetectedVoice, setHasDetectedVoice] = useState<boolean>(false);
  const [bars, setBars] = useState<number[]>(() =>
    Array.from({ length: TOTAL_EQUALIZER_BARS }, () => 4)
  );
  const [tipsExpanded, setTipsExpanded] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const activeVideoTrackRef = useRef<MediaStreamTrack | null>(null);
  const activeVideoStreamRef = useRef<MediaStream | null>(null);
  const activeAudioStreamRef = useRef<MediaStream | null>(null);
  const videoRequestSeqRef = useRef<number>(0);

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

  // 1. Enumerate Audio & Video Devices
  const loadMediaDevices = useCallback(async () => {
    try {
      if (typeof navigator === 'undefined' || !navigator.mediaDevices?.enumerateDevices) return;
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

      const videoInputs = devices
        .filter((d) => d.kind === 'videoinput')
        .map((d, index) => ({
          deviceId: d.deviceId,
          label: d.label || `Camera ${index + 1}`,
        }));
      setVideoDevices(videoInputs);
      if (videoInputs.length > 0 && !selectedVideoId) {
        setSelectedVideoId(videoInputs[0].deviceId);
      }
    } catch {
      // Ignore enumeration failure
    }
  }, [selectedAudioId, selectedVideoId]);

  // 2. Request & Manage Microphone Stream
  const initAudioStream = useCallback(async () => {
    setError('');

    // Stop previous audio tracks
    if (activeAudioStreamRef.current) {
      try {
        activeAudioStreamRef.current.getTracks?.().forEach((track) => track.stop());
      } catch {}
      activeAudioStreamRef.current = null;
    }

    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setAudioStream(null);
      setError('Trình duyệt không hỗ trợ truy cập thiết bị âm thanh hoặc kết nối không an toàn (yêu cầu HTTPS).');
      return;
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
      void loadMediaDevices();
    } catch {
      setAudioStream(null);
      setError('Không thể truy cập Microphone. Vui lòng cho phép quyền truy cập micro trên trình duyệt.');
    }
  }, [selectedAudioId, loadMediaDevices]);

  // 3. Request & Manage Camera Stream
  const initVideoStream = useCallback(async () => {
    const seq = ++videoRequestSeqRef.current;

    // Dọn dẹp triệt để stream cũ và các tracks để giải phóng camera UVC hoàn toàn
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    if (activeVideoStreamRef.current) {
      try {
        activeVideoStreamRef.current.getTracks().forEach((t) => {
          try {
            t.stop();
          } catch {}
        });
      } catch {}
      activeVideoStreamRef.current = null;
    }
    if (activeVideoTrackRef.current) {
      try {
        activeVideoTrackRef.current.stop();
      } catch {}
        activeVideoTrackRef.current = null;
    }

    if (!cameraEnabled) {
      if (seq === videoRequestSeqRef.current) {
        setVideoStream(null);
        setCameraError('');
        setCameraLoading(false);
      }
      return;
    }

    setCameraLoading(true);
    setCameraError('');

    // Chờ 350ms để Windows DirectShow/UVC hardware driver giải phóng webcam USB hoàn toàn trước khi gọi lại
    await new Promise((r) => setTimeout(r, 350));
    if (seq !== videoRequestSeqRef.current) return;

    try {
      let vStream: MediaStream | null = null;
      // Dùng constraint { ideal: id } để Windows Driver tự điều phối mượt mà, tránh lỗi OverconstrainedError gây đen màn
      const baseConstraints: MediaTrackConstraints = selectedVideoId
        ? { deviceId: { ideal: selectedVideoId } }
        : {};

      // Helper request getUserMedia có retry tự động khi gặp NotReadableError (device in use)
      const fetchMediaWithRetry = async (constraints: MediaStreamConstraints, retries = 3): Promise<MediaStream> => {
        if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
          throw new Error('Webcam API không khả dụng hoặc kết nối không an toàn (yêu cầu HTTPS).');
        }
        try {
          return await navigator.mediaDevices.getUserMedia(constraints);
        } catch (mErr: any) {
          const errName = mErr?.name || '';
          const errMsg = (mErr?.message || '').toLowerCase();
          if (
            retries > 0 &&
            (errName === 'NotReadableError' || errMsg.includes('device in use') || errMsg.includes('could not start'))
          ) {
            await new Promise((r) => setTimeout(r, 400));
            if (seq !== videoRequestSeqRef.current) throw new Error('Camera request superseded');
            return fetchMediaWithRetry(constraints, retries - 1);
          }
          throw mErr;
        }
      };

      try {
        // Preferred high quality constraint (1280x720) với ideal deviceId
        vStream = await fetchMediaWithRetry({
          video: {
            ...baseConstraints,
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
      } catch (firstErr: any) {
        if (seq !== videoRequestSeqRef.current) return;
        // Fallback 1: Thử basic constraint
        try {
          vStream = await fetchMediaWithRetry({
            video: baseConstraints.deviceId ? baseConstraints : true,
            audio: false,
          });
        } catch {
          // Fallback 2: Tối hậu thư mở camera mặc định
          try {
            vStream = await fetchMediaWithRetry({
              video: true,
              audio: false,
            });
          } catch {
            throw firstErr;
          }
        }
      }

      if (seq !== videoRequestSeqRef.current) {
        if (vStream) {
          vStream.getTracks?.().forEach((t) => t.stop());
        }
        return;
      }

      if (!vStream) {
        throw new Error('No video stream returned');
      }

      const track = vStream.getVideoTracks?.()?.[0];
      if (!track) {
        throw new Error('No video track available');
      }

      track.onended = () => {
        console.warn('[PreflightRoom] Video track ended by hardware/browser');
        if (seq === videoRequestSeqRef.current) {
          setVideoStream(null);
        }
      };

      activeVideoStreamRef.current = vStream;
      activeVideoTrackRef.current = track;
      setVideoStream(vStream);
      setCameraError('');

      // Gắn và phát ngay lập tức trên videoRef
      const playVideo = () => {
        if (videoRef.current && videoRef.current.srcObject === vStream) {
          videoRef.current.play().catch(() => {});
        }
      };

      if (videoRef.current) {
        videoRef.current.srcObject = vStream;
        playVideo();
      }

      // Trên Windows DirectShow, track có thể bị muted trong vài frame đầu; unmute đảm bảo video play ngay
      track.addEventListener('unmute', playVideo, { once: true });

      void loadMediaDevices();
    } catch (err: any) {
      if (seq !== videoRequestSeqRef.current) return;
      setVideoStream(null);

      let errorMsg = 'Không thể kết nối với Camera. Vui lòng thử lại.';
      const errName = err?.name || '';
      const errMsg = (err?.message || '').toLowerCase();

      if (
        errName === 'NotReadableError' ||
        errMsg.includes('device in use') ||
        errMsg.includes('could not start') ||
        errMsg.includes('concurrent')
      ) {
        errorMsg = 'Camera đang bị ứng dụng khác (Zoom, Teams, OBS hoặc tab khác) sử dụng. Vui lòng đóng ứng dụng đó và nhấn "Thử lại".';
      } else if (errName === 'NotAllowedError' || errName === 'PermissionDeniedError') {
        errorMsg = 'Trình duyệt chưa được cấp quyền truy cập Camera. Vui lòng nhấn vào biểu tượng ổ khóa/camera trên thanh địa chỉ để cấp quyền.';
      } else if (errName === 'NotFoundError' || errName === 'DevicesNotFoundError') {
        errorMsg = 'Không tìm thấy thiết bị Camera nào được kết nối với máy tính.';
      } else if (errName === 'OverconstrainedError') {
        errorMsg = 'Độ phân giải camera không tương thích. Vui lòng nhấn "Thử lại".';
      }

      setCameraError(errorMsg);
    } finally {
      if (seq === videoRequestSeqRef.current) {
        setCameraLoading(false);
      }
    }
  }, [cameraEnabled, selectedVideoId, loadMediaDevices]);

  // Luôn gắn videoStream an toàn vào videoRef.current mà không phụ thuộc vào chu kỳ render
  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl) return;
    if (cameraEnabled && videoStream) {
      if (videoEl.srcObject !== videoStream) {
        videoEl.srcObject = videoStream;
      }
      videoEl.play().catch((playErr) => {
        console.warn('[PreflightRoom] video play error:', playErr);
      });
      const track = videoStream.getVideoTracks?.()?.[0];
      if (track) {
        track.addEventListener('unmute', () => {
          videoEl.play().catch(() => {});
        }, { once: true });
      }
    } else {
      videoEl.srcObject = null;
    }
  }, [videoStream, cameraEnabled]);

  useEffect(() => {
    void initAudioStream();
  }, [initAudioStream]);

  useEffect(() => {
    void initVideoStream();
    return () => {
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      if (activeVideoTrackRef.current) {
        activeVideoTrackRef.current.stop();
        activeVideoTrackRef.current = null;
      }
      if (activeVideoStreamRef.current) {
        activeVideoStreamRef.current.getTracks().forEach((t) => t.stop());
        activeVideoStreamRef.current = null;
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
      if (activeVideoStreamRef.current) {
        activeVideoStreamRef.current.getTracks().forEach((t) => t.stop());
        activeVideoStreamRef.current = null;
      }
      if (activeVideoTrackRef.current) {
        activeVideoTrackRef.current.stop();
        activeVideoTrackRef.current = null;
      }
    };
  }, []);

  // Giải phóng phần cứng camera & micro trước khi chuyển phòng
  const handleJoin = useCallback(async () => {
    if (activeVideoStreamRef.current) {
      try {
        activeVideoStreamRef.current.getTracks().forEach((track) => track.stop());
      } catch {}
      activeVideoStreamRef.current = null;
    }
    if (activeVideoTrackRef.current) {
      try {
        activeVideoTrackRef.current.stop();
      } catch {}
      activeVideoTrackRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setVideoStream(null);
    if (activeAudioStreamRef.current) {
      try {
        activeAudioStreamRef.current.getTracks().forEach((track) => track.stop());
      } catch {}
      activeAudioStreamRef.current = null;
    }
    setAudioStream(null);

    // Chờ 350ms để Windows DirectShow/UVC giải phóng hoàn toàn camera trước khi LiveKitRoom kết nối
    await new Promise((r) => setTimeout(r, 350));

    onJoin({
      cameraEnabled: cameraEnabled && !cameraError,
      audioDeviceId: selectedAudioId || undefined,
      videoDeviceId: selectedVideoId || undefined,
    });
  }, [onJoin, cameraEnabled, cameraError, selectedAudioId, selectedVideoId]);

  // 4. Web Audio Analyzer for Volume and Equalizer Waveform
  useEffect(() => {
    if (!audioStream) {
      setVolume(0);
      setDbLevel(-55);
      return;
    }

    let audioContext: AudioContext | null = null;
    let animId: number | null = null;

    if (typeof window === 'undefined') return;

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
          p: { xs: 2, sm: 3, md: 4 },
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: { xs: 2, md: 3 },
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
          <Stack direction="row" alignItems="center" spacing={1.25} sx={{ mb: 1.5 }}>
            <Box
              component="img"
              src={IMAGES.getTextLogo('light')}
              alt="InfoHR"
              sx={{ height: 24, width: 'auto', display: 'block' }}
            />
            <Chip
              icon={
                isMock ? (
                  <AilaLogo size={14} variant="mark" />
                ) : (
                  <ApartmentOutlinedIcon sx={{ fontSize: '13px !important', color: '#93c5fd !important' }} />
                )
              }
              label={isMock ? 'AILA MOCK' : 'OFFICIAL INTERVIEW'}
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

          <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', gap: 0.75 }}>
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
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: { xs: 2, md: 3 } }}>
            <Avatar
              src={isMock ? undefined : (companyLogo || undefined)}
              alt={isMock ? 'AILA AI' : companyName}
              sx={{
                width: { xs: 44, md: 52 },
                height: { xs: 44, md: 52 },
                borderRadius: '14px',
                bgcolor: isMock ? 'rgba(37, 99, 235, 0.15)' : '#0f172a',
                border: isMock ? '1.5px solid rgba(59, 130, 246, 0.4)' : '1.5px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 8px 24px -4px rgba(0, 0, 0, 0.45)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                p: isMock ? 0.5 : 0,
                flexShrink: 0,
              }}
            >
              {isMock ? (
                <AilaLogo size={30} variant="mark" />
              ) : (
                <ApartmentOutlinedIcon sx={{ color: '#ffffff', fontSize: 24 }} />
              )}
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 800,
                  color: '#ffffff',
                  fontSize: { xs: '1.1rem', md: '1.45rem' },
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
                  fontSize: '0.725rem',
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

          {/* Two Frosted Metric Cards: Side-by-side on mobile, stacked on desktop */}
          <Stack direction={{ xs: 'row', md: 'column' }} spacing={{ xs: 1, md: 1.5 }}>
            <Box
              sx={{
                flex: 1,
                p: { xs: 1.25, md: 2 },
                borderRadius: '14px',
                bgcolor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(10px)',
                transition: 'border-color 0.2s ease',
                '&:hover': {
                  borderColor: 'rgba(255, 255, 255, 0.14)',
                },
              }}
            >
              <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mb: 0.5 }}>
                <QuizOutlinedIcon sx={{ fontSize: 14, color: '#94a3b8' }} />
                <Typography
                  sx={{
                    fontSize: '0.625rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: '#94a3b8',
                  }}
                >
                  CÂU HỎI
                </Typography>
              </Stack>
              <Typography sx={{ fontSize: { xs: '1.35rem', md: '1.85rem' }, fontWeight: 800, color: '#ffffff', lineHeight: 1 }}>
                {questionsCount}
              </Typography>
            </Box>

            <Box
              sx={{
                flex: 1,
                p: { xs: 1.25, md: 2 },
                borderRadius: '14px',
                bgcolor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(10px)',
                transition: 'border-color 0.2s ease',
                '&:hover': {
                  borderColor: 'rgba(255, 255, 255, 0.14)',
                },
              }}
            >
              <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mb: 0.5 }}>
                <TranslateOutlinedIcon sx={{ fontSize: 14, color: '#94a3b8' }} />
                <Typography
                  sx={{
                    fontSize: '0.625rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: '#94a3b8',
                  }}
                >
                  NGÔN NGỮ
                </Typography>
              </Stack>
              <Typography sx={{ fontSize: { xs: '0.8125rem', md: '1rem' }, fontWeight: 700, color: '#ffffff' }}>
                VN Tiếng Việt
              </Typography>
            </Box>
          </Stack>
        </Box>

        {/* Bottom Tips Card: Collapsible on mobile to avoid pushing camera off screen */}
        <Box
          sx={{
            p: { xs: 1.5, md: 2.25 },
            borderRadius: '16px',
            bgcolor: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            justifyContent="space-between"
            onClick={() => setTipsExpanded((prev) => !prev)}
            sx={{ cursor: { xs: 'pointer', md: 'default' } }}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <LightbulbOutlinedIcon sx={{ fontSize: 17, color: '#fbbf24' }} />
              <Typography sx={{ fontWeight: 700, fontSize: '0.8125rem', color: '#f8fafc' }}>
                {isMock ? 'Mẹo luyện tập AI hiệu quả' : 'Mẹo phỏng vấn chính thức'}
              </Typography>
            </Stack>
            <Box
              component="span"
              sx={{
                display: { xs: 'inline-flex', md: 'none' },
                color: '#60a5fa',
                fontSize: '0.7rem',
                fontWeight: 700,
              }}
            >
              {tipsExpanded ? 'Thu gọn' : 'Xem mẹo'}
            </Box>
          </Stack>

          <Box sx={{ display: { xs: tipsExpanded ? 'block' : 'none', md: 'block' }, mt: 1.25 }}>
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
      </Box>

      {/* -- Right Column: Clean White Hardware & Testing Half ------- */}
      <Box
        sx={{
          flex: 1,
          p: { xs: 2, sm: 3, md: 4 },
          bgcolor: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: { xs: 2, md: 2.5 },
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
            maxHeight: { xs: 190, sm: 240, md: 280 },
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
          {cameraError ? (
            <Stack
              alignItems="center"
              spacing={1.25}
              sx={{ px: 3, textAlign: 'center', color: '#f87171' }}
            >
              <VideocamOffOutlinedIcon sx={{ fontSize: 38, color: '#f87171' }} />
              <Typography
                variant="body2"
                sx={{ fontWeight: 600, color: '#fecaca', fontSize: '0.8rem', maxWidth: 420, lineHeight: 1.5 }}
              >
                {cameraError}
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                <Button
                  size="small"
                  variant="contained"
                  color="error"
                  startIcon={<RefreshOutlinedIcon />}
                  onClick={() => void initVideoStream()}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 700,
                    borderRadius: '8px',
                    fontSize: '0.75rem',
                    bgcolor: '#e11d48',
                    '&:hover': { bgcolor: '#be123c' },
                  }}
                >
                  Thử lại
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => {
                    setCameraEnabled(false);
                    setCameraError('');
                  }}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 600,
                    borderRadius: '8px',
                    fontSize: '0.75rem',
                    borderColor: 'rgba(255,255,255,0.2)',
                    color: '#e2e8f0',
                    '&:hover': {
                      borderColor: 'rgba(255,255,255,0.4)',
                      bgcolor: 'rgba(255,255,255,0.05)',
                    },
                  }}
                >
                  Tắt camera & tiếp tục
                </Button>
              </Stack>
            </Stack>
          ) : cameraEnabled ? (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                onLoadedMetadata={() => {
                  videoRef.current?.play().catch(() => {});
                }}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transform: 'scaleX(-1)',
                }}
              />
              {cameraLoading && (
                <Stack
                  alignItems="center"
                  justifyContent="center"
                  spacing={1}
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    bgcolor: 'rgba(15, 23, 42, 0.72)',
                    backdropFilter: 'blur(4px)',
                    zIndex: 10,
                    color: '#94a3b8',
                  }}
                >
                  <CircularProgress size={28} sx={{ color: '#38bdf8' }} />
                  <Typography variant="caption" sx={{ fontWeight: 600, color: '#94a3b8', fontSize: '0.8rem' }}>
                    Đang kết nối camera...
                  </Typography>
                </Stack>
              )}
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
                  zIndex: 11,
                }}
              />
            </>
          ) : (
            <Stack alignItems="center" spacing={1} sx={{ color: '#94a3b8' }}>
              <VideocamOffOutlinedIcon sx={{ fontSize: 44, color: '#64748b' }} />
              <Typography variant="caption" sx={{ fontWeight: 600, color: '#94a3b8', fontSize: '0.8rem' }}>
                Camera đang tắt — Có thể bật ở bên dưới
              </Typography>
              <Button
                size="small"
                variant="outlined"
                onClick={() => {
                  setCameraEnabled(true);
                  setCameraError('');
                }}
                sx={{
                  mt: 0.5,
                  textTransform: 'none',
                  fontWeight: 600,
                  borderRadius: '8px',
                  fontSize: '0.75rem',
                  borderColor: 'rgba(255,255,255,0.2)',
                  color: '#e2e8f0',
                  '&:hover': {
                    borderColor: 'rgba(255,255,255,0.4)',
                    bgcolor: 'rgba(255,255,255,0.05)',
                  },
                }}
              >
                Bật Camera
              </Button>
            </Stack>
          )}
        </Box>

        {/* 2. Device Controls: Select Micro & Toggle Camera */}
        <Grid container spacing={1.5}>
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
                    fontSize: { xs: '0.875rem', sm: '0.8125rem' },
                    fontWeight: 600,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#e2e8f0',
                    },
                  }}
                >
                  {audioDevices.length > 0 ? (
                    audioDevices.map((dev) => (
                      <MenuItem key={dev.deviceId} value={dev.deviceId} sx={{ fontSize: '0.8125rem' }}>
                        {dev.label || `Microphone · ${(dev.deviceId || '').slice(0, 6)}...`}
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

          {/* Camera Selection & Toggle */}
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
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
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
                  }}
                >
                  <VideocamOutlinedIcon sx={{ fontSize: 16, color: '#2563eb' }} />
                  Camera
                </Typography>
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <Typography
                    sx={{
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      color: cameraEnabled ? '#2563eb' : '#94a3b8',
                    }}
                  >
                    {cameraEnabled ? 'Bật' : 'Tắt'}
                  </Typography>
                  <Switch
                    checked={cameraEnabled}
                    onChange={(e) => {
                      setCameraEnabled(e.target.checked);
                      if (e.target.checked) setCameraError('');
                    }}
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
                </Stack>
              </Box>
              <FormControl fullWidth size="small" disabled={!cameraEnabled}>
                <Select
                  value={selectedVideoId}
                  onChange={(e) => setSelectedVideoId(e.target.value)}
                  displayEmpty
                  sx={{
                    bgcolor: cameraEnabled ? '#ffffff' : '#f1f5f9',
                    borderRadius: '10px',
                    fontSize: { xs: '0.875rem', sm: '0.8125rem' },
                    fontWeight: 600,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#e2e8f0',
                    },
                  }}
                >
                  {videoDevices.length > 0 ? (
                    videoDevices.map((dev) => (
                      <MenuItem key={dev.deviceId} value={dev.deviceId} sx={{ fontSize: '0.8125rem' }}>
                        {dev.label || `Camera · ${(dev.deviceId || '').slice(0, 6)}...`}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem value="" sx={{ fontSize: '0.8125rem' }}>
                      Camera mặc định của hệ thống
                    </MenuItem>
                  )}
                </Select>
              </FormControl>
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
                fontSize: { xs: '0.72rem', sm: '0.75rem' },
                textAlign: 'center',
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
              overflow: 'hidden',
            }}
          >
            {bars.map((barVal, i) => {
              const height = Math.max(4, Math.min(32, Math.round(barVal)));
              const isActive = volume > 8;
              return (
                <Box
                  key={i}
                  sx={{
                    width: { xs: 3, sm: 4 },
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

        {/* 4. Action Footer Buttons - Sticky on mobile with safe area */}
        <Box
          sx={{
            position: { xs: 'sticky', md: 'static' },
            bottom: { xs: 0, md: 'auto' },
            bgcolor: { xs: 'rgba(255, 255, 255, 0.96)', md: 'transparent' },
            backdropFilter: { xs: 'blur(12px)', md: 'none' },
            pt: { xs: 1.5, md: 0 },
            pb: { xs: 'max(0.5rem, env(safe-area-inset-bottom))', md: 0 },
            zIndex: 10,
          }}
        >
          <Stack direction="row" spacing={1.25} alignItems="center">
            <Button
              onClick={onCancel}
              disabled={starting}
              variant="outlined"
              startIcon={<ArrowBackOutlinedIcon sx={{ fontSize: { xs: 16, sm: 20 } }} />}
              sx={{
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 600,
                fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                borderColor: '#e2e8f0',
                color: '#475569',
                px: { xs: 1.75, sm: 2.5 },
                py: { xs: 1, sm: 1.25 },
                minHeight: 44,
                '&:hover': {
                  borderColor: '#cbd5e1',
                  bgcolor: '#f1f5f9',
                },
              }}
            >
              Quay lại
            </Button>

            <Button
              onClick={handleJoin}
              data-testid="join-interview-room-btn"
              disabled={starting || !audioStream || !!error}
              variant="contained"
              startIcon={hasDetectedVoice && isMock ? <AilaLogo size={16} variant="mark" /> : undefined}
              endIcon={hasDetectedVoice ? <ArrowForwardOutlinedIcon sx={{ fontSize: { xs: 16, sm: 20 } }} /> : <GraphicEqOutlinedIcon sx={{ fontSize: { xs: 16, sm: 20 } }} />}
              sx={{
                flex: 1,
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 700,
                fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                py: { xs: 1, sm: 1.25 },
                px: { xs: 2, sm: 3 },
                minHeight: 44,
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
                onClick={handleJoin}
                data-testid="skip-check-and-join-btn"
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
