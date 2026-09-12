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
  });

  it('saves and updates custom background and avatar', () => {
    const customBg = 'https://s3.infohr.vn/custom-office.jpg';
    const customAvt = 'https://s3.infohr.vn/custom-avatar.webp';

    employerAiSettingService.saveSettings({
      backgroundType: 'custom',
      customBackgroundUrl: customBg,
      avatarType: 'custom',
      customAvatarUrl: customAvt,
      interviewerName: 'Trợ lý AI Doanh nghiệp',
    });

    const settings = employerAiSettingService.getSettings();
    expect(settings.backgroundType).toBe('custom');
    expect(settings.customBackgroundUrl).toBe(customBg);
    expect(settings.avatarType).toBe('custom');
    expect(settings.customAvatarUrl).toBe(customAvt);
    expect(settings.interviewerName).toBe('Trợ lý AI Doanh nghiệp');

    expect(employerAiSettingService.resolveActiveBackgroundUrl(settings)).toBe(customBg);
    expect(employerAiSettingService.resolveActiveAvatarUrl(settings)).toBe(customAvt);
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
    expect(employerAiSettingService.resolveActiveAvatarUrl(settings)).toBe('/assets/images/avatar/expert_male/idle.webp');

    const ailaSettings = {
      ...DEFAULT_EMPLOYER_AI_SETTINGS,
      selectedAvatarId: 'aila_recruiter',
    };
    expect(employerAiSettingService.resolveActiveAvatarUrl(ailaSettings)).toBeNull();
  });

  it('resets settings to default', () => {
    employerAiSettingService.saveSettings({
      interviewerName: 'AI Customized',
    });
    expect(employerAiSettingService.getSettings().interviewerName).toBe('AI Customized');

    const reset = employerAiSettingService.resetSettings();
    expect(reset.interviewerName).toBe(DEFAULT_EMPLOYER_AI_SETTINGS.interviewerName);
  });
});
