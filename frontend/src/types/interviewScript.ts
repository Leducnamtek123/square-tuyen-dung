/**
 * interviewScript.ts - Type definitions for AI Interview Script / Scenario Management
 * Follows spec: docs/superpowers/specs/2026-09-23-interview-scripts-management-design.md
 */

export type ScenarioType =
  | 'technical'
  | 'behavioral'
  | 'sales'
  | 'fresher'
  | 'leadership'
  | 'situational'
  | 'custom';

export type HrPersona = 'friendly' | 'professional' | 'challenger';

export interface EvaluationCriterion {
  criterion: string;
  weight: number; // Percentage 0 - 100
  description?: string;
}

export interface ScriptQuestion {
  id: number;
  text: string;
  category?: string;
  difficulty?: number;
  default_duration_seconds?: number;
  [key: string]: unknown;
}

export interface InterviewScript {
  id: number;
  name: string;
  slug: string;
  description: string;
  scenario_type: ScenarioType;
  scenario_type_display?: string;
  hr_persona: HrPersona;
  hr_persona_display?: string;
  system_prompt: string;
  greeting_message: string;
  closing_message: string;
  time_limit_per_question: number; // in seconds, default 120
  allow_ai_followup: boolean; // default true
  max_followup_questions: number; // default 2
  question_group?: number | null | { id: number; name: string };
  question_group_name?: string;
  questions?: ScriptQuestion[] | number[];
  question_details?: ScriptQuestion[];
  questions_count?: number;
  character_id: string; // e.g. 'ng_c_linh', 'minh_tri'
  voice_name: string; // e.g. 'Trúc Ly', 'Mạnh Dũng'
  voice_speed: number; // default 1.0
  evaluation_rubric?: EvaluationCriterion[] | Record<string, unknown>;
  is_system_preset: boolean;
  is_active: boolean;
  canWrite?: boolean;
  company?: number | null | { id: number; name: string };
  author?: number | null | { id: number; username: string; full_name?: string };
  create_at?: string;
  update_at?: string;

