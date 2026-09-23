/**
 * interviewScriptService.ts - Service for AI Interview Scripts Management
 * Calls /api/v1/interview/web/scripts/ with transparent fallback to local/mock data
 */

import httpRequest from '../utils/httpRequest';
import type {
  InterviewScript,
  InterviewScriptInput,
  GetScriptsParams,
} from '../types/interviewScript';

const SCRIPT_STORAGE_KEY = 'infohr_employer_interview_scripts_v1';

// 5 System Presets defined in docs/superpowers/specs/2026-09-23-interview-scripts-management-design.md
export const SYSTEM_PRESET_SCRIPTS: InterviewScript[] = [
  {
    id: 1,
    name: 'Kịch bản Sơ loại Kỹ thuật & Kiến trúc Hệ thống',
    slug: 'kich-ban-so-loai-ky-thuat-kien-truc-he-thong',
    description: 'Thử thách chuyên sâu kiến trúc backend, tối ưu hóa cơ sở dữ liệu, giải thuật và năng lực xử lý sự cố quy mô lớn.',
    scenario_type: 'technical',
    scenario_type_display: 'Kỹ thuật chuyên môn',
    hr_persona: 'challenger',
    hr_persona_display: 'Thử thách & Sắc bén',
    system_prompt: 'Bạn là {interviewer_name}, chuyên gia kỹ thuật AI tại {company_name}. Bạn đang phỏng vấn ứng viên {candidate_name} cho vị trí {job_title}. Hãy đào sâu vào các quyết định kỹ thuật, kiến trúc phân tán, khả năng chịu tải và tư duy giải thuật. Đặt câu hỏi phản biện sắc bén, yêu cầu ứng viên bảo vệ giải pháp của mình trước các kịch bản nghẽn cổ chai hoặc sập hệ thống. Giữ phong thái nghiêm túc, tôn trọng và chuyên sâu.',
    greeting_message: 'Xin chào {candidate_name}! Tôi là {interviewer_name}, đại diện hội đồng kỹ thuật từ {company_name}. Hôm nay chúng ta sẽ cùng trao đổi về kiến trúc hệ thống và các trải nghiệm kỹ thuật thực tế cho vị trí {job_title}. Bạn đã sẵn sàng chưa?',
    closing_message: 'Cảm ơn {candidate_name} đã dành thời gian tham gia buổi phỏng vấn kỹ thuật cùng {company_name}. Phần thể hiện của bạn đã được ghi nhận chi tiết. Kết quả và báo cáo đánh giá chuyên sâu sẽ được gửi đến bạn sớm nhất!',
    time_limit_per_question: 180,
    allow_ai_followup: true,
    max_followup_questions: 3,
    questions_count: 5,
    character_id: 'ng_c_linh',
    voice_name: 'Trúc Ly',
    voice_speed: 1.0,
    evaluation_rubric: [
      { criterion: 'Kiến trúc & Thiết kế hệ thống', weight: 40, description: 'Hiểu biết microservices, database sharding, caching, message queue' },
      { criterion: 'Tư duy giải thuật & Tối ưu hóa', weight: 30, description: 'Khả năng phân tích độ phức tạp thời gian/bộ nhớ và tối ưu truy vấn' },
      { criterion: 'Xử lý sự cố & Giám sát hệ thống', weight: 30, description: 'Kinh nghiệm gỡ lỗi race conditions, memory leaks, latency cao' },
    ],
    is_system_preset: true,
    is_active: true,
    canWrite: false,
    create_at: '2026-09-01T08:00:00Z',
    update_at: '2026-09-20T10:00:00Z',
  },
  {
    id: 2,
    name: 'Kịch bản Phỏng vấn Hành vi & Văn hóa (Mô hình STAR)',
    slug: 'kich-ban-phong-van-hanh-vi-van-hoa-star',
    description: 'Đánh giá sự phù hợp văn hóa, tinh thần làm việc nhóm, tinh thần trách nhiệm và khả năng giải quyết xung đột dựa trên dẫn chứng thực tế.',
    scenario_type: 'behavioral',
    scenario_type_display: 'Hành vi & Văn hóa',
    hr_persona: 'professional',
    hr_persona_display: 'Chuyên nghiệp & Chuẩn mực',
    system_prompt: 'Bạn là {interviewer_name}, chuyên viên nhân sự cấp cao tại {company_name}. Hãy phỏng vấn ứng viên {candidate_name} cho vị trí {job_title} theo mô hình STAR (Situation - Task - Action - Result). Yêu cầu ứng viên đưa ra dẫn chứng hành vi cụ thể trong quá khứ thay vì các câu trả lời lý thuyết chung chung. Đào sâu vào cách ứng viên tương tác với đồng nghiệp khi có bất đồng quan điểm.',
    greeting_message: 'Chào {candidate_name}! Chào mừng bạn đến với buổi phỏng vấn đánh giá mức độ phù hợp văn hóa tại {company_name}. Tôi là {interviewer_name}. Chúng ta sẽ trao đổi về các tình huống và trải nghiệm thực tế bạn từng trải qua trong công việc.',
    closing_message: 'Rất cảm ơn những chia sẻ chân thành và cởi mở từ {candidate_name}. Chúc bạn một ngày làm việc tràn đầy năng lượng và hy vọng sớm có cơ hội hợp tác cùng bạn tại {company_name}!',
    time_limit_per_question: 120,
    allow_ai_followup: true,
    max_followup_questions: 2,
    questions_count: 4,
    character_id: 'minh_tri',
    voice_name: 'Mạnh Dũng',
    voice_speed: 1.0,
    evaluation_rubric: [
      { criterion: 'Giao tiếp & Hợp tác đội ngũ', weight: 35, description: 'Khả năng lắng nghe, tôn trọng ý kiến khác biệt và đồng lòng vì mục tiêu chung' },
      { criterion: 'Tinh thần trách nhiệm & Chủ động', weight: 35, description: 'Hành động quyết đoán khi gặp trở ngại, không đùn đẩy trách nhiệm' },
      { criterion: 'Khả năng thích ứng văn hóa', weight: 30, description: 'Sự cởi mở với đổi mới và phù hợp với giá trị cốt lõi của doanh nghiệp' },
    ],
    is_system_preset: true,
    is_active: true,
    canWrite: false,
    create_at: '2026-09-02T09:00:00Z',
    update_at: '2026-09-21T11:00:00Z',
  },
  {
    id: 3,
    name: 'Kịch bản Bán hàng B2B, Thuyết phục & Xử lý Phản đối',
    slug: 'kich-ban-ban-hang-b2b-thuyet-phuc-xu-ly-phan-doi',
    description: 'Mô phỏng tình huống đàm phán với khách hàng doanh nghiệp khó tính, giải quyết từ chối về giá và kỹ năng chốt hợp đồng lớn.',
    scenario_type: 'sales',
    scenario_type_display: 'Kinh doanh B2B',
    hr_persona: 'challenger',
    hr_persona_display: 'Thử thách & Sắc bén',
    system_prompt: 'Bạn là {interviewer_name}, đóng vai trò Giám đốc Mua hàng khó tính tại một đối tác tiềm năng của {company_name}. Ứng viên {candidate_name} đang ứng tuyển vị trí {job_title}. Hãy liên tục đưa ra các phản đối gay gắt về ngân sách, rủi ro triển khai và so sánh với đối thủ cạnh tranh để đo lường phản xạ, sự thấu cảm và kỹ năng bảo vệ giá trị giải pháp của ứng viên.',
    greeting_message: 'Xin chào {candidate_name}! Tôi là {interviewer_name}. Hôm nay chúng ta sẽ bước vào phiên mô phỏng đàm phán thương vụ thực tế cho vị trí {job_title}. Tôi sẽ đóng vai trò khách hàng doanh nghiệp đang cân nhắc giải pháp của bạn.',
    closing_message: 'Phiên mô phỏng đàm phán kết thúc tại đây. Cảm ơn phản xạ nhanh nhạy và sự kiên trì thuyết phục của {candidate_name}!',
    time_limit_per_question: 90,
    allow_ai_followup: true,
    max_followup_questions: 2,
    questions_count: 5,
    character_id: 'ng_c_linh',
    voice_name: 'Mai Phương',
    voice_speed: 1.05,
    evaluation_rubric: [
      { criterion: 'Xử lý phản đối (Objection Handling)', weight: 40, description: 'Điềm tĩnh làm rõ nguyên nhân gốc rễ và chuyển hóa phản đối thành cơ hội' },
      { criterion: 'Khai thác nhu cầu & Đặt câu hỏi mở', weight: 30, description: 'Tìm ra nỗi đau thực sự của khách hàng trước khi đưa ra đề xuất' },
      { criterion: 'Định vị giá trị & Bảo vệ biên lợi nhuận', weight: 30, description: 'Chứng minh ROI thuyết phục, tránh nhượng bộ giảm giá vô tội vạ' },
    ],
    is_system_preset: true,
    is_active: true,
    canWrite: false,
    create_at: '2026-09-03T10:00:00Z',
    update_at: '2026-09-21T14:30:00Z',
  },
  {
    id: 4,
    name: 'Kịch bản Tuyển dụng Fresher / Thực tập sinh Tiềm năng',
    slug: 'kich-ban-tuyen-dung-fresher-thuc-tap-sinh',
    description: 'Tạo bầu không khí gần gũi, khích lệ ứng viên bộc lộ tinh thần học hỏi, nền tảng tư duy cơ bản và đam mê với nghề nghiệp.',
    scenario_type: 'fresher',
    scenario_type_display: 'Fresher / Thực tập sinh',
    hr_persona: 'friendly',
    hr_persona_display: 'Thân thiện & Cởi mở',
    system_prompt: 'Bạn là {interviewer_name}, người hướng dẫn (Mentor) thân thiện tại {company_name}. Hãy phỏng vấn ứng viên {candidate_name} ứng tuyển vị trí Fresher {job_title}. Dùng lời lẽ ấm áp, tích cực động viên để ứng viên giảm bớt căng thẳng. Tập trung vào các dự án cá nhân, đồ án tốt nghiệp, phương pháp tự học công nghệ mới và thái độ đón nhận góp ý.',
    greeting_message: 'Chào {candidate_name}! Đừng quá lo lắng nhé, buổi phỏng vấn hôm nay giống như một buổi trò chuyện để hai bên hiểu rõ hơn về định hướng nghề nghiệp và niềm đam mê của bạn tại {company_name}. Tôi là {interviewer_name}.',
    closing_message: 'Rất vui được trò chuyện và lắng nghe câu chuyện học tập của bạn, {candidate_name}. Chúc bạn luôn giữ vững ngọn lửa nhiệt huyết và tự tin trên bước đường sự nghiệp phía trước!',
    time_limit_per_question: 120,
    allow_ai_followup: true,
    max_followup_questions: 1,
    questions_count: 4,
    character_id: 'ng_c_linh',
    voice_name: 'Thu Ngân',
    voice_speed: 0.95,
    evaluation_rubric: [
      { criterion: 'Khát khao học hỏi & Tư duy phát triển', weight: 40, description: 'Chủ động tìm hiểu công nghệ mới, tinh thần đón nhận phản hồi xây dựng' },
      { criterion: 'Nền tảng kiến thức cốt lõi', weight: 35, description: 'Hiểu đúng và vận dụng được các nguyên lý căn bản của ngành' },
      { criterion: 'Kỷ luật & Tác phong làm việc', weight: 25, description: 'Đúng hẹn, tôn trọng quy chuẩn làm việc và sẵn sàng học hỏi từ đồng đội' },
    ],
    is_system_preset: true,
    is_active: true,
    canWrite: false,
    create_at: '2026-09-04T11:00:00Z',
    update_at: '2026-09-22T08:00:00Z',
  },
  {
    id: 5,
    name: 'Kịch bản Đánh giá Năng lực Quản lý & Lãnh đạo Đội ngũ',
    slug: 'kich-ban-danh-gia-nang-luc-quan-ly-lanh-dao',
    description: 'Thẩm định tầm nhìn chiến lược, kỹ năng phân bổ nguồn lực, quản trị hiệu suất OKR/KPI và giải quyết xung đột nhân sự cấp quản lý.',
    scenario_type: 'leadership',
    scenario_type_display: 'Lãnh đạo & Quản lý',
    hr_persona: 'professional',
    hr_persona_display: 'Chuyên nghiệp & Chuẩn mực',
    system_prompt: 'Bạn là {interviewer_name}, Giám đốc Nhân sự Cấp cao tại {company_name}. Ứng viên {candidate_name} đang ứng tuyển vị trí quản lý {job_title}. Hãy tập trung vào năng lực hoạch định chiến lược, phân quyền hiệu quả, quản trị rủi ro dự án và cách dẫn dắt đội ngũ vượt qua giai đoạn khủng hoảng hoặc áp lực tiến độ.',
    greeting_message: 'Xin chào {candidate_name}. Cảm ơn bạn đã tham gia buổi thảo luận chiến lược nhân sự và quản trị tại {company_name}. Tôi là {interviewer_name}.',
    closing_message: 'Cảm ơn những góc nhìn quản trị sắc bén và trải nghiệm lãnh đạo quý báu từ {candidate_name}. Ban giám đốc {company_name} sẽ sớm phản hồi kết quả tới bạn!',
    time_limit_per_question: 150,
    allow_ai_followup: true,
    max_followup_questions: 2,
    questions_count: 5,
    character_id: 'minh_tri',
    voice_name: 'Mạnh Dũng',
    voice_speed: 1.0,
    evaluation_rubric: [
      { criterion: 'Chiến lược & Hoạch định mục tiêu', weight: 35, description: 'Khả năng chuyển hóa tầm nhìn công ty thành kế hoạch hành động khả thi' },
      { criterion: 'Phát triển nhân tài & Phân quyền', weight: 35, description: 'Biết cách trao quyền, huấn luyện nâng tầm và tạo động lực cho nhân viên' },
      { criterion: 'Quản trị khủng hoảng & Quyết đoán', weight: 30, description: 'Bình tĩnh giải quyết xung đột nội bộ và đưa ra quyết định khó khăn dưới áp lực' },
    ],
    is_system_preset: true,
    is_active: true,
    canWrite: false,
    create_at: '2026-09-05T14:00:00Z',
    update_at: '2026-09-22T09:30:00Z',
  },
];

