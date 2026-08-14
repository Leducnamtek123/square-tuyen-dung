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
import { useTranslation } from 'react-i18next';
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
    labelKey: 'pages.settings.interviewAi.preset.options.balanced',
    speed: '0.92',
    gap: '2.0',
    silence: '1.2',
  },
  {
    value: 'natural',
    labelKey: 'pages.settings.interviewAi.preset.options.natural',
    speed: '0.86',
    gap: '2.5',
    silence: '1.5',
  },
  {
    value: 'snappy',
    labelKey: 'pages.settings.interviewAi.preset.options.snappy',
    speed: '1.02',
    gap: '1.4',
    silence: '0.9',
  },
  {
    value: 'custom',
    labelKey: 'pages.settings.interviewAi.preset.options.custom',
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
  const { t } = useTranslation('admin');
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
              {t('pages.settings.interviewAi.pacingTitle')}
            </Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {t('pages.settings.interviewAi.pacingDescription')}
          </Typography>

          <Divider sx={{ mb: 3 }} />

          <Stack spacing={3}>
            <TextField
              select
              label={t('pages.settings.interviewAi.preset.label')}
              fullWidth
              size="small"
              value={currentPreset}
              onChange={handlePresetChange}
              helperText={t('pages.settings.interviewAi.preset.helper')}
            >
              {INTERVIEW_PACING_PRESETS.map((preset) => (
                <MenuItem key={preset.value} value={preset.value}>
                  {t(preset.labelKey)}
                </MenuItem>
              ))}
            </TextField>

            <Box sx={{ mt: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
                {t('pages.settings.interviewAi.ttsTitle')}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
                {t('pages.settings.interviewAi.ttsDescription')}
              </Typography>
            </Box>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  label={t('pages.settings.interviewAi.ttsSpeed.label')}
                  value={formData.ttsSpeed || ''}
                  onChange={(e) => onChange('ttsSpeed', e.target.value)}
                  type="number"
                  size="small"
                  fullWidth
                  inputProps={{ step: 0.05, min: 0.5, max: 2 }}
                  helperText={t('pages.settings.interviewAi.ttsSpeed.helper')}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  label={t('pages.settings.interviewAi.questionGap.label')}
                  value={formData.interviewQuestionGapSeconds || ''}
                  onChange={(e) => onChange('interviewQuestionGapSeconds', e.target.value)}
                  type="number"
                  size="small"
                  fullWidth
                  inputProps={{ step: 0.1, min: 0, max: 10 }}
                  helperText={t('pages.settings.interviewAi.questionGap.helper')}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  label={t('pages.settings.interviewAi.silenceThreshold.label')}
                  value={formData.interviewMinimumSilenceSeconds || ''}
                  onChange={(e) => onChange('interviewMinimumSilenceSeconds', e.target.value)}
                  type="number"
                  size="small"
                  fullWidth
                  inputProps={{ step: 0.1, min: 0, max: 10 }}
                  helperText={t('pages.settings.interviewAi.silenceThreshold.helper')}
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
