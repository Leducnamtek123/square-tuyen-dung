import type { RoleName } from './auth';

/* Job Post Status */
export type JobPostStatus = 'draft' | 'active' | 'expired';

/** Maps legacy numeric status to semantic status */
export const JOB_POST_STATUS_MAP: Record<number, JobPostStatus> = {
  1: 'draft',
  2: 'active',
  3: 'expired',
} as const;


export interface User {
  id: number;
  email: string;
  fullName?: string;
  roleName?: RoleName;
  avatarUrl?: string | null;
  hasCompany?: boolean;
  isVerifyEmail?: boolean;
  workspaces?: Workspace[];
  canAccessEmployerPortal?: boolean;
  isActive?: boolean;
  /** Job seeker profile object returned by backend (when roleName === 'JOB_SEEKER') */
  jobSeekerProfile?: { id: number | string } | null;
  /** Flat job seeker profile ID (alternative backend serialization) */
  jobSeekerProfileId?: number | string | null;
}

export interface Workspace {
  type: 'company' | 'job_seeker';
  companyId?: number | null;
  label?: string;
  isDefault?: boolean;
}

export interface NormalizedWorkspace {
  type: 'company' | 'job_seeker';
  companyId: number | null;
  label: string;
}

/* Company */

export interface Company {
  id: number;
  companyName: string;
  slug: string;
  companyEmail?: string;
  companyPhone?: string;
  websiteUrl?: string | null;
  description?: string | null;
  employeeSize?: number | null;
  since?: string | null;
  logoUrl?: string | null;
  coverImageUrl?: string | null;
  location?: Location | null;
  fieldOperation?: string | null;
  followersCount?: number;
  jobPostsCount?: number;
  taxCode?: string;
  // Admin specific or alternate fields
  companyImageUrl?: string | null;
  jobPostNumber?: number;
  followNumber?: number;
  locationDict?: {
    city?: string;
    district?: string;
    address?: string;
  };
}

export interface CompanyImage {
  id: number;
  imageUrl: string;
}

export interface CompanyRole {
  id: number;
  code?: string;
  name: string;
  description?: string;
  permissions?: string[];
  is_system?: boolean;
}

export interface CompanyMember {
  id: number;
  companyId?: number;
  user?: User;
  userDict?: User;
  invitedEmail?: string;
  invited_email?: string;
  role?: CompanyRole;
  roleId?: number;
  status?: string;
}

/* Job */

export interface JobPost {
  id: number;
  jobName: string;
  slug: string;
  deadline: string;
  quantity: number;
  salaryMin: number;
  salaryMax: number;
  isHot?: boolean;
  isUrgent?: boolean;
  status: JobPostStatus | 1 | 2 | 3;
  views?: number;
  position?: number;
  experience?: number;
  companyDict?: { id?: number; companyName?: string; logoUrl?: string | null };
  academicLevel?: number;
  jobType?: number;
  typeOfWorkplace?: number;
  genderRequired?: string | null;
  jobDescription?: string;
  jobRequirement?: string | null;
  benefitsEnjoyed?: string | null;
  contactPersonName?: string;
  contactPersonPhone?: string;
  contactPersonEmail?: string;
  career?: Career | null;
  company?: Company | null;
  location?: Location | null;
  createAt?: string;
  isExpired?: boolean;
  isVerify?: boolean;
  appliedNumber?: number;
}

export interface JobPostActivity {
  id: number;
  userId?: number;
  fullName?: string;
  email?: string;
  phone?: string;
  title?: string;
  type?: string;
  status: number;
  isSentEmail?: boolean;
  isDeleted?: boolean;
  jobPost?: JobPost;
  jobName?: string;
  resumeSlug?: string;
  resume?: Resume;
  createAt?: string;
  aiAnalysisScore?: number | null;
  aiAnalysisSummary?: string | null;
  aiAnalysisStatus?: 'pending' | 'processing' | 'completed' | 'failed';
  aiAnalysisProgress?: number;
}

export interface UserDict {
  id?: number;
  fullName?: string;
  avatarUrl?: string | null;
  email?: string;
}

/* Resume & Profile */

