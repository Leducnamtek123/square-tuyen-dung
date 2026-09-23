import httpRequest from '../../utils/httpRequest';
import employerAiSettingService, {
  DEFAULT_EMPLOYER_AI_SETTINGS,
  PRESET_BACKGROUNDS,
  PRESET_AVATARS,
} from '../employerAiSettingService';

jest.mock('../../utils/httpRequest', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    patch: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

let store: Record<string, string> = {};

const mockLocalStorage = {
  getItem: (key: string) => store[key] || null,
  setItem: (key: string, value: string) => {
    store[key] = value.toString();
  },
  removeItem: (key: string) => {
    delete store[key];
  },
  clear: () => {
    store = {};
  },
};

(global as any).localStorage = mockLocalStorage;
(global as any).window = {
  localStorage: mockLocalStorage,
  dispatchEvent: jest.fn(),
  CustomEvent: class CustomEvent {
    constructor(public type: string, public detail?: any) {}
  },
};

describe('employerAiSettingService', () => {
  beforeEach(() => {
    store = {};
    jest.clearAllMocks();
  });

  it('returns default settings when storage is empty', () => {
    const settings = employerAiSettingService.getSettings();
    expect(settings.backgroundType).toBe('preset');
    expect(settings.selectedBackgroundId).toBe('modern_office');
    expect(settings.avatarType).toBe('preset');
    expect(settings.selectedAvatarId).toBe('aila_recruiter');
    expect(settings.interviewerName).toBe('Trợ lý AI AILA');
    expect(settings.ttsVoice).toBe('Trúc Ly');
    expect(settings.ttsSpeed).toBe(1.0);
  });

  it('saves and updates custom background, avatar, voice and speed', () => {
    const customBg = 'https://s3.infohr.vn/custom-office.jpg';
    const customAvt = 'https://s3.infohr.vn/custom-avatar.webp';

    employerAiSettingService.saveSettings({
      backgroundType: 'custom',
      customBackgroundUrl: customBg,
      avatarType: 'custom',
      customAvatarUrl: customAvt,
      interviewerName: 'Trợ lý AI Doanh nghiệp',
      ttsVoice: 'Nam Minh',
      ttsSpeed: 1.1,
    });

    const settings = employerAiSettingService.getSettings();
    expect(settings.backgroundType).toBe('custom');
    expect(settings.customBackgroundUrl).toBe(customBg);
    expect(settings.avatarType).toBe('custom');
    expect(settings.customAvatarUrl).toBe(customAvt);
    expect(settings.interviewerName).toBe('Trợ lý AI Doanh nghiệp');
    expect(settings.ttsVoice).toBe('Nam Minh');
    expect(settings.ttsSpeed).toBe(1.1);

    expect(employerAiSettingService.resolveActiveBackgroundUrl(settings)).toBe(customBg);
    expect(employerAiSettingService.resolveActiveAvatarUrl(settings)).toBe(customAvt);
  });

  it('resolves voice name and preset voice correctly', () => {
    expect(employerAiSettingService.resolveVoiceName('vi-VN-Standard-A')).toBe('Trúc Ly');
    expect(employerAiSettingService.resolveVoiceName('vi-VN-Standard-B')).toBe('Mạnh Dũng');
    expect(employerAiSettingService.resolveVoiceName('vi-VN-Standard-C')).toBe('Thùy Dung');
    expect(employerAiSettingService.resolveVoiceName('vi-VN-Standard-D')).toBe('Quang Sơn');
    expect(employerAiSettingService.resolveVoiceName('Trúc Ly')).toBe('Trúc Ly');

    const voice = employerAiSettingService.getPresetVoice('Mạnh Dũng');
    expect(voice).toBeDefined();
    expect(voice?.gender).toBe('male');
    expect(voice?.region).toBe('north');

    expect(employerAiSettingService.suggestVoiceForAvatar('expert_male')).toBe('Mạnh Dũng');
    expect(employerAiSettingService.suggestVoiceForAvatar('male_01')).toBe('Mạnh Dũng');
    expect(employerAiSettingService.suggestVoiceForAvatar('aila_recruiter')).toBe('Trúc Ly');
    expect(employerAiSettingService.suggestVoiceForAvatar('female_02')).toBe('Trúc Ly');
  });

  it('resolves preset background and avatar accurately', () => {
    const settings = {
      ...DEFAULT_EMPLOYER_AI_SETTINGS,
      backgroundType: 'preset' as const,
      selectedBackgroundId: PRESET_BACKGROUNDS[1].id,
      avatarType: 'preset' as const,
      selectedAvatarId: PRESET_AVATARS[1].id,
    };

    expect(employerAiSettingService.resolveActiveBackgroundUrl(settings)).toBe(PRESET_BACKGROUNDS[1].url);
    expect(employerAiSettingService.resolveActiveAvatarUrl(settings)).toBe('/assets/images/avatar/expert_male/idle.webp?v=20260913_bust_v3');

    const ailaSettings = {
      ...DEFAULT_EMPLOYER_AI_SETTINGS,
      selectedAvatarId: 'aila_recruiter',
    };
    expect(employerAiSettingService.resolveActiveAvatarUrl(ailaSettings)).toBeNull();
  });

  it('resets settings to default', () => {
    employerAiSettingService.saveSettings({
      interviewerName: 'AI Customized',
      ttsVoice: 'Quang Dũng',
      ttsSpeed: 0.85,
    });
    expect(employerAiSettingService.getSettings().interviewerName).toBe('AI Customized');
    expect(employerAiSettingService.getSettings().ttsVoice).toBe('Quang Dũng');

    const reset = employerAiSettingService.resetSettings();
    expect(reset.interviewerName).toBe(DEFAULT_EMPLOYER_AI_SETTINGS.interviewerName);
    expect(reset.ttsVoice).toBe(DEFAULT_EMPLOYER_AI_SETTINGS.ttsVoice);
    expect(reset.ttsSpeed).toBe(DEFAULT_EMPLOYER_AI_SETTINGS.ttsSpeed);
  });

  describe('async API integration', () => {
    it('fetches settings from backend API asynchronously and syncs to localStorage', async () => {
      const mockApiResponse = {
        interviewer_name: 'AI Recruiter Pro',
        interviewer_title: 'Head of Talent',
        background_type: 'custom',
        selected_background_id: 'studio_tech',
        custom_background_url: 'https://s3.infohr.vn/custom-bg.jpg',
        avatar_type: 'preset',
        selected_avatar_id: 'female_02',
        custom_avatar_url: null,
        tts_voice: 'Thùy Dung',
        tts_speed: 1.1,
        active_character_id: 'mai_linh',
        system_prompt: 'Custom STAR system prompt',
        default_script_id: 5,
        updated_at: '2026-09-24T00:00:00Z',
      };
      (httpRequest.get as jest.Mock).mockResolvedValueOnce(mockApiResponse);

      const settings = await employerAiSettingService.getSettingsAsync();

      expect(httpRequest.get).toHaveBeenCalledWith('profiles/company/ai-settings/');
      expect(settings.interviewerName).toBe('AI Recruiter Pro');
      expect(settings.interviewerTitle).toBe('Head of Talent');
      expect(settings.backgroundType).toBe('custom');
      expect(settings.selectedBackgroundId).toBe('studio_tech');
      expect(settings.customBackgroundUrl).toBe('https://s3.infohr.vn/custom-bg.jpg');
      expect(settings.avatarType).toBe('preset');
      expect(settings.selectedAvatarId).toBe('female_02');
      expect(settings.ttsVoice).toBe('Thùy Dung');
      expect(settings.ttsSpeed).toBe(1.1);
      expect(settings.activeCharacterId).toBe('mai_linh');
      expect(settings.customSystemPrompt).toBe('Custom STAR system prompt');
      expect(settings.defaultScriptId).toBe(5);

      // Verify snake_case compatibility
      expect(settings.interviewer_name).toBe('AI Recruiter Pro');
      expect(settings.tts_voice).toBe('Thùy Dung');

      // Verify synced into localStorage
      const local = employerAiSettingService.getSettings();
      expect(local.interviewerName).toBe('AI Recruiter Pro');
      expect(local.ttsVoice).toBe('Thùy Dung');
    });

    it('gracefully falls back to localStorage or default settings on API error without crashing', async () => {
      employerAiSettingService.saveSettings({
        interviewerName: 'Offline AI',
        ttsVoice: 'Mạnh Dũng',
      });

      (httpRequest.get as jest.Mock).mockRejectedValueOnce(new Error('Network Offline'));

      const settings = await employerAiSettingService.getSettingsAsync();

      expect(httpRequest.get).toHaveBeenCalledWith('profiles/company/ai-settings/');
      expect(settings.interviewerName).toBe('Offline AI');
      expect(settings.ttsVoice).toBe('Mạnh Dũng');
      expect(settings.backgroundType).toBe('preset');
    });

    it('optimistically saves to storage and calls httpRequest.patch with snake_case payload', async () => {
      (httpRequest.patch as jest.Mock).mockResolvedValueOnce({
        interviewer_name: 'Trợ lý AI Pro',
        interviewer_title: 'Giám đốc Nhân sự',
        tts_voice: 'Mạnh Dũng',
        tts_speed: 1.15,
        background_type: 'custom',
        custom_background_url: 'https://s3.infohr.vn/patch-bg.jpg',
        avatar_type: 'custom',
        custom_avatar_url: 'https://s3.infohr.vn/patch-avatar.png',
        selected_background_id: 'studio_tech',
        selected_avatar_id: 'expert_male',
        active_character_id: 'expert_male',
        system_prompt: 'STAR framework prompt',
        default_script_id: 3,
      });

      const updated = await employerAiSettingService.saveSettingsAsync({
        interviewerName: 'Trợ lý AI Pro',
        interviewerTitle: 'Giám đốc Nhân sự',
        ttsVoice: 'Mạnh Dũng',
        ttsSpeed: 1.15,
        backgroundType: 'custom',
        customBackgroundUrl: 'https://s3.infohr.vn/patch-bg.jpg',
        avatarType: 'custom',
        customAvatarUrl: 'https://s3.infohr.vn/patch-avatar.png',
        selectedBackgroundId: 'studio_tech',
        selectedAvatarId: 'expert_male',
        activeCharacterId: 'expert_male',
        customSystemPrompt: 'STAR framework prompt',
        defaultScriptId: 3,
      });

      expect(httpRequest.patch).toHaveBeenCalledWith('profiles/company/ai-settings/', {
        interviewer_name: 'Trợ lý AI Pro',
        interviewer_title: 'Giám đốc Nhân sự',
        tts_voice: 'Mạnh Dũng',
        tts_speed: 1.15,
        background_type: 'custom',
        custom_background_url: 'https://s3.infohr.vn/patch-bg.jpg',
        avatar_type: 'custom',
        custom_avatar_url: 'https://s3.infohr.vn/patch-avatar.png',
        selected_background_id: 'studio_tech',
        selected_avatar_id: 'expert_male',
        active_character_id: 'expert_male',
        system_prompt: 'STAR framework prompt',
        default_script_id: 3,
      });

      expect(updated.interviewerName).toBe('Trợ lý AI Pro');
      expect(updated.interviewerTitle).toBe('Giám đốc Nhân sự');
      expect(updated.ttsVoice).toBe('Mạnh Dũng');
      expect(updated.ttsSpeed).toBe(1.15);

      // Verify saved in localStorage
      const inStore = employerAiSettingService.getSettings();
      expect(inStore.interviewerName).toBe('Trợ lý AI Pro');
      expect(inStore.ttsVoice).toBe('Mạnh Dũng');
    });

    it('returns optimistic settings even if httpRequest.patch fails', async () => {
      (httpRequest.patch as jest.Mock).mockRejectedValueOnce(new Error('Server Error 500'));

      const result = await employerAiSettingService.saveSettingsAsync({
        interviewerName: 'Optimistic AI',
        ttsVoice: 'Quang Sơn',
      });

      expect(httpRequest.patch).toHaveBeenCalled();
      expect(result.interviewerName).toBe('Optimistic AI');
      expect(result.ttsVoice).toBe('Quang Sơn');

      const local = employerAiSettingService.getSettings();
      expect(local.interviewerName).toBe('Optimistic AI');
      expect(local.ttsVoice).toBe('Quang Sơn');
    });
  });
});
