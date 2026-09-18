/**
 * Centralized Social Media Icons
 *
 * Uses brand assets already bundled in the app instead of custom-drawn SVGs.
 * This keeps the social/share UI consistent with the rest of the product.
 */
import React from 'react';
import {
  EmailIcon as ShareEmailIcon,
} from 'react-share';
const ShareEmailIconAny: any = ShareEmailIcon;
import XIconMui from '@mui/icons-material/X';
import { Box } from '@mui/material';
import { ICONS } from '@/configs/constants';

interface SocialIconProps {
  size?: number;
}

const AssetIcon: React.FC<{ src: string; size?: number; label: string }> = ({
  src,
  size = 44,
  label,
}) => (
  <Box
    component="img"
    src={src}
    alt={label}
    aria-label={label}
    sx={{
      width: size,
      height: size,
      display: 'block',
      objectFit: 'contain',
      flexShrink: 0,
    }}
  />
);

export const FacebookIcon: React.FC<SocialIconProps> = ({ size = 44 }) => (
  <AssetIcon src={ICONS.FACEBOOK} size={size} label="Facebook" />
);

export const MessengerIcon: React.FC<SocialIconProps> = ({ size = 44 }) => (
  <AssetIcon src={ICONS.FACEBOOK_MESSENGER} size={size} label="Messenger" />
);

export const LinkedinIcon: React.FC<SocialIconProps> = ({ size = 44 }) => (
  <AssetIcon src={ICONS.LINKEDIN} size={size} label="LinkedIn" />
);

export const XIcon: React.FC<SocialIconProps> = ({ size = 44 }) => (
  <Box
    component="span"
    sx={{
      width: size,
      height: size,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '999px',
      backgroundColor: '#0a0a0f',
      color: '#ffffff',
    }}
  >
    <XIconMui sx={{ fontSize: Math.round(size * 0.52) }} />
  </Box>
);

export const EmailIcon: React.FC<SocialIconProps> = ({ size = 44 }) => (
  <ShareEmailIconAny
    size={size}
    round
    bgStyle={{ fill: '#EA4335' }}
    iconFillColor="#ffffff"
  />
);

export const TiktokIcon: React.FC<SocialIconProps> = ({ size = 44 }) => (
  <AssetIcon src={ICONS.TIKTOK} size={size} label="TikTok" />
);

export const ZaloIcon: React.FC<SocialIconProps> = ({ size = 44 }) => (
  <AssetIcon src={ICONS.ZALO} size={size} label="Zalo" />
);

export const InstagramIcon: React.FC<SocialIconProps> = ({ size = 44 }) => (
  <AssetIcon src={ICONS.INSTAGRAM} size={size} label="Instagram" />
);

export const YoutubeIcon: React.FC<SocialIconProps> = ({ size = 44 }) => (
  <AssetIcon src={ICONS.YOUTUBE} size={size} label="YouTube" />
);

export const WebsiteIcon: React.FC<SocialIconProps> = ({ size = 44 }) => (
  <AssetIcon src={ICONS.WEBSITE} size={size} label="Website" />
);

export const GoogleColoredIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      fill="#EA4335"
    />
  </svg>
);