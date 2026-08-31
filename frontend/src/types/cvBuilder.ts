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
  categoryName?: string;
  category_name?: string;
  thumbnailUrl?: string | null;
  thumbnail_url?: string | null;
  colorPalettes?: string[];
  color_palettes?: string[];
  defaultTheme?: Partial<CVThemeConfig>;
  default_theme?: Partial<CVThemeConfig>;
  sampleData?: Partial<CVData>;
  sample_data?: Partial<CVData>;
  isActive?: boolean;
  is_active?: boolean;
  isPremium?: boolean;
  is_premium?: boolean;
  isPopular?: boolean;
  is_popular?: boolean;
  sortOrder?: number;
  sort_order?: number;
  useCount?: number;
  use_count?: number;
  viewCount?: number;
  view_count?: number;
  createAt?: string;
  create_at?: string;
  updateAt?: string;
  update_at?: string;
}

export interface CandidateCVListItem {
  id: number;
  template?: number | null;
  templateCode?: string;
  template_code?: string;
  templateName?: string;
  template_name?: string;
  templateCategory?: string;
  template_category?: string;
  title: string;
  slug: string;
  thumbnailUrl?: string | null;
  thumbnail_url?: string | null;
  pdfUrl?: string | null;
  pdf_url?: string | null;
  isMainCv?: boolean;
  is_main_cv?: boolean;
  isPublic?: boolean;
  is_public?: boolean;
  viewsCount?: number;
  views_count?: number;
  downloadCount?: number;
  download_count?: number;
  aiScore?: number | null;
  ai_score?: number | null;
  createAt?: string;
  create_at?: string;
  updateAt?: string;
  update_at?: string;
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
  user?: number;
  template?: number | null;
  templateCode?: string;
  template_code?: string;
  templateInfo?: CVTemplateRecord;
  template_info?: CVTemplateRecord;
  title: string;
  slug: string;
  themeConfig?: CVThemeConfig;
  theme_config?: CVThemeConfig;
  cvData?: CVData;
  cv_data?: CVData;
  thumbnailUrl?: string | null;
  thumbnail_url?: string | null;
  pdfUrl?: string | null;
  pdf_url?: string | null;
  isMainCv?: boolean;
  is_main_cv?: boolean;
  isPublic?: boolean;
  is_public?: boolean;
  viewsCount?: number;
  views_count?: number;
  downloadCount?: number;
  download_count?: number;
  aiScore?: number | null;
  ai_score?: number | null;
  aiReviewData?: AICvReviewResult | null;
  ai_review_data?: AICvReviewResult | null;
  createAt?: string;
  create_at?: string;
  updateAt?: string;
  update_at?: string;
}

export interface PublicCVRecord {
  id: number;
  templateCode?: string;
  template_code?: string;
  templateInfo?: CVTemplateRecord;
  template_info?: CVTemplateRecord;
  title: string;
  slug: string;
  themeConfig?: CVThemeConfig;
  theme_config?: CVThemeConfig;
  cvData?: CVData;
  cv_data?: CVData;
  thumbnailUrl?: string | null;
  thumbnail_url?: string | null;
  pdfUrl?: string | null;
  pdf_url?: string | null;
  candidateName?: string;
  candidate_name?: string;
  createAt?: string;
  create_at?: string;
  updateAt?: string;
  update_at?: string;
}

export interface CVSuggestionRecord {
  id: number;
  industry: string;
  industryName?: string;
  industry_name?: string;
  suggestionType?: 'summary' | 'experience' | 'skills';
  suggestion_type?: 'summary' | 'experience' | 'skills';
  title: string;
  content: string;
  skillsList?: string[];
  skills_list?: string[];
  sortOrder?: number;
  sort_order?: number;
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

