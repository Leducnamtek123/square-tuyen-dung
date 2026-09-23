'use client';

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Grid,
  TextField,
  Chip,
  Button,
} from '@mui/material';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import type { EmployerAiSettings } from '@/services/employerAiSettingService';
import { HrPersonaSelector } from './HrPersonaSelector';

export interface AiIdentityCardProps {
  settings: EmployerAiSettings;
  onChange: (partial: Partial<EmployerAiSettings>) => void;
  onGuideOpen?: () => void;
}

interface CharacterOption {
  id: string;
  name: string;
  titleVi: string;
  genderVi: string;
  defaultVoice: string;
  posterUrl: string;
  techBadges: string[];
  descriptionVi: string;
  avatarId: string;
}

const CHARACTERS: CharacterOption[] = [
  {
    id: 'ng_c_linh',
    name: 'Ngọc Linh AI',
    titleVi: 'Nữ chuyên viên tuyển dụng cao cấp - Aila',
    genderVi: 'Nữ',
    defaultVoice: 'Trúc Ly',
    posterUrl: '/assets/avatars/ng_c_linh/actions/portrait.jpg',
    techBadges: ['Aila Realtime Lipsync', 'Full HD 60fps'],
    descriptionVi: 'Trợ lý AI Aila chuẩn studio, biểu cảm gương mặt tinh tế, tự nhiên và phong thái chuyên nghiệp',
    avatarId: 'aila_recruiter',
  },
  {
    id: 'minh_tri',
    name: 'Minh Trí AI',
    titleVi: 'Nam trưởng nhóm tuyển dụng cấp cao',
    genderVi: 'Nam',
    defaultVoice: 'Mạnh Dũng',
    posterUrl: '/assets/images/avatar/expert_male/idle.webp?v=20260913_photoreal_v7',
    techBadges: ['GPU Realtime Lipsync', 'Full HD 60fps'],
    descriptionVi: 'Phong thái đĩnh đạc, chững chạc, vest lịch lãm, phù hợp phỏng vấn chuyên viên cấp cao và quản lý',
    avatarId: 'expert_male',
  },
];

