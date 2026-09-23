'use client';

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Button,
  Chip,
} from '@mui/material';
import VolumeUpOutlinedIcon from '@mui/icons-material/VolumeUpOutlined';
import VolumeOffOutlinedIcon from '@mui/icons-material/VolumeOffOutlined';
import employerAiSettingService, {
  type EmployerAiSettings,
  PRESET_BACKGROUNDS,
  DIGITAL_HUMAN_CHARACTERS,
} from '@/services/employerAiSettingService';
import { InterviewAvatar } from '@/views/interviewPages/components/avatar/InterviewAvatar';

export interface AiStudioPreviewProps {
  settings: EmployerAiSettings;
  isSpeakingTest: boolean;
  onToggleSpeakingTest: () => void;
  testedAction: string;
  onSelectAction: (actionKey: string) => void;
}

const ACTION_BUTTONS = ['wave', 'idle', 'nod', 'thinking', 'thanks_wave'] as const;

export function AiStudioPreview({
  settings,
  isSpeakingTest,
  onToggleSpeakingTest,
  testedAction,
  onSelectAction,
}: AiStudioPreviewProps) {
  const activeBgUrl = employerAiSettingService.resolveActiveBackgroundUrl(settings);
  const activeAvatarUrl =
    settings.avatarType === 'custom' && settings.customAvatarUrl
      ? settings.customAvatarUrl
      : null;

  const activeCharacter =
    DIGITAL_HUMAN_CHARACTERS.find((c) => c.id === settings.activeCharacterId) ||
    DIGITAL_HUMAN_CHARACTERS[0];

  const defaultSpeakingUrl =
    settings.activeCharacterId === 'minh_tri'
      ? '/assets/avatars/minh_tri/actions/speaking.mp4'
      : '/assets/avatars/ng_c_linh/actions/speaking.mp4';

  const speakVideoUrl = isSpeakingTest
    ? settings.avatarActions?.speaking || defaultSpeakingUrl
    : null;

  const actionHint = isSpeakingTest ? 'speaking' : testedAction || 'idle';

  const backgroundName =
    settings.backgroundType === 'custom'
      ? 'Ảnh riêng Nhà tuyển dụng'
      : PRESET_BACKGROUNDS.find((b) => b.id === settings.selectedBackgroundId)?.nameVi ||
        'Văn phòng hiện đại';

  const personaLabel =
    settings.hrPersonaPreset === 'friendly'
      ? 'Thân thiện'
      : settings.hrPersonaPreset === 'challenger'
      ? 'Thử thách'
      : 'Chuyên nghiệp';

  return (
    <Card
      elevation={0}
      sx={{
        position: { lg: 'sticky' },
        top: { lg: 24 },
        borderRadius: 3.5,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          p: 2,
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: '#f8fafc',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#22c55e' }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a' }}>
            Khung xem trước phòng phỏng vấn
          </Typography>
        </Stack>
        <Chip
          label="Trực quan thời gian thực"
          size="small"
          color="primary"
          variant="outlined"
          sx={{ fontWeight: 700, fontSize: '0.72rem', height: 24 }}
        />
      </Box>

      <CardContent sx={{ p: 2.5 }}>
        {/* Studio Canvas Box */}
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            aspectRatio: '16/9',
            borderRadius: 3,
            overflow: 'hidden',
            border: '1px solid #cbd5e1',
            bgcolor: '#0f172a',
            boxShadow: '0 8px 24px -4px rgba(15, 23, 42, 0.18)',
          }}
        >
          <InterviewAvatar
            interviewerName={settings.interviewerName}
            avatarBackgroundUrl={activeBgUrl}
            avatarId={settings.selectedAvatarId}
            avatarImageUrl={activeAvatarUrl}
            isSpeakingHint={isSpeakingTest}
            avatarBackdrop={settings.selectedBackgroundId}
            avatarActions={settings.avatarActions}
            characterId={settings.activeCharacterId}
            actionHint={actionHint}
            speakVideoUrl={speakVideoUrl}
          />

          {/* Floating interviewer badge */}
          <Box
            sx={{
              position: 'absolute',
              bottom: 10,
              left: 10,
              zIndex: 15,
              bgcolor: 'rgba(15, 23, 42, 0.8)',
              backdropFilter: 'blur(8px)',
              borderRadius: 2,
              px: 1.5,
              py: 0.75,
              border: '1px solid rgba(255, 255, 255, 0.15)',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: isSpeakingTest ? '#3b82f6' : '#22c55e',
                boxShadow: isSpeakingTest ? '0 0 8px #3b82f6' : '0 0 8px #22c55e',
              }}
            />
            <Typography variant="caption" sx={{ color: '#ffffff', fontWeight: 700, fontSize: '0.75rem' }}>
              {settings.interviewerName || 'Trợ lý AI AILA'}
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.75)', fontSize: '0.7rem' }}>
              • {settings.interviewerTitle || 'Chuyên viên tuyển dụng'}
            </Typography>
          </Box>
        </Box>

        {/* Lipsync speaking test toggle */}
        <Stack direction="row" spacing={1.5} sx={{ mt: 2.5 }} alignItems="center" flexWrap="wrap">
          <Button
            variant={isSpeakingTest ? 'contained' : 'outlined'}
            color="primary"
            size="small"
            onClick={onToggleSpeakingTest}
            startIcon={isSpeakingTest ? <VolumeOffOutlinedIcon /> : <VolumeUpOutlinedIcon />}
            sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}
          >
            {isSpeakingTest ? 'Dừng thử khẩu hình' : 'Thử hiệu ứng nhép môi'}
          </Button>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
            {isSpeakingTest ? 'Đang mô phỏng nói chuyện' : 'Nhấp để kiểm tra cử động nhép môi'}
          </Typography>
        </Stack>

        {/* Quick gesture buttons */}
        <Box sx={{ mt: 2, p: 1.5, borderRadius: 2.5, bgcolor: '#f1f5f9' }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, display: 'block', mb: 1 }}>
            Thử nghiệm cử chỉ người ảo:
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ gap: 0.75 }}>
            {ACTION_BUTTONS.map((actionKey) => (
              <Chip
                key={actionKey}
                label={actionKey}
                size="small"
                clickable
                color={testedAction === actionKey && !isSpeakingTest ? 'primary' : 'default'}
                variant={testedAction === actionKey && !isSpeakingTest ? 'filled' : 'outlined'}
                onClick={() => onSelectAction(actionKey)}
                sx={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.72rem' }}
              />
            ))}
          </Stack>
        </Box>

        {/* Configuration summary */}
        <Box sx={{ mt: 2.5, p: 2, borderRadius: 2.5, bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Thông số cấu hình hiện tại
          </Typography>
          <Stack spacing={1} sx={{ mt: 1 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Trợ lý AI
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.primary' }}>
                {settings.interviewerName || 'Trợ lý AI AILA'}
              </Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Chức vụ
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.primary' }}>
                {settings.interviewerTitle || 'Chuyên viên tuyển dụng'}
              </Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Nhân vật AI
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.primary' }}>
                {settings.avatarType === 'custom' ? 'Chân dung AI tùy chỉnh' : activeCharacter.name}
              </Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Phong thái HR
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.primary' }}>
                {personaLabel}
              </Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Không gian
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.primary' }}>
                {backgroundName}
              </Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Giọng đọc AI
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.primary' }}>
                {settings.ttsVoice || 'Trúc Ly'}
              </Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Tốc độ phát âm
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.primary' }}>
                {settings.ttsSpeed ? `${settings.ttsSpeed}x` : '1.0x'}
              </Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Nền tảng xử lý
              </Typography>
              <Chip
                label="Công nghệ AI AILA"
                size="small"
                color="success"
                variant="outlined"
                sx={{ height: 20, fontSize: '0.68rem', fontWeight: 700 }}
              />
            </Stack>
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );
}

export default AiStudioPreview;
