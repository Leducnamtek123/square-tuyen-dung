import type { EmployerSignUpFormData } from '../views/components/auths/EmployerSignUpForm';
/** OAuth2 token pair returned by the Django backend.
 * NOTE: httpRequest interceptor auto-converts snake_case → camelCase,
 * so we define these with camelCase names.
 */
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  backend?: string;
  tokenType?: string;
  expiresIn?: number;
  scope?: string;
}

/** Response from auth/check-creds/ */
export interface CheckCredsResponse {
  exists: boolean;
  email: string;
  emailVerified: boolean;
}

/** Response from auth/email-exists/ */
export interface EmailExistsResponse {
  exists: boolean;
}

/** Supported role names matching backend variable_system.py. */
export type RoleName = 'ADMIN' | 'EMPLOYER' | 'JOB_SEEKER';

/** OAuth provider identifiers. */
export type AuthProvider = 'email' | 'facebook' | 'google-oauth2';

export interface BotConfig {
  AGENT_ID: string;
  CHAT_TITLE: string;
  CHAT_ICON?: string;
  MODE?: string;
}

/** Auth DTOs */
export type JobSeekerRegisterData = {
  email: string;
  fullName: string;
  password?: string;
  platform?: string;
};

export interface EmployerRegisterData extends Omit<EmployerSignUpFormData, 'confirmPassword'> {
  platform?: string;
}

export interface ResetPasswordData {
  token?: string | string[];
  newPassword: string;
  confirmPassword: string;
  platform?: string;
}

export interface ChangePasswordData {
  oldPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

export type UserSettingsData = {
  emailNotificationActive?: boolean;
  smsNotificationActive?: boolean;
};

export interface CandidateDraft {
  desiredJobTitle?: string;
  careerId?: number | string;
  cityId?: number | string;
  typeOfWorkplace?: number;
  salaryMin?: number;
  salaryMax?: number;
  expectedSalary?: number;
  isSalaryNegotiable?: boolean;
  experience?: number;
  academicLevel?: number;
  skills?: string[];
  skillsSummary?: string;
  fileId?: number | null;
  fileName?: string;
  fileUrl?: string;
}

export interface EmployerDraft {
  companyName?: string;
  logoId?: number | null;
  logoUrl?: string;
  taxCode?: string;
  employeeSize?: number;
  fieldOperation?: string;
  cityId?: number | string;
  districtId?: number | string;
  address?: string;
  websiteUrl?: string;
  description?: string;
  companyEmail?: string;
  companyPhone?: string;
  recruiterName?: string;
  recruiterTitle?: string;
  recruiterPhone?: string;
  recruiterEmail?: string;
  hiringNeeds?: string[];
  gpkdFileId?: number | null;
  gpkdFileName?: string;
  gpkdFileUrl?: string;
}

export interface RecommendedJobPreview {
  id: number;
  jobName: string;
  companyName: string;
  companyLogo?: string;
  cityName?: string;
  salaryMin?: number;
  salaryMax?: number;
  slug?: string;
}

export interface OnboardingStatusResponse {
  isOnboarded: boolean;
  onboardingStep: number;
  roleName: string;
  hasCompany: boolean;
  profileCompleteness: number;
  candidateDraft?: CandidateDraft | null;
  employerDraft?: EmployerDraft | null;
  hasExistingMembership?: boolean;
  existingCompany?: {
    companyId: number;
    companyName: string;
    roleName: string;
  } | null;
}


