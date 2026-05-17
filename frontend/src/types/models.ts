import type { RoleName } from './auth';

/* Job Post Status */
type JobPostStatus = 'draft' | 'active' | 'expired';

/** Maps legacy numeric status to semantic status */
const JOB_POST_STATUS_MAP: Record<number, JobPostStatus> = {
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
  roleCode?: string | null;
}

export interface NormalizedWorkspace {
  type: 'company' | 'job_seeker';
  companyId: number | null;
  label: string;
  roleCode?: string | null;
}

/* Company */

export interface Company {
  id: number;
  companyName: string;
  slug: string;
  companyEmail?: string;
  companyPhone?: string;
  websiteUrl?: string | null;
  facebookUrl?: string | null;
  youtubeUrl?: string | null;
  linkedinUrl?: string | null;
  description?: string | null;
  employeeSize?: number | null;
  since?: string | null;
  logoUrl?: string | null;
  coverImageUrl?: string | null;
  companyCoverImageUrl?: string | null;
  isVerified?: boolean;
  location?: Location | null;
  fieldOperation?: string | null;
  followersCount?: number;
  jobPostsCount?: number;
  taxCode?: string;
  // Admin specific or alternate fields
  companyImageUrl?: string | null;
  jobPostNumber?: number;
  followNumber?: number;
  isFollowed?: boolean;
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
  isSystem?: boolean;
  isActive?: boolean;
}

export interface CompanyMember {
  id: number;
  companyId?: number;
  userId?: number;
  user?: User;
  userDict?: User;
  invitedEmail?: string;
  invited_email?: string;
  role?: CompanyRole;
  roleId?: number;
  status?: string;
}

export interface CompanyVerification {
  id?: number;
  companyId?: number;
  companyDict?: Company;
  status?: 'pending' | 'reviewing' | 'approved' | 'rejected';
  companyName?: string;
  taxCode?: string;
  businessLicense?: string;
  representative?: string;
  phone?: string;
  email?: string;
  website?: string;
  scheduledAt?: string | null;
  contactName?: string;
  contactPhone?: string;
  notes?: string;
  adminNote?: string;
  reviewedById?: number | null;
  reviewedAt?: string | null;
  createAt?: string;
  updateAt?: string;
}

export interface TrustReport {
  id: number;
  targetType: 'job' | 'company';
  reason: string;
  message?: string;
  status: 'open' | 'reviewing' | 'resolved' | 'rejected';
  company?: number | null;
  jobPost?: number | null;
  targetTitle?: string;
  reporterDict?: User;
  createAt?: string;
}

export interface AuditLog {
  id: number;
  actor?: number | null;
  actorEmail?: string;
  action: 'create' | 'update' | 'delete' | 'approve' | 'reject' | 'status_change' | 'bulk_status' | 'agent_access' | string;
  resourceType: string;
  resourceId?: string;
  resourceRepr?: string;
  ipAddress?: string | null;
  userAgent?: string;
  requestMethod?: string;
  requestPath?: string;
  metadata?: Record<string, unknown>;
  createAt?: string;
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
  companyDict?: { id?: number; companyName?: string; logoUrl?: string | null; companyImageUrl?: string | null; slug?: string; employeeSize?: number | null; isVerified?: boolean };
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
  statusName?: string;
  hrmEmployeeId?: string;
  hrmUserId?: string;
  hrmSyncStatus?: 'NOT_SYNCED' | 'SYNCING' | 'SYNCED' | 'FAILED' | string;
  hrmSyncError?: string;
  hrmSyncedAt?: string | null;
  hrmEmployeeUrl?: string;
  isSentEmail?: boolean;
  isDeleted?: boolean;
  jobPost?: JobPost;
  jobName?: string;
  resumeSlug?: string;
  resume?: Resume;
  createAt?: string;
  aiAnalysisScore?: number | null;
  aiAnalysisEffectiveScore?: number | null;
  aiAnalysisSummary?: string | null;
  aiAnalysisStatus?: 'pending' | 'processing' | 'completed' | 'failed';
  aiAnalysisProgress?: number;
  aiAnalysisSkills?: string | string[] | null;
  aiAnalysisPros?: string | string[] | null;
  aiAnalysisCons?: string | string[] | null;
  aiAnalysisMatchingSkills?: string | string[] | null;
  aiAnalysisMissingSkills?: string | string[] | null;
  aiAnalysisCriteria?: Array<Record<string, unknown>> | null;
  aiAnalysisEvidence?: {
    criteria_results?: Array<Record<string, unknown>>;
    evidence?: Array<Record<string, unknown>>;
  } | Array<Record<string, unknown>> | null;
  aiAnalysisModel?: string;
  aiAnalysisSource?: string;
  aiAnalysisPromptVersion?: string;
  aiAnalysisReviewStatus?: 'ai_only' | 'reviewed' | 'overridden' | string;
  aiAnalysisHrOverrideScore?: number | null;
  aiAnalysisHrOverrideNote?: string | null;
  aiAnalysisReviewedAt?: string | null;
  aiAnalysisReviewedBy?: UserDict | null;
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
  jobSeekerProfileDict?: {
    old?: string | number;
    id?: number | string;
    fullName?: string;
    email?: string;
  };
  // Search-related fields
  searchScore?: number;
  isFeatured?: boolean;
}

