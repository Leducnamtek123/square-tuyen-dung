import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import common from './locales/en/common.json';
import interview from './locales/en/interview.json';
import errors from './locales/en/errors.json';
import auth from './locales/en/auth.json';
import jobSeeker from './locales/en/jobSeeker.json';

const resources = {
  en: {
    common,
    interview,
    errors,
    auth,
    jobSeeker,
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'en',
  fallbackLng: 'en',
  ns: ['common', 'interview', 'errors', 'auth', 'jobSeeker'],
  defaultNS: 'common',
  interpolation: {
    escapeValue: false,
  },
  returnNull: false,
});

export default i18n;