export function AiIdentityCard({
  settings,
  onChange,
  onGuideOpen,
}: AiIdentityCardProps) {
  const isSelectedCharacter = (charId: string) => {
    if (charId === 'minh_tri') {
      return settings.activeCharacterId === 'minh_tri' || settings.activeCharacterId === 'expert_male';
    }
    return settings.activeCharacterId === charId;
  };

  const handleSelectCharacter = (char: CharacterOption) => {
    onChange({
      activeCharacterId: char.id,
      selectedAvatarId: char.avatarId,
      avatarType: 'preset',
      ttsVoice: settings.ttsVoice || char.defaultVoice,
    });
  };

  return (
    <Stack spacing={3}>
      {/* Identity Card */}
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
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            alignItems={{ sm: 'center' }}
            justifyContent="space-between"
            spacing={1.5}
          >
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 2,
                  bgcolor: '#f0fdf4',
                  color: '#16a34a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <BadgeOutlinedIcon sx={{ fontSize: 20 }} />
              </Box>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'text.primary' }}>
                  Danh xưng và nhận diện người phỏng vấn AI
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                  Thông tin hiển thị trên thẻ nhân sự và huy hiệu người phỏng vấn trong phòng họp trực tuyến
                </Typography>
              </Box>
            </Stack>

            {onGuideOpen && (
              <Stack direction="row" spacing={1}>
                <Button
                  component="a"
                  href="/downloads/ai-avatar-sample-pack.zip"
                  download="aila-recruiter-guide.zip"
                  variant="outlined"
                  color="primary"
                  size="small"
                  startIcon={<DownloadOutlinedIcon />}
                  sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2, fontSize: '0.8rem' }}
                >
                  Tải bộ mẫu Trợ lý Aila
                </Button>
                <Button
                  variant="outlined"
                  color="inherit"
                  size="small"
                  onClick={onGuideOpen}
                  startIcon={<MenuBookOutlinedIcon />}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 700,
                    borderRadius: 2,
                    fontSize: '0.8rem',
                    color: 'text.secondary',
                    borderColor: '#cbd5e1',
                  }}
                >
                  Tài liệu chuẩn hóa AI
                </Button>
              </Stack>
            )}
          </Stack>
        </Box>

        <CardContent sx={{ p: 2.5 }}>
          {/* Name & Title Inputs */}
          <Grid container spacing={2.5}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Tên hiển thị người phỏng vấn AI"
                value={settings.interviewerName || ''}
                onChange={(e) => onChange({ interviewerName: e.target.value })}
                placeholder="Ví dụ: Trợ lý AI AILA"
                size="small"
                helperText="Tên sẽ được xướng âm và hiển thị trong phòng phỏng vấn"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Chức danh chuyên môn"
                value={settings.interviewerTitle || ''}
                onChange={(e) => onChange({ interviewerTitle: e.target.value })}
                placeholder="Ví dụ: Chuyên viên tuyển dụng AI"
                size="small"
                helperText="Vị trí đảm nhiệm trong hội đồng phỏng vấn"
              />
            </Grid>
          </Grid>

          {/* Character Selection */}
          <Box sx={{ mt: 3 }}>
            <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
              Nhân vật đại diện AI
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 2 }}>
              Lựa chọn chuyên viên AI phỏng vấn chuẩn hóa cho các phiên phỏng vấn thông minh
            </Typography>

            <Grid container spacing={2}>
              {CHARACTERS.map((char) => {
                const isSelected = isSelectedCharacter(char.id);
                return (
                  <Grid item xs={12} sm={6} key={char.id}>
                    <Box
                      onClick={() => handleSelectCharacter(char)}
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
                        gap: 1.5,
                        height: '100%',
                        '&:hover': {
                          borderColor: 'primary.light',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                        },
                      }}
                    >
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Box
                          component="img"
                          src={char.posterUrl}
                          alt={char.name}
                          sx={{
                            width: 68,
                            height: 68,
                            objectFit: 'cover',
                            borderRadius: 2.5,
                            bgcolor: '#0f172a',
                            border: '1px solid #e2e8f0',
                          }}
                        />
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Stack direction="row" alignItems="center" justifyContent="space-between">
                            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.primary', fontSize: '0.95rem' }}>
                              {char.name}
                            </Typography>
                            {isSelected && <CheckCircleRoundedIcon color="primary" sx={{ fontSize: 22 }} />}
                          </Stack>
                          <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 700, display: 'block', mt: 0.25 }}>
                            {char.titleVi}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5, lineHeight: 1.3 }}>
                            {char.genderVi} • Giọng khuyên dùng: {char.defaultVoice}
                          </Typography>
                        </Box>
                      </Stack>

                      <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ gap: 0.5 }}>
                        {char.techBadges.map((badge, idx) => (
                          <Chip
                            key={badge}
                            label={badge}
                            size="small"
                            sx={{
                              height: 22,
                              fontSize: '0.68rem',
                              fontWeight: 700,
                              bgcolor: idx === 0 ? '#ecfdf5' : '#f5f3ff',
                              color: idx === 0 ? '#059669' : '#7c3aed',
                              border: '1px solid',
                              borderColor: idx === 0 ? '#a7f3d0' : '#ddd6fe',
                            }}
                          />
                        ))}
                      </Stack>

                      <Typography
                        variant="caption"
                        sx={{
                          color: 'text.secondary',
                          display: 'block',
                          lineHeight: 1.4,
                          pt: 0.5,
                          borderTop: '1px dashed #e2e8f0',
                        }}
                      >
                        {char.descriptionVi}
                      </Typography>
                    </Box>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        </CardContent>
      </Card>

      {/* HR Persona Selector */}
      <Card
        elevation={0}
        sx={{
          borderRadius: 3.5,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <CardContent sx={{ p: 2.5 }}>
          <HrPersonaSelector
            selectedPresetId={settings.hrPersonaPreset}
            systemPrompt={settings.customSystemPrompt}
            onPresetChange={(presetId, newPrompt) => {
              onChange({
                hrPersonaPreset: presetId,
                customSystemPrompt: newPrompt ?? settings.customSystemPrompt,
              });
            }}
            onPromptChange={(newPrompt) => {
              onChange({
                customSystemPrompt: newPrompt,
              });
            }}
          />
        </CardContent>
      </Card>
    </Stack>
  );
}

export default AiIdentityCard;
