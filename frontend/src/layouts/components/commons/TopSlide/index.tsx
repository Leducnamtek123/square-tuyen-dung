'use client';

import React, { useRef } from 'react';
import { Autoplay } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import {
  Box,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import {
  GSAP_MEDIA_CONDITIONS,
  registerGsapPlugins,
} from '@/utils/gsapHelpers';
import HomeSearch from '@/views/components/defaults/HomeSearch';
import contentService from '@/services/contentService';
import { BANNER_TYPES, IMAGES } from '@/configs/constants';
import type { Banner } from '@/types/models';

registerGsapPlugins();

const HERO_CONTAINER_MAX_WIDTH = 1280;
const HERO_HEADER_OFFSET = { xs: '56px', sm: '64px' };

const RenderItem = ({ item }: { item: Banner }) => {
  const imageUrl = item.imageUrl || IMAGES.coverImageDefault;
  const mobileImageUrl = item.imageMobileUrl || imageUrl;
  const [isLoaded, setIsLoaded] = React.useState(false);

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        bgcolor: '#0f172a',
      }}
    >
      <Box component="picture" sx={{ display: 'block', width: '100%', height: '100%' }}>
        <source media="(max-width: 599px)" srcSet={mobileImageUrl} />
        <Box
          component="img"
          src={imageUrl}
          alt={item.description || 'Banner'}
          loading="eager"
          // @ts-ignore fetchPriority property
          fetchPriority="high"
          onLoad={() => setIsLoaded(true)}
          onError={(e) => {
            (e.target as HTMLImageElement).src = IMAGES.coverImageDefault;
            (e.target as HTMLImageElement).onerror = null;
            setIsLoaded(true);
          }}
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center center',
            display: 'block',
            opacity: isLoaded ? 1 : 0,
            transition: 'opacity 0.3s ease-in-out',
          }}
        />
      </Box>
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(90deg, rgba(4, 48, 104, 0.95) 0%, rgba(15, 23, 42, 0.62) 48%, rgba(15, 23, 42, 0.12) 100%)',
          pointerEvents: 'none',
        }}
      />
    </Box>
  );
};

