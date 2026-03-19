import React from 'react';
import { Box, Button, Card, Divider, Stack, TextField, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import aiService from '../../services/aiService';

const AIToolsCard = () => {
  const { t } = useTranslation('common');
  const [ttsText, setTtsText] = React.useState('');
  const [ttsVoice, setTtsVoice] = React.useState('');
  const [ttsSpeed, setTtsSpeed] = React.useState('1.0');
  const [ttsLoading, setTtsLoading] = React.useState(false);
  const [ttsAudioUrl, setTtsAudioUrl] = React.useState<string | null>(null);
  const [ttsError, setTtsError] = React.useState<string | null>(null);

  const [transcribeFile, setTranscribeFile] = React.useState<File | null>(null);
  const [transcribeLoading, setTranscribeLoading] = React.useState(false);
  const [transcription, setTranscription] = React.useState('');
  const [transcribeError, setTranscribeError] = React.useState<string | null>(null);

  React.useEffect(() => {
    return () => {
      if (ttsAudioUrl) {
        URL.revokeObjectURL(ttsAudioUrl);
      }
    };
  }, [ttsAudioUrl]);

  const handleGenerateTts = async () => {
    if (!ttsText.trim()) {
      setTtsError(t('aiTools.tts.validation', { defaultValue: 'Please enter text to synthesize.' }));
      return;
    }
    setTtsLoading(true);
    setTtsError(null);
    try {
      const blob = await aiService.tts({
        text: ttsText.trim(),
        voice: ttsVoice || undefined,
        speed: Number(ttsSpeed) || 1.0,
        format: 'mp3',
      });
      if (ttsAudioUrl) {
        URL.revokeObjectURL(ttsAudioUrl);
      }
      const objectUrl = URL.createObjectURL(blob);
      setTtsAudioUrl(objectUrl);
    } catch (error: any) {
      setTtsError(
        error?.response?.data?.detail ||
          t('aiTools.tts.error', { defaultValue: 'Unable to generate audio right now.' })
      );
    } finally {
      setTtsLoading(false);
    }
  };

  const handleTranscribe = async () => {
    if (!transcribeFile) {
      setTranscribeError(t('aiTools.transcribe.validation', { defaultValue: 'Please select an audio file.' }));
      return;
    }
    setTranscribeLoading(true);
    setTranscribeError(null);
    setTranscription('');
    try {
      const res = await aiService.transcribe(transcribeFile, { language: 'vi' });
      setTranscription(res?.transcription || '');
    } catch (error: any) {
      setTranscribeError(
        error?.response?.data?.errors?.detail ||
          t('aiTools.transcribe.error', { defaultValue: 'Unable to transcribe audio right now.' })
      );
    } finally {
      setTranscribeLoading(false);
    }
  };

  return (
    <Card sx={{ p: 3, mt: 3, boxShadow: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        {t('aiTools.title', { defaultValue: 'AI Tools' })}
      </Typography>

      <Stack spacing={2}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          {t('aiTools.tts.title', { defaultValue: 'Text-to-Speech' })}
        </Typography>
        <TextField
          label={t('aiTools.tts.textLabel', { defaultValue: 'Text' })}
          placeholder={t('aiTools.tts.textPlaceholder', { defaultValue: 'Enter text to synthesize...' })}
          value={ttsText}
          onChange={(e) => setTtsText(e.target.value)}
          multiline
          minRows={2}
        />
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            label={t('aiTools.tts.voiceLabel', { defaultValue: 'Voice (optional)' })}
            placeholder={t('aiTools.tts.voicePlaceholder', { defaultValue: 'e.g. Ly' })}
            value={ttsVoice}
            onChange={(e) => setTtsVoice(e.target.value)}
            fullWidth
          />
          <TextField
            label={t('aiTools.tts.speedLabel', { defaultValue: 'Speed' })}
            value={ttsSpeed}
            onChange={(e) => setTtsSpeed(e.target.value)}
            type="number"
            inputProps={{ step: 0.1, min: 0.5, max: 2 }}
            sx={{ maxWidth: 140 }}
          />
        </Stack>
        <Stack direction="row" spacing={2} alignItems="center">
          <Button variant="contained" onClick={handleGenerateTts} disabled={ttsLoading}>
            {ttsLoading
              ? t('aiTools.tts.generating', { defaultValue: 'Generating...' })
              : t('aiTools.tts.generate', { defaultValue: 'Generate Audio' })}
          </Button>
          {ttsError && (
            <Typography variant="body2" color="error">
              {ttsError}
            </Typography>
          )}
        </Stack>
        {ttsAudioUrl && (
          <Box>
            <audio controls src={ttsAudioUrl} style={{ width: '100%' }} />
          </Box>
        )}
      </Stack>

      <Divider sx={{ my: 3 }} />

      <Stack spacing={2}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          {t('aiTools.transcribe.title', { defaultValue: 'Speech-to-Text' })}
        </Typography>
        <Button variant="outlined" component="label">
          {transcribeFile
            ? t('aiTools.transcribe.changeFile', { defaultValue: 'Change audio file' })
            : t('aiTools.transcribe.selectFile', { defaultValue: 'Select audio file' })}
          <input
            type="file"
            hidden
            accept="audio/*"
            onChange={(e) => setTranscribeFile(e.target.files?.[0] || null)}
          />
        </Button>
        {transcribeFile && (
          <Typography variant="body2" color="text.secondary">
            {transcribeFile.name}
          </Typography>
        )}
        <Stack direction="row" spacing={2} alignItems="center">
          <Button variant="contained" onClick={handleTranscribe} disabled={transcribeLoading}>
            {transcribeLoading
              ? t('aiTools.transcribe.transcribing', { defaultValue: 'Transcribing...' })
              : t('aiTools.transcribe.run', { defaultValue: 'Transcribe' })}
          </Button>
          {transcribeError && (
            <Typography variant="body2" color="error">
              {transcribeError}
            </Typography>
          )}
        </Stack>
        {transcription && (
          <TextField
            label={t('aiTools.transcribe.resultLabel', { defaultValue: 'Transcription' })}
            value={transcription}
            multiline
            minRows={3}
            fullWidth
          />
        )}
      </Stack>
    </Card>
  );
};

export default AIToolsCard;
