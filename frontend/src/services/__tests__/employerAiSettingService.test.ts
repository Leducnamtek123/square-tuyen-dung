import employerAiSettingService, {
  DEFAULT_EMPLOYER_AI_SETTINGS,
  PRESET_BACKGROUNDS,
  PRESET_AVATARS,
} from '../employerAiSettingService';

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
});
