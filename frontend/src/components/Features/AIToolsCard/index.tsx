import React from 'react';
import { Box, Button, Card, Divider, Stack, TextField, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import aiService from '@/services/aiService';
import type { AxiosError } from 'axios';

type State = {
  ttsText: string;
  ttsVoice: string;
  ttsSpeed: string;
  ttsLoading: boolean;
  ttsAudioUrl: string | null;
  ttsError: string | null;
  transcribeFile: File | null;
  transcribeLoading: boolean;
  transcription: string;
  transcribeError: string | null;
};

type Action =
  | { type: 'set_tts_text'; payload: string }
  | { type: 'set_tts_voice'; payload: string }
  | { type: 'set_tts_speed'; payload: string }
  | { type: 'set_tts_loading'; payload: boolean }
  | { type: 'set_tts_audio_url'; payload: string | null }
  | { type: 'set_tts_error'; payload: string | null }
  | { type: 'set_transcribe_file'; payload: File | null }
  | { type: 'set_transcribe_loading'; payload: boolean }
  | { type: 'set_transcription'; payload: string }
  | { type: 'set_transcribe_error'; payload: string | null };

const initialState: State = {
  ttsText: '',
  ttsVoice: '',
  ttsSpeed: '1.0',
  ttsLoading: false,
  ttsAudioUrl: null,
  ttsError: null,
  transcribeFile: null,
  transcribeLoading: false,
  transcription: '',
  transcribeError: null,
};

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'set_tts_text':
      return { ...state, ttsText: action.payload };
    case 'set_tts_voice':
      return { ...state, ttsVoice: action.payload };
    case 'set_tts_speed':
      return { ...state, ttsSpeed: action.payload };
    case 'set_tts_loading':
      return { ...state, ttsLoading: action.payload };
    case 'set_tts_audio_url':
      return { ...state, ttsAudioUrl: action.payload };
    case 'set_tts_error':
      return { ...state, ttsError: action.payload };
    case 'set_transcribe_file':
      return { ...state, transcribeFile: action.payload };
    case 'set_transcribe_loading':
      return { ...state, transcribeLoading: action.payload };
    case 'set_transcription':
      return { ...state, transcription: action.payload };
    case 'set_transcribe_error':
      return { ...state, transcribeError: action.payload };
    default:
      return state;
  }
};

