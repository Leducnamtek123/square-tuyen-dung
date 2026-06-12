'use client';

import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import HomeSearch from '../../../../views/components/defaults/HomeSearch';
import contentService from '../../../../services/contentService';
import { BANNER_TYPES, IMAGES } from '../../../../configs/constants';
import type { Banner } from '../../../../types/models';

const HERO_CONTAINER_MAX_WIDTH = 1280;
const HERO_HEADER_OFFSET = { xs: '56px', sm: '64px' };

const RenderItem = ({ item }: { item: Banner }) => {
  const imageUrl = item.imageUrl || IMAGES.coverImageDefault;
  const mobileImageUrl = item.imageMobileUrl || imageUrl;

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        bgcolor: '#043068',
      }}
    >
      <Box
        component="picture"
        sx={{
          display: 'block',
          width: '100%',
          height: '100%',
        }}
      >
        <source media="(max-width: 599px)" srcSet={mobileImageUrl} />
        <Box
          component="img"
          src={imageUrl}
          alt={item.description || 'Banner'}
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = IMAGES.coverImageDefault;
            (e.target as HTMLImageElement).onerror = null;
          }}
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center center',
            display: 'block',
          }}
        />
      </Box>
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(90deg, rgba(4, 48, 104, 0.95) 0%, rgba(4, 48, 104, 0.68) 48%, rgba(4, 48, 104, 0.08) 100%)',
          pointerEvents: 'none',
        }}
      />
    </Box>
  );
};

const TopSlide = () => {
  const { t } = useTranslation('public');
  const [banners, setBanners] = React.useState<Banner[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const getBanners = async () => {
      try {
        const resData = await contentService.getBanners({ type: BANNER_TYPES.HOME });
        setBanners(resData);
      } catch {
        // Error handled silently
      } finally {
        setIsLoading(false);
      }
    };
    getBanners();
  }, []);

  return (
    <Box
      sx={{
        width: '100vw',
        mx: 'calc(50% - 50vw)',
        bgcolor: '#043068',
        fontFamily: "'Plus Jakarta Sans', var(--font-be-vietnam-pro), sans-serif",
      }}
    >
        <Box
          sx={{
            height: {
              xs: `calc(100svh - ${HERO_HEADER_OFFSET.xs})`,
              sm: `calc(100svh - ${HERO_HEADER_OFFSET.sm})`,
            },
            minHeight: { xs: 560, md: 650 },
            position: 'relative',
            overflow: 'hidden',
            bgcolor: '#043068',
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
                  <Skeleton
                    variant="rectangular"
                    width="100%"
                    height="100%"
                    sx={{ display: 'block', transform: 'none' }}
                  />
                </SwiperSlide>
              ) : banners.length > 0 ? (
                banners.map((value) => {
                  return (
                    <SwiperSlide key={value.id}>
                      <RenderItem item={value} />
                    </SwiperSlide>
                  );
                })
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
              alignItems: 'flex-start',
              pointerEvents: 'none',
            }}
          >
            <Stack
              spacing={{ xs: 2, md: 2.6 }}
              sx={{
                width: '100%',
                maxWidth: HERO_CONTAINER_MAX_WIDTH,
                mx: 'auto',
                px: { xs: 3, sm: 4, md: 8, lg: 10 },
                pt: { xs: 5, sm: 7, md: 9, lg: 10 },
                pointerEvents: 'auto',
              }}
            >
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 1,
                  width: 'fit-content',
                  px: 1.35,
                  py: 0.55,
                  borderRadius: 999,
                  bgcolor: 'rgba(255,255,255,0.10)',
                  color: '#fff',
                  fontWeight: 800,
                  fontSize: 10,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  backdropFilter: 'blur(8px)',
                }}
              >
                <Box
                  component="span"
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    bgcolor: '#0058be',
                    display: 'inline-block',
                  }}
                />
                {t('home.heroEyebrow')}
              </Box>
              <Typography
                variant="h3"
                component="h1"
                sx={{
                  maxWidth: 820,
                  fontWeight: 800,
                  lineHeight: 1.08,
                  letterSpacing: 0,
                  color: '#fff',
                  textShadow: '0 10px 30px rgba(0,0,0,0.24)',
                  fontSize: { xs: '2.45rem', sm: '3.4rem', md: '4rem', lg: '4.5rem' },
                }}
              >
                {t('home.heroTitle')}
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  maxWidth: { xs: '100%', md: 720 },
                  color: 'rgba(255,255,255,0.82)',
                  fontSize: { xs: '1rem', md: '1.18rem' },
                  lineHeight: 1.62,
                  textShadow: '0 4px 18px rgba(0,0,0,0.22)',
                }}
              >
                {t('home.heroDescription')}
              </Typography>
              <Box sx={{ width: '100%', maxWidth: { xs: '100%', md: 900 }, pt: { xs: 1.5, md: 2 } }}>
                <HomeSearch variant="hero" />
              </Box>
            </Stack>
          </Box>
        </Box>
    </Box>
  );
};

export default TopSlide;
