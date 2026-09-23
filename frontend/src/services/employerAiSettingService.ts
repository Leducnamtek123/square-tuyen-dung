import httpRequest from '../utils/httpRequest';
import type {
  PresetBackground,
  PresetAvatar,
  AilaCharacter,
  DigitalHumanCharacter,
  PresetVoice,
  PresetSpeed,
  HrPersonaPresetId,
  HrPersonaPreset,
  AvatarActionMeta,
  BackgroundType,
  AvatarType,
  EmployerAiSettings,
} from '../types/employerAiSetting';

export type {
  PresetBackground,
  PresetAvatar,
  AilaCharacter,
  DigitalHumanCharacter,
  PresetVoice,
  PresetSpeed,
  HrPersonaPresetId,
  HrPersonaPreset,
  AvatarActionMeta,
  BackgroundType,
  AvatarType,
  EmployerAiSettings,
};


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
    titleVi: 'Nữ chuyên viên tuyển dụng 24 tuổi',
    previewUrl: '/assets/images/avatar/hr/idle.webp?v=20260913_photoreal_v8_uniform',
    descriptionVi: 'Phong thái trẻ trung, nụ cười tươi tắn, gần gũi, phù hợp phỏng vấn Fresher và Junior',
    isFullWebpAnimation: true,
  },
  {
    id: 'expert_male',
    name: 'MINH TRÍ AI',
    titleVi: 'Nam trưởng nhóm tuyển dụng 30 tuổi',
    previewUrl: '/assets/images/avatar/expert_male/idle.webp?v=20260913_photoreal_v7',
    descriptionVi: 'Phong thái chững chạc, quyết đoán, vest cà vạt sang trọng, phù hợp phỏng vấn chuyên viên cấp cao',
    isFullWebpAnimation: true,
  },
  {
    id: 'female_02',
    name: 'MAI LINH AI',
    titleVi: 'Nữ chuyên viên nhân sự 27 tuổi',
    previewUrl: '/assets/images/avatar/female_02/idle.webp?v=20260913_photoreal_v7',
    descriptionVi: 'Phong thái duyên dáng, thanh lịch, nụ cười ấm áp, phù hợp phỏng vấn chuyên viên doanh nghiệp',
    isFullWebpAnimation: true,
  },
  {
    id: 'female_03',
    name: 'THU HƯƠNG AI',
    titleVi: 'Nữ trưởng nhóm tuyển dụng 30 tuổi',
    previewUrl: '/assets/images/avatar/female_03/idle.webp?v=20260913_photoreal_v7',
    descriptionVi: 'Phong thái sắc sảo, tự tin, đĩnh đạc, phù hợp phỏng vấn vị trí Senior và Team Lead',
    isFullWebpAnimation: true,
  },
  {
    id: 'female_04',
    name: 'HỒNG HẠNH AI',
    titleVi: 'Nữ quản lý nhân sự 33 tuổi',
    previewUrl: '/assets/images/avatar/female_04/idle.webp?v=20260913_photoreal_v7',
    descriptionVi: 'Phong thái điềm đạm, nụ cười ấm áp, ánh mắt thấu hiểu, phù hợp phỏng vấn năng lực quản lý',
    isFullWebpAnimation: true,
  },
  {
    id: 'female_05',
    name: 'PHƯƠNG LAN AI',
    titleVi: 'Nữ giám đốc nhân sự 35 tuổi',
    previewUrl: '/assets/images/avatar/female_05/idle.webp?v=20260913_photoreal_v7',
    descriptionVi: 'Phong thái bản lĩnh, uy quyền nhưng hòa nhã, phù hợp phỏng vấn cấp Quản lý và Giám đốc',
    isFullWebpAnimation: true,
  },
  {
    id: 'male_01',
    name: 'TIẾN DŨNG AI',
    titleVi: 'Nam chuyên viên công nghệ 24 tuổi',
    previewUrl: '/assets/images/avatar/male_01/idle.webp?v=20260913_photoreal_v7',
    descriptionVi: 'Phong thái nhiệt huyết, nụ cười rạng rỡ, phù hợp phỏng vấn kỹ sư công nghệ thông tin trẻ',
    isFullWebpAnimation: true,
  },
  {
    id: 'male_02',
    name: 'HOÀNG NAM AI',
    titleVi: 'Nam chuyên viên nhân sự 27 tuổi',
    previewUrl: '/assets/images/avatar/male_02/idle.webp?v=20260913_photoreal_v7',
    descriptionVi: 'Phong thái lịch lãm, tự tin, chỉn chu, phù hợp phỏng vấn tài chính, kinh doanh, kỹ thuật',
    isFullWebpAnimation: true,
  },
  {
    id: 'male_04',
    name: 'QUANG HUY AI',
    titleVi: 'Nam quản lý nhân sự 33 tuổi',
    previewUrl: '/assets/images/avatar/male_04/idle.webp?v=20260913_photoreal_v7',
    descriptionVi: 'Phong thái trí thức, đeo kính gọng mảnh, điềm đạm, phù hợp phỏng vấn kiến trúc sư và quản lý',
    isFullWebpAnimation: true,
  },
  {
    id: 'male_05',
    name: 'ĐỨC THÀNH AI',
    titleVi: 'Nam giám đốc đối tác nhân sự 35 tuổi',
    previewUrl: '/assets/images/avatar/male_05/idle.webp?v=20260913_photoreal_v7',
    descriptionVi: 'Phong thái lãnh đạo cấp cao, vest 3 món sang trọng, phù hợp hội đồng tuyển dụng chiến lược',
    isFullWebpAnimation: true,
  },
];

