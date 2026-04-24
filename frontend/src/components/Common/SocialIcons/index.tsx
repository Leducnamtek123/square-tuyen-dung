/**
 * Centralized Social Media Icons
 * 
 * Modern SVG icon components following 2024-2026 brand guidelines.
 * Import from here instead of defining inline SVGs in individual components.
 *
 * Usage:
 *   import { FacebookIcon, LinkedinIcon, XIcon } from '@/components/Common/SocialIcons';
 */
import React from 'react';

interface SocialIconProps {
  size?: number;
}

// ============================================================
// Facebook — modern gradient logo
// ============================================================
export const FacebookIcon: React.FC<SocialIconProps> = ({ size = 44 }) => (
  <svg width={size} height={size} viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="fb-gradient" x1="22" y1="43" x2="22" y2="1" gradientUnits="userSpaceOnUse">
        <stop stopColor="#0062E0" />
        <stop offset="1" stopColor="#19AFFF" />
      </linearGradient>
    </defs>
    <circle cx="22" cy="22" r="21" fill="url(#fb-gradient)" />
    <path
      d="M30.17 28.19L31.07 22.56H25.65V18.91C25.65 17.39 26.39 15.91 28.74 15.91H31.29V11.07C31.29 11.07 28.96 10.67 26.73 10.67C22.08 10.67 19 13.54 19 18.52V22.56H14.04V28.19H19V42.54C20.01 42.7 21.04 42.79 22.09 42.79C23.14 42.79 24.17 42.7 25.18 42.54V28.19H30.17Z"
      fill="white"
    />
  </svg>
);

// ============================================================
// Facebook Messenger — rainbow gradient
// ============================================================
export const MessengerIcon: React.FC<SocialIconProps> = ({ size = 44 }) => (
  <svg width={size} height={size} viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="msg-gradient" x1="22" y1="42" x2="22" y2="2" gradientUnits="userSpaceOnUse">
        <stop stopColor="#0099FF" />
        <stop offset="0.4" stopColor="#A033FF" />
        <stop offset="0.7" stopColor="#FF5280" />
        <stop offset="1" stopColor="#FF7061" />
      </linearGradient>
    </defs>
    <circle cx="22" cy="22" r="21" fill="url(#msg-gradient)" />
    <path
      d="M22 9C14.82 9 9 14.36 9 21.16C9 25.08 10.97 28.56 14.09 30.84V35L18.06 32.8C19.29 33.14 20.61 33.33 22 33.33C29.18 33.33 35 27.97 35 21.16C35 14.36 29.18 9 22 9ZM23.19 24.7L19.73 21.08L13.07 24.7L20.38 16.96L23.92 20.58L30.5 16.96L23.19 24.7Z"
      fill="white"
    />
  </svg>
);

// ============================================================
// LinkedIn — classic blue
// ============================================================
export const LinkedinIcon: React.FC<SocialIconProps> = ({ size = 44 }) => (
  <svg width={size} height={size} viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="22" cy="22" r="21" fill="#0A66C2" />
    <path d="M15.47 18.5H11.42V32.5H15.47V18.5Z" fill="white" />
    <path
      d="M13.44 16.61C14.78 16.61 15.87 15.52 15.87 14.17C15.87 12.83 14.78 11.73 13.44 11.73C12.09 11.73 11 12.83 11 14.17C11 15.52 12.09 16.61 13.44 16.61Z"
      fill="white"
    />
    <path
      d="M23.67 18.5H19.77V32.5H23.82V25.18C23.82 22.13 27.67 21.87 27.67 25.18V32.5H31.73V23.85C31.73 18.18 25.32 18.38 23.67 21.15V18.5Z"
      fill="white"
    />
  </svg>
);

// ============================================================
// X (formerly Twitter) — 2023+ X logo
// ============================================================
export const XIcon: React.FC<SocialIconProps> = ({ size = 44 }) => (
  <svg width={size} height={size} viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="22" cy="22" r="21" fill="#000000" />
    <path
      d="M24.89 20.36L32.33 12H30.56L24.1 19.21L18.92 12H12.5L20.31 22.96L12.5 31.68H14.27L21.09 24.11L26.58 31.68H33L24.89 20.36ZM21.99 23.06L21.19 21.92L14.9 13.33H18.06L22.69 20.29L23.49 21.43L30.56 30.42H27.4L21.99 23.06Z"
      fill="white"
    />
  </svg>
);

