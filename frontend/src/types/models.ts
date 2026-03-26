import type { RoleName } from './auth';

/* User & Auth */

export interface User {
  id: number;
  email: string;
  fullName?: string;
  full_name?: string;
  roleName?: RoleName;
  role_name?: RoleName;
  avatarUrl?: string | null;
  hasCompany?: boolean;
  has_company?: boolean;
  isVerifyEmail?: boolean;
  is_verify_email?: boolean;
  workspaces?: Workspace[];
  canAccessEmployerPortal?: boolean;
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
  company_name?: string;
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
}

/* Job */

export interface JobPost {
  id: number;
  jobName: string;
  job_name?: string;
  slug: string;
  deadline: string;
  quantity: number;
  salaryMin: number;
  salaryMax: number;
  isHot?: boolean;
  isUrgent?: boolean;
  status: 1 | 2 | 3;
  views?: number;
  position?: number;
  experience?: number;
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
}

export interface JobPostActivity {
  id: number;
  fullName?: string;
  email?: string;
  phone?: string;
  status: number;
  isSentEmail?: boolean;
  isDeleted?: boolean;
  jobPost?: JobPost;
  resume?: Resume;
  createAt?: string;
  aiAnalysisScore?: number | null;
  aiAnalysisSummary?: string | null;
  aiAnalysisStatus?: 'pending' | 'processing' | 'completed' | 'failed';
  aiAnalysisProgress?: number;
}

/* Resume & Profile */

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
}

export interface JobSeekerProfile {
  id: number;
  phone?: string | null;
  birthday?: string | null;
  gender?: 'M' | 'F' | 'O' | null;
  maritalStatus?: 'S' | 'M' | null;
  location?: Location | null;
}

export interface EducationDetail {
  id: number;
  degreeName: string;
  major: string;
  trainingPlaceName: string;
  startDate: string;
  completedDate?: string | null;
  description?: string | null;
}

export interface ExperienceDetail {
  id: number;
  jobName: string;
  companyName: string;
  startDate: string;
  endDate: string;
  description?: string | null;
}

export interface Certificate {
  id: number;
  name: string;
  trainingPlace: string;
  startDate: string;
  expirationDate?: string | null;
}

export interface LanguageSkill {
  id: number;
  language: number;
  level: number;
}

export interface AdvancedSkill {
  id: number;
  name: string;
  level: number;
}

/* Common */

export interface Career {
  id: number;
  name: string;
  slug?: string;
  iconUrl?: string | null;
}

export interface City {
  id: number;
  name: string;
  slug?: string;
}

export interface District {
  id: number;
  name: string;
  city?: City;
}

export interface Location {
  id: number;
  city?: City;
  district?: District;
  address?: string;
}

/* Interview */

export interface InterviewSession {
  id: number;
  roomName: string;
  inviteToken?: string;
  status: string;
  type: string;
  scheduledAt?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  duration?: number | null;
  candidate?: User;
  jobPost?: JobPost | null;
  createdBy?: User | null;
  aiOverallScore?: number | null;
  aiSummary?: string | null;
  aiStrengths?: string[] | null;
  aiWeaknesses?: string[] | null;
}

export interface InterviewEvaluation {
  id: number;
  attitudeScore?: number | null;
  professionalScore?: number | null;
  overallScore?: number | null;
  result: 'passed' | 'failed' | 'pending';
  comments?: string | null;
  proposedSalary?: number | null;
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

export interface Feedback {
  id: number;
  content: string;
  rating: number;
  createAt?: string;
}

export interface Banner {
  id: number;
  imageUrl: string;
  description?: string;
  bannerType: number;
}

interface SelectOption {
  id: number | string;
  name: string;
}

export interface SystemConfig {
  careers?: Career[];
  cities?: City[];
  cityDict: Record<number | string, string>;
  careerDict: Record<number, string>;
  genderDict?: Record<string | number, string>;
  maritalStatusDict?: Record<string | number, string>;
  jobPostStatusDict?: Record<string | number, string>;
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
  [key: string]: unknown;
}