export interface ResumeDetailResponse extends Resume {
  jobSeekerProfile?: JobSeekerProfile;
  experiencesDetails?: ExperienceDetail[];
  educationDetails?: EducationDetail[];
  certificateDetails?: Certificate[];
  languageDetails?: LanguageSkill[];
  skillDetails?: AdvancedSkill[];
  user?: User;
}

export interface Resume {
  id: number;
  title?: string;
  slug: string;
  description?: string | null;
  salaryMin?: number;
  salaryMax?: number;
  expectedSalary?: number | null;
  skillsSummary?: string | null;
  position?: number | null;
  experience?: number | null;
  academicLevel?: number | null;
  typeOfWorkplace?: number | null;
  jobType?: number | null;
  isActive?: boolean;
  type?: string;
  fileUrl?: string | null;
  city?: City | null;
  career?: Career | null;
  createAt?: string;
  updateAt?: string;
  isSaved?: boolean;
  viewEmployerNumber?: number;
  lastViewedDate?: string | null;
  userDict?: UserDict;
  user?: User | null;
  jobSeekerProfileDict?: Record<string, unknown> & { old?: string | number };
  // Search-related fields
  searchScore?: number;
  isFeatured?: boolean;
}

export interface ResumeSaved {
  id: number;
  resume: Resume;
  resumeSlug?: string;
  createAt: string;
  [key: string]: unknown;
}

export interface JobSeekerProfile {
  id: number;
  phone?: string | null;
  birthday?: string | null;
  gender?: 'M' | 'F' | 'O' | null;
  maritalStatus?: 'S' | 'M' | null;
  location?: Location | null;
  userDict?: UserDict;
}

export interface EducationDetail {
  id: number;
  degreeName?: string;
  major?: string;
  trainingPlaceName?: string;
  startDate?: string;
  completedDate?: string | null;
  description?: string | null;
}

export interface ExperienceDetail {
  id: number;
  jobName?: string;
  companyName?: string;
  startDate?: string;
  endDate?: string;
  description?: string | null;
}

export interface Certificate {
  id: number;
  name?: string;
  trainingPlace?: string;
  startDate?: string;
  expirationDate?: string | null;
  certificateName?: string;
  trainingPlaceName?: string;
}

export interface LanguageSkill {
  id: number;
  language?: number;
  level?: number;
  languageName?: string;
  levelName?: string;
  point?: number | string;
}

export interface AdvancedSkill {
  id: number;
  name?: string;
  level?: number;
  skillName?: string;
  point?: number | string;
}

/* Common */

export interface Career {
  id: number;
  name: string;
  slug?: string;
  iconUrl?: string | null;
  appIconName?: string;
  app_icon_name?: string;
  isHot?: boolean;
  is_hot?: boolean;
  jobPostTotal?: number;
  job_post_total?: number;
}

export interface City {
  id: number;
  name: string;
  slug?: string;
  code?: string;
}

export interface District {
  id: number;
  name: string;
  code?: string;
  city?: number | string | City;
}

export interface Ward {
  id: number;
  name: string;
  code?: string;
  district: number;
}

export interface Location {
  id: number;
  city?: number | string | { id: number; name: string };
  district?: number | string | { id: number; name: string };
  address?: string;
  /** Pre-resolved district dict from backend */
  districtDict?: { id?: number; name?: string };
}

/* Interview */

export interface Question {
  id: number;
  text: string;
  category?: string;
  questionType?: string;
  // Fallbacks for raw API response or transformer mapped fields
  content?: string;
  questionText?: string;
  type?: string;
}

export interface QuestionGroup {
  id: number;
  name: string;
  description?: string;
  author?: UserDict;
  company?: number;
  evaluation_rubric?: any;
  questions?: Question[];
  questionIds?: number[];
  question_ids?: number[]; // Raw API payload field
  createAt?: string;
  updateAt?: string;
}

