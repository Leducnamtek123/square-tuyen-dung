'use client';

import React from 'react';
import { Box, Link, Stack, Typography } from '@mui/material';
import { QRCodeSVG } from 'qrcode.react';
import { LINKS } from '@/configs/constants';

// Clean App Store & Google Play badges
export const GooglePlayBadge = ({ height = 38 }: { height?: number }) => (
  <Link
    href={LINKS.CHPLAY_LINK}
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Tải ứng dụng trên Google Play"
    sx={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 1,
      height,
      px: 1.5,
      py: 0.5,
      borderRadius: '8px',
      backgroundColor: '#000000',
      color: '#ffffff',
      textDecoration: 'none',
      border: '1px solid rgba(255,255,255,0.2)',
      boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
      transition: 'transform 0.15s ease, box-shadow 0.15s ease',
      '&:hover': {
        transform: 'translateY(-1px)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
      },
    }}
  >
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <path d="M3.609 1.814L13.792 12 3.61 22.186A1.84 1.84 0 0 1 3 20.887V3.113c0-.49.223-.974.609-1.299z" fill="#00E676" />
      <path d="M17.18 8.613L4.935.539C4.469.23 3.967.143 3.61.275l10.183 11.724 3.388-3.386z" fill="#FFD600" />
      <path d="M17.18 15.387l-3.387-3.387L3.61 23.725c.357.132.859.045 1.325-.264l12.245-8.074z" fill="#FF1744" />
      <path d="M21.564 10.742l-4.384-2.129-3.388 3.387 3.388 3.387 4.384-2.129a1.442 1.442 0 0 0 0-2.516z" fill="#00B0FF" />
    </svg>
    <Box sx={{ display: 'flex', flexDirection: 'column', textAlign: 'left', lineHeight: 1.1 }}>
      <Typography sx={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.75)', textTransform: 'uppercase' }}>
        GET IT ON
      </Typography>
      <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#ffffff' }}>
        Google Play
      </Typography>
    </Box>
  </Link>
);

export const AppStoreBadge = ({ height = 38 }: { height?: number }) => (
  <Link
    href={LINKS.APPSTORE_LINK}
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Tải ứng dụng trên App Store"
    sx={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 1,
      height,
      px: 1.5,
      py: 0.5,
      borderRadius: '8px',
      backgroundColor: '#000000',
      color: '#ffffff',
      textDecoration: 'none',
      border: '1px solid rgba(255,255,255,0.2)',
      boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
      transition: 'transform 0.15s ease, box-shadow 0.15s ease',
      '&:hover': {
        transform: 'translateY(-1px)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
      },
    }}
  >
    <svg width={20} height={20} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.61-.75 1.04-1.8 0.92-2.85-.92.04-2.02.62-2.66 1.37-.56.65-1.06 1.71-.93 2.73 1.03.08 2.06-.5 2.67-1.25z" />
    </svg>
    <Box sx={{ display: 'flex', flexDirection: 'column', textAlign: 'left', lineHeight: 1.1 }}>
      <Typography sx={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.75)' }}>
        Download on the
      </Typography>
      <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#ffffff' }}>
        App Store
      </Typography>
    </Box>
  </Link>
);

export const AppDownloadBox = () => {
  return (
    <Stack direction="row" spacing={1.5} alignItems="center">
      {/* QR Code Container */}
      <Box
        sx={{
          p: 0.75,
          backgroundColor: '#ffffff',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          border: '1px solid rgba(255,255,255,0.4)',
        }}
      >
        <QRCodeSVG
          value="https://infohr.vn/download-app"
          size={76}
          level="M"
          includeMargin={false}
        />
      </Box>

      {/* App Store Buttons */}
      <Stack spacing={1}>
        <GooglePlayBadge height={36} />
        <AppStoreBadge height={36} />
      </Stack>
    </Stack>
  );
};

// Trust Badges for Employer / Candidate Footer
export const DmcaProtectedBadge = () => (
  <Link
    href="https://www.dmca.com/Protection/Status.aspx"
    target="_blank"
    rel="noopener noreferrer"
    aria-label="DMCA Protected"
    sx={{
      display: 'inline-flex',
      alignItems: 'center',
      textDecoration: 'none',
      transition: 'transform 0.15s ease',
      '&:hover': { transform: 'scale(1.04)' },
    }}
  >
    <Box
      component="img"
      src="/images/badges/dmca.png"
      alt="DMCA Protected"
      sx={{
        height: 32,
        width: 'auto',
        display: 'block',
        objectFit: 'contain',
        borderRadius: '4px',
      }}
    />
  </Link>
);

export const MinistryOfIndustryBadge = () => (
  <Link
    href={LINKS.CERTIFICATE_LINK}
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Đã Đăng Ký Bộ Công Thương"
    sx={{
      display: 'inline-flex',
      alignItems: 'center',
      textDecoration: 'none',
      transition: 'transform 0.15s ease',
      '&:hover': { transform: 'scale(1.04)' },
    }}
  >
    <Box
      component="img"
      src="/images/badges/dadangki.webp"
      alt="Đã Đăng Ký Bộ Công Thương"
      sx={{
        height: 38,
        width: 'auto',
        display: 'block',
        objectFit: 'contain',
      }}
    />
  </Link>
);
