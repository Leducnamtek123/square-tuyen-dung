/** OAuth2 token pair returned by the Django backend. */
export interface TokenPair {
  access_token: string;
  refresh_token: string;
  token_type?: string;
  expires_in?: number;
  scope?: string;
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
  CHAT_ICON: string;
  MODE?: string;
}
