import type { RoleName } from './auth';
import type { InterviewScript } from './interviewScript';

/* Job Post Status: Canonical source is backend var_sys.JobPostStatus */
export enum JobPostStatus {
  PENDING = 1,
  REJECTED = 2,
  APPROVED = 3,
}


export interface User {
  id: number;
  email: string;
  fullName?: string;
  phone?: string;
  phoneNumber?: string;
  roleName?: RoleName;
  avatarUrl?: string | null;
  coverUrl?: string | null;
  hasCompany?: boolean;
  companyId?: number | null;
  company?: { id?: number; slug?: string; companyName?: string; imageUrl?: string | null } | null;
  employerRoleCode?: string | null;
  isVerifyEmail?: boolean;
  isPhoneVerified?: boolean;
  isVerifyPhone?: boolean;
  isOnboarded?: boolean;
  onboardingStep?: number;
  workspaces?: Workspace[];
  canAccessEmployerPortal?: boolean;
  isActive?: boolean;
  dateJoined?: string;
  /** Job seeker profile object returned by backend (when roleName === 'JOB_SEEKER') */
  jobSeekerProfile?: { id: number | string; phone?: string; coverUrl?: string | null; avatarUrl?: string | null } | null;
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
  createAt?: string;
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
  representativeName?: string;
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
  reportType?: string;
  reason: string;
  message?: string;
  status: 'open' | 'reviewing' | 'resolved' | 'rejected';
  company?: number | null;
  jobPost?: number | null;
  targetId?: number | null;
  createdAt?: string;
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
  career?: number | Career | null;
  careerChooseData?: { id: number; name: string } | null;
  cityChooseData?: { id: number; name: string } | null;
  company?: Company | null;
  location?: Location | null;
  createAt?: string;
  isExpired?: boolean;
  isVerify?: boolean;
  appliedNumber?: number;
  aiRecommendedCount?: number;
  aiRecommendedAvatars?: Array<{ name: string; initial: string; avatarUrl?: string | null }>;
  interviewTemplate?: number | null;
  interviewScript?: number | null;
  interviewScriptDetail?: InterviewScript | null;
  autoInterviewEnabled?: boolean;
  minScreeningScore?: number;
}

export interface JobPostActivity {
  id: number;
  userId?: number;
  userDict?: UserDict | null;
  fullName?: string;
  email?: string;
  phone?: string;
  title?: string;
  type?: string;
  isManualCandidate?: boolean;
  manualCandidateProfile?: number | null;
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
  jobPostDict?: {
    id?: number | string;
    jobName?: string;
    slug?: string;
  };
  jobName?: string;
  resumeSlug?: string;
  resumeFileUrl?: string | null;
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
  avatar?: string | null;
  email?: string;
  phone?: string;
  gender?: string;
  birthday?: string;
}

/* Resume & Profile */

