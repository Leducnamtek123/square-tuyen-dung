/**
 * Application constants - lightweight, no heavy asset imports.
 *
 * Image/icon assets have been moved to '@/configs/images' to avoid
 * polluting the bundle when only config values are needed.
 */

import dayjs from './dayjs-config';

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
} from './images';

// ROUTES - centralized in routeConfig.ts
export { ROUTES } from './routeConfig';

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

const getSquareHrmPublicUrl = (): string => {
  const configured = process.env.NEXT_PUBLIC_FRAPPE_HR_PUBLIC_URL?.trim().replace(/\/$/, '');
  if (configured) return configured;

  if (BASE_HOSTNAME === 'localhost' || BASE_HOSTNAME === '127.0.0.1') {
    return 'http://localhost:8081';
  }

  if (BASE_HOSTNAME === 'tuyendung.square.vn') {
    return 'https://hrm.square.vn';
  }

  return `https://hrm.${BASE_HOSTNAME}`;
};

const SQUARE_HRM = {
  PUBLIC_URL: getSquareHrmPublicUrl(),
  ADMIN_URL: `${getSquareHrmPublicUrl()}/app`,
} as const;

const AUTH_PROVIDER = {
  FACEBOOK: 'facebook',
  GOOGLE: 'google-oauth2',
} as const;

const AUTH_CONFIG = {
  CLIENT_ID: process.env.NEXT_PUBLIC_PROJECT_SERVER_CLIENT_ID,
  CLIENT_SECRET: process.env.NEXT_PUBLIC_PROJECT_SERVER_CLIENT_SECRET,
  BACKEND_KEY: 'backend',
  ACCESS_TOKEN_KEY: 'access_token',
  REFRESH_TOKEN_KEY: 'refresh_token',
  REFRESH_TOKEN_GRANT: 'refresh_token',
  PASSWORD_KEY: 'password',
  CONVERT_TOKEN_KEY: 'convert_token',
  FACEBOOK_CLIENT_ID: process.env.NEXT_PUBLIC_FACEBOOK_CLIENT_ID,
  FACEBOOK_CLIENT_SECRET: process.env.NEXT_PUBLIC_FACEBOOK_CLIENT_SECRET,
  GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || 'dummy-google-client-id',
  GOOGLE_CLIENT_SECRET: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET,
  GOONGAPI_KEY: process.env.NEXT_PUBLIC_GOONGAPI_KEY,
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
 * DATE_OPTIONS - computed lazily to avoid stale dates when app is open past midnight.
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
  SQUARE_HRM_ADMIN_LINK: SQUARE_HRM.ADMIN_URL,
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

export {
  PLATFORM,
  APP_NAME,
  HOST_NAME,
  SQUARE_HRM,
  AUTH_PROVIDER,
  AUTH_CONFIG,
  ROLES_NAME,
  PAGINATION,
  REGEX_VALIDATE,
  CV_TYPES,
  BANNER_TYPES,
  DATE_OPTIONS,
  LINKS,
  JOB_POST_STATUS_BG_COLOR,
};