// Initial company-created script sample
const INITIAL_COMPANY_SCRIPTS: InterviewScript[] = [
  {
    id: 101,
    name: 'Kịch bản Tuyển chọn Frontend React & Next.js Chuyên sâu',
    slug: 'kich-ban-tuyen-chon-frontend-react-nextjs',
    description: 'Kịch bản thiết kế riêng của doanh nghiệp đánh giá chuyên sâu kiến trúc Next.js App Router, SSR performance và tối ưu trải nghiệm giao diện người dùng.',
    scenario_type: 'technical',
    scenario_type_display: 'Kỹ thuật chuyên môn',
    hr_persona: 'professional',
    hr_persona_display: 'Chuyên nghiệp & Chuẩn mực',
    system_prompt: 'Bạn là {interviewer_name}, Trưởng nhóm Kỹ thuật Frontend tại {company_name}. Đang phỏng vấn ứng viên {candidate_name} cho vị trí Frontend Engineer ({job_title}). Tập trung hỏi về React 19, Next.js Server Components, tối ưu hóa Core Web Vitals (LCP, INP, CLS) và quản lý state với TanStack Query. Khuyến khích ứng viên phân tích trade-offs giữa Server-side Rendering và Client-side Rendering.',
    greeting_message: 'Xin chào {candidate_name}! Tôi là {interviewer_name}, phụ trách kỹ thuật Frontend tại {company_name}. Hôm nay chúng ta sẽ cùng đào sâu vào các bài toán giao diện hiện đại và kiến trúc ứng dụng web. Chúc bạn có buổi phỏng vấn thật tự tin!',
    closing_message: 'Buổi phỏng vấn kỹ thuật kết thúc tại đây. Cảm ơn những góc nhìn lập trình sâu sắc của {candidate_name}. Chúc bạn một ngày tốt lành!',
    time_limit_per_question: 150,
    allow_ai_followup: true,
    max_followup_questions: 2,
    questions_count: 4,
    character_id: 'ng_c_linh',
    voice_name: 'Trúc Ly',
    voice_speed: 1.0,
    evaluation_rubric: [
      { criterion: 'Kiến trúc Next.js & React 19', weight: 40, description: 'Hiểu rõ RSC vs Client Component, Streaming SSR, Next.js Caching' },
      { criterion: 'Tối ưu hiệu năng Web & Core Web Vitals', weight: 30, description: 'Kinh nghiệm tối ưu LCP, INP, bundle splitting và memory leak' },
      { criterion: 'Kỹ năng thiết kế UI/UX & Clean Code', weight: 30, description: 'Sử dụng Tailwind CSS, MUI, TypeScript strict mode và a11y' },
    ],
    is_system_preset: false,
    is_active: true,
    canWrite: true,
    create_at: '2026-09-18T10:00:00Z',
    update_at: '2026-09-22T16:00:00Z',
  },
];

