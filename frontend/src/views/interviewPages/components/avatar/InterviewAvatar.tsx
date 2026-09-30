'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Box, Typography } from '@mui/material';
import type { AgentState } from '@livekit/components-react';
import { useMaybeRoomContext } from '@livekit/components-react';
import { RoomEvent } from 'livekit-client';
import {
  type AvatarAction,
  resolveAvatarState,
  resolveActionVideoUrl,
  AVATAR_STATE_META,
} from './avatarStates';
import { useAvatarState } from './AvatarStateController';
import { LiveAudioVisualizerBar } from '../LiveAudioVisualizerBar';
import { useLiveAudioTrackAnalyzer } from '../../hooks/useLiveAudioTrackAnalyzer';
import { isLiveKitAgentParticipant, isLiveKitAgentIdentity } from '../../livekitParticipant';
import styles from './InterviewAvatarVideo.module.css';

export interface InterviewAvatarProps {
  audioTrack?: unknown;
  voiceAssistantState?: AgentState;
  isSpeakingHint?: boolean;
  sessionStatus?: string;
  interviewerName?: string;
  avatarId?: string;
  avatarImageUrl?: string | null;
  avatarBackgroundUrl?: string | null;
  avatarBackdrop?: string | null;
  className?: string;

  // Thuoc tinh Talking Head va Dual-buffering video
  characterId?: string;
  avatarActions?: Record<string, string>;
  videoUrl?: string | null;
  loopVideoUrl?: string | null;
  lipsyncVideoUrl?: string | null;
  speakVideoUrl?: string | null;
  actionHint?: string | null;
  onLipsyncEnded?: () => void;
  isPip?: boolean;
  room?: any;
}

export const AVATAR_ACTION_VERSION = '20260923_v2_lipsync';

export function withVersion(url?: string | null): string {
  if (!url) return '';
  // Video MP4 sinh động lipsync đã có mã băm nội dung trong tên file (lipsync_hash.mp4).
  // Tuyệt đối không thêm tham số query (?v=) để tránh Chrome phát sinh lỗi net::ERR_CACHE_OPERATION_NOT_SUPPORTED
  if (url.includes('/talking-head/record/') || url.includes('/record/') || url.includes('lipsync_')) {
    return url;
  }
  return url.includes('?') ? url : `${url}?v=${AVATAR_ACTION_VERSION}`;
}

/**
 * Trinh chieu Nguoi ao Tuyet dung AI Dual-Buffering 0-frame den.
 * Ket hop 2 the video long nhau crossfade 0.12s voi May trang thai cu chi
 * wave -> idle -> nod -> thinking -> speaking -> thanks_wave.
 */
