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
    url: '/images/avatar/ai-interview-office-bg.jpg',
    descriptionVi: 'Phòng họp kính hướng nhìn quang cảnh thành phố chuẩn doanh nghiệp quốc tế',
    badge: 'Khuyên dùng',
  },
  {
    id: 'studio_tech',
    nameVi: 'Studio công nghệ',
    nameEn: 'Deep Tech Studio',
    url: '/images/avatar/ai-interview-office-bg.jpg',
    descriptionVi: 'Không gian phỏng vấn công nghệ cao với ánh sáng xanh vi mô sang trọng',
    badge: 'Chuyên nghiệp',
  },
  {
    id: 'executive_boardroom',
    nameVi: 'Phòng hội đồng quản trị',
    nameEn: 'Executive Boardroom',
    url: '/images/avatar/ai-interview-office-bg.jpg',
    descriptionVi: 'Bối cảnh trang trọng phù hợp các vị trí quản lý và chuyên gia cấp cao',
    badge: 'Trang trọng',
  },
  {
    id: 'minimalist_clean',
    nameVi: 'Tối giản thanh lịch',
    nameEn: 'Minimalist Workspace',
    url: '/images/avatar/ai-interview-office-bg.jpg',
    descriptionVi: 'Tông màu trung tính giúp ứng viên tập trung tối đa vào phần trả lời',
    badge: 'Tập trung',
  },
];

export const PRESET_AVATARS: readonly PresetAvatar[] = [
  {
    id: 'aila_recruiter',
    name: 'AILA AI',
    titleVi: 'Chuyên viên tuyển dụng cao cấp',
    previewUrl: '/assets/images/avatar/hr/idle.webp',
    descriptionVi: 'Bộ ảnh đại diện WebP 22 trạng thái biểu cảm cử động nhép môi chân thực',
    isFullWebpAnimation: true,
  },
  {
    id: 'ai_expert',
    name: 'Chuyên gia AI',
    titleVi: 'Hội đồng phỏng vấn kỹ thuật',
    previewUrl: '/assets/images/avatar/hr/serious.webp',
    descriptionVi: 'Phong cách đánh giá kỹ thuật chuyên sâu và nghiêm túc',
    isFullWebpAnimation: true,
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

  resolveActiveAvatarUrl: (settings?: EmployerAiSettings): string => {
    const s = settings || employerAiSettingService.getSettings();
    if (s.avatarType === 'custom' && s.customAvatarUrl) {
      return s.customAvatarUrl;
    }
    const preset = PRESET_AVATARS.find((p) => p.id === s.selectedAvatarId);
    return preset?.previewUrl || PRESET_AVATARS[0].previewUrl;
  },
};

export default employerAiSettingService;
