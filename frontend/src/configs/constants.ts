/**
 * Application constants — lightweight, no heavy asset imports.
 *
 * Image/icon assets have been moved to '@/configs/images' to avoid
 * polluting the bundle when only config values are needed.
 */

import dayjs from './dayjs-config';
import DeveloperBoardIcon from '@mui/icons-material/DeveloperBoard';
import DevicesIcon from '@mui/icons-material/Devices';

// Re-export image constants for backward compatibility.
// New code should import directly from '@/configs/images'.
export {
  IMAGES,
  ABOUT_IMAGES,
  ICONS,
  LOADING_IMAGES,
  FEEDBACK_IMAGES,
  LOGO_IMAGES,
  SVG_IMAGES,
  CHATBOT_ICONS,
} from './images';

// ROUTES — centralized in routeConfig.ts
export { ROUTES } from './routeConfig';

const ENV = process.env.NEXT_PUBLIC_NODE_ENV || 'development';
const PLATFORM = 'WEB';
const APP_NAME = 'Square';

const getBaseHostname = (): string => {
  if (typeof window === 'undefined') return 'localhost';
  const hn = window.location.hostname;
  return hn.replace(/^(admin\.|employer\.|www\.)/, '');
};

const BASE_HOSTNAME = getBaseHostname();

const isProdDomain = (host: string | undefined): host is string => {
  return !!host && host !== 'localhost' && !/^(\d{1,3}\.){3}\d{1,3}$/.test(host);
};

const HOST_NAME = {
  PROJECT: isProdDomain(process.env.NEXT_PUBLIC_PROJECT_HOST_NAME)
    ? process.env.NEXT_PUBLIC_PROJECT_HOST_NAME
    : BASE_HOSTNAME,
  EMPLOYER_PROJECT: isProdDomain(process.env.NEXT_PUBLIC_EMPLOYER_PROJECT_HOST_NAME)
    ? process.env.NEXT_PUBLIC_EMPLOYER_PROJECT_HOST_NAME
    : `employer.${BASE_HOSTNAME}`,
  ADMIN_PROJECT: isProdDomain(process.env.NEXT_PUBLIC_ADMIN_PROJECT_HOST_NAME)
    ? process.env.NEXT_PUBLIC_ADMIN_PROJECT_HOST_NAME
    : `admin.${BASE_HOSTNAME}`,
} as const;

const AUTH_PROVIDER = {
  FACEBOOK: 'facebook',
  GOOGLE: 'google-oauth2',
} as const;

const AUTH_CONFIG = {
  // BACKEND
  CLIENT_ID: process.env.NEXT_PUBLIC_PROJECT_SERVER_CLIENT_ID,
  CLIENT_SECRET: process.env.NEXT_PUBLIC_PROJECT_SERVER_CLIENT_SECRET,
  BACKEND_KEY: 'backend',
  ACCESS_TOKEN_KEY: 'access_token',
  REFRESH_TOKEN_KEY: 'refresh_token',
  REFRESH_TOKEN_GRANT: 'refresh_token',
  PASSWORD_KEY: 'password',
  CONVERT_TOKEN_KEY: 'convert_token',
  // FACEBOOK AUTH
  FACEBOOK_CLIENT_ID: process.env.NEXT_PUBLIC_FACEBOOK_CLIENT_ID,
  FACEBOOK_CLIENT_SECRET: process.env.NEXT_PUBLIC_FACEBOOK_CLIENT_SECRET,
  // GOOGLE AUTH
  GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || 'dummy-google-client-id',
  GOOGLE_CLIENT_SECRET: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET,
  GOONGAPI_KEY: process.env.NEXT_PUBLIC_GOONGAPI_KEY,
  // Dialogflow chatbot — icons now use lazy import from '@/configs/images'
  JOB_SEEKER_BOT: {
    AGENT_ID: process.env.NEXT_PUBLIC_JOB_SEEKER_BOT_AGENT_ID || '',
    CHAT_TITLE: 'Square AI',
  },
  EMPLOYER_BOT: {
    AGENT_ID: process.env.NEXT_PUBLIC_EMPLOYER_BOT_AGENT_ID || '',
    CHAT_TITLE: 'Square AI',
  },
  BOT_RENDER_MODE: process.env.NEXT_PUBLIC_BOT_RENDER_MODE || 'chat',
} as const;

