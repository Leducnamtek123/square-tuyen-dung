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

const ENV = import.meta.env.VITE_NODE_ENV || 'development';
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
  PROJECT: isProdDomain(import.meta.env.VITE_PROJECT_HOST_NAME)
    ? import.meta.env.VITE_PROJECT_HOST_NAME
    : BASE_HOSTNAME,
  EMPLOYER_PROJECT: isProdDomain(import.meta.env.VITE_EMPLOYER_PROJECT_HOST_NAME)
    ? import.meta.env.VITE_EMPLOYER_PROJECT_HOST_NAME
    : `employer.${BASE_HOSTNAME}`,
  ADMIN_PROJECT: isProdDomain(import.meta.env.VITE_ADMIN_PROJECT_HOST_NAME)
    ? import.meta.env.VITE_ADMIN_PROJECT_HOST_NAME
    : `admin.${BASE_HOSTNAME}`,
} as const;

const AUTH_PROVIDER = {
  FACEBOOK: 'facebook',
  GOOGLE: 'google-oauth2',
} as const;

const AUTH_CONFIG = {
  // BACKEND
  CLIENT_ID: import.meta.env.VITE_PROJECT_SERVER_CLIENT_ID,
  CLIENT_SECRET: import.meta.env.VITE_PROJECT_SERVER_CLIENT_SECRET,
  BACKEND_KEY: 'backend',
  ACCESS_TOKEN_KEY: 'access_token',
  REFRESH_TOKEN_KEY: 'refresh_token',
  REFRESH_TOKEN_GRANT: 'refresh_token',
  PASSWORD_KEY: 'password',
  CONVERT_TOKEN_KEY: 'convert_token',
  // FACEBOOK AUTH
  FACEBOOK_CLIENT_ID: import.meta.env.VITE_FACEBOOK_CLIENT_ID,
  FACEBOOK_CLIENT_SECRET: import.meta.env.VITE_FACEBOOK_CLIENT_SECRET,
  // GOOGLE AUTH
  GOOGLE_CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID || 'dummy-google-client-id',
  GOOGLE_CLIENT_SECRET: import.meta.env.VITE_GOOGLE_CLIENT_SECRET,
  GOONGAPI_KEY: import.meta.env.VITE_GOONGAPI_KEY,
  // Dialogflow chatbot
  JOB_SEEKER_BOT: {
    AGENT_ID: import.meta.env.VITE_JOB_SEEKER_BOT_AGENT_ID || '',
    CHAT_TITLE: 'Square AI',
    CHAT_ICON: jobSeekerChatbotIcon,
  },
  EMPLOYER_BOT: {
    AGENT_ID: import.meta.env.VITE_EMPLOYER_BOT_AGENT_ID || '',
    CHAT_TITLE: 'Square AI',
    CHAT_ICON: employerChatbotIcon,
  },
  BOT_RENDER_MODE: import.meta.env.VITE_BOT_RENDER_MODE || 'chat',
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
  coverImageDefault,
  chPlayDownload,
  appStoreDownload,
  notificationImageDefault,
  companyLogoDefault,
  companyCoverDefault,
} as const;

const ABOUT_IMAGES = {
  AROUND_JOB_POST: aroundJobPost,
  JOB_POST_NOTIFICATION: jobPostNotification,
  JOB_POST: jobPostImg,
  PROFILE: profileImg,
  LIVE_INTERVIEW: liveInterviewImg,
  CANDIDATE_CRM: candidateCrmImg,
  COMPANY_VERIFICATION: companyVerificationImg,
  AI_SKILLS: aiSkillsImg,
} as const;

const ICONS = {
  INSTAGRAM: instagramIcon,
  FACEBOOK: facebookIcon,
  FACEBOOK_MESSENGER: facebookMessengerIcon,
  LINKEDIN: linkedinIcon,
  TWITTER: twitterIcon,
  YOUTUBE: youtubeIcon,
  WEBSITE: websiteIcon,
  LOCATION_MARKER: locationMarker,
  JOB_SEEKER_CHATBOT_ICON: jobSeekerChatbotIcon,
  EMPLOYER_CHATBOT_ICON: employerChatbotIcon,
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
  LOADING_SPINNER: loadingSpinner,
} as const;

