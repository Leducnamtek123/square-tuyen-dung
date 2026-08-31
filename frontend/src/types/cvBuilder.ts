export interface CVExperienceItem {
  id: string;
  sourceEntityId?: number;
  position: string;
  company: string;
  startDate: string;
  endDate: string;
  isCurrent?: boolean;
  description: string;
}

export interface CVEducationItem {
  id: string;
  sourceEntityId?: number;
  school: string;
  major: string;
  degree?: string;
  startDate: string;
  endDate: string;
  gpa?: string;
  description?: string;
}

export interface CVSkillItem {
  id: string;
  sourceEntityId?: number;
  name: string;
  level?: number; // 1 to 5
}

export interface CVCertificateItem {
  id: string;
  sourceEntityId?: number;
  name: string;
  organization: string;
  issueDate: string;
  credentialUrl?: string;
}

export interface CVLanguageItem {
  id: string;
  sourceEntityId?: number;
  name: string;
  proficiency: string; // 'Bản ngữ' | 'Thành thạo' | 'Trung cấp' | 'Cơ bản'
}

export interface CVProjectItem {
  id: string;
  name: string;
  role: string;
  startDate?: string;
  endDate?: string;
  technologies?: string;
  description: string;
  link?: string;
}

export interface CVPersonalInfo {
  fullName: string;
  title: string;
  email: string;
  phoneNumber: string;
  address: string;
  dob?: string;
  gender?: string;
  avatarUrl?: string;
  website?: string;
  linkedin?: string;
  github?: string;
  bio: string;
}

export interface CVThemeConfig {
  primaryColor: string;
  secondaryColor?: string;
  textColor?: string;
  fontFamily: string;
  fontSize: 'small' | 'medium' | 'large';
  spacing: 'compact' | 'normal' | 'relaxed';
  avatarShape: 'circle' | 'rounded' | 'square';
  showAvatar: boolean;
  paperSize?: 'A4' | 'Letter';
}

export interface CVData {
  id?: string | number;
  title: string;
  templateId: string;
  theme: CVThemeConfig;
  personalInfo: CVPersonalInfo;
  experiences: CVExperienceItem[];
  educations: CVEducationItem[];
  skills: CVSkillItem[];
  languages: CVLanguageItem[];
  certificates: CVCertificateItem[];
  projects: CVProjectItem[];
  updatedAt?: string;
}

export type CVTemplateCategory =
  | 'all'
  | 'simple'
  | 'modern'
  | 'creative'
  | 'professional'
  | 'tech'
  | 'executive'
  | 'classic';

export interface CVTemplateRecord {
  id: number;
  code: string;
  name: string;
  description: string;
  category: string;
  category_name: string;
  thumbnail_url: string | null;
  color_palettes: string[];
  default_theme: Partial<CVThemeConfig>;
  sample_data?: Partial<CVData>;
  is_active: boolean;
  is_premium: boolean;
  is_popular: boolean;
  sort_order: number;
  use_count: number;
  view_count: number;
  create_at?: string;
  update_at?: string;
}

export interface CandidateCVListItem {
  id: number;
  template: number | null;
  template_code: string;
  template_name?: string;
  template_category?: string;
  title: string;
  slug: string;
  thumbnail_url?: string | null;
  pdf_url?: string | null;
  is_main_cv: boolean;
  is_public: boolean;
  views_count: number;
  download_count: number;
  ai_score?: number | null;
  create_at: string;
  update_at: string;
}

export interface AICvReviewResult {
  score: number;
  grade: string;
  badge_color: 'emerald' | 'blue' | 'amber' | 'rose' | string;
  summary_feedback: string;
  breakdown: {
    contact: { score: number; max: number; label: string };
    experience: { score: number; max: number; label: string };
    skills: { score: number; max: number; label: string };
    education: { score: number; max: number; label: string };
    structure: { score: number; max: number; label: string };
  };
  strengths: string[];
  suggestions: {
    category: string;
    priority: 'high' | 'medium' | 'low';
    title: string;
    detail: string;
    example: string;
  }[];
}

export interface CandidateCVRecord {
  id: number;
  user: number;
  template: number | null;
  template_code: string;
  template_info?: CVTemplateRecord;
  title: string;
  slug: string;
  theme_config: CVThemeConfig;
  cv_data: CVData;
  thumbnail_url?: string | null;
  pdf_url?: string | null;
  is_main_cv: boolean;
  is_public: boolean;
  views_count: number;
  download_count: number;
  ai_score?: number | null;
  ai_review_data?: AICvReviewResult | null;
  create_at: string;
  update_at: string;
}

export interface PublicCVRecord {
  id: number;
  template_code: string;
  template_info?: CVTemplateRecord;
  title: string;
  slug: string;
  theme_config: CVThemeConfig;
  cv_data: CVData;
  thumbnail_url?: string | null;
  pdf_url?: string | null;
  candidate_name?: string;
  create_at: string;
  update_at: string;
}

export interface CVSuggestionRecord {
  id: number;
  industry: string;
  industry_name: string;
  suggestion_type: 'summary' | 'experience' | 'skills';
  title: string;
  content: string;
  skills_list: string[];
  sort_order: number;
}

export interface CVTemplateMeta {
  id: string;
  name: string;
  vietnameseName: string;
  description: string;
  category: CVTemplateCategory;
  thumbnailUrl: string;
  badge?: string;
  defaultColors: string[];
  recommendedRole?: string;
  isPopular?: boolean;
}