export function InterviewAvatar({
  audioTrack,
  voiceAssistantState,
  isSpeakingHint = false,
  sessionStatus,
  interviewerName = 'Trợ lý AI AILA',
  avatarId,
  avatarImageUrl,
  avatarBackgroundUrl,
  avatarBackdrop = 'modern_office',
  className = '',
  characterId = 'ng_c_linh',
  avatarActions,
  videoUrl,
  loopVideoUrl,
  lipsyncVideoUrl,
  speakVideoUrl,
  actionHint,
  onLipsyncEnded,
  isPip = false,
  room: propRoom,
}: InterviewAvatarProps) {
  const isCustomUploadedImage = Boolean(
    avatarImageUrl &&
    !avatarImageUrl.includes('/assets/images/avatar/') &&
    avatarId !== 'expert_male' &&
    avatarId !== 'aila_recruiter'
  );

  const effectiveAvatarId = avatarId || (avatarImageUrl?.includes('expert_male') ? 'expert_male' : 'aila_recruiter');

  // Đơn giản hóa: Phần phỏng vấn chỉ cần 1 video loop cho nhân vật, không cần cử chỉ phức tạp
  // Máy trạng thái cử chỉ video (wave, nod, thinking, thanks_wave) đã tinh giản thành 1 video loop liên tục (mặc định idle)
  const [currentAction, setCurrentAction] = useState<AvatarAction>('idle');
  const [isSpeakActive, setIsSpeakActive] = useState(false);
  const [activeLipsyncUrl, setActiveLipsyncUrl] = useState<string | null>(lipsyncVideoUrl || speakVideoUrl || null);

  const idleVideoRef = useRef<HTMLVideoElement | null>(null);
  const speakVideoRef = useRef<HTMLVideoElement | null>(null);
  const lastLoadedSpeakSrcRef = useRef<string>('');
  const isSpeakingRef = useRef<boolean>(false);

  // Cấu hình transceiver chuẩn video trước, audio sau nếu sử dụng WebRTC kết nối
  const setupWebRtcTransceivers = useCallback((pc: RTCPeerConnection) => {
    pc.addTransceiver('video', { direction: 'recvonly' });
    pc.addTransceiver('audio', { direction: 'recvonly' });
  }, []);

  // Đồng bộ trạng thái hiển thị badge và visualizer
  const { state: canonicalState, isSpeaking } = useAvatarState({
    avatarId: effectiveAvatarId,
    voiceAssistantState,
    isSpeaking: isSpeakingHint,
    sessionStatus,
  });

  const meta = AVATAR_STATE_META[canonicalState] || AVATAR_STATE_META.idle;

  // Real-time audio analyzer cho vạch sóng âm thanh
  const analyzer = useLiveAudioTrackAnalyzer(audioTrack, {
    bandCount: 5,
    isSpeakingHint: isSpeaking || isSpeakActive,
  });

  // Lắng nghe room context an toàn từ LiveKit (nếu nằm trong LiveKitRoom)
  const roomContext = useMaybeRoomContext();
  const effectiveRoom = propRoom || roomContext;

  const isGenericSpeaking = Boolean(isSpeakingHint || voiceAssistantState === 'speaking');
  useEffect(() => {
    isSpeakingRef.current = isGenericSpeaking;
  }, [isGenericSpeaking]);

  const lastLipsyncReceivedAtRef = useRef<number>(0);

  // Cập nhật khi prop lipsyncVideoUrl hoặc speakVideoUrl thay đổi từ bên ngoài
  useEffect(() => {
    if (lipsyncVideoUrl) {
      lastLipsyncReceivedAtRef.current = Date.now();
      setActiveLipsyncUrl(lipsyncVideoUrl);
    } else if (speakVideoUrl) {
      lastLipsyncReceivedAtRef.current = Date.now();
      setActiveLipsyncUrl(speakVideoUrl);
    } else {
      setActiveLipsyncUrl(null);
    }
  }, [lipsyncVideoUrl, speakVideoUrl]);


  // Lắng nghe sự kiện lipsync từ LiveKit Room data message (topic: interview_avatar_event)
  useEffect(() => {
    if (!effectiveRoom) return;

    const AVATAR_EVENT_TOPIC = 'interview_avatar_event';

    const handleTextStream = async (reader: { readAll: () => Promise<string> }) => {
      try {
        const text = await reader.readAll();
        const payload = JSON.parse(text);
        if (payload?.type === 'lipsync_video' && (payload?.video_url || payload?.videoUrl)) {
          const vUrl = payload.video_url || payload.videoUrl;
          console.log('[InterviewAvatar] Nhận lipsync_video từ room text stream:', vUrl);
          lastLipsyncReceivedAtRef.current = Date.now();
          setActiveLipsyncUrl(vUrl);
        }
      } catch (err) {
        console.warn('[InterviewAvatar] Lỗi phân tích avatar event stream:', err);
      }
    };

    if (typeof effectiveRoom.registerTextStreamHandler === 'function') {
      try {
        effectiveRoom.registerTextStreamHandler(AVATAR_EVENT_TOPIC, handleTextStream);
      } catch {
        // Ignore nếu đã đăng ký
      }
    }

    const handleDataReceived = (payload: Uint8Array, participant?: any, kind?: any, topic?: string) => {
      if (topic !== AVATAR_EVENT_TOPIC) return;
      try {
        const text = new TextDecoder().decode(payload);
        const data = JSON.parse(text);
        if (data?.type === 'lipsync_video' && (data?.video_url || data?.videoUrl)) {
          const vUrl = data.video_url || data.videoUrl;
          console.log('[InterviewAvatar] Nhận lipsync_video từ room data packet:', vUrl);
          lastLipsyncReceivedAtRef.current = Date.now();
          setActiveLipsyncUrl(vUrl);
        }
      } catch (err) {
        console.warn('[InterviewAvatar] Lỗi phân tích avatar data packet:', err);
      }
    };

    effectiveRoom.on(RoomEvent.DataReceived, handleDataReceived);

    return () => {
      if (typeof effectiveRoom.unregisterTextStreamHandler === 'function') {
        try {
          effectiveRoom.unregisterTextStreamHandler(AVATAR_EVENT_TOPIC);
        } catch {
          // Ignore
        }
      }
      effectiveRoom.off(RoomEvent.DataReceived, handleDataReceived);
    };
  }, [effectiveRoom]);

  // Phân giải video loop hiện tại: Chỉ cần 1 video loop duy nhất cho nhân vật (mặc định idle)
  const currentIdleSrc = useMemo(() => {
    if (loopVideoUrl) return withVersion(loopVideoUrl);
    if (videoUrl) return withVersion(videoUrl);
    const actionToUse = (actionHint && ['wave', 'idle', 'nod', 'thinking', 'thanks_wave'].includes(actionHint))
      ? (actionHint as AvatarAction)
      : currentAction;
    const raw = resolveActionVideoUrl(actionToUse, characterId, avatarActions);
    return withVersion(raw);
  }, [loopVideoUrl, videoUrl, actionHint, currentAction, characterId, avatarActions]);

  // Phân giải video nói nhép lipsync (bám sát opc007: KHÔNG fallback sang generic speaking.mp4)
  const effectiveSpeakSrc = useMemo(() => {
    const raw = (
      activeLipsyncUrl ||
      lipsyncVideoUrl ||
      speakVideoUrl ||
      null
    );
    if (!raw) return '';
    // lipsync MP4 file đã mang mã băm content_hash độc nhất, không gắn ?v= để tránh lỗi disk cache Chrome
    if (raw.includes('/talking-head/record/') || raw.includes('/record/') || raw.includes('lipsync_')) {
      return raw;
    }
    return withVersion(raw);
  }, [activeLipsyncUrl, lipsyncVideoUrl, speakVideoUrl]);

  const hasSpecificLipsync = Boolean(activeLipsyncUrl || lipsyncVideoUrl || speakVideoUrl);
  // Bám sát opc007: Chỉ kích hoạt speak video khi có lipsync video cụ thể (không fallback vào generic speaking.mp4)
  const hasSpeakTrigger = hasSpecificLipsync;

  // Điều khiển tắt/mở âm thanh WebRTC của Agent trong phòng để triệt tiêu hoàn toàn echo/dual audio
  const toggleWebRTCAgentAudio = useCallback((muted: boolean) => {
    // 1. Tắt audioTrack truyền vào props
    if (audioTrack) {
      const track = (audioTrack as any)?.publication?.track || (audioTrack as any)?.track || audioTrack;
      if (typeof track?.setVolume === 'function') {
        try { track.setVolume(muted ? 0 : 1); } catch {}
      }
      if (track?.mediaStreamTrack) {
        try { track.mediaStreamTrack.enabled = !muted; } catch {}
      }
      if (Array.isArray(track?.attachedElements)) {
        track.attachedElements.forEach((el: HTMLMediaElement) => {
          try {
            el.muted = muted;
            el.volume = muted ? 0 : 1;
          } catch {}
        });
      }
    }

    // 2. Quét toàn bộ remote participants thuộc về Agent trong LiveKit Room
    if (effectiveRoom && effectiveRoom.remoteParticipants) {
      try {
        effectiveRoom.remoteParticipants.forEach((p: any) => {
          let role = '';
          if (p.metadata) {
            try { role = JSON.parse(p.metadata)?.role; } catch {}
          }
          const isAgent =
            role === 'agent' ||
            isLiveKitAgentParticipant(p) ||
            isLiveKitAgentIdentity(p.identity) ||
            (p.identity || '').toLowerCase().includes('agent') ||
            (p.name || '').toLowerCase().includes('trợ lý');
          if (isAgent && p.audioTrackPublications) {
            p.audioTrackPublications.forEach((pub: any) => {
              if (pub.track) {
                if (typeof pub.track.setVolume === 'function') {
                  try { pub.track.setVolume(muted ? 0 : 1); } catch {}
                }
                if (pub.track.mediaStreamTrack) {
                  try { pub.track.mediaStreamTrack.enabled = !muted; } catch {}
                }
                if (Array.isArray(pub.track.attachedElements)) {
                  pub.track.attachedElements.forEach((el: HTMLMediaElement) => {
                    try {
                      el.muted = muted;
                      el.volume = muted ? 0 : 1;
                    } catch {}
                  });
                }
              }
            });
          }
        });
      } catch {}
    }
  }, [audioTrack, effectiveRoom]);

  // Khôi phục WebRTC audio nếu unmount component
  useEffect(() => {
    return () => {
      toggleWebRTCAgentAudio(false);
    };
  }, [toggleWebRTCAgentAudio]);

  // Điều phối video loop nhân vật:
  // Đơn giản hóa theo yêu cầu: chỉ cần 1 video loop duy nhất cho nhân vật (idle.mp4), không cần các cử chỉ phức tạp
  // (loại bỏ nod timer 5s, bỏ wave ban đầu, bỏ thinking switch, bỏ thanks_wave switch).
  // Vẫn hỗ trợ actionHint cho trường hợp kiểm tra preview cử chỉ (wave, idle, nod, thinking, thanks_wave) nếu cần.
  useEffect(() => {
    if (actionHint && ['wave', 'idle', 'nod', 'thinking', 'thanks_wave'].includes(actionHint)) {
      setCurrentAction(actionHint as AvatarAction);
      return;
    }

    if (currentAction !== 'idle') {
      setCurrentAction('idle');
    }
  }, [actionHint, currentAction]);

  // Xử lý nạp và phát video nhép môi có tiếng
  useEffect(() => {
    const speakEl = speakVideoRef.current;
    if (!speakEl) return;

    if (hasSpeakTrigger && effectiveSpeakSrc) {
      if (lastLoadedSpeakSrcRef.current !== effectiveSpeakSrc) {
        lastLoadedSpeakSrcRef.current = effectiveSpeakSrc;
        speakEl.src = effectiveSpeakSrc;
        speakEl.currentTime = 0;
        // Bám sát opc007: Khi có lipsync video cụ thể, video phát CÓ TIẾNG để đồng bộ 100% phần cứng
        // Nếu là avatar trong chế độ PiP (phụ) thì luôn tắt tiếng tuyệt đối để tránh lồng tiếng
        speakEl.muted = isPip || !hasSpecificLipsync;
        speakEl.volume = isPip ? 0 : 1.0;

        // Tắt tiếng WebRTC của agent cục bộ trên trình duyệt để tránh vọng tiếng
        if (!isPip) {
          toggleWebRTCAgentAudio(true);
        }

        const playPromise = speakEl.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setIsSpeakActive(true);
            })
            .catch((err) => {
              if (err.name !== 'AbortError') {
                console.warn('[InterviewAvatar] Lỗi phát speak video có tiếng:', err);
              }
              // Fallback nếu trình duyệt chặn autoplay có tiếng: mute video và bật lại WebRTC audio
              if (err.name === 'NotAllowedError') {
                speakEl.muted = true;
                toggleWebRTCAgentAudio(false);
                speakEl.play().then(() => setIsSpeakActive(true)).catch(() => {});
              }
            });
        }
      } else if (speakEl.paused) {
        speakEl.play().then(() => setIsSpeakActive(true)).catch(() => {});
      }
    } else {
      if (!hasSpecificLipsync) {
        lastLoadedSpeakSrcRef.current = '';
        setIsSpeakActive(false);
        // Khôi phục WebRTC audio nếu không còn lipsync video
        toggleWebRTCAgentAudio(false);
      }
    }
  }, [hasSpeakTrigger, effectiveSpeakSrc, hasSpecificLipsync, toggleWebRTCAgentAudio]);

  // Khi video nói được nạp khung hình đầu tiên
  const handleSpeakLoadedData = useCallback(() => {
    const speakEl = speakVideoRef.current;
    if (!speakEl) return;

    speakEl.play().then(() => {
      setIsSpeakActive(true);
    }).catch((err) => {
      console.warn('[InterviewAvatar] Lỗi phát speak video sau khi load data:', err);
      setIsSpeakActive(false);
    });
  }, []);

  // Khi video nói hoàn tất: fade-out 0.12s về lại idle.mp4
  const handleSpeakEnded = useCallback(() => {
    setIsSpeakActive(false);
    lastLoadedSpeakSrcRef.current = '';
    setCurrentAction('idle');
    setActiveLipsyncUrl(null);
    // Khôi phục âm lượng WebRTC audio của agent sau khi video lipsync kết thúc
    toggleWebRTCAgentAudio(false);
    if (onLipsyncEnded) {
      onLipsyncEnded();
    }
  }, [toggleWebRTCAgentAudio, onLipsyncEnded]);

  // Khi video cử chỉ hoàn tất một lượt
  const handleIdleEnded = useCallback(() => {
    if (currentAction === 'wave' || currentAction === 'nod') {
      setCurrentAction('idle');
    }
  }, [currentAction]);

  // Xử lý lỗi nạp video: giữ video idle an toàn, không bao giờ để đen màn hoặc mất nhân vật
  const handleVideoError = useCallback((e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    const videoEl = e.currentTarget;
    console.warn('[InterviewAvatar] Cảnh báo nạp video hành động, giữ video idle an toàn:', videoEl.src);
    if (videoEl === speakVideoRef.current) {
      setIsSpeakActive(false);
      lastLoadedSpeakSrcRef.current = '';
      toggleWebRTCAgentAudio(false);
      return;
    }
    // Tránh lặp vô hạn nếu chính video idle cũng kích hoạt lỗi
    if (!videoEl.src.includes('idle.mp4')) {
      const defaultIdle = withVersion(resolveActionVideoUrl('idle', characterId || 'ng_c_linh'));
      videoEl.src = defaultIdle;
      videoEl.play().catch(() => {});
    }
  }, [characterId, toggleWebRTCAgentAudio]);

  // Studio background
  const defaultOfficeBg = '/images/avatar/ai-interview-office-bg.jpg';
  const bgUrl = avatarBackgroundUrl || defaultOfficeBg;

  return (
    <Box
      className={`${styles.stageContainer} ${className}`}
      sx={{
        borderColor: isSpeaking || isSpeakActive ? '#0ea5e9' : '#e2e8f0',
        borderWidth: 1,
        borderStyle: 'solid',
        boxShadow: isSpeaking || isSpeakActive
          ? '0 0 24px rgba(14, 165, 233, 0.22), 0 4px 16px rgba(0, 0, 0, 0.04)'
          : '0 4px 20px rgba(0, 0, 0, 0.04)',
        transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
      }}
    >
      {/* Lớp Ambient Backdrop mờ tự nhiên phía sau video (loại bỏ viền đen và không bị nhân 3 bức tường) */}
      {!isCustomUploadedImage && (
        <Box
          sx={{
            position: 'absolute',
            inset: -20,
            backgroundImage: `url("${bgUrl}")`,
            backgroundSize: 'cover',
            backgroundPosition: 'center 40%',
            filter: 'blur(36px) brightness(0.55)',
            transform: 'scale(1.15)',
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />
      )}

      {/* Studio Background Layer cho ảnh tùy chỉnh 2D cắt nền */}
      {isCustomUploadedImage && (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url("${bgUrl}")`,
            backgroundSize: 'cover',
            backgroundPosition: 'center 40%',
            backgroundColor: '#0f172a',
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />
      )}



      {/* Lớp A: Video Loop Chờ duy nhất cho nhân vật (Full HD MP4: 1 video lặp lại liên tục mượt mà, không gián đoạn tải cử chỉ) */}
      {!isCustomUploadedImage && (
        <video
          ref={idleVideoRef}
          className={styles.stageIdle}
          src={currentIdleSrc}
          autoPlay
          loop
          muted
          playsInline
          onEnded={handleIdleEnded}
          onError={handleVideoError}
        />
      )}

      {/* Lớp B: Video Trả lời Lipsync (Che lên Lớp A với fade-in/fade-out 0.12s mượt mà) */}
      {!isCustomUploadedImage && (
        <video
          ref={speakVideoRef}
          className={`${styles.stageSpeak} ${isSpeakActive ? styles.stageSpeakActive : ''}`}
          src={effectiveSpeakSrc || undefined}
          playsInline
          loop={false}
          preload="auto"
          onLoadedData={handleSpeakLoadedData}
          onEnded={handleSpeakEnded}
          onError={handleVideoError}
        />
      )}

      {/* Hiển thị ảnh tĩnh tùy chỉnh (CHỈ KHI nhà tuyển dụng chủ động tải lên ảnh riêng) */}
      {isCustomUploadedImage && avatarImageUrl && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '100%',
            height: { xs: '88%', sm: '85%', md: '82%', lg: '80%' },
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            zIndex: 10,
          }}
        >
          <Box
            component="img"
            data-testid="avatar-custom-image"
            src={avatarImageUrl}
            alt={interviewerName}
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              objectPosition: 'bottom center',
              userSelect: 'none',
              pointerEvents: 'none',
            }}
          />
        </Box>
      )}

      {/* Top-Right Floating State Badge */}
      <Box
        data-testid="avatar-state-badge"
        sx={{
          position: 'absolute',
          top: 14,
          right: 14,
          zIndex: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          px: 1.5,
          py: 0.45,
          borderRadius: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.94)',
          border: '1px solid #e2e8f0',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 2px 8px rgba(15, 23, 42, 0.05)',
          transition: 'all 0.25s ease',
        }}
      >
        <Box
          sx={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            backgroundColor: meta.dotColor,
            boxShadow: `0 0 8px ${meta.dotColor}`,
            '@keyframes dotPulse': {
              '0%, 100%': { opacity: 1, transform: 'scale(1)' },
              '50%': { opacity: 0.4, transform: 'scale(0.85)' },
            },
            animation: isSpeaking || isSpeakActive ? 'dotPulse 1.2s ease-in-out infinite' : 'none',
          }}
        />
        <Typography
          variant="caption"
          sx={{
            fontSize: '11px',
            fontWeight: 700,
            color: '#1e293b',
            letterSpacing: '0.2px',
          }}
        >
          {meta.labelVi}
        </Typography>
      </Box>

      {/* Bottom-Right Floating Minimalist Voice Visualizer Pill */}
      <Box
        data-testid="avatar-voice-visualizer-pill"
        sx={{
          position: 'absolute',
          bottom: 14,
          right: 14,
          zIndex: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          px: 1.25,
          py: 0.4,
          borderRadius: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.94)',
          border: '1px solid #e2e8f0',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 2px 8px rgba(15, 23, 42, 0.08)',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ width: '28px', height: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          <LiveAudioVisualizerBar
            analyzer={analyzer}
            barCount={4}
            color="#2563eb"
            secondaryColor="#3b82f6"
            height={14}
            showDbBadge={false}
          />
        </Box>
      </Box>
    </Box>
  );
}

export default InterviewAvatar;