export const AILA_CHARACTERS: readonly AilaCharacter[] = [
  {
    id: 'ng_c_linh',
    name: 'Ngọc Linh AI',
    titleVi: 'Nữ chuyên viên tuyển dụng cao cấp (Aila)',
    gender: 'female',
    genderVi: 'Nữ',
    avatarId: 'aila_recruiter',
    defaultVoice: 'Trúc Ly',
    techBadges: ['Aila Realtime Lipsync', 'Full HD 60fps'],
    posterUrl: '/assets/avatars/ng_c_linh/actions/portrait.jpg',
    previewUrl: '/assets/avatars/ng_c_linh/actions/idle.mp4',
    descriptionVi: 'Trợ lý AI Aila chuẩn studio, biểu cảm gương mặt tinh tế, tự nhiên và phong thái chuyên nghiệp',
  },
  {
    id: 'expert_male',
    name: 'Minh Trí AI',
    titleVi: 'Nam trưởng nhóm tuyển dụng cấp cao',
    gender: 'male',
    genderVi: 'Nam',
    avatarId: 'expert_male',
    defaultVoice: 'Mạnh Dũng',
    techBadges: ['GPU Realtime Lipsync', 'Full HD 60fps'],
    posterUrl: '/assets/images/avatar/expert_male/idle.webp?v=20260913_photoreal_v7',
    previewUrl: '/assets/avatars/ng_c_linh/actions/idle.mp4',
    descriptionVi: 'Phong thái đĩnh đạc, chững chạc, vest lịch lãm, phù hợp phỏng vấn chuyên viên cấp cao và quản lý',
  },
  {
    id: 'mai_linh',
    name: 'Mai Linh AI',
    titleVi: 'Nữ chuyên viên nhân sự quốc tế',
    gender: 'female',
    genderVi: 'Nữ',
    avatarId: 'female_02',
    defaultVoice: 'Thùy Dung',
    techBadges: ['GPU Realtime Lipsync', 'Full HD 60fps'],
    posterUrl: '/assets/images/avatar/female_02/idle.webp?v=20260913_photoreal_v7',
    previewUrl: '/assets/avatars/ng_c_linh/actions/idle.mp4',
    descriptionVi: 'Phong thái duyên dáng, hòa nhã, chất giọng miền Nam thanh lịch, tạo cảm giác thoải mái cho ứng viên',
  },
  {
    id: 'quang_huy',
    name: 'Quang Huy AI',
    titleVi: 'Nam hội đồng phỏng vấn công nghệ',
    gender: 'male',
    genderVi: 'Nam',
    avatarId: 'male_04',
    defaultVoice: 'Minh Triết',
    techBadges: ['GPU Realtime Lipsync', 'Full HD 60fps'],
    posterUrl: '/assets/images/avatar/male_04/idle.webp?v=20260913_photoreal_v7',
    previewUrl: '/assets/avatars/ng_c_linh/actions/idle.mp4',
    descriptionVi: 'Phong thái trí thức, điềm đạm, chuyên sâu phản biện logic hệ thống và phương pháp tư duy',
  },
];

export const DIGITAL_HUMAN_CHARACTERS = AILA_CHARACTERS;

