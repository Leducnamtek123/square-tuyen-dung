/**
 * Image assets — extracted from constants.ts to avoid polluting every import
 * with 50+ static asset dependencies.
 *
 * Import only what you need:
 *   import { IMAGES, SVG_IMAGES } from '@/configs/images';
 */

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
const imgSrc = (img: string | { src?: string; default?: { src?: string } } | null | undefined): string => {
  if (typeof img === 'string') return img;
  if (img && typeof img === 'object' && typeof img.src === 'string') return img.src;
  if (img && typeof img === 'object' && typeof img.default === 'object') return img.default.src || '';
  if (img && typeof img === 'object' && typeof img.default === 'string') return img.default;
  return String(img ?? '');
};

export const IMAGES = {
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

export const ABOUT_IMAGES = {
  AROUND_JOB_POST: imgSrc(aroundJobPost),
  JOB_POST_NOTIFICATION: imgSrc(jobPostNotification),
  JOB_POST: imgSrc(jobPostImg),
  PROFILE: imgSrc(profileImg),
  LIVE_INTERVIEW: imgSrc(liveInterviewImg),
  CANDIDATE_CRM: imgSrc(candidateCrmImg),
  COMPANY_VERIFICATION: imgSrc(companyVerificationImg),
  AI_SKILLS: imgSrc(aiSkillsImg),
} as const;

export const ICONS = {
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

export const LOADING_IMAGES = {
  LOADING_SPINNER: imgSrc(loadingSpinner),
} as const;

export const FEEDBACK_IMAGES = {
  '1star': imgSrc(star1),
  '2star': imgSrc(star2),
  '3star': imgSrc(star3),
  '4star': imgSrc(star4),
  '5star': imgSrc(star5),
} as const;

export const LOGO_IMAGES = {
  LOGO_WITH_BG: '/square-icons/logo.svg',
} as const;

export const SVG_IMAGES = {
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

export const CHATBOT_ICONS = {
  JOB_SEEKER: imgSrc(jobSeekerChatbotIcon),
  EMPLOYER: imgSrc(employerChatbotIcon),
} as const;
