import dayjs from './dayjs-config';
import DeveloperBoardIcon from '@mui/icons-material/DeveloperBoard';
import DevicesIcon from '@mui/icons-material/Devices';

// Import SVG files
import emptyDataSvg from '../assets/images/svg-images/empty-data.svg';
import onlineGallerySvg from '../assets/images/svg-images/online-gallery.svg';
import emptyStreetSvg from '../assets/images/svg-images/empty-street.svg';
import dreamerSvg from '../assets/images/svg-images/dreamer.svg';
import smallTownSvg from '../assets/images/svg-images/small_town.svg';
import workingRemotelySvg from '../assets/images/svg-images/working_remotely.svg';
import countrySideSvg from '../assets/images/svg-images/country_side.svg';
import thoughtsSvg from '../assets/images/svg-images/thoughts.svg';
import browsingOnlineSvg from '../assets/images/svg-images/browsing_online.svg';
import noteListSvg from '../assets/images/svg-images/note_list.svg';
import profileDataSvg from '../assets/images/svg-images/profile_data.svg';
import myDocumentsSvg from '../assets/images/svg-images/my_documents.svg';
import opinionSvg from '../assets/images/svg-images/opinion.svg';
import letterSvg from '../assets/images/svg-images/letter.svg';
import sadSvg from '../assets/images/svg-images/sad.svg';

// Import assets
import jobSeekerChatbotIcon from '../assets/icons/job_seeker_chatbot_icon.gif';
import employerChatbotIcon from '../assets/icons/employer_chatbot_icon.gif';
import coverImageDefault from '../assets/images/cover-image-default.webp';
import companyLogoDefault from '../assets/images/company_logo_default.png';
import companyCoverDefault from '../assets/images/company_cover_default.png';
import chPlayDownload from '../assets/images/app-android-download.png';
import appStoreDownload from '../assets/images/app-ios-download.png';
import notificationImageDefault from '../assets/images/noti-img-default.png';
import aroundJobPost from '../assets/images/about-images/around-job-post.webp';
import jobPostNotification from '../assets/images/about-images/job-notification-img.webp';
import jobPostImg from '../assets/images/about-images/job-post-img.webp';
import profileImg from '../assets/images/about-images/profile-img.webp';

import liveInterviewImg from '../assets/images/about-images/around-job-post.png';
import candidateCrmImg from '../assets/images/about-images/job-notification-img.png';
import companyVerificationImg from '../assets/images/about-images/job-post-img.png';
import aiSkillsImg from '../assets/images/about-images/profile-img.png';
import instagramIcon from '../assets/icons/instagram-icon.png';
import facebookIcon from '../assets/icons/facebook-icon.png';
import facebookMessengerIcon from '../assets/icons/facebook-messenger-icon.png';
import linkedinIcon from '../assets/icons/linkedin-icon.png';
import twitterIcon from '../assets/icons/twitter-icon.png';
import youtubeIcon from '../assets/icons/youtube-icon.png';
import websiteIcon from '../assets/icons/website-icon.svg';
import locationMarker from '../assets/icons/location-marker.gif';
import loadingSpinner from '../assets/images/loading/loading-spinner.gif';
import star1 from '../assets/images/feedbacks/1star.gif';
import star2 from '../assets/images/feedbacks/2star.gif';
import star3 from '../assets/images/feedbacks/3star.gif';
import star4 from '../assets/images/feedbacks/4star.gif';
import star5 from '../assets/images/feedbacks/5star.gif';

