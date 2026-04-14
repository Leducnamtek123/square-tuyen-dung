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

/** Frontend AUTH_CONFIG shape (from configs/constants). */
export interface AuthConfigShape {
  CLIENT_ID: string;
  CLIENT_SECRET: string;
  BACKEND_KEY: string;
  ACCESS_TOKEN_KEY: string;
  REFRESH_TOKEN_KEY: string;
  REFRESH_TOKEN_GRANT: string;
  PASSWORD_KEY: string;
  CONVERT_TOKEN_KEY: string;
  FACEBOOK_CLIENT_ID: string;
  FACEBOOK_CLIENT_SECRET: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  GOONGAPI_KEY: string;
  JOB_SEEKER_BOT: BotConfig;
  EMPLOYER_BOT: BotConfig;
  BOT_RENDER_MODE: string;
}

export interface BotConfig {
  AGENT_ID: string;
  CHAT_TITLE: string;
  CHAT_ICON?: string;
  MODE?: string;
}

/** Auth DTOs */
export interface JobSeekerRegisterData {
  email: string;
  fullName: string;
  password?: string;
  platform?: string;
  [key: string]: unknown;
}

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

export interface UserSettingsData {
  emailNotificationActive?: boolean;
  smsNotificationActive?: boolean;
  [key: string]: unknown;
}