export const PRESET_VOICES: readonly PresetVoice[] = [
  {
    id: 'Mạnh Dũng',
    name: 'Mạnh Dũng',
    voiceCode: 'vi-VN-Standard-B',
    gender: 'male',
    genderVi: 'Nam',
    region: 'north',
    regionVi: 'Miền Bắc',
    toneVi: 'Đĩnh đạc, chuyên nghiệp',
    descriptionVi: 'Chất giọng nam miền Bắc trầm ấm, phát âm tròn vành rõ chữ, phong thái chững chạc, phù hợp phỏng vấn chuyên môn và quản lý',
    sampleText: 'Chào bạn, chúng ta sẽ bắt đầu buổi phỏng vấn đánh giá năng lực ngay bây giờ.',
    badge: 'Chuyên nghiệp',
  },
  {
    id: 'Minh Triết',
    name: 'Minh Triết',
    voiceCode: 'vi-VN-Standard-B',
    gender: 'male',
    genderVi: 'Nam',
    region: 'south',
    regionVi: 'Miền Nam',
    toneVi: 'Hiện đại, phong độ',
    descriptionVi: 'Chất giọng nam miền Nam hiện đại, phóng khoáng và tự tin, rất phù hợp với vị trí công nghệ, kinh doanh và tiếp thị',
    sampleText: 'Chào bạn, rất vui được gặp bạn trong buổi phỏng vấn trực tuyến hôm nay.',
    badge: 'Hiện đại',
  },
  {
    id: 'Quang Sơn',
    name: 'Quang Sơn',
    voiceCode: 'vi-VN-Standard-D',
    gender: 'male',
    genderVi: 'Nam',
    region: 'central',
    regionVi: 'Miền Trung',
    toneVi: 'Trầm ấm, chân thành',
    descriptionVi: 'Chất giọng nam miền Trung trầm ấm, chân thành và điềm đạm, mang đến bầu không khí trao đổi cởi mở, tin cậy',
    sampleText: 'Chào bạn, chúc bạn có một buổi phỏng vấn tự tin và đạt kết quả tốt nhất.',
    badge: 'Ấm áp',
  },
  {
    id: 'Xuân Vĩnh',
    name: 'Xuân Vĩnh',
    voiceCode: 'vi-VN-Standard-B',
    gender: 'male',
    genderVi: 'Nam',
    region: 'north',
    regionVi: 'Miền Bắc',
    toneVi: 'Trầm sâu, uy quyền',
    descriptionVi: 'Chất giọng nam miền Bắc trầm sâu, phong thái lãnh đạo và quyết đoán, phù hợp phỏng vấn vị trí quản lý và giám đốc',
    sampleText: 'Xin chào, mời bạn giới thiệu ngắn gọn về kinh nghiệm làm việc và các thế mạnh nổi bật của bạn.',
    badge: 'Lãnh đạo',
  },
  {
    id: 'Trúc Ly',
    name: 'Trúc Ly',
    voiceCode: 'vi-VN-Standard-A',
    gender: 'female',
    genderVi: 'Nữ',
    region: 'north',
    regionVi: 'Miền Bắc',
    toneVi: 'Ấm áp, truyền cảm',
    descriptionVi: 'Chất giọng nữ miền Bắc tự nhiên, nhẹ nhàng, phát âm chuẩn xác, tạo thiện cảm và giảm bớt căng thẳng cho ứng viên',
    sampleText: 'Xin chào bạn, tôi là trợ lý AI sẽ đồng hành cùng bạn trong buổi phỏng vấn hôm nay.',
    badge: 'Khuyên dùng',
  },
  {
    id: 'Thùy Dung',
    name: 'Thùy Dung',
    voiceCode: 'vi-VN-Standard-C',
    gender: 'female',
    genderVi: 'Nữ',
    region: 'south',
    regionVi: 'Miền Nam',
    toneVi: 'Thanh lịch, rõ ràng',
    descriptionVi: 'Chất giọng nữ miền Nam thanh lịch, nhịp điệu chuyên nghiệp, rất phù hợp phỏng vấn khối dịch vụ và nhân sự',
    sampleText: 'Chào bạn, rất vui được đồng hành cùng bạn trong phiên trao đổi tuyển dụng ngày hôm nay.',
    badge: 'Thanh lịch',
  },
  {
    id: 'Ngọc Trân',
    name: 'Ngọc Trân',
    voiceCode: 'vi-VN-Standard-C',
    gender: 'female',
    genderVi: 'Nữ',
    region: 'central',
    regionVi: 'Miền Trung',
    toneVi: 'Dịu dàng, nhã nhặn',
    descriptionVi: 'Chất giọng nữ miền Trung dịu dàng, ngữ điệu tinh tế, mang lại trải nghiệm phỏng vấn gần gũi và lịch thiệp',
    sampleText: 'Rất vui được gặp bạn, mời bạn chia sẻ đôi nét về quá trình học tập và làm việc của mình.',
    badge: 'Dịu dàng',
  },
  {
    id: 'Mai Anh',
    name: 'Mai Anh',
    voiceCode: 'vi-VN-Standard-A',
    gender: 'female',
    genderVi: 'Nữ',
    region: 'north',
    regionVi: 'Miền Bắc',
    toneVi: 'Sắc sảo, tự tin',
    descriptionVi: 'Chất giọng nữ miền Bắc tự tin, nhịp điệu nhanh nhẹn và dứt khoát, thích hợp cho các vị trí năng động',
    sampleText: 'Xin chào, mời bạn chia sẻ về những dự án tiêu biểu mà bạn đã từng thực hiện.',
    badge: 'Năng động',
  },
];