export interface ResumeDetailResponse extends Resume {
  jobSeekerProfile?: JobSeekerProfile;
  experienceDetails?: ExperienceDetail[];
  experiencesDetails?: ExperienceDetail[];
  educationDetails?: EducationDetail[];
  certificates?: Certificate[];
  certificateDetails?: Certificate[];
  languageSkills?: LanguageSkill[];
  advancedSkills?: AdvancedSkill[];
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
  file?: {
    id?: number;
    name?: string;
    url?: string;
    fileUrl?: string;
  } | null;
  city?: number | City | null;
  career?: number | Career | null;
  cityChooseData?: { id: number; name: string } | null;
  careerChooseData?: { id: number; name: string } | null;
  sourcePlatform?: string | null;
  sourceUrl?: string | null;
  sourceAccount?: string | null;
  sourceRef?: string | null;
  sourcePayload?: Record<string, unknown> | null;
  isImported?: boolean;
  createAt?: string;
  updateAt?: string;
  isSaved?: boolean;
  matchScore?: number;
  viewEmployerNumber?: number;
  lastViewedDate?: string | null;
  userDict?: UserDict;
  user?: User | null;
  jobSeekerProfileDict?: {
    old?: string | number;
    id?: number | string;
    fullName?: string;
    email?: string;
    phone?: string;
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

export interface EmployerManualCandidate {
  id: number;
  slug: string;
  company: number;
  createdBy?: number | null;
  fullName: string;
  email?: string | null;
  phone?: string | null;
  title: string;
  description?: string | null;
  salaryMin?: number;
  salaryMax?: number;
  expectedSalary?: number | null;
  skillsSummary?: string | null;
  note?: string | null;
  position?: number | null;
  experience?: number | null;
  academicLevel?: number | null;
  typeOfWorkplace?: number | null;
  jobType?: number | null;
  city?: number | null;
  career?: number | null;
  fileUrl?: string | null;
  createAt?: string;
  updateAt?: string;
}

export interface JobSeekerProfile {
  id: number;
  phone?: string | null;
  birthday?: string | null;
  gender?: 'M' | 'F' | 'O' | null;
  maritalStatus?: 'S' | 'M' | null;
  contactAddress?: string | null;
  permanentAddress?: string | null;
  location?: Location | null;
  userDict?: UserDict;
  user?: number | string | null;
  coverUrl?: string | null;
  isJobSeeking?: boolean;
  isSeekingJob?: boolean;
}

export interface EducationDetail {
  id: number;
  degreeName?: string;
  major?: string;
  trainingPlaceName?: string;
  startDate?: string;
  completedDate?: string | null;
  gradeOrRank?: string | null;
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

export interface QuestionStep {
  step: number;
  title: string;
  detail?: string;
  guidance?: string;
}

export interface QuestionAnswerStructure {
  start?: string;
  steps: QuestionStep[];
  end?: string;
  time_guidance?: string;
}

export interface QuestionImportantTip {
  priority?: 'HIGH' | 'MEDIUM' | 'LOW';
  text?: string;
  type?: 'do' | 'dont' | string;
  content?: string;
}

export interface Question {
  id: number;
  title?: string;
  text?: string;
  question_text?: string;
  questionText?: string;
  sort_order?: number;
  sortOrder?: number;
  seniority?: string;
  difficulty?: string | number;
  difficulty_display?: string;
  career?: number | null;
  career_name?: string;
  careerName?: string;
  category?: string;
  category_display?: string;
  categoryDisplay?: string;
  company?: number | null;
  canWrite?: boolean;
  questionType?: string;
  default_duration_seconds?: number;
  defaultDurationSeconds?: number;
  answer_structure?: QuestionAnswerStructure | null;
  answerStructure?: QuestionAnswerStructure | null;
  interviewer_intent?: string;
  interviewerIntent?: string;
  important_tips?: QuestionImportantTip[] | null;
  importantTips?: QuestionImportantTip[] | null;
  follow_up_questions?: string[] | null;
  followUpQuestions?: string[] | null;
  // Fallbacks for raw API response or transformer mapped fields
  content?: string;
  type?: string;
  is_public?: boolean;
  isPublic?: boolean;
}

export interface QuestionBankItem extends Question {
  create_at?: string;
  createAt?: string;
}

export interface CompanyQuestionSet {
  id: number;
  name: string;
  description?: string;
  company_id?: number | null;
  companyId?: number | null;
  company_name?: string;
  companyName?: string;
  company_logo?: string | null;
  companyLogo?: string | null;
  career_id?: number | null;
  careerId?: number | null;
  career_name?: string | null;
  careerName?: string | null;
  seniority?: string;
  questions_count?: number;
  questionsCount?: number;
  total_duration_minutes?: number;
  totalDurationMinutes?: number;
  category_tags?: string[];
  categoryTags?: string[];
  questions?: QuestionBankItem[];
}

export interface SalaryBenchmarkItem {
  id: number;
  job_title?: string;
  jobTitle?: string;
  position_title?: string;
  positionTitle?: string;
  category?: string;
  career?: number | null;
  career_name?: string;
  careerName?: string;
  seniority?: string;
  experience_level?: string;
  experienceLevel?: string;
  experience_level_display?: string;
  experienceLevelDisplay?: string;
  min_salary?: number | string;
  minSalary?: number | string;
  salary_min?: number | string;
  salaryMin?: number | string;
  median_salary?: number | string;
  medianSalary?: number | string;
  salary_avg?: number | string | null;
  salaryAvg?: number | string | null;
  max_salary?: number | string;
  maxSalary?: number | string;
  salary_max?: number | string;
  salaryMax?: number | string;
  currency?: string;
  year?: number;
  sample_size?: number;
  sampleSize?: number;
  sample_count?: number;
  sampleCount?: number;
  is_hot?: boolean;
  isHot?: boolean;
  source_notes?: string;
  sourceNotes?: string;
  create_at?: string;
  createAt?: string;
}

export interface CreateMockSessionPayload {
  job_title?: string;
  position_title?: string;
  category?: string;
  career_id?: number | null;
  seniority?: string;
  experience_level?: string;
  question_count?: number;
  question_group_id?: number | string | null;
  question_ids?: number[];
  voice_profile_id?: number | string | null;
  job_post_id?: number | string | null;
  session_metadata?: Record<string, unknown>;
}

export interface MockSessionResponse extends InterviewSession {
  questions?: Question[];
  livekit_token?: string;
  livekitToken?: string;
  invite_token?: string;
  interview_url?: string;
}

export interface InterviewEvaluationRubric {
  criteria?: Array<{
    name: string;
    weight: number;
    description?: string;
  }>;
  [key: string]: unknown;
}

export interface QuestionGroup {
  id: number;
  name: string;
  description?: string;
  author?: UserDict;
  company?: number;
  evaluation_rubric?: InterviewEvaluationRubric | null;
  questions?: Question[];
  questionIds?: number[];
  question_ids?: number[]; // Raw API payload field
  canWrite?: boolean;
  is_public?: boolean;
  isPublic?: boolean;
  createAt?: string;
  updateAt?: string;
}

export interface InterviewSessionMetadata {
  position_title?: string;
  job_title?: string;
  category?: string;
  career_id?: number | null;
  total_questions?: number;
  current_question_index?: number;
  [key: string]: unknown;
}

export interface QuestionHintsDetailResponse {
  id: number;
  text: string;
  question_text?: string;
  category?: string;
  category_display?: string;
  difficulty?: number | string;
  difficulty_display?: string;
  default_duration_seconds?: number;
  answer_structure?: QuestionAnswerStructure | null;
  interviewer_intent?: string;
  important_tips?: QuestionImportantTip[] | null;
  follow_up_questions?: string[] | null;
}

export interface InterviewSession {
  id: number;
  roomName: string;
  inviteToken?: string;
  status: string;
  isLive?: boolean;
  type: string;
  interview_type?: string;
  scheduledAt?: string | null;
  scheduled_at?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  duration?: number | null;
  candidateId?: number | null;
  candidate?: User | number | null;
  jobPostId?: number | null;
  jobPost?: JobPost | number | null;
  jobName?: string | null;
  candidateName?: string | null;
  candidateEmail?: string | null;
  candidate_email?: string | null;
  companyName?: string | null;
  companyLogo?: string | null;
  company_logo?: string | null;
  questionsCount?: number;
  questions_count?: number;
  createdById?: number | null;
  createdBy?: User | number | null;
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
  aiDetailedFeedback?: InterviewAiDetailedFeedback | null;
  ai_detailed_feedback?: InterviewAiDetailedFeedback | null;
  recordingUrl?: string | null;
  recording_url?: string | null;
  evaluations?: InterviewEvaluation[];
  questions?: Question[];
  questionGroup?: number | string | QuestionGroup | null;
  question_group?: number | string | QuestionGroup | null;
  transcripts?: InterviewTranscript[];
  voiceProfile?: number | null;
  voice_profile?: number | null;
  voiceProfileName?: string | null;
  voice_profile_name?: string | null;
  sessionType?: 'official' | 'mock' | string;
  session_type?: 'official' | 'mock' | string;
  timeLimitPerQuestion?: number;
  time_limit_per_question?: number;
  sessionMetadata?: InterviewSessionMetadata | null;
  session_metadata?: InterviewSessionMetadata | null;
  livekitToken?: string;
  livekit_token?: string;
  interview_url?: string;
  interviewUrl?: string;
  interviewLanguage?: 'vi' | 'en' | 'ja' | 'ko' | string;
  interview_language?: 'vi' | 'en' | 'ja' | 'ko' | string;
  interviewLanguageDisplay?: string;
  interview_language_display?: string;
  proctoringEvents?: InterviewProctoringEvent[];
  proctoring_events?: InterviewProctoringEvent[];
  proctoringViolationCount?: number;
  proctoring_violation_count?: number;
}

export interface InterviewProctoringEvent {
  id: number;
  session?: number;
  eventType?: string;
  event_type?: string;
  eventTypeLabel?: string;
  event_type_label?: string;
  timestamp?: string;
  durationSeconds?: number;
  duration_seconds?: number;
  details?: Record<string, any> | null;
  createAt?: string;
  create_at?: string;
}

export interface InterviewTranscript {
  id: number | string;
  speakerRole?: 'ai_agent' | 'candidate' | string;
  content?: string;
  text?: string;
  createAt?: string | null;
}

export interface InterviewAiDetailedFeedback {
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

export interface VoiceProfileSample {
  id: number;
  profile?: number;
  referenceText?: string;
  reference_text?: string;
  audioUrl?: string | null;
  originalFilename?: string;
  original_filename?: string;
  durationSeconds?: number | string | null;
  sortOrder?: number;
  create_at?: string;
}

export interface VoiceProfileGrant {
  id: number;
  profile: number;
  profileName?: string;
  company?: number | null;
  companyName?: string | null;
  job_post?: number | null;
  jobPost?: number | null;
  jobName?: string | null;
  is_default?: boolean;
  isDefault?: boolean;
  is_active?: boolean;
  isActive?: boolean;
  note?: string;
}

export interface VoiceProfile {
  id: number;
  name: string;
  description?: string;
  language?: string;
  voice_type?: 'cloned' | 'preset';
  voiceType?: 'cloned' | 'preset';
  status: 'draft' | 'processing' | 'ready' | 'disabled' | 'failed' | string;
  preset_engine?: string;
  presetEngine?: string;
  preset_voice_id?: string;
  presetVoiceId?: string;
  consent_confirmed?: boolean;
  consentConfirmed?: boolean;
  sampleCount?: number;
  totalDurationSeconds?: number;
  isReadyForTts?: boolean;
  preparationNote?: string;
  lastError?: string;
  metadata?: Record<string, unknown> | null;
  grantCount?: number;
  samples?: VoiceProfileSample[];
  grants?: VoiceProfileGrant[];
  create_at?: string;
  update_at?: string;
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
  createAt?: string;
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
  evidenceImage?: number | null;
  evidence_image?: number | null;
  evidenceImageUrl?: string | null;
  userId?: number | null;
  userDict?: {
    id?: number;
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

export interface ContactMessage {
  id: number;
  category?: 'bug_report' | 'feedback' | 'support';
  subject?: string;
  pageUrl?: string;
  name: string;
  email: string;
  phone?: string;
  content: string;
  is_read?: boolean;
  isRead?: boolean;
  createAt?: string;
  create_at?: string;
  updateAt?: string;
}

export interface BannerType {
  id: number;
  code: string;
  name: string;
  value: number;
  webAspectRatio?: string;
  mobileAspectRatio?: string;
  isActive?: boolean;
  createAt?: string;
  updateAt?: string;
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



