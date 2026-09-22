'use client';

import React from 'react';
import {
  Box,
  Typography,
  Stack,
  Grid,
  Button,
  Chip,
  TextField,
  Alert,
} from '@mui/material';
import PsychologyOutlinedIcon from '@mui/icons-material/PsychologyOutlined';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import RestartAltOutlinedIcon from '@mui/icons-material/RestartAltOutlined';
import EmojiObjectsOutlinedIcon from '@mui/icons-material/EmojiObjectsOutlined';
import {
  PRESET_HR_PERSONAS,
  type HrPersonaPresetId,
  type HrPersonaPreset,
} from '@/services/employerAiSettingService';

interface HrPersonaSelectorProps {
  selectedPresetId?: HrPersonaPresetId;
  systemPrompt?: string;
  onPresetChange: (presetId: HrPersonaPresetId, newPrompt?: string) => void;
  onPromptChange: (newPrompt: string) => void;
}

const VARIABLE_TAGS = [
  { tag: '{job_title}', label: 'Vị trí tuyển dụng' },
  { tag: '{candidate_name}', label: 'Tên ứng viên' },
  { tag: '{interviewer_name}', label: 'Tên người phỏng vấn' },
  { tag: '{interviewer_title}', label: 'Chức danh người phỏng vấn' },
];

export function HrPersonaSelector({
  selectedPresetId = 'professional',
  systemPrompt = '',
  onPresetChange,
  onPromptChange,
}: HrPersonaSelectorProps) {
  const currentPreset =
    PRESET_HR_PERSONAS.find((p) => p.id === selectedPresetId) || PRESET_HR_PERSONAS[1];

  const handleSelectPreset = (preset: HrPersonaPreset) => {
    onPresetChange(preset.id, preset.systemPromptTemplate);
  };

  const handleResetToCurrentPreset = () => {
    onPromptChange(currentPreset.systemPromptTemplate);
  };

  const handleInsertTag = (tag: string) => {
    onPromptChange(`${systemPrompt} ${tag}`);
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Tiêu đề mục phong thái HR */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
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
            <PsychologyOutlinedIcon sx={{ fontSize: 20 }} />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'text.primary' }}>
              Phong thái và kịch bản người phỏng vấn
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
              Định hình tính cách, phương pháp phỏng vấn và độ sâu phản biện chuyên môn của AI
            </Typography>
          </Box>
        </Stack>
      </Stack>

      {/* Lưới 3 phong thái HR */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {PRESET_HR_PERSONAS.map((preset) => {
          const isSelected = selectedPresetId === preset.id;

          return (
            <Grid item xs={12} md={4} key={preset.id}>
              <Box
                onClick={() => handleSelectPreset(preset)}
                sx={{
                  p: 2,
                  borderRadius: 3,
                  border: '2px solid',
                  borderColor: isSelected ? 'primary.main' : '#e2e8f0',
                  bgcolor: isSelected ? '#eff6ff' : '#ffffff',
                  cursor: 'pointer',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: 'primary.light',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                <Box>
                  <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.primary' }}>
                      {preset.nameVi}
                    </Typography>
                    {isSelected ? (
                      <CheckCircleRoundedIcon color="primary" sx={{ fontSize: 20 }} />
                    ) : (
                      <Chip
                        label={preset.badge}
                        size="small"
                        variant="outlined"
                        sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700, color: 'text.secondary' }}
                      />
                    )}
                  </Stack>

                  <Typography
                    variant="caption"
                    sx={{
                      color: 'primary.main',
                      fontWeight: 700,
                      display: 'block',
                      mb: 0.75,
                      lineHeight: 1.3,
                    }}
                  >
                    {preset.taglineVi}
                  </Typography>

                  <Typography
                    variant="caption"
                    sx={{
                      color: 'text.secondary',
                      display: 'block',
                      lineHeight: 1.4,
                      mb: 1.5,
                    }}
                  >
                    {preset.descriptionVi}
                  </Typography>
                </Box>

                <Box sx={{ pt: 1, borderTop: '1px dashed #e2e8f0' }}>
                  <Typography variant="caption" sx={{ color: '#475569', fontWeight: 600, fontSize: '0.72rem' }}>
                    {preset.targetCandidateVi}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          );
        })}
      </Grid>

      {/* Soạn thảo Custom System Prompt */}
      <Box sx={{ p: 2.5, borderRadius: 3, border: '1px solid #e2e8f0', bgcolor: '#f8fafc' }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ sm: 'center' }} justifyContent="space-between" spacing={1} sx={{ mb: 1.5 }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <EmojiObjectsOutlinedIcon sx={{ fontSize: 18, color: 'warning.main' }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.primary' }}>
              Chỉ dẫn hệ thống chuyên sâu cho AI phỏng vấn
            </Typography>
          </Stack>

          <Button
            size="small"
            variant="text"
            color="primary"
            onClick={handleResetToCurrentPreset}
            startIcon={<RestartAltOutlinedIcon />}
            sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.75rem' }}
          >
            Khôi phục mẫu phong thái này
          </Button>
        </Stack>

        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 2, lineHeight: 1.5 }}>
          Chỉ dẫn này quyết định cách AI phản hồi sau khi nghe ứng viên trả lời. Khuyến khích yêu cầu câu nói ngắn gọn dưới 25 đến 30 từ để âm thanh phát ra tự nhiên và mạch lạc nhất.
        </Typography>

        {/* Biến động có thể chèn */}
        <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap" sx={{ gap: 1, mb: 1.5 }}>
          <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', mr: 0.5 }}>
            Chèn biến tự động:
          </Typography>
          {VARIABLE_TAGS.map((v) => (
            <Chip
              key={v.tag}
              label={`${v.tag} - ${v.label}`}
              size="small"
              onClick={() => handleInsertTag(v.tag)}
              sx={{
                fontFamily: 'monospace',
                fontSize: '0.72rem',
                cursor: 'pointer',
                bgcolor: '#eff6ff',
                color: '#2563eb',
                border: '1px solid #bfdbfe',
                fontWeight: 600,
                '&:hover': {
                  bgcolor: '#dbeafe',
                },
              }}
            />
          ))}
        </Stack>

        <TextField
          fullWidth
          multiline
          minRows={5}
          maxRows={10}
          value={systemPrompt}
          onChange={(e) => onPromptChange(e.target.value)}
          placeholder="Nhập chỉ dẫn hệ thống phỏng vấn cho trợ lý AI..."
          size="small"
          sx={{
            bgcolor: '#ffffff',
            '& .MuiInputBase-input': {
              fontFamily: 'monospace',
              fontSize: '0.82rem',
              lineHeight: 1.5,
            },
          }}
        />

        <Alert
          severity="info"
          sx={{
            mt: 2,
            borderRadius: 2,
            fontSize: '0.75rem',
            bgcolor: '#eff6ff',
            border: '1px solid #bfdbfe',
            color: '#1e40af',
          }}
        >
          Trợ lý AI sẽ kết hợp chỉ dẫn này cùng nội dung Bản mô tả công việc và Hồ sơ ứng viên để điều phối phiên phỏng vấn logic theo phương pháp STAR.
        </Alert>
      </Box>
    </Box>
  );
}

export default HrPersonaSelector;
