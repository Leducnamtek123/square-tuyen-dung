/**
 * employerAiSetting.ts - Type definitions for Employer AI Interview Settings
 * Aligned with backend DRF CompanyAiSettingsSerializer (api/apps/profiles/serializers_ai_settings.py)
 */

export interface PresetBackground {
  id: string;
  nameVi: string;
  nameEn: string;
  url: string;
  descriptionVi: string;
  badge: string;
}

export interface PresetAvatar {
  id: string;
  name: string;
  titleVi: string;
  previewUrl: string;
  descriptionVi: string;
  isFullWebpAnimation: boolean;
}

export interface AilaCharacter {
  id: string;
  name: string;
  titleVi: string;
  gender: 'female' | 'male';
  genderVi: string;
  avatarId: string;
  defaultVoice: string;
  techBadges: readonly string[];
  posterUrl: string;
  previewUrl: string;
  descriptionVi: string;
}

export type DigitalHumanCharacter = AilaCharacter;

export interface PresetVoice {
  id: string;
  name: string;
  voiceCode: string;
  gender: 'female' | 'male';
  genderVi: string;
  region: 'south' | 'north' | 'central';
  regionVi: string;
  toneVi: string;
  descriptionVi: string;
  sampleText: string;
  badge?: string;
}

export interface PresetSpeed {
  value: number;
  label: string;
  descriptionVi: string;
}

export type HrPersonaPresetId = 'friendly' | 'professional' | 'challenger';

export interface HrPersonaPreset {
  id: HrPersonaPresetId;
  nameVi: string;
  taglineVi: string;
  descriptionVi: string;
  targetCandidateVi: string;
  badge: string;
  systemPromptTemplate: string;
}

export interface AvatarActionMeta {
  key: string;
  labelVi: string;
  filename: string;
  descriptionVi: string;
  defaultUrl: string;
}

export type BackgroundType = 'preset' | 'custom';
export type AvatarType = 'preset' | 'custom';

export interface EmployerAiSettings {
  // CamelCase accessors
  backgroundType: BackgroundType;
  selectedBackgroundId: string;
  customBackgroundUrl: string | null;
  avatarType: AvatarType;
  selectedAvatarId: string;
  customAvatarUrl: string | null;
  interviewerName: string;
  interviewerTitle: string;
  ttsVoice: string;
  ttsSpeed: number;
  updatedAt: string;

  avatarActions?: Record<string, string>;
  activeCharacterId?: string;
  hrPersonaPreset?: HrPersonaPresetId;
  customSystemPrompt?: string;
  defaultScriptId?: number | string | null;

  // Snake_case aliases corresponding to DRF serializer (CompanyAiSettingsSerializer)
  background_type?: BackgroundType;
  selected_background_id?: string | null;
  custom_background_url?: string | null;
  avatar_type?: AvatarType;
  selected_avatar_id?: string | null;
  custom_avatar_url?: string | null;
  interviewer_name?: string;
  interviewer_title?: string;
  tts_voice?: string;
  tts_speed?: number;
  system_prompt?: string;
  updated_at?: string;
  active_character_id?: string | null;
  default_script_id?: number | string | null;
  avatar_actions?: Record<string, string>;
  hr_persona_preset?: HrPersonaPresetId;
}
