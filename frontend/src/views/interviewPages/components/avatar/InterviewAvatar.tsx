'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Box, Typography } from '@mui/material';
import type { AgentState } from '@livekit/components-react';
import {
  type AvatarAction,
  resolveAvatarState,
  resolveActionVideoUrl,
  AVATAR_STATE_META,
} from './avatarStates';
import { AvatarImage } from './AvatarImage';
import { useAvatarState } from './AvatarStateController';
import { LiveAudioVisualizerBar } from '../LiveAudioVisualizerBar';
import { useLiveAudioTrackAnalyzer } from '../../hooks/useLiveAudioTrackAnalyzer';
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
  lipsyncVideoUrl?: string | null;
  speakVideoUrl?: string | null;
  actionHint?: string | null;
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
  lipsyncVideoUrl,
  speakVideoUrl,
  actionHint,
}: InterviewAvatarProps) {
  const isCustomUploadedImage = Boolean(
    avatarImageUrl &&
    !avatarImageUrl.includes('/assets/images/avatar/') &&
    avatarId !== 'expert_male' &&
    avatarId !== 'aila_recruiter'
  );

  const effectiveAvatarId = avatarId || (avatarImageUrl?.includes('expert_male') ? 'expert_male' : 'aila_recruiter');

  // May trang thai cu chi video
  const [currentAction, setCurrentAction] = useState<AvatarAction>('wave');
  const [isSpeakActive, setIsSpeakActive] = useState(false);
  const [videoFallbackActive, setVideoFallbackActive] = useState(false);

  const idleVideoRef = useRef<HTMLVideoElement | null>(null);
  const speakVideoRef = useRef<HTMLVideoElement | null>(null);
  const nodTimerRef = useRef<NodeJS.Timeout | null>(null);

  // LiveTalking WebRTC Engine (Chay truc tiep tren GPU RTX 4070 Ti SUPER)
  const [isWebRtcConnected, setIsWebRtcConnected] = useState(false);
  const liveVideoRef = useRef<HTMLVideoElement | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const liveSessionIdRef = useRef<string | null>(null);

  // Dong bo trang thai hien thi badge va visualizer
  const { state: canonicalState, assetSrc, isSpeaking } = useAvatarState({
    avatarId: effectiveAvatarId,
    voiceAssistantState,
    isSpeaking: isSpeakingHint,
    sessionStatus,
  });

  const meta = AVATAR_STATE_META[canonicalState] || AVATAR_STATE_META.idle;

  // Real-time audio analyzer cho vach song am thanh
  const analyzer = useLiveAudioTrackAnalyzer(audioTrack, {
    bandCount: 5,
    isSpeakingHint: isSpeaking || isSpeakActive,
  });

  // Phan giai video cu chi hien tai
  const currentIdleSrc = useMemo(() => {
    return resolveActionVideoUrl(currentAction, characterId, avatarActions);
  }, [currentAction, characterId, avatarActions]);

  // Phan giai video noi lipsync
  const effectiveSpeakSrc = useMemo(() => {
    return (
      lipsyncVideoUrl ||
      speakVideoUrl ||
      avatarActions?.speaking ||
      resolveActionVideoUrl('speaking', characterId, avatarActions)
    );
  }, [lipsyncVideoUrl, speakVideoUrl, avatarActions, characterId]);

  // Dieu phoi State Machine theo context phong phong van
  useEffect(() => {
    if (actionHint && ['wave', 'idle', 'nod', 'thinking', 'thanks_wave'].includes(actionHint)) {
      setCurrentAction(actionHint as AvatarAction);
      return;
    }

    if (sessionStatus === 'completed') {
      setCurrentAction('thanks_wave');
      return;
    }

    if (voiceAssistantState === 'thinking') {
      setCurrentAction('thinking');
      return;
    }

    if (voiceAssistantState === 'listening') {
      if (currentAction === 'thinking' || currentAction === 'thanks_wave') {
        setCurrentAction('idle');
      }

      // Neu ung vien noi lien tuc hon 5 giay, kich hoat cu chi gat dau
      if (!nodTimerRef.current) {
        nodTimerRef.current = setTimeout(() => {
          setCurrentAction('nod');
        }, 5000);
      }
      return;
    }

    // Reset nod timer neu khong con listening
    if (nodTimerRef.current) {
      clearTimeout(nodTimerRef.current);
      nodTimerRef.current = null;
    }
  }, [actionHint, sessionStatus, voiceAssistantState, currentAction]);

  // Xu ly khi co tin hieu noi hoac video lipsync moi
  const hasSpeakTrigger = Boolean(
    lipsyncVideoUrl ||
    speakVideoUrl ||
    isSpeakingHint ||
    voiceAssistantState === 'speaking'
  );

  useEffect(() => {
    const speakEl = speakVideoRef.current;
    if (!speakEl) return;

    if (hasSpeakTrigger) {
      if (speakEl.src !== effectiveSpeakSrc) {
        speakEl.src = effectiveSpeakSrc;
        speakEl.load();
      } else if (speakEl.paused && !isSpeakActive) {
        speakEl.play().catch(() => {
          // Trinh duyet chan autoplay thi chuyen trang thai mem
        });
        setIsSpeakActive(true);
      }
    } else {
      if (isSpeakActive) {
        setIsSpeakActive(false);
      }
    }
  }, [hasSpeakTrigger, effectiveSpeakSrc, isSpeakActive]);

  // Ket noi LiveTalking WebRTC stream truc tiep tu GPU RTX 4070 Ti SUPER
  useEffect(() => {
    let isMounted = true;
    let pc: RTCPeerConnection | null = null;

    async function initLiveTalkingWebRTC() {
      if (typeof window === 'undefined' || !window.RTCPeerConnection) return;
      try {
        pc = new RTCPeerConnection({
          iceServers: [
            { urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302'] },
          ],
        });
        pcRef.current = pc;

        pc.addTransceiver('video', { direction: 'recvonly' });
        pc.addTransceiver('audio', { direction: 'recvonly' });

        pc.ontrack = (event) => {
          if (event.track.kind === 'video' && liveVideoRef.current) {
            liveVideoRef.current.srcObject = event.streams[0];
            liveVideoRef.current.play().catch(() => {});
            if (isMounted) {
              setIsWebRtcConnected(true);
            }
          }
        };

        pc.onconnectionstatechange = () => {
          if (pc?.connectionState === 'connected' && isMounted) {
            setIsWebRtcConnected(true);
          } else if (
            (pc?.connectionState === 'failed' || pc?.connectionState === 'disconnected') &&
            isMounted
          ) {
            setIsWebRtcConnected(false);
          }
        };

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        await new Promise<void>((resolve) => {
          if (pc!.iceGatheringState === 'complete') {
            resolve();
          } else {
            const checkState = () => {
              if (pc!.iceGatheringState === 'complete') {
                pc!.removeEventListener('icegatheringstatechange', checkState);
                resolve();
              }
            };
            pc!.addEventListener('icegatheringstatechange', checkState);
            setTimeout(resolve, 1500);
          }
        });

        const localDesc = pc.localDescription;
        if (!localDesc || !isMounted) return;

        const res = await fetch('/talking-head/offer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sdp: localDesc.sdp,
            type: localDesc.type,
            avatar: characterId || 'ng_c_linh',
          }),
        });

        if (res.ok) {
          const answer = await res.json();
          liveSessionIdRef.current = answer.sessionid;
          await pc.setRemoteDescription(new RTCSessionDescription(answer));
        }
      } catch (err) {
        console.warn('[InterviewAvatar] WebRTC AI avatar init fallback:', err);
      }
    }

    initLiveTalkingWebRTC();

    return () => {
      isMounted = false;
      if (pc) {
        pc.close();
      }
      pcRef.current = null;
    };
  }, [characterId]);

  // Khi video noi duoc tai du lieu khung hinh dau tien
  const handleSpeakLoadedData = useCallback(() => {
    const speakEl = speakVideoRef.current;
    if (!speakEl) return;

    speakEl.play().then(() => {
      setIsSpeakActive(true);
    }).catch(() => {
      setIsSpeakActive(true);
    });
  }, []);

  // Khi video noi hoan tat
  const handleSpeakEnded = useCallback(() => {
    setIsSpeakActive(false);
    setCurrentAction('idle');
  }, []);

  // Khi video idle hoan tat mot luot
  const handleIdleEnded = useCallback(() => {
    if (currentAction === 'wave') {
      setCurrentAction('idle');
    } else if (currentAction === 'nod') {
      setCurrentAction('idle');
    }
  }, [currentAction]);

  // Fallback tu dong neu video khong tai duoc
  const handleVideoError = useCallback(() => {
    setVideoFallbackActive(true);
  }, []);

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
      {/* Studio Background Layer */}
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

      {/* Lop Ambient Backdrop: Lam mo video goc 9:16 de lap day toan man hinh 16:9 khong bi vien den */}
      {!videoFallbackActive && !isCustomUploadedImage && (
        <video
          className={styles.stageBackdropVideo}
          src={isSpeakActive ? effectiveSpeakSrc : currentIdleSrc}
          autoPlay
          loop
          muted
          playsInline
          aria-hidden="true"
        />
      )}

      {/* Lop Live WebRTC GPU AI (LiveTalking Engine render truc tiep tu GPU NVIDIA RTX 4070 Ti SUPER) */}
      {!videoFallbackActive && !isCustomUploadedImage && (
        <video
          ref={liveVideoRef}
          className={styles.stageLiveWebRtc}
          style={{
            opacity: isWebRtcConnected ? 1 : 0,
            transition: 'opacity 0.25s ease-in-out',
            pointerEvents: isWebRtcConnected ? 'auto' : 'none',
          }}
          autoPlay
          playsInline
          muted
        />
      )}

      {/* Lop A: Video Cho / Cu chi (Fallback khi WebRTC dang khoi dong) */}
      {!videoFallbackActive && !isCustomUploadedImage && !isWebRtcConnected && (
        <video
          ref={idleVideoRef}
          className={styles.stageIdle}
          src={currentIdleSrc}
          autoPlay
          loop={currentAction === 'idle' || currentAction === 'thinking'}
          muted
          playsInline
          onEnded={handleIdleEnded}
          onError={handleVideoError}
        />
      )}

      {/* Lop B: Video Tra loi Lipsync (Fallback khi WebRTC dang khoi dong) */}
      {!videoFallbackActive && !isCustomUploadedImage && !isWebRtcConnected && (
        <video
          ref={speakVideoRef}
          className={`${styles.stageSpeak} ${isSpeakActive ? styles.stageSpeakActive : ''}`}
          src={effectiveSpeakSrc}
          playsInline
          muted
          loop
          preload="auto"
          onLoadedData={handleSpeakLoadedData}
          onEnded={handleSpeakEnded}
          onError={handleVideoError}
        />
      )}

      {/* Fallback 2D Avatar Image khi video loi hoac co anh tuy chinh */}
      {(videoFallbackActive || isCustomUploadedImage) && (
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
          {isCustomUploadedImage && avatarImageUrl ? (
            <Box
              component="img"
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
          ) : (
            <AvatarImage
              avatarId={effectiveAvatarId}
              src={assetSrc}
              state={canonicalState}
              alt={`${interviewerName} - ${meta.labelVi}`}
            />
          )}
        </Box>
      )}

      {/* Top-Left Floating State Badge */}
      <Box
        sx={{
          position: 'absolute',
          top: 14,
          left: 14,
          zIndex: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          px: 1.5,
          py: 0.45,
          borderRadius: '9999px',
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
          borderRadius: '9999px',
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