const ROLES_NAME = {
  ADMIN: 'ADMIN',
  EMPLOYER: 'EMPLOYER',
  JOB_SEEKER: 'JOB_SEEKER',
} as const;

const PAGINATION = {
  ADMIN_MAX_PAGE_SIZE: 10000,
} as const;

const HOME_FILTER_CAREER = [
  {
    id: 34,
    name: 'IT - Software',
    titleIcon: DevicesIcon,
  },
  {
    id: 33,
    name: 'IT - Hardware/Networking',
    titleIcon: DeveloperBoardIcon,
  },
] as const;

const REGEX_VALIDATE = {
  phoneRegExp:
    /^((\+[1-9]{1,4}[ \-]*)|(\([0-9]{2,3}\)[ \-]*)|([0-9]{2,4})[ \-]*)*?[0-9]{3,4}?[ \-]*[0-9]{3,4}?$/,
  urlRegExp:
    /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/,
} as const;

const CV_TYPES = {
  cvWebsite: 'WEBSITE',
  cvUpload: 'UPLOAD',
} as const;

/**
 * DATE_OPTIONS — computed lazily to avoid stale dates when app is open past midnight.
 * Use: DATE_OPTIONS.today() instead of DATE_OPTIONS.today
 */
const DATE_OPTIONS = {
  yesterday: () => dayjs().add(-1, 'day'),
  today: () => dayjs(),
  tomorrow: () => dayjs().add(1, 'day'),
  dayCustom: (num: number) => dayjs().add(num, 'day'),
} as const;

const LINKS = {
  CHPLAY_LINK: 'https://play.google.com/store/',
  APPSTORE_LINK: 'https://www.apple.com/app-store/',
  CERTIFICATE_LINK: 'http://online.gov.vn/',
  INSTAGRAM_LINK: 'https://www.instagram.com/huybk2/',
  FACEBOOK_LINK: 'https://www.facebook.com/square.vn?locale=vi_VN',
  FACEBOOK_MESSENGER_LINK: 'https://www.facebook.com/square.vn?locale=vi_VN',
  LINKEDIN_LINK: 'https://www.linkedin.com/in/huy-khanh-10041b20b/',
  TWITTER_LINK: 'https://twitter.com/HuyBuiKhanh',
  YOUTUBE_LINK: 'https://www.youtube.com/channel/UCn49BvcP1w1mamaOSGTKVZw',
  WEBSITE_LINK: 'https://sqstudio.vn/',
} as const;

const BANNER_TYPES = {
  HOME: 'HOME',
  MAIN_JOB_RIGHT: 'MAIN_JOB_RIGHT',
} as const;

const JOB_POST_STATUS_BG_COLOR = {
  1: 'warning',
  2: 'error',
  3: 'success',
} as const;

export type HostNameConfig = typeof HOST_NAME;
export type AuthProviderConfig = typeof AUTH_PROVIDER;
export type AuthConfig = typeof AUTH_CONFIG;
export type RolesNameConfig = typeof ROLES_NAME;
export type Routes = typeof ROUTES;
export type RegexConfig = typeof REGEX_VALIDATE;

export {
  ENV,
  PLATFORM,
  APP_NAME,
  HOST_NAME,
  AUTH_PROVIDER,
  AUTH_CONFIG,
  ROLES_NAME,
  PAGINATION,
  HOME_FILTER_CAREER,
  REGEX_VALIDATE,
  CV_TYPES,
  BANNER_TYPES,
  DATE_OPTIONS,
  LINKS,
  JOB_POST_STATUS_BG_COLOR,
};