const TopSlide = () => {
  const [banners, setBanners] = React.useState<Banner[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const heroContentRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      // ── Desktop Breakpoint (≥769px) ─────────────────────────────────
      mm.add(GSAP_MEDIA_CONDITIONS.isDesktop, () => {
        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

        tl.fromTo(
          '.gsap-hero-tag',
          { y: -15, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, clearProps: 'all' }
        )
          .fromTo(
            '.gsap-hero-title',
            { y: 25, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.7, clearProps: 'all' },
            '-=0.35'
          )
          .fromTo(
            '.gsap-hero-subtitle',
            { y: 15, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.6, clearProps: 'all' },
            '-=0.4'
          )
          .fromTo(
            '.gsap-hero-search',
            { y: 20, opacity: 0, scale: 0.98 },
            { y: 0, opacity: 1, scale: 1, duration: 0.7, clearProps: 'all' },
            '-=0.3'
          );
      });

      // ── Mobile Breakpoint (≤768px) ──────────────────────────────────
      mm.add(GSAP_MEDIA_CONDITIONS.isMobile, () => {
        const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });

        tl.fromTo(
          '.gsap-hero-tag',
          { y: -8, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.45, clearProps: 'all' }
        )
          .fromTo(
            '.gsap-hero-title',
            { y: 14, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.5, clearProps: 'all' },
            '-=0.25'
          )
          .fromTo(
            '.gsap-hero-subtitle',
            { y: 10, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.45, clearProps: 'all' },
            '-=0.3'
          )
          .fromTo(
            '.gsap-hero-search',
            { y: 12, opacity: 0, scale: 0.99 },
            { y: 0, opacity: 1, scale: 1, duration: 0.5, clearProps: 'all' },
            '-=0.25'
          );
      });

      // ── Reduced Motion ───────────────────────────────────────────────
      mm.add(GSAP_MEDIA_CONDITIONS.reduceMotion, () => {
        gsap.set('.gsap-hero-tag, .gsap-hero-title, .gsap-hero-subtitle, .gsap-hero-search', {
          opacity: 1,
          y: 0,
          scale: 1,
          clearProps: 'all',
        });
      });
    },
    { scope: heroContentRef }
  );

  React.useEffect(() => {
    let isMounted = true;
    const getBanners = async () => {
      try {
        const resData = await contentService.getBanners({ type: BANNER_TYPES.HOME });
        if (!isMounted) return;

        if (resData && resData.length > 0) {
          const preloadPromises = resData.slice(0, 2).map((banner) => {
            return new Promise((resolve) => {
              const url = banner.imageUrl || IMAGES.coverImageDefault;
              const img = new Image();
              img.src = url;
              img.onload = resolve;
              img.onerror = resolve;
            });
          });

          await Promise.race([
            Promise.all(preloadPromises),
            new Promise((r) => setTimeout(r, 600)),
          ]);
        }

        if (isMounted) {
          setBanners(resData);
        }
      } catch {
        // Error handled silently
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    getBanners();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <Box
      sx={{
        width: '100%',
        minHeight: { xs: 520, md: 620 },
        height: {
          xs: `calc(100svh - ${HERO_HEADER_OFFSET.xs})`,
          sm: `calc(100svh - ${HERO_HEADER_OFFSET.sm})`,
        },
        maxHeight: { md: 720 },
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 16px 36px rgba(15, 23, 42, 0.10)',
        bgcolor: '#0f172a',
        fontFamily: "var(--font-inter), 'Inter', sans-serif",
      }}
    >
      <Box
        sx={{
          width: '100%',
          height: '100%',
          position: 'relative',
          overflow: 'hidden',
          bgcolor: '#0f172a',
        }}
      >
        <Box sx={{ height: '100%', '& .swiper-pagination': { display: 'none' } }}>
          <Swiper
            spaceBetween={30}
            preventClicks={false}
            preventClicksPropagation={false}
            autoplay={{
              delay: 6000,
              disableOnInteraction: false,
            }}
            modules={[Autoplay]}
            className="mySwiper"
            style={{ height: '100%' }}
          >
            {isLoading ? (
              <SwiperSlide>
                <Skeleton variant="rectangular" width="100%" height="100%" sx={{ display: 'block', transform: 'none' }} />
              </SwiperSlide>
            ) : banners.length > 0 ? (
              banners.map((value) => (
                <SwiperSlide key={value.id}>
                  <RenderItem item={value} />
                </SwiperSlide>
              ))
            ) : (
              <SwiperSlide>
                <RenderItem item={{ id: 0, imageUrl: IMAGES.coverImageDefault, description: 'Banner' } as Banner} />
              </SwiperSlide>
            )}
          </Swiper>
        </Box>

        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            zIndex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}
        >
          <Box
            ref={heroContentRef}
            sx={{
              width: '100%',
              maxWidth: HERO_CONTAINER_MAX_WIDTH,
              px: { xs: 3, sm: 4, md: 8, lg: 10 },
              pointerEvents: 'auto',
            }}
          >
            <Stack spacing={2.5}>
              <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                <Box
                  className="gsap-hero-tag"
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 1,
                    px: 1.75,
                    py: 0.5,
                    mb: 1.5,
                    borderRadius: '9999px',
                    bgcolor: 'rgba(255, 255, 255, 0.12)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    backdropFilter: 'blur(12px)',
                    color: '#e0f2fe',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    letterSpacing: '0.02em',
                  }}
                >
                  <Box component="span" sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#38bdf8', boxShadow: '0 0 8px #38bdf8' }} />
                  Nền tảng Tuyển dụng &amp; Phỏng vấn AI chuẩn xác
                </Box>
                <Typography
                  className="gsap-hero-title"
                  variant="h3"
                  component="h1"
                  sx={{
                    fontWeight: 800,
                    fontSize: { xs: '1.65rem', sm: '2.15rem', md: '2.65rem' },
                    color: '#ffffff',
                    lineHeight: 1.2,
                    textShadow: '0 2px 12px rgba(0, 0, 0, 0.5)',
                    letterSpacing: '-0.025em',
                  }}
                >
                  Chắp cánh sự nghiệp của bạn cùng{' '}
                  <Box
                    component="span"
                    sx={{
                      background: 'linear-gradient(135deg, #60a5fa 0%, #38bdf8 50%, #818cf8 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      fontWeight: 900,
                    }}
                  >
                    InfoHR
                  </Box>
                </Typography>
                <Typography
                  className="gsap-hero-subtitle"
                  variant="subtitle1"
                  sx={{
                    fontWeight: 500,
                    fontSize: { xs: '0.92rem', sm: '1.08rem' },
                    color: 'rgba(241, 245, 249, 0.92)',
                    mt: 1,
                    maxWidth: 620,
                    textShadow: '0 1px 6px rgba(0, 0, 0, 0.4)',
                  }}
                >
                  Kết nối ứng viên tài năng &amp; nhà tuyển dụng hàng đầu qua hệ thống AI Matching thế hệ mới.
                </Typography>
              </Box>
              <Box className="gsap-hero-search">
                <HomeSearch variant="hero" />
              </Box>
            </Stack>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default TopSlide;

