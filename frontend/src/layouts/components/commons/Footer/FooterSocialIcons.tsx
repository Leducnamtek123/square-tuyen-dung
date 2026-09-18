'use client';

import React from 'react';
import { Box, Link, Stack, Tooltip } from '@mui/material';
import { LINKS, SOCIAL_ICONS } from '@/configs/constants';

interface FooterSocialIconsProps {
  variant?: 'dark' | 'light';
  size?: number;
}

export const FooterSocialIcons: React.FC<FooterSocialIconsProps> = ({ size = 32 }) => {
  const socialLinks = [
    { title: 'Facebook', iconSrc: SOCIAL_ICONS.FACEBOOK, href: LINKS.FACEBOOK_LINK },
    { title: 'TikTok', iconSrc: SOCIAL_ICONS.TIKTOK, href: LINKS.TIKTOK_LINK },
    { title: 'Zalo', iconSrc: SOCIAL_ICONS.ZALO, href: LINKS.ZALO_LINK },
    { title: 'Instagram', iconSrc: SOCIAL_ICONS.INSTAGRAM, href: LINKS.INSTAGRAM_LINK },
    { title: 'YouTube', iconSrc: SOCIAL_ICONS.YOUTUBE, href: LINKS.YOUTUBE_LINK },
    { title: 'LinkedIn', iconSrc: SOCIAL_ICONS.LINKEDIN, href: LINKS.LINKEDIN_LINK },
  ];

  return (
    <Stack direction="row" spacing={1.25} sx={{ flexWrap: 'wrap', gap: 1.25, alignItems: 'center' }}>
      {socialLinks.map((item) => (
        <Tooltip key={item.title} title={item.title} arrow placement="top">
          <Link
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={item.title}
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: size,
              height: size,
              borderRadius: '50%',
              overflow: 'hidden',
              flexShrink: 0,
              transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s ease',
              '&:hover': {
                transform: 'translateY(-2.5px) scale(1.08)',
                boxShadow: '0 6px 16px rgba(0, 0, 0, 0.16)',
              },
            }}
          >
            <Box
              component="img"
              src={item.iconSrc}
              alt={item.title}
              sx={{
                width: size,
                height: size,
                display: 'block',
                objectFit: 'contain',
              }}
            />
          </Link>
        </Tooltip>
      ))}
    </Stack>
  );
};

export default FooterSocialIcons;
