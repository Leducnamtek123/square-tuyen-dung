'use client';

import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid2 as Grid,
  TextField,
  Divider,
  Stack,
  MenuItem,
  Box,
} from '@mui/material';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import FPTGpuControlCard from '../index'; // Will pass or import properly
import type { SystemSettings } from '../hooks/useSystemSettings';

interface VoiceInterviewTabProps {
  formData: SystemSettings;
  onChange: (name: keyof SystemSettings, value: unknown) => void;
  FPTGpuControlCardComponent?: React.ReactNode;
}

const INTERVIEW_PACING_PRESETS = [
  {
    value: 'balanced',
    label: 'Cân bằng (Mặc định - Khuyên dùng)',
    speed: '0.92',
    gap: '2.0',
    silence: '1.2',
  },
  {
    value: 'natural',
    label: 'Tự nhiên, chậm rãi',
    speed: '0.86',
    gap: '2.5',
    silence: '1.5',
  },
  {
    value: 'snappy',
    label: 'Nhanh nhạy, phản hồi gấp',
    speed: '1.02',
    gap: '1.4',
    silence: '0.9',
  },
  {
    value: 'custom',
    label: 'Tùy chỉnh thủ công',
    speed: '',
    gap: '',
    silence: '',
  },
] as const;

const resolveInterviewPacingPreset = (formData: SystemSettings): string => {
  const speed = String(formData.ttsSpeed || '');
  const gap = String(formData.interviewQuestionGapSeconds || '');
  const silence = String(formData.interviewMinimumSilenceSeconds || '');
  const matched = INTERVIEW_PACING_PRESETS.find(
    (preset) => preset.speed === speed && preset.gap === gap && preset.silence === silence,
  );
  return matched?.value || 'custom';
};

export const VoiceInterviewTab: React.FC<VoiceInterviewTabProps> = ({
  formData,
  onChange,
  FPTGpuControlCardComponent,
}) => {
  const currentPreset = resolveInterviewPacingPreset(formData);

  const handlePresetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = INTERVIEW_PACING_PRESETS.find((item) => item.value === e.target.value);
    if (!selected || selected.value === 'custom') return;
    onChange('ttsSpeed', selected.speed);
    onChange('interviewQuestionGapSeconds', selected.gap);
    onChange('interviewMinimumSilenceSeconds', selected.silence);
  };

  return (
    <Stack spacing={3}>
      <Card elevation={0} sx={{ borderRadius: '16px', border: '1px solid', borderColor: 'divider' }}>
        <CardContent sx={{ p: 3 }}>
          <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
            <RecordVoiceOverIcon color="primary" sx={{ fontSize: 28 }} />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Cấu Hình Nhịp Độ Phỏng Vấn AI (Voice AI Pacing)
            </Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Tùy chỉnh tốc độ đọc câu hỏi phỏng vấn (TTS) và khoảng nghỉ nhận diện câu trả lời của ứng viên.
          </Typography>

          <Divider sx={{ mb: 3 }} />

          <Stack spacing={3}>
            <TextField
              select
              label="Preset nhịp độ phỏng vấn"
              fullWidth
              size="small"
              value={currentPreset}
              onChange={handlePresetChange}
              helperText="Chọn nhanh bộ tham số tối ưu hóa trải nghiệm phỏng vấn giọng nói."
            >
              {INTERVIEW_PACING_PRESETS.map((preset) => (
                <MenuItem key={preset.value} value={preset.value}>
                  {preset.label}
                </MenuItem>
              ))}
            </TextField>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  label="Tốc độ đọc câu hỏi (TTS Speed)"
                  value={formData.ttsSpeed || ''}
                  onChange={(e) => onChange('ttsSpeed', e.target.value)}
                  type="number"
                  size="small"
                  fullWidth
                  inputProps={{ step: 0.05, min: 0.5, max: 2 }}
                  helperText="Tốc độ chuẩn: 0.92 (Từ 0.5 đến 2.0)"
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  label="Khoảng nghỉ chuyển câu (Gap Seconds)"
                  value={formData.interviewQuestionGapSeconds || ''}
                  onChange={(e) => onChange('interviewQuestionGapSeconds', e.target.value)}
                  type="number"
                  size="small"
                  fullWidth
                  inputProps={{ step: 0.1, min: 0, max: 10 }}
                  helperText="Thời gian chờ giữa 2 câu hỏi (giây)"
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  label="Thời gian im lặng tối thiểu (Minimum Silence)"
                  value={formData.interviewMinimumSilenceSeconds || ''}
                  onChange={(e) => onChange('interviewMinimumSilenceSeconds', e.target.value)}
                  type="number"
                  size="small"
                  fullWidth
                  inputProps={{ step: 0.1, min: 0, max: 10 }}
                  helperText="Xác nhận ứng viên đã trả lời xong (giây)"
                />
              </Grid>
            </Grid>
          </Stack>
        </CardContent>
      </Card>

      {FPTGpuControlCardComponent}
    </Stack>
  );
};

export default VoiceInterviewTab;
