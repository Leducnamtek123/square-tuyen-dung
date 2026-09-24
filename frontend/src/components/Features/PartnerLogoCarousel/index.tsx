'use client';

import { Box, Typography, keyframes } from '@mui/material';

// Hiệu ứng marquee cuộn vô tận chạy qua bên phải (từ trái qua phải)
const partnerMarqueeRight = keyframes`
  0% {
    transform: translate3d(-50%, 0, 0);
  }
  100% {
    transform: translate3d(0, 0, 0);
  }
`;

// Hiệu ứng marquee cuộn vô tận chạy qua bên trái
const partnerMarqueeLeft = keyframes`
  0% {
    transform: translate3d(0, 0, 0);
  }
  100% {
    transform: translate3d(-50%, 0, 0);
  }
`;

export interface PartnerCompany {
  id: string;
  name: string;
  logoSrc: string;
  logoAlt: string;
  maxHeight?: { xs: number; sm: number; md: number };
}

export const PARTNER_COMPANIES: PartnerCompany[] = [
  // Nhóm tập đoàn cốt lõi
  {
    id: 'square',
    name: 'Square Group',
    logoSrc: '/images/partners/square.svg',
    logoAlt: 'Square Group',
    maxHeight: { xs: 28, sm: 32, md: 36 },
  },
  {
    id: 'vismarttech',
    name: 'Vi Smart Tech',
    logoSrc: '/images/partners/vismarttech.webp',
    logoAlt: 'Vi Smart Tech',
    maxHeight: { xs: 30, sm: 34, md: 38 },
  },
  {
    id: 'goldlotus',
    name: 'Gold Lotus Travel',
    logoSrc: '/images/partners/goldlotus.webp',
    logoAlt: 'Gold Lotus Travel',
    maxHeight: { xs: 32, sm: 38, md: 42 },
  },
  {
    id: 'vietautomate',
    name: 'Việt Automate',
    logoSrc: '/images/partners/vietautomate.svg',
    logoAlt: 'Việt Automate',
    maxHeight: { xs: 30, sm: 34, md: 38 },
  },

  // Danh sách Khách hàng tiêu biểu (từ docs.square.vn)
  {
    id: 'vilaf',
    name: 'VILAF',
    logoSrc: '/images/partners/vilaf.png',
    logoAlt: 'VILAF',
    maxHeight: { xs: 24, sm: 28, md: 32 },
  },
  {
    id: 'baekimlee',
    name: 'BAE, KIM & LEE LLC',
    logoSrc: '/images/partners/baekimlee.jpg',
    logoAlt: 'BAE, KIM & LEE LLC',
    maxHeight: { xs: 32, sm: 36, md: 40 },
  },
  {
    id: 'shortflight',
    name: 'Shortflight Education',
    logoSrc: '/images/partners/shortflight.jpg',
    logoAlt: 'Shortflight Education',
    maxHeight: { xs: 34, sm: 40, md: 44 },
  },
  {
    id: 'titi',
    name: 'TiTi',
    logoSrc: '/images/partners/titi.jpg',
    logoAlt: 'TiTi',
    maxHeight: { xs: 30, sm: 34, md: 38 },
  },
  {
    id: 'anovafeed',
    name: 'ANOVA FEED',
    logoSrc: '/images/partners/anovafeed.png',
    logoAlt: 'ANOVA FEED',
    maxHeight: { xs: 30, sm: 34, md: 38 },
  },
  {
    id: 'mbageaslife',
    name: 'MB Ageas Life',
    logoSrc: '/images/partners/mbageaslife.jpg',
    logoAlt: 'MB Ageas Life',
    maxHeight: { xs: 28, sm: 32, md: 36 },
  },
  {
    id: 'deheus',
    name: 'De Heus',
    logoSrc: '/images/partners/deheus.jpg',
    logoAlt: 'De Heus',
    maxHeight: { xs: 32, sm: 38, md: 42 },
  },
  {
    id: 'panfood',
    name: 'PAN FOOD',
    logoSrc: '/images/partners/panfood.png',
    logoAlt: 'PAN FOOD',
    maxHeight: { xs: 22, sm: 26, md: 30 },
  },
  {
    id: 'gamudaland',
    name: 'Gamuda Land',
    logoSrc: '/images/partners/gamudaland.png',
    logoAlt: 'Gamuda Land',
    maxHeight: { xs: 22, sm: 26, md: 30 },
  },
  {
    id: 'novaland',
    name: 'Novaland',
    logoSrc: '/images/partners/novaland.png',
    logoAlt: 'Novaland',
    maxHeight: { xs: 32, sm: 38, md: 42 },
  },
  {
    id: 'kiena',
    name: 'Kiena',
    logoSrc: '/images/partners/kiena.jpg',
    logoAlt: 'Kiena',
    maxHeight: { xs: 26, sm: 30, md: 34 },
  },
  {
    id: 'hunglocphat',
    name: 'Hưng Lộc Phát',
    logoSrc: '/images/partners/hunglocphat.png',
    logoAlt: 'Hưng Lộc Phát',
    maxHeight: { xs: 34, sm: 40, md: 44 },
  },
  {
    id: 'namlong',
    name: 'Nam Long',
    logoSrc: '/images/partners/namlong.jpg',
    logoAlt: 'Nam Long',
    maxHeight: { xs: 30, sm: 34, md: 38 },
  },
  {
    id: 'khangdien',
    name: 'Khang Điền',
    logoSrc: '/images/partners/khangdien.png',
    logoAlt: 'Khang Điền',
    maxHeight: { xs: 26, sm: 30, md: 34 },
  },
  {
    id: 'thuduchouse',
    name: 'Thuduc House',
    logoSrc: '/images/partners/thuduchouse.jpg',
    logoAlt: 'Thuduc House',
    maxHeight: { xs: 34, sm: 40, md: 44 },
  },
  {
    id: 'cosaco',
    name: 'Cosaco',
    logoSrc: '/images/partners/cosaco.png',
    logoAlt: 'Cosaco',
    maxHeight: { xs: 24, sm: 28, md: 32 },
  },
  {
    id: 'sym',
    name: 'SYM',
    logoSrc: '/images/partners/sym.png',
    logoAlt: 'SYM',
    maxHeight: { xs: 32, sm: 36, md: 40 },
  },
  {
    id: 'torrecid',
    name: 'Torrecid',
    logoSrc: '/images/partners/torrecid.jpg',
    logoAlt: 'Torrecid',
    maxHeight: { xs: 28, sm: 32, md: 36 },
  },
  {
    id: 'leinternational',
    name: 'L&E International',
    logoSrc: '/images/partners/leinternational.png',
    logoAlt: 'L&E International',
    maxHeight: { xs: 26, sm: 30, md: 34 },
  },
  {
    id: 'kddi',
    name: 'KDDI Group',
    logoSrc: '/images/partners/kddi.png',
    logoAlt: 'KDDI Group',
    maxHeight: { xs: 28, sm: 32, md: 36 },
  },
  {
    id: 'saintgobain',
    name: 'Saint-Gobain',
    logoSrc: '/images/partners/saintgobain.png',
    logoAlt: 'Saint-Gobain',
    maxHeight: { xs: 32, sm: 36, md: 40 },
  },
  {
    id: 'inspireventures',
    name: 'Inspire Ventures',
    logoSrc: '/images/partners/inspireventures.jpg',
    logoAlt: 'Inspire Ventures',
    maxHeight: { xs: 30, sm: 34, md: 38 },
  },
  {
    id: 'dinosys',
    name: 'Dinosys',
    logoSrc: '/images/partners/dinosys.jpg',
    logoAlt: 'Dinosys',
    maxHeight: { xs: 24, sm: 28, md: 32 },
  },
  {
    id: 'cyberagent',
    name: 'CyberAgent Ventures',
    logoSrc: '/images/partners/cyberagent.png',
    logoAlt: 'CyberAgent Ventures',
    maxHeight: { xs: 28, sm: 32, md: 36 },
  },
  {
    id: 'lifull',
    name: 'LIFULL',
    logoSrc: '/images/partners/lifull.png',
    logoAlt: 'LIFULL',
    maxHeight: { xs: 26, sm: 30, md: 34 },
  },
  {
    id: 'runam',
    name: 'RuNam',
    logoSrc: '/images/partners/runam.png',
    logoAlt: 'RuNam',
    maxHeight: { xs: 34, sm: 40, md: 44 },
  },
  {
    id: 'tiki',
    name: 'Tiki.vn',
    logoSrc: '/images/partners/tiki.jpg',
    logoAlt: 'Tiki.vn',
    maxHeight: { xs: 28, sm: 32, md: 36 },
  },
  {
    id: 'foody',
    name: 'Foody.vn',
    logoSrc: '/images/partners/foody.png',
    logoAlt: 'Foody.vn',
    maxHeight: { xs: 28, sm: 32, md: 36 },
  },
  {
    id: 'klook',
    name: 'Klook',
    logoSrc: '/images/partners/klook.jpg',
    logoAlt: 'Klook',
    maxHeight: { xs: 26, sm: 30, md: 34 },
  },
  {
    id: 'transcosmos',
    name: 'transcosmos Vietnam',
    logoSrc: '/images/partners/transcosmos.png',
    logoAlt: 'transcosmos Vietnam',
    maxHeight: { xs: 26, sm: 30, md: 34 },
  },
  {
    id: 'panservices',
    name: 'PAN Services',
    logoSrc: '/images/partners/panservices.png',
    logoAlt: 'PAN Services',
    maxHeight: { xs: 30, sm: 34, md: 38 },
  },
  {
    id: 'enterline',
    name: 'Enterline and Partners',
    logoSrc: '/images/partners/enterline.png',
    logoAlt: 'Enterline and Partners',
    maxHeight: { xs: 24, sm: 28, md: 32 },
  },
  {
    id: 'aden',
    name: 'Aden Services',
    logoSrc: '/images/partners/aden.png',
    logoAlt: 'Aden Services',
    maxHeight: { xs: 28, sm: 32, md: 36 },
  },
];