  // CamelCase accessors for seamless compatibility
  scenarioType?: ScenarioType;
  hrPersona?: HrPersona;
  systemPrompt?: string;
  greetingMessage?: string;
  closingMessage?: string;
  timeLimitPerQuestion?: number;
  allowAiFollowup?: boolean;
  maxFollowupQuestions?: number;
  questionGroup?: number | null | { id: number; name: string };
  questionGroupName?: string;
  questionDetails?: ScriptQuestion[];
  questionsCount?: number;
  characterId?: string;
  voiceName?: string;
  voiceSpeed?: number;
  evaluationRubric?: EvaluationCriterion[] | Record<string, unknown>;
  isSystemPreset?: boolean;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface InterviewScriptInput {
  name: string;
  description?: string;
  scenario_type: ScenarioType;
  hr_persona: HrPersona;
  system_prompt: string;
  greeting_message?: string;
  closing_message?: string;
  time_limit_per_question?: number;
  allow_ai_followup?: boolean;
  max_followup_questions?: number;
  question_group?: number | null;
  question_group_name?: string;
  question_ids?: number[];
  question_details?: ScriptQuestion[];
  character_id?: string;
  voice_name?: string;
  voice_speed?: number;
  evaluation_rubric?: EvaluationCriterion[] | Record<string, unknown>;
  is_active?: boolean;

  // CamelCase accessors
  scenarioType?: ScenarioType;
  hrPersona?: HrPersona;
  systemPrompt?: string;
  greetingMessage?: string;
  closingMessage?: string;
  timeLimitPerQuestion?: number;
  allowAiFollowup?: boolean;
  maxFollowupQuestions?: number;
  questionGroup?: number | null;
  questionGroupName?: string;
  questionIds?: number[];
  questionDetails?: ScriptQuestion[];
  characterId?: string;
  voiceName?: string;
  voiceSpeed?: number;
  evaluationRubric?: EvaluationCriterion[] | Record<string, unknown>;
  isActive?: boolean;
}

export interface GetScriptsParams {
  search?: string;
  scenario_type?: string;
  hr_persona?: string;
  is_system_preset?: boolean | string;
  tab?: 'all' | 'company' | 'system';
  page?: number;
  pageSize?: number;
  ordering?: string;
}

// Meta configurations for Scenarios
export interface ScenarioMeta {
  type: ScenarioType;
  label: string;
  shortLabel: string;
  description: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

export const SCENARIO_OPTIONS: readonly ScenarioMeta[] = [
  {
    type: 'technical',
    label: 'Kỹ thuật & Kiến trúc chuyên môn',
    shortLabel: 'Kỹ thuật',
    description: 'Thử thách chuyên sâu về giải thuật, kiến trúc hệ thống và xử lý sự cố quy mô lớn',
    color: '#4f46e5',
    bgColor: '#eef2ff',
    borderColor: '#c7d2fe',
  },
  {
    type: 'behavioral',
    label: 'Hành vi & Văn hóa (STAR)',
    shortLabel: 'Hành vi (STAR)',
    description: 'Đánh giá tinh thần đồng đội, xử lý mâu thuẫn và mức độ phù hợp văn hóa',
    color: '#7c3aed',
    bgColor: '#f5f3ff',
    borderColor: '#ddd6fe',
  },
  {
    type: 'sales',
    label: 'Kinh doanh B2B & CSKH',
    shortLabel: 'Bán hàng B2B',
    description: 'Đánh giá kỹ năng đàm phán, xử lý từ chối và chốt thương vụ khách hàng',
    color: '#059669',
    bgColor: '#ecfdf5',
    borderColor: '#a7f3d0',
  },
  {
    type: 'fresher',
    label: 'Tuyển dụng Fresher / Thực tập sinh',
    shortLabel: 'Fresher / Intern',
    description: 'Đánh giá tư duy nền tảng, tinh thần tự học và tiềm năng phát triển dài hạn',
    color: '#d97706',
    bgColor: '#fffbeb',
    borderColor: '#fde68a',
  },
  {
    type: 'leadership',
    label: 'Lãnh đạo & Quản lý cấp trung',
    shortLabel: 'Quản lý / Lead',
    description: 'Thẩm định khả năng phân bổ nguồn lực, dẫn dắt đội ngũ và giải quyết xung đột',
    color: '#e11d48',
    bgColor: '#fff1f2',
    borderColor: '#fecdd3',
  },
  {
    type: 'situational',
    label: 'Xử lý tình huống nghiệp vụ',
    shortLabel: 'Tình huống',
    description: 'Mô phỏng các bài toán hóc búa phát sinh tức thời trong vận hành',
    color: '#0284c7',
    bgColor: '#f0f9ff',
    borderColor: '#bae6fd',
  },
  {
    type: 'custom',
    label: 'Kịch bản tùy biến',
    shortLabel: 'Tùy biến',
    description: 'Kịch bản do doanh nghiệp tự do định nghĩa toàn bộ quy trình',
    color: '#475569',
    bgColor: '#f8fafc',
    borderColor: '#cbd5e1',
  },
];

// Meta configurations for HR Personas
export interface HrPersonaMeta {
  persona: HrPersona;
  label: string;
  tagline: string;
  badgeColor: string;
  badgeBg: string;
  borderColor: string;
  iconName: string;
}

export const HR_PERSONA_OPTIONS: readonly HrPersonaMeta[] = [
  {
    persona: 'friendly',
    label: 'Thân thiện & Cởi mở',
    tagline: 'Tạo cảm giác an tâm, khích lệ ứng viên bộc lộ tiềm năng tự nhiên nhất',
    badgeColor: '#059669',
    badgeBg: '#ecfdf5',
    borderColor: '#a7f3d0',
    iconName: 'sentiment_satisfied_alt',
  },
  {
    persona: 'professional',
    label: 'Chuyên nghiệp & Chuẩn mực',
    tagline: 'Lịch sự, khách quan, đào sâu theo khung tiêu chuẩn đánh giá STAR',
    badgeColor: '#2563eb',
    badgeBg: '#eff6ff',
    borderColor: '#bfdbfe',
    iconName: 'verified',
  },
  {
    persona: 'challenger',
    label: 'Thử thách & Sắc bén',
    tagline: 'Đặt câu hỏi phản biện, kiểm tra phản xạ dưới áp lực cao và sự kiên định',
    badgeColor: '#dc2626',
    badgeBg: '#fef2f2',
    borderColor: '#fecaca',
    iconName: 'psychology',
  },
];

// Dynamic variables for prompt editor
export interface DynamicVariable {
  key: string;
  label: string;
  description: string;
}

export const DYNAMIC_PROMPT_VARIABLES: readonly DynamicVariable[] = [
  {
    key: '{job_title}',
    label: 'Vị trí tuyển dụng',
    description: 'Tên vị trí công việc ứng viên đang ứng tuyển (ví dụ: Senior Backend Engineer)',
  },
  {
    key: '{candidate_name}',
    label: 'Tên ứng viên',
    description: 'Họ và tên của ứng viên tham gia phiên phỏng vấn (ví dụ: Nguyễn Văn A)',
  },
  {
    key: '{company_name}',
    label: 'Tên công ty',
    description: 'Tên doanh nghiệp tổ chức phỏng vấn (ví dụ: InfoHR Technologies)',
  },
  {
    key: '{interviewer_name}',
    label: 'Tên người phỏng vấn AI',
    description: 'Danh xưng hiển thị của AI phỏng vấn (ví dụ: Trợ lý AI AILA)',
  },
  {
    key: '{experience_level}',
    label: 'Cấp bậc yêu cầu',
    description: 'Mức độ thâm niên (ví dụ: Senior, Junior, Team Lead)',
  },
  {
    key: '{key_skills}',
    label: 'Kỹ năng trọng tâm',
    description: 'Danh sách kỹ năng chính cần đánh giá (ví dụ: Python, Microservices, System Design)',
  },
];
