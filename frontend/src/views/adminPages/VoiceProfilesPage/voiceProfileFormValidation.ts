export type VoiceProfileFormValidationErrors = Partial<Record<
  'name' | 'language' | 'presetVoiceId' | 'consentConfirmed',
  string
>>;

export interface VoiceProfileFormValidationData {
  name?: string | null;
  language?: string | null;
  voiceType?: string | null;
  presetVoiceId?: string | null;
  consentConfirmed?: boolean | null;
}

export const getVoiceProfileFormValidationErrors = (
  formData: VoiceProfileFormValidationData,
): VoiceProfileFormValidationErrors => {
  const errors: VoiceProfileFormValidationErrors = {};
  const name = String(formData.name ?? '').trim();
  const language = String(formData.language ?? '').trim();
  const presetVoiceId = String(formData.presetVoiceId ?? '').trim();
  const voiceType = formData.voiceType || 'cloned';

  if (!name) {
    errors.name = 'nameRequired';
  } else if (name.length > 160) {
    errors.name = 'nameMax';
  }

  if (!language) {
    errors.language = 'languageRequired';
  } else if (language.length > 16) {
    errors.language = 'languageMax';
  }

  if (voiceType === 'preset') {
    if (!presetVoiceId) {
      errors.presetVoiceId = 'presetVoiceIdRequired';
    } else if (presetVoiceId.length > 255) {
      errors.presetVoiceId = 'presetVoiceIdMax';
    }
  }

  if (voiceType === 'cloned' && !formData.consentConfirmed) {
    errors.consentConfirmed = 'consentRequired';
  }

  return errors;
};