interface PartnerLogoCarouselProps {
  label?: string;
  direction?: 'right' | 'left';
  speedSeconds?: number;
}

/**
 * PartnerLogoCarousel — High-End Minimalist Logo Cloud Marquee
 * 
 * Follows the LOGO-ONLY Social Proof standard (taste-skill & UI/UX Pro Max):
 * - Pure logos without cluttered cards, borders, URLs, or industry tags.
 * - No external links to retain user attention on the recruitment portal.
 * - Trạng thái mặc định: Tông màu xám chuẩn thanh lịch (grayscale 100% & opacity 0.6) đồng nhất phong cách.
 * - Trạng thái hover: Bừng sáng màu sắc nhận diện thương hiệu gốc sắc nét (grayscale 0% & opacity 1) và phóng to nhẹ.
 * - Tự động tạm dừng (pause on hover) khi rê chuột vào dải marquee để dễ tương tác.
 * - Gradient fade edges on left & right.
 */
const PartnerLogoCarousel: React.FC<PartnerLogoCarouselProps> = ({
  label = 'ĐỒNG HÀNH CÙNG CÁC DOANH NGHIỆP TIÊN PHONG',
  direction = 'right',
  speedSeconds = 90,
}) => {
  // Lặp lại 2 lần mảng logo để chu trình cuộn vô tận mượt mà và liền mạch
  const marqueeList = [
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
      {/* Refined trust headline with prominent brand styling */}
      {label && (
        <Box sx={{ textAlign: 'center', mb: { xs: 2.5, sm: 3, md: 3.5 } }}>
          <Typography
            variant="h6"
            component="h3"
            sx={{
              display: 'inline-block',
              textAlign: 'center',
              fontWeight: 800,
              fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' },
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              color: '#1D4ED8', // Fallback blue
              background: 'linear-gradient(135deg, #1E40AF 0%, #2563EB 50%, #0284C7 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              userSelect: 'none',
            }}
          >
            {label}
          </Typography>
        </Box>
      )}

      {/* Marquee viewport with smooth edge fade gradient masks */}
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          overflow: 'hidden',
          maskImage: {
            xs: 'none',
            sm: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)',
          },
          WebkitMaskImage: {
            xs: 'none',
            sm: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)',
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
            gap: { xs: 5, sm: 6.5, md: 8 }, // Khoảng cách thoáng đãng, sang trọng
            width: 'max-content',
            animation: `${direction === 'right' ? partnerMarqueeRight : partnerMarqueeLeft} ${speedSeconds}s linear infinite`,
            willChange: 'transform',
            '&:hover': {
              animationPlayState: 'paused',
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
                cursor: 'pointer',
                px: 1.5,
                py: 0.75,
                borderRadius: 1,
                // Rê chuột vào vùng logo: kích hoạt hiển thị màu sắc đầy đủ và hiệu ứng nổi bật
                '&:hover .partner-logo-img': {
                  filter: 'grayscale(0%) drop-shadow(0 4px 12px rgba(0, 0, 0, 0.08))',
                  opacity: 1,
                  transform: 'scale(1.08)',
                },
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
                  maxHeight: partner.maxHeight || { xs: 28, sm: 34, md: 38 },
                  maxWidth: { xs: 110, sm: 140, md: 165 },
                  width: 'auto',
                  height: 'auto',
                  objectFit: 'contain',
                  mixBlendMode: 'multiply',
                  // Trạng thái mặc định: tông màu xám chuẩn thanh lịch (grayscale 100% và opacity 0.6)
                  filter: 'grayscale(100%)',
                  opacity: 0.6,
                  transform: 'scale(1)',
                  transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
                  userSelect: 'none',
                  pointerEvents: 'auto',
                  // Rê chuột: bừng sáng màu sắc thương hiệu gốc sống động và phóng to nhẹ
                  '&:hover': {
                    filter: 'grayscale(0%) drop-shadow(0 4px 12px rgba(0, 0, 0, 0.08))',
                    opacity: 1,
                    transform: 'scale(1.08)',
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