// ============================================================
// Email — Gmail-inspired red
// ============================================================
export const EmailIcon: React.FC<SocialIconProps> = ({ size = 44 }) => (
  <svg width={size} height={size} viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="22" cy="22" r="21" fill="#EA4335" />
    <path
      d="M13 15.5C13 14.67 13.67 14 14.5 14H29.5C30.33 14 31 14.67 31 15.5V28.5C31 29.33 30.33 30 29.5 30H14.5C13.67 30 13 29.33 13 28.5V15.5Z"
      fill="white"
    />
    <path
      d="M13.5 15L22 22.5L30.5 15"
      stroke="#EA4335"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// ============================================================
// YouTube — classic red play button
// ============================================================
export const YoutubeIcon: React.FC<SocialIconProps> = ({ size = 44 }) => (
  <svg width={size} height={size} viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="22" cy="22" r="21" fill="#FF0000" />
    <path
      d="M33.42 16.73C33.16 15.73 32.38 14.95 31.38 14.69C29.56 14.2 22 14.2 22 14.2C22 14.2 14.44 14.2 12.62 14.69C11.62 14.95 10.84 15.73 10.58 16.73C10.09 18.55 10.09 22.33 10.09 22.33C10.09 22.33 10.09 26.11 10.58 27.93C10.84 28.93 11.62 29.68 12.62 29.94C14.44 30.43 22 30.43 22 30.43C22 30.43 29.56 30.43 31.38 29.94C32.38 29.68 33.16 28.93 33.42 27.93C33.91 26.11 33.91 22.33 33.91 22.33C33.91 22.33 33.91 18.55 33.42 16.73Z"
      fill="white"
    />
    <path d="M19.64 26.2V18.46L26.18 22.33L19.64 26.2Z" fill="#FF0000" />
  </svg>
);

// ============================================================
// Instagram — gradient purple-orange
// ============================================================
const InstagramIcon: React.FC<SocialIconProps> = ({ size = 44 }) => (
  <svg width={size} height={size} viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="ig-gradient" x1="5" y1="39" x2="39" y2="5" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FFC107" />
        <stop offset="0.5" stopColor="#F44336" />
        <stop offset="1" stopColor="#9C27B0" />
      </linearGradient>
    </defs>
    <circle cx="22" cy="22" r="21" fill="url(#ig-gradient)" />
    <rect x="12" y="12" width="20" height="20" rx="6" stroke="white" strokeWidth="2" fill="none" />
    <circle cx="22" cy="22" r="5" stroke="white" strokeWidth="2" fill="none" />
    <circle cx="29" cy="15" r="1.5" fill="white" />
  </svg>
);

// ============================================================
// TikTok — black with neon accents
// ============================================================
const TiktokIcon: React.FC<SocialIconProps> = ({ size = 44 }) => (
  <svg width={size} height={size} viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="22" cy="22" r="21" fill="#000000" />
    <path
      d="M29.5 16.5C28.12 16.5 26.88 15.88 26 14.91V24.5C26 28.09 23.09 31 19.5 31C15.91 31 13 28.09 13 24.5C13 20.91 15.91 18 19.5 18C19.82 18 20.13 18.03 20.43 18.07V21.14C20.13 21.05 19.82 21 19.5 21C17.57 21 16 22.57 16 24.5C16 26.43 17.57 28 19.5 28C21.43 28 23 26.43 23 24.5V10H26C26 12.76 28.24 15 31 15V18C30.47 18 29.96 17.9 29.5 17.74V16.5Z"
      fill="white"
    />
  </svg>
);

// ============================================================
// Website/Globe icon
// ============================================================
export const WebsiteIcon: React.FC<SocialIconProps> = ({ size = 44 }) => (
  <svg width={size} height={size} viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="22" cy="22" r="21" fill="#4285F4" />
    <circle cx="22" cy="22" r="10" stroke="white" strokeWidth="1.8" fill="none" />
    <ellipse cx="22" cy="22" rx="5" ry="10" stroke="white" strokeWidth="1.8" fill="none" />
    <line x1="12" y1="22" x2="32" y2="22" stroke="white" strokeWidth="1.8" />
    <line x1="22" y1="12" x2="22" y2="32" stroke="white" strokeWidth="1.8" />
  </svg>
);
