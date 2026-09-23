'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Grid,
  Button,
  Chip,
  Slider,
  CircularProgress,
} from '@mui/material';
import GraphicEqIcon from '@mui/icons-material/GraphicEq';
import SpeedOutlinedIcon from '@mui/icons-material/SpeedOutlined';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import StopRoundedIcon from '@mui/icons-material/StopRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import {
  PRESET_VOICES,
  PRESET_SPEEDS,
  type PresetVoice,
} from '@/services/employerAiSettingService';
import aiService from '@/services/aiService';
import toastMessages from '@/utils/toastMessages';

export interface AiVoiceSelectorProps {
  selectedVoice?: string;
  voiceSpeed?: number;
  onVoiceChange: (voiceName: string) => void;
  onSpeedChange: (speed: number) => void;
  onSpeakingStateChange: (isSpeaking: boolean) => void;
}

export function AiVoiceSelector({
  selectedVoice = 'Trúc Ly',
  voiceSpeed = 1.0,
  onVoiceChange,
  onSpeedChange,
  onSpeakingStateChange,
}: AiVoiceSelectorProps) {
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const [loadingVoiceId, setLoadingVoiceId] = useState<string | null>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  // Stop audio on unmount
  useEffect(() => {
    return () => {
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current = null;
        onSpeakingStateChange(false);
      }
    };
  }, [onSpeakingStateChange]);

  const handlePlayVoiceSample = async (voice: PresetVoice) => {
    if (playingVoiceId === voice.id && currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
      setPlayingVoiceId(null);
      onSpeakingStateChange(false);
      return;
    }

    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
      setPlayingVoiceId(null);
      onSpeakingStateChange(false);
    }

    setLoadingVoiceId(voice.id);
    try {
      const blob = await aiService.tts({
        text: voice.sampleText,
        voice: voice.name,
        speed: voiceSpeed || 1.0,
        format: 'mp3',
      });
      const objectUrl = URL.createObjectURL(blob);
      const audio = new Audio(objectUrl);
      currentAudioRef.current = audio;

      audio.onplay = () => {
        setPlayingVoiceId(voice.id);
        onSpeakingStateChange(true);
      };

      audio.onended = () => {
        URL.revokeObjectURL(objectUrl);
        setPlayingVoiceId(null);
        onSpeakingStateChange(false);
        currentAudioRef.current = null;
      };

      audio.onpause = () => {
        onSpeakingStateChange(false);
      };

      audio.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        setPlayingVoiceId(null);
        onSpeakingStateChange(false);
        currentAudioRef.current = null;
        toastMessages.error('Không thể phát âm thanh mẫu, vui lòng thử lại');
      };

      await audio.play();
    } catch {
      setPlayingVoiceId(null);
      onSpeakingStateChange(false);
      currentAudioRef.current = null;
      toastMessages.error('Lỗi khi tải mẫu giọng nói');
    } finally {
      setLoadingVoiceId(null);
    }
  };

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3.5,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      <Box sx={{ p: 2.5, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 2,
              bgcolor: '#faf5ff',
              color: '#9333ea',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <GraphicEqIcon sx={{ fontSize: 20 }} />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'text.primary' }}>
              Giọng nói và nhịp điệu AI
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
              Tùy chỉnh chất giọng ba miền Bắc, Trung, Nam và tốc độ phát âm tự nhiên của AI phỏng vấn
            </Typography>
          </Box>
        </Stack>
      </Box>

      <CardContent sx={{ p: 2.5 }}>
        {/* Preset voices grid */}
        <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary', mb: 1.5 }}>
          Chất giọng phỏng vấn tiêu chuẩn
        </Typography>

        <Grid container spacing={2} sx={{ mb: 3 }}>
          {PRESET_VOICES.map((v) => {
            const isSelected = selectedVoice === v.id || selectedVoice === v.name;
            const isPlaying = playingVoiceId === v.id;
            const isLoading = loadingVoiceId === v.id;

            return (
              <Grid item xs={12} sm={6} key={v.id}>
                <Box
                  onClick={() => onVoiceChange(v.name)}
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    border: '2px solid',
                    borderColor: isSelected ? 'primary.main' : '#e2e8f0',
                    bgcolor: isSelected ? '#eff6ff' : '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    height: '100%',
                    position: 'relative',
                    '&:hover': {
                      borderColor: 'primary.light',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                    },
                  }}
                >
                  <Box>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.primary', fontSize: '1rem' }}>
                          {v.name}
                        </Typography>
                        <Chip
                          label={`${v.genderVi} - ${v.regionVi}`}
                          size="small"
                          sx={{
                            height: 22,
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            bgcolor: v.gender === 'female' ? '#fdf2f8' : '#eff6ff',
                            color: v.gender === 'female' ? '#db2777' : '#2563eb',
                            border: '1px solid',
                            borderColor: v.gender === 'female' ? '#fbcfe8' : '#bfdbfe',
                          }}
                        />
                      </Stack>
                      {isSelected ? (
                        <CheckCircleRoundedIcon color="primary" sx={{ fontSize: 22 }} />
                      ) : v.badge ? (
                        <Chip
                          label={v.badge}
                          size="small"
                          variant="outlined"
                          sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700, color: 'text.secondary' }}
                        />
                      ) : null}
                    </Stack>

                    <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 700, display: 'block', mb: 0.5 }}>
                      {v.toneVi}
                    </Typography>

                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', lineHeight: 1.4, mb: 1.5 }}>
                      {v.descriptionVi}
                    </Typography>
                  </Box>

                  <Box sx={{ pt: 1, borderTop: '1px dashed #e2e8f0' }}>
                    <Button
                      size="small"
                      variant={isPlaying ? 'contained' : 'outlined'}
                      color={isPlaying ? 'primary' : 'inherit'}
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlayVoiceSample(v);
                      }}
                      disabled={isLoading}
                      startIcon={
                        isLoading ? (
                          <CircularProgress size={14} color="inherit" />
                        ) : isPlaying ? (
                          <StopRoundedIcon sx={{ fontSize: 16 }} />
                        ) : (
                          <PlayArrowRoundedIcon sx={{ fontSize: 16 }} />
                        )
                      }
                      sx={{
                        textTransform: 'none',
                        fontWeight: 700,
                        fontSize: '0.75rem',
                        borderRadius: 2,
                        py: 0.4,
                        px: 1.5,
                        color: isPlaying ? '#ffffff' : 'text.primary',
                        borderColor: isPlaying ? 'transparent' : '#cbd5e1',
                      }}
                    >
                      {isLoading ? 'Đang tải mẫu...' : isPlaying ? 'Dừng phát' : 'Nghe thử giọng mẫu'}
                    </Button>
                  </Box>
                </Box>
              </Grid>
            );
          })}
        </Grid>

        {/* Speed Slider and Presets */}
        <Box sx={{ p: 2.5, borderRadius: 2.5, bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
            <SpeedOutlinedIcon sx={{ fontSize: 18, color: 'warning.main' }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.primary' }}>
              Tốc độ và nhịp điệu phát âm
            </Typography>
          </Stack>
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 2 }}>
            Điều chỉnh nhịp nói của AI từ 0.8x đến 1.2x để câu hỏi được truyền tải tự nhiên, rõ ràng và mạch lạc nhất
          </Typography>

          <Box sx={{ px: 2, mb: 2.5 }}>
            <Slider
              value={voiceSpeed ?? 1.0}
              min={0.8}
              max={1.2}
              step={0.05}
              onChange={(_, val) => onSpeedChange(val as number)}
              marks={[
                { value: 0.8, label: '0.8x Chậm' },
                { value: 1.0, label: '1.0x Tiêu chuẩn' },
                { value: 1.2, label: '1.2x Nhanh' },
              ]}
              valueLabelDisplay="auto"
              valueLabelFormat={(val) => `${val}x`}
              sx={{
                '& .MuiSlider-thumb': {
                  width: 18,
                  height: 18,
                },
              }}
            />
          </Box>

          <Grid container spacing={1.5}>
            {PRESET_SPEEDS.map((sp) => {
              const isSelected = Math.abs((voiceSpeed ?? 1.0) - sp.value) < 0.01;
              return (
                <Grid item xs={6} sm={3} key={sp.value}>
                  <Box
                    onClick={() => onSpeedChange(sp.value)}
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      border: '2px solid',
                      borderColor: isSelected ? 'primary.main' : '#e2e8f0',
                      bgcolor: isSelected ? '#eff6ff' : '#ffffff',
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'all 0.15s ease',
                      '&:hover': {
                        borderColor: 'primary.light',
                      },
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: isSelected ? 'primary.main' : 'text.primary' }}>
                      {sp.label}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.72rem', display: 'block', mt: 0.25 }}>
                      {sp.descriptionVi}
                    </Typography>
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      </CardContent>
    </Card>
  );
}

export default AiVoiceSelector;