export interface InterviewSession {
  id: number;
  roomName: string;
  inviteToken?: string;
  status: string;
  type: string;
  interview_type?: string;
  scheduledAt?: string | null;
  scheduled_at?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  duration?: number | null;
  candidate?: User;
  jobPost?: JobPost | null;
  jobName?: string | null;
  candidateName?: string | null;
  candidateEmail?: string | null;
  candidate_email?: string | null;
  companyName?: string | null;
  createdBy?: User | null;
  aiOverallScore?: number | null;
  ai_overall_score?: number | null;
  aiTechnicalScore?: number | null;
  ai_technical_score?: number | null;
  aiCommunicationScore?: number | null;
  ai_communication_score?: number | null;
  aiSummary?: string | null;
  ai_summary?: string | null;
  aiStrengths?: string[] | string | null;
  ai_strengths?: string[] | string | null;
  aiWeaknesses?: string[] | string | null;
  ai_weaknesses?: string[] | string | null;
  aiDetailedFeedback?: Record<string, unknown>;
  ai_detailed_feedback?: Record<string, unknown>;
  recordingUrl?: string | null;
  recording_url?: string | null;
  evaluations?: InterviewEvaluation[];
  questions?: Question[];
  questionGroup?: number | string | QuestionGroup | null;
  question_group?: number | string | QuestionGroup | null;
  transcripts?: Record<string, unknown>[];
}

export interface InterviewEvaluation {
  id: number;
  attitudeScore?: number | null;
  attitude_score?: number | null;
  professionalScore?: number | null;
  professional_score?: number | null;
  overallScore?: number | null;
  overall_score?: number | null;
  result: 'passed' | 'failed' | 'pending';
  comments?: string | null;
  proposedSalary?: number | null;
  proposed_salary?: number | null;
  interview?: number | InterviewSession;
}

/* Misc */

export interface Notification {
  id: number;
  title: string;
  content: string;
  imageUrl?: string | null;
  type?: string;
  isRead?: boolean;
  createAt?: string;
}

/* Chat */

export interface ChatConversation {
  id: number;
  jobSeekerId: number;
  jobSeekerName: string;
  jobSeekerAvatar?: string;
  jobSeekerEmail?: string;
  employerId?: number;
  companyId?: number;
  employerName?: string;
  companyName?: string;
  employerLogo?: string;
  lastMessage?: string | { content: string };
  isActive?: boolean;
  createAt?: string;
  jobSeeker?: { fullName: string };
  employer?: { companyName: string };
}

export interface Feedback {
  id: number;
  content: string;
  rating: number;
  isActive?: boolean;
  is_active?: boolean;
  createAt?: string;
  create_at?: string;
  userDict?: {
    fullName?: string;
    avatarUrl?: string;
    email?: string;
  };
}

export interface Banner {
  id: number;
  imageUrl: string;
  description?: string;
  bannerType: number;
  imageMobileUrl?: string;
  button_text?: string;
  button_link?: string;
  is_show_button?: boolean;
  is_active?: boolean;
  platform?: string;
  type?: number;
  description_location?: number;
}

export interface SelectOption {
  id: number | string | null;
  name: string;
  [key: string]: unknown;
}

export interface SystemConfig {
  careers?: Career[];
  cities?: City[];
  cityDict?: Record<string, string>;
  careerDict?: Record<string, string>;
  experienceDict?: Record<string, string>;
  positionDict?: Record<string, string>;
  jobTypeDict?: Record<string, string>;
  typeOfWorkplaceDict?: Record<string, string>;
  academicLevelDict?: Record<string, string>;
  employeeSizeDict?: Record<string, string>;
  genderDict?: Record<string, string>;
  maritalStatusDict?: Record<string, string>;
  jobPostStatusDict?: Record<string, string>;
  applicationStatusDict?: Record<string, string>;
  banners?: Banner[];
  socialMediaLinks?: Record<string, string>;
  companyInfo?: Record<string, string>;
  cityOptions?: SelectOption[];
  careerOptions?: SelectOption[];
  jobTypeOptions?: SelectOption[];
  typeOfWorkplaceOptions?: SelectOption[];
  positionOptions?: SelectOption[];
  experienceOptions?: SelectOption[];
  academicLevelOptions?: SelectOption[];
  genderOptions?: SelectOption[];
  maritalStatusOptions?: SelectOption[];
  employeeSizeOptions?: SelectOption[];
  languageOptions?: SelectOption[];
  frequencyNotificationOptions?: SelectOption[];
  frequencyNotificationDict?: Record<string, string>;
  applicationStatusOptions?: SelectOption[];
  jobPostStatusOptions?: SelectOption[];
}
