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
  <ShareEmailIcon
    size={size}
    round
    bgStyle={{ fill: '#EA4335' }}
    iconFillColor="#ffffff"
  />
);

export const YoutubeIcon: React.FC<SocialIconProps> = ({ size = 44 }) => (
  <AssetIcon src={ICONS.YOUTUBE} size={size} label="YouTube" />
);

export const WebsiteIcon: React.FC<SocialIconProps> = ({ size = 44 }) => (
  <AssetIcon src={ICONS.WEBSITE} size={size} label="Website" />
);