const AIToolsCard = () => {
  const { t } = useTranslation('common');
  const [state, dispatch] = React.useReducer(reducer, initialState);

  React.useEffect(() => {
    return () => {
      if (state.ttsAudioUrl) {
        URL.revokeObjectURL(state.ttsAudioUrl);
      }
    };
  }, [state.ttsAudioUrl]);

  const handleGenerateTts = async () => {
    if (!state.ttsText.trim()) {
      dispatch({ type: 'set_tts_error', payload: t('aiTools.tts.validation', { defaultValue: 'Please enter text to synthesize.' }) });
      return;
    }
    dispatch({ type: 'set_tts_loading', payload: true });
    dispatch({ type: 'set_tts_error', payload: null });
    try {
      const blob = await aiService.tts({
        text: state.ttsText.trim(),
        voice: state.ttsVoice || undefined,
        speed: Number(state.ttsSpeed) || 1.0,
        format: 'mp3',
      });
      if (state.ttsAudioUrl) {
        URL.revokeObjectURL(state.ttsAudioUrl);
      }
      const objectUrl = URL.createObjectURL(blob);
      dispatch({ type: 'set_tts_audio_url', payload: objectUrl });
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ detail?: string }>;
      dispatch({
        type: 'set_tts_error',
        payload:
          axiosError.response?.data?.detail ||
          t('aiTools.tts.error', { defaultValue: 'Unable to generate audio right now.' })
      });
    } finally {
      dispatch({ type: 'set_tts_loading', payload: false });
    }
  };

  const handleTranscribe = async () => {
    if (!state.transcribeFile) {
      dispatch({ type: 'set_transcribe_error', payload: t('aiTools.transcribe.validation', { defaultValue: 'Please select an audio file.' }) });
      return;
    }
    dispatch({ type: 'set_transcribe_loading', payload: true });
    dispatch({ type: 'set_transcribe_error', payload: null });
    dispatch({ type: 'set_transcription', payload: '' });
    try {
      const res = await aiService.transcribe(state.transcribeFile, { language: 'vi' });
      dispatch({ type: 'set_transcription', payload: String(res?.transcription || '') });
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ errors?: { detail?: string } }>;
      dispatch({
        type: 'set_transcribe_error',
        payload:
          axiosError.response?.data?.errors?.detail ||
          t('aiTools.transcribe.error', { defaultValue: 'Unable to transcribe audio right now.' })
      });
    } finally {
      dispatch({ type: 'set_transcribe_loading', payload: false });
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
          value={state.ttsText}
          onChange={(e) => dispatch({ type: 'set_tts_text', payload: e.target.value })}
          multiline
          minRows={2}
        />
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            label={t('aiTools.tts.voiceLabel', { defaultValue: 'Voice (optional)' })}
            placeholder={t('aiTools.tts.voicePlaceholder', { defaultValue: 'e.g. Ly' })}
            value={state.ttsVoice}
            onChange={(e) => dispatch({ type: 'set_tts_voice', payload: e.target.value })}
            fullWidth
          />
          <TextField
            label={t('aiTools.tts.speedLabel', { defaultValue: 'Speed' })}
            value={state.ttsSpeed}
            onChange={(e) => dispatch({ type: 'set_tts_speed', payload: e.target.value })}
            type="number"
            slotProps={{ htmlInput: { step: 0.1, min: 0.5, max: 2 } }}
            sx={{ maxWidth: 140 }}
          />
        </Stack>
        <Stack direction="row" spacing={2} alignItems="center">
          <Button variant="contained" onClick={handleGenerateTts} disabled={state.ttsLoading}>
            {state.ttsLoading
              ? t('aiTools.tts.generating', { defaultValue: 'Generating...' })
              : t('aiTools.tts.generate', { defaultValue: 'Generate Audio' })}
          </Button>
          {state.ttsError && (
            <Typography variant="body2" color="error">
              {state.ttsError}
            </Typography>
          )}
        </Stack>
        {state.ttsAudioUrl && (
          <Box>
            <audio controls src={state.ttsAudioUrl} style={{ width: '100%' }} />
          </Box>
        )}
      </Stack>

      <Divider sx={{ my: 3 }} />

      <Stack spacing={2}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          {t('aiTools.transcribe.title', { defaultValue: 'Speech-to-Text' })}
        </Typography>
        <Button variant="outlined" component="label">
          {state.transcribeFile
            ? t('aiTools.transcribe.changeFile', { defaultValue: 'Change audio file' })
            : t('aiTools.transcribe.selectFile', { defaultValue: 'Select audio file' })}
          <input
            type="file"
            hidden
            accept="audio/*"
            onChange={(e) => dispatch({ type: 'set_transcribe_file', payload: e.target.files?.[0] || null })}
          />
        </Button>
        {state.transcribeFile && (
          <Typography variant="body2" color="text.secondary">
            {state.transcribeFile.name}
          </Typography>
        )}
        <Stack direction="row" spacing={2} alignItems="center">
          <Button variant="contained" onClick={handleTranscribe} disabled={state.transcribeLoading}>
            {state.transcribeLoading
              ? t('aiTools.transcribe.transcribing', { defaultValue: 'Transcribing...' })
              : t('aiTools.transcribe.run', { defaultValue: 'Transcribe' })}
          </Button>
          {state.transcribeError && (
            <Typography variant="body2" color="error">
              {state.transcribeError}
            </Typography>
          )}
        </Stack>
        {state.transcription && (
          <TextField
            label={t('aiTools.transcribe.resultLabel', { defaultValue: 'Transcription' })}
            value={state.transcription}
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
