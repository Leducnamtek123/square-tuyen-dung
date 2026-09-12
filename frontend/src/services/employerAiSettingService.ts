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

export interface EmployerAiSettings {
  backgroundType: 'preset' | 'custom';
  selectedBackgroundId: string;
  customBackgroundUrl: string | null;
  avatarType: 'preset' | 'custom';
  selectedAvatarId: string;
  customAvatarUrl: string | null;
  interviewerName: string;
  interviewerTitle: string;
  updatedAt: string;
}

export const PRESET_BACKGROUNDS: readonly PresetBackground[] = [
  {
    id: 'modern_office',
    nameVi: 'Văn phòng hiện đại',
    nameEn: 'Modern High-rise Office',
    url: '/images/avatar/bg-modern-office.jpg',
    descriptionVi: 'Không gian mở thanh lịch với tường ốp gỗ lam sóng và tầm nhìn thành phố ngập tràn ánh sáng',
    badge: 'Khuyên dùng',
  },
  {
    id: 'studio_tech',
    nameVi: 'Studio công nghệ cao',
    nameEn: 'Deep Tech Studio',
    url: '/images/avatar/bg-studio-tech.jpg',
    descriptionVi: 'Không gian phòng thu AI hiện đại với tường tiêu âm hình học và dải led xanh vi mô sang trọng',
    badge: 'Công nghệ',
  },
  {
    id: 'executive_boardroom',
    nameVi: 'Phòng hội đồng quản trị',
    nameEn: 'Executive Boardroom',
    url: '/images/avatar/bg-executive-boardroom.jpg',
    descriptionVi: 'Không gian trang trọng với tường gỗ óc chó ấm cúng và khung cảnh đêm thành phố đẳng cấp',
    badge: 'Trang trọng',
  },
  {
    id: 'minimalist_clean',
    nameVi: 'Tối giản Bắc Âu',
    nameEn: 'Minimalist Workspace',
    url: '/images/avatar/bg-minimalist-clean.jpg',
    descriptionVi: 'Phông nền tường vữa ấm thanh bình kết hợp ánh sáng tự nhiên và cây xanh tạo cảm giác thư thái',
    badge: 'Thanh lịch',
  },
];

export const PRESET_AVATARS: readonly PresetAvatar[] = [
  {
    id: 'aila_recruiter',
    name: 'AILA AI',
    titleVi: 'Nữ chuyên viên tuyển dụng cao cấp',
    previewUrl: '/assets/images/avatar/hr/idle.webp',
    descriptionVi: 'Phong cách chuyên nghiệp, thân thiện, tương tác biểu cảm và cử động nhép môi tự nhiên 22 trạng thái',
    isFullWebpAnimation: true,
  },
  {
    id: 'expert_male',
    name: 'MINH TRÍ AI',
    titleVi: 'Nam chuyên gia phỏng vấn công nghệ',
    previewUrl: '/assets/images/avatar/expert_male/preview.jpg',
    descriptionVi: 'Phong thái đĩnh đạc, sắc sảo, chuyên trách đánh giá chuyên môn kỹ thuật và kỹ năng giải quyết vấn đề',
    isFullWebpAnimation: false,
  },
];

export const DEFAULT_EMPLOYER_AI_SETTINGS: EmployerAiSettings = {
  backgroundType: 'preset',
  selectedBackgroundId: 'modern_office',
  customBackgroundUrl: null,
  avatarType: 'preset',
  selectedAvatarId: 'aila_recruiter',
  customAvatarUrl: null,
  interviewerName: 'Trợ lý AI AILA',
  interviewerTitle: 'Chuyên viên tuyển dụng thông minh',
  updatedAt: new Date().toISOString(),
};

const STORAGE_KEY = 'sq_employer_ai_custom_settings';

export const employerAiSettingService = {
  getSettings: (): EmployerAiSettings => {
    if (typeof window === 'undefined') return DEFAULT_EMPLOYER_AI_SETTINGS;

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return DEFAULT_EMPLOYER_AI_SETTINGS;
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_EMPLOYER_AI_SETTINGS,
        ...parsed,
      };
    } catch {
      return DEFAULT_EMPLOYER_AI_SETTINGS;
    }
  },

  saveSettings: (settings: Partial<EmployerAiSettings>): EmployerAiSettings => {
    if (typeof window === 'undefined') return DEFAULT_EMPLOYER_AI_SETTINGS;

    const current = employerAiSettingService.getSettings();
    const updated: EmployerAiSettings = {
      ...current,
      ...settings,
      updatedAt: new Date().toISOString(),
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('sq-ai-settings-updated', { detail: updated }));
    } catch (e) {
      console.error('Không thể lưu cấu hình AI của Nhà tuyển dụng', e);
    }

    return updated;
  },

  resetSettings: (): EmployerAiSettings => {
    if (typeof window === 'undefined') return DEFAULT_EMPLOYER_AI_SETTINGS;

    try {
      localStorage.removeItem(STORAGE_KEY);
      window.dispatchEvent(new CustomEvent('sq-ai-settings-updated', { detail: DEFAULT_EMPLOYER_AI_SETTINGS }));
    } catch (e) {
      console.error('Không thể đặt lại cấu hình AI', e);
    }

    return DEFAULT_EMPLOYER_AI_SETTINGS;
  },

  resolveActiveBackgroundUrl: (settings?: EmployerAiSettings): string => {
    const s = settings || employerAiSettingService.getSettings();
    if (s.backgroundType === 'custom' && s.customBackgroundUrl) {
      return s.customBackgroundUrl;
    }
    const preset = PRESET_BACKGROUNDS.find((p) => p.id === s.selectedBackgroundId);
    return preset?.url || PRESET_BACKGROUNDS[0].url;
  },

  resolveActiveAvatarUrl: (settings?: EmployerAiSettings): string | null => {
    const s = settings || employerAiSettingService.getSettings();
    if (s.avatarType === 'custom' && s.customAvatarUrl) {
      return s.customAvatarUrl;
    }
    if (s.selectedAvatarId === 'expert_male') {
      return '/assets/images/avatar/expert_male/idle.webp';
    }
    return null;
  },
};

export default employerAiSettingService;