export type ResumeSaved = {
  id: number;
  resume: Resume;
  resumeSlug?: string;
  createAt: string;
};

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
  lat?: number | string | null;
  lng?: number | string | null;
  /** Pre-resolved district dict from backend */
  districtDict?: { id?: number; name?: string };
}

/* Interview */

export interface Question {
  id: number;
  text: string;
  difficulty?: string;
  career?: number | null;
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
  aiDetailedFeedback?: InterviewAiDetailedFeedback;
  ai_detailed_feedback?: InterviewAiDetailedFeedback;
  recordingUrl?: string | null;
  recording_url?: string | null;
  evaluations?: InterviewEvaluation[];
  questions?: Question[];
  questionGroup?: number | string | QuestionGroup | null;
  question_group?: number | string | QuestionGroup | null;
  transcripts?: InterviewTranscript[];
}

export interface InterviewTranscript {
  id: number | string;
  speakerRole?: 'ai_agent' | 'candidate' | string;
  content?: string;
  text?: string;
  createAt?: string | null;
}

interface InterviewAiDetailedFeedback {
  technical?: string;
  communication?: string;
  attitude?: string;
  strengths?: string[];
  weaknesses?: string[];
  recommendations?: string[];
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

interface Notification {
  id: number;
  title: string;
  content: string;
  imageUrl?: string | null;
  type?: string;
  isRead?: boolean;
  createAt?: string;
}

export interface JobPostNotification {
  id: number;
  jobName: string;
  position?: number | null;
  experience?: number | null;
  salary?: number | null;
  frequency: number;
  isActive?: boolean;
  career?: number | null;
  city?: number | null;
}

/* Chat */

export interface ChatConversation {
  id: number | string;
  jobSeekerId: number | string;
  jobSeekerName: string;
  jobSeekerAvatar?: string;
  jobSeekerEmail?: string;
  employerId?: number | string;
  companyId?: number | string;
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
  buttonText?: string;
  buttonLink?: string;
  isShowButton?: boolean;
  isActive?: boolean;
  descriptionLocation?: number;
  button_text?: string;
  button_link?: string;
  is_show_button?: boolean;
  is_active?: boolean;
  platform?: string;
  type?: number;
  description_location?: number;
}

export interface BannerType {
  id: number;
  code: string;
  name: string;
  value: number;
  web_aspect_ratio?: string;
  mobile_aspect_ratio?: string;
  is_active?: boolean;
  create_at?: string;
  update_at?: string;
}

export type SelectOption = {
  id: number | string | null;
  name: string;
  description?: string;
  isHot?: boolean;
  place_id?: string;
  code?: string;
  slug?: string;
  value?: string | number;
};

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
  systemSettings?: {
    maintenanceMode?: boolean;
  };
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