// Next.js static image imports return { src, width, height } objects.
// This helper extracts the string URL for use in regular <img> tags.
const imgSrc = (img: any): string => {
  if (typeof img === 'string') return img;
  if (img && typeof img === 'object' && typeof img.src === 'string') return img.src;
  if (img && typeof img === 'object' && typeof img.default === 'object') return img.default.src;
  if (img && typeof img === 'object' && typeof img.default === 'string') return img.default;
  return String(img ?? '');
};

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
  // Dialogflow chatbot
  JOB_SEEKER_BOT: {
    AGENT_ID: process.env.NEXT_PUBLIC_JOB_SEEKER_BOT_AGENT_ID || '',
    CHAT_TITLE: 'Square AI',
    CHAT_ICON: imgSrc(jobSeekerChatbotIcon),
  },
  EMPLOYER_BOT: {
    AGENT_ID: process.env.NEXT_PUBLIC_EMPLOYER_BOT_AGENT_ID || '',
    CHAT_TITLE: 'Square AI',
    CHAT_ICON: imgSrc(employerChatbotIcon),
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

const DATE_OPTIONS = {
  yesterday: dayjs().add(-1, 'day'),
  today: dayjs(),
  tomorrow: dayjs().add(1, 'day'),
  dayCustom: (num: number) => dayjs().add(num, 'day'),
} as const;

const IMAGES = {
  getLogo: (mode: 'dark' | 'light' = 'dark') => {
    return mode === 'light'
      ? '/square-icons/logo square svg-white.svg'
      : '/square-icons/logo square svg-black.svg';
  },
  getTextLogo: (mode: 'dark' | 'light' = 'dark') => {
    return mode === 'light'
      ? '/square-icons/logo square svg-white.svg'
      : '/square-icons/logo square svg-black.svg';
  },
  coverImageDefault: imgSrc(coverImageDefault),
  chPlayDownload: imgSrc(chPlayDownload),
  appStoreDownload: imgSrc(appStoreDownload),
  notificationImageDefault: imgSrc(notificationImageDefault),
  companyLogoDefault: imgSrc(companyLogoDefault),
  companyCoverDefault: imgSrc(companyCoverDefault),
} as const;

const ABOUT_IMAGES = {
  AROUND_JOB_POST: imgSrc(aroundJobPost),
  JOB_POST_NOTIFICATION: imgSrc(jobPostNotification),
  JOB_POST: imgSrc(jobPostImg),
  PROFILE: imgSrc(profileImg),
  LIVE_INTERVIEW: imgSrc(liveInterviewImg),
  CANDIDATE_CRM: imgSrc(candidateCrmImg),
  COMPANY_VERIFICATION: imgSrc(companyVerificationImg),
  AI_SKILLS: imgSrc(aiSkillsImg),
} as const;

const ICONS = {
  INSTAGRAM: imgSrc(instagramIcon),
  FACEBOOK: imgSrc(facebookIcon),
  FACEBOOK_MESSENGER: imgSrc(facebookMessengerIcon),
  LINKEDIN: imgSrc(linkedinIcon),
  TWITTER: imgSrc(twitterIcon),
  YOUTUBE: imgSrc(youtubeIcon),
  WEBSITE: imgSrc(websiteIcon),
  LOCATION_MARKER: imgSrc(locationMarker),
  JOB_SEEKER_CHATBOT_ICON: imgSrc(jobSeekerChatbotIcon),
  EMPLOYER_CHATBOT_ICON: imgSrc(employerChatbotIcon),
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

const LOADING_IMAGES = {
  LOADING_SPINNER: imgSrc(loadingSpinner),
} as const;

const FEEDBACK_IMAGES = {
  '1star': imgSrc(star1),
  '2star': imgSrc(star2),
  '3star': imgSrc(star3),
  '4star': imgSrc(star4),
  '5star': imgSrc(star5),
} as const;

const LOGO_IMAGES = {
  LOGO_WITH_BG: '/square-icons/logo.svg',
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

const ROUTES = {
  AUTH: {
    EMAIL_VERIFICATION: 'email-verification-required',
    LOGIN: 'login',
    REGISTER: 'register',
    FORGOT_PASSWORD: 'forgot-password',
    RESET_PASSWORD: 'reset-password',
  },
  EMPLOYER_AUTH: {
    LOGIN: 'employer/login',
    REGISTER: 'employer/register',
    FORGOT_PASSWORD: 'employer/forgot-password',
    RESET_PASSWORD: 'employer/reset-password',
  },
  ADMIN_AUTH: {
    LOGIN: 'admin/login',
    FORGOT_PASSWORD: 'admin/forgot-password',
    RESET_PASSWORD: 'admin/reset-password',
  },
  ERROR: {
    NOT_FOUND: '*',
    FORBIDDEN: 'forbidden',
  },
  JOB_SEEKER: {
    HOME: '',
    JOBS: 'jobs',
    JOB_DETAIL: 'jobs/:slug',
    COMPANY: 'companies',
    COMPANY_DETAIL: 'companies/:slug',
    ABOUT_US: 'about-us',
    JOBS_BY_CAREER: 'jobs-by-career',
    JOBS_BY_CITY: 'jobs-by-city',
    JOBS_BY_TYPE: 'jobs-by-type',
    DASHBOARD: 'dashboard',
    PROFILE: 'profile',
    STEP_PROFILE: 'online-profile/:slug',
    ATTACHED_PROFILE: 'attached-profile/:slug',
    MY_JOB: 'my-jobs',
    MY_COMPANY: 'my-company',
    MY_INTERVIEWS: 'my-interviews',
    NOTIFICATION: 'notifications',
    ACCOUNT: 'account',
    CHAT: 'chat',
    CONTACT: 'contact',
    FAQ: 'faq',
    TERMS_OF_SERVICE: 'terms-of-service',
    PRIVACY_POLICY: 'privacy-policy',
  },
  EMPLOYER: {
    INTRODUCE: 'employer/introduce',
    SERVICE: 'employer/service',
    PRICING: 'employer/pricing',
    SUPPORT: 'employer/support',
    BLOG: 'employer/blog',
    DASHBOARD: 'employer/dashboard',
    JOB_POST: 'employer/job-posts',
    APPLIED_PROFILE: 'employer/applied-profiles',
    SAVED_PROFILE: 'employer/saved-profiles',
    PROFILE: 'employer/candidates',
    PROFILE_DETAIL: 'employer/candidates/:slug',
    COMPANY: 'employer/company',
    EMPLOYEES: 'employer/employees',
    NOTIFICATION: 'employer/notifications',
    ACCOUNT: 'employer/account',
    SETTING: 'employer/settings',
    CHAT: 'employer/chat',
    INTERVIEW_LIST: 'employer/interviews',
    INTERVIEW_LIVE: 'employer/interviews/live',
    INTERVIEW_SESSION: 'employer/interviews/session/:id',
    INTERVIEW_CREATE: 'employer/interviews/create',
    INTERVIEW_DETAIL: 'employer/interviews/:id',
    QUESTION_BANK: 'employer/question-bank',
    QUESTION_GROUPS: 'employer/question-groups',
    VERIFICATION: 'employer/verification',
    CONTACT: 'employer/contact',
    FAQ: 'employer/faq',
    TERMS_OF_SERVICE: 'employer/terms-of-service',
    PRIVACY_POLICY: 'employer/privacy-policy',
  },
  JOBSEEKER_INTERVIEW: {
    LOGIN: 'interview/login',
    INTERVIEW: 'interview/:id',
    INTERVIEW_ROOM: 'interview/room/:id',
  },
  CANDIDATE: {
    LOGIN: 'interview/login',
    INTERVIEW: 'interview/:id',
    INTERVIEW_ROOM: 'interview/room/:id',
  },
  ADMIN: {
    DASHBOARD: 'admin/dashboard',
    USERS: 'admin/users',
    JOBS: 'admin/jobs',
    QUESTIONS: 'admin/questions',
    QUESTION_GROUPS: 'admin/question-groups',
    INTERVIEWS: 'admin/interviews',
    SETTINGS: 'admin/settings',
    CAREERS: 'admin/careers',
    CITIES: 'admin/cities',
    DISTRICTS: 'admin/districts',
    WARDS: 'admin/wards',
    COMPANIES: 'admin/companies',
    PROFILES: 'admin/profiles',
    RESUMES: 'admin/resumes',
    JOB_ACTIVITY: 'admin/job-activity',
    JOB_NOTIFICATIONS: 'admin/job-notifications',
    INTERVIEW_LIVE: 'admin/interviews/live',
    INTERVIEW_SESSION: 'admin/interviews/session/:id',
    BANNERS: 'admin/banners',
    FEEDBACKS: 'admin/feedbacks',
    CHAT: 'admin/chat',
  },
};

// SVG components
const SVG_IMAGES = {
  ImageSvg1: imgSrc(emptyDataSvg),
  ImageSvg2: imgSrc(onlineGallerySvg),
  ImageSvg3: imgSrc(emptyStreetSvg),
  ImageSvg4: imgSrc(dreamerSvg),
  ImageSvg5: imgSrc(smallTownSvg),
  ImageSvg6: imgSrc(workingRemotelySvg),
  ImageSvg7: imgSrc(countrySideSvg),
  ImageSvg8: imgSrc(thoughtsSvg),
  ImageSvg9: imgSrc(browsingOnlineSvg),
  ImageSvg10: imgSrc(noteListSvg),
  ImageSvg11: imgSrc(profileDataSvg),
  ImageSvg12: imgSrc(myDocumentsSvg),
  ImageSvg13: imgSrc(opinionSvg),
  ImageSvg14: imgSrc(letterSvg),
  ImageSvg15: imgSrc(sadSvg),
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
  IMAGES,
  ABOUT_IMAGES,
  LOADING_IMAGES,
  FEEDBACK_IMAGES,
  LOGO_IMAGES,
  LINKS,
  ICONS,
  JOB_POST_STATUS_BG_COLOR,
  ROUTES,
  SVG_IMAGES,
};
