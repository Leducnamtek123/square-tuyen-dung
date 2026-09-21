'use client';

import React from 'react';
import { Box, Typography } from '@mui/material';

export interface PartnerCompany {
  id: string;
  name: string;
  logoSrc: string;
  logoAlt: string;
  maxHeight?: { xs: number; sm: number; md: number };
}

export const PARTNER_COMPANIES: PartnerCompany[] = [
  {
    id: 'vismarttech',
    name: 'Vi Smart Tech',
    logoSrc: '/images/partners/vismarttech.webp',
    logoAlt: 'Vi Smart Tech',
    maxHeight: { xs: 32, sm: 36, md: 40 },
  },
  {
    id: 'square',
    name: 'Square Group',
    logoSrc: '/images/partners/square.svg',
    logoAlt: 'Square.vn',
    maxHeight: { xs: 30, sm: 34, md: 38 },
  },
  {
    id: 'goldlotus',
    name: 'Gold Lotus Travel',
    logoSrc: '/images/partners/goldlotus.webp',
    logoAlt: 'Gold Lotus Travel',
    maxHeight: { xs: 36, sm: 42, md: 46 },
  },
  {
    id: 'vietautomate',
    name: 'Việt Automate',
    logoSrc: '/images/partners/vietautomate.svg',
    logoAlt: 'Việt Automate',
    maxHeight: { xs: 32, sm: 36, md: 40 },
  },
];

interface PartnerLogoCarouselProps {
  label?: string;
}

/**
 * PartnerLogoCarousel — High-End Minimalist Logo Cloud Marquee
 * 
 * Follows the LOGO-ONLY Social Proof standard (taste-skill & UI/UX Pro Max):
 * - Pure logos without cluttered cards, borders, URLs, or industry tags.
 * - No external links to retain user attention on the recruitment portal.
 * - Hiển thị màu sắc thương hiệu gốc trực tiếp, sống động và sắc nét.
 * - Smooth hover zoom & pause-on-hover.
 * - Gradient fade edges on left & right.
 */
const PartnerLogoCarousel: React.FC<PartnerLogoCarouselProps> = ({
  label = 'ĐỒNG HÀNH CÙNG CÁC DOANH NGHIỆP TIÊN PHONG',
}) => {
  // Lặp lại mảng logo để chu trình cuộn vô tận mượt mà và không đứt đoạn
  const marqueeList = [
    ...PARTNER_COMPANIES,
    ...PARTNER_COMPANIES,
    ...PARTNER_COMPANIES,
    ...PARTNER_COMPANIES,
  ];

  return (
    <Box
      component="section"
      aria-label="Đối tác doanh nghiệp đồng hành"
      sx={{
        width: '100%',
        py: { xs: 2.5, sm: 3.5, md: 4.5 },
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Refined minimalist trust headline */}
      {label && (
        <Typography
          variant="caption"
          component="p"
          sx={{
            display: 'block',
            textAlign: 'center',
            fontWeight: 600,
            fontSize: { xs: '0.75rem', sm: '0.8125rem' },
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: '#64748B', // Slate-500, WCAG 2.1 AA compliant
            mb: { xs: 2.5, sm: 3, md: 3.5 },
            userSelect: 'none',
          }}
        >
          {label}
        </Typography>
      )}

      {/* Marquee viewport with smooth edge fade gradient masks */}
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          overflow: 'hidden',
          maskImage: {
            xs: 'none',
            sm: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
          },
          WebkitMaskImage: {
            xs: 'none',
            sm: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
          },
          py: 1,
        }}
      >
        {/* Continuous 60fps marquee track */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'nowrap',
            gap: { xs: 5, sm: 7, md: 9 }, // Khoảng cách thoáng đãng, sang trọng
            width: 'max-content',
            animation: 'partnerMarquee 26s linear infinite',
            willChange: 'transform',
            '&:hover': {
              animationPlayState: 'paused',
            },
            '@media (prefers-reduced-motion: reduce)': {
              animation: 'partnerMarquee 45s linear infinite',
            },
            '@keyframes partnerMarquee': {
              '0%': {
                transform: 'translate3d(0, 0, 0)',
              },
              '100%': {
                transform: 'translate3d(-50%, 0, 0)',
              },
            },
          }}
        >
          {marqueeList.map((partner, index) => (
            <Box
              key={`${partner.id}-${index}`}
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                cursor: 'default',
                px: 1,
                py: 0.5,
              }}
            >
              <Box
                component="img"
                className="partner-logo-img"
                src={partner.logoSrc}
                alt={partner.logoAlt}
                title={partner.name}
                loading="lazy"
                decoding="async"
                sx={{
                  maxHeight: partner.maxHeight || { xs: 32, sm: 38, md: 42 },
                  maxWidth: { xs: 120, sm: 150, md: 175 },
                  width: 'auto',
                  height: 'auto',
                  objectFit: 'contain',
                  // Trạng thái mặc định: hiển thị trọn vẹn màu sắc thương hiệu gốc, rõ ràng và sống động
                  filter: 'none',
                  opacity: 1,
                  transform: 'scale(1)',
                  transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
                  userSelect: 'none',
                  pointerEvents: 'auto',
                  // Rê chuột: phóng to nhẹ tạo điểm nhấn tinh tế
                  '&:hover': {
                    transform: 'scale(1.08)',
                    filter: 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.08))',
                  },
                }}
              />
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default PartnerLogoCarousel;