export const PRESET_SPEEDS: readonly PresetSpeed[] = [
  {
    value: 0.85,
    label: '0.85x',
    descriptionVi: 'Chậm rãi, dễ nghe',
  },
  {
    value: 1.0,
    label: '1.0x',
    descriptionVi: 'Tiêu chuẩn tự nhiên',
  },
  {
    value: 1.1,
    label: '1.1x',
    descriptionVi: 'Nhanh nhẹn, lưu loát',
  },
  {
    value: 1.15,
    label: '1.15x',
    descriptionVi: 'Dứt khoát, năng động',
  },
];

export const DEFAULT_AVATAR_ACTIONS: Record<string, string> = {
  idle: '/assets/avatars/ng_c_linh/actions/idle.mp4',
  nod: '/assets/avatars/ng_c_linh/actions/nod.mp4',
  thinking: '/assets/avatars/ng_c_linh/actions/thinking.mp4',
  wave: '/assets/avatars/ng_c_linh/actions/wave.mp4',
  thanks_wave: '/assets/avatars/ng_c_linh/actions/thanks_wave.mp4',
};

export const AVATAR_ACTION_METAS: readonly AvatarActionMeta[] = [
  {
    key: 'idle',
    labelVi: 'Chờ & Lắng nghe',
    filename: 'idle.mp4',
    descriptionVi: 'Cử động thở nhẹ và chớp mắt tự nhiên trong lúc lắng nghe ứng viên',
    defaultUrl: '/assets/avatars/ng_c_linh/actions/idle.mp4',
  },
  {
    key: 'nod',
    labelVi: 'Gật đầu tán đồng',
    filename: 'nod.mp4',
    descriptionVi: 'Gật đầu ghi nhận và khuyến khích ứng viên tiếp tục trình bày',
    defaultUrl: '/assets/avatars/ng_c_linh/actions/nod.mp4',
  },
  {
    key: 'thinking',
    labelVi: 'Suy nghĩ & Phân tích',
    filename: 'thinking.mp4',
    descriptionVi: 'Nghiêng đầu tập trung xử lý dữ liệu khi chờ kết quả từ AI',
    defaultUrl: '/assets/avatars/ng_c_linh/actions/thinking.mp4',
  },
  {
    key: 'wave',
    labelVi: 'Vẫy tay chào đón',
    filename: 'wave.mp4',
    descriptionVi: 'Cử chỉ vẫy tay chào tươi tắn khi ứng viên vừa vào phòng phỏng vấn',
    defaultUrl: '/assets/avatars/ng_c_linh/actions/wave.mp4',
  },
  {
    key: 'thanks_wave',
    labelVi: 'Cảm ơn & Chào tạm biệt',
    filename: 'thanks_wave.mp4',
    descriptionVi: 'Mỉm cười cúi chào và vẫy tay cảm ơn khi kết thúc buổi phỏng vấn',
    defaultUrl: '/assets/avatars/ng_c_linh/actions/thanks_wave.mp4',
  },
];