const FEEDBACK_IMAGES = {
  '1star': star1,
  '2star': star2,
  '3star': star3,
  '4star': star4,
  '5star': star5,
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
    LOGIN: 'dang-nhap',
    REGISTER: 'dang-ky',
    FORGOT_PASSWORD: 'quen-mat-khau',
    RESET_PASSWORD: 'cap-nhat-mat-khau/:token',
  },
  EMPLOYER_AUTH: {
    LOGIN: 'login',
    REGISTER: 'register',
    FORGOT_PASSWORD: 'forgot-password',
    RESET_PASSWORD: 'reset-password/:token',
  },
  ADMIN_AUTH: {
    LOGIN: 'login',
    FORGOT_PASSWORD: 'forgot-password',
    RESET_PASSWORD: 'reset-password/:token',
  },
  ERROR: {
    NOT_FOUND: '*',
    FORBIDDEN: 'forbidden',
  },
  JOB_SEEKER: {
    HOME: '',
    JOBS: 'viec-lam',
    JOB_DETAIL: 'viec-lam/:slug',
    COMPANY: 'cong-ty',
    COMPANY_DETAIL: 'cong-ty/:slug',
    ABOUT_US: 've-chung-toi',
    JOBS_BY_CAREER: 'viec-lam-theo-nganh-nghe',
    JOBS_BY_CITY: 'viec-lam-theo-tinh-thanh',
    JOBS_BY_TYPE: 'viec-lam-theo-hinh-thuc-lam-viec',
    DASHBOARD: 'bang-dieu-khien',
    PROFILE: 'ho-so',
    STEP_PROFILE: 'ho-so-tung-buoc/:slug',
    ATTACHED_PROFILE: 'ho-so-dinh-kem/:slug',
    MY_JOB: 'viec-lam-cua-toi',
    MY_COMPANY: 'cong-ty-cua-toi',
    MY_INTERVIEWS: 'phong-van-cua-toi',
    NOTIFICATION: 'thong-bao',
    ACCOUNT: 'tai-khoan',
    CHAT: 'ket-noi-voi-nha-tuyen-dung',
    CONTACT: 'lien-he',
    FAQ: 'cau-hoi-thuong-gap',
    TERMS_OF_SERVICE: 'dieu-khoan-dich-vu',
    PRIVACY_POLICY: 'chinh-sach-bao-mat',
  },
  EMPLOYER: {
    INTRODUCE: 'gioi-thieu',
    SERVICE: 'dich-vu',
    PRICING: 'bao-gia',
    SUPPORT: 'ho-tro',
    BLOG: 'blog-tuyen-dung',
    DASHBOARD: '',
    JOB_POST: 'tin-tuyen-dung',
    APPLIED_PROFILE: 'ho-so-ung-tuyen',
    SAVED_PROFILE: 'ho-so-da-luu',
    PROFILE: 'danh-sach-ung-vien',
    PROFILE_DETAIL: 'chi-tiet-ung-vien/:slug',
    COMPANY: 'cong-ty',
    EMPLOYEES: 'nhan-su-va-vai-tro',
    NOTIFICATION: 'thong-bao',
    ACCOUNT: 'tai-khoan',
    SETTING: 'cai-dat',
    CHAT: 'ket-noi-voi-ung-vien',
    INTERVIEW_LIST: 'danh-sach-phong-van',
    INTERVIEW_LIVE: 'phong-van-ung-vien-truc-tiep',
    INTERVIEW_SESSION: 'phong-van-truc-tiep/:id',
    INTERVIEW_CREATE: 'len-lich-phong-van',
    INTERVIEW_DETAIL: 'chi-tiet-phong-van/:id',
    QUESTION_BANK: 'ngan-hang-cau-hoi',
    QUESTION_GROUPS: 'bo-cau-hoi',
    VERIFICATION: 'xac-thuc-nha-tuyen-dung',
    CONTACT: 'lien-he',
    FAQ: 'cau-hoi-thuong-gap',
    TERMS_OF_SERVICE: 'dieu-khoan-dich-vu',
    PRIVACY_POLICY: 'chinh-sach-bao-mat',
  },
  JOBSEEKER_INTERVIEW: {
    LOGIN: 'phong-van/dang-nhap',
    INTERVIEW: 'phong-van/:id',
    INTERVIEW_ROOM: 'phong-van/room/:id',
  },
  CANDIDATE: {
    LOGIN: 'phong-van/dang-nhap',
    INTERVIEW: 'phong-van/:id',
    INTERVIEW_ROOM: 'phong-van/room/:id',
  },
  ADMIN: {
    DASHBOARD: '',
    USERS: 'quan-ly-nguoi-dung',
    JOBS: 'quan-ly-tin-tuyen-dung',
    QUESTIONS: 'kho-cau-hoi',
    QUESTION_GROUPS: 'quan-ly-bo-cau-hoi',
    INTERVIEWS: 'quan-ly-phong-van',
    SETTINGS: 'cai-dat-he-thong',
    CAREERS: 'quan-ly-nganh-nghe',
    CITIES: 'quan-ly-tinh-thanh',
    DISTRICTS: 'quan-ly-quan-huyen',
    WARDS: 'quan-ly-phuong-xa',
    COMPANIES: 'quan-ly-cong-ty',
    PROFILES: 'quan-ly-ho-so-ung-vien',
    RESUMES: 'quan-ly-cv-resume',
    JOB_ACTIVITY: 'nhat-ky-tin-tuyen-dung',
    JOB_NOTIFICATIONS: 'thong-bao-viec-lam',
    INTERVIEW_LIVE: 'phong-van-cong-ty-truc-tiep',
    INTERVIEW_SESSION: 'phong-van-truc-tiep/:id',
    BANNERS: 'quan-ly-banner',
    FEEDBACKS: 'quan-ly-danh-gia',
  },
};

// SVG components
const SVG_IMAGES = {
  ImageSvg1: emptyDataSvg,
  ImageSvg2: onlineGallerySvg,
  ImageSvg3: emptyStreetSvg,
  ImageSvg4: dreamerSvg,
  ImageSvg5: smallTownSvg,
  ImageSvg6: workingRemotelySvg,
  ImageSvg7: countrySideSvg,
  ImageSvg8: thoughtsSvg,
  ImageSvg9: browsingOnlineSvg,
  ImageSvg10: noteListSvg,
  ImageSvg11: profileDataSvg,
  ImageSvg12: myDocumentsSvg,
  ImageSvg13: opinionSvg,
  ImageSvg14: letterSvg,
  ImageSvg15: sadSvg,
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
