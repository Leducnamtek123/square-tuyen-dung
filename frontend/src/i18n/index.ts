import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// English
import en_common from './locales/en/common.json';
import en_admin from './locales/en/admin.json';
import en_employer from './locales/en/employer.json';
import en_jobSeeker from './locales/en/jobSeeker.json';
import en_auth from './locales/en/auth.json';
import en_public from './locales/en/public.json';
import en_errors from './locales/en/errors.json';
import en_chat from './locales/en/chat.json';
import en_candidate from './locales/en/candidate.json';
import en_interview from './locales/en/interview.json';
import en_about from './locales/en/about.json';

// Vietnamese
import vi_common from './locales/vi/common.json';
import vi_admin from './locales/vi/admin.json';
import vi_employer from './locales/vi/employer.json';
import vi_jobSeeker from './locales/vi/jobSeeker.json';
import vi_auth from './locales/vi/auth.json';
import vi_public from './locales/vi/public.json';
import vi_errors from './locales/vi/errors.json';
import vi_chat from './locales/vi/chat.json';
import vi_candidate from './locales/vi/candidate.json';
import vi_interview from './locales/vi/interview.json';
import vi_about from './locales/vi/about.json';

const resources = {
  en: {
    common: en_common,
    admin: en_admin,
    employer: en_employer,
    jobSeeker: en_jobSeeker,
    auth: en_auth,
    public: en_public,
    errors: en_errors,
    chat: en_chat,
    candidate: en_candidate,
    interview: en_interview,
    about: en_about,
  },
  vi: {
    common: vi_common,
    admin: vi_admin,
    employer: vi_employer,
    jobSeeker: vi_jobSeeker,
    auth: vi_auth,
    public: vi_public,
    errors: vi_errors,
    chat: vi_chat,
    candidate: vi_candidate,
    interview: vi_interview,
    about: vi_about,
  },
} as const;

const normalizeLanguage = (lang?: string | null): 'en' | 'vi' => {
  if (!lang) return 'vi';
  const code = lang.split('-')[0].split('_')[0].toLowerCase();
  return code === 'en' ? 'en' : 'vi';
};

const getInitialLanguage = (): 'en' | 'vi' => {
  if (typeof window === 'undefined') return 'vi';
  const saved = window.localStorage?.getItem('i18nextLng');
  return normalizeLanguage(saved);
};

i18n.use(initReactI18next).init({
  resources,
  lng: getInitialLanguage(),
  fallbackLng: 'en',
  ns: [
    'common',
    'admin',
    'employer',
    'jobSeeker',
    'auth',
    'public',
    'errors',
    'chat',
    'candidate',
    'interview',
    'about',
  ],
  defaultNS: 'common',
  interpolation: {
    escapeValue: false, // react already safes from xss
  },
  returnNull: false,
});

export default i18n;