export const PRESET_HR_PERSONAS: readonly HrPersonaPreset[] = [
  {
    id: 'friendly',
    nameVi: 'Thân thiện & Khích lệ',
    taglineVi: 'Tạo không khí cởi mở, giảm bớt căng thẳng cho ứng viên',
    descriptionVi: 'Phong thái nhẹ nhàng, ngôn từ ấm áp, câu hỏi gợi mở, giúp ứng viên tự tin thể hiện tiềm năng tốt nhất.',
    targetCandidateVi: 'Phù hợp phỏng vấn Thực tập sinh, Fresher và các vị trí Junior',
    badge: 'Khuyên dùng cho Fresher',
    systemPromptTemplate: `Bạn là {interviewer_name}, {interviewer_title} tại công ty.
Phong thái phỏng vấn: Thân thiện, ấm áp, kiên nhẫn và luôn khích lệ ứng viên.
Vị trí ứng tuyển: {job_title}. Ứng viên: {candidate_name}.
Quy tắc ứng xử:
1. Luôn mở đầu ngắn gọn, động viên tinh thần trước khi đặt câu hỏi tiếp theo.
2. Đặt câu hỏi gợi mở, nhẹ nhàng nếu ứng viên gặp khó khăn.
3. Câu trả lời và câu hỏi của bạn bắt buộc ngắn gọn, súc tích dưới 25 từ mỗi lượt trao đổi.`,
  },
  {
    id: 'professional',
    nameVi: 'Chuyên nghiệp & Chuẩn mực STAR',
    taglineVi: 'Đánh giá cấu trúc logic và kết quả thực tế qua phương pháp STAR',
    descriptionVi: 'Phong thái đĩnh đạc, khách quan, đào sâu vào Tình huống - Nhiệm vụ - Hành động - Kết quả thực tế.',
    targetCandidateVi: 'Phù hợp phỏng vấn Chuyên viên Mid-level, Kỹ sư Senior và Chuyên viên dự án',
    badge: 'Tiêu chuẩn ngành nhân sự',
    systemPromptTemplate: `Bạn là {interviewer_name}, {interviewer_title} tại công ty.
Phong thái phỏng vấn: Chuyên nghiệp, đĩnh đạc, khách quan và bám sát thực tế.
Vị trí ứng tuyển: {job_title}. Ứng viên: {candidate_name}.
Quy tắc ứng xử:
1. Sử dụng phương pháp STAR gồm Tình huống, Nhiệm vụ, Hành động, Kết quả để khai thác sâu kinh nghiệm thực tế.
2. Yêu cầu số liệu, dẫn chứng thực tế cho các dự án đã triển khai.
3. Câu nói của bạn bắt buộc súc tích, chuyên nghiệp và dưới 25 từ mỗi lượt trao đổi.`,
  },
  {
    id: 'challenger',
    nameVi: 'Thử thách & Đào sâu kỹ thuật',
    taglineVi: 'Phản biện logic, tình huống căng thẳng và kiến trúc hệ thống',
    descriptionVi: 'Phong thái sắc sảo, truy vấn sâu vào tư duy giải quyết vấn đề, kiến trúc hệ thống và khả năng xử lý áp lực.',
    targetCandidateVi: 'Phù hợp phỏng vấn Trưởng nhóm Team Lead, Kỹ sư trưởng và Cấp Quản lý',
    badge: 'Nâng cao cho Quản lý',
    systemPromptTemplate: `Bạn là {interviewer_name}, {interviewer_title} tại công ty.
Phong thái phỏng vấn: Thử thách, sắc sảo, phản biện logic và đánh giá tư duy xử lý áp lực.
Vị trí ứng tuyển: {job_title}. Ứng viên: {candidate_name}.
Quy tắc ứng xử:
1. Đặt các câu hỏi tình huống phức tạp, đào sâu vào các phương án đánh đổi kỹ thuật và tư duy hệ thống.
2. Phản biện các quyết định của ứng viên để kiểm tra độ vững vàng chuyên môn.
3. Câu hỏi và nhận xét bắt buộc đanh thép, súc tích dưới 30 từ mỗi lượt trao đổi.`,
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
  ttsVoice: 'Trúc Ly',
  ttsSpeed: 1.0,
  updatedAt: new Date().toISOString(),

  activeCharacterId: 'ng_c_linh',
  avatarActions: { ...DEFAULT_AVATAR_ACTIONS },
  hrPersonaPreset: 'professional',
  customSystemPrompt: PRESET_HR_PERSONAS[1].systemPromptTemplate,
  defaultScriptId: 1,

  background_type: 'preset',
  selected_background_id: 'modern_office',
  custom_background_url: null,
  avatar_type: 'preset',
  selected_avatar_id: 'aila_recruiter',
  custom_avatar_url: null,
  interviewer_name: 'Trợ lý AI AILA',
  interviewer_title: 'Chuyên viên tuyển dụng thông minh',
  tts_voice: 'Trúc Ly',
  tts_speed: 1.0,
  active_character_id: 'ng_c_linh',
  default_script_id: 1,
  system_prompt: PRESET_HR_PERSONAS[1].systemPromptTemplate,
};

const STORAGE_KEY = 'sq_employer_ai_custom_settings';

export function mapBackendToSettings(raw: unknown, current: EmployerAiSettings): EmployerAiSettings {
  if (!raw || typeof raw !== 'object') return current;
  const data = raw as Record<string, unknown>;

  const backgroundType = ((data.background_type ?? data.backgroundType) || current.backgroundType) as EmployerAiSettings['backgroundType'];
  const selectedBackgroundId = data.selected_background_id !== undefined && data.selected_background_id !== null
    ? String(data.selected_background_id)
    : (data.selectedBackgroundId !== undefined && data.selectedBackgroundId !== null
      ? String(data.selectedBackgroundId)
      : current.selectedBackgroundId);
  const customBackgroundUrl = data.custom_background_url !== undefined
    ? (data.custom_background_url as string | null)
    : (data.customBackgroundUrl !== undefined
      ? (data.customBackgroundUrl as string | null)
      : current.customBackgroundUrl);
  const avatarType = ((data.avatar_type ?? data.avatarType) || current.avatarType) as EmployerAiSettings['avatarType'];
  const selectedAvatarId = data.selected_avatar_id !== undefined && data.selected_avatar_id !== null
    ? String(data.selected_avatar_id)
    : (data.selectedAvatarId !== undefined && data.selectedAvatarId !== null
      ? String(data.selectedAvatarId)
      : current.selectedAvatarId);
  const customAvatarUrl = data.custom_avatar_url !== undefined
    ? (data.custom_avatar_url as string | null)
    : (data.customAvatarUrl !== undefined
      ? (data.customAvatarUrl as string | null)
      : current.customAvatarUrl);
  const interviewerName = String((data.interviewer_name ?? data.interviewerName) || current.interviewerName);
  const interviewerTitle = String((data.interviewer_title ?? data.interviewerTitle) || current.interviewerTitle);
  const ttsVoice = String((data.tts_voice ?? data.ttsVoice) || current.ttsVoice);
  const ttsSpeed = typeof (data.tts_speed ?? data.ttsSpeed) === 'number'
    ? Number(data.tts_speed ?? data.ttsSpeed)
    : current.ttsSpeed;
  const activeCharacterId = (data.active_character_id ?? data.activeCharacterId ?? current.activeCharacterId) as string | undefined;
  const defaultScriptId = (data.default_script_id !== undefined ? data.default_script_id : (data.defaultScriptId !== undefined ? data.defaultScriptId : current.defaultScriptId)) as number | string | null | undefined;
  const customSystemPrompt = (data.system_prompt ?? data.custom_system_prompt ?? data.customSystemPrompt ?? data.systemPrompt ?? current.customSystemPrompt) as string | undefined;
  const hrPersonaPreset = (data.hr_persona_preset ?? data.hrPersonaPreset ?? current.hrPersonaPreset) as EmployerAiSettings['hrPersonaPreset'];
  const avatarActions = (data.avatar_actions ?? data.avatarActions ?? current.avatarActions) as Record<string, string> | undefined;
  const updatedAt = String(data.updated_at ?? data.updatedAt ?? new Date().toISOString());

  return {
    ...current,
    backgroundType,
    selectedBackgroundId,
    customBackgroundUrl,
    avatarType,
    selectedAvatarId,
    customAvatarUrl,
    interviewerName,
    interviewerTitle,
    ttsVoice,
    ttsSpeed,
    activeCharacterId,
    defaultScriptId,
    customSystemPrompt,
    hrPersonaPreset,
    avatarActions,
    updatedAt,

    background_type: backgroundType,
    selected_background_id: selectedBackgroundId,
    custom_background_url: customBackgroundUrl,
    avatar_type: avatarType,
    selected_avatar_id: selectedAvatarId,
    custom_avatar_url: customAvatarUrl,
    interviewer_name: interviewerName,
    interviewer_title: interviewerTitle,
    tts_voice: ttsVoice,
    tts_speed: ttsSpeed,
    active_character_id: activeCharacterId,
    default_script_id: defaultScriptId,
    system_prompt: customSystemPrompt,
    updated_at: updatedAt,
  };
}

export function mapSettingsToBackendPayload(partial: Partial<EmployerAiSettings>): Record<string, unknown> {
  const payload: Record<string, unknown> = {};

  if (partial.interviewerName !== undefined) payload.interviewer_name = partial.interviewerName;
  else if (partial.interviewer_name !== undefined) payload.interviewer_name = partial.interviewer_name;

  if (partial.interviewerTitle !== undefined) payload.interviewer_title = partial.interviewerTitle;
  else if (partial.interviewer_title !== undefined) payload.interviewer_title = partial.interviewer_title;

  if (partial.backgroundType !== undefined) payload.background_type = partial.backgroundType;
  else if (partial.background_type !== undefined) payload.background_type = partial.background_type;

  if (partial.selectedBackgroundId !== undefined) payload.selected_background_id = partial.selectedBackgroundId;
  else if (partial.selected_background_id !== undefined) payload.selected_background_id = partial.selected_background_id;

  if (partial.customBackgroundUrl !== undefined) payload.custom_background_url = partial.customBackgroundUrl;
  else if (partial.custom_background_url !== undefined) payload.custom_background_url = partial.custom_background_url;

  if (partial.avatarType !== undefined) payload.avatar_type = partial.avatarType;
  else if (partial.avatar_type !== undefined) payload.avatar_type = partial.avatar_type;

  if (partial.activeCharacterId !== undefined) payload.active_character_id = partial.activeCharacterId;
  else if (partial.active_character_id !== undefined) payload.active_character_id = partial.active_character_id;

  if (partial.selectedAvatarId !== undefined) payload.selected_avatar_id = partial.selectedAvatarId;
  else if (partial.selected_avatar_id !== undefined) payload.selected_avatar_id = partial.selected_avatar_id;

  if (partial.customAvatarUrl !== undefined) payload.custom_avatar_url = partial.customAvatarUrl;
  else if (partial.custom_avatar_url !== undefined) payload.custom_avatar_url = partial.custom_avatar_url;

  if (partial.ttsVoice !== undefined) payload.tts_voice = partial.ttsVoice;
  else if (partial.tts_voice !== undefined) payload.tts_voice = partial.tts_voice;

  if (partial.ttsSpeed !== undefined) payload.tts_speed = partial.ttsSpeed;
  else if (partial.tts_speed !== undefined) payload.tts_speed = partial.tts_speed;

  if (partial.customSystemPrompt !== undefined) payload.system_prompt = partial.customSystemPrompt;
  else if (partial.system_prompt !== undefined) payload.system_prompt = partial.system_prompt;

  if (partial.defaultScriptId !== undefined) payload.default_script_id = partial.defaultScriptId;
  else if (partial.default_script_id !== undefined) payload.default_script_id = partial.default_script_id;

  return payload;
}

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

  getSettingsAsync: async (): Promise<EmployerAiSettings> => {
    try {
      const response = await httpRequest.get('profiles/company/ai-settings/');
      const current = employerAiSettingService.getSettings();
      const rawData =
        response && typeof response === 'object' && 'data' in response && response.data && typeof response.data === 'object' && !('backgroundType' in response) && !('background_type' in response)
          ? response.data
          : response;
      const merged = mapBackendToSettings(rawData, current);
      employerAiSettingService.saveSettings(merged);
      return merged;
    } catch (error) {
      console.warn('Không thể tải cấu hình AI từ máy chủ, sử dụng dữ liệu ngoại tuyến:', error);
      return employerAiSettingService.getSettings();
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

    if (settings.backgroundType !== undefined) updated.background_type = settings.backgroundType;
    if (settings.selectedBackgroundId !== undefined) updated.selected_background_id = settings.selectedBackgroundId;
    if (settings.customBackgroundUrl !== undefined) updated.custom_background_url = settings.customBackgroundUrl;
    if (settings.avatarType !== undefined) updated.avatar_type = settings.avatarType;
    if (settings.selectedAvatarId !== undefined) updated.selected_avatar_id = settings.selectedAvatarId;
    if (settings.customAvatarUrl !== undefined) updated.custom_avatar_url = settings.customAvatarUrl;
    if (settings.interviewerName !== undefined) updated.interviewer_name = settings.interviewerName;
    if (settings.interviewerTitle !== undefined) updated.interviewer_title = settings.interviewerTitle;
    if (settings.ttsVoice !== undefined) updated.tts_voice = settings.ttsVoice;
    if (settings.ttsSpeed !== undefined) updated.tts_speed = settings.ttsSpeed;
    if (settings.customSystemPrompt !== undefined) updated.system_prompt = settings.customSystemPrompt;
    if (settings.defaultScriptId !== undefined) updated.default_script_id = settings.defaultScriptId;
    if (settings.activeCharacterId !== undefined) updated.active_character_id = settings.activeCharacterId;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('sq-ai-settings-updated', { detail: updated }));
    } catch (e) {
      console.error('Không thể lưu cấu hình AI của Nhà tuyển dụng', e);
    }

    return updated;
  },

  saveSettingsAsync: async (partial: Partial<EmployerAiSettings>): Promise<EmployerAiSettings> => {
    // 1. Optimistic update to localStorage
    const optimistic = employerAiSettingService.saveSettings(partial);

    // 2. Dispatch patch to backend API
    try {
      const payload = mapSettingsToBackendPayload(partial);
      const response = await httpRequest.patch('profiles/company/ai-settings/', payload);
      if (response) {
        const rawData =
          response && typeof response === 'object' && 'data' in response && response.data && typeof response.data === 'object' && !('backgroundType' in response) && !('background_type' in response)
            ? response.data
            : response;
        const merged = mapBackendToSettings(rawData, optimistic);
        employerAiSettingService.saveSettings(merged);
        return merged;
      }
    } catch (error) {
      console.warn('Không thể lưu cấu hình AI lên máy chủ, sử dụng cấu hình ngoại tuyến:', error);
    }

    return optimistic;
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
      return '/assets/images/avatar/expert_male/idle.webp?v=20260913_bust_v3';
    }
    if (s.selectedAvatarId && s.selectedAvatarId !== 'aila_recruiter') {
      const found = PRESET_AVATARS.find((p) => p.id === s.selectedAvatarId);
      if (found) {
        return found.previewUrl;
      }
    }
    return null;
  },

  resolveActiveAvatarId: (settings?: EmployerAiSettings): string => {
    const s = settings || employerAiSettingService.getSettings();
    if (s.avatarType === 'preset') {
      return s.selectedAvatarId || 'aila_recruiter';
    }
    return 'aila_recruiter';
  },

  resolveVoiceName: (voiceIdOrCode?: string): string => {
    if (!voiceIdOrCode) return 'Trúc Ly';
    if (voiceIdOrCode === 'vi-VN-Standard-A') return 'Trúc Ly';
    if (voiceIdOrCode === 'vi-VN-Standard-B' || voiceIdOrCode === 'Nam Minh') return 'Mạnh Dũng';
    if (voiceIdOrCode === 'vi-VN-Standard-C' || voiceIdOrCode === 'Mai Phương') return 'Thùy Dung';
    if (voiceIdOrCode === 'vi-VN-Standard-D' || voiceIdOrCode === 'Quang Dũng') return 'Quang Sơn';
    if (voiceIdOrCode === 'Minh Quang') return 'Minh Triết';
    const match = PRESET_VOICES.find((v) => v.id === voiceIdOrCode || v.name === voiceIdOrCode);
    return match?.name || voiceIdOrCode;
  },

  getPresetVoice: (voiceIdOrCode?: string): PresetVoice | undefined => {
    const name = employerAiSettingService.resolveVoiceName(voiceIdOrCode);
    return PRESET_VOICES.find((v) => v.name === name || v.id === name);
  },

  suggestVoiceForAvatar: (avatarId: string): string => {
    const isMale = avatarId === 'expert_male' || avatarId.startsWith('male_');
    return isMale ? 'Mạnh Dũng' : 'Trúc Ly';
  },

  resolveActiveCharacterId: (settings?: EmployerAiSettings): string => {
    const s = settings || employerAiSettingService.getSettings();
    return s.activeCharacterId || 'ng_c_linh';
  },

  resolveAvatarActionUrl: (actionKey: string, settings?: EmployerAiSettings): string => {
    const s = settings || employerAiSettingService.getSettings();
    if (s.avatarActions && s.avatarActions[actionKey]) {
      return s.avatarActions[actionKey];
    }
    return DEFAULT_AVATAR_ACTIONS[actionKey] || `/assets/avatars/ng_c_linh/actions/${actionKey}.mp4`;
  },

  getHrPersonaPreset: (id?: string): HrPersonaPreset | undefined => {
    if (!id) return PRESET_HR_PERSONAS[1];
    return PRESET_HR_PERSONAS.find((p) => p.id === id);
  },
};

export default employerAiSettingService;