// Local storage management helpers
function loadStoredCompanyScripts(): InterviewScript[] {
  if (typeof window === 'undefined') return INITIAL_COMPANY_SCRIPTS;
  try {
    const raw = localStorage.getItem(SCRIPT_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(SCRIPT_STORAGE_KEY, JSON.stringify(INITIAL_COMPANY_SCRIPTS));
      return INITIAL_COMPANY_SCRIPTS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_COMPANY_SCRIPTS;
  } catch {
    return INITIAL_COMPANY_SCRIPTS;
  }
}

function saveStoredCompanyScripts(scripts: InterviewScript[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SCRIPT_STORAGE_KEY, JSON.stringify(scripts));
  } catch (error) {
    console.error('Failed to save company scripts to localStorage', error);
  }
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

export const interviewScriptService = {
  /**
   * Get list of scripts (merges company scripts + system presets)
   * Supports filtering by search, scenario_type, hr_persona, tab
   */
  async getScripts(params: GetScriptsParams = {}): Promise<InterviewScript[]> {
    const { search, scenario_type, hr_persona, tab } = params;

    const cleanParams: Record<string, unknown> = {};
    if (search && search.trim()) cleanParams.search = search.trim();
    if (scenario_type && scenario_type !== 'all') cleanParams.scenario_type = scenario_type;
    if (hr_persona && hr_persona !== 'all') cleanParams.hr_persona = hr_persona;
    if (tab && tab !== 'all') cleanParams.tab = tab;

    let apiScripts: InterviewScript[] | null = null;
    try {
      // Primary REST API call: /api/v1/interview/web/scripts/
      const res = await httpRequest.get('interview/web/scripts/', { params: cleanParams });
      if (res && Array.isArray(res.data)) {
        apiScripts = res.data;
      } else if (res && Array.isArray(res.results)) {
        apiScripts = res.results;
      } else if (Array.isArray(res)) {
        apiScripts = res;
      }
    } catch {
      // Network or API not deployed yet — use local fallback
      apiScripts = null;
    }

    // Combine presets and company scripts
    const companyScripts = loadStoredCompanyScripts();
    let allScripts: InterviewScript[] = apiScripts && apiScripts.length > 0
      ? apiScripts
      : [...SYSTEM_PRESET_SCRIPTS, ...companyScripts];

    // Apply filtering
    if (tab === 'company') {
      allScripts = allScripts.filter((s) => !s.is_system_preset);
    } else if (tab === 'system') {
      allScripts = allScripts.filter((s) => s.is_system_preset);
    }

    if (scenario_type && scenario_type !== 'all') {
      allScripts = allScripts.filter((s) => s.scenario_type === scenario_type);
    }

    if (hr_persona && hr_persona !== 'all') {
      allScripts = allScripts.filter((s) => s.hr_persona === hr_persona);
    }

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      allScripts = allScripts.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q) ||
          s.scenario_type.toLowerCase().includes(q)
      );
    }

    return allScripts;
  },

  /**
   * Get single script detail by ID
   */
  async getScriptDetail(id: number | string): Promise<InterviewScript> {
    const numId = Number(id);

    try {
      const res = await httpRequest.get(`interview/web/scripts/${id}/`);
      if (res && res.data) return res.data;
      if (res && res.id) return res;
    } catch {
      // Fallback
    }

    // Search system presets
    const foundPreset = SYSTEM_PRESET_SCRIPTS.find((s) => s.id === numId);
    if (foundPreset) return foundPreset;

    // Search company scripts
    const companyScripts = loadStoredCompanyScripts();
    const foundCompany = companyScripts.find((s) => s.id === numId);
    if (foundCompany) return foundCompany;

    throw new Error(`Không tìm thấy kịch bản với mã ${id}`);
  },

  /**
   * Create new interview script
   */
  async createScript(input: InterviewScriptInput): Promise<InterviewScript> {
    const newId = Date.now();
    const newScript: InterviewScript = {
      id: newId,
      name: input.name,
      slug: slugify(input.name),
      description: input.description || '',
      scenario_type: input.scenario_type,
      hr_persona: input.hr_persona,
      system_prompt: input.system_prompt,
      greeting_message: input.greeting_message || '',
      closing_message: input.closing_message || '',
      time_limit_per_question: input.time_limit_per_question ?? 120,
      allow_ai_followup: input.allow_ai_followup ?? true,
      max_followup_questions: input.max_followup_questions ?? 2,
      question_group: input.question_group ?? null,
      questions: input.question_ids ?? [],
      questions_count: input.question_ids?.length ?? 0,
      character_id: input.character_id || 'ng_c_linh',
      voice_name: input.voice_name || 'Trúc Ly',
      voice_speed: input.voice_speed ?? 1.0,
      evaluation_rubric: input.evaluation_rubric || [],
      is_system_preset: false,
      is_active: input.is_active ?? true,
      canWrite: true,
      create_at: new Date().toISOString(),
      update_at: new Date().toISOString(),
    };

    // Save to local storage
    const current = loadStoredCompanyScripts();
    const updated = [newScript, ...current];
    saveStoredCompanyScripts(updated);

    // Try posting to API
    try {
      const res = await httpRequest.post('interview/web/scripts/', input);
      if (res && (res.data || res.id)) {
        return res.data || res;
      }
    } catch {
      // Local copy is already saved
    }

    return newScript;
  },

  /**
   * Update existing script
   */
  async updateScript(id: number | string, input: Partial<InterviewScriptInput>): Promise<InterviewScript> {
    const numId = Number(id);

    // Update in local storage
    const current = loadStoredCompanyScripts();
    const index = current.findIndex((s) => s.id === numId);

    if (index === -1) {
      // Check if trying to edit system preset
      const isPreset = SYSTEM_PRESET_SCRIPTS.some((s) => s.id === numId);
      if (isPreset) {
        throw new Error('Kịch bản mẫu của hệ thống không thể chỉnh sửa trực tiếp. Hãy bấm "Nhân bản" để tạo bản sao riêng!');
      }
      throw new Error(`Không tìm thấy kịch bản mã ${id} để cập nhật`);
    }

    const target = current[index];
    const updatedScript: InterviewScript = {
      ...target,
      ...input,
      slug: input.name ? slugify(input.name) : target.slug,
      update_at: new Date().toISOString(),
    };

    current[index] = updatedScript;
    saveStoredCompanyScripts(current);

    // Try API
    try {
      const res = await httpRequest.put(`interview/web/scripts/${id}/`, input);
      if (res && (res.data || res.id)) {
        return res.data || res;
      }
    } catch {
      // Local copy updated
    }

    return updatedScript;
  },

  /**
   * Delete an existing script
   */
  async deleteScript(id: number | string): Promise<void> {
    const numId = Number(id);

    // Check system presets
    const isPreset = SYSTEM_PRESET_SCRIPTS.some((s) => s.id === numId);
    if (isPreset) {
      throw new Error('Không thể xóa kịch bản mẫu chuẩn của hệ thống');
    }

    const current = loadStoredCompanyScripts();
    const filtered = current.filter((s) => s.id !== numId);
    saveStoredCompanyScripts(filtered);

    // Try API
    try {
      await httpRequest.delete(`interview/web/scripts/${id}/`);
    } catch {
      // Ignore API failure in offline/mock mode
    }
  },

  /**
   * 1-Click clone a script (Preset or existing company script) into a new company script
   */
  async cloneScript(id: number | string): Promise<InterviewScript> {
    const source = await this.getScriptDetail(id);

    const clonedId = Date.now();
    const clonedName = `${source.name} (Bản sao)`;
    const clonedScript: InterviewScript = {
      ...source,
      id: clonedId,
      name: clonedName,
      slug: slugify(clonedName),
      is_system_preset: false,
      canWrite: true,
      create_at: new Date().toISOString(),
      update_at: new Date().toISOString(),
    };

    const current = loadStoredCompanyScripts();
    const updated = [clonedScript, ...current];
    saveStoredCompanyScripts(updated);

    // Try API clone endpoint
    try {
      const res = await httpRequest.post(`interview/web/scripts/${id}/clone/`);
      if (res && (res.data || res.id)) {
        return res.data || res;
      }
    } catch {
      // Local copy saved
    }

    return clonedScript;
  },
};

export default interviewScriptService;
